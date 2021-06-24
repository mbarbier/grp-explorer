import { GrpProcessor } from "./data/GrpProcessor";
import { Content } from "./ui/Content";
import { Header } from "./ui/Header";
import { SideBar } from "./ui/SideBar";

export class App {

    header: Header;
    sideBar: SideBar;
    content: Content;

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
        var req = new XMLHttpRequest();
        let testFile = "assets/demo.grp";
        req.open("GET", testFile, true);
        req.responseType = "arraybuffer";
        req.onload = (e) => {
            console.log("received : " + testFile);
            var arraybuffer = req.response;
            this.onGrpLoaded(arraybuffer);
        }
        req.send();
    }

    onGrpLoaded(grp: ArrayBuffer) {
        try {
            let processor = new GrpProcessor();
            processor.read(grp);

            this.sideBar.refresh(processor);

        } catch (e) {
            this.content.showError(e);
        }
    }
}
