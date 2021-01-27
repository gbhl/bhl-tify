<template>
	<section class="tify-export">
		<h2 class="tify-sr-only">{{ 'Downloads'|trans }}</h2>

		<div class="tify-export_section -links">
			<h3>{{ 'Page Images'|trans }}</h3>
			<ul>
				<li v-for="page in $root.params.pages" v-if="page">
					<!-- NOTE: The download attribute is only honored for same-origin URLs -->
					<a target="_top" :href="imageUrls[page]" :download="`${page}.jpg`">
						{{ 'Page'|trans }} {{page}}
						:
						{{ $root.iiifConvertToArray($root.canvases[page - 1].label)[0] }}
					</a>
				</li>
			</ul>
		</div>

		<div v-if="$root.manifest.rendering" class="tify-export_section -renderings">
			<h3>{{ 'Renderings'|trans }}</h3>
			<ul>
				<li v-for="item in $root.manifest.rendering">
					<template v-if="/\.pdf$/i.test(item['@id'])">
						<i class="tify-badge" v-if="/\.pdf$/i.test(item['@id'])">PDF</i>
						<a target="_top" :href="item['@id']" download>{{ item.label }}</a>
					</template>
					<template v-else>
						<a target="_top" :href="item['@id']">{{ item.label }}</a>
					</template>
				</li>
			</ul>

			<div class="tify-export_container" v-if="hasElementPdfLinks">
				<button class="tify-export_toggle" @click="perElementPdfLinksVisible = !perElementPdfLinksVisible">
					<template v-if="!perElementPdfLinksVisible">{{ 'PDFs for each element'|trans }}</template>
					<template v-else>{{ 'Close PDF list'|trans }}</template>
				</button>
				<div class="tify-export_toc" v-show="perElementPdfLinksVisible">
					<toc-list
						purpose="pdf"
						ref="children"
						:level="0"
						:structures="structures"
					/>
				</div>
			</div>
		</div>

		<div v-if="literatureItems.length" class="tify-export_section -literature">
			<h3>{{ 'Literature Management'|trans }}</h3>
			<ul>
				<li v-for="item in literatureItems">
					<a target="_top" :href="item['@id']" download>
						{{ item.label }}
					</a>
				</li>
			</ul>
		</div>

		<div class="tify-export_section -other">
			<h3>{{ 'Exports'|trans }}</h3>
			<ul>
				<li>
					<a target="_top" :href="'https://www.mendeley.com/import/?url=https://www.biodiversitylibrary.org/item/' + $root.itemId" download>
						{{ 'Add Book to your Mendeley Library'|trans }}
					</a>
				</li>
			</ul>
			<h3>{{ 'Citations'|trans }}</h3>
			<ul>
				<li>
					<a target="_top" :href="'/risdownload/' + $root.itemId" :download="'bhlitem' + $root.itemId + '.ris'">
						RIS for Book
					</a>
				</li>
				<li>
					<a target="_top" :href="'/bibtexdownload/' + $root.itemId" :download="'bhlitem' + $root.itemId + '.bib'">
						BibTeX for Book
					</a>
				</li>
			</ul>

			<ul v-if="currentStructureLabel || currentStructureMetadata">
				<li>
					<a target="_top" :href="'/handlers/risdownload.ashx?pid=' + currentStructure['@id'].substring(currentStructure['@id'].lastIndexOf('/') + 1)" :download="'bhlpart' + currentStructure['@id'].substring(currentStructure['@id'].lastIndexOf('/') + 1) + '.ris'">
						RIS for "{{ currentStructureLabel }}"
					</a>
				</li>
				<li>
					<a target="_top" :href="'/handlers/bibtexdownload.ashx?pid=' + currentStructure['@id'].substring(currentStructure['@id'].lastIndexOf('/') + 1)" :download="'bhlpart' + currentStructure['@id'].substring(currentStructure['@id'].lastIndexOf('/') + 1) + '.bib'">
						BibTeX for "{{ currentStructureLabel }}"
					</a>
				</li>
			</ul>

			<h3>{{ 'Other Formats'|trans }}</h3>
			<ul>
				<li>
					<a target="_top" :href="$root.manifestUrl" download="manifest.json">
						{{ 'IIIF manifest'|trans }}
					</a>
				</li>
				<li v-for="item in otherItems">
					<a target="_top" :href="item['@id']" download>
						{{ item.label || item['@id'] }}
					</a>
				</li>
			</ul>
		</div>
	</section>
</template>

<script>
	import TocList from '@/components/TocList';

	import structures from '@/mixins/structures';

	const itemCriteria = [
		{
			label: 'BibTex',
			profile: 'http://www.bibtex.org/Format/',
			type: 'literature',
		},
		{
			label: 'EndNote',
			profile: 'http://endnote.com/',
			type: 'literature',
		},
		{
			label: 'RIS',
			profile: 'http://referencemanager.com/sites/rm/files/m/direct_export_ris.pdf',
			type: 'literature',
		},
		{
			label: 'METS',
			profile: 'http://www.loc.gov/standards/mets/profile_docs/mets.profile.v2-0.xsd',
			type: 'other',
		},
		{
			label: 'MODS',
			format: 'application/mods+xml',
			type: 'other',
		},
	];

	export default {
		components: {
			TocList,
		},
		mixins: [
			structures,
		],
		data() {
			return {
				literatureItems: [],
				otherItems: [],
				perElementPdfLinksVisible: false,
			};
		},
		computed: {
			hasElementPdfLinks() {
				const { manifest } = this.$root;

				if (
					!Array.isArray(manifest.structures)
					|| !manifest.structures[0]
					|| !manifest.structures[0].rendering
				) return false;

				const renderings = this.$root.iiifConvertToArray(manifest.structures[0].rendering);
				return renderings.some(rendering => rendering.format && rendering.format === 'application/pdf');
			},
			imageUrls() {
				const imageUrls = {};
				this.$root.params.pages.forEach((page) => {
					if (!page) return;

					const { resource } = this.$root.canvases[page - 1].images[0];
					if (resource.service) {
						const quality = (
							resource.service['@context'] === 'http://iiif.io/api/image/2/context.json'
								? 'default'
								: 'native'
						);
						const id = resource.service['@id'];
						imageUrls[page] = `${id}${id.slice(-1) === '/' ? '' : '/'}full/full/0/${quality}.jpg`;
					} else {
						imageUrls[page] = resource['@id'];
					}
				});
				return imageUrls;
			},
		},
		created() {
			const { seeAlso } = this.$root.manifest;
			if (!seeAlso) return;

			// Create clone
			const items = JSON.parse(JSON.stringify(Array.isArray(seeAlso) ? seeAlso : [seeAlso]));
			items.forEach((item) => {
				const currentItem = (typeof item === 'object' ? item : { '@id': item });
				let isLiterature = false;
				itemCriteria.some((criterion) => {
					const formatsMatch = (item.format && criterion.format === item.format);
					const profilesMatch = (item.profile && criterion.profile === item.profile);
					if (formatsMatch || profilesMatch) {
						currentItem.label = criterion.label;
						if (criterion.type === 'literature') isLiterature = true;
						return true;
					}
					return false;
				});

				if (isLiterature) {
					this.literatureItems.push(currentItem);
				} else {
					this.otherItems.push(currentItem);
				}
			});
		},
	};
</script>
