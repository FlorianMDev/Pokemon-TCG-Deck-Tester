var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Config } from "../Config.js";
export class Api {
    constructor(url) {
        this._url = url;
    }
    getCards(displayedPerPage, page, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${this._url}/cards?pageSize=${displayedPerPage}&orderBy=set.releaseDate&page=${page}${!!filters ? ` &q=${filters}` : ""}`, { headers: Config.headers })
                .then(res => res.json())
                .catch(err => {
                console.log('an error occurs', err);
                return [];
            });
        });
    }
    getProperty(property) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${this._url}/${property}`, { headers: Config.headers })
                .then(res => res.json())
                .then(res => res.data)
                .catch(err => {
                console.log('an error occurs', err);
                return [];
            });
        });
    }
}
