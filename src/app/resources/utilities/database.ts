/**
 * Types
 */
import type { IApps } from "../types/utilities";

class ramDatabase {
  data: IApps = {};

  constructor() {
    this.data = {};
  }

  getData(key: string): undefined | string | number | Object {
    const data = this.data[key];

    if (!data) {
      return undefined;
    } else {
      return JSON.parse(data);
    }
  }

  setData(key: string, data: string | number | Object) {
    this.data[key] = JSON.stringify(data);
  }
}

const database = new ramDatabase();
export function getData(key: string) {
  return database.getData(key);
}

export function setData(key: string, value: string | number | Object) {
  return database.setData(key, value);
}
