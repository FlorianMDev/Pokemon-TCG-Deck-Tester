import { Config } from "../Config.js";
function isCardData(data) {
    return data instanceof CardData || "isCardData" in data;
}
export class CardData {
    constructor(data, cardlist /*  | Collection */) {
        var _a, _b, _c, _d, _e, _f;
        this.isCardData = true;
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
        if (isCardData(data)) {
            console.log("is CardData");
            this.setName = data.setName;
            this.legality = data.legality;
            this.avgPrice = data.avgPrice;
            this.dexNumber = data.dexNumber;
            this.count = data.count;
            this.releaseDate = data.releaseDate;
        }
        else {
            this.setName = `${data.set.id} - ${data.set.name}`;
            this.legality = false;
            if (!!data.legalities.standard && data.legalities.standard === "Legal")
                this.legality = true;
            this.avgPrice = data.cardmarket ? data.cardmarket.prices.averageSellPrice : undefined;
            this.count = 1;
            this.releaseDate = data.set.releaseDate;
            if (this.supertype === "Pokémon")
                this.dexNumber = data.nationalPokedexNumbers[0];
        }
        this.rarity = data.rarity;
        this.images = data.images;
    }
    static maxDeckCount(card /* , decklist:Decklist */) {
        if (card.supertype === "Energy" && ((!!card.subtypes && card.subtypes.includes("Basic")) || !card.subtypes)) {
            if (card instanceof CardInCollection && card.count < 60)
                return card.count;
            return 60;
        }
        else if (!!card.subtypes && (card.subtypes.includes("ACE SPEC") || card.subtypes.includes("Radiant"))) {
            return 1;
        }
        else {
            if (card instanceof CardInCollection && card.count < 4)
                return card.count;
            return Config.maxCardDeckCount;
        }
    }
}
export class CardInCollection extends CardData {
    constructor(data, decklist) {
        super(data, decklist);
        if (!!decklist) {
            if (decklist.cards.length > 0) {
                const cardInDeck = decklist.cards.find((card) => card.id === this.id); //Check if card in decklist
                if (!!cardInDeck) {
                    this.deckCount = cardInDeck.count;
                }
            }
            else
                this.deckCount = 0;
        }
    }
}
export class CardInDeck extends CardData {
    constructor(data, decklist) {
        super(data, decklist);
        if (data instanceof CardInDeck)
            this.maxCount = data.maxCount;
        else
            this.maxCount = CardData.maxDeckCount(this);
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
