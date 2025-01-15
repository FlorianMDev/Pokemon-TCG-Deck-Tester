class GameForm {
	$player1DeckSelector: HTMLSelectElement;
	$player2DeckSelector: HTMLSelectElement;
	constructor() {
		this.$player1DeckSelector = document.querySelector("select#player-deck")!;
		this.$player2DeckSelector = document.querySelector("select#cpu-deck")!;
	}
	loadDeckList() {
		
	}
}