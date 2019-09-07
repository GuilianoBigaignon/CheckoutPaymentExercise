/* =============================================================================
 * Notification for Error Widget
 * =============================================================================
 * Display a jqxNotification to display a server error
 * Expected options : jqXhr
 * ============================================================================ */
(function ($, i18n) {

    $.widget('fmkNotifyError', {

        _init: function () {
        
            this.options = $.extend(false, {}, this.options);
            if(this.options.jqXhr)
            {
                if (this.options.jqXhr.status == 412 || this.options.jqXhr.status == 403) {
                    //do nothing, this will be handled by fmk_auth
                    return;
                }
                if (this.options.jqXhr.status == 500) {
                    //this is an unexpected error => display a generic message + exception message
                    this.msg = i18n._('Fmk_Form_Error500', 'Resources', 'WEBAPPS.GUI')
                    + JSON.parse(this.options.jqXhr.responseText).exceptionMessage;
                }
                else
                {
                    this.msg = JSON.parse(this.options.jqXhr.responseText).exceptionMessage;
                }

                $('<div></div>')
                .append('<p>' + this.msg + '</p>')
                .appendTo(this.elem)
                .jqxNotification({ 
                    width: 250, 
                    position: this.options.position ? this.options.position : "bottom-left",
                    opacity: 0.9, 
                    autoOpen: true, 
                    autoClose: true, 
                    template: "error" 
                });
            }
        }

    });

})(jQuery, Fmk.I18n);