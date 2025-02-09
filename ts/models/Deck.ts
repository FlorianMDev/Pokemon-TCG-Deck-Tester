import {Card, RawCardData, CardInDeck, CardData} from "./Card.js";
import {Config, cardCount} from "../Config.js";

export class Decklist {
	name: string;
	cards : CardInDeck[];
	pokémonCount: number;
	trainerCount: number;
	energyCount: number;
	cardCount: number;
	maxSize : number;
	minSizeToUse : number;
	valid: boolean;
	active: boolean;
	constructor() {
		this.name = "";
		this.cards = [];
		this.cardCount = 0;
		this.pokémonCount = 0;
		this.trainerCount = 0;
		this.energyCount = 0;

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
		//Check if existing Radiant or ACE card
		if(card.subtypes.includes('Radiant')) {
			return this.cards.filter( (c:CardInDeck) => c.subtypes.includes('Radiant')).length;//Return 0 or 1
		} else if (card.subtypes.includes('ACE SPEC')) {
			return this.cards.filter( (c:CardInDeck) => c.subtypes.includes('ACE SPEC')).length;//Return 0 or 1
		}

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
		
		//If unnamed deck, add a counter to save it as Unnamed(number)
		if (!this.name) {
			let counter: number = 1;
			for (let i:number = 1; !!localStorage.getItem(`decklist: Unnamed(${counter})`); i++) {
				console.log("counter ="+i);
				counter = i;
			}
			this.name = counter>1?`Unnamed(${counter})`: "Unnamed";
		}		
		const decklist: string = JSON.stringify(this);
		
		//Set decklist in the localStorage with key being Unnamed(number) if the deck has no name
		//decklist was declared before modifying this.name so the unnamed deck object will have no name property
		localStorage.setItem(`decklist: ${this.name}`, decklist);
		
		//Get the decklist list
		let decklistList: string | null = localStorage.getItem('decklist-list');
		let decklistArray: {name: string, cardCount: number}[] = [];
		if (!!decklistList) {
			decklistArray = JSON.parse(decklistList);
		}
		
		//Check if existing names exist to erase older version if not unnamed deck
		decklistArray = decklistArray.filter(d => d.name !== `${this.name}`);
		decklistArray.splice(0,0,{name: `${this.name}`, cardCount: this.cardCount});
		localStorage.setItem('decklist-list', JSON.stringify(decklistArray));
	}
}

export class CopiedDecklist extends Decklist{
	name: string;
	cards : CardInDeck[];
	pokémonCount: number;
	trainerCount: number;
	energyCount: number;
	cardCount: number;
	maxSize : number;
	minSizeToUse : number;
	valid: boolean;
	active: boolean;
	constructor(decklist: Decklist) {
		super();
		this.name = !!decklist.name? decklist.name: "";
		this.cards = decklist.cards;
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

