import { useState } from "react";
import { LoadingState, useFileContext, useLoadingContext } from "../Contexts";
import { FileBase } from "../data/FileBase";
import { getGrpProcessor } from "../Services";


type SectionProps = {
    ext: string,
}
const Section = ({ ext }: SectionProps) => {

    const [isOpen, setIsOpen] = useState(false);
    const { setFile } = useFileContext();

    let processor = getGrpProcessor();
    let files = processor.getFiles(ext);

    function onFileSelected(file: FileBase) {
        setFile({
            name: file.name,
            ext: ext
        });
    }

    function toggle() {
        setIsOpen(!isOpen);
    }

    return <div className="section">
        <div className="sectionHeader" onClick={() => toggle()}>{ext} ({files.length})</div>
        <div className={isOpen ? "open" : "close"}>
            {files.map((f, i) => {
                return <div key={i} className="file" onClick={() => onFileSelected(f)}>
                    {f.name}
                </div>
            })}
        </div>
    </div>
}



export function Sidebar() {

    const { loadingState } = useLoadingContext()!;

    function renderEmpty() {
        return <div className="sidebar">
        </div>
    }
    function renderLoading() {
        return <div className="sidebar">
            Loading files..
        </div>
    }

    function renderLoaded() {
        console.log("RENDER LOADED");

        return <div className="sidebar">
            <Section ext="art" />
            <Section ext="bin" />
            <Section ext="con" />
            <Section ext="map" />
            <Section ext="dat" />
            <Section ext="mid" />
            <Section ext="voc" />
        </div>
    }

    if (loadingState === LoadingState.Loaded) {
        return renderLoaded();
    } else if (loadingState === LoadingState.Loading) {
        return renderLoading();
    } else {
        return renderEmpty();
    }
}
