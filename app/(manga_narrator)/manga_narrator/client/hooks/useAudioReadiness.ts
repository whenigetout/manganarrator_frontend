import { useEffect, useMemo, useState } from "react";
import { OCRRun } from "@manganarrator/contracts";
import { fetchLatestTTSAudio } from "../../server/fetchLatestTTSAudio";

export interface MissingAudioItem {
    imageId: number;
    dialogueId: number;
    text: string;
}

export function useAudioReadiness(ocrRun: OCRRun | null) {
    const [missingAudio, setMissingAudio] = useState<MissingAudioItem[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = async () => {
        if (!ocrRun) {
            setMissingAudio([]);
            return;
        }

        setLoading(true);
        try {
            const tasks = ocrRun.images.flatMap(image =>
                image.dialogue_lines.map(async dlgLine => {
                    try {
                        const response = await fetchLatestTTSAudio(
                            ocrRun.run_id,
                            dlgLine.id,
                            image.image_info.image_ref,
                        );

                        if (!response.audio_path) {
                            return {
                                imageId: image.image_id,
                                dialogueId: dlgLine.id,
                                text: dlgLine.text,
                            };
                        }

                        return null;
                    } catch {
                        return {
                            imageId: image.image_id,
                            dialogueId: dlgLine.id,
                            text: dlgLine.text,
                        };
                    }
                }),
            );

            const results = await Promise.all(tasks);
            setMissingAudio(results.filter((item): item is MissingAudioItem => item !== null));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [ocrRun?.run_id, ocrRun?.ocr_json_file.path]);

    const missingDialogueIds = useMemo(
        () => new Set(missingAudio.map(item => item.dialogueId)),
        [missingAudio],
    );

    return {
        missingAudio,
        missingDialogueIds,
        loading,
        refresh,
    };
}
