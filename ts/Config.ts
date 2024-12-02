export type cardCount = 1 | 2 | 3;

export class Config {
	static maxDeckSize = 20;
	static minDeckSize = Config.maxDeckSize;
	static boardSize: number = 5;
	static playerHealth: number = 100;
	static maxMana: number = 10;
	static maxCardDeckCount: number = 3;
	static initialDraw: number = 4;
}