/*!
  * DashboardCode BsMultiSelect v0.1.15 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2018 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('popper.js')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
    (global.BsMultiSelect = factory(global.jQuery,global.Popper));
}(this, (function ($,Popper) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

    var Bs4Commons =
    /*#__PURE__*/
    function () {
      function Bs4Commons(jQuery, hiddenSelect, dropDownItemHoverClass) {
        this.$ = jQuery;
        this.hiddenSelect = hiddenSelect;
        this.dropDownItemHoverClass = dropDownItemHoverClass;
      }

      var _proto = Bs4Commons.prototype;

      _proto.CreateDropDownItemContent = function CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected, containerClass, dropDownItemClass) {
        var checkBoxId = containerClass + "-" + this.hiddenSelect.name.toLowerCase() + "-generated-id-" + optionId.toLowerCase();
        var checked = isSelected ? "checked" : "";
        var $dropDownItemContent = this.$("<div class=\"custom-control custom-checkbox\">\n            <input type=\"checkbox\" class=\"custom-control-input\" id=\"" + checkBoxId + "\" " + checked + ">\n            <label class=\"custom-control-label\" for=\"" + checkBoxId + "\">" + itemText + "</label>\n        </div>");
        $dropDownItemContent.appendTo($dropDownItem);
        var $checkBox = $dropDownItem.find("INPUT[type=\"checkbox\"]");

        var adoptDropDownItem = function adoptDropDownItem(isSelected) {
          $checkBox.prop('checked', isSelected);
        };

        $dropDownItem.addClass(dropDownItemClass);
        return adoptDropDownItem;
      };

      _proto.CreateSelectedItemContent = function CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, selectedItemClass, removeSelectedItemButtonClass, disabled) {
        $selectedItem.addClass(selectedItemClass);
        this.$("<span>" + itemText + "</span>").appendTo($selectedItem);
        var $button = this.$('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>').addClass(removeSelectedItemButtonClass).css("white-space", "nowrap").on("click", removeSelectedItem).appendTo($selectedItem).prop("disabled", disabled);
        return $button;
      };

      _proto.FilterClick = function FilterClick(event) {
        return !(event.target.nodeName == "BUTTON" || event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON");
      };

      _proto.Hover = function Hover($dropDownItem, isHover) {
        if (isHover) $dropDownItem.addClass(this.dropDownItemHoverClass);else $dropDownItem.removeClass(this.dropDownItemHoverClass);
      };

      return Bs4Commons;
    }();

    var Bs4AdapterCss =
    /*#__PURE__*/
    function () {
      function Bs4AdapterCss(jQuery, hiddenSelect, options) {
        var defaults = {
          containerClass: 'dashboardcode-bsmultiselect',
          dropDownMenuClass: 'dropdown-menu',
          dropDownItemClass: 'px-2',
          dropDownItemHoverClass: 'text-primary bg-light',
          selectedPanelClass: 'form-control',
          selectedPanelFocusClass: 'focus',
          selectedPanelReadonlyClass: 'disabled',
          selectedItemClass: 'badge',
          removeSelectedItemButtonClass: 'close',
          filterInputItemClass: '',
          filterInputClass: ''
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery = jQuery;
        this.hiddenSelect = hiddenSelect;
        this.bs4Commons = new Bs4Commons(jQuery, hiddenSelect, this.options.dropDownItemHoverClass);
      }

      var _proto = Bs4AdapterCss.prototype;

      _proto.Init = function Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu) {
        $container.addClass(this.options.containerClass);
        $selectedPanel.addClass(this.options.selectedPanelClass);
        $dropDownMenu.addClass(this.options.dropDownMenuClass);
        $filterInputItem.addClass(this.options.filterInputItemClass);
        $filterInput.addClass(this.options.filterInputClass);
        var inputId = this.hiddenSelect.id;
        var $formGroup = this.jQuery(this.hiddenSelect).closest('.form-group');

        if ($formGroup.length == 1) {
          var $label = $formGroup.find("label[for=\"" + inputId + "\"]");
          var f = $label.attr('for');

          var _$filterInput = $selectedPanel.find('input');

          if (f == this.hiddenSelect.id) {
            var id = this.options.containerClass + "-generated-filter-id-" + this.hiddenSelect.id;

            _$filterInput.attr('id', id);

            $label.attr('for', id);
          }
        }
      };

      _proto.UpdateIsValid = function UpdateIsValid($selectedPanel) {
        var $hiddenSelect = this.jQuery(this.hiddenSelect);

        if ($hiddenSelect.hasClass("is-valid")) {
          $selectedPanel.addClass("is-valid");
        }

        if ($hiddenSelect.hasClass("is-invalid")) {
          $selectedPanel.addClass("is-invalid");
        }
      };

      _proto.Enable = function Enable($selectedPanel, isEnabled) {
        if (isEnabled) {
          $selectedPanel.removeClass(this.options.selectedPanelReadonlyClass);
          $selectedPanel.find('BUTTON').prop("disabled", false);
        } else {
          $selectedPanel.addClass(this.options.selectedPanelReadonlyClass);
          $selectedPanel.find('BUTTON').prop("disabled", true);
        }
      };

      _proto.CreateDropDownItemContent = function CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected) {
        return this.bs4Commons.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected, this.options.containerClass, this.options.dropDownItemClass);
      };

      _proto.CreateSelectedItemContent = function CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, disabled) {
        this.bs4Commons.CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, this.options.selectedItemClass, this.options.removeSelectedItemButtonClass, disabled);
      };

      _proto.Hover = function Hover($dropDownItem, isHover) {
        this.bs4Commons.Hover($dropDownItem, isHover);
      };

      _proto.FilterClick = function FilterClick(event) {
        return this.bs4Commons.FilterClick(event);
      };

      _proto.Focus = function Focus($selectedPanel, isFocused) {
        if (isFocused) {
          $selectedPanel.addClass(this.options.selectedPanelFocusClass);
        } else {
          $selectedPanel.removeClass(this.options.selectedPanelFocusClass);
        }
      };

      return Bs4AdapterCss;
    }();

    var Bs4Adapter =
    /*#__PURE__*/
    function () {
      function Bs4Adapter(jQuery, hiddenSelect, options) {
        var defaults = {
          selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
          selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
          selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
          selectedPanelReadonlyBackgroundColor: '#e9ecef',
          selectedPanelFocusBorderColor: '#80bdff',
          selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
          selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
          selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
          filterInputColor: '#495057'
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery = jQuery;
        this.hiddenSelect = hiddenSelect;
        this.containerClass = 'dashboardcode-bsmultiselect';
        this.dropDownMenuClass = 'dropdown-menu';
        this.dropDownItemClass = 'px-2';
        this.dropDownItemHoverClass = 'text-primary bg-light';
        this.selectedPanelClass = 'form-control';
        this.selectedItemClass = 'badge';
        this.removeSelectedItemButtonClass = 'close';
        this.selectedPanelStyle = {
          'margin-bottom': '0'
        };
        this.selectedItemStyle = {
          'padding-left': '0px',
          'line-height': '1.5em'
        };
        this.removeSelectedItemButtonStyle = {
          'font-size': '1.5em',
          'line-height': '.9em'
        };
        this.bs4Commons = new Bs4Commons(jQuery, hiddenSelect, this.dropDownItemHoverClass);
      }

      var _proto = Bs4Adapter.prototype;

      _proto.Init = function Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu) {
        $container.addClass(this.containerClass);
        $selectedPanel.addClass(this.selectedPanelClass);
        $selectedPanel.css(this.selectedPanelStyle);
        $dropDownMenu.addClass(this.dropDownMenuClass);
        $filterInput.css("color", this.options.filterInputColor);
        var inputId = this.hiddenSelect.id;
        var $formGroup = this.jQuery(this.hiddenSelect).closest('.form-group');

        if ($formGroup.length == 1) {
          var $label = $formGroup.find("label[for=\"" + inputId + "\"]");
          var f = $label.attr('for');

          var _$filterInput = $selectedPanel.find('input');

          if (f == this.hiddenSelect.id) {
            var id = this.containerClass + "-generated-filter-id-" + this.hiddenSelect.id;

            _$filterInput.attr('id', id);

            $label.attr('for', id);
          }
        }
      };

      _proto.UpdateIsValid = function UpdateIsValid($selectedPanel) {
        var $hiddenSelect = this.jQuery(this.hiddenSelect);

        if ($hiddenSelect.hasClass("is-valid")) {
          $selectedPanel.addClass("is-valid");
        }

        if ($hiddenSelect.hasClass("is-invalid")) {
          $selectedPanel.addClass("is-invalid");
        }
      };

      _proto.UpdateSize = function UpdateSize($selectedPanel) {
        if ($selectedPanel.hasClass("form-control-lg")) {
          $selectedPanel.css("min-height", this.options.selectedPanelLgMinHeight);
        } else if ($selectedPanel.hasClass("form-control-sm")) {
          $selectedPanel.css("min-height", this.options.selectedPanelSmMinHeight);
        } else {
          $selectedPanel.css("min-height", this.options.selectedPanelDefMinHeight);
        }
      };

      _proto.Enable = function Enable($selectedPanel, isEnabled) {
        if (isEnabled) {
          $selectedPanel.css({
            "background-color": ""
          });
          $selectedPanel.find('BUTTON').prop("disabled", false);
        } else {
          $selectedPanel.css({
            "background-color": this.options.selectedPanelReadonlyBackgroundColor
          });
          $selectedPanel.find('BUTTON').prop("disabled", true);
        }
      };

      _proto.CreateDropDownItemContent = function CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected) {
        return this.bs4Commons.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected, this.containerClass, this.dropDownItemClass);
      };

      _proto.CreateSelectedItemContent = function CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, disabled) {
        var $buttom = this.bs4Commons.CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem, this.selectedItemClass, this.removeSelectedItemButtonClass, disabled);
        $buttom.css(this.removeSelectedItemButtonStyle);
        $selectedItem.css(this.selectedItemStyle);
      };

      _proto.Hover = function Hover($dropDownItem, isHover) {
        this.bs4Commons.Hover($dropDownItem, isHover);
      };

      _proto.FilterClick = function FilterClick(event) {
        return this.bs4Commons.FilterClick(event);
      };

      _proto.Focus = function Focus($selectedPanel, isFocused) {
        if (isFocused) {
          if ($selectedPanel.hasClass("is-valid")) {
            $selectedPanel.css("box-shadow", this.options.selectedPanelFocusValidBoxShadow);
          } else if ($selectedPanel.hasClass("is-invalid")) {
            $selectedPanel.css("box-shadow", this.options.selectedPanelFocusInvalidBoxShadow);
          } else {
            $selectedPanel.css("box-shadow", this.options.selectedPanelFocusBoxShadow).css("border-color", this.options.selectedPanelFocusBorderColor);
          }
        } else {
          $selectedPanel.css("box-shadow", "").css("border-color", "");
        }
      };

      return Bs4Adapter;
    }();

    var BsMultiSelect = function (window, $$$1, Popper$$1) {
      var JQUERY_NO_CONFLICT = $$$1.fn[pluginName];
      var pluginName = 'dashboardCodeBsMultiSelect';
      var dataKey = "plugin_" + pluginName;
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

      var defaults = {
        doManageFocus: true,
        useCss: false,
        adapter: null
      };

      var Plugin =
      /*#__PURE__*/
      function () {
        function Plugin(selectElement, options, adapter) {
          if (typeof Popper$$1 === 'undefined') {
            throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
          } // readonly


          this.selectElement = selectElement;
          this.options = $$$1.extend({}, defaults, options);
          if (adapter) this.adapter = adapter;else this.adapter = this.options.useCss ? new Bs4AdapterCss($$$1, this.selectElement, this.options) : new Bs4Adapter($$$1, this.selectElement, this.options);
          this.container = null;
          this.selectedPanel = null;
          this.filterInputItem = null;
          this.filterInput = null;
          this.dropDownMenu = null;
          this.popper = null; // removable handlers

          this.selectedPanelClick = null;
          this.documentMouseup = null;
          this.documentMousedown = null;
          this.documentMouseup2 = null; // state

          this.disabled = null;
          this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

          this.skipFocusout = false;
          this.hoveredDropDownItem = null;
          this.hoveredDropDownIndex = null;
          this.hasDropDownVisible = false;
          this.init();
        }

        var _proto = Plugin.prototype;

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
        }; // Public methods


        _proto.resetDropDownMenuHover = function resetDropDownMenuHover() {
          if (this.hoveredDropDownItem !== null) {
            this.adapter.Hover($$$1(this.hoveredDropDownItem), false);
            this.hoveredDropDownItem = null;
          }

          this.hoveredDropDownIndex = null;
        };

        _proto.filterDropDownMenu = function filterDropDownMenu() {
          var text = this.filterInput.value.trim().toLowerCase();
          var visible = 0;
          $$$1(this.dropDownMenu).find('LI').each(function (i, dropDownMenuItem) {
            var $dropDownMenuItem = $$$1(dropDownMenuItem);

            if (text == '') {
              $dropDownMenuItem.show();
              visible++;
            } else {
              var itemText = $dropDownMenuItem.data("option-text");
              var isSelected = $dropDownMenuItem.data("option-selected");

              if (!isSelected && itemText.indexOf(text) >= 0) {
                $dropDownMenuItem.show();
                visible++;
              } else {
                $dropDownMenuItem.hide();
              }
            }
          });
          this.hasDropDownVisible = visible > 0;
          this.resetDropDownMenuHover();
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

        _proto.appendDropDownItem = function appendDropDownItem(optionElement) {
          var _this = this;

          var optionId = optionElement.value;
          var itemText = optionElement.text;
          var isSelected = optionElement.selected;
          var $dropDownItem = $$$1("<LI/>");
          $dropDownItem.data("option-id", optionId);
          $dropDownItem.data("option-text", itemText.toLowerCase());
          var adoptDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected);
          $dropDownItem.appendTo(this.dropDownMenu);

          var appendItem = function appendItem(doTrigger) {
            $dropDownItem.data("option-selected", true);
            var $selectedItem = $$$1("<LI/>");
            $selectedItem.data("option-id", optionId);
            optionElement.selected = true;
            adoptDropDownItem(true);

            var removeItem = function removeItem() {
              $dropDownItem.data("option-selected", false);
              $dropDownItem.data("option-toggle", appendItem);
              $selectedItem.data("option-remove", null);
              $selectedItem.remove();
              optionElement.selected = false;
              adoptDropDownItem(false);
              $$$1(_this.selectElement).trigger('change');
            };

            var removeItemAndCloseDropDown = function removeItemAndCloseDropDown() {
              removeItem();

              _this.closeDropDown();
            };

            _this.adapter.CreateSelectedItemContent($selectedItem, itemText, removeItemAndCloseDropDown, _this.disabled);

            $selectedItem.insertBefore(_this.filterInputItem);
            $dropDownItem.data("option-toggle", removeItem);
            $selectedItem.data("option-remove", removeItemAndCloseDropDown);
            if (typeof doTrigger === "undefined" || doTrigger === true) $$$1(_this.selectElement).trigger('change');
            return $selectedItem;
          };

          $dropDownItem.data("option-toggle", appendItem);

          if (isSelected) {
            appendItem(false);
          }

          var manageHover = function manageHover(event, isOn) {
            _this.adapter.Hover($$$1(event.target).closest("LI"), isOn);
          };

          $dropDownItem.click(function (event) {
            event.preventDefault();
            event.stopPropagation();
            var toggleItem = $$$1(event.currentTarget).closest("LI").data("option-toggle");
            toggleItem();

            _this.filterInput.focus();
          }).mouseover(function (e) {
            return manageHover(e, true);
          }).mouseout(function (e) {
            return manageHover(e, false);
          });
        };

        _proto.keydownArrow = function keydownArrow(down) {
          var visibleNodeListArray = $$$1(this.dropDownMenu).find('LI:not([style*="display: none"])').toArray();

          if (visibleNodeListArray.length > 0) {
            if (this.hasDropDownVisible) {
              this.updateDropDownPosition(true);
              this.showDropDown();
            }

            if (this.hoveredDropDownItem === null) {
              this.hoveredDropDownIndex = down ? 0 : visibleNodeListArray.length - 1;
            } else {
              this.adapter.Hover($$$1(this.hoveredDropDownItem), false);

              if (down) {
                var newIndex = this.hoveredDropDownIndex + 1;
                this.hoveredDropDownIndex = newIndex < visibleNodeListArray.length ? newIndex : 0;
              } else {
                var _newIndex = this.hoveredDropDownIndex - 1;

                this.hoveredDropDownIndex = _newIndex >= 0 ? _newIndex : visibleNodeListArray.length - 1;
              }
            }

            this.hoveredDropDownItem = visibleNodeListArray[this.hoveredDropDownIndex];
            this.adapter.Hover($$$1(this.hoveredDropDownItem), true);
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
          var $selectedPanel = this.selectedPanel;
          this.adapter.UpdateIsValid($selectedPanel);
          this.UpdateSizeImpl($selectedPanel);
          this.UpdateReadonlyImpl($$$1(this.container), $selectedPanel);
        };

        _proto.UpdateSize = function UpdateSize() {
          this.UpdateSizeImpl($$$1(this.selectedPanel));
        };

        _proto.UpdateReadonly = function UpdateReadonly() {
          this.UpdateReadonlyImpl($$$1(this.container), $$$1(this.selectedPanel));
        };

        _proto.UpdateSizeImpl = function UpdateSizeImpl($selectedPanel) {
          if (this.adapter.UpdateSize) this.adapter.UpdateSize($selectedPanel);
        };

        _proto.UpdateReadonlyImpl = function UpdateReadonlyImpl($container, $selectedPanel) {
          var disabled = this.selectElement.disabled;

          if (this.disabled !== disabled) {
            if (disabled) {
              this.filterInput.style.display = "none";
              this.adapter.Enable($selectedPanel, false);

              if (this.options.doManageFocus) {
                $container.unbind("mousedown", this.containerMousedown);
                $$$1(window.document).unbind("mouseup", this.documentMouseup);
              }

              $selectedPanel.unbind("click", this.selectedPanelClick);
              $$$1(window.document).unbind("mouseup", this.documentMouseup2);
            } else {
              this.filterInput.style.display = "inline-block";
              this.adapter.Enable($selectedPanel, true);

              if (this.options.doManageFocus) {
                $container.mousedown(this.containerMousedown); // removable

                $$$1(window.document).mouseup(this.documentMouseup); // removable
              }

              $selectedPanel.click(this.selectedPanelClick); // removable

              $$$1(window.document).mouseup(this.documentMouseup2); // removable
            }

            this.disabled = disabled;
          }
        };

        _proto.init = function init() {
          var _this2 = this;

          var $hiddenSelect = $$$1(this.selectElement);
          $hiddenSelect.hide();
          var $container = $$$1("<DIV/>");
          this.container = $container.get(0);
          var $selectedPanel = $$$1("<UL/>");
          $selectedPanel.css(defSelectedPanelStyleSys);
          this.selectedPanel = $selectedPanel.get(0);
          $selectedPanel.appendTo(this.container);
          var $filterInputItem = $$$1('<LI/>');
          this.filterInputItem = $filterInputItem.get(0);
          $filterInputItem.appendTo(this.selectedPanel);
          var $filterInput = $$$1('<INPUT type="search" autocomplete="off">');
          $filterInput.css(defFilterInputStyleSys);
          $filterInput.appendTo(this.filterInputItem);
          this.filterInput = $filterInput.get(0);
          var $dropDownMenu = $$$1("<UL/>").css({
            "display": "none"
          }).appendTo($container);
          this.dropDownMenu = $dropDownMenu.get(0); // prevent heavy understandable styling error

          $dropDownMenu.css(defDropDownMenuStyleSys); // create handlers

          this.documentMouseup = function () {
            _this2.skipFocusout = false;
          };

          this.documentMousedown = function () {
            _this2.skipFocusout = true;
          };

          this.documentMouseup2 = function (event) {
            if (!(_this2.container === event.target || $$$1.contains(_this2.container, event.target))) {
              _this2.closeDropDown();
            }
          };

          this.selectedPanelClick = function (event) {
            if (event.target.nodeName != "INPUT") $$$1(_this2.filterInput).val('').focus();

            if (_this2.hasDropDownVisible && _this2.adapter.FilterClick(event)) {
              _this2.updateDropDownPosition(true);

              _this2.showDropDown();
            }
          };

          this.adapter.Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu);
          $container.insertAfter($hiddenSelect);
          this.popper = new Popper$$1(this.filterInput, this.dropDownMenu, {
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
          this.UpdateReadonlyImpl($container, $selectedPanel); // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event

          $$$1(document).ready(function () {
            var selectOptions = $hiddenSelect.find('OPTION');
            selectOptions.each(function (index, optionElement) {
              _this2.appendDropDownItem(optionElement);
            });
            _this2.hasDropDownVisible = selectOptions.length > 0;

            _this2.updateDropDownPosition(false);
          });
          $dropDownMenu.click(function (event) {
            return event.stopPropagation();
          });
          $dropDownMenu.mouseover(function () {
            return _this2.resetDropDownMenuHover();
          });

          if (this.options.doManageFocus) {
            $filterInput.focusin(function () {
              return _this2.adapter.Focus($selectedPanel, true);
            }).focusout(function () {
              if (!_this2.skipFocusout) _this2.adapter.Focus($selectedPanel, false);
            });
          }

          $filterInput.on("keydown", function (event) {
            if (event.which == 38) {
              event.preventDefault();

              _this2.keydownArrow(false);
            } else if (event.which == 40) {
              event.preventDefault();

              _this2.keydownArrow(true);
            } else if (event.which == 13) {
              event.preventDefault();
            } else if (event.which == 9) {
              if (_this2.filterInput.value) {
                event.preventDefault();
              } else {
                _this2.closeDropDown();
              }
            } else {
              if (event.which == 8) {
                // NOTE: this will process backspace only if there are no text in the input field
                // If user will find this inconvinient, we will need to calculate something like this
                // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
                if (!_this2.filterInput.value) {
                  var $penult = $$$1(_this2.selectedPanel).find("LI:last").prev();

                  if ($penult.length) {
                    var removeItem = $penult.data("option-remove");
                    removeItem();
                  }

                  _this2.updateDropDownPosition(false);
                }
              }

              _this2.resetDropDownMenuHover();
            }
          });
          $filterInput.on("keyup", function (event) {
            if (event.which == 13 || event.which == 9) {
              if (_this2.hoveredDropDownItem) {
                var $hoveredDropDownItem = $$$1(_this2.hoveredDropDownItem);
                var toggleItem = $hoveredDropDownItem.data("option-toggle");
                toggleItem();

                _this2.closeDropDown();
              } else {
                var text = _this2.filterInput.value.trim().toLowerCase();

                var dropDownItems = _this2.dropDownMenu.querySelectorAll("LI");

                var dropDownItem = null;

                for (var i = 0; i < dropDownItems.length; ++i) {
                  var it = dropDownItems[i];

                  if (it.textContent.trim().toLowerCase() == text) {
                    dropDownItem = it;
                    break;
                  }
                }

                if (dropDownItem) {
                  var $dropDownItem = $$$1(dropDownItem);
                  var isSelected = $dropDownItem.data("option-selected");

                  if (!isSelected) {
                    var toggle = $dropDownItem.data("option-toggle");
                    toggle();
                  }

                  _this2.clearFilterInput(true);
                }
              }
            } else if (event.which == 27) {
              // escape
              _this2.closeDropDown();
            }
          });
          $filterInput.on('input', function () {
            _this2.input(true);
          });
        };

        return Plugin;
      }();

      function jQueryInterface(options) {
        return this.each(function () {
          var data = $$$1(this).data(dataKey);

          if (!data) {
            if (/dispose|hide/.test(options)) {
              return;
            }

            var optionsObject = typeof options === 'object' ? options : null;
            data = new Plugin(this, optionsObject);
            $$$1(this).data(dataKey, data);
          }

          if (typeof options === 'string') {
            var methodName = options;

            if (typeof data[methodName] === 'undefined') {
              throw new TypeError("No method named \"" + methodName + "\"");
            }

            data[methodName]();
          }
        });
      }

      $$$1.fn[pluginName] = jQueryInterface; // in case of mulitple $(this) it will return 1st element plugin instance

      $$$1.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function () {
        return $$$1(this).data("plugin_" + pluginName);
      };

      $$$1.fn[pluginName].Constructor = Plugin;

      $$$1.fn[pluginName].noConflict = function () {
        $$$1.fn[pluginName] = JQUERY_NO_CONFLICT;
        return jQueryInterface;
      };

      return Plugin;
    }(window, $, Popper);

    return BsMultiSelect;

})));
//# sourceMappingURL=BsMultiSelect.js.map
