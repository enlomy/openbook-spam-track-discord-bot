import { Connection, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  RPC_URL1,
  WSS_URL1,
  RPC_URL2,
  WSS_URL2,
  RPC_URL3,
  WSS_URL3,
  WEB_HOOK_URL_2,
  WEB_HOOK_URL_5,
  WEB_HOOK_URL_10,
  WEB_HOOK_URL_15,
  WEB_HOOK_URL_20,
  WEB_HOOK_URL_25,
} = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !RPC_URL1 || !WSS_URL1 || !RPC_URL2 || !WSS_URL2 || !RPC_URL3 || !WSS_URL3 || !WEB_HOOK_URL_2 || !WEB_HOOK_URL_5 || !WEB_HOOK_URL_10 || !WEB_HOOK_URL_15 || !WEB_HOOK_URL_20 || !WEB_HOOK_URL_25) {
  throw new Error("Missing environment variables");
}

export const solanaConnection1 = new Connection(RPC_URL1, { wsEndpoint: WSS_URL1, commitment: "confirmed" });
export const solanaConnection2 = new Connection(RPC_URL2, { wsEndpoint: WSS_URL2, commitment: "confirmed" });
export const solanaConnection3 = new Connection(RPC_URL3, { wsEndpoint: WSS_URL3, commitment: "confirmed" });

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
};

export const METAPLEX = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export const webhookCounts = [0, 2, 5, 10, 15, 20, 25, Infinity]

export const webhook = [
  WEB_HOOK_URL_2,
  WEB_HOOK_URL_5,
  WEB_HOOK_URL_10,
  WEB_HOOK_URL_15,
  WEB_HOOK_URL_20,
  WEB_HOOK_URL_25,
]