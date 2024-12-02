import {RawCardDataType, CardData} from "./models/Card.js";
import {Api} from "./api/Api.js";
import {Game} from "./Game.js";
import {Deck, Decklist} from "./models/Deck.js";

export class App {
	cardApi: Api;
	cardList: CardData[];
	username: string;
	private _activeDeck: Decklist;	
	
	constructor() {
		this.cardApi = new Api("data/cards.json");
		this.cardList = [];
		this.username = "";
		const activeDeck: string | null = localStorage.getItem("active-decklist");
		if (!!activeDeck) this._activeDeck = JSON.parse(activeDeck)
		else this._activeDeck =  new Decklist;
	}
	get activeDeck(): Decklist {
		return this._activeDeck;
	}
	set activeDeck(deck: Decklist) {
		this._activeDeck = deck;
	}

	async fetchCards() {
		// Fetch raw data (as CardDataType[])
		const cardsData: RawCardDataType[] = await this.cardApi.get();
		// Map raw data into CardData instances
		for (let i in cardsData) {
			this.cardList.push(new CardData(cardsData[i], +i + 1));
			
		}
		console.log(this.cardList);		
	}	
	async loadCardData(){
		let localStorageCardList: string | null = window.localStorage.getItem("card-list");
		if (localStorageCardList === null) {
			await this.fetchCards();
		} else {
			this.cardList = JSON.parse(localStorageCardList);
		}		
	}
	saveCardData(){
		let savedCardList: string = JSON.stringify(this.cardList);
		localStorage.setItem("card-list", savedCardList);
	}
	startGame() {
		//Change here when deck and difficulty selections are available
		const game = new Game();
		const CPUDeck: Decklist = new Decklist;
		const difficultyMod: number = 1;
		game.play(this._activeDeck, CPUDeck, this.username, difficultyMod);
	}
	async main(){
		await this.loadCardData();

		//Add condition later
		this.startGame();
	}
}

const app = new App;
app.main();


