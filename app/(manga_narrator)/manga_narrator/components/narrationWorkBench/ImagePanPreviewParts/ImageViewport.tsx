import { Point, Size, Frame } from "../../../types/geometry"
import { useEffect, useRef } from "react"

export interface ImageViewportProps {
    framSize: Size
    imgUrl: string
    imgSize: Size
    imgScale: number
    frame: Frame
    sideMargin?: number

    onWheelY?: (deltaY: number) => void
}

export const ImageViewport = ({
    framSize,
    imgUrl,
    imgSize,
    imgScale = 1,
    frame,
    sideMargin = 0,
    onWheelY
}: ImageViewportProps) => {

    const containerRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !onWheelY) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();       // ← THIS now works
            onWheelY(e.deltaY);
        };

        el.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", handleWheel);
        };
    }, [onWheelY]);


    const bgImg = `url(${imgUrl})`
    const bgRepeat = "no-repeat"
    const bgSize = `${imgSize.w * imgScale}px ${imgSize.h * imgScale}px`
    const bgPos = `${frame.p1.x}px -${frame.p1.y}px`

    return (
        <div
            style={{ width: framSize.w + 2 * sideMargin, height: framSize.h }}
            className="rounded-lg overflow-hidden border-red-400 cursor-ns-resize"
            ref={containerRef}
        >

            <div
                className="w-full h-full"
                style={{
                    backgroundImage: bgImg,
                    backgroundRepeat: bgRepeat,
                    backgroundSize: bgSize,
                    backgroundPosition: bgPos,
                }}
            />
        </div>
    )
}
