import {CardData, CardInCollection, CardInDeck, RawCardData} from "./models/Card.js";
import {Api, ApiResult} from "./api/Api.js";
import {Config} from "./Config.js";
import {Game, FreeGame, SemiRuledGame} from "./Game.js";
import {Cardlist, Collection, CopiedCollection, CopiedDecklist, Deck, Decklist} from "./models/Deck.js";
import {CardTemplate} from "./templates/CardTemplate.js";
import { PageManager } from "./templates/PageManager.js";
import { FilterField, FilterForm } from "./templates/FilterForm.js";
import { CardProperties } from "./CardProperties.js";
import { cardWithModal } from "./decorators/CardWithModal.js";
import { StateManager } from "./templates/StateManager.js";
import { Modal } from "./templates/Modal.js";
import { CardWithDecklistBtn } from "./decorators/CardWithDecklistBtn.js";
import { DecklistManager } from "./templates/DecklistManager.js";
import { DeckBuilderManager } from "./templates/DeckBuilderManager.js";
import { CollectionManager } from "./templates/CollectionManager.js";
import { CollectionMenu } from "./templates/CollectionMenu.js";

export class App {
	api: Api;
	cardList: RawCardData[] | CardData[];
	username: string;

	state: string;
	stateManager: StateManager;

	page: number;	
	totalPages?: number;
	pageManagers: PageManager[];

	filterForm?: FilterForm;
	filters: string | null;
	orderBy: string;
	
	deckBuilder?: DeckBuilderManager;
	collectionMenu?: CollectionMenu;

	cardProperties?: CardProperties;
	$cardTemplatesWrapper: HTMLDivElement;

	private _activeList?: Decklist | Collection;
	cardListIsCollection: boolean;
	displayedCollection?: Collection;
	collectionCardList?: CardInCollection[];

	constructor() {		
		this.api = new Api(`${Config.ApiURI}`);
		this.cardList = [];
		this.username = "";

		this.state = "card-list";
		this.stateManager = new StateManager(this.state);

		this.page = 1;
		this.pageManagers = [];

		this.filters = null;
		this.orderBy = "set.releaseDate";

		this.$cardTemplatesWrapper = document.querySelector('section.cards-data')!;

		this.cardListIsCollection = false;
		this.collectionCardList = [];
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
				this.defaultCardListMode();
			})
		}
	}
	createNewCardListMenu(type:string) {
		if (this.cardListIsCollection) this.cardListIsCollection = false;
		
		const list: string = type === 'decklist'? 'deck': type === 'collection' ? 'collection': '';
		let modal = null;
		if (type === 'decklist') {
			modal = new DecklistManager();
			if (!!this.collectionMenu) this.collectionMenu.$wrapper.innerHTML='';
		}
		else /* if(type === 'collection') */ modal = new CollectionManager();
		modal.render();
		modal.$modalWrapper.querySelector(`button#new-${list}-btn`)!.addEventListener('click', async () => {
			if (type === 'decklist') await this.newDeck();
			else if (type === 'collection') await this.newCollection();
		})
		modal.$modalWrapper.querySelectorAll(`.${type}`).forEach($list => {
			$list.addEventListener('click', async () => {
				const name: string = $list.querySelector(`p.${type}-name`)!.textContent!;
				const listJSON: string = localStorage.getItem(`${type}: ${name}`)!;

				if (type === 'decklist') {
					const storedDeck = JSON.parse(listJSON) as Decklist;
					let deck: CopiedDecklist = new CopiedDecklist(storedDeck);
					console.log(deck.cards);
					await this.loadDeck(deck);
				} else if (type === 'collection') {
					const storedCollection = JSON.parse(listJSON) as Collection;
					let collection: CopiedCollection = new CopiedCollection(storedCollection);
					await this.loadCollection(collection);
				}
			})
		});
	}
	updateStateManager() {
		this.stateManager!.updateStateTo(this.state);
		this.loadStateManager();
		
		this.loadFilters();
	}
	async defaultCardListMode() {
		if (this.cardListIsCollection) this.cardListIsCollection = false;
		if (this.state === 'deck-builder') {
			this.deckBuilder!.$wrapper.innerHTML='';
			this.deckBuilder!.$wrapper.classList.remove('visible');
		}
		if (this.state === 'collection-manager') {
			this.collectionMenu!.$wrapper.innerHTML='';
		}
		this.state = 'card-list';
		this.updateStateManager();
		await this.updateCardList();
	}

	async newCollection() {
		this.activeList = new Collection();
		this.state = 'collection-manager';
		await this.updateCardList();
		this.loadCollectionMenu(this.activeList as Collection);
		this.updateStateManager();
	}
	async loadCollection(collection: Collection) {
		this.activeList = collection;
		console.log(collection);
		this.state = 'collection-manager';
		await this.updateCardList();
		this.loadCollectionMenu(collection);
		this.updateStateManager();
	}
	loadCollectionMenu(collection:Collection) {
		if (this.state === 'deck-builder') {
			this.deckBuilder!.$wrapper.innerHTML='';
			this.deckBuilder!.$wrapper.classList.remove('visible');
		}
		this.collectionMenu = new CollectionMenu(collection);
		this.collectionMenu.render();
		this.addDisplayCollectionBtnListener();
	}
	addDisplayCollectionBtnListener() {
		const $displayToggle: HTMLButtonElement = this.collectionMenu!.$wrapper!.querySelector('button.display-collection')!;
		$displayToggle.addEventListener('click', async (e: Event) => {
			
			console.log(this.activeList);
			if (!$displayToggle.classList.contains('displayed')) {
				this.loadDisplayedCollection();	
				console.log('activeList.cards: ' + this.activeList.cards);
				await this.searchWithFilters();
				$displayToggle.classList.toggle('displayed');
				$displayToggle.textContent = 'Display all cards';
			} else /* if ($displayToggle.classList.contains('displayed')) */ {
				this.cardListIsCollection = false;
				await this.searchWithFilters();
				const $collectionDisplay: HTMLElement = document.querySelector('.center-div h3')!;
				$collectionDisplay.outerHTML = '';
				$displayToggle.classList.toggle('displayed');
				$displayToggle.textContent = 'Display collection';
			}
		})
	}
	loadDisplayedCollection() {
				this.cardListIsCollection = true;
		if (this.activeList instanceof Collection) {
			console.log('activeList = ' + this.activeList);			
			this.displayedCollection = this.activeList;
		} else {//if in deck-builder mode with a collection loaded
			const select: HTMLSelectElement = this.filterForm!.$collectionLoader!.querySelector('.select-container select')!;
			const collectionJSON: string = localStorage.getItem(`collection: ${select.value}`)!;
			const storedCollection = JSON.parse(collectionJSON) as Collection;
			this.displayedCollection = new CopiedCollection(storedCollection);
		}
		const $centerDiv: HTMLElement = document.querySelector('.center-div')!;
		const $collectionDisplay: HTMLElement = document.createElement('h3');
		$collectionDisplay.innerHTML = `"${this.displayedCollection.name}" collection displayed`;
		const $cardListCardsData: HTMLElement = document.querySelector('.center-div section.cards-data')!;
		$centerDiv.insertBefore($collectionDisplay, $cardListCardsData);
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
		await this.updateCardList();
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
					await that.updateCardList();
				}
			})
			pm.$previousPageBtn.addEventListener('click', async function() {
				if (that.page > 1) {
					that.page--;
					await that.updateCardList();
				}
			})
			pm.$nextPageBtn.addEventListener('click', async function() {
				if (that.page < that.totalPages! ) {
					that.page++;
					await that.updateCardList();
				}
			})
			pm.$lastPageBtn.addEventListener('click', async function() {
				if (that.page < that.totalPages! ) {
					that.page = that.totalPages!;
					await that.updateCardList();
				}
			})

			pm.$pageSelectorBtn.addEventListener('click', async function(event: Event) {
				event.preventDefault();
				const value: number = Number(pm.$pageSelectorInput.value);
				if (value < 1) that.page = 1;
				else if (value > that.totalPages!) that.page = that.totalPages!;
				else that.page = value;
				await that.updateCardList();
			})
		})
	}

	loadFilters() {
		this.filters = '';
		if (!!this.filterForm) this.filterForm.$wrapper.innerHTML = '';
		this.filterForm = new FilterForm();
		
		this.filterForm!.cardProperties = this.cardProperties!;
		
		this.filterForm!.initializeFilterFields();
		document.querySelectorAll('button.submit-filters')!.forEach( (btn: Element) => {
			btn.addEventListener('click', (event: Event) => {				
				this.searchWithFilters();
			})
		})

		if (this.state === 'deck-builder') {
			const collectionListJSON: string | null = localStorage.getItem(`collection-list`);
			if (!!collectionListJSON) {
				this.filterForm.createCollectionLoader(JSON.parse(collectionListJSON));
				this.filterForm.$collectionLoader!.querySelector('button.display-collection')!
				.addEventListener('click', async () => {
					const select: HTMLSelectElement = this.filterForm!.$collectionLoader!.querySelector('.select-container select')!;
					if (select.value !== "none") {						
						this.loadDisplayedCollection();
					} else {
						this.cardListIsCollection = false;
						const $collectionDisplay: HTMLElement = document.querySelector('.center-div h3')!;
						$collectionDisplay.outerHTML = '';
					}
					await this.searchWithFilters();
				})
			}
		}
		
    }
	getFilters() {
		if (this.cardListIsCollection === false) {
			this.filters = this.filterForm!.getFilters();
			this.orderBy = this.filterForm!.sortCards();
		} else {
			this.collectionCardList = Array.from(this.displayedCollection!.cards);
			this.collectionCardList = this.filterForm!.getCollectionFilters(this.collectionCardList);
			this.filterForm!.sortCollectionCards(this.collectionCardList);
		}
	}
	async searchWithFilters() {
		this.getFilters();
		this.page = 1;
		await this.updateCardList();
	}

	async fetchCards(page: number, orderBy: string, filters?: string): Promise<ApiResult> {
		return await this.api.getCards(Config.displayedPerPage, page, orderBy, filters?? "");
		/* for (let i in cardsData) {
			this.cardList.push(new CardData(cardsData[i], +i + 1));
		} */
	}
	async loadCardData(filters?: string) {
		let count: number = 0;
		let totalCount: number = 0;
		if (this.cardListIsCollection === false) {
			const apiData = await this.fetchCards(this.page, this.orderBy, this.filters?? "");
			this.cardList = apiData.data;
			this.totalPages = Math.ceil(apiData.totalCount / Config.displayedPerPage);
			
			count = apiData.count;
			totalCount = apiData.totalCount;
		}
		else /* if collection is displayed */ {
			//Change page, doesn't load filters now
			this.cardList = this.collectionCardList!.slice(this.page*20-20, this.page*20);


			this.totalPages = Math.ceil(this.collectionCardList!.length / Config.displayedPerPage);			
			count = this.cardList.length < Config.displayedPerPage ? this.cardList.length: Config.displayedPerPage;
			totalCount = this.collectionCardList!.length;
		}
		this.pageManagers[0].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.totalPages > 1 ?this.totalPages: 1} (displaying ${count} cards out of ${totalCount})`;
		this.pageManagers[1].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.totalPages > 1 ?this.totalPages: 1} (displaying ${count} cards out of ${totalCount})`;
		console.log(this.cardList);
		this.pageManagers[0].$pageSelectorInput.max = `${this.totalPages!}`;
		this.pageManagers[1].$pageSelectorInput.value = `${this.page}`;
	}
	displayCollectionPage(collection: CardInCollection[]): CardInCollection[] {
		let collectionPage: CardInCollection[] = collection.slice(this.page*20-20, this.page*20)
		return collectionPage;
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
	async updateCardList() {
		await this.loadCardData(this.filters?? "");
		this.displayCards();
	}

	async loadCardListPage() {
		await this.updateCardList();
		const properties: string | null = localStorage.getItem("card-properties");
		if (!!properties) {
			this.cardProperties = JSON.parse(properties) as CardProperties;
		} else {
			this.cardProperties = new CardProperties(this.api);
			await this.cardProperties.loadProperties();
		}
		this.loadFilters();
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
			
			let	existingCard: CardData = this.activeList.cards.find(c => c.id === card.id)!;
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
					let newCard = new CardData(card, this.activeList as Collection);
					console.log(this.activeList);
					
					this.activeList.addCardToList(newCard);
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
			if (this.state === 'collection-manager')this.collectionMenu!.addCardToCount(card as CardInCollection);
		})
		const RemoveFromDecklistBtn: HTMLButtonElement = cardTemplate.$wrapper.querySelector('button.minus-1')!;
		RemoveFromDecklistBtn.addEventListener('click', () => {
			let cardInList: CardData | void = undefined;
			if (card instanceof CardInDeck) {
				console.log('listener in deck');
				cardInList = card;
				const $cardListData = $cardListCardsData.querySelector(`.card-template.${card.id}`);
				if (cardInList.count === 1) {
					cardTemplate.$wrapper.remove();
				}
				this.activeList.removeCardFromList(cardInList);
				console.log($cardListData);
				
				if (!!$cardListData)
					$cardListData.querySelector('.deck-counter')!.textContent = `${card.count}`;
			} else {
				cardInList = this.activeList.cards.find(c => c.id === card.id);
				if(!cardInList) return;				
				
				this.activeList.removeCardFromList(cardInList);
				if (this.state === 'deck-builder') {
					const $deckBuilderData: HTMLElement = $deckBuilderCardsData!.querySelector(`.card-template.${card.id}`)!;
					if (cardInList.count === 0) {
						$deckBuilderData.remove();
					}
					$deckBuilderData.querySelector('span.deck-counter')!.textContent = `${cardInList.count}`;
				}
				if (this.state === 'collection-manager') {
					this.collectionMenu!.removeCardFromCount(card as CardInCollection);
				}
			}
			console.log(cardInList);
			if (this.state === 'deck-builder')this.deckBuilder!.removeCardFromCount(card);
			if (!cardTemplate.$wrapper) return;
			$deckCounter.textContent = `${cardInList.count}`;
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


