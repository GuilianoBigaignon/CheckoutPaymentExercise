/* =============================================================================
 * ConfirmDialog
 * =============================================================================
 * Expected options :
 * ============================================================================ */

(function ($, i18n) {

    $.widget('fmkConfirmDialog', {
        _init: function () {
            var contractData = this.options.contract.data;
            this.elem.addClass('fmk-form');
            $('<div class="fmk-form-confirmMsg">' + contractData.confirmMsg + '</div>').prependTo(this.elem);
            var buttonsbar = $('<div class="fmk-actionBar bar-inline bar-inline--grey fmk-form-buttons" >').prependTo(this.elem);
            var title = '<p class="bar-inline__item title title--white title--medium title--light">{0}</p>'.replace('{0}', contractData.label);
            $('<div class="bar-inline__left">' + title + '</div><div class="bar-inline__right"></div>').prependTo(buttonsbar);

            var submit = $('<button class="fmk-form-submit fmk-bar-inline__item fmk-btn fmk-btn--text fmk-btn--text--icon fmk-btn--green fmk-btn--icon-valid-medium-white"><span class="fmk-btn__inner">{0}</span></button>'
                .replace('{0}', contractData.acceptMsg))
                .jqxButton({ width: '150', height: '25' })
                .prependTo($(buttonsbar).find('.bar-inline__right'));
            this._on({ observable: submit, event: 'click', handler: this.submit });

            var cancel = $('<button class="fmk-form-cancel fmk-bar-inline__item fmk-btn fmk-btn--text fmk-btn--text--icon fmk-btn--green fmk-btn--icon-cross-big-white"><span class="fmk-btn__inner">{0}</span></button>'
                .replace('{0}', contractData.declineMsg))
                .jqxButton({ width: '150', height: '25' })
                .prependTo($(buttonsbar).find('.bar-inline__right'));
            this._on({ observable: cancel, event: 'click', handler: this.cancel });                

            setTimeout(function () {
                this.elem.trigger("ready");
            }.bind(this), 10);
        },

        submit: function() {
            $.ajax(this.options.actionLink.href, {
                data: $.extend(true, {}, window.Contracts && Contracts.GLOBALS || {}),
                contentType: 'text/json',
                method: this.options.actionLink.method,
                type: 'json'
            })
            .done(this.onSubmitSuccess.bind(this))
            .fail(this.onSubmitFail.bind(this));
        },
        onSubmitFail: function (jqXhr) {
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
                    + '</div>').insertAfter(this.elem.find('.fmk-actionBar'));
                return;
            }
            //this is a business error => display the message coming from the server
            this.elem.trigger("error");
            $('<div class="alert alert-danger" role="alert">'
                    + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
                    + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true">&nbsp;</span>'
                    + '<span class="sr-only">Error</span>'
                    + JSON.parse(jqXhr.responseText).exceptionMessage
                    + '</div>').insertAfter(this.elem.find('.fmk-actionBar'));
        },
        formatException: function (res) {
            var err = JSON.parse(res);
            if (err && err.exceptionMessage) {
                return '<br/>' + '<pre style="padding-left: 100px">' + err.exceptionMessage + '</pre>';
            }
            return '';
        },
        onSubmitSuccess: function(data) {
            this.options.success && this.options.success.call(data);
            this.elem.trigger("success", [data]);
        },

        cancel: function() {
            this.options.cancel && this.options.cancel.call();
            this.elem.trigger("cancel", []);
        }
    });    

    $.widgetFactory.registerForType('confirmDialog', 'fmkConfirmDialog');
})(jQuery, Fmk.I18n);
