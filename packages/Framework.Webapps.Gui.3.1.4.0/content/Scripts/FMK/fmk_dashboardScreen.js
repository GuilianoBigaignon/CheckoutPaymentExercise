/* =============================================================================
 * Widget dashboard screen
 * =============================================================================
 * Display a set of dashboards to access other screens
 * ============================================================================ */
(function ($) {

    $.widget('fmkDashboardScreen', {
        _init: function () {
            var offsetCol = 0;
            this.options = $.extend(true, {}, $.fn.fmkDashboardScreen.defaults, this.options);
            this.elem.addClass('l-content__inner fmk-dashboardScreen fmk-screen').append('<div class="l-dashboard l-clearfix" />');
            var dashboardDisplayed = 0;
            var displayableContracts = [];
            $.extend(true, displayableContracts, this.options.displayableContracts);

            // Remove displayable contracts without tiles
            this.options.displayableContracts.forEach(function (dc) {
                var c = this.options.contracts.findByName(dc);

                if (c.data.tiles.length === 0) {
                    var index = displayableContracts.indexOf(dc);
                    displayableContracts.splice(index, 1);
                }
            }.bind(this));

            if (displayableContracts.length === 0) {
                this.elem.trigger('dashboard-screen-ready');
            }
            else {
                displayableContracts.forEach(function (dc) {
                    var c = this.options.contracts.findByName(dc);

                    if (c) {
                        $('<div class="fmk-dashboardScreen-dashboard" />').appendTo(this.elem.find('.l-dashboard'))
                            .buildForContract(c, { user: this.options.user, offsetColumns: offsetCol })
                            .on('action', function (e, action) {
                                this.onSelect(action);
                            }.bind(this))
                            .on('dashboard-ready', function () {
                                dashboardDisplayed++;
                                if (dashboardDisplayed === displayableContracts.length) this.elem.trigger('dashboard-screen-ready');
                            }.bind(this));
                        offsetCol += c.data.columns || 0;
                    }
                }.bind(this));
            }  
        },

        // Handle events
        onSelect: function (contract) {
            this.options.select && this.options.select(contract);
            this.elem.trigger("select", [contract]);
        },

        activate: function (action) {
            return this.elem;
        }
    });

    // Defaults
    $.fn.fmkDashboardScreen.defaults = {
        // variables
        contracts: null,
        displayableContracts: [],
        entity: null,
        user: null,

        // callbacks
        select: function () { },
    };

})(jQuery);