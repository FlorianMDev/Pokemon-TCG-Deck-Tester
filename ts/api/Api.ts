import {RawCardDataType} from "../models/Card";

export class Api {
	private _url: string;
	constructor(url: string) {
		this._url = url;		
	}
	async get(): Promise<RawCardDataType[]> {
		return fetch(this._url)
			.then(res => res.json())
			.then(res => res.data)
			.catch(err => {
				console.log('an error occurs', err);
				return [];
				});
			
	}
}