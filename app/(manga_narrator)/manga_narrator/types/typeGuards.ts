import { VideoPreviewEditor } from "./videoPreviewEditor";

export const isVideoPreview = (v: unknown): v is VideoPreviewEditor => {
    if (typeof v !== "object" || v === null) return false;

    const vp = v as Record<string, unknown>;

    return (
        typeof vp.run_id === "string" &&
        Array.isArray(vp.image_previews)
    );
};
