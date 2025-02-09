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
import { FreeGame, SemiRuledGame } from "./Game.js";
import { CopiedDecklist, Decklist } from "./models/Deck.js";
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
export class App {
    constructor() {
        this.api = new Api(`${Config.ApiURI}`);
        this.cardList = [];
        this.username = "";
        this.state = "card-list";
        this.page = 1;
        this.pageManagers = [];
        this.$cardTemplatesWrapper = document.querySelector('section.cards-data');
    }
    get activeDeck() {
        return this._activeDeck;
    }
    set activeDeck(deck) {
        this._activeDeck = deck;
    }
    /* set deckMenu(state: boolean) {
        this._deckMenu = state;
    } */
    loadStateManager() {
        this.stateManager = new StateManager(this.state);
        this.stateManager.createHTMLContent();
        this.stateManager.$deckMenuBtn.addEventListener('click', () => {
            const modal = new DecklistManager();
            modal.render();
            modal.$modalWrapper.querySelector('button#new-deck-btn').addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                yield this.newDeck();
            }));
            modal.$modalWrapper.querySelectorAll('.decklist').forEach($deck => {
                $deck.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                    const name = $deck.querySelector('p.decklist-name').textContent;
                    console.log(name);
                    const deckJSON = localStorage.getItem(`decklist: ${name}`);
                    console.log(deckJSON);
                    const storedDeck = JSON.parse(deckJSON);
                    let deck = new CopiedDecklist(storedDeck);
                    console.log('loading deck');
                    yield this.loadDeck(deck);
                }));
            });
        });
        this.addStateManagerListeners();
    }
    addStateManagerListeners() {
        this.stateManager.$displayBtns.forEach((btn) => {
            addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                this.state = this.stateManager.updateStateTo(btn.id);
                yield this.updatePage();
            }));
        });
    }
    newDeck() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = 'deck-builder';
            this.activeDeck = new Decklist();
            yield this.loadDeckBuilder(this.activeDeck);
        });
    }
    loadDeck(deck) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state = 'deck-builder';
            this.activeDeck = deck;
            console.log(deck);
            yield this.loadDeckBuilder(this.activeDeck);
            deck.cards.forEach(card => {
                const $supertypeDiv = document.querySelector(`#deck-builder section.cards-data .sub-section.${card.supertype}`);
                let cardInDeckTemplate = this.createCardTemplate(card, $supertypeDiv);
                cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeDeck);
                this.addDeckCountListeners(card, cardInDeckTemplate);
            });
        });
    }
    loadDeckBuilder(deck) {
        return __awaiter(this, void 0, void 0, function* () {
            this.deckBuilder = new DeckBuilderManager(deck);
            this.deckBuilder.render();
            console.log('deck loaded');
            yield this.updatePage();
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
                        yield that.updatePage();
                    }
                });
            });
            pm.$previousPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page > 1) {
                        that.page--;
                        yield that.updatePage();
                    }
                });
            });
            pm.$nextPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page < that.apiTotalPages) {
                        that.page++;
                        yield that.updatePage();
                    }
                });
            });
            pm.$lastPageBtn.addEventListener('click', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (that.page < that.apiTotalPages) {
                        that.page = that.apiTotalPages;
                        yield that.updatePage();
                    }
                });
            });
            pm.$pageSelectorBtn.addEventListener('click', function (event) {
                return __awaiter(this, void 0, void 0, function* () {
                    event.preventDefault();
                    const value = Number(pm.$pageSelectorInput.value);
                    if (value < 1)
                        that.page = 1;
                    else if (value > that.apiTotalPages)
                        that.page = that.apiTotalPages;
                    else
                        that.page = value;
                    yield that.updatePage();
                });
            });
        });
    }
    loadFilters() {
        this.filterForm = new FilterForm();
        document.querySelectorAll('button.submit-filters').forEach((btn) => {
            btn.addEventListener('click', (event) => {
                this.searchWithFilters();
            });
        });
    }
    searchWithFilters() {
        this.filters = this.filterForm.getFilters();
        this.page = 1;
        this.updatePage();
    }
    fetchCards(page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.api.getCards(Config.displayedPerPage, page, filters !== null && filters !== void 0 ? filters : "");
            /* for (let i in cardsData) {
                this.cardList.push(new CardData(cardsData[i], +i + 1));
            } */
        });
    }
    loadCardData(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const apiData = yield this.fetchCards(this.page, (_a = this.filters) !== null && _a !== void 0 ? _a : "");
            this.cardList = apiData.data;
            this.apiTotalPages = Math.ceil(apiData.totalCount / Config.displayedPerPage);
            this.pageManagers[0].$pageCounter.innerHTML =
                `Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
            this.pageManagers[1].$pageCounter.innerHTML =
                `Page: ${this.page}/${this.apiTotalPages} (displaying ${apiData.count} cards out of ${apiData.totalCount})`;
            console.log(this.cardList);
        });
    }
    loadCardListPage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updatePage();
            const properties = localStorage.getItem("card-properties");
            if (!!properties) {
                this.cardProperties = JSON.parse(properties);
            }
            else {
                this.cardProperties = new CardProperties(this.api);
                yield this.cardProperties.loadProperties();
            }
            this.loadFilters();
            this.filterForm.cardProperties = this.cardProperties;
            this.filterForm.initializeFilterFields();
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
            if (this.activeDeck.checkTotalNameCount(card) >= CardData.maxDeckCount(card))
                return;
            let existingCard = this.activeDeck.cards.find(c => c.id === card.id);
            if (!existingCard) {
                let newCardInDeck = new CardInDeck(card, this.activeDeck);
                this.activeDeck.addCardToList(newCardInDeck);
                $deckCounter.textContent = `1`;
                const $supertypeDiv = $deckBuilderCardsData.querySelector(`.sub-section.${card.supertype}`);
                let cardInDeckTemplate = this.createCardTemplate(newCardInDeck, $supertypeDiv);
                cardInDeckTemplate = CardWithDecklistBtn(cardInDeckTemplate, this.activeDeck);
                this.addDeckCountListeners(newCardInDeck, cardInDeckTemplate);
            }
            else {
                this.activeDeck.addCardToList(existingCard);
                $deckCounter.textContent = `${existingCard.deckCount}`;
                if (card instanceof CardInDeck) {
                    const $cardListData = $cardListCardsData.querySelector(`.card-template.${card.id}`);
                    if (!!$cardListData)
                        $cardListData.querySelector('.deck-counter').textContent = `${card.deckCount}`;
                }
                else {
                    const $deckBuilderDeckCount = $deckBuilderCardsData.querySelector(`.${card.id}`);
                    $deckBuilderDeckCount.querySelector('.deck-counter').textContent = `${existingCard.deckCount}`;
                }
            }
            this.deckBuilder.addCardToCount(card);
        });
        const RemoveFromDecklistBtn = cardTemplate.$wrapper.querySelector('button.minus-1');
        RemoveFromDecklistBtn.addEventListener('click', () => {
            let cardInDeck = undefined;
            if (card instanceof CardInDeck) {
                cardInDeck = card;
                const $cardListData = $cardListCardsData.querySelector(`.card-template.${card.id}`);
                if (cardInDeck.deckCount === 1) {
                    cardTemplate.$wrapper.remove();
                }
                this.activeDeck.removeCardFromList(cardInDeck);
                if (!!$cardListData)
                    $cardListData.querySelector('.deck-counter').textContent = `${card.deckCount}`;
            }
            else {
                cardInDeck = this.activeDeck.cards.find(c => c.id === card.id);
                if (!cardInDeck)
                    return;
                const $deckBuilderData = $deckBuilderCardsData.querySelector(`.card-template.${card.id}`);
                if (cardInDeck.deckCount === 1) {
                    $deckBuilderData.remove();
                }
                this.activeDeck.removeCardFromList(cardInDeck);
                $deckBuilderData.querySelector('span.deck-counter').textContent = `${cardInDeck.deckCount}`;
            }
            console.log(cardInDeck);
            this.deckBuilder.removeCardFromCount(card);
            if (!cardTemplate.$wrapper)
                return;
            $deckCounter.textContent = `${cardInDeck.deckCount}`;
        });
    }
    displayCards() {
        this.$cardTemplatesWrapper.innerHTML = "";
        const $modalWrapper = document.querySelector('.card-modal');
        if ($modalWrapper.classList.contains('modal-on'))
            Modal.closeModal($modalWrapper);
        this.cardList.forEach((card) => {
            let cardTemplate = this.createCardTemplate(card, this.$cardTemplatesWrapper);
            if (this.state === 'deck-builder') {
                cardTemplate = CardWithDecklistBtn(cardTemplate, this.activeDeck);
                this.addDeckCountListeners(card, cardTemplate);
            }
        });
    }
    updatePage() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.loadCardData((_a = this.filters) !== null && _a !== void 0 ? _a : "");
            this.displayCards();
            this.pageManagers.forEach((pm) => {
                pm.$pageSelectorInput.max = `${this.apiTotalPages}`;
                pm.$pageSelectorInput.value = `${this.page}`;
            });
        });
    }
    startGame(mode) {
        //Change here when deck and difficulty selections are available
        const CPUDeck = new Decklist;
        let game = null;
        if (mode === "semi-ruled")
            game = new SemiRuledGame(this.activeDeck, CPUDeck, this.username);
        else
            game = new FreeGame(this.activeDeck, CPUDeck, this.username);
        game.play();
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
