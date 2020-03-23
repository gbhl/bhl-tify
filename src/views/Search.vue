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
                <div class="sibResultsHeader">Results For:  <span id="sibTextEcho"></span> <span id="sibNumResults"></span></div>
            </div>
            <div class="sibResultsContainer">
                <div class="sibResultsBox">
                </div>
            </div>
        </div>

	</section>
</template>

<script>
export default {
    methods: {
        // Check for Enter in Search Inside text box
        checkForEnter: function (event) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if (keycode == '13') document.getElementById('sibSearchBtn').click();
        },

        // Click binder for search button
        doSearch: function () {
            var resultsBox = document.getElementsByClassName("sibResultsBox");
            document.getElementById("sibTextEcho").innerHTML = document.getElementById("sibSearchText").value;

            resultsBox.innerHTML = "Loading...";
            document.getElementById("searchResults").style.display = 'block';
/*
            $.ajax({
                type: 'get',
                url: '/search/pages',
                data: 'q=' + encodeURIComponent($("#sibSearchText").val()) + '&itemId=' + $root.itemId,
                success: function (data, textStatus, jqXHR) {
                    if (data.length > 0) {
                        $("#sibNumResults").html("(" + data.length + ")");
                        resultsBox.empty();
                        $.each(data, function (index, hit) {

                            var resultBox = $("<div/>", { "class": "sibResultBox" });
                            var resultPageDesc = $("<div/>")
                                .append($("<a/>", {
                                    "class": "sibResultPage",
                                    "href": "javascript:changePage(" + hit.Sequence + ")",
                                    "text": hit.PageDescription
                                }));
                            resultBox.append(resultPageDesc);

                            $.each(hit.Highlights, function (index2, highlight) {
                                resultBox.append($("<div/>", { "class": "sibResultText" }).append("... " + highlight.Item2 + " ..."));
                            });

                            resultBox.appendTo(resultsBox);
                        });
                    } else {
                        resultsBox.empty();
                        resultsBox.append($('<span/>', { 'text': 'No results found' }));
                    }
                    resultsBox.removeClass('loading');
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    resultsBox.empty();
                    resultsBox.append($('<span/>', { 'text': 'Error!  Please try again.' }));
                    isAnimating = false;
                }
            });
*/
        }
    }    
}
</script>