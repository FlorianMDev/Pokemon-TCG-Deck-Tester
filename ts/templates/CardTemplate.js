export class CardTemplate {
    constructor(cardData) {
        this._cardData = cardData;
        this.$wrapper = document.createElement('div');
        this.$wrapper.classList.add('card-template', cardData.id);
    }
    get cardData() {
        return this._cardData;
    }
    createHTMLCard() {
        const cardDataTemplate = `
            
			<div class= "card-name"><span class="name">${this._cardData.name}</span></div>
				<div class="card-picture">			
            	<img
					class="${this._cardData.id}"
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
