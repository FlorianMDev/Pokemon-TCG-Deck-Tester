import { Deck } from "./Deck.js";
import { PlayerHand, PlayerBoard, PlayerDiscardPile } from "./Board.js";
export class Player {
    constructor(id, name, decklist) {
        this.id = id;
        this.name = name;
        this.defense = 0;
        this.mana = 0;
        this.active = false;
        this.deck = new Deck(decklist);
        this.hand = new PlayerHand;
        this.board = new PlayerBoard;
        this.DiscardPile = new PlayerDiscardPile;
    }
    set opponent(player) {
        this._opponent = player;
    }
    updateHand() {
    }
    updateBoard() {
    }
    updateDiscardPile() {
    }
    updateDeckCount() {
        const $deckCount = document.querySelector(`player-deck-count.player-${this.id}`);
        $deckCount.innerText = `cards in deck: ${this.deck.cards.length.toString()}`;
    }
    addListeners() {
        if (this.active) {
        }
    }
    coinToss() {
        const rgn = Math.floor(Math.random() * 2);
        return rgn === 1;
    }
    chooseFirstPlayer() {
        return this; //Change later when prompt options are available
    }
    draw() {
        if (this.deck.cards.length > 0) {
            this.hand.cards.push(this.deck.cards[0]);
            this.deck.cards.splice(0, 1);
            this.updateDeckCount();
        }
    }
    startTurn() {
        this.draw();
        this.active = true;
    }
    summonCard(card, i) {
        this.board.zones[i].card = card;
        this.updateBoard();
    }
    summonFromHand(card) {
        this.board.zones.forEach((z) => {
            if (z.free) {
                const zone = document.querySelector(`player-board.player-${this.id} zone-${z.id}`);
                zone.addEventListener("click", () => {
                    this.hand.cards.filter((c) => c != card);
                    this.summonCard(card, z.id);
                });
            }
        });
    }
}
