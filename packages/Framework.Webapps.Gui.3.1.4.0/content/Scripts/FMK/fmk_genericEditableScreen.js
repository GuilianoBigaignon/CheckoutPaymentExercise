/* =============================================================================
 * GenericScreen
 * =============================================================================
 * Default screen, with a master and a details panel which can be side by side (layout==split) or bahind each other (layout == cards).
 * Expected options :
 * ============================================================================ */

(function ($, i18n) {

    $.widget('fmkGenericEditableScreen', {
        breadcrumb: null,
        _init: function () {
            this.checkOptions();
            this.initDom();
            this.initMainContract();
            this.initBreadcrumb();
            this.handleLayout(false);
            this.bindInfiniteScroll();
        },

        checkOptions: function () {
            this.options = $.extend(true, {}, $.fn.fmkGenericEditableScreen.defaults, this.options);
            if (this.options.contracts === null) {
                throw ('contracts is mandatory for fmkGenericEditableScreen');
            }
            if (this.options.mainContractName === null) {
                throw ('mainContractName is mandatory for fmkGenericEditableScreen');
            }
            if (!this.options.layout || $.fn.fmkGenericEditableScreen.config.layouts.indexOf(this.options.layout) < 0) {
                this.options.layout = $.fn.fmkGenericEditableScreen.config.layouts[0];
            }
        },

        initDom: function () {
            var bootstrapClass = (this.options.layout === 'split') ? 'col-xs-6' : 'col-xs-12';
            this.elem.addClass('fmk-genericScreen fmk-screen');
            this.elem.attr('data-contract', this.options.mainContractName);
            $('<div class="container-fluid" style="height: 100%;" />').appendTo(this.elem);
            $('<div class="row-fluid" />').appendTo(this.elem.find('.container-fluid'))
                .append('<div class="fmk-genericScreen-master ' + bootstrapClass + ' fmk-content-1-header"/>')
                .append('<div class="fmk-genericScreen-slave ' + bootstrapClass + ' fmk-content-1-header"/>');
            $('<div class="row-fluid" />').appendTo(this.elem.find('.container'))
                .append('<div class="fmk-genericScreen-toolbar col-xs-12" style="display: none;"/>');
        },

        initMainContract: function () {
            this.mainContract = this.options.contracts.findByName(this.options.mainContractName);
            this.options.cur.item = null;
            this.options.cur.entity = null;
            this.options.cur.actionLink = null;
            this.elem.find('.fmk-genericScreen-master').empty();
            $('<div class="fmk-genericScreen-main" style="height: 100%"/>').appendTo(this.elem.find('.fmk-genericScreen-master'))
                .buildForContract(this.mainContract, {
                    startingAction: this.options.startingAction,
                    user: this.options.user,
                    contracts: this.options.contracts,
                    autoSelectFirst: this.options.layout === 'split',
                    screenHeight: this.elem.height()
                })
                .on('selectItem', function (event, item) {
                    this.onSearchableListClick(item);
                }.bind(this))
                .on('action', function (event, actionLink, filterValues, clipboard) {
                    this.onSearchableListAction(actionLink, filterValues, clipboard);
                }.bind(this));
        },

        initBreadcrumb: function () {
            this.breadcrumb = $('<div />').fmkBreadcrumb({}).appendTo(this.elem);
            this.mainBreadcrumb();
        },

        mainBreadcrumb: function () {
            this.breadcrumb.fmkBreadcrumb('refresh', {
                previous: null,
                position: [this.computeBreadcrumbLevel1()]
            });
        },

        computeBreadcrumbLevel1: function () {
            return this.mainContract.data.label;
        },

        activate: function (action) {
            this.elem.find('.fmk-genericScreen-main').getFmkWidget().refresh(action);
        },

        refreshIfRequested: function () {
            if (this.applyRefresh) {
                this.elem.find('.fmk-genericScreen-main').getFmkWidget().refresh();
                this.applyRefresh = false;
            }
        },

        bindInfiniteScroll: function () {
            this.elem.bind('scroll', function () {
                //!\ this == this.elem (because we are in a jquery handler)
                var scrollPercentage = 100 * this.scrollTop / (this.scrollHeight - this.clientHeight);
                if (scrollPercentage > 95) {
                    $(this).find('.fmk-genericScreen-main').trigger('scrollEnd');
                }
            });
        },

        handleLayout: function (displaySlave, displayToolbar) {
            if (this.options.layout === 'split') {
                this.refreshIfRequested();
            }

            if (this.options.layout === 'cards') {
                var $master = this.elem.find('.fmk-genericScreen-master'),
                    $slave = this.elem.find('.fmk-genericScreen-slave'),
                    $toolbar = this.elem.find('.fmk-genericScreen-toolbar');

                $master.hide();
                $slave.hide();
                $toolbar.hide();
                if (displaySlave) {
                    $slave.show();
                    if (displayToolbar) {
                        $toolbar.show();
                    }
                } else {
                    $master.show();
                    this.refreshIfRequested();
                }
            }
        },

        onSearchableListClick: function (item) {
            this.options.cur.item = item;
            this.options.cur.gridScrollTop = this.elem.find('.fmk-genericScreen-master .fmk-genericScreen-main .row-fluid').scrollTop();//IE11 #9429
            console.log('onSearchablelistClick', this.options.cur);
            if (this.options.cur.item) {
                if (this.options.cur.item.rels && this.options.cur.item.rels.length > 0) {
                    var actionLink = this.mainContract.getResourceLinkFromRel(this.options.cur.item.rels[0], this.options.cur.item.data)
                    this.onSearchableListClickDisplay(actionLink);
                } else if (this.options.cur.item.links && this.options.cur.item.links.length > 0) {
                    var actionLink = this.mainContract.getResourceLinkFromRel(this.options.cur.item.rels[0], this.options.cur.item.data)
                    this.onSearchableListClickDisplay(actionLink);
                } else {
                    var message = i18n._('Fmk_genericScreen_noActionOnItem', 'Resources', 'WEBAPPS.GUI');
                    $("<div></div>")
                        .append('<p>' + message + '</p>')
                        .jqxNotification({ width: 250, position: "top-right", opacity: 0.9, autoOpen: true, autoClose: true, template: "error" });
                }
            }
        },

        onSearchableListClickDisplay: function (actionLink) {
            this.options.cur.actionLink = actionLink;

            console.log('onEntityAction', this.options.cur);
            this.elem.find('.fmk-genericScreen-slave').empty();
            this.handleLayout(true, false);
            this.breadcrumb.fmkBreadcrumb('refresh', {
                previous: this.options.layout === 'split' ? null : function () {
                    this.onSearchableListClick(this.options.cur.item);
                }.bind(this),
                position: [this.computeBreadcrumbLevel1(), this.computeBreadcrumbLevel2(this.options.cur.item)]
            });
            $('<div class="fmk-genericScreen-details" />').appendTo(this.elem.find('.fmk-genericScreen-slave'))
                .buildForContract(this.options.contracts.findByName(actionLink.resourceType), {
                    entity: this.options.cur.item,
                    actionLink: actionLink,
                    user: this.options.user,
                    contracts: this.options.contracts
                })
                .on('success', function (ev, res) {
                    this.onEntityActionSuccess(res);
                }.bind(this))
                .on('cancel', function () {
                    this.goToMain();
                }.bind(this));
        },

        computeBreadcrumbLevel2: function (entity) {
            return " N\xBA " + entity.data.id;
        },

        onSearchableListAction: function (actionLink, filterValues, clipboard) {
            this.options.cur.actionLink = actionLink;
            console.log('onSearchableListAction', this.options.cur);
            this.elem.find('.fmk-genericScreen-slave').empty();
            this.handleLayout(true, true);
            $('<div class="fmk-genericScreen-details" />').appendTo(this.elem.find('.fmk-genericScreen-slave'))
                .buildForContract(this.options.contracts.findByName(actionLink.resourceType), {
                    actionLink: actionLink,
                    entity: {
                        data: {
                            criteria: filterValues,
                            clipboard: clipboard
                        }
                    },
                    user: this.options.user,
                    contracts: this.options.contracts
                })
                .on('success', function (ev, res) {
                    this.onSearchableListActionSuccess(res);
                }.bind(this))
                .on('cancel', function () {
                    this.goToMain();
                }.bind(this));
        },

        onSearchableListActionSuccess: function (res) {
            this.applyRefresh = true;
            this.goToMain();
        },

        onEntityActionSuccess: function (res) {
            this.applyRefresh = true;
            this.goToMain();
        },

        goToMain: function () {
            this.handleLayout(false);
            this.elem.find('.fmk-genericScreen-main').getFmkWidget().unselect();
            this.mainBreadcrumb();
        }
    });

    $.fn.fmkGenericEditableScreen.config = {
        layouts: ['split', 'cards'],
        applyRefresh: false
    };

    $.fn.fmkGenericEditableScreen.defaults = {
        user: null,
        contracts: null,
        mainContractName: null,
        startingAction: null,
        cur: {},
        layout: $.fn.fmkGenericEditableScreen.config.layouts[0]
    };

})(jQuery, Fmk.I18n);