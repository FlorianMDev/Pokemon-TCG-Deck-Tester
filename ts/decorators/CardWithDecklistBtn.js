import { CardData } from "../models/Card.js";
export function CardWithDecklistBtn(cardTemplate, decklist) {
    const $cardName = cardTemplate.$wrapper.querySelector('div.card-name');
    const $deckCountDiv = document.createElement('div');
    $deckCountDiv.classList.add('deck-count');
    $cardName.appendChild($deckCountDiv);
    let deckCount = 0;
    if (decklist.cards.length > 0) {
        const cardInDeck = decklist.cards.find((card) => card.id === cardTemplate.cardData.id); //Check if card in decklist
        if (!!cardInDeck) {
            deckCount = cardInDeck.deckCount;
        }
    }
    const RemoveFromDecklistBtn = document.createElement('button');
    RemoveFromDecklistBtn.type = "button";
    RemoveFromDecklistBtn.classList.add("minus-1");
    RemoveFromDecklistBtn.innerText = "-";
    $deckCountDiv.appendChild(RemoveFromDecklistBtn);
    const $deckCounter = document.createElement('span');
    $deckCounter.classList.add("deck-counter");
    $deckCounter.textContent = `${deckCount}`;
    $deckCountDiv.appendChild($deckCounter);
    const $slash = document.createElement('span');
    $slash.textContent = '/';
    $deckCountDiv.appendChild($slash);
    const $maxCount = document.createElement('span');
    $deckCountDiv.appendChild($maxCount);
    $maxCount.textContent = `${CardData.maxDeckCount(cardTemplate.cardData)}`;
    const AddToDecklistBtn = document.createElement('button');
    AddToDecklistBtn.type = "button";
    AddToDecklistBtn.classList.add("plus-1");
    AddToDecklistBtn.innerText = "+";
    $deckCountDiv.appendChild(AddToDecklistBtn);
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
function updateDeckCount(cardTemplate) {
    const $deckCounter = cardTemplate.$wrapper.querySelector("span.deck-counter");
}
