
// slightly modified version of https://github.com/keeganstreet/specificity/blob/master/specificity.js
const attributeRegex = /(\[[^\]]+\])/g;
const idRegex = /(#[^\s\+>~\.\[:]+)/g;
const classRegex = /(\.[^\s\+>~\.\[:]+)/g;
const pseudoElementRegex = /(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi;
const pseudoClassWithBracketsRegex = /(:[\w-]+\([^\)]*\))/gi;
const pseudoClassRegex = /(:[^\s\+>~\.\[:]+)/g;
const elementRegex = /([^\s\+>~\.\[:]+)/g;

function findSelectorMatch(selector: string, regex: RegExp): [string, number] {

	const matches = selector.match(regex);

	if (!matches) {
		return [
			selector,
			0
		];
	}

	return [
		selector.replace(regex, ' '),
		matches.length
	];
}

/**
 * Measure selector specificity.
 * @param selector - Selector to measure.
 */
export function getSelectorSpecificity(selector: string) {

	const specificity = [0, 0, 0];
	let currentSelector = selector
		.replace(/:not\(([^\)]*)\)/g, '     $1 ')
		.replace(/{[\s\S]*/gm, ' ');
	let delta = 0;

	[currentSelector, delta] = findSelectorMatch(currentSelector, attributeRegex);
	specificity[1] += delta;

	[currentSelector, delta] = findSelectorMatch(currentSelector, idRegex);
	specificity[0] += delta;

	[currentSelector, delta] = findSelectorMatch(currentSelector, classRegex);
	specificity[1] += delta;

	[currentSelector, delta] = findSelectorMatch(currentSelector, pseudoElementRegex);
	specificity[2] += delta;

	[currentSelector, delta] = findSelectorMatch(currentSelector, pseudoClassWithBracketsRegex);
	specificity[1] += delta;

	[currentSelector, delta] = findSelectorMatch(currentSelector, pseudoClassRegex);
	specificity[1] += delta;

	currentSelector = currentSelector
		.replace(/[\*\s\+>~]/g, ' ')
		.replace(/[#\.]/g, ' ');

	[currentSelector, delta] = findSelectorMatch(currentSelector, elementRegex);
	specificity[2] += delta;

	return specificity.join('');
}
