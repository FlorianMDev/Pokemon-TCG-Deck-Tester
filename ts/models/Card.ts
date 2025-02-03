import {Config, cardCount} from "../Config.js";
import { Collection } from "./Collection.js";
import {Deck, Decklist} from "./Deck.js";
import {Player} from "./Player.js";




export interface RawCardData {
	id: string;
	name: string
	supertype: string
	subtypes: string[];
	level?: string;
	hp: number;
	types: string[];
	evolvesFrom?: string
	evolvesTo: string[];
	rules?: string[];
	ancientTrait?: AncientTrait;
	abilities?: Ability[];
	attacks: Attack[];
	weaknesses: Weakness[];
	resistances: Resistance[];
	retreatCost: string[];
	convertedRetreatCost: number,
	set : Set;
	number: string;
	artist: string;
	rarity: string;
	flavorText: string;
	nationalPokedexNumbers: number[];
	legalities: Legalities;
	images: Images;
	tcgplayer: TCGPlayer;
	cardmarket?: CardMarket;
}

export class CardData {
	id: string;
	name: string;
	supertype: string;
	subtypes: string[];
	hp: number;
	types: string[];
	ancientTrait?: AncientTrait;
	abilities?: Ability[];
	attacks: Attack[];
	weaknesses: Weakness[];
	resistances: Resistance[];
	convertedRetreatCost: number;
	set : string;
	rarity: string;
	legality: string;
	images: Images;
	avgPrice?: number;

	deckCount?: number;
	constructor(data: RawCardData | CardData, decklist?: Decklist/*  | Collection */) {
		this.id = data.id
		this.name = data.name;
		this.supertype = data.supertype
		this.subtypes = Array.from(data.subtypes?? []);
		this.hp = data.hp;
		this.types = Array.from(data.types?? []);
		this.ancientTrait = data.ancientTrait;
		this.abilities = Array.from(data.abilities?? []);
		this.attacks = Array.from(data.attacks?? []);
		this.weaknesses = Array.from(data.weaknesses?? []);
		this.resistances = Array.from(data.resistances?? []);
		this.convertedRetreatCost = data.convertedRetreatCost;
		if (data instanceof CardData) {
			this.set = data.set;
			this.legality = data.legality;
			this.avgPrice = data.avgPrice;
		} else {
			this.set = `${data.set.id} - ${data.set.name}`;
			this.legality = data.legalities.standard;
			this.avgPrice = data.cardmarket? data.cardmarket.prices.averageSellPrice: undefined;
		}		
		this.rarity = data.rarity;
		this.images = data.images;

		if (!!decklist) {
			if (decklist.cards.length > 0) {
				const cardInDeck = decklist.cards.find( (card: CardInDeck) => card.id === this.id);//Check if card in decklist
				if (!!cardInDeck) {
					this.deckCount = cardInDeck.deckCount;
				}
			}
			else this.deckCount = 0;
		} 
		
	}
	static maxDeckCount(card:RawCardData | CardData | CardInDeck/* , decklist:Decklist */) {
		if (card.supertype === "Energy" && card.subtypes.includes("Basic")) {
			return 60;
		} else if (card.subtypes.includes("ACE SPEC") || card.subtypes.includes("Radiant")) {
			return 1;
		} else {
			/* if (!!decklist.cards.find(c => c.id === card.id )) {}
			else */
			return Config.maxCardDeckCount;
		}
	}
}



export class CardInDeck extends CardData{
	deckCount: cardCount;
	constructor (data: RawCardData | CardData, decklist: Decklist) {
		super(data, decklist);
		this.deckCount = 1;
	}
}

//Custom types for card properties:
interface AncientTrait {
	name: string;
	text: string;
}
interface Ability {
	name: string;
	text: string;
	type: string;
}
interface Attack {
	cost: string[];
	name: string;
	text: string;
	damage: string;
}
interface Weakness {
	type: string;
	value:string;
}
interface Resistance {
	type: string;
	value:string;
}

export interface Set {
	id: string;
	name: string
	series: string;
	printedTotal: number;
	total: number;
	legalities: Legalities;
	ptcgoCode: string;
	releaseDate: string;
	updatedAt: string;
	images: SetImages;
}

interface SetImages {
	logo: string;
	symbol: string;
}

interface Legalities {
	unlimited: string;
	standard: string;
	expanded: string;
}

interface Images {
	small: string;
	large: string;
}

interface TCGPlayer {
	url: string;
	updatedAt: string;
	prices: TCGPlayerPrices;
}
interface TCGPlayerPrices {
	normal: ContextPrice;
	reverseHolofoil: ContextPrice;
}
interface ContextPrice {
	low: number;
	mid: number;
	high: number;
	market: number;
	directLow: number;
}

interface CardMarket {
	url: string;
	updatedAt: string;
	prices: CardMarketPrices;
}
interface CardMarketPrices {
	averageSellPrice: number;
	lowPrice: number;
	trendPrice: number;
	germanProLow?: number;
	suggestedPrice?: number;
	reverseHoloSell?: number;
	reverseHoloLow?: number;
	reverseHoloTrend?: number;
	lowPriceExPlus: number;
	avg1: number;
	avg7: number;
	avg30: number;
	reverseHoloAvg1?: number;
	reverseHoloAvg7?: number;
	reverseHoloAvg30?: number;
}

export class Card {
	id: string;
	private _model: CardInDeck;
	private _instance: number;	
	damage: number;

	constructor(data: CardInDeck, instance: number) {		
		this.id = data.id;
		this._model = data;
		this._instance = instance;		
		this.damage = 0;
	}
	/* restoreDefault() {
		Object.assign(this, new Card(this._model, this._instance));
	} */
	get model() {
		return this._model;
	}
	get instance() {
		return this._instance;
	}
	
	attackTarget(target: Card) {
	}
	putDamage(damage: number) {
		this.damage += damage;
	}
}





