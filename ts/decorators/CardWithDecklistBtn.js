import { CardData, CardInCollection, CardInDeck } from "../models/Card.js";
import { Decklist } from "../models/Deck.js";
export function CardWithDecklistBtn(cardTemplate, cardlist) {
    const card = cardTemplate.cardData;
    const $cardName = cardTemplate.$wrapper.querySelector('div.card-name');
    const $deckCountDiv = document.createElement('div');
    $deckCountDiv.classList.add('deck-count');
    $cardName.appendChild($deckCountDiv);
    let deckCount = getDeckCount(card, cardlist);
    const RemoveFromDecklistBtn = document.createElement('button');
    RemoveFromDecklistBtn.type = "button";
    RemoveFromDecklistBtn.classList.add("minus-1");
    RemoveFromDecklistBtn.innerText = "-";
    $deckCountDiv.appendChild(RemoveFromDecklistBtn);
    const $deckCounter = document.createElement('span');
    $deckCounter.classList.add("deck-counter");
    $deckCounter.textContent = `${deckCount}`;
    $deckCountDiv.appendChild($deckCounter);
    if (cardlist instanceof Decklist) {
        const $slash = document.createElement('span');
        $slash.textContent = '/';
        $deckCountDiv.appendChild($slash);
        const $maxCount = document.createElement('span');
        $deckCountDiv.appendChild($maxCount);
        if (card instanceof CardInDeck) {
            $maxCount.textContent = `${card.maxCount}`;
        }
        else
            $maxCount.textContent = `${CardData.maxDeckCount(card)}`;
    }
    const AddToDecklistBtn = document.createElement('button');
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
function getDeckCount(card, cardlist) {
    let deckCount = 0;
    if (card instanceof CardInDeck) {
        deckCount = card.count;
    }
    else if (cardlist.cards.length > 0) {
        if (card instanceof CardInCollection && !!card.deckCount) {
            deckCount = card.deckCount;
            return deckCount;
        }
        const cardInDeck = cardlist.cards.find((c) => c.id === card.id); //Check if card in decklist
        if (!!cardInDeck) {
            deckCount = cardInDeck.count;
        }
    }
    return deckCount;
}
