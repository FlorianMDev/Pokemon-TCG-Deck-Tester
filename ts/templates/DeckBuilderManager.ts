import { Decklist } from "../models/Deck";

export class DeckBuilderManager {
	$wrapper: HTMLElement;
	decklist: Decklist;
	constructor(decklist: Decklist) {
		this.$wrapper = document.querySelector('div#deck-builder')!;
		this.$wrapper.classList.add('visible');
		this.decklist = decklist;
	}
	createHTMLContent() {
		const $nameDiv: HTMLDivElement = document.createElement('div');
		this.$wrapper.appendChild($nameDiv);

		const $name: HTMLElement = document.createElement('h2');
		$name.innerHTML = "Unnamed";
		$nameDiv.appendChild($name);

		const $editNameBtn = document.createElement('i');
    	$editNameBtn.id = "edit-name";
    	$editNameBtn.classList.add("fa-solid", "fa-pen-to-square");
		$nameDiv.appendChild($editNameBtn);

		const $editName: HTMLFormElement = document.createElement('form');
		$nameDiv.appendChild($editName);

		$editNameBtn.addEventListener('click', () => {
			$editName.innerHTML = `<input name="edit-name" id="edit-name">
			<button type="submit">rename</button>`;			
			$nameDiv.querySelector("button")!.addEventListener('click', () => {
				this.decklist.name = $editName.querySelector("input")!.value;
				$name.textContent = this.decklist.name;
				$editName.innerHTML = '';
			})

		})
	}
	
	render() {
		this.createHTMLContent();
	}
}