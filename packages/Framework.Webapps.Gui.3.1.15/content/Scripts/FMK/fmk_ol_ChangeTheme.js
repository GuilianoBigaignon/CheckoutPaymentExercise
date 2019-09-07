ol.control.ChangeTheme = function (opt_options) {
    var options = typeof opt_options !== 'undefined' ? opt_options : {};

    this.onChangeTheme = options.onChangeTheme || function() {};

    var element = $('<div class="fmk-map-changeTheme ol-control ol-unselectable"></div>');

    var label = options.label || 'Theme';

    var button = $('<button type="button" title="{0}">&nbsp;</button>'.replace('{0}', label)).appendTo(element);

    var themes = $('<div class="fmk-map-changeThemeTool"></div>').appendTo(element);
    var changeThemeCbk = this.changeTheme.bind(this);
    options.themes.forEach(function(t) {
        $('<button type="button" title="{0}" class="fmk-map-changeTheme-{2}" style="background-image:url({1});">&nbsp;</button>'.replace('{0}', t.label).replace('{1}', t.icon).replace('{2}', t.name))
            .appendTo(themes)
            .data('fmkTheme', t)
            .on('click', function() { changeThemeCbk($(this).data('fmkTheme')) });
    });
    this.themes = themes.hide();

    $(button).on('click', this.handleClick_.bind(this));
    $(button).on('mouseout', function () { this.blur(); });
    $(button).on('focusout', function () { this.blur(); });

    ol.control.Control.call(this, {
        element: element.get(0)
    });
}
ol.inherits(ol.control.ChangeTheme, ol.control.Control);

ol.control.ChangeTheme.prototype.handleClick_ = function(event) {
    event.preventDefault();
    this.themes.toggle();    
}

ol.control.ChangeTheme.prototype.changeTheme = function (theme) {
    this.themes.toggle();
    this.onChangeTheme(theme);
}