import "./polyfill.mjs";               // must evaluate before web3.js loads
import { runDemo, PROGRAM_ID } from "./lunar-core.mjs";
import { Keypair, Connection, PublicKey } from "@solana/web3.js";

globalThis.LunarSolana = { runDemo, PROGRAM_ID, Keypair, Connection, PublicKey };
