import { RawCardData, CardData } from "../models/Card.js";
import { Modal } from "./Modal.js";

export class CardModal extends Modal {
	$wrapper: HTMLElement;

	constructor(cardData: RawCardData | CardData) {
		super('.card-modal');//this.$modalWrapper
		this.$wrapper = document.createElement('div');
		this.$wrapper.classList.add('card-modal-wrapper');
		this.$wrapper.id = `modal-${cardData.id}`;		
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
			</div>`;
        this.$wrapper.innerHTML = modalContent;
		const closeBtn: HTMLButtonElement = document.createElement('button');
		closeBtn.classList.add("close-btn");
		closeBtn.textContent = "X";
		this.$wrapper.appendChild(closeBtn);

        this.$modalWrapper.classList.add('modal-on');
        this.$modalWrapper.appendChild(this.$wrapper);

        this.onCloseButton(this.$wrapper.querySelector('.close-btn')!);
    }

    render(cardData: RawCardData | CardData) {
        this.createModalContent(cardData);
    }
}