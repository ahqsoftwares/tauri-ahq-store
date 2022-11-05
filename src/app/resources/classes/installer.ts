export default class Installer {
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