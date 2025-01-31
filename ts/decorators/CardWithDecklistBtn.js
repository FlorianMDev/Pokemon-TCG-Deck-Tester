import { CardData } from "../models/Card.js";
export function CardWithDecklistBtn(cardTemplate, decklist) {
    const cardName = cardTemplate.$wrapper.querySelector(`div.deck-count`);
    let deckCount = 0;
    if (decklist.cards.length > 0) {
        const cardInDeck = decklist.cards.find((card) => card.id === cardTemplate.cardData.id); //Check if card in decklist
        if (!!cardInDeck) {
            deckCount = cardInDeck.deckCount;
        }
    }
    const RemoveFromDecklistBtn = document.createElement('button');
    RemoveFromDecklistBtn.type = "button";
    RemoveFromDecklistBtn.classList.add("-1");
    RemoveFromDecklistBtn.innerText = "-";
    cardName.appendChild(RemoveFromDecklistBtn);
    console.log(RemoveFromDecklistBtn);
    const $deckCounter = document.createElement('span');
    $deckCounter.classList.add("deck-counter");
    $deckCounter.textContent = `${deckCount}`;
    cardName.appendChild($deckCounter);
    const $slash = document.createElement('span');
    $slash.textContent = '/';
    cardName.appendChild($slash);
    const $maxCount = document.createElement('span');
    cardName.appendChild($maxCount);
    $maxCount.textContent = `${CardData.maxDeckCount(cardTemplate.cardData)}`;
    const AddToDecklistBtn = document.createElement('button');
    AddToDecklistBtn.type = "button";
    AddToDecklistBtn.classList.add("+1");
    AddToDecklistBtn.innerText = "+";
    cardName.appendChild(AddToDecklistBtn);
    console.log(AddToDecklistBtn);
    AddToDecklistBtn.addEventListener('click', () => {
        const $deckCounter = cardTemplate.$wrapper.querySelector("span.deck-counter");
        if (parseInt($deckCounter.textContent) < CardData.maxDeckCount(cardTemplate.cardData)) {
            decklist.addCardToList(cardTemplate.cardData);
            $deckCounter.textContent = `${(parseInt($deckCounter.textContent) + 1)}`;
        }
    });
    RemoveFromDecklistBtn.addEventListener('click', () => {
        console.log(decklist.cards.find(c => c.id === cardTemplate.cardData.id));
        const $deckCounter = cardTemplate.$wrapper.querySelector("span.deck-counter");
        if (parseInt($deckCounter.textContent) > 0) {
            decklist.removeCardFromList(decklist.cards.find(c => c.id === cardTemplate.cardData.id));
            $deckCounter.textContent = `${(parseInt($deckCounter.textContent) - 1)}`;
        }
    });
    return cardTemplate;
}
function updateDeckCount(cardTemplate) {
    const $deckCounter = cardTemplate.$wrapper.querySelector("span.deck-counter");
}
