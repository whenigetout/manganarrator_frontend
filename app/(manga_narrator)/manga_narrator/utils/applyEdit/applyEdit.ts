import { OCRRun } from "@manganarrator/contracts"
import { EditAction, EditActionType } from "../../types/EditActionType"
import { updateDialogueLine } from "./cases/updateDialogueLine"
import { deleteDialogueLine } from "./cases/deleteDialogueLine"

export function applyEdit(
    prev: OCRRun,
    action: EditAction
): OCRRun {

    switch (action.type) {
        case EditActionType.Dialogue_update:
            return updateDialogueLine(prev, action)

        case EditActionType.Dialogue_delete:
            return deleteDialogueLine(prev, action)

        default:
            return prev
    }
}
