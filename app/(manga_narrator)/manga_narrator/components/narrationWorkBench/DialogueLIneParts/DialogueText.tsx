import { EditAction, EditActionType } from "../../../types/EditActionType"

interface DialogueTextProps {
    dialogueText: string
    imageIdx: number
    dlgIdx: number
    dispatchEdit: (action: EditAction) => void
}
export const DialogueText = ({
    dialogueText,
    imageIdx,
    dlgIdx,
    dispatchEdit
}: DialogueTextProps) => {
    return (
        <div>
            <textarea

                className="bg-gray-900 border border-gray-700 text-green-300 px-2 py-1 rounded mr-2 w-72 overflow-hidden"
                value={dialogueText}
                onChange={e => {
                    dispatchEdit({
                        type: EditActionType.Dialogue_update,
                        imageIdx: imageIdx,
                        dlgIdx: dlgIdx,
                        updates: { text: e.target.value }
                    })
                }}
            />
        </div>
    )
}
