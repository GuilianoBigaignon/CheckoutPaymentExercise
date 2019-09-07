/* =============================================================================
 * MapScreen
 * =============================================================================
 * Screen that provides a map where you can display collections of objects.
 * ============================================================================ */

(function ($) {

    $.widget('fmkMapScreen', {
        _init: function() {
            var cMap = this.options.contracts.findByName(this.options.mapContractName);
            this.map = $('<div style="width:100%;height:100%"></div>').appendTo(this.elem)
                .fmkMap({ contract: cMap, allowedProviders: this.options.allowedProviders })
                .on('ready', function() {
                    this.__init();
                }.bind(this));
        },
        __init: function () {
            var olMap = this.map.fmkMap('getMap');
            this.popupEl = $('<div/>').appendTo(this.map);
            this.popup = new ol.Overlay({
                element: this.popupEl.get(0),
                positioning: 'bottom-center',
                stopEvent: false
            });
            olMap.addOverlay(this.popup);
            olMap.on('click', this.onMapClick.bind(this));

            this.slaveScreen = $('<div class="fmk-map-slave"></div>').appendTo(this.elem).hide();

            this.options.collections.forEach(function (col) {
                var cCollection = this.options.contracts.findByName(col.contractName);
                $('<div data-map="{0}"/>'.replace('{0}', cCollection.data.name)).appendTo(this.elem).buildLayerForContract(cCollection, $.extend(true, {}, col, {
                    map: this.map,
                    selectItem: this.onSelectItem.bind(this, cCollection)
                }))
                .on('action', this.onCollectionAction.bind(this, cCollection));
            }.bind(this));
        },

        onSelectItem: function (cCollection, item, coord) {
            this.popupEl.popover('destroy'); //in case the previous popover has not been destroyed yet ...
            setTimeout(function() { //wait in case the previous popover is being destroyed
                if (item.rels && item.rels.length > 0) {
                    cCollection.toXhr(item.rels[0], item.data).done(this.loadEntity.bind(this, cCollection, coord));
                } else if (item.links && item.links.length > 0) {
                    var link = item.links[0];
                    $.ajax({ type: "json", url: link.href, method: link.method }).done(this.loadEntity.bind(this, cCollection, coord));
                } else {
                    throw "Item has no rels / links to get " + JSON.stringify(options.cur.item);
                }
            }.bind(this), 100);            
        },

        loadEntity: function (cCollection, coord, res) {
            //!\ bootstrap popover requires that the element used in the content is SHOWN before => append to body
            var el = $('<div class="fmk-popover-container"/>').appendTo(this.elem);
            el.buildForContract(this.options.contracts.findByName(res.resourceType), {
                    entity: res,
                    user: this.options.user,
                    contracts: this.options.contracts
                })
                .on('action', this.onEntityAction.bind(this, cCollection, res));
                        
            this.popup.setPosition(coord);
            this.popupEl.popover({
                'placement': this.whereToPlacePopUp.bind(this),
                'html': true,
                content: el
            });
            this.popupEl.popover('show');
        },
        whereToPlacePopUp: function(pop,el){
            if ($(el).offset().top < (this.elem.offset().top + (this.elem.height() / 2)))
                return 'bottom';
            return 'top';
        },
        onMapClick: function(e) {
            //Destroy when clicking out of the popup
            var target = e.originalEvent.target;
            if (target.nodeName == 'CANVAS')
                this.popupEl.popover('destroy');
        },

        onCollectionAction: function (cCollection, ev, actionLink, filterValues) {
            var slave = $('<div/>').appendTo(this.slaveScreen.empty());

            slave.buildForContract(this.options.contracts.findByName(actionLink.resourceType), {
                actionLink: actionLink,
                user: this.options.user,
                entity: {
                    data: {
                        criteria: filterValues
                    }
                },
            })
            .on('cancel', function () { this.slaveScreen.empty().hide() }.bind(this))
            .on('success', function (event, resourceType) {
                if (resourceType !== 'searchableListExport')
                {
                    slave.show();
                    this.refresh(cCollection);
                }
            }.bind(this));
        },

        onEntityAction: function (cCollection, entity, ev, actionLink, filterValues) {
            var slave = $('<div/>').appendTo(this.slaveScreen.empty().show());
            entity.data.criteria = filterValues;
            slave.buildForContract(this.options.contracts.findByName(actionLink.resourceType), {
                entity: entity,
                map: this.map,
                actionLink: actionLink,
                user: this.options.user
            })
            .on('cancel', function () { this.slaveScreen.empty().hide() }.bind(this))
            .on('success', function () { this.refresh(cCollection); }.bind(this));
        },

        refresh: function(cCollection) {
            this.elem.find('[data-map="{0}"]'.replace('{0}', cCollection.data.name)).data('widget').refresh();
        }
    });
})(jQuery);