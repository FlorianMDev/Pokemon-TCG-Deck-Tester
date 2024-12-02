import {Config, cardCount} from "../Config.js";
import {Deck, Decklist} from "./Deck.js";
import {Player} from "./Player.js";



export interface RawCardDataType {
	name: string;
	health: number;
	attack: number;
	defense: number;
	cost: number;
	ability?: Ability;
}

export class CardData implements RawCardDataType {
	private _id: number ;
	name: string;
	health: number;
	attack: number;
	defense: number;
	cost: number;
	ability?: Ability;

	private _classes?: string[];
	//private _deckCount: number;

	constructor(data: RawCardDataType, id: number) {
		this._id = id;
		this.name = data.name;
		this.health = data.health;
		this.attack = data.attack;
		this.defense = data.defense;
		this.cost = data.cost;
		this.ability = data.ability;
		//this._deckCount = 0;
	}
	get classes (): string[] {
		this._classes = [];
		if (this.name.includes("Warrior")) {
			this._classes.push("Warrior")
		}
		if (this.name.includes("Magician")) {
			this._classes.push("Magician")
		}
		if (this.name.includes("Archer")) {
			this._classes.push("Archer")
		}
		return this._classes;
	}
	get id() {
		return this._id;
	} 
	set id(num: number) {
		this._id = num;
	} 
}

export class CardInDeck extends CardData {
	private _deckCount: cardCount;
	constructor(cardData: CardData, id: number = cardData.id) {		
		super(cardData, id);
		this._deckCount = 1;
	}
	get deckCount() {
		return this._deckCount;
	}
	set deckCount(value) {
		this.deckCount = value;
	}
}

export class Card {
	id: number;
	private _instance: number;
	private _model: CardInDeck;
	name: string;
	health: number;
	attack: number;
	defense: number;
	cost: number;
	ability?: Ability;
	classes?: string[];

	constructor(data: CardInDeck, instance: number) {		
		this.id = data.id;
		this._instance = instance;
		this._model = data;
		this.name = data.name;
		this.health = data.health;
		this.attack = data.attack;
		this.defense = data.defense;
		this.cost = data.cost;
		this.ability = data.ability;
		this.classes = data.classes;
	}
	restoreDefault() {
		Object.assign(this, new Card(this._model, this._instance));
	}
	
	attackTarget(target: Card | Player) {
		if(this.attack > target.defense) {
			const damage: number = this.attack - target.defense;
			target.putDamage(damage);
		}		
	}
	putDamage(damage: number) {
		this.health -= damage;
	}	

	addClass(newClass: string) {
		this.classes?.push(newClass);
	}
	removeClass(classToRemove: string) {
		if (this.classes?.includes(classToRemove)) {
			this.classes.filter(c => c != classToRemove);
		}
	}
}


