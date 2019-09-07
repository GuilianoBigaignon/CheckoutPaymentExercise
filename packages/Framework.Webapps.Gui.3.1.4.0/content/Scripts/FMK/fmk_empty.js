/* =============================================================================
 * Empty Widget
 * =============================================================================
 * Display nothing... Just for one or multiple action(s)
 * Expected options :
 * ============================================================================ */
(function ($, i18n) {

    $.widget('fmkEmpty', {
        _init: function() {
            $.ajax(this.options.actionLink.href, {
                data: $.extend(true, {}, window.Contracts && Contracts.GLOBALS || {}),
                contentType: 'text/json',
                type: this.options.actionLink.method
            })
            .done(this.onSuccess.bind(this))
            .fail(this.onFail.bind(this));;
        },
        onSuccess: function (data) {
            this.options.success && this.options.success.call(data);
            this.elem.trigger("success", [data]);
        },
        onFail: function (jqXhr) {
            if (jqXhr.status == 412 || jqXhr.status == 403) {
                //do nothing, this will be handled by fmk_auth
                return;
            }
            if (jqXhr.status == 500) {
                //this is an unexpected error => display a generic message
                $('<div class="alert alert-danger" role="alert">'
                    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                    + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true">&nbsp;</span>'
                    + '<span class="sr-only">Error</span>'
                    + i18n._('Fmk_Form_Error500', 'Resources', 'WEBAPPS.GUI')
                    + this.formatException(jqXhr.responseText)
                    + '</div>').prependTo(this.elem);
                return;
            }
            //this is a business error => display the message coming from the server
            this.elem.trigger("error");
            $('<div class="alert alert-danger" role="alert">'
                    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                    + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true">&nbsp;</span>'
                    + '<span class="sr-only">Error</span>'
                    + JSON.parse(jqXhr.responseText).exceptionMessage
                    + '</div>').prependTo(this.elem);
        },
        formatException: function (res) {
            var err = JSON.parse(res);
            if (err && err.exceptionMessage) {
                return '<br/>' + '<pre style="padding-left: 100px">' + err.exceptionMessage + '</pre>';
            }
            return '';
        }
    }); 
    
    $.widgetFactory.registerForType('empty', 'fmkEmpty');

})(jQuery, Fmk.I18n);