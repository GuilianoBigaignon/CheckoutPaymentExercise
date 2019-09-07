/* =============================================================================
 * ChangePasswordForm
 * =============================================================================
 * Display a for to change user password
 * Expected options :
 * ============================================================================ */

(function ($, utils, i18n) {

    $.widget('fmkChangePasswordForm', {
        _init: function () {
            this.translations = {};
            $.getJSON("/I18N.API/i18n/domains/AUTH.HTML/cultures/" + i18n.getCulture()).done(function (translations) {
                $.each(translations.data.translations, function (k, v) {
                    this.translations[v.key] = v.value;
                }.bind(this));
                $.getJSON("/AUTH.API/changePasswordAllowed").done(function (changePasswordAllowed) {
                    this.createForm();
                    if (!changePasswordAllowed) {
                        this.elem.find('fieldset').hide();
                        this.elem.find('.fmk-form-submit').hide();
                        $("<div style='color:black'>" + this.translations["Fmk_changePasswordForm_NotAllowed"] + "</div>")
                            .appendTo(this.elem.find('.fmk-change-password-form'));
                    }
                }.bind(this))                
            }.bind(this));
        },

        createForm: function () {
            var requiredLabel = this.translations.Fmk_changePasswordForm_requiredLabel;
            var formContract = {
                data: {
                    fields: [{
                        id: 'oldPassword',
                        label: this.translations.Fmk_changePasswordForm_currentPasswordLabel,
                        type: 'PasswordField',
                        mapping: 'oldPassword',
                        rules:[
                            {
                                name: 'required',
                                message: requiredLabel
                            }
                        ]
                    },
                    {
                        id: 'newPassword',
                        label: this.translations.Fmk_changePasswordForm_newPasswordLabel,
                        type: 'PasswordField',
                        mapping: 'newPassword',
                        rules: [
                            {
                                name: 'required',
                                message: requiredLabel
                            }
                        ]
                    },
                    {
                        id: 'retypeNewPassword',
                        label: this.translations.Fmk_changePasswordForm_retypeNewPasswordLabel,
                        type: 'PasswordField',
                        mapping: 'retypeNewPassword',
                        rules: [
                            {
                                name: 'required',
                                message: requiredLabel
                            }
                        ]
                    }],
                    binaryFieldNames: [],
                    linksDesc: {
                        submit: {
                            href: '/AUTH.API/changePassword',
                            resourceType: 'httpResponseMessage',
                            method: 'POST',
                            label: this.translations.Fmk_changePasswordForm_currentPasswordLabel
                        }
                    },
                    name: 'changePasswordForm',
                    label: this.translations.Fmk_changePasswordForm,
                    type: 'form'
                }
            };

            //create form
            this.elem.empty();
            this.form = $('<div>')
                        .appendTo(this.elem)
                        .addClass('fmk-popin modal-content fmk-change-password-form')
                        .fmkForm(
                            {
                                contract: formContract,
                                actionLink: formContract.data.linksDesc.submit,
                                noSplit: true,
                                success: this.onSuccess.bind(this),
                                cancel: this.onCancel.bind(this)
                            }
                        );
            var translations = this.translations;
            this.form.getFmkWidget().onSubmitFail = function(jqXhr) {
                if (jqXhr.status == 412 || jqXhr.status == 403) {
                    //do nothing, this will be handled by fmk_auth
                    return;
                }
                if (jqXhr.status == 500) {
                    //this is an unexpected error => display a generic message
                    this.displayAlert(i18n._('Fmk_Form_Error500', 'Resources', 'WEBAPPS.GUI') + this.formatException(jqXhr.responseText));
                    return;
                }
                //this is a business error => display the message coming from the server
                this.options.error && this.options.error.call(null, JSON.parse(jqXhr.responseText));
                this.elem.trigger("error", [JSON.parse(jqXhr.responseText)]);
                this.displayAlert(translations[JSON.parse(jqXhr.responseText).exceptionMessage]);
            }
        },

        onSuccess: function (response) {
             $("<div></div>")
                .append('<p>' + this.translations[response.changePasswordStatusLabelCode] + '</p>')
                .jqxNotification({ width: 350, position: "top-right", opacity: 0.9, autoOpen: true, autoClose: true, template: "info" });

            this.elem.modal('hide');
        },

        onCancel: function () {
            this.elem.modal('hide');
        },

    });

    $.widgetFactory.registerForName('changePasswordForm', 'fmkChangePasswordForm');

})(jQuery, Fmk.Utils, Fmk.I18n);