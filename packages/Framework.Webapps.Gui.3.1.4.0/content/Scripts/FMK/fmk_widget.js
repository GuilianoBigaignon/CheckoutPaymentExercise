$.BaseWidgetPrototype = {
    //this is the "constructor" of the widget, simply remembering this.options and this.elem for the future
    _create: function (options, elem) {
        this.options = options || {};
        this.elem = elem;
        this._init();
        setTimeout(function () {
            this.elem.trigger('create', this);
        }.bind(this), 10);
    },
    //this is a function you can define instead of overloading _create
    _init: $.noop,

    //use this function to register a event handler with the scope of the handler set to this widget
    //possible usages :
    //  this._on({event:'click', handler:this.onClick})
    //  ==> this._on{event:'click', handler:this.onClick, observable: this.elem, selector: false});
    //  this._on({observable: this.innerWidget, event:'create', handler:this.onInnerWidgetCreated})
    //  ==> this._on{event:'click', handler:this.onClick, observable: this.innerWidget, selector: false});
    //  this._on({event:'click', selector:'li', handler:this.onLiClicked})
    //  ==> this._on({event:'click', selector:'li', handler:this.onLiClicked, observable: this.elem})
    _on: function (evDesc) {
        var instance = this,
            observable = evDesc.observable || this.elem,
            event = evDesc.event,
            selector = evDesc.selector || '',
            handler = evDesc.handler;

        function handlerProxy() {
            handler.apply(instance, arguments);
        }
        if (selector) {
            observable.on(event, selector, handlerProxy);
        } else {
            observable.on(event, handlerProxy);
        }        
    },

    destroy: function()
    {
        this.elem.remove();
    }
};

$.widget = function (name, prototype) {
    //create an object so that instances do not mix their values and functions
    var widget = function (options, element) {
        return this._create(options, element);
    };
    widget.prototype = $.extend({}, $.BaseWidgetPrototype, prototype);

    //register jQuery plugin
    $.fn[name] = function (property, opts) {
        if (typeof property == "string") {
            //this is a method call, we require that the jquery set contains only one element
            if (this.length != 1) {
                console.error("invalid widget method call", this);
                throw "can not call a widget method when the jquery set has not exactly one element";
            }
            if (!this.data('widget')) {
                console.error("no widget to call", this);
                throw "can not call a widget method when there is no widget";
            }
            return this.data('widget')[property](opts);
        } else {
            //assume constructor call
            return this.each(function () {
                if ($(this).data('widget')) {
                    //it is not safe to instanciate another widget on the same element
                    //but for backward compatibility we do not fail, only an error message
                    console.error('/!\\instanciating a widget over an existing widget', this)
                }
                return $(this).data('widget', new widget(property, $(this)));
            });
        }
    };
};

(function ($) {
    $.fn.getFmkWidget = function () {
        //this is a method call, we require that the jquery set contains only one element
        if (this.length != 1) {
            console.error("invalid widget method call", this);
            throw "can not call a widget method when the jquery set has not exactly one element";
        }
        if (!this.data('widget')) {
            console.error("no widget to call", this);
            throw "can not call a widget method when there is no widget";
        }
        return $(this).data('widget');
    };
})(jQuery);
