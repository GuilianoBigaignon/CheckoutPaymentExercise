ol.control.BasicButton = function (opt_options) {
    var options = typeof opt_options !== 'undefined' ? opt_options : {};

    this.onClick = options.onClick || this.handleClick.bind(this);

    var element = $('<div class="{0} ol-control ol-unselectable"></div>'.replace('{0}', options.cssClassName || ''));

    var label = options.label || '&nbsp;';

    var button = $('<button type="button" title="{0}">&nbsp;</button>'.replace('{0}', label)).appendTo(element);

    $(button).on('click', this.onClick);
    $(button).on('mouseout', function () { this.blur(); });
    $(button).on('focusout', function () { this.blur(); });

    ol.control.Control.call(this, {
        element: element.get(0)
    });
}
ol.inherits(ol.control.BasicButton, ol.control.Control);

ol.control.BasicButton.prototype.handleClick = function (event) {
    //should be overriden if used    
}