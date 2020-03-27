<template>
	<section class="tify-search">
		<h2 class="tify-sr-only">{{ 'Search'|trans }}</h2>

        <div class="sibHeader">
            <div class="sibHeaderTitle">Search Inside This Book:</div>
            <div class="sibHeaderText">
                <input id="sibSearchText" type="text" value="" @keypress="checkForEnter($event)" /> <input id="sibSearchBtn" class="sibBtn" type="button" value="Search" @click="doSearch()" />
            </div>
        </div>
        <div id="searchResults">
            <div>
                <div class="sibResultsHeader">Results For:  <span id="sibTextEcho"></span> <span id="sibNumResults">{{ numResults }}</span></div>
            </div>
            <div class="sibResultsContainer">
                <div v-html="resultsMsg" class="sibResultsMsg"></div>
                <div class="sibResultsBox">

    				<template v-for="(result, index) in descriptions">
                        <div class="sibResultBox">
                            <div>
                                <a @click="setPage(sequences[index])" class="sibResultPage">{{ result }}</a>
                            </div>
                            <template v-for="text in highlights[index]">
                                <div class="sibResultText" v-html="text" />
                            </template>
                        </div>
                    </template>

                </div>
            </div>
        </div>

	</section>
</template>

<script>
export default {
    data() {
        return {
            sequences: [],
            descriptions: [],
            highlights: [],
            resultsMsg: "",
            numResults: ""
        }
    },
    methods: {
        // Check for Enter in Search Inside text box
        checkForEnter: function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') document.getElementById('sibSearchBtn').click();
        },

        // Click binder for search button
        doSearch: function () {
            this.numResults = "";
            this.sequences = [];
            this.descriptions = [];
            this.highlights = [];
            document.getElementById("sibTextEcho").innerHTML = document.getElementById("sibSearchText").value;

            this.resultsMsg = "Loading...";
            document.getElementById("searchResults").style.display = 'block';

            this.$http.get('/search/search/pages', {
                params: {
                    q: encodeURIComponent(document.getElementById("sibSearchText").value),
                    itemId: this.$root.itemId
                    }
                })
                .then((response) => {
                    if (response.data.length > 0) {
                        this.numResults = response.data.length;
                        this.resultsMsg = "";
                        var seqList = [];
                        var descList = [];
                        var hlList = [];
                        response.data.forEach(function(hit, index) {
                            seqList.push(hit.Sequence);
                            descList.push(hit.PageDescription);

                            hlList.splice(index, 0, []);
                            hit.Highlights.forEach(function(hl, index2) {
                                hlList[index].splice(index2, 0, hl.Item2);
                            });
                        });
                        this.sequences = seqList;
                        this.descriptions = descList;
                        this.highlights = hlList;

                    } else {
                        this.resultsMsg = "";
                        this.resultsMsg = "<span>No results found</span>";
                    }
                }).catch((error) => {
                    console.log(error);
                    this.resultsBox = '<span/>Error!  Please try again.</span>';
                });
        },

        setPage(page) {
            this.$root.setPage(page);
        }
    }    
}
</script>