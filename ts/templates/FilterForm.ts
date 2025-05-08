
import { CardProperties } from "../CardProperties.js";
import { Config } from "../Config.js";
import { CardData, CardInCollection, RawCardData } from "../models/Card.js";
import { Collection } from "../models/Deck.js";

export class FilterForm {
	$wrapper: HTMLDivElement;
	$formWrapper: HTMLFormElement;

	private _filterFields: FilterField[];
	$filterFieldsDiv: HTMLDivElement;
	$submitBtn: HTMLButtonElement;
	filters: string;
	orderBy?: SelectFilterField;
	properties?: string[]

	$collectionLoader?: HTMLElement;
	private _cardProperties: CardProperties | null;
	
    constructor() {
		this.$wrapper = document.querySelector('div#filter-div')!;
		
		this.$filterFieldsDiv = document.createElement('div');
		this.$filterFieldsDiv.id = 'filter-fields-div';
		this.$wrapper.appendChild(this.$filterFieldsDiv);

		this.$submitBtn = document.createElement('button');
		this.$submitBtn.type = "button";
		this.$submitBtn.classList.add("submit-filters");
		this.$submitBtn.textContent = "Search with these filters";
		this.$filterFieldsDiv.appendChild(this.$submitBtn);	

		this.$formWrapper = document.createElement('form')!;
		this.$formWrapper.id = 'filter-form';
		this.$filterFieldsDiv.appendChild(this.$formWrapper);

		this._filterFields = [];
		this.filters = "";
		this._cardProperties = null;
		console.log("filter-form created");
			
    }	
	set cardProperties(cardProperties: CardProperties) {
		console.log('setting card properties');		
		this._cardProperties = cardProperties;
	}
	get cardProperties(): CardProperties | null{
		return this._cardProperties;
	}
	get filterFields(): FilterField[] {
		return this._filterFields;
	}

	createCollectionLoader(collectionList: Collection[]) {
		this.$collectionLoader = document.createElement('div');
		this.$collectionLoader.id = "collection-loader";
		this.$collectionLoader.innerHTML =	`
		<label for="collection-list">Load a collection</label>
		<button class="toggle-expand" type="button">Expand</button>
		<div class="select-container">			
			<select name="collection-list" id="collection-list" >		
				<option value="none">none</option>
			</select>
			<button type="button" class="display-collection">Load</button>
		</div>`;
		const select: HTMLSelectElement = this.$collectionLoader!.querySelector('.select-container select')!;
		collectionList.forEach((col) => {
			select.innerHTML +=
			`<option value="${col.name}">${col.name}</option>`;
		})
		this.$wrapper.prepend(this.$collectionLoader);

		const expandBtn: HTMLButtonElement = this.$collectionLoader.querySelector('button.toggle-expand')!;
		expandBtn.addEventListener('click', () => this.expandOrReduceField(expandBtn, select, collectionList.length));
	}
	createResetBtn() {
		const $resetBtn: HTMLButtonElement = document.createElement('button');
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

		const filterName: InputFilterField = this.createInputFilter('filter-name', 'Search by name');
		this._filterFields.push(filterName);
		filterName.field.id = "filter-name-is";
		filterName.$label.setAttribute("for", "filter-name-is");

		const filterID: InputFilterField = this.createInputFilter('filter-id', 'Search by ID');
		this._filterFields.push(filterID);
		filterID.field.id = "filter-id-is";
		filterID.$label.setAttribute("for", "filter-id-is");

		const filterSets: InputFilterField = this.createInputFilter('filter-set', 'Search by sets');
		this._filterFields.push(filterSets);
		filterSets.field.id = "filter-set-is";
		filterSets.$label.setAttribute("for", "filter-set-is");

		const filterSupertype: FilterField = this.createSelectFilter('filter-supertype', 'Filter by supertype', this.cardProperties!.supertypes);
		this._filterFields.push(filterSupertype);
		
		const filterSubtype: FilterField = this.createCheckboxFilter('filter-subtypes', 'Filter by subtype', this.cardProperties!.subtypes);
		this._filterFields.push(filterSubtype);

		const filterHP: FilterField = this.createRangeFilter('filter-hp', 'Search by HP', 10, Config.maxHP);
		this._filterFields.push(filterHP);

		const filterType: FilterField = this.createSelectFilter('filter-types', 'Filter by type', this.cardProperties!.types);
		this._filterFields.push(filterType);

		const filterWeaknesses: FilterField = this.createSelectFilter('filter-weaknesses', 'Filter by weaknesses', this.cardProperties!.types);
		this._filterFields.push(filterWeaknesses);

		const filterResistances: FilterField = this.createSelectFilter('filter-resistances', 'Filter by resistances', this.cardProperties!.types);
		this._filterFields.push(filterResistances);

		const filterRetreatCost: FilterField = this.createCheckboxFilter('filter-convertedRetreatCost', 'Filter by retreat cost', ['0', '1', '2', '3', '4', '5']);
		filterRetreatCost.field.setAttribute("size", '2');
		this._filterFields.push(filterRetreatCost);

		const filterRarities: FilterField = this.createSelectFilter('filter-rarity', 'Filter by rarity', this.cardProperties!.rarities);
		this._filterFields.push(filterRarities);
		this.renderAll();
		this.createSortSelector();
		
		this.addIsOrContains(filterName);
		this.addIsOrContains(filterID);
		this.addIsOrContains(filterSets);
		this.createResetBtn();
	}
	
	renderAll () {		
		this._filterFields.forEach((ff: FilterField) => {			
			ff.render(this.$formWrapper);
		})		
	}
	addIsOrContains(filterField: InputFilterField){
		const $selector: HTMLSelectElement = document.createElement('select');
		$selector.id = `${filterField.id}-is-or-contains`;
		$selector.innerHTML = `
		<option value="is">Is</option>
		<option value="contains">Contains</option>
		`;
		$selector.addEventListener("input", () => {
			console.log(filterField);		
			filterField.field.id = `${filterField.id}-${$selector.value}`;
			filterField.$label.setAttribute("for", `${filterField.id}-${$selector.value}`);
		})
		filterField.$formWrapper.appendChild($selector);
	}
	resetFilters() {
		console.log("resetting filters");
		
		this.$formWrapper.innerHTML = '';
		this._filterFields = [];
		this.initializeFilterFields();
	}
	
	createInputFilter(id: string, label: string, type?: string): InputFilterField {
		let filter = new InputFilterField(id);
		filter.$formWrapper.innerHTML =	`
		<label for="${filter.id}">${label}</label>
		<input name="${filter.id.replace("filter-", '')}" id="${filter.id}"${!!type? ` type=${type}`:""}>`;
		return filter;
	}
	createRangeFilter(id: string, label: string, step: number, max: number, type?: string): InputFilterField {
		
		let filter: InputFilterField = this.createInputFilter(id, label, "text");
		const $p: HTMLParagraphElement = document.createElement('p');		
		
		$p.innerHTML += filter.$formWrapper.innerHTML;
		filter.$formWrapper.innerHTML = $p.outerHTML;
		filter.$formWrapper.innerHTML += `<div id="${id}-slider-range"></div>`;

		$( function() {
			(<any>$( `#${id}-slider-range` )).slider({
			  range: true,
			  min: 0,
			  max: max,
			  step: step,
			  values: [0, max ],
			  slide: function( event: Event, ui: any) {
				console.log(ui.values);
				
				$(`#${filter.id}`).val( (ui.values[ 0 ] === 0 && ui.values[ 1 ] === max) ? "any" : ui.values[ 0 ] + " to " + ui.values[ 1 ] );
			  }
			});
			$(`#${filter.id}`).val("any");
		  } );
		
		let $output: HTMLOutputElement = filter.$formWrapper.querySelector('output')!;
		filter.field.addEventListener("input", (e: Event) => {
			const inputField = filter.field as HTMLInputElement;
			let output: string = inputField.value;
			if (inputField.value === '0') $output.innerHTML = 'any'
			else $output.innerHTML = output;
		});
		//filter.field.addEventListener();

		return filter;
	}
	createNonNullSelectFilter(id: string, label: string, options: string[], multiple?: string): SelectFilterField{
		const filter = this.createSelectFilter(id, label, options, multiple);
		filter.field.removeChild(filter.field.querySelector('option:first-child')!);
		return filter;
	}
	createSelectFilter(id: string, label: string, options: string[], multiple?: string): SelectFilterField {
		let filter = new SelectFilterField(id);
		filter.$formWrapper.innerHTML =	`
		<label for="${filter.id}">${label}</label>
		<button class="toggle-expand" type="button">Expand</button>
		<div class="select-container">			
			<select name="${filter.id.replace("filter-", '')}" id="${filter.id}"${multiple?` ${multiple}`:""}>		
				<option value=""></option>
			</select>
		</div>`;
		options.forEach((op: string) => {
			filter.field!.innerHTML += `<option value="${op/* .toLowerCase() */.replace(/\s+/g, '-')}">${op}</option>`;
		})
		
		if (filter.id !== "filter-convertedRetreatCost") {
			const expandBtn: HTMLButtonElement = filter.$formWrapper.querySelector('button.toggle-expand')!;
			expandBtn.addEventListener('click', () => this.expandOrReduceField(expandBtn, filter.field as HTMLSelectElement, options.length));
		}			
		return filter;
	}
	createCheckboxFilter(id: string, label: string, options: string[]): FilterField {
		let filter = new FieldsetFilterField(id);
		filter.$formWrapper.innerHTML =	`
		<fieldset name="${filter.id.replace("filter-", '')}" id ="${filter.id}">
			<legend>${label}</legend>
		</fieldset>`;
		options.forEach((op: string) => {
			filter.field!.innerHTML += `
			<div>
				<input type="checkbox" id="${op}" name="${op}"/>
				<label for="${op}">${op}</label>
			</div>`
		})
		return filter;
	}
	expandOrReduceField(btn: HTMLButtonElement, field: HTMLSelectElement, length: number) {
		btn.classList.toggle('expand');
		if (btn.classList.contains('expand')) {
			field.setAttribute("size", `${length+1}`);
			btn.innerText = "reduce";
		} else {
			field.setAttribute("size", '1');
			btn.innerText = "expand";
		}
	}
	multipleQueries(ff: FilterField, checked: NodeListOf<HTMLInputElement> | NodeListOf<HTMLOptionElement>): string {
		let filter: string = "";
		for (let input of checked) {
			if (input != checked[0]) {
				filter += ' OR ';
			}
			if (ff instanceof FieldsetFilterField) filter += this.convertToQuery(ff.id, input.id);
			else filter += this.convertToQuery(ff.id, input.value);
		}
		if (checked.length > 1) return ` (${filter})`;
		else return ` ${filter}`;
	}
	convertToQuery(property: string, requested: string):string {
		console.log(property);
		
		switch (property) {
			case "filter-legality" :
				return `legalities.standard:"${requested}"`;
			case "filter-supertype":
				if (requested === "Pokemon") requested = "Pokémon";
				return `!supertype:"${requested}"`;
			case "filter-name-is" :
				return `name:"${requested}"`;
			case "filter-name-contains" :
				return `name:"*${requested}*"`;
			case "filter-id-is" :
				return `id:"${requested}"`;
			case "filter-id-contains" :
				return `id:"*${requested}*"`;
			case "filter-set-is" :
				return `(set.name:"${requested}" OR set.id:"${requested}")`;
			case "filter-set-contains" :
				return `(set.name:"*${requested}*" OR set.id:"*${requested}*")`;
			case 'filter-weaknesses':
				return `!weaknesses.type:"${requested}"`;
			case 'filter-resistances':
				return `!resistances.type:"${requested}"`;
			case 'filter-hp':
				if (requested === "any")
					return '';
				return `hp:[${requested}]`;
			case 'filter-rarity':
				return `!rarity:"${requested.replace(/-/g,' ')}"`;
			case 'filter-convertedRetreatCost':
				return `!convertedRetreatCost:${requested}`;
			default:
				return `!${property.replace('filter-','')}:"${requested.replace(/-/g,' ')}"`;
		}
	}
	getFilters() {
		this.filters = '';
		this._filterFields.forEach((ff: FilterField) => {
			if (ff.field instanceof HTMLFieldSetElement) {			
				const checkedInputs: NodeListOf<HTMLInputElement> = ff.field.querySelectorAll('div input:checked')!;
				console.log(checkedInputs);
				if (checkedInputs.length < 1) return;
				this.filters += this.multipleQueries(ff, checkedInputs);
			} else {
				if (ff.type === "checkbox") {
					const input: HTMLElement | null = ff.$formWrapper.querySelector(`input:checked`);
					if (!!input) {
						this.filters += ` ${this.convertToQuery(ff.id, input.id)}`
					}
				}
				else {
					if (!ff.field.value) return;
					if (ff.field.multiple === false) {					
							this.filters += ` ${this.convertToQuery(ff.field.id, ff.field.value)}`;
							//ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
					} else {
						const checkedOptions: NodeListOf<HTMLOptionElement> = ff.field.querySelectorAll('div option:checked')!;
						console.log(checkedOptions);
						if (checkedOptions.length < 1) return;
						this.filters += this.multipleQueries(ff, checkedOptions);
						//ex: " (subtype:"EX" OR subtype:"VSTAR")"			
					}
				}
			}
			
		})
		console.log(this.filters);
		
		return this.filters;
	}
	getCollectionFilters(collection: CardInCollection[]): CardInCollection[]{
		console.log("filtering collection");		
		this._filterFields.forEach((ff: FilterField) => {
			if (ff.field instanceof HTMLFieldSetElement) {
				ff.field
				const checkedInputs: NodeListOf<HTMLInputElement> = ff.field.querySelectorAll('div input:checked')!;
				console.log(checkedInputs);
				if (checkedInputs.length < 1) return collection;
				if (ff.id === 'filter-subtypes') {
					const checkedSubtypes: string[] = [];
					checkedInputs.forEach(input => {
						if (input.id === "EX") checkedSubtypes.push("ex")
						else checkedSubtypes.push(input.id)
					});
					collection = collection.filter(card => this.checkSubtypes(card, checkedSubtypes));
				} else if (ff.id === 'filter-convertedRetreatCost') {
					const checkedCosts: number[] = [];
					checkedInputs.forEach(input => checkedCosts.push(parseInt(input.id)));
					collection = collection.filter(card =>
						checkedCosts.includes(!!card.convertedRetreatCost? card.convertedRetreatCost: 0)
					);
				}
			} else {
				if (ff.type === "checkbox") {
					const input: HTMLElement | null = ff.$formWrapper.querySelector(`input:checked`);
					if (!input) return collection;
					if (ff.id === 'filter-legality') {
						collection = collection.filter(card => card.legality === true || card.legality === "Legal");
					}
				} else {
					if (!ff.field.value) return collection;
					if (ff.field.multiple === false) {
						const value: string = ff.field.value;
						//typescrit doesn't remember ff.field can't be HTMLFieldSetElement in the switch
						collection = this.checkCollectionForValue(collection, ff.field.id, value);
					} else {
						const checkedOptions: NodeListOf<HTMLOptionElement> = ff.field.querySelectorAll('div option:checked')!;
						console.log(checkedOptions);
						if (checkedOptions.length < 1) return collection;
						const checkedValues: string[] = [];
						checkedOptions.forEach((option: HTMLOptionElement) => checkedValues.push(option.value))
						collection = this.checkCollectionForMultipleValues(collection, ff.id, checkedValues);
						//add code here
						//ex: " (subtype:"EX" OR subtype:"VSTAR")"			
					}
				}
			}
		})
		return collection;
	}
	checkCollectionForValue(collection: CardInCollection[], id: string, value: string): CardInCollection[] {
		
		console.log(id + ' = ' + value);
		switch (id) {
			case 'filter-name-is':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => card.name.toLowerCase() === value.toLowerCase() );
				break;
			case 'filter-name-contains':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => card.name.toLowerCase().includes(value.toLowerCase()));
				break;
			case "filter-id-is" :
				collection = collection.filter(card => card.id === value);
				break;
			case "filter-id-contains" :
				collection = collection.filter(card => card.id.includes(value) );
				break;
			case 'filter-set-is':
				console.log(id + ' = ' + value);
				collection = collection.filter(card =>
					value === card.setName.split(" - ")[0]||
					value === card.setName.split(" - ")[1]||
					value === card.setName);
				break;
			case 'filter-set-contains':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => card.setName.includes(value));
				break;
			case 'filter-hp':
				console.log(id + ' = ' + value);
				if (value === "any") return collection;
				const HPRange: string[] = value.split(' ');
				collection = collection.filter(card => card.hp! >= parseInt(HPRange[0]) && card.hp! <= parseInt(HPRange[2]));
				break;
			case 'filter-supertype':
				console.log(id + ' = ' + value);
				if (value === "Pokemon") value = "Pokémon";
				collection = collection.filter(card => card.supertype === value);
				break;
			case 'filter-types':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => !!card.types && card.types.includes(value));
				break;
			case 'filter-weaknesses':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => !!card.weaknesses && card.weaknesses.find(cw => cw.type === value)?.type === value);
				break;
			case 'filter-resistances':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => !!card.resistances && card.resistances.find(cw => cw.type === value)?.type === value);
				break;
			case 'filter-rarity':
				console.log(id + ' = ' + value);
				collection = collection.filter(card => card.rarity === value.replace(/-/g,' '));
				break;
		}
		return collection;
	}
	checkCollectionForMultipleValues(collection: CardInCollection[], id: string, values: string[]): CardInCollection[] {
		switch (id) {
			case 'filter-supertype':
				collection = collection.filter(card => values.includes(card.supertype));
				//ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
				break;
			case 'filter-subtypes':
				collection = collection.filter(card => values.includes(card.supertype));
				//ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
				break;
		}
		return collection;
	}
	checkSubtypes(card: CardInCollection, inputs: string[]): boolean {
		let boolean: boolean = false;
		card.subtypes.forEach(subtype => {
			if (inputs.includes(subtype)) {
				boolean = true;
				return true;
			}
		})
		return boolean;
	}
	static capitalize(string: string) {
		let firstLetter: string = string[0];
		firstLetter = firstLetter.toUpperCase();
		string = firstLetter + string.slice(1, string.length-1);
	}

	createSortSelector() {
		this.properties = this.loadProperties();
		this.orderBy = this.createNonNullSelectFilter('sort-by', 'Sort by', this.properties);
		this.$formWrapper.prepend(this.orderBy.$formWrapper);

		this.orderBy.field.id = "sort-by-ascending";
		this.orderBy!.$label.setAttribute("for", "sort-by-ascending");

		const $selector: HTMLSelectElement = document.createElement('select');
		$selector.id = `sort-order`;
		$selector.innerHTML = `
		<option value="ascending">Ascending</option>
		<option value="descending">Descending</option>
		`;
		
		const orderById: string = this.orderBy!.id;
		$selector.addEventListener("input", () => {
			this.orderBy!.field.id = `${orderById}-${$selector.value}`;
			this.orderBy!.$label.setAttribute("for", `${this.orderBy!.field.id}`);
		})
		this.orderBy!.$formWrapper.appendChild($selector);
	}
	loadProperties():string[] {
		const properties: string[] = [];
		
		properties.push("release date");
		this._filterFields.forEach(ff => {
			let property: string = ff.id.replace("filter-", '');
			if (property === "convertedRetreatCost") property = "retreat cost"
			properties!.push(`${property}`);
		})
		return properties;
	}
	sortCards(): string {
		let descending = '';
		if (this.orderBy!.field.id === 'sort-by-descending') descending = '-';
		return `${descending}${this.getPropertyForSorting(this.orderBy!)}`;
	}
	getPropertyForSorting(orderBy:SelectFilterField): string {
		switch (orderBy.field.value) {
			case 'release-date':
				return "set.releaseDate";
			case 'retreat-cost':
				return "convertedRetreatCost";
		}
		return this.orderBy!.field.value;
	}
	getOrderByForCollection(a: CardInCollection, b: CardInCollection, orderBy:SelectFilterField): number {
		switch (orderBy.field.value) {
			case 'release-date':
				return Date.parse(a.releaseDate) - Date.parse(b.releaseDate);
			case 'legality':
				if (a.legality! > b.legality!) return -1;
				if (a.legality! < b.legality!) return 1;
				return 0; // > and < inverted because we want "legal" to be before "banned" in ascending (default) order
			case 'name':
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			case 'id':
				if (a.id < b.id) return -1;
				if (a.id > b.id) return 1;
				return 0;
			case 'set':
				if (a.setName < b.setName) return -1;
				if (a.setName > b.setName) return 1;
				return 0;
			case 'supertype':
				let aN: number = 0;
				let bN: number = 0;
				switch (a.supertype) {
					case "Pokémon":
						aN = 0;
						break;
					case "Trainer":
						aN = 1;
						break;
					case "Energy":
						aN = 2;
						break;
				}
				switch (b.supertype) {
					case "Pokémon":
						bN = 0;
						break;
					case "Trainer":
						bN = 1;
						break;
					case "Energy":
						bN = 2;
						break;
				}
				return aN - bN;
			case 'subtypes':
				if (a.subtypes[0] < b.subtypes[0]) return -1;
				if (a.subtypes[0] > b.subtypes[0]) return 1;
				return 0;
			case 'hp':
				return (!!a.hp? a.hp: 0) - (!!b.hp? b.hp: 0);
			case 'types':
				if	(!!a.types[0] && (!b.types[0] || //a has a type and b doesn't have one
					(!!b.types[0] && a.types![0] < b.types![0]) ))// a has a type, b has a higher type
					return-1;
				if	(!!b.types[0] && (!a.types[0] || //b has a type and a doesn't have one
					(!!a.types[0] && b.types![0] < a.types![0]) ))// b has a type, a has a higher type
					return 1;
				return 0;
			case 'weaknesses':
				if	(!!a.weaknesses[0] && (!b.weaknesses[0] || //a has a weakness and b doesn't have one
					(!!b.weaknesses[0] && a.weaknesses![0] < b.weaknesses![0]) ))// a has a weakness, b has a higher weaknesse
					return-1;
				if	(!!b.weaknesses[0] && (!a.weaknesses[0] || //b has a weakness and a doesn't have one
					(!!a.weaknesses[0] && b.weaknesses![0] < a.weaknesses![0]) ))// b has a weakness, a has a higher weaknesse
					return 1;
				return 0;
			case 'resistances':
				if	(!!a.resistances[0] && (!b.resistances[0] || //a has a resistance and b doesn't have one
					(!!b.resistances[0] && a.resistances![0] < b.resistances![0]) ))// a has a resistance, b has a higher resistance
					return-1;
				if	(!!b.resistances[0] && (!a.resistances[0] || //b has a resistance and a doesn't have one
					(!!a.resistances[0] && b.resistances![0] < a.resistances![0]) ))// b has a resistance, a has a higher resistance
					return 1;
				return 0;
			case 'retreat-cost':
				return(!!a.convertedRetreatCost? a.convertedRetreatCost: 0)
					- (!!b.convertedRetreatCost? b.convertedRetreatCost: 0);
			case 'rarity':
				if (a.rarity! < b.rarity!) return -1;
				if (a.rarity! > b.rarity!) return 1;
				return 0;
			default:
				return 0;
		}
	}	
	sortCollectionCards(cardList: CardInCollection[],) {
		if (this.orderBy!.field.id === 'sort-by-descending') {
			cardList.sort((a, b) => this.getOrderByForCollection(a, b, this.orderBy!)*-1);
		} else {
			cardList.sort((a, b) => this.getOrderByForCollection(a, b, this.orderBy!));
		}
	}
}

type FilterFieldType = "checkbox" | "input" | "select" | "fieldset";
export class FilterField {
    id: string;
    $formWrapper: HTMLDivElement;
	type: FilterFieldType;
	//private _field: HTMLInputElement | HTMLSelectElement;

    constructor(id: string, type: FilterFieldType) {
        this.id = id;
        this.$formWrapper = document.createElement('div');
        this.$formWrapper.classList.add(`${id}-wrapper`, "filter-field");
		this.type = type;
    }

    get $label(): HTMLLabelElement{
        return this.$formWrapper.querySelector('label')!;
    }
    get field(): HTMLInputElement | HTMLSelectElement | HTMLFieldSetElement {
        return this.$formWrapper.querySelector(`${this.type}#${this.id}`)!;
    }
	set field(field: HTMLInputElement | HTMLSelectElement | HTMLFieldSetElement) {
		this.field = field;
	}
	/* set $output(output: HTMLOutputElement) {
		this.$formWrapper.appendChild(output);
		this.$output = output;
    } */
	render (parent: HTMLFormElement) {
		parent.appendChild(this.$formWrapper);		
	}
}
class InputFilterField extends FilterField{
    constructor(id: string) {
    	super(id, "input");
    }
	get field(): HTMLInputElement {
        return this.$formWrapper.querySelector(`input[id*="${this.id}"]`)!;
    }
}
class SelectFilterField extends FilterField{
    constructor(id: string) {
    	super(id, "select");
    }
	get field(): HTMLSelectElement {
        return this.$formWrapper.querySelector(`select[id*="${this.id}"]`)!;
    }
}
class FieldsetFilterField extends FilterField{
    constructor(id: string) {
    	super(id, "fieldset");
    }
	get field(): HTMLFieldSetElement {
        return this.$formWrapper.querySelector(`fieldset#${this.id}`)!;
    }
}