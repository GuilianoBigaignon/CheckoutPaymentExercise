/* =============================================================================
 * Application Global Settings
 * =============================================================================
 * Set Application Global Settings
 * Expected options :
 * ============================================================================ */

if (!window.Fmk) {
    Fmk = {};
}

Fmk.AppSettings = (function ($) {

    function initCurrentApp(currentApp) {

        $.ajaxSetup({
            headers: { 'XCurrentApp': currentApp }
        });

        var oldJqxAjax = $.jqx.data.ajax;
        $.jqx.data.ajax = function (options) {
            var oldBeforeSend = options.beforeSend;
            options.beforeSend = function(xhr) {
                xhr.setRequestHeader("XCurrentApp", currentApp);
                return oldBeforeSend;
            }
            options.data['XCurrentApp'] = currentApp;
            return oldJqxAjax(options);
        }
    }

    return {
        initCurrentApp: initCurrentApp
    };

})(window.jQuery);