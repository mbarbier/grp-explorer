import { FileB800 } from "../data/FileB800";


export function renderB800(file: FileB800) {

    if (file.chars.length != 2000) {
        return <div>File is not 2000 char long</div>
    }

    // {items.forEach(e => { return e; })}

    let lines: Array<HTMLElement> = [];
    for (let r = 0; r < 25; r++) {
        let items: Array<HTMLElement> = [];
        for (let c = 0; c < 80; c++) {
            let idx = r * 80 + c;
            let char = file.chars[idx];
            let col = file.colors[idx];
            let e = getB800Element(char, col);
            items.push(e);
        }
        let line = <div className="line">
            {items}
        </div>;
        lines.push(line)
    }

    let e = <div className="B800">
        {lines}
    </div>
    return e;
}


let b800color = ["#000000", "#0000AA", "#00AA00", "#00AAAA", "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
    "#555555", "#5555FF", "#55FF55", "#55FFFF", "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF"]

function getB800Element(char: string, colorData: number) {
    let c = "#000000";
    let bc = "#FFFFFF";
    let color = colorData & 0x0F;
    let bgcolor = (colorData & 0xF0) >> 4;
    if (color < 16) c = b800color[color];
    if (bgcolor < 16) bc = b800color[bgcolor];
    return <span style={"color:" + c + ";background-color:" + bc}>{char}</span>
}