import { ApplicationData } from "../api/fetchApps";

interface Library {
  app_id: String,
  status: string,
  is_update: boolean,
  to: "Install" | "Uninstall",
  progress: number,
  app?: ApplicationData
}

class UpdateInstallerWorker {
  library: Library[]

  constructor() {
    this.library = [];
  }

  async init() {
    
  }
}

export type { Library }