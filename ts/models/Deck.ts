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
	checkTotalNameCount(card: RawCardData | CardData): number {
		let similarNameCount: number = 0;
		let similarNames: CardInDeck[] = this.cards.filter(c => c.name === card.name);
		similarNames.forEach(c => {
			similarNameCount += c.deckCount;
		})
		return similarNameCount;
	}
	addCardToList(card: CardInDeck | RawCardData) {
		const existingCard: CardInDeck | void = this.cards.find(c => c.id === card.id);
		/* if (this.checkTotalNameCount(card) >= CardData.maxDeckCount(card)) return false; unnecessary rn-checked before*/		

		if (!existingCard) {
			if (card instanceof CardInDeck === false) {
				this.cards.push(new CardInDeck(card, this));
			} else
				this.cards.push(card);
		} else {
			existingCard.deckCount ++;
		}
		console.log('DECKLIST:');
		this.cards.forEach(c => console.log(c));
		return true;//In case I want to check the condition in this method and not before. Uncomment the rest if so
	}
	removeCardFromList(card: CardInDeck) {
		if (card.deckCount > 0) {
			if (card.deckCount === 1) this.cards = this.cards.filter(c => c !== card);
			card.deckCount--;
		}
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

