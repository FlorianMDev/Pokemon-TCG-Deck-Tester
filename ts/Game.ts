import {Card} from "./models/Card.js";
import {Deck, Decklist} from "./models/Deck.js";
import {Player} from "./models/Player.js";
import {PlayerHand, PlayerBoard, PlayerDiscardPile} from "./models/Board.js";
import {Config} from "./Config.js";
import {App} from "./App.js";

export class Game {
	$board: HTMLElement;
	players: Player[];
	p1: Player;
	p2: Player;
	constructor(p1Deck: Decklist, p2Deck: Decklist, username: string) {
		this.$board = document.getElementById("board")!;
		this.players = [];
		this.p1 = new Player(1, username, p1Deck);
		this.players[0] = this.p1;
		this.p2 = new Player(2, "P2", p2Deck);
		this.players[1] = this.p2;
		this.p1.opponent = this.p2;
		this.p2.opponent = this.p1;
	}
	static moveCard(card: Card, from: PlayerHand | PlayerDiscardPile | Deck, to: PlayerHand | PlayerDiscardPile | Deck) {
		to.cards.push(card);
		from.cards.filter((c: Card) => c != card);
	}
}

export class FreeGame extends Game {
	constructor(p1Deck: Decklist, p2Deck: Decklist, username: string) {
		super(p1Deck, p2Deck, username);
	}
	play() {
	}
}

export class SemiRuledGame extends Game {
	
	turn: number;
	activePlayer: Player;
	
	constructor(p1Deck: Decklist, p2Deck: Decklist, username: string) {
		super(p1Deck, p2Deck, username);
		this.turn = 0.5;
		this.activePlayer = this.players[0];
	}
	
	newTurn(player: Player) {
		player.startTurn();
		this.turn+= 0.5;
		this.activePlayer = player;
	}
	endTurn() {
		this.activePlayer.active = false;
		this.newTurn(this.activePlayer.opponent);
	}
	startBattle(player: Player) {

	}
	CPUTurn() {

	}
	

	play() {
		this.p1.deck.shuffle();
		this.p2.deck.shuffle();

		for (let i: number = 1; i <= Config.initialDraw; i++) {
			this.p1.draw();
			this.p2.draw();
		}
		const pick: boolean = true;
		if (this.p1.coinToss() === pick) // Change for variable (prompt?) when pvp
		{
			this.newTurn(this.p1.chooseFirstPlayer());
		};

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

