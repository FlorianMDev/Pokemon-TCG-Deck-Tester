import { Card, CardInDeck } from "./Card.js";
import { Config } from "../Config.js";
export class Decklist {
    constructor() {
        this.name = "";
        this.cards = [];
        this.maxSize = Config.maxDeckSize;
        this.minSizeToUse = Config.minDeckSize;
        this.valid = false;
        this.active = false;
    }
    /* get deckCount() {
        return this._deckCount;
    }
    set deckCount(value) {
        this._deckCount = value;
    } */
    addCardToList(card) {
        const existingCard = this.cards.find(c => c.id = card.id);
        if (!!existingCard) {
            if (existingCard.supertype === "energy" || existingCard.deckCount < Config.maxCardDeckCount)
                existingCard.deckCount++;
        }
        else {
            this.cards.push(new CardInDeck(card));
        }
    }
    saveToLocalStorage() {
        const decklist = JSON.stringify(this);
        localStorage.setItem(`decklist : ${decklist}`, decklist);
    }
}
export class Deck {
    constructor(deck) {
        this.cards = [];
        deck.cards.forEach((c) => {
            for (let i = 1; i <= c.deckCount; i++) {
                this.cards.push(new Card(c, i));
            }
        });
        this.maxSize = deck.maxSize;
    }
    shuffle() {
        const length = this.cards.length;
        const deckCopy = Array.from(this.cards);
        this.cards = [];
        for (let i = 0; i < length; i++) {
            const random = Math.floor(Math.random() * this.cards.length);
            this.cards.push(deckCopy[random]);
            deckCopy.splice(random, 1);
        }
    }
    addCard(card) {
        if (this.cards.length < this.maxSize)
            this.cards.push(card);
    }
    RemoveCard(card) {
        if (this.cards.length > 0)
            this.cards.filter(c => c != card);
    }
}
