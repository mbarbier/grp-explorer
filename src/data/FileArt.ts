import { FileBase } from "./FileBase";

export class FileArt extends FileBase {

    tiles: Array<Tile> = [];

    read() {
        this.reader.offset = this.initialOffset;

        let version = this.reader.readUint32LE();
        if (version != 1) {
            throw new Error("expecting version 1 for art files");
        }

        this.reader.readUint32LE(); // numtiles
        let localtilestart = this.reader.readUint32LE();
        let localtileend = this.reader.readUint32LE();

        let count = localtileend - localtilestart + 1;

        for (let i = 0; i < count; i++) this.tiles.push({ x: 0, y: 0, pixels: [] });
        for (let i = 0; i < count; i++) this.tiles[i].x = this.reader.readUint16LE();
        for (let i = 0; i < count; i++) this.tiles[i].y = this.reader.readUint16LE();
        for (let i = 0; i < count; i++) {
            // picanm
            this.reader.readUint32LE();
        }

        for (let i = 0; i < count; i++) {
            // read pixels
            let tile = this.tiles[i];
            let pixels = tile.x * tile.y;
            if (pixels > 0) {
                for (let c = 0; c < pixels; c++) {
                    tile.pixels.push(this.reader.readUint8());
                }
            }
        }
    }
}