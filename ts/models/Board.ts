import {Player} from "./Player.js";
import {Card} from "./Card.js";
import {Config} from "../Config.js";
import {ZoneTemplate} from "../templates/BoardTemplate.js";


export class GameState {
	player1Hand: PlayerHand;
	player2Hand: PlayerHand;	
	player1Board: PlayerBoard;
	player2Board: PlayerBoard;	
	player1DiscardPile: PlayerDiscardPile;
	player2DiscardPile: PlayerDiscardPile;
	constructor (player1: Player, player2: Player) {
		this.player1Hand = player1.hand;
		this.player2Hand = player2.hand;
		this.player1Board = player1.board;
		this.player2Board = player2.board;
		this.player1DiscardPile = player1.DiscardPile;
		this.player2DiscardPile = player2.DiscardPile;
	}
}
export class PlayerHand {
	cards: Card[];
	constructor() {
		this.cards = [];
	}
	
}

export class PlayerBoard {
	size: number;
	private _zones!: Zone[];
	constructor() {
		this.size = Config.benchSize;
	}
	get zones() {
		for (let i:number = 1; i <= this.size; i++) {
			this._zones.push(new Zone(i));
		}
		return this._zones;
	}
	get cards() {
		const cards: Card[] = [];
		for (let zone of this.zones) {
			if (zone.free === false) cards.push(zone.card!);
		}
		return cards;		
	}
	
}
export class Zone {
	id: number;
	free: boolean;
	card?: Card;
	constructor(id: number) {
		this.id = id;
		this.free = true;
	}
}

export class PlayerDiscardPile {
	cards: Card[];
	constructor() {
		this.cards = [];
	}
}

