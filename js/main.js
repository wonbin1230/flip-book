$(document).ready(async function () {
	initialViewport();
	loadApp(12);
	$("#canvas").fadeIn(2000);
});

let currentPageText = "";
let lastClick = 0;

function loadApp(pagesNum) {
	const flipbook = $("#flipbook");

	if (flipbook.width() === 0 || flipbook.height() === 0) {
		setTimeout(loadApp, 10);
		return;
	}

	flipbook.turn({
		duration: 1000,
		acceleration: !isChrome(),
		gradients: true,
		autoCenter: true,
		elevation: 50,
		pages: pagesNum,
		display: $(document).width() <= 768 ? "single" : "double",
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
			},

			missing: function (event, pages) {
				for (let i = 0; i < pages.length; i++) {
					addPage(pages[i], $(this));
				}
			}
		},
	});

	currentPageText = `1`;
	$("#current-page-input").val(`1/${pagesNum}`);

	bindControlEvents(pagesNum);
}

function addPage(page, book) {
	const element = $("<div />", {});

	if (book.turn("addPage", element, page)) {
		element.html('<div class="gradient"></div><div class="loader"></div>');
		loadPage(page, element);
	}
}

function loadPage(page, pageElement) {
	const img = $("<img />");

	img.mousedown(function (e) {
		e.preventDefault();
	});

	img.on("load", function () {
		$(this).css({ width: "100%", height: "100%" });
		$(this).appendTo(pageElement);
		pageElement.find(".loader").remove();
	});
	img.attr("src", `pages/${page}.jpg`);
}

function isChrome() {
	return navigator.userAgent.indexOf("Chrome") !== -1;
}

function initialViewport() {
	const width = $(window).width();
	const height = $(window).height();

	if (width <= 768) {
		$("#flipbook-viewport").css({
			width: width,
		});
		$("#flipbook").removeClass("animated");
		$("#flipbook").css({
			width: `${width}px`,
			height: `${width * 1.3}px`,
			left: 0,
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

	$("#flipbook").on("click", function (e) {
		e.preventDefault();
		const thisClick = Date.now();
		if (thisClick - lastClick < 500) {
			const rect = e.target.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			zoom.to({
				x,
				y,
				scale: 3,
			});
			return;
		}
		lastClick = thisClick;
	});
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
