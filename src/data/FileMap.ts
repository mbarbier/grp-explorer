import { GLOBALSCALE } from "../Constants";
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
        if (v != 7) {
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

            sector.wallptr = r.readInt16LE();
            sector.wallnum = r.readInt16LE();
            sector.ceilingz = -(r.readInt32LE() >> 4) * this.globalScale; //Note: Z coordinates are all shifted up 4
            sector.floorz = -(r.readInt32LE() >> 4) * this.globalScale; //Note: Z coordinates are all shifted up 4
            sector.ceilingstat = r.readInt16LE();
            sector.floorstat = r.readInt16LE();
            sector.ceilingpicnum = r.readInt16LE();
            sector.ceilingheinum = r.readInt16LE();
            sector.ceilingshade = r.readInt8();
            sector.ceilingpal = r.readUint8();
            sector.ceilingxpanning = r.readUint8();
            sector.ceilingypanning = r.readUint8();
            sector.floorpicnum = r.readInt16LE();
            sector.floorheinum = r.readInt16LE();
            sector.floorshade = r.readInt8();
            sector.floorpal = r.readUint8();
            sector.floorxpanning = r.readUint8();
            sector.floorypanning = r.readUint8();
            sector.visibility = r.readUint8();
            sector.filler = r.readUint8();
            sector.lotag = r.readInt16LE();
            sector.hitag = r.readInt16LE();
            sector.extra = r.readInt16LE();
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