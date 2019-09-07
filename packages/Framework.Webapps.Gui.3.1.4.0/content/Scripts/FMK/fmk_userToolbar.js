/* =============================================================================
 * UserToolbar
 * =============================================================================
 * Display a bar including user information and app/location switching controls
 * Expected options :
 * ============================================================================ */

(function ($, i18n) {

    // Plugin definition.
    $.fn.fmkUserToolbar = function (opts) {
        return this.each(function () {

            // plugin variables
            var options = $.extend(true, {}, $.fn.fmkUserToolbar.defaults, opts),
                elem = $(this);

            if (typeof property === "object") {
                // Override default settings with any supplied
                $.extend(true, options, property);
            }

            // If element is already a fmkSearchableList, return itself
            if (elem.data('fmkUserToolbar')) {
                return elem;
            }

            // Handle events
            function onBeforeDisconnectRequest() {
                if (typeof options.beforeDisconnect === 'function') {
                    return options.beforeDisconnect.call(elem);
                }
                return true;
            }

            function onDisconnectRequest() {
                if (typeof options.disconnect === 'function') {
                    options.disconnect.call(elem);
                } else {
                    $.ajax({
                        url: '/AUTH.API/auth',
                        method: 'DELETE'
                    })
                    .always(function () {
                        window.top.location = Fmk.Utils.getLocationOrigin() + '/AUTH.HTML/';
                    });
                }
            }

            function onBeforeChangeAppRequest(selected) {
                if (typeof options.beforeChangeApp === 'function') {
                    return options.beforeChangeApp.call(selected.index, selected.item.value, selected.item.label, elem);
                }
                return true;
            }

            function onChangeAppRequest(selected) {
                if (typeof options.changeApp === 'function') {
                    return options.changeApp.call(selected.index, selected.item.value, selected.item.label, elem);
                }
                window.top.location = Fmk.Utils.getLocationOrigin() + selected.item.value;
            }

            function onBeforeChangeLanguage(language) {
                if (typeof options.beforeChangeLanguage === 'function') {
                    return options.beforeChangeLanguage.call(language);
                }
            }

            function onChangeLanguage() {
                window.top.location.reload();
            }

            function popup(labels) {
                //TODO: avoid creating HTML from JS (use something like https://github.com/KoryNunn/crel ?)        
                var tpl = '<div id="fmk-langpopup">' +
                    '<div class="fmk-langtitle">{{title}}</div>' +
                    '<div class="fmk-langcontent">' +
                        '<div>{{content}}</div>' +
                        '<div>' +
                        '<input class="fmk-langok" type="button" style="margin-right: 10px" value="{{ok}}" />' +
                        '<input class="fmk-langcancel" type="button" style="margin-right: 10px" value="{{cancel}}" />' +
                        '</div>' +
                    '</div>' +
                '</div>';
                return tpl
                    .replace('{{title}}', labels.title)
                    .replace('{{content}}', labels.content)
                    .replace('{{ok}}', labels.ok)
                    .replace('{{cancel}}', labels.cancel);
            }

            function changeCulture(replaceGlobally) {
                $.post('/AUTH.API/culture',
                {
                    app: options.currentApp,
                    culture: options.currentCulture,
                    replaceGobally: replaceGlobally
                })
                .done(function () {
                    options.user.preferredCultureByApp[options.currentApp] = options.currentCulture;
                    if (onBeforeChangeLanguage(options.currentCulture) !== false) {
                        onChangeLanguage(options.currentCulture);
                    };
                });
            }

            // Init plugin
            function init() {
                var defaultAppIndex = -1,
                    defaultLang = null,
                    supportedCultures = [];
                options.user.apps.map(function (app, index) {
                    if (app.id.toLowerCase() === options.currentApp.toLowerCase()) {
                        supportedCultures = app.supportedCultures;
                        defaultAppIndex = index;
                        if (options.user.preferredCultureByApp !== null) {
                            defaultLang = options.user.preferredCultureByApp[options.user.apps[defaultAppIndex].id.toLowerCase()];
                        }
                        if (!defaultLang) {
                            defaultLang = options.user.preferredCulture;
                        }
                        
                    }
                });
                options.currentCulture = defaultLang;
                elem.addClass('fmk-userToolbar');
                $('<div class="container" />').appendTo(elem);
                $('<div class="row"/>') // for bootstrap
                    .append('<div class="fmk-userToolbar-user col-xs-3"/>')
                    .append('<div class="fmk-userToolbar-apps col-xs-3"/>')
                    .append('<div class="fmk-userToolbar-lang col-xs-2"/>')
                    .append('<div class="fmk-userToolbar-void col-xs-4 fmk-fill-empty-height"/>')
                    .appendTo('.fmk-userToolbar .container');
                $('<strong />').text(options.user.id)
                    .appendTo(elem.find('.fmk-userToolbar-user'))
                    .after('<br />');
                $('<span class="glyphicon glyphicon-off" aria-hidden="true"></span> <a class="fmk-userToolbar-disconnect">' + i18n._('Fmk_disconnect', 'Resources', 'WEBAPPS.GUI') + '</a>')
                    .appendTo(elem.find('.fmk-userToolbar-user'));
                $('<div class="fmk-userToolbar-appList" />')
                    .appendTo(elem.find('.fmk-userToolbar-apps'));
                $(".fmk-userToolbar-appList").jqxDropDownList({
                    selectedIndex: defaultAppIndex,
                    source: options.user.apps,
                    displayMember: 'id',
                    valueMember: 'url',
                    width: '220',
                    height: '25',
                    autoDropDownHeight: true,
                    enableBrowserBoundsDetection: true,
                    placeHolder: (options.i18n && options.i18n._ && options.i18n._('Fmk_select_app', 'Resources', 'WEBAPPS.GUI'))
                })
                .on('change', function (event) {
                    if (onBeforeChangeAppRequest(event.args) !== false) {
                        onChangeAppRequest(event.args);
                    }
                });

                if (supportedCultures && supportedCultures.length > 0) {
                    $('<div class="fmk-userToolbar-langList" />')
                        .fmkLanguageSelector({
                            labels: true,
                            languages: supportedCultures,
                            defaultCulture: defaultLang,
                            select: function(lang) {
                                var labels = {
                                    title: i18n._('Fmk_userToolbar_changePreferredCulture', 'Resources', 'WEBAPPS.GUI'),
                                    content: i18n._('Fmk_userToolbar_changePreferredCulture_content', 'Resources', 'WEBAPPS.GUI') +'<br/>',
                                    ok: i18n._('Fmk_userToolbar_changePreferredCulture_ok', 'Resources', 'WEBAPPS.GUI'),
                                    cancel: i18n._('Fmk_userToolbar_changePreferredCulture_cancel', 'Resources', 'WEBAPPS.GUI')
                                };
                                options.currentCulture = lang;
                                if (lang !== options.user.preferredCulture && lang !== options.user.preferredCultureByApp[options.currentApp]) {
                                    $(popup(labels)).appendTo('body')
                                        .jqxWindow({
                                            height: 150,
                                            width: 300,
                                            isModal: true,
                                            draggable: false,
                                            resizable: false,
                                            autoOpen: true,
                                            okButton: $('#fmk-langpopup .fmk-langok')
                                                .on('click', function() {
                                                    changeCulture(true);
                                                }),
                                            cancelButton: $('#fmk-langpopup .fmk-langcancel')
                                                .on('click', function() {
                                                    changeCulture(false);
                                                })
                                        });
                                } else {
                                    changeCulture(false);
                                }
                            }
                        })
                        .appendTo('.fmk-userToolbar-lang');
                }

                elem.find('.fmk-userToolbar-disconnect').on('click', function () {
                    if (onBeforeDisconnectRequest() !== false) {
                        onDisconnectRequest();
                    }
                });
            };

            // Init
            init();

        });
    };

    $.fn.fmkUserToolbar.defaults = {
        // variables
        user: null,
        currentApp: null,
        i18n: null,

        // callbacks can be used
        //beforeDisconnect: function () { },
        //disconnect: function () { },
        //beforeChangeApp: function () { },
        //changeApp: function () { },
        beforeChangeLanguage: function () { },
    };

})(jQuery, Fmk.I18n);