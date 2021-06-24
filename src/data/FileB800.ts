import { FileBase } from "./FileBase";

export class FileB800 extends FileBase {

    chars: Array<string> = [];
    colors: Array<number> = [];

    read() {
        if (this.size != 4000) {
            console.log(this.name + " doesn't seems to be a valid b800 file.");
            return;
        }

        this.reader.offset = this.initialOffset;

        for (let r = 0; r < 25; r++) {
            for (let c = 0; c < 80; c++) {
                let char = this.reader.readString(1);
                let color = this.reader.readUint8();
                this.chars.push(char);
                this.colors.push(color);
            }
        }

    }

    print() {
        for (let r = 0; r < 25; r++) {
            let text = "";
            for (let c = 0; c < 80; c++) {
                let idx = r * 80 + c;
                let char = this.chars[idx];
                text += char;
            }
            console.log(text);
        }
    }
}