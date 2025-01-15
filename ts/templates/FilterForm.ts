
import { CardProperties } from "../CardProperties.js";
import { Config } from "../Config.js";
import { CardData, RawCardData } from "../models/Card.js";

export class FilterForm {
	$wrapper: HTMLDivElement;
	$formWrapper: HTMLFormElement;
	private _filterFields: FilterField[];
	$filterFieldsDiv: HTMLDivElement;
	$submitBtn: HTMLButtonElement;
	filters: string;
	private _cardProperties: CardProperties | null;
    constructor() {
		this.$wrapper = document.querySelector('div#filter-div')!;
		
		this.$filterFieldsDiv = document.createElement('div');
		this.$filterFieldsDiv.id = 'filter-fields-div';
		this.$wrapper.appendChild(this.$filterFieldsDiv);

		this.$submitBtn = document.createElement('button');
		this.$filterFieldsDiv.appendChild(this.$submitBtn);		
		this.$submitBtn.outerHTML = `<button type="button" class="submit-filters">Search with these filters</button>`;

		this.$formWrapper = document.createElement('form')!;
		this.$formWrapper.id = 'filter-form';
		this.$filterFieldsDiv.appendChild(this.$formWrapper);

		

		this._filterFields = [];		
		console.log(this.$submitBtn);
		this.filters = "";
		this._cardProperties = null;		
    }	
	set cardProperties(cardProperties: CardProperties) {
		console.log('setting card properties');		
		this._cardProperties = cardProperties;
	}
	get cardProperties(): CardProperties | null{
		return this._cardProperties;
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

		const filterLegality = new FilterField('filter-legality', 'checkbox');
		filterLegality.$formWrapper.innerHTML = `
			<label for="Legal">Legal in standard format</label>
			<input type="checkbox" id="Legal" name="Legal">
		`;

		//this.createCheckboxFilter('filter-legality', 'Legality in standard format', ['Legal']);
		this._filterFields.push(filterLegality);

		const filterName: FilterField = this.createInputFilter('filter-name', 'Search by name');
		this._filterFields.push(filterName);

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

		const filterSets: FilterField = this.createInputFilter('filter-set', 'Search by sets');
		this._filterFields.push(filterSets);

		const filterRarities: FilterField = this.createSelectFilter('filter-rarity', 'Filter by rarity', this.cardProperties!.rarities);
		this._filterFields.push(filterRarities);

		this.renderAll();
		this.createResetBtn();
	}
	
	renderAll () {
		this._filterFields.forEach((ff: FilterField) => {
			ff.render(this.$formWrapper);
		})		
	}
	resetFilters() {
		console.log("resetting filters");
		
		this.$formWrapper.innerHTML = '';
		this._filterFields = [];
		this.initializeFilterFields();
	}
	
	createInputFilter(id: string, label: string, type?: string): InputFilterField {
		let filter = new InputFilterField(id, 'input');
		filter.$formWrapper.innerHTML =	`
		<label for="${filter.id}">${label}</label>
		<input name="${filter.id}" id="${filter.id}"${!!type? ` type=${type}`:""}>`;
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
		
		/* filter.field.setAttribute("step", `${step}`);
		filter.field.setAttribute("min", `0`);
		filter.field.setAttribute("max", `${max}`);		
		filter.field.setAttribute("value", `0`);
		filter.$formWrapper.innerHTML += `<output name="${id}-output" id="${id}" for="${id}">any</output>`; */

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
	createSelectFilter(id: string, label: string, options: string[], multiple?: string): FilterField {
		let filter = new FilterField(id, 'select');
		filter.$formWrapper.innerHTML =	`
		<label for="${filter.id}">${label}</label>
		${filter.id === "filter-convertedRetreatCost"?"":`<button class="toggle-expand" type="button">Expand</button>`}
		<div class="select-container">			
			<select name="${filter.id}" id="${filter.id}"${multiple?` ${multiple}`:""}>		
			<option value=""></option>
			</select>
		</div>`;
		options.forEach((op: string) => {
			filter.field!.innerHTML += `<option value="${op.toLowerCase().replace(/\s+/g, '-')}">${op}</option>`
		})
		
		if (filter.id !== "filter-convertedRetreatCost") {
			const expandBtn: HTMLButtonElement = filter.$formWrapper.querySelector('button')!;
			const that: FilterForm = this;
			expandBtn.addEventListener('click', () => that.expandOrReduceField(expandBtn, filter, options));
		}			
		return filter;
	}
	createCheckboxFilter(id: string, label: string, options: string[]): FilterField {
		let filter = new FilterField(id, 'fieldset');
		filter.$formWrapper.innerHTML =	`
		<fieldset name="${filter.id}" id ="${filter.id}">
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
	expandOrReduceField(btn: HTMLButtonElement, filter: FilterField, options: string[]) {
		btn.classList.toggle('expand');
		if (btn.classList.contains('expand')) {
			filter.field.setAttribute("size", `${options.length+1}`);
			btn.innerText = "reduce";
		} else {
			filter.field.setAttribute("size", '1');
			btn.innerText = "expand";
		}
	}
	multipleQueries(ff: FilterField, checked: NodeListOf<HTMLInputElement> | NodeListOf<HTMLOptionElement>): string {
		let filter: string = "";
		for (let input of checked) {
			if (input != checked[0]) {
				filter += ' OR ';
			}
			if (ff.field instanceof HTMLFieldSetElement) filter += this.convertToQuery(ff.id, input.id);
			else filter += this.convertToQuery(ff.id, input.value);
		}
		if (checked.length > 1) return ` (${filter})`;
		else return ` ${filter}`;
	}
	convertToQuery(property: string, requested: string):string {
		switch (property) {
			case "filter-legality" :
				return `legalities.standard:"${requested}"`;
			case "filter-name" :
				return `${`${property}`.replace('filter-','')}:"*${requested}*"`;
			case "filter-set" :
				return `${`${property}.name`.replace('filter-','')}:"*${requested}*"`;				
			case 'filter-weaknesses':
			case 'filter-resistances':
				return `!${`${property}.type`.replace('filter-','')}:"${requested}"`;
			case 'filter-hp':
				if (requested === "any")
					return '';
				return `${`${property}`.replace('filter-','')}:[${requested}]`;
			case 'filter-rarity':
				return `!${property.replace('filter-','')}:"${requested.replace(/-/g,' ')}"`;
			case 'filter-convertedRetreatCost':
				return `!${property.replace('filter-','')}:${requested}`;
			default:
				return `!${property.replace('filter-','')}:"${requested.replace(/-/g,' ')}"`;
		}
	}
	getFilters() {
		this.filters = "";
		this._filterFields.forEach((ff: FilterField) => {
			if (ff.field instanceof HTMLFieldSetElement) {				
				const checkedInputs: NodeListOf<HTMLInputElement> = ff.field.querySelectorAll('div input:checked')!;
				console.log(checkedInputs);
				if (checkedInputs.length < 1) return;
				this.filters += this.multipleQueries(ff, checkedInputs);
			}
			else if (ff.type === "checkbox") {
				const input: HTMLElement | null = ff.$formWrapper.querySelector(`input:checked`);
				if (!!input) {
					this.filters += ` ${this.convertToQuery(ff.id, input.id)}`
				}
			}
			else {
				if (!!ff.field.value) {
					if (ff.field.multiple === false) {					
						this.filters += ` ${this.convertToQuery(ff.id, ff.field.value)}`;
						//ex: ff.id = filter-name, ff.field.value = "Pikachu" => name:"Pikachu"
					}
					else {
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
	/* subtypes: string[];
	hp: number;
	types: string[];
	rules?: string[];
	ancientTrait?: AncientTrait[];
	abilities?: Ability[];
	attacks: Attack[];
	weaknesses: Weakness[];
	resistances: Resistance[];
	convertedRetreatCost: number;
	set : Set;
	images: Images;
	avgPrice: number; */
}

class FilterField {
    id: string;
    $formWrapper: HTMLDivElement;
	type: string;
	//private _field: HTMLInputElement | HTMLSelectElement;

    constructor(id: string, type: string) {
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
	set field(field: HTMLInputElement | HTMLSelectElement) {
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
    constructor(id: string, type: string) {
    	super(id, type);
    }
    get field(): HTMLInputElement {
        return this.$formWrapper.querySelector(`${this.type}#${this.id}`)!;
    }
	set field(field: HTMLInputElement) {
		this.field = field;
	}
}

class SelectFilterField extends FilterField{
    constructor(id: string, type: string) {
    	super(id, type);
    }
    get field(): HTMLSelectElement {
        return this.$formWrapper.querySelector(`${this.type}#${this.id}`)!;
    }
	set field(field: HTMLSelectElement) {
		this.field = field;
	}
}