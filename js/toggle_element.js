const togglePaginationPrevious = (value = "block") => {
    return $(".pagination-previous").css({ display: value });
}

const togglePaginationNext = (value = "block") => {
    return $(".pagination-next").css({ display: value });
}

const toggleFullScreenBtn = (value = "visible") => {
    return $(".button.fullscreen").css({ visibility: value });
}