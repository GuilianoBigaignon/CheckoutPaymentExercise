/* 
   widget to manage export data file from searchable list
*/
(function ($) {
    $.widget('fmkSearchableListExport', {
        _init: function () {

            //Build link with criteria
            var actionLink = this.options.actionLink;
            var criteriaObj = this.options.entity.data.criteria ? this.options.entity.data.criteria : {};

            var container = $('<div />').appendTo(this.elem);
            var form = $('<form target="_blank" />').appendTo(container);
            form.hide()
                .prop('method', actionLink.method)
                .prop('action', actionLink.href);
            var hidden = $('<input type="hidden" name="criteria">').appendTo(form);
            hidden.attr('value', JSON.stringify(criteriaObj));
            form.submit();

            setTimeout(function () {
                this.elem.trigger('success', ['searchableListExport'])
            }.bind(this), 500);

        }
    });
    $.widgetFactory.registerForType('searchableListExport', 'fmkSearchableListExport');
})(jQuery);