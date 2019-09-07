/* =============================================================================
 * IMG view widget
 * =============================================================================
 * Display an image
 * ============================================================================ */
(function ($) {

    $.widget('fmkImgView', {

        _rotation: 0,
        _scale: 1,

        _init: function () {
            this.elem.empty();
            this.elem.addClass('fmk-imgview');

            this._view = $('<div />').appendTo(this.elem)
                .css('background-image', 'url("{0}")'.replace('{0}', this.options.url))
                .css('height', '100%');
        },

        rotate: function (angle) {
            this._rotation += angle;
            var cssValue = 'rotate({0}deg)'.replace('{0}', this._rotation.toString());
            this._view.css('-ms-transform', cssValue)
                .css('-webkit-transform', cssValue)
                .css('transform', cssValue);
        },

        zoom: function (ratio) {
            this._scale = (this._scale * ratio).toFixed(2);
            this._view.css('height', (this._scale * 100).toString() + '%')
                .css('width', (this._scale * 100).toString() + '%');
        }

    });

    $.widgetFactory.registerForType('img', 'fmkImgView');

})(jQuery);