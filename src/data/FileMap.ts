import { GLOBALSCALE } from "../Constants";
import { Point2 } from "../maprenderer/2d/Map2dRenderer";
import { BufferReader } from "./BufferReader";
import { FileBase } from "./FileBase";

export class FileMap extends FileBase {

    rawData: ArrayBuffer;

    map: Map;
    globalScale = GLOBALSCALE;

    read() {
        this.reader.offset = this.initialOffset;
        this.rawData = this.reader.readBytes(this.size);
    }

    loadFull() {
        let r = new BufferReader(this.rawData)

        let v = r.readUint32LE(); // version
        if (v !== 7) {
            throw new Error("expecting map version to be 7");
        }

        this.map = new Map();
        this.map.startX = r.readInt32LE() * this.globalScale;
        this.map.startY = r.readInt32LE() * this.globalScale;
        this.map.startZ = -(r.readInt32LE() >> 4) * this.globalScale;
        this.map.startAngle = r.readInt16LE();
        this.map.currentSector = r.readInt16LE();


        let sectorCount = r.readUint16LE();
        for (let i = 0; i < sectorCount; i++) {
            let sector = new Sector();
            this.map.sectors.push(sector);

            sector.index = i;
            sector.wallptr = r.readInt16LE();
            sector.wallnum = r.readInt16LE();
            sector.ceilingz = -(r.readInt32LE() >> 4) * this.globalScale; //Note: Z coordinates are all shifted up 4
            sector.floorz = -(r.readInt32LE() >> 4) * this.globalScale; //Note: Z coordinates are all shifted up 4
            sector.ceilingstat = r.readInt16LE();
            sector.floorstat = r.readInt16LE();
            sector.ceilingpicnum = r.readInt16LE();
            sector.ceilingheinum = -r.readInt16LE();
            sector.ceilingshade = r.readInt8();
            sector.ceilingpal = r.readUint8();
            sector.ceilingxpanning = r.readUint8();
            sector.ceilingypanning = r.readUint8();
            sector.floorpicnum = r.readInt16LE();
            sector.floorheinum = -r.readInt16LE();
            sector.floorshade = r.readInt8();
            sector.floorpal = r.readUint8();
            sector.floorxpanning = r.readUint8();
            sector.floorypanning = r.readUint8();
            sector.visibility = r.readUint8();
            sector.filler = r.readUint8();
            sector.lotag = r.readInt16LE();
            sector.hitag = r.readInt16LE();
            sector.extra = r.readInt16LE();

            sector.fstat = new Secstat();
            sector.cstat = new Secstat();
            readType(sector.cstat, sector.ceilingstat);
            readType(sector.fstat, sector.floorstat);
        }

        let wallCount = r.readUint16LE();
        for (let i = 0; i < wallCount; i++) {
            let wall = new Wall();
            this.map.walls.push(wall);

            wall.x = r.readInt32LE() * this.globalScale;
            wall.y = r.readInt32LE() * this.globalScale;
            wall.point2 = r.readInt16LE();
            wall.nextwall = r.readInt16LE();
            wall.nextsector = r.readInt16LE();
            wall.cstat = r.readInt16LE();
            wall.picnum = r.readInt16LE();
            wall.overpicnum = r.readInt16LE();
            wall.shade = r.readInt8();
            wall.pal = r.readUint8();
            wall.xrepeat = r.readUint8();
            wall.yrepeat = r.readUint8();
            wall.xpanning = r.readUint8();
            wall.ypanning = r.readUint8();
            wall.lotag = r.readInt16LE();
            wall.hitag = r.readInt16LE();
            wall.extra = r.readInt16LE();

            wall.index = i;
            wall.stat = new Wstat();
            readType(wall.stat, wall.cstat);
        }

        let spriteCount = r.readUint16LE();
        for (let i = 0; i < spriteCount; i++) {
            let sprite = new Sprite();
            this.map.sprites.push(sprite);

            sprite.x = r.readInt32LE();
            sprite.y = r.readInt32LE();
            sprite.z = r.readInt32LE();
            sprite.cstat = r.readInt16LE();
            sprite.picnum = r.readInt16LE();
            sprite.shade = r.readInt8();
            sprite.pal = r.readUint8();
            sprite.clipdist = r.readUint8();
            sprite.filler = r.readUint8();
            sprite.xrepeat = r.readUint8();
            sprite.yrepeat = r.readUint8();
            sprite.xoffset = r.readInt8();
            sprite.yoffset = r.readInt8();
            sprite.sectnum = r.readInt16LE();
            sprite.statnum = r.readInt16LE();
            sprite.ang = r.readInt16LE();
            sprite.owner = r.readInt16LE();
            sprite.xvel = r.readInt16LE();
            sprite.yvel = r.readInt16LE();
            sprite.zvel = r.readInt16LE();
            sprite.lotag = r.readInt16LE();
            sprite.hitag = r.readInt16LE();
            sprite.extra = r.readInt16LE();
        }


        for (let j = 0; j < this.map.sectors.length; j++) {
            let sector = this.map.sectors[j];

            sector.z.push(sector.ceilingz);
            sector.z.push(sector.floorz);

            let wall0 = this.map.walls[sector.wallptr];
            let wall1 = this.map.walls[wall0.point2];

            for (let f = 0; f < 2; f++) {
                let slopped = (f === 0 ? sector.cstat.sloped : sector.fstat.sloped);
                let angle = (f === 0 ? sector.ceilingheinum : sector.floorheinum)
                if (slopped) {
                    angle /= 4096;
                    let fx = wall1.y - wall0.y;
                    let fy = wall0.x - wall1.x;
                    let f = fx * fx + fy * fy;
                    if (f > 0) {
                        f = 1 / Math.sqrt(f);
                        fx *= f;
                        fy *= f;
                        sector.grad.push(new Point2(fx * angle, fy * angle));
                    } else {
                        sector.grad.push(new Point2(0, 0));
                        break;
                    }
                } else {
                    sector.grad.push(new Point2(0, 0));
                }
            }
        }
    }
}

function readType(t: Wstat | Secstat, value: number) {
    let keys = Object.keys(t);
    for (let i = 0; i < keys.length; i++) {
        let v = (value >> i);
        v = v & 1;
        let key = keys[i];
        (t as any)[key] = (v === 0 ? false : true);
    }
}

export class Map {

    startX: number;
    startY: number;
    startZ: number;
    startAngle: number;

    currentSector: number;

    sectors: Array<Sector> = [];
    walls: Array<Wall> = [];
    sprites: Array<Sprite> = [];

}

export class Sector {
    wallptr: number;
    wallnum: number;
    ceilingz: number;
    floorz: number;
    ceilingstat: number;
    floorstat: number;
    ceilingpicnum: number;
    ceilingheinum: number;
    ceilingshade: number;
    ceilingpal: number;
    ceilingxpanning: number;
    ceilingypanning: number;
    floorpicnum: number;
    floorheinum: number;
    floorshade: number;
    floorpal: number;
    floorxpanning: number;
    floorypanning: number;
    visibility: number;
    filler: number;
    lotag: number;
    hitag: number;
    extra: number;

    cstat: Secstat;
    fstat: Secstat;
    index: number;

    walls: Array<Wall> = [];

    // o ceiling, 1 floor
    z: Array<number> = [];
    grad: Array<Point2> = [];
}

export class Secstat {
    paralaxing: boolean = false;
    sloped: boolean = false;
    swapxy: boolean = false;
    dblsmooshiness: boolean = false;
    xflip: boolean = false;
    yflip: boolean = false;
    alignTexToFirstWall: boolean = false;
}

export class Wall {
    x: number;
    y: number;
    point2: number;
    nextwall: number;
    nextsector: number;
    cstat: number;
    picnum: number;
    overpicnum: number;
    shade: number;
    pal: number;
    xrepeat: number;
    yrepeat: number;
    xpanning: number;
    ypanning: number;
    lotag: number;
    hitag: number;
    extra: number;

    index: number;
    stat: Wstat;
}

export class Wstat {
    blocking: boolean = false;
    bottomsOfInvisibleSwapped: boolean = false;
    alignPictureOnBottom: boolean = false;
    xflip: boolean = false;
    masking: boolean = false;
    oneWay: boolean = false;
    blockingWall2: boolean = false;
    transluscence: boolean = false;
    yflip: boolean = false;
    transluscenceReversing: boolean = false;
}

export class Sprite {
    x: number;
    y: number;
    z: number;
    cstat: number;
    picnum: number;
    shade: number;
    pal: number;
    clipdist: number;
    filler: number;
    xrepeat: number;
    yrepeat: number;
    xoffset: number;
    yoffset: number;
    sectnum: number;
    statnum: number;
    ang: number;
    owner: number;
    xvel: number;
    yvel: number;
    zvel: number;
    lotag: number;
    hitag: number;
    extra: number;
}