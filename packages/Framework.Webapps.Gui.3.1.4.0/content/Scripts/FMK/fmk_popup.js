/* =============================================================================
 * ConfirmDialog
 * =============================================================================
 * Expected options :
 * ============================================================================ */

(function ($) {

    $.widget('fmkPopup', {
        _init: function () {
            this.options = $.extend(true, {}, $.fn.fmkPopup.defaults, this.options);
            this.elem.addClass('fmk-form modal fmk-popup');
            $('<div class="fmk-popup-content"></div>').append(this.options.content).prependTo(this.elem);
            var buttonsbar = $('<div class="fmk-actionBar bar-inline bar-inline--grey fmk-form-buttons" >').prependTo(this.elem);
            var title = '<p class="bar-inline__item title title--white title--medium title--light">{0}</p>'.replace('{0}', this.options.title);
            $('<div class="bar-inline__left">' + title + '</div><div class="bar-inline__right"></div>').prependTo(buttonsbar);

            var submit = $('<button class="fmk-form-submit fmk-bar-inline__item fmk-btn fmk-btn--text fmk-btn--text--icon fmk-btn--green fmk-btn--icon-valid-medium-white"><span class="fmk-btn__inner">{0}</span></button>'
                .replace('{0}', this.options.validateLabel))
                .jqxButton({ width: '150', height: '25' })
                .prependTo($(buttonsbar).find('.bar-inline__right'));
            this._on({ observable: submit, event: 'click', handler: this.submit });

            var cancel = $('<button class="fmk-form-cancel fmk-bar-inline__item fmk-btn fmk-btn--text fmk-btn--text--icon fmk-btn--green fmk-btn--icon-cross-big-white"><span class="fmk-btn__inner">{0}</span></button>'
                .replace('{0}', this.options.cancelLabel))
                .jqxButton({ width: '150', height: '25' })
                .prependTo($(buttonsbar).find('.bar-inline__right'));
            this._on({ observable: cancel, event: 'click', handler: this.cancel });

            this.elem.modal({ backdrop: 'static' });

            setTimeout(function () {
                this.elem.trigger("ready");
            }.bind(this), 10);
        },

        submit: function () {
            this.options.validate && this.options.validate.call();
            this.elem.trigger("validate", []);
            if (this.options.closeOnValidate) {
                this.elem.modal('hide');
                this.elem.remove();
            }
        },
        cancel: function () {
            this.options.cancel && this.options.cancel.call();
            this.elem.trigger("cancel", []);
            if (this.options.closeOnCancel) {
                this.elem.modal('hide');
                this.elem.remove();
            }
        }
    });

    // Defaults
    $.fn.fmkPopup.defaults = {
        // variables
        closeOnValidate: true,
        closeOnCancel: true,

        // callbacks
        cancel: function () { },
        validate: function () { },
    };

})(jQuery);
