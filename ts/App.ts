import {CardData, CardInDeck, RawCardData} from "./models/Card.js";
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
import { CardWithDecklistBtn } from "./decorators/CardWithDecklistBtn.js";
import { DecklistManager } from "./templates/DecklistManager.js";
import { DeckBuilderManager } from "./templates/DeckBuilderManager.js";

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
	deckBuilder?: DeckBuilderManager;
	cardProperties?: CardProperties;
	$cardTemplatesWrapper: HTMLDivElement;

	private _activeDeck?: Decklist;

	constructor() {		
		this.api = new Api(`${Config.ApiURI}`);
		this.cardList = [];
		this.username = "";		

		this.state = "card-list";
		this.page = 1;
		this.pageManagers = [];
		this.$cardTemplatesWrapper = document.querySelector('section.cards-data')!;		
	}
	get activeDeck(): Decklist {
		return this._activeDeck!;
	}
	set activeDeck(deck: Decklist) {
		this._activeDeck = deck;
	}
	/* set deckMenu(state: boolean) {
		this._deckMenu = state;
	} */

	loadStateManager() {
		this.stateManager = new StateManager(this.state);
		this.stateManager.createHTMLContent();
		this.stateManager.$deckMenuBtn!.addEventListener('click', () => {
			const modal = new DecklistManager();
			modal.render();
			document.querySelector('button#new-deck-btn')!.addEventListener('click', async () => {
				await this.newDeck();
			})
		})	
		this.addStateManagerListeners();
	}
	addStateManagerListeners() {
		this.stateManager!.$displayBtns.forEach((btn:HTMLButtonElement) => {
			addEventListener('click', async () => {
				this.state = this.stateManager!.updateStateTo(btn.id);
				await this.updatePage();
			})
		});
	}
	async newDeck() {		
		this.state = 'deck-builder'
		this.activeDeck = new Decklist();
		this.deckBuilder = new DeckBuilderManager(this.activeDeck);
		this.deckBuilder.render();
		console.log('new Deck');					
		await this.updatePage();
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
				this.searchWithFilters();
			})
		})
    }
	searchWithFilters() {
		this.filters = this.filterForm!.getFilters();
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
		
		/* if (this.state === "deck-builder") {
			this.cardList = apiData.data.map((c: RawCardData) => {
				return new CardData(c, this.activeDeck!);
			})
		}
		else */ this.cardList = apiData.data;		
		this.apiTotalPages = Math.ceil( (apiData.totalCount+0.001) / Config.displayedPerPage);
		//+0.001 ensures result is at the very least 1 (page 0 makes no sense even with zero result)

		this.pageManagers[0].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
		this.pageManagers[1].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
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
		this.loadFilters();	
		this.filterForm!.cardProperties = this.cardProperties;
		this.filterForm!.initializeFilterFields();		
		this.addPageManagerListeners();
	}
	createCardTemplate (card: RawCardData | CardData | CardInDeck, $wrapper: HTMLElement): CardTemplate {
			let cardTemplate = new CardTemplate(card);
			const $cardTemplate: HTMLDivElement = cardTemplate.createHTMLCard();
			$wrapper.appendChild($cardTemplate);
			cardTemplate = cardWithModal(cardTemplate);
			return cardTemplate;
	}
	addDeckCountListeners(card: RawCardData | CardData, cardTemplate: CardTemplate) {
		const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;
		const $cardListCardData: HTMLElement = document.querySelector('.center-div section.cards-data')!;
		const $deckBuilderCardData: HTMLElement = document.querySelector('#deck-builder section.cards-data')!;

		const AddToDecklistBtn: HTMLButtonElement = cardTemplate.$wrapper.querySelector('button.plus-1')!;
		AddToDecklistBtn.addEventListener(('click'), () => {
			if (this.activeDeck.checkTotalNameCount(card) >= CardData.maxDeckCount(card)) return;
			
			let existingCard: CardInDeck = this.activeDeck.cards.find(c => c.id === card.id)!;
			if (!existingCard) {
				let newCardInDeck = new CardInDeck(card, this.activeDeck);
				this.activeDeck.addCardToList(newCardInDeck);
				$deckCounter.textContent = `1`;
				
				let cardInDeckTemplate: CardTemplate = this.createCardTemplate(newCardInDeck,$deckBuilderCardData);
				cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeDeck);
				this.addDeckCountListeners(newCardInDeck, cardInDeckTemplate);	
			} else /* if (existingCard.deckCount < CardData.maxDeckCount(card)) */ {
				this.activeDeck.addCardToList(existingCard);
				let $deckBuilderDeckCount: HTMLSpanElement = $deckBuilderCardData.querySelector(
					`.${card.id} span.deck-counter`)!;	
				$deckCounter.textContent = `${existingCard.deckCount}`;					
				$deckBuilderDeckCount.textContent = `${existingCard.deckCount}`;
			}					
		})
		const RemoveFromDecklistBtn: HTMLButtonElement = cardTemplate.$wrapper.querySelector('button.minus-1')!;
		RemoveFromDecklistBtn.addEventListener('click', () => {
			let cardInDeck: CardInDeck | void = undefined;
			if (card instanceof CardInDeck) {
				cardInDeck = card;
				if (cardInDeck.deckCount === 1) {
					this.activeDeck.removeCardFromList(cardInDeck!);
					cardTemplate.$wrapper.remove();
					return;
				}
				this.activeDeck.removeCardFromList(cardInDeck!);
			} else {
				cardInDeck = this.activeDeck.cards.find(c => c.id === card.id);
				if(!cardInDeck) return;

				const $deckBuilderWrapper: HTMLElement = $deckBuilderCardData.querySelector(`.card-template.${card.id}`)!;
				if (cardInDeck.deckCount === 1) {
					$deckBuilderWrapper.remove();
				}
				this.activeDeck.removeCardFromList(cardInDeck!);
				$deckBuilderWrapper.querySelector('span.deck-counter')!.textContent = `${cardInDeck.deckCount}`;
			}
			//Rest runs only if cardInDeck.deckCount > 1:
			console.log(cardInDeck);
			$deckCounter.textContent = `${cardInDeck.deckCount}`;
		})
	}
	displayCards() {
		this.$cardTemplatesWrapper.innerHTML = "";
		const $modalWrapper: HTMLDivElement = document.querySelector('.card-modal')!;
		if ( $modalWrapper.classList.contains('modal-on') ) Modal.closeModal($modalWrapper);

		this.cardList.forEach((card: RawCardData | CardData) => {
			let cardTemplate:CardTemplate = this.createCardTemplate(card, this.$cardTemplatesWrapper);
			if (this.state === 'deck-builder') {
				cardTemplate = CardWithDecklistBtn(cardTemplate, this.activeDeck);
				this.addDeckCountListeners(card, cardTemplate);
			}
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
		if (mode === "semi-ruled") game = new SemiRuledGame(this.activeDeck, CPUDeck, this.username);
		else game = new FreeGame(this.activeDeck, CPUDeck, this.username);

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


