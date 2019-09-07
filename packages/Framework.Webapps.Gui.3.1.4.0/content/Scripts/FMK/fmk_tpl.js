/* =============================================================================
 * Template Widget
 * =============================================================================
 * Templates an entity
 * Expected options :
 * ============================================================================ */
(function ($, TplEngine, i18n, utils, currency) {

    $.widget('fmkTpl', {
        _init: function() {
            this.elem.html(TplEngine.render(this.options.tpl, $.extend(true, {}, $.fn.fmkTpl.defaultFns, this.options.obj), this.options.partials));
        }
    });    

    $.fn.fmkTpl.defaultFns = {
        GetFormat: function(key, defaultFormat) {
            var format = i18n._(key, 'Resources', 'WEBAPPS.GUI');
            return format == key ? defaultFormat : format;
        },
        LowerCase: function () {
            return function (word, render) {
                return render(word).toLowerCase();
            }
        },
        Exists : function () {
            return function (value, render) {
                var vals = value.split('{{$$}}');
                var testVal = render(vals[0]);
                // then, vals[0] = property to test, vals[1] = text to return if exists, vals[2] = text to return if does not exist
                if (testVal !== null && testVal !== '' && typeof (testVal) !== 'undefined') {
                    return render(vals[1]) || true;
                }
                return render(vals[2]) || '';
            }
        },
		FormatDateTime: function () {
			return function (dateValue, render) {
				dateValue = render(dateValue); //in case dateValue contains a tpl, we went it to be executed before
				if (dateValue.length != 0) {
				    var dateToFormat = utils.parseISODate(dateValue);
					if (dateToFormat != "Invalid Date") {
					    var format = $.fn.fmkTpl.defaultFns.GetFormat('Fmk_dateTime_format', 'yy-mm-ddThh:ii:ss');
						return $.formatDateTime(format, dateToFormat);
					}
					else {
						throw "Invalid Date for {0} please use proper json date format".replace("{0}", dateValue);
					}
				}
				return "";
			}
		},
		FormatLongDate: function () {
			return function(dateValue, render) {
				dateValue = render(dateValue); //in case dateValue contains a tpl, we went it to be executed before
				if (dateValue.length != 0) {
				    var dateToFormat = utils.parseISODate(dateValue);
					if (dateToFormat != "Invalid Date") {
					    var format = $.fn.fmkTpl.defaultFns.GetFormat('Fmk_longDate_format', 'yy-mm-dd');
						return $.formatDateTime(format, dateToFormat);
					} else {
						return "Invalid Date for {0} please use proper json date format".replace("{0}", dateValue);
					}
				}
				return "";
			}
		},
		FormatShortDate: function () {
			return function (dateValue, render) {
				dateValue = render(dateValue); //in case dateValue contains a tpl, we went it to be executed before
				if (dateValue.length != 0) {
				    var dateToFormat = utils.parseISODate(dateValue);
					if (dateToFormat != "Invalid Date") {
					    var format = $.fn.fmkTpl.defaultFns.GetFormat('Fmk_shortDate_format', 'yy-mm-dd');
						return $.formatDateTime(format, dateToFormat);
					} else {
						return "Invalid Date for {0} please use proper json date format".replace("{0}", dateValue);
					}
				}
				return "";
			}
		},
		FormatTime: function () {
		    return function (dateValue, render) {
		        dateValue = render(dateValue); //in case dateValue contains a tpl, we went it to be executed before
		        if (dateValue.length != 0) {
		            var dateToFormat = utils.parseISODate(dateValue);
		            if (dateToFormat != "Invalid Date") {
		                var format = $.fn.fmkTpl.defaultFns.GetFormat('Fmk_time_format', 'hh:ii');
		                return $.formatDateTime(format, dateToFormat);
		            }
		            else {
		                throw "Invalid Date for {0} please use proper json date format".replace("{0}", dateValue);
		            }
		        }
		        return "";
		    }
		},
		FormatCurrency: function () {
			return function (currencyPath, render) {
				
				var currencyJsonPath = "$." + currencyPath;
				var currencyObject = jsonPath(this, currencyJsonPath, { resultType: "VALUE" });
				if (!currencyObject)
				{
					currencyObject = render(currencyPath);
				}
				return currency._(currencyObject[0].value, currencyObject[0].currency);
			}
		}
	}
})(window.jQuery, window.Mustache, Fmk.I18n, Fmk.Utils, Fmk.Currency);