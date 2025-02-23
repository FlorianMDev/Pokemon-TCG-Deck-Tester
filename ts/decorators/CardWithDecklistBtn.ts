import { CardTemplate } from "../templates/CardTemplate.js";
import { Card, CardData, CardInCollection, CardInDeck, RawCardData } from "../models/Card.js";
import { Cardlist, Collection, Decklist } from "../models/Deck.js";
import { Config } from "../Config.js";
import { DeckBuilderManager } from "../templates/DeckBuilderManager.js";
import { cardWithModal } from "./CardWithModal.js";

export function CardWithDecklistBtn (cardTemplate: CardTemplate, cardlist:Decklist | Collection){
	const card: CardData | RawCardData = cardTemplate.cardData;
	const $cardName: HTMLDivElement = cardTemplate.$wrapper.querySelector('div.card-name')!;
	const $deckCountDiv: HTMLDivElement = document.createElement('div');
	$deckCountDiv.classList.add('deck-count');
	$cardName.appendChild($deckCountDiv);

	
	let deckCount:number = getDeckCount(card, cardlist);
	
	const RemoveFromDecklistBtn: HTMLButtonElement = document.createElement('button');
	RemoveFromDecklistBtn.type = "button";
	RemoveFromDecklistBtn.classList.add("minus-1");
	RemoveFromDecklistBtn.innerText = "-";
	$deckCountDiv.appendChild(RemoveFromDecklistBtn);

	const $deckCounter: HTMLSpanElement = document.createElement('span');
	$deckCounter.classList.add("deck-counter");
	$deckCounter.textContent = `${deckCount}`;
	$deckCountDiv.appendChild($deckCounter);

	if (cardlist instanceof Decklist) {
		const $slash: HTMLSpanElement = document.createElement('span');
		$slash.textContent = '/';
		$deckCountDiv.appendChild($slash);		

		const $maxCount: HTMLSpanElement = document.createElement('span');
		$deckCountDiv.appendChild($maxCount);
		if (card instanceof CardInDeck) {
			$maxCount.textContent = `${card.maxCount}`;
		} else $maxCount.textContent = `${CardData.maxDeckCount(card)}`;
	}
	
	const AddToDecklistBtn: HTMLButtonElement = document.createElement('button');
	AddToDecklistBtn.type = "button";
	AddToDecklistBtn.classList.add("plus-1");
	AddToDecklistBtn.innerText = "+";
	$deckCountDiv.appendChild(AddToDecklistBtn);
	
	/* AddToDecklistBtn.addEventListener('click', () => {
		const $deckCounter: HTMLElement = cardTemplate.$wrapper.querySelector("span.deck-counter")!;	
		if (parseInt($deckCounter.textContent!) < CardData.maxDeckCount(card)) {
			let newCardInDeck = new CardInDeck(card, decklist);
			decklist.addCardToList(newCardInDeck);
			$deckCounter.textContent = `${newCardInDeck.deckCount}`;
		}
    }) */
	

    return cardTemplate;
}

function getDeckCount(card: CardData | RawCardData, cardlist: Cardlist): number {
	let deckCount:number = 0;
	if (card instanceof CardInDeck) {
		deckCount = card.count;
	} else if (cardlist.cards.length > 0) {
		if (card instanceof CardInCollection && !!card.deckCount) {
			deckCount = card.deckCount;
			return deckCount;
		}
		const cardInDeck = cardlist.cards.find( (c: CardData) => c.id === card.id);//Check if card in decklist
		if (!!cardInDeck) {
			deckCount = cardInDeck.count;
		}
	}
	return deckCount;
}
