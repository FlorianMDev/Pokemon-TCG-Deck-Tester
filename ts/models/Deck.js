import { Card, CardInDeck, CardData } from "./Card.js";
import { Config } from "../Config.js";
export class Cardlist {
    constructor() {
        this.name = "";
        this.cards = [];
        this.cardCount = 0;
        this.pokémonCount = 0;
        this.trainerCount = 0;
        this.energyCount = 0;
        this.active = false;
    }
    /* get deckCount() {
        return this._deckCount;
    }
    set deckCount(value) {
        this._deckCount = value;
    } */
    addCardToList(card) {
        const existingCard = this.cards.find(c => c.id === card.id);
        /* if (this.checkTotalNameCount(card) >= CardData.maxDeckCount(card)) return false; unnecessary rn-checked before*/
        console.log(existingCard);
        if (!existingCard) {
            if (card instanceof CardData === false) {
                if (this instanceof Decklist) {
                    this.cards.push(new CardInDeck(card, this));
                }
                else if (this instanceof Collection) {
                    this.cards.push(new CardData(card));
                }
            }
            else
                this.cards.push(card);
        }
        else {
            console.log('+1 in deck');
            existingCard.count++;
        }
        console.log('DECKLIST:');
        console.log(this.cards);
        return true; //In case I want to check the condition in this method and not before. Uncomment the rest if so
    }
    removeCardFromList(card) {
        if (card.count > 0) {
            if (card.count === 1)
                this.cards = this.cards.filter(c => c !== card);
            card.count--; //For Deckbuilder manager
        }
        console.log(this.cards);
    }
    saveToLocalStorage() {
        //If unnamed deck, add a counter to save it as Unnamed(number)
        if (!this.name) {
            let counter = 1;
            for (let i = 1; !!localStorage.getItem(`decklist: Unnamed(${counter})`); i++) {
                console.log("counter =" + i);
                counter = i;
            }
            this.name = `Unnamed(${counter})`;
        }
        const decklist = JSON.stringify(this);
        //Set decklist in the localStorage with key being Unnamed(number) if the deck has no name
        //decklist was declared before modifying this.name so the unnamed deck object will have no name property
        localStorage.setItem(`decklist: ${this.name}`, decklist);
        //Get the decklist list
        let decklistList = localStorage.getItem('decklist-list');
        let decklistArray = [];
        if (!!decklistList) {
            decklistArray = JSON.parse(decklistList);
        }
        //Check if existing names exist to erase older version if not unnamed deck
        decklistArray = decklistArray.filter(d => d.name !== `${this.name}`);
        decklistArray.splice(0, 0, { name: `${this.name}`, cardCount: this.cardCount });
        localStorage.setItem('decklist-list', JSON.stringify(decklistArray));
    }
}
export class Decklist extends Cardlist {
    constructor() {
        super();
        this.maxSize = Config.maxDeckSize;
        this.minSizeToUse = Config.minDeckSize;
        this.valid = false;
        this.cards = [];
    }
    checkTotalNameCount(card) {
        //Check if existing Radiant or ACE card
        if (card.subtypes.includes('Radiant')) {
            return this.cards.filter((c) => c.subtypes.includes('Radiant')).length; //Return 0 or 1
        }
        else if (card.subtypes.includes('ACE SPEC')) {
            return this.cards.filter((c) => c.subtypes.includes('ACE SPEC')).length; //Return 0 or 1
        }
        let similarNameCount = 0;
        let similarNames = this.cards.filter(c => c.name === card.name);
        similarNames.forEach(c => {
            similarNameCount += c.count;
        });
        return similarNameCount;
    }
}
export class Collection extends Cardlist {
}
export class CopiedDecklist extends Decklist {
    constructor(decklist) {
        super();
        this.name = !!decklist.name ? decklist.name : "";
        this.cards = decklist.cards.map(card => new CardInDeck(card, this));
        this.cardCount = decklist.cardCount;
        this.pokémonCount = decklist.pokémonCount;
        this.trainerCount = decklist.trainerCount;
        this.energyCount = decklist.energyCount;
        this.maxSize = decklist.maxSize;
        this.minSizeToUse = decklist.minSizeToUse;
        this.valid = decklist.valid;
        this.active = decklist.active;
    }
}
export class Deck {
    constructor(deck) {
        this.cards = [];
        deck.cards.forEach((c) => {
            for (let i = 1; i <= c.count; i++) {
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
