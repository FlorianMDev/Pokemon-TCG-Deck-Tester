import { CardTemplate } from "../templates/CardTemplate.js";
import { CardInDeck, RawCardData } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
import { Config } from "../Config.js";

export function CardWithDecklistBtn(cardTemplate: CardTemplate, cardData: RawCardData, decklist: Decklist) {
	const cardName: HTMLDivElement = cardTemplate.$wrapper.querySelector(`div.deck-count`)!;
	console.log(cardTemplate.$wrapper);
	console.log(cardTemplate.$wrapper.querySelector(`div.deck-count`));
	
	console.log(cardName);
	

	const RemoveFromDecklistBtn: HTMLButtonElement = document.createElement('button');
	RemoveFromDecklistBtn.type = "button";
	RemoveFromDecklistBtn.innerText = "-";
	cardName.appendChild(RemoveFromDecklistBtn);

	let deckCount:number = 0;
	if (decklist.cards.length > 0) {
		const cardInDeck = decklist.cards.find( (card: CardInDeck) => card.id === cardData.id);//Check if card in decklist
		if (!!cardInDeck) {
			deckCount = cardInDeck.deckCount;
		}
	}
	const $deckCounter: HTMLSpanElement = document.createElement('span');
	$deckCounter.textContent = `${deckCount}`;
	cardName.appendChild($deckCounter);

	cardName.innerHTML += "<span>/</span>";
	const $maxCount: HTMLSpanElement = document.createElement('span');
	cardName.appendChild($maxCount);
	switch (cardData.supertype) {
		case 'energy':
			$maxCount.textContent = "60";
		case 'ACE SPEC':
		case 'Radiant':
			$maxCount.textContent = "1";
		default:
			$maxCount.textContent = `${Config.maxCardDeckCount}`;
	}		

	const AddToDecklistBtn: HTMLButtonElement = document.createElement('button');
	AddToDecklistBtn.type = "button";
	AddToDecklistBtn.innerText = "+";
	cardName.appendChild(AddToDecklistBtn);
	AddToDecklistBtn.addEventListener('click', () => {		
		if (parseInt($deckCounter.textContent!) < Config.maxCardDeckCount || cardData.supertype === "energy") {
			decklist.addCardToList(cardData);
			$deckCounter.textContent = `${(parseInt($deckCounter.textContent!) + 1).toString()}`;
		}
		console.log(decklist.cards);		
    })

    return cardTemplate;
}
