import { CardWithDecklistBtn } from "../decorators/CardWithDecklistBtn.js";
import { cardWithModal } from "../decorators/CardWithModal.js";
import { CardInDeck } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
import { CardTemplate } from "./CardTemplate.js";

export class DeckBuilderManager {
	$wrapper: HTMLElement;
	decklist: Decklist;
	constructor(decklist: Decklist) {
		this.$wrapper = document.querySelector('div#deck-builder')!;
		this.$wrapper.classList.add('visible');
		this.decklist = decklist;
	}
	createHTMLContent() {
		this.$wrapper.innerHTML = '';
		const $nameDiv: HTMLDivElement = document.createElement('div');
		this.$wrapper.appendChild($nameDiv);

		const $name: HTMLElement = document.createElement('p');
		$name.id = "decklist-name";
		$name.innerHTML = "Unnamed";
		$nameDiv.appendChild($name);

		const $editNameBtn = document.createElement('i');
    	$editNameBtn.id = "edit-name";
    	$editNameBtn.classList.add("fa-solid", "fa-pen-to-square");
		$name.appendChild($editNameBtn);

		const $editName: HTMLFormElement = document.createElement('form');
		$nameDiv.appendChild($editName);

		const $cardData: HTMLElement = document.createElement('section');
		$cardData.classList.add('cards-data');
		this.$wrapper.appendChild($cardData);

		$editNameBtn.addEventListener('click', () => {
			$editName.innerHTML = `<input name="edit-name" id="edit-name">
			<button type="submit">rename</button>`;			
			$nameDiv.querySelector("button")!.addEventListener('click', () => {
				this.decklist.name = $editName.querySelector("input")!.value;
				$name.textContent = this.decklist.name;
				$name.appendChild($editNameBtn);
				$editName.innerHTML = '';				
			})
		})
	}
	addCard(card: CardInDeck, $to: HTMLElement) {
		let cardTemplate: CardTemplate = new CardTemplate(card);
		const $cardTemplate: HTMLDivElement = cardTemplate.createHTMLCard();
		cardTemplate = CardWithDecklistBtn(cardTemplate, this.decklist);
		$to.appendChild($cardTemplate);
		cardTemplate = cardWithModal(cardTemplate);
	}
	
	render() {
		this.createHTMLContent();
	}
}