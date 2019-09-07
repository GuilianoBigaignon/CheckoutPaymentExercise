/* =============================================================================
 * Entity Widget
 * =============================================================================
 * Display an entity
 * Expected options :
 * ============================================================================ */
(function ($) {

    $.widget('fmkEntity', {
        _init: function () {
            this.elem.empty();
            this.displayEntityActions();
            this.displayEntity();            
        },

        displayEntity: function () {
            $('<legend>{0}</legend>'.replace('{0}', this.options.contract.data.label)).prependTo(this.elem);            
            var prettyJson = Fmk.Utils.prettyPrint(this.options.entity);
            $('<pre class="fmk-entity">{0}</pre>'.replace('{0}', prettyJson)).appendTo(this.elem);
        },

        displayEntityActions: function () {
            var actionbar = $('<div class="actionbar"></div>').appendTo(this.elem);
            if (this.options.entity.rels) {
                this.options.entity.rels.forEach(function (rel) {
                    var link = this.options.contract.getResourceLinkFromRel(rel, this.options.entity.data);
                    this.displayEntityAction(link, actionbar);
                }.bind(this));
            } else if (this.options.entity.links) {
                this.options.entity.links.forEach(function (link) {
                    this.displayEntityAction(link, actionbar);
                }.bind(this));
            }
        },

        displayEntityAction: function (link, actionbar) {
            if (link.method !== 'GET') {
                var label = link.label || link.method + ' (' + link.resourceType + ')';
                $('<input type="button" value="{0}"/>'.replace('{0}', label))
                    .data('link', link)
                    .appendTo(actionbar)
                    .jqxButton({ width: '150', height: '25' })
                    .bind('click', function () {
                        this.onActionRequest(link);
                    }.bind(this));
            }
        },

        onActionRequest: function (link) {
            this.options.action && this.options.action.call(link);
            this.elem.trigger("action", [link]);
        }
    });

    $.widgetFactory.registerForType('entity', 'fmkEntity');

})(jQuery);