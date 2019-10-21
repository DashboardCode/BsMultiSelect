/*!
  * DashboardCode BsMultiSelect v0.3.1 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2019 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('popper.js')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
    (global = global || self, factory(global.jQuery, global.Popper));
}(this, function ($, Popper) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

    var Bs4AdapterCss =
    /*#__PURE__*/
    function () {
      function Bs4AdapterCss(configuration, $) {
        var defaults = {
          selectedPanelFocusClass: 'focus',
          selectedPanelDisabledClass: 'disabled',
          selectedItemContentDisabledClass: 'disabled',
          dropDownItemDisabledClass: 'disabled'
        };
        var tmp = $.extend({}, defaults, configuration);
        this.configuration = $.extend(configuration, tmp);
      }

      var _proto = Bs4AdapterCss.prototype;

      _proto.DisableSelectedItemContent = function DisableSelectedItemContent($content) {
        $content.addClass(this.configuration.selectedItemContentDisabledClass);
      };

      _proto.DisabledStyle = function DisabledStyle($checkBox, isDisbaled) {
        if (isDisbaled) $checkBox.addClass(this.configuration.dropDownItemDisabledClass);else $checkBox.removeClass(this.configuration.dropDownItemDisabledClass);
      };

      _proto.Enable = function Enable($selectedPanel) {
        $selectedPanel.removeClass(this.configuration.selectedPanelDisabledClass);
      };

      _proto.Disable = function Disable($selectedPanel) {
        $selectedPanel.addClass(this.configuration.selectedPanelDisabledClass);
      };

      _proto.FocusIn = function FocusIn($selectedPanel) {
        $selectedPanel.addClass(this.configuration.selectedPanelFocusClass);
      };

      _proto.FocusOut = function FocusOut($selectedPanel) {
        $selectedPanel.removeClass(this.configuration.selectedPanelFocusClass);
      };

      return Bs4AdapterCss;
    }();

    var defSelectedPanelStyle = {
      'margin-bottom': '0',
      'height': 'auto'
    };
    var defSelectedItemStyle = {
      'padding-left': '0px',
      'line-height': '1.5em'
    };
    var defRemoveSelectedItemButtonStyle = {
      'font-size': '1.5em',
      'line-height': '.9em'
    };

    var Bs4AdapterJs =
    /*#__PURE__*/
    function () {
      function Bs4AdapterJs(configuration, $) {
        var defaults = {
          selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
          selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
          selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
          selectedPanelDisabledBackgroundColor: '#e9ecef',
          selectedPanelFocusBorderColor: '#80bdff',
          selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
          selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
          selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
          filterInputColor: '#495057',
          selectedItemContentDisabledOpacity: '.65',
          dropdDownLabelDisabledColor: '#6c757d'
        };
        var tmp = $.extend({}, defaults, configuration);
        this.configuration = $.extend(configuration, tmp);
      }

      var _proto = Bs4AdapterJs.prototype;

      _proto.OnInit = function OnInit(dom) {
        dom.selectedPanel.css(defSelectedPanelStyle);
        dom.filterInput.css("color", this.configuration.filterInputColor);
      };

      _proto.CreateSelectedItemContent = function CreateSelectedItemContent($selectedItem, $button) {
        $selectedItem.css(defSelectedItemStyle);
        $button.css(defRemoveSelectedItemButtonStyle);
      };

      _proto.DisableSelectedItemContent = function DisableSelectedItemContent($content) {
        $content.css("opacity", this.configuration.selectedItemContentDisabledOpacity);
      };

      _proto.DisabledStyle = function DisabledStyle($checkBox, isDisbaled) {
        $checkBox.siblings('label').css('color', isDisbaled ? this.configuration.dropdDownLabelDisabledColor : '');
      };

      _proto.UpdateSize = function UpdateSize($selectedPanel) {
        if ($selectedPanel.hasClass("form-control-lg")) {
          $selectedPanel.css("min-height", this.configuration.selectedPanelLgMinHeight);
        } else if ($selectedPanel.hasClass("form-control-sm")) {
          $selectedPanel.css("min-height", this.configuration.selectedPanelSmMinHeight);
        } else {
          $selectedPanel.css("min-height", this.configuration.selectedPanelDefMinHeight);
        }
      };

      _proto.Enable = function Enable($selectedPanel) {
        $selectedPanel.css({
          "background-color": ""
        });
      };

      _proto.Disable = function Disable($selectedPanel) {
        $selectedPanel.css({
          "background-color": this.configuration.selectedPanelDisabledBackgroundColor
        });
      };

      _proto.FocusIn = function FocusIn($selectedPanel) {
        if ($selectedPanel.hasClass("is-valid")) {
          $selectedPanel.css("box-shadow", this.configuration.selectedPanelFocusValidBoxShadow);
        } else if ($selectedPanel.hasClass("is-invalid")) {
          $selectedPanel.css("box-shadow", this.configuration.selectedPanelFocusInvalidBoxShadow);
        } else {
          $selectedPanel.css("box-shadow", this.configuration.selectedPanelFocusBoxShadow).css("border-color", this.configuration.selectedPanelFocusBorderColor);
        }
      };

      _proto.FocusOut = function FocusOut($selectedPanel) {
        $selectedPanel.css("box-shadow", "").css("border-color", "");
      };

      return Bs4AdapterJs;
    }();

    var defSelectedPanelStyleSys = {
      'display': 'flex',
      'flex-wrap': 'wrap',
      'list-style-type': 'none'
    }; // remove bullets since this is ul

    var defFilterInputStyleSys = {
      'width': '2ch',
      'border': '0',
      'padding': '0',
      'outline': 'none',
      'background-color': 'transparent'
    };
    var defDropDownMenuStyleSys = {
      'list-style-type': 'none'
    }; // remove bullets since this is ul
    // jQuery used for:
    // $.extend, $.contains, $("<div>"), $(function(){}) aka ready
    // $e.trigger, $e.unbind, $e.on; but namespaces are not used;
    // events: "focusin", "focusout", "mouseover", "mouseout", "keydown", "keyup", "click"
    // $e.show, $e.hide, $e.focus, $e.css
    // $e.appendTo, $e.remove, $e.find, $e.closest, $e.prev, $e.data, $e.val

    var MultiSelect =
    /*#__PURE__*/
    function () {
      function MultiSelect(optionsAdapter, adapter, configuration, onDispose, window, $) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
        } // readonly


        this.adapter = adapter;
        this.window = window;
        this.document = window.document;
        this.onDispose = onDispose;
        this.$ = $;
        this.configuration = configuration;
        this.container = null;
        this.selectedPanel = null;
        this.filterInputItem = null;
        this.filterInput = null;
        this.dropDownMenu = null;
        this.popper = null;
        this.getDisabled = null; // removable handlers

        this.selectedPanelClick = null;
        this.documentMouseup = null;
        this.containerMousedown = null;
        this.documentMouseup2 = null; // state

        this.disabled = null;
        this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

        this.skipFocusout = false;
        this.hoveredDropDownItem = null;
        this.hoveredDropDownIndex = null;
        this.hasDropDownVisible = false; // jquery adapters

        this.$document = $(this.document); //this.createContainer();

        optionsAdapter.init(this);
      }

      var _proto = MultiSelect.prototype;

      _proto.updateDropDownPosition = function updateDropDownPosition(force) {
        var offsetLeft = this.filterInputItem.offsetLeft;

        if (force || this.filterInputItemOffsetLeft != offsetLeft) {
          this.popper.update();
          this.filterInputItemOffsetLeft = offsetLeft;
        }
      };

      _proto.hideDropDown = function hideDropDown() {
        this.dropDownMenu.style.display = 'none';
      };

      _proto.showDropDown = function showDropDown() {
        this.dropDownMenu.style.display = 'block';
      } // Public methods
      ;

      _proto.resetDropDownMenuHover = function resetDropDownMenuHover() {
        if (this.hoveredDropDownItem !== null) {
          this.adapter.HoverOut(this.$(this.hoveredDropDownItem));
          this.hoveredDropDownItem = null;
          this.hoveredDropDownIndex = null;
        }
      };

      _proto.filterDropDownMenu = function filterDropDownMenu() {
        var _this = this;

        var text = this.filterInput.value.trim().toLowerCase();
        var visible = 0;
        this.$(this.dropDownMenu).find('LI').each(function (i, dropDownMenuItem) {
          var $dropDownMenuItem = _this.$(dropDownMenuItem);

          if (text == '') {
            $dropDownMenuItem.show();
            visible++;
          } else {
            var itemText = $dropDownMenuItem.data("option-text");
            var option = $dropDownMenuItem.data("option");

            if (!option.selected && !option.hidden && !option.disabled && itemText.indexOf(text) >= 0) {
              $dropDownMenuItem.show();
              visible++;
            } else {
              $dropDownMenuItem.hide();
            }
          }
        });
        this.hasDropDownVisible = visible > 0;
        this.resetDropDownMenuHover();

        if (visible == 1) {
          var visibleNodeListArray = this.getVisibleNodeListArray();
          this.hoverInInternal(visibleNodeListArray, 0);
        }
      };

      _proto.clearFilterInput = function clearFilterInput(updatePosition) {
        if (this.filterInput.value) {
          this.filterInput.value = '';
          this.input(updatePosition);
        }
      };

      _proto.closeDropDown = function closeDropDown() {
        this.resetDropDownMenuHover();
        this.clearFilterInput(true);
        this.hideDropDown();
      };

      _proto.appendDropDownItem = function appendDropDownItem(optionElement, onChange) {
        var _this2 = this;

        var isHidden = optionElement.hidden;
        var itemText = optionElement.text;
        var $dropDownItem = this.$("<LI/>").prop("hidden", isHidden);
        $dropDownItem.data("option-text", itemText.toLowerCase()).appendTo(this.dropDownMenu);
        $dropDownItem.data("option", optionElement); //let optionData = {"optionId":optionElement.value, "itemText": optionElement.text }

        var adjustDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionElement);
        var isDisabled = optionElement.disabled;
        var isSelected = optionElement.selected;
        if (isSelected && isDisabled) adjustDropDownItem.disabledStyle(true);else if (isDisabled) adjustDropDownItem.disable(isDisabled);
        adjustDropDownItem.onSelected(function () {
          var toggleItem = $dropDownItem.data("option-toggle");
          toggleItem();

          _this2.filterInput.focus();
        });

        var selectItem = function selectItem(doPublishEvents) {
          if (optionElement.hidden) return;

          var $selectedItem = _this2.$("<LI/>");

          var adjustPair = function adjustPair(isSelected, toggle, remove) {
            optionElement.selected = isSelected;
            adjustDropDownItem.select(isSelected);
            $dropDownItem.data("option-toggle", toggle);
            $selectedItem.data("option-remove", remove);
          };

          var removeItem = function removeItem() {
            adjustDropDownItem.disabledStyle(false);
            adjustDropDownItem.disable(optionElement.disabled);
            adjustPair(false, function () {
              if (optionElement.disabled) return;
              selectItem(true);
            }, null);
            $selectedItem.remove();
            onChange();
          };

          var removeItemAndCloseDropDown = function removeItemAndCloseDropDown() {
            removeItem();

            _this2.closeDropDown();
          };

          _this2.adapter.CreateSelectedItemContent($selectedItem, optionElement, removeItemAndCloseDropDown, _this2.disabled);

          adjustPair(true, removeItem, removeItemAndCloseDropDown);
          $selectedItem.insertBefore(_this2.filterInputItem);

          if (doPublishEvents) {
            onChange();
          }
        };

        $dropDownItem.mouseover(function () {
          return _this2.adapter.HoverIn($dropDownItem);
        }).mouseout(function () {
          return _this2.adapter.HoverOut($dropDownItem);
        });
        if (optionElement.selected) selectItem(false);else $dropDownItem.data("option-toggle", function () {
          if (optionElement.disabled) return;
          selectItem(true);
        });
      };

      _proto.getVisibleNodeListArray = function getVisibleNodeListArray() {
        return this.$(this.dropDownMenu).find('LI:not([style*="display: none"]):not(:hidden)').toArray();
      };

      _proto.hoverInInternal = function hoverInInternal(visibleNodeListArray, index) {
        this.hoveredDropDownIndex = index;
        this.hoveredDropDownItem = visibleNodeListArray[index];
        this.adapter.HoverIn(this.$(this.hoveredDropDownItem));
      };

      _proto.keydownArrow = function keydownArrow(down) {
        var visibleNodeListArray = this.getVisibleNodeListArray();

        if (visibleNodeListArray.length > 0) {
          if (this.hasDropDownVisible) {
            this.updateDropDownPosition(true);
            this.showDropDown();
          }

          var index;

          if (this.hoveredDropDownItem === null) {
            index = down ? 0 : visibleNodeListArray.length - 1;
          } else {
            this.adapter.HoverOut(this.$(this.hoveredDropDownItem));

            if (down) {
              var newIndex = this.hoveredDropDownIndex + 1;
              index = newIndex < visibleNodeListArray.length ? newIndex : 0;
            } else {
              var _newIndex = this.hoveredDropDownIndex - 1;

              index = _newIndex >= 0 ? _newIndex : visibleNodeListArray.length - 1;
            }
          }

          this.hoverInInternal(visibleNodeListArray, index);
        }
      };

      _proto.input = function input(forceUpdatePosition) {
        this.filterInput.style.width = this.filterInput.value.length * 1.3 + 2 + "ch";
        this.filterDropDownMenu();

        if (this.hasDropDownVisible) {
          if (forceUpdatePosition) // ignore it if it is called from
            this.updateDropDownPosition(forceUpdatePosition); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

          this.showDropDown();
        } else {
          this.hideDropDown();
        }
      };

      _proto.Update = function Update() {
        var $selectedPanel = this.$(this.selectedPanel);
        this.adapter.UpdateIsValid($selectedPanel);
        this.UpdateSizeImpl($selectedPanel);
        this.UpdateDisabledImpl(this.$(this.container), $selectedPanel);
      };

      _proto.Dispose = function Dispose() {
        if (this.onDispose) this.onDispose(); // removable handlers

        this.$document.unbind("mouseup", this.documentMouseup).unbind("mouseup", this.documentMouseup2);

        if (this.adapter !== null) {
          this.adapter.Dispose();
        }

        if (this.popper !== null) {
          this.popper.destroy();
        }

        if (this.removeContainer) {
          this.removeContainer();
        }
      };

      _proto.UpdateSize = function UpdateSize() {
        this.UpdateSizeImpl(this.$(this.selectedPanel));
      };

      _proto.UpdateDisabled = function UpdateDisabled() {
        this.UpdateDisabledImpl(this.$(this.container), this.$(this.selectedPanel));
      };

      _proto.UpdateSizeImpl = function UpdateSizeImpl($selectedPanel) {
        if (this.adapter.UpdateSize) this.adapter.UpdateSize($selectedPanel);
      };

      _proto.UpdateDisabledImpl = function UpdateDisabledImpl($container, $selectedPanel) {
        var disabled = this.getDisabled();

        if (this.disabled !== disabled) {
          if (disabled) {
            this.filterInput.style.display = "none";
            this.adapter.Disable($selectedPanel);
            $container.unbind("mousedown", this.containerMousedown);
            this.$document.unbind("mouseup", this.documentMouseup);
            $selectedPanel.unbind("click", this.selectedPanelClick);
            this.$document.unbind("mouseup", this.documentMouseup2);
          } else {
            this.filterInput.style.display = "inline-block";
            this.adapter.Enable($selectedPanel);
            $container.mousedown(this.containerMousedown); // removable

            this.$document.mouseup(this.documentMouseup); // removable

            $selectedPanel.click(this.selectedPanelClick); // removable

            this.$document.mouseup(this.documentMouseup2); // removable
          }

          this.disabled = disabled;
        }
      };

      _proto.fillContainer = function fillContainer(container, removeContainer) {
        var _this3 = this;

        this.container = container;
        this.removeContainer = removeContainer;
        var $container = this.$(container);
        this.selectedPanel = this.document.createElement("ul");
        var $selectedPanel = this.$(this.selectedPanel);
        $selectedPanel.css(defSelectedPanelStyleSys);
        $selectedPanel.appendTo(container);
        var $filterInputItem = this.$('<LI/>');
        this.filterInputItem = $filterInputItem.get(0);
        $filterInputItem.appendTo(this.selectedPanel);
        var $filterInput = this.$('<INPUT type="search" autocomplete="off">');
        this.filterInput = $filterInput.get(0);
        $filterInput.css(defFilterInputStyleSys);
        $filterInput.appendTo(this.filterInputItem);
        var $dropDownMenu = this.$("<UL/>").css({
          "display": "none"
        });
        $dropDownMenu.appendTo(container);
        this.dropDownMenu = $dropDownMenu.get(0); // prevent heavy understandable styling error

        $dropDownMenu.css(defDropDownMenuStyleSys); // create handlers

        this.documentMouseup = function () {
          _this3.skipFocusout = false;
        };

        this.containerMousedown = function () {
          _this3.skipFocusout = true;
        };

        this.documentMouseup2 = function (event) {
          if (!(container === event.target || _this3.$.contains(container, event.target))) {
            _this3.closeDropDown();
          }
        };

        this.selectedPanelClick = function (event) {
          if (event.target.nodeName != "INPUT") _this3.$(_this3.filterInput).val('').focus();

          if (_this3.hasDropDownVisible && _this3.adapter.IsClickToOpenDropdown(event)) {
            _this3.updateDropDownPosition(true);

            _this3.showDropDown();
          }
        };

        this.adapter.Init({
          container: $container,
          selectedPanel: $selectedPanel,
          filterInputItem: $filterInputItem,
          filterInput: $filterInput,
          dropDownMenu: $dropDownMenu
        });
        return {
          $container: $container,
          $selectedPanel: $selectedPanel,
          $dropDownMenu: $dropDownMenu,
          $filterInput: $filterInput
        };
      };

      _proto.init = function init($container, $selectedPanel, $dropDownMenu, $filterInput, onChange, getOptions, getDisabled) {
        var _this4 = this;

        this.getDisabled = getDisabled;
        this.popper = new Popper(this.filterInput, this.dropDownMenu, {
          placement: 'bottom-start',
          modifiers: {
            preventOverflow: {
              enabled: false
            },
            hide: {
              enabled: false
            },
            flip: {
              enabled: false
            }
          }
        });
        this.adapter.UpdateIsValid($selectedPanel);
        this.UpdateSizeImpl($selectedPanel);
        this.UpdateDisabledImpl($container, $selectedPanel); // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event
        // FYI: $(() => { ...}) is jquery ready event shortcut

        this.$(function () {
          var options = getOptions();

          _this4.$.each(options, function (index, el) {
            _this4.appendDropDownItem(el, onChange);
          });

          _this4.hasDropDownVisible = options.length > 0;

          _this4.updateDropDownPosition(false);
        }); // there was unmotivated stopPropagation call. commented out.
        // $dropDownMenu.click(  event => { 
        //    event.stopPropagation();
        // });

        $dropDownMenu.mouseover(function () {
          return _this4.resetDropDownMenuHover();
        });
        $filterInput.focusin(function () {
          return _this4.adapter.FocusIn($selectedPanel);
        }).focusout(function () {
          if (!_this4.skipFocusout) _this4.adapter.FocusOut($selectedPanel);
        });
        $filterInput.on("keydown", function (event) {
          if ([38, 40, 13].indexOf(event.which) >= 0 || event.which == 9 && _this4.filterInput.value) {
            event.preventDefault();
          }

          if (event.which == 38) {
            _this4.keydownArrow(false);
          } else if (event.which == 40) {
            if (_this4.hoveredDropDownItem === null && _this4.hasDropDownVisible) {
              _this4.showDropDown();
            }

            _this4.keydownArrow(true);
          } else if (event.which == 9) {
            if (!_this4.filterInput.value) {
              _this4.closeDropDown();
            }
          } else if (event.which == 8) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!_this4.filterInput.value) {
              var $penult = _this4.$(_this4.selectedPanel).find("LI:last").prev();

              if ($penult.length) {
                var removeItem = $penult.data("option-remove");
                removeItem();
              }

              _this4.updateDropDownPosition(false);
            }
          }

          if ([38, 40, 13, 9].indexOf(event.which) == -1) _this4.resetDropDownMenuHover();
        });
        $filterInput.on("keyup", function (event) {
          if (event.which == 13 || event.which == 9) {
            if (_this4.hoveredDropDownItem) {
              var $hoveredDropDownItem = _this4.$(_this4.hoveredDropDownItem);

              var toggleItem = $hoveredDropDownItem.data("option-toggle");
              toggleItem();

              _this4.closeDropDown();
            } else {
              var text = _this4.filterInput.value.trim().toLowerCase();

              var dropDownItems = _this4.dropDownMenu.querySelectorAll("LI");

              var dropDownItem = null;

              for (var i = 0; i < dropDownItems.length; ++i) {
                var it = dropDownItems[i];

                if (it.textContent.trim().toLowerCase() == text) {
                  dropDownItem = it;
                  break;
                }
              }

              if (dropDownItem) {
                var $dropDownItem = _this4.$(dropDownItem);

                var option = $dropDownItem.data("option");

                if (!option.selected) {
                  var toggle = $dropDownItem.data("option-toggle");
                  toggle();
                }

                _this4.clearFilterInput(true);
              }
            }
          } else if (event.which == 27) {
            // escape
            _this4.closeDropDown();
          }
        });
        $filterInput.on('input', function () {
          _this4.input(true);
        });
      };

      return MultiSelect;
    }();

    function AddToJQueryPrototype(pluginName, createPlugin, $) {
      var firstChar = pluginName.charAt(0);
      var firstCharLower = firstChar.toLowerCase();

      if (firstCharLower == firstChar) {
        throw new TypeError("Plugin name '" + pluginName + "' should be started from upper case char");
      }

      var prototypableName = firstCharLower + pluginName.slice(1);
      var noConflictPrototypable = $.fn[prototypableName];
      var dataKey = "DashboardCode." + pluginName;

      function prototypable(options) {
        return this.each(function () {
          var $e = $(this);
          var instance = $e.data(dataKey);
          var isMethodName = typeof options === 'string';

          if (!instance) {
            if (isMethodName && /Dispose/.test(options)) {
              return;
            }

            var optionsObject = typeof options === 'object' ? options : null;
            instance = createPlugin(this, optionsObject, function () {
              $e.removeData(dataKey);
            });
            $e.data(dataKey, instance);
          }

          if (isMethodName) {
            var methodName = options;

            if (typeof instance[methodName] === 'undefined') {
              throw new TypeError("No method named '" + methodName + "'");
            }

            instance[methodName]();
          }
        });
      }

      $.fn[prototypableName] = prototypable; // pluginName with first capitalized letter - return plugin instance for 1st $selected item

      $.fn[pluginName] = function () {
        return $(this).data(dataKey);
      };

      $.fn[prototypableName].noConflict = function () {
        $.fn[prototypableName] = noConflictPrototypable;
        return prototypable;
      };
    }

    function disableButton($selectedPanel, isDisabled) {
      $selectedPanel.find('BUTTON').prop("disabled", isDisabled);
    } // addClass, removeClass, css, siblings('label'), hasClass, find('BUTTON').prop(..)


    var Bs4Adapter =
    /*#__PURE__*/
    function () {
      function Bs4Adapter(stylingAdapter, configuration, $) {
        var _this = this;

        var defaults = {
          containerClass: 'dashboardcode-bsmultiselect',
          dropDownMenuClass: 'dropdown-menu',
          dropDownItemClass: 'px-2',
          dropDownItemHoverClass: 'text-primary bg-light',
          selectedPanelClass: 'form-control',
          selectedItemClass: 'badge',
          removeSelectedItemButtonClass: 'close',
          filterInputItemClass: '',
          filterInputClass: ''
        };
        var tmp = $.extend({}, defaults, configuration);
        this.configuration = $.extend(configuration, tmp);
        this.$ = $;
        this.stylingAdapter = stylingAdapter;
        this.bs4LabelDispose = null;

        this.createDropDownItemContent = function (configuration, $dropDownItem, option) {
          var checkBoxId = _this.configuration.createCheckBoxId(configuration, option);

          var $dropDownItemContent = _this.$("<div class=\"custom-control custom-checkbox\">\n                <input type=\"checkbox\" class=\"custom-control-input\">\n                <label class=\"custom-control-label\"></label>\n            </div>");

          $dropDownItemContent.appendTo($dropDownItem);
          var $checkBox = $dropDownItemContent.find("INPUT[type=\"checkbox\"]");
          $checkBox.attr('id', checkBoxId);
          var $checkBoxLabel = $dropDownItemContent.find("label");
          $checkBoxLabel.attr('for', checkBoxId);
          $checkBoxLabel.text(option.text);
          $dropDownItem.addClass(configuration.dropDownItemClass);
          var dropDownItem = $dropDownItem.get(0);
          var dropDownItemContent = $dropDownItemContent.get(0);
          var stylingAdapter = _this.stylingAdapter;
          return {
            select: function select(isSelected) {
              $checkBox.prop('checked', isSelected);
            },
            disable: function disable(isDisabled) {
              $checkBox.prop('disabled', isDisabled);
            },
            disabledStyle: function disabledStyle(_disabledStyle) {
              stylingAdapter.DisabledStyle($checkBox, _disabledStyle);
            },
            onSelected: function onSelected(toggle) {
              $checkBox.on("change", toggle);
              $dropDownItem.on("click", function (e) {
                if (e.target == dropDownItem || e.target == dropDownItemContent) toggle();
              });
            }
          };
        };

        this.createSelectedItemContent = function (configuration, $selectedItem, optionItem, removeSelectedItem, controlDisabled) {
          var $content = _this.$("<span/>").text(optionItem.text);

          $content.appendTo($selectedItem);
          if (optionItem.disabled) _this.stylingAdapter.DisableSelectedItemContent($content);

          var $button = _this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>') // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
          // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
          .css("float", "none") // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
          // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
          // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
          // because of the event's bubling process removeSelectedItem runs first. 
          // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
          // before we could analize is it belong to our dropdown or not.
          // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
          // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
          // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
          // the situation described above: click outside dropdown on the same component.
          // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target that belomgs to DOM (e.g. panel)
          .on("click", function () {
            return setTimeout(removeSelectedItem, 0);
          }).appendTo($selectedItem).prop("disabled", controlDisabled);

          $selectedItem.addClass(configuration.selectedItemClass);
          $button.addClass(configuration.removeSelectedItemButtonClass); // bs close class set the float:right

          if (_this.stylingAdapter.CreateSelectedItemContent) _this.stylingAdapter.CreateSelectedItemContent($selectedItem, $button);
        };
      } // ------------------------------------------------------------------------------------------------


      var _proto = Bs4Adapter.prototype;

      _proto.Init = function Init(dom) {
        dom.container.addClass(this.configuration.containerClass);
        dom.selectedPanel.addClass(this.configuration.selectedPanelClass);
        dom.dropDownMenu.addClass(this.configuration.dropDownMenuClass);
        dom.filterInputItem.addClass(this.configuration.filterInputItemClass);
        dom.filterInput.addClass(this.configuration.filterInputClass);
        if (this.stylingAdapter.OnInit) this.stylingAdapter.OnInit(dom);
        this.bs4LabelDispose = this.HandleLabel(dom.filterInput);
      };

      _proto.HandleLabel = function HandleLabel($filterInput) {
        var label = this.configuration.label;

        if (label != null) {
          var newForId = this.configuration.createInputId(this.configuration);
          var backupForId = label.getAttribute('for');
          $filterInput.attr('id', newForId);
          label.setAttribute('for', newForId);
          return function () {
            label.setAttribute('for', backupForId);
          };
        }

        return null;
      };

      _proto.Dispose = function Dispose() {
        if (this.bs4LabelDispose) this.bs4LabelDispose();
      } // ------------------------------------------------------------------------------------------------
      ;

      _proto.CreateDropDownItemContent = function CreateDropDownItemContent($dropDownItem, option) {
        return this.createDropDownItemContent(this.configuration, $dropDownItem, option);
      };

      _proto.CreateSelectedItemContent = function CreateSelectedItemContent($selectedItem, optionItem, removeSelectedItem, controlDisabled) {
        return this.createSelectedItemContent(this.configuration, $selectedItem, optionItem, removeSelectedItem, controlDisabled);
      } // -----------------------
      ;

      _proto.IsClickToOpenDropdown = function IsClickToOpenDropdown(event) {
        var target = event.target;
        var nodeName = target.nodeName;
        return !(nodeName == "BUTTON" || nodeName == "SPAN" && target.parentElement.nodeName == "BUTTON");
      };

      _proto.UpdateIsValid = function UpdateIsValid($selectedPanel) {
        if (this.configuration.getIsValid()) {
          $selectedPanel.addClass("is-valid");
        }

        if (this.configuration.getIsInvalid()) {
          $selectedPanel.addClass("is-invalid");
        }
      };

      _proto.UpdateSize = function UpdateSize($selectedPanel) {
        if (this.stylingAdapter.UpdateSize) this.stylingAdapter.UpdateSize($selectedPanel);
      };

      _proto.HoverIn = function HoverIn($dropDownItem) {
        $dropDownItem.addClass(this.configuration.dropDownItemHoverClass);
      };

      _proto.HoverOut = function HoverOut($dropDownItem) {
        $dropDownItem.removeClass(this.configuration.dropDownItemHoverClass);
      };

      _proto.Enable = function Enable($selectedPanel) {
        this.stylingAdapter.Enable($selectedPanel);
        disableButton($selectedPanel, false);
      };

      _proto.Disable = function Disable($selectedPanel) {
        this.stylingAdapter.Disable($selectedPanel);
        disableButton($selectedPanel, true);
      };

      _proto.FocusIn = function FocusIn($selectedPanel) {
        this.stylingAdapter.FocusIn($selectedPanel);
      };

      _proto.FocusOut = function FocusOut($selectedPanel) {
        this.stylingAdapter.FocusOut($selectedPanel);
      };

      return Bs4Adapter;
    }();

    var OptionsAdapterElement = function OptionsAdapterElement(selectElement, configuration, $) {
      var $selectElement = $(selectElement);

      configuration.getIsValid = function () {
        return $selectElement.hasClass("is-valid");
      };

      configuration.getIsInvalid = function () {
        return $selectElement.hasClass("is-invalid");
      };

      configuration.createInputId = function (configuration) {
        return configuration.containerClass + "-generated-filter-" + selectElement.name.toLowerCase() + "-id";
      };

      configuration.label = null;
      var $formGroup = $selectElement.closest('.form-group');

      if ($formGroup.length == 1) {
        var $label = $formGroup.find("label[for=\"" + selectElement.id + "\"]");

        if ($label.length > 0) {
          var label = $label.get(0);
          var forId = label.getAttribute('for');

          if (forId == selectElement.id) {
            configuration.label = label;
          }
        }
      }

      configuration.createCheckBoxId = function (configuration, option) {
        return configuration.containerClass + "-" + selectElement.name.toLowerCase() + "-generated-checkbox-" + option.value.toLowerCase() + "-id";
      };

      this.init = function (ms) {
        selectElement.style.display = 'none';
        var container = document.createElement("div");

        var _ms$fillContainer = ms.fillContainer(container, function () {
          return container.parentNode.removeChild(container);
        }),
            $container = _ms$fillContainer.$container,
            $selectedPanel = _ms$fillContainer.$selectedPanel,
            $dropDownMenu = _ms$fillContainer.$dropDownMenu,
            $filterInput = _ms$fillContainer.$filterInput;

        $container.insertAfter(selectElement);
        ms.init($container, $selectedPanel, $dropDownMenu, $filterInput, function () {
          $selectElement.trigger('change');
          $selectElement.trigger("multiselect:change");
        }, function () {
          return $selectElement.find('OPTION');
        }, function () {
          return selectElement.disabled;
        });
      };
    };

    var OptionsAdapterJson = function OptionsAdapterJson(container, configuration) {
      configuration.getIsValid = configuration.hasOwnProperty("getIsValid") ? configuration.getIsValid : function () {
        return false;
      };
      configuration.getIsInvalid = configuration.hasOwnProperty("getIsInvalid") ? configuration.getIsInvalid : function () {
        return false;
      };

      configuration.createInputId = function (configuration) {
        return configuration.containerClass + "-generated-filter-" + container.id;
      };

      configuration.label = configuration.hasOwnProperty("label") ? configuration.label : null;

      configuration.createCheckBoxId = function (configuration, option) {
        return configuration.containerClass + "-" + container.id + "-generated-checkbox-" + option.value.toLowerCase() + "-id";
      };

      this.init = function (ms) {
        var _ms$fillContainer = ms.fillContainer(container, function () {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        }),
            $container = _ms$fillContainer.$container,
            $selectedPanel = _ms$fillContainer.$selectedPanel,
            $dropDownMenu = _ms$fillContainer.$dropDownMenu,
            $filterInput = _ms$fillContainer.$filterInput;

        ms.init($container, $selectedPanel, $dropDownMenu, $filterInput, function () {
          $container.trigger("multiselect:change");
        }, function () {
          return configuration.options;
        }, configuration.hasOwnProperty("getDisabled") ? configuration.getDisabled : function () {
          return true;
        });
      };
    };

    (function (window, $) {
      AddToJQueryPrototype('BsMultiSelect', function (element, configuration, onDispose) {
        var optionsAdapter = null;
        configuration = $.extend({}, configuration);
        if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
          optionsAdapter = configuration.options ? new OptionsAdapterJson(element, configuration) : new OptionsAdapterElement(element, configuration, $);
        }
        var adapter = null;
        if (configuration.adapter) adapter = configuration.adapter;else {
          var stylingAdapter = configuration.useCss ? new Bs4AdapterCss(configuration, $) : new Bs4AdapterJs(configuration, $);
          adapter = new Bs4Adapter(stylingAdapter, configuration, $);
        }
        var multiSelect = new MultiSelect(optionsAdapter, adapter, configuration, onDispose, window, $);
        return multiSelect;
      }, $);
    })(window, $);

}));
//# sourceMappingURL=BsMultiSelect.js.map
