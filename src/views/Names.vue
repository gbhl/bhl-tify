<template>
	<section class="tify-names">
		<h2 class="tify-sr-only">{{ 'Scientific Names'|trans }}</h2>

		<div v-if="namesAvailable" class="tify-names_texts">
			<template v-for="page, index in this.$root.params.pages" v-if="page">
				<hr v-if="index && page > 1" class="tify-names_separator">
				<template v-for="text in names[page]">
					<div class="tify-names_text" v-html="text"/>
				</template>
			</template>
		</div>
		<div v-else class="tify-names_none">
			{{ 'Names not available for this page'|trans }}
		</div>
	</section>
</template>

<script>
	export default {
		data() {
			return {
				namesAvailable: false,
				names: [],
			};
		},
		watch: {
			// eslint-disable-next-line func-names
			'$root.params.pages': function () {
				this.loadNames();
			},
		},
		methods: {
			loadNames() {
				this.namesAvailable = false;
				this.names = [];

				this.$root.params.pages.forEach((page) => {
					if (page < 1 || this.names[page]) return;

					const canvas = this.$root.canvases[page - 1];
					if (!('otherContent' in canvas)) return;

					this.$set(this.names, page, []);

					const annotationListUrl = canvas.otherContent[1]['@id'];
					this.$http.get(annotationListUrl).then((response) => {
						const { resources } = response.data;
						if (!Array.isArray(resources)) return;

						resources.forEach((resource, index) => {
							const res = resource.resource;
							if (res && res.chars) {
								const text = this.$options.filters.filterHtml(res.chars);
								if (text) this.namesAvailable = true;
								this.$set(this.names[page], index, text);
							} else if (res['@id']) {
								this.loadRemoteNames(page, index, res['@id']);
							}
						});
					}, (error) => {
						const status = (error.response ? error.response.statusText : error.message);
						this.$root.error = `Error loading other content: ${status}`;
					});
				});
			},
			loadRemoteNames(page, index, url) {
				this.$http.get(url).then((response2) => {
					const text = this.$options.filters.filterHtml(response2.data);
					if (text) this.namesAvailable = true;
					this.$set(this.names[page], index, text);
				}, (error) => {
					const status = (error.response ? error.response.statusText : error.message);
					this.$root.error = `Error loading names: ${status}`;
				});
			},
		},
		mounted() {
			this.loadNames();
		},
	};
</script>
