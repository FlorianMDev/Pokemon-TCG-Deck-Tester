import {GameState, PlayerBoard, PlayerGraveyard, PlayerHand, Zone} from "../models/Board.js";

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