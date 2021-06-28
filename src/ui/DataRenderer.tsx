import { FileB800 } from "../data/FileB800";
import { FileMid } from "../data/FileMid";
import { FileVoc } from "../data/FileVoc";
import { GrpProcessor } from "../data/GrpProcessor";

import WebAudioTinySynth from "webaudio-tinysynth";
import { FileMap } from "../data/FileMap";

////////////////////////////
// B800

export function renderB800(file: FileB800) {

    if (file.chars.length != 2000) {
        return <div>File is not 2000 char long</div>
    }

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


////////////////////////////
// ART

export function renderArt(tile: Tile, processor: GrpProcessor) {

    let pixels = new Uint8ClampedArray(tile.pixels.length * 4);

    let counter = 0;
    for (let h = 0; h < tile.y; h++) {
        for (let w = 0; w < tile.x; w++) {
            let palindex = tile.pixels[h + w * tile.y];
            let color = processor.palette.palette[palindex];
            pixels[4 * counter + 0] = color.r;
            pixels[4 * counter + 1] = color.g;
            pixels[4 * counter + 2] = color.b;
            pixels[4 * counter + 3] = color.a;
            counter++;
        }
    }

    let imageData = new ImageData(pixels, tile.x);
    let canvas = document.createElement("canvas");
    canvas.width = tile.x;
    canvas.height = tile.y;
    let ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    return <div>{canvas}</div>
}


function getDownloadButon(data: ArrayBuffer, type: string, name: string) {
    let e = <a>
        Download
    </a> as HTMLLinkElement;
    let blob = new Blob([data], { type: type });
    e.href = window.URL.createObjectURL(blob);
    (e as any).download = name;
    return e;
}

///////////////////////////////////////
///// VOC

export function renderVoc(voc: FileVoc) {
    let d = getDownloadButon(voc.data, "audio/voc", voc.name);
    return d;
}

export function renderMid(voc: FileMid) {
    let synth: any;
    let playing = false;

    function play() {
        if (!playing) {
            // let blob = new Blob([voc.data], { type: "audio/voc" });
            synth = new WebAudioTinySynth();
            // synth.src = window.URL.createObjectURL(blob);
            synth.loadMIDI(voc.data);
            synth.playMIDI();
            playing = true;
        } else {
            synth.stopMIDI();
            playing = false;
        }

    }

    let e = <div>
        <div>
            {getDownloadButon(voc.data, "audio/mid", voc.name)}
        </div>
        <div onclick={() => {
            play();
        }}>
            Play/Pause
        </div>;
    </div>


    return e;
}



/////////////////////////////////////////
//

export function renderMap(map: FileMap) {
    let dl = <div>
        {getDownloadButon(map.rawData, "audio/map", map.name)}
    </div>

    return <div className="mapheader">
        {dl}
        <canvas></canvas>
    </div>
}