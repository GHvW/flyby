
interface Coordinate {
    x: number;
    y: number
}

interface CoordinateOps {
    distanceTo: (y: number) => number;
}

export { Coordinate, CoordinateOps };