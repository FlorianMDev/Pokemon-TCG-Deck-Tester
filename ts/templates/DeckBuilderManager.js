import { CardWithDecklistBtn } from "../decorators/CardWithDecklistBtn.js";
import { cardWithModal } from "../decorators/CardWithModal.js";
import { CardTemplate } from "./CardTemplate.js";
export class DeckBuilderManager {
    constructor(decklist) {
        this.$wrapper = document.querySelector('div#deck-builder');
        this.$wrapper.classList.add('visible');
        this.decklist = decklist;
    }
    createHTMLContent() {
        this.$wrapper.innerHTML = '';
        const $nameDiv = document.createElement('div');
        this.$wrapper.appendChild($nameDiv);
        const $name = document.createElement('p');
        $name.id = "decklist-name";
        $name.innerHTML = "Unnamed";
        $nameDiv.appendChild($name);
        const $editNameBtn = document.createElement('i');
        $editNameBtn.id = "edit-name";
        $editNameBtn.classList.add("fa-solid", "fa-pen-to-square");
        $name.appendChild($editNameBtn);
        const $editName = document.createElement('form');
        $nameDiv.appendChild($editName);
        const $cardData = document.createElement('section');
        $cardData.classList.add('cards-data');
        this.$wrapper.appendChild($cardData);
        $editNameBtn.addEventListener('click', () => {
            $editName.innerHTML = `<input name="edit-name" id="edit-name">
			<button type="submit">rename</button>`;
            $nameDiv.querySelector("button").addEventListener('click', () => {
                this.decklist.name = $editName.querySelector("input").value;
                $name.textContent = this.decklist.name;
                $name.appendChild($editNameBtn);
                $editName.innerHTML = '';
            });
        });
    }
    addCard(card, $to) {
        let cardTemplate = new CardTemplate(card);
        const $cardTemplate = cardTemplate.createHTMLCard();
        cardTemplate = CardWithDecklistBtn(cardTemplate, this.decklist);
        $to.appendChild($cardTemplate);
        cardTemplate = cardWithModal(cardTemplate);
    }
    render() {
        this.createHTMLContent();
    }
}
