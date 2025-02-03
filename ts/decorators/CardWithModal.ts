import { CardData, RawCardData } from "../models/Card.js"
import { CardModal } from "../templates/CardModal.js"
import { CardTemplate } from "../templates/CardTemplate.js"

export function cardWithModal(card: CardTemplate) {
	const img: HTMLImageElement = card.$wrapper.querySelector(`img.${card.cardData.id}`)!;		
    img.addEventListener('click', () => {
        const modal = new CardModal(card.cardData);
        modal.render(card.cardData);
    })
    return card
}
