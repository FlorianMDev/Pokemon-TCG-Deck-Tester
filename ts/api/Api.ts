import {RawCardData} from "../models/Card";
import {Config} from "../Config.js";

export class CardsApi {
	private _url: string;
	constructor(url: string) {
		this._url = url;
	}

	async get(displayedPerPage: number, filter?: string): Promise<RawCardData[]> {
		return fetch(`${this._url}/?pageSize=${displayedPerPage}${filter}`)
			.then(res => res.json())
			.then(res => res.data)
			.catch(err => {
				console.log('an error occurs', err);
				return [];
				});
			
	}
}