/* eslint-disable @typescript-eslint/no-unused-vars */
import { invoke } from "@tauri-apps/api/tauri";

export default class installWorker {
         downloadUrl: string;
         appId: string;

         /**
          * Starts the downloader
          * @param {boolean} auto
          */
         constructor(
                  url: string,
                  appId: string
         ) {
                  this.downloadUrl = url;
                  this.appId = appId;
                  
         }
}