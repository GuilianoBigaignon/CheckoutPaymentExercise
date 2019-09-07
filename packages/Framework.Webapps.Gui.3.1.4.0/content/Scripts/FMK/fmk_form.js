/* =============================================================================
 * Form Widget
 * =============================================================================
 * Update an entity
 * Expected options :
 * ============================================================================ */
(function ($, utils, i18n) {

    $.widget('fmkForm', {
        _init: function () {
            this.inAction = false;
            this.options.uuid = utils.generateUUID();
            this.notReadyFields = this.options.contract.data.fields.map(function (d) { return d.id; });
            this.notGeneratedFields = {};
            this.selfReady = false;
            this.elem.on('fieldready', this.onFieldsReady.bind(this));
            if (this.options.contract.rels && this.options.contract.rels.indexOf('getDefault') >= 0) {
                var resLink = this.options.contract.getResourceLinkFromRel(this.options.contract.rels[this.options.contract.rels.indexOf('getDefault')]);
                $.ajax({ type: "json", url: resLink.href, method: resLink.method }).done(this.loadDefault.bind(this));
            }
            else{
                this.loadDefault(null);
            }
        },
        getPrefixedName: function(name) {
            return '{0}---{1}'
                .replace('{0}', this.options.uuid)
                .replace('{1}', name);
        },

        loadDefault:function(res){
            this.options.defaultValue = res;
            this.elem.addClass('fmk-form');
            this.elem.attr('data-form', this.options.uuid);
            this.elem.attr('data-contract', this.options.contract.data.name);
            var cter = $('<fieldset></fieldset>')
                .prependTo(this.elem);
            this.createForm(cter);
            if (!this.options.inner) {
                var buttonsbar = $('<div class="fmk-actionBar bar-inline bar-inline--grey fmk-form-buttons" >').prependTo(this.elem);
                var title = '<p class="bar-inline__item title title--white title--medium title--light">{0}</p>'.replace('{0}', this.options.contract.data.label);
                $('<div class="bar-inline__left">' + title + '</div><div class="bar-inline__right"></div>').prependTo(buttonsbar);
                this.createButtons($(buttonsbar).find('.bar-inline__right'));
            }

            this.selfReady = true;
            if (!this.notReadyFields.length)
                this.onReady();
        },

        onFieldsReady: function (event, element) {
            var fieldId = $(element).attr('data-form-field') || element;
            this.notReadyFields = this.notReadyFields.filter(function (el) { return el != fieldId; });
            for (var toGenerateId in this.notGeneratedFields) {
                if (this.notGeneratedFields.hasOwnProperty(toGenerateId)) {
                    var canCreate = true;
                    var contract = this.options.contract.data.fields.filter(function (d) { return d.id == toGenerateId; })[0];
                    if (contract.dependencies) {
                        contract.dependencies.forEach(function (d) {
                            canCreate &= this.notReadyFields.indexOf(d) < 0;
                        }.bind(this));
                    }
                    if (canCreate) {
                        var dom = this.notGeneratedFields[toGenerateId];
                        delete this.notGeneratedFields[toGenerateId];
                        this.generateField(dom, contract);
                    }
                }
            }
            if (!this.notReadyFields.length && this.selfReady)
                this.onReady();
        },

        onReady: function () {
            this.handleDependency(this.getValues());
            this.options.ready && this.options.ready();
            this.elem.trigger("ready");

            //Set scroll on form
            var fieldset = this.elem.find('fieldset');
            var top = fieldset.offset().top;

            if (top + 70 > $(window).height())
                top = 0; //Min 70px for fieldset

            fieldset.first().css({ 'max-height': 'calc(100vh - ' + top + 'px)', 'overflow-y': 'auto' });
        },

        createForm: function (cter) {
            if (!this.options.noSplit && !this.options.contract.data.noSplit) {
                $('<div class="fmk-l-pull-left fmk-form-col fmk-form-col--side-by-side fmk-split-col-0" />').appendTo(cter);
                $('<div class="fmk-l-pull-right fmk-form-col fmk-form-col--side-by-side fmk-split-col-1" />').appendTo(cter);
            }
            var indexNoHidden = 0;
            var arrayCount = this.options.contract.data.fields.filter(function (f) { return f.type != 'HiddenField' && f.type != 'CriteriaField' && f.type != 'ClipboardField' && ! f.fieldsetId }).length;
            this.options.contract.data.fields.forEach(function(f) {
                var field = this.createFieldCter(f);
                var fieldsetCter, splitCter;
                if (!this.options.noSplit && !this.options.contract.data.noSplit) {                    
                    if (f.fieldsetId) {
                        fieldsetCter = cter.find('#' + this.getPrefixedName(f.fieldsetId));
                    } else {
                        splitCter = cter.find('.fmk-split-col-{0}'.replace('{0}', Math.floor(indexNoHidden / Math.ceil(arrayCount / 2))));
                    }

                    if (!field.hasClass('fmk-field-hidden') && !f.fieldsetId) {
                        indexNoHidden++;
                        //Move hidden field to parent because it causes bug in column layouts
                        field.appendTo(splitCter);
                    }
                    else if (!field.hasClass('fmk-field-hidden') && f.fieldsetId) {
                        field.appendTo(fieldsetCter);
                    }
                    else {
                        field.appendTo(cter);
                    }
                    
                } else {
                    fieldsetCter = f.fieldsetId ? cter.find('#' + this.getPrefixedName(f.fieldsetId)) : cter;
                    field.appendTo(fieldsetCter);
                }
                if (!(f.dependencies && f.dependencies.length > 0)) {
                    this.generateField(field, f);
                } else {
                    this.notGeneratedFields[f.id] = field;
                }
            }.bind(this));

            var rules = this.options.contract.data.fields.map(this.createRules.bind(this));
            this.elem.jqxValidator({ rules: [].concat.apply([], rules), hintType: 'label', focus: false });
            this.elem.on('valueChanged', function (e, newValue, changedFieldId) {
                var values = this.getValues();
                this.handleDependency(values);
                this.reloadFields(changedFieldId, values);
                this.elem.jqxValidator('validate');
            }.bind(this));

            var fieldsets = this.options.contract.data.fields.filter(function(f) { return f.type == "Fieldset" });    
            fieldsets.forEach(function (fieldset) {
                var fieldsetFieldNumber = 0;
                this.options.contract.data.fields.forEach(function (f) {
                    if (f.fieldsetId == fieldset.id) {
                        if (fieldset.split) {
                            var fieldsetElem = cter.find('[data-form-field="{0}"]'.replace('{0}', fieldset.id));
                            var fieldElem = fieldsetElem.find('[data-form-parent="{0}"][data-form-field="{1}"]'.replace('{0}', this.options.uuid).replace('{1}', f.id));
                            if (!fieldElem.hasClass('fmk-field-hidden')) {
                                fieldElem.appendTo(fieldsetElem.find('.fmk-split-col-{0}'.replace('{0}', fieldsetFieldNumber % 2)));
                                fieldsetFieldNumber++;
                            }
                        }
                        
                    }
                }.bind(this));
            }.bind(this));
        },

        generateField: function(ctr, contract) {
            ctr.buildField(contract, {
                value: this.getFieldValue(contract),
                prefixedName: this.getPrefixedName(contract.id),
                parent: this.elem,
                otherValuesFunc: this.getValues.bind(this),
                dependencies: this.getDependentValues(contract),
                contracts: this.options.contracts
            });
        },

        createFieldCter: function(f) {
            if (f.type === 'Fieldset') {
                return $('<div />');
            }
            var field = '<div data-form-field="{0}" data-form-parent="{3}" class="form-field fmk-form-col__item {1}"><div class="fmk-form-col__item__label"><label style="vertical-align:top;">{2} : </label></div></div>'
                .replace('{0}', f.id)
                .replace('{1}', f.type == 'HiddenField' || f.type == 'CriteriaField' || f.type == 'ClipboardField' ? 'fmk-field-hidden' : '')
                .replace('{2}', f.label)
                .replace('{3}', this.options.uuid);
            return $(field);
        },

        reloadFields: function(changedFieldId, values) {
            this.options.contract.data.fields.forEach(function (f) {
                if (f.type !== 'Fieldset') {
                    this.elem.find(this.getFieldSelector(f)).reloadFmkField(changedFieldId, values);
                }
            }.bind(this));
        },

        handleDependency: function (values) {
            var contractFields = this.options.contract.data.fields,
                dependentFieldsDesc = contractFields.filter(function (f) {
                    return f.dependency && f.dependency.length > 0;
                });
            dependentFieldsDesc.forEach(function (field) {
                var bool = true;
                field.dependency.forEach(function (parentId) {
                    if (!(values && values.hasOwnProperty(parentId) && values[parentId])) {
                        bool = false;
                    }
                });
                var domElement = this.elem.find(this.getFieldSelector(field));
                if (bool) {
                    if (!this.options.showAsGrid)
                        domElement.show();
                    else
                        domElement.css('visibility', 'visible');
                } else {
                    if (!this.options.showAsGrid)
                        domElement.hide();
                    else
                        domElement.css('visibility', 'hidden');
                    domElement.setFmkFieldValue(''); // TODO : make it available for every fields
                }
            }.bind(this));
        },

        getFieldValue: function (f) {          
            if (this.options.entity && this.options.entity.data && f.mapping && f.mapping[0] === '$') {
                var v = jsonPath(this.options.entity.data, f.mapping, { resultType: "VALUE" });
                if (f.mapping.indexOf("[:]") < 0) {
                    //when the json path is NOT dereferencing an array, we need to keep only the first result
                    return v[0];
                }
                return v;
            }
            if (this.options.entity && this.options.entity.data && this.options.entity.data.hasOwnProperty(f.mapping)) {
                return this.options.entity.data[f.mapping];
            }
            if (this.options.defaultValue && this.options.defaultValue[f.mapping]) {
                return this.options.defaultValue[f.mapping];
            } if (window.Contracts && window.Contracts.GLOBALS[f.id]) {
                return window.Contracts.GLOBALS[f.id];
            } else {
                return '';
            }
        },

        getDependentValues: function (f) {
            var res = {};
            if (f.dependency) {
                for (var i = 0; i < f.dependency.length; i++) {
                    var dep = f.dependency[i];
                    var depFieldDesc = this.options.contract.data.fields.filter(function(f_) {
                        return f_.id == dep;
                    })[0];
                    res[dep] = this.getFieldValue(depFieldDesc);
                }
            }
            return res;
        },

        createRules: function(f) {
            return f.rules == null ? [] : f.rules.map(function (r) {
                var selector = this.getFieldSelector(f);
                var rule = {
                    input: selector,
                    message: r.message,
                    action: 'dummy',
                    rule: function() {
                        return $(selector).validateFmkField(r.name);
                    },
                    hintRender: function (msg, field) {
                        var hint = $('<label class="fmk-field-error-label" />');
                        hint.html(msg);
                        hint.appendTo($(field));
                        hint.on('click', function() {
                            $(this).remove();
                        });
                        return hint;
                    }
                };
                if (r.name === 'validateObject') {
                    rule.hintRender = function() {
                        return '';
                    };
                    rule.message = '';
                }
                return rule;
            }.bind(this));
        },

        createButtons: function (container) {
            this.submitBtn = $('<button class="fmk-form-cancel fmk-bar-inline__item fmk-btn fmk-btn--text fmk-btn--text--icon fmk-btn--green fmk-btn--icon-cross-big-white"><span class="fmk-btn__inner">{0}</span></button>'
                .replace('{0}', i18n._('Fmk_Form_Cancel', 'Resources', 'WEBAPPS.GUI')))
                .prependTo(container)
                .bind('click', this.cancel.bind(this));

            this.cancelBtn = $('<button class="fmk-form-submit fmk-bar-inline__item fmk-btn fmk-btn--text fmk-btn--text--icon fmk-btn--green fmk-btn--icon-valid-medium-white"><span class="fmk-btn__inner">{0}</span></button>'
                .replace('{0}', i18n._('Fmk_Form_Submit', 'Resources', 'WEBAPPS.GUI')))
                .prependTo(container)
                .on('click', this.submit.bind(this));
        },

        getFieldSelector: function (field) {
            return '[data-form-parent="{0}"][data-form-field="{1}"]'.replace('{0}', this.options.uuid).replace('{1}', field.id);
        },

        validate: function () {
            // Have to validate inner forms as well
            var valid = true;
            this.options.contract.data.fields.forEach(function (field) {
                if (field.type === 'InnerForm') {
                    var selector = this.getFieldSelector(field);
                    if (!$(selector).validateFmkField()) {
                        valid = false;
                    }
                }
            }.bind(this));
            return this.elem.jqxValidator('validate') && valid;
        },

        submit: function () {
            if (this.inAction) {
                return;
            };

            if (!this.validate()) {
                return;
            }

            this.setActionState(true);

            this.options.valid && this.options.valid.call(null);
            this.elem.trigger("valid");

            this.removeAlert();

            if (this.options.contract.data.binaryFieldNames && this.options.contract.data.binaryFieldNames.length > 0)
            {
                //multipart/form-data
                var formData = new FormData();
                var formValues = this.getValues();
                //Files
                this.options.contract.data.binaryFieldNames.forEach(function (binaryFieldName) {
                    var field = this.options.contract.data.fields.filter(function (f) { return f.id === binaryFieldName; })[0];
                    var fields = this.elem.find(this.getFieldSelector(field) + ' input[type="file"]');
                    for (var i = 0; i < fields.length; i++)
                    {
                        for (var j = 0; j < fields[i].files.length; j++)
                        {
                            var file = fields[i].files[j];
                            formData.append(binaryFieldName + '_' + j, file );
                        }
                    }
                    //delete property if binaryfield
                    delete formValues[binaryFieldName];
                }.bind(this));
                //Form objects
                formData.append('_data_', JSON.stringify(formValues));


                //POST
                $.ajax(this.options.actionLink.href, {
                    data: formData,
                    type: this.options.actionLink.method,
                    contentType: false,
                    processData: false
                })
                .done(this.onSubmitSuccess.bind(this))
                .fail(this.onSubmitFail.bind(this));
            }
            else
            {
                //POST
                $.ajax(this.options.actionLink.href, {
                    data: JSON.stringify(this.getValues()),
                    contentType: 'text/json',
                    type: this.options.actionLink.method
                })
                .done(this.onSubmitSuccess.bind(this))
                .fail(this.onSubmitFail.bind(this));
            }

        },

        onSubmitFail: function (jqXhr) {
            this.setActionState(false);
            if (jqXhr.status == 412 || jqXhr.status == 403) {
                //do nothing, this will be handled by fmk_auth
                return;
            }
            if (jqXhr.status == 500) {
                //this is an unexpected error => display a generic message
                this.options.fatalError && this.options.fatalError.call(null, jqXhr);
                this.elem.trigger("fatalerror", [jqXhr]);
                this.displayAlert(i18n._('Fmk_Form_Error500', 'Resources', 'WEBAPPS.GUI') + this.formatException(jqXhr.responseText));
                return;
            }
            //this is a business error => display the message coming from the server
            this.options.error && this.options.error.call(null, JSON.parse(jqXhr.responseText));
            this.elem.trigger("error", [JSON.parse(jqXhr.responseText)]);
            this.displayAlert(JSON.parse(jqXhr.responseText).exceptionMessage);            
        },
        formatException: function(res) {
            var err = JSON.parse(res);
            if (err && err.exceptionMessage) {
                return '<br/>' + '<pre style="padding-left: 100px">' + err.exceptionMessage + '</pre>';
            }
            return '';
        },
        onSubmitSuccess: function (data) {
            this.options.success && this.options.success.call(null, data);
            this.elem.trigger("success", [data]);
            this.setActionState(false);
        },
        getValues: function() {
            var res = {};
            this.options.contract.data.fields.forEach(function (f) {
                if (f.type !== 'Fieldset') {
                    if (this.notGeneratedFields[f.id]) {
                        if (this.options.entity) {
                            var v = this.options.entity.data[f.mapping];
                            if (v) {
                                res[f.id] = v;
                            }
                        }
                    } else {
                        var v = this.elem.find(this.getFieldSelector(f)).getFmkFieldValue();
                        if (v) {
                            res[f.id] = v;
                        }
                    }
                }
            }.bind(this));
            return res;
        },

        cancel: function () {
            if (!this.inAction) {
                this.setActionState(true);
                this.elem.jqxValidator('hide');
                this.options.cancel && this.options.cancel.call();
                this.elem.trigger("cancel", []);
                this.setActionState(false);
            }
        },

        setActionState: function (isInAction) {
            this.inAction = isInAction;
            console.log("Action : " + (isInAction ? "true" : "false"));
            if (isInAction) {
                this.elem.addClass('fmk-form-inAction');
            } else {
                this.elem.removeClass('fmk-form-inAction');
            }
        },

        displayAlert: function (message) {
            $('<div class="alert alert-danger" role="alert">'
            + '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'
            + '<span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true">&nbsp;</span>'
            + '<span class="sr-only">Error</span>'
            + message + '</div>').prependTo(this.elem.find('fieldset').first());
        },

        removeAlert: function(){
            this.elem.find('fieldset:first div[role="alert"]').remove();
        }

    });

    $.widgetFactory.registerForType('form', 'fmkForm');

})(jQuery, Fmk.Utils, Fmk.I18n);