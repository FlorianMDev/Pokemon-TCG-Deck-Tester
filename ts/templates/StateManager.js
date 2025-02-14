export class StateManager {
    constructor(state) {
        this.$wrapper = document.querySelector('div.state-manager');
        this.state = state;
    }
    createHTMLContent() {
        this.$wrapper.innerHTML = '';
        this.$deckMenuBtn = document.createElement('button');
        this.$deckMenuBtn.id = "deck-menu-btn";
        this.$deckMenuBtn.textContent = "Open deck menu";
        this.$wrapper.appendChild(this.$deckMenuBtn);
        this.$collectionMenuBtn = document.createElement('button');
        this.$collectionMenuBtn.id = "collection-menu-btn";
        this.$collectionMenuBtn.textContent = "Open collection menu";
        this.$wrapper.appendChild(this.$collectionMenuBtn);
        if (this.state !== 'card-list') {
            this.$defaultCardListBtn = document.createElement('button');
            this.$defaultCardListBtn.id = 'card-list-btn';
            this.$defaultCardListBtn.textContent = "Default card list";
            this.$wrapper.appendChild(this.$defaultCardListBtn);
        }
        console.log(this.$deckMenuBtn);
    }
    updateStateTo(state) {
        if (this.state !== state) {
            this.state = state;
            this.createHTMLContent();
            /* switch (state) {
                case 'card-list':
                case 'deck-builder':
                    ;
            } */
        }
        return this.state;
    }
}
