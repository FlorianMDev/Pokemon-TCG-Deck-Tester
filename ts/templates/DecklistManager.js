import { Modal } from "./Modal.js";
export class DecklistManager extends Modal {
    constructor() {
        super('div#decklist-manager'); //this.$modalWrapper
        this.decklistList = [];
    }
    initializeDecks() {
        const decklistListJSON = localStorage.getItem('decklist-list');
        let decklistIDs = [];
        if (!!decklistListJSON) {
            const decklistList = JSON.parse(decklistListJSON);
            decklistIDs = decklistList.list;
        }
        if (!!decklistIDs) {
            decklistIDs.forEach((deck) => {
                this.decklistList.push(JSON.parse(localStorage.getItem(`decklist-${deck}`)));
            });
        }
    }
    createModalContent() {
        var _a;
        this.$modalWrapper.classList.add('modal-on');
        this.$modalWrapper.innerHTML = `
		<div><button type="button" id="new-deck-btn">New deck</button></div>`;
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('decklist-container');
        this.$modalWrapper.appendChild(containerDiv);
        (_a = this.decklistList) === null || _a === void 0 ? void 0 : _a.forEach((deckId) => {
            containerDiv.innerHTML += `<div class="decklist" id="${deckId}"></div>`;
        });
        const closeBtn = document.createElement('button');
        closeBtn.classList.add("close-btn");
        closeBtn.textContent = "Close Deck Menu";
        this.$modalWrapper.appendChild(closeBtn);
        this.addListeners();
    }
    addListeners() {
        this.onCloseButton(this.$modalWrapper.querySelector('.close-btn'));
        this.onCloseButton(this.$modalWrapper.querySelector('#new-deck-btn'));
    }
    render() {
        this.createModalContent();
    }
}
