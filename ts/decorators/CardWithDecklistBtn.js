import { Config } from "../Config";
export function CardWithDecklistBtn(cardDataTemplate, cardData, decklist) {
    const cardName = document.querySelector(`#${cardDataTemplate.$wrapper.id} div.name`);
    const deckCounter = document.createElement('span');
    //const deckCount = decklist.cards.find((c: CardInDeck) => c.id === cardData.id)?.deckCount;
    deckCounter.innerText = `0/${Config.maxCardDeckCount}`;
    cardName.appendChild(deckCounter);
    const addToDecklistBtn = document.createElement('button');
    addToDecklistBtn.innerText = "add to deck";
    addToDecklistBtn.addEventListener('click', () => {
        decklist.addCardToList(cardData);
    });
    cardName.appendChild(addToDecklistBtn);
    return cardDataTemplate;
}
