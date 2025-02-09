import { Modal } from "./Modal.js";
export class DecklistManager extends Modal {
    constructor() {
        super('div#decklist-manager'); //this.$modalWrapper
        this.decklistArray = [];
    }
    initializeDecks() {
        const decklistListJSON = localStorage.getItem('decklist-list');
        if (!!decklistListJSON) {
            this.decklistArray = JSON.parse(decklistListJSON);
            this.decklistArray.forEach((deck) => {
                this.appendDeckList(deck);
            });
        }
    }
    appendDeckList(deck) {
        const $container = document.createElement('div');
        $container.classList.add('deck-container');
        const $deck = document.createElement('div');
        $deck.id = `deck-${deck.name.replace(' ', '-')}`;
        $deck.classList.add('decklist');
        $deck.innerHTML = '<i class="fa-solid fa-box-archive"></i>';
        $container.appendChild($deck);
        const $name = document.createElement('p');
        $name.classList.add("decklist-name");
        $name.textContent = deck.name;
        $deck.appendChild($name);
        $deck.innerHTML += `<p class="deck-count">${deck.cardCount}/60 cards</p>`;
        const $deleteBtn = document.createElement('button');
        $deleteBtn.classList.add('delete-btn');
        $deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        $container.appendChild($deleteBtn);
        $deleteBtn.addEventListener('click', () => {
            localStorage.removeItem(`decklist: ${deck.name}`);
            const decklist = JSON.stringify(this);
            //Get the decklist list
            let decklistList = localStorage.getItem('decklist-list');
            let decklistArray = [];
            decklistArray = JSON.parse(decklistList);
            decklistArray = decklistArray.filter(d => d.name !== deck.name);
            localStorage.setItem('decklist-list', JSON.stringify(decklistArray));
        });
        this.$modalWrapper.querySelector('div.decklist-container').appendChild($container);
        this.onCloseButton($deck);
    }
    createModalContent() {
        this.$modalWrapper.classList.add('modal-on');
        this.$modalWrapper.innerHTML = `<button type="button" id="new-deck-btn">New deck</button>`;
        const closeBtn = document.createElement('button');
        closeBtn.classList.add("close-btn");
        closeBtn.textContent = "Close Deck Menu";
        this.$modalWrapper.appendChild(closeBtn);
        this.addListeners();
        const $containerDiv = document.createElement('div');
        $containerDiv.classList.add('decklist-container');
        this.$modalWrapper.appendChild($containerDiv);
        this.initializeDecks();
    }
    addListeners() {
        this.onCloseButton(this.$modalWrapper.querySelector('.close-btn'));
        this.onCloseButton(this.$modalWrapper.querySelector('#new-deck-btn'));
    }
    render() {
        this.createModalContent();
    }
}
