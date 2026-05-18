import { MangaImage } from "./MangaImage"
import { EditAction } from "../../types/EditActionType"
import { OCRRun } from "@manganarrator/contracts"
import { useEffect, useState } from "react"
import { useTTSEngine } from "../../client/hooks/useTTSEngine"
import { buildTTSInput } from "../../utils/buildTTSInput"
import { safeFloat } from "../../utils/helpers"
import { getTTSLineState } from "../../shared/ttsLineStateStore"
import { createEmptyAudioLayer, useVideoPreviewJson } from "../../client/hooks/useVideoPreviewJson"
import { RunPreviewControls } from "./previewEditor/RunPreviewControls"
import type { VideoPreviewEditor } from "../../types/videoPreviewEditor"
import { MediaNamespace } from "@manganarrator/contracts"

interface OcrJsonResultProps {
    jsonResponse: OCRRun
    dispatchEdit: (action: EditAction) => void
    saveJson: () => void
    savePreview: () => Promise<void>
}
export const OcrJsonResult = ({
    jsonResponse,
    dispatchEdit,
    saveJson,
    savePreview
}: OcrJsonResultProps) => {
    const {
        data: videoPreview,
        imgPrwById,
        jobs,
        updatePreview,
        saveEdits,
        buildSegment,
        buildImage,
        buildVideo,
        reload: reloadVideoPreview,
    } = useVideoPreviewJson(jsonResponse.ocr_json_file)

    const [selectionName, setSelectionName] = useState("selected-part")
    const [busyLabel, setBusyLabel] = useState<string | null>(null)

    const [currentProgress, setCurrentProgress] = useState<{
        imageId: number
        dialogueId: number
    } | null>(null)

    let totalDialogueLines = 0
    jsonResponse.images.forEach(img => img.dialogue_lines.forEach(dlg => { totalDialogueLines++ }))

    const [progressCount, setProgressCount] = useState({
        done: 0,
        total: totalDialogueLines,
    })

    const [isGeneratingAll, setIsGeneratingAll] = useState(false)

    const { generateOne } = useTTSEngine()

    const runBusy = async (label: string, action: () => Promise<void>) => {
        setBusyLabel(label)
        try {
            await action()
        } finally {
            setBusyLabel(null)
        }
    }

    const handleGenerateAll = async () => {
        setIsGeneratingAll(true)
        try {
            for (const img of jsonResponse.images) {
                for (const dlgLine of img.dialogue_lines) {
                    setCurrentProgress({
                        imageId: img.image_id,
                        dialogueId: dlgLine.id
                    })

                    setProgressCount(p => ({
                        ...p,
                        done: p.done + 1,
                    }))

                    const ttslineState = getTTSLineState(dlgLine.id)

                    const req = buildTTSInput(
                        dlgLine,
                        safeFloat,
                        ttslineState.exg,
                        ttslineState.cfg,
                        img.image_info.image_ref,
                        ttslineState.useCustom,
                        jsonResponse.run_id
                    )

                    await generateOne(req)
                }
            }
        }
        finally {
            setCurrentProgress(null)
            setIsGeneratingAll(false)
        }

    }

    const updateImagePreview = (imageId: number, updater: (imagePreview: NonNullable<typeof videoPreview>["image_previews"][number]) => void) => {
        updatePreview((draft) => {
            const target = draft.image_previews.find(image => image.image_id === imageId)
            if (!target) return
            updater(target)
        })
    }

    const buildSelectedPartPreview = (): VideoPreviewEditor | null => {
        if (!videoPreview) return null

        const clone: VideoPreviewEditor = JSON.parse(JSON.stringify(videoPreview))
        const slug = selectionName.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-") || "selected-part"
        const chapterRoot = clone.out_dir_ref.path.replace(/\/video_tmp$/, "")

        clone.image_previews = clone.image_previews
            .filter(image => image.include_in_output !== false)
            .map(image => ({
                ...image,
                base_timeline: image.base_timeline.filter(segment => segment.include_in_output !== false),
            }))
            .filter(image => image.base_timeline.length > 0)

        clone.out_dir_ref.path = `${chapterRoot}/video_parts/${slug}`
        clone.out_file_ref.path = `${chapterRoot}/video_parts/${slug}/final.mp4`

        clone.image_previews = clone.image_previews.map(image => {
            const imageFolder = `${chapterRoot}/video_parts/${slug}/img_${String(image.image_id).padStart(3, "0")}`
            return {
                ...image,
                out_dir_ref: {
                    ...image.out_dir_ref,
                    path: imageFolder,
                },
                out_file_ref: {
                    ...image.out_file_ref,
                    path: `${imageFolder}/img_${String(image.image_id).padStart(3, "0")}.mp4`,
                },
                base_timeline: image.base_timeline.map(segment => {
                    const segId = segment.rendered_segment.segment.segment_id
                    const segFolder = `${imageFolder}/seg_${String(segId).padStart(3, "0")}`
                    return {
                        ...segment,
                        out_dir_ref: {
                            ...segment.out_dir_ref,
                            path: segFolder,
                        },
                        out_file_ref: {
                            ...segment.out_file_ref,
                            path: `${segFolder}/seg_${String(segId).padStart(3, "0")}.mp4`,
                        },
                    }
                }),
            }
        })

        return clone
    }

    return (
        <div className=" px-4 space-y-6">
            <h2 className="text-sm text-zinc-400">
                OCR Result · runId: <span className="text-zinc-200">{jsonResponse.run_id}</span>
            </h2>

            <button
                className="bg-purple-700 text-white text-xs px-2 py-1 rounded hover:bg-purple-800"
                disabled={isGeneratingAll}
                onClick={() => handleGenerateAll()}
            >
                Generate ALL TTS
            </button>

            {isGeneratingAll && currentProgress && (
                <div className="text-sm text-green-400">
                    Generating TTS →
                    Generating {progressCount.done} / {progressCount.total}

                    image: {currentProgress.imageId},
                    dialogue: {currentProgress.dialogueId}
                </div>
            )}

            <RunPreviewControls
                preview={videoPreview}
                selectionName={selectionName}
                onSelectionNameChange={setSelectionName}
                busyLabel={busyLabel}
                jobs={jobs}
                onSaveEdits={() => runBusy("save-preview-edits", saveEdits)}
                onBuildSelection={() => runBusy("build-selected-part", async () => {
                    const selected = buildSelectedPartPreview()
                    if (!selected) return
                    await buildVideo(selected, `Selected part: ${selectionName}`)
                })}
                onBuildFull={() => runBusy("build-full-preview", async () => {
                    if (!videoPreview) return
                    await buildVideo(videoPreview, "Whole chapter")
                })}
                onAddRunAudioLayer={() => updatePreview((draft) => {
                    draft.audio_layers = [...(draft.audio_layers ?? []), createEmptyAudioLayer(MediaNamespace.OUTPUTS)]
                })}
                onUpdateRunAudioLayers={(updater) => updatePreview((draft) => {
                    draft.audio_layers = updater(draft.audio_layers ?? [])
                })}
            />


            {jsonResponse.images.map((image, imageIdx) =>
                <MangaImage
                    key={image.image_id}
                    run_id={jsonResponse.run_id}
                    json_file={jsonResponse.ocr_json_file}
                    image={image}
                    imageIdx={imageIdx}
                    dispatchEdit={dispatchEdit}
                    saveJson={saveJson}
                    savePreview={async () => {
                        await savePreview()
                        await reloadVideoPreview()
                    }}
                    imagePreview={imgPrwById?.get(image.image_id) ?? null}
                    updateImagePreview={(updater) => updateImagePreview(image.image_id, updater)}
                    saveEditedPreview={() => runBusy(`save-image-preview-${image.image_id}`, saveEdits)}
                    buildSegmentPreview={async (segmentPreview) => {
                        await runBusy(`build-segment-${segmentPreview.rendered_segment.segment.segment_id}`, async () => {
                            await buildSegment(segmentPreview)
                        })
                    }}
                    buildImagePreview={async (imagePreview) => {
                        await runBusy(`build-image-${imagePreview.image_id}`, async () => {
                            await buildImage(imagePreview)
                        })
                    }}
                />
            )}
        </div>
    )
}
