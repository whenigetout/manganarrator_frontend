import { EditAction, EditActionType } from "../../../types/EditActionType"
import { getEmotionDropdown } from "../../../types/ttsDropdowns"
import clsx from "clsx"

interface EmotionDDLProps {
    speaker: string
    gender: string
    emotion: string
    imageIdx: number
    dlgIdx: number
    dispatchEdit: (action: EditAction) => void
}

export const EmotionDDL = ({
    speaker,
    gender,
    emotion,
    imageIdx,
    dlgIdx,
    dispatchEdit
}: EmotionDDLProps) => {
    const { options, selected } = getEmotionDropdown(gender.toLowerCase().trim(), speaker.toLowerCase().trim(), emotion.toLowerCase().trim())
    const selectedOption = options.find(o => o.value === selected)
    const isUnknownSelected = selectedOption?.isUnknown

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-300">
                Emotion
            </label>

            <select
                className={clsx(
                    "rounded-md border px-2 py-1 text-sm",
                    "bg-zinc-900 text-gray-100",
                    "focus:outline-none focus:ring-2",
                    isUnknownSelected
                        ? "border-red-500 focus:ring-red-500 bg-red-950/40"
                        : "border-zinc-700 focus:ring-blue-500"
                )}
                value={selected}
                onChange={(e) =>
                    dispatchEdit({
                        type: EditActionType.Dialogue_update,
                        imageIdx,
                        dlgIdx,
                        updates: { emotion: e.target.value }
                    })
                }
            >
                {options.map((opt) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                        className={clsx(
                            opt.isUnknown && "text-red-400"
                        )}
                    >
                        {opt.label}
                    </option>
                ))}
            </select>

            {isUnknownSelected && (
                <div className="text-xs text-red-400">
                    OCR detected an unknown emotion
                </div>
            )}
        </div>
    )
}