import { useEffect, useState } from "react";
import { MediaRef, VideoPreview, ImagePreview, OCRRun } from "@manganarrator/contracts";
import { fetchJsonContents } from "../../server/fetchJsonContents";
import { isVideoPreview } from "../../types/typeGuards";

// useOcrJson.ts
export function useVideoPreviewJson(json_file: MediaRef | null) {
    const [data, setData] = useState<VideoPreview | null>(null);
    const [imgPrwById, setImgPrwById] = useState<Map<number, ImagePreview> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildImgPreviewMap = (
        previews: ImagePreview[]
    ): Map<number, ImagePreview> => {
        return new Map(previews.map(p => [p.image_id, p]));
    };


    const loadPreview = () => {
        if (!json_file) {
            setData(null)
            return
        }

        setLoading(true)
        setError(null)

        fetchJsonContents(json_file, "video_preview")
            .then((data) => {
                if (isVideoPreview(data)) {
                    setData(data)

                    setImgPrwById(buildImgPreviewMap(data.image_previews))
                }
            })
            .catch(() => setError("Preview JSON not found / error."))
            .finally(() => setLoading(false));
    }

    // runs once on load and on every render
    useEffect(() => {
        loadPreview()
    }, [json_file]);

    return {
        data,
        imgPrwById,
        loading,
        error
    };
}
