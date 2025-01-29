import { Decklist } from "../models/Deck.js";
import { Modal } from "./Modal.js";

export class DecklistManager extends Modal {
	decklistList?: Decklist[];
	constructor() {		
		super('div#decklist-manager');//this.$modalWrapper
		this.decklistList = [];
	}
	initializeDecks(){
		const decklistListJSON: string | null = localStorage.getItem('decklist-list');
		let decklistIDs: string[] = [];
		if (!!decklistListJSON) {
			const decklistList = JSON.parse(decklistListJSON);
			decklistIDs = decklistList.list;
		}		

		if (!!decklistIDs) {
			decklistIDs.forEach( (deck: string) => {
				this.decklistList!.push(JSON.parse (localStorage.getItem(`decklist-${deck}`)!) as Decklist);
			})
		}
	}
	createModalContent () {
		this.$modalWrapper.classList.add('modal-on');
		this.$modalWrapper.innerHTML = `
		<div><button type="button" id="new-deck-btn">New deck</button></div>`;
		const containerDiv:HTMLDivElement = document.createElement('div');
		containerDiv.classList.add('decklist-container');
		this.$modalWrapper.appendChild(containerDiv);
		this.decklistList?.forEach((deckId:Decklist) => {
			containerDiv.innerHTML += `<div class="decklist" id="${deckId}"></div>`
		})
		const closeBtn: HTMLButtonElement = document.createElement('button');
		closeBtn.classList.add("close-btn");
    	closeBtn.textContent = "Close Deck Menu";
		this.$modalWrapper.appendChild(closeBtn);
		this.addListeners();
		
	}
	addListeners() {
		this.onCloseButton(this.$modalWrapper.querySelector('.close-btn')!);
		this.onCloseButton(this.$modalWrapper.querySelector('#new-deck-btn')!);
	}
	render() {
		this.createModalContent();
	}
}