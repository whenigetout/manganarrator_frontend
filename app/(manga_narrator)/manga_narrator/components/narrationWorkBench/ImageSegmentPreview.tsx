import React, { useState } from "react";
import type { ImagePreviewEditor, SegmentPreviewEditor } from "../../types/videoPreviewEditor";
import { resolveMediaRef, fileNameFromMediaRef } from "../../utils/helpers";

interface ImageSegmentPreviewProps {
    imagePreview: ImagePreviewEditor;
    activeIdx: number;
    onPrev: () => void;
    onNext: () => void;
    uiScale?: number; // visual scale only (e.g. 0.25)
    /** Called when the user changes the per-segment silent duration override */
    onUpdateSegment?: (updater: (seg: SegmentPreviewEditor) => void) => void;
    /** Global default silent duration from render_config, for display purposes */
    globalSilentDuration?: number;
}

export const ImageSegmentPreview = ({
    imagePreview,
    activeIdx,
    onPrev,
    onNext,
    uiScale = 0.25,
    onUpdateSegment,
    globalSilentDuration = 3,
}: ImageSegmentPreviewProps) => {
    const [showDurationOverride, setShowDurationOverride] = useState(false);

    const segments = imagePreview.base_timeline;
    const seg = segments[activeIdx];

    if (!seg) {
        return (
            <div className="text-sm text-zinc-400">
                No segment preview available
            </div>
        );
    }

    const { rendered_segment, duration, video_dialogue_lines } = seg;
    const { render_span, viewport_size, segment } = rendered_segment;
    const imgInfo = segment.image_info;

    const isSilent = video_dialogue_lines.length === 0;
    const effectiveSilentDuration = seg.silent_duration_override ?? globalSilentDuration;

    const imgUrl = resolveMediaRef(imgInfo.image_ref)

    const vpW = viewport_size.w * uiScale;
    const vpH = viewport_size.h * uiScale;

    const imgScaledW =
        imgInfo.image_width * render_span.image_scale * uiScale;
    const imgScaledH =
        imgInfo.image_height * render_span.image_scale * uiScale;

    const paddedH =
        (imgInfo.image_height * render_span.image_scale +
            render_span.empty_space_top +
            render_span.empty_space_bottom) *
        uiScale;

    return (
        <div className="space-y-2">
            {/* Navigation */}
            <div className="flex items-center justify-between text-xs text-zinc-300">
                <button
                    disabled={activeIdx === 0}
                    onClick={onPrev}
                    className="px-2 py-1 rounded bg-zinc-800 disabled:opacity-40"
                >
                    ◀ Prev
                </button>

                <div className="flex items-center gap-2">
                    <span>Segment {segment.segment_id} / {segments.length}</span>
                    {isSilent && (
                        <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300 tracking-wide">
                            SILENT
                        </span>
                    )}
                </div>

                <button
                    disabled={activeIdx === segments.length - 1}
                    onClick={onNext}
                    className="px-2 py-1 rounded bg-zinc-800 disabled:opacity-40"
                >
                    Next ▶
                </button>
            </div>

            {/* Viewport */}
            <div
                style={{
                    width: vpW,
                    height: vpH,
                    overflow: "hidden",
                    position: "relative",
                    background: "black",
                    border: isSilent ? "1px solid #52525b" : "1px solid #333",
                }}
            >
                {/* Padded canvas */}
                <div
                    style={{
                        position: "absolute",
                        width: vpW,
                        height: paddedH,
                        top: -render_span.crop_y1 * uiScale,
                        left: 0,
                        background: "black",
                    }}
                >
                    {/* Image */}
                    <img
                        src={imgUrl}
                        draggable={false}
                        style={{
                            position: "absolute",
                            top: render_span.empty_space_top * uiScale,
                            left: render_span.empty_space_left * uiScale,
                            width: imgScaledW,
                            height: imgScaledH,
                            opacity: isSilent ? 0.7 : 1,
                        }}
                    />
                </div>

                {/* Silent overlay badge */}
                {isSilent && (
                    <div
                        style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            fontSize: 10,
                            background: "rgba(0,0,0,0.75)",
                            color: "#a1a1aa",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: "1px solid #52525b",
                        }}
                    >
                        {seg.silent_duration_override != null
                            ? `${seg.silent_duration_override}s (override)`
                            : `${globalSilentDuration}s silent`}
                    </div>
                )}

                {/* Debug overlay */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 6,
                        left: 6,
                        fontSize: 11,
                        background: "rgba(0,0,0,0.7)",
                        color: "#e5e7eb",
                        padding: "4px 6px",
                        borderRadius: 4,
                    }}
                >
                    <div>Image: {imagePreview.image_id}</div>
                    <div>Segment: {segment.segment_id}</div>
                    <div>Duration: {duration.toFixed(2)}s</div>
                    <div>
                        Dialogues:{" "}
                        {video_dialogue_lines.length === 0
                            ? "—"
                            : video_dialogue_lines.map(d => d.id).join(", ")}
                    </div>
                </div>
            </div>

            {/* Silent segment controls */}
            {isSilent && onUpdateSegment && (
                <div className="rounded border border-zinc-800 bg-zinc-950/60 px-3 py-2 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">
                            Displays for{" "}
                            <strong className="text-zinc-200">
                                {seg.silent_duration_override != null
                                    ? `${seg.silent_duration_override}s`
                                    : `${globalSilentDuration}s (global)`}
                            </strong>
                        </span>
                        <button
                            onClick={() => setShowDurationOverride(v => !v)}
                            className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                            title="Set a custom duration for this segment only"
                        >
                            ⚙ Override
                        </button>
                    </div>

                    {showDurationOverride && (
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-zinc-400">
                                Duration for this segment
                            </label>
                            <input
                                type="number"
                                min={0.5}
                                step={0.5}
                                value={seg.silent_duration_override ?? globalSilentDuration}
                                onChange={(e) => onUpdateSegment((s) => {
                                    s.silent_duration_override = Number(e.target.value);
                                    s.duration = Number(e.target.value);
                                })}
                                className="w-20 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-zinc-100"
                            />
                            <span className="text-xs text-zinc-500">s</span>
                            {seg.silent_duration_override != null && (
                                <button
                                    onClick={() => onUpdateSegment((s) => {
                                        s.silent_duration_override = null;
                                        s.duration = globalSilentDuration;
                                    })}
                                    className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-500"
                                    title="Remove override and use global default"
                                >
                                    ✕ Reset
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Audio list */}
            {video_dialogue_lines.length > 0 && (
                <div className="text-xs text-zinc-400">
                    Audio:
                    <ul className="list-disc list-inside">
                        {video_dialogue_lines.map(dlg => (
                            <li key={dlg.id}>
                                {fileNameFromMediaRef(dlg.audio_ref)}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
