import { WebSocketMessage, engageWs0, sendWsRequest } from "./handler";

interface Library {
  app_id: String,
  status: string,
  is_update: boolean,
  to: "Install" | "Uninstall",
  progress: number
}

type UpdateStatusReport = "Disabled" | "UpToDate" | "Checking" | "Updating";

class UpdateInstallerWorker {
  library: Library[]
  update: UpdateStatusReport
  onChange: { [key: number]: (lib: Library[]) => void }
  listId: number = 0

  constructor() {
    this.library = [];
    this.onChange = {};
    this.update = "Disabled";

    engageWs0((resp) => {
      if (resp.method == "Library") {
        console.log("WS0 ", resp);
        this.library = resp.data as Library[];
        Object.values(this.onChange).forEach((f) => f(this.library));
      } else if (resp.method == "UpdateStatus") {
        this.update = resp.data as UpdateStatusReport;
      }
    });
  }

  /**
   * Registers a callback function to be called whenever the library changes.
   * Returns a unique id that can be used to unregister the callback.
   */
  listen(fn: (lib: Library[]) => void) {
    // Increment the listId and assign it to the callback function
    this.listId++;
    this.onChange[this.listId] = fn;

    // Return the listId so that it can be used to unregister the callback
    return this.listId;
  }

  /**
   * Unregisters a callback function by its listId.
   * This function is used to remove a callback function that was previously registered
   * using the `listen` method.
   *
   * @param listId - The unique id of the callback function that was returned
   * when it was registered using the `listen` method.
   *
   * @returns This function does not return anything.
   */
  unlisten(listId: number) {
    // Delete the callback function from the onChange object using the provided listId
    // as the key. This removes the callback function from the list of functions to be
    // called when the library changes.
    delete this.onChange[listId];
  }

  /**
   * Initializes the library by sending a request to the server.
   * This function sends a request to the server to get the library.
   *
   * @returns This function does not return anything.
   */
  init() {
    return new Promise((r) => {
      // Send a request to the server to get the library
      sendWsRequest(WebSocketMessage.GetLibrary(), (_) => { });
      sendWsRequest(WebSocketMessage.UpdateStatus, (resp) => {
        if (resp.method == "UpdateStatus") {
          this.update = resp.data as UpdateStatusReport;
          r(undefined);
        }
      });
    });
  }

  runUpdate() {
    sendWsRequest(WebSocketMessage.RunUpdate, (_) => { });
  }
}

const worker = new UpdateInstallerWorker();

export type { Library, UpdateStatusReport }
export { worker }