import { resolveMediaRef } from "../../../utils/helpers";
import type { VideoJobResponse, VideoPreviewEditor } from "../../../types/videoPreviewEditor";
import { AudioLayerEditor } from "./AudioLayerEditor";

interface RunPreviewControlsProps {
    preview: VideoPreviewEditor | null;
    onSaveEdits: () => Promise<void>;
    onBuildSelection: () => Promise<void>;
    onBuildFull: () => Promise<void>;
    onAddRunAudioLayer: () => void;
    onUpdateRunAudioLayers: (updater: (layers: VideoPreviewEditor["audio_layers"]) => VideoPreviewEditor["audio_layers"]) => void;
    onUpdateRenderConfig: (updater: (cfg: NonNullable<VideoPreviewEditor["render_config"]>) => void) => void;
    selectionName: string;
    onSelectionNameChange: (value: string) => void;
    jobs: Record<string, { label: string; status: VideoJobResponse["status"]; result?: VideoJobResponse["result"]; error?: string; startedAt: number; finishedAt?: number }>;
    busyLabel: string | null;
    mediaVersion: number;
    missingAudioCount: number;
    onRefreshAudioReadiness: () => Promise<void>;
    showMissingOnly: boolean;
    onToggleShowMissingOnly: () => void;
}

export function RunPreviewControls({
    preview,
    onSaveEdits,
    onBuildSelection,
    onBuildFull,
    onAddRunAudioLayer,
    onUpdateRunAudioLayers,
    onUpdateRenderConfig,
    selectionName,
    onSelectionNameChange,
    jobs,
    busyLabel,
    mediaVersion,
    missingAudioCount,
    onRefreshAudioReadiness,
    showMissingOnly,
    onToggleShowMissingOnly,
}: RunPreviewControlsProps) {
    if (!preview) {
        return null;
    }

    const includedImageCount = preview.image_previews.filter(img => img.include_in_output !== false).length;
    const includedSegmentCount = preview.image_previews.reduce((count, image) => (
        count + image.base_timeline.filter(seg => seg.include_in_output !== false).length
    ), 0);

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-zinc-100">Run Preview Controls</h3>
                    <p className="text-xs text-zinc-500">
                        {includedImageCount} included images, {includedSegmentCount} included segments.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onSaveEdits()}
                        disabled={busyLabel !== null}
                        className="rounded bg-amber-700 px-3 py-2 text-xs text-white hover:bg-amber-600 disabled:opacity-50"
                        title="Save your current run/image/segment preview edits back into preview.json."
                    >
                        Save Preview Edits
                    </button>
                    <input
                        value={selectionName}
                        onChange={(e) => onSelectionNameChange(e.target.value)}
                        placeholder="selection name"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs text-zinc-100"
                        title="Name for the stitched partial render built from only the currently included images and segments."
                    />
                    <button
                        onClick={() => onBuildSelection()}
                        disabled={busyLabel !== null}
                        className="rounded bg-emerald-700 px-3 py-2 text-xs text-white hover:bg-emerald-600 disabled:opacity-50"
                        title="Render only the currently included images and segments as a separate stitched part."
                    >
                        Render Selected Part
                    </button>
                    <button
                        onClick={() => onBuildFull()}
                        disabled={busyLabel !== null}
                        className="rounded bg-fuchsia-700 px-3 py-2 text-xs text-white hover:bg-fuchsia-600 disabled:opacity-50"
                        title="Accept the current preview and render the full OCR run, including segment/image intermediates and the final stitched chapter video."
                    >
                        Render Whole Chapter
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="text-xs text-zinc-300">
                    Missing dialogue audio: <span className="text-red-300">{missingAudioCount}</span>
                </div>
                <button
                    onClick={() => onRefreshAudioReadiness()}
                    className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
                    title="Recheck which dialogue lines still do not have generated or recorded audio."
                >
                    Refresh Audio Check
                </button>
                <button
                    onClick={() => onToggleShowMissingOnly()}
                    className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
                    title="Filter the dialogue editors so you can focus only on lines that still need audio attention."
                >
                    {showMissingOnly ? "Show All Lines" : "Show Missing-Audio Lines"}
                </button>
                {missingAudioCount > 0 && (
                    <div className="text-[11px] text-zinc-500">
                        Preview rebuild from OCR will currently fail until those lines have audio.
                    </div>
                )}
            </div>

            <AudioLayerEditor
                title="Chapter Audio Layers"
                layers={preview.audio_layers ?? []}
                onAdd={onAddRunAudioLayer}
                onChange={(next) => onUpdateRunAudioLayers(() => next)}
            />

            {/* Global silent clip duration */}
            <div className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-950/50 px-3 py-2">
                <span className="text-xs text-zinc-400" title="Default display duration for all silent (text-less) segments. Can be overridden per-segment in the video editor.">
                    Silent panel duration
                </span>
                <input
                    id="global-silent-duration"
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={preview.render_config?.default_silent_clip_duration ?? 3}
                    onChange={(e) => onUpdateRenderConfig((cfg) => {
                        cfg.default_silent_clip_duration = Number(e.target.value)
                    })}
                    className="w-20 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                />
                <span className="text-xs text-zinc-500">s (global default)</span>
            </div>

            <div className="rounded border border-zinc-800 bg-zinc-950/60 p-3 space-y-2">
                <div className="text-xs text-zinc-400">
                    Whole-run rendered video
                </div>
                <video
                    key={`${preview.out_file_ref.path}?v=${mediaVersion}`}
                    src={`${resolveMediaRef(preview.out_file_ref)}?v=${mediaVersion}`}
                    controls
                    className="w-full rounded border border-zinc-800 bg-black"
                />
            </div>

            {Object.keys(jobs).length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-zinc-100">Render Jobs</h4>
                    {Object.entries(jobs).map(([jobId, job]) => (
                        <div key={jobId} className="rounded border border-zinc-800 bg-zinc-950/60 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm text-zinc-100">{job.label}</div>
                                    <div className="text-[11px] text-zinc-500">{jobId}</div>
                                </div>
                                <div className="text-xs uppercase tracking-wide text-zinc-300">
                                    {job.status}
                                </div>
                            </div>
                            <div className="mt-2 text-[11px] text-zinc-500">
                                Elapsed: {(((job.finishedAt ?? Date.now()) - job.startedAt) / 1000).toFixed(1)}s
                            </div>

                            {job.error && (
                                <p className="mt-2 text-xs text-red-300">{job.error}</p>
                            )}

                            {job.result?.data && (
                                <video
                                    src={`${resolveMediaRef(job.result.data)}?v=${mediaVersion}`}
                                    controls
                                    className="mt-3 w-full rounded border border-zinc-800 bg-black"
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
