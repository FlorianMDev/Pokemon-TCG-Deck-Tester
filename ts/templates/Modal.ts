export class Modal {
	$modalWrapper: HTMLElement;
	constructor(selector: string) {
		if (!!document.querySelector(selector)) {
			this.$modalWrapper = document.querySelector(selector)!;
		}
		else {
			this.$modalWrapper = document.createElement('div');
			const classOrId:	string = selector[0];
			const selectorName: string = selector.replace(classOrId, '');
			if (classOrId === '.') this.$modalWrapper.classList.add(selectorName);
			else if (classOrId === '#') this.$modalWrapper.id = selectorName;						
		}
		this.$modalWrapper.classList.add('modal');
	}
	onCloseButton(btn:HTMLElement) {
        btn.addEventListener('click', () => Modal.closeModal(this.$modalWrapper));
    }
	static closeModal(modal: Element) {
		modal.classList.remove('modal-on');
		modal.innerHTML = "";
	}
}