import {key} from "../key.js";

let headers: Headers = new Headers();
if (!!key) {
	headers.append("Authorization", `token ${key}`);
}

export class Config {
	static ApiURI:string = "https://api.pokemontcg.io/v2";
	
	static headers? = headers;
	static maxDeckSize = 60;
	static minDeckSize = Config.maxDeckSize;
	static benchSize: number = 5;
	static maxCardDeckCount: number = 4;
	static initialDraw: number = 7;
	static displayedPerPage: number = 20;
	static maxHP = 400;
}