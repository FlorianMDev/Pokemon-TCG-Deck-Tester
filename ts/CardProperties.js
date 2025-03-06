var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class CardProperties {
    constructor(api) {
        this.api = api;
        this.supertypes = ["Pokémon", "Energy", "Trainer"];
        this.subtypes = [];
        this.types = [];
        this.sets = [];
        this.rarities = [];
    }
    loadProperties() {
        return __awaiter(this, void 0, void 0, function* () {
            this.subtypes = yield this.api.getProperty('subtypes');
            console.log(this.subtypes);
            this.types = yield this.api.getProperty('types');
            console.log(this.subtypes);
            const sets = yield this.api.getProperty('sets');
            console.log(sets);
            this.sets = sets.map((s) => `${s.id} - ${s.name}`);
            console.log(this.sets);
            this.rarities = yield this.api.getProperty('rarities');
            console.log(this.rarities);
            localStorage.setItem("card-properties", JSON.stringify(this));
        });
    }
}
