import { CardTemplate } from "../templates/CardTemplate.js";
import { Card, CardData, CardInDeck, RawCardData } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
import { Config } from "../Config.js";
import { DeckBuilderManager } from "../templates/DeckBuilderManager.js";
import { cardWithModal } from "./CardWithModal.js";

export function CardWithDecklistBtn (cardTemplate: CardTemplate, decklist:Decklist){
	const $cardName: HTMLDivElement = cardTemplate.$wrapper.querySelector('div.card-name')!;
	const $deckCountDiv: HTMLDivElement = document.createElement('div');
	$deckCountDiv.classList.add('deck-count');
	$cardName.appendChild($deckCountDiv);


	let deckCount:number = 0;
	if (decklist.cards.length > 0) {
		const cardInDeck = decklist.cards.find( (card: CardInDeck) => card.id === cardTemplate.cardData.id);//Check if card in decklist
		if (!!cardInDeck) {
			deckCount = cardInDeck.deckCount;
		}
	}
	const RemoveFromDecklistBtn: HTMLButtonElement = document.createElement('button');
	RemoveFromDecklistBtn.type = "button";
	RemoveFromDecklistBtn.classList.add("minus-1");
	RemoveFromDecklistBtn.innerText = "-";
	$deckCountDiv.appendChild(RemoveFromDecklistBtn);
	console.log(RemoveFromDecklistBtn);

	const $deckCounter: HTMLSpanElement = document.createElement('span');
	$deckCounter.classList.add("deck-counter");
	$deckCounter.textContent = `${deckCount}`;
	$deckCountDiv.appendChild($deckCounter);

	const $slash: HTMLSpanElement = document.createElement('span');
	$slash.textContent = '/';
	$deckCountDiv.appendChild($slash);

	const $maxCount: HTMLSpanElement = document.createElement('span');
	$deckCountDiv.appendChild($maxCount);
	$maxCount.textContent = `${CardData.maxDeckCount(cardTemplate.cardData)}`;

	const AddToDecklistBtn: HTMLButtonElement = document.createElement('button');
	AddToDecklistBtn.type = "button";
	AddToDecklistBtn.classList.add("plus-1");
	AddToDecklistBtn.innerText = "+";
	$deckCountDiv.appendChild(AddToDecklistBtn);
	console.log(AddToDecklistBtn);
	
	/* AddToDecklistBtn.addEventListener('click', () => {
		const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;	
		if (parseInt($deckCounter.textContent!) < CardData.maxDeckCount(cardTemplate.cardData)) {
			let newCardInDeck = new CardInDeck(cardTemplate.cardData, decklist);
			decklist.addCardToList(newCardInDeck);
			$deckCounter.textContent = `${newCardInDeck.deckCount}`;
		}
    }) */
	

    return cardTemplate;
}
function updateDeckCount(cardTemplate: CardTemplate) {
	const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;	
}
