var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class CardsApi {
    constructor(url) {
        this._url = url;
    }
    get(displayedPerPage, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(`${this._url}/?pageSize=${displayedPerPage}${filter}`)
                .then(res => res.json())
                .then(res => res.data)
                .catch(err => {
                console.log('an error occurs', err);
                return [];
            });
        });
    }
}
