import { EditAction } from "../../../types/EditActionType"
import { OCRRun, OCRImage, DialogueLine } from "@manganarrator/contracts"

export const updateDialogueLine = (
    prev: OCRRun,
    action: EditAction
): OCRRun => {
    const { imageIdx, dlgIdx, updates } = action

    return {
        ...prev,
        images: prev.images.map((img: OCRImage, i) => {
            if (i !== imageIdx) return img

            const updatedImg: OCRImage = {
                ...img,
                dialogue_lines: img.dialogue_lines.map((dlg: DialogueLine, j) =>
                    j === dlgIdx
                        ? { ...dlg, ...updates }
                        : dlg
                )
            }

            return updatedImg
        })
    }
}
