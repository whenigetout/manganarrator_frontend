import type { ImagePreviewOut } from '@/app/manga_narrator/types/video_api_types'

export async function fetchVideoPreviews(runId: string): Promise<ImagePreviewOut[]> {
    const VIDEO_API = process.env.NEXT_PUBLIC_VIDEO_API as string

    const res = await fetch(
        `${VIDEO_API}/video/runs/${runId}/previews`,
        { cache: "no-store" }
    )

    if (!res.ok) {
        throw new Error("Failed to load video previews")
    }

    return res.json(); // inferred as ImagePreviewOut[]
}
