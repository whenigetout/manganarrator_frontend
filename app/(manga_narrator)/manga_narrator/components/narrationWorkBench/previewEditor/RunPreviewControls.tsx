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
    selectionName: string;
    onSelectionNameChange: (value: string) => void;
    jobs: Record<string, { label: string; status: VideoJobResponse["status"]; result?: VideoJobResponse["result"]; error?: string }>;
    busyLabel: string | null;
}

export function RunPreviewControls({
    preview,
    onSaveEdits,
    onBuildSelection,
    onBuildFull,
    onAddRunAudioLayer,
    onUpdateRunAudioLayers,
    selectionName,
    onSelectionNameChange,
    jobs,
    busyLabel,
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
                    >
                        Save Preview Edits
                    </button>
                    <input
                        value={selectionName}
                        onChange={(e) => onSelectionNameChange(e.target.value)}
                        placeholder="selection name"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-xs text-zinc-100"
                    />
                    <button
                        onClick={() => onBuildSelection()}
                        disabled={busyLabel !== null}
                        className="rounded bg-emerald-700 px-3 py-2 text-xs text-white hover:bg-emerald-600 disabled:opacity-50"
                    >
                        Render Selected Part
                    </button>
                    <button
                        onClick={() => onBuildFull()}
                        disabled={busyLabel !== null}
                        className="rounded bg-fuchsia-700 px-3 py-2 text-xs text-white hover:bg-fuchsia-600 disabled:opacity-50"
                    >
                        Render Whole Chapter
                    </button>
                </div>
            </div>

            <AudioLayerEditor
                title="Chapter Audio Layers"
                layers={preview.audio_layers ?? []}
                onAdd={onAddRunAudioLayer}
                onChange={(next) => onUpdateRunAudioLayers(() => next)}
            />

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

                            {job.error && (
                                <p className="mt-2 text-xs text-red-300">{job.error}</p>
                            )}

                            {job.result?.data && (
                                <video
                                    src={resolveMediaRef(job.result.data)}
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
