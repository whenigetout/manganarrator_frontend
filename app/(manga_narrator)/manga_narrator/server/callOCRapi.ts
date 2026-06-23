import { MediaRef } from "@manganarrator/contracts";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API as string;

export interface RunOcrFolderOptions {
    attach_bboxes?: boolean;
    annotate_bboxes?: boolean;
    output_all_results_to_json?: boolean;
    custom_prompt?: string;
}

export interface RunOcrFolderResponse {
    status: "success" | "error";
    run_id?: string;
    count?: number;
    ocr_json_file?: MediaRef;
    json_pre_paddle?: MediaRef;
    json_post_paddle?: MediaRef | null;
    error?: string;
}

export const callOCRapi = async (
    inputRef: MediaRef,
    options: RunOcrFolderOptions = {},
): Promise<RunOcrFolderResponse> => {
    const res = await fetch(`${BACKEND_API}/api/manga/ocr/folder/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            input_ref: inputRef,
            attach_bboxes: options.attach_bboxes ?? true,
            annotate_bboxes: options.annotate_bboxes ?? false,
            output_all_results_to_json: options.output_all_results_to_json ?? false,
            custom_prompt: options.custom_prompt,
        }),
        cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(body.error ?? "OCR failed.");
    }

    return body;
}