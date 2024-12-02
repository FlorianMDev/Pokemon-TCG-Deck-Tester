import {Game} from "../Game.js";
import {Deck, Decklist} from "./Deck.js";
import {Card} from "./Card.js";
import {PlayerHand, PlayerBoard, PlayerGraveyard, Zone} from "./Board.js";
import {ZoneTemplate} from "../templates/BoardTemplate.js";

export class Player {
	id: number;
	name: string;
    health: number;
	defense: number;
	mana: number;
	active: boolean;
	human: boolean;
	private _opponent!: Player;
	
	deck: Deck;
	hand: PlayerHand;
	board: PlayerBoard;	
	graveyard: PlayerGraveyard;
	constructor(id: number, human: boolean, name: string, decklist: Decklist, health: number) {
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

	set opponent(player: Player) {
		this._opponent = player;
	}

	updateHand() {

	}

	updateBoard() {

	}
	updateGraveyard() {

	}
	updateDeckCount() {
		const $deckCount: HTMLElement = document.querySelector(`player-deck-count.player-${this.id}`)!;
		$deckCount!.innerText = `cards in deck: ${this.deck.cards.length.toString()}`;
	}

	addListeners() {
		if (this.human && this.active) {

		}
	}
	
	coinToss(): boolean {
		const rgn: number = Math.floor(Math.random()*2);
		return rgn === 1;
	}
	chooseFirstPlayer(): Player {
		return this //Change later when prompt options are available
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
	
	summonCard(card: Card, i: number) {
		this.board.zones[i].card = card;
		this.updateBoard();
	}
	summonFromHand(card: Card) {
		if (this.mana >= card.cost) {
			this.board.zones.forEach((z) => {
				if (z.free) {
					const zone = document.querySelector(`player-board.player-${this.id} zone-${z.id}`);
					zone!.addEventListener("click", (event: Event) => {
						Game.RemoveCard(card, this.hand);
						this.hand.cards.filter((c: Card) => c != card);
						this.summonCard(card, z.id);						
					})
				}				
			})			
		}
	}
	putDamage(damage: number) {
		this.health -= damage;
		if (this.health <= 0) {
		}
	}

	


	
}