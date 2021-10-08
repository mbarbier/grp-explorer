import { LoadingState, useLoadingContext } from "../Contexts";

export function DropZone() {

    const { loadingState, setLoadingState } = useLoadingContext()!;

    function stopEvent(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
    }

    function onDragEnter(e: React.DragEvent<HTMLElement>) {
        stopEvent(e);
        e.currentTarget.classList.add('highlight')
    }
    function onDragOver(e: React.DragEvent<HTMLElement>) {
        stopEvent(e);
        e.currentTarget.classList.add('highlight')
    }
    function onDragLeave(e: React.DragEvent<HTMLElement>) {
        stopEvent(e);
        e.currentTarget.classList.remove('highlight')
    }
    function onDragDrop(e: React.DragEvent<HTMLElement>) {
        stopEvent(e);
        e.currentTarget.classList.remove('highlight')

        let dt = e.dataTransfer
        let files = dt.files
        handleFiles(files)
    }

    function handleFiles(files: FileList) {
        setLoadingState(LoadingState.Loading);
        for (let i = 0; i < files.length; i++) {
            let file = files.item(i);
            console.log("received : " + file.name);
            file.arrayBuffer().then((b) => {
                //this.app.onGrpLoaded(b);
                setLoadingState(LoadingState.Loaded);
            });
            break;
        }
    }


    if (loadingState === LoadingState.Loading) {
        return <div className="dropzone" >Loading...</div>;
    } else {
        return <div className="dropzone drop-area" onDragEnter={(e) => onDragEnter(e)} onDragOver={(e) => onDragOver(e)} onDragLeave={(e) => onDragLeave(e)} onDrop={(e) => onDragDrop(e)}>
            <form>
                <p>Upload GRP file with the file dialog or by dragging and dropping onto the dashed region</p>
                <input type="file" id="fileElem" accept="*/*" onChange={(e) => handleFiles(e.target.files)} />
                <label className="button" htmlFor="fileElem">Select GRP</label>
            </form>
        </div>
    }
}