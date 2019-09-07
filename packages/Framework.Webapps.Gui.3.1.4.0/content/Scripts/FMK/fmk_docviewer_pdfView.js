/* =============================================================================
 * PDF view widget
 * =============================================================================
 * Display a document pdf
 * ============================================================================ */
(function ($, PDFJS) {

    $.widget('fmkPdfView', {

        _pdfDoc: null,
        _pageNum: 1,
        _pageRotation: 0,
        _scale: 1,
        _canvas: null,
        _ctx: null,

        _init: function () {
            this.elem.empty();
            
            this.elem.addClass('fmk-pdfview');
            this._canvas = $('<canvas class="fmk-pdf-canvas" />')
                .appendTo(this.elem)[0];
 
            this._ctx = this._canvas.getContext('2d');

            this.loadDoc();
        },
        loadDoc: function () {
            PDFJS.getDocument(this.options.url).then(function (pdfDoc_) {
                this._pdfDoc = pdfDoc_;
                this._scale = 0;

                // Initial/first page rendering
                this.renderPage(this._pageNum);
            }.bind(this));
        },

        renderPage: function (num, rotation) {
            // Using promise to fetch the page
            this._pdfDoc.getPage(num).then(function (page) {
                this._pageRotation = typeof rotation === 'undefined' ? page.rotate : rotation;
                this._scale = this._scale || this.elem.width() / page.getViewport(1.0, this._pageRotation).width
                var viewport = page.getViewport(this._scale, this._pageRotation);
                this._canvas.height = viewport.height;
                this._canvas.width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: this._ctx,
                    viewport: viewport
                };
                page.render(renderContext);
            }.bind(this));
        },

        rotate: function (angle) {
            this.renderPage(this._pageNum, this._pageRotation + angle);
        },

        zoom: function (ratio) {
            this._scale = (this._scale * ratio).toFixed(2);
            this.renderPage(this._pageNum);
        },

        gotoPage: function (page) {
            this._pageNum = Math.min(Math.max(page, 1), this._pdfDoc.numPages);
            this.renderPage(this._pageNum);
        },

        getPageNum: function () {
            return this._pageNum;
        }

    });

    $.widgetFactory.registerForType('pdf', 'fmkPdfView');

})(jQuery, window.PDFJS);