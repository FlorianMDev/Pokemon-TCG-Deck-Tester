export class CardTemplate {
    constructor(cardData) {
        this._cardData = cardData;
        this.$wrapper = document.createElement('div');
        this.$wrapper.classList.add('card-template');
        this.$wrapper.id = `card-${cardData.id}`;
    }
    get cardData() {
        return this._cardData;
    }
    createHTMLCard() {
        const cardDataTemplate = `
            
			<div class= "card-name"><span class="fs-16">${this._cardData.name}</span><div class="deck-count"></div></div>
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
