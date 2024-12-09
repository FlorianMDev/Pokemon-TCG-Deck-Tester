import { Game } from "../Game.js";
import { Deck } from "./Deck.js";
import { PlayerHand, PlayerBoard, PlayerGraveyard } from "./Board.js";
export class Player {
    constructor(id, human, name, decklist, health) {
        this.id = id;
        this.human = human;
        this.name = name;
        this.health = health;
        this.defense = 0;
        this.mana = 0;
        this.active = false;
        this.deck = new Deck(decklist);
        this.hand = new PlayerHand;
        this.board = new PlayerBoard;
        this.graveyard = new PlayerGraveyard;
    }
    set opponent(player) {
        this._opponent = player;
    }
    updateHand() {
    }
    updateBoard() {
    }
    updateGraveyard() {
    }
    updateDeckCount() {
        const $deckCount = document.querySelector(`player-deck-count.player-${this.id}`);
        $deckCount.innerText = `cards in deck: ${this.deck.cards.length.toString()}`;
    }
    addListeners() {
        if (this.human && this.active) {
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
            Game.addCard(this.deck.cards[0], this.hand);
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
        if (this.mana >= card.cost) {
            this.board.zones.forEach((z) => {
                if (z.free) {
                    const zone = document.querySelector(`player-board.player-${this.id} zone-${z.id}`);
                    zone.addEventListener("click", (event) => {
                        Game.RemoveCard(card, this.hand);
                        this.hand.cards.filter((c) => c != card);
                        this.summonCard(card, z.id);
                    });
                }
            });
        }
    }
    putDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
        }
    }
}
