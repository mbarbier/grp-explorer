import { FileBase } from "./FileBase";
import { BufferReader } from "./BufferReader";
import { FileCon } from "./FileCon";
import { FileB800 } from "./FileB800";
import { FileDat } from "./FileDat";
import { FileArt } from "./FileArt";

export class GrpProcessor {

    files: Array<FileBase> = [];



    read(buffer: ArrayBuffer) {
        let length = buffer.byteLength;
        console.log("File length: " + length);

        let reader = new BufferReader(buffer);
        let sig = reader.readString(12);

        if (sig != "KenSilverman") {
            throw new Error("Wrong grp signature. Found : " + sig);
        }

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
            if (ext == "con") {
                file = new FileCon(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext == "bin") {
                file = new FileB800(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext == "dat") {
                file = new FileDat(reader, filename, filesize, offset);
                this.files.push(file);
            } else if (ext == "art") {
                file = new FileArt(reader, filename, filesize, offset);
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
        }
    }

    getFiles(extension: string): Array<FileBase> {
        let found: Array<FileBase> = [];
        this.files.forEach(f => {
            if (extension == "con" && f instanceof FileCon) {
                found.push(f);
            } else if (extension == "bin" && f instanceof FileB800) {
                found.push(f);
            } else if (extension == "dat" && f instanceof FileDat) {
                found.push(f);
            } else if (extension == "art" && f instanceof FileArt) {
                found.push(f);
            }
        });
        return found;
    }

}