/* =============================================================================
 * I18N
 * =============================================================================
 * Provides services to interact with I18N.API
 * ============================================================================ */

if (!window.Fmk) {
    Fmk = {};
}

Fmk.I18n = (function ($) {
    var app, user, translations = {};    

    function getCulture() {
        if (user && user.preferredCultureByApp && user.preferredCultureByApp[app]) {
            return user.preferredCultureByApp[app];
        } else if (user && user.preferredCulture) {
            return user.preferredCulture;
        } else {
            return "en-US";
        }
    }

    function reindexTranslations(anApp, theTranslations) {
        if (theTranslations && theTranslations.data && theTranslations.data.translations) {                    
            theTranslations.data.translations.forEach(function (t) {
                if (!translations[anApp]) {
                    translations[anApp] = {}
                }
                if (!translations[anApp][t.fileName]) {
                    translations[anApp][t.fileName] = {};
                }
                translations[anApp][t.fileName][t.key] = t.value;
            });
        }
    }

    function init(anApp, aUser, cbk) {
        app = anApp;
        user = aUser;
        $.when(
            $.getJSON('/I18N.API/i18n/domains/{0}/cultures/{1}'.replace('{0}', app).replace('{1}', getCulture())),
            $.getJSON('/I18N.API/i18n/domains/WEBAPPS.GUI/cultures/{1}'.replace('{0}', app).replace('{1}', getCulture()))
        ).done(function (res0, res1) {
            reindexTranslations(app, res0[0]);
            reindexTranslations('WEBAPPS.GUI', res1[0]);
            cbk && cbk();
            if (getCulture() != 'en-US') {
                var globalizeScript = 'jqwidgets/globalization/globalize.culture.' + getCulture() + '.js';
                if ($('script[src*="' + globalizeScript + '"]').length === 0)
                    $.getScript(globalizeScript).fail(function (jqxhr, settings, exception) {
                        globalizeScript = '/WEBAPPS.GUI/' + globalizeScript;
                        if ($('script[src*="' + globalizeScript + '"]').length === 0)
                            $.getScript(globalizeScript).fail(function (jqxhr, settings, exception) { console.warn('Error loading ' + globalizeScript); });
                    });

            }
        });
    }    

    function translate(key, file, anApp) {
        anApp = anApp || app;
        file = file || "Resources";
        var translationsOfApp = translations && translations[anApp];
        if (translationsOfApp) {
            var translationsOfFile = translationsOfApp[file];
            if (translationsOfFile) {
                for (var k in translationsOfFile) {
                    if (translationsOfFile.hasOwnProperty(k) && k == key) {
                        return translationsOfFile[k];
                    }
                }
                console.warn("key not found", key, file, anApp);
                return key;
            } else {
                console.warn("i18n not initialized or unknown file", file, anApp);
                return key;
            }
        } else {
            console.warn("i18n not initialized, not translations for this culuture or unknown app", anApp);
            return key;
        }              
    }

    return {
        init: init,
        _: translate,
        getCulture: getCulture
    };

})(window.jQuery);


