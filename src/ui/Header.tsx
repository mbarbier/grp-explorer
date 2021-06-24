import { App } from "../App";
import { Component } from "./Component";
import { DropZone } from "./DropZone";

export class Header extends Component<HTMLDivElement> {

    private dropzone: DropZone;

    constructor(public app: App) {
        super();

        this.dropzone = new DropZone(app);
    }

    build() {
        return <div className="header">
            {this.dropzone.element}
        </div>
    }

}