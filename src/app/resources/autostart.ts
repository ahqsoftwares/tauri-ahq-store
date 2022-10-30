import { enable, disable, isEnabled } from 'tauri-plugin-autostart-api';

export async function isAutostartEnabled() {
         return await isEnabled();
}

export async function enableAutostart() {
         return await enable()
}

export async function disableAutoStart() {
         return await disable();
}