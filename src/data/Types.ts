
type Color = {
    r: number,
    g: number,
    b: number,
    a: number,
}

type Tile = {
    x: number,
    y: number,
    valid?: boolean,
    pixels?: Array<number>
}