import { Map } from "../../data/FileMap";

import { Box2, Vector2 } from "three";


export class Map2dRenderer {

    private canvas: HTMLCanvasElement;
    private map: Map;
    private context: CanvasRenderingContext2D;

    private bounds: Box2;

    private lineWidth = 1;
    private scale = 1;
    private position = new Vector2();

    initialize(canvas: HTMLCanvasElement, map: Map) {
        this.canvas = canvas;
        this.map = map;


        this.context = canvas.getContext("2d");


        let point = new Vector2();
        this.bounds = new Box2();
        this.map.walls.forEach(w => {
            point.set(w.x, w.y);
            this.bounds.expandByPoint(point);
        });

        let size = this.bounds.getSize(new Vector2());
        this.scale = 1000 / size.width;
        this.position.set(this.map.startX, this.map.startY);

        (window as any)._mapr = this;

        this.canvas.addEventListener("mousedown", (ev: MouseEvent) => this.onMouseDown(ev));
        this.canvas.addEventListener("mouseup", (ev: MouseEvent) => this.onMouseUp(ev));
        this.canvas.addEventListener("mousemove", (ev: MouseEvent) => this.onMouseMove(ev));
        this.canvas.addEventListener("wheel", (ev: WheelEvent) => this.onMouseWheel(ev));
    }

    render(dt: number) {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "#f2f6fc";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // center canvas
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);

        // move to position and apply zoom
        this.context.translate(-this.position.x * this.scale, -this.position.y * this.scale);
        this.context.scale(this.scale, this.scale);

        // this.context.setTransform(this.scale, 0, 0, this.scale, -this.position.x, -this.position.y);

        this.renderWalls();
        this.renderPlayer();



    }


    private renderWalls() {
        this.context.lineWidth = this.lineWidth / this.scale;
        this.context.strokeStyle = "#06005c";

        this.context.beginPath();
        for (let i = 0; i < this.map.walls.length; i++) {
            let wall = this.map.walls[i];
            let next = this.map.walls[wall.point2];
            this.context.moveTo(wall.x, wall.y);
            this.context.lineTo(next.x, next.y);
        }
        this.context.stroke();
    }

    private renderPlayer() {
        this.context.fillStyle = "#e800c1";
        this.context.beginPath();
        // this.context.arc(this.position.x, this.position.y, 500, 0, 2 * Math.PI);
        this.context.arc(this.map.startX, this.map.startY, 500, 0, 2 * Math.PI);
        this.context.fill();
    }

    private isDown = false;
    private mouseDownPosition = new Vector2();
    private worldDownPosition = new Vector2();

    private onMouseWheel(e: WheelEvent) {
        if (e.deltaY < 0) this.scale *= 1.2;
        else if (e.deltaY > 0) this.scale *= 0.8;
    }
    private onMouseDown(e: MouseEvent) {
        this.isDown = true;
        this.mouseDownPosition.set(e.x, e.y);
        this.worldDownPosition.copy(this.position);
    }
    private onMouseUp(e: MouseEvent) {
        this.isDown = false;
    }
    private onMouseMove(e: MouseEvent) {
        if (!this.isDown) return;

        let movex = e.x - this.mouseDownPosition.x;
        let movey = e.y - this.mouseDownPosition.y;

        this.position.copy(this.worldDownPosition);
        this.position.x -= movex / this.scale;
        this.position.y -= movey / this.scale;
    }
}