var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CardData, CardInDeck } from "./models/Card.js";
import { Api } from "./api/Api.js";
import { Config } from "./Config.js";
import { Collection, CopiedCollection, CopiedDecklist, Decklist } from "./models/Deck.js";
import { CardTemplate } from "./templates/CardTemplate.js";
import { PageManager } from "./templates/PageManager.js";
import { FilterForm } from "./templates/FilterForm.js";
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
        this.$cardTemplatesWrapper = document.querySelector('section.cards-data');
        this.cardListIsCollection = false;
        this.collectionCardList = [];
    }
    get activeList() {
        return this._activeList;
    }
    set activeList(deck) {
        this._activeList = deck;
    }
    loadStateManager() {
        this.stateManager.createHTMLContent();
        /* this.createNewCardList(); */
        this.stateManager.$deckMenuBtn.addEventListener('click', () => {
            this.createNewCardListMenu('decklist');
        });
        this.stateManager.$collectionMenuBtn.addEventListener('click', () => {
            this.createNewCardListMenu('collection');
        });
        if (this.state !== 'card-list') {
            this.stateManager.$defaultCardListBtn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                this.defaultCardListMode();
            }));
        }
    }
    createNewCardListMenu(type) {
        if (this.cardListIsCollection)
            this.cardListIsCollection = false;
        const list = type === 'decklist' ? 'deck' : type === 'collection' ? 'collection' : '';
        let modal = null;
        if (type === 'decklist') {
            modal = new DecklistManager();
            if (!!this.collectionMenu)
                this.collectionMenu.$wrapper.innerHTML = '';
        }
        else /* if(type === 'collection') */
            modal = new CollectionManager();
        modal.render();
        modal.$modalWrapper.querySelector(`button#new-${list}-btn`).addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            if (type === 'decklist')
                yield this.newDeck();
            else if (type === 'collection')
                yield this.newCollection();
        }));
        modal.$modalWrapper.querySelectorAll(`.${type}`).forEach($list => {
            $list.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                const name = $list.querySelector(`p.${type}-name`).textContent;
                const listJSON = localStorage.getItem(`${type}: ${name}`);
                if (type === 'decklist') {
                    const storedDeck = JSON.parse(listJSON);
                    let deck = new CopiedDecklist(storedDeck);
                    console.log(deck.cards);
                    yield this.loadDeck(deck);
                }
                else if (type === 'collection') {
                    const storedCollection = JSON.parse(listJSON);
                    let collection = new CopiedCollection(storedCollection);
                    yield this.loadCollection(collection);
                }
            }));
        });
    }
    updateStateManager() {
        this.stateManager.updateStateTo(this.state);
        this.loadStateManager();
        this.loadFilters();
    }
    defaultCardListMode() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cardListIsCollection)
                this.cardListIsCollection = false;
            if (this.state === 'deck-builder') {
                this.deckBuilder.$wrapper.innerHTML = '';
                this.deckBuilder.$wrapper.classList.remove('visible');
            }
            if (this.state === 'collection-manager') {
                this.collectionMenu.$wrapper.innerHTML = '';
            }
            this.state = 'card-list';
            this.updateStateManager();
            yield this.updateCardList();
        });
    }
    newCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeList = new Collection();
            this.state = 'collection-manager';
            yield this.updateCardList();
            this.loadCollectionMenu(this.activeList);
            this.updateStateManager();
        });
    }
    loadCollection(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            this.activeList = collection;
            console.log(collection);
            this.state = 'collection-manager';
            yield this.updateCardList();
            this.loadCollectionMenu(collection);
            this.updateStateManager();
        });
    }
    loadCollectionMenu(collection) {
        if (this.state === 'deck-builder') {
            this.deckBuilder.$wrapper.innerHTML = '';
            this.deckBuilder.$wrapper.classList.remove('visible');
        }
        this.collectionMenu = new CollectionMenu(collection);
        this.collectionMenu.render();
        this.addDisplayCollectionBtnListener();
    }
    addDisplayCollectionBtnListener() {
        const $displayToggle = this.collectionMenu.$wrapper.querySelector('button.display-collection');
        $displayToggle.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            console.log(this.activeList);
            if (!$displayToggle.classList.contains('displayed')) {
                this.loadDisplayedCollection();
                console.log('activeList.cards: ' + this.activeList.cards);
                yield this.searchWithFilters();
                $displayToggle.classList.toggle('displayed');
                $displayToggle.textContent = 'Display all cards';
            }
            else /* if ($displayToggle.classList.contains('displayed')) */ {
                this.cardListIsCollection = false;
                yield this.searchWithFilters();
                const $collectionDisplay = document.querySelector('.center-div h3');
                $collectionDisplay.outerHTML = '';
                $displayToggle.classList.toggle('displayed');
                $displayToggle.textContent = 'Display collection';
            }
        }));
    }
    loadDisplayedCollection() {
        this.cardListIsCollection = true;
        if (this.activeList instanceof Collection) {
            console.log('activeList = ' + this.activeList);
            this.displayedCollection = this.activeList;
        }
        else { //if in deck-builder mode with a collection loaded
            const select = this.filterForm.$collectionLoader.querySelector('.select-container select');
            const collectionJSON = localStorage.getItem(`collection: ${select.value}`);
            const storedCollection = JSON.parse(collectionJSON);
            this.displayedCollection = new CopiedCollection(storedCollection);
        }
        const $centerDiv = document.querySelector('.center-div');
        const $collectionDisplay = document.createElement('h3');
        $collectionDisplay.innerHTML = `"${this.displayedCollection.name}" collection displayed`;
        const $cardListCardsData = document.querySelector('.center-div section.cards-data');
        $centerDiv.insertBefore($collectionDisplay, $cardListCardsData);
    }
    newDeck() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = 'deck-builder';
            this.updateStateManager();
            this.activeList = new Decklist();
            yield this.loadDeckBuilder(this.activeList);
        });
    }
    loadDeck(deck) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = 'deck-builder';
            this.updateStateManager();
            this.activeList = deck;
            console.log(deck);
            yield this.loadDeckBuilder(this.activeList);
            deck.cards.forEach((card) => {
                const $supertypeDiv = document.querySelector(`#deck-builder section.cards-data .sub-section.${card.supertype}`);
                let cardInDeckTemplate = this.createCardTemplate(card, $supertypeDiv);
                cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeList);
                this.addDeckCountListeners(card, cardInDeckTemplate);
            });
        });
    }
    loadDeckBuilder(deck) {
        return __awaiter(this, void 0, void 0, function* () {
            this.deckBuilder = new DeckBuilderManager(deck);
            this.deckBuilder.render();
            console.log('deck loaded');
            yield this.updateCardList();
        });
    }
    loadPageManagers() {
        this.pageManagers = [new PageManager(`p-m-up`), new PageManager(`p-m-bottom`)];
    }
    addPageManagerListeners() {
        this.pageManagers.forEach((pm) => {
            let that = this;
            pm.$firstPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page > 1) {
                        that.page = 1;
                        yield that.updateCardList();
                    }
                });
            });
            pm.$previousPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page > 1) {
                        that.page--;
                        yield that.updateCardList();
                    }
                });
            });
            pm.$nextPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page < that.totalPages) {
                        that.page++;
                        yield that.updateCardList();
                    }
                });
            });
            pm.$lastPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page < that.totalPages) {
                        that.page = that.totalPages;
                        yield that.updateCardList();
                    }
                });
            });
            pm.$pageSelectorBtn.addEventListener('click', function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    event.preventDefault();
                    const value = Number(pm.$pageSelectorInput.value);
                    if (value < 1)
                        that.page = 1;
                    else if (value > that.totalPages)
                        that.page = that.totalPages;
                    else
                        that.page = value;
                    yield that.updateCardList();
                });
            });
        });
    }
    loadFilters() {
        this.filters = '';
        if (!!this.filterForm)
            this.filterForm.$wrapper.innerHTML = '';
        this.filterForm = new FilterForm();
        this.filterForm.cardProperties = this.cardProperties;
        this.filterForm.initializeFilterFields();
        document.querySelectorAll('button.submit-filters').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                this.searchWithFilters();
            });
        });
        if (this.state === 'deck-builder') {
            const collectionListJSON = localStorage.getItem(`collection-list`);
            if (!!collectionListJSON) {
                this.filterForm.createCollectionLoader(JSON.parse(collectionListJSON));
                this.filterForm.$collectionLoader.querySelector('button.display-collection')
                    .addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    const select = this.filterForm.$collectionLoader.querySelector('.select-container select');
                    if (select.value !== "none") {
                        this.loadDisplayedCollection();
                    }
                    else {
                        this.cardListIsCollection = false;
                        const $collectionDisplay = document.querySelector('.center-div h3');
                        $collectionDisplay.outerHTML = '';
                    }
                    yield this.searchWithFilters();
                }));
            }
        }
    }
    getFilters() {
        if (this.cardListIsCollection === false) {
            this.filters = this.filterForm.getFilters();
            this.orderBy = this.filterForm.sortCards();
        }
        else {
            this.collectionCardList = Array.from(this.displayedCollection.cards);
            this.collectionCardList = this.filterForm.getCollectionFilters(this.collectionCardList);
            this.filterForm.sortCollectionCards(this.collectionCardList);
        }
    }
    searchWithFilters() {
        return __awaiter(this, void 0, void 0, function* () {
            this.getFilters();
            this.page = 1;
            yield this.updateCardList();
        });
    }
    fetchCards(page, orderBy, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.getCards(Config.displayedPerPage, page, orderBy, filters !== null && filters !== void 0 ? filters : "");
            /* for (let i in cardsData) {
                this.cardList.push(new CardData(cardsData[i], +i + 1));
            } */
        });
    }
    loadCardData(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let count = 0;
            let totalCount = 0;
            if (this.cardListIsCollection === false) {
                const apiData = yield this.fetchCards(this.page, this.orderBy, (_a = this.filters) !== null && _a !== void 0 ? _a : "");
                this.cardList = apiData.data;
                this.totalPages = Math.ceil(apiData.totalCount / Config.displayedPerPage);
                count = apiData.count;
                totalCount = apiData.totalCount;
            }
            else /* if collection is displayed */ {
                //Change page, doesn't load filters now
                this.cardList = this.collectionCardList.slice(this.page * 20 - 20, this.page * 20);
                this.totalPages = Math.ceil(this.collectionCardList.length / Config.displayedPerPage);
                count = this.cardList.length < Config.displayedPerPage ? this.cardList.length : Config.displayedPerPage;
                totalCount = this.collectionCardList.length;
            }
            this.pageManagers[0].$pageCounter.innerHTML =
                `Page: ${this.page}/${this.totalPages > 1 ? this.totalPages : 1} (displaying ${count} cards out of ${totalCount})`;
            this.pageManagers[1].$pageCounter.innerHTML =
                `Page: ${this.page}/${this.totalPages > 1 ? this.totalPages : 1} (displaying ${count} cards out of ${totalCount})`;
            console.log(this.cardList);
            this.pageManagers[0].$pageSelectorInput.max = `${this.totalPages}`;
            this.pageManagers[1].$pageSelectorInput.value = `${this.page}`;
        });
    }
    displayCollectionPage(collection) {
        let collectionPage = collection.slice(this.page * 20 - 20, this.page * 20);
        return collectionPage;
    }
    displayCards() {
        this.$cardTemplatesWrapper.innerHTML = "";
        const $modalWrapper = document.querySelector('.card-modal');
        if ($modalWrapper.classList.contains('modal-on'))
            Modal.closeModal($modalWrapper);
        this.cardList.forEach((card) => {
            let cardTemplate = this.createCardTemplate(card, this.$cardTemplatesWrapper);
            if (this.state === 'deck-builder' || this.state === 'collection-manager') {
                cardTemplate = CardWithDecklistBtn(cardTemplate, this.activeList);
                this.addDeckCountListeners(card, cardTemplate);
            }
        });
    }
    updateCardList() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.loadCardData((_a = this.filters) !== null && _a !== void 0 ? _a : "");
            this.displayCards();
        });
    }
    loadCardListPage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateCardList();
            const properties = localStorage.getItem("card-properties");
            if (!!properties) {
                this.cardProperties = JSON.parse(properties);
            }
            else {
                this.cardProperties = new CardProperties(this.api);
                yield this.cardProperties.loadProperties();
            }
            this.loadFilters();
            this.addPageManagerListeners();
        });
    }
    createCardTemplate(card, $wrapper) {
        let cardTemplate = new CardTemplate(card);
        const $cardTemplate = cardTemplate.createHTMLCard();
        $wrapper.appendChild($cardTemplate);
        cardTemplate = cardWithModal(cardTemplate);
        return cardTemplate;
    }
    addDeckCountListeners(card, cardTemplate) {
        const $deckCounter = cardTemplate.$wrapper.querySelector("span.deck-counter");
        const $cardListCardsData = document.querySelector('.center-div section.cards-data');
        const $deckBuilderCardsData = document.querySelector('#deck-builder section.cards-data');
        const AddToDecklistBtn = cardTemplate.$wrapper.querySelector('button.plus-1');
        AddToDecklistBtn.addEventListener(('click'), () => {
            if (this.activeList instanceof Decklist) {
                if (this.activeList.checkTotalNameCount(card) >= CardData.maxDeckCount(card)) {
                    return;
                }
            }
            let existingCard = this.activeList.cards.find(c => c.id === card.id);
            if (!existingCard) {
                $deckCounter.textContent = `1`;
                if (this.state === 'deck-builder') {
                    let newCardInDeck = new CardInDeck(card, this.activeList);
                    this.activeList.addCardToList(newCardInDeck);
                    const $supertypeDiv = $deckBuilderCardsData.querySelector(`.sub-section.${card.supertype}`);
                    let cardInDeckTemplate = this.createCardTemplate(newCardInDeck, $supertypeDiv);
                    cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeList);
                    this.addDeckCountListeners(newCardInDeck, cardInDeckTemplate);
                }
                else if (this.state === 'collection-manager') {
                    let newCard = new CardData(card, this.activeList);
                    console.log(this.activeList);
                    this.activeList.addCardToList(newCard);
                }
            }
            else {
                this.activeList.addCardToList(existingCard);
                $deckCounter.textContent = `${existingCard.count}`;
                if (card instanceof CardInDeck) {
                    console.log('listener in deck');
                    const $cardListData = $cardListCardsData.querySelector(`.card-template.${card.id}`);
                    if (!!$cardListData) {
                        console.log('card in list');
                        $cardListData.querySelector('.deck-counter').textContent = `${card.count}`;
                    }
                }
                else if (this.state === 'deck-builder') {
                    const $deckBuilderDeckCount = $deckBuilderCardsData.querySelector(`.${card.id}`);
                    $deckBuilderDeckCount.querySelector('.deck-counter').textContent = `${existingCard.count}`;
                }
            }
            if (this.state === 'deck-builder')
                this.deckBuilder.addCardToCount(card);
            if (this.state === 'collection-manager')
                this.collectionMenu.addCardToCount(card);
        });
        const RemoveFromDecklistBtn = cardTemplate.$wrapper.querySelector('button.minus-1');
        RemoveFromDecklistBtn.addEventListener('click', () => {
            let cardInList = undefined;
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
                    $cardListData.querySelector('.deck-counter').textContent = `${card.count}`;
            }
            else {
                cardInList = this.activeList.cards.find(c => c.id === card.id);
                if (!cardInList)
                    return;
                this.activeList.removeCardFromList(cardInList);
                if (this.state === 'deck-builder') {
                    const $deckBuilderData = $deckBuilderCardsData.querySelector(`.card-template.${card.id}`);
                    if (cardInList.count === 0) {
                        $deckBuilderData.remove();
                    }
                    $deckBuilderData.querySelector('span.deck-counter').textContent = `${cardInList.count}`;
                }
                if (this.state === 'collection-manager') {
                    this.collectionMenu.removeCardFromCount(card);
                }
            }
            console.log(cardInList);
            if (this.state === 'deck-builder')
                this.deckBuilder.removeCardFromCount(card);
            if (!cardTemplate.$wrapper)
                return;
            $deckCounter.textContent = `${cardInList.count}`;
        });
    }
    startGame(mode) {
        /* //Change here when deck and difficulty selections are available
        const CPUDeck: Decklist = new Decklist;
        let game = null;
        if (mode === "semi-ruled") game = new SemiRuledGame(this.activeList, CPUDeck, this.username);
        else game = new FreeGame(this.activeList, CPUDeck, this.username);

        game.play(); */
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadStateManager();
            this.loadPageManagers();
            yield this.loadCardListPage();
            //Add condition later
            //this.startGame();
        });
    }
}
const app = new App;
app.main();
