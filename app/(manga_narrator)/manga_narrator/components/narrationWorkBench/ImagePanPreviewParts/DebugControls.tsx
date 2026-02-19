import { ImageViewportProps } from "./ImageViewport";
import { BBoxEditor } from "./BBoxEditor";
import { EditAction } from "../../../types/EditActionType";
import { OriginalImageBBox } from "@manganarrator/contracts";
import { DisplayValues } from "../../common/DisplayValues";

// DebugControls.tsx
interface DebugControlsProps {
    frameWidth: number;
    setFrameWidth: (v: number) => void;

    frameHeight: number

    frameTopPadding: number;
    setFrameTopPadding: (v: number) => void;

    frameSideMargin: number;
    setFrameSideMargin: (v: number) => void;

    dispatchEdit: (action: EditAction) => void
    saveJson: () => void

    imgViewPortProps: ImageViewportProps

    originalBBox: OriginalImageBBox
    updateY1: (y1: number) => void
    maxY1: number

    imageIdx: number
    activeDlgIdx: number
    dlgText: string

    showOriginalValues: boolean
    onOriginalToggle: (v: boolean) => void
}

export const DebugControls = ({
    frameWidth,
    setFrameWidth,
    frameHeight,
    frameTopPadding,
    setFrameTopPadding,
    frameSideMargin,
    setFrameSideMargin,
    dispatchEdit,
    saveJson,
    imgViewPortProps,
    originalBBox,
    updateY1,
    maxY1,
    imageIdx,
    activeDlgIdx,
    dlgText,
    showOriginalValues,
    onOriginalToggle
}: DebugControlsProps) => {
    const { imgSize, imgScale, frame } = imgViewPortProps

    const bgSize = `${imgSize.w * imgScale}px ${imgSize.h * imgScale}px`
    const bgPos = `${frame.p1.x}px -${frame.p1.y}px`

    return (
        <div className="space-y-3 p-3 border rounded text-sm">
            <div>
                <label className="text-xs uppercase tracking-wide text-zinc-400">
                    <input
                        type="checkbox"
                        checked={showOriginalValues}
                        onChange={(e) => onOriginalToggle(e.target.checked)}
                        className="accent-blue-500"
                    />
                    <span>See original, with no scaling</span>
                </label>
            </div>

            <div>
                <label>Frame width</label>
                <input
                    type="range"
                    min={200}
                    max={800}
                    value={frameWidth}
                    onChange={(e) => setFrameWidth(+e.target.value)}
                />
                <span>{frameWidth}px</span>
            </div>

            <DisplayValues
                displayLabel="frame h"
                displayValue={frameHeight}
            />

            <div>
                <label>Top padding</label>
                <input
                    type="range"
                    min={-50}
                    max={100}
                    value={frameTopPadding}
                    onChange={(e) => setFrameTopPadding(+e.target.value)}
                />
                <span>{frameTopPadding}px</span>
            </div>

            <div>
                <label>Side margin</label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={frameSideMargin}
                    onChange={(e) => setFrameSideMargin(+e.target.value)}
                />
                <span>{frameSideMargin}px</span>
            </div>

            <div>
                <h3>Passed Props:</h3>

                <p>original img size: {imgSize.w} x {imgSize.h}</p>
                <p>bgSize: {bgSize}</p>
                <p>bgPos: {bgPos}</p>
                <p>activeDlgIdx: {activeDlgIdx}</p>
                <DisplayValues
                    displayLabel="Text"
                    displayValue={dlgText}
                    highlight={true}
                />
                <DisplayValues
                    displayLabel="img scaled h"
                    displayValue={imgSize.h * imgScale}
                />
                <DisplayValues
                    displayLabel="maxy1 scaled"
                    displayValue={(maxY1 * imgScale).toFixed(0)}
                />
                <DisplayValues
                    displayLabel="maxy1"
                    displayValue={maxY1}
                />
            </div>

            <BBoxEditor
                activeDlgIdx={activeDlgIdx}
                dispatchEdit={dispatchEdit}
                imageIdx={imageIdx}
                onSave={saveJson}
                originalBBox={originalBBox}
                updateY1={updateY1}
                maxY1={maxY1}
            />

        </div>
    );
}
