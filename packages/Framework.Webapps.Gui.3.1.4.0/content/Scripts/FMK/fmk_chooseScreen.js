/* =============================================================================
 * Widget choose screen
 * =============================================================================
 * Display a set of items to access other screens
 * ============================================================================ */
(function ($) {

    $.widget('fmkChooseScreen', {
        _init: function () {
            var offsetCol = 0;
            this.options = $.extend(true, {}, $.fn.fmkChooseScreen.defaults, this.options);
            
            this.elem.addClass('l-content__inner fmk-chooseScreen fmk-screen').append('<div class="l-dashboard l-clearfix" />');
            this.options.items.forEach(function (dc) {
                $('<button class="fmk-btn fmk-btn--text fmk-btn--text--reverse fmk-btn--text--icon" />').attr('id',dc.id)
                    .addClass('fmk-btn--icon-' + dc.icon + '-medium-purple').append(dc.label).appendTo(this.elem.find('.l-dashboard'))
                    .wrap('<div class="col__item fmk-form-col__item--half" />')
                    .on('click', function (e, action) {
                        this.onClick(e, dc);
                    }.bind(this));

            }.bind(this));
        },

        // Handle events
        onClick: function (e, contract) {
            if(contract.select)
                contract.select()

            this.elem.trigger("select", [contract]);
        },

        activate: function (action) {
            return this.elem;
        }
    });

    // Defaults
    $.fn.fmkChooseScreen.defaults = {
        // variables
        contracts: null,
        entity: null,
        user: null,
        items: [],
        versions: {},
        // callbacks
        select: function (el) {},
    };

    

})(jQuery);