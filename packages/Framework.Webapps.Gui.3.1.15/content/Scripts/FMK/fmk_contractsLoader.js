/* =============================================================================
 * ContractsLoader
 * =============================================================================
 * Provides service to load contracts with an spinner
 * ============================================================================ */

Contracts.Loader = function ($,Fmk) {
    load = function () {
        this.i18n = Fmk.I18n;
        this.contracts = $(arguments).splice(0,arguments.length - 1);
        this.callBack = arguments[arguments.length -1];
        this.contractsData = [];
        this.totalNumber = contracts.length;
        this.loaded = 0;
        this.loadWindow = $('<div class="fmk-contracts-loader">').prependTo('body');
        this.loadWindow.prepend('<div class="bar-inline bar-inline--grey"><span class="bar-inline__item btn btn--icon-info-medium-white"></span><p class="bar-inline__item title title--white title--medium title--upper">' + 
            i18n._('Fmk_Contracts_Loading_Title', 'Resources', 'WEBAPPS.GUI') + '</p></div>');
        $(contracts).each(function (k, contract) {
            $.get(contract).done(function (data) {
                _onLoaded(data);
            }).fail(function () {
                progressBar.find('.jqx-progressbar-value').css('background', '#F78181');
                $('<p class="error">' + i18n._('Fmk_Contracts_Loading_Error', 'Resources', 'WEBAPPS.GUI') + '</p>').appendTo(loadWindow);
            });
        });
        
        this.progressBar = $('<div>').appendTo(this.loadWindow)
            .jqxProgressBar({ animationDuration: 0, value: 0, width: 300 })
            .append('<div class="total">' + i18n._('Fmk_Contracts_Loading_Text', 'Resources', 'WEBAPPS.GUI').replace('{0}', loaded).replace('{1}', totalNumber));
    }.bind(this)

    _onLoaded = function (data) {
        contractsData = contractsData.concat(data);
        loaded++;
        this.progressBar.jqxProgressBar({ 'value': (loaded * 100 / totalNumber) })
            .find('.total').html(i18n._('Fmk_Contracts_Loading_Text', 'Resources', 'WEBAPPS.GUI').replace('{0}',loaded).replace('{1}',totalNumber));

        if (loaded == totalNumber) {
            this.loadWindow.remove();
            callBack(contractsData);
        }
    }

    return load;
}(jQuery,Fmk);