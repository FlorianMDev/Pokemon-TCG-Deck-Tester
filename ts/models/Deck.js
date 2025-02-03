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
    checkTotalNameCount(card) {
        let similarNameCount = 0;
        let similarNames = this.cards.filter(c => c.name === card.name);
        similarNames.forEach(c => {
            similarNameCount += c.deckCount;
        });
        return similarNameCount;
    }
    addCardToList(card) {
        const existingCard = this.cards.find(c => c.id === card.id);
        /* if (this.checkTotalNameCount(card) >= CardData.maxDeckCount(card)) return false; unnecessary rn-checked before*/
        if (!existingCard) {
            if (card instanceof CardInDeck === false) {
                this.cards.push(new CardInDeck(card, this));
            }
            else
                this.cards.push(card);
        }
        else {
            existingCard.deckCount++;
        }
        console.log('DECKLIST:');
        this.cards.forEach(c => console.log(c));
        return true; //In case I want to check the condition in this method and not before. Uncomment the rest if so
    }
    removeCardFromList(card) {
        if (card.deckCount > 0) {
            if (card.deckCount === 1)
                this.cards = this.cards.filter(c => c !== card);
            card.deckCount--;
        }
        console.log(this.cards);
    }
    saveToLocalStorage() {
        const decklist = JSON.stringify(this);
        localStorage.setItem(`decklist "${this.name}"`, decklist);
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
            this.cards = this.cards.filter(c => c != card);
    }
}
