/* =============================================================================
 * Auth
 * =============================================================================
 * Provides services for authentication
 * ============================================================================ */

if (!window.Fmk) {
    Fmk = {};
}

Fmk.Auth = (function ($) {
    function redirectToAuth(app) {
        window.location.href = Fmk.Utils.getLocationOrigin() + '/AUTH.HTML/?app=' + app;
    }

    function callRegisterGlobalAjaxError(condition, app, user, cbk) {
        if (typeof condition === 'undefined' || condition) {
            Fmk.Auth.registerGlobalAjaxError(app, user, cbk);
        } else {
            cbk();
        }        
    }

    function callRegisterCurrency(app, user, cbk) {
        if (Fmk.Currency) {
            var culture = '';
            if (user.preferredCultureByApp && user.preferredCultureByApp[app]) {
                culture = user.preferredCultureByApp[app];
            } else {
                culture = user.preferredCulture;
            }
            Fmk.Currency.init(culture, cbk);
        } else {
            cbk();
        }
    }

    function initI18N(condition, app, user, cbk) {
        if (Fmk.I18n && (typeof condition === 'undefined' || condition)) {
            Fmk.I18n.init(app, user, function() {
                cbk();
            });
        } else {
            cbk();
        }
    }

    function ensureConnected(app, callback, callRegisterGlobalAjaxErrorOnSuccess, initI18NOnSuccess) {
        $.getJSON('/AUTH.API/auth')
            .done(function (user) {
                initI18N(initI18NOnSuccess, app, user, function () {
                    //register currency
                    callRegisterCurrency(app, user, function () {
                        callRegisterGlobalAjaxError(callRegisterGlobalAjaxErrorOnSuccess, app, user, function () {
                            callback(user);
                        });
                    });
                });
            })
    	    .fail(function () {
	            redirectToAuth(app);
	        });
    }

    function popup(labels) {
        //TODO: avoid creating HTML from JS (use something like https://github.com/KoryNunn/crel ?)        
        var tpl = '<div id="fmk-authpopup">' +
            '<div class="fmk-authtitle">{{title}}</div>' +
            '<div class="fmk-authcontent">' +
                '<div>{{content}}</div>' +
                '<div>' +
                '<input class="fmk-authok" type="button" style="margin-right: 10px" value="{{ok}}" />' +
                '<input class="fmk-authcancel" type="button" style="margin-right: 10px" value="{{cancel}}" />' +
                '</div>' +
            '</div>' +
        '</div>';
        return tpl
            .replace('{{title}}', labels.title)
            .replace('{{content}}', labels.content)
            .replace('{{ok}}', labels.ok)
            .replace('{{cancel}}', labels.cancel);
    }

    var failedLabels = {
        412 : {
            title: 'Session expired',
            content: 'Your session has expired, you should go to the auth page to sign in.<br/>' +
                     'You can also stay here, this will open another tab of the browser to sign in.',
            ok: 'Go to auth',
            cancel: 'Stay here'
        },
        403 : {
            title: 'Authorization failed',
            content: 'You are not allowed to do this.',
            ok: 'OK'
        }
    }

    function initI18nFailedLabels(culture, cbk) {        
        $.getJSON("/I18N.API/i18n/domains/AUTH.HTML/cultures/" + culture)
            .done(function (translations) {
                function lookup(key, defaultValue) {
                    if (translations && translations.data && translations.data.translations) {
                        var matchingTranslations = translations.data.translations.filter(function (t) { return t.key == key });
                        if (matchingTranslations.length == 1) {
                            return matchingTranslations[0].value;
                        }
                    }
                    return defaultValue;
                }
                function init(code, msg) {
                    failedLabels[code][msg] = lookup("FailedLabels_" + code + "_" + msg, failedLabels[code][msg]);
                }

                init(412, "title");
                init(412, "content");
                init(412, "ok");
                init(412, "cancel");
                init(403, "title");
                init(403, "content");
                init(403, "ok");
                cbk();
            });
    }

    function displayAuthError(status, app) {
        $(popup(failedLabels[status])).appendTo('body')
            .jqxWindow({
                height: 200,
                width: 300,
                isModal: true,
                draggable: false,
                resizable: false,
                autoOpen: true,
                okButton: $('#fmk-authpopup .fmk-authok'),
                cancelButton: $('#fmk-authpopup .fmk-authcancel')
            });
        if (status == 412) {
            $('#fmk-authpopup .fmk-authok').on('click', function () { redirectToAuth(app); });
            $('#fmk-authpopup .fmk-authcancel').on('click', function () { open("/AUTH.HTML/?closeAfterAuth=1"); });
        }
        if (status == 403) {
            $('#fmk-authpopup .fmk-authcancel').hide();
        }
    }

    function registerGlobalAjaxError(app, user, cbk) {
        //remember the culture so that we can fetch the translations of AUTH.HTML if a problem arise
        //note that we can not use Fmk.I18n because we are not sure fmk_i18n.js is included or that we have called the init method
        var culture = "en-US";
        if (user && user.preferredCultureByApp && user.preferredCultureByApp[app]) {
            culture = user.preferredCultureByApp[app];
        } else if (user && user.preferredCulture) {
            culture = user.preferredCulture;
        }
        var failedLabelsInit = false;

        //register a global ajax error handler about 412 and 403
        $(document).ajaxError(function(event, jqXHR, ajaxSettings) {
            var wasCallingAuthApi = ajaxSettings.url == "/AUTH.API/auth";
            var authProblem = jqXHR.status == 412 || jqXHR.status == 403;
            if (authProblem && !wasCallingAuthApi) {
                if (! failedLabelsInit) {
                    initI18nFailedLabels(culture, function () {
                        failedLabelsInit = true;
                        displayAuthError(jqXHR.status, app);
                    });
                } else {
                    displayAuthError(jqXHR.status, app);
                }                
            }
        });
        cbk();
    }

    return {
        ensureConnected: ensureConnected,

        //in case the programmer wants to manually call these init...
        registerGlobalAjaxError: registerGlobalAjaxError,
        initI18N: initI18N,

        //in case the programmer wants to display the AUTH errors directly...
        initI18nFailedLabels: initI18nFailedLabels,
        displayAuthError: displayAuthError
    };

})(window.jQuery);


