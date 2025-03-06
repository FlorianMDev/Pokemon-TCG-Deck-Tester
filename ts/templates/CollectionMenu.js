export class CollectionMenu {
    constructor(collection) {
        this.collection = collection;
        this.$wrapper = document.querySelector('div#collection-menu');
    }
    createHTMLContent() {
        this.close();
        const $loadCollection = document.createElement('button');
        $loadCollection.classList.add('display-collection');
        $loadCollection.textContent = 'Display collection';
        this.$wrapper.appendChild($loadCollection);
        const $name = document.createElement('h2');
        $name.id = "collection-name";
        $name.innerHTML = !!this.collection.name ? this.collection.name : "(Unnamed)";
        this.$wrapper.appendChild($name);
        const $editNameBtn = document.createElement('i');
        $editNameBtn.id = "edit-name";
        $editNameBtn.classList.add("fa-solid", "fa-pen-to-square");
        $name.appendChild($editNameBtn);
        const $editName = document.createElement('form');
        this.$wrapper.appendChild($editName);
        const $saveCollectionBtn = document.createElement('button');
        $saveCollectionBtn.id = "save-collection";
        $saveCollectionBtn.textContent = "Save collection";
        this.$wrapper.appendChild($saveCollectionBtn);
        const $cardCounts = document.createElement('div');
        $cardCounts.id = "collection-cards-count";
        this.$wrapper.appendChild($cardCounts);
        const $cardCounter = document.createElement('p');
        $cardCounter.innerHTML = "Total cards: ";
        const $totalCardCount = document.createElement('span');
        $totalCardCount.id = "total-card-count";
        $totalCardCount.textContent = `${this.collection.cardCount}`;
        $cardCounter.appendChild($totalCardCount);
        $cardCounts.appendChild($cardCounter);
        const $pokémonIndicator = document.createElement('p');
        $pokémonIndicator.textContent = "Pokémon cards: ";
        const $pokémonCardCount = document.createElement('span');
        $pokémonCardCount.id = "pokémon-card-count";
        $pokémonCardCount.textContent = `${this.collection.pokémonCount}`;
        $pokémonIndicator.appendChild($pokémonCardCount);
        $cardCounts.appendChild($pokémonIndicator);
        const $trainerIndicator = document.createElement('p');
        $trainerIndicator.textContent = "Trainer cards: ";
        const $trainerCardCount = document.createElement('span');
        $trainerCardCount.id = "trainer-card-count";
        $trainerCardCount.textContent = `${this.collection.trainerCount}`;
        $trainerIndicator.appendChild($trainerCardCount);
        $cardCounts.appendChild($trainerIndicator);
        const $energyIndicator = document.createElement('p');
        $energyIndicator.textContent = "Energy cards: ";
        const $energyCardCount = document.createElement('span');
        $energyCardCount.id = "energy-card-count";
        $energyCardCount.textContent = `${this.collection.energyCount}`;
        $energyIndicator.appendChild($energyCardCount);
        $cardCounts.appendChild($energyIndicator);
        $editNameBtn.addEventListener('click', () => {
            $editName.innerHTML = `<input name="edit-name" id="edit-name">
			<button type="button">rename</button>`;
            const input = $editName.querySelector("input");
            input.value = this.collection.name;
            input.maxLength = 20;
            this.$wrapper.querySelector("button").addEventListener('click', (event) => {
                event.preventDefault();
                this.collection.name = $editName.querySelector("input").value;
                $name.textContent = !!this.collection.name ? this.collection.name : "(Unnamed)";
                $name.appendChild($editNameBtn);
                $editName.innerHTML = '';
            });
        });
        $saveCollectionBtn.addEventListener('click', () => {
            this.collection.saveToLocalStorage();
            this.$wrapper.querySelector('h2').textContent = this.collection.name;
            $name.appendChild($editNameBtn);
        });
    }
    addCardToCount(card) {
        switch (card.supertype) {
            case 'Pokémon':
                this.collection.pokémonCount++;
                this.$wrapper.querySelector('#pokémon-card-count').textContent = `${this.collection.pokémonCount}`;
                break;
            case 'Trainer':
                this.collection.trainerCount++;
                this.$wrapper.querySelector('#trainer-card-count').textContent = `${this.collection.trainerCount}`;
                break;
            case 'Energy':
                this.collection.energyCount++;
                this.$wrapper.querySelector('#energy-card-count').textContent = `${this.collection.energyCount}`;
                break;
        }
        this.collection.cardCount++;
        this.$wrapper.querySelector('#total-card-count').textContent = `${this.collection.cardCount}`;
    }
    removeCardFromCount(card) {
        switch (card.supertype) {
            case 'Pokémon':
                this.collection.pokémonCount--;
                this.$wrapper.querySelector('#pokémon-card-count').textContent = `${this.collection.pokémonCount}`;
                break;
            case 'Trainer':
                this.collection.trainerCount--;
                this.$wrapper.querySelector('#trainer-card-count').textContent = `${this.collection.trainerCount}`;
                break;
            case 'Energy':
                this.collection.energyCount--;
                this.$wrapper.querySelector('#energy-card-count').textContent = `${this.collection.energyCount}`;
                break;
        }
        this.collection.cardCount--;
        this.$wrapper.querySelector('#total-card-count').textContent = `${this.collection.cardCount}`;
    }
    close() {
        this.$wrapper.innerHTML = '';
    }
    render() {
        this.createHTMLContent();
    }
}
