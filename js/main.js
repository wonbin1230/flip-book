let pageURLs = [];
$(document).ready(async function () {
	pageURLs = await fetchURL();
	const pageQuantity = 124;
	initialViewport();
	loadApp(pageQuantity);
	bindControlEvents(pageQuantity);
	$("#canvas").fadeIn(2000);
});

let currentPageText = "";
let currentPage = 1;

const fetchURL = async () => {
	const url = `https://sheets.googleapis.com/v4/spreadsheets/1wHbKFxn839JaTb5YhS0g3-cv9_ypZHeKGcY60_00WyQ/values/A2:B125?key=AIzaSyCDfQdbfcR68abAb62u5GI1DGmJuOBO0gs`
	const res = await fetch(url)
	const data = await res.json()
	return data.values.map((e) => {
		return {
			page: parseInt(e[0]),
			url: e[1]
		}
	});
}

function loadApp(pagesNum) {
	const flipbook = $("#flipbook");

	if (flipbook.width() === 0 || flipbook.height() === 0) {
		setTimeout(loadApp, pagesNum);
		return;
	}

	flipbook.turn({
		duration: 1200,
		acceleration: !isChrome(),
		gradients: true,
		autoCenter: true,
		elevation: 50,
		pages: pagesNum,
		display: $(document).width() <= 438 ? "single" : "double",
		when: {
			turning: function (event, page, view) {
				if (view.includes(1)) {
					currentPageText = `${view[1] || view[0]}`;
				} else if (view.includes(pagesNum)) {
					currentPageText = `${view[0]}`;
				} else {
					currentPageText = view[1] ? `${view[0]}-${view[1]}` : view[0];
				}
				if (page !== 1 || page !== pagesNum) {
					$("#current-page-input").val(`${currentPageText}/${pagesNum}`);
				}
				if (page === 1 || page === pagesNum) {
					boxShadowHandler.remove();
				}
			},

			turned: function (event, page, view) {
				$(this).turn("center");
				boxShadowHandler.add();
				currentPage = page;
			},

			missing: function (event, pages) {
				for (let i = 0; i < pages.length; i++) {
					addPage(pages[i], $(this));
				}
			},
		},
	});

	currentPageText = `1`;
	$("#current-page-input").val(`1/${pagesNum}`);
}

function addPage(page, book) {
	const element = $("<div />", {});
	if (book.turn("addPage", element, page)) {
		if (pageURLs[page - 1].url === "#") {
			element.html(`<div class="gradient"></div>`);
		} else {
			element.html(`<a href="${pageURLs[page - 1].url}" target="${isMobileDevice() ? '_blank' : 'GallantOutDoor'}" title="product"><div class="gradient"></div></a>`);
		}
		loadPage(page, element);
	}
}

function loadPage(page, pageElement) {
	const anchor = $(`<a href="${pageURLs[page - 1].url}" target="${isMobileDevice() ? '_blank' : 'GallantOutDoor'}" title="product" style="width: 100%; height: 100%;"></a>`);
	const img = $("<img />");

	img.mousedown(function (e) {
		e.preventDefault();
	});

	img.on("load", function () {
		$(this).css({ width: "100%", height: "100%" });
		if (pageURLs[page - 1].url === "#") {
			$(this).appendTo(pageElement);
		} else {
			anchor.append($(this));
			anchor.appendTo(pageElement);
		}
	});
	img.attr("src", `pages/${page}.png`);
}

function isChrome() {
	return navigator.userAgent.indexOf("Chrome") !== -1;
}

function initialViewport() {
	const width = $(window).width();
	const height = $(window).height();
	if (isMobileDevice()) {
		hidePaginationPrevious();
		hidePaginationNext();
		hideFullScreenBtn();
		mobileSize();
		showScrollY();
		hideZoomInBtn();
	} else {
		showPaginationPrevious();
		showPaginationNext();
		showFullScreenBtn();
		desktopSize();
		hideScrollY();
		showZoomInBtn();
	}

	if (width <= 438) {
		$("#flipbook").removeClass("animated");
		$("#flipbook").css({
			width: `${1754 * (width / 2481) * 2}px`,
			height: `${width}px`,
			transform: `rotate(90deg)`,
			"transform-origin": "top left",
			left: `${width}px`,
		});
	} else {
		$("#flipbook").css({
			width: `${width}px`,
			height: `${1754 * (width / 2481) / 2}px`,
		});
	}
}

function bindControlEvents(pagesNum) {
	$(".button.zoom-icon").on("click", function () {
		if ($(this).hasClass("zoom-in")) {
			$("#flipbook-viewport").zoom("zoomIn");
			$(this).removeClass("zoom-in");
			$(this).addClass("zoom-out");
		} else {
			$("#flipbook-viewport").zoom("zoomOut");
			$(this).removeClass("zoom-out");
			$(this).addClass("zoom-in");
		}
	});

	$(".pagination-previous, .button.previous").on("click", function () {
		$("#flipbook").turn("previous");
	});

	$(".pagination-next, .button.next").on("click", function () {
		$("#flipbook").turn("next");
	});

	$(".button.first").on("click", function () {
		$("#flipbook").turn("page", 1);
	});

	$(".button.last").on("click", function () {
		$("#flipbook").turn("page", pagesNum);
	});

	$("#current-page-input").on("click", function () {
		$("#current-page-input").val("");
	});

	$("#current-page-input").on("focusout", function () {
		$("#current-page-input").val(`${currentPageText}/${pagesNum}`);
	});

	$("#current-page-input").on("change", function (e) {
		const targetPage = parseInt(e.target.value);
		if (typeof targetPage === "number" && targetPage >= 1 && targetPage <= pagesNum) {
			$("#flipbook").turn("page", targetPage);
		}
	});

	$("#current-page-input").on("focus", function (e) {
		$(this).on("keypress", function (e) {
			if (e.which === 13) {
				const targetPage = parseInt(e.target.value);
				if (typeof targetPage === "number" && targetPage >= 1 && targetPage <= pagesNum) {
					$("#flipbook").turn("page", targetPage);
				}
				$("#current-page-input").blur();
			}
		});
	});

	$(".button.fullscreen").on("click", function () {
		toggleFullScreen();
	});

	zoomInit();

	$(window).on("resize", debounce(resizeFn, 500))
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	}
}

const boxShadowHandler = {
	remove: function () {
		$("#flipbook").find(".shadow").addClass("temp");
		$("#flipbook").find(".shadow").removeClass("shadow");
	},
	add: function () {
		if ($("#flipbook").find(".shadow").length === 0) {
			$("#flipbook").find(".temp").addClass("shadow");
			$("#flipbook").find(".temp").removeClass("temp");
		}
	},
};

function debounce(func, delay) {
	let debounceTimer;
	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => func.apply(context, args), delay);
	};
}

let originalWidth = $("body").width();

function resizeFn() {
	const currentWidth = $("body").width();
	if (currentWidth - originalWidth >= 350 || originalWidth - currentWidth >= 350) {
		const toPage = currentPage;
		$("#flipbook").turn("destroy").remove();
		const newFlipbook = $(`<div id="flipbook"></div>`);
		$(".pagination-next").before(newFlipbook);
		initialViewport();
		loadApp(124);
		$("#canvas").fadeIn(2000);
		$("#flipbook").turn("page", toPage)
		zoomInit();
		originalWidth = currentWidth;
	}
}

function zoomInit() {
	return $("#flipbook-viewport").zoom({
		flipbook: $("#flipbook"),

		max: function () {
			return 4000 / $("#flipbook").width();
		},

		when: {
			swipeLeft: function () {
				$("#flipbook").turn("next");
			},

			swipeRight: function () {
				$("#flipbook").turn("previous");
			},

			zoomIn: function() {
				$(".button.zoom-icon img").attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAX5JREFUSEvVlM8uA1EUxr9vzJB0umpnFoIn0XoFCyywEAsbLGw8hUhIsLEQm1roijdo600ESTtWnVmYmk+uaFL9YybRSpztPed3z73n+w4xoeCEuPh78GsUl5RoT2QZgA+gSalOi+eFnNNIe+lAx5LsIHo/BbRLoZ4A9wCfAM2CWCZQAnhRzE0dkIxHXTAAboadS0IbJLeKObvaXxhEnVVJ1wIrvmvvZAK/RvFiIjRIrg2DdiFf8FuLKBVyzsMw+LeOg/ZbJSEXfNcx//pjNMO4bkmPxfz0eiq4FcYvEo79vHOUCm7HhyQOPNeZywKWxE0/b1dMciuM1V/kuc7nK5vtzgapK891ZrKAJ9Nx0H67Scj5sf+xMUUi1DOoYkVS1SLKo8wyoONW2DkDtJ2mY4BXnmvvZ9KxSZLkBNH7yZfzaglwB/DZOM8ClkWUjfPMeXeQqcPrTejZFUsAPCMSSrXeXWFUMwr+6+02Cv5rcFfv/Z2PBTwMPjZw/wD/H/gD/r7EFzmOkcIAAAAASUVORK5CYII=");
				const links = $("#flipbook a");
				links.each(function() {
					$(this).addClass("disabled");
				})
			},

			zoomOut: function() {
				$(".button.zoom-icon img").attr("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IArs4c6QAAAYFJREFUSEvVlLFOwlAYhc+prSaUSdrBqE8i+AoO6qAOxsFFHVx8CmOiibo4GBccZNI3AHwToyZQJtrBYo+5iRgsEJoAJt71/v93z/1zzk9M6XBKXPw9uBXFRSU6FFkC4ANoUKrR4tV8zqmP+mmfYkl2EH1eADqgUEuAJ4CvgBZArBEoArwu5GaOScbDHugDN8LODaFtkruFnF1JNwZRZ0PSncCy79r7mcCtKF5JhDrJzUHQLuQb/mARxfmc8zwI/ktx0P4oJ+Sy7zpmrj+nGcbyXOdXbSOMa5b0UsjPbo0EN8P4XcKZn3dOR4Lb8QmJY891FrOAJXHHz9tlU2yUppu6yhvtzjapW8915rKAp6M4aH/cJ+TSxGdsQpEItQyuWJdUsYjSsLD0+bgZdi4B7Y3yMcBbz7WPMvnYFElygujz/Dt51QR4BPhmkmcBayJKJnnmPm3B3keGLqGeXbEKwDMmoVTt3RWD/N2Fj73dhsHHBnf9nh7LRMCD4BMDp93x/8Bf6IjUF+dcNU0AAAAASUVORK5CYII=");
				const links = $("#flipbook a");
				links.each(function() {
					$(this).removeClass("disabled");
				})
			}
		},
	});
}

// Deprecated
function zoomTo(event) {
	setTimeout(function () {
		if ($("#flipbook-viewport").data().regionClicked) {
			$("#flipbook-viewport").data().regionClicked = false;
		} else {
			if ($("#flipbook-viewport").zoom("value") == 1) {
				$("#flipbook-viewport").zoom("zoomIn", event);
			} else {
				$("#flipbook-viewport").zoom("zoomOut");
			}
		}
	}, 1);
}

function isMobileDevice() {
	let mobileDevices = ["Android", "webOS", "iPhone", "iPad", "iPod", "BlackBerry", "Windows Phone"];
	for (var i = 0; i < mobileDevices.length; i++) {
		if (navigator.userAgent.match(mobileDevices[i])) {
			return true;
		}
	}
	return false;
}
