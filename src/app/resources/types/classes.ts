type Event = "installing" | "downloading" | "downloadstat"
export type UpdateStatus = "none" | "checking" | "updating" | "updated";
export type InstallWorkerCallback = (event: Event, data: any) => void;

interface IDownloadAppDataExtended {
    id: string;
};

interface IDownloadAppDataStandart {
    version: string;
    download_url: string;
    exe: string;
    name: string;
}

export interface IDownloadAppData extends IDownloadAppDataExtended, IDownloadAppDataStandart {}
export interface IInstallAppData extends IDownloadAppDataStandart {}