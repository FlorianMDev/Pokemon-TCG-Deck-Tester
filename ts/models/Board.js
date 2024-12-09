import { Config } from "../Config.js";
export class GameState {
    constructor(player1, player2) {
        this.player1Hand = player1.hand;
        this.player2Hand = player2.hand;
        this.player1Board = player1.board;
        this.player2Board = player2.board;
        this.player1DiscardPile = player1.DiscardPile;
        this.player2DiscardPile = player2.DiscardPile;
    }
}
export class PlayerHand {
    constructor() {
        this.cards = [];
    }
}
export class PlayerBoard {
    constructor() {
        this.size = Config.benchSize;
    }
    get zones() {
        for (let i = 1; i <= this.size; i++) {
            this._zones.push(new Zone(i));
        }
        return this._zones;
    }
    get cards() {
        const cards = [];
        for (let zone of this.zones) {
            if (zone.free === false)
                cards.push(zone.card);
        }
        return cards;
    }
}
export class Zone {
    constructor(id) {
        this.id = id;
        this.free = true;
    }
}
export class PlayerDiscardPile {
    constructor() {
        this.cards = [];
    }
}
