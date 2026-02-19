import { toneStyles, MessageTone } from "../../types/MessageToneStyles";
interface MessageProps {
    text?: string;
    show?: boolean;
    tone?: MessageTone;
    className?: string;
}

export const Message = ({
    text,
    show = true,
    tone = "info",
    className = "",
}: MessageProps) => {
    if (!show || !text) return null;

    return (
        <div
            className={`text-sm mt-1 ${toneStyles[tone]} ${className}`}
        >
            {text}
        </div>
    );
};
