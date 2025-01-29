import { DecklistManager } from "./DecklistManager.js";

export class StateManager {
	$wrapper: HTMLDivElement;
	$displayBtns: HTMLButtonElement[];
	state: string;
	private _$deckMenuBtn?: HTMLButtonElement;
	constructor(state: string) {
		this.$wrapper = document.querySelector('div.state-manager')!;
		this.state = state;
		this.$displayBtns = [];		
	}
	get $deckMenuBtn () {
		return this._$deckMenuBtn!;
	}
	set $deckMenuBtn (btn:HTMLButtonElement) {
		this._$deckMenuBtn = btn;
	}
	initializeBtns() {
		this.$deckMenuBtn = document.createElement('button');
    	this.$deckMenuBtn.classList.add("card-list", "switch-state");
    	this.$deckMenuBtn.textContent = "Open Deck Menu";
		this.$wrapper.appendChild(this.$deckMenuBtn);
		this.addListener();
		console.log(this.$deckMenuBtn);
	}
	addListener() {
		this.$deckMenuBtn.addEventListener('click', () => {
			console.log('click open deck');
			
			const modal = new DecklistManager();
			modal.render();
		})		
	}
	updateStateTo(state: string) {
		if (this.state != state) {
			this.state = state;
			/*switch (state) {
				case 'card-list':
					this.state = state;
				case 'deck-builder':
					;
			}*/
		}
		return this.state;		
	}
}