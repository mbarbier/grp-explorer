import { App } from "../App";
import { FileArt } from "../data/FileArt";
import { FileB800 } from "../data/FileB800";
import { FileBase } from "../data/FileBase";
import { FileCon } from "../data/FileCon";
import { FileMap } from "../data/FileMap";
import { FileMid } from "../data/FileMid";
import { FileVoc } from "../data/FileVoc";
import { GrpProcessor } from "../data/GrpProcessor";
import { Component } from "./Component";
import { renderArt, renderB800, renderMap, renderMid, renderVoc } from "./DataRenderer";

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

    display(file: FileBase, processor: GrpProcessor) {
        let title = <div className="title">
            {file.name} [{file.size / 1000} kB]
        </div>

        let view: HTMLElement;
        if (file instanceof FileCon) {
            view = <code style="white-space: pre">{file.data}</code>
        } else if (file instanceof FileB800) {
            view = renderB800(file);
        } else if (file instanceof FileMid) {
            view = renderMid(file);
        } else if (file instanceof FileVoc) {
            view = renderVoc(file);
        } else if (file instanceof FileMap) {
            view = renderMap(file);
        } else if (file instanceof FileArt) {
            view = <div>
                {
                    file.tiles.map((t, i) => {
                        return renderArt(t, processor);
                    })
                }
            </div>
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