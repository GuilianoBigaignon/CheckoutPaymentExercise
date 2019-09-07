ol.control.PrintMap = function (opt_options) {
    var options = typeof opt_options !== 'undefined' ? opt_options : {};

    this.errorLabel = options.errorLabel || 'Printing requires a browser that supports the link download attribute.';
    this.downloadLabel = options.downloadLabel || 'Click to download the image';

    var element = $('<div class="fmk-map-printMap ol-control ol-unselectable"></div>');

    var label = options.label || 'Print map';

    var button = $('<button type="button" title="{0}">&nbsp;</button>'.replace('{0}', label)).appendTo(element);

    $(button).on('click', this.handleClick_.bind(this));
    $(button).on('mouseout', function () { this.blur(); });
    $(button).on('focusout', function () { this.blur(); });

    ol.control.Control.call(this, {
        element: element.get(0)
    });
}
ol.inherits(ol.control.PrintMap, ol.control.Control);

ol.control.PrintMap.prototype.handleClick_ = function (event) {
    event.preventDefault();
    var supportImageEl = $('<a class="btn" download="map.png">{0}</a>'.replace('{0}', this.downloadLabel));
    var supportImageDownload = supportImageEl.get(0).download;    
    if (!supportImageDownload) {
        supportImageEl.remove();
        $("<div></div>")
            .append('<p>' + this.errorLabel + '</p>')
            .jqxNotification({ width: 500, position: "top-right", opacity: 0.9, autoOpen: true, autoClose: true, template: "error" });
    } else {
        this.getMap().once('postcompose', function (event) {
            var canvas = event.context.canvas;
            supportImageEl.get(0).href = canvas.toDataURL('image/png');
            $("<div></div>")
            .append('<p>' + supportImageEl.wrap('<p/>').parent().html() + '</p>')
            .jqxNotification({ width: 500, position: "top-right", opacity: 0.9, autoOpen: true, autoClose: true, autoCloseDelay: 5000, template: "info" });
        });
        this.getMap().renderSync();
    }
}