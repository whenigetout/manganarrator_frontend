import { EditAction, EditActionType } from "../../types/EditActionType";
import { ImageDialogueLine } from "./ImageDialogueLine";
import { OCRImage, MediaNamespace, MediaRef } from "@manganarrator/contracts";
import { useState } from "react";
import { fileNameFromMediaRef, resolveMediaRef } from "../../utils/helpers";
import { ImagePanPreview } from "./ImagePanPreview";
import { ImageSegmentPreview } from "./ImageSegmentPreview";
import type {
    ImagePreviewEditor,
    SegmentPreviewEditor,
} from "../../types/videoPreviewEditor";
import { AudioLayerEditor } from "./previewEditor/AudioLayerEditor";
import { createEmptyAudioLayer } from "../../client/hooks/useVideoPreviewJson";

interface MangaImageProps {
    run_id: string;
    json_file: MediaRef;
    image: OCRImage;
    imageIdx: number;
    dispatchEdit: (action: EditAction) => void;
    saveJson: () => void;
    savePreview: () => Promise<void>;
    imagePreview: ImagePreviewEditor | null;
    updateImagePreview: (updater: (imagePreview: ImagePreviewEditor) => void) => void;
    saveEditedPreview: () => Promise<void>;
    buildSegmentPreview: (segmentPreview: SegmentPreviewEditor) => Promise<void>;
    buildImagePreview: (imagePreview: ImagePreviewEditor) => Promise<void>;
    mediaVersion: number;
    missingDialogueIds?: Set<number>;
    showMissingOnly?: boolean;
    /** Global default silent clip duration from render_config */
    globalSilentDuration?: number;
}

export const MangaImage = ({
    run_id,
    json_file,
    image,
    imageIdx,
    dispatchEdit,
    saveJson,
    savePreview,
    imagePreview,
    updateImagePreview,
    saveEditedPreview,
    buildSegmentPreview,
    buildImagePreview,
    mediaVersion,
    missingDialogueIds = new Set<number>(),
    showMissingOnly = false,
    globalSilentDuration = 3,
}: MangaImageProps) => {
    type PreviewMode = "bbox" | "video";

    const [previewMode, setPreviewMode] = useState<PreviewMode>("bbox");
    const [activePreviewIdx, setActivePreviewIdx] = useState(0);
    const [expandAll, setExpandAll] = useState<boolean>(false);
    const [activeDlgIdx, setActiveDlgIdx] = useState(0);
    const [busyLabel, setBusyLabel] = useState<string | null>(null);

    const activeSegment = imagePreview?.base_timeline[activePreviewIdx] ?? null;

    const imageVideoUrl = imagePreview
        ? `${resolveMediaRef(imagePreview.out_file_ref)}?v=${mediaVersion}`
        : null;
    const segmentVideoUrl = activeSegment
        ? `${resolveMediaRef(activeSegment.out_file_ref)}?v=${mediaVersion}`
        : null;

    const visibleDialogueLines = image.dialogue_lines
        .map((dlgLine, originalIdx) => ({ dlgLine, originalIdx }))
        .filter(({ dlgLine }) => !showMissingOnly || missingDialogueIds.has(dlgLine.id));

    function nextActiveDlgIdx(
        deletedIdx: number,
        newLength: number
    ): number {
        if (newLength <= 0) return 0;
        if (deletedIdx >= newLength) {
            return newLength - 1;
        }
        return deletedIdx;
    }

    const handleDeleteDialogue = (dlgIdx: number) => {
        const prevLength = image.dialogue_lines.length;

        dispatchEdit({
            type: EditActionType.Dialogue_delete,
            imageIdx,
            dlgIdx,
            updates: null,
        });

        const newLength = prevLength - 1;
        setActiveDlgIdx(nextActiveDlgIdx(dlgIdx, newLength));
    };

    const updateActiveSegment = (updater: (segment: SegmentPreviewEditor) => void) => {
        if (!imagePreview) return;
        updateImagePreview((nextImagePreview) => {
            const segment = nextImagePreview.base_timeline[activePreviewIdx];
            if (!segment) return;
            updater(segment);
            const span = segment.rendered_segment.render_span;
            span.render_height = span.crop_y2 - span.crop_y1;
        });
    };

    const runBusy = async (label: string, action: () => Promise<void>) => {
        setBusyLabel(label);
        try {
            await action();
        } finally {
            setBusyLabel(null);
        }
    };

    const segmentCountLabel = imagePreview
        ? `${imagePreview.base_timeline.filter(seg => seg.include_in_output !== false).length}/${imagePreview.base_timeline.length}`
        : "0/0";

    return (
        <div className="bg-zinc-900 rounded-lg p-4 shadow space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span>Image · <span className="text-zinc-200">{fileNameFromMediaRef(image.image_info.image_ref)}</span></span>
                    {image.dialogue_lines.length === 0 && (
                        <span
                            className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 tracking-wide"
                            title="This image has no dialogue text. It will scroll silently in the final video."
                        >
                            SILENT PANEL
                        </span>
                    )}
                </div>
                {imagePreview && (
                    <div className="text-xs text-zinc-500">
                        Included segments: {segmentCountLabel}
                    </div>
                )}
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setExpandAll(v => !v)}
                    className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                    title="Expand or collapse all dialogue-line editors for this image."
                >
                    {expandAll ? "Collapse All" : "Expand All"}
                </button>
                <button
                    onClick={() => runBusy("preview", async () => {
                        await savePreview();
                    })}
                    disabled={busyLabel !== null}
                    className="text-xs px-2 py-1 rounded bg-amber-700 text-white hover:bg-amber-600 disabled:opacity-50"
                    title="Regenerate the preview JSON for this image from the current OCR and dialogue audio state."
                >
                    {imagePreview ? "Rebuild Preview from OCR" : "Generate Preview"}
                </button>
                {imagePreview && (
                    <>
                        <button
                            onClick={() => setPreviewMode(previewMode === "bbox" ? "video" : "bbox")}
                            className="text-xs px-2 py-1 rounded bg-sky-700 text-white hover:bg-sky-600"
                            title="Switch between raw bounding-box editing and the ffmpeg-accurate video preview for this image."
                        >
                            {previewMode === "bbox" ? "Switch to Video Preview" : "Switch to BBox Editor"}
                        </button>
                        <button
                            onClick={() => runBusy("save-preview-edits", saveEditedPreview)}
                            disabled={busyLabel !== null}
                            className="text-xs px-2 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50"
                            title="Persist your current image and segment preview edits back into preview.json."
                        >
                            Save Preview Edits
                        </button>
                    </>
                )}
            </div>

            <div className="grid grid-cols-[1fr_1.5fr] gap-6 px-6">
                <div className="max-h-[calc(100vh-6rem)] overflow-y-auto min-w-0">
                    {visibleDialogueLines.map(({ dlgLine, originalIdx }) => (
                        <ImageDialogueLine
                            key={dlgLine.id}
                            run_id={run_id}
                            json_file={json_file}
                            image_ref={image.image_info.image_ref}
                            dlgLine={dlgLine}
                            imageIdx={imageIdx}
                            dlgIdx={originalIdx}
                            dispatchEdit={dispatchEdit}
                            forceExpand={expandAll}
                            onDlgClick={setActiveDlgIdx}
                            onDelete={handleDeleteDialogue}
                            activeDlgIdx={activeDlgIdx}
                            missingAudio={missingDialogueIds.has(dlgLine.id)}
                        />
                    ))}
                </div>

                <div className="flex justify-center">
                    <div className="sticky top-4 space-y-3 max-w-[760px]">
                        {previewMode === "bbox" ? (
                            <ImagePanPreview
                                key={image.image_id}
                                image={image}
                                imageIdx={imageIdx}
                                activeDlgIdx={activeDlgIdx}
                                dispatchEdit={dispatchEdit}
                                saveJson={saveJson}
                            />
                        ) : imagePreview ? (
                            <>
                                <ImageSegmentPreview
                                    imagePreview={imagePreview}
                                    activeIdx={activePreviewIdx}
                                    onPrev={() => setActivePreviewIdx(i => Math.max(0, i - 1))}
                                    onNext={() => setActivePreviewIdx(i => Math.min(imagePreview.base_timeline.length - 1, i + 1))}
                                    globalSilentDuration={globalSilentDuration}
                                    onUpdateSegment={(updater) => updateActiveSegment(updater)}
                                />

                                <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4 space-y-4">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <label className="flex items-center gap-2 text-sm text-zinc-200">
                                            <input
                                                type="checkbox"
                                                checked={imagePreview.include_in_output !== false}
                                                onChange={(e) => updateImagePreview((next) => {
                                                    next.include_in_output = e.target.checked;
                                                })}
                                            />
                                            Include Image In Final Output
                                        </label>

                                        {activeSegment && (
                                            <label className="flex items-center gap-2 text-sm text-zinc-200">
                                                <input
                                                    type="checkbox"
                                                    checked={activeSegment.include_in_output !== false}
                                                    onChange={(e) => updateActiveSegment((segment) => {
                                                        segment.include_in_output = e.target.checked;
                                                    })}
                                                />
                                                Include Active Segment
                                            </label>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {activeSegment && (
                                            <button
                                                onClick={() => runBusy("render-segment", () => buildSegmentPreview(activeSegment))}
                                                disabled={busyLabel !== null}
                                                className="rounded bg-cyan-700 px-3 py-2 text-xs text-white hover:bg-cyan-600 disabled:opacity-50"
                                                title="Render just the currently selected segment clip using the current preview geometry and timing."
                                            >
                                                Render Active Segment
                                            </button>
                                        )}
                                        <button
                                            onClick={() => runBusy("render-image", () => buildImagePreview(imagePreview))}
                                            disabled={busyLabel !== null}
                                            className="rounded bg-indigo-700 px-3 py-2 text-xs text-white hover:bg-indigo-600 disabled:opacity-50"
                                            title="Render the fully stitched video for this image using all included segments."
                                        >
                                            Render Full Image
                                        </button>
                                    </div>

                                    {imageVideoUrl && (
                                        <div className="space-y-2">
                                            <div className="text-xs text-zinc-400">Image-level rendered video</div>
                                            <video
                                                key={imageVideoUrl}
                                                src={imageVideoUrl}
                                                controls
                                                className="w-full rounded border border-zinc-800 bg-black"
                                            />
                                        </div>
                                    )}

                                    {activeSegment && (
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                                            <label className="text-xs text-zinc-400">
                                                Duration
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={activeSegment.duration}
                                                    onChange={(e) => updateActiveSegment((segment) => {
                                                        segment.duration = Number(e.target.value);
                                                    })}
                                                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                                                />
                                            </label>
                                            <label className="text-xs text-zinc-400">
                                                Crop Y1
                                                <input
                                                    type="number"
                                                    value={activeSegment.rendered_segment.render_span.crop_y1}
                                                    onChange={(e) => updateActiveSegment((segment) => {
                                                        segment.rendered_segment.render_span.crop_y1 = Number(e.target.value);
                                                    })}
                                                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                                                />
                                            </label>
                                            <label className="text-xs text-zinc-400">
                                                Crop Y2
                                                <input
                                                    type="number"
                                                    value={activeSegment.rendered_segment.render_span.crop_y2}
                                                    onChange={(e) => updateActiveSegment((segment) => {
                                                        segment.rendered_segment.render_span.crop_y2 = Number(e.target.value);
                                                    })}
                                                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                                                />
                                            </label>
                                            <label className="text-xs text-zinc-400">
                                                Empty Top
                                                <input
                                                    type="number"
                                                    value={activeSegment.rendered_segment.render_span.empty_space_top}
                                                    onChange={(e) => updateActiveSegment((segment) => {
                                                        segment.rendered_segment.render_span.empty_space_top = Number(e.target.value);
                                                    })}
                                                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                                                />
                                            </label>
                                            <label className="text-xs text-zinc-400">
                                                Empty Bottom
                                                <input
                                                    type="number"
                                                    value={activeSegment.rendered_segment.render_span.empty_space_bottom}
                                                    onChange={(e) => updateActiveSegment((segment) => {
                                                        segment.rendered_segment.render_span.empty_space_bottom = Number(e.target.value);
                                                    })}
                                                    className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                                                />
                                            </label>
                                        </div>
                                    )}

                                    {segmentVideoUrl && (
                                        <details className="rounded border border-zinc-800 bg-zinc-900/70 p-3">
                                            <summary className="cursor-pointer text-xs text-zinc-300">
                                                Segment-level rendered clip
                                            </summary>
                                            <video
                                                key={segmentVideoUrl}
                                                src={segmentVideoUrl}
                                                controls
                                                className="mt-3 w-full rounded border border-zinc-800 bg-black"
                                            />
                                        </details>
                                    )}
                                </div>

                                <AudioLayerEditor
                                    title={`Image ${image.image_id} Audio Layers`}
                                    layers={imagePreview.audio_layers ?? []}
                                    onAdd={() => updateImagePreview((next) => {
                                        next.audio_layers = [...(next.audio_layers ?? []), createEmptyAudioLayer(MediaNamespace.OUTPUTS)];
                                    })}
                                    onChange={(nextLayers) => updateImagePreview((next) => {
                                        next.audio_layers = nextLayers;
                                    })}
                                />

                                {activeSegment && (
                                    <AudioLayerEditor
                                        title={`Segment ${activeSegment.rendered_segment.segment.segment_id} Audio Layers`}
                                        layers={activeSegment.audio_layers ?? []}
                                        onAdd={() => updateActiveSegment((segment) => {
                                            segment.audio_layers = [...(segment.audio_layers ?? []), createEmptyAudioLayer(MediaNamespace.OUTPUTS)];
                                        })}
                                        onChange={(nextLayers) => updateActiveSegment((segment) => {
                                            segment.audio_layers = nextLayers;
                                        })}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="text-sm text-zinc-500">
                                No saved preview found for this image yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
