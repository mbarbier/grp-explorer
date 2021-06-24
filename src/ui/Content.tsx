import { App } from "../App";
import { FileB800 } from "../data/FileB800";
import { FileBase } from "../data/FileBase";
import { FileCon } from "../data/FileCon";
import { Component } from "./Component";
import { renderB800 } from "./DataRenderer";

export class Content extends Component<HTMLDivElement> {


    constructor(public app: App) {
        super();
    }

    build() {
        return <div className="content">
            -- Select file
        </div>
    }

    showError(e: any) {
        let msg = <div className="content">
            <div className="error">
                {e.message}
            </div>
        </div>

        this.replaceElement(msg);
    }

    display(file: FileBase) {
        let title = <div className="title">
            {file.name} [{file.size / 1000} kB]
        </div>

        let view: HTMLElement;
        if (file instanceof FileCon) {
            view = <code style="white-space: pre">{file.data}</code>
        } else if (file instanceof FileB800) {
            view = renderB800(file);
        }
        else {
            view = <div>todo</div>
        }


        let e = <div className="content">
            {title}
            {view}
        </div>

        this.replaceElement(e);
    }

}