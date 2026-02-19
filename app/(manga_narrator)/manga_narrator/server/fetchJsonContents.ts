import { OCRRun, MediaRef, VideoPreview } from "@manganarrator/contracts"

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API as string

export const fetchJsonContents = async (
    mediaRef: MediaRef,
    kind?: "video_preview"
): Promise<OCRRun | VideoPreview> => {
    const params = new URLSearchParams({
        namespace: mediaRef.namespace,
        path: mediaRef.path,
    });

    if (kind) {
        params.set("kind", kind);
    }

    const url = `${BACKEND_API}/api/manga/json_file?${params.toString()}`;

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Bad response");
    }

    return res.json();
};
