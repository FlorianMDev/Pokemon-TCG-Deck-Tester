export class CardData {
    //private _deckCount: number;
    constructor(data, id) {
        this._id = id;
        this.name = data.name;
        this.health = data.health;
        this.attack = data.attack;
        this.defense = data.defense;
        this.cost = data.cost;
        this.ability = data.ability;
        //this._deckCount = 0;
    }
    get classes() {
        this._classes = [];
        if (this.name.includes("Warrior")) {
            this._classes.push("Warrior");
        }
        if (this.name.includes("Magician")) {
            this._classes.push("Magician");
        }
        if (this.name.includes("Archer")) {
            this._classes.push("Archer");
        }
        return this._classes;
    }
    get id() {
        return this._id;
    }
    set id(num) {
        this._id = num;
    }
}
export class CardInDeck extends CardData {
    constructor(cardData, id = cardData.id) {
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
    constructor(data, instance) {
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
    attackTarget(target) {
        if (this.attack > target.defense) {
            const damage = this.attack - target.defense;
            target.putDamage(damage);
        }
    }
    putDamage(damage) {
        this.health -= damage;
    }
    addClass(newClass) {
        var _a;
        (_a = this.classes) === null || _a === void 0 ? void 0 : _a.push(newClass);
    }
    removeClass(classToRemove) {
        var _a;
        if ((_a = this.classes) === null || _a === void 0 ? void 0 : _a.includes(classToRemove)) {
            this.classes.filter(c => c != classToRemove);
        }
    }
}
