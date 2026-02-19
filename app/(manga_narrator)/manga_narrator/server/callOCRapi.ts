import { AnyARecord } from "dns";

export const callOCRapi = async (formData: FormData): Promise<any> => {
    const OCR_API = process.env.NEXT_PUBLIC_OCR_API as string

    const res = await fetch(`${OCR_API}/ocr/folder`, {
        method: 'POST',
        body: formData,
        cache: "no-store"
    })

    if (!res.ok) {
        throw new Error("OCR Failed.")
    }

    return res.json();
}
