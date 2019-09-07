/* =============================================================================
 * Tile widget
 * =============================================================================
 * Display a tile in a dashboard, for instance
 * ============================================================================ */
(function ($, i18n) {

    $.widget('fmkTile', {
        _init: function () {
            this.options = $.extend(true, {}, $.fn.fmkTile.defaults, this.options);
            this.elem.empty();
            // Get template and data by ajax
            this.elem.addClass("fmk-tile l-pull-left");
            $('<div class="fmk-card ">' +
                '<p class="fmk-loading-white" style="width:50px; height:50px;"></p>' +
                '<p class="title title--medium title--extra-bold title--white">' + this.options.contract.label + '</p>' +
                '</div>')
                .appendTo(this.elem);
            $.when(this.getTileTemplate(), this.getTileData()).done(function (tpl, data) {
                this.options.entity = data[0];
                this.options.template = tpl[0];
                this.elem.empty().attr('data-tile-id', this.options.contract.id);
                var tplObj = $.extend(true, {}, $.fn.fmkTpl.defaultFns, {
                    entity: data[0],
                    contract: { data: this.options.contract }
                });
                var tpl = $('<div>').appendTo(this.elem).fmkTpl({ tpl: tpl[0], obj: tplObj });
                tpl.on('click', function() {
                    this.onAction(this.options.entity.data.action);
                }.bind(this));
                this.elem.trigger('tile-ready');
            }.bind(this));
        },

        getTileData: function () {
            //first try to see if this is a "remote" tile
            var link = this.options.contract.link;
            if (link) {
                return $.ajax({
                    url: link.href,
                    method: link.method
                });
            }
            
            //then, try to see if the contract contains the data
            var data = this.options.contract.templateData;
            if (data) {
                return this.createConstantDeferred([data]);
            }

            //finally, return empty data (i.e the tpl does not need data)
            return this.createConstantDeferred([{}]);
        },

        createConstantDeferred: function(data) {
            var d = $.Deferred();
            setTimeout(function () {
                d.resolve(data);
            }, 0);
            return d.promise();
        },

        getTileTemplate: function() {
            return $.get(this.options.contract.templateUrl)
        },
        onAction: function (action) {
            if (action) {
                this.options.select && this.options.select(action);
                this.elem.trigger("action", [action]);
            } else {
                $('<div/>')
                    .append('<p>' + i18n._('Fmk_Tile_noActionMessage', 'Resources', 'WEBAPPS.GUI') + '</p>')
                    .appendTo(this.elem)
                    .jqxNotification({
                        width: 250,
                        position: "top-right",
                        opacity: 0.9,
                        autoOpen: true,
                        autoClose: true,
                        template: "warning"
                    });
            }
        }

    });

    // Defaults
    $.fn.fmkTile.defaults = {
        // variables
        contract: null,
        entity: null,
        user: null,

        // callbacks
        action: function () { },
    };

    $.widgetFactory.registerForType('tile', 'fmkTile');

})(jQuery, Fmk.I18n);