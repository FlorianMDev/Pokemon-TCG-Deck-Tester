import {GameState, PlayerBoard, PlayerDiscardPile, PlayerHand, Zone} from "../models/Board.js";

export class BoardTemplate {
	gameState!: GameState;
	constructor() {
	}
}

export class ZoneTemplate {
	zone: Zone;
	constructor(zone: Zone) {
		this.zone = zone;
	}
}