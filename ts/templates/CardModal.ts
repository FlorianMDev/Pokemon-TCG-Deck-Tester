import { RawCardData, CardData } from "../models/Card.js";

export class CardModal {
	$wrapper: HTMLElement;
	$modalWrapper: HTMLDivElement;

	constructor(cardData: RawCardData | CardData) {
		this.$wrapper = document.createElement('div');
		this.$wrapper.classList.add('card-modal-wrapper');
		this.$wrapper.id = `modal-${cardData.id}`;
		this.$modalWrapper = document.querySelector('.card-modal')!;		
	}
	createModalContent(cardData: RawCardData | CardData) {
		this.$modalWrapper.innerHTML = "";
        const modalContent = `
			<div class="card-picture">			
            	<img
					id="${cardData.id}"
					alt="${cardData.name}"
					src="${cardData.images.large}"
				/>
				</div> 
                <button type="button" class="close-btn">X<button>
        `;

        this.$wrapper.innerHTML = modalContent;

        this.$modalWrapper.classList.add('modal-on');
        this.$modalWrapper.appendChild(this.$wrapper);

        this.onCloseButton();
    }

    render(cardData: RawCardData | CardData) {
        this.createModalContent(cardData);
    }

	onCloseButton() {
        this.$wrapper
            .querySelector('.close-btn')!
            .addEventListener('click', () => CardModal.closeModal(this.$modalWrapper));
    }
	static closeModal(modal: HTMLDivElement) {
		modal.classList.remove('modal-on');
		modal.innerHTML = "";
	}
}