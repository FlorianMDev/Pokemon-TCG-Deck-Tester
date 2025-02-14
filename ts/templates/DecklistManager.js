import { Modal } from "./Modal.js";
export class CardListManager extends Modal {
    constructor(type) {
        super(`div#${type}-manager`); //this.$modalWrapper
        this.type = type;
        this.cardlistArray = [];
    }
    initializeDecks() {
        const cardlistListJSON = localStorage.getItem(`${this.type}-list`);
        if (!!cardlistListJSON) {
            this.cardlistArray = JSON.parse(cardlistListJSON);
            this.cardlistArray.forEach((list) => {
                this.appendDeckList(list);
            });
        }
    }
    appendDeckList(deck) {
        const list = this.type === 'decklist' ? 'deck' : this.type === 'collection' ? 'collection' : '';
        deck.$container = document.createElement('div');
        deck.$container.classList.add(`${list}-container`);
        const $deck = document.createElement('div');
        $deck.id = `${list}-${deck.name.replace(' ', '-')}`;
        $deck.classList.add(`${this.type}`);
        $deck.innerHTML = '<i class="fa-solid fa-box-archive"></i>';
        deck.$container.appendChild($deck);
        const $name = document.createElement('p');
        $name.classList.add(`${this.type}-name`);
        $name.textContent = deck.name;
        $deck.appendChild($name);
        $deck.innerHTML += `<p class="${list}-count">${deck.cardCount}${this.type === 'decklist' ? '/60' : ''} cards</p>`;
        const $deleteBtn = document.createElement('button');
        $deleteBtn.classList.add('delete-btn');
        $deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deck.$container.appendChild($deleteBtn);
        $deleteBtn.addEventListener('click', () => {
            this.deleteDecklist(deck);
        });
        this.$modalWrapper.querySelector(`div.${this.type}-container`).appendChild(deck.$container);
        this.onCloseButton($deck);
    }
    createModalContent() {
        const list = this.type === 'decklist' ? 'deck' : this.type === 'collection' ? 'collection' : '';
        this.$modalWrapper.classList.add('modal-on');
        this.$modalWrapper.innerHTML = `<button type="button" id="new-${list}-btn">New ${list}</button>`;
        const closeBtn = document.createElement('button');
        closeBtn.classList.add("close-btn");
        closeBtn.textContent = `Close ${list} Menu`;
        this.$modalWrapper.appendChild(closeBtn);
        this.addListeners(list);
        const $containerDiv = document.createElement('div');
        $containerDiv.classList.add(`${this.type}-container`);
        this.$modalWrapper.appendChild($containerDiv);
        this.initializeDecks();
    }
    deleteDecklist(deck) {
        localStorage.removeItem(`${this.type}: ${deck.name}`);
        const decklist = JSON.stringify(this);
        //Get the decklist list
        let decklistList = localStorage.getItem(`${this.type}-list`);
        let cardlistArray = [];
        cardlistArray = JSON.parse(decklistList);
        cardlistArray = cardlistArray.filter(d => d.name !== deck.name);
        localStorage.setItem(`${this.type}-list`, JSON.stringify(cardlistArray));
        deck.$container.remove();
    }
    addListeners(list) {
        this.onCloseButton(this.$modalWrapper.querySelector('.close-btn'));
        this.onCloseButton(this.$modalWrapper.querySelector(`#new-${list}-btn`));
    }
    render() {
        this.createModalContent();
    }
}
export class DecklistManager extends CardListManager {
    constructor() {
        super('decklist');
    }
}
