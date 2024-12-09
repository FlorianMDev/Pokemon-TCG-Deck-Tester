import { Player } from "./models/Player.js";
import { Config } from "./Config.js";
export class Game {
    constructor(p1Deck, p2Deck, username) {
        this.$board = document.getElementById("board");
        this.players = [];
        this.p1 = new Player(1, username, p1Deck);
        this.players[0] = this.p1;
        this.p2 = new Player(2, "P2", p2Deck);
        this.players[1] = this.p2;
        this.p1.opponent = this.p2;
        this.p2.opponent = this.p1;
    }
    static moveCard(card, from, to) {
        to.cards.push(card);
        from.cards.filter((c) => c != card);
    }
}
export class FreeGame extends Game {
    constructor(p1Deck, p2Deck, username) {
        super(p1Deck, p2Deck, username);
    }
    play() {
    }
}
export class SemiRuledGame extends Game {
    constructor(p1Deck, p2Deck, username) {
        super(p1Deck, p2Deck, username);
        this.turn = 0.5;
        this.activePlayer = this.players[0];
    }
    newTurn(player) {
        player.startTurn();
        this.turn += 0.5;
        this.activePlayer = player;
    }
    endTurn() {
        this.activePlayer.active = false;
        this.newTurn(this.activePlayer.opponent);
    }
    startBattle(player) {
    }
    CPUTurn() {
    }
    play() {
        this.p1.deck.shuffle();
        this.p2.deck.shuffle();
        for (let i = 1; i <= Config.initialDraw; i++) {
            this.p1.draw();
            this.p2.draw();
        }
        const pick = true;
        if (this.p1.coinToss() === pick) // Change for variable (prompt?) when pvp
         {
            this.newTurn(this.p1.chooseFirstPlayer());
        }
        ;
    }
}
/* class Turn {
    player: Player;
    count: number;
    constructor(player: Player, count: number) {
        this.count = count;
        this.player = player;
        this.player.draw();
        this.player.active == true;
    }
    
} */
