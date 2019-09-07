function initDashboard() {
    var list = $('.fmk-demo-content'),
        demos = initDemos();

    demos.forEach(function (demo) {
        $('<li class="fmk-demo-widget-tile col-lg-3 col-md-4 col-sm-4 col-xs-6" />').appendTo(list)
            .append(
                $('<div />')
                    .append($('<h2 />').html(demo.title))
                    .append($('<p class="fmk-demo-widget-description"/>').html(demo.description))
                    .append($('<p class="fmk-demo-widget-tags"/>').html(demo.tags.join(", "))
                ).on('click', function () {
                    window.open(demo.url, '_blank');
                })
            );
    });
}

$(document).ready(function () {
    initDashboard();
});