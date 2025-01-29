import { Config } from "../Config.js";
export function CardWithDecklistBtn(cardTemplate, cardData, decklist) {
    const cardName = cardTemplate.$wrapper.querySelector(`div.deck-count`);
    console.log(cardTemplate.$wrapper);
    console.log(cardTemplate.$wrapper.querySelector(`div.deck-count`));
    console.log(cardName);
    const RemoveFromDecklistBtn = document.createElement('button');
    RemoveFromDecklistBtn.type = "button";
    RemoveFromDecklistBtn.innerText = "-";
    cardName.appendChild(RemoveFromDecklistBtn);
    let deckCount = 0;
    if (decklist.cards.length > 0) {
        const cardInDeck = decklist.cards.find((card) => card.id === cardData.id); //Check if card in decklist
        if (!!cardInDeck) {
            deckCount = cardInDeck.deckCount;
        }
    }
    const $deckCounter = document.createElement('span');
    $deckCounter.textContent = `${deckCount}`;
    cardName.appendChild($deckCounter);
    cardName.innerHTML += "<span>/</span>";
    const $maxCount = document.createElement('span');
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
    const AddToDecklistBtn = document.createElement('button');
    AddToDecklistBtn.type = "button";
    AddToDecklistBtn.innerText = "+";
    cardName.appendChild(AddToDecklistBtn);
    AddToDecklistBtn.addEventListener('click', () => {
        if (parseInt($deckCounter.textContent) < Config.maxCardDeckCount || cardData.supertype === "energy") {
            decklist.addCardToList(cardData);
            $deckCounter.textContent = `${(parseInt($deckCounter.textContent) + 1).toString()}`;
        }
        console.log(decklist.cards);
    });
    return cardTemplate;
}
