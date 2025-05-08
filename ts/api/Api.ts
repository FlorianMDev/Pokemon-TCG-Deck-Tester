import {RawCardData} from "../models/Card";
import {Config} from "../Config.js";

export interface ApiResult {
	page: number; 
    pageSize: number;
    count: number; 
    totalCount: number;
	data: RawCardData[];
}

export class Api {
	private _url: string;
	constructor(url: string) {
		this._url = url;
	}

	async getCards(displayedPerPage: number, page: number, orderBy: string, filters?: string): Promise<ApiResult> {
		console.log('filters : '+filters);
		
		return fetch(
		`${this._url}/cards?pageSize=${displayedPerPage}&page=${page}${orderBy.length > 0 ? `&orderBy=${orderBy}`:""}${!!filters && filters.length > 1?`&q=${filters}`:""}`,
		{headers: Config.headers})
			.then(res => res.json())
			.catch(err => {
				console.log('an error occurs', err);
				return [];
				});
	}
	async getProperty(property: string) {
		return fetch(
			`${this._url}/${property}`,
			{headers: Config.headers})
				.then(res => res.json())
				.then(res => res.data)
				.catch(err => {
					console.log('an error occurs', err);
					return [];
					});
	}
}