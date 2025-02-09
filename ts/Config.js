import { key } from "../key.js";
let headers = new Headers();
if (!!key) {
    headers.append("Authorization", `token ${key}`);
}
export class Config {
}
Config.ApiURI = "https://api.pokemontcg.io/v2";
Config.headers = headers;
Config.maxDeckSize = 60;
Config.minDeckSize = Config.maxDeckSize;
Config.benchSize = 5;
Config.maxCardDeckCount = 4;
Config.initialDraw = 7;
Config.displayedPerPage = 20;
Config.maxHP = 400;
