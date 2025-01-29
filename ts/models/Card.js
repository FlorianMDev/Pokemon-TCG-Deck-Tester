export class CardData {
    constructor(data, decklist /*  | Collection */) {
        this.id = data.id;
        this.name = data.name;
        this.supertype = data.supertype;
        this.subtypes = data.subtypes;
        this.hp = data.hp;
        this.types = data.types;
        this.rules = data.rules;
        this.ancientTrait = data.ancientTrait;
        this.abilities = data.abilities;
        this.attacks = data.attacks;
        this.weaknesses = data.weaknesses;
        this.resistances = data.resistances;
        this.convertedRetreatCost = data.convertedRetreatCost;
        this.set = `${data.set.id} - ${data.set.name}`;
        this.rarity = data.rarity;
        this.legality = data.legalities.standard;
        this.images = data.images;
        this.avgPrice = data.cardmarket.prices.averageSellPrice;
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
export class CardInDeck {
    constructor(data) {
        this._deckCount = 1;
        this.id = data.id;
        this.name = data.name;
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
    constructor(data, instance) {
        this.id = data.id;
        this._model = data;
        this._instance = instance;
        this.damage = 0;
    }
    /* restoreDefault() {
        Object.assign(this, new Card(this._model, this._instance));
    } */
    attackTarget(target) {
    }
    putDamage(damage) {
        this.damage += damage;
    }
}
