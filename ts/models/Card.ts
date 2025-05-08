import {Config} from "../Config.js";
//import { Collection } from "./Collection.js";
import {Cardlist, Deck, Decklist} from "./Deck.js";
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
	convertedRetreatCost?: number,
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

function isCardData(data: any): data is CardData {
    return data instanceof CardData || "isCardData" in data;
}
export class CardData {
	
	isCardData: boolean;//To identify as CardData when stored in localStorage and is no longer CardData

	id: string;
	name: string;
	supertype: string;
	subtypes: string[];
	hp?: number;
	types: string[];
	ancientTrait?: AncientTrait;
	abilities: Ability[];
	attacks: Attack[];
	weaknesses: Weakness[];
	resistances: Resistance[];
	convertedRetreatCost?: number;
	rarity: string;
	images: Images;

	setName : string;
	legality?: boolean | string;
	avgPrice?: number;
	dexNumber?: number;
	count: number;
	releaseDate: string;
	constructor(data: RawCardData | CardData, cardlist?: Cardlist/*  | Collection */) {
		this.isCardData = true;
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
		if (isCardData(data)) {
			console.log("is CardData");
			this.setName = data.setName;
			this.legality = data.legality;
			this.avgPrice = data.avgPrice;
			this.dexNumber = data.dexNumber;
			this.count = data.count;
			this.releaseDate = data.releaseDate;
		} else {
			this.setName = `${data.set.id} - ${data.set.name}`;
			this.legality = false;
			if (!!data.legalities.standard && data.legalities.standard === "Legal") this.legality = true;
			this.avgPrice = data.cardmarket ? data.cardmarket.prices.averageSellPrice : undefined;
			this.count = 1;
			this.releaseDate = data.set.releaseDate;
			if (this.supertype === "Pokémon") this.dexNumber = data.nationalPokedexNumbers[0];
		}
		this.rarity = data.rarity;
		this.images = data.images;

		
	}
	static maxDeckCount(card:RawCardData | CardData/* , decklist:Decklist */) {
		if (card.supertype === "Energy" && ((!!card.subtypes && card.subtypes.includes("Basic")) || !card.subtypes) ) {
			if (card instanceof CardInCollection && card.count < 60) return card.count;
			return 60;
		} else if (!!card.subtypes && (card.subtypes.includes("ACE SPEC") || card.subtypes.includes("Radiant")) ){
			return 1;
		} else {
			if (card instanceof CardInCollection && card.count < 4) return card.count;						
			return Config.maxCardDeckCount;
		}
	}	
}

export class CardInCollection extends CardData{
	deckCount?: number;
	constructor (data: RawCardData | CardData, decklist?: Decklist) {
		super(data, decklist);
		if (!!decklist) {
			if (decklist.cards.length > 0) {
				const cardInDeck = decklist.cards.find( (card: CardInDeck) => card.id === this.id);//Check if card in decklist
				if (!!cardInDeck) {
					this.deckCount = cardInDeck.count;
				}
			}
			else this.deckCount = 0;
		}
	}
}

export class CardInDeck extends CardData{
	maxCount: number;
	constructor (data: RawCardData | CardData, decklist?: Decklist) {
		super(data, decklist);
		if (data instanceof CardInDeck) this.maxCount = data.maxCount;
		else this.maxCount = CardData.maxDeckCount(this);
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





