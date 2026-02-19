// For OCR Status:
export const OCR_STATUS = {
    IDLE: 'idle',
    PROCESSING: 'processing',
    DONE: 'done',
    ERROR: 'error',
} as const

export type OcrStatus = typeof OCR_STATUS[keyof typeof OCR_STATUS]
