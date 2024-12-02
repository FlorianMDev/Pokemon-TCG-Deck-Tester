class Ability {
	name: string;
    effect: Function;

	constructor(name: string, effect: Function) {
		this.name = name;
		this.effect = effect;
	}
	
}