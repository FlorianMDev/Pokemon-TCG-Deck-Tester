import {CardData, RawCardData} from "./models/Card.js";
import {Api} from "./api/Api.js";
import {Config} from "./Config.js";
import {Game, FreeGame, SemiRuledGame} from "./Game.js";
import {Deck, Decklist} from "./models/Deck.js";
import {CardTemplate} from "./templates/CardTemplate.js";
import { PageManager } from "./templates/PageManager.js";
import { FilterForm } from "./templates/FilterForm.js";
import { CardProperties } from "./CardProperties.js";
import { cardWithModal } from "./decorators/CardWithModal.js";
import { CardModal } from "./templates/CardModal.js";
import { StateManager } from "./templates/StateManager.js";
import { Modal } from "./templates/Modal.js";

export class App {
	api: Api;
	cardList: RawCardData[] | CardData[];
	username: string;
	
	state: string;
	stateManager?: StateManager;
	page: number;	
	apiTotalPages?: number;
	pageManagers: PageManager[];	
	filters?: string;	
	filterForm?: FilterForm;
	cardProperties?: CardProperties;
	$cardTemplatesWrapper: HTMLDivElement;

	private _activeDeck: Decklist;
	private _deckMenu: boolean;	

	constructor() {		
		this.api = new Api(`${Config.ApiURI}`);
		this.cardList = [];
		this.username = "";		

		this.state = "card-list";
		this.page = 1;
		this.pageManagers = [];
		this.$cardTemplatesWrapper = document.querySelector('section.cards-data')!;

		const activeDeck: string | null = localStorage.getItem("active-decklist");
		if (!!activeDeck) this._activeDeck = JSON.parse(activeDeck)
		else this._activeDeck =  new Decklist;
		this._deckMenu = false;
	}
	get activeDeck(): Decklist {
		return this._activeDeck;
	}
	set activeDeck(deck: Decklist) {
		this._activeDeck = deck;
	}
	/* set deckMenu(state: boolean) {
		this._deckMenu = state;
	} */
	

	loadStateManager() {
		this.stateManager = new StateManager(this.state);
		this.stateManager.initializeBtns();
		this.stateManager.$deckMenuBtn.addEventListener('click', () => {
			const that:App = this;
			document.querySelector('button#new-deck-btn')!
				.addEventListener('click', async function() {
					await that.updatePage();
				})
		})	
		this.addStateManagerListeners();
	}
	addStateManagerListeners() {
		this.stateManager!.$displayBtns.forEach((btn:HTMLButtonElement) => {
			addEventListener('click', (e: Event) => {
				this.state = this.stateManager!.updateStateTo(btn.id);
			})
		});
		
	}

	loadPageManagers() {
		this.pageManagers = [new PageManager(`p-m-up`), new PageManager(`p-m-bottom`)];
	}
	addPageManagerListeners() {
		this.pageManagers.forEach((pm: PageManager) => {
			let that:App = this;
			pm.$previousPageBtn.addEventListener('click', async function() {				
				if (that.page > 1) {
					that.page--;
					await that.updatePage();
				}
			})
			pm.$nextPageBtn.addEventListener('click', async function() {
				if (that.page < that.apiTotalPages! ) {
					that.page++;
					await that.updatePage();
				}
			})
			pm.$pageSelectorBtn.addEventListener('click', async function(event: Event) {
				event.preventDefault();
				const value: number = Number(pm.$pageSelectorInput.value);
				if (value < 1) that.page = 1;
				else if (value > that.apiTotalPages!) that.page = that.apiTotalPages!;
				else that.page = value;			
				await that.updatePage();				
			})
		})
	}

	loadFilters() {
		this.filterForm = new FilterForm();
		document.querySelectorAll('button.submit-filters')!.forEach( (btn: Element) => {
			btn.addEventListener('click', (event: Event) => {
				console.log('click submit filters');
				
				this.searchWithFilters();
			})
		})
    }
	searchWithFilters() {
		this.filters = this.filterForm!.getFilters();
		console.log(this.filters);
		this.page = 1;
		this.updatePage();	
	}

	async fetchCards(page: number, filters?: string) {
		return await this.api.getCards(Config.displayedPerPage, page, filters?? "");
		/* for (let i in cardsData) {
			this.cardList.push(new CardData(cardsData[i], +i + 1));			
		} */
	}	
	async loadCardData(filters?: string){
		const apiData = await this.fetchCards(this.page, this.filters?? "");
		
		if (this._deckMenu === true) {
			this.cardList = apiData.data.map((c: RawCardData) => {
				return new CardData(c);
			})
		}
		else {
			this.cardList = apiData.data;
		}
		console.log(this.cardList);		
		
		this.apiTotalPages = Math.ceil( (apiData.totalCount+0.001) / Config.displayedPerPage);
		//+0.001 ensures result is at the very least 1 (page 0 makes no sense even with zero result)

		this.pageManagers[0].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
		this.pageManagers[1].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;		

		/* let localStorageCardList: string | null = window.localStorage.getItem("card-list");
		if (localStorageCardList === null) {
			await this.fetchCards(this.page, filters?? "");
		} else {
			this.cardList = JSON.parse(localStorageCardList);
		}	 */		
	}	
	/* saveCardData(){
		let savedCardList: string = JSON.stringify(this.cardList);
		localStorage.setItem("card-list", savedCardList);
	} */
	async loadCardListPage() {
		await this.updatePage();
		const properties: string | null = localStorage.getItem("card-properties");
		if (!!properties) {
			this.cardProperties = JSON.parse(properties) as CardProperties;
		} else {
			this.cardProperties = new CardProperties(this.api);
			await this.cardProperties.loadProperties();
		}
		this.loadFilters();	
		this.filterForm!.cardProperties = this.cardProperties;
		this.filterForm!.initializeFilterFields();		
		this.addPageManagerListeners();
	}
	displayCards() {
		this.$cardTemplatesWrapper.innerHTML = "";

		const $modalWrapper: HTMLDivElement = document.querySelector('.card-modal')!;
		Modal.closeModal($modalWrapper);

		this.cardList.forEach((card: RawCardData | CardData) =>{
			let cardTemplate: CardTemplate = new CardTemplate(card);
			const $cardTemplate: HTMLDivElement = cardTemplate.createHTMLCard();			
			this.$cardTemplatesWrapper.appendChild($cardTemplate);
			cardTemplate = cardWithModal(cardTemplate);
		})
	}
	
	async updatePage() {
		await this.loadCardData(this.filters?? "");
		this.displayCards();
		this.pageManagers.forEach((pm: PageManager) => {			
			pm.$pageSelectorInput.max = `${this.apiTotalPages!}`;	
		})
	}

	startGame(mode: string) {
		//Change here when deck and difficulty selections are available
		const CPUDeck: Decklist = new Decklist;
		let game = null;
		if (mode === "semi-ruled") game = new SemiRuledGame(this._activeDeck, CPUDeck, this.username);
		else game = new FreeGame(this._activeDeck, CPUDeck, this.username);

		game.play();
	}
	async main(){
		this.loadStateManager();
		this.loadPageManagers();
		await this.loadCardListPage();
		

		//Add condition later
		//this.startGame();
	}
}

const app = new App;
app.main();


