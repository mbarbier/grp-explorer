import { useContext, useEffect, useRef } from "react";
import { useFileContext } from "../Contexts";
import { FileArt } from "../data/FileArt";
import { FileB800 } from "../data/FileB800";
import { FileCon } from "../data/FileCon";
import { FileMid } from "../data/FileMid";
import { FileVoc } from "../data/FileVoc";
import { Tile } from "../data/Types";
import { getGrpProcessor } from "../Services";
import WebAudioTinySynth from "webaudio-tinysynth";

type RenderTileProps = {
    tile: Tile,
}
function RenderTile({ tile }: RenderTileProps) {

    const canvasRef = useRef(null)

    useEffect(() => {

        if (!tile.valid) return;

        let processor = getGrpProcessor();
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
        let canvas = canvasRef.current;
        canvas.width = tile.x;
        canvas.height = tile.y;
        let ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
    });

    if (!tile.valid) {
        return <div></div>
    }

    return <div><canvas className="tile" ref={canvasRef} /></div>
}

export function Art() {
    let { file } = useFileContext();
    let processor = getGrpProcessor();
    let base = processor.getFile(file.name) as FileArt;


    return <div className="content">
        {base.tiles.map((v, idx) => {
            return <RenderTile key={idx} tile={v} />
        })}
    </div>
}


let b800color = ["#000000", "#0000AA", "#00AA00", "#00AAAA", "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
    "#555555", "#5555FF", "#55FF55", "#55FFFF", "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF"]

function getB800Element(idx: number, char: string, colorData: number) {
    let c = "#000000";
    let bc = "#FFFFFF";
    let color = colorData & 0x0F;
    let bgcolor = (colorData & 0xF0) >> 4;
    if (color < 16) c = b800color[color];
    if (bgcolor < 16) bc = b800color[bgcolor];
    return <span key={idx} style={{ "color": c, "backgroundColor": bc }}>{char}</span>
}

export function B800() {
    let { file } = useFileContext();
    let processor = getGrpProcessor();
    let base = processor.getFile(file.name) as FileB800;

    if (base.chars.length != 2000) {
        return <div>File is not 2000 char long</div>
    }

    let lines: Array<JSX.Element> = [];
    for (let r = 0; r < 25; r++) {
        let items: Array<JSX.Element> = [];
        for (let c = 0; c < 80; c++) {
            let idx = r * 80 + c;
            let char = base.chars[idx];
            let col = base.colors[idx];
            let e = getB800Element(idx, char, col);
            items.push(e);
        }
        let line = <div className="line">
            {items}
        </div>;
        lines.push(line)
    }

    return <div className="content">
        <div className="B800">
            {lines}
        </div>
    </div>
}

export function Con() {

    const style = {
        whiteSpace: 'pre'
    };

    let { file } = useFileContext();

    let processor = getGrpProcessor();
    let base = processor.getFile(file.name) as FileCon;

    return <div className="content" >
        <code style={{ whiteSpace: 'pre' }}>{base.data}</code>
    </div>
}


type DownloadButtonProps = {
    data: ArrayBuffer,
    type: string,
    name: string,
}
export function DownloadButton({ data, type, name }: DownloadButtonProps) {
    const elementRef = useRef<HTMLAnchorElement>();
    useEffect(() => {
        let blob = new Blob([data], { type: type });
        elementRef.current.href = window.URL.createObjectURL(blob);
        (elementRef.current as any).download = name;
    });
    return <a ref={elementRef}>
        Download
    </a>;
}

export function Voc() {
    let { file } = useFileContext();

    let processor = getGrpProcessor();
    let base = processor.getFile(file.name) as FileVoc;

    return <div className="content">
        <div>
            {base.name}
        </div>
        <DownloadButton type="audio/voc" name={base.name} data={base.data} />
    </div>
}

export function Mid() {
    let { file } = useFileContext();

    let processor = getGrpProcessor();
    let base = processor.getFile(file.name) as FileMid;

    let synth: any;
    let playing = false;

    function play() {
        if (!playing) {
            synth = new WebAudioTinySynth();
            synth.loadMIDI(base.data);
            synth.playMIDI();
            playing = true;
        } else {
            synth.stopMIDI();
            playing = false;
        }

    }

    return <div className="content">
        <div>
            {base.name}
        </div>
        <div>
            <DownloadButton type="audio/mid" name={base.name} data={base.data} />
        </div>
        <div onClick={() => {
            play();
        }}>
            Play/Pause
        </div>
    </div>
}

