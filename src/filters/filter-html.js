import Vue from 'vue';
import striptags from 'striptags';

Vue.filter('filterHtml', (html) => {
	// See http://iiif.io/api/presentation/2.1/#html-markup-in-property-values
	const allowedTags = ['a', 'b', 'br', 'i', 'img', 'p', 'span'];
	const allowedAttributes = { a: ['href'], img: ['alt', 'src'] };

	// TODO: striptags removes '<' and '>' inside attribute values
	let filteredHtml = striptags(html, allowedTags);

	// Iterate over all opening (including self-closing) HTML tags
	const htmlTagsRegex = /<(\w+)((\s+.+?(\s*=\s*(?:".*?"|'.*?'|.*?|[\^'">\s]+))?)+\s*|\s*)>/g;
	filteredHtml = filteredHtml.replace(htmlTagsRegex, (match, tag, attributes) => {
		if (!attributes) return `<${tag}>`;

		// Iterate over all attibutes and keep only allowed ones
		const attributesRegex = /(?:([^\s]+)=(?:"(.*?)"|'(.*?)'))|([^\s]+)/g;
		const keptAttributes = [];
		attributes.replace(attributesRegex, (tuple, key) => {
			if (tuple !== key && allowedAttributes[tag] && allowedAttributes[tag].indexOf(key) > -1) {
				keptAttributes.push(tuple);
			}
		});

		// Add target="_top" attributes to <a> elements
		if (tag === 'a') keptAttributes.push('target="_top"');
		return (keptAttributes.length > 0 ? `<${tag} ${keptAttributes.join(' ')}>` : `<${tag}>`);
	});

	return filteredHtml;
});
