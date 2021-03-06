import { FileBase } from "./FileBase";
import { Color } from "./Types";

export class FileDat extends FileBase {

    palette: Array<Color> = [];
    shades: Array<Array<Color>> = [];

    read() {
        this.reader.offset = this.initialOffset;

        if (this.name === "lookup.dat") this.readLookup();
        else if (this.name === "palette.dat") this.readPalette();
    }

    private readPalette() {
        for (let c = 0; c < 256; c++) {
            let r = this.reader.readUint8() * 4;
            let g = this.reader.readUint8() * 4;
            let b = this.reader.readUint8() * 4;

            let color = { r: r, g: g, b: b, a: 255 };
            if (c === 255) color.a = 0;
            this.palette.push(color);
        }

        let numpalookups = this.reader.readUint16LE();
        for (let i = 0; i < numpalookups; i++) {
            let shade: Array<Color> = [];
            for (let j = 0; j < 256; j++) {
                let mapping = this.reader.readUint8();
                shade.push(this.palette[mapping]);
            }
            this.shades.push(shade);
        }

        // Transparency Data Table
    }

    private readLookup() {

    }
}