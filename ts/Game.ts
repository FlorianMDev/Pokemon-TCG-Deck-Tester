import {Card} from "./models/Card.js";
import {Deck, Decklist} from "./models/Deck.js";
import {Player} from "./models/Player.js";
import {PlayerHand, PlayerBoard, PlayerGraveyard} from "./models/Board.js";
import {Config} from "./Config.js";
import {App} from "./Index.js";

export class Game {
	$board: HTMLElement;
	mode: string;
	players: Player[];
	turn: number;
	activePlayer: Player;
	
	constructor() {
		this.$board = document.getElementById("board")!;
		this.mode = "PVE"; // Change with prompt when PVP introduced
		this.turn = 0.5;		
		this.players = [];
		this.activePlayer = this.players[0];
	}	

	static addCard(card: Card, to: PlayerHand | PlayerGraveyard | Deck) {
		to.cards.push(card);
	}
	static RemoveCard(card: Card, from: PlayerHand | PlayerGraveyard| Deck) {
		from.cards.filter((c: Card) => c != card);
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

	play(p1Deck: Decklist, p2Deck: Decklist, username: string, difficultyMod: number) {
		//if (this.mode === "PVE") {
		const p1 = new Player(1, true, username, p1Deck, Config.playerHealth);
		this.players[0] = p1;
		const p2 = new Player(2, false, "CPU", p2Deck, Config.playerHealth * difficultyMod); //Change later for real p2
		this.players[1] = p2;
		//}
		p1.opponent = p2;
		p2.opponent = p1;

		p1.deck.shuffle();
		p2.deck.shuffle();

		for (let i: number = 1; i <= Config.initialDraw; i++) {
			p1.draw();
			p2.draw();
		}
		const pick: boolean = true;
		if (p1.coinToss() === pick) // Change for variable (prompt?) when pvp
		{
			this.newTurn(p1.chooseFirstPlayer());
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

