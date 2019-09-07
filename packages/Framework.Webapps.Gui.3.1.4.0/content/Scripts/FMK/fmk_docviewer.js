/* =============================================================================
 * Doc viewer widget
 * =============================================================================
 * Display a document (pdf, jpg, png), view some manipulations
 * ============================================================================ */
(function ($, PDFJS) {

    $.widget('fmkDocviewer', {

        _dragging: false,
        _rotationDegrees: 90,
        _zoomRatio: 1.1,
        _currentDocIndex: 0,

        _init: function () {
            this.options = $.extend(true, {}, $.fn.fmkDocviewer.defaults, this.options);
            this.elem.empty();
            
            this.elem.addClass('fmk-docviewer');
            this.container = $('<div class="fmk-docviewer-container" />').appendTo(this.elem);
            
            this.elem.on("mousemove", this.onDrag.bind(this));
            this.elem.on("mouseup", this.onEndDrag.bind(this));
            this.elem.on("mouseout", this.onEndDrag.bind(this));

            if (this.options.docs) {
                if (!Array.isArray(this.options.docs)) {
                    this.options.docs = [this.options.docs];
                }

                this.initToolbar();
                this.initDocNavigation();
                this.loadDoc(this._currentDocIndex);
            }
        },

        initToolbar: function () {
            $('<div class="fmk-docviewer-toolbar fmk-no-select" />').appendTo(this.elem)
                .append('<button class="bar-inline__item btn btn--hover-purple btn--icon-magnifier-plus-medium-purple btn--icon-magnifier-plus-medium-purple--hover fmk-zoomin"/>')
                .append('<button class="bar-inline__item btn btn--hover-purple btn--icon-magnifier-less-medium-purple btn--icon-magnifier-less-medium-purple--hover fmk-zoomout"/>')
                .append('<button class="bar-inline__item btn btn--hover-purple btn--icon-rotate-left-medium-purple btn--icon-rotate-left-medium-purple--hover fmk-antirotate"/>')
                .append('<button class="bar-inline__item btn btn--hover-purple btn--icon-rotate-right-medium-purple btn--icon-rotate-right-medium-purple--hover fmk-rotate"/>')
                .append('<button class="bar-inline__item btn btn--hover-purple btn--icon-arrow-empty-medium-left-purple btn--icon-arrow-empty-medium-left-purple--hover fmk-prevpage" style="display: none"/>')
                .append('<button class="bar-inline__item btn btn--hover-purple btn--icon-arrow-empty-medium-right-purple btn--icon-arrow-empty-medium-right-purple--hover fmk-nextpage" style="display: none"/>');

            // Register toolbar events
            this._on({
                event: 'click', selector: '.fmk-zoomin', handler: function (ev) {
                    this._view.data('widget').zoom(this._zoomRatio);
                }
            });

            this._on({
                event: 'click', selector: '.fmk-zoomout', handler: function (ev) {
                    this._view.data('widget').zoom(1 / this._zoomRatio);
                }
            });

            this._on({
                event: 'click', selector: '.fmk-rotate', handler: function (ev) {
                    this._view.data('widget').rotate(this._rotationDegrees);
                }
            });

            this._on({
                event: 'click', selector: '.fmk-antirotate', handler: function (ev) {
                    this._view.data('widget').rotate(-this._rotationDegrees);
                }
            });

            this._on({
                event: 'click', selector: '.fmk-nextpage', handler: function (ev) {
                    this._view.data('widget').gotoPage(this._view.data('widget').getPageNum() + 1);
                }
            });

            this._on({
                event: 'click', selector: '.fmk-prevpage', handler: function (ev) {
                    this._view.data('widget').gotoPage(this._view.data('widget').getPageNum() - 1);
                }
            });
        },

        initDocNavigation: function () {
            var pager = $('<div class="fmk-docviewer-pager"/>').appendTo(this.elem)
                .append('<span class="fmk-docviewer-current" />')
                .append('<button class="fmk-prevdoc hidden">&lt;</button>')
                .append('<button class="fmk-nextdoc hidden">&gt;</button>');
            if (Array.isArray(this.options.docs) && this.options.docs.length > 1) {
                this.elem.find('.fmk-prevdoc, .fmk-nextdoc').removeClass('hidden');
            }
            pager.find('.fmk-docviewer-current').html((this._currentDocIndex + 1) + ' / ' + this.options.docs.length);
            this._on({
                event: 'click', selector: '.fmk-prevdoc', handler: function (ev) {
                    this._currentDocIndex = --this._currentDocIndex % this.options.docs.length;
                    if (this._currentDocIndex < 0) {
                        this._currentDocIndex = this.options.docs.length - 1;
                    }
                    this.loadDoc(this._currentDocIndex);
                    pager.find('.fmk-docviewer-current').html((this._currentDocIndex + 1) + ' / ' + this.options.docs.length);
                }
            });

            this._on({
                event: 'click', selector: '.fmk-nextdoc', handler: function (ev) {
                    this._currentDocIndex = ++this._currentDocIndex % this.options.docs.length;
                    this.loadDoc(this._currentDocIndex);
                    pager.find('.fmk-docviewer-current').html((this._currentDocIndex + 1) + ' / ' + this.options.docs.length);
                }
            });
        },

        loadDoc: function (numDoc) {
            
            var doc = this.options.docs[numDoc];
            this.elem.find('.fmk-nextpage, .fmk-prevpage').hide();
            
            this.container.empty()
            this._view = $('<div class="fmk-doc-view" />')
                .appendTo(this.container);
            $(this._view).on("mousedown", this.onStartDrag.bind(this));

            if (doc && doc.type === 'pdf') {
                // Display next and prev page only if pdf
                this.elem.find('.fmk-nextpage, .fmk-prevpage').show();
                this._view.fmkPdfView(doc);
            } else if (doc && doc.type === 'img') {
                this._view.fmkImgView(doc);
            }
        },

        onStartDrag: function (e) {
            // remember some data to use during onDrag or onDragEnd
            var box = $(e.target);
            this._dragging = {
                el: box,
                evPos: { top: e.pageY, left: e.pageX },
                elPos: box.offset()
            };
        },

        onDrag: function (e) {
            if (this._dragging) {
                //set the position of the box to be oldPos+translation(ev)
                var curOffset = this._dragging.el.offset();
                var newOffset = {
                    top: curOffset.top + (e.pageY - this._dragging.evPos.top),
                    left: curOffset.left + (e.pageX - this._dragging.evPos.left)
                };
                this._dragging.evPos = { top: e.pageY, left: e.pageX };
                this._dragging.el.offset(newOffset);
            }
        },

        onEndDrag: function (e) {
            if (this._dragging) {
                this._dragging = null;
            }
        }


    });

    // Defaults
    $.fn.fmkDocviewer.defaults = {
        // variables
        contract: null,
        entity: null,
        user: null,

        // callbacks
        action: function () { },
    };

    $.widgetFactory.registerForType('docViewer', 'fmkDocviewer');

})(jQuery, window.PDFJS);