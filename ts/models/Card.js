import { Config } from "../Config.js";
export class CardData {
    constructor(data, decklist /*  | Collection */) {
        var _a, _b, _c, _d, _e, _f;
        this.id = data.id;
        this.name = data.name;
        this.supertype = data.supertype;
        this.subtypes = Array.from((_a = data.subtypes) !== null && _a !== void 0 ? _a : []);
        this.hp = data.hp;
        this.types = Array.from((_b = data.types) !== null && _b !== void 0 ? _b : []);
        this.ancientTrait = data.ancientTrait;
        this.abilities = Array.from((_c = data.abilities) !== null && _c !== void 0 ? _c : []);
        this.attacks = Array.from((_d = data.attacks) !== null && _d !== void 0 ? _d : []);
        this.weaknesses = Array.from((_e = data.weaknesses) !== null && _e !== void 0 ? _e : []);
        this.resistances = Array.from((_f = data.resistances) !== null && _f !== void 0 ? _f : []);
        this.convertedRetreatCost = data.convertedRetreatCost;
        if (data instanceof CardData) {
            this.set = data.set;
            this.legality = data.legality;
            this.avgPrice = data.avgPrice;
        }
        else {
            this.set = `${data.set.id} - ${data.set.name}`;
            this.legality = data.legalities.standard;
            this.avgPrice = data.cardmarket ? data.cardmarket.prices.averageSellPrice : undefined;
        }
        this.rarity = data.rarity;
        this.images = data.images;
        if (!!decklist) {
            if (decklist.cards.length > 0) {
                const cardInDeck = decklist.cards.find((card) => card.id === this.id); //Check if card in decklist
                if (!!cardInDeck) {
                    this.deckCount = cardInDeck.deckCount;
                }
            }
            else
                this.deckCount = 0;
        }
    }
    static maxDeckCount(card /* , decklist:Decklist */) {
        if (card.supertype === "Energy" && (!card.subtypes || (!!card.subtypes && card.subtypes.includes("Basic")))) {
            return 60;
        }
        else if (!!card.subtypes && (card.subtypes.includes("ACE SPEC") || card.subtypes.includes("Radiant"))) {
            return 1;
        }
        else
            return Config.maxCardDeckCount;
    }
}
export class CardInDeck extends CardData {
    constructor(data, decklist) {
        super(data, decklist);
        this.deckCount = 1;
    }
}
export class Card {
    constructor(data, instance) {
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
    attackTarget(target) {
    }
    putDamage(damage) {
        this.damage += damage;
    }
}
