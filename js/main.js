var offset = 0;
var resultsNum = 50;
var page = 1;
var term = false;
$(function(){
	height = $(".container").height();
	$(".header-container").height(height);

	$('#searchInput').keydown(function(event) {
		var value = $(this).val();
		if (event.keyCode == 13) {
			if (value !== ""){
				term = value;
				searchImages();
			}
			return false;
		}
	});

	$("#btnSearch").on("click", function(){
		var value = $("#searchInput").val();
		if (value !== ""){
			term = value;
			searchImages();
		}
	});
	$(".swipebox").swipebox();
	$(document).on("click", ".pagLink", function(){
		elem = $(this);
		offset = elem.attr("data-offset");
		page = parseInt(elem.attr("data-page"), 10);
		searchImages();
	});
});

function searchImages(){
	$(".loader").show();
	$("html, body").animate({
		scrollTop: 0
	}, 600);
	$("body").css("overflow", "hidden");
	$("#wikiLogoHeader").attr("class", "wikiLogoHeaderFixed")
	$(".header-container").removeAttr('style');
	$(".header").removeClass("header");

	var url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=" + term + "&gsrlimit=" + resultsNum + "&gsroffset=" + offset + "&prop=imageinfo&iiprop=url|mime|descriptionurl&callback=?&format=json";

	$.getJSON(url, function(data) {
		var pages = data.query.pages,
		total = data.query.searchinfo.totalhits;
		console.log(data);
		if (data.hasOwnProperty("query-continue"))
			nextOffset = data["query-continue"].search.gsroffset;
		totalFormatted = total.toLocaleString();

		document.getElementById("resultsNum").innerHTML = total;
		document.getElementById("resultsInfo").style.display = "block";

		x = (total > resultsNum) ? resultsNum : total;
		keys = Object.keys(pages);
		keys.reverse();
		var images = [];

		while (x--){
			if (typeof pages[keys[x]].imageinfo[0].url !== "undefined"){
				images[x] = {
					url : pages[keys[x]].imageinfo[0].url,
					description : pages[keys[x]].title.slice(5, -4),
					mime : pages[keys[x]].imageinfo[0].mime.capitalize(),
					detail : pages[keys[x]].imageinfo[0].descriptionurl,
					pageid : pages[keys[x]].pageid
				};
			}
		}
		if (keys.length > 0) {
			showImages(images);
			pagination(total, resultsNum);
		}
	});
}

function showImages(images){
	var x = images.length,
	html = "",
	container = document.getElementById("imageContainer");
	while (x--){
		html += '<a title="' + images[x].description + '<span class=\'mimetype\'>' + images[x].mime + '</span>" class="swipebox" href="' + images[x].url + '" data-mime="' + images[x].mime + '" data-pageid="' + images[x].pageid + '" data-detail=' + images[x].descriptionurl + '>\
		<img alt="' + images[x].description + '" src="' + images[x].url + '"/>\
		</a>';
	}
	container.innerHTML = html;

	$("#imageContainer").justifiedGallery({
		'lastRow': 'justify',
		'rowHeight': 120,
		'fixedHeight': false,
		'captions': true,
		'randomize': false,
		'margins': 1
	}).on('jg.complete', function() {
		$(".loader").hide();
		$("#imageContainer").find("> a").swipebox();
		$("body").css("overflow", "auto");
	});
}

function pagination(total, num, limit){
	if (typeof limit === "undefined") limit = 9;
	var last = Math.ceil(total/num);
	if (last < limit)
		limit = last;

	prev = (page === 1) ? "" : '<a class="pagLink" href="javascript:void(0);" data-page="' + (page-1) + '" data-offset="' + (page-2) * num + '">Prev</a>';
	next = (page === last) ? "" : '<a class="pagLink" href="javascript:void(0);" data-page="' + (page+1) + '"  data-offset="' + (page * num) + '">Next</a>';

	var mid = Math.floor(limit/2);
	var init = (page-mid <= 1) ? 1 : page-mid;
	var end = (init + limit < last) ? init + limit : last;

	var x = init;
	paginator = prev;
	while (x <= limit){
		active = (page === init) ? " active" : "";
		paginator += '<a class="pagLink' + active + '" href="javascript:void(0);" data-page="' + init + '" data-offset="' + ((init-1) * num) + '">' + init + '</a>';
		x++;
		init++;
	}
	paginator += next;
	document.getElementById("paginator").innerHTML = paginator;
}

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.slice(1);
}