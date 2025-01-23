import { key } from "../key.js";
const headers = new Headers();
headers.append("Authorization", `token ${key}`);
export class Config {
}
Config.ApiURI = "https://api.pokemontcg.io/v2";
Config.regulationMark = "(regulationMark:F OR regulationMark:G OR regulationMark:H)";
Config.headers = headers;
Config.maxDeckSize = 60;
Config.minDeckSize = Config.maxDeckSize;
Config.benchSize = 5;
Config.maxCardDeckCount = 4;
Config.initialDraw = 7;
Config.displayedPerPage = 20;
Config.maxHP = 400;
