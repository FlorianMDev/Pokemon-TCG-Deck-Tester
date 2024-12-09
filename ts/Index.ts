import {RawCardData} from "./models/Card.js";
import {CardsApi} from "./api/Api.js";
import {Config} from "./Config.js";
import {Game, FreeGame, SemiRuledGame} from "./Game.js";
import {Deck, Decklist} from "./models/Deck.js";

export class App {
	cardApi: CardsApi;
	cardList: RawCardData[];
	username: string;
	private _activeDeck: Decklist;
	
	constructor() {
		this.cardApi = new CardsApi(`${Config.ApiURI}/cards`);
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
		this.cardList = await this.cardApi.get(Config.displayedPerPage);
		//render card list:

		// Map raw data into CardData instances
		/* for (let i in cardsData) {
			this.cardList.push(new CardData(cardsData[i], +i + 1));
			
		} */
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
	/* saveCardData(){
		let savedCardList: string = JSON.stringify(this.cardList);
		localStorage.setItem("card-list", savedCardList);
	} */
	startGame(mode: string) {
		//Change here when deck and difficulty selections are available
		const CPUDeck: Decklist = new Decklist;
		let game = null;
		if (mode === "semi-ruled") game = new SemiRuledGame(this._activeDeck, CPUDeck, this.username);
		else game = new FreeGame(this._activeDeck, CPUDeck, this.username);
		
		
		
		game!.play();
	}
	async main(){
		await this.fetchCards();

		//Add condition later
		//this.startGame();
	}
}

const app = new App;
app.main();


