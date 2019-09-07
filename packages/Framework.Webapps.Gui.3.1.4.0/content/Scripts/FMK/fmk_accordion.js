/* =============================================================================
 * Accordion widget
 * =============================================================================
 * Display a list of expandable panels
 * ============================================================================ */
(function ($, utils) {

    /**
    * Represents an accordion
    * @class Framework Accordion
    * @namespace framework.fmkAccordion
    */
    $.widget('fmkAccordion', {
        _init: function () {
            this.options = $.extend(false, {}, $.fn.fmkAccordion.defaults, this.options);
            this.uidClass = 'fmk-id-{0}'.replace('{0}', utils.generateUUID());
            this.elem.addClass("fmk-accordion " + this.uidClass);

            this.elem.jqxNavigationBar({
                expandMode: this.options.multiple ? 'multiple' : 'toggle',
                width: '100%',
                expandedIndexes: this.options.expandedIndexes,
                showArrow: false
            });

            this.elem.find('.jqx-expander-header-expanded.bar-inline').each(function () {
                $(this).find('.btn--icon-plus-medium-white, .btn--icon-plus-medium-purple').addClass('jsIsActive btn--is-active');
            });
            this.elem.children('div[role="tab"].bar-inline').on('click', function () {
                var activeClasses = 'jsIsActive btn--is-active';
                var parent = $(this).closest('.fmk-accordion');

                $(this).find('.btn--icon-plus-medium-white, .btn--icon-plus-medium-purple').toggleClass(activeClasses);
                setTimeout(function(){
                    $(parent).find('> div[role="tab"]:not(.jqx-expander-header-expanded) button').removeClass(activeClasses);
                }, 100);
         
            });
        },
        
        /**
        * Expand a panel
        * @name framework.fmkAccordion#expand
        * @function
        * @param {int} index - Index of the panel to expand.
        */
        expand: function (index) {

            this.elem.jqxNavigationBar('expandAt', index);

            //Change icon of accordion header (+ / -)
            var activeClasses = 'jsIsActive btn--is-active';
            var accordionHeader = $(this.elem.find('> div[role="tab"]')[index]).find('.bar-inline');
            accordionHeader.closest('.fmk-accordion').find('> div[role="tab"]:not(.jqx-expander-header-expanded) button').removeClass(activeClasses);
            accordionHeader.find('.btn--icon-plus-medium-white, .btn--icon-plus-medium-purple').addClass(activeClasses);
        },

        /**
        * Collapse a panel
        * @name framework.fmkAccordion#collapse
        * @function
        * @param {int} index - Index of the panel to collapse.
        */
        collapse: function (index) {
            this.elem.jqxNavigationBar('collapseAt', index);

            //Change icon of accordion header (+ / -)
            var activeClasses = 'jsIsActive btn--is-active';
            var accordionHeader = $(this.elem.find('> div[role="tab"]')[index]).find('.bar-inline');
            accordionHeader.find('.btn--icon-plus-medium-white, .btn--icon-plus-medium-purple').removeClass(activeClasses);
        }
    });

    $.fn.fmkAccordion.defaults = {
        // behaviour
        /**
        * @name framework.fmkAccordion#multiple
        * @type {boolean}
        * @default true
        * @description True if you can expand multiple panels at once.
        */
        multiple: true,
        /**
        * @name framework.fmkAccordion#expandedIndexes
        * @type {number[]}
        * @default []
        * @description Opened panels at initialization. If multiple is set at false, only the first index is taken.
        */
        expandedIndexes: [0]
    };

    $.widgetFactory.registerForType('accordion', 'fmkAccordion');

})(jQuery, Fmk.Utils);