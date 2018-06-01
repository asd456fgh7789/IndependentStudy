var ready = function($) {
    $(".clickable-row").click(function() {
        window.document.location = $(this).data("href");
    }).css( 'cursor', 'pointer');
};

$(document).ready(ready)
$(document).on('page:load', ready);
