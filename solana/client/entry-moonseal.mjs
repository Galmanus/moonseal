import "./polyfill.mjs";               // must evaluate before web3.js loads
import { verifyOnChain, ACCOUNT_LEN, Keypair, Connection, PublicKey } from "./moonseal-onchain.mjs";
globalThis.MoonsealSolana = { verifyOnChain, ACCOUNT_LEN, Keypair, Connection, PublicKey };
