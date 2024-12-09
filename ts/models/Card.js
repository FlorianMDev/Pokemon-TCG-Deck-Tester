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
        this._instance = instance;
        this._model = data;
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
