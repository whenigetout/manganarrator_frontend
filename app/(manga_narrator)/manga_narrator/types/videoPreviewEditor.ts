import type { MediaRef } from "@manganarrator/contracts";

export interface AudioLayer {
    id: string;
    label: string;
    media_ref: MediaRef;
    start_at: number;
    volume: number;
    loop: boolean;
    enabled: boolean;
    trim_start_sec: number;
    trim_end_sec: number | null;
    fade_in_sec: number;
    fade_out_sec: number;
}

export interface SegmentPreviewEditor {
    rendered_segment: {
        segment: {
            segment_id: number;
            image_id: number;
            run_id: string;
            base_y1: number;
            base_y2: number;
            image_info: {
                image_ref: MediaRef;
                image_width: number;
                image_height: number;
            };
            video_dialogue_ids: number[];
        };
        render_span: {
            crop_y1: number;
            crop_y2: number;
            render_height: number;
            image_scale: number;
            empty_space_top: number;
            empty_space_bottom: number;
            empty_space_left: number;
            empty_space_right: number;
        };
        viewport_size: {
            w: number;
            h: number;
        };
    };
    duration: number;
    video_dialogue_lines: Array<{
        id: number;
        image_id: number;
        text: string;
        speaker: string;
        emotion: string;
        original_bbox: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
        audio_ref: MediaRef;
    }>;
    include_in_output?: boolean;
    audio_layers?: AudioLayer[];
    out_dir_ref: MediaRef;
    out_file_ref: MediaRef;
}

export interface ImagePreviewEditor {
    run_id: string;
    image_id: number;
    base_timeline: SegmentPreviewEditor[];
    include_in_output?: boolean;
    audio_layers?: AudioLayer[];
    out_dir_ref: MediaRef;
    out_file_ref: MediaRef;
}

export interface VideoPreviewEditor {
    run_id: string;
    image_previews: ImagePreviewEditor[];
    render_config?: {
        fps: number;
        viewport_w: number;
        viewport_h: number;
        side_margin_px: number;
        first_dialog_top_padding: number;
        last_dialog_bottom_padding: number;
        vcodec: string;
        preset: string;
        tune: string;
        cq: number;
        pix_fmt: string;
        acodec: string;
        audio_bitrate: string;
        audio_default_sample_rate: number;
        default_silent_clip_duration: number;
        verbose: boolean;
        capture_stdout: boolean;
        capture_stderr: boolean;
        keep_segments: boolean;
    };
    audio_layers?: AudioLayer[];
    out_dir_ref: MediaRef;
    out_file_ref: MediaRef;
}

export interface VideoJobResponse {
    job_id: string;
    status: "processing" | "done" | "failed" | "not_found";
    result?: {
        type: "build_ocrrun" | "build_image" | "build_segment" | "build_from_preview";
        data: MediaRef;
    };
    error?: string;
}
