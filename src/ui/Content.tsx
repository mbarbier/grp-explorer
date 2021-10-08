import { useFileContext } from "../Contexts"
import { Art, B800, Con, Mid, Voc } from "./DataRenderer";
import { MapViewControls } from "./MapViewControls";

export function Content() {

    const { file } = useFileContext();

    if (file.name === "" || file.name === "-none-")
        return <div className="content">
            -- Select file
        </div>

    if (file.ext === "art") return <Art />
    if (file.ext === "bin") return <B800 />
    if (file.ext === "con") return <Con />
    if (file.ext === "mid") return <Mid />
    if (file.ext === "voc") return <Voc />
    if (file.ext === "map") return <MapViewControls />

    return <div className="content">
        {file.name}
    </div>
}


// import { App } from "../App";
// import { FileArt } from "../data/FileArt";
// import { FileB800 } from "../data/FileB800";
// import { FileBase } from "../data/FileBase";
// import { FileCon } from "../data/FileCon";
// import { FileMap } from "../data/FileMap";
// import { FileMid } from "../data/FileMid";
// import { FileVoc } from "../data/FileVoc";
// import { GrpProcessor } from "../data/GrpProcessor";
// import { MapRenderer } from "../maprenderer/MapRenderer";
// import { Component } from "./Component";
// import { renderArt, renderB800, renderMid, renderVoc } from "./DataRenderer";
// import { MapViewControls } from "./MapViewControls";

// export class Content extends Component<HTMLDivElement> {


//     private mapRenderer: MapRenderer;

//     constructor(public app: App) {
//         super();
//     }

//     build() {
//         return <div className="content">
//             -- Select file
//         </div>
//     }

//     showError(e: any) {
//         let msg = <div className="content">
//             <div className="error">
//                 {e.message}
//             </div>
//         </div>

//         this.replaceElement(msg);
//     }

//     display(file: FileBase, processor: GrpProcessor) {
//         if (this.mapRenderer != null) {
//             this.mapRenderer.destroy();
//             this.mapRenderer = null;
//         }

//         let title = <div className="title">
//             {file.name} [{file.size / 1000} kB]
//         </div>

//         let view: HTMLElement;
//         let filetype = "";
//         if (file instanceof FileCon) {
//             filetype = "con";
//             view = <code style="white-space: pre">{file.data}</code>
//         } else if (file instanceof FileB800) {
//             filetype = "b800";
//             view = renderB800(file);
//         } else if (file instanceof FileMid) {
//             filetype = "mid";
//             view = renderMid(file);
//         } else if (file instanceof FileVoc) {
//             filetype = "voc";
//             view = renderVoc(file);
//         } else if (file instanceof FileMap) {
//             filetype = "map";
//             file.loadFull();
//             this.mapRenderer = new MapRenderer();
//             let mapControls = new MapViewControls(file, this.mapRenderer, processor);
//             mapControls.render();
//             view = mapControls.element;
//             let e = <div className={"content " + filetype}>
//                 {view}
//             </div>
//             this.replaceElement(e);
//             mapControls.initialize();
//             return;

//         } else if (file instanceof FileArt) {
//             filetype = "art";
//             view = <div>
//                 {
//                     file.tiles.map((t, i) => {
//                         return renderArt(t, processor);
//                     })
//                 }
//             </div>
//         }
//         else {
//             filetype = "unknow";
//             view = <div>todo</div>
//         }


//         let e = <div className={"content " + filetype}>
//             {title}
//             {view}
//         </div>

//         this.replaceElement(e);

//         if (this.mapRenderer != null) {
//             this.mapRenderer.initialize(e, (file as FileMap).map, processor);
//         }
//     }

// }