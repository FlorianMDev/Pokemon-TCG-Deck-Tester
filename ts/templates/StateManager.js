export class StateManager {
    constructor(state) {
        this.$wrapper = document.querySelector('div.state-manager');
        this.state = state;
        this.$displayBtns = [];
    }
    createHTMLContent() {
        this.$deckMenuBtn = document.createElement('button');
        this.$deckMenuBtn.classList.add("card-list", "switch-state");
        this.$deckMenuBtn.textContent = "Open Deck Menu";
        this.$wrapper.appendChild(this.$deckMenuBtn);
        console.log(this.$deckMenuBtn);
    }
    updateStateTo(state) {
        if (this.state != state) {
            this.state = state;
            /*switch (state) {
                case 'card-list':
                    this.state = state;
                case 'deck-builder':
                    ;
            }*/
        }
        return this.state;
    }
}
