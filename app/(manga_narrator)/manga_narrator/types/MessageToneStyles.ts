export type MessageTone = "error" | "success" | "info" | "warning";

export const toneStyles: Record<MessageTone, string> = {
    error: "text-red-400",
    success: "text-green-400",
    info: "text-blue-400",
    warning: "text-yellow-400",
};