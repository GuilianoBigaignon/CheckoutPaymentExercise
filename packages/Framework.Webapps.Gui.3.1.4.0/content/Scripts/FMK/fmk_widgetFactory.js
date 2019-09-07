/* =============================================================================
 * Widget Factory
 * =============================================================================
 * Register contracts, check factories associated and built widgets
 * Expected options :
 * ============================================================================ */
function WidgetFactory() {
    this.mappingName = {};
    this.mappingType = {};
}

WidgetFactory.prototype = {
    // Register contract by name
    registerForName: function (contractName, factory) {
        if (!this.mappingName.hasOwnProperty(contractName)) {
            this.mappingName[contractName] = factory;
        }
        else {
            alert('Contract name "' + contractName + '" already associated with a factory');
        }
    },

    // Register contract by type
    registerForType: function (contractType, factory) {
        if (!this.mappingType.hasOwnProperty(contractType)) {
            this.mappingType[contractType] = factory;
        }
        else {
            alert('Contract type "' + contractType + '" already associated with a factory');
        }
    },

    // Built a widget
    buildForContract: function (contract, options, container) {
        // Merge contract with optional parameters in'params' object
        var params = $.extend(true, {}, options);
        params['contract'] = contract;
        // Invoke factory method for a contract name
        if (this.mappingName.hasOwnProperty(contract.data.name)) {
            return $(container)[this.mappingName[contract.data.name]](params);
        }
        // Invoke factory method for a contract type
        if (this.mappingType.hasOwnProperty(contract.data.type)) {
            return $(container)[this.mappingType[contract.data.type]](params);
        }
        // Error
        console.error('Unmanaged contract: ' + contract.data.name, contract);
        alert('Unmanaged contract: ' + contract.data.name);
    }
}

$.widgetFactory = new WidgetFactory();
$.fn.buildForContract = function (contract, options) {
    return $.widgetFactory.buildForContract(contract, options, $(this));
}

$.mapLayerFactory = new WidgetFactory();
$.fn.buildLayerForContract = function (contract, options) {
    return $.mapLayerFactory.buildForContract(contract, options, $(this));
}