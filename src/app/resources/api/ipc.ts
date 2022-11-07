let listeners: Array<Function> = [];

export function listen(callback: Function) {
         listeners.push(callback);
         return listeners.length - 1;
}

export function unlisten(id: number) {
         listeners.splice(id, 1);
}

export function emit(payload: any) {
         listeners.forEach((fn, index) => fn(payload, index));
}