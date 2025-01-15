import { CardTemplate } from "../templates/CardTemplate";
import { CardInDeck, CardData } from "../models/Card";
import { Decklist } from "../models/Deck";
import { Config } from "../Config";

export function CardWithDecklistBtn(cardDataTemplate: CardTemplate, cardData: CardData, decklist: Decklist) {
	const cardName: HTMLDivElement = document.querySelector(`#${cardDataTemplate.$wrapper.id} div.name`)!;

	const deckCounter: HTMLSpanElement = document.createElement('span');
	//const deckCount = decklist.cards.find((c: CardInDeck) => c.id === cardData.id)?.deckCount;
	deckCounter.innerText = `0/${Config.maxCardDeckCount}`;
	cardName.appendChild(deckCounter);

	const addToDecklistBtn: HTMLButtonElement = document.createElement('button');
	addToDecklistBtn.innerText = "add to deck";
	addToDecklistBtn.addEventListener('click', () => {
		decklist.addCardToList(cardData);
    })
	cardName.appendChild(addToDecklistBtn);

	
	
	

    return cardDataTemplate;
}
