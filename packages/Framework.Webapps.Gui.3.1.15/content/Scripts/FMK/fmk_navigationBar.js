/* =============================================================================
 * NavigationBar
 * =============================================================================
 * Display a bar with links to different screens
 * Expected options :
 * ============================================================================ */

(function ($, utils) {

    $.widget('fmkNavigationBar', {
        _init: function () {
            //build DOM
            this.options = $.extend(true, {}, $.fn.fmkNavigationBar.defaults, this.options);
            this.elem.addClass('fmk-navigationBar');
            $('<div class="fmk-hamburger-menu fmk-button"></div>')
                .appendTo(this.elem)
                .append('<button class="bar-inline__item btn btn--hover-purple btn--border-left btn--icon-hamburger-medium-purple btn--icon-hamburger-medium-purple--hover fmk-hamburger" />');
            $('<div class="fmk-app-selector fmk-button bar-inline__item bar-inline__left"></div>')
                .appendTo(this.elem)
                .append('<div class="fmk-app-selector-header"><button class="btn btn--hover-purple" ><div class="fmk-image fmk-navigationBar-logo" /><span class="bar-inline__item bar-inline__item--left-separator btn btn--icon-arrow-small-down-purple btn--icon-arrow-small-down-purple--hover"></span></button></div>');
            $('<div class="fmk-client-logo bar-inline__left"/>')
                .appendTo(this.elem);
            $('<div class="fmk-menu-list-container"><ul class="fmk-menu-list" /></div>').appendTo(this.elem.find('.fmk-hamburger-menu'));

            //form for changing password
            this.changePasswordForm = $('<div/>')
                .addClass('fmk-user-control-change-password')
                .addClass('modal')
                .appendTo(this.elem);
            
            this.initCustomerVersion();
            this.initAppList();
            this.initClientLogo();
            this.initMenuList();
            this.initUser();
            this.addHomeButton();
            this.initEvents();
        },

        selectItem: function(itemId) {
            this.selectItem_(this.elem.find('.fmk-menu-list-item-{0}'.replace('{0}', itemId)));            
        },

        selectItem_: function (itemEl) {
            var action = itemEl.data('action');
            if (action) {
                this.options.select(action);
                this.elem.trigger('select', action);
            }
        },

        initEvents: function() {
            //register click event
            this._on({
                event: 'click',
                selector: 'ul.fmk-app-list li',
                handler: function (ev) {
                    console.log('click on app', $(ev.currentTarget));
                    if (this.onBeforeChangeAppRequest($(ev.currentTarget).data('app')) !== false) {
                        this.onChangeAppRequest($(ev.currentTarget).data('app'));
                    }
                }
            });
            this._on({
                event: 'click',
                selector: 'ul.fmk-custom-list li',
                handler: function (ev) {
                    console.log('click on custom', $(ev.currentTarget));
                    if (this.onBeforeChangeCustomRequest($(ev.currentTarget).data('item')) !== false) {
                        this.onChangeCustomRequest($(ev.currentTarget).data('item'));
                    }
                }
            });
            this._on({
                event: 'click',
                selector: '.fmk-app-selector-header',
                handler: function () {
                    this.elem.find('.fmk-app-selector')
                        .toggleClass('active')
                        .find('button')
                        .toggleClass('fmk-btn--is-active');
                }
            });
            this._on({
                event: 'click',
                selector: '.fmk-custom-selector-header',
                handler: function (ev) {
                    var id = $(ev.target).parents('[data-id]').attr('data-id');
                    //if there is already an opened custom-menu and this is not the current, hide it
                    var curActiveCustomMenu = this.elem.find('.fmk-custom-selector.active');
                    if (curActiveCustomMenu.length == 1 && curActiveCustomMenu.attr('data-id') != id) {
                        curActiveCustomMenu.removeClass('active');
                    }
                    //otherwise, do like any other menu (i.e toggle the active class)
                    this.elem.find('.fmk-custom-selector[data-id="{0}"]'.replace('{0}', id))
                        .toggleClass('active');
                }
            });
            this._on({
                event: 'click',
                selector: '.fmk-hamburger', 
                handler: function () {
                    this.elem.find('.fmk-hamburger-menu').toggleClass('active');
                    if (this.elem.find('.fmk-hamburger-menu').hasClass('active')) {
                        this.elem.find('.fmk-menu-list').empty();
                        this.initMenuList();
                    }
                }
            });
            this._on({
                event: 'click',
                selector: '.fmk-home-button',
                handler: function () {
                    var target = this.elem.find('ul.fmk-menu-list li:first');
                    console.log('click on menu item', target);
                    this.selectItem_(target);
                }
            });
            this._on({
                event: 'click',
                selector: 'ul.fmk-menu-list li',
                handler: function (ev) {
                    var itemEl = $(ev.currentTarget);
                    if (itemEl.data('menuItemEnabled')) {
                        console.log('click on menu item ' + itemEl);
                        this.elem.find('.fmk-hamburger-menu').toggleClass('active');
                        this.selectItem_(itemEl);
                    } else {
                        console.log('menu item is disabled, no effect', itemEl );
                    }
                }
            });

            // Mask menus if click outside
            $(document).on('click', function (event) {
                if (!$(event.target).closest('.fmk-hamburger-menu').length) {
                    $('.fmk-hamburger-menu').removeClass('active');
                }
                if (!$(event.target).closest('.fmk-app-selector').length) {
                    $('.fmk-app-selector')
                        .removeClass('active')
                        .find('button')
                        .removeClass('fmk-btn--is-active');
                }
                if (!$(event.target).closest('.fmk-custom-selector').length) {
                    $('.fmk-custom-selector')
                        .removeClass('active')
                        .find('.fmk-custom-selector-down')
                        .addClass('glyphicon-chevron-down')
                        .removeClass('glyphicon-chevron-up');
                }

            }.bind(this));
        },

        setHomeButton: function(showAppList) {
            if (showAppList) {
                this.elem.find('.fmk-app-selector').show();
                this.elem.find('.fmk-client-logo').show();
                this.elem.find('.fmk-home-button').hide();
            } else {
                this.elem.find('.fmk-app-selector').hide();
                this.elem.find('.fmk-client-logo').hide();
                this.elem.find('.fmk-home-button').show();
            }
            this.options.showAppList = showAppList;
        },

        addHomeButton: function () {
            var home = $('<button class="fmk-home-button bar-inline__item btn btn--hover-purple btn--border-right btn--icon-home-medium-purple btn--icon-home-medium-purple--hover" />')
                .appendTo(this.elem);

            if (this.options.showAppList) {
                home.hide();
            }
        },

        initAppList: function () {
            if (this.options.logoClass) {
                this.elem.find('.fmk-navigationBar-logo').addClass(this.options.logoClass);
            }
            this.elem.find('.fmk-app-name').html(this.options.currentApp);
            if (this.options.user && this.options.user.apps) {
                $('<ul class="fmk-app-list menu menu--purple" />').appendTo(this.elem.find('.fmk-app-selector'));
                this.options.user.apps.forEach(function (app) {
                    if (! app.url) {
                        console.warn('no URL for app ' + app.id);
                        return;
                    }
                    $('<li class="menu__list__item"><a class="menu__list__item__link block-link block-link--icon"><span class="block-link__inner">{0}</span></a></li>'
                        .replace('{0}', app.id))
                        .data('app', app)
                        .appendTo(this.elem.find('.fmk-app-list'));
                }.bind(this));

            } else {
                this.elem.find('.fmk-app-selector').attr('disabled', 'disabled')
                    .find('.fmk-app-selector-down').hide();
            }
        },

        initClientLogo: function() {
            if (this.options.clientLogoClass) {
                this.elem.find('.fmk-client-logo').addClass(this.options.clientLogoClass);
            }
        },

        initMenuList: function () {
            this.elem.find('.fmk-menu-list').empty();
            this.options.items.forEach(function (item) {                
                var itemEl = $('<li class="fmk-menu-list-item fmk-menu-list-item-{0}"/>'.replace('{0}', item.id))
                        .data('action', item)
                        .addClass('fmk-menu-list-item-disabled')
                        .appendTo(this.elem.find('.fmk-menu-list'));
                $('<span class="fmk-menu-list-item-label" />').appendTo(itemEl).html(item.label);
            }.bind(this));
            this.computeCounts();
        },

        initCustomerVersion: function () {
            if (!this.options.productName)
                return false;

            var parent = this.elem.find('.fmk-navigationBar-logo').addClass('fmk-navigationBar-withProductName');
            $('<p />').html(this.options.productName+'<br>').appendTo(parent);

            $.getJSON('version/customerVersion', function (data) {
                $('<small />').html('V'+data.version).appendTo($(parent).find('p'));
            });    
        },

        refreshItems: function (items) {
            this.elem.find('.fmk-menu-list').empty();
            this.options.items = items;
            this.initMenuList();
        },

        setItemsWithoutRefresh: function (items) {
            this.options.items = items;
        },

        computeCounts: function () {
            this.options.items.forEach(function (item) {                
                var itemEl = this.elem.find('.fmk-menu-list-item-{0}'.replace('{0}', item.id));
                itemEl.find('.fmk-menu-list-item-count').remove();
                if (item.countFn) {
                    var itemWaiting = $('<span class="fmk-menu-list-item-count" />')
                        .append($('<span class="fmk-loading-white" />'))
                        .appendTo(itemEl);
                    item.countFn(function(count) {
                        itemWaiting.remove();
                        itemEl.find(".fmk-menu-list-item-count").remove(); //be sure to append only 1 counter in case multiple counts are proceeding
                        $('<span class="fmk-menu-list-item-count" />').appendTo(itemEl).html(count);
                        console.log('count computed for ' + item.id);
                        if (item.tileRes && item.tileRes.data.action) {
                            itemEl.data('menuItemEnabled', true);
                            itemEl.removeClass('fmk-menu-list-item-disabled');
                        }
                    }.bind(this), item);
                } else {
                    itemEl.data('menuItemEnabled', true);
                    itemEl.removeClass('fmk-menu-list-item-disabled');
                }
            }.bind(this));
        },

        initUser: function() {
            // Add user control here
            if (this.options.user) {
                $('<div class="fmk-user-control" />')
                    .append($('<button class="btn btn--text btn--text--upper btn--text--small btn--text--icon btn--hover-purple btn--icon-perfil-medium-white fmk-user-icon" />')
                        .append($('<span class="fmk-user-name btn__inner" />').html(this.options.user.id))
                            .on('click', this.onDisplayUserDetails.bind(this))
                    )
                    .append($('<div class="fmk-user-buttons" />')
                        .append($('<button class="btn--icon-power-medium-white btn bar-inline__item btn--hover-purple" />')
                            .on('click', function (event) {
                                if (this.onBeforeDisconnectRequest(event.args) !== false) {
                                    this.onDisconnectRequest(event.args);
                                }
                            }.bind(this))
                        )
                        .append($('<button class="btn--icon-setting-medium-white btn bar-inline__item btn--hover-purple" />')
                            .on('click', this.onDisplayPreferencesRequest.bind(this))
                        )                        
                    )
                    .appendTo(this.elem.find('.fmk-menu-list-container'));
            }
        },

        addCustomMenu: function (options) {
            var btnCss = options.buttonCss || 'btn--text btn--text--icon btn--icon-arrow-small-down-purple btn--text--icon--right';
            var btn = $('<div class="fmk-custom-selector-header"></div>')
                .append($('<button class="bar-inline__item btn btn--border-left btn--hover-purple {0}" ></button>'.replace('{0}', btnCss))
                    .append('<span class="fmk-custom-name btn__inner" />')
                );
            var custEl = $('<div class="fmk-custom-selector fmk-button" data-id="{0}"></div>'.replace('{0}', options.id))
                .appendTo(this.elem)
                .append(btn);
            var defValue;

            if (options.items.length > 0) {
                defValue = options.items[0];
            }

            $('<ul class="fmk-custom-list menu menu--purple" />').appendTo(custEl);
            $.each(options.items, function (j, item) {
                // Add callbacks to each item for ease of call on click
                $.extend(true, item, options.callbacks);
                $('<li class="menu__list__item" data-id="{0}"><a class="menu__list__item__link block-link {2}"><span class="block-link__inner">{1}</span></a></li>'
                        .replace('{0}', item.id)
                        .replace('{1}', item.label)
                        .replace('{2}', item.itemCss || ''))
                    .data('item', item)
                    .appendTo(custEl.find('.fmk-custom-list'));
                if (item.id == options.defaultValue) {
                    defValue = item;
                }
            });

            if (defValue && !options.buttonCss) {
                custEl.find('.fmk-custom-name').html(defValue.label);
            }
        },

        updateCustomMenuLabel: function (id, item) {
            var el = this.elem.find('.fmk-custom-selector[data-id="{0}"]'.replace('{0}', id));

            if (el) {
                el.find('.fmk-custom-name').html(item.label);
            }
        },

        markCustomMenuAsActive: function(idMenu){
            this.elem.find('.fmk-custom-selector[data-id="{0}"]'.replace('{0}', idMenu)).addClass('active');
        },

        removeCustomMenu: function (idMenu) {
            this.elem.find('.fmk-custom-selector[data-id="{0}"]'.replace('{0}', idMenu)).remove();
        },

        removeCustomMenuItem: function (idMenu, idItem) {
            this.elem.find('.fmk-custom-selector[data-id="{0}"] li[data-id="{1}"]'.replace('{0}', idMenu).replace('{1}', idItem)).remove();
        },

        countCustomMenuItems: function (idMenu) {
            return this.elem.find('.fmk-custom-selector[data-id="{0}"] li'.replace('{0}', idMenu)).length;
        },

        addCustomButton: function(options) {
            var btnCss = options.buttonCss;
            var btn = $('<div class="fmk-custom-selector-header"></div>')
                .append($('<button class="bar-inline__item btn btn--border-left btn--hover-grey-dark {0}" ></button>'.replace('{0}', btnCss))
                    .append('<span class="fmk-custom-name btn__inner" />')
                );
            $('<div class="fmk-custom-selector fmk-button" data-id="{0}"></div>'.replace('{0}', options.id))
                .appendTo(this.elem)
                .on('click', function () {
                    options.callbacks && options.callbacks.onClick && options.callbacks.onClick();
                })
                .append(btn);            
        },

        // Default : shown
        showAppsList: function(show) {
            if (show) {
                this.elem.find('.fmk-app-selector').show();
            } else {
                this.elem.find('.fmk-app-selector').hide();
            }
            return this.elem;
        },

        showCustomList: function (show) {
            if (show) {
                this.elem.find('.fmk-custom-selector').show();
            } else {
                this.elem.find('.fmk-custom-selector').hide();
            }
            return this.elem;
        },

        onBeforeChangeAppRequest: function (app) {
            if (typeof this.options.beforeChangeApp === 'function') {
                return this.options.beforeChangeApp(app);
            }
            return true;
        },

        onChangeAppRequest: function (app) {
            if (typeof this.options.changeApp === 'function') {
                return this.options.changeApp(app);
            }
            return window.top.location = this.adjustAppUrl(app.url);
        },

        adjustAppUrl: function (appUrl) {
            //#24732
            appUrl = utils.getLocationOrigin() + appUrl;
            if (appUrl.charAt(appUrl.length - 1) != '/') {
                appUrl = appUrl + '/';
            }
            return appUrl;
        },

        onBeforeChangeCustomRequest: function (item) {
            if (item.onBeforeChange && typeof item.onBeforeChange === 'function') {
                return item.onBeforeChange(item);
            }
            return true;
        },

        onChangeCustomRequest: function (item) {
            $('.fmk-custom-selector')
                    .removeClass('active')
                    .find('.fmk-custom-selector-down')
                    .addClass('glyphicon-chevron-down')
                    .removeClass('glyphicon-chevron-up');
            if (item.onChange && typeof item.onChange === 'function') {
                return item.onChange(item);
            }
        },

        onBeforeDisconnectRequest: function () {
            if (typeof this.options.beforeDisconnect === 'function') {
                return this.options.beforeDisconnect(this.elem);
            }
            return true;
        },

        onDisplayPreferencesRequest: function () {
            if (typeof this.options.displayPreferences === 'function') {
                this.elem.find('.fmk-hamburger-menu').removeClass('active');
                this.options.displayPreferences.call(this.elem);
            }
        },

        onDisplayUserDetails: function () {
            this.changePasswordForm.buildForContract(
                { data: { name: 'changePasswordForm', type: 'changePasswordForm' } },
                {}
            ).modal({ backdrop: 'static' });
        },

        onDisconnectRequest: function () {
            this.elem.find('.fmk-hamburger-menu').removeClass('active');
            if (typeof this.options.disconnect === 'function') {
                this.options.disconnect.call(this.elem);
            } else {
                $.ajax({
                    url: '/AUTH.API/auth',
                    method: 'DELETE'
                })
                .always(function () {
                    window.top.location = utils.getLocationOrigin() + '/AUTH.HTML/';
                });
            }
        }

    });

    // Defaults
    $.fn.fmkNavigationBar.defaults = {
        showAppList: true
    };

    $.fn.fmkNavigationBarFromContracts = function(contracts, displayableContracts) {
        var items = [];
        displayableContracts.forEach(function(cName) {
            try {
                var c = contracts.findByName(cName);
                items.push({
                    id: cName,
                    label: c.data.label,
                    contract: c
                });
            } catch (err) {
                //the contract is not usable by the current user, do not display it in navbar

            }
        });
        return items;
    }

    $.fn.fmkNavigationBarFromDashboard = function (contracts) {
        var dashboardItems = [];
        contracts.filterByType('dashboard').map(function (c) {
            dashboardItems = dashboardItems.concat(c.data.tiles.map(function (tile) {
                return {
                    id: tile.id,
                    label: tile.label,
                    countFn: tile.link ? function(cbk, item) {
                        $.ajax({ url: tile.link.href, method: tile.link.method }).done(function (res) {
                            item.tileRes = res;
                            cbk(res.data.count);
                        });
                    } : null,
                    tile: tile
                };
            }));
    });
        return dashboardItems;
    }
})(jQuery, Fmk.Utils);