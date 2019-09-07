/* =============================================================================
 * Currency
 * =============================================================================
 * Provides services to interact with Currency.API
 * ============================================================================ */

if (!window.Fmk) {
    Fmk = {};
}

Fmk.Currency = (function ($) {
    var currencies = {},
        culture = '';

    function init(aCulture, cbk) {
        culture = aCulture;
        $.getJSON('/CURRENCY.API/currency')
            .done(function (res) {
                currencies = res.data;
                cbk && cbk();
            })
            .fail(function () {
                console.error("error during currency.api call, considering the api is not installed and currencies are not needed");
                currencies = [];
                cbk && cbk();
            });
    }

    function formatNumber(num, decimalD, thousandD, nbDec) {
        var numInString = String(num);
        var numParts = [numInString.substring(0, numInString.length - nbDec), numInString.substring(numInString.length - nbDec, numInString.length)];
        var hasDecimals = (numParts[1] !== '');
        var decimals = (hasDecimals ? numParts[1] : '0');

        // format number
        num = Math.abs(numParts[0]);
        num = isNaN(num) ? 0 : num;
        num = String(num);

        for (var i = 0; i < Math.floor((num.length - (1 + i)) / 3) ; i++) {
            num = num.substring(0, num.length - (4 * i + 3)) + thousandD + num.substring(num.length - (4 * i + 3));
        }

        decimals = parseFloat('1.' + decimals);
        decimals = decimals.toFixed(nbDec); // round
        if (decimals.substring(0, 1) == '2') {
            num = Number(num) + 1;
        }
        decimals = decimals.substring(2); // remove "0."

        if ((hasDecimals && nbDec === -1) || nbDec > 0) {
            num += decimalD + decimals;
        }

        return num;

    }

    function format(value, code) {
        var currency = currencies.filter(function(c) {
            return c.data.code === code;
        });
        if (currency.length < 1) {
            console.warn("Currency code not found", code);
        } else {
            var jqCurrency = $.formatCurrency.regions[culture];
            if (jqCurrency) {
                currency = currency[0].data;
                // Take first formatCur if format depends on culture and not on currency. Otherwise, take the second one.
                //var formatCur = value >= 0 ? jqCurrency.positiveFormat : jqCurrency.negativeFormat;
                var formatCur =  (value >= 0 ? '' : '-') + (currency.isRight ? '' : '%s') + '%n' + (currency.isRight ? '%s' : '');
                value = formatNumber(value, jqCurrency.decimalSymbol, jqCurrency.digitGroupSymbol, currency.precision);
                var money = formatCur.replace(/%s/g, currency.symbol);
                return money.replace(/%n/g, value);
            } else {
                console.warn("No jquery Currency is associated with the given culture.", code);
            }
        }
        return '';
    }

    return {
        init: init,
        _: format
    };

})(window.jQuery);


