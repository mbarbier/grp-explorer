
import { PerspectiveCamera, Scene, Color, Fog, WebGLRenderer, HemisphereLight, DirectionalLight, Material, MeshLambertMaterial, BufferGeometry, Float32BufferAttribute, Mesh, DoubleSide, Vector3, BoxBufferGeometry, AmbientLight, MeshBasicMaterial, BufferAttribute, Shape, ShapeBufferGeometry, Object3D, TextureLoader, RepeatWrapping, LineSegments, LineBasicMaterial, AxesHelper } from 'three';
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

export class Map3dRenderer {

    private canvas: HTMLCanvasElement;
    private map: Map;
    private processor: GrpProcessor;

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

    initialize(canvas: HTMLCanvasElement, map: Map, processor: GrpProcessor, useTexture = false) {
        this.canvas = canvas;
        this.map = map;
        this.processor = processor;
        this.useTexture = useTexture;

        (window as any)._mapr = this;


        this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 1, 100000);
        this.camera.position.set(100, 200, 300);

        this.scene = new Scene();
        this.scene.background = new Color(0x151515);
        this.scene.add(this.root);

        // this.root.scale.multiplyScalar(0.1);
        this.root.updateMatrixWorld();

        // renderer
        this.renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(canvas.width, canvas.height);

        // controls
        this.orbitControls = new OrbitControls(this.camera, this.canvas);

        // lights
        const hemiLight = new AmbientLight(0xffffff, 0.7);
        this.root.add(hemiLight);

        const dirLight = new DirectionalLight(0xffffff, 1);
        dirLight.position.set(0.1, 1, 0.2);
        this.root.add(dirLight);

        let opacity = 0.8;
        this.defaultWallMaterial = new MeshLambertMaterial({ color: 0xfbff00, transparent: true, opacity: opacity });
        this.defaultFloorMaterial = new MeshLambertMaterial({ color: 0xfbff00, transparent: true, opacity: opacity });
        this.defaultCeilMaterial = new MeshLambertMaterial({ color: 0xfbff00, transparent: true, opacity: opacity });

        this.renderWalls();
        this.renderPlayer();

        // let axe = new AxesHelper(100);
        // this.scene.add(axe);
    }

    render(dt: number) {

        this.renderer.render(this.scene, this.camera);
    }

    resize(w: number, h: number) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }


    private renderWalls() {

        let rendererWall = new Array<boolean>(this.map.walls.length);
        for (let i = 0; i < this.map.walls.length; i++) rendererWall[i] = false;

        let sectorstart = 0;

        for (let j = sectorstart; j < this.map.sectors.length; j++) {

            let sector = this.map.sectors[j];
            let wallptr = sector.wallptr;
            for (let i = 0; i < sector.wallnum; i++) {
                let alreadyDone = rendererWall[wallptr];
                if (alreadyDone) continue;

                rendererWall[wallptr] = true;
                let wall = this.map.walls[wallptr];
                wallptr = wall.point2;
                let next = this.map.walls[wallptr];
                this.renderWall(sector, wall, next);
            }

            this.renderFloorAndCeiling(sector);
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
            this.scene.add(segments);
        }
    }

    private getWallMaterial(wall: Wall) {
        if (!this.useTexture) return this.defaultWallMaterial;

        let texture = this.processor.getTexture(wall.picnum);
        let tex = texture.getTexture(wall.xrepeat, wall.yrepeat);
        let material = new MeshBasicMaterial({ map: tex, transparent: true });
        return material;
    }
    private getCeilingMaterial(sector: Sector) {
        if (!this.useTexture) return this.defaultCeilMaterial;

        let texture = this.processor.getTexture(sector.ceilingpicnum);
        let tex = texture.getTexture(1, 1);
        let material = new MeshBasicMaterial({ map: tex, transparent: true });
        return material;
    }
    private getFloorMaterial(sector: Sector) {
        if (!this.useTexture) return this.defaultFloorMaterial;

        let texture = this.processor.getTexture(sector.floorpicnum);
        let tex = texture.getTexture(1, 1);
        let material = new MeshBasicMaterial({ map: tex, transparent: true });
        return material;
    }

    private renderWall(sector: Sector, wall: Wall, next: Wall) {
        let nextSector = wall.nextsector != -1 ? this.map.sectors[wall.nextsector] : null;

        if (nextSector == null) {
            let geometry = this.newWallPlane(wall.x, sector.floorz, wall.y, next.x, sector.ceilingz, next.y);
            let mesh = new Mesh(geometry, this.getWallMaterial(wall));
            this.root.add(mesh);
        } else {
            if (sector.floorz > nextSector.floorz) {
                let geometry = this.newWallPlane(wall.x, sector.floorz, wall.y, next.x, nextSector.floorz, next.y);
                let mesh = new Mesh(geometry, this.getWallMaterial(wall));
                this.root.add(mesh);
            }
            if (sector.ceilingz < nextSector.ceilingz) {
                let geometry = this.newWallPlane(wall.x, nextSector.ceilingz, wall.y, next.x, sector.ceilingz, next.y);
                let mesh = new Mesh(geometry, this.getWallMaterial(wall));
                this.root.add(mesh);
            }
        }

    }

    private renderPlayer() {
        let sector = this.map.sectors[this.map.currentSector];

        a.set(this.map.startX, sector.floorz + 1, this.map.startY);
        b.set(0, 0.5, -5);

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
        let positions = ceilGeometry.getAttribute("position");
        for (let i = 0; i < positions.count; i++) {
            let y = positions.getY(i);
            positions.setZ(i, y);
            positions.setY(i, 0);
        }


        let floor = new Mesh(ceilGeometry, this.getFloorMaterial(sector));
        floor.scale.y = -1;
        floor.position.y = sector.floorz;

        let ceiling = new Mesh(ceilGeometry, this.getCeilingMaterial(sector));
        ceiling.position.y = sector.ceilingz;

        this.root.add(floor);
        this.root.add(ceiling);
    }

    private newWallPlane(x: number, y: number, z: number, x2: number, y2: number, z2: number) {
        const geometry = new BufferGeometry();
        const indices: Array<number> = [];
        const vertices: Array<number> = [];
        const uvs: Array<number> = [];
        const normals: Array<number> = [];

        a.set(x, y, z);
        b.set(x, y2, z);
        c.set(x2, y2, z2);
        d.set(x2, y, z2);

        let dir1 = planey.copy(b).sub(a);
        let dir2 = planex.copy(d).sub(a);
        let normal = new Vector3().crossVectors(dir1, dir2).normalize();

        vertices.push(x, y, z);
        vertices.push(x, y2, z);
        vertices.push(x2, y2, z2);
        vertices.push(x2, y, z2);

        let dir1l = dir1.length();
        let dir2l = dir2.length();

        // uvs.push(0, 0);
        // uvs.push(0, 1);
        // uvs.push(1, 1);
        // uvs.push(1, 0);
        uvs.push(0, y);
        uvs.push(0, (y + dir1l));
        uvs.push(1, (y + dir1l));
        uvs.push(1, y);
        // uvs.push(0, 0);
        // uvs.push(0, dir1l);
        // uvs.push(dir2l, dir1l);
        // uvs.push(dir2l, 0);

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
}