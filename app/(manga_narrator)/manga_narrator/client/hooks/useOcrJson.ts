import { useEffect, useState } from "react";
import { fetchJsonContents } from "../../server/fetchJsonContents";
import { applyEdit } from "../../utils/applyEdit/applyEdit";
import { EditAction } from "../../types/EditActionType";
import { saveCorrectedJson } from "../../server/saveCorrectedJson";
import { MediaRef, OCRRun, EmotionOptionsOutput, VideoPreview } from "@manganarrator/contracts"
import { toast } from "../../components/common/ToastHost";
import { EMOJI } from "../../types/EMOJI";
import { saveVideoPreview } from "../../server/saveVideoPreview";

// useOcrJson.ts
export function useOcrJson(json_file: MediaRef | null) {
    const [data, setData] = useState<OCRRun | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // for updates
    const dispatchEdit = (action: EditAction) => {
        setData(prev => {
            if (!prev) return prev;
            const updated = applyEdit(prev, action)
            return updated
        })
    };

    // for saving json at the current state
    const saveJson = () => {
        if (!data) return
        saveCorrectedJson(data)
            .then(() => toast(`${EMOJI.success} Saved updated json successfully.`))
            .catch(() => toast(`${EMOJI.warn} Failed to save updated json.`))
    }

    const savePreview = () => {
        if (!data) return
        saveVideoPreview(data)
            .then(() => toast(`${EMOJI.success} Saved preview successfully.`))
            .catch((data) => {
                console.log("error", data)
                toast(`${EMOJI.warn} Failed to save preview json.`)
            })
    }

    // runs once on load and on every render
    useEffect(() => {
        if (!json_file) {
            setData(null)
            return
        }

        setLoading(true)
        setError(null)

        function isOCRRun(data: OCRRun | VideoPreview): data is OCRRun {
            return "ocr_json_file" in data;
        }

        fetchJsonContents(json_file)
            .then((data) => {
                if (isOCRRun(data)) {
                    setData(data)
                }
            })
            .catch(() => setError("Failed to load OCR JSON"))
            .finally(() => setLoading(false));
    }, [json_file]);

    return {
        data,
        dispatchEdit,
        saveJson,
        savePreview,
        loading,
        error
    };
}
