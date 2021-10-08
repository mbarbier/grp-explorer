import { GrpProcessor } from "./data/GrpProcessor";


let grpProcessor: GrpProcessor;

export function initGrpProcessor(grp: ArrayBuffer) {
    grpProcessor = new GrpProcessor();
    grpProcessor.read(grp);
    return grpProcessor;
}

export function getGrpProcessor() {
    return grpProcessor;
}