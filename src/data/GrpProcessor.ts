import { FileBase } from "./FileBase";
import { BufferReader } from "./BufferReader";
import { FileCon } from "./FileCon";
import { FileB800 } from "./FileB800";
import { FileDat } from "./FileDat";
import { FileArt } from "./FileArt";
import { FileVoc } from "./FileVoc";
import { FileMid } from "./FileMid";
import { FileMap } from "./FileMap";
import { Texture } from "../maprenderer/Texture";

export class GrpProcessor {

    files: Array<FileBase> = [];
    palette: FileDat;
    fileByName: Map<string, FileBase>;

    read(buffer: ArrayBuffer) {
        let length = buffer.byteLength;
        console.log("File length: " + length);

        let reader = new BufferReader(buffer);
        let sig = reader.readString(12);

        if (sig !== "KenSilverman") {
            throw new Error("Wrong grp signature. Found : " + sig);
        }

        this.fileByName = new Map();
        let fileCount = reader.readUint32LE();
        let offset = reader.offset;
        offset += 16 * fileCount;

        for (let f = 0; f < fileCount; f++) {
            let filename = reader.readString(12);
            let filesize = reader.readUint32LE();
            filename = filename.toLowerCase();

            let idx = filename.indexOf('.');
            let ext = filename.substr(idx + 1, 3);
            filename = filename.substr(0, idx + 4);

            let file: FileBase;
            if (ext === "con") {
                file = new FileCon(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext === "bin") {
                file = new FileB800(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext === "dat") {
                file = new FileDat(reader, filename, filesize, offset);
                this.files.push(file);
                if (filename === "palette.dat") {
                    this.palette = file as FileDat;
                }
            } else if (ext === "art") {
                file = new FileArt(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext === "voc") {
                file = new FileVoc(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext === "mid") {
                file = new FileMid(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext === "map") {
                file = new FileMap(reader, filename, filesize, offset);
                this.files.push(file);
            } else {
                file = new FileBase(reader, filename, filesize, offset);
                console.log(filename + ", " + filesize);
            }

            offset += filesize;
        }


        for (let f = 0; f < this.files.length; f++) {
            let file = this.files[f];
            file.read();
            this.fileByName.set(file.name, file);
        }

        let idx = 0;
        let arts = this.getFiles("art");
        for (let i = 0; i < arts.length; i++) {
            let tiles = (arts[i] as FileArt).tiles;
            for (let j = 0; j < tiles.length; j++) {
                let t = tiles[j];
                this.allTexture.push(new Texture(t, this.palette, idx));
                idx++;
            }
        }
    }

    addMap(buffer: ArrayBuffer, name: string) {
        let reader = new BufferReader(buffer);
        let file = new FileMap(reader, name, buffer.byteLength, 0);
        file.read();
        this.files.push(file);
        this.fileByName.set(file.name, file);
    }

    getFiles(extension: string): Array<FileBase> {
        let found: Array<FileBase> = [];
        this.files.forEach(f => {
            if (extension === "con" && f instanceof FileCon) {
                found.push(f);
            } else if (extension === "bin" && f instanceof FileB800) {
                found.push(f);
            } else if (extension === "dat" && f instanceof FileDat) {
                found.push(f);
            } else if (extension === "art" && f instanceof FileArt) {
                found.push(f);
            } else if (extension === "voc" && f instanceof FileVoc) {
                found.push(f);
            } else if (extension === "mid" && f instanceof FileMid) {
                found.push(f);
            } else if (extension === "map" && f instanceof FileMap) {
                found.push(f);
            }
        });
        return found;
    }

    getFile(name: string) {
        return this.fileByName.get(name);
    }


    private allTexture: Array<Texture> = [];

    getTexture(id: number) {
        if (id >= this.allTexture.length) {
            console.error("texture not found #" + id);
            return null;
        }
        return this.allTexture[id];
    }
}