export class PageManager {
    constructor(id) {
        this.id = id;
        this.$pageManagerWrapper = document.querySelector(`div.page-manager#${this.id}`);
        this.$pageManagerWrapper.innerHTML = `
		<button class="first-page">First page</button>
		<button class="previous-page">Previous page</button>
		<span class="page-count"></span>
		<button class="next-page">Next page</button>
		<button class="last-page">Last page</button>
		<div class="page-selector">
			<button type="button">Go to page</button>
			<input type="number" value="1" min="1" max="190"/>			
        </div>`;
        this.$pageCounter = document.querySelector(`div.page-manager#${this.id} span.page-count`);
        this.$firstPageBtn = document.querySelector(`div.page-manager#${this.id} button.first-page`);
        this.$previousPageBtn = document.querySelector(`div.page-manager#${this.id} button.previous-page`);
        this.$nextPageBtn = document.querySelector(`div.page-manager#${this.id} button.next-page`);
        this.$lastPageBtn = document.querySelector(`div.page-manager#${this.id} button.last-page`);
        this.$pageSelectorInput = document.querySelector(`div.page-manager#${this.id} div.page-selector input`);
        this.$pageSelectorBtn = document.querySelector(`div.page-manager#${this.id} div.page-selector button`);
    }
}
