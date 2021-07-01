import { Map } from "../data/FileMap";
import { GrpProcessor } from "../data/GrpProcessor";
import { Map2dRenderer } from "./2d/Map2dRenderer";
import { Map3dRenderer } from "./3d/Map3dRenderer";


export class MapRenderer {

    destroyed = false;

    root: HTMLElement;
    canvas: HTMLCanvasElement;
    resizeObserver: ResizeObserver;

    renderer2d: Map2dRenderer;
    renderer3d: Map3dRenderer;

    private oldTime = 0;

    destroy() {
        this.destroyed = true;

        this.resizeObserver.unobserve(this.root)
    }

    initialize(content: HTMLElement, map: Map, processor: GrpProcessor) {
        this.root = content;
        
        let canvass = content.getElementsByTagName("canvas");
        this.canvas = canvass.item(0);
        
        let size = content.getBoundingClientRect();
        this.canvas.style.width = size.width + "px";
        this.canvas.style.height = size.height + "px";
        
        this.resizeObserver = new ResizeObserver((entries) => {
            this.onresize();
        });
        
        this.resizeObserver.observe(this.root);
        
        // this.renderer2d = new Map2dRenderer();
        // this.renderer2d.initialize(this.canvas, map);
        
        this.renderer3d = new Map3dRenderer();
        this.renderer3d.initialize(this.canvas, map, processor);

        this.oldTime = now();
        this.render();
    }

    onresize() {
        let size = this.root.getBoundingClientRect();
        this.canvas.width = size.width * devicePixelRatio;
        this.canvas.height = size.height * devicePixelRatio;
        this.canvas.style.width = size.width + "px";
        this.canvas.style.height = size.height + "px";

        if (this.renderer3d != null) this.renderer3d.resize(size.width, size.height);
    }

    render() {
        if (this.destroyed) return;

        requestAnimationFrame(() => this.render());

        let n = now();
        let ellapsed = n - this.oldTime;
        this.oldTime = n;

        if (this.renderer2d != null) this.renderer2d.render(ellapsed / 1000);
        if (this.renderer3d != null) this.renderer3d.render(ellapsed / 1000);
    }
}

function now() {
    return (typeof performance === 'undefined' ? Date : performance).now();
}