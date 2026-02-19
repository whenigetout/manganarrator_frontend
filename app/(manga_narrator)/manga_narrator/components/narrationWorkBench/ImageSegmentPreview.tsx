import React from "react";
import type {
    ImagePreview,
    SegmentPreview,
} from "@manganarrator/contracts"
import { resolveMediaRef, fileNameFromMediaRef } from "../../utils/helpers";

interface ImageSegmentPreviewProps {
    imagePreview: ImagePreview;
    activeIdx: number;
    onPrev: () => void;
    onNext: () => void;
    uiScale?: number; // visual scale only (e.g. 0.25)
}

export const ImageSegmentPreview = ({
    imagePreview,
    activeIdx,
    onPrev,
    onNext,
    uiScale = 0.25,
}: ImageSegmentPreviewProps) => {
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

                <div>
                    Segment {segment.segment_id} / {segments.length}
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
                    border: "1px solid #333",
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
                        }}
                    />
                </div>

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
