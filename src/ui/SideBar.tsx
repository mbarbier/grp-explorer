import { App } from "../App";
import { FileBase } from "../data/FileBase";
import { GrpProcessor } from "../data/GrpProcessor";
import { Component } from "./Component";

export class SideBar extends Component<HTMLDivElement> {

    constructor(public app: App) {
        super();
    }

    build() {
        return <div className="sidebar">
            Loading files..
        </div>
    }

    refresh(processor: GrpProcessor) {
        let e: HTMLDivElement = <div className="sidebar">
            {this.getSection(processor, "art")}
            {this.getSection(processor, "bin")}
            {this.getSection(processor, "con")}
            {this.getSection(processor, "map")}
            {this.getSection(processor, "dat")}
            {this.getSection(processor, "mid")}
            {this.getSection(processor, "voc")}
        </div>

        let sections = e.getElementsByClassName("section");
        for (let i = 0; i < sections.length; i++) {
            this.addSectionToggler(sections.item(i) as HTMLElement);
        }

        this.replaceElement(e);
    }

    private getSection(processor: GrpProcessor, ext: string) {
        let files = processor.getFiles(ext);

        return <div className="section">
            <div className="sectionHeader">{ext} ({files.length})</div>
            <div className="open">
                {files.map((f, i) => {
                    return <div className="file" onclick={() => this.onFileSelected(f, processor)}>
                        {f.name}
                    </div>
                })}
            </div>
        </div>
    }

    private addSectionToggler(section: HTMLElement) {
        let header = section.children.item(0) as HTMLElement;
        header.addEventListener("click", (e) => {
            let child = section.children.item(1) as HTMLElement;
            if (child.classList.contains("open")) {
                child.classList.remove("open");
                child.classList.add("close");
            } else {
                child.classList.add("open");
                child.classList.remove("close");
            }
        });
    }

    private onFileSelected(file: FileBase, processor: GrpProcessor) {
        this.app.content.display(file, processor);
    }
}