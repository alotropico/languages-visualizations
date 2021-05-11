import * as d3 from "d3";
import { languages } from '../model/languages';
import { view } from '../view/view.js';

let lang = 'es',
	items = {},
	keymap = {};

d3.json("./data/items.json").then(function(data) {
	items = data;

	d3.json("./data/keymap.json").then(function(data) {
		keymap = data;

		let res = languages(items, keymap, lang);

		view({nodes: res});
	});
});

d3.json("./data/langs-relations.json").then(function(data) {
	//view(data);
});