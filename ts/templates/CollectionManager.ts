import { CardData } from "../models/Card.js";
import { Collection } from "../models/Deck.js";
import { CardListManager } from "./DecklistManager.js";

export class CollectionManager extends CardListManager {
	constructor () {
		super('collection');
	}
}