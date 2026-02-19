import { TTSInput, TTSOutput } from "@manganarrator/contracts"

const TTS_API_ROOT = process.env.NEXT_PUBLIC_TTS_API as string

export const fetchTTSResult = async (
    req: TTSInput
): Promise<TTSOutput> => {
    try {
        const res = await fetch(
            `${TTS_API_ROOT}/tts/dialogue`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req)
        })

        // 👇 always read the body
        const contentType = res.headers.get("content-type");
        const body = contentType?.includes("application/json")
            ? await res.json()
            : await res.text();

        if (!res.ok) {
            // preserve EVERYTHING
            const error = new Error(
                body?.detail?.[0]?.msg ??
                body?.detail ??
                body ??
                `HTTP ${res.status}`
            ) as Error & { status?: number; body?: unknown };

            error.status = res.status;
            error.body = body;

            throw error;
        }

        return body as TTSOutput;
    }
    finally {

    }
}