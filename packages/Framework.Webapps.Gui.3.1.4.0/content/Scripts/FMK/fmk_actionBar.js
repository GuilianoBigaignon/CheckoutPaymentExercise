/* =============================================================================
 * Tile widget
 * =============================================================================
 * Display a tile in a dashboard, for instance
 * ============================================================================ */
(function ($) {

    $.widget('fmkActionBar', {
        _init: function () {
            this.options = $.extend(true, {}, $.fn.fmkActionBar.defaults, this.options);
            this.elem.addClass('fmk-actionBar bar-inline bar-inline--grey');
            $('<div class="bar-inline__left fmk-actionBar-left" ><span class="bar-inline__item fmk-btn" style="min-width:0;width:0;"></span></div>').appendTo(this.elem);
            $('<div class="bar-inline__right fmk-actionBar-right" />').appendTo(this.elem);

            $('<div class="bar-inline__item fmk-action-container" />').appendTo(this.elem.find('.bar-inline__right'))
                .append(
                    $('<button class="bar-inline__item btn btn--border-left btn--hover-purple fmk-action-button" style="padding-left:10px;padding-right:10px;">Actions</button>')
                        .on('click', function () {
                            $(this).toggleClass('active');
                            $(this).siblings().toggleClass('active');
                        })
                        // The button is initially hidden to avoid blinking when there is no action
                        .hide()
                )
                .append('<div class="fmk-auto-scroll fmk-action-content fmk-content-2-header menu"/>');

            if (this.options.filterEl && this.options.filterEl.getFmkWidget().displayable) {
                $('<div class="bar-inline__item fmk-filter-container" />').appendTo(this.elem.find('.bar-inline__right'))
                    .append(
                        $('<button class="btn btn--border-left btn--hover-purple btn--icon-filter-medium-purple btn--icon-filter-medium-purple--hover" />')
                            .on('click', function () {
                                $(this).siblings().toggleClass('active');
                            })
                    )
                    .append('<div class="fmk-auto-scroll fmk-filter-content fmk-content-2-header menu"/>');
                this.elem.find('.fmk-filter-content').append(this.options.filterEl);

                //Register to facet change for display
                if (this.options.displayFacets) {
                    this.facetsBar = this.elem.find('.fmk-actionBar-left').addClass('fmk-actionBar-facets-container');
                    $('<button class="btn prev">&lt;</button>').on('click', this.moveFacets.bind(this)).hide().appendTo(this.facetsBar);

                    $('<button class="btn next">&gt;</button>').on('click', this.moveFacets.bind(this)).hide().appendTo(this.facetsBar);

                    this.options.filterEl.on('actionFilterChanged', function (ev, field, value, activated, isMultiple, cbk) {
                        if (!isMultiple) {
                            this.elem.find('.fmk-actionBar-left .fmk-actionBar-facet[data-facet-id="{0}"]'
                                .replace('{0}', field)
                            ).remove();
                            if (activated) {
                                this.addFacet(field, value, cbk);
                            }
                        }
                        else if (activated) {
                            this.addFacet(field, value, cbk);
                        } else {
                            // cbk inutile car l'event 'valueChanged' est déja déclenché par le clic sur le fmkFacetedSearchField
                            this.removeFacet(field, value);
                        }
                    }.bind(this));

                }
            }

            // Mask menus if click outside
            $(document).on('click', function (event) {
                if (!$(event.target).closest('.fmk-filter-container').length) {
                    this.elem.find('.fmk-filter-content').removeClass('active');
                }
                if (!$(event.target).closest('.fmk-action-container').length) {
                    this.elem.find('.fmk-action-content').removeClass('active');
                }
            }.bind(this));

        },
        refreshActions: function (actions) {
            this.elem.find('.fmk-action-content').empty();
            actions.forEach(function (action) {
                this.elem.find('.fmk-action-content').append(action);
            }.bind(this));
            if (actions.length > 0) {
                this.elem.find('.fmk-action-button').show();
            } else {
                this.elem.find('.fmk-action-button').hide();
            }
        },
        addFacet: function (field, value, cbk) {
            var button = $('<button class="fmk-actionBar-facet bar-inline__item bar-inline__item--mg-left btn btn--small btn--border-white btn--text btn--text--icon btn--text--icon--right btn--hover-white btn--icon-cross-small-white btn--icon-cross-small-white--hover" data-facet-id="{1}" data-facet-value="{0}" data><span class="btn__inner">{2}</span></button>'
                .replace('{0}', value)
                .replace('{1}', field)
                .replace('{2}', value)).appendTo(this.elem.find('.fmk-actionBar-left'))
                .on('click', function (ev) {
                    this.removeFacet(field, value);
                    cbk && cbk(value);
                }.bind(this));

            this.facetsBar.find('.fmk-actionBar-facet').stop(true).css({ right: 0 });
            this.moveFacets({ currentTarget: button });

            return button;
        },
        removeFacet: function (field, value) {
            this.elem.find('.fmk-actionBar-left .fmk-actionBar-facet[data-facet-id="{0}"][data-facet-value="{1}"]'
                .replace('{0}', field)
                .replace('{1}', value)
            ).remove();

            var buttons = this.facetsBar.find('.fmk-actionBar-facet').stop(true).css({ right: 0 });
            this.moveFacets({ currentTarget: buttons.first() });
        },
        moveFacets: function (event) {

            var maxWidth = this.elem.width() - this.facetsBar.offset().left - this.elem.find('.fmk-actionBar-right').width();
            this.facetsBar.css('max-width', maxWidth);

            if ($(event.currentTarget).hasClass('prev'))
                this.facetsBar.find('.fmk-actionBar-facet').animate({ right: "-=50px" });
            else if ($(event.currentTarget).hasClass('next'))
                this.facetsBar.find('.fmk-actionBar-facet').animate({ right: "+=50px" });

            var parent = event.currentTarget.closest('.fmk-actionBar-facets-container');
            var buttons = $(parent).find('.fmk-actionBar-facet');

            if (buttons.length && buttons.first().position().left < 15)
                this.facetsBar.find('.btn.prev').show();
            else {
                if (this.facetsBar.find('.btn.prev').is(':visible'))
                    this.facetsBar.find('.fmk-actionBar-facet').stop(true).css({ right: 0 });
                this.facetsBar.find('.btn.prev').hide();
            }

            if (buttons.length && buttons.last().position().left + buttons.last().width() > $(parent).width())
                this.facetsBar.find('.btn.next').show();
            else {
                if (this.facetsBar.find('.btn.next').is(':visible'))
                    this.facetsBar.find('.fmk-actionBar-facet').stop(true);
                this.facetsBar.find('.btn.next').hide();
            }
        }
    });

    // Defaults
    $.fn.fmkActionBar.defaults = {
        // variables
        contract: null,
        entity: null,
        user: null,
        filterEl: null,
        displayFacets: true,

        // callbacks
        action: function () { },
    };

    $.widgetFactory.registerForType('actionBar', 'fmkActionBar');

})(jQuery);