function getItemFromId(data, id){
	for (var key in data) {
		let it = data[key];
		if(it.wikidata == id){
			return it;
		}
	}
}

function isInstance(datum, wikiId){
	if(datum.hasOwnProperty('is') && datum.is && datum.is.length){
		for(let i=0; i<datum.is.length; i++){
			if(datum.is[i] == wikiId){
				return true;
			}
		}
	}
	return false;
}

function parseItem(it, lang, parents){
	let ret = {
			label: (it.es ? it.es : it.en),
			group: isInstance(it, 'Q34770') ? 2 : 1, // it.hasOwnProperty('is') && it.is.length ? it.is[0] : 'Q',// Q25295
			/*
			Q315 - lengua
			Q941501 - grupo
			Q25295 - familia
			*/
			id: it.wikidata
		};

	if(parents && it.hasOwnProperty('parents') && it.parents && it.parents.length)
		ret.parents = it.parents;

	return ret;
}

function getLanguages(items, lang){
	let ret = [];

	for (var key in items) {

		if(key.indexOf('NO-WIKI-DATA') == -1){
			let it = items[key];

			if((it.hasOwnProperty('speakers') && it.speakers > 9000000) && isInstance(it, 'Q34770')){
				ret.push(parseItem(it, lang, true));
			}
		}
	}

	return ret;
}

function getParents(items, newItems, lang, step = 0){
	let parentsAr = [];

	for(let i=0; i<newItems.length; i++){
		let it = newItems[i];

		if(it.hasOwnProperty('parents')){
			for(let j=0; j<it.parents.length; j++){
				let parent = getItemFromId(items, it.parents[j]);

				if(parent){
					let parentAsItem = parseItem(parent, lang, true);
					it.p = parentAsItem.id;
					parentsAr.push(parentAsItem);
				} else {
					it.parents.splice(j, 1);
				}
			}
		}
	}

	if(step<12)
		parentsAr = getParents(items, parentsAr, lang, step+1);

	return newItems.concat(parentsAr);
}

function onlyUnique(ar, prop) {
	let obj = [];

	for(let i=0; i<ar.length; i++){
		obj[ar[i][prop]] = ar[i];
	}

	return Object.keys(obj).map(function(key) {
		return obj[key];
	});
}

export function languages(items, keys, lang) {

	let langs = getLanguages(items, lang);

	let all = onlyUnique(getParents(items, langs, lang), 'id');

	return all;
}