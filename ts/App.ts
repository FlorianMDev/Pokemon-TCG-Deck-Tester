import {CardData, CardInCollection, CardInDeck, RawCardData} from "./models/Card.js";
import {Api} from "./api/Api.js";
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
	filters?: string;	
	filterForm?: FilterForm;
	
	deckBuilder?: DeckBuilderManager;
	collectionMenu?: CollectionMenu;

	cardProperties?: CardProperties;
	$cardTemplatesWrapper: HTMLDivElement;

	private _activeList?: Decklist | Collection;
	collectionCardList?: CardData[];

	cardListIsCollection: boolean;

	constructor() {		
		this.api = new Api(`${Config.ApiURI}`);
		this.cardList = [];
		this.username = "";

		this.state = "card-list";
		this.page = 1;
		this.pageManagers = [];
		this.$cardTemplatesWrapper = document.querySelector('section.cards-data')!;
		this.stateManager = new StateManager(this.state);
		this.cardListIsCollection = false;
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
					let collection: CopiedCollection = new CopiedCollection(storedDeck);
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
	async cardListMode() {
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
		this.state = 'collection-manager';
		this.updateStateManager();
		this.activeList = new Collection();
		await this.updateCardList();
		this.loadCollectionMenu(this.activeList as Collection);
	}
	async loadCollection(collection: Collection) {
		this.state = 'collection-manager';
		this.updateStateManager();
		this.activeList = collection;
		console.log(collection);
		await this.updateCardList();
		this.loadCollectionMenu(collection);
	}
	loadCollectionMenu(collection:Collection) {
		this.collectionMenu = new CollectionMenu(collection);
		this.collectionMenu.render();
		this.addDisplayCollectionBtnListener();
	}
	addDisplayCollectionBtnListener() {
		const $displayToggle: HTMLButtonElement = this.collectionMenu!.$wrapper!.querySelector('button.display-collection')!;
		$displayToggle.addEventListener('click', async (e: Event) => {
			$displayToggle.classList.toggle('displayed');
			if ($displayToggle.classList.contains('displayed')) {
				$displayToggle.textContent = 'Display all cards';
				this.cardListIsCollection = true;
				console.log(this.activeList.cards);
				
				await this.updateCardList();
			} else /* if (!$displayToggle.classList.contains('displayed')) */ {
				$displayToggle.textContent = 'Display collection';
				this.cardListIsCollection = false;
				await this.searchWithFilters();
			}
		})
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
						this.cardListIsCollection = true;
						await this.updateCardList();
					} else {
						this.cardListIsCollection = false;
						await this.searchWithFilters();
					}
				})
			}
		}
		
    }
	async searchWithFilters() {
		if (this.cardListIsCollection === false) {
			this.filters = this.filterForm!.getFilters();
		}
		this.page = 1;
		await this.updateCardList();
		/* if (!!this.filterForm?.$collectionLoader) {
			this.filterForm.getCollectionFilters();			
		} */
	}
	/* searchCollectionWithFilters() {
		this.filterForm!.filterFields.forEach((ff: FilterField) => {
			if (ff.field instanceof HTMLFieldSetElement) {				
				const checkedInputs: NodeListOf<HTMLInputElement> = ff.field.querySelectorAll('div input:checked')!;
				console.log(checkedInputs);
				if (checkedInputs.length < 1) return;
				//Change here
				this.filters += this.multipleQueries(ff, checkedInputs);
			}
			else if (ff.type === "checkbox") {
				const input: HTMLElement | null = ff.$formWrapper.querySelector(`input:checked`);
				if (!!input) {
					//Change here
					this.filters += ` ${this.convertToQuery(ff.id, input.id)}`
				}
			}
			else {
				if (!!ff.field.value) {
					if (ff.field.multiple === false) {	
						//Change here				
						this.filters += ` ${this.convertToQuery(ff.id, ff.field.value)}`;
						//ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
					}
					else {
						const checkedOptions: NodeListOf<HTMLOptionElement> = ff.field.querySelectorAll('div option:checked')!;
						console.log(checkedOptions);
						if (checkedOptions.length < 1) return;
						//Change here
						this.filters += this.multipleQueries(ff, checkedOptions);
						//ex: " (subtype:"EX" OR subtype:"VSTAR")"			
					}
				}
			}
		})
	} */

	async fetchCards(page: number, filters?: string) {
		return await this.api.getCards(Config.displayedPerPage, page, filters?? "");
		/* for (let i in cardsData) {
			this.cardList.push(new CardData(cardsData[i], +i + 1));
		} */
	}
	async loadCardData(filters?: string) {
		let count: number = 0;
		let totalCount: number = 0;
		if (this.cardListIsCollection === false) {
			const apiData = await this.fetchCards(this.page, this.filters?? "");
			this.cardList = apiData.data;
			this.totalPages = Math.ceil(apiData.totalCount / Config.displayedPerPage);
			
			count = apiData.count;
			totalCount = apiData.totalCount;
		}
		else /* if (this.cardListIsCollection) */ {
			if (this.activeList instanceof Collection) {
				this.collectionCardList = this.activeList.cards;
			} else {
				const select: HTMLSelectElement = this.filterForm!.$collectionLoader!.querySelector('.select-container select')!;
				const collectionJSON: string = localStorage.getItem(`collection: ${select.value}`)!;
				const collection = JSON.parse(collectionJSON) as Collection;
				this.collectionCardList = collection.cards.map((card) => new CardInCollection(card));
			}
			//if(!!filters){this.filterCollectionCardList(this.collectionCardList);}
			this.cardList = this.collectionCardList;//Change later to include the amount displayed on 1 page

			this.totalPages = Math.ceil(this.cardList.length / Config.displayedPerPage);
			this.page = 1;//Change later			
			count = this.cardList.length < Config.displayedPerPage ? this.cardList.length: Config.displayedPerPage;
			totalCount = this.collectionCardList!.length;
		}
		this.pageManagers[0].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.totalPages > 1 ?this.totalPages: 1} (displaying ${count} cards out of ${totalCount})`;
		this.pageManagers[1].$pageCounter.innerHTML =
		`Page: ${this.page}/${this.totalPages > 1 ?this.totalPages: 1} (displaying ${count} cards out of ${totalCount})`;
		console.log(this.cardList);
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
		this.pageManagers.forEach((pm: PageManager) => {			
			pm.$pageSelectorInput.max = `${this.totalPages!}`;
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


