import { SaveMediaRequest, MediaRef } from "@manganarrator/contracts";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API as string;

export interface SaveRecordedAudioParams extends SaveMediaRequest {
    audio_blob: Blob;
}

export const saveRecordedAudio = async (
    req: SaveRecordedAudioParams
): Promise<any> => {
    const form = new FormData();

    // required fields
    form.append("run_id", req.run_id);
    form.append("dialogue_id", String(req.dialogue_id));

    // MediaRef must be JSON string (matches model_validate_json)
    form.append("image_ref", JSON.stringify(req.image_ref));

    // audio file
    form.append("audio", req.audio_blob, "recorded.webm");

    // OPTIONAL / future-proof (safe to ignore server-side)
    if (req.suffix) form.append("suffix", req.suffix);
    if (req.ext) form.append("ext", req.ext);
    if (req.source) form.append("source", req.source);

    const res = await fetch(
        `${BACKEND_API}/api/manga/save_recorded_audio/`,
        {
            method: "POST",
            body: form, // ⚠️ NO headers
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`saveRecordedAudio failed (${res.status}): ${text}`);
    }

    return res.json();
};
