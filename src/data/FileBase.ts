import { BufferReader } from "./BufferReader";

export class FileBase {

    constructor(protected reader: BufferReader, public name: string, public size: number, protected initialOffset: number) {
    }

    read() {
    }

}