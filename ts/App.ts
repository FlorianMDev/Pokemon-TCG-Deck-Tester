import {CardData, CardInDeck, RawCardData} from "./models/Card.js";
import {Api} from "./api/Api.js";
import {Config} from "./Config.js";
import {Game, FreeGame, SemiRuledGame} from "./Game.js";
import {Cardlist, Collection, CopiedDecklist, Deck, Decklist} from "./models/Deck.js";
import {CardTemplate} from "./templates/CardTemplate.js";
import { PageManager } from "./templates/PageManager.js";
import { FilterForm } from "./templates/FilterForm.js";
import { CardProperties } from "./CardProperties.js";
import { cardWithModal } from "./decorators/CardWithModal.js";
import { CardModal } from "./templates/CardModal.js";
import { StateManager } from "./templates/StateManager.js";
import { Modal } from "./templates/Modal.js";
import { CardWithDecklistBtn } from "./decorators/CardWithDecklistBtn.js";
import { CardListManager, DecklistManager } from "./templates/DecklistManager.js";
import { DeckBuilderManager } from "./templates/DeckBuilderManager.js";
import { CollectionManager } from "./templates/CollectionManager.js";

export class App {
	api: Api;
	cardList: RawCardData[] | CardData[];
	username: string;
	
	state: string;
	stateManager: StateManager;
	page: number;	
	apiTotalPages?: number;
	pageManagers: PageManager[];
	filters?: string;	
	filterForm?: FilterForm;
	deckBuilder?: DeckBuilderManager;
	cardProperties?: CardProperties;
	$cardTemplatesWrapper: HTMLDivElement;

	private _activeList?: Decklist | Collection;

	constructor() {		
		this.api = new Api(`${Config.ApiURI}`);
		this.cardList = [];
		this.username = "";

		this.state = "card-list";
		this.page = 1;
		this.pageManagers = [];
		this.$cardTemplatesWrapper = document.querySelector('section.cards-data')!;
		this.stateManager = new StateManager(this.state);
	}
	get activeList(): Decklist | Collection {
		return this._activeList!;
	}
	set activeList(deck: Decklist | Collection) {
		this._activeList = deck;
	}
		
	loadStateManager() {
		this.stateManager.createHTMLContent();
		/* this.createNewCardList(); */
		this.stateManager.$deckMenuBtn!.addEventListener('click', () => {
			this.createNewCardListMenu('decklist');
		})
		this.stateManager.$collectionMenuBtn!.addEventListener('click', () => {
			this.createNewCardListMenu('collection');
		})
		if (this.state !== 'card-list') {
			this.stateManager!.$defaultCardListBtn!.addEventListener('click', async () => {
				this.cardListMode();
			})
		}
	}
	createNewCardListMenu(type:string) {
		const list: string = type === 'decklist'? 'deck': type === 'collection' ? 'collection': '';
		let modal = null;
		if (type === 'decklist') modal = new DecklistManager();
		else modal = new CollectionManager();
		modal.render();
		modal.$modalWrapper.querySelector(`button#new-${list}-btn`)!.addEventListener('click', async () => {
			if (type === 'decklist') await this.newDeck();
			else if (type === 'collection') await this.newCollection();
		})
		modal.$modalWrapper.querySelectorAll(`.${type}`).forEach($deck => {
			$deck.addEventListener('click', async () => {
				const name: string = $deck.querySelector(`p.${type}-name`)!.textContent!;
				const deckJSON: string = localStorage.getItem(`${type}: ${name}`)!;

				if (type === 'decklist') {
					const storedDeck = JSON.parse(deckJSON) as Decklist;
					let deck: CopiedDecklist = new CopiedDecklist(storedDeck);
					console.log(deck.cards);
					await this.loadDeck(deck);
				} else if (type === 'collection') {
					const storedDeck = JSON.parse(deckJSON) as Collection;
					let collection: Collection = storedDeck;
					await this.loadCollection(collection);
				}
			})
		});
	}
	updateStateManager() {
		this.stateManager!.updateStateTo(this.state);
		this.loadStateManager();
	}
	async cardListMode() {
		if (this.state === 'deck-builder') {
			this.deckBuilder!.$wrapper.innerHTML='';
			this.deckBuilder!.$wrapper.classList.remove('visible');
		}
		this.state = 'card-list';
		this.updateStateManager();
		await this.updatePage();
	}

	async newCollection() {
		this.state = 'collection-manager';
		this.updateStateManager();
		this._activeList = new Collection();
		await this.updatePage();
	}
	async loadCollection(collection: Collection) {
		this.state = 'collection-manager';
		this.updateStateManager();
		this.activeList = collection;
		console.log(collection);
		await this.updatePage();
	}

	async newDeck() {
		this.state = 'deck-builder';
		this.updateStateManager();
		this.activeList = new Decklist();
		await this.loadDeckBuilder(this.activeList as Decklist);
	}
	async loadDeck(deck: Decklist) {
		this.state = 'deck-builder';
		this.updateStateManager();
		this.activeList = deck;
		console.log(deck);
		await this.loadDeckBuilder(this.activeList as Decklist);
		deck.cards.forEach((card: CardInDeck) => {
			const $supertypeDiv: HTMLElement = document.querySelector(`#deck-builder section.cards-data .sub-section.${card.supertype}`)!;
			let cardInDeckTemplate: CardTemplate = this.createCardTemplate(card,$supertypeDiv);
			cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeList as Decklist);
			this.addDeckCountListeners(card, cardInDeckTemplate);
		})
	}
	async loadDeckBuilder(deck: Decklist) {
		this.deckBuilder = new DeckBuilderManager(deck);
		this.deckBuilder.render();
		console.log('deck loaded');					
		await this.updatePage();
	}

	loadPageManagers() {
		this.pageManagers = [new PageManager(`p-m-up`), new PageManager(`p-m-bottom`)];
	}
	addPageManagerListeners() {
		this.pageManagers.forEach((pm: PageManager) => {
			let that:App = this;
			pm.$firstPageBtn.addEventListener('click', async function() {				
				if (that.page > 1) {
					that.page = 1;
					await that.updatePage();
				}
			})
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
			pm.$lastPageBtn.addEventListener('click', async function() {
				if (that.page < that.apiTotalPages! ) {
					that.page = that.apiTotalPages!;
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
		this.cardList = apiData.data;

		this.apiTotalPages = Math.ceil(apiData.totalCount / Config.displayedPerPage);

		this.pageManagers[0].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
		this.pageManagers[1].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
		console.log(this.cardList);
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
		const $cardListCardsData: HTMLElement = document.querySelector('.center-div section.cards-data')!;
		const $deckBuilderCardsData: HTMLElement | null = document.querySelector('#deck-builder section.cards-data');

		const AddToDecklistBtn: HTMLButtonElement = cardTemplate.$wrapper.querySelector('button.plus-1')!;
		AddToDecklistBtn.addEventListener(('click'), () => {
			if (this.activeList instanceof Decklist) {
				if (this.activeList.checkTotalNameCount(card) >= CardData.maxDeckCount(card)){
					return;
				}
			}
			
			let	existingCard: CardInDeck = this.activeList.cards.find(c => c.id === card.id)!;
			if(!existingCard) {
				$deckCounter.textContent = `1`;
				if (this.state === 'deck-builder') {
					let newCardInDeck = new CardInDeck(card, this.activeList as Decklist);
					this.activeList.addCardToList(newCardInDeck);
					const $supertypeDiv: HTMLElement = $deckBuilderCardsData!.querySelector(`.sub-section.${card.supertype}`)!;
					let cardInDeckTemplate: CardTemplate = this.createCardTemplate(newCardInDeck,$supertypeDiv);
					cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeList as Decklist);
					this.addDeckCountListeners(newCardInDeck, cardInDeckTemplate);
				} else if (this.state === 'collection-manager') {
					let newCardInCollection = new CardData(card, this.activeList as Collection);
					this.activeList.addCardToList(newCardInCollection);
				}
			} else {
				this.activeList.addCardToList(existingCard);
				$deckCounter.textContent = `${existingCard.count}`;
				if (card instanceof CardInDeck) {
					console.log('listener in deck');
					const $cardListData = $cardListCardsData.querySelector(`.card-template.${card.id}`);
					if (!!$cardListData) {
						console.log('card in list');						
						$cardListData.querySelector('.deck-counter')!.textContent = `${card.count}`;
					}
				} else if (this.state === 'deck-builder') {
					const $deckBuilderDeckCount: HTMLSpanElement = $deckBuilderCardsData!.querySelector(`.${card.id}`)!;
					$deckBuilderDeckCount.querySelector('.deck-counter')!.textContent = `${existingCard.count}`;
				}
			}
			if (this.state === 'deck-builder')this.deckBuilder!.addCardToCount(card);
		})
		const RemoveFromDecklistBtn: HTMLButtonElement = cardTemplate.$wrapper.querySelector('button.minus-1')!;
		RemoveFromDecklistBtn.addEventListener('click', () => {
			let cardInDeck: CardInDeck | void = undefined;
			if (card instanceof CardInDeck) {
				console.log('listener in deck');
				cardInDeck = card;
				const $cardListData = $cardListCardsData.querySelector(`.card-template.${card.id}`);
				if (cardInDeck.count === 1) {
					cardTemplate.$wrapper.remove();
				}
				this.activeList.removeCardFromList(cardInDeck!);
				console.log($cardListData);
				
				if (!!$cardListData)
					$cardListData.querySelector('.deck-counter')!.textContent = `${card.count}`;
			} else {
				cardInDeck = this.activeList.cards.find(c => c.id === card.id);
				if(!cardInDeck) return;
				
				this.activeList.removeCardFromList(cardInDeck!);
				if (this.state === 'deck-builder') {
					const $deckBuilderData: HTMLElement = $deckBuilderCardsData!.querySelector(`.card-template.${card.id}`)!;
					if (cardInDeck.count === 0) {
						$deckBuilderData.remove();
					}
					$deckBuilderData.querySelector('span.deck-counter')!.textContent = `${cardInDeck.count}`;
				}
			}
			console.log(cardInDeck);
			if (this.state === 'deck-builder')this.deckBuilder!.removeCardFromCount(card);
			if (!cardTemplate.$wrapper) return;
			$deckCounter.textContent = `${cardInDeck.count}`;
		})
	}
	displayCards() {
		this.$cardTemplatesWrapper.innerHTML = "";
		const $modalWrapper: HTMLDivElement = document.querySelector('.card-modal')!;
		if ( $modalWrapper.classList.contains('modal-on') ) Modal.closeModal($modalWrapper);

		this.cardList.forEach((card: RawCardData | CardData) => {
			let cardTemplate:CardTemplate = this.createCardTemplate(card, this.$cardTemplatesWrapper);
			if (this.state === 'deck-builder' || this.state === 'collection-manager') {
				cardTemplate = CardWithDecklistBtn(cardTemplate, this.activeList);
				this.addDeckCountListeners(card, cardTemplate);
			}
		})
	}


	async updatePage() {
		await this.loadCardData(this.filters?? "");
		this.displayCards();
		this.pageManagers.forEach((pm: PageManager) => {			
			pm.$pageSelectorInput.max = `${this.apiTotalPages!}`;
			pm.$pageSelectorInput.value = `${this.page}`;
		})
	}

	startGame(mode: string) {
		/* //Change here when deck and difficulty selections are available
		const CPUDeck: Decklist = new Decklist;
		let game = null;
		if (mode === "semi-ruled") game = new SemiRuledGame(this.activeList, CPUDeck, this.username);
		else game = new FreeGame(this.activeList, CPUDeck, this.username);

		game.play(); */
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


