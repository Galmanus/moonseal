import "./polyfill.mjs";               // must evaluate before web3.js loads
import { verifyOnChain, checkLineOfSight, ACCOUNT_LEN, Keypair, Connection, PublicKey } from "./moonseal-onchain.mjs";
globalThis.MoonsealSolana = { verifyOnChain, checkLineOfSight, ACCOUNT_LEN, Keypair, Connection, PublicKey };
