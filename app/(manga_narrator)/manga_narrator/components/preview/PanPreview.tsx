import { ImagePreviewOut, DialoguePreviewOut } from "../../types/video_api_types"
import {
    resolveImageSrc

} from "../../utils/resolveImageSrc"
interface PanPreviewProps {
    imagePreview: ImagePreviewOut
    dialoguePreview: DialoguePreviewOut
}

export default function PanPreview({ imagePreview, dialoguePreview }: PanPreviewProps) {
    const [x1, y1, x2, y2] = dialoguePreview.crop_box
    const viewportWidth = x2 - x1
    const viewportHeight = y2 - y1

    return (
        <div className="border rounded mb-4 p-2 bg-black">
            <div className="text-sm text-gray-300 mb-1">
                #{dialoguePreview.dialogue_id}: {dialoguePreview.dialogue_text}
            </div>

            <div
                style={{
                    width: viewportWidth,
                    height: viewportHeight,
                    overflow: "hidden",
                    position: "relative",
                    border: "1px solid #444",
                }}
            >
                <img
                    src={resolveImageSrc(
                        imagePreview.image_rel_path_from_root,
                        imagePreview.image_file_name
                    )}
                    alt=""
                    style={{
                        position: "absolute",
                        top: -y1,        // pan offset
                        left: 0,
                        width: "100%",   // scaled to viewport width
                        height: "auto",
                    }}
                />
            </div>
        </div>
    )
}
