import { Api } from "./api/Api.js";
import { Card, RawCardData, Set } from "./models/Card.js";

export class CardProperties {
	api: Api;
	supertypes: string[];
	subtypes: string[];
	types: string[];
	sets: string[];
	rarities: string[];
	
	constructor(api: Api) {
		this.api = api;
		this.supertypes = ["Pokémon", "Energy", "Trainer"];
		this.subtypes = [];
		this.types = [];
		this.sets = [];
		this.rarities = [];
	}
	
	async loadProperties() {
		this.subtypes = await this.api.getProperty('subtypes');
		console.log(this.subtypes);

		this.types = await this.api.getProperty('types');
		console.log(this.subtypes);

		const sets = await this.api.getProperty('sets');
		console.log(sets);
		
		this.sets = sets.map((s: Set) => `${s.id} - ${s.name}`)
		console.log(this.sets);

		this.rarities = await this.api.getProperty('rarities');
		console.log(this.rarities);
		localStorage.setItem("card-properties",JSON.stringify(this));
	}
	

}