/* =============================================================================
 * BreadCrumb widget (Fil d'ariane)
 * =============================================================================
 * Display a breadcrumb
 * ============================================================================ */
(function ($) {

    $.widget('fmkBreadcrumb', {
        _init: function () {
            this.elem.empty();
            this.elem.addClass('fmk-breadcrumb');

            this.refresh();

            this._on({
                event: 'click', selector: '.fmk-previous-button', handler: function (ev) {
                    this.options && this.options.previous && this.options.previous();
                }
            });
            
        },

        refresh: function (bcDesc) {
            this.options = $.extend(this.options, bcDesc);
            this.elem.empty();
            this.elem.append('<div class="bar-inline__item" style="height:100%;width:0;"></div>'); //hack for vertical align
            this.addPreviousButton();
            this.addCurrentPosition();
            if (typeof this.options.previous !== 'function') {
                this.elem.find('.fmk-previous-button').hide();
            }
        },

        addPreviousButton: function () {
            $('<button class="fmk-previous-button bar-inline__item btn btn--hover-purple btn--border-right btn--icon-arrow-medium-left-purple btn--icon-arrow-medium-left-purple--hover" />')
                .appendTo(this.elem);
        },

        addCurrentPosition: function () {
            var positionHtml = $('<span />');

            if (typeof this.options.position === 'string') {
                positionHtml.append(
                    $('<span class="fmk-position-lvl1" />').text(this.options.position)
                );
            } else if (Array.isArray(this.options.position) && this.options.position.length > 0) {
                // fmk_breadcrumb only support 2 levels ATM
                positionHtml.append(
                    $('<span class="bar-inline__item bar-inline__item--mg-left title title--white title--medium title--upper" />').text(this.options.position[0])
                );
                if (this.options.position.length > 1) {
                    positionHtml.append(
                        $('<span class="bar-inline__item title title--white title--medium title--light" />').text("\u00A0/\u00A0" + this.options.position[1])
                    );
                }
            }

            $('<div class="fmk-current-position bar-inline__item" />')
                .append(positionHtml)
                .appendTo(this.elem);
        }

    });

})(jQuery);