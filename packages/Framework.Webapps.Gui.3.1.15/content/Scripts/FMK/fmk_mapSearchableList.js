/* =============================================================================
 * MapScreen
 * =============================================================================
 * Screen that provides a map where you can display collections of objects.
 * ============================================================================ */

(function ($, jsonPath) {

    $.widget('fmkMapSearchableList', {
        _init: function () {
            this.curFilter = {};
            this.curPage = { skip: 0, limit: this.options.pageSizeMode || 5000 };
            this.createActionBarWithFilter();
            this.lastPixel = [0, 0];
            this.timeOutClickId = 0;
            var map = this.options.map.fmkMap('getMap');
            map.on('click', this.onMapClick.bind(this));
            map.on('pointermove', this.onMapPointerMove.bind(this));
            this.vector = new ol.source.Vector({
                features: []
            });
            var vectorLayer = new ol.layer.Vector({
                source: this.vector
            });
            this.options.map.fmkMap('getMap').addLayer(vectorLayer);
        },

        createActionBarWithFilter: function () {
            this.filterEl = null;
            var fContract = this.options.contract.data.filter;
            if (fContract) {
                this.filterEl = $('<div class="fmk-searchableList-filter"/>').buildForContract({ data: fContract, resourceType: 'dataContract' }, { user: this.options.user, entity: { data: this.options.query } })
                    .on('filterChanged', function (e, values) {
                        this.applyFilters(values);
                    }.bind(this));
            }

            //If actionbar needs to catch events it must to be created before call setFilters or refres()
            this.actionBar = $('<div class="fmk-map-actionBar" />').prependTo(this.elem).fmkActionBar({ filterEl: this.filterEl });

            if (fContract) {
                if (this.options.query) {
                    //applyFilters will call refresh
                    this.filterEl.fmkFilter('setFilters', this.options.query);
                } else {
                    //no filter => immediately call refresh
                    this.refresh();
                }
            } else {
                //no filter => immediately call refresh
                this.refresh(); 
            }
        },

        applyFilters: function (values) {
            this.filterEl.fmkFilter('disable');
            this.curPage = { skip: 0, limit: this.options.pageSizeMode || 5000 };
            this.curFilter = values;
            this.refresh();
        },

        displayActions: function (res) {
            var actions = [];
            if (res.rels) {
                actions = res.rels.map(function (rel) {
                    var resLink = this.options.contract.getResourceLinkFromRel(rel);
                    return this.displayAction(resLink);
                }.bind(this));
            } else if (res.links) {
                actions = res.links.forEach(function (resLink) {
                    return this.displayAction(resLink);
                }.bind(this));
            }
            this.actionBar.fmkActionBar('refreshActions', actions);
        },
        displayAction: function(resLink) {
            var label = resLink.label || resLink.method + ' (' + resLink.resourceType + ')';
            var onActionRequestCbk = this.onActionRequest.bind(this);
            return $('<input type="button" value="{0}"/>'.replace('{0}', label))
                .data('link', resLink)
                .jqxButton({})
                .bind('click', function () {
                    onActionRequestCbk($(this).data('link'));
                });
        },
        onActionRequest: function(link) {
            this.options.action && this.options.action.call(link);
            this.elem.trigger("action", [link, this.filterEl.getFmkWidget().getValues()]);
        },

        displayData: function (res) {
            var list = res.data.list;

            //display features
            var features = list.map(function (item) {
                var itemData = item.data;
                var itemLon = jsonPath(itemData, this.options.mapping.lonPath || "$.lon")[0];
                var itemLat = jsonPath(itemData, this.options.mapping.latPath || "$.lat")[0];
                var itemCoords = this.options.map.fmkMap('convertToMapCoords', [itemLon, itemLat]);
                var itemStyle = jsonPath(itemData, this.options.mapping.styleNamePath || "$.style")[0];
                var feature = new ol.Feature();
                feature.setGeometry(new ol.geom.Point(itemCoords));
                feature.setProperties({
                    fmkitem: item
                });
                if (this.options.styles && this.options.styles[itemStyle]) {
                    feature.setStyle(this.options.styles[itemStyle]);
                } else if (this.options.styles && this.options.styles.default) {
                    feature.setStyle(this.options.styles.default);
                }
                return feature;
            }.bind(this));     
            this.vector.addFeatures(features);

            //fit the map if possible
            this.options.map.fmkMap('getMap').getView().fit(this.vector.getExtent());
        },

        loadCollection: function (res) {
            if (res.data.skip != this.curPage.skip) {
                //we are probably receiving a response from a previous pagination or filter
                //note that this test is not 100% accurate as we should compare the executed filter with the current filter
                //the problem is that the APIs do not return the filter that was executed...
                return;
            }
            if (res.data.skip == 0) {
                this.vector.clear();
            }
            this.displayData(res);
            this.displayActions(res);
            if (res.data.count > res.data.skip + res.data.limit) {
                this.curPage.skip += res.data.limit;
                this.refresh();
            }
            this.filterEl.fmkFilter('enable');
        },

        onMapClick: function (evt) {
            var map = this.options.map.fmkMap('getMap');
            var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                return feature;
            });
            if (feature) {
                var item = feature.get('fmkitem');
                this.options.selectItem && this.options.selectItem.call(window, item, evt.coordinate);
                this.elem.trigger("selectItem", [item, evt.coordinate]);
            }
        },

        onMapPointerMove: function (e) {
            //If over a popover we don't 
            if (e.dragging || $('.popover:hover').length) {
                return;
            }

            var map = this.options.map.fmkMap('getMap');
            var pixel = map.getEventPixel(e.originalEvent);
            var hit = map.hasFeatureAtPixel(pixel);
            map.getTarget().style.cursor = hit ? 'pointer' : '';
        },

        refresh: function() {
            this.options.contract.toXhr(this.options.rel, null, { data: $.extend(true, {}, this.curPage, this.curFilter) }).done(this.loadCollection.bind(this));
        }
    });

    $.mapLayerFactory.registerForType('searchableList', 'fmkMapSearchableList');
})(jQuery, window.jsonPath);