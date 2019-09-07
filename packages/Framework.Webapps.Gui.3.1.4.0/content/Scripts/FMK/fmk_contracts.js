function Contracts(contractList) {
	this.list = contractList;
}

Contracts.prototype = {
	findByName: function (cName) {
		var resp = this.list.filter(function (c) {
			return c.data.name === cName;
		});
		if (resp.length > 1) {
			throw ("more than one contract with name " + cName);
		}
		if (resp.length == 0) {
			throw ("no contract with name " + cName);
		}
		return new Contract(resp[0]);
	},
	filterByType: function (cType) {
	    return this.list.filter(function (c) {
	        return c.data.type === cType;
	    });
	},
	containsName: function (cName) {
	    var resp = this.list.filter(function (c) {
	        return c.data.name === cName;
	    });
	    return (resp.length == 1);
	}
};

Contracts.GLOBALS = {};
//!\ BIG HACK 
//handle GLOBALS in ajax calls that are made outside of a contract

var __contracts_oldAjax = $.ajax;
$.ajax = function (options) {
    if (options.url && options.url.indexOf('{') != -1 && options.url.indexOf('}') != -1) {
        console.warn("trying to replace GLOBALS inside an url (not recommended)", options.url);
        options.url = Mustache.render(options.url.replace(/\{/g, "{{").replace(/\}/g, "}}"), $.extend(true, {}, Contracts.GLOBALS));
    }
    return __contracts_oldAjax.apply($, arguments);
}

var __contracts_oldJqxAjax = $.jqx.data.ajax;
$.jqx.data.ajax = function (options) {
    if (options.url && options.url.indexOf('{') != -1 && options.url.indexOf('}') != -1) {
        console.warn("trying to replace GLOBALS inside an url (not recommended)", options.url);
        options.url = Mustache.render(options.url.replace(/\{/g, "{{").replace(/\}/g, "}}"), $.extend(true, {}, Contracts.GLOBALS));
    }
    return __contracts_oldJqxAjax.apply($, arguments);
}

function Contract(c) {
	$.extend(true, this, c);
}

//  /!\ regexp ninja mode
Contract.replaceArrayParamsInHref = function (href) {
    //  the regexp matches every parameter that ends with [] with associated value
    var ninjaRegexp = /([\?|\&])([^=]*)\[\]=([^\&]*)(\&)?/gi;

    //  then we replace it with the format understood by .NET
    function replaceArrayParams(match, andSignOrQuestionMark, paramName, paramValuesCommaFormat, andSignOrEnd) {
        //console.log(arguments);
        var paramValuesUnsplitted = paramValuesCommaFormat.split(',');
        var paramValues = paramValuesUnsplitted.map(function (v) {
            return paramName + "=" + v;
        }).join('&');
        return andSignOrQuestionMark + paramValues + (andSignOrEnd || "");
    }

    while (ninjaRegexp.test(href)) {
        href = href.replace(ninjaRegexp, replaceArrayParams);
    }
    return href;
}
//  end regexp ninja mode
var ninjaRegexpTests = [
    { test: "", result: "" },
    { test: "/HOST", result: "/HOST" },
    { test: "/HOST?p=v", result: "/HOST?p=v" },
    { test: "/HOST?p=v&p2=v2", result: "/HOST?p=v&p2=v2" },
    { test: "/HOST?p[]=v", result: "/HOST?p=v" },
    { test: "/HOST?p[]=v1,v2", result: "/HOST?p=v1&p=v2" },
    { test: "/HOST?p[]=v&p2=v2", result: "/HOST?p=v&p2=v2" },
    { test: "/HOST?p[]=v1,v2&p2=v2", result: "/HOST?p=v1&p=v2&p2=v2" },
    { test: "/HOST?p1=v1&p[]=v&p2=v2", result: "/HOST?p1=v1&p=v&p2=v2" },
    { test: "/HOST?p1=v1&p[]=v1,v2&p2=v2", result: "/HOST?p1=v1&p=v1&p=v2&p2=v2" },
    { test: "/HOST?p1=v1&p[]=v&p2[]=v2", result: "/HOST?p1=v1&p=v&p2=v2" },
    { test: "/HOST?p1=v1&p[]=v1,v2&p2[]=v2,v3", result: "/HOST?p1=v1&p=v1&p=v2&p2=v2&p2=v3" },
];
for (var i = 0; i < ninjaRegexpTests.length; i++) {
    if (Contract.replaceArrayParamsInHref(ninjaRegexpTests[i].test) != ninjaRegexpTests[i].result) {
        alert('ninja regexp is broken for ' + ninjaRegexpTests[i].test);
    }
}

Contract.prototype = {
	getProp: function (name) {
		var p = this.data.properties.filter(function (p) { return p.name == name });
		if (p.length == 0) {
			console.log(this.c);
			throw "No property named " + name;
		}
		if (p.length > 1) {
			console.log(this.c);
			throw "Multiple properties named " + name;
		}
		return new ContractProperty(p[0]);
	},
    getColumnsLabels: function () {
        var res = {};
        this.data.columns.forEach(function (c) {
            res[c.id] = c.label;
        });
        return res;
    },
	getLabels: function () {
		return this.getLabels_(this.data.properties, "");
	},
    getLabels_: function (properties, prefix) {
		var res = {};
		$.each(properties, function (i, p) {
			var curName = prefix ? prefix + "_" + p.name : p.name;
			res[curName] = p.label;
			if (p.format == "array") {
				p = p.children;
			}
			if (p.format == "object") {
			    $.extend(res, this.getLabels_(p.properties, curName));
			}
			if (p.format == "enum") {
				res[curName + "_values"] = function () {
					return function (text, render) {
						var keyToLookup = render(text);
						var val = p.values.filter(function (v) { return v.key == keyToLookup });
						if (val.length == 0) { return render("Unknown enum val " + keyToLookup + " evaluated from " + text); }
						return render(val[0].value);
					}
				}
			}
			if (p.format == "boolean") {
				res[curName + "_msg"] = function () {
					return function (text, render) {
						var booleanValue = render(text);
						if (booleanValue == "0") {
							return p.msgFalse;
						}
						else if (booleanValue == "1") {
							return p.msgTrue;
						}
						return "";
					}
				}
			}
		}.bind(this));
		return res;
	},

	getResourceLinkFromRel: function (rel, obj) {
	    var templatedResLink = (this.data.linksDesc && this.data.linksDesc[rel]) || "";
	    if (!templatedResLink) {
            throw "no rel {0} in contract {1}".replace('{0}', rel).replace('{1}', this.data.name);
        }
        //create a mustache template
        var href = templatedResLink.href.replace(/\{/g, "{{").replace(/\}/g, "}}");
        //resolve the template with the given obj
        href = Mustache.render(href, $.extend(true, {}, Contracts.GLOBALS, obj || {}));
        //replace array params with a format understand by stupid .NET
        href = Contract.replaceArrayParamsInHref(href);
	    return $.extend({}, templatedResLink, {
            href: href
	    });
	},
	toXhr: function (rel, obj, xhrSettings) {
	    var resLink = this.getResourceLinkFromRel(rel, obj);
	    return $.ajax($.extend({
            method: resLink.method,
	        url: resLink.href,
            dataType: 'json'
	    }, xhrSettings));
	}
};

function ContractProperty(p) {
	$.extend(true, this, p);
}

ContractProperty.prototype = {	
};

