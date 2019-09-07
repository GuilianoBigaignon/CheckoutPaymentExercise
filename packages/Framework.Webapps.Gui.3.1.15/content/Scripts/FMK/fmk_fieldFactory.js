/* =============================================================================
 * Field Factory
 * =============================================================================
 * Register fields, check factories associated and built widgets
 * Expected options :
 * ============================================================================ */
function FieldFactory() {
    this.mappingType = {};
}

FieldFactory.prototype = {

    register: function (fieldType, factory) {
        if (!this.mappingType.hasOwnProperty(fieldType)) {
            this.mappingType[fieldType] = factory;
        }
        else {
            alert('Field type "' + fieldType + '" already associated with a factory');
        }
    },

    build: function (fieldDesc, options, container) {
        // Merge contract with optional parameters in'params' object
        var params = $.extend(true, {}, options);
        params['fieldDesc'] = fieldDesc;
        // Invoke factory method for a contract type
        if (this.mappingType.hasOwnProperty(fieldDesc.type)) {
            return $(container)[this.mappingType[fieldDesc.type]](params);
        }
        // Error
        console.error('Unmanaged field: ' + fieldDesc.type, fieldDesc);
        return alert('Unmanaged field: ' + fieldDesc.type);
    }
}

$.fieldFactory = new FieldFactory();
$.fn.buildField = function (contract, options) {
    return $.fieldFactory.build(contract, options, $(this));
}