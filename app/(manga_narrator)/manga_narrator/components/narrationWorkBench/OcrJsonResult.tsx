import { MangaImage } from "./MangaImage"
import { EditAction } from "../../types/EditActionType"
import { OCRRun } from "@manganarrator/contracts"
import { useEffect, useState } from "react"
import { useTTSEngine } from "../../client/hooks/useTTSEngine"
import { buildTTSInput } from "../../utils/buildTTSInput"
import { safeFloat } from "../../utils/helpers"
import { getTTSLineState } from "../../shared/ttsLineStateStore"

interface OcrJsonResultProps {
    jsonResponse: OCRRun
    dispatchEdit: (action: EditAction) => void
    saveJson: () => void
    savePreview: () => void
}
export const OcrJsonResult = ({
    jsonResponse,
    dispatchEdit,
    saveJson,
    savePreview
}: OcrJsonResultProps) => {

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


            {jsonResponse.images.map((image, imageIdx) =>
                <MangaImage
                    key={image.image_id}
                    run_id={jsonResponse.run_id}
                    json_file={jsonResponse.ocr_json_file}
                    image={image}
                    imageIdx={imageIdx}
                    dispatchEdit={dispatchEdit}
                    saveJson={saveJson}
                    savePreview={savePreview}
                />
            )}
        </div>
    )
}
