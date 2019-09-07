/* =============================================================================
 * Map Widget
 * =============================================================================
 * Displays a map
 * Expected options :
 * ============================================================================ */
(function ($, i18n) {


    $.widget('fmkMap', {
        _init: function () {

            this.options.allowedProviders = this.checkAndGetTileServerProviders(this.options.allowedProviders);
            this.options = $.extend(false, { }, $.fn.fmkMap.defaults, this.options);

            //walkthrough themes to know if we have to download google maps
            var hasToDownloadGmap = this.options.allowedProviders.indexOf('gmaps') !== -1 && this.options.contract.data.tileServerThemes.reduce(function (res, t) { return res || t.provider == 'gmaps' }, false);
            if (hasToDownloadGmap) {
                if (!$("body").data("google-map")) {
                    var gKey = this.options.contract.data.tileServerThemes.filter(function (d) { return d.provider === 'gmaps'; })[0].providerOptions.key;
                    var addParam = gKey && gKey.length > 0 ? "&key=" + gKey : '';
                    //google map has never been loaded => do it now                   
                    $.getScript("//maps.google.com/maps/api/js?v=3&sensor=false" + addParam, function () {
                        $("body").data("google-map", true);
                        this.googleLayer = new olgm.layer.Google();
                        this.__init();
                    }.bind(this));
                } else {
                    this.googleLayer = new olgm.layer.Google();
                    this.__init();
                }
            } else {
                this.__init();
            }
        },
        __init: function () {
            var c = this.options.contract.data;

            this.elem.addClass('fmk-map');
            
            this.sourceProj = ol.proj.get(c.projection);
            this.targetProj = ol.proj.get("EPSG:900913"); //"imposed" by OSM

            this.tileLayer = new ol.layer.Tile();

            this.view = new ol.View({
                zoom: c.mapZoom || 11,
                minZoom: c.mapZoom || 11,
                //#26909 : do not lock extents
                //extent: this.computeMapExtent(c.maxExtents),
                center: this.computeMapCenter(c.maxExtents),
                minResolution: 0.5 //this is to limit the zoom
            });

            var layers = [];
            if (this.googleLayer) {
                layers.push(this.googleLayer);
            }
            layers.push(this.tileLayer);

            this.map = new ol.Map({
                layers: layers,
                target: $('<div style="width:100%;height:100%"></div>').appendTo(this.elem).get(0),
                view: this.view,
                controls: [
                    new ol.control.Attribution({ collapsible: false /*required by OSM copyright*/ })
                ]
            });

            if (this.googleLayer) {
                this.mapForGoogle = new olgm.OLGoogleMaps({ map: this.map });
                this.mapForGoogle.activate();
            }            

            this.minimap = new ol.control.CustomOverviewMap({
                collapsed: true,
                tileLayer: new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: c.minimapOsmTilesUrl || "//{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        maxZoom: 16,
                        crossOrigin: 'anonymous'
                    })
                }),
                tipLabel: i18n._('Fmk_map_overviewMap_tipLabel', 'Resources', 'WEBAPPS.GUI'),
                view: {
                    zoom: c.minimapZoom ? c.minimapZoom : 8,
                    //#26909 : do not lock extents
                    //extent: this.computeMapExtent(c.maxExtents),
                    center: this.computeMapCenter(c.maxExtents)
                },
                onCollapseOrExpand: this.repositionTools.bind(this)
            });
            this.map.addControl(this.minimap);

            //render the map as soon as possible since otherwise the controls will not show correctly
            //sets default theme (first entry of allowed themes)
            this.onChangeTheme(this.getThemes()[0]);

            this.zoom = new ol.control.Zoom({
                className: 'fmk-map-zoom',
                zoomOutTipLabel: i18n._('Fmk_map_zoomOutTipLabel', 'Resources', 'WEBAPPS.GUI'),
                zoomInTipLabel: i18n._('Fmk_map_zoomInTipLabel', 'Resources', 'WEBAPPS.GUI')
            });
            this.map.addControl(this.zoom);

            this.zoomSlider = new ol.control.ZoomSlider({
            });
            this.map.addControl(this.zoomSlider);
            $('<div class="fmk-map-zoomSlider-min"></div>').appendTo(this.elem);
            $('<div class="fmk-map-zoomSlider-max"></div>').appendTo(this.elem);

            this.metricScaleLine = new ol.control.ScaleLine({
                units: 'metric'
            });
            this.map.addControl(this.metricScaleLine);
            this.elem.find('.ol-scale-line').addClass('fmk-map-scaleLineMetric');

            this.imperialScaleLine = new ol.control.ScaleLine({
                units: 'imperial'
            });
            this.map.addControl(this.imperialScaleLine);
            this.elem.find('.ol-scale-line').not('.fmk-map-scaleLineMetric').addClass('fmk-map-scaleLineImperial');

            this.changeTheme = new ol.control.ChangeTheme({
                label: i18n._('Fmk_map_changeThemeLabel', 'Resources', 'WEBAPPS.GUI'),
                themes: this.getThemes(),
                onChangeTheme: this.onChangeTheme.bind(this)
            });
            this.map.addControl(this.changeTheme);

            this.printMap = new ol.control.PrintMap({
                label: i18n._('Fmk_map_printMapLabel', 'Resources', 'WEBAPPS.GUI'),
                errorLabel: i18n._('Fmk_map_printMapErrorLabel', 'Resources', 'WEBAPPS.GUI'),
                downloadLabel: i18n._('Fmk_map_printMapDownloadLabel', 'Resources', 'WEBAPPS.GUI')
            });
            this.map.addControl(this.printMap);

            if (this.options.contract.rels && this.options.contract.rels.indexOf("saveFavoritePosition") != -1) {
                this.saveFavoritePosition = new ol.control.BasicButton({
                    cssClassName: 'fmk-map-saveFavoritePosition',
                    label: this.options.contract.getResourceLinkFromRel("saveFavoritePosition").label,
                    onClick: this.savePosition.bind(this, "saveFavoritePosition")
                });
                this.map.addControl(this.saveFavoritePosition);
            }

            if (this.options.contract.rels && this.options.contract.rels.indexOf("seeFavoritePosition") != -1) {
                this.seeFavoritePosition = new ol.control.BasicButton({
                    cssClassName: 'fmk-map-seeFavoritePosition',
                    label: this.options.contract.getResourceLinkFromRel("seeFavoritePosition").label,
                    onClick: function () {
                        this.options.contract.toXhr("seeFavoritePosition").done(this.goToPosition.bind(this));
                    }.bind(this)
                });
                this.map.addControl(this.seeFavoritePosition);
            }
            
            this.repositionTools(true);

            if (this.options.contract.rels && this.options.contract.rels.indexOf("seeLastPosition") != -1) {
                this.options.contract.toXhr("seeLastPosition").done(this.goToPosition.bind(this));
            }

            if (!this.options.preventSaveMapPosition && this.options.contract.rels && this.options.contract.rels.indexOf("saveLastPosition") != -1) {
                this.map.on('moveend', this.savePosition.bind(this, "saveLastPosition").bind(this));
            }

            //Sets default theme (first entry of allowed themes)
            this.onChangeTheme(this.getThemes()[0]);

            //be sure to always be asynchronous so that caller is able to do on('ready', ...)
            setTimeout(function() {this.elem.trigger('ready')}.bind(this), 0);
        },

        checkAndGetTileServerProviders: function (providers) {

            if (!providers) return $.fn.fmkMap.defaults.allowedProviders;

            var tileServerThemes = this.options.contract.data.tileServerThemes.map(function (res) {
                return res.provider ? res.provider : 'osm';
            });
            var tileServerPoviders = providers.filter(function (provider) {
                if (tileServerThemes.indexOf(provider) !== -1) return provider;
            });

            if (!tileServerPoviders || tileServerPoviders.length === 0) tileServerPoviders = $.fn.fmkMap.defaults.allowedProviders;

            return tileServerPoviders;
        },

        getThemes: function () {

            var themes = this.options.contract.data.tileServerThemes.filter(function (res) {
                //Default osm provider no contains key provider in contract
                if (this.options.allowedProviders.indexOf('osm') !== -1 && !res.provider) return res;
                if (this.options.allowedProviders.indexOf(res.provider) !== -1) return res;
            }.bind(this));

            if (!themes || themes.length === 0) themes = this.options.contract.data.tileServerThemes;

            return themes;
        },

        onChangeTheme: function (theme) {
            //disable everything
            this.elem.removeClass('fmk-gmap');
            this.googleLayer && this.googleLayer.setVisible(false);
            this.tileLayer.setVisible(false);
            //re-enable the new theme only
            if (theme.provider == 'gmaps') {
                this.elem.addClass('fmk-gmap');
                this.googleLayer.setVisible(true);
                this.mapForGoogle.getGoogleMapsMap().setMapTypeId(google.maps.MapTypeId[theme.providerOptions.mapType || 'ROADMAP']);
            } else if (theme.provider == 'msbing') {
                this.tileLayer.setVisible(true);
                this.tileLayer.setSource(new ol.source.BingMaps({
                    key: theme.providerOptions.key,
                    imagerySet: theme.providerOptions.imagerySet
                }));
            } else if (theme.provider == 'osm') {
                this.tileLayer.setVisible(true);
                this.tileLayer.setSource(new ol.source.OSM({
                    url: theme.providerOptions.urlTemplate,
                    maxZoom: 16,
                    crossOrigin: 'anonymous'
                }));
            } else if (! theme.provider) { //deprecated OSM
                this.tileLayer.setVisible(true);
                this.tileLayer.setSource(new ol.source.OSM({
                    url: theme.urlTemplate,
                    maxZoom: 16,
                    crossOrigin: 'anonymous'
                }));
            } else {
                alert('unsupported map provider');
            }
            this.map.render();
            this.minimap.render();
        },

        goToPosition: function (apiResOfPositionOnMap) {
            var extent = this.computeMapExtent(apiResOfPositionOnMap.data);
            this.map.getView().fit(extent);
        },

        savePosition: function (rel) {
            if (this.savingPosition) {
                setTimeout(this.savePosition.bind(this, rel), 500);
            } else {
                this.savingPosition = true;
                var curExtent = this.map.getView().calculateExtent(this.map.getSize());
                var topLeft = this.convertToServerCoords(ol.extent.getTopLeft(curExtent));
                var bottomRight = this.convertToServerCoords(ol.extent.getBottomRight(curExtent));
                this.options.contract.toXhr(rel, null, {
                    data: {
                        topLeftLon: topLeft[0],
                        topLeftLat: topLeft[1],
                        bottomRightLon: bottomRight[0],
                        bottomRightLat: bottomRight[1]
                    }
                }).done(function() {
                    this.savingPosition = false;
                    if (rel === "saveFavoritePosition") {
                        $("<div></div>")
                            .append('<p>' + i18n._('Fmk_map_positionSaved', 'Resources', 'WEBAPPS.GUI') + '</p>')
                            .jqxNotification({ width: 250, position: "top-right", opacity: 0.9, autoOpen: true, autoClose: true, template: "success" });
                    }
                }.bind(this));
            }
        },

        repositionTools: function (collapsed) {
            var method = collapsed ? 'addClass' : 'removeClass';
            this.elem.find('.ol-overviewmap, .fmk-map-zoom, .fmk-map-changeTheme, .fmk-map-printMap, .fmk-map-seeFavoritePosition, .fmk-map-saveFavoritePosition')[method]('fmk-map-collapsed');
        },

        computeMapExtent: function (extent) {
            var topRight = this.convertToMapCoords([extent.bottomRightLon, extent.topLeftLat]);
            var bottomLeft = this.convertToMapCoords([extent.topLeftLon, extent.bottomRightLat]);
            return [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]];
        },

        computeMapCenter: function (extent) {
            var lon = extent.bottomRightLon - (extent.bottomRightLon - extent.topLeftLon) / 2;
            var lat = extent.bottomRightLat - (extent.bottomRightLat - extent.topLeftLat) / 2;
            return this.convertToMapCoords([lon, lat]);
        },

        convertToMapCoords: function (lonLat) {
            return ol.proj.transform(lonLat, this.sourceProj, this.targetProj);
        },

        convertToServerCoords: function (lonLat) {
            return ol.proj.transform(lonLat, this.targetProj, this.sourceProj);
        },

        getMap: function () {
            if (! this.map) {
                throw "you should use the ready event to be sure to have openlayers initialized";
            }
            return this.map;
        },

        getSourceProj: function () {
            return this.sourceProj;
        },

        getTargetProj: function () {
            return this.targetProj;
        }
    });

    $.fn.fmkMap.defaults = {

        /**
         * @name framework.fmkMap#allowedProviders
         * @type {array}
         * @default  ['osm', 'msbing', 'gmap']
         * @description Set default providers to show in map
         */
        allowedProviders: ['osm', 'msbing', 'gmaps'],

        /**
         * @name framework.fmkMap#preventSaveMapPosition
         * @type {boolean}
         * @default false
         * @description True if you don't want save map position when mouse drag map
         */
        preventSaveMapPosition: false
    };

    $.widgetFactory.registerForType('map', 'fmkMap');
})(window.jQuery, Fmk.I18n);