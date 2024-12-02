import { Config } from "../Config.js";
export class GameState {
    constructor(player1, player2) {
        this.player1Hand = player1.hand;
        this.player2Hand = player2.hand;
        this.player1Board = player1.board;
        this.player2Board = player2.board;
        this.player1Graveyard = player1.graveyard;
        this.player2Graveyard = player2.graveyard;
    }
}
export class PlayerHand {
    constructor() {
        this.cards = [];
    }
}
export class PlayerBoard {
    constructor() {
        this.cards = [];
        this.size = Config.boardSize;
        this.zones.length = this.size;
    }
    get zones() {
        for (let i = 1; i <= this.size; i++) {
            this._zones.push(new Zone(i));
        }
        return this._zones;
    }
}
export class Zone {
    constructor(id) {
        this.id = id;
        this.free = true;
    }
}
export class PlayerGraveyard {
    constructor() {
        this.cards = [];
    }
}
