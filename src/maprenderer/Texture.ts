import { FileDat } from "../data/FileDat";
import { DataTexture, RepeatWrapping, RGBAFormat } from "three";

export class Texture {

    private texture: DataTexture;

    constructor(public tile: Tile, public palette: FileDat, public index: number) {
    }


    getTexture(xrepeat: number, yrepeat: number) {

        if (this.texture == null) {
            let pixels = new Uint8ClampedArray(this.tile.pixels.length * 4);
            let counter = 0;
            for (let h = 0; h < this.tile.y; h++) {
                for (let w = 0; w < this.tile.x; w++) {
                    let palindex = this.tile.pixels[h + w * this.tile.y];
                    let color = this.palette.palette[palindex];
                    pixels[4 * counter + 0] = color.r;
                    pixels[4 * counter + 1] = color.g;
                    pixels[4 * counter + 2] = color.b;
                    pixels[4 * counter + 3] = color.a;
                    counter++;
                }
            }
            this.texture = new DataTexture(pixels, this.tile.x, this.tile.y, RGBAFormat);
            this.texture.wrapS = RepeatWrapping;
            this.texture.wrapT = RepeatWrapping;
        }

        let max = Math.max(this.tile.x, this.tile.y);
        let tex = this.texture.clone();
        let repeatx = xrepeat;
        let repeaty = yrepeat;
        tex.repeat.set(8 * repeatx / max, 8 * repeaty / max);
        tex.needsUpdate = true;

        return tex;
    }
}