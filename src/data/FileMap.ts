import { FileBase } from "./FileBase";

export class FileMap extends FileBase {

    data: string;

    read() {
        this.reader.offset = this.initialOffset;
        this.data = this.reader.readString(this.size);
    }
}