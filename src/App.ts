import { GrpProcessor } from "./data/GrpProcessor";
import { Content } from "./ui/Content";
import { Header } from "./ui/Header";
import { SideBar } from "./ui/SideBar";

export class App {

    header: Header;
    sideBar: SideBar;
    content: Content;

    private grpProcessor: GrpProcessor;

    constructor(root: HTMLElement) {

        root.classList.add("app");

        this.header = new Header(this);
        this.sideBar = new SideBar(this);
        this.content = new Content(this);

        root.appendChild(this.header.element);
        root.appendChild(this.sideBar.element);
        root.appendChild(this.content.element);
    }

    run() {
        let req = new XMLHttpRequest();
        let testFile = "assets/demo.grp";
        req.open("GET", testFile, true);
        req.responseType = "arraybuffer";
        req.onload = (e) => {
            console.log("received : " + testFile);
            var arraybuffer = req.response;
            this.onGrpLoaded(arraybuffer);

            // debug map
            this.loadExtraMap("assets/level1.map");
            this.loadExtraMap("assets/newboard.map");
            this.loadExtraMap("assets/newboard0.map");
        }
        req.send();
    }


    onGrpLoaded(grp: ArrayBuffer) {
        try {
            this.grpProcessor = new GrpProcessor();
            this.grpProcessor.read(grp);

            this.sideBar.refresh(this.grpProcessor);

        } catch (e) {
            this.content.showError(e);
        }
    }

    private loadExtraMap(path: string) {
        let mapFile = new XMLHttpRequest();
        mapFile.open("GET", path, true);
        mapFile.responseType = "arraybuffer";
        mapFile.onload = (e) => {
            this.onAdditonalMapLoaded(mapFile.response, path);
        }
        mapFile.send();
    }

    onAdditonalMapLoaded(grp: ArrayBuffer, name: string) {
        try {
            if (this.grpProcessor == null) {
                console.error("Inital GRP not loaded");
                return;
            }

            this.grpProcessor.addMap(grp, name);
            this.sideBar.refresh(this.grpProcessor);

        } catch (e) {
            this.content.showError(e);
        }
    }
}
