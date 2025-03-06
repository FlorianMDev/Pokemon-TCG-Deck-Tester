import { Config } from "../Config.js";
import { CardWithDecklistBtn } from "../decorators/CardWithDecklistBtn.js";
import { cardWithModal } from "../decorators/CardWithModal.js";
import { CardData, CardInDeck, RawCardData } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
import { CardTemplate } from "./CardTemplate.js";

export class DeckBuilderManager {
	$wrapper: HTMLElement;
	decklist: Decklist;

	constructor(decklist: Decklist) {
		this.$wrapper = document.querySelector('div#deck-builder')!;		
		this.decklist = decklist;
	}
	createHTMLContent() {
		this.$wrapper.innerHTML = '';
		this.$wrapper.classList.add('visible');
		const $deckStateDiv: HTMLDivElement = document.createElement('div');
		$deckStateDiv.id = 'deck-state';
		this.$wrapper.appendChild($deckStateDiv);

		const $name: HTMLElement = document.createElement('h2');
		$name.id = "decklist-name";
		$name.innerHTML = !!this.decklist.name? this.decklist.name: "(Unnamed)";
		$deckStateDiv.appendChild($name);

		const $editNameBtn = document.createElement('i');
    	$editNameBtn.id = "edit-name";
    	$editNameBtn.classList.add("fa-solid", "fa-pen-to-square");
		$name.appendChild($editNameBtn);

		const $editName: HTMLFormElement = document.createElement('form');
		$deckStateDiv.appendChild($editName);

		const $cardCounter = document.createElement('p');
		const $totalCardCount = document.createElement('span');
		$totalCardCount.id = "total-card-count";
		$totalCardCount.textContent = `${this.decklist.cardCount}`;
		$cardCounter.appendChild($totalCardCount);
		const $maxCardCount = document.createElement('span');
		$maxCardCount.id = "max-card-count";
		$maxCardCount.textContent = `/${Config.maxDeckSize} cards`;
		$cardCounter.appendChild($maxCardCount);
		$deckStateDiv.appendChild($cardCounter);

		const $saveDeckBtn = document.createElement('button');
		$saveDeckBtn.id = "save-decklist";
		$saveDeckBtn.textContent = "Save deck";
		$deckStateDiv.appendChild($saveDeckBtn);

		const $cardData: HTMLElement = document.createElement('section');
		$cardData.classList.add('cards-data');
		this.$wrapper.appendChild($cardData);

		const $pokémonList: HTMLElement = document.createElement('div');
		$pokémonList.classList.add('Pokémon', 'sub-section');
		const $pokémonIndicator = document.createElement('h3');
		$pokémonIndicator.textContent = "Pokémon cards: ";
		const $pokémonCardCount = document.createElement('span');
		$pokémonCardCount.id = "pokémon-card-count";
		$pokémonCardCount.textContent = `${this.decklist.pokémonCount}`;
		$pokémonIndicator.appendChild($pokémonCardCount);
		$cardData.appendChild($pokémonIndicator);		
		$cardData.appendChild($pokémonList);
		
		const $trainerList: HTMLElement = document.createElement('div');
		$trainerList.classList.add('Trainer', 'sub-section');
		const $trainerIndicator = document.createElement('h3');
		$trainerIndicator.textContent = "Trainer cards: ";
		const $trainerCardCount = document.createElement('span');
		$trainerCardCount.id = "trainer-card-count";
		$trainerCardCount.textContent = `${this.decklist.trainerCount}`;
		$trainerIndicator.appendChild($trainerCardCount);
		$cardData.appendChild($trainerIndicator);
		$cardData.appendChild($trainerList);

		const $energyList: HTMLElement = document.createElement('div');
		$energyList.classList.add('Energy', 'sub-section');
		const $energyIndicator = document.createElement('h3');
		$energyIndicator.textContent = "Energy cards: ";
		const $energyCardCount = document.createElement('span');
		$energyCardCount.id = "energy-card-count";
		$energyCardCount.textContent = `${this.decklist.energyCount}`;
		$energyIndicator.appendChild($energyCardCount);
		$cardData.appendChild($energyIndicator);
		$cardData.appendChild($energyList);

		$editNameBtn.addEventListener('click', () => {
			$editName.innerHTML = `<input name="edit-name" id="edit-name">
			<button type="submit">rename</button>`;
			const input: HTMLInputElement = $editName.querySelector("input")!;
			input.value = this.decklist.name;
			input.maxLength=20;
			$deckStateDiv.querySelector("button")!.addEventListener('click', (event) => {
				event.preventDefault();
				this.decklist.name = $editName.querySelector("input")!.value;
				$name.textContent = !!this.decklist.name? this.decklist.name: "(Unnamed)";
				$name.appendChild($editNameBtn);
				$editName.innerHTML = '';				
			})
		})
		$saveDeckBtn.addEventListener('click', () => {
			this.decklist.saveToLocalStorage();
			this.$wrapper.querySelector('h2')!.textContent = this.decklist.name;
			$name.appendChild($editNameBtn);
		})
	}
	addCardToCount(card: RawCardData | CardData) {
		switch (card.supertype) {
			case 'Pokémon':
				this.decklist.pokémonCount++;
				this.$wrapper.querySelector('#pokémon-card-count')!.textContent = `${this.decklist.pokémonCount}`;
				break;
			case 'Trainer':
				this.decklist.trainerCount++;
				this.$wrapper.querySelector('#trainer-card-count')!.textContent = `${this.decklist.trainerCount}`;
				break;
			case 'Energy':
				this.decklist.energyCount++;
				this.$wrapper.querySelector('#energy-card-count')!.textContent = `${this.decklist.energyCount}`;
				break;
		}
		this.decklist.cardCount++;
		this.$wrapper.querySelector('#total-card-count')!.textContent = `${this.decklist.cardCount}`;
	}
	removeCardFromCount(card: RawCardData | CardData) {
		switch (card.supertype) {
			case 'Pokémon':
				this.decklist.pokémonCount--;
				this.$wrapper.querySelector('#pokémon-card-count')!.textContent = `${this.decklist.pokémonCount}`;
				break;
			case 'Trainer':
				this.decklist.trainerCount--;
				this.$wrapper.querySelector('#trainer-card-count')!.textContent = `${this.decklist.trainerCount}`;
				break;
			case 'Energy':
				this.decklist.energyCount--;
				this.$wrapper.querySelector('#energy-card-count')!.textContent = `${this.decklist.energyCount}`;
				break;
		}
		this.decklist.cardCount--;
		this.$wrapper.querySelector('#total-card-count')!.textContent = `${this.decklist.cardCount}`;
	}
	
	render() {
		this.createHTMLContent();
	}
}