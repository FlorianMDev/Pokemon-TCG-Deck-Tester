import {key} from "../key.js";
export type cardCount = 1 | 2 | 3;

const headers: Headers = new Headers();
headers.append("Authorization", `token ${key}`);

export class Config {
	static ApiURI:string = "https://api.pokemontcg.io/v2";
	static regulationMark = "(regulationMark:F OR regulationMark:G OR regulationMark:H)";
	static legalities = "legalities.standard:Legal";
	static headers = headers;
	static maxDeckSize = 60;
	static minDeckSize = Config.maxDeckSize;
	static benchSize: number = 5;
	static maxCardDeckCount: number = 4;
	static initialDraw: number = 7;
	static displayedPerPage: number = 20;
	static maxHP = 400;
}