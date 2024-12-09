import {Config, cardCount} from "../Config.js";
import {Deck, Decklist} from "./Deck.js";
import {Player} from "./Player.js";

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

interface Set {
	id: string;
	name: string
	series: string;
	printedTotal: number;
	total: number;
	legalities: Legalities;
	ptcgoCode: string;
	releaseDate: string;
	updatedAt: string;
	images: Image;
}

interface Legalities {
	unlimited: string;
	standard: string;
	expanded: string;
}

interface Image {
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
	ancientTrait?: AncientTrait[];
	abilities?: Ability[];
	attacks: Attack[];
	weaknesses: Weakness[];
	resistances: Resistance[];
	retreatCost: string[];
	set : Set;
	number: string;
	artist: string;
	rarity: string;
	flavorText: string;
	nationalPokedexNumbers: number[];
	legalities: Legalities;
	images: Image[];
	tcgplayer: TCGPlayer;
	cardmarket: CardMarket;
}

export class CardInDeck{
	private _deckCount: cardCount;
	id: string;
	name: string
	supertype: string
	subtypes: string[];
	constructor (data: RawCardData) {
		this._deckCount = 1;
		this.id = data.id;
		this.name = data.name
		this.supertype = data.supertype;
		this.subtypes = Array.from(data.subtypes);
	}
	get deckCount() {
		return this._deckCount;
	}
	set deckCount(value) {
		this.deckCount = value;
	}
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
	
	attackTarget(target: Card) {
	}
	putDamage(damage: number) {
		this.damage += damage;
	}
}


