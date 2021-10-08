import { Map } from "../data/FileMap";
import { GrpProcessor } from "../data/GrpProcessor";
import { Map2dRenderer } from "./2d/Map2dRenderer";
import { Map3dRenderer } from "./3d/Map3dRenderer";


export class MapRenderer {

    destroyed = false;

    root: HTMLElement;
    canvas: Array<HTMLCanvasElement> = [];
    resizeObserver: ResizeObserver;

    renderer2d: Map2dRenderer;
    renderer3d: Map3dRenderer;

    private canvas2dActive = true;
    private oldTime = 0;

    destroy() {
        this.destroyed = true;

        this.resizeObserver.unobserve(this.root)
    }

    initialize(content: HTMLElement, map: Map, processor: GrpProcessor) {
        this.root = content;

        let canvass = content.getElementsByTagName("canvas");
        let canvas3d = canvass.item(0);
        let canvas2d = canvass.item(1);
        this.canvas.push(canvas3d);
        this.canvas.push(canvas2d);

        this.onresize();

        this.resizeObserver = new ResizeObserver((entries) => {
            this.onresize();
        });

        this.resizeObserver.observe(this.root);


        this.setCanvas2dVisible(false);
        this.renderer2d = new Map2dRenderer(canvas2d, map, processor);
        this.renderer3d = new Map3dRenderer(canvas3d, map, processor);
        this.renderer3d.initialize();


        this.oldTime = now();
        this.render();
    }

    onresize() {
        let size = this.root.getBoundingClientRect();
        this.resizeCanvas(this.canvas[0], size.width, size.height);
        this.resizeCanvas(this.canvas[1], size.width, size.height);

        if (this.renderer3d != null) this.renderer3d.resize(size.width, size.height);
    }

    private resizeCanvas(c: HTMLCanvasElement, width: number, height: number) {
        c.width = width * devicePixelRatio;
        c.height = height * devicePixelRatio;
        c.style.width = width + "px";
        c.style.height = height + "px";
    }

    render() {
        if (this.destroyed) return;

        requestAnimationFrame(() => this.render());

        let n = now();
        let ellapsed = n - this.oldTime;
        this.oldTime = n;

        if (this.renderer2d != null && this.canvas2dActive) this.renderer2d.render(ellapsed / 1000);
        if (this.renderer3d != null && !this.canvas2dActive) this.renderer3d.render(ellapsed / 1000);
    }

    setCanvas2dVisible(visible: boolean) {
        if (visible == this.canvas2dActive) return;

        this.canvas2dActive = visible;
        this.canvas[0].style.display = (visible ? "none" : "block");
        this.canvas[1].style.display = (visible ? "block" : "none");
    }

    switch2d3d() {
        if (this.canvas2dActive) {
            this.renderer3d.initialize();
        } else {
            this.renderer2d.initialize();
        }
        this.setCanvas2dVisible(!this.canvas2dActive);
    }

    switchTexturing() {
        if(this.renderer3d != null) this.renderer3d.switchTexturing();
    }
}

function now() {
    return (typeof performance === 'undefined' ? Date : performance).now();
}