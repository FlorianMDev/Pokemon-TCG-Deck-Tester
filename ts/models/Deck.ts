import {Card, RawCardData, CardInDeck, CardData} from "./Card.js";
import {Config, cardCount} from "../Config.js";

export class Decklist {
	name: string;
	cards : CardInDeck[];
	maxSize : number;
	minSizeToUse : number;
	valid: boolean;
	active: boolean;
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
	addCardToList(card: RawCardData) {
		const existingCard: CardInDeck | void = this.cards.find(c => c.id === card.id);		
		if (!!existingCard) {
			existingCard.deckCount ++;
		} else {
			this.cards.push(new CardInDeck(card, this));
		}
		console.log(this.cards);	
	}
	removeCardFromList(card: CardInDeck) {
		if (card.deckCount > 1) card.deckCount--;
		else if (card.deckCount === 1) this.cards = this.cards.filter(c => c != card);
		console.log(this.cards);
	}
	saveToLocalStorage() {
		const decklist: string = JSON.stringify(this)
		localStorage.setItem(`decklist "${this.name}"`, decklist);
	}
}

export class Deck {
	cards : Card[];
	maxSize : number;
	constructor(deck: Decklist) {
		this.cards = [];
		deck.cards.forEach((c: CardInDeck) => {
			for (let i: cardCount = 1; i <= c.deckCount; i++) {
				this.cards.push(new Card(c, i));
			}	
		})
		this.maxSize = deck.maxSize;
	}
	shuffle() {
		const length = this.cards.length;
		const deckCopy: Card[] = Array.from(this.cards);		
		this.cards = [];
		for (let i = 0; i < length; i++ ) {
			const random = Math.floor(Math.random()*this.cards.length);
			this.cards.push(deckCopy[random]);
			deckCopy.splice(random, 1);
		}
	}	
	addCard(card: Card) {
		if (this.cards.length < this.maxSize) this.cards.push(card);
	}
	RemoveCard(card: Card) {
		if (this.cards.length > 0) this.cards = this.cards.filter(c => c != card);
	}
}

