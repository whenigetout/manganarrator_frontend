import { EditAction, EditActionType } from "../../../types/EditActionType"
import { OriginalImageBBox, DialogueLine } from "@manganarrator/contracts"
import { PrecisionSlider } from "../../common/PrecisionSlider"
import { DisplayValues } from "../../common/DisplayValues"

interface BBoxEditorProps {
    originalBBox: OriginalImageBBox
    updateY1: (y1: number) => void

    maxY1: number
    imageIdx: number
    activeDlgIdx: number

    dispatchEdit: (action: EditAction) => void
    onSave: () => void;
}

export const BBoxEditor = ({
    originalBBox,
    updateY1,
    maxY1,
    imageIdx,
    activeDlgIdx,
    dispatchEdit,
    onSave
}: BBoxEditorProps) => {

    return (
        <div className="space-y-2 p-3 border rounded text-sm w-64">
            <div className="font-semibold">BBox Editor</div>

            <DisplayValues
                displayLabel="x1"
                displayValue={originalBBox.x1}
            />

            <PrecisionSlider
                label="y1"
                value={originalBBox.y1}
                min={0}
                max={maxY1}
                step={1}
                bigStep={10}
                onChange={(y1) => updateY1(y1)}
            />

            <DisplayValues
                displayLabel="x2"
                displayValue={originalBBox.x2}
            />

            <DisplayValues
                displayLabel="y2"
                displayValue={originalBBox.y2}
            />

            <button
                className="w-full mt-2 border rounded py-1 hover:bg-gray-100"
                onClick={() => onSave()}
            >
                Save to JSON
            </button>
        </div>
    );
};
