class Form {
	$playerDeckSelector: HTMLSelectElement;
	$CPUDeckSelector: HTMLSelectElement;
	constructor() {
		this.$playerDeckSelector = document.querySelector("select#player-deck")!;
		this.$CPUDeckSelector = document.querySelector("select#cpu-deck")!;
	}
	loadDeckList() {
		
	}
}