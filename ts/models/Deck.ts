import {Card, RawCardData, CardInDeck, CardData, CardInCollection} from "./Card.js";
import {Config} from "../Config.js";

export class Cardlist {
	name: string;
	cards : CardData[];
	pokémonCount: number;
	trainerCount: number;
	energyCount: number;
	cardCount: number;
	active: boolean;
	type: string;
	constructor(type: string) {
		this.name = "";
		this.cards = [];
		this.cardCount = 0;
		this.pokémonCount = 0;
		this.trainerCount = 0;
		this.energyCount = 0;

		this.active = false;
		this.type = type;
	}
	
	/* get deckCount() {
		return this._deckCount;
	}
	set deckCount(value) {
		this._deckCount = value;
	} */
	
	addCardToList(card: CardData | RawCardData) {
		const existingCard: CardData | void = this.cards.find(c => c.id === card.id);
		/* if (this.checkTotalNameCount(card) >= CardData.maxDeckCount(card)) return false; unnecessary rn-checked before*/		
		console.log(existingCard);
		
		if (!existingCard) {
			if (card instanceof CardData === false) {
				if (this instanceof Decklist) {
					this.cards.push(new CardInDeck(card, this));
				} else if (this instanceof Collection) {
					this.cards.push(new CardData(card));
				}
			} else	this.cards.push(card);
		} else {
			console.log('+1 in deck');
			existingCard.count ++;
		}
		console.log('DECKLIST:');
		console.log(this.cards)
		return true;//In case I want to check the condition in this method and not before. Uncomment the rest if so
	}
	removeCardFromList(card: CardData) {
		if (card.count > 0) {
			if (card.count === 1) this.cards = this.cards.filter(c => c !== card);
			card.count--;//For Deckbuilder manager
		}
		console.log(this.cards);
	}
	saveToLocalStorage() {		
		//If unnamed deck, add a counter to save it as Unnamed(number)
		if (!this.name) {
			let counter: number = 1;
			for (let i:number = 1;
				!!localStorage.getItem(`${this.type}: Unnamed(${counter})`);
				i++) {
				console.log("counter ="+i);
				counter = i;
			}
			this.name = `Unnamed(${counter})`;
		}		
		const decklist: string = JSON.stringify(this);
		
		//Set decklist in the localStorage with key being Unnamed(number) if the deck has no name
		//decklist was declared before modifying this.name so the unnamed deck object will have no name property
		localStorage.setItem(`${this.type}: ${this.name}`, decklist);
		
		//Get the decklist list
		let decklistList: string | null = localStorage.getItem(`${this.type}-list`);
		let decklistArray: {name: string, cardCount: number}[] = [];
		if (!!decklistList) {
			decklistArray = JSON.parse(decklistList);
		}
		
		//Check if existing names exist to erase older version if not unnamed deck
		decklistArray = decklistArray.filter(d => d.name !== `${this.name}`);
		decklistArray.splice(0,0,{name: `${this.name}`, cardCount: this.cardCount});
		localStorage.setItem(`${this.type}-list`, JSON.stringify(decklistArray));
	}
}

export class Decklist extends Cardlist {	
	maxSize : number;
	minSizeToUse : number;
	valid: boolean;
	cards: CardInDeck[];
	constructor() {
		super ('decklist');
		this.maxSize = Config.maxDeckSize;
		this.minSizeToUse = Config.minDeckSize;
		this.valid = false;
		this.cards = [];
	}
	checkTotalNameCount(card: RawCardData | CardData): number {
		//Check if existing Radiant or ACE card
		if(!!card.subtypes && card.subtypes.includes('Radiant')) {
			return this.cards.filter( (c:CardInDeck) => c.subtypes.includes('Radiant')).length;//Return 0 or 1
		} else if (!!card.subtypes && card.subtypes.includes('ACE SPEC')) {
			return this.cards.filter( (c:CardInDeck) => c.subtypes.includes('ACE SPEC')).length;//Return 0 or 1
		}

		let similarNameCount: number = 0;

		let similarNames: CardInDeck[] = this.cards.filter(c => c.name === card.name);
		similarNames.forEach(c => {
			similarNameCount += c.count;
		})
		
		return similarNameCount;
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
		this.cards = decklist.cards.map(card => new CardInDeck(card, this));
		console.table(this.cards)
		this.cards.sort((a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate) );
		console.log('sorted by date');		
		console.table(this.cards)
		this.cards.sort((a, b) => this.sortPokémonByDexNumber(a, b)!);
		console.log('sorted by dex number');
		console.table(this.cards)
		this.cardCount = decklist.cardCount;
		this.pokémonCount = decklist.pokémonCount;
		this.trainerCount = decklist.trainerCount;
		this.energyCount = decklist.energyCount;

		this.maxSize = decklist.maxSize;
		this.minSizeToUse = decklist.minSizeToUse;
		this.valid = decklist.valid;
		this.active = decklist.active;
	}
	sortPokémonByDexNumber(a: CardInDeck, b: CardInDeck) {
		if (a.supertype === "Pokémon") {
			if(b.supertype === "Pokémon") return a.dexNumber! - b.dexNumber!;
			else return -1;
		} 
		if (a.supertype !== "Pokémon") {
			if(b.supertype === "Pokémon") return +1;
			else return 0;
		}
	}
}


export class Collection extends Cardlist{
	cards : CardInCollection[];
		constructor() {
		super('collection');		
		this.cards = [];
	}
}

export class CopiedCollection extends Collection{
	
	name: string;
	cards : CardInCollection[];
	pokémonCount: number;
	trainerCount: number;
	energyCount: number;
	cardCount: number;
	active: boolean;
	constructor(collection: Collection, decklist?: Decklist) {
		super();
		this.name = !!collection.name? collection.name: "";
		this.cards = collection.cards.map(card => new CardInCollection(card));
		this.cards = this.cards.sort((a, b) => Date.parse(a.releaseDate) - Date.parse(b.releaseDate) );

		this.cardCount = collection.cardCount;
		this.pokémonCount = collection.pokémonCount;
		this.trainerCount = collection.trainerCount;
		this.energyCount = collection.energyCount;
		this.active = collection.active;
	}
}


export class Deck {
	cards : Card[];
	maxSize : number;
	constructor(deck: Decklist) {
		this.cards = [];
		deck.cards.forEach((c: CardInDeck) => {
			for (let i: number = 1; i <= c.count; i++) {
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

