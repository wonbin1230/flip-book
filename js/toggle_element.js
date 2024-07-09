const hidePaginationPrevious = () => $(".pagination-previous").css({ display: "none" });
const showPaginationPrevious = () => $(".pagination-previous").css({ display: "block" });

const hidePaginationNext = () => $(".pagination-next").css({ display: "none" });
const showPaginationNext = () => $(".pagination-next").css({ display: "block" });

const hideFullScreenBtn = () => $(".button.fullscreen").css({ visibility: "hidden" });
const showFullScreenBtn = () => $(".button.fullscreen").css({ visibility: "visible" });

const hideZoomInBtn = () => $(".button.zoom-in").css({ visibility: "hidden" });
const showZoomInBtn = () => $(".button.zoom-in").css({ visibility: "visible" });

const mobileSize = () => $("#canvas").css({ width: "100dvw", height: "100dvh"});
const desktopSize = () => $("#canvas").css({ width: "100%vw", height: "100vh"});

const hideScrollY = () => $("body").css({ overflowY: "hidden"});
const showScrollY = () => $("body").css({ overflowY: "auto"});