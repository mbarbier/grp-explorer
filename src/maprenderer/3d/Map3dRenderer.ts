
import { PerspectiveCamera, Scene, Color, Fog, WebGLRenderer, HemisphereLight, DirectionalLight, Material, MeshLambertMaterial, BufferGeometry, Float32BufferAttribute, Mesh, DoubleSide, Vector3, BoxBufferGeometry, AmbientLight, MeshBasicMaterial, BufferAttribute, Shape, ShapeBufferGeometry, Object3D, TextureLoader, RepeatWrapping, LineSegments, LineBasicMaterial, AxesHelper, Vector2, MathUtils } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLOBALSCALE } from '../../Constants';

import { Map, Sector, Wall } from "../../data/FileMap";
import { GrpProcessor } from '../../data/GrpProcessor';

let a = new Vector3();
let b = new Vector3();
let c = new Vector3();
let d = new Vector3();
let planey = new Vector3();
let planex = new Vector3();
let v0 = new Vector2();
let v1 = new Vector2();
let v2 = new Vector2();
let v3 = new Vector2();


export class Map3dRenderer {

    private camera: PerspectiveCamera;
    private scene: Scene;
    private renderer: WebGLRenderer;
    private useTexture = false;

    private defaultWallMaterial: Material;
    private defaultFloorMaterial: Material;
    private defaultCeilMaterial: Material;
    private orbitControls: OrbitControls;
    private root = new Object3D();

    private lines: Array<Vector3> = [];
    private initialized = false;

    private keydowns = {
        "left": false,
        "right": false,
        "up": false,
        "down": false,
    }

    constructor(private canvas: HTMLCanvasElement, private map: Map, private processor: GrpProcessor) {
    }

    initialize(useTexture = false) {

        this.useTexture = useTexture;

        if (!this.initialized) {
            this.initialized = true;

            this.camera = new PerspectiveCamera(45, this.canvas.width / this.canvas.height, 1, 100000);
            this.camera.position.set(100, 200, 300);

            this.scene = new Scene();
            this.scene.background = new Color(0x151515);
            this.scene.add(this.root);

            this.root.updateMatrixWorld();

            // renderer
            this.renderer = new WebGLRenderer({ antialias: true, canvas: this.canvas });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(this.canvas.width, this.canvas.height);

            // controls
            this.orbitControls = new OrbitControls(this.camera, this.canvas);

            // lights
            const hemiLight = new AmbientLight(0xffffff, 0.7);
            this.scene.add(hemiLight);

            const dirLight = new DirectionalLight(0xffffff, 1);
            dirLight.position.set(0.1, 1, 0.2);
            this.scene.add(dirLight);

            let opacity = 0.8;
            this.defaultWallMaterial = new MeshLambertMaterial({ color: 0xfbff00, transparent: true, opacity: opacity });
            this.defaultFloorMaterial = new MeshLambertMaterial({ color: 0xfbff00, transparent: true, opacity: opacity });
            this.defaultCeilMaterial = new MeshLambertMaterial({ color: 0xfbff00, transparent: true, opacity: opacity });

            document.addEventListener("keydown", (ev: KeyboardEvent) => this.onKeyDown(ev));
            document.addEventListener("keyup", (ev: KeyboardEvent) => this.onKeyUp(ev));

            this.renderPlayer();
            
        } else {

            // clear walls before rebuild
            this.lines = [];
            this.root.clear();

        }

        this.renderWalls();
    }

    render(dt: number) {

        let forward = 0;
        let side = 0;
        if (this.keydowns.up) forward = 1;
        if (this.keydowns.down) forward = -1;
        if (this.keydowns.left) side = 1;
        if (this.keydowns.right) side = -1;
        if (forward != 0) {
            let direction = this.camera.getWorldDirection(a);
            direction.multiplyScalar(forward * dt * 5);
            this.camera.position.add(direction);
            this.orbitControls.target.add(direction);
        }
        if (side != 0) {
            let d = this.camera.getWorldDirection(a);
            let up = b.set(0, 1, 0).transformDirection(this.camera.matrixWorld);
            let length = c.copy(this.orbitControls.target).sub(this.camera.position).length();
            d.applyAxisAngle(up, side * dt * 2);
            d.multiplyScalar(length);

            this.orbitControls.target.copy(this.camera.position).add(d);
            this.orbitControls.update();
        }

        this.renderer.render(this.scene, this.camera);
    }

    resize(w: number, h: number) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    switchTexturing() {
        this.initialize(!this.useTexture);
    }

    private renderWalls() {

        let sectorstart = 0;

        for (let j = sectorstart; j < this.map.sectors.length; j++) {

            let sector = this.map.sectors[j];

            for (let i = 0; i < sector.wallnum; i++) {
                let wall = this.map.walls[sector.wallptr + i];
                let next = this.map.walls[wall.point2];
                this.renderWall(sector, wall, next);
            }

            if (sector.floorz != sector.ceilingz) {
                this.renderFloorAndCeiling(sector);
            }
        }

        if (!this.useTexture) {
            // wireframe
            let vertices: Array<number> = [];
            this.lines.forEach(p => {
                vertices.push(p.x); vertices.push(p.y); vertices.push(p.z);
            });
            let wireGeometry = new BufferGeometry();
            wireGeometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
            let segments = new LineSegments(wireGeometry, new LineBasicMaterial({ color: 0x000000 }));
            this.root.add(segments);
        }
    }

    private getWallMaterial(wall: Wall) {
        if (!this.useTexture) return this.defaultWallMaterial;

        let texture = this.processor.getTexture(wall.picnum);
        let tex = texture.getTexture(wall.xrepeat, wall.yrepeat, wall.xpanning, wall.ypanning, wall.stat.xflip, wall.stat.yflip);

        let material = new MeshBasicMaterial({ map: tex, transparent: true });
        return material;
    }
    private getCeilingMaterial(sector: Sector) {
        if (!this.useTexture) return this.defaultCeilMaterial;

        let texture = this.processor.getTexture(sector.ceilingpicnum);
        let tex = texture.getTexture(16, 16, sector.ceilingxpanning, sector.ceilingypanning, sector.cstat.xflip, sector.cstat.yflip);
        let material = new MeshBasicMaterial({ map: tex, transparent: true });
        return material;
    }
    private getFloorMaterial(sector: Sector) {
        if (!this.useTexture) return this.defaultFloorMaterial;

        let texture = this.processor.getTexture(sector.floorpicnum);
        let tex = texture.getTexture(16, 16, sector.floorxpanning, sector.floorypanning, sector.fstat.xflip, sector.fstat.yflip);
        let material = new MeshBasicMaterial({ map: tex, transparent: true });
        return material;
    }

    private renderWall(sector: Sector, wall: Wall, next: Wall) {
        let nextSector = wall.nextsector != -1 ? this.map.sectors[wall.nextsector] : null;

        if (sector.floorz == sector.ceilingz) return;

        if (nextSector == null) {

            a.set(wall.x, this.getSlopeZ(sector, 1, wall.x, wall.y), wall.y);
            b.set(wall.x, this.getSlopeZ(sector, 0, wall.x, wall.y), wall.y);
            c.set(next.x, this.getSlopeZ(sector, 0, next.x, next.y), next.y);
            d.set(next.x, this.getSlopeZ(sector, 1, next.x, next.y), next.y);

            let geometry = this.newQuad(a, b, c, d);
            let mesh = new Mesh(geometry, this.getWallMaterial(wall));
            this.root.add(mesh);

        } else {
            if (sector.floorz < nextSector.floorz) {
                a.set(wall.x, this.getSlopeZ(sector, 1, wall.x, wall.y), wall.y);
                b.set(wall.x, this.getSlopeZ(nextSector, 1, wall.x, wall.y), wall.y);
                c.set(next.x, this.getSlopeZ(nextSector, 1, next.x, next.y), next.y);
                d.set(next.x, this.getSlopeZ(sector, 1, next.x, next.y), next.y);

                let geometry = this.newQuad(a, b, c, d);
                let mesh = new Mesh(geometry, this.getWallMaterial(wall));
                this.root.add(mesh);
            }
            if (sector.ceilingz > nextSector.ceilingz) {
                a.set(wall.x, this.getSlopeZ(nextSector, 0, wall.x, wall.y), wall.y);
                b.set(wall.x, this.getSlopeZ(sector, 0, wall.x, wall.y), wall.y);
                c.set(next.x, this.getSlopeZ(sector, 0, next.x, next.y), next.y);
                d.set(next.x, this.getSlopeZ(nextSector, 0, next.x, next.y), next.y);

                let geometry = this.newQuad(a, b, c, d);
                let mesh = new Mesh(geometry, this.getWallMaterial(wall));
                this.root.add(mesh);
            }
        }

    }

    private renderPlayer() {
        let sector = this.map.sectors[this.map.currentSector];

        a.set(this.map.startX, sector.floorz + 1, this.map.startY);

        let angle = 270 - 360 * MathUtils.inverseLerp(0, 2048, this.map.startAngle);
        b.set(0, 0, -5).applyAxisAngle(c.set(0, 1, 0), angle * MathUtils.DEG2RAD);

        this.camera.position.copy(a);
        this.orbitControls.target.copy(a).add(b);
        this.orbitControls.saveState();
        this.orbitControls.update();

        (window as any)._orbit = this.orbitControls;
    }

    private renderFloorAndCeiling(sector: Sector) {
        let wallptr = sector.wallptr;
        let shape = new Shape();
        let w0 = this.map.walls[wallptr];
        shape.moveTo(w0.x, w0.y);
        for (let i = 0; i < sector.wallnum; i++) {
            let wall = this.map.walls[wallptr];
            wallptr = wall.point2;
            let next = this.map.walls[wallptr];
            shape.lineTo(next.x, next.y);
        }

        let ceilGeometry = new ShapeBufferGeometry(shape);

        // align uv to first wall
        let uv = ceilGeometry.getAttribute("uv");
        let p0 = v0.set(uv.getX(0), uv.getY(0));
        let p1 = v1.set(uv.getX(1), uv.getY(1));
        let angle = -v2.copy(p1).sub(p0).normalize().angle();
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        for (let i = 0; i < uv.count; i++) {
            v3.set(uv.getX(i), uv.getY(i));
            v3.sub(p0);
            let newx = v3.x * cos - v3.y * sin;
            let newy = v3.x * sin + v3.y * cos;
            uv.setX(i, newx);
            uv.setY(i, newy);
        }

        let floorGeometry = ceilGeometry.clone();

        let cpositions = ceilGeometry.getAttribute("position");
        for (let i = 0; i < cpositions.count; i++) {
            let x = cpositions.getX(i);
            let y = cpositions.getY(i);
            let z = this.getSlopeZ(sector, 0, x, y)
            cpositions.setY(i, z);
            cpositions.setZ(i, y);
        }

        let fpositions = floorGeometry.getAttribute("position");
        for (let i = 0; i < fpositions.count; i++) {
            let x = fpositions.getX(i);
            let y = fpositions.getY(i);
            let z = this.getSlopeZ(sector, 1, x, y)
            fpositions.setY(i, z);
            fpositions.setZ(i, y);
        }
        let floorindex = floorGeometry.index;
        for (let i = 0; i < floorindex.count; i = i + 3) {
            let b = floorindex.getY(i);
            let c = floorindex.getZ(i);
            floorindex.setY(i, c);
            floorindex.setZ(i, b);
        }

        let floor = new Mesh(floorGeometry, this.getFloorMaterial(sector));
        let ceiling = new Mesh(ceilGeometry, this.getCeilingMaterial(sector));

        this.root.add(floor);
        this.root.add(ceiling);
    }


    private newQuad(a: Vector3, b: Vector3, c: Vector3, d: Vector3) {
        const geometry = new BufferGeometry();
        const indices: Array<number> = [];
        const vertices: Array<number> = [];
        const uvs: Array<number> = [];
        const normals: Array<number> = [];


        let dir1 = planey.copy(b).sub(a);
        let dir2 = planex.copy(d).sub(a);
        let normal = new Vector3().crossVectors(dir1, dir2).normalize();

        vertices.push(a.x, a.y, a.z);
        vertices.push(b.x, b.y, b.z);
        vertices.push(c.x, c.y, c.z);
        vertices.push(d.x, d.y, d.z);

        let dir1l = dir1.length();
        let dir1l2 = planey.copy(d).sub(c).length();

        uvs.push(0, 0);
        uvs.push(0, (0 + dir1l));
        uvs.push(1, (0 + dir1l2));
        uvs.push(1, 0);

        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);
        normals.push(normal.x, normal.y, normal.z);

        indices.push(0, 3, 1);
        indices.push(1, 3, 2);

        geometry.setIndex(indices);
        geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));


        if (!this.useTexture) {
            this.lines.push(a.clone()); this.lines.push(b.clone());
            this.lines.push(b.clone()); this.lines.push(c.clone());
            this.lines.push(c.clone()); this.lines.push(d.clone());
            this.lines.push(d.clone()); this.lines.push(a.clone());
        }

        return geometry;
    }

    private getSlopeZ(sector: Sector, floor: number, x: number, y: number) {
        let wall = this.map.walls[sector.wallptr];
        let v = (wall.x - x) * sector.grad[floor].x + (wall.y - y) * sector.grad[floor].y + sector.z[floor];
        return v;
    }

    private onKeyDown(e: KeyboardEvent) {
        if (e.key == "ArrowUp") this.keydowns.up = true;
        if (e.key == "ArrowDown") this.keydowns.down = true;
        if (e.key == "ArrowLeft") this.keydowns.left = true;
        if (e.key == "ArrowRight") this.keydowns.right = true;
    }

    private onKeyUp(e: KeyboardEvent) {
        if (e.key == "ArrowUp") this.keydowns.up = false;
        if (e.key == "ArrowDown") this.keydowns.down = false;
        if (e.key == "ArrowLeft") this.keydowns.left = false;
        if (e.key == "ArrowRight") this.keydowns.right = false;
    }
}