/* =============================================================================
 * Atlas.FMK : Searchable List
 * =============================================================================
 * Display a bar table with filters and sorting options
 * Expected options :
 * ============================================================================ */

(function ($, utils, i18n) {

    /**
    * Represents a searchable list.
    * @class fmkSearchableList
    * @namespace framework.fmkSearchableList
    */
    $.widget('fmkSearchableList', {
        _init: function () {
            var elem = this.elem;
            this.options.selectedRows = [];
            var options = this.options = $.extend(true, {}, $.fn.fmkSearchableList.defaults, this.options);
            var that = this; //ugly hack to be able to reference the widget inside callback without binding everytime

            this.elem.attr('data-contract', this.options.contract.data.name);
            this.filterEl = null;
            var fentity = { data: {} };
            if (options.startingAction && options.startingAction.query) {
                fentity.data = options.startingAction.query;
            }
            this.filterEl = $('<div class="fmk-searchableList-filter"/>').buildForContract({ data: options.contract.data.filter || { type: "filter", fields: [] }, resourceType: 'dataContract' }, { user: options.user, entity: fentity })
                .on('filterChanged', this.applyFilters.bind(this));

            this.actionBar = $('<div />').prependTo(this.elem).fmkActionBar({ filterEl: this.filterEl });
            // Display refresh button if needed
            if (this.options.canRefresh) {
                $('<button class="bar-inline__item btn btn--text btn--purple">{0}</button>'
                    .replace('{0}', 'Refresh'))
                    .prependTo(this.elem.find('.bar-inline__right'))
                    .on('click', function () {
                        this.refresh();
                    }.bind(this));
            }

            var divContainer = $('<div class="row-fluid"/>').appendTo(this.elem);
            var mainElContainer = $('<div class="fmk-searchableList-gridContainer col-xs-12"></div>').appendTo(divContainer);
            var mainEl = $('<div class="fmk-searchableList-grid"></div>').appendTo(mainElContainer);
            options.grid = mainEl;
            options.divContainer = divContainer;

            options._newPageSize = parseInt((options.screenHeight * 1.25) / options.rowHeight) + 1; //25 is the default row height for jqxgrid.

            var resLink = null;
            if (options.startingAction && options.startingAction.resLink) {
                //the link to code has been retrieved externally (usually from entity)
                resLink = options.startingAction.resLink;
            } else if (options.startingAction && options.startingAction.rel) {
                //we must operate on the given rel and the given query (usually from dashboard)
                resLink = options.contract.getResourceLinkFromRel(options.startingAction.rel, options.startingAction.query);
            } else if (options.contract.rels && options.contract.rels.length > 0) {
                //default to the first rel of the contract (this is for backward compatibility)
                resLink = options.contract.getResourceLinkFromRel(options.contract.rels[0]);
            } else {
                var msg = (!!i18n) ? i18n._('Fmk_SearchableList_noRel', 'Resources', 'WEBAPPS.GUI').replace('{0}', options.contract.data.label) : null;
                mainEl.append('<div class="alert alert-danger" role="alert">'
                    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                    + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true">&nbsp;</span>'
                    + '<span class="sr-only">Error</span>'
                    + msg + '</div>');
                throw "Searchablelist has no rels / links to get " + JSON.stringify(options.contract);
            }

            var source = {
                datatype: "json",
                root: "data>list",
                id: 'data>id',
                cache: false,
                url: resLink.href,
                type: resLink.method,
                datafields: options.contract.data.columns.map(function (d) {
                    return { name: d.id, map: 'data>' + d.id };
                }).concat([
                    { name: '__links__', map: 'links' }, //create a fake field to restitute it in rowselect
                    { name: '__rels__', map: 'rels' } //create a fake field to restitute it in rowselect
                ]),
                beforeprocessing: function (data) {
                    this.totalrecords = data.data.count;
                    this.realtotalrecords = data.data.count;
                    this.sortcolumn = data.data.sortField;
                    this.sortdirection = data.data.sortDir;
                    that.displayActions(data);
                },
                sort: function () {
                    // update the grid and send a request to the server.
                    that.dataAdapter._cache = [];
                    mainEl.jqxGrid('updatebounddata', 'sort');
                    options.sort && options.sort.call();
                    that.options.noMoreData = false;
                    elem.trigger("sort", []);
                },
                filter: function () {
                    // update the grid and send a request to the server.
                    that.dataAdapter._cache = [];
                    if (options.filterRefresh) {
                        mainEl.jqxGrid('updatebounddata', 'filter');
                    }
                    options.filter && options.filter.call();
                    that.options.noMoreData = false;
                    elem.trigger("filter", []);
                }
            };

            this.dataAdapter = new $.jqx.dataAdapter(source, {
                loadServerData: function (serverdata, source, callback) {

                    var isRequestingTooMuchData = that.dataAdapter._cache && that.dataAdapter._cache.length >= source.realtotalrecords;
                    if (isRequestingTooMuchData && !options._forceRecall) {
                        //take only reals cached records to build list
                        options.noMoreData = true;
                        callback({ records: that.dataAdapter._cache, totalrecords: source.realtotalrecords });
                    } else {
                        options._loading = true;

                        if (options._firstLoad) {
                            if (options.startingAction && options.startingAction.query) {
                                // At the first load, init the filter with starting action query
                                $.extend(true, serverdata, options.startingAction.query);
                                if (!!that.filterEl)
                                    that.filterEl.fmkFilter('setFilters', options.startingAction.query);
                            }
                            options._firstLoad = false;
                        } else if (!!that.filterEl) {
                            serverdata = $.extend(true, {}, that.filterEl.getFmkWidget().getValues(), serverdata);
                        }
                        $.ajax({
                            dataType: source.datatype,
                            url: source.url,
                            data: serverdata,
                            cache: false,
                            success: function (data, status, xhr) {
                                var dataAdapter = this.dataAdapter;

                                if ($.isFunction(source.beforeprocessing)) {
                                    source.beforeprocessing(data, status, xhr);
                                }
                                dataAdapter.loadjson(null, data, source);

                                if (this.options.contract.data.multiSelectionColumn) {

                                    // Check the boxes accordingly with the clipboard
                                    for (var i = 0; i < dataAdapter.records.length; i++) {
                                        var record = dataAdapter.records[i];

                                        if (this.clipboard.includedIds) {
                                            record.available = (this.clipboard.includedIds.indexOf(record[this.options.contract.data.multiSelectionColumn]) !== -1);
                                        } else {
                                            record.available = (this.clipboard.excludedIds.indexOf(record[this.options.contract.data.multiSelectionColumn]) === -1);
                                        }
                                    }
                                }

                                dataAdapter._cache = dataAdapter._cache ? dataAdapter._cache.concat(dataAdapter.records) : [].concat(dataAdapter.records);
                                dataAdapter.records = dataAdapter._cache;
                                options._forceRecall = false;
                                callback({ records: dataAdapter.records, totalrecords: dataAdapter.records.length });
                            }.bind(that)
                        });
                    }
                    // enable filter anyway
                    that.filterEl.fmkFilter('enable');
                },
                formatData: function (data) {
                    var dataForServer = {
                        skip: that.dataAdapter._cache ? that.dataAdapter._cache.length : 0,
                        limit: options._newPageSize,
                        sortField: data.sortdatafield,
                        sortDir: data.sortorder
                    }
                    for (var i = 0; i < data.filterscount; i++) {
                        //jqxGrid convert array to string when applying filter. 
                        //So we need this this array to send in URI.
                        if (typeof (data['filtervalue' + i]) === 'string' && data['filtervalue' + i].indexOf(',') !== -1) {
                            data['filtervalue' + i] = data['filtervalue' + i].split(',');
                        }

                        dataForServer[data['filterdatafield' + i]] = data['filtervalue' + i];
                    }

                    return dataForServer;
                }
            });


            var columns = options.contract.data.columns.map(function (d) {
                var vret = {
                    datafield: d.id,
                    menu: false,
                    text: d.label,
                    hidden: typeof d.hidden !== "undefined" && d.hidden,
                    filterable: false,
                    sortable: d.sortable || (options.contract.data.sortables && options.contract.data.sortables.indexOf(d.id) > -1),
                    editable: false,
                    cellclassname: function (row, columnfield, value) {
                        if (options.selectedRows.includes(row)) {
                            return 'fmk-cell-selected';
                        }
                    }
                };
                if (!!d.width) {
                    vret.width = d.width;
                }
                if (!!d.renderer && (typeof window[d.renderer] === 'function')) {
                    vret.cellsrenderer = window[d.renderer];
                } else if (!!$.fn.fmkSearchableList.format[d.type]) {
                    vret.cellsrenderer = $.fn.fmkSearchableList.format[d.type].bind(that);
                }
                if (!!d.values)
                    vret.values = d.values.values;
                switch (d.type) {
                    case 'checkbox':
                        vret.type = 'checkbox';
                        vret.cellsalign = 'center';
                        break;
                    case 'enum':
                        if (!vret.cellsrenderer) {
                            vret.cellsrenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
                                var ret = $(defaulthtml);
                                if (d.values) {
                                    var val = d.values.values.filter(function (v) { return v.key == value });
                                    if (val.length > 0)
                                        ret.text(val[0].value);
                                }
                                return ret[0].outerHTML;
                            };
                        }
                        break;
                    default:
                        break;
                }
                return vret;
            });

            if (options.contract.data.multiSelectionColumn) {
                columns.unshift(
                    {
                        text: '',
                        menu: false,
                        sortable: false,
                        datafield: 'available',
                        columntype: 'checkbox',
                        width: 40,
                        editable: true,
                        cellclassname: function (row, columnfield, value) {
                            if (options.selectedRows.includes(row)) {
                                return 'fmk-cell-selected';
                            }
                        },
                        renderer: function () {
                            return '<div style="margin-top:25px;margin-left:-10px;"></div>';
                        },
                        rendered: function (element) {
                            $(element).jqxCheckBox({ width: 13, height: 13, animationShowDelay: 0, animationHideDelay: 0 });
                            this.columnCheckBox = $(element);
                            this.columnCheckBox.on('change', function (event) {
                                var checked = event.args.checked;
                                if (checked == null) {
                                    // Checkbox in indeterminate state    
                                    return;
                                }

                                // lock graphical component update during multiple changes
                                mainEl.jqxGrid('beginupdate');

                                var rowscount = mainEl.jqxGrid('getdatainformation').rowscount;

                                // check or uncheck all displayed checkboxes
                                for (var i = 0; i < rowscount; i++) {
                                    // The bound index represents the row's unique index
                                    var boundindex = mainEl.jqxGrid('getrowboundindex', i);
                                    mainEl.jqxGrid('setcellvalue', boundindex, 'available', checked);
                                }

                                if (checked) {
                                    this.clipboard = {
                                        includedIds: null,
                                        excludedIds: []
                                    };
                                    this.manageSelectionRows(this.elem);
                                    elem.find('.fmk-action-button').addClass('fmk-action-button-selected');
                                    console.log('all rows checked');
                                } else {
                                    this.clipboard = {
                                        includedIds: [],
                                        excludedIds: null
                                    };
                                    this.options.selectedRows = [];
                                    elem.find('.fmk-action-button').removeClass('fmk-action-button-selected');
                                    console.log('all rows unchecked');
                                }
                                // unlock graphical component to apply the multiple changes
                                mainEl.jqxGrid('endupdate');
                            }.bind(this));
                            return true;
                        }.bind(this)
                    });

                // Clipboard initialization with an empty list of included ids (means that we are in "include" mode)
                this.clipboard = {
                    includedIds: [],
                    excludedIds: null
                };
            }

            mainEl.jqxGrid({
                width: '100%',
                source: this.dataAdapter,
                editable: options.contract.data.multiSelectionColumn ? true : false,
                autoheight: true,
                showdefaultloadelement: false,
                selectionmode: 'multiplerowsadvanced',
                sortable: true,
                showfiltercolumnbackground: false,
                columnsresize: true,
                columnsreorder: true,
                showsortcolumnbackground: false,
                rowsheight: options.rowHeight,
                localization: {
                    emptydatastring: (!!i18n) ? i18n._('Fmk_Grid_Emptydatastring', 'Resources', 'WEBAPPS.GUI') : null
                },
                columnsheight: options.rowHeight,
                sorttogglestates: 1,
                virtualmode: true,
                ready: function () {
                    this.setScrollSize();
                    if (options.autoSelectFirst) {
                        options.grid.jqxGrid('selectrow', 0);
                        var data = options.grid.jqxGrid('getrowdata', 0);
                        if (data) {
                            var fakerow = { data: {} };
                            fakerow.links = data.__links__;
                            fakerow.rels = data.__rels__;
                            for (var k in data) {
                                if (data.hasOwnProperty(k) && k != '__links' && k != '__rels') {
                                    fakerow.data[k] = data[k];
                                }
                            }
                            options.selectItem && options.selectItem.call(fakerow);
                            elem.trigger("selectItem", [fakerow]);
                        }
                    }
                }.bind(this),
                pagesize: (options.screenHeight > -1) ? options._newPageSize : options.pagesize,
                rendergridrows: function (params) {
                    return params.data;
                },
                columns: columns
            });

            mainEl.on('mouseenter', '.jqx-grid-cell div:first-child', function () {
                var $t = $(this);
                var title = $t.attr('title');
                if (!title) {
                    if (this.offsetWidth < this.scrollWidth) {
                        $t.attr('title', $t.text());
                    }
                } else {
                    if (this.offsetWidth >= this.scrollWidth && title === $t.text()) {
                        $t.removeAttr('title');
                    }
                }
            });

            if (options.contract.data.multiSelectionColumn) {
                mainEl.bind('cellbeginedit', function (event) {
                    if (event.args.datafield === 'available' && this.options.selectedRows.indexOf(event.args.rowindex) == -1) {
                        this.options.selectedRows.push(event.args.rowindex);
                        elem.find('.fmk-action-button').addClass('fmk-action-button-selected');
                    }
                    else if (event.args.datafield === 'available' && this.options.selectedRows.indexOf(event.args.rowindex) != -1) {
                        this.options.selectedRows.splice(this.options.selectedRows.indexOf(event.args.rowindex), 1);
                        elem.find('.fmk-action-button').removeClass('fmk-action-button-selected');
                    }
                }.bind(this));
                mainEl.bind('cellendedit', function (event) {
                    var checked = event.args.value;
                    var rowscount = mainEl.jqxGrid('getdatainformation').rowscount;
                    var rowUniqueId = mainEl.jqxGrid('getcellvalue', event.args.rowindex, options.contract.data.multiSelectionColumn);
                    if (checked) {
                        console.log('Row ' + rowUniqueId + ' checked');

                        // Update the clipboard
                        if (this.clipboard.includedIds) {
                            this.clipboard.includedIds.push(rowUniqueId);

                            // Update the column checkbox
                            if (this.clipboard.includedIds.length == rowscount) {
                                // All rows checked, we check the column checkbox
                                this.columnCheckBox.jqxCheckBox('check');
                            } else {
                                // At least one row unchecked, we 'indeterminate' the column checkbox
                                this.columnCheckBox.jqxCheckBox('indeterminate');
                            }
                        } else {
                            this.clipboard.excludedIds.splice(this.clipboard.excludedIds.indexOf(rowUniqueId), 1);

                            // Update the column checkbox
                            if (this.clipboard.excludedIds.length == 0) {
                                // All rows checked, we check the column checkbox
                                this.columnCheckBox.jqxCheckBox('check');
                            } else {
                                // At least one row unchecked, we 'indeterminate' the column checkbox
                                this.columnCheckBox.jqxCheckBox('indeterminate');
                            }
                        }
                    } else {
                        console.log('Row ' + rowUniqueId + ' unchecked');

                        // Update the clipboard
                        if (this.clipboard.includedIds) {
                            this.clipboard.includedIds.splice(this.clipboard.includedIds.indexOf(rowUniqueId), 1);

                            // Update the column checkbox
                            if (this.clipboard.includedIds.length > 0) {
                                // At least one row checked, we 'indeterminate' the column checkbox
                                this.columnCheckBox.jqxCheckBox('indeterminate');
                            } else {
                                // No row checked, we uncheck the column checkbox
                                this.columnCheckBox.jqxCheckBox('uncheck');
                            }
                        } else {
                            this.clipboard.excludedIds.push(rowUniqueId);

                            // Update the column checkbox
                            if (this.clipboard.excludedIds.length != rowscount) {
                                // At least one row checked, we 'indeterminate' the column checkbox
                                this.columnCheckBox.jqxCheckBox('indeterminate');
                            } else {
                                // No row checked, we uncheck the column checkbox
                                this.columnCheckBox.jqxCheckBox('uncheck');
                            }
                        }
                    }
                }.bind(this));
            };

            mainEl.on('rowselect', function (event) {

                if (event.args.owner._clickedcolumn && event.args.owner._clickedcolumn !== 'available') {

                    if (event.args.row) {

                        var fakerow = { data: {} };
                        fakerow.links = event.args.row.__links__;
                        fakerow.rels = event.args.row.__rels__;
                        for (var k in event.args.row) {
                            if (event.args.row.hasOwnProperty(k) && k != '__links' && k != '__rels') {
                                fakerow.data[k] = event.args.row[k];
                            }
                        }
                        options.selectItem && options.selectItem.call(fakerow);
                        elem.trigger("selectItem", [fakerow]);
                        var invisibleBottomScrollAreaSize = options.divContainer[0].scrollHeight - options.divContainer[0].scrollTop - options.divContainer[0].clientHeight,
                            invisibleTopScrollAreaSize = options.divContainer[0].scrollTop,
                            nbInvisibleBottomScrollElements = Math.round(invisibleBottomScrollAreaSize / event.args.owner.rowsheight),
                            nbInvisibleTopScrollElements = Math.round(invisibleTopScrollAreaSize / event.args.owner.rowsheight),
                            scrollTopValue = options.divContainer[0].scrollTop,
                            scrollTopMax = options.divContainer[0].scrollHeight - options.divContainer[0].clientHeight;

                        // Need to scroll down
                        if (event.args.row.boundindex >= (event.args.owner._endvisibleindex - nbInvisibleBottomScrollElements)) {
                            scrollTopValue = options.divContainer[0].scrollTop + options.divContainer[0].clientHeight - (2 * event.args.owner.rowsheight);
                            options.scrollRemainder = scrollTopValue - scrollTopMax;
                            if (options.scrollRemainder > 0) {
                                scrollTopValue = scrollTopMax;
                            } else {
                                options.scrollRemainder = 0;
                            }
                        }

                        // Need to scroll up
                        if (event.args.row.boundindex < nbInvisibleTopScrollElements) {
                            scrollTopValue = options.divContainer[0].scrollTop - options.divContainer[0].clientHeight + (2 * event.args.owner.rowsheight);
                        }

                        options.divContainer.scrollTop(scrollTopValue);
                    }
                }
            });

            mainEl.bind('bindingcomplete', function () {
                options._loading = false;
                var rows = options.grid.jqxGrid('getdisplayrows');
                if (options._firstBinding) {
                    options._firstBinding = false;
                    if (options.autoSelectFirst) {
                        var pagingInfo = options.grid.jqxGrid('getpaginginformation');
                        var pos = pagingInfo.pagenum * pagingInfo.pagesize;
                        options.grid.jqxGrid('selectrow', rows.length && rows[pos] ? rows[pos].boundindex : 0);
                    } else {
                        mainEl.jqxGrid('clearselection');
                    }
                }
                // Overriding jqwidgets classes
                // not done anymore because of #26322 : agence interactive did not provide the btn--icon-arrow-pointing-small-up-white css rule, we reset to jqx theme (less classy but working)
                // see also jqx.fmk.css
                //options.grid.find('.jqx-icon-arrow-up').addClass('btn btn--is-active btn--icon-arrow-pointing-small-down-white');
                //options.grid.find('.jqx-icon-arrow-down').addClass('btn btn--is-active btn--icon-arrow-pointing-small-up-white');

                if (options.contract.data.isFixed) {
                    options.grid.find('.jqx-grid-content').css('top', '60px');
                    options.grid.find('.jqx-grid-header').css({ 'position': 'fixed', 'z-index': '1' });
                }
                if (options.noMoreData)
                    setTimeout(function () { options.divContainer.scrollTop(options.divContainer.prop('scrollHeight')); }, 200);
                else if (options.scrollTop)
                    options.divContainer.scrollTop(options.scrollTop);

                // Disable hover on row when no rels
                for (var i = 0; i < rows.length; i++) {
                    var hasRel = rows[i].__rels__ && rows[i].__rels__.length;
                    var elemId = '#row' + i + options.grid[0].id;
                    $(elemId).addClass(hasRel ? 'row-with-rel' : 'row-without-rel');
                    if (this.columnCheckBox && this.columnCheckBox.jqxCheckBox('val') && !this.options.selectedRows.includes(i)) {
                        $(elemId).find('.jqx-grid-cell').addClass('fmk-cell-selected');
                        this.options.selectedRows.push(i);
                    }
                }
                options.afterLoad && options.afterLoad.call();
                elem.trigger("afterLoad", []);
            }.bind(this));

            divContainer.bind('scroll', function () {
                if (options.noMoreData)
                    return;

                var scrollToEnd = this.scrollHeight - this.scrollTop - this.clientHeight;
                if (scrollToEnd < 120) {
                    var pagesize = options.grid.jqxGrid('pagesize');
                    if (!options._loading) {
                        options.grid.jqxGrid({ pagesize: pagesize + options.pagesize });
                        options.scrollTop = this.scrollTop + ((options.scrollRemainder != undefined) ? options.scrollRemainder : 0);
                    }
                }
            });

        },

        setTooltipForEllipsedCells: function () {

        },

        setScrollSize: function () { //See ticket TFS #14301 + 14462
            var width = this.options.divContainer.width();
            var hScroll = this.options.divContainer.find('.jqx-scrollbar[id*="horizontalScrollBar"]');
            if (width - hScroll.width() < 10)
                hScroll.hide();

            setTimeout(function () {
                var top = this.options.divContainer.offset().top - this.options.divContainer.parent().offset().top;
                this.options.divContainer.css({ 'height': 'calc(100% - ' + top + 'px)', 'overflow-y': 'auto' });
                this.options.grid.jqxGrid({ width: 'calc(100%)' }); //Force to recalculate width see bug #16182
            }.bind(this), 200);
        },
        /**
        * Refresh the list from server
        * @name framework.fmkSearchableList#refresh
        * @function
        * @param {Action} action - Action to apply at refresh.
        * @param {Object<string, string>} action.query - Values to apply to filters { filter1: val1, filter2, val2, ... }.
        */
        refresh: function (action) {
            this.dataAdapter._cache = [];
            this.options.noMoreData = false;
            if (action && action.query) {
                this.applyFilters(null, action.query);
                this.elem.find('.fmk-searchableList-filter').fmkFilter('setFilters', action.query);
            } else {
                this.filterEl.getFmkWidget().reloadFields(null, this.filterEl.getFmkWidget().getValues());
                this.applyFilters(null, this.filterEl.getFmkWidget().getValues());
            }

            return this.elem;
        },

        selectItemById: function (ids) {
            var grid = this.elem.find('.fmk-searchableList-grid'),
                index;
            ids = ($.isArray(ids) ? ids : [ids]);

            ids.forEach(function (id) {
                index = grid.jqxGrid('getrowboundindexbyid', id);
                if (index > -1) {
                    grid.jqxGrid('selectrow', index);
                }
            });
        },

        manageSelectionRows: function (elem) {
            var grid = this.elem.find('.fmk-searchableList-grid');
            var rows = grid.jqxGrid('getrows');
            rows.forEach(function (row) {
                index = row.boundindex;
                if (index > -1) {
                    var checked = grid.jqxGrid('getcellvalue', index, 'available');
                    var elemId = '#row' + index + this.options.grid[0].id;
                    if (checked == true) {
                        this.options.selectedRows.push(index);
                    } else {
                        this.options.selectedRows.splice(this.options.selectedRows.indexOf(index), 1);
                    }
                }
            }.bind(this));
        },

        applyFilters: function (e, values) {
            if (this.options._firstLoad) {
                return; //the dataAdapter is already handling this case
            }

            if (this.options._loading) {
                setTimeout(function () {
                    console.log('searchable list is already loading, retrying in 1 second');
                    this.applyFilters(e, values);
                }.bind(this), 1000);
            }

            this.filterEl.fmkFilter('disable');


            if (this.options.contract.data.multiSelectionColumn) {
                // The filter changed, we uncheck all the multi-selection checkboxes,
                // otherwise, it would be more complicated to manage the clipboard
                this.columnCheckBox.jqxCheckBox('uncheck');
            }

            this.dataAdapter._cache = [];
            this.options.noMoreData = false;
            this.options.filterRefresh = false;
            this.options.grid.jqxGrid('clearfilters', false);
            this.options.filterRefresh = true;
            var filter_or_operator = 1;
            var filtercondition = 'starts_with';

            for (var filter in values) {
                if (values.hasOwnProperty(filter) && values[filter]) {
                    //Prevent jqxGrid to send an empty array in filter
                    if (values[filter] instanceof Array && values[filter].length === 0) continue;

                    var filtergroup = new $.jqx.filter();
                    var newFilter = filtergroup.createfilter('stringfilter', values[filter], filtercondition);
                    filtergroup.addfilter(filter_or_operator, newFilter);
                    this.options.grid.jqxGrid('addfilter', filter, filtergroup);
                }
            }
            this.options._forceRecall = true;
            this.options.grid.jqxGrid('applyfilters');
        },

        /**
        * Clear all current selection.
        * @name framework.fmkSearchableList#unselect
        * @function
        */
        unselect: function () {
            this.options.grid.jqxGrid('clearselection');
            this.options.grid.find('.jqx-grid-cell-selected,.jqx-fill-state-pressed').removeClass('jqx-grid-cell-selected jqx-fill-state-pressed');
            return this.elem;
        },

        getrows: function () {
            return this.options.grid.jqxGrid('getrows');
        },

        displayActions: function (data) {
            var actions = [];
            if (data.rels) {
                actions = data.rels.map(function (rel) {
                    var obj = this.options.startingAction ? this.options.startingAction.query : undefined;
                    var resLink = this.options.contract.getResourceLinkFromRel(rel, obj);
                    return this.displayAction(resLink);
                }.bind(this));
            } else if (data.links) {
                actions = data.links.map(function (resLink) {
                    return this.displayAction(resLink);
                }.bind(this));
            }
            this.actionBar.fmkActionBar('refreshActions', actions);
        },

        displayAction: function (resLink) {
            var label = resLink.label || resLink.method + ' (' + resLink.resourceType + ')';
            return $('<input type="button" value="{0}"/>'.replace('{0}', label))
                .data('link', resLink)
                .jqxButton({})
                .bind('click', function (event) {
                    var link = $(event.target).data('link');
                    this.options.action && this.options.action.call(link);
                    this.elem.trigger("action", [link, this.filterEl.getFmkWidget().getValues(), this.clipboard]);
                }.bind(this));
        }

    });

    /**
        * @description list of default formatting functions for rendering
        */
    $.fn.fmkSearchableList.format = {
        checkbox: function (row, columnfield, value, defaulthtml, columnproperties) {
            var ret = $(defaulthtml);
            if (value == true)
                ret.html('<span class="glyphicon glyphicon-check"/>');
            else
                ret.html('<span class="glyphicon glyphicon-unchecked"/>');

            return ret[0].outerHTML;
        },
        currency: function (row, columnfield, value, defaulthtml, columnproperties) {
            //TODO: implement with correct currency
            var ret = $(defaulthtml);
            ret.text(value.toFixed(2));
            return ret[0].outerHTML;
        },
        date: function (row, columnfield, value, defaulthtml, columnproperties) {
            var ret = $(defaulthtml);
            if (value.length != 0) {
                var dateToFormat = utils.parseISODate(value);
                if (dateToFormat != "Invalid Date") {
                    var format = 'yy-mm-dd';
                    if ($.fn.fmkTpl)
                        format = $.fn.fmkTpl.defaultFns.GetFormat('Fmk_longDate_format', format);
                    ret.text($.formatDateTime(format, dateToFormat));
                } else {
                    return "Invalid Date for {0} please use proper json date format".replace("{0}", value);
                }
            }
            return ret[0].outerHTML;
        },
        datetime: function (row, columnfield, value, defaulthtml, columnproperties) {
            var ret = $(defaulthtml);
            if (value.length != 0) {
                var dateToFormat = utils.parseISODate(value);
                if (dateToFormat != "Invalid Date") {
                    var format = 'yy-mm-dd hh:mm:ss';
                    if ($.fn.fmkTpl)
                        format = $.fn.fmkTpl.defaultFns.GetFormat('Fmk_dateTime_format', 'yy-mm-ddThh:mm:ss');
                    ret.text($.formatDateTime(format, dateToFormat).replace(":", "h"));
                }
                else {
                    throw "Invalid Date for {0} please use proper json date format".replace("{0}", value);
                }
            }
            return ret[0].outerHTML;
        }

    }
    $.fn.fmkSearchableList.defaults = {
        //private
        _loading: false,
        _newPageSize: 15,
        _forceRecall: false,
        _firstLoad: true,
        _firstBinding: true,

        // variables
        /**
        * @name framework.fmkSearchableList#user
        * @type {User}
        * @default null
        * @description User currently using the application.
        */
        user: null,
        /**
        * @name framework.fmkSearchableList#contract
        * @type {Contract}
        * @default null
        * @description Contract corresponding to the displayed data.
        */
        contract: null,
        /**
        * @name framework.fmkSearchableList#pagesize
        * @type {number}
        * @default 15
        * @description Number of new rows to load when scrolling.
        */
        pagesize: 15,
        /**
        * @name framework.fmkSearchableList#autoSelectFirst
        * @type {boolean}
        * @default true
        * @description True if the first row is selected at first display.
        */
        autoSelectFirst: true,
        /**
        * @name framework.fmkSearchableList#screenHeight
        * @type {number}
        * @default -1
        * @description Height of the container screen.
        */
        screenHeight: -1,
        /**
        * @name framework.fmkSearchableList#startingAction
        * @type {Action}
        * @default null
        * @description Specific action to apply at initialization.
        */
        startingAction: null,
        rowHeight: 60,

        // callbacks
        /**
        * @event framework.fmkSearchableList#selectItem
        * @description Fired when a row/item is selected.
        * @property {RowItem} row - Row that has been selected, containing data and rels.
        */
        selectItem: function () { },
        /**
        * @event framework.fmkSearchableList#action
        * @description Fired when user click on an action button.
        * @property {Link} link - Corresponding link to the action triggered by user.
        */
        action: function () { },
        /**
        * @event framework.fmkSearchableList#sort
        * @description Fired when user sort a column.
        */
        sort: function () { },
        /**
        * @event framework.fmkSearchableList#filter
        * @description Fired when user submit new filters.
        */
        filter: function () { },
        /**
        * @event framework.fmkSearchableList#afterLoad
        * @description Fired when list has finished its ajax loading.
        */
        afterLoad: function () { },

    };

    $.widgetFactory.registerForType('searchableList', 'fmkSearchableList');

})(jQuery, Fmk.Utils, Fmk.I18n);