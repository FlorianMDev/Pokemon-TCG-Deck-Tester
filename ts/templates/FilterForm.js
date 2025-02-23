import { Config } from "../Config.js";
export class FilterForm {
    constructor() {
        this.$wrapper = document.querySelector('div#filter-div');
        this.$filterFieldsDiv = document.createElement('div');
        this.$filterFieldsDiv.id = 'filter-fields-div';
        this.$wrapper.appendChild(this.$filterFieldsDiv);
        this.$submitBtn = document.createElement('button');
        this.$submitBtn.type = "button";
        this.$submitBtn.classList.add("submit-filters");
        this.$submitBtn.textContent = "Search with these filters";
        this.$filterFieldsDiv.appendChild(this.$submitBtn);
        this.$formWrapper = document.createElement('form');
        this.$formWrapper.id = 'filter-form';
        this.$filterFieldsDiv.appendChild(this.$formWrapper);
        this._filterFields = [];
        this.filters = "";
        this._cardProperties = null;
        console.log("filter-form created");
    }
    set cardProperties(cardProperties) {
        console.log('setting card properties');
        this._cardProperties = cardProperties;
    }
    get cardProperties() {
        return this._cardProperties;
    }
    get filterFields() {
        return this._filterFields;
    }
    createCollectionLoader(collectionList) {
        this.$collectionLoader = document.createElement('div');
        this.$collectionLoader.id = "collection-loader";
        this.$collectionLoader.innerHTML = `
		<label for="collection-list">Load a collection</label>
		<button class="toggle-expand" type="button">Expand</button>
		<div class="select-container">			
			<select name="collection-list" id="collection-list" >		
				<option value="none">none</option>
			</select>
			<button type="button" class="display-collection">Load</button>
		</div>`;
        const select = this.$collectionLoader.querySelector('.select-container select');
        collectionList.forEach((col) => {
            select.innerHTML +=
                `<option value="${col.name}">${col.name}</option>`;
        });
        this.$wrapper.prepend(this.$collectionLoader);
        const expandBtn = this.$collectionLoader.querySelector('button.toggle-expand');
        expandBtn.addEventListener('click', () => this.expandOrReduceField(expandBtn, select, collectionList.length));
    }
    createResetBtn() {
        const $resetBtn = document.createElement('button');
        $resetBtn.setAttribute("type", "button");
        $resetBtn.classList.add("reset-filters");
        $resetBtn.innerHTML = "reset filters";
        this.$formWrapper.appendChild($resetBtn);
        $resetBtn.addEventListener('click', () => this.resetFilters());
    }
    initializeFilterFields() {
        this.createResetBtn();
        console.log('initializing');
        const filterLegality = new FilterField('filter-legality', 'checkbox');
        filterLegality.$formWrapper.innerHTML = `
			<label for="Legal">Legal in standard format</label>
			<input type="checkbox" id="Legal" name="Legal">
		`;
        //this.createCheckboxFilter('filter-legality', 'Legality in standard format', ['Legal']);
        this._filterFields.push(filterLegality);
        const filterName = this.createInputFilter('filter-name', 'Search by name');
        this._filterFields.push(filterName);
        const filterSupertype = this.createSelectFilter('filter-supertype', 'Filter by supertype', this.cardProperties.supertypes);
        this._filterFields.push(filterSupertype);
        const filterSubtype = this.createCheckboxFilter('filter-subtypes', 'Filter by subtype', this.cardProperties.subtypes);
        this._filterFields.push(filterSubtype);
        const filterHP = this.createRangeFilter('filter-hp', 'Search by HP', 10, Config.maxHP);
        this._filterFields.push(filterHP);
        const filterType = this.createSelectFilter('filter-types', 'Filter by type', this.cardProperties.types);
        this._filterFields.push(filterType);
        const filterWeaknesses = this.createSelectFilter('filter-weaknesses', 'Filter by weaknesses', this.cardProperties.types);
        this._filterFields.push(filterWeaknesses);
        const filterResistances = this.createSelectFilter('filter-resistances', 'Filter by resistances', this.cardProperties.types);
        this._filterFields.push(filterResistances);
        const filterRetreatCost = this.createCheckboxFilter('filter-convertedRetreatCost', 'Filter by retreat cost', ['0', '1', '2', '3', '4', '5']);
        filterRetreatCost.field.setAttribute("size", '2');
        this._filterFields.push(filterRetreatCost);
        const filterSets = this.createInputFilter('filter-set', 'Search by sets');
        this._filterFields.push(filterSets);
        const filterRarities = this.createSelectFilter('filter-rarity', 'Filter by rarity', this.cardProperties.rarities);
        this._filterFields.push(filterRarities);
        this.renderAll();
        this.createResetBtn();
    }
    renderAll() {
        this._filterFields.forEach((ff) => {
            ff.render(this.$formWrapper);
        });
    }
    resetFilters() {
        console.log("resetting filters");
        this.$formWrapper.innerHTML = '';
        this._filterFields = [];
        this.initializeFilterFields();
    }
    createInputFilter(id, label, type) {
        let filter = new InputFilterField(id, 'input');
        filter.$formWrapper.innerHTML = `
		<label for="${filter.id}">${label}</label>
		<input name="${filter.id}" id="${filter.id}"${!!type ? ` type=${type}` : ""}>`;
        return filter;
    }
    createRangeFilter(id, label, step, max, type) {
        let filter = this.createInputFilter(id, label, "text");
        const $p = document.createElement('p');
        $p.innerHTML += filter.$formWrapper.innerHTML;
        filter.$formWrapper.innerHTML = $p.outerHTML;
        filter.$formWrapper.innerHTML += `<div id="${id}-slider-range"></div>`;
        $(function () {
            $(`#${id}-slider-range`).slider({
                range: true,
                min: 0,
                max: max,
                step: step,
                values: [0, max],
                slide: function (event, ui) {
                    console.log(ui.values);
                    $(`#${filter.id}`).val((ui.values[0] === 0 && ui.values[1] === max) ? "any" : ui.values[0] + " to " + ui.values[1]);
                }
            });
            $(`#${filter.id}`).val("any");
        });
        /* filter.field.setAttribute("step", `${step}`);
        filter.field.setAttribute("min", `0`);
        filter.field.setAttribute("max", `${max}`);
        filter.field.setAttribute("value", `0`);
        filter.$formWrapper.innerHTML += `<output name="${id}-output" id="${id}" for="${id}">any</output>`; */
        let $output = filter.$formWrapper.querySelector('output');
        filter.field.addEventListener("input", (e) => {
            const inputField = filter.field;
            let output = inputField.value;
            if (inputField.value === '0')
                $output.innerHTML = 'any';
            else
                $output.innerHTML = output;
        });
        //filter.field.addEventListener();
        return filter;
    }
    createSelectFilter(id, label, options, multiple) {
        let filter = new FilterField(id, 'select');
        filter.$formWrapper.innerHTML = `
		<label for="${filter.id}">${label}</label>
		${filter.id === "filter-convertedRetreatCost" ? "" : `<button class="toggle-expand" type="button">Expand</button>`}
		<div class="select-container">			
			<select name="${filter.id}" id="${filter.id}"${multiple ? ` ${multiple}` : ""}>		
				<option value=""></option>
			</select>
		</div>`;
        options.forEach((op) => {
            filter.field.innerHTML += `<option value="${op.toLowerCase().replace(/\s+/g, '-')}">${op}</option>`;
        });
        if (filter.id !== "filter-convertedRetreatCost") {
            const expandBtn = filter.$formWrapper.querySelector('button.toggle-expand');
            const that = this;
            expandBtn.addEventListener('click', () => that.expandOrReduceField(expandBtn, filter.field, options.length));
        }
        return filter;
    }
    createCheckboxFilter(id, label, options) {
        let filter = new FilterField(id, 'fieldset');
        filter.$formWrapper.innerHTML = `
		<fieldset name="${filter.id}" id ="${filter.id}">
			<legend>${label}</legend>
		</fieldset>`;
        options.forEach((op) => {
            filter.field.innerHTML += `
			<div>
				<input type="checkbox" id="${op}" name="${op}"/>
				<label for="${op}">${op}</label>
			</div>`;
        });
        return filter;
    }
    expandOrReduceField(btn, field, length) {
        btn.classList.toggle('expand');
        if (btn.classList.contains('expand')) {
            field.setAttribute("size", `${length + 1}`);
            btn.innerText = "reduce";
        }
        else {
            field.setAttribute("size", '1');
            btn.innerText = "expand";
        }
    }
    multipleQueries(ff, checked) {
        let filter = "";
        for (let input of checked) {
            if (input != checked[0]) {
                filter += ' OR ';
            }
            if (ff.field instanceof HTMLFieldSetElement)
                filter += this.convertToQuery(ff.id, input.id);
            else
                filter += this.convertToQuery(ff.id, input.value);
        }
        if (checked.length > 1)
            return ` (${filter})`;
        else
            return ` ${filter}`;
    }
    convertToQuery(property, requested) {
        switch (property) {
            case "filter-legality":
                return `legalities.standard:"${requested}"`;
            case "filter-name":
                return `${`${property}`.replace('filter-', '')}:"*${requested}*"`;
            case "filter-set":
                return `${`${property}.name`.replace('filter-', '')}:"*${requested}*"`;
            case 'filter-weaknesses':
            case 'filter-resistances':
                return `!${`${property}.type`.replace('filter-', '')}:"${requested}"`;
            case 'filter-hp':
                if (requested === "any")
                    return '';
                return `${`${property}`.replace('filter-', '')}:[${requested}]`;
            case 'filter-rarity':
                return `!${property.replace('filter-', '')}:"${requested.replace(/-/g, ' ')}"`;
            case 'filter-convertedRetreatCost':
                return `!${property.replace('filter-', '')}:${requested}`;
            default:
                return `!${property.replace('filter-', '')}:"${requested.replace(/-/g, ' ')}"`;
        }
    }
    getFilters() {
        this.filters = '';
        this._filterFields.forEach((ff) => {
            if (ff.field instanceof HTMLFieldSetElement) {
                const checkedInputs = ff.field.querySelectorAll('div input:checked');
                console.log(checkedInputs);
                if (checkedInputs.length < 1)
                    return;
                this.filters += this.multipleQueries(ff, checkedInputs);
            }
            else if (ff.type === "checkbox") {
                const input = ff.$formWrapper.querySelector(`input:checked`);
                if (!!input) {
                    this.filters += ` ${this.convertToQuery(ff.id, input.id)}`;
                }
            }
            else {
                if (!!ff.field.value) {
                    if (ff.field.multiple === false) {
                        this.filters += ` ${this.convertToQuery(ff.id, ff.field.value)}`;
                        //ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
                    }
                    else {
                        const checkedOptions = ff.field.querySelectorAll('div option:checked');
                        console.log(checkedOptions);
                        if (checkedOptions.length < 1)
                            return;
                        this.filters += this.multipleQueries(ff, checkedOptions);
                        //ex: " (subtype:"EX" OR subtype:"VSTAR")"			
                    }
                }
            }
        });
        console.log(this.filters);
        return this.filters;
    }
    getCollectionFilters() {
        this._filterFields.forEach((ff) => {
            if (ff.field instanceof HTMLFieldSetElement) {
                const checkedInputs = ff.field.querySelectorAll('div input:checked');
                console.log(checkedInputs);
                if (checkedInputs.length < 1)
                    return;
                this.filters += this.multipleQueries(ff, checkedInputs);
            }
            else if (ff.type === "checkbox") {
                const input = ff.$formWrapper.querySelector(`input:checked`);
                if (!!input) {
                    this.filters += ` ${this.convertToQuery(ff.id, input.id)}`;
                }
            }
            else {
                if (!!ff.field.value) {
                    if (ff.field.multiple === false) {
                        this.filters += ` ${this.convertToQuery(ff.id, ff.field.value)}`;
                        //ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
                    }
                    else {
                        const checkedOptions = ff.field.querySelectorAll('div option:checked');
                        console.log(checkedOptions);
                        if (checkedOptions.length < 1)
                            return;
                        this.filters += this.multipleQueries(ff, checkedOptions);
                        //ex: " (subtype:"EX" OR subtype:"VSTAR")"			
                    }
                }
            }
        });
    }
}
export class FilterField {
    //private _field: HTMLInputElement | HTMLSelectElement;
    constructor(id, type) {
        this.id = id;
        this.$formWrapper = document.createElement('div');
        this.$formWrapper.classList.add(`${id}-wrapper`, "filter-field");
        this.type = type;
    }
    get $label() {
        return this.$formWrapper.querySelector('label');
    }
    get field() {
        return this.$formWrapper.querySelector(`${this.type}#${this.id}`);
    }
    set field(field) {
        this.field = field;
    }
    /* set $output(output: HTMLOutputElement) {
        this.$formWrapper.appendChild(output);
        this.$output = output;
    } */
    render(parent) {
        parent.appendChild(this.$formWrapper);
    }
}
class InputFilterField extends FilterField {
    constructor(id, type) {
        super(id, type);
    }
    get field() {
        return this.$formWrapper.querySelector(`${this.type}#${this.id}`);
    }
    set field(field) {
        this.field = field;
    }
}
class SelectFilterField extends FilterField {
    constructor(id, type) {
        super(id, type);
    }
    get field() {
        return this.$formWrapper.querySelector(`${this.type}#${this.id}`);
    }
    set field(field) {
        this.field = field;
    }
}
