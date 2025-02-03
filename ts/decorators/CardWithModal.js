import { CardModal } from "../templates/CardModal.js";
export function cardWithModal(card) {
    const img = card.$wrapper.querySelector(`img.${card.cardData.id}`);
    img.addEventListener('click', () => {
        const modal = new CardModal(card.cardData);
        modal.render(card.cardData);
    });
    return card;
}
