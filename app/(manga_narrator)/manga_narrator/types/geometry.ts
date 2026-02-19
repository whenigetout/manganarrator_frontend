export type Point = Readonly<{
    x: number,
    y: number
}>

export const Point = {
    of: (x: number, y: number): Point => {
        return { x, y }
    }
}

export type Size = Readonly<{
    w: number,
    h: number
}>

export type Frame = Readonly<{
    p1: Point,
    p2: Point
}>

export type BBox = {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
