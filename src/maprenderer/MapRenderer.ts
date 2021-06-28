import { Map } from "../data/FileMap";
import { Map2dRenderer } from "./2d/Map2dRenderer";


export class MapRenderer {

    destroyed = false;

    root: HTMLElement;
    canvas: HTMLCanvasElement;
    resizeObserver: ResizeObserver;

    renderer2d: Map2dRenderer;

    private oldTime = 0;

    destroy() {
        this.destroyed = true;

        this.resizeObserver.unobserve(this.root)
    }

    initialize(content: HTMLElement, map: Map) {
        this.renderer2d = new Map2dRenderer();
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


        this.renderer2d.initialize(this.canvas, map);

        this.oldTime = now();
        this.render();
    }

    onresize() {
        let size = this.root.getBoundingClientRect();
        this.canvas.width = size.width * devicePixelRatio;
        this.canvas.height = size.height * devicePixelRatio;
        this.canvas.style.width = size.width + "px";
        this.canvas.style.height = size.height + "px";
    }

    render() {
        if (this.destroyed) return;

        requestAnimationFrame(() => this.render());

        let n = now();
        let ellapsed = n - this.oldTime;
        this.oldTime = n;

        this.renderer2d.render(ellapsed / 1000);
    }
}

function now() {
    return (typeof performance === 'undefined' ? Date : performance).now();
}