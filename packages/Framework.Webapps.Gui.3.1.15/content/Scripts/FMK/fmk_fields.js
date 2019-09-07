/* =============================================================================
 * Field Widgets
 * =============================================================================
 * Create field controls
 * Expected options :
 * ============================================================================ */


/* =============================================================================
 * Upload File Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkUploadFileField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input"><div class="fmk-input-group fmk-input-group--full"></div></div>').appendTo(this.elem);
            $('<p class="fmk-input-group__addon-right fmk-input-group__addon-right--upload"><span class="fmk-field-upload-file-name">{0}</span></p><button class="fmk-input-group__addon-right__btn fmk-btn fmk-btn--icon-upload-medium-purple"></button>'
                .replace('{0}', fmkField_translate('Fmk_upload_select_file')))
                .appendTo(this.options.inputCtr.find('.fmk-input-group'));
            this.elem.addClass('fmk-field-upload');
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            var html = '<input name="{0}" type="file" {1} {2} class="fmk-field-upload-input fmk-input-group__elem fmk-input-group--full__elem fmk-input fmk-input--file fmk-input--big"/>'
                .replace('{0}', this.options.prefixedName)
                .replace('{1}', (this.options.fieldDesc.accept && this.options.fieldDesc.accept != '') ? 'accept="' + this.options.fieldDesc.accept + '"' : '')
                .replace('{2}', this.options.fieldDesc.multiple ? 'multiple' : '');
            this.options.field = $(html);
            this.options.field.on('change', this.onChange.bind(this));
            if (this.options.value && this.options.value.url) {
                this.displayOldValue();
            }
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            var valT = this.getValue() !== '' ? this.getValue().split("\\").pop() : fmkField_translate('Fmk_upload_select_file');
            this.elem.find('.fmk-field-upload-file-name').html(valT);
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
            this.elem.find('.fmk-field-upload-link').remove();
        },
        displayOldValue: function() {
            $('<a class="fmk-field-upload-link" href="{0}" target="_blank">{1}</a>'
                    .replace('{0}', this.options.value.url)
                    .replace('{1}', this.options.value.name || this.options.value.fileName))
                .appendTo(this.elem);
        },
        getValue: function () {
            return this.options.field.val();
        },
        getText: function () {
            return this.getValue();
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.options.field.val();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            return true;
        }
    });

    $.fieldFactory.register('FileField', 'fmkUploadFileField');

})(jQuery);

/* =============================================================================
 * Async Upload File Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkAsyncUploadFileField', {
        _init: function() {
            this.files = [];
            this.elem.addClass('fmk-field-upload fmk-field-async-upload');
            this.options.inputCtr = $('<div class="fmk-form-col__item__input"><div class="fmk-input-group fmk-input-group--full"></div></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            if (Array.isArray(this.options.value)) {
                this.options.value.forEach(function (v) {
                    this.files.push(v);
                    this.options.inputCtr.find('.fmk-input-group').append(this.createInputFile(v));
                }.bind(this));
                this.options.inputCtr.find('.fmk-input-group').append(this.createInputFile()); // A void one
            } else {
                if (this.options.value) {
                    this.files.push(this.options.value);
                }
                this.options.inputCtr.find('.fmk-input-group').append(this.createInputFile(this.options.value));
            }
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        createInputFile: function(value) {
            var div = $('<div class="fmk-field-async-upload-file" />')
                .append($('<p class="fmk-upload-input fmk-input-group__addon-right fmk-input-group__addon-right--upload"><span class="fmk-field-upload-file-name">{0}</span><a target="_blank" class="fmk-field-upload-link" style="display:none;" /></p> <button class="fmk-field-upload-choose fmk-input-group__addon-right__btn fmk-btn fmk-btn--icon-upload-medium-purple"></button><button class="fmk-field-upload-delete fmk-btn fmk-input-group__addon-right__btn fmk-btn--icon-cross-medium-purple fmk-btn--icon-cross-medium-purple--hover" style="display:none" />'
                    .replace('{0}', fmkField_translate('Fmk_upload_select_file'))))
                .append('<input  type="file" {1} {2} class=" fmk-field-upload-input fmk-input-group__elem fmk-input-group--full__elem fmk-input fmk-input--file fmk-input--big"/>'
                    .replace('{1}', (this.options.fieldDesc.accept && this.options.fieldDesc.accept != '') ? 'accept="' + this.options.fieldDesc.accept + '"' : '')
                    .replace('{2}', this.options.fieldDesc.multiple ? 'multiple' : ''))
                .append('<progress class="fmk-field-upload-progress" style="display:none;"/>');
                //.append('<a target="_blank" class="fmk-field-upload-link" style="display:none;" />')
                //.append('<button class="fmk-field-upload-delete fmk-btn fmk-btn--icon-removepoint-medium-purple fmk-btn--icon-removepoint-medium-white--hover" style="display:none" />');
            div.on('click', '.fmk-field-upload-delete', this.removeFile.bind(this));
            div.on('change', this.uploadAsync.bind(this));
            if (value) {
                this.setValueForField(div, value);
            }
            return div;
        },
        setValueForField: function (field, value) {
            if (value) {
                var $field = $(field);
                $field.find('.fmk-field-upload-file-name').hide();
                $field.find('.fmk-field-upload-input').hide();
                $field.find('.fmk-field-upload-progress').hide();
                $field.find('.fmk-field-upload-choose').hide();
                $field.find('.fmk-field-upload-delete')
                    .data('fileId', value.fileId).show();
                $field.find('.fmk-field-upload-link').show()
                    .attr('href', value.url)
                    .html(value.name);
            }
        },
        uploadAsync: function (ev) {
            ev.preventDefault();
            this.isLoading = true;
            var field = ev.currentTarget,
                input = $(field).find('.fmk-field-upload-input')[0];
            if (input.files[0]) {
                var formData = new FormData();
                formData.append('uploadedFile_0', input.files[0]);
                //formData.append('_data_', '');
                $(input).hide();
                $(field).find('.fmk-field-async-upload-progress').show();
                $.ajax({
                    url: this.options.fieldDesc.url,  //Server script to process data
                    type: 'POST',
                    xhr: function () {  // Custom XMLHttpRequest
                        var myXhr = $.ajaxSettings.xhr();
                        if (myXhr.upload) { // Check if upload property exists
                            myXhr.upload.addEventListener('progress', function (e) {
                                this.progressHandlingFunction(e, input);
                            }.bind(this), false);
                        }
                        return myXhr;
                    }.bind(this),
                    //Ajax events
                    success: function (res) {
                        if (!this.options.fieldDesc.multiple) {
                            this.files = [];
                        }
                        this.files.push(res.data);
                        this.setValueForField(field, res.data);
                        if (this.options.fieldDesc.multiple) {
                            this.options.inputCtr.find('.fmk-input-group').append(this.createInputFile());
                        }
                        this.isLoading = false;
                        this.onChange();
                    }.bind(this),
                    error: function(res) {
                        console.error('Unable tu process upload file : ', res);
                        this.isLoading = false;
                    },
                    beforeSend: function() {
                        $(input).hide();
                        $(field).find('.fmk-field-async-upload-progress').show();
                    },
                    // Form data
                    data: formData,
                    //Options to tell jQuery not to process data or worry about content-type.
                    cache: false,
                    contentType: false,
                    processData: false
                });
            }
        },
        removeFile: function(ev) {
            var index = this.files.map(function (d) { return d.fileId; }).indexOf($(ev.currentTarget).data('fileId'));
            if (index > -1) {
                this.files.splice(index, 1);
                $(ev.currentTarget).closest('.fmk-field-async-upload-file').remove();
            }
            if (this.elem.find('.fmk-field-async-upload-file').length < 1) {
                this.options.inputCtr.find('.fmk-input-group').append(this.createInputFile());
            }
        },
        progressHandlingFunction: function(e, field){
            if(e.lengthComputable){
                $(field).parent().find('progress').attr({ value: e.loaded, max: e.total });
            }
        },
        onChange: function () {
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            if (!this.options.fieldDesc.multiple) {
                return this.files[0] || '';
            }
            return this.files;
        },
        getText: function () {
            return this.getValue();
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            return true;
        }
    });

    $.fieldFactory.register('AsyncFileField', 'fmkAsyncUploadFileField');

})(jQuery);


/* =============================================================================
 * Textarea Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkTextareaField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<textarea name="{0}" class="fmk-field-textarea fmk-input--full"></textarea>'.replace('{0}', this.options.prefixedName)).jqxInput();
            this.options.field.jqxInput('val', this.options.value || '');
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        onChange: function(event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxInput('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function(value) {
            if (this.getValue() != value) {
                this.options.field.jqxInput('val', value || '');
            }            
        },
        reload: function() {},
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
        }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('TextareaField', 'fmkTextareaField');

})(jQuery);


/* =============================================================================
 * TranslatableArea Field Widget
 * ============================================================================ */
(function ($, utils) {

    $.widget('fmkTranslatableAreaField', {
        _init: function () {
            this.elem.addClass("fmk-translatable-area");
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            var languages = [];
            var htmlList = [];
            var activeLang;
            var url = this.options.fieldDesc.url;

            $.getJSON(url).done(function (res) {
                languages = res.data.supportedCultures.split(',');
                this.options.fields = {};
                activeLang = this.getActiveLang(languages);
                languages.forEach(function (language) {
                    this.addField(language);
                    this.addHtmlListLine(htmlList, language);
                }.bind(this));
                this.options.fields[activeLang].show();
                this.options.selector = this.addSelector(htmlList, languages, languages.indexOf(activeLang));

                this.elem.trigger('fieldready', this.elem);
                return this.elem;
            }.bind(this));
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            var dictionnary = {};
            for (var key in this.options.fields) {
                dictionnary[key] = this.options.fields[key].jqxInput('val');
            }
            return dictionnary;
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            for (var key in value) {
                if (this.options.fields.hasOwnProperty(key)) {
                    this.options.fields[key].jqxInput('val', value[key] || '');
                }
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        },
        onSelectRequest: function (value, languages) {
            this.options.selectLang && this.options.selectLang(value);
            if (this.options.fields.hasOwnProperty(value)) {
                languages.forEach(function (language) {
                    this.options.fields[language].hide();
                }.bind(this));
                this.options.fields[value].show();
            }
            this.elem.trigger("selectLang", [value]);
        },
        getActiveLang: function (languages) {
            var activeLang = utils.getCookie("Culture");
            if (activeLang === "") {
                // if there is no culture in cookie, return the first language supported
                return languages[0];
            }
            var found = languages.find(function (element) {
                return element === activeLang;
            });
            if (found === undefined) {
                // if the culture in cookie is not a supported language, return the first language supported
                return languages[0];
            }
            // else the culture in cookie is valid, return it
            return activeLang;
        },
        addHtmlListLine: function (htmlList, language) {
            htmlList.push({
                html: '<div class="fmk-language-selector-container"><span class="fmk-language-selector-label">{0}</span></div>'
                    .replace('{0}', language),
                title: language,
                label: language,
                value: language

            });
        },
        addField: function (language) {
            this.options.fields[language] = $('<textarea name="{0}" class="fmk-field-translatable-area fmk-field-text fmk-input--full" type="text"></textarea>'.replace('{0}', language)).jqxInput();
            if (this.options.value && this.options.value.hasOwnProperty(language)) {
                this.options.fields[language].jqxInput('val', this.options.value[language] || '');
            } else {
                this.options.fields[language].jqxInput('val', '');
            }
            this.options.fields[language].on('change', this.onChange.bind(this));
            this.options.fields[language].hide();
            this.options.inputCtr.find('.fmk-input-group').append(this.options.fields[language]);

        },
        addSelector: function (htmlList, languages, currentIndex) {
            var maxWidth = this.findMaxWidth(languages);
            var selector = $('<div class="fmk-translatable-area-selector">').jqxDropDownList({
                source: htmlList,
                selectedIndex: currentIndex,
                autoDropDownHeight: true,
                width: maxWidth * 13,
                enableBrowserBoundsDetection: true
            }).on('select', function (event) {
                event.preventDefault();
                this.onSelectRequest(event.args.item.value, languages);
            }.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(selector);
            return selector;
        },
        findMaxWidth: function (languages) {
            var maxWidth = -1;
            languages.forEach(function (language) {
                if (language.length > maxWidth)
                    maxWidth = language.length;
            });
            return maxWidth;
        }
    });

    $.fieldFactory.register('TranslatableAreaField', 'fmkTranslatableAreaField');

})(jQuery, Fmk.Utils);


/* =============================================================================
 * Password Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkPasswordField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input name="{0}" type="password" class="fmk-field-text fmk-input--full" />'.replace('{0}', this.options.prefixedName)).jqxInput();
            this.options.field.jqxPasswordInput();
            this.options.field.jqxPasswordInput('val', this.options.value || '');
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxPasswordInput('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxPasswordInput('val', value || '');
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            if (rule && rule.name == "minLength") {
                return typeof (v) === 'undefined' || v === '' || v.length >= rule.arg;
            }
            if (rule && rule.name == "maxLength") {
                return typeof (v) === 'undefined' || v === '' || v.length <= rule.arg;
            }
            if (rule && rule.name == "regularExpression") {
                return typeof (v) === 'undefined' || v === '' || new RegExp(rule.arg, 'gi').test(v);
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('PasswordField', 'fmkPasswordField');

})(jQuery);

/* =============================================================================
 * Text Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkTextField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input name="{0}" type="text" class="fmk-field-text fmk-input--full" />'.replace('{0}', this.options.prefixedName)).jqxInput();
            this.options.field.jqxInput('val', this.options.value || '');
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            this.options.field
                .on('focusin', function () { this.options.inputCtr.addClass('hovered'); }.bind(this))
                .on('focusout', function () { this.options.inputCtr.removeClass('hovered'); }.bind(this));
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxInput('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxInput('val', value || '');
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            if (rule && rule.name == 'emailAddress') {
                //cf jqxvalidator.js line 591
                return typeof (v) === 'undefined' || v === '' || /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            }
            if (rule && rule.name == "minLength") {
                return typeof (v) === 'undefined' || v === '' || v.length >= rule.arg;
            }
            if (rule && rule.name == "maxLength") {
                return typeof (v) === 'undefined' || v === '' || v.length <= rule.arg;
            }
            if (rule && rule.name == "regularExpression") {
                return typeof (v) === 'undefined' || v === '' || new RegExp(rule.arg, 'gi').test(v);
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('TextField', 'fmkTextField');

})(jQuery);


/* =============================================================================
 * Hidden Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkHiddenField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input name="{0}" type="hidden" class="fmk-field-hidden" />'.replace('{0}', this.options.prefixedName)).jqxInput();
            this.options.field.jqxInput('val', this.options.value || '');
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready',this.elem);
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxInput('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxInput('val', value || '');
            }
        },
        reload: function () { },
        validate: function () {
            //no validation because we can not display the error hint
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('HiddenField', 'fmkHiddenField');

})(jQuery);


/* =============================================================================
 * Int Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkIntField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input class="fmk-field-text fmk-input--full"/>').attr({ name: this.options.prefixedName, value: this.options.value, type: 'text' }).jqxInput({ maxLength: 11});
            this.options.field.on('keypress', this.onKeypress.bind(this));
            this.options.field.on('focusout', this.onFocusout.bind(this));
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            this.options.field
                .on('focusin', function () { this.options.inputCtr.addClass('hovered'); }.bind(this))
                .on('focusout', function () { this.options.inputCtr.removeClass('hovered'); }.bind(this));
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        onKeypress: function (event) {
            var charCode = (event.which) ? event.which : event.keyCode;
            if (charCode == 45 && this.getValue().indexOf('-') != -1)
                return false;

            if (charCode != 45 && charCode != 13 && (charCode < 48 || charCode > 57))
                return false;

            return true;
        },
        onFocusout: function () {
            var value = parseInt(this.getValue());
            if (isNaN(value))
                value = null;
            this.options.field.val(value);
        },
        getValue: function () {
            return this.options.field.val();
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.val(value);
            }
        },
        reload: function () { },
        validate: function (ruleName, args) {
            var v = this.getValue();
            var vParsed = parseInt(v);

            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name === 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            if (rule && rule.name === 'range') {
                return typeof (v) === 'undefined' || isNaN(vParsed) || (vParsed >= parseInt(args[0]) && vParsed <= parseInt(args[1]));
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('IntField', 'fmkIntField');

})(jQuery);


/* =============================================================================
 * Float Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkFloatField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input class="fmk-field-text fmk-input--full"/>').attr({ name: this.options.prefixedName, value: this.options.value, type: 'text' }).jqxInput();
            this.options.field.on('keypress', this.onKeypress.bind(this));
            this.options.field.on('focusout', this.onFocusout.bind(this));
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            this.options.field
                .on('focusin', function () { this.options.inputCtr.addClass('hovered'); }.bind(this))
                .on('focusout', function () { this.options.inputCtr.removeClass('hovered'); }.bind(this));
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        onKeypress: function (event) {
            var charCode = (event.which) ? event.which : event.keyCode;

            if (charCode == 45 && this.getValue().indexOf('-') != -1)
                return false;
            if (charCode == 46 && this.getValue().indexOf('.') != -1)
                return false;

            if (charCode != 45 && charCode != 46 && charCode != 13 && (charCode < 48 || charCode > 57))
                return false;

            return true;
        },
        onFocusout: function () {
            var value = parseFloat(this.getValue()), mult = 1;

            var decimalDigits = this.options.fieldDesc.decimalDigits;
            if (decimalDigits) {
                mult = Math.pow(10, decimalDigits);
                value = value * mult;
            }
            value = Math.round(value);
            if (isNaN(value))
                value = null;

            if (decimalDigits && value != null)
                value = value / mult;

            this.options.field.val(value);

        },
        getValue: function () {
            return this.options.field.val();
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.val(value);
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
        }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('FloatField', 'fmkFloatField');

})(jQuery);


/* =============================================================================
 * Checkbox Field Widget
 * ============================================================================ */
(function ($, tplEngine) {

    $.widget('fmkCheckboxField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input fmk-form-col__item__label--checkbox" />').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.cter = $('<div/>').appendTo(this.options.inputCtr);
            this.dependencies = this.dependencies || this.options.dependencies;
            if (this.options.fieldDesc.local) {
                this.buildLocal(this.options.fieldDesc.local.values, this.options.value);
                this.elem.trigger('fieldready',this.elem);
            }
            else if (this.options.fieldDesc.remote) {
                var hasInvalidDependencies = this.options.fieldDesc.dependency
                    && this.options.fieldDesc.dependency
                        .map(function (dep) { return this.dependencies && this.dependencies[dep] }.bind(this))
                        .filter(function (depValue) { return !depValue })
                        .length > 0;
                if (!hasInvalidDependencies) {
                    this.buildRemote();
                } else {
                    this.elem.trigger('fieldready', this.elem);
                }
            } else {
                this.cter.empty();
                this.options.field = $('<div name="{0}" />'.replace('{0}', this.options.prefixedName)).jqxCheckBox({ checked: this.options.value });
                this.options.field.on('change', this.onChange.bind(this));
                this.cter.append(this.options.field);
                this.elem.trigger('fieldready',this.elem);
            }
            if (this.options.fieldDesc.allowSearch) {
                this.buildSearchBox();
            }
            if (this.options.fieldDesc.allowCheckAll) {
                this.buildCheckallBox();
            }
                
            return this.elem;
        },

        buildLocal: function (values, selectedValues) {
            this.cter.empty();
            this.options.field = {};
            if(!this.options.fieldDesc.local)
                this.options.fieldDesc.local = {};
            this.options.fieldDesc.local.values = values;
            this.options.fieldDesc.local.values.forEach(function (item) {
                var field = $('<div name="{0}" class="fmk-field-checkbox">{1}</div>'.replace('{0}', this.options.prefixedName + '' + item.key).replace('{1}', item.value));
                this.cter.append(field);
                field.jqxCheckBox({ checked: this.isChecked(item.key, selectedValues) });
                field.on('change', this.onChange.bind(this));
                this.options.field[item.key] = field;
            }.bind(this));
        },

        applyDependency: function (dependency) {
            this.dependencies = $.extend(true, this.dependencies || {}, dependency);
            this.values = this.getValue();            
            this._init();
        },

        onChange: function (event) {
            if (! this.options.settingValue) {                           
                event && event.preventDefault();
                this.options.valueChanged && this.options.valueChanged.call(this.getValue());
                this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]); //need to wrap inside array to avoid that jQuery thinks each value is a separate argument (#7462)
            }
        },
        isChecked: function (v, possibleValue) {
            if (possibleValue && Array.isArray(possibleValue)) {
                return possibleValue.filter(function (e) { return e === v }).length > 0;
            } else {
                return possibleValue === v;
            }
        },
        getValue: function () {
            if (!this.options.fieldDesc.local && !this.options.fieldDesc.remote) {
                return this.options.field.jqxCheckBox('val');
            }
            if (this.options.fieldDesc.remote && this.loading) {
                //if remote data is not loaded, selected value has not been changed, so just return original value
                return this.options.value;
            }
            var result = [];
            for (var key in this.options.field) {
                if (this.options.field.hasOwnProperty(key)) {
                    if (this.options.field[key].jqxCheckBox('val')) {
                        result.push(key);
                    }
                }
            }
            return result;
        },
        getText: function () {
            var result = [];
            for (var key in this.options.field) {
                if (this.options.field.hasOwnProperty(key)) {
                    if (this.options.field[key].jqxCheckBox('val')) {
                        var text = this.options.field[key].text();
                        text && result.push(text);
                    }
                }
            }
            return result;
        },
        setValue: function (value) {
            if (this.options.fieldDesc.remote && this.loading) {
                if (!!value) {
                    throw ("Data is still loading.");
                }
            } else {
                if (this.options.fieldDesc.local || this.options.fieldDesc.remote) {
                    //here, this a checkbox "group", value MUST be an array
                    this.options.settingValue = true;
                    value = !!value ? value.map(function (v) { return v.toString() }) : [];
                    var atLeastOneValueChanged = false;
                    for (var key in this.options.field) {
                        if (this.options.field.hasOwnProperty(key)) {
                            var curCbxVal = this.options.field[key].jqxCheckBox('val');
                            var newCbxVal = this.isChecked(key.toString(), value);
                            if (curCbxVal != newCbxVal) {
                                this.options.field[key].jqxCheckBox('val', newCbxVal);
                                atLeastOneValueChanged = true;
                            }
                        }
                    }
                    this.options.settingValue = false;
                    if (atLeastOneValueChanged) {
                        this.onChange({ preventDefault: function () { } }); //See Bug #6952
                    }
                } else {
                    //here, this is a single checkbox, value MUST be a bool
                    value = !!value;
                    if (value != this.options.field.jqxCheckBox('val')) {
                        this.options.field.jqxCheckBox('val', value);
                    }
                }
            }
        },
        reload: function(changedField, formValues) {
            if (this.options.fieldDesc.remote) {
                if (this.options.fieldDesc.dependency && this.options.fieldDesc.dependency.indexOf(changedField) > -1) {
                    this.dependencies[changedField] = formValues[changedField];
                    this.buildRemote();
                }
            }
        },
        buildRemote: function () {
            this.loading = true;
            // Check if all dependencies are filled, url is null if not
            var url = fmkField_getRemoteUrl(this.options.fieldDesc.remote.href, this.options.fieldDesc.dependency, this.dependencies, tplEngine);
            if (url != null) {
                this.elem.prepend('<div class="fmk-full-overdiv"><div class="fmk-loading-black" style="width:100%; height:100%;" /></div>');
                $.getJSON(url).done(function (res) {
                        this.cter.empty();
                        var items = jsonPath(res, this.options.fieldDesc.remote.listPath, { resultType: "VALUE" })[0];
                        this.options.field = {};
                        items.forEach(function (item) {
                            item = jsonPath(item, this.options.fieldDesc.remote.memberPath, { resultType: "VALUE" })[0];
                            var key = item[this.options.fieldDesc.remote.valueMember];
                            var field = $('<div class="fmk-field-checkbox" name="{0}">{1}</div>'.replace('{0}', this.options.prefixedName + '' + key).replace('{1}', item[this.options.fieldDesc.remote.displayMember]));
                            this.cter.append(field);
                            field.jqxCheckBox({ checked: this.isChecked(key, this.values || this.options.value) });
                            field.on('change', this.onChange.bind(this));
                            this.options.field[key] = field;
                        }.bind(this));
                        this.loading = false;
                        this.elem.trigger('fieldready', this.elem);
                    }.bind(this))
                    .always(function () {
                        this.elem.find('.fmk-full-overdiv').remove();
                    }.bind(this));
            }
        },
        buildSearchBox: function() {
            $('<input type="text"/>')
                .appendTo(this.elem.find('.fmk-form-col__item__label'))
                .jqxInput({ placeHolder: fmkField_translate('Fmk_checkbox_search'), height: 23, width: 250 })
                .on('change', this.stopPropagation.bind(this)) //do not want that the change of text field buble up as change of field
                .on('keyup', this.onKeyUp.bind(this))
        },
        stopPropagation: function (ev) {
            ev.stopPropagation();
        },
        onKeyUp: function(ev) {
            var searchedText = ev.target.value;
            $.each(this.elem.find('.fmk-field-checkbox'), function (idx, cbox) {
                var text = $(cbox).text()
                var method = (text.toLowerCase().indexOf(searchedText.toLowerCase()) >= 0) ? 'show' : 'hide';
                $(cbox)[method]();
            })
        },
        buildCheckallBox: function () {
            var div = $('<div></div>').prependTo(this.elem.find('.fmk-form-col__item__input'));
            $('<span style="cursor:pointer">{0}</span>'.replace('{0}', fmkField_translate('Fmk_checkbox_checkall')))
                .appendTo(div)
                .on('click', this.checkAll.bind(this));
            $('<span style="cursor:pointer">&nbsp;&nbsp;&nbsp;{0}</span>'.replace('{0}', fmkField_translate('Fmk_checkbox_uncheckall')))
                .appendTo(div)
                .on('click', this.uncheckAll.bind(this));
        },
        checkAll: function (ev) {
            this.options.settingValue = true;
            $.each(this.elem.find('.fmk-field-checkbox'), function (idx, cbox) {
                if (cbox.style.display !== 'none') {
                    $(cbox).jqxCheckBox('check');
                }
            });
            this.options.settingValue = false;
            this.onChange();
        },
        uncheckAll: function (ev) {
            this.options.settingValue = true;
            $.each(this.elem.find('.fmk-field-checkbox'), function (idx, cbox) {
                if (cbox.style.display !== 'none') {
                    $(cbox).jqxCheckBox('uncheck');
                }
            });
            this.options.settingValue = false;
            this.onChange();
        },
        validate: function () {
            //no rule for checkbox            
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('CheckboxField', 'fmkCheckboxField');

})(jQuery, Mustache);


/* =============================================================================
 * Radio Field Widget
 * ============================================================================ */
(function ($, tplEngine) {

    $.widget('fmkRadioField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" />').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.dependencies = this.dependencies || this.options.dependencies;
            if (this.options.fieldDesc.local) {
                this.options.field = {};
                this.options.fieldDesc.local.values.forEach(function (item) {
                    var field = $('<div name="{0}" class="fmk-field-radio">{1}</div>'.replace('{0}', this.options.prefixedName + '' + item.key).replace('{1}', item.value));
                    this.options.inputCtr.append(field);
                    field.jqxRadioButton({ groupName: this.options.prefixedName, checked: this.options.value === item.key });
                    field.on('change', this.onChange.bind(this));
                    this.options.field[item.key] = field;
                }.bind(this));
                this.elem.trigger('fieldready',this.elem);
            }
            else if (this.options.fieldDesc.remote) {
                var hasInvalidDependencies = this.options.fieldDesc.dependency
                    && this.options.fieldDesc.dependency
                        .map(function (dep) { return this.dependencies && this.dependencies[dep] }.bind(this))
                        .filter(function (depValue) { return !depValue })
                        .length > 0;
                if (!hasInvalidDependencies) {
                    this.buildRemote();
                } else {
                    this.elem.trigger('fieldready', this.elem);
                }
            } else {
                throw "RadioField without local or remote is invalid";
            }
            return this.elem;
        },
        onChange: function (event) {
            if (! this.options.settingValue && event.args.checked) {    
                event.preventDefault();
                this.options.valueChanged && this.options.valueChanged.call(this.getValue());
                this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
            }
        },
        getValue: function () {
            if (this.options.fieldDesc.remote && this.loading) {
                //if remote data is not loaded, selected value has not been changed, so just return original value
                return this.options.value;
            }
            for (var key in this.options.field) {
                if (this.options.field.hasOwnProperty(key)) {
                    if (this.options.field[key].jqxRadioButton('val')) {
                        return key;
                    }
                }
            }
            return null;
        },
        getText: function () {
            for (var key in this.options.field) {
                if (this.options.field.hasOwnProperty(key)) {
                    if (this.options.field[key].jqxRadioButton('val')) {
                        return this.options.field[key].text();
                    }
                }
            }
            return null;
        },
        setValue: function (value) {
            if (this.options.fieldDesc.remote && this.loading) {
                throw ("Data is still loading.");
            } else {
                this.options.settingValue = true;
                var valueChanged = false;
                for (var key in this.options.field) {
                    if (this.options.field.hasOwnProperty(key)) {
                        if (key === value.toString() && !this.options.field[key].jqxRadioButton('val')) {
                            this.options.field[key].jqxRadioButton('val', true);
                            valueChanged = true;
                        }
                    }
                }
                this.options.settingValue = false;
                if (valueChanged) {
                    this.onChange({ preventDefault: function () { }, args: { checked: true } }); //See Bug #6952
                }
            }
        },
        reload: function (changedField, formValues) {
            if (this.options.fieldDesc.remote) {
                if (this.options.fieldDesc.dependency && this.options.fieldDesc.dependency.indexOf(changedField) > -1) {
                    this.dependencies[changedField] = formValues[changedField];
                    this.buildRemote();
                }
            }
        },
        buildRemote: function () {
            this.loading = true;
            // Check if all dependencies are filled, url is null if not
            var url = fmkField_getRemoteUrl(this.options.fieldDesc.remote.href, this.options.fieldDesc.dependency, this.dependencies, tplEngine);
            if (url != null) {
                this.elem.prepend('<div class="fmk-full-overdiv"><div class="fmk-loading-black" style="width:100%; height:100%;" /></div>');
                $.getJSON(url).done(function(res) {
                        var items = jsonPath(res, this.options.fieldDesc.remote.listPath, { resultType: "VALUE" });
                        this.options.inputCtr.empty();
                        this.options.field = {};
                        items[0].forEach(function(item) {
                            item = jsonPath(item, this.options.fieldDesc.remote.memberPath, { resultType: "VALUE" });
                            var key = item[0][this.options.fieldDesc.remote.valueMember];
                            var field = $('<div name="{0}" class="fmk-field-radio">{1}</div>'.replace('{0}', this.options.prefixedName + '' + key).replace('{1}', item[0][this.options.fieldDesc.remote.displayMember]));
                            this.options.inputCtr.append(field);
                            field.jqxRadioButton({ groupName: this.options.prefixedName, checked: this.options.value === key });
                            this.options.field[key] = field;
                            this.options.field[key].on('change', this.onChange.bind(this));
                        }.bind(this));
                        this.loading = false;
                        this.elem.trigger('fieldready', this.elem);
                    }.bind(this))
                    .always(function() {
                        this.elem.find('.fmk-full-overdiv').remove();
                    }.bind(this));
            }
        },
        validate: function () {
            //no rule for checkbox            
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('RadioField', 'fmkRadioField');

})(jQuery, Mustache);


/* =============================================================================
 * Date Field Widget
 * ============================================================================ */
(function ($, utils) {

    $.widget('fmkDateField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input"><div class="fmk-input-group--full"><span><div class="fmk-form-col__item__input--date-wrapper"/></span></div></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<div name="{0}" class="fmk-field-date" />'.replace('{0}', this.options.prefixedName)).jqxDateTimeInput({ formatString: 'dd/MM/yyyy', theme: 'fmk', enableBrowserBoundsDetection: true, culture : fmkField_getUserCulture() });
            // find  absolute calendar to apply class, for styling
            this.getJqxCalendarElem().addClass('fmk-field-date-absolutediv fmk-field-date-absolutediv--in-form-col')
                .on('viewChange', this.viewChange.bind(this));
            this.options.field.val(this.options.value ? utils.parseISODate(this.options.value) : '');
            this.options.field.on('change', this.onChange.bind(this));
            //be sure that jq widget valueChanged event does not bubble up because observers of 
            //this component expect arg0==value but jqx would not send that
            this.options.field.on('valueChanged', function (event) { event.stopPropagation(); });
            this.options.inputCtr.find('.fmk-form-col__item__input--date-wrapper').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            this.options.field
                .on('focusin', function () { this.options.inputCtr.addClass('hovered'); }.bind(this))
                .on('focusout', function () { this.options.inputCtr.removeClass('hovered'); }.bind(this));
            return this.elem;
        },

        getJqxCalendarElem: function () {
            return $('#{0}'.replace('{0}', this.options.field.attr('aria-owns')));
        },

        viewChange: function (element) {
            var els = $(element.currentTarget).find('td[id*="cellsTableViewinnerCalendarjqxWidget"]');
            var height = els.first().height() - 20;
            els.height(height);
            var left = parseInt($(element.currentTarget).css('left'));
            if ($(element.currentTarget).width() + left > $(window).width())
                $(element.currentTarget).css({ left: 'auto', right: '0' });
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            var date = this.options.field.jqxDateTimeInput('getDate');
            if (date)
                return utils.toISOString(date).substr(0, 10);
            return null;
        },
        getText: function () {
            //Date showed in browser was still parsed by jqxDateTimeInput
            return this.elem.find('input').val();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxDateTimeInput('setDate', value ? utils.parseISODate(value) : '');
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return !!v;
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('DateField', 'fmkDateField');

})(jQuery, Fmk.Utils);


/* =============================================================================
 * Datetime Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkDatetimeField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input"><div class="fmk-input-group--full"><span><div class="fmk-form-col__item__input--date-wrapper"/></span></div></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<div name="{0}" class="fmk-field-date fmk-field-datetime" />'.replace('{0}', this.options.prefixedName)).jqxDateTimeInput({ formatString: 'dd/MM/yyyy HH:mm', showTimeButton: true, theme: 'fmk', enableBrowserBoundsDetection: true, culture: fmkField_getUserCulture() });
            // find  absolute calendar to apply class, for styling
            this.getJqxCalendarElem().addClass('fmk-field-date-absolutediv')
                .on('viewChange', this.viewChange.bind(this));
            this.options.field.val(this.options.value ? Fmk.Utils.parseISODate(this.options.value) : '');
            this.options.field.on('change', this.onChange.bind(this));
            $('#{0}'.replace('{0}', this.options.field.attr('aria-owns')));
            //be sure that jq widget valueChanged event does not bubble up because observers of 
            //this component expect arg0==value but jqx would not send that
            this.options.field.on('valueChanged', function (event) { event.stopPropagation(); });
            this.options.inputCtr.find('.fmk-form-col__item__input--date-wrapper').append(this.options.field);
            this.elem.trigger('fieldready', this.elem);
            this.options.field
                .on('focusin', function () { this.options.inputCtr.addClass('hovered'); }.bind(this))
                .on('focusout', function () { this.options.inputCtr.removeClass('hovered'); }.bind(this));
            return this.elem;
        },

        getJqxCalendarElem: function () {
            return $('#{0}'.replace('{0}', this.options.field.attr('aria-owns')));
        },

        viewChange: function (element) {
            var els = $(element.currentTarget).find('td[id*="cellsTableViewinnerCalendarjqxWidget"]');
            var time = $(element.currentTarget).children("")[1];
            var height = els.first().height() - 20;
            els.height(height);
            
            var left = parseInt($(element.currentTarget).css('left'));
            var leftOffset = '0';
            if ($(element.currentTarget).width() + left > $(window).width()) {
                $(element.currentTarget).css({ left: 'auto', right: '0' });
                leftOffset = $(element.currentTarget).width() + left - $(window).width();
                console.log(leftOffset);
            }
            if (this.options.field.offset().top + $(element.currentTarget).height() + 40 < $(window).scrollTop() + $(window).height()) {
                $(time).css({ top: '0', bottom: 'auto', left: leftOffset });
            } else {
                $(time).css({ top: 'auto', bottom: '0', left: leftOffset });
            }
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            var date = this.options.field.jqxDateTimeInput('getDate');
            if (date)
                return Fmk.Utils.toISOString(date).substr(0, 19);
            return null;
        },
        getText: function () {
            //Date & time showed in browser was still parsed by jqxDateTimeInput
            return this.elem.find('input').val();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxDateTimeInput('setDate', value ? Fmk.Utils.parseISODate(value) : '');
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return !!v;
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('DatetimeField', 'fmkDatetimeField');

})(jQuery);


/* =============================================================================
 * Time Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkTimeField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input"><div class="fmk-input-group--full"><span><div class="fmk-form-col__item__input--date-wrapper"/></span></div></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<div name="{0}" class="fmk-field-date fmk-field-time" />'.replace('{0}', this.options.prefixedName)).jqxDateTimeInput({ formatString: 'HH:mm', showCalendarButton: false, showTimeButton: true, theme: 'fmk', enableBrowserBoundsDetection: true, culture: fmkField_getUserCulture() });
            var now = new Date();
            // find  absolute calendar to apply class, for styling
            this.getJqxCalendarElem().addClass('fmk-field-date-absolutediv')
                .on('viewChange', this.viewChange.bind(this));
            this.options.field.val(this.options.value ? Fmk.Utils.parseISODate(now.toISOString().slice(0, 11) + this.options.value) : '');
            this.options.field.on('change', this.onChange.bind(this));
            //be sure that jq widget valueChanged event does not bubble up because observers of 
            //this component expect arg0==value but jqx would not send that
            this.options.field.on('valueChanged', function (event) { event.stopPropagation(); });
            this.options.inputCtr.find('.fmk-form-col__item__input--date-wrapper').append(this.options.field);
            this.elem.trigger('fieldready',this.elem);
            return this.elem.find('.fmk-form-col__item__input--date-wrapper');
        },

        getJqxCalendarElem: function () {
            return $('#{0}'.replace('{0}', this.options.field.attr('aria-owns')));
        },
        viewChange: function (element) {
            var time = $(element.currentTarget).children("")[1];
            var left = parseInt($(element.currentTarget).css('left'));
            var leftOffset = '0';
            if ($(element.currentTarget).width() + left > $(window).width()) {
                leftOffset = $(element.currentTarget).width() + left - $(window).width();
            }
            if (this.options.field.offset().top + $(element.currentTarget).height() < $(window).scrollTop() + $(window).height()) {
                $(time).css({ top: '0', bottom: 'auto', left: leftOffset });
            } else {
                $(time).css({ top: 'auto', bottom: '0', left: leftOffset });
            }
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxDateTimeInput('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxDateTimeInput('setDate', value ? Fmk.Utils.parseISODate(new Date().toISOString().slice(0, 11) + value) : '');
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return !!v;
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('TimeField', 'fmkTimeField');

})(jQuery);


/* =============================================================================
 * Slider Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkSliderField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" />').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<div name="{0}" class="fmk-field-slider" />'.replace('{0}', this.options.prefixedName));
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.append(this.options.field);
            this.options.field = this.options.field.jqxSlider();
            this.options.field.val(this.options.value);
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxSlider('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.val(value);
            }
        },
        reload: function () { },
        validate: function () {
            //no rule for a slider
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('SliderField', 'fmkSliderField');

})(jQuery);


/* =============================================================================
 * DropDownList Field Widget
 * ============================================================================ */
(function ($, tplEngine) {

    $.widget('fmkDropDownListField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" />').appendTo(this.elem);
            this.options.value = (this.options.value != undefined && this.options.value != null) ? this.options.value : -1; //default value selected
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.dependencies = this.dependencies || this.options.dependencies;
            this.optionalDependency = this.options.fieldDesc.optionalDependency;
            this.cter = $('<div/>').appendTo(this.options.inputCtr);
            this.options.field = $('<div name="{0}" class="fmk-field-dropdown"></div>'.replace('{0}', this.options.prefixedName));
            if (this.options.fieldDesc.local) {
                this.loading = true;
                //!\ there is a bug in jqwidget : you can not use displayMember:'value' (cf Webapps.Gui.Tests/jqxDropDownListBug.html)
                var localsource = this.options.fieldDesc.local.values.map(function (e) { return { key: e.key, text: e.value } });
                this.options.field.jqxDropDownList({
                    source: localsource,
                    valueMember: 'key',
                    displayMember: 'text',
                    theme: 'fmk',
                    enableBrowserBoundsDetection: true,
                    autoDropDownHeight: true,
                    placeHolder: fmkField_translate('Fmk_please_choose'),
                    width: '100%'
                });
                this.options.field.jqxDropDownList('insertAt', { label: fmkField_translate('Fmk_please_choose'), value: -1 }, 0);
                this.options.field.jqxDropDownList('selectItem', this.options.field.jqxDropDownList('getItemByValue', this.options.value));
                this.options.field.on('change', this.onChange.bind(this));
                this.options.field.on('open', this.setScrolls.bind(this));
                this.loading = false;
                this.cter.append(this.options.field);
                this.elem.trigger('fieldready', this.elem);
            }
            else if (this.options.fieldDesc.remote) {
                var hasInvalidDependencies = this.options.fieldDesc.dependency
                    && this.options.fieldDesc.dependency
                        .map(function (dep) { return this.dependencies && this.dependencies[dep] }.bind(this))
                        .filter(function (depValue) { return !depValue })
                        .length > 0;
                if (!hasInvalidDependencies || this.optionalDependency) {
                    this.buildRemote();
                } else {
                    this.elem.trigger('fieldready', this.elem);
                }
            } else {
                throw "DropDownList without local or remote is invalid";
            }
            this.options.field
                .on('focusin', function () { this.options.inputCtr.addClass('hovered'); }.bind(this))
                .on('focusout', function () { this.options.inputCtr.removeClass('hovered'); }.bind(this));
            return this.elem;
        },
        onChange: function (event) {            
            event.preventDefault();
            if (!this.loading) {
                this.options.valueChanged && this.options.valueChanged.call(this.getValue());
                this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
            }
        },
        setScrolls: function (event) {
            var dropdownlist = $('#' + $(event.currentTarget).attr('aria-owns'));

            var maxheight = $(window).height();
            if (dropdownlist.offset().top + dropdownlist.height() > maxheight) {

                if (dropdownlist.height() > maxheight) {
                    dropdownlist.css('top', '7px');
                    $(event.currentTarget).jqxDropDownList({ dropDownHeight: maxheight + 'px', autoDropDownHeight: false });
                }
                else {
                    dropdownlist.css('top', Math.max(7, dropdownlist.offset().top - dropdownlist.height() - 35) + 'px');
                }
            }
            else {
                $(event.currentTarget).jqxDropDownList({ autoDropDownHeight: true });
            }
        },
        getValue: function () {
            if (this.options.fieldDesc.remote && this.loading) {
                //if remote data is not loaded, selected value has not been changed, so just return original value
                return this.options.value == -1 ? null : this.options.value;
            }
            return this.options.field.jqxDropDownList('val') == -1 ? null : this.options.field.jqxDropDownList('val');
        },
        getText: function () {
            //Jquery text returns selected element text
            return this.options.inputCtr.text();
        },
        removeItem: function(item){
           return this.options.field.jqxDropDownList('removeItem', item);
        },
        setValue: function (value, retry) {
            if (value == "")
                value = null;
            if (value != this.getValue()) {
                if (this.options.fieldDesc.remote && this.loading) {
                    if (this.options.value == value || this.options.value == undefined || this.options.value == null)
                        return;
                    console.warn("DropDown is still loading. Retrying...");
                    if (typeof retry === 'undefined' || retry < 4) {
                        setTimeout(function() {
                            this.setValue(value, typeof retry !== 'undefined' ? retry + 1 : 1);
                        }.bind(this), 200);
                        return;
                    } else
                        throw ("Impossible to set the value for the dropdown. Data is still loading...");
                } else {
                    var item = this.options.field.jqxDropDownList('getItemByValue', value);
                    if (item) {
                        this.options.field.jqxDropDownList('selectItem', item);
                    } else {
                        this.options.field.jqxDropDownList('selectItem', this.options.field.jqxDropDownList('getItemByValue', -1));
                    }
                }
                this.onChange({ preventDefault: function () { } }); //See Bug #6952  
            }
        },
        reload: function(changedField, formValues) {
            if (this.options.fieldDesc.remote) {
                if ((this.options.fieldDesc.dependency && this.options.fieldDesc.dependency.indexOf(changedField) > -1) || this.options.optionalDependency) {
                    this.dependencies[changedField] = formValues[changedField];
                    this.buildRemote();
                }
            }
        },

        buildRemote: function () {
            this.cter.empty();
            this.options.field = $('<div name="{0}" class="fmk-field-dropdown"></div>'.replace('{0}', this.options.prefixedName));
            var source =
                {
                    datatype: "json",
                    root: fmkField_jsonPathFormat(this.options.fieldDesc.remote.listPath),
                    cache: true,
                    id: fmkField_jsonPathFormat(this.options.fieldDesc.remote.memberPath, true) + this.options.fieldDesc.remote.valueMember,
                    datafields: [
                        { name: this.options.fieldDesc.remote.valueMember, map: fmkField_jsonPathFormat(this.options.fieldDesc.remote.memberPath, true) + this.options.fieldDesc.remote.valueMember },
                        { name: this.options.fieldDesc.remote.displayMember, map: fmkField_jsonPathFormat(this.options.fieldDesc.remote.memberPath, true) + this.options.fieldDesc.remote.displayMember }
                    ],
                    url: fmkField_getRemoteUrl(this.options.fieldDesc.remote.href, this.options.fieldDesc.dependency, this.dependencies, tplEngine, this.optionalDependency)
                };

            this.loading = true;
            this.elem.prepend('<div class="fmk-full-overdiv"><div class="fmk-loading-black" style="width:100%; height:100%;" /></div>');
            var remoteDataAdapter = new $.jqx.dataAdapter(source, {
                loadComplete: function () {
                    this.options.field.jqxDropDownList('insertAt', { label: fmkField_translate('Fmk_please_choose'), value: -1 }, 0);
                    if (this.options.value != undefined && this.options.value != null) {
                        if (this.options.field.jqxDropDownList('getItemByValue', this.options.value)) {
                            this.options.field.jqxDropDownList('selectItem', this.options.field.jqxDropDownList('getItemByValue', this.options.value));
                        } else {
                            this.options.field.jqxDropDownList('selectItem', this.options.field.jqxDropDownList('getItemByValue', -1));
                        }
                    }
                    this.loading = false;
                    this.elem.trigger('fieldready', this.elem);
                    this.elem.find('.fmk-full-overdiv').remove();
                }.bind(this)
            });
            this.options.field.jqxDropDownList({
                source: remoteDataAdapter,
                valueMember: this.options.fieldDesc.remote.valueMember,
                displayMember: this.options.fieldDesc.remote.displayMember,
                theme: 'fmk',
                enableBrowserBoundsDetection: true,
                autoDropDownHeight: true,
                placeHolder: fmkField_translate('Fmk_please_choose'),
                width: '100%'
            });
            this.options.field.on('change', this.onChange.bind(this));
            this.options.field.on('open', this.setScrolls.bind(this));
            this.cter.append(this.options.field);
        },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '' && v !== null;
        }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('DropDownListField', 'fmkDropDownListField');

})(jQuery, Mustache);

/* =============================================================================
 * FacetedSearchField Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkFacetedSearchField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" />').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<nav class="fmk-no-select fmk-field-facet" ><ul class="menu__list"></ul></nav>');
            this.currentValue = this.options.fieldDesc.multiple ? [] : "";

            $(this.options.parent).on('ready', function() {
                this.createFacets(this.options.value);
            }.bind(this));
            this.options.inputCtr.append(this.options.field);
            this.options.field.on('click', 'li', this.onChange.bind(this));
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        createFacets: function (defaultValue) {            
            // Load facets
            var otherValues = this.options.otherValuesFunc();
            delete otherValues[this.options.fieldDesc.id]; //cf #7532
            $.get(this.options.fieldDesc.remote.href, otherValues).done(function (res) {
                this.elem.find('ul').empty();
                if (res && res.length > 0) {
                    this.elem.show();
                    res.forEach(function (facet) {
                        var item = $('<li class="menu__list--filter__item" data-value="{0}"><a class="menu__lis--filtert__item__link block-link">{1}{2}</a></li>'
                            .replace('{0}', facet.data.value)
                            .replace('{1}', '<span class="block-link__inner fmk-facet-label">{10}</span>'.replace('{10}', facet.data.label))
                            .replace('{2}', '<span class="block-link__number">{20}</span>'.replace('{20}', facet.data.count))
                        ).appendTo(this.options.field.find('ul'));
                        if (Array.isArray(defaultValue)) {
                            item.addClass(defaultValue.indexOf(facet.data.value) > -1 ? 'selected' : '');
                        } else if (defaultValue && defaultValue == facet.data.value) {
                            item.addClass('selected');
                        }
                    }.bind(this));

                    // Mask from 6th element
                    var elemToHide = this.options.field.find('li').slice(4).hide();
                    if (elemToHide.length > 0) {
                        $(this.options.field).find('a.fmk-link-more').remove();
                        $('<a class="nav-more fmk-link-more" >' + fmkField_translate('Fmk_Faceted_More') + '</a>').appendTo(this.options.field)
                            .on('click', function(ev) {
                                $(ev.currentTarget).toggleClass("nav-more").toggleClass("nav-less");
                                if ($(ev.currentTarget).hasClass("nav-less")) {
                                    this.options.field.find('li').show();
                                    $(ev.currentTarget).html(fmkField_translate('Fmk_Faceted_Less'));
                                } else {
                                    this.options.field.find('li').slice(4).hide();
                                    $(ev.currentTarget).html(fmkField_translate('Fmk_Faceted_More'));
                                }
                            }.bind(this));
                    }
                } else {
                    this.elem.hide();
                }
            }.bind(this));           
        },
        onChange: function (event) {
            event.preventDefault();
            var el = $(event.currentTarget);
            el.toggleClass('selected');
            if (this.options.fieldDesc.multiple) {
                this.currentValue = this.elem.find('li.selected').map(function () {
                    return $(this).attr('data-value');
                }).get();
            } else {
                el.siblings().removeClass('selected');
                this.currentValue = el.hasClass('selected') ? el.attr('data-value') : null;
            }
            this.elem.trigger("valueChanged", [this.currentValue, this.options.fieldDesc.id]);//need to wrap inside array to avoid that jQuery thinks each value is a separate argument (#7462)
            this.options.valueChanged && this.options.valueChanged.call(this.currentValue);
        },
        getValue: function () {
            if ($.isArray(this.currentValue) && this.currentValue.length == 0) {
                return '';
            }
            return this.currentValue || '';
        },
        getText: function () {
            var values = this.getValue();
            var result = [];
            if (!$.isArray(values) && values.length)
                values = [values];
            else if (!values.length)
                return '';

            values.forEach(function (v) {
                var text = this.elem.find('[data-value="' + v + '"] .fmk-facet-label').text();
                if(text.length)
                    result.push(text);
            }.bind(this));

            return result;
        },
        setValue: function (value) {
            if (value != this.getValue()) {
                if (this.options.fieldDesc.multiple) {
                    this.currentValue = $.isArray(value) ? value : (value.length ? [value] : '');
                } else {
                    this.currentValue = $.isArray(value) && value.length > 0 ? value[0] : value;
                }
                // Select facets
                this.options.field.find('li.selected').removeClass('selected');
                if (!Array.isArray(value)) {
                    value = [value];
                }
                value.forEach(function (v) {
                    this.options.field.find('li[data-value="{0}"]'.replace('{0}', v)).addClass('selected');
                }.bind(this));

                this.elem.trigger("valueChanged", [this.currentValue, this.options.fieldDesc.id]);//need to wrap inside array to avoid that jQuery thinks each value is a separate argument (#7462)
                this.options.valueChanged && this.options.valueChanged.call(this.currentValue);
            }
        },
        removeValue: function(val) {
            if ($.isArray(this.currentValue)) {
                var index = this.currentValue.indexOf(val);
                this.currentValue.splice(index, 1);
                this.setValue(this.currentValue);
            } else {
                if (this.currentValue === val) {
                    this.setValue(null);
                }
            }
            this.elem.trigger("valueChanged", [this.currentValue, this.options.fieldDesc.id]);
        },
        reload: function (changedFieldId, formValues) {
            if (changedFieldId !== this.options.fieldDesc.id) {
                this.createFacets(formValues[this.options.fieldDesc.id]);
                this.options.inputCtr.append(this.options.field);
            }
            return this.elem;
        },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('FacetedSearchField', 'fmkFacetedSearchField');

})(jQuery);


/* =============================================================================
 * Search List Field Widget
 * ============================================================================ */
(function ($, jsonPath, tplEngine) {

    $.widget('fmkSearchListField', {
        _init: function () {

            var typingTimer;
            var doneTypingInterval = 100;
            var xhr;

            this.options.inputCtr = $('<div class="fmk-form-col__item__input" />').appendTo(this.elem);
            this.initializing = true;
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input type="text" name="{0}" class="fmk-field-searchlist" />'.replace('{0}', this.options.prefixedName))
                .jqxInput({
                    theme: 'fmk',
                    displayMember: this.options.fieldDesc.remote.displayMember,
                    valueMember: this.options.fieldDesc.remote.valueMember,
                    filter: function(data) {
                        return data;
                    },
                    sort: function(data) {
                        return data;
                    },
                    source: function (query, response) {
                        //call the API defined in fieldDesc
                        var data = $.extend({}, this.otherValues);
                        data[this.options.fieldDesc.queryParameter] = query;
                        delete data[this.options.fieldDesc.idQueryParameter];
                        var url = tplEngine.render(this.options.fieldDesc.remote.href, data);

                        if (xhr) { 
                            try {
                                xhr.abort();
                            }
                            catch(ex) {}
                        }
                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(function () {

                            xhr = $.ajax({
                                dataType: "json",
                                url: url,
                                data: data
                            }).done(function (res) {
                                //mutate the API answer into an array of items understandable by jqxInput
                                var list = jsonPath(res, this.options.fieldDesc.remote.listPath)[0];
                                var res_ = list.map(function (e) {
                                    var e_ = jsonPath(e, this.options.fieldDesc.remote.memberPath)[0];
                                    return e_;
                                }.bind(this));
                                //define list size according result size => list size is managed by service
                                this.options.field.jqxInput({ items: res_.length });
                                //call the jqxInput
                                response(res_);
                                this.setMenuPosition();
                            }.bind(this));

                        }.bind(this), doneTypingInterval);
                        
                    }.bind(this)
                });

            this.options.inputCtr.append(this.options.field);
            
            this.options.field.on('select', function (event) {
                if (! event.args || !event.args.item) {
                    //this is quite strange but it happens => prevent strange behavior inside our code
                    return;
                }
                this.value = event.args.item;
                this.onChange(event);
            }.bind(this));

            this.options.field.on('change', function () {
                var jqxVal = this.options.field.jqxInput('val');
                if (jqxVal === '') { 
                    this.setRealValue({ value: '', label: '' });
                } else if (jqxVal && jqxVal.label) {
                    //according to jqxInput, the user has selected something (since an object with a value and a label is returned)
                    //problem is that sometimes this is not really true, let's check the underlying DOM ...
                    var underlyingInputVal = this.options.field[0].value;
                    if (jqxVal.label !== underlyingInputVal) {
                        //seems that jqxInput.val is inconsistent with underlying input
                        //let's pretend that the user indeed selected nothing
                        this.setRealValue({ value: '', label: '' });
                    }
                } else if (jqxVal && !jqxVal.label) {
                    //jqxInput says that there is a value but this is not a value selected in the dropdown
                    //discard it
                    this.setRealValue({ value: '', label: '' });
                }
            }.bind(this));

            //remembering dependentValues so that they are correctly injected during a search or setValue
            this.otherValues = this.options.dependencies;

            if (this.options.fieldDesc.idQueryParameter != "" &&
                this.options.value !== undefined &&
                this.options.value !== null &&
                this.options.value !== '') {
                this.setValue(this.options.value);
            } else {
                this.elem.trigger('fieldready', this.elem);
            }
           
            this.initializing = false;
            return this.elem;
        },
        onChange: function (event) {    
            event.preventDefault();
            var curValue = this.getValue();
            if (curValue != this.previousChangedValue) {
                this.previousChangedValue = curValue;
                this.options.valueChanged && this.options.valueChanged.call(curValue);
                this.elem.trigger("valueChanged", [curValue, this.options.fieldDesc.id]);
            }            
        },
        getValue: function () {
            return this.value && this.value.value;
        },
        getText: function () {
            return this.value && this.value.label;
        },
        setValue: function (value) {
            if (value != this.getValue()) {
                if (!value) {
                    this.setRealValue({ value: '', label: '' });
                } else {
                    this.value = { value: value, label: '...' };
                    this.options.field.jqxInput('val', this.value);

                    //asynchronously get the real label
                    var data = $.extend({}, this.otherValues);
                    delete data[this.options.fieldDesc.queryParameter];
                    data[this.options.fieldDesc.idQueryParameter] = value;
                    var url = tplEngine.render(this.options.fieldDesc.remote.href, data);
                    $.getJSON(url, data, function (res) {
                        //mutate the API answer into an array of items understandable by jqxInput
                        var list = jsonPath(res, this.options.fieldDesc.remote.listPath)[0];
                        if (list.length == 0) {
                            this.setRealValue({ value: '', label: '' });
                            if (!this.selfReady) {
                                this.selfReady = true;
                                this.elem.trigger('fieldready', this.elem);
                            }
                        } else if (list.length == 1) {
                            var e = jsonPath(list[0], this.options.fieldDesc.remote.memberPath)[0];
                            this.setRealValue({ value: value, label: e[this.options.fieldDesc.remote.displayMember] });
                            if (!this.selfReady) {
                                this.selfReady = true;
                                this.elem.trigger('fieldready', this.elem);
                            }
                        } else {
                            throw "Too many results to set a value !";
                        }
                    }.bind(this));
                }
            }
        },

        setRealValue: function (realValue) {
            this.value = realValue;
            if (!realValue.value && this.options.field.jqxInput('val') != '') {
                //when resetting a field, need a special case
                this.options.field.jqxInput('val', '');
            } else {
                this.options.field.jqxInput('val', this.value);
            }
            if (!this.initializing) {
                this.onChange({ preventDefault: function () { } });
            }            
        },
        reload: function(changedField, formValues) {
            if (this.options.fieldDesc.dependency && this.options.fieldDesc.dependency.indexOf(changedField) > -1) {
                this.setValue('');
                this.otherValues[changedField] = formValues[changedField];
            }
        },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            //else, we dont know how to deal with the rule so we ignore it 
            //this is not so important because the server will (hopefully) do the validation
            return true;
        },
        setMenuPosition: function () {
            //If widget is into upper side of screen do nothing
            if (($(window).height() / 2) > this.elem.offset().top)
                return;
 
            var popup = $('#' + this.elem.find('input').attr('aria-owns'));

            //If there's enough space for the list do nothing
            if (!popup || popup.length == 0 || $(window).height() > popup.height() + popup.position().top)
                return;

            popup.css('top', this.elem.offset().top - popup.height() - 7);
            popup.children().each(function (i, li) { popup.prepend(li) }); //Inversing elements
        }

    });
    
    $.fieldFactory.register('SearchListField', 'fmkSearchListField');

})(jQuery, jsonPath, Mustache);

/* =============================================================================
 * Coordinates Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkCoordinatesField', {
        _init: function () {
            this.initMarker();
            this.options.inputCtr = $('<div class="fmk-coordField-ctr fmk-form-col__item__input" ></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.fieldLon = $('<input name="{0}-lon" type="text" class="fmk-field-text fmk-input--full fmk-field-coordinates-lon" title="{1}" />'
                .replace('{0}', this.options.prefixedName)
                .replace('{1}', fmkField_translate('Fmk_coords_lon')))
                .jqxInput({ placeHolder: fmkField_translate('Fmk_coords_lon') });
            this.options.fieldLat = $('<input name="{0}-lat" type="text" class="fmk-field-text fmk-input--full fmk-field-coordinates-lat" title="{1}" />'
                .replace('{0}', this.options.prefixedName)
                .replace('{1}', fmkField_translate('Fmk_coords_lat')))
                .jqxInput({ placeHolder: fmkField_translate('Fmk_coords_lat') });
            this.options.mapBtn = $('<button class="fmk-coordField-map-btn fmk-input-group__addon-right__btn fmk-btn" title="{0}"></button>'
                .replace('{0}', fmkField_translate('Fmk_CoordinateField_DisplayMap')));
            this.options.fieldLon.jqxInput('val', this.options.value && this.options.value.longitude || '');
            this.options.fieldLat.jqxInput('val', this.options.value && this.options.value.latitude || '');
            this.options.fieldLon.on('keypress', this.onKeypress.bind(this));
            this.options.fieldLat.on('keypress', this.onKeypress.bind(this));
            this.options.fieldLon.on('change', this.onChange.bind(this));
            this.options.fieldLat.on('change', this.onChange.bind(this));
            this.options.mapBtn.on('click', this.openMap.bind(this));
            this.options.inputCtr.append(this.options.fieldLon)
                .append(this.options.fieldLat)
                .append(this.options.mapBtn);
            this.elem.trigger('fieldready',this.elem);
            return this.elem;
        },
        onKeypress: function (event) {
            var charCode = (event.which) ? event.which : event.keyCode;
            var value = $(event.currentTarget).jqxInput('val');

            if (charCode == 45 && value.indexOf('-') != -1)
                return false;
            if (charCode == 46 && value.indexOf('.') != -1)
                return false;

            if (charCode != 45 && charCode != 46 && (charCode < 48 || charCode > 57))
                return false;

            return true;
        },
        onChange: function (event) {
            event.preventDefault();
            if (this.settingValue) {
                return;
            }
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        initMarker: function() {
            this.markerStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 5,
                    fill: new ol.style.Fill({
                        color: 'rgba(0,0,0,1)' //black
                    }),
                    stroke: new ol.style.Stroke({
                        //avoid black color around circle with gmap integration
                        color: 'rgba(0,0,0,0)',
                        width: 0
                    })
                })
            });
        },
        openMap: function () {
            var contract = this.options.contracts.filterByType('map')[0];

            // Creation of map
            this.map = $('<div style="width:100%; height:100%; visibility: hidden;" class="fmk-coordField-map" />');
            this.popup = $('<div style="width:90vw; height: 90vh;top: 5vh; left: 5vw;" />').appendTo('body').fmkPopup({
                content: this.map,
                validateLabel: fmkField_translate('Fmk_CoordinateField_Validate'),
                cancelLabel: fmkField_translate('Fmk_CoordinateField_Cancel'),
                title: fmkField_translate('Fmk_CoordinateField_ChooseLocation'),
                closeOnValidate: true,
                closeOnCancel: true
            });

            this.popup.on('validate', function() {
                this.setValue(this.coordsSelectedOnMap);
                this.coordsSelectedOnMap = null;
            }.bind(this));

            this.map.fmkMap({ contract: new Contract(contract), preventSaveMapPosition: true });

            this.map.on('ready', function() {
                var map = this.map.fmkMap('getMap');
                map.on('click', this.onMapClick.bind(this)); // Click on map => new value

                // Init layer
                this.vector = new ol.source.Vector({
                    features: []
                });
                this.vectorLayer = new ol.layer.Vector({
                    source: this.vector
                });
                map.addLayer(this.vectorLayer);
                var cur = this.getValue();
                if (!isNaN(cur.longitude) && !isNaN(cur.latitude)) {
                    setTimeout(function (coord) {
                        this.setPointOnMap([coord.longitude, coord.latitude]);
                        map.getView().setCenter(this.map.fmkMap('convertToMapCoords', [coord.longitude, coord.latitude]));
                        map.getView().setZoom(16);
                        this.map.css('visibility', 'visible');
                    }.bind(this, cur), 100);
                } else {
                    this.map.css('visibility', 'visible');
                }
            }.bind(this));
        },
        setPointOnMap: function(coords) {
            this.vector.clear();
            var res = new ol.Feature({
                geometry: new ol.geom.Point(this.map.fmkMap('convertToMapCoords', coords))
            });
            res.setStyle(this.markerStyle);
            this.vector.addFeatures([res]);
            this.coordsSelectedOnMap = { longitude: coords[0], latitude: coords[1] };
        },
        onMapClick: function(ev) {
            var servCoords = this.map.fmkMap('convertToServerCoords', ev.coordinate).map(function (c) { return parseFloat(c.toFixed(6)); });
            this.setPointOnMap(servCoords);
        },
        getValue: function () {
            return {
                longitude: parseFloat(this.options.fieldLon.jqxInput('val')),
                latitude: parseFloat(this.options.fieldLat.jqxInput('val'))
            };
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            var oldVal = this.getValue();
            var newVal = value || { longitude: '', latitude: '' };
            if (oldVal.longitude != newVal.longitude || oldVal.latitude != newVal.latitude) {
                this.settingValue = true;
                this.options.fieldLon.jqxInput('val', newVal.longitude);
                this.options.fieldLat.jqxInput('val', newVal.latitude);
                this.settingValue = false;
            }            
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return !!v && !!v.longitude && !!v.latitude && v.longitude !== '' && v.latitude !== '';
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('CoordinatesField', 'fmkCoordinatesField');

})(jQuery);

/* =============================================================================
 * Inner form Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkInnerForm', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" />').appendTo(this.elem);
            this.subContract = this.options.contracts.findByName(this.options.fieldDesc.contractName);
            this.notReadyFields = [];
            this.selfReady = false;
            this.elem.on('fieldready', '.fmk-inner-form', this.onFieldsReady.bind(this));
            this.totalFields = this.subContract.data.fields.filter(function (f) { return f.type != 'HiddenField' }).length;
            if (this.options.fieldDesc.showAsGrid) {
                this.elem.addClass('fmk-inner-form-as-grid');
            }
            if (this.options.fieldDesc.repeatable) {
                this.header = $('<div class="fmk-inner-form-header" />').appendTo(this.options.inputCtr);
                // Construct header
                this.subContract.data.fields.forEach(function (f) {
                    if (f.type != 'HiddenField') {
                        $('<div class="fmk-inner-form-header-item fmk-inner-form-header-item-label" style="width:calc((100% - 60px) / {0})">{1}</div>'
                            .replace('{0}', this.totalFields)
                            .replace('{1}', f.label)).appendTo(this.header);
                    }
                }.bind(this));
                $('<button class="fmk-btn fmk-inner-form-addbutton fmk-btn--icon-addpoint-medium-white fmk-inner-form-header-item fmk-btn--icon-addpoint-medium-white--hover" />')
                    .appendTo(this.header)
                    .on('click', this.addForm.bind(this));
                $('<a class="fmk-inner-form-addlink" >' + fmkField_translate('Fmk_InnerForm_Add') + '</a>')
                    .appendTo(this.header)
                    .on('click', this.addForm.bind(this));
            }
            this.ctr = $('<div class="fmk-inner-form-wrapper" />').appendTo(this.options.inputCtr);
            if (this.options.value && this.options.value != '') {
                if (Array.isArray(this.options.value)) {
                    this.options.value.forEach(function(v) {
                        this.addForm(v);
                    }.bind(this));
                } else {
                    this.addForm(this.options.value);
                }
            } else if (!this.options.fieldDesc.repeatable
                || this.options.fieldDesc.rules.filter(function (d) { return d.name === 'required' }).length > 0
                        && this.options.fieldDesc.repeatable) {
                this.addForm(null);
            }
            this.elem.on('change', '.fmk-inner-form', this.onChange.bind(this));
            this.elem.on('click', '.fmk-inner-form-delete', this.onDelete.bind(this));
            this.selfReady = true;
            if (!this.notReadyFields.length)
                this.elem.trigger('fieldready', this.elem);
            
            return this.elem;
        },
        addForm: function (val) {
            var field = $('<div class="fmk-inner-form"/>').appendTo(this.ctr);
            this.notReadyFields = this.notReadyFields.concat(this.subContract.data.fields);
            var selfreadyPrevStatus = this.selfReady; 
            this.selfReady = false; //Block onFieldsReady till addForm finish
            var showAsGrid = this.elem.hasClass('fmk-inner-form-as-grid') ? true : false;
            field.buildForContract(this.subContract, { entity: { data: val }, inner: true, noSplit: true, showAsGrid: showAsGrid, contracts: this.options.contracts });
            if (this.options.fieldDesc.repeatable) {
                var fieldsets = field.find('fieldset');
                fieldsets.find('.fmk-inner-form-delete').remove();
                $('<button class="fmk-inner-form-delete fmk-btn fmk-btn--icon-removepoint-medium-purple fmk-btn--icon-removepoint-medium-purple--hover" />')
                    .prependTo(fieldsets);
                $('<a class="fmk-inner-form-delete">' + fmkField_translate('Fmk_InnerForm_Delete') + '</a>')
                    .appendTo(fieldsets);
            }
            if (showAsGrid) {
                var innerForms = this.ctr.find('.fmk-inner-form .form-field').not('.fmk-inner-inner-form');
                innerForms.css('width', 'calc((100% - 60px) / {0})'.replace('{0}', this.totalFields));
                innerForms.addClass('fmk-inner-inner-form');
            }

           this.selfReady = selfreadyPrevStatus;
           if (this.selfReady && !this.notReadyFields.length)
               this.elem.trigger('fieldready', this.elem);

           this.setScroll(field);
        },
        setScroll: function (field) {

            var scrollElem = this.options.parent.find('fieldset:first');

            var docViewTop = scrollElem.offset().top + scrollElem.scrollTop();
            var docViewBottom = $(window).height() - docViewTop;

            var elemTop = field.offset().top;
            var elemBottom = elemTop + field.height();
            if (!(elemBottom <= docViewBottom) || !(elemTop >= docViewTop)) {
                var scrollPos = scrollElem.scrollTop() + elemBottom - docViewBottom;
                console.log(scrollPos);
                this.options.parent.find('fieldset:first').scrollTop(scrollPos);
            }
        },
        onDelete: function(ev) {
            $(ev.currentTarget).closest('.fmk-inner-form').remove();
            this.onChange(ev);
        },
        onChange: function (event) {
            var val = this.getValue();
            // Check if rule required, always at least one line
            if (this.options.fieldDesc.rules.filter(function(d) { return d.name === 'required'}).length > 0
                && this.options.fieldDesc.repeatable
                && Array.isArray(val) && val.length == 0) {
                this.addForm();
            }
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(val);
            this.elem.trigger("valueChanged", [val, this.options.fieldDesc.id]);
        },
        onFieldsReady: function (event,element) {
            event.stopPropagation();
            var fieldname = $(element).attr('data-form-field');
            this.notReadyFields = this.notReadyFields.filter(function (el) { return el.id != fieldname; });
            if (!this.notReadyFields.length && this.selfReady)
                this.elem.trigger('fieldready', this.elem);
        },
        getValue: function () {
            if (!this.selfReady) {
                return this.options.value;
            }
            var resp = [];
            this.ctr.children('.fmk-inner-form').each(function() {
                resp.push($(this).getFmkWidget().getValues());
            });
            return this.options.fieldDesc.repeatable ? resp : resp[0];
           
        },
        getText: function () {
            var result = [];
            $(this.subContract.data.fields).each(function (key, val) {
                 result[val.id] = $(this.elem).find('[data-form-field="' + val.id + '"]').getFmkFieldText();
            }.bind(this));
            return result;
        },
        setValue: function (value) {
            this.elem.find('.fmk-inner-form').remove();
            if (Array.isArray(value)) {
                value.forEach(function(v) {
                    this.addForm(v);
                }.bind(this));
            } else {
                this.addForm(value);
            }
            
        },
        reload: function () { },
        validate: function (ruleName) {
            var valid = true;
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '' && Array.isArray(v) && v.length > 0;
            }
            this.ctr.children('.fmk-inner-form').each(function () {
                var thisValid = $(this).getFmkWidget().validate();
                valid = valid && thisValid;
            });
            return valid;
        }
    });

    $.fieldFactory.register('InnerForm', 'fmkInnerForm');

})(jQuery);


/* =============================================================================
 * Fieldset Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkFieldset', {
        _init: function () {
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<fieldset data-form-field={2} id="{0}" class="fmk-field-fieldset"></fieldset>'
                .replace('{0}', this.options.prefixedName)
                .replace('{2}', this.options.fieldDesc.id));
            if (this.options.fieldDesc.label != null && this.options.fieldDesc.label != '')
                this.options.field.append($('<legend>{1}</legend>'.replace('{1}', this.options.fieldDesc.label)));
            if (this.options.fieldDesc.split) {
                $('<div class="fmk-l-pull-left fmk-form-col fmk-form-col--side-by-side fmk-split-col-0" />').appendTo(this.options.field);
                $('<div class="fmk-l-pull-right fmk-form-col fmk-form-col--side-by-side fmk-split-col-1" />').appendTo(this.options.field);
            }

            this.elem.trigger('fieldready', this.options.fieldDesc.id);
            return this.elem.append(this.options.field);
        },
        getValue: function () {
            return null;
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function () {
            console.warn("No setter available.");
        },
        reload: function () { },
        validate: function () {
            //no rule for a fieldset
            return true;
        }
    });

    $.fieldFactory.register('Fieldset', 'fmkFieldset');

})(jQuery);


/* =============================================================================
 * Criteria Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkCriteriaField', {
        _init: function () {
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input name="{0}" type="hidden" class="fmk-field-criteria" />'.replace('{0}', this.options.prefixedName)).jqxInput();
            this.options.field.jqxInput('val', JSON.stringify(this.options.value) || '');
            this.options.field.on('change', this.onChange.bind(this));
            this.elem.trigger('fieldready', this.elem);
            return this.elem.append(this.options.field);
        },
        onChange: function () {
        },
        getValue: function () {
            return JSON.parse(this.options.field.jqxInput('val'));
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxInput('val', JSON.stringify(value) || '');
            }
        },
        reload: function () { },
        validate: function () {
            //no validation because we can not display the error hint
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('CriteriaField', 'fmkCriteriaField');

})(jQuery);


/* =============================================================================
 * Clipboard Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkClipboardField', {
        _init: function () {
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<input name="{0}" type="hidden" class="fmk-field-clipboard" />'.replace('{0}', this.options.prefixedName)).jqxInput();
            this.options.field.jqxInput('val', JSON.stringify(this.options.value) || '');
            this.options.field.on('change', this.onChange.bind(this));
            this.elem.trigger('fieldready', this.elem);
            return this.elem.append(this.options.field);
        },
        onChange: function () {
        },
        getValue: function () {
            return JSON.parse(this.options.field.jqxInput('val'));
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxInput('val', JSON.stringify(value) || '');
            }
        },
        reload: function () { },
        validate: function () {
            //no validation because we can not display the error hint
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('ClipboardField', 'fmkClipboardField');

})(jQuery);


/* =============================================================================
 * Html Field Widget
 * ============================================================================ */
(function ($) {

    $.widget('fmkHtmlField', {
        _init: function () {
            this.options.inputCtr = $('<div class="fmk-form-col__item__input" ><div class="fmk-input-group fmk-input-group--full" /></div>').appendTo(this.elem);
            this.options.prefixedName = this.options.prefixedName || this.options.fieldDesc.id; //in case we are not coming from fmk_form
            this.options.field = $('<textarea name="{0}" class="fmk-field-textarea fmk-input--full"></textarea>'.replace('{0}', this.options.prefixedName));
            this.options.field.on('change', this.onChange.bind(this));
            this.options.inputCtr.find('.fmk-input-group').append(this.options.field);
            this.options.field = this.options.field.jqxEditor();
            this.options.field.val(this.options.value || '');
            this.elem.trigger('fieldready', this.elem);
            return this.elem;
        },
        onChange: function (event) {
            event.preventDefault();
            this.options.valueChanged && this.options.valueChanged.call(this.getValue());
            this.elem.trigger("valueChanged", [this.getValue(), this.options.fieldDesc.id]);
        },
        getValue: function () {
            return this.options.field.jqxEditor('val');
        },
        getText: function () {
            return this.getValue();
        },
        setValue: function (value) {
            if (this.getValue() != value) {
                this.options.field.jqxEditor('val', value || '');
            }
        },
        reload: function () { },
        validate: function (ruleName) {
            var v = this.getValue();
            var rule = fmkField_parseRule(ruleName);
            if (rule && rule.name == 'required') {
                return typeof (v) !== 'undefined' && v !== '';
            }
            //else, we dont know how to deal with the rule so we ignore it (the server will do the validation)
            return true;
        }
    });

    $.fieldFactory.register('HtmlField', 'fmkHtmlField');

})(jQuery);


/* =============================================================================
 * getFmkFieldValue, setFmkFieldValue && validateFmkField
 * ============================================================================ */
(function ($) {
    $.fn.getFmkFieldValue = function () {
        return $(this).getFmkWidget().getValue();
    };

    $.fn.getFmkFieldText = function () {
        return $(this).getFmkWidget().getText();
    };

    $.fn.validateFmkField = function (ruleName, args) {
        return $(this).getFmkWidget().validate(ruleName, args);
    };

    $.fn.setFmkFieldValue = function (value) {
        $(this).getFmkWidget().setValue(value);
        return $(this);
    };
    $.fn.reloadFmkField = function (changedFieldId, formValues) {
        var field = $(this).getFmkWidget();
        if (typeof field.reload === 'function') {
            field.reload(changedFieldId, formValues);
        }
        return $(this);
    };
})(jQuery);

// Private common functions
function fmkField_jsonPathFormat(jsonPath, isStartOfPath) {
    var res = jsonPath.replace('$.', '').replace('$', '').replace('.', '>');
    if (isStartOfPath && res.length > 0) {
        res += '>';
    }
    return res;
}

function fmkField_parseRule(ruleName) {
    if (ruleName) {
        var nameAndArg = ruleName.split('=');
        nameAndArg.length > 1 ? nameAndArg[1] = ruleName.substring(ruleName.indexOf('=') + 1) : null;
        return {
            name: nameAndArg[0],
            arg: nameAndArg.length > 1 ? nameAndArg[1] : null
        };
    }
    return null;
}

function fmkField_translate(key) {
    if (Fmk.I18n)
        return Fmk.I18n._(key, 'Resources', 'WEBAPPS.GUI');

    console.warn('Fmk.I18n is not defined on fmk_fields');
    return key;
}

function fmkField_getUserCulture() {
    if (Fmk.I18n) 
        return Fmk.I18n.getCulture();

    return 'en-US';
}

function fmkField_getRemoteUrl(href, mandatoryDependencies, dependencies, tplEngine, isOptional) {

    var allDependenciesReady = true;

    if (mandatoryDependencies != null) {
        $.each(mandatoryDependencies,
            function (index, value) {
                if (!Object.keys(dependencies).includes(value))
                    allDependenciesReady = false;
            });

        if (allDependenciesReady) {
            $.each(dependencies,
                function (index, value) {
                    if (typeof value == 'undefined' || value === null || value.length === 0) {
                        allDependenciesReady = false;
                        return false;
                    }
                });
        }
    }

    return allDependenciesReady || isOptional ? tplEngine.render(href, dependencies || {}) : null;
}
