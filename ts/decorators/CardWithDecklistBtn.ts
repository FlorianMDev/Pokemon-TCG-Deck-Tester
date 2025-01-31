import { CardTemplate } from "../templates/CardTemplate.js";
import { Card, CardData, CardInDeck, RawCardData } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
import { Config } from "../Config.js";
import { DeckBuilderManager } from "../templates/DeckBuilderManager.js";

export function CardWithDecklistBtn (cardTemplate: CardTemplate, decklist:Decklist){
	const cardName: HTMLDivElement = cardTemplate.$wrapper.querySelector(`div.deck-count`)!;

	let deckCount:number = 0;
	if (decklist.cards.length > 0) {
		const cardInDeck = decklist.cards.find( (card: CardInDeck) => card.id === cardTemplate.cardData.id);//Check if card in decklist
		if (!!cardInDeck) {
			deckCount = cardInDeck.deckCount;
		}
	}
	const RemoveFromDecklistBtn: HTMLButtonElement = document.createElement('button');
	RemoveFromDecklistBtn.type = "button";
	RemoveFromDecklistBtn.classList.add("-1");
	RemoveFromDecklistBtn.innerText = "-";
	cardName.appendChild(RemoveFromDecklistBtn);
	console.log(RemoveFromDecklistBtn);

	const $deckCounter: HTMLSpanElement = document.createElement('span');
	$deckCounter.classList.add("deck-counter");
	$deckCounter.textContent = `${deckCount}`;
	cardName.appendChild($deckCounter);

	const $slash: HTMLSpanElement = document.createElement('span');
	$slash.textContent = '/';
	cardName.appendChild($slash);

	const $maxCount: HTMLSpanElement = document.createElement('span');
	cardName.appendChild($maxCount);
	$maxCount.textContent = `${CardData.maxDeckCount(cardTemplate.cardData)}`;

	const AddToDecklistBtn: HTMLButtonElement = document.createElement('button');
	AddToDecklistBtn.type = "button";
	AddToDecklistBtn.classList.add("+1");
	AddToDecklistBtn.innerText = "+";
	cardName.appendChild(AddToDecklistBtn);
	console.log(AddToDecklistBtn);
	
	AddToDecklistBtn.addEventListener('click', () => {
		const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;	
		if (parseInt($deckCounter.textContent!) < CardData.maxDeckCount(cardTemplate.cardData)) {
			decklist.addCardToList(cardTemplate.cardData as RawCardData);
			$deckCounter.textContent = `${(parseInt($deckCounter.textContent!) + 1)}`;
		}				
    })
	RemoveFromDecklistBtn.addEventListener('click', () => {
		console.log(decklist.cards.find(c => c.id === cardTemplate.cardData.id)!);
		
		const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;	
		if (parseInt($deckCounter.textContent!) > 0) {
			decklist.removeCardFromList(decklist.cards.find(c => c.id === cardTemplate.cardData.id)!);
			$deckCounter.textContent = `${(parseInt($deckCounter.textContent!) - 1)}`;
		}		
    })

    return cardTemplate;
}
function updateDeckCount(cardTemplate: CardTemplate) {
	const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;	
}
