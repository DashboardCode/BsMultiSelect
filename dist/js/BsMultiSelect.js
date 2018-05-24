/*!
  * DashboardCode BsMultiSelect v0.1.4 (https://dashboardcode.github.io/BsMultiSelect/)
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

    var BsMultiSelect = function (window, $$$1, Popper$$1) {
      var JQUERY_NO_CONFLICT = $$$1.fn[pluginName];
      var pluginName = 'dashboardCodeBsMultiSelect';
      var dataKey = "plugin_" + pluginName;
      var defFilterInputItemStyleSys = {
        'display': 'block'
      };
      var defSelectedPanelClass = 'form-control btn border';
      var defFilterInputStyle = {
        'width': '2ch',
        'border': '0',
        'padding': '0',
        'outline': 'none'
      };
      var defSelectedPanelStyle = {
        'cursor': 'text',
        'display': 'flex',
        "flex-wrap": "wrap",
        "align-items": "center",
        "margin-bottom": "0px"
      };
      var defSelectedItemClass = 'badge';
      var defSelectedItemStyle = {
        'padding-left': '0px',
        'padding-bottom': '0px',
        'display': 'flex',
        'align-items': 'center'
      };
      var defRemoveSelectedItemButtonClass = 'close';
      var defRemoveSelectedItemButtonStyle = {
        'line-height': '1rem',
        'font-size': '1.2rem'
      };
      var defaults = {
        items: [],
        defaults: [],
        //usePopper: true,
        selectedPanelMinHeight: 'calc(2.25rem + 2px)',
        selectedPanelReadonlyBackgroundColor: '#e9ecef',
        selectedPanelValidBoxShadow: ' 0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
        selectedPanelInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
        filterInputColor: '#495057',
        containerClass: 'dashboardcode-bsmultiselect',
        dropDownMenuClass: 'dropdown-menu',
        dropDownItemClass: 'px-2',
        selectedPanelClass: '',
        selectedPanelReadonlyClass: '',
        selectedItemClass: '',
        removeSelectedItemButtonClass: '',
        filterInputItemClass: '',
        filterInputClass: ''
      };

      var Plugin =
      /*#__PURE__*/
      function () {
        function Plugin(element, options) {
          if (typeof Popper$$1 === 'undefined') {
            throw new TypeError('DashboardCode bsMultiSelect require Popper.js (https://popper.js.org)');
          } // readonly


          this.element = element;
          this.options = $$$1.extend({}, defaults, options);
          this.hiddenSelect = element;
          this.container = null;
          this.dropDownMenu = null;
          this.selectedPanel = null;
          this.filterInput = null;
          this.filterInputItem = null;
          this.popper = null; // state

          this.filterInputItemOffsetLeft = null;
          this.skipFocusout = false;
          this.backspaceAtStartPoint = null;
          this.selectedDropDownItem = null;
          this.selectedDropDownIndex = null;
          this.hasItems = false;
          this.init();
        }

        var _proto = Plugin.prototype;

        _proto.updateDropDownPosition = function updateDropDownPosition(force) {
          //if (this.options.usePopper) {
          var offsetLeft = this.filterInputItem.offsetLeft;

          if (force || this.filterInputItemOffsetLeft != offsetLeft) {
            this.popper.update();
            this.filterInputItemOffsetLeft = offsetLeft;
          } // } else {
          //     $(this.dropDownMenu).dropdown('update');
          // }

        };

        _proto.hideDropDown = function hideDropDown() {
          //if (this.options.usePopper) {
          $$$1(this.dropDownMenu).hide(); // } else {
          //     if ($(this.dropDownMenu).hasClass('show'))
          //         $(this.dropDownMenu).dropdown('toggle');
          // }
        };

        _proto.showDropDown = function showDropDown() {
          //if (this.options.usePopper) {
          this.updateDropDownPosition(true);
          $$$1(this.dropDownMenu).show(); // } else {
          //     if (!$(this.dropDownMenu).hasClass('show'))
          //         $(this.dropDownMenu).dropdown('toggle');
          // }
        };

        _proto.setCheck = function setCheck(optionId, isChecked) {
          for (var i = 0; i < this.hiddenSelect.options.length; i += 1) {
            var option = this.hiddenSelect.options[i];

            if (option.value == optionId) {
              this.hiddenSelect.options[i].selected = isChecked;
              break;
            }
          }
        }; // Public methods


        _proto.getInputValue = function getInputValue() {
          return $$$1(this.hiddenSelect).val();
        };

        _proto.closeDropDown = function closeDropDown() {
          this.resetSelectDropDownMenu();
          this.clearFilterInput();
          this.hideDropDown();
          this.updateDropDownPosition();
        };

        _proto.clearFilterInput = function clearFilterInput(updatePosition) {
          if (this.filterInput.value != '') {
            this.filterInput.value = '';
            this.adoptFilterInputLength();
            this.filterDropDownMenu();

            if (updatePosition && this.hasItems) {
              this.updateDropDownPosition(false);
            }
          }
        };

        _proto.filterDropDownMenu = function filterDropDownMenu() {
          var text = this.filterInput.value.trim();
          var visible = 0;
          $$$1(this.dropDownMenu).find('li').each(function (i, item) {
            var $item = $$$1(item);

            if (text == '') {
              $item.show();
              visible++;
            } else {
              var itemText = $item.text();
              var $checkbox = $item.find('input[type="checkbox"]');

              if (!$checkbox.prop('checked') && itemText.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
                $item.show();
                visible++;
              } else {
                $item.hide();
              }
            }
          });
          this.hasItems = visible > 0;
          this.resetSelectDropDownMenu();
        };

        _proto.clickDropDownItem = function clickDropDownItem(event) {
          event.preventDefault();
          event.stopPropagation();
          var $menuItem = $$$1(event.currentTarget).closest("LI");
          var optionId = $menuItem.data("option-id");
          var $checkBox = $menuItem.find('input[type="checkbox"]');

          if ($checkBox.prop('checked')) {
            var $selectedItem = $$$1(this.selectedPanel).find("li[data-option-id=\"" + optionId + "\"]");
            this.removeSelectedItem($selectedItem, optionId, $checkBox);
          } else {
            var itemText = $menuItem.find('label').text();
            this.createAndAppendSelectedItem($checkBox, optionId, itemText);
            $checkBox.prop('checked', true);
          }

          this.clearFilterInput(false);
          this.filterInput.focus();
        };

        _proto.appendDropDownItem = function appendDropDownItem(itemValue, itemText, isChecked) {
          var optionId = itemValue;
          var checkBoxId = "dashboardcode-bsmultiselect-" + this.hiddenSelect.name.toLowerCase() + "-generated-id-" + optionId.toLowerCase();
          var checked = isChecked ? "checked" : "";
          var $dropDownItem = $$$1("<li data-option-id=\"" + optionId + "\">\n                    <div class=\"custom-control custom-checkbox\">\n                        <input type=\"checkbox\" class=\"custom-control-input\" id=\"" + checkBoxId + "\" " + checked + ">\n                        <label class=\"custom-control-label\" for=\"" + checkBoxId + "\">" + itemText + "</label>\n                    </div>\n                 </li>").addClass(this.options.dropDownItemClass).appendTo($$$1(this.dropDownMenu));
          var $checkBox = $dropDownItem.find("input[type=\"checkbox\"]");

          if (isChecked) {
            this.createAndAppendSelectedItem($checkBox, optionId, itemText);
          }
        };

        _proto.createAndAppendSelectedItem = function createAndAppendSelectedItem($checkBox, optionId, itemText) {
          var _this = this;

          var $selectedItem = $$$1("<li data-option-id=\"" + optionId + "\"><span>" + itemText + "</span></li>");

          if (!this.options.selectedItemClass) {
            $selectedItem.addClass(defSelectedItemClass);
            $selectedItem.css(defSelectedItemStyle);
          } else {
            $selectedItem.addClass(this.options.selectedItemClass);
          }

          $selectedItem.insertBefore($$$1(this.filterInputItem));
          var $buttom = $$$1("<button aria-label='Close' tabIndex='-1' type='button'><span aria-hidden='true'>&times;</span></button>");

          if (!this.options.removeSelectedItemButtonClass) {
            $buttom.addClass(defRemoveSelectedItemButtonClass);
            $buttom.css(defRemoveSelectedItemButtonStyle);
          } else {
            $buttom.addClass(this.options.removeSelectedItemButtonClass);
          }

          $buttom.appendTo($selectedItem);
          this.setCheck(optionId, true);
          $buttom.click(function () {
            _this.removeSelectedItem($selectedItem, optionId, $checkBox);

            _this.clearFilterInput(true);

            _this.updateDropDownPosition(false);

            $$$1(_this.filterInput).focus();
          });
        };

        _proto.adoptFilterInputLength = function adoptFilterInputLength() {
          this.filterInput.style.width = this.filterInput.value.length * 1.3 + 2 + "ch";
        };

        _proto.analyzeInputText = function analyzeInputText() {
          var text = this.filterInput.value.trim().toLowerCase();
          var nodeList = this.dropDownMenu.querySelectorAll("LI");
          var item = null;

          for (var i = 0; i < nodeList.length; ++i) {
            var it = nodeList[i];

            if (it.textContent.trim().toLowerCase() == text) {
              item = it;
              break;
            }
          }

          if (item) {
            var $item = $$$1(item);
            var $checkBox = $item.find('input[type="checkbox"]');

            if (!$checkBox.prop('checked')) {
              var optionId = $item.data('option-id');
              var itemText = $item.find('label').text();
              this.createAndAppendSelectedItem($checkBox, optionId, itemText);
              $checkBox.prop('checked', true);
            }

            this.clearFilterInput(true);
          }
        };

        _proto.resetSelectDropDownMenu = function resetSelectDropDownMenu() {
          if (this.selectedDropDownItem !== null) {
            this.selectedDropDownItem.classList.remove('bg-light');
            this.selectedDropDownItem.classList.remove('text-primary');
            this.selectedDropDownItem = null;
          }

          this.selectedDropDownIndex = null;
        };

        _proto.keydownArrow = function keydownArrow(down) {
          var visibleNodeListArray = $$$1(this.dropDownMenu).find('LI:not([style*="display: none"])').toArray();

          if (visibleNodeListArray.length > 0) {
            if (this.hasItems) {
              this.showDropDown();
            }

            if (this.selectedDropDownItem === null) {
              this.selectedDropDownIndex = down ? 0 : visibleNodeListArray.length - 1;
            } else {
              // IE10-11 doesn't support multiple arguments in classList remove 
              this.selectedDropDownItem.classList.remove('bg-light');
              this.selectedDropDownItem.classList.remove('text-primary');

              if (down) {
                var newIndex = this.selectedDropDownIndex + 1;
                this.selectedDropDownIndex = newIndex < visibleNodeListArray.length ? newIndex : 0;
              } else {
                var _newIndex = this.selectedDropDownIndex - 1;

                this.selectedDropDownIndex = _newIndex >= 0 ? _newIndex : visibleNodeListArray.length - 1;
              }
            }

            this.selectedDropDownItem = visibleNodeListArray[this.selectedDropDownIndex]; // IE10-11 doesn't support multiple arguments in classList add 

            this.selectedDropDownItem.classList.add('text-primary');
            this.selectedDropDownItem.classList.add('bg-light');
          }
        };

        _proto.removeSelectedItem = function removeSelectedItem($selectedItem, optionId, $checkBox) {
          $selectedItem.remove();
          this.setCheck(optionId, false);
          $checkBox.prop('checked', false);
        };

        _proto.init = function init() {
          var _this2 = this;

          var $hiddenSelect = $$$1(this.hiddenSelect);
          $hiddenSelect.hide();
          var disabled = this.hiddenSelect.disabled;
          var $container = $$$1("<div/>");
          $container.addClass(this.options.containerClass);
          $container.insertAfter($hiddenSelect);
          this.container = $container.get(0);
          var $selectedPanel = $$$1("<ul/>");

          if (!this.options.selectedPanelClass) {
            $selectedPanel.addClass(defSelectedPanelClass);
            $selectedPanel.css(defSelectedPanelStyle);
            $selectedPanel.css("min-height", this.options.selectedPanelMinHeight);
          } else $selectedPanel.addClass(this.options.selectedPanelClass);

          $selectedPanel.appendTo(this.container);
          this.selectedPanel = $selectedPanel.get(0);

          if ($hiddenSelect.hasClass("is-valid")) {
            $selectedPanel.removeClass("border");
            $selectedPanel.addClass("is-valid"); //$selectedPanel.removeClass("btn-outline-danger");
            //$selectedPanel.addClass("btn-outline-success");
          }

          if ($hiddenSelect.hasClass("is-invalid")) {
            $selectedPanel.removeClass("border");
            $selectedPanel.addClass("is-invalid"); //$selectedPanel.removeClass("btn-outline-success");
            //$selectedPanel.addClass("btn-outline-danger");
          }

          var $filterInputItem = $$$1('<li/>');
          this.filterInputItem = $filterInputItem.get(0);
          if (!this.options.filterInputItemClass) $filterInputItem.css(defFilterInputItemStyleSys);else $filterInputItem.addClass(this.options.filterInputItemClass);
          $filterInputItem.appendTo(this.selectedPanel);
          var $filterInput = $$$1('<input type="search" autocomplete="off">');

          if (!this.options.filterInputClass) {
            $filterInput.css(defFilterInputStyle);
            $filterInput.css("color", this.options.filterInputColor);
          } else {
            $filterInput.addClass(this.options.filterInputClass);
          }

          $filterInput.appendTo(this.filterInputItem);
          this.filterInput = $filterInput.get(0);
          var $dropDownMenu = $$$1("<ul/>").css({
            "display": "none"
          }).appendTo($container);
          this.dropDownMenu = $dropDownMenu.get(0);
          $dropDownMenu.addClass(this.options.dropDownMenuClass); // prevent heavy understandable styling error

          $dropDownMenu.css({
            "list-style-type": "none"
          }); //if (this.options.usePopper) {

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
          }); // } else {
          //     $(this.dropDownMenu).addClass("dropdown dropdown-menu")
          //     $(this.dropDownMenu).data("", "");
          //     $(this.dropDownMenu).dropdown({
          //         placement: 'bottom-start',
          //         flip: false,
          //         reference: this.filterInput
          //     });
          // }
          // some browsers (IE11) can change select value ("autocomplet") after page is loaded but before "ready" event

          $$$1(document).ready(function () {
            if (!_this2.options.items) {
              _this2.options.items.forEach(function (item) {
                var itemValue = item.value;
                var itemText = item.text;
                var isChecked = item.isChecked;

                _this2.appendDropDownItem(itemValue, itemText, isChecked);
              });

              _this2.hasItems = _this2.options.items.length > 0;
            } else {
              var selectOptions = $hiddenSelect.find('option');
              selectOptions.each(function (index, option) {
                var itemValue = option.value;
                var itemText = option.text;
                var isChecked = option.selected;

                _this2.appendDropDownItem(itemValue, itemText, isChecked);
              });
              _this2.hasItems = selectOptions.length > 0;
            }

            _this2.updateDropDownPosition(false);

            $dropDownMenu.find('li').click(function (event) {
              _this2.clickDropDownItem(event);
            });
            $dropDownMenu.find("li").on("mouseover", function (event) {
              $$$1(event.target).closest("li").addClass('text-primary').addClass('bg-light');
            });
            $dropDownMenu.find("li").on("mouseout", function (event) {
              $$$1(event.target).closest("li").removeClass('text-primary').removeClass('bg-light');
            });
          });

          if (disabled) {
            this.filterInput.style.display = "none";

            if (!this.options.selectedPanelReadonlyClass) {
              $selectedPanel.css({
                "background-color": this.options.selectedPanelReadonlyBackgroundColor
              });
            } else {
              $selectedPanel.addClass(this.options.selectedPanelReadonlyClass);
            }

            $selectedPanel.find('button').prop("disabled", true);
            $selectedPanel.addClass();
          } else {
            var inputId = this.hiddenSelect.id;
            var $formGroup = $hiddenSelect.closest(".form-group");

            if ($formGroup.length == 1) {
              var $label = $formGroup.find("label[for=\"" + inputId + "\"]");
              var f = $label.attr("for");

              if (f == this.hiddenSelect.id) {
                this.filterInput.id = "dashboardcode-bsmultiselect-generated-filter-id-" + this.hiddenSelect.id;
                $label.attr("for", this.filterInput.id);
              }
            }

            $dropDownMenu.click(function (event) {
              event.stopPropagation();
            });
            $dropDownMenu.on("mouseover", function () {
              _this2.resetSelectDropDownMenu();
            });
            $selectedPanel.click(function (event) {
              if (event.target.nodeName != "INPUT") $$$1(_this2.filterInput).val('').focus();
              if (!(event.target.nodeName == "BUTTON" || event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON") && _this2.hasItems) _this2.showDropDown();
            });
            $filterInput.on("keydown", function (event) {
              if (event.which == 38 || event.keyCode == 38) {
                event.preventDefault();

                _this2.keydownArrow(false);
              } else if (event.which == 40 || event.keyCode == 40) {
                event.preventDefault();

                _this2.keydownArrow(true);
              } else if (event.which == 13 || event.keyCode == 13) {
                event.preventDefault();
              } else if (event.which == 9 || event.keyCode == 9) {
                if (_this2.filterInput.value) {
                  event.preventDefault();
                } else {
                  _this2.closeDropDown();
                }
              } else {
                if (event.which == 8 || event.keyCode == 8) {
                  // detect that backspace is at start of input field (this will be used at keydown)
                  _this2.backspaceAtStartPoint = _this2.filterInput.selectionStart == 0 && _this2.filterInput.selectionEnd == 0;
                }

                _this2.resetSelectDropDownMenu();
              }
            });
            $filterInput.on("keyup", function (event) {
              if (event.which == 13 || event.keyCode == 13 || event.which == 9 || event.keyCode == 9) {
                if (_this2.selectedDropDownItem) {
                  var $item = $$$1(_this2.selectedDropDownItem);
                  var $checkBox = $item.find('input[type="checkbox"]');
                  var optionId = $item.data('option-id');

                  if (!$checkBox.prop('checked')) {
                    var itemText = $item.find('label').text();

                    _this2.createAndAppendSelectedItem($checkBox, optionId, itemText);

                    $checkBox.prop('checked', true);

                    _this2.resetSelectDropDownMenu();
                  } else {
                    var $selectedItem = $$$1(_this2.selectedPanel).find("LI[data-option-id=\"" + optionId + "\"]:first");

                    _this2.removeSelectedItem($selectedItem, optionId, $checkBox);
                  }

                  if (event.which == 13 || event.keyCode == 13) {
                    _this2.closeDropDown();
                  } //this.resetSelectDropDownMenu();

                } else {
                  _this2.analyzeInputText();
                }

                if (event.which == 9 || event.keyCode == 9) {
                  _this2.closeDropDown();
                }
              } else if (event.which == 8 || event.keyCode == 8) {
                var startPosition = _this2.filterInput.selectionStart;
                var endPosition = _this2.filterInput.selectionEnd;

                if (endPosition == 0 && startPosition == 0 && _this2.backspaceAtStartPoint) {
                  var _$selectedPanel = $$$1(_this2.selectedPanel);

                  var array = _$selectedPanel.find("LI").toArray();

                  if (array.length >= 2) {
                    var itemToDelete = array[array.length - 2];
                    var $itemToDelete = $$$1(itemToDelete);

                    var _optionId = $itemToDelete.data("option-id");

                    var _$item = $dropDownMenu.find("LI[data-option-id=\"" + _optionId + "\"]:first");

                    var _$checkBox = _$item.find('input[type="checkbox"]:first');

                    var _$selectedItem = _$selectedPanel.find("LI[data-option-id=\"" + _optionId + "\"]:first");

                    _this2.removeSelectedItem(_$selectedItem, _optionId, _$checkBox);
                  }
                }

                _this2.backspaceAtStartPoint = null; //if ($dropDownMenu.is(':hidden'))

                _this2.updateDropDownPosition(false);
              } else if (event.which == 27 || event.keyCode == 27) {
                // escape
                _this2.closeDropDown();
              }
            }); // Set on change for filter input

            $filterInput.on('input', function () {
              _this2.adoptFilterInputLength();

              _this2.filterDropDownMenu();

              if (_this2.hasItems) {
                _this2.updateDropDownPosition(false); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)


                _this2.showDropDown();
              } else {
                _this2.hideDropDown();
              }
            });
            $filterInput.focusin(function () {
              if ($selectedPanel.hasClass("is-valid") && _this2.options.selectedPanelValidBoxShadow) {
                $selectedPanel.css("box-shadow", _this2.options.selectedPanelValidBoxShadow);
              } else if ($selectedPanel.hasClass("is-invalid") && _this2.options.selectedPanelInvalidBoxShadow) {
                $selectedPanel.css("box-shadow", _this2.options.selectedPanelInvalidBoxShadow);
              }

              $$$1(_this2.selectedPanel).addClass("focus");
            });
            $filterInput.focusout(function () {
              if (!_this2.skipFocusout) {
                $selectedPanel.css("box-shadow", "");
                $$$1(_this2.selectedPanel).removeClass("focus");
              }
            });
            $container.mousedown(function () {
              _this2.skipFocusout = true;
            });
            $$$1(window.document).mouseup(function (event) {
              _this2.skipFocusout = false;

              if (!(_this2.container === event.target || $$$1.contains(_this2.container, event.target))) {
                _this2.closeDropDown();
              }
            });
          }
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
