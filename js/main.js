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
			element.html(`<a href="${pageURLs[page - 1].url}" target="GallantOutDoor" title="product"><div class="gradient"></div></a>`);
		}
		loadPage(page, element);
	}
}

function loadPage(page, pageElement) {
	const anchor = $(`<a href="${pageURLs[page - 1].url}" target="GallantOutDoor" title="product" style="width: 100%; height: 100%;"></a>`);
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
		togglePaginationPrevious("none");
		togglePaginationNext("none");
		toggleFullScreenBtn("hidden");
		$("#canvas").css({
			width: "100dvw",
			height: "100dvh",
		});
		$("body").css({
			overflowY: "auto",
		});
	} else {
		togglePaginationPrevious("block");
		togglePaginationNext("block");
		toggleFullScreenBtn("visible");
		$("#canvas").css({
			width: "100vw",
			height: "100vh",
		});
		$("body").css({
			overflowY: "hidden",
		});
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

	if (!$.isTouch) $("#flipbook-viewport").bind("zoom.doubleTap", zoomTo);

	// $("#flipbook").on("click", function (e) {
	// 	e.preventDefault();
	// 	const thisClick = Date.now();
	// 	if (thisClick - lastClick < 500) {
	// 		zoom.to({
	// 			x: e.clientX,
	// 			y: e.clientY,
	// 			scale: 3,
	// 			padding: 1
	// 		});
	// 		return document.body.style.overflow === "scroll"
	// 				? document.body.style.overflow = "hidden"
	// 				: document.body.style.overflow = "scroll";
	// 	}
	// 	lastClick = thisClick;
	// });

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
		if (!$.isTouch) $("#flipbook-viewport").bind("zoom.tap", zoomTo);
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
		},
	});
}

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
