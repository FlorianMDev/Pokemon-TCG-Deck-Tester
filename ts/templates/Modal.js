export class Modal {
    constructor(selector) {
        if (!!document.querySelector(selector)) {
            this.$modalWrapper = document.querySelector(selector);
        }
        else {
            this.$modalWrapper = document.createElement('div');
            const classOrId = selector[0];
            const selectorName = selector.replace(classOrId, '');
            if (classOrId === '.')
                this.$modalWrapper.classList.add(selectorName);
            else if (classOrId === '#')
                this.$modalWrapper.id = selectorName;
        }
        this.$modalWrapper.classList.add('modal');
    }
    onCloseButton(btn) {
        btn.addEventListener('click', () => Modal.closeModal(this.$modalWrapper));
    }
    static closeModal(modal) {
        modal.classList.remove('modal-on');
        modal.innerHTML = "";
    }
}
