var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CardsApi } from "./api/Api.js";
import { Config } from "./Config.js";
import { Game } from "./Game.js";
import { Decklist } from "./models/Deck.js";
export class App {
    constructor() {
        this.cardApi = new CardsApi(`${Config.ApiURI}/cards`);
        this.cardList = [];
        this.username = "";
        const activeDeck = localStorage.getItem("active-decklist");
        if (!!activeDeck)
            this._activeDeck = JSON.parse(activeDeck);
        else
            this._activeDeck = new Decklist;
    }
    get activeDeck() {
        return this._activeDeck;
    }
    set activeDeck(deck) {
        this._activeDeck = deck;
    }
    fetchCards() {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch raw data (as CardDataType[])
            this.cardList = yield this.cardApi.get();
            // Map raw data into CardData instances
            /* for (let i in cardsData) {
                this.cardList.push(new CardData(cardsData[i], +i + 1));
                
            } */
            console.log(this.cardList);
        });
    }
    loadCardData() {
        return __awaiter(this, void 0, void 0, function* () {
            let localStorageCardList = window.localStorage.getItem("card-list");
            if (localStorageCardList === null) {
                yield this.fetchCards();
            }
            else {
                this.cardList = JSON.parse(localStorageCardList);
            }
        });
    }
    /* saveCardData(){
        let savedCardList: string = JSON.stringify(this.cardList);
        localStorage.setItem("card-list", savedCardList);
    } */
    startGame() {
        //Change here when deck and difficulty selections are available
        const game = new Game();
        const CPUDeck = new Decklist;
        const difficultyMod = 1;
        game.play(this._activeDeck, CPUDeck, this.username, difficultyMod);
    }
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fetchCards();
            //Add condition later
            //this.startGame();
        });
    }
}
const app = new App;
app.main();
