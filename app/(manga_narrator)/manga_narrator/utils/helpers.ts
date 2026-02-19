import { MediaRef } from "@manganarrator/contracts"

const MEDIA_ROOT = process.env.NEXT_PUBLIC_MEDIA_ROOT

export const resolveMediaRef = (mediaRef: MediaRef) =>
    `${MEDIA_ROOT}/${mediaRef.namespace}/${mediaRef.path}`

export const fileNameFromMediaRef = (mediaRef: MediaRef) =>
    `${mediaRef.path.split('/').pop()}`

export const safeFloat = (
    value: unknown,
    fallback: number
): number => {
    const n = typeof value === "number"
        ? value
        : parseFloat(String(value));

    return Number.isFinite(n) ? n : fallback;
}