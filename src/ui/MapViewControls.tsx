import { useEffect, useLayoutEffect, useRef } from "react";
import { useFileContext } from "../Contexts";
import { FileMap } from "../data/FileMap";
import { FileMid } from "../data/FileMid";
import { MapRenderer } from "../maprenderer/MapRenderer";
import { getGrpProcessor } from "../Services";
import { DownloadButton } from "./DataRenderer";


export function MapViewControls() {

    let { file } = useFileContext();

    let processor = getGrpProcessor();
    let fileMap = processor.getFile(file.name) as FileMap;

    const rootRef = useRef<HTMLDivElement>()
    const link2d3d = useRef<HTMLDivElement>()
    const linkTexturing = useRef<HTMLDivElement>()
    let is2dActive = false;
    let isTextureActive = false;
    let mapRenderer: MapRenderer;

    function switch2d3d() {
        is2dActive = !is2dActive;
        let content = is2dActive ? "[3D view]" : "[2D view]";
        link2d3d.current.innerText = content;
        linkTexturing.current.style.display = (is2dActive ? "none" : "block");
        mapRenderer.switch2d3d();
    }

    function switchTexturing() {
        mapRenderer.switchTexturing();

        isTextureActive = !isTextureActive;
        let content = isTextureActive ? "[Disable texture]" : "[Enable texture]";
        linkTexturing.current.innerText = content;
    }


    useLayoutEffect(() => {
        console.log("LOAD  MAP");
        fileMap.loadFull();

        mapRenderer = new MapRenderer();
        mapRenderer.initialize(rootRef.current, fileMap.map, processor);

        return function cleanup() {
            console.log("CLEANUP MAP");
            mapRenderer.destroy();
        }
    });

    return <div ref={rootRef} className="content">
        <div className="map">
            <div className="mapheader" >
                <div className="title" >
                    {fileMap.name}[{fileMap.size / 1000} kB]
                </div>
                <div>
                    <DownloadButton type="file/map" name={fileMap.name} data={fileMap.rawData} />
                </div>
                <div ref={linkTexturing} className="texturing" onClick={() => switchTexturing()}>
                    [Enable texture]
                </div>
                <div ref={link2d3d} className="view2d3d" onClick={() => switch2d3d()}>
                    [2D view]
                </div>
            </div>
            <canvas id="c3d"></canvas>
            <canvas id="c2d"></canvas>
        </div>
    </div>
}

