export class BufferReader {

    offset: number = 0;
    view: DataView;

    constructor(private buffer: ArrayBuffer) {
        this.view = new DataView(buffer);
    }

    readString(length: number) {
        if (this.offset + length > this.view.byteLength) throw Error("not enough byte remaining");

        let s = "";
        for (let i = 0; i < length; i++) {
            let charCode = this.view.getUint8(this.offset + i);
            s += String.fromCharCode(charCode);
        }

        this.offset += length;
        return s;
    }

    readUint32LE() {
        let n = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return n;
    }
    readUint16LE() {
        let n = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return n;
    }

    readUint8() {
        let n = this.view.getUint8(this.offset);
        this.offset += 1;
        return n;
    }

    readBytes(length: number) {
        let subbuffer = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return subbuffer;
    }
}