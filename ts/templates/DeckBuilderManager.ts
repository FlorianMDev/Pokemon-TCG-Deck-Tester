import { Config } from "../Config.js";
import { CardWithDecklistBtn } from "../decorators/CardWithDecklistBtn.js";
import { cardWithModal } from "../decorators/CardWithModal.js";
import { CardData, CardInDeck, RawCardData } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
import { CardTemplate } from "./CardTemplate.js";

export class DeckBuilderManager {
	$wrapper: HTMLElement;
	decklist: Decklist;
	pokémonCount: number;
	trainerCount: number;
	energyCount: number;
	cardCount: number;

	constructor(decklist: Decklist) {
		this.$wrapper = document.querySelector('div#deck-builder')!;
		this.$wrapper.classList.add('visible');
		this.decklist = decklist;
		this.pokémonCount = 0;
		this.trainerCount = 0;
		this.energyCount = 0;
		this.cardCount = 0;
	}
	createHTMLContent() {
		this.$wrapper.innerHTML = '';
		const $deckStateDiv: HTMLDivElement = document.createElement('div');
		$deckStateDiv.id = 'deck-state';
		this.$wrapper.appendChild($deckStateDiv);

		const $name: HTMLElement = document.createElement('h2');
		$name.id = "decklist-name";
		$name.innerHTML = "Unnamed";
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
		$totalCardCount.textContent = '0';
		$cardCounter.appendChild($totalCardCount);
		const $maxCardCount = document.createElement('span');
		$maxCardCount.id = "max-card-count";
		$maxCardCount.textContent = `/${Config.maxDeckSize} cards`;
		$cardCounter.appendChild($maxCardCount);
		$deckStateDiv.appendChild($cardCounter);

		const $cardData: HTMLElement = document.createElement('section');
		$cardData.classList.add('cards-data');
		this.$wrapper.appendChild($cardData);

		const $pokémonList: HTMLElement = document.createElement('div');
		$pokémonList.classList.add('Pokémon', 'sub-section');
		const $pokémonIndicator = document.createElement('h3');
		$pokémonIndicator.textContent = "Pokémon cards: ";
		const $pokémonCardCount = document.createElement('span');
		$pokémonCardCount.id = "pokémon-card-count";
		$pokémonCardCount.textContent = '0';
		$pokémonIndicator.appendChild($pokémonCardCount);
		$cardData.appendChild($pokémonIndicator);		
		$cardData.appendChild($pokémonList);
		
		const $trainerList: HTMLElement = document.createElement('div');
		$trainerList.classList.add('Trainer', 'sub-section');
		const $trainerIndicator = document.createElement('h3');
		$trainerIndicator.textContent = "Trainer cards: ";
		const $trainerCardCount = document.createElement('span');
		$trainerCardCount.id = "trainer-card-count";
		$trainerCardCount.textContent = '0';
		$trainerIndicator.appendChild($trainerCardCount);
		$cardData.appendChild($trainerIndicator);
		$cardData.appendChild($trainerList);

		const $energyList: HTMLElement = document.createElement('div');
		$energyList.classList.add('Energy', 'sub-section');
		const $energyIndicator = document.createElement('h3');
		$energyIndicator.textContent = "Energy cards: ";
		const $energyCardCount = document.createElement('span');
		$energyCardCount.id = "energy-card-count";
		$energyCardCount.textContent = '0';
		$energyIndicator.appendChild($energyCardCount);
		$cardData.appendChild($energyIndicator);
		$cardData.appendChild($energyList);

		$editNameBtn.addEventListener('click', () => {
			$editName.innerHTML = `<input name="edit-name" id="edit-name">
			<button type="submit">rename</button>`;			
			$deckStateDiv.querySelector("button")!.addEventListener('click', () => {
				this.decklist.name = $editName.querySelector("input")!.value;
				$name.textContent = this.decklist.name;
				$name.appendChild($editNameBtn);
				$editName.innerHTML = '';				
			})
		})
	}
	addCardToCount(card: RawCardData | CardData) {
		switch (card.supertype) {
			case 'Pokémon':
				this.pokémonCount++;
				this.$wrapper.querySelector('#pokémon-card-count')!.textContent = `${this.pokémonCount}`;
				break;
			case 'Trainer':
				this.trainerCount++;
				this.$wrapper.querySelector('#trainer-card-count')!.textContent = `${this.trainerCount}`;
				break;
			case 'Energy':
				this.energyCount++;
				this.$wrapper.querySelector('#energy-card-count')!.textContent = `${this.energyCount}`;
				break;
		}
		this.cardCount++;
		this.$wrapper.querySelector('#total-card-count')!.textContent = `${this.cardCount}`;
	}
	removeCardFromCount(card: RawCardData | CardData) {
		switch (card.supertype) {
			case 'Pokémon':
				this.pokémonCount--;
				this.$wrapper.querySelector('#pokémon-card-count')!.textContent = `${this.pokémonCount}`;
				break;
			case 'Trainer':
				this.trainerCount--;
				this.$wrapper.querySelector('#trainer-card-count')!.textContent = `${this.trainerCount}`;
				break;
			case 'Energy':
				this.energyCount--;
				this.$wrapper.querySelector('#energy-card-count')!.textContent = `${this.energyCount}`;
				break;
		}
		this.cardCount--;
		this.$wrapper.querySelector('#total-card-count')!.textContent = `${this.cardCount}`;
	}
	
	render() {
		this.createHTMLContent();
	}
}