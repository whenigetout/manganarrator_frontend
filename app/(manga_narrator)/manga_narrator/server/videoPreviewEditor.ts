import type { MediaRef } from "@manganarrator/contracts";
import { fetchJsonContents } from "./fetchJsonContents";
import type {
    ImagePreviewEditor,
    SegmentPreviewEditor,
    VideoJobResponse,
    VideoPreviewEditor,
} from "../types/videoPreviewEditor";

const VIDEO_API = process.env.NEXT_PUBLIC_VIDEO_API as string;

async function parseJson<T>(res: Response, fallbackMessage: string): Promise<T> {
    if (!res.ok) {
        let detail = fallbackMessage;
        try {
            const body = await res.json();
            detail = body.detail ?? body.error ?? fallbackMessage;
        } catch {
            detail = fallbackMessage;
        }
        throw new Error(detail);
    }

    return res.json();
}

export async function loadEditableVideoPreview(
    jsonFile: MediaRef,
): Promise<VideoPreviewEditor> {
    const params = new URLSearchParams({
        namespace: jsonFile.namespace,
        path: jsonFile.path,
    });

    try {
        const res = await fetch(`${VIDEO_API}/video/preview/load?${params.toString()}`, {
            cache: "no-store",
        });
        return await parseJson<VideoPreviewEditor>(res, "Failed to load editable preview");
    } catch {
        const fallback = await fetchJsonContents(jsonFile, "video_preview");
        return fallback as VideoPreviewEditor;
    }
}

export async function saveEditableVideoPreview(
    videoPreview: VideoPreviewEditor,
) {
    const res = await fetch(`${VIDEO_API}/video/preview/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoPreview),
    });

    return parseJson<{ status: string; video_preview_ref: MediaRef }>(
        res,
        "Failed to save preview edits",
    );
}

export async function buildSegmentFromPreview(
    segmentPreview: SegmentPreviewEditor,
) {
    const res = await fetch(`${VIDEO_API}/video/build/segment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(segmentPreview),
    });

    return parseJson<{ status: string; job_id: string }>(
        res,
        "Failed to start segment build",
    );
}

export async function buildImageFromPreview(
    imagePreview: ImagePreviewEditor,
) {
    const res = await fetch(`${VIDEO_API}/video/build/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePreview),
    });

    return parseJson<{ status: string; job_id: string }>(
        res,
        "Failed to start image build",
    );
}

export async function buildVideoFromPreview(
    videoPreview: VideoPreviewEditor,
) {
    const res = await fetch(`${VIDEO_API}/video/build/from_preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoPreview),
    });

    return parseJson<{ status: string; job_id: string }>(
        res,
        "Failed to start video build",
    );
}

export async function loadVideoJob(jobId: string) {
    const res = await fetch(`${VIDEO_API}/video/status/${jobId}`, {
        cache: "no-store",
    });

    return parseJson<VideoJobResponse>(res, "Failed to load video job");
}
