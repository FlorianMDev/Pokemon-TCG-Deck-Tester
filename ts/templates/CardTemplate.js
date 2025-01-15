export class CardTemplate {
    constructor(cardData) {
        this._cardData = cardData;
        this.$wrapper = document.createElement('div');
        this.$wrapper.classList.add('card-template');
        this.$wrapper.id = `template-${cardData.id}`;
    }
    get cardData() {
        return this._cardData;
    }
    createHTMLCard() {
        const cardDataTemplate = `
            
			<div class= "name"><h3 class="fs-16">${this._cardData.name}</h3></div>
				<div class="card-picture">			
            	<img
					id="${this._cardData.id}"
					alt="${this._cardData.name}"
					src="${this._cardData.images.large}"
				/>
				</div>             
			</div>
        `;
        this.$wrapper.innerHTML = cardDataTemplate;
        return this.$wrapper;
    }
}
