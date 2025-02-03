import { RawCardData, CardData } from "../models/Card.js";
import { CardModal } from "./CardModal.js";

export class CardTemplate {
	private _cardData: RawCardData | CardData;
	$wrapper: HTMLDivElement;
    constructor(cardData: RawCardData | CardData) {
        this._cardData = cardData;

        this.$wrapper = document.createElement('div');
        this.$wrapper.classList.add('card-template', cardData.id);
    }

    get cardData() {
        return this._cardData
    }
	createHTMLCard():HTMLDivElement {
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
        `
        this.$wrapper.innerHTML = cardDataTemplate;
		return this.$wrapper;
    }
	/* addModals() {
		const img: HTMLImageElement = document.querySelector(`#${this.$wrapper.id}`)!;
    	img.addEventListener('click', () => {
        	const DeckMenuCard: CardModal = new CardModal(this._cardData);
		})
	} */
	

    /*
	addToDecklistButton() {
        const that = this
		const btn: HTMLBtnElement = document.createElement('button');
		btn.innerHTML =
			`<div class="add-to-decklist-btn">
                <button>+</button>
            </div>`;
        
        this.$wrapper
            .querySelector('.add-to-decklist-btn')
            .addEventListener('click', function() {
                if (this.classList.contains('wished')) {
                    this.classList.remove('wished')
                    that.WishListSubject.fire('DEC')
                } else {
                    this.classList.add('wished')
                    that.WishListSubject.fire('INC')
                }
            })
    } */

    
}
