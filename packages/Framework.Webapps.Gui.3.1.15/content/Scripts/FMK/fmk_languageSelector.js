/* =============================================================================
 * LanguageSelector
 * =============================================================================
 * Display a dropdown list with available languages
 * ============================================================================ */
(function ($, Fmk) {

    $.widget('fmkLanguageSelector', {
        _init: function () {
            this.options = $.extend({}, $.fn.fmkLanguageSelector.defaults, this.options); // no deep copy, we don't want to merge with defaults
            this.elem.addClass('fmk-languageSelector');
            this.displayData(this.chooseDefault());
        },

        getSelectedValue: function() {
            return this.options.field.jqxDropDownList('getSelectedItem').value;
        },

        onSelectRequest: function (value) {
            Fmk.Utils.setCookie("Culture", value, 30); //remember the selected value for 30 days
            this.options.selectLang && this.options.selectLang(value);
            this.elem.trigger("selectLang", [value]);
        },

        displayData: function(defaultLangIndex) {
            var htmlList = [],
                config = this.options.config || $.fn.fmkLanguageSelector.config;
            this.options.languages.forEach(function (code) {
                if (config[code]) {
                    var icon = '<span class="fmk-language-selector-icon {0}"></span>'.replace('{0}', code);
                    htmlList.push({
                        html: '<div class="fmk-language-selector-container">' + (this.options.icons ? icon : '') + '</span><span class="fmk-language-selector-label">{0}</span></div>'
                            .replace('{0}', this.options.labels ? config[code].name : ''),
                        title: config[code].name,
                        label: config[code].name,
                        value: code
                    });
                } else {
                    htmlList.push({
                        html: '<div class="fmk-language-selector-container"><span class="fmk-language-selector-label">{0}</span></div>'
                            .replace('{0}', code),
                        title: code,
                        label: code,
                        value: code
                    });
                }
            }.bind(this));
            this.options.field = $('<div>').appendTo(this.elem).jqxDropDownList({
                source: htmlList,
                selectedIndex: defaultLangIndex,
                autoDropDownHeight: true,
                width: this.options.labels ? 140 : 45,
                enableBrowserBoundsDetection: true
            })
            .on('select', function (event) {
                event.preventDefault();
                this.onSelectRequest(event.args.item.value);
            }.bind(this));              
        },

        chooseDefault: function () {
            var lang = this.options.defaultCulture;            
            if (!lang) {
                // if selector is not set with default culture, take from cookie
                lang = Fmk.Utils.getCookie("Culture");
                if (! lang) {
                    //if the cookie is not set, take from navigator
                    //navigator.languages is best because it contains culture (ex: fr-FR) but it works only for Chrome >= 32 and Firefox >= 32
                    //hoefully, IE11 does not follow the norm and navigator.language also contains the culture (norm says it should contain only the language...)
                    lang = navigator.languages ? navigator.languages[0] : (navigator.language || "en-US");
                }
            }
            if (this.options.languages.indexOf(lang) > -1) {
                return this.options.languages.indexOf(lang);
            } else {
                console.warn('Supplied culture {0} is not supported here. Restore to default.'.replace('{0}', lang));
                //this will default to the first
                return 0;
            }            
        }
    });

    $.fn.fmkLanguageSelector.defaults = {
        languages: ["en-US", "fr-FR", "it-IT"],
        icons: true,
        labels: false
    };

    $.fn.fmkLanguageSelector.config = {
        'en-US': { name: "English (US)" },
        'fr-FR': { name: "Français" },
        'it-IT': { name: "Italiano" }
    };

})(jQuery, window.Fmk);