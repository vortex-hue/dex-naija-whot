import { Buffer } from "buffer";

window.Buffer = window.Buffer || Buffer;
window.process = window.process || { env: {} };

console.log("🛠️ Polyfills loaded.");
