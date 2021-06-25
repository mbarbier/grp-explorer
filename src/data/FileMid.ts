import { FileBase } from "./FileBase";

export class FileMid extends FileBase {

    data: ArrayBuffer;

    read() {
        this.reader.offset = this.initialOffset;
        this.data = this.reader.readBytes(this.size);
    }
}