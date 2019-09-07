/* =============================================================================
 * Dashboard widget
 * =============================================================================
 * Display a list of shortcuts
 * ============================================================================ */
(function ($) {


    $.widget('fmkDashboard', {
        _init: function () {
            if (this.options.contract.data.tiles.length > 0) {
                this.options = $.extend(true, {}, $.fn.fmkDashboard.defaults, this.options);
                this.elem.addClass('l-dashboard__col  l-pull-left l-clearfix');
                this.elem.addClass(this._constructColClass());
                $('<p class="l-dashboard__col__title title title--medium title--light title--upper" />').appendTo(this.elem)
                    .text(this.options.contract.data.label);
                var mainEl = $('<div class="fmk-dashboard-content" />').appendTo(this.elem);
                var tileDisplayed = 0;           
                this.options.contract.data.tiles.forEach(function (tile) {
                    newTile = $('<div />').appendTo(mainEl)
                        .fmkTile({ user: this.options.user, contract: tile })
                        .on('tile-ready', function () {
                            tileDisplayed++;
                            if (tileDisplayed === this.options.contract.data.tiles.length) this.elem.trigger('dashboard-ready');
                        }.bind(this));
                }.bind(this));
            }         
        },

        _constructColClass: function () {
            var words = [null, 'one', 'two', 'three'],
                nbCol = this.options.contract.data.columns;

            var colClass = words[nbCol] ? 'l-dashboard__col--' + words[nbCol] : '';
            var offsetClass = words[this.options.offsetColumns] ? 'l-dashboard__col--' + words[this.options.offsetColumns] + '-push' : '' ;
            return colClass + ' ' + offsetClass;
        }

    });

    // Defaults
    $.fn.fmkDashboard.defaults = {
        // variables
        contract: null,
        entity: null,
        user: null,
        offsetColumns: 0,

        // callbacks
        action: function () {},
    };

    $.widgetFactory.registerForType('dashboard', 'fmkDashboard');

})(jQuery);