import React, { PropsWithChildren } from "react";


export enum LoadingState {
    Init, Loading, Loaded
}

export type LoadingContextType = {
    loadingState: LoadingState;
    setLoadingState: (value: LoadingState) => void;
};

const LoadingContext = React.createContext<LoadingContextType>(undefined);
export const useLoadingContext = () => React.useContext(LoadingContext);
export const LoadingProvider = ({ children }: PropsWithChildren<any>) => {
    const [loadingState, setLoadingState] = React.useState(LoadingState.Init);
    return <LoadingContext.Provider value={{ loadingState, setLoadingState }}>
        {children}
    </LoadingContext.Provider>
}


export type FileContextType = {
    file: {
        name: string,
        ext: string
    }
    setFile: (file: { name: string, ext: string }) => void;
};

const FileContext = React.createContext<FileContextType>(undefined);
export const useFileContext = () => React.useContext(FileContext);
export const FileProvider = ({ children }: PropsWithChildren<any>) => {
    const [file, setFile] = React.useState({ name: "-none-", ext: "" });
    return <FileContext.Provider value={{ file, setFile }}>
        {children}
    </FileContext.Provider>
}


