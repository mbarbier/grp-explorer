import { App } from "../App";
import { Component } from "./Component";

export class DropZone extends Component<HTMLDivElement> {

    constructor(public app: App){
        super();
    }

    build() {
        return <div className="drop-area" ondragenter={(e: DragEvent) => this.onDragEnter(e)} ondragover={(e: DragEvent) => this.onDragOver(e)} ondragleave={(e: DragEvent) => this.onDragLeave(e)} ondrop={(e: DragEvent) => this.onDragDrop(e)}>
            <form>
                <p>Upload GRP file with the file dialog or by dragging and dropping onto the dashed region</p>
                <input type="file" id="fileElem" accept="*/*" onchange={(e: any) => this.handleFiles(e.target.files)} />
                <label className="button" for="fileElem">Select GRP</label>
            </form>
        </div>
    }

    private stopEvent(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    private onDragEnter(e: DragEvent) {
        this.stopEvent(e);
        this.element.classList.add('highlight')
    }
    private onDragOver(e: DragEvent) {
        this.stopEvent(e);
        this.element.classList.add('highlight')
    }
    private onDragLeave(e: DragEvent) {
        this.stopEvent(e);
        this.element.classList.remove('highlight')
    }
    private onDragDrop(e: DragEvent) {
        this.stopEvent(e);
        this.element.classList.remove('highlight')

        let dt = e.dataTransfer
        let files = dt.files
        this.handleFiles(files)
    }

    private handleFiles(files: FileList) {
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i);
            console.log("received : " + file.name);
            file.arrayBuffer().then((b) => {
                this.app.onGrpLoaded(b);
            });
            break;
        }
    }
}