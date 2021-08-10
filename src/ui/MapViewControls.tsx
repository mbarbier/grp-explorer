import { App } from "../App";
import { FileMap } from "../data/FileMap";
import { GrpProcessor } from "../data/GrpProcessor";
import { MapRenderer } from "../maprenderer/MapRenderer";
import { Component } from "./Component";
import { getDownloadButon } from "./DataRenderer";
import { RefObject } from "./TrueJsx";



export class MapViewControls extends Component<HTMLDivElement> {

    private link2d3d: RefObject<HTMLElement>;
    private linkTexturing: RefObject<HTMLElement>;
    private is2dActive = false;
    private isTextureActive = false;

    constructor(private fileMap: FileMap, private mapRenderer: MapRenderer, private processor: GrpProcessor) {
        super();

    }

    protected build(): HTMLDivElement {
        this.link2d3d = RefObject.new();
        this.linkTexturing = RefObject.new();

        return <div>
            <div className="mapheader" >
                <div className="title" >
                    {this.fileMap.name}[{this.fileMap.size / 1000} kB]
                </div>
                <div>
                    {getDownloadButon(this.fileMap.rawData, "file/map", this.fileMap.name)}
                </div>
                <div ref={this.linkTexturing} className="texturing" onclick={() => this.switchTexturing()}>
                    [Enable texture]
                </div>
                <div ref={this.link2d3d} className="view2d3d" onclick={() => this.switch2d3d()}>
                    [2D view]
                </div>
            </div>
            <canvas id="c3d"></canvas>
            <canvas id="c2d"></canvas>
        </div>
    }

    initialize() {
        this.mapRenderer.initialize(this.element.parentElement, this.fileMap.map, this.processor);
    }

    private switch2d3d() {
        this.is2dActive = !this.is2dActive;
        let content = this.is2dActive ? "[3D view]" : "[2D view]";
        this.link2d3d.get().innerText = content;

        this.mapRenderer.switch2d3d();

        this.linkTexturing.get().style.visibility = (this.is2dActive ? "hidden" : "visible");
    }

    private switchTexturing() {
        this.mapRenderer.switchTexturing();

        this.isTextureActive = !this.isTextureActive;
        let content = this.isTextureActive ? "[Disable texture]" : "[Enable texture]";
        this.linkTexturing.get().innerText = content;
    }

}

