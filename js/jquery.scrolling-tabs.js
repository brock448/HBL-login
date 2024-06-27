;
(function($, window) {
    'use strict';
    var CONSTANTS = {
        CONTINUOUS_SCROLLING_TIMEOUT_INTERVAL: 50,
        SCROLL_OFFSET_FRACTION: 6,
        DATA_KEY_DDMENU_MODIFIED: 'scrtabsddmenumodified',
        DATA_KEY_IS_MOUSEDOWN: 'scrtabsismousedown',
        CSS_CLASSES: {
            BOOTSTRAP4: 'scrtabs-bootstrap4',
            RTL: 'scrtabs-rtl',
            SCROLL_ARROW_CLICK_TARGET: 'scrtabs-click-target',
            SCROLL_ARROW_DISABLE: 'scrtabs-disable',
            SCROLL_ARROW_WITH_CLICK_TARGET: 'scrtabs-with-click-target'
        },
        SLIDE_DIRECTION: {
            LEFT: 1,
            RIGHT: 2
        },
        EVENTS: {
            CLICK: 'click.scrtabs',
            DROPDOWN_MENU_HIDE: 'hide.bs.dropdown.scrtabs',
            DROPDOWN_MENU_SHOW: 'show.bs.dropdown.scrtabs',
            FORCE_REFRESH: 'forcerefresh.scrtabs',
            MOUSEDOWN: 'mousedown.scrtabs',
            MOUSEUP: 'mouseup.scrtabs',
            TABS_READY: 'ready.scrtabs',
            TOUCH_END: 'touchend.scrtabs',
            TOUCH_MOVE: 'touchmove.scrtabs',
            TOUCH_START: 'touchstart.scrtabs',
            WINDOW_RESIZE: 'resize.scrtabs'
        }
    };
    (function(sr) {
        var debounce = function(func, threshold, execAsap) {
            var timeout;
            return function debounced() {
                var obj = this,
                    args = arguments;

                function delayed() {
                    if (!execAsap) {
                        func.apply(obj, args);
                    }
                    timeout = null;
                }
                if (timeout) {
                    clearTimeout(timeout);
                } else if (execAsap) {
                    func.apply(obj, args);
                }
                timeout = setTimeout(delayed, threshold || 100);
            };
        };
        $.fn[sr] = function(fn, customEventName) {
            var eventName = customEventName || CONSTANTS.EVENTS.WINDOW_RESIZE;
            return fn ? this.bind(eventName, debounce(fn)) : this.trigger(sr);
        };
    })('smartresizeScrtabs');

    function ElementsHandler(scrollingTabsControl) {
        var ehd = this;
        ehd.stc = scrollingTabsControl;
    }
    (function(p) {
        p.initElements = function(options) {
            var ehd = this;
            ehd.setElementReferences(options);
            ehd.setEventListeners(options);
        };
        p.listenForTouchEvents = function() {
            var ehd = this,
                stc = ehd.stc,
                smv = stc.scrollMovement,
                ev = CONSTANTS.EVENTS;
            var touching = false;
            var touchStartX;
            var startingContainerLeftPos;
            var newLeftPos;
            stc.$movableContainer.on(ev.TOUCH_START, function(e) {
                touching = true;
                startingContainerLeftPos = stc.movableContainerLeftPos;
                touchStartX = e.originalEvent.changedTouches[0].pageX;
            }).on(ev.TOUCH_END, function() {
                touching = false;
            }).on(ev.TOUCH_MOVE, function(e) {
                if (!touching) {
                    return;
                }
                var touchPageX = e.originalEvent.changedTouches[0].pageX;
                var diff = touchPageX - touchStartX;
                if (stc.rtl) {
                    diff = -diff;
                }
                var minPos;
                newLeftPos = startingContainerLeftPos + diff;
                if (newLeftPos > 0) {
                    newLeftPos = 0;
                } else {
                    minPos = smv.getMinPos();
                    if (newLeftPos < minPos) {
                        newLeftPos = minPos;
                    }
                }
                stc.movableContainerLeftPos = newLeftPos;
                var leftOrRight = stc.rtl ? 'right' : 'left';
                stc.$movableContainer.css(leftOrRight, smv.getMovableContainerCssLeftVal());
                smv.refreshScrollArrowsDisabledState();
            });
        };
        p.refreshAllElementSizes = function() {
            var ehd = this,
                stc = ehd.stc,
                smv = stc.scrollMovement,
                scrollArrowsWereVisible = stc.scrollArrowsVisible,
                actionsTaken = {
                    didScrollToActiveTab: false
                },
                isPerformingSlideAnim = false,
                minPos;
            ehd.setElementWidths();
            ehd.setScrollArrowVisibility();
            if (stc.scrollArrowsVisible) {
                minPos = smv.getMinPos();
                isPerformingSlideAnim = smv.scrollToActiveTab({
                    isOnWindowResize: true
                });
                if (!isPerformingSlideAnim) {
                    smv.refreshScrollArrowsDisabledState();
                    if (stc.rtl) {
                        if (stc.movableContainerRightPos < minPos) {
                            smv.incrementMovableContainerLeft(minPos);
                        }
                    } else {
                        if (stc.movableContainerLeftPos < minPos) {
                            smv.incrementMovableContainerRight(minPos);
                        }
                    }
                }
                actionsTaken.didScrollToActiveTab = true;
            } else if (scrollArrowsWereVisible) {
                stc.movableContainerLeftPos = 0;
                smv.slideMovableContainerToLeftPos();
            }
            return actionsTaken;
        };
        p.setElementReferences = function(settings) {
            var ehd = this,
                stc = ehd.stc,
                $tabsContainer = stc.$tabsContainer,
                $leftArrow, $rightArrow, $leftArrowClickTarget, $rightArrowClickTarget;
            stc.isNavPills = false;
            if (stc.rtl) {
                $tabsContainer.addClass(CONSTANTS.CSS_CLASSES.RTL);
            }
            if (stc.usingBootstrap4) {
                $tabsContainer.addClass(CONSTANTS.CSS_CLASSES.BOOTSTRAP4);
            }
            stc.$fixedContainer = $tabsContainer.find('.scrtabs-tabs-fixed-container');
            $leftArrow = stc.$fixedContainer.prev();
            $rightArrow = stc.$fixedContainer.next();
            if (settings.leftArrowContent) {
                $leftArrowClickTarget = $leftArrow.find('.' + CONSTANTS.CSS_CLASSES.SCROLL_ARROW_CLICK_TARGET);
            }
            if (settings.rightArrowContent) {
                $rightArrowClickTarget = $rightArrow.find('.' + CONSTANTS.CSS_CLASSES.SCROLL_ARROW_CLICK_TARGET);
            }
            if ($leftArrowClickTarget && $leftArrowClickTarget.length) {
                $leftArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_WITH_CLICK_TARGET);
            } else {
                $leftArrowClickTarget = $leftArrow;
            }
            if ($rightArrowClickTarget && $rightArrowClickTarget.length) {
                $rightArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_WITH_CLICK_TARGET);
            } else {
                $rightArrowClickTarget = $rightArrow;
            }
            stc.$movableContainer = $tabsContainer.find('.scrtabs-tabs-movable-container');
            stc.$tabsUl = $tabsContainer.find('.nav-tabs');
            if (!stc.$tabsUl.length) {
                stc.$tabsUl = $tabsContainer.find('.nav-pills');
                if (stc.$tabsUl.length) {
                    stc.isNavPills = true;
                }
            }
            stc.$tabsLiCollection = stc.$tabsUl.find('> li');
            stc.$slideLeftArrow = stc.reverseScroll ? $leftArrow : $rightArrow;
            stc.$slideLeftArrowClickTarget = stc.reverseScroll ? $leftArrowClickTarget : $rightArrowClickTarget;
            stc.$slideRightArrow = stc.reverseScroll ? $rightArrow : $leftArrow;
            stc.$slideRightArrowClickTarget = stc.reverseScroll ? $rightArrowClickTarget : $leftArrowClickTarget;
            stc.$scrollArrows = stc.$slideLeftArrow.add(stc.$slideRightArrow);
            stc.$win = $(window);
        };
        p.setElementWidths = function() {
            var ehd = this,
                stc = ehd.stc;
            stc.winWidth = stc.$win.width();
            stc.scrollArrowsCombinedWidth = stc.$slideLeftArrow.outerWidth() + stc.$slideRightArrow.outerWidth();
            ehd.setFixedContainerWidth();
            ehd.setMovableContainerWidth();
        };
        p.setEventListeners = function(settings) {
            var ehd = this,
                stc = ehd.stc,
                evh = stc.eventHandlers,
                ev = CONSTANTS.EVENTS,
                resizeEventName = ev.WINDOW_RESIZE + stc.instanceId;
            if (settings.enableSwiping) {
                ehd.listenForTouchEvents();
            }
            stc.$slideLeftArrowClickTarget.off('.scrtabs').on(ev.MOUSEDOWN, function(e) {
                evh.handleMousedownOnSlideMovContainerLeftArrow.call(evh, e);
            }).on(ev.MOUSEUP, function(e) {
                evh.handleMouseupOnSlideMovContainerLeftArrow.call(evh, e);
            }).on(ev.CLICK, function(e) {
                evh.handleClickOnSlideMovContainerLeftArrow.call(evh, e);
            });
            stc.$slideRightArrowClickTarget.off('.scrtabs').on(ev.MOUSEDOWN, function(e) {
                evh.handleMousedownOnSlideMovContainerRightArrow.call(evh, e);
            }).on(ev.MOUSEUP, function(e) {
                evh.handleMouseupOnSlideMovContainerRightArrow.call(evh, e);
            }).on(ev.CLICK, function(e) {
                evh.handleClickOnSlideMovContainerRightArrow.call(evh, e);
            });
            if (stc.tabClickHandler) {
                stc.$tabsLiCollection.find('a[data-toggle="tab"]').off(ev.CLICK).on(ev.CLICK, stc.tabClickHandler);
            }
            stc.$win.off(resizeEventName).smartresizeScrtabs(function(e) {
                evh.handleWindowResize.call(evh, e);
            }, resizeEventName);
            $('body').on(CONSTANTS.EVENTS.FORCE_REFRESH, stc.elementsHandler.refreshAllElementSizes.bind(stc.elementsHandler));
        };
        p.setFixedContainerWidth = function() {
            var ehd = this,
                stc = ehd.stc,
                tabsContainerRect = stc.$tabsContainer.get(0).getBoundingClientRect();
            stc.fixedContainerWidth = tabsContainerRect.width || (tabsContainerRect.right - tabsContainerRect.left);
            stc.fixedContainerWidth = stc.fixedContainerWidth * stc.widthMultiplier;
            stc.$fixedContainer.width(stc.fixedContainerWidth);
        };
        p.setFixedContainerWidthForHiddenScrollArrows = function() {
            var ehd = this,
                stc = ehd.stc;
            stc.$fixedContainer.width(stc.fixedContainerWidth);
        };
        p.setFixedContainerWidthForVisibleScrollArrows = function() {
            var ehd = this,
                stc = ehd.stc;
            stc.$fixedContainer.width(stc.fixedContainerWidth - stc.scrollArrowsCombinedWidth);
        };
        p.setMovableContainerWidth = function() {
            var ehd = this,
                stc = ehd.stc,
                $tabLi = stc.$tabsUl.find('> li');
            stc.movableContainerWidth = 0;
            if ($tabLi.length) {
                $tabLi.each(function() {
                    var $li = $(this),
                        totalMargin = 0;
                    if (stc.isNavPills) {
                        totalMargin = parseInt($li.css('margin-left'), 10) + parseInt($li.css('margin-right'), 10);
                    }
                    stc.movableContainerWidth += ($li.outerWidth() + totalMargin);
                });
                stc.movableContainerWidth += 1;
                if (stc.movableContainerWidth < stc.fixedContainerWidth) {
                    stc.movableContainerWidth = stc.fixedContainerWidth;
                }
            }
            stc.$movableContainer.width(stc.movableContainerWidth);
        };
        p.setScrollArrowVisibility = function() {
            var ehd = this,
                stc = ehd.stc,
                shouldBeVisible = stc.movableContainerWidth > stc.fixedContainerWidth;
            if (shouldBeVisible && !stc.scrollArrowsVisible) {
                stc.$scrollArrows.show();
                stc.scrollArrowsVisible = true;
            } else if (!shouldBeVisible && stc.scrollArrowsVisible) {
                stc.$scrollArrows.hide();
                stc.scrollArrowsVisible = false;
            }
            if (stc.scrollArrowsVisible) {
                ehd.setFixedContainerWidthForVisibleScrollArrows();
            } else {
                ehd.setFixedContainerWidthForHiddenScrollArrows();
            }
        };
    }(ElementsHandler.prototype));

    function EventHandlers(scrollingTabsControl) {
        var evh = this;
        evh.stc = scrollingTabsControl;
    }
    (function(p) {
        p.handleClickOnSlideMovContainerLeftArrow = function() {
            var evh = this,
                stc = evh.stc;
            stc.scrollMovement.incrementMovableContainerLeft();
        };
        p.handleClickOnSlideMovContainerRightArrow = function() {
            var evh = this,
                stc = evh.stc;
            stc.scrollMovement.incrementMovableContainerRight();
        };
        p.handleMousedownOnSlideMovContainerLeftArrow = function() {
            var evh = this,
                stc = evh.stc;
            stc.$slideLeftArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, true);
            stc.scrollMovement.continueSlideMovableContainerLeft();
        };
        p.handleMousedownOnSlideMovContainerRightArrow = function() {
            var evh = this,
                stc = evh.stc;
            stc.$slideRightArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, true);
            stc.scrollMovement.continueSlideMovableContainerRight();
        };
        p.handleMouseupOnSlideMovContainerLeftArrow = function() {
            var evh = this,
                stc = evh.stc;
            stc.$slideLeftArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, false);
        };
        p.handleMouseupOnSlideMovContainerRightArrow = function() {
            var evh = this,
                stc = evh.stc;
            stc.$slideRightArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN, false);
        };
        p.handleWindowResize = function() {
            var evh = this,
                stc = evh.stc,
                newWinWidth = stc.$win.width();
            if (newWinWidth === stc.winWidth) {
                return false;
            }
            stc.winWidth = newWinWidth;
            stc.elementsHandler.refreshAllElementSizes();
        };
    }(EventHandlers.prototype));

    function ScrollMovement(scrollingTabsControl) {
        var smv = this;
        smv.stc = scrollingTabsControl;
    }
    (function(p) {
        p.continueSlideMovableContainerLeft = function() {
            var smv = this,
                stc = smv.stc;
            setTimeout(function() {
                if (stc.movableContainerLeftPos <= smv.getMinPos() || !stc.$slideLeftArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN)) {
                    return;
                }
                if (!smv.incrementMovableContainerLeft()) {
                    smv.continueSlideMovableContainerLeft();
                }
            }, CONSTANTS.CONTINUOUS_SCROLLING_TIMEOUT_INTERVAL);
        };
        p.continueSlideMovableContainerRight = function() {
            var smv = this,
                stc = smv.stc;
            setTimeout(function() {
                if (stc.movableContainerLeftPos >= 0 || !stc.$slideRightArrowClickTarget.data(CONSTANTS.DATA_KEY_IS_MOUSEDOWN)) {
                    return;
                }
                if (!smv.incrementMovableContainerRight()) {
                    smv.continueSlideMovableContainerRight();
                }
            }, CONSTANTS.CONTINUOUS_SCROLLING_TIMEOUT_INTERVAL);
        };
        p.decrementMovableContainerLeftPos = function(minPos) {
            var smv = this,
                stc = smv.stc;
            stc.movableContainerLeftPos -= (stc.fixedContainerWidth / CONSTANTS.SCROLL_OFFSET_FRACTION);
            if (stc.movableContainerLeftPos < minPos) {
                stc.movableContainerLeftPos = minPos;
            } else if (stc.scrollToTabEdge) {
                smv.setMovableContainerLeftPosToTabEdge(CONSTANTS.SLIDE_DIRECTION.LEFT);
                if (stc.movableContainerLeftPos < minPos) {
                    stc.movableContainerLeftPos = minPos;
                }
            }
        };
        p.disableSlideLeftArrow = function() {
            var smv = this,
                stc = smv.stc;
            if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
                return;
            }
            stc.$slideLeftArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
        };
        p.disableSlideRightArrow = function() {
            var smv = this,
                stc = smv.stc;
            if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
                return;
            }
            stc.$slideRightArrow.addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
        };
        p.enableSlideLeftArrow = function() {
            var smv = this,
                stc = smv.stc;
            if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
                return;
            }
            stc.$slideLeftArrow.removeClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
        };
        p.enableSlideRightArrow = function() {
            var smv = this,
                stc = smv.stc;
            if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
                return;
            }
            stc.$slideRightArrow.removeClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
        };
        p.getMinPos = function() {
            var smv = this,
                stc = smv.stc;
            return stc.scrollArrowsVisible ? (stc.fixedContainerWidth - stc.movableContainerWidth - stc.scrollArrowsCombinedWidth) : 0;
        };
        p.getMovableContainerCssLeftVal = function() {
            var smv = this,
                stc = smv.stc;
            return (stc.movableContainerLeftPos === 0) ? '0' : stc.movableContainerLeftPos + 'px';
        };
        p.incrementMovableContainerLeft = function() {
            var smv = this,
                stc = smv.stc,
                minPos = smv.getMinPos();
            smv.decrementMovableContainerLeftPos(minPos);
            smv.slideMovableContainerToLeftPos();
            smv.enableSlideRightArrow();
            return (stc.movableContainerLeftPos === minPos);
        };
        p.incrementMovableContainerRight = function(minPos) {
            var smv = this,
                stc = smv.stc;
            if (minPos) {
                stc.movableContainerLeftPos = minPos;
            } else {
                stc.movableContainerLeftPos += (stc.fixedContainerWidth / CONSTANTS.SCROLL_OFFSET_FRACTION);
                if (stc.movableContainerLeftPos > 0) {
                    stc.movableContainerLeftPos = 0;
                } else if (stc.scrollToTabEdge) {
                    smv.setMovableContainerLeftPosToTabEdge(CONSTANTS.SLIDE_DIRECTION.RIGHT);
                }
            }
            smv.slideMovableContainerToLeftPos();
            smv.enableSlideLeftArrow();
            return (stc.movableContainerLeftPos === 0);
        };
        p.refreshScrollArrowsDisabledState = function() {
            var smv = this,
                stc = smv.stc;
            if (!stc.disableScrollArrowsOnFullyScrolled || !stc.scrollArrowsVisible) {
                return;
            }
            if (stc.movableContainerLeftPos >= 0) {
                smv.disableSlideRightArrow();
                smv.enableSlideLeftArrow();
                return;
            }
            if (stc.movableContainerLeftPos <= smv.getMinPos()) {
                smv.disableSlideLeftArrow();
                smv.enableSlideRightArrow();
                return;
            }
            smv.enableSlideLeftArrow();
            smv.enableSlideRightArrow();
        };
        p.scrollToActiveTab = function() {
            var smv = this,
                stc = smv.stc,
                $activeTab, $activeTabAnchor, activeTabLeftPos, activeTabRightPos, rightArrowLeftPos, leftScrollArrowWidth, rightScrollArrowWidth;
            if (!stc.scrollArrowsVisible) {
                return;
            }
            if (stc.usingBootstrap4) {
                $activeTabAnchor = stc.$tabsUl.find('li > .nav-link.active');
                if ($activeTabAnchor.length) {
                    $activeTab = $activeTabAnchor.parent();
                }
            } else {
                $activeTab = stc.$tabsUl.find('li.active');
            }
            if (!$activeTab || !$activeTab.length) {
                return;
            }
            rightScrollArrowWidth = stc.$slideRightArrow.outerWidth();
            activeTabLeftPos = $activeTab.offset().left - stc.$fixedContainer.offset().left;
            activeTabRightPos = activeTabLeftPos + $activeTab.outerWidth();
            rightArrowLeftPos = stc.fixedContainerWidth - rightScrollArrowWidth;
            if (stc.rtl) {
                leftScrollArrowWidth = stc.$slideLeftArrow.outerWidth();
                if (activeTabLeftPos < 0) {
                    stc.movableContainerLeftPos += activeTabLeftPos;
                    smv.slideMovableContainerToLeftPos();
                    return true;
                } else {
                    if (activeTabRightPos > rightArrowLeftPos) {
                        stc.movableContainerLeftPos += (activeTabRightPos - rightArrowLeftPos) + (2 * rightScrollArrowWidth);
                        smv.slideMovableContainerToLeftPos();
                        return true;
                    }
                }
            } else {
                if (activeTabRightPos > rightArrowLeftPos) {
                    stc.movableContainerLeftPos -= (activeTabRightPos - rightArrowLeftPos + rightScrollArrowWidth);
                    smv.slideMovableContainerToLeftPos();
                    return true;
                } else {
                    leftScrollArrowWidth = stc.$slideLeftArrow.outerWidth();
                    if (activeTabLeftPos < leftScrollArrowWidth) {
                        stc.movableContainerLeftPos += leftScrollArrowWidth - activeTabLeftPos;
                        smv.slideMovableContainerToLeftPos();
                        return true;
                    }
                }
            }
            return false;
        };
        p.setMovableContainerLeftPosToTabEdge = function(slideDirection) {
            var smv = this,
                stc = smv.stc,
                offscreenWidth = -stc.movableContainerLeftPos,
                totalTabWidth = 0;
            stc.$tabsLiCollection.each(function() {
                var tabWidth = $(this).width();
                totalTabWidth += tabWidth;
                if (totalTabWidth > offscreenWidth) {
                    stc.movableContainerLeftPos = (slideDirection === CONSTANTS.SLIDE_DIRECTION.RIGHT) ? -(totalTabWidth - tabWidth) : -totalTabWidth;
                    return false;
                }
            });
        };
        p.slideMovableContainerToLeftPos = function() {
            var smv = this,
                stc = smv.stc,
                minPos = smv.getMinPos(),
                leftOrRightVal;
            if (stc.movableContainerLeftPos > 0) {
                stc.movableContainerLeftPos = 0;
            } else if (stc.movableContainerLeftPos < minPos) {
                stc.movableContainerLeftPos = minPos;
            }
            stc.movableContainerLeftPos = stc.movableContainerLeftPos / 1;
            leftOrRightVal = smv.getMovableContainerCssLeftVal();
            smv.performingSlideAnim = true;
            var targetPos = stc.rtl ? {
                right: leftOrRightVal
            } : {
                left: leftOrRightVal
            };
            stc.$movableContainer.stop().animate(targetPos, 'slow', function __slideAnimComplete() {
                var newMinPos = smv.getMinPos();
                smv.performingSlideAnim = false;
                if (stc.movableContainerLeftPos < newMinPos) {
                    smv.decrementMovableContainerLeftPos(newMinPos);
                    targetPos = stc.rtl ? {
                        right: smv.getMovableContainerCssLeftVal()
                    } : {
                        left: smv.getMovableContainerCssLeftVal()
                    };
                    stc.$movableContainer.stop().animate(targetPos, 'fast', function() {
                        smv.refreshScrollArrowsDisabledState();
                    });
                } else {
                    smv.refreshScrollArrowsDisabledState();
                }
            });
        };
    }(ScrollMovement.prototype));

    function ScrollingTabsControl($tabsContainer) {
        var stc = this;
        stc.$tabsContainer = $tabsContainer;
        stc.instanceId = $.fn.scrollingTabs.nextInstanceId++;
        stc.movableContainerLeftPos = 0;
        stc.scrollArrowsVisible = false;
        stc.scrollToTabEdge = false;
        stc.disableScrollArrowsOnFullyScrolled = false;
        stc.reverseScroll = false;
        stc.widthMultiplier = 1;
        stc.scrollMovement = new ScrollMovement(stc);
        stc.eventHandlers = new EventHandlers(stc);
        stc.elementsHandler = new ElementsHandler(stc);
    }
    (function(p) {
        p.initTabs = function(options, $scroller, readyCallback, attachTabContentToDomCallback) {
            var stc = this,
                elementsHandler = stc.elementsHandler,
                num;
            if (options.enableRtlSupport && $('html').attr('dir') === 'rtl') {
                stc.rtl = true;
            }
            if (options.scrollToTabEdge) {
                stc.scrollToTabEdge = true;
            }
            if (options.disableScrollArrowsOnFullyScrolled) {
                stc.disableScrollArrowsOnFullyScrolled = true;
            }
            if (options.reverseScroll) {
                stc.reverseScroll = true;
            }
            if (options.widthMultiplier !== 1) {
                num = Number(options.widthMultiplier);
                if (!isNaN(num)) {
                    stc.widthMultiplier = num;
                }
            }
            if (options.bootstrapVersion.toString().charAt(0) === '4') {
                stc.usingBootstrap4 = true;
            }
            setTimeout(initTabsAfterTimeout, 100);

            function initTabsAfterTimeout() {
                var actionsTaken;
                $scroller.find('.nav-tabs').show();
                elementsHandler.initElements(options);
                actionsTaken = elementsHandler.refreshAllElementSizes();
                $scroller.css('visibility', 'visible');
                if (attachTabContentToDomCallback) {
                    attachTabContentToDomCallback();
                }
                if (readyCallback) {
                    readyCallback();
                }
            }
        };
        p.scrollToActiveTab = function(options) {
            var stc = this,
                smv = stc.scrollMovement;
            smv.scrollToActiveTab(options);
        };
    }(ScrollingTabsControl.prototype));
    var tabElements = (function() {
        return {
            getElTabPaneForLi: getElTabPaneForLi,
            getNewElNavTabs: getNewElNavTabs,
            getNewElScrollerElementWrappingNavTabsInstance: getNewElScrollerElementWrappingNavTabsInstance,
            getNewElTabAnchor: getNewElTabAnchor,
            getNewElTabContent: getNewElTabContent,
            getNewElTabLi: getNewElTabLi,
            getNewElTabPane: getNewElTabPane
        };

        function getElTabPaneForLi($li) {
            return $($li.find('a').attr('href'));
        }

        function getNewElNavTabs() {
            return $('<ul class="nav nav-tabs" role="tablist"></ul>');
        }

        function getNewElScrollerElementWrappingNavTabsInstance($navTabsInstance, settings) {
            var $tabsContainer = $('<div class="scrtabs-tab-container"></div>'),
                leftArrowContent = settings.leftArrowContent || '<div class="scrtabs-tab-scroll-arrow scrtabs-tab-scroll-arrow-left"><span class="' + settings.cssClassLeftArrow + '"></span></div>',
                $leftArrow = $(leftArrowContent),
                rightArrowContent = settings.rightArrowContent || '<div class="scrtabs-tab-scroll-arrow scrtabs-tab-scroll-arrow-right"><span class="' + settings.cssClassRightArrow + '"></span></div>',
                $rightArrow = $(rightArrowContent),
                $fixedContainer = $('<div class="scrtabs-tabs-fixed-container"></div>'),
                $movableContainer = $('<div class="scrtabs-tabs-movable-container"></div>');
            if (settings.disableScrollArrowsOnFullyScrolled) {
                $leftArrow.add($rightArrow).addClass(CONSTANTS.CSS_CLASSES.SCROLL_ARROW_DISABLE);
            }
            return $tabsContainer.append($leftArrow, $fixedContainer.append($movableContainer.append($navTabsInstance)), $rightArrow);
        }

        function getNewElTabAnchor(tab, propNames) {
            return $('<a role="tab" data-toggle="tab"></a>').attr('href', '#' + tab[propNames.paneId]).html(tab[propNames.title]);
        }

        function getNewElTabContent() {
            return $('<div class="tab-content"></div>');
        }

        function getNewElTabLi(tab, propNames, options) {
            var liContent = options.tabLiContent || '<li role="presentation" class=""></li>',
                $li = $(liContent),
                $a = getNewElTabAnchor(tab, propNames).appendTo($li);
            if (tab[propNames.disabled]) {
                $li.addClass('disabled');
                $a.attr('data-toggle', '');
            } else if (options.forceActiveTab && tab[propNames.active]) {
                $li.addClass('active');
            }
            if (options.tabPostProcessor) {
                options.tabPostProcessor($li, $a);
            }
            return $li;
        }

        function getNewElTabPane(tab, propNames, options) {
            var $pane = $('<div role="tabpanel" class="tab-pane"></div>').attr('id', tab[propNames.paneId]).html(tab[propNames.content]);
            if (options.forceActiveTab && tab[propNames.active]) {
                $pane.addClass('active');
            }
            return $pane;
        }
    }());
    var tabUtils = (function() {
        return {
            didTabOrderChange: didTabOrderChange,
            getIndexOfClosestEnabledTab: getIndexOfClosestEnabledTab,
            getTabIndexByPaneId: getTabIndexByPaneId,
            storeDataOnLiEl: storeDataOnLiEl
        };

        function didTabOrderChange($currTabLis, updatedTabs, propNames) {
            var isTabOrderChanged = false;
            $currTabLis.each(function(currDomIdx) {
                var newIdx = getTabIndexByPaneId(updatedTabs, propNames.paneId, $(this).data('tab')[propNames.paneId]);
                if ((newIdx > -1) && (newIdx !== currDomIdx)) {
                    isTabOrderChanged = true;
                    return false;
                }
            });
            return isTabOrderChanged;
        }

        function getIndexOfClosestEnabledTab($currTabLis, startIndex) {
            var lastIndex = $currTabLis.length - 1,
                closestIdx = -1,
                incrementFromStartIndex = 0,
                testIdx = 0;
            while ((closestIdx === -1) && (testIdx >= 0)) {
                if ((((testIdx = startIndex + (++incrementFromStartIndex)) <= lastIndex) && !$currTabLis.eq(testIdx).hasClass('disabled')) || (((testIdx = startIndex - incrementFromStartIndex) >= 0) && !$currTabLis.eq(testIdx).hasClass('disabled'))) {
                    closestIdx = testIdx;
                }
            }
            return closestIdx;
        }

        function getTabIndexByPaneId(tabs, paneIdPropName, paneId) {
            var idx = -1;
            tabs.some(function(tab, i) {
                if (tab[paneIdPropName] === paneId) {
                    idx = i;
                    return true;
                }
            });
            return idx;
        }

        function storeDataOnLiEl($li, tabs, index) {
            $li.data({
                tab: $.extend({}, tabs[index]),
                index: index
            });
        }
    }());

    function buildNavTabsAndTabContentForTargetElementInstance($targetElInstance, settings, readyCallback) {
        var tabs = settings.tabs,
            propNames = {
                paneId: settings.propPaneId,
                title: settings.propTitle,
                active: settings.propActive,
                disabled: settings.propDisabled,
                content: settings.propContent
            },
            ignoreTabPanes = settings.ignoreTabPanes,
            hasTabContent = tabs.length && tabs[0][propNames.content] !== undefined,
            $navTabs = tabElements.getNewElNavTabs(),
            $tabContent = tabElements.getNewElTabContent(),
            $scroller, attachTabContentToDomCallback = ignoreTabPanes ? null : function() {
                $scroller.after($tabContent);
            };
        if (!tabs.length) {
            return;
        }
        tabs.forEach(function(tab, index) {
            var options = {
                forceActiveTab: true,
                tabLiContent: settings.tabsLiContent && settings.tabsLiContent[index],
                tabPostProcessor: settings.tabsPostProcessors && settings.tabsPostProcessors[index]
            };
            tabElements.getNewElTabLi(tab, propNames, options).appendTo($navTabs);
            if (!ignoreTabPanes && hasTabContent) {
                tabElements.getNewElTabPane(tab, propNames, options).appendTo($tabContent);
            }
        });
        $scroller = wrapNavTabsInstanceInScroller($navTabs, settings, readyCallback, attachTabContentToDomCallback);
        $scroller.appendTo($targetElInstance);
        $targetElInstance.data({
            scrtabs: {
                tabs: tabs,
                propNames: propNames,
                ignoreTabPanes: ignoreTabPanes,
                hasTabContent: hasTabContent,
                tabsLiContent: settings.tabsLiContent,
                tabsPostProcessors: settings.tabsPostProcessors,
                scroller: $scroller
            }
        });
        $scroller.find('.nav-tabs > li').each(function(index) {
            tabUtils.storeDataOnLiEl($(this), tabs, index);
        });
        return $targetElInstance;
    }

    function wrapNavTabsInstanceInScroller($navTabsInstance, settings, readyCallback, attachTabContentToDomCallback) {
        var $scroller = tabElements.getNewElScrollerElementWrappingNavTabsInstance($navTabsInstance.clone(true), settings),
            scrollingTabsControl = new ScrollingTabsControl($scroller),
            navTabsInstanceData = $navTabsInstance.data('scrtabs');
        if (!navTabsInstanceData) {
            $navTabsInstance.data('scrtabs', {
                scroller: $scroller
            });
        } else {
            navTabsInstanceData.scroller = $scroller;
        }
        $navTabsInstance.replaceWith($scroller.css('visibility', 'hidden'));
        if (settings.tabClickHandler && (typeof settings.tabClickHandler === 'function')) {
            $scroller.hasTabClickHandler = true;
            scrollingTabsControl.tabClickHandler = settings.tabClickHandler;
        }
        $scroller.initTabs = function() {
            scrollingTabsControl.initTabs(settings, $scroller, readyCallback, attachTabContentToDomCallback);
        };
        $scroller.scrollToActiveTab = function() {
            scrollingTabsControl.scrollToActiveTab(settings);
        };
        $scroller.initTabs();
        listenForDropdownMenuTabs($scroller, scrollingTabsControl);
        return $scroller;
    }

    function checkForTabAdded(refreshData) {
        var updatedTabsArray = refreshData.updatedTabsArray,
            updatedTabsLiContent = refreshData.updatedTabsLiContent || [],
            updatedTabsPostProcessors = refreshData.updatedTabsPostProcessors || [],
            propNames = refreshData.propNames,
            ignoreTabPanes = refreshData.ignoreTabPanes,
            options = refreshData.options,
            $currTabLis = refreshData.$currTabLis,
            $navTabs = refreshData.$navTabs,
            $currTabContentPanesContainer = ignoreTabPanes ? null : refreshData.$currTabContentPanesContainer,
            $currTabContentPanes = ignoreTabPanes ? null : refreshData.$currTabContentPanes,
            isInitTabsRequired = false;
        updatedTabsArray.forEach(function(tab, idx) {
            var $li = $currTabLis.find('a[href="#' + tab[propNames.paneId] + '"]'),
                isTabIdxPastCurrTabs = (idx >= $currTabLis.length),
                $pane;
            if (!$li.length) {
                isInitTabsRequired = true;
                options.tabLiContent = updatedTabsLiContent[idx];
                options.tabPostProcessor = updatedTabsPostProcessors[idx];
                $li = tabElements.getNewElTabLi(tab, propNames, options);
                tabUtils.storeDataOnLiEl($li, updatedTabsArray, idx);
                if (isTabIdxPastCurrTabs) {
                    $li.appendTo($navTabs);
                } else {
                    $li.insertBefore($currTabLis.eq(idx));
                }
                if (!ignoreTabPanes && tab[propNames.content] !== undefined) {
                    $pane = tabElements.getNewElTabPane(tab, propNames, options);
                    if (isTabIdxPastCurrTabs) {
                        $pane.appendTo($currTabContentPanesContainer);
                    } else {
                        $pane.insertBefore($currTabContentPanes.eq(idx));
                    }
                }
            }
        });
        return isInitTabsRequired;
    }

    function checkForTabPropertiesUpdated(refreshData) {
        var tabLiData = refreshData.tabLi,
            ignoreTabPanes = refreshData.ignoreTabPanes,
            $li = tabLiData.$li,
            $contentPane = tabLiData.$contentPane,
            origTabData = tabLiData.origTabData,
            newTabData = tabLiData.newTabData,
            propNames = refreshData.propNames,
            isInitTabsRequired = false;
        if (origTabData[propNames.title] !== newTabData[propNames.title]) {
            $li.find('a[role="tab"]').html(origTabData[propNames.title] = newTabData[propNames.title]);
            isInitTabsRequired = true;
        }
        if (origTabData[propNames.disabled] !== newTabData[propNames.disabled]) {
            if (newTabData[propNames.disabled]) {
                $li.addClass('disabled');
                $li.find('a[role="tab"]').attr('data-toggle', '');
            } else {
                $li.removeClass('disabled');
                $li.find('a[role="tab"]').attr('data-toggle', 'tab');
            }
            origTabData[propNames.disabled] = newTabData[propNames.disabled];
            isInitTabsRequired = true;
        }
        if (refreshData.options.forceActiveTab) {
            $li[newTabData[propNames.active] ? 'addClass' : 'removeClass']('active');
            $contentPane[newTabData[propNames.active] ? 'addClass' : 'removeClass']('active');
            origTabData[propNames.active] = newTabData[propNames.active];
            isInitTabsRequired = true;
        }
        if (!ignoreTabPanes && origTabData[propNames.content] !== newTabData[propNames.content]) {
            $contentPane.html(origTabData[propNames.content] = newTabData[propNames.content]);
            isInitTabsRequired = true;
        }
        return isInitTabsRequired;
    }

    function checkForTabRemoved(refreshData) {
        var tabLiData = refreshData.tabLi,
            ignoreTabPanes = refreshData.ignoreTabPanes,
            $li = tabLiData.$li,
            idxToMakeActive;
        if (tabLiData.newIdx !== -1) {
            return false;
        }
        if ($li.hasClass('active')) {
            idxToMakeActive = tabUtils.getIndexOfClosestEnabledTab(refreshData.$currTabLis, tabLiData.currDomIdx);
            if (idxToMakeActive > -1) {
                refreshData.$currTabLis.eq(idxToMakeActive).addClass('active');
                if (!ignoreTabPanes) {
                    refreshData.$currTabContentPanes.eq(idxToMakeActive).addClass('active');
                }
            }
        }
        $li.remove();
        if (!ignoreTabPanes) {
            tabLiData.$contentPane.remove();
        }
        return true;
    }

    function checkForTabsOrderChanged(refreshData) {
        var $currTabLis = refreshData.$currTabLis,
            updatedTabsArray = refreshData.updatedTabsArray,
            propNames = refreshData.propNames,
            ignoreTabPanes = refreshData.ignoreTabPanes,
            newTabsCollection = [],
            newTabPanesCollection = ignoreTabPanes ? null : [];
        if (!tabUtils.didTabOrderChange($currTabLis, updatedTabsArray, propNames)) {
            return false;
        }
        updatedTabsArray.forEach(function(t) {
            var paneId = t[propNames.paneId];
            newTabsCollection.push($currTabLis.find('a[role="tab"][href="#' + paneId + '"]').parent('li'));
            if (!ignoreTabPanes) {
                newTabPanesCollection.push($('#' + paneId));
            }
        });
        refreshData.$navTabs.append(newTabsCollection);
        if (!ignoreTabPanes) {
            refreshData.$currTabContentPanesContainer.append(newTabPanesCollection);
        }
        return true;
    }

    function checkForTabsRemovedOrUpdated(refreshData) {
        var $currTabLis = refreshData.$currTabLis,
            updatedTabsArray = refreshData.updatedTabsArray,
            propNames = refreshData.propNames,
            isInitTabsRequired = false;
        $currTabLis.each(function(currDomIdx) {
            var $li = $(this),
                origTabData = $li.data('tab'),
                newIdx = tabUtils.getTabIndexByPaneId(updatedTabsArray, propNames.paneId, origTabData[propNames.paneId]),
                newTabData = (newIdx > -1) ? updatedTabsArray[newIdx] : null;
            refreshData.tabLi = {
                $li: $li,
                currDomIdx: currDomIdx,
                newIdx: newIdx,
                $contentPane: tabElements.getElTabPaneForLi($li),
                origTabData: origTabData,
                newTabData: newTabData
            };
            if (checkForTabRemoved(refreshData)) {
                isInitTabsRequired = true;
                return;
            }
            if (checkForTabPropertiesUpdated(refreshData)) {
                isInitTabsRequired = true;
            }
        });
        return isInitTabsRequired;
    }

    function listenForDropdownMenuTabs($scroller, stc) {
        var $ddMenu;
        $scroller.on(CONSTANTS.EVENTS.DROPDOWN_MENU_SHOW, handleDropdownShow).on(CONSTANTS.EVENTS.DROPDOWN_MENU_HIDE, handleDropdownHide);

        function handleDropdownHide(e) {
            $(e.target).append($ddMenu.off(CONSTANTS.EVENTS.CLICK));
        }

        function handleDropdownShow(e) {
            var $ddParentTabLi = $(e.target),
                ddLiOffset = $ddParentTabLi.offset(),
                $currActiveTab = $scroller.find('li[role="presentation"].active'),
                ddMenuRightX, tabsContainerMaxX, ddMenuTargetLeft;
            $ddMenu = $ddParentTabLi.find('.dropdown-menu').attr('data-' + CONSTANTS.DATA_KEY_DDMENU_MODIFIED, true);
            if ($currActiveTab[0] !== $ddParentTabLi[0]) {
                $ddMenu.find('li.active').removeClass('active');
            }
            $ddMenu.on(CONSTANTS.EVENTS.CLICK, 'a[role="tab"]', handleClickOnDropdownMenuItem);
            $('body').append($ddMenu);
            ddMenuRightX = $ddMenu.width() + ddLiOffset.left;
            tabsContainerMaxX = $scroller.width() - (stc.$slideRightArrow.outerWidth() + 1);
            ddMenuTargetLeft = ddLiOffset.left;
            if (ddMenuRightX > tabsContainerMaxX) {
                ddMenuTargetLeft -= (ddMenuRightX - tabsContainerMaxX);
            }
            $ddMenu.css({
                'display': 'block',
                'top': ddLiOffset.top + $ddParentTabLi.outerHeight() - 2,
                'left': ddMenuTargetLeft
            });

            function handleClickOnDropdownMenuItem() {
                var $selectedMenuItemAnc = $(this),
                    $selectedMenuItemLi = $selectedMenuItemAnc.parent('li'),
                    $selectedMenuItemDropdownMenu = $selectedMenuItemLi.parent('.dropdown-menu'),
                    targetPaneId = $selectedMenuItemAnc.attr('href');
                if ($selectedMenuItemLi.hasClass('active')) {
                    return;
                }
                $scroller.find('li.active').not($ddParentTabLi).add($selectedMenuItemDropdownMenu.find('li.active')).removeClass('active');
                $ddParentTabLi.add($selectedMenuItemLi).addClass('active');
                $('.tab-content .tab-pane.active').removeClass('active');
                $(targetPaneId).addClass('active');
            }
        }
    }

    function refreshDataDrivenTabs($container, options) {
        var instanceData = $container.data().scrtabs,
            scroller = instanceData.scroller,
            $navTabs = $container.find('.scrtabs-tab-container .nav-tabs'),
            $currTabContentPanesContainer = $container.find('.tab-content'),
            isInitTabsRequired = false,
            refreshData = {
                options: options,
                updatedTabsArray: instanceData.tabs,
                updatedTabsLiContent: instanceData.tabsLiContent,
                updatedTabsPostProcessors: instanceData.tabsPostProcessors,
                propNames: instanceData.propNames,
                ignoreTabPanes: instanceData.ignoreTabPanes,
                $navTabs: $navTabs,
                $currTabLis: $navTabs.find('> li'),
                $currTabContentPanesContainer: $currTabContentPanesContainer,
                $currTabContentPanes: $currTabContentPanesContainer.find('.tab-pane')
            };
        if (checkForTabAdded(refreshData)) {
            isInitTabsRequired = true;
        }
        if (checkForTabsOrderChanged(refreshData)) {
            isInitTabsRequired = true;
        }
        if (checkForTabsRemovedOrUpdated(refreshData)) {
            isInitTabsRequired = true;
        }
        if (isInitTabsRequired) {
            scroller.initTabs();
        }
        return isInitTabsRequired;
    }

    function refreshTargetElementInstance($container, options) {
        if (!$container.data('scrtabs')) {
            return;
        }
        if ($container.data('scrtabs').isWrapperOnly || !refreshDataDrivenTabs($container, options)) {
            $('body').trigger(CONSTANTS.EVENTS.FORCE_REFRESH);
        }
    }

    function scrollToActiveTab() {
        var $targetElInstance = $(this),
            scrtabsData = $targetElInstance.data('scrtabs');
        if (!scrtabsData) {
            return;
        }
        scrtabsData.scroller.scrollToActiveTab();
    }
    var methods = {
        destroy: function() {
            var $targetEls = this;
            return $targetEls.each(destroyPlugin);
        },
        init: function(options) {
            var $targetEls = this,
                targetElsLastIndex = $targetEls.length - 1,
                settings = $.extend({}, $.fn.scrollingTabs.defaults, options || {});
            if (!settings.tabs) {
                return $targetEls.each(function(index) {
                    var dataObj = {
                            isWrapperOnly: true
                        },
                        $targetEl = $(this).data({
                            scrtabs: dataObj
                        }),
                        readyCallback = (index < targetElsLastIndex) ? null : function() {
                            $targetEls.trigger(CONSTANTS.EVENTS.TABS_READY);
                        };
                    wrapNavTabsInstanceInScroller($targetEl, settings, readyCallback);
                });
            }
            return $targetEls.each(function(index) {
                var $targetEl = $(this),
                    readyCallback = (index < targetElsLastIndex) ? null : function() {
                        $targetEls.trigger(CONSTANTS.EVENTS.TABS_READY);
                    };
                buildNavTabsAndTabContentForTargetElementInstance($targetEl, settings, readyCallback);
            });
        },
        refresh: function(options) {
            var $targetEls = this,
                settings = $.extend({}, $.fn.scrollingTabs.defaults, options || {});
            return $targetEls.each(function() {
                refreshTargetElementInstance($(this), settings);
            });
        },
        scrollToActiveTab: function() {
            return this.each(scrollToActiveTab);
        }
    };

    function destroyPlugin() {
        var $targetElInstance = $(this),
            scrtabsData = $targetElInstance.data('scrtabs'),
            $tabsContainer;
        if (!scrtabsData) {
            return;
        }
        if (scrtabsData.enableSwipingElement === 'self') {
            $targetElInstance.removeClass(CONSTANTS.CSS_CLASSES.ALLOW_SCROLLBAR);
        } else if (scrtabsData.enableSwipingElement === 'parent') {
            $targetElInstance.closest('.scrtabs-tab-container').parent().removeClass(CONSTANTS.CSS_CLASSES.ALLOW_SCROLLBAR);
        }
        scrtabsData.scroller.off(CONSTANTS.EVENTS.DROPDOWN_MENU_SHOW).off(CONSTANTS.EVENTS.DROPDOWN_MENU_HIDE);
        scrtabsData.scroller.find('[data-' + CONSTANTS.DATA_KEY_DDMENU_MODIFIED + ']').css({
            display: '',
            left: '',
            top: ''
        }).off(CONSTANTS.EVENTS.CLICK).removeAttr('data-' + CONSTANTS.DATA_KEY_DDMENU_MODIFIED);
        if (scrtabsData.scroller.hasTabClickHandler) {
            $targetElInstance.find('a[data-toggle="tab"]').off('.scrtabs');
        }
        if (scrtabsData.isWrapperOnly) {
            $tabsContainer = $targetElInstance.parents('.scrtabs-tab-container');
            if ($tabsContainer.length) {
                $tabsContainer.replaceWith($targetElInstance);
            }
        } else {
            if (scrtabsData.scroller && scrtabsData.scroller.initTabs) {
                scrtabsData.scroller.initTabs = null;
            }
            $targetElInstance.find('.scrtabs-tab-container').add('.tab-content').remove();
        }
        $targetElInstance.removeData('scrtabs');
        while (--$.fn.scrollingTabs.nextInstanceId >= 0) {
            $(window).off(CONSTANTS.EVENTS.WINDOW_RESIZE + $.fn.scrollingTabs.nextInstanceId);
        }
        $('body').off(CONSTANTS.EVENTS.FORCE_REFRESH);
    }
    $.fn.scrollingTabs = function(methodOrOptions) {
        if (methods[methodOrOptions]) {
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (!methodOrOptions || (typeof methodOrOptions === 'object')) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + methodOrOptions + ' does not exist on $.scrollingTabs.');
        }
    };
    $.fn.scrollingTabs.nextInstanceId = 0;
    $.fn.scrollingTabs.defaults = {
        tabs: null,
        propPaneId: 'paneId',
        propTitle: 'title',
        propActive: 'active',
        propDisabled: 'disabled',
        propContent: 'content',
        ignoreTabPanes: false,
        scrollToTabEdge: false,
        disableScrollArrowsOnFullyScrolled: false,
        forceActiveTab: false,
        reverseScroll: false,
        widthMultiplier: 1,
        tabClickHandler: null,
        cssClassLeftArrow: 'fa fa-arrow-left',
        cssClassRightArrow: 'fa fa-arrow-right',
        leftArrowContent: '',
        rightArrowContent: '',
        tabsLiContent: null,
        tabsPostProcessors: null,
        enableSwiping: false,
        enableRtlSupport: false,
        bootstrapVersion: 3
    };
}(jQuery, window));