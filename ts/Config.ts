export type cardCount = 1 | 2 | 3;

export class Config {
	static ApiURI:string = "https://api.pokemontcg.io/v2"; 
	static maxDeckSize = 60;
	static minDeckSize = Config.maxDeckSize;
	static benchSize: number = 5;
	static maxCardDeckCount: number = 4;
	static initialDraw: number = 7;
	static displayedPerPage: number = 50;
}