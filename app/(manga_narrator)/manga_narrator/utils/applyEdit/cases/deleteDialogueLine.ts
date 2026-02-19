import { EditAction } from "../../../types/EditActionType"
import { OCRRun, OCRImage, DialogueLine } from "@manganarrator/contracts"

export const deleteDialogueLine = (
    prev: OCRRun,
    action: EditAction
): OCRRun => {
    const { imageIdx, dlgIdx } = action

    return {
        ...prev,
        images: prev.images.map((img: OCRImage, i) => {
            if (i !== imageIdx) return img

            const updatedImg: OCRImage = {
                ...img,
                dialogue_lines: img.dialogue_lines.filter(
                    (_dlg: DialogueLine, j: number) => j !== dlgIdx
                )

            }

            return updatedImg
        })
    }
}
