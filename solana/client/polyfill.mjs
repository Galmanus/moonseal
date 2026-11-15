// node globals web3.js expects, for the browser bundle. imported first.
import { Buffer } from "buffer";
globalThis.Buffer = globalThis.Buffer || Buffer;
globalThis.global = globalThis;
globalThis.process = globalThis.process || { env: {}, version: "", nextTick: (cb) => setTimeout(cb, 0) };
