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

export class App {
	api: Api;
	cardList: RawCardData[] | CardData[];
	username: string;
	private _activeDeck: Decklist;
	page: number;
	apiTotalPages?: number;
	cardProperties?: CardProperties;

	private _deckMenu: boolean;

	filters?: string;	
	$cardTemplatesWrapper: HTMLDivElement;
	$pageManagers!: PageManager[];
	filterForm: FilterForm;

	constructor() {		
		this.api = new Api(`${Config.ApiURI}`);
		this.cardList = [];
		this.username = "";
		const activeDeck: string | null = localStorage.getItem("active-decklist");
		if (!!activeDeck) this._activeDeck = JSON.parse(activeDeck)
		else this._activeDeck =  new Decklist;
		this._deckMenu = false;

		this.$cardTemplatesWrapper = document.querySelector('section.cards-data')!;
		this.page = 1;
		this.$pageManagers = [new PageManager(`p-m-up`), new PageManager(`p-m-bottom`)];
		this.filterForm = new FilterForm();
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
	displayCards() {
		this.$cardTemplatesWrapper.innerHTML = "";

		const $modalWrapper: HTMLDivElement = document.querySelector('.card-modal')!;
		CardModal.closeModal($modalWrapper);

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
		this.$pageManagers.forEach((pm: PageManager) => {			
			pm.$pageSelectorInput.max = `${this.apiTotalPages!}`;
			console.log(pm);		
			console.log(pm.$pageSelectorInput);			
		})
	}
	
	

	async fetchCards(page: number, filters?: string) {
		return await this.api.getCards(Config.displayedPerPage, page, filters?? "");
		
		//render card list:

		// Map raw data into CardData instances
		/* for (let i in cardsData) {
			this.cardList.push(new CardData(cardsData[i], +i + 1));
			
		} */
		console.log(this.cardList);		
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

		this.$pageManagers[0].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
		this.$pageManagers[1].$pageCounter.innerHTML =
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

	addPageManagerListeners() {
		this.$pageManagers.forEach((pm: PageManager) => {
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
		document.querySelector('button.submit-filters')!
            .addEventListener('click', (event: Event) => {
				event.preventDefault;
				console.log('click');
				
				this.searchWithFilters();
			});
    }
	searchWithFilters() {
		this.filters = this.filterForm.getFilters();
		console.log(this.filters);
		this.page = 1;
		this.updatePage();	
	}
	async loadCardListPage() {
		await this.updatePage();
		const properties: string | null = localStorage.getItem("card-properties");
		if (!!properties) {
			this.cardProperties = JSON.parse(properties) as CardProperties;
		} else {
			this.cardProperties = new CardProperties(this.api);
			await this.cardProperties.loadProperties();
		}		
		this.filterForm.cardProperties = this.cardProperties;
		this.filterForm.initializeFilterFields();
		this.loadFilters();
		this.addPageManagerListeners();
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
		await this.loadCardListPage();
		this.loadFilters();	

		//Add condition later
		//this.startGame();
	}
}

const app = new App;
app.main();


