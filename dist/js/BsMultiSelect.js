/*!
  * DashboardCode BsMultiSelect v0.1.6 (https://dashboardcode.github.io/BsMultiSelect/)
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

    var Bootstrap4Adapter =
    /*#__PURE__*/
    function () {
      function Bootstrap4Adapter(jQuery, hiddenSelect, options) {
        var defaults = {
          //usePopper: true,
          selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
          selectedPanelReadonlyBackgroundColor: '#e9ecef',
          selectedPanelBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
          selectedPanelBorderColor: '#80bdff',
          selectedPanelValidBoxShadow: ' 0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
          selectedPanelInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
          filterInputColor: '#495057',
          containerClass: 'dashboardcode-bsmultiselect',
          dropDownMenuClass: 'dropdown-menu',
          dropDownItemClass: 'px-2',
          selectedPanelClass: '',
          selectedPanelFocusClass: '',
          selectedPanelReadonlyClass: '',
          selectedItemClass: '',
          removeSelectedItemButtonClass: '',
          filterInputItemClass: '',
          filterInputClass: ''
        };
        this.options = jQuery.extend({}, defaults, options);
        this.jQuery = jQuery;
        this.hiddenSelect = hiddenSelect;
      }

      var _proto = Bootstrap4Adapter.prototype;

      _proto.CreateSelectedItemContent = function CreateSelectedItemContent($selectedItem, itemText, removeSelectedItem) {
        var defSelectedItemClass = 'badge';
        var defSelectedItemStyle = {
          'padding-left': '0px',
          'line-height': '1rem'
        };
        var defRemoveSelectedItemButtonClass = 'close';
        var defRemoveSelectedItemButtonStyle = {
          'line-height': '1rem',
          'font-size': '1.3rem'
        };

        if (!this.options.selectedItemClass) {
          $selectedItem.addClass(defSelectedItemClass);
          $selectedItem.css(defSelectedItemStyle);
        } else {
          $selectedItem.addClass(this.options.selectedItemClass);
        }

        var $text = this.jQuery("<span>" + itemText + "</span>");
        var $buttom = this.jQuery('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>');

        if (!this.options.removeSelectedItemButtonClass) {
          $buttom.addClass(defRemoveSelectedItemButtonClass);
          $buttom.css(defRemoveSelectedItemButtonStyle);
        } else {
          $buttom.addClass(this.options.removeSelectedItemButtonClass);
        }

        $buttom.on("click", removeSelectedItem);
        $text.appendTo($selectedItem);
        $buttom.appendTo($selectedItem);
      };

      _proto.CreateDropDownItemContent = function CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected) {
        var checkBoxId = this.options.containerClass + "-" + this.hiddenSelect.name.toLowerCase() + "-generated-id-" + optionId.toLowerCase();
        var checked = isSelected ? "checked" : "";
        var $dropDownItemContent = this.jQuery("<div class=\"custom-control custom-checkbox\">\n                <input type=\"checkbox\" class=\"custom-control-input\" id=\"" + checkBoxId + "\" " + checked + ">\n                <label class=\"custom-control-label\" for=\"" + checkBoxId + "\">" + itemText + "</label>\n        </div>");
        $dropDownItemContent.appendTo($dropDownItem);
        $dropDownItem.addClass(this.options.dropDownItemClass);
        var $checkBox = $dropDownItem.find("INPUT[type=\"checkbox\"]");

        var adoptDropDownItem = function adoptDropDownItem(isSelected) {
          $checkBox.prop('checked', isSelected);
        };

        return adoptDropDownItem;
      };

      _proto.Init = function Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu) {
        var defSelectedPanelClass = 'form-control';
        var defSelectedPanelStyle = {
          'margin-bottom': '0'
        }; // 16 is for bootstrap reboot for UL

        $container.addClass(this.options.containerClass);

        if (!this.options.selectedPanelClass) {
          $selectedPanel.addClass(defSelectedPanelClass);
          $selectedPanel.css(defSelectedPanelStyle);
          $selectedPanel.css({
            "min-height": this.options.selectedPanelMinHeight
          });
        } else {
          $selectedPanel.addClass(this.options.selectedPanelClass);
        }

        var $hiddenSelect = this.jQuery(this.hiddenSelect);

        if ($hiddenSelect.hasClass("is-valid")) {
          $selectedPanel.addClass("is-valid");
        }

        if ($hiddenSelect.hasClass("is-invalid")) {
          $selectedPanel.addClass("is-invalid");
        }

        $dropDownMenu.addClass(this.options.dropDownMenuClass);
        if (!this.options.filterInputItemClass) $filterInputItem.addClass(this.options.filterInputItemClass);

        if (!this.options.filterInputClass) {
          $filterInput.css("color", this.options.filterInputColor);
        } else {
          $filterInput.addClass(this.options.filterInputClass);
        }
      };

      _proto.Enable = function Enable($selectedPanel, isEnabled) {
        if (isEnabled) {
          var inputId = this.hiddenSelect.id;
          var $formGroup = this.jQuery(this.hiddenSelect).closest('.form-group');

          if ($formGroup.length == 1) {
            var $label = $formGroup.find("label[for=\"" + inputId + "\"]");
            var f = $label.attr('for');
            var $filterInput = $selectedPanel.find('input');

            if (f == this.hiddenSelect.id) {
              var id = this.options.containerClass + "-generated-filter-id-" + this.hiddenSelect.id;
              $filterInput.attr('id', id);
              $label.attr('for', id);
            }
          }
        } else {
          if (!this.options.selectedPanelReadonlyClass) {
            $selectedPanel.css({
              "background-color": this.options.selectedPanelReadonlyBackgroundColor
            });
          } else {
            $selectedPanel.addClass(this.options.selectedPanelReadonlyClass);
          }

          $selectedPanel.find('BUTTON').prop("disabled", true).off();
        }
      };

      _proto.Hover = function Hover($dropDownItem, isHover) {
        if (isHover) $dropDownItem.addClass('text-primary').addClass('bg-light');else $dropDownItem.removeClass('text-primary').removeClass('bg-light');
      };

      _proto.FilterClick = function FilterClick(event) {
        return !(event.target.nodeName == "BUTTON" || event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON");
      };

      _proto.Focus = function Focus($selectedPanel, isFocused) {
        if (isFocused) {
          if (this.options.selectedPanelFocusClass) {
            $selectedPanel.addClass("this.options.selectedPanelFocusClass");
          } else {
            if ($selectedPanel.hasClass("is-valid") && this.options.selectedPanelValidBoxShadow) {
              $selectedPanel.css("box-shadow", this.options.selectedPanelValidBoxShadow);
            } else if ($selectedPanel.hasClass("is-invalid") && this.options.selectedPanelInvalidBoxShadow) {
              $selectedPanel.css("box-shadow", this.options.selectedPanelInvalidBoxShadow);
            } else {
              $selectedPanel.css("box-shadow", this.options.selectedPanelBoxShadow).css("border-color", this.options.selectedPanelBorderColor);
            }
          }
        } else {
          if (this.options.selectedPanelFocusClass) {
            $selectedPanel.removeClass(this.options.selectedPanelFocusClass);
          } else {
            $selectedPanel.css("box-shadow", "").css("border-color", "");
          }
        }
      };

      return Bootstrap4Adapter;
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
        doManageFocus: true
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
          this.adapter = adapter ? adapter : new Bootstrap4Adapter($$$1, this.selectElement);
          this.container = null;
          this.selectedPanel = null;
          this.filterInputItem = null;
          this.filterInput = null;
          this.dropDownMenu = null;
          this.popper = null; // state

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

          var appendItem = function appendItem() {
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
            };

            var removeItemAndCloseDropDown = function removeItemAndCloseDropDown() {
              removeItem();

              _this.closeDropDown();
            };

            _this.adapter.CreateSelectedItemContent($selectedItem, itemText, removeItemAndCloseDropDown);

            $selectedItem.insertBefore(_this.filterInputItem);
            $dropDownItem.data("option-toggle", removeItem);
            $selectedItem.data("option-remove", removeItemAndCloseDropDown);
            return $selectedItem;
          };

          $dropDownItem.data("option-toggle", function () {
            return appendItem();
          });

          if (isSelected) {
            appendItem();
          }
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

        _proto.init = function init() {
          var _this2 = this;

          var $hiddenSelect = $$$1(this.selectElement);
          $hiddenSelect.hide();
          var disabled = this.selectElement.disabled;
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

          $dropDownMenu.css(defDropDownMenuStyleSys);
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
          }); // some browsers (IE11) can change select value ("autocomplete") after page is loaded but before "ready" event

          $$$1(document).ready(function () {
            var selectOptions = $hiddenSelect.find('OPTION');
            selectOptions.each(function (index, optionElement) {
              _this2.appendDropDownItem(optionElement);
            });
            _this2.hasDropDownVisible = selectOptions.length > 0;

            _this2.updateDropDownPosition(false);

            $dropDownMenu.find('LI').click(function (event) {
              event.preventDefault();
              event.stopPropagation();
              var toggleItem = $$$1(event.currentTarget).closest("LI").data("option-toggle");
              toggleItem();

              _this2.filterInput.focus();
            });
            $dropDownMenu.find("LI").on("mouseover", function (event) {
              _this2.adapter.Hover($$$1(event.target).closest("LI"), true);
            });
            $dropDownMenu.find("LI").on("mouseout", function (event) {
              _this2.adapter.Hover($$$1(event.target).closest("LI"), false);
            });

            if (disabled) {
              _this2.filterInput.style.display = "none";

              _this2.adapter.Enable($selectedPanel, false);
            } else {
              _this2.filterInput.style.display = "inline-block";

              _this2.adapter.Enable($selectedPanel, true);

              $selectedPanel.click(function (event) {
                if (event.target.nodeName != "INPUT") $filterInput.val('').focus();
                if (_this2.hasDropDownVisible) if (_this2.adapter.FilterClick(event)) {
                  _this2.updateDropDownPosition(true);

                  _this2.showDropDown();
                }
              });
              $dropDownMenu.click(function (event) {
                event.stopPropagation();
              });
              $dropDownMenu.on("mouseover", function () {
                return _this2.resetDropDownMenuHover();
              });

              if (_this2.options.doManageFocus) {
                $filterInput.focusin(function () {
                  _this2.adapter.Focus($selectedPanel, true);
                });
                $filterInput.focusout(function () {
                  if (!_this2.skipFocusout) {
                    _this2.adapter.Focus($selectedPanel, false);
                  }
                });
                $container.mousedown(function () {
                  _this2.skipFocusout = true;
                });
                $$$1(window.document).mouseup(function () {
                  _this2.skipFocusout = false;
                });
              }

              $$$1(window.document).mouseup(function (event) {
                if (!(_this2.container === event.target || $$$1.contains(_this2.container, event.target))) {
                  _this2.closeDropDown();
                }
              });
            }
          });
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
