/* =============================================================================
 * Utils
 * =============================================================================
 * Provides multiple services C
 * ============================================================================ */

if (!window.Fmk) {
    Fmk = {};
}

Fmk.Utils = (function ($) {
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    };

    function getNavigatorLanguage() {
        return window.navigator.userLanguage || window.navigator.language;
    }

    function getLocationOrigin() {
        return window.location.origin || (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : ''));
    }

    function isValidDate(d) {
        if (Object.prototype.toString.call(d) !== "[object Date]") {
            return false;
        }
        return !isNaN(d.getTime());
    }

    function toISOString(d) {
        if (d && d instanceof Date) {
            var d2 = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
            return d2.toISOString();
        }
        return null;
    }

    function parseISODate(jsonDate) {
        var dateValue,
			result = null;
        if (jsonDate instanceof Date) {
            return jsonDate;
        }

        if (jsonDate) {
            //https: //github.com/csnover/js-iso8601/blob/master/iso8601.js
            var struct, minutesOffset = 0, numericKeys = [1, 4, 5, 6, 7, 10, 11];
            //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
            if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,7}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(jsonDate))) {
                // avoid NaN timestamps caused by “undefined” values being passed to new Date
                for (var i = 0, k; (k = numericKeys[i]) ; ++i) {
                    struct[k] = +struct[k] || 0;
                }

                // allow undefined days and months
                struct[2] = (+struct[2] || 1) - 1;
                struct[3] = +struct[3] || 1;

                //adjust timezone offset if present
                if (struct[8] !== 'Z' && struct[9] !== undefined) {
                    minutesOffset = struct[10] * 60 + struct[11];

                    if (struct[9] === '+') {
                        minutesOffset = 0 - minutesOffset;
                    }
                }

                //adjust millilseconds
                // .NET milliseconds formatting is strange because the value has no fixed precision !
                //  so .NET can send 2016-10-03T14:02:35 (meaning 0ms) 
                //  or 2016-10-03T14:02:35.45 (meaning 450 ms)
                //  or 2016-10-03T14:02:35.4556878 (meaning 455.6878ms)
                // JS, on the other hand, only support milliseconds in the range [0-999]
                while (struct[7] && struct[7] < 1000) {
                    struct[7] = struct[7] * 10; //this is to add trailing zeros
                }
                while (struct[7] && struct[7] > 1000) {
                    struct[7] = struct[7] / 10; //this is to remove over precision unsupported by JS
                }
                struct[7] = Math.round(struct[7]); //this is in case the divsion leds to decimals
                //End of milliseconds handling, yeah baby, that was super simple !
                
                result = new Date(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
            }
        }

        if (result == null || !isValidDate(result)) {
            throw "Can't parse date [" + jsonDate + "]";
        }

        return result;
    }

    function getIndexOf(array, attr, value) {
        for(var i = 0; i < array.length; i += 1) {
            if(array[i][attr] === value) {
                return i;
            }
        }
    }

    function prettyPrint(obj) {
        var json = JSON.stringify(obj, undefined, 4);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    function retrieveMultipleXhrResults(results) {
        //the arguments of this method are the results from multiple simultaneous XHR calls (i.e $.when($.get('xxx'),$.get('xxx'), ...))
        //1. mutate arguments into an array (http://tiny.cc/7zy81x)            
        var args = Array.prototype.slice.call(results); 
        //2. each argument is an array where [0] == data, [1] == textStatus, [2] == jqXHR => only pick [0]
        return args.map(function (xhrRes) { return xhrRes[0] });   
    }

    function flatten(arr) {
        // see http://stackoverflow.com/a/12777964/1545567
        return $.map(arr, function recurs(n) {
            return ($.isArray(n) ? $.map(n, recurs) : n);
        });
    }

    return {
        getCookie: getCookie,
        setCookie: setCookie,
        generateUUID: generateUUID,
        getNavigatorLanguage: getNavigatorLanguage,
        getLocationOrigin: getLocationOrigin,
        prettyPrint: prettyPrint,
        parseISODate: parseISODate,
        toISOString: toISOString,
        retrieveMultipleXhrResults: retrieveMultipleXhrResults,
        flatten: flatten,
        getIndexOf: getIndexOf
    };
})(window.jQuery);


