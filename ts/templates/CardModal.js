export class CardModal {
    constructor(cardData) {
        this.$wrapper = document.createElement('div');
        this.$wrapper.classList.add('card-modal-wrapper');
        this.$wrapper.id = `modal-${cardData.id}`;
        this.$modalWrapper = document.querySelector('.card-modal');
    }
    createModalContent(cardData) {
        this.$modalWrapper.innerHTML = "";
        const modalContent = `
            <div class="card-modal">
			<div class="card-picture">			
            	<img
					id="${cardData.id}"
					alt="${cardData.name}"
					src="${cardData.images.large}"
				/>
				</div> 
                <button type="button" class="close-btn">X<button>
            </div>
        `;
        this.$wrapper.innerHTML = modalContent;
        this.$modalWrapper.classList.add('modal-on');
        this.$modalWrapper.appendChild(this.$wrapper);
        this.onCloseButton();
    }
    render(cardData) {
        this.createModalContent(cardData);
    }
    onCloseButton() {
        this.$wrapper
            .querySelector('.close-btn')
            .addEventListener('click', () => {
            this.$modalWrapper.classList.remove('modal-on');
            this.$modalWrapper.innerHTML = "";
        });
    }
}
