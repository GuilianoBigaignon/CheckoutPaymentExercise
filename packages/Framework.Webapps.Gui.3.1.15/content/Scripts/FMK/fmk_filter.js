/* =============================================================================
 * Filter Widget
 * =============================================================================
 * Display a list of fields in order to filter a request
 * Expected options :
 * ============================================================================ */
(function ($, utils) {

    //TODO: refactor : a filter should be a form that should not be submitted but should trigger an event each time a field changes
    $.widget('fmkFilter', {      
        _init: function () {
            this.filters = {};
            this.displayable = true;
            this.enabled = false;
            this.options.uuid = utils.generateUUID();
            this.elem.attr('data-form', this.options.uuid);

            if (!this.options.contract.data.fields || this.options.contract.data.fields.length === 0) {
                this.elem.hide();
                this.displayable = false;
            } else {
                var cter = $('<fieldset></fieldset>').prependTo(this.elem);
                this.createFilter(cter);
                this.handleDependency();
            }
            setTimeout(function () {
                this.options.ready && this.options.ready();
                this.elem.trigger("ready");
                this.enabled = true;
            }.bind(this), 10);
        },
        createFilter: function (cter) {
            
            this.options.contract.data.fields.forEach(function (f) {
                this.createFieldCter(f).appendTo(cter).buildField(f, {
                    value: this.getFieldValue(f),
                    parent: this.elem,
                    otherValuesFunc: this.getValues.bind(this),
                    dependencies: this.getDependentValues(f)
                });
            }.bind(this));
            
            var rules = this.options.contract.data.fields.map(this.createRules.bind(this));
            this.elem.jqxValidator({ rules: [].concat.apply([], rules), focus: false });
            this.elem.on('valueChanged', function (ev, val, field) {
                this.onChange(ev, val, field);
            }.bind(this));

            var fieldsets = this.options.contract.data.fields.filter(function(f) { return f.type == "Fieldset" });    
            fieldsets.forEach(function (fieldset) {
                this.options.contract.data.fields.forEach(function (f) {
                    if (f.fieldsetId == fieldset.id) {
                        cter.find('[data-form="{0}"] [data-form-field="{1}"]'.replace('{0}', this.options.uuid).replace('{1}', f.id))
                            .appendTo(cter.find('[data-form-field="{0}"]'.replace('{0}', fieldset.id)));
                    }
                }.bind(this));
            }.bind(this));
            this.filters = this.getValues(); //Init list of filter, independent of contract
        },

        createFieldCter: function(f) {
            if (f.type === 'Fieldset') {
                return $('<div />');
            }
            var field = $('<div data-form-field="{0}" data-form-parent="{2}" data-form-field-type="{1}" class="form-field menu"><div class="menu__list"></div></div>'
                .replace('{0}', f.id)
                .replace('{1}', f.type)
                .replace('{2}', this.options.uuid));
            $('<div class="menu__list__item menu__list--filter__item menu__list--filter__item--title"><span class="menu__list--filter__item__link block-link"><span class="block-link__inner">{0}</span></span></div>'.replace('{0}', f.label))
                .appendTo(field.find('.menu__list'));
            return field;
        },

        reloadFields: function (changedFieldId, values) {
            this.options.contract.data.fields && this.options.contract.data.fields.forEach(function (f) {
                if (f.type !== 'Fieldset') {
                    this.elem.find('[data-form-field="{0}"][data-form-parent="{1}"]'
                        .replace('{0}', f.id)
                        .replace('{1}', this.options.uuid)).reloadFmkField(changedFieldId, values);
                }
            }.bind(this));
        },

        getFieldValue: function (f) {
            if (this.options.entity && this.options.entity.data && this.options.entity.data.hasOwnProperty(f.mapping)) {
                return this.options.entity.data[f.mapping];
            } if (window.Contracts && window.Contracts.GLOBALS[f.id]) {
                return window.Contracts.GLOBALS[f.id];
            } else {
                return '';
            }
        },

        createRules: function (f) {
            return f.rules == null ? [] : f.rules.map(function (r) {
                return {
                    input: '[data-form="{0}"] [name="{1}"]'.replace('{0}', this.options.uuid).replace('{1}', f.id),
                    message: '{1}'.replace('{1}', r.message),
                    action: '{2}'.replace('{2}', r.action),
                    rule: '{3}'.replace('{3}', r.name)
                };
            }.bind(this));
        },

        resetFields: function () {
            // TODO : make it available for every fields
            this.elem.find('input').val('');
        },

        onChange: function (ev, val, field) {
            if (this.currentlySettingFilter) {
                //do not send filterChanged for each field (#7431)
                return;
            }
            if (!this.elem.jqxValidator('validate')) {
                return;
            }
            if (val || val !== null && val !== '' && val.length)
            {
                this.filters[field] = val;
            } else {
                delete this.filters[field];
            }
            this.onChange_();
            this.reloadFields(field, this.filters);
            var domElem = $(ev.currentTarget).find('[data-form-field="{0}"]'.replace('{0}', field));
            this.elem.trigger("actionFilterChanged", [field, domElem.getFmkFieldText(), (val && val.length), false, function () {
               domElem.setFmkFieldValue('');
            }]);
        },
        onChange_: function() {
            var values = this.filters;
            this.handleDependency(values);
            this.options.filterChanged && this.options.filterChanged(values);
            this.elem.trigger("filterChanged", values);
        },

        getDependentValues: function (f) {
            var res = {};
            if (f.dependency && this.options.contract.data.fields) {
                for (var i = 0; i < f.dependency.length; i++) {
                    var dep = f.dependency[i];
                    var depFieldDesc = this.options.contract.data.fields.filter(function (f_) {
                        return f_.id == dep;
                    })[0];
                    res[dep] = this.getFieldValue(depFieldDesc);
                }
            }
            return res;
        },

        handleDependency: function (values) {
            var contractFields = this.options.contract.data.fields,
                dependentFieldsDesc = contractFields.filter(function (f) {
                return f.dependency && f.dependency.length > 0;
            });
            dependentFieldsDesc.forEach(function (field) {
                var bool = true;
                field.dependency.forEach(function(parentId) {
                    if (!(values && values.hasOwnProperty(parentId) && values[parentId])) {
                        bool = false;
                    }
                });
                var domElement = this.elem.find('[data-form-field="{0}"]'.replace('{0}', field.id));
                if (bool) {
                    domElement.show();
                } else {
                    domElement.hide();
                    domElement.setFmkFieldValue(''); // TODO : make it available for every fields
                }
            }.bind(this));
        },

        setFilters: function (values) {
            this.currentlySettingFilter = true;
            //this.resetFields();
            this.filters = $.extend(true, this.filters, values);
            for (var v in this.filters) {
                var domElem = this.elem.find('[data-form-field="{0}"]'.replace('{0}', v));
                if (values.hasOwnProperty(v) && domElem.length > 0) {
                    domElem.one('fieldready', this.onTextReady.bind(this, domElem));
                    domElem.setFmkFieldValue(values[v]);
                    this.filters[v] = domElem.getFmkFieldValue(); // cause field can format its data (ex: string to Array<string>)
                }
            }
            this.currentlySettingFilter = false;
            //as we have prevented the onChange callback, ensure we at least send it once
            this.onChange_();
        },

        onTextReady: function (ev) {
            var domElem = $(ev.selector);
            var hasValue = domElem.getFmkFieldValue() && domElem.getFmkFieldValue().length != 0 && domElem.getFmkFieldText().length != 0;
            var field = domElem.attr('data-form-field');
            this.elem.trigger("actionFilterChanged", [field, domElem.getFmkFieldText(), hasValue, false, function () {
                domElem.setFmkFieldValue('');
            }.bind(this)]);            
        },

        getValues: function () {
            return $.extend(true, {}, this.filters);
        },

        disable: function () {
            if (this.enabled) {
                this.enabled = false;
                this.elem.prepend('<div class="fmk-full-overdiv"><div class="fmk-loading-black" style="width:100%; height:100%;" /></div>');
            }
        },

        enable: function() {
            this.enabled = true;
            this.elem.find('.fmk-full-overdiv').remove();
        }
    });

    $.widgetFactory.registerForType('filter', 'fmkFilter');

})(jQuery, Fmk.Utils);