let data: {
         [key: string]: string
} = {};

export function get(key: string) {
         return data[key] || undefined
}

export function set(key: string, value: string) {
         data[key] = value;
}

export function rm(key: string) {
         delete data[key];
}