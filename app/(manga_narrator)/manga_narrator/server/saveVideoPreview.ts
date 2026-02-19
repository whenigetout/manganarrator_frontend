import { OCRRun } from "@manganarrator/contracts";

const BACKEND_API = process.env.NEXT_PUBLIC_VIDEO_API as string

export const saveVideoPreview = async (ocrrun: OCRRun): Promise<any> => {
    const res = await fetch(
        `${BACKEND_API}/video/preview/ocrrun/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ocrrun)
    })

    if (!res.ok) {
        throw new Error("Failed to save json")
    }

    return res.json()
}