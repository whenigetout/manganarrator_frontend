import { MediaRef, OCRImage, OriginalImageBBox } from "@manganarrator/contracts"
import { useState, useEffect } from "react"
import { ImageViewport, ImageViewportProps } from "./ImagePanPreviewParts/ImageViewport"
import { Point, Size, Frame, BBox } from "../../types/geometry"
import { DebugControls } from "./ImagePanPreviewParts/DebugControls"
import { EditAction, EditActionType } from "../../types/EditActionType"
import { resolveMediaRef } from "../../utils/helpers"

interface ImagePanPreviewProps {
    image: OCRImage
    imageIdx: number
    activeDlgIdx: number
    dispatchEdit: (action: EditAction) => void
    saveJson: () => void
}

export function ImagePanPreview({ image, imageIdx, activeDlgIdx, dispatchEdit, saveJson }: ImagePanPreviewProps) {

    const dlg = image.dialogue_lines[activeDlgIdx]
    const bbox = dlg?.original_bbox ?? null

    const imgOriginalSize: Size = {
        w: image.image_info.image_width,
        h: image.image_info.image_height
    }

    const imgRef = image.image_info.image_ref
    const imgUrl = resolveMediaRef(imgRef)

    const DEFAULT_FRAME_WIDTH = 360
    const ASPECT_RATIO = (1080 / 1920)

    const calcFrame_size = (width: number, sideMargin: number, aspectRatio: number) => ({
        w: width - 2 * sideMargin,
        h: width / aspectRatio,
    })

    // 1️⃣ Source state
    const [frameWidth, setFrameWidth] = useState(DEFAULT_FRAME_WIDTH);
    const [frameSideMargin, setFrameSideMargin] = useState(0);
    const [frameTopPadding, setFrameTopPadding] = useState(10);
    const [originalBBox, setOriginalBBox] = useState<OriginalImageBBox | null>(bbox ? { ...bbox } : null);
    const [original, setOriginal] = useState<boolean>(false);

    // 2️⃣ Derived values (NO state, NO effect)
    const FRAME_SIZE = calcFrame_size(frameWidth, frameSideMargin, ASPECT_RATIO);
    const imgScale = FRAME_SIZE.w / imgOriginalSize.w;

    // 3️⃣ Derived frame position
    const finalOffsetY =
        originalBBox ? originalBBox.y1 * imgScale - frameTopPadding : 0;

    const frame: Frame = {
        p1: { x: 0, y: finalOffsetY },
        p2: { x: FRAME_SIZE.w, y: finalOffsetY + FRAME_SIZE.h },
    };

    const frameHeightInOriginal =
        FRAME_SIZE.h / imgScale

    const maxFrameY1 =
        imgOriginalSize.h - frameHeightInOriginal


    // for debugging
    const imgViewPortProps: ImageViewportProps = {
        imgUrl: imgUrl,
        imgSize: imgOriginalSize,
        framSize: FRAME_SIZE,
        imgScale: imgScale,
        frame: frame,
        sideMargin: frameSideMargin
    }

    useEffect(() => {
        if (original) {
            setFrameWidth(imgOriginalSize.w);
        }
        else {
            setFrameWidth(DEFAULT_FRAME_WIDTH)
        }
    }, [original]);

    useEffect(() => {
        if (bbox) {
            setOriginalBBox({ ...bbox });
        }
    }, [activeDlgIdx, bbox]);

    // pass a temp bbox to debug controls
    let default_bbox: OriginalImageBBox = {
        x1: frame.p1.x,
        y1: frame.p1.y,
        x2: frame.p2.x,
        y2: frame.p2.y
    }

    const updateY1 = (nextY1: number) => {
        if (!originalBBox) return;

        const clampedY1 = Math.max(0, Math.min(nextY1, maxFrameY1));

        const newBbox: OriginalImageBBox = {
            ...originalBBox,
            y1: clampedY1,
            y2: originalBBox.y2 + (clampedY1 - originalBBox.y1)
        };

        setOriginalBBox(newBbox);

        dispatchEdit({
            type: EditActionType.Dialogue_update,
            imageIdx,
            dlgIdx: activeDlgIdx,
            updates: { original_bbox: newBbox }
        });
    };


    return (
        <div className="grid grid-cols-[1fr_1fr] gap-6 px-6">
            <DebugControls
                frameWidth={frameWidth}
                setFrameWidth={setFrameWidth}

                frameHeight={FRAME_SIZE.h}

                frameTopPadding={frameTopPadding}
                setFrameTopPadding={setFrameTopPadding}
                frameSideMargin={frameSideMargin}
                setFrameSideMargin={setFrameSideMargin}

                dispatchEdit={dispatchEdit}
                saveJson={saveJson}

                imgViewPortProps={imgViewPortProps}
                originalBBox={originalBBox ?? default_bbox}
                updateY1={updateY1}
                maxY1={maxFrameY1}
                imageIdx={imageIdx}
                activeDlgIdx={activeDlgIdx}
                dlgText={dlg.text}

                showOriginalValues={original}
                onOriginalToggle={setOriginal}
            />

            <ImageViewport
                imgUrl={imgUrl}
                imgSize={imgOriginalSize}
                framSize={FRAME_SIZE}
                imgScale={imgScale}
                frame={frame}
                sideMargin={frameSideMargin}
                onWheelY={(deltaY) => {
                    if (!originalBBox) return;

                    // scale wheel movement into original image space
                    const deltaInOriginal = deltaY / imgScale;

                    updateY1(originalBBox.y1 + deltaInOriginal);
                }}
            />

        </div>
    );

}
