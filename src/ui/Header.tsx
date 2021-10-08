import { LoadingState, useLoadingContext } from "../Contexts";
import { initGrpProcessor } from "../Services";
import { DropZone } from "./DropZone";

export function Header() {

    const { loadingState, setLoadingState } = useLoadingContext()!;

    function loadGrp() {
        if (loadingState === LoadingState.Loading) return;

        setLoadingState(LoadingState.Loading);

        fetch(process.env.PUBLIC_URL + "/grp/demo.grp").then((response) => {
            return response.arrayBuffer();
        }).then((buffer) => {
            console.log("demo grp loaded");
            initGrpProcessor(buffer);
        }).finally(() => {
            setLoadingState(LoadingState.Loaded);
        });
    }

    return <div className="header">
        <DropZone></DropZone>

        <div className="loadzone" onClick={() => loadGrp()}>
            <div>
                Or load the demo.grp by clicking here
            </div>
        </div>
    </div>
}
