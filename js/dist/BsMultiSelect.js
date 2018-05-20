function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import $ from 'jquery';
import Popper from 'popper.js'; // TODO: 
// 2) require polyfill Element.closest polyfill IE 11
// 3) require multiple classList.add polyfill IE 11
// IIFE to declare private members

var BsMultiSelect = function (window, $, Popper) {
  var JQUERY_NO_CONFLICT = $.fn[pluginName];
  var pluginName = "dashboardCodeBsMultiSelect";
  var dataKey = "plugin_" + pluginName;
  var defFilterInputItemStyleSys = {
    "display": "block"
  };
  var defSelectedPanelClass = "form-control btn border";
  var defFilterInputStyle = {
    "width": "2ch",
    "border": "0",
    "padding": "0",
    "outline": "none"
  };
  var defSelectedPanelStyle = {
    "cursor": "text",
    "display": "flex",
    "flex-wrap": "wrap",
    "align-items": "center",
    "margin-bottom": "0px"
  };
  var defSelectedItemClass = "badge";
  var defSelectedItemStyle = {
    "padding-left": "0px",
    "display": "flex",
    "align-items": "center"
  };
  var defRemoveSelectedItemButtonClass = "close";
  var defRemoveSelectedItemButtonStyle = {
    "font-size": "100%"
  };
  var defaults = {
    items: [],
    defaults: [],
    //usePopper: true,
    selectedPanelMinHeight: "calc(2.25rem + 2px)",
    selectedPanelReadonlyBackgroundColor: "#e9ecef",
    selectedPanelValidBoxShadow: " 0 0 0 0.2rem rgba(40, 167, 69, 0.25)",
    selectedPanelInvalidBoxShadow: "0 0 0 0.2rem rgba(220, 53, 69, 0.25)",
    filterInputColor: "#495057",
    containerClass: "dashboardcode-bsmultiselect",
    dropDownMenuClass: "dropdown-menu",
    dropDownItemClass: "px-2",
    selectedPanelClass: "",
    selectedPanelReadonlyClass: "",
    selectedItemClass: "",
    removeSelectedItemButtonClass: "",
    filterInputItemClass: "",
    filterInputClass: ""
  };

  var Plugin =
  /*#__PURE__*/
  function () {
    function Plugin(element, options) {
      _classCallCheck(this, Plugin);

      if (typeof Popper === 'undefined') {
        throw new TypeError('DashboardCode bsMultiSelect require Popper.js (https://popper.js.org)');
      } // readonly


      this.element = element;
      this.options = $.extend({}, defaults, options);
      this.input = element;
      this.container = null;
      this.dropDownMenu = null;
      this.selectedPanel = null;
      this.filterInput = null;
      this.filterInputItem = null;
      this.popper = null; // state

      this.skipFocusout = false;
      this.backspaceAtStartPoint = null;
      this.selectedDropDownItem = null;
      this.selectedDropDownIndex = null;
      this.hasItems = false;
      this.init();
    }

    _createClass(Plugin, [{
      key: "updateDropDownPosition",
      value: function updateDropDownPosition() {
        //console.log("updateDropDownPosition");
        //if (this.options.usePopper) {
        this.popper.update(); // } else {
        //     $(this.dropDownMenu).dropdown('update');
        // }
      }
    }, {
      key: "hideDropDown",
      value: function hideDropDown() {
        //if (this.options.usePopper) {
        //console.log("popper remove show");
        $(this.dropDownMenu).removeClass('show'); // } else {
        //     if ($(this.dropDownMenu).hasClass('show'))
        //         $(this.dropDownMenu).dropdown('toggle');
        // }
      }
    }, {
      key: "showDropDown",
      value: function showDropDown() {
        if (this.hasItems) {
          //if (this.options.usePopper) {
          //console.log("popper add show");
          $(this.dropDownMenu).addClass('show'); // } else {
          //     if (!$(this.dropDownMenu).hasClass('show'))
          //         $(this.dropDownMenu).dropdown('toggle');
          // }
        }
      }
    }, {
      key: "setCheck",
      value: function setCheck(optionId, isChecked) {
        for (var i = 0; i < this.input.options.length; i += 1) {
          var option = this.input.options[i];

          if (option.value == optionId) {
            this.input.options[i].selected = isChecked;
            break;
          }
        }
      } // Public methods

    }, {
      key: "getInputValue",
      value: function getInputValue() {
        return $(this.input).val();
      }
    }, {
      key: "closeDropDown",
      value: function closeDropDown() {
        this.clearFilterInput();
        this.hideDropDown();
        this.updateDropDownPosition();
      }
    }, {
      key: "clearFilterInput",
      value: function clearFilterInput() {
        if (this.filterInput.value != '') {
          this.filterInput.value = '';
          this.filterDropDownMenu();

          if (this.hasItems) {
            this.updateDropDownPosition();
          }
        }
      }
    }, {
      key: "filterDropDownMenu",
      value: function filterDropDownMenu() {
        var text = this.filterInput.value.trim();
        var visible = 0;
        $(this.dropDownMenu).find('li').each(function () {
          var $item = $(this);

          if (text == "") {
            $item.show();
            visible++;
          } else {
            var itemText = $item.text();
            var $checkbox = $item.find('input[type="checkbox"]');

            if (!$checkbox.prop('checked') && itemText.toLowerCase().includes(text.toLowerCase())) {
              $item.show();
              visible++;
            } else {
              $item.hide();
            }
          }
        });
        this.hasItems = visible > 0;
        this.resetSelectDropDownMenu();
      }
    }, {
      key: "clickDropDownItem",
      value: function clickDropDownItem(event) {
        //console.log("filter & stopPropagation");
        event.preventDefault();
        event.stopPropagation();
        var menuItem = event.currentTarget.closest("LI");
        var $menuItem = $(menuItem);
        var optionId = $menuItem.data("option-id");
        var $checkBox = $menuItem.find('input[type="checkbox"]');

        if ($checkBox.prop('checked')) {
          var $selectedItem = $(this.selectedPanel).find("li[data-option-id=\"".concat(optionId, "\"]"));
          this.removeSelectedItem($selectedItem, optionId, $checkBox);
        } else {
          var itemText = $menuItem.find('label').text();
          this.createAndAppendSelectedItem($checkBox, optionId, itemText);
          $checkBox.prop('checked', true);
        }

        this.clearFilterInput();
        $(this.filterInput).focus();
      }
    }, {
      key: "appendDropDownItem",
      value: function appendDropDownItem(itemValue, itemText, isChecked) {
        var optionId = itemValue;
        var checkBoxId = "dashboardcode-bsmultiselect-".concat(this.input.name.toLowerCase(), "-generated-id-").concat(optionId.toLowerCase());
        var checked = isChecked ? "checked" : "";
        var $dropDownItem = $("<li data-option-id=\"".concat(optionId, "\">\n                    <div class=\"custom-control custom-checkbox\">\n                        <input type=\"checkbox\" class=\"custom-control-input\" id=\"").concat(checkBoxId, "\" ").concat(checked, ">\n                        <label class=\"custom-control-label\" for=\"").concat(checkBoxId, "\">").concat(itemText, "</label>\n                    </div>\n                 </li>")).addClass(this.options.dropDownItemClass).appendTo($(this.dropDownMenu));
        var $checkBox = $dropDownItem.find("input[type=\"checkbox\"]");

        if (isChecked) {
          this.createAndAppendSelectedItem($checkBox, optionId, itemText);
        }
      }
    }, {
      key: "createAndAppendSelectedItem",
      value: function createAndAppendSelectedItem($checkBox, optionId, itemText) {
        var _this = this;

        var $selectedItem = $("<li data-option-id=\"".concat(optionId, "\"><span>").concat(itemText, "</span></li>"));

        if (!this.options.selectedItemClass) {
          $selectedItem.addClass(defSelectedItemClass);
          $selectedItem.css(defSelectedItemStyle);
        } else {
          $selectedItem.addClass(this.options.selectedItemClass);
        }

        $selectedItem.insertBefore($(this.filterInputItem));
        var $buttom = $("<button aria-label='Close' tabIndex='-1' type='button'><span aria-hidden='true'>&times;</span></button>");

        if (!this.options.removeSelectedItemButtonClass) {
          $buttom.addClass(defRemoveSelectedItemButtonClass);
          $buttom.css(defRemoveSelectedItemButtonStyle);
        } else {
          $buttom.addClass(this.options.removeSelectedItemButtonClass);
        }

        $buttom.appendTo($selectedItem);
        this.setCheck(optionId, true);
        $buttom.click(function (event) {
          _this.removeSelectedItem($selectedItem, optionId, $checkBox);

          _this.updateDropDownPosition();

          $(_this.filterInput).focus();
        });
      }
    }, {
      key: "adoptFilterInputLength",
      value: function adoptFilterInputLength() {
        this.filterInput.style.width = this.filterInput.value.length * 1.3 + 2 + "ch";
      }
    }, {
      key: "analyzeInputText",
      value: function analyzeInputText() {
        var text = this.filterInput.value.trim().toLowerCase();

        var item = _toConsumableArray(this.dropDownMenu.querySelectorAll("LI")).find(function (i) {
          return i.textContent.trim().toLowerCase() == text;
        });

        if (item != undefined) {
          var $item = $(item);
          var $checkBox = $item.find('input[type="checkbox"]');

          if (!$checkBox.prop('checked')) {
            var optionId = $item.data('option-id');
            var itemText = $item.find('label').text();
            this.createAndAppendSelectedItem($checkBox, optionId, itemText);
            $checkBox.prop('checked', true);
          }

          this.clearFilterInput();
        }
      }
    }, {
      key: "resetSelectDropDownMenu",
      value: function resetSelectDropDownMenu() {
        if (this.selectedDropDownItem != null) {
          // IE11 doesn't support remove('text-primary', bg-light' )
          this.selectedDropDownItem.classList.remove('bg-light');
          this.selectedDropDownItem.classList.remove('text-primary');
          this.selectedDropDownItem = null;
        }

        this.selectedDropDownIndex = null;
      }
    }, {
      key: "keydownArrow",
      value: function keydownArrow(down) {
        var items = _toConsumableArray(this.dropDownMenu.querySelectorAll('LI:not([style*="display: none"]'));

        if (items.length > 0) {
          this.showDropDown();

          if (this.selectedDropDownItem == null) {
            this.selectedDropDownIndex = down ? 0 : items.length - 1;
          } else {
            // IE11 doesn't support remove('text-primary', bg-light' )
            this.selectedDropDownItem.classList.remove('bg-light');
            this.selectedDropDownItem.classList.remove('text-primary');

            if (down) {
              var newIndex = this.selectedDropDownIndex + 1;
              this.selectedDropDownIndex = newIndex < items.length ? newIndex : 0;
            } else {
              var newIndex = this.selectedDropDownIndex - 1;
              this.selectedDropDownIndex = newIndex >= 0 ? newIndex : items.length - 1;
            }
          }

          this.selectedDropDownItem = items[this.selectedDropDownIndex]; // IE11 doesn't support add('text-primary', bg-light' )

          this.selectedDropDownItem.classList.add('text-primary');
          this.selectedDropDownItem.classList.add('bg-light');
        }
      }
    }, {
      key: "removeSelectedItem",
      value: function removeSelectedItem($selectedItem, optionId, $checkBox) {
        $selectedItem.remove();
        this.setCheck(optionId, false);
        $checkBox.prop('checked', false);
      }
    }, {
      key: "init",
      value: function init() {
        var _this2 = this;

        var $input = $(this.input);
        $input.hide();
        var disabled = this.input.disabled;
        var $container = $("<div/>");
        if (!this.options.containerClass) $container.addClass(this.options.containerClass);
        $container.insertAfter($input);
        this.container = $container.get(0);
        var $selectedPanel = $("<ul/>");

        if (!this.options.selectedPanelClass) {
          $selectedPanel.addClass(defSelectedPanelClass);
          $selectedPanel.css(defSelectedPanelStyle);
          $selectedPanel.css("min-height", this.options.selectedPanelMinHeight);
        } else $selectedPanel.addClass(this.options.selectedPanelClass);

        $selectedPanel.appendTo($container);
        this.selectedPanel = $selectedPanel.get(0);

        if ($input.hasClass("is-valid")) {
          $selectedPanel.removeClass("border");
          $selectedPanel.addClass("is-valid"); //$selectedPanel.removeClass("btn-outline-danger");
          //$selectedPanel.addClass("btn-outline-success");
        }

        if ($input.hasClass("is-invalid")) {
          $selectedPanel.removeClass("border");
          $selectedPanel.addClass("is-invalid"); //$selectedPanel.removeClass("btn-outline-success");
          //$selectedPanel.addClass("btn-outline-danger");
        }

        var $filterInputItem = $('<li/>');
        this.filterInputItem = $filterInputItem.get(0);
        if (!this.options.filterInputItemClass) $filterInputItem.css(defFilterInputItemStyleSys);else $filterInputItem.addClass(this.options.filterInputItemClass);
        $filterInputItem.appendTo($selectedPanel);
        var $filterInput = $('<input type="search" autocomplete="off">');

        if (!this.options.filterInputClass) {
          $filterInput.css(defFilterInputStyle);
          $filterInput.css("color", this.options.filterInputColor);
        } else {
          $filterInput.addClass(this.options.filterInputClass);
        }

        $filterInput.appendTo($filterInputItem);
        this.filterInput = $filterInput.get(0);
        var $dropDownMenu = $("<ul/>").appendTo($container);
        this.dropDownMenu = $dropDownMenu.get(0);
        $dropDownMenu.addClass(this.options.dropDownMenuClass); //if (this.options.usePopper) {

        this.popper = new Popper(this.filterInput, this.dropDownMenu, {
          placement: 'bottom-start',
          modifiers: {
            flip: {
              behavior: ['left', 'right']
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

        if (this.options.items == null) {
          this.options.items.forEach(function (item) {
            var itemValue = item['value'];
            var itemText = item['text'];
            var isChecked = item['isChecked'];

            _this2.appendDropDownItem(itemValue, itemText, isChecked);
          });
          this.hasItems = options.items.length > 0;
        } else {
          var selectOptions = $input.find('option');
          selectOptions.each(function (index, option) {
            var itemValue = option.value;
            var itemText = option.text;
            var isChecked = option.selected;

            _this2.appendDropDownItem(itemValue, itemText, isChecked);
          });
          this.hasItems = selectOptions.length > 0;
        }

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
          var inputId = this.input.id;
          var formGroup = this.input.closest(".form-group");

          if (formGroup != null) {
            var label = formGroup.querySelector("label[for=\"".concat(inputId, "\"]"));
            var f = $(label).attr("for");

            if (f == this.input.id) {
              this.filterInput.id = "dashboardcode-bsmultiselect-generated-filter-id-" + this.input.id;
              label.setAttribute("for", this.filterInput.id);
            }
          }

          this.updateDropDownPosition();
          $dropDownMenu.click(function (event) {
            //console.log('dropDownMenu click - stopPropagation')
            event.stopPropagation();
          });
          $dropDownMenu.find('li').click(function (event) {
            _this2.clickDropDownItem(event);
          });
          $dropDownMenu.on("mouseover", function (event) {
            _this2.resetSelectDropDownMenu();
          });
          $dropDownMenu.find("li").on("mouseover", function (event) {
            event.target.closest("li").classList.add('text-primary');
            event.target.closest("li").classList.add('bg-light');
          });
          $dropDownMenu.find("li").on("mouseout", function (event) {
            event.target.closest("li").classList.remove('text-primary');
            event.target.closest("li").classList.remove('bg-light');
          });
          $selectedPanel.click(function (event) {
            //console.log('selectedPanel click ' + event.target.nodeName);
            if (event.target.nodeName != "INPUT") $(_this2.filterInput).val('').focus();
            if (!(event.target.nodeName == "BUTTON" || event.target.nodeName == "SPAN" && event.target.parentElement.nodeName == "BUTTON")) _this2.showDropDown();
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
              if (_this2.selectedDropDownItem != null) {
                var $item = $(_this2.selectedDropDownItem);
                var $checkBox = $item.find('input[type="checkbox"]');
                var optionId = $item.data('option-id');

                if (!$checkBox.prop('checked')) {
                  var itemText = $item.find('label').text();

                  _this2.createAndAppendSelectedItem($checkBox, optionId, itemText);

                  $checkBox.prop('checked', true);
                  _this2.filterInput.value = "";
                } else {
                  var $selectedItem = $(_this2.selectedPanel).find("li[data-option-id=\"".concat(optionId, "\"]"));

                  _this2.removeSelectedItem($selectedItem, optionId, $checkBox);
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
                var array = _toConsumableArray(_this2.selectedPanel.querySelectorAll("LI"));

                if (array.length >= 2) {
                  var itemToDelete = array[array.length - 2];
                  var $itemToDelete = $(itemToDelete);
                  var optionId = $itemToDelete.data("option-id");

                  var item = _toConsumableArray(_this2.dropDownMenu.querySelectorAll("LI")).find(function (i) {
                    return i.dataset.optionId == optionId;
                  });

                  var $item = $(item);
                  var $checkBox = $item.find('input[type="checkbox"]');
                  var $selectedItem = $(_this2.selectedPanel).find("li[data-option-id=\"".concat(optionId, "\"]"));

                  _this2.removeSelectedItem($selectedItem, optionId, $checkBox);
                }
              }

              _this2.backspaceAtStartPoint = null;
            } else if (event.which == 27 || event.keyCode == 27) {
              // escape
              _this2.closeDropDown();
            }
          }); // Set on change for filter input

          $filterInput.on('input', function (event) {
            // keyup focus
            //console.log('filterInput input');
            _this2.adoptFilterInputLength();

            _this2.filterDropDownMenu();

            if (_this2.hasItems) {
              _this2.updateDropDownPosition(); // support case when textbox can change its place because of line break (texbox grow with each key press)


              _this2.showDropDown();
            } else {
              _this2.hideDropDown();
            }
          });
          $filterInput.focusin(function (event) {
            if ($selectedPanel.hasClass("is-valid") && _this2.options.selectedPanelValidBoxShadow) {
              $selectedPanel.css("box-shadow", _this2.options.selectedPanelValidBoxShadow);
            } else if ($selectedPanel.hasClass("is-invalid") && _this2.options.selectedPanelInvalidBoxShadow) {
              $selectedPanel.css("box-shadow", _this2.options.selectedPanelInvalidBoxShadow);
            }

            $(_this2.selectedPanel).addClass("focus");
          });
          $filterInput.focusout(function (event) {
            if (!_this2.skipFocusout) {
              $selectedPanel.css("box-shadow", "");
              $(_this2.selectedPanel).removeClass("focus");
            }
          });
          $container.mousedown(function (event) {
            _this2.skipFocusout = true;
          });
          $(window.document).mouseup(function (event) {
            _this2.skipFocusout = false;

            if (!(_this2.container === event.target || _this2.container.contains(event.target))) {
              //console.log("document mouseup outside container");
              _this2.closeDropDown();
            }
          });
        }
      }
    }]);

    return Plugin;
  }();

  var jQueryInterface = function jQueryInterface(options) {
    return this.each(function () {
      var data = $(this).data(dataKey);

      if (!data) {
        if (/dispose|hide/.test(options)) {
          return;
        } else {
          var optionsObject = _typeof(options) === 'object' ? options : null;
          data = new Plugin(this, optionsObject);
          $(this).data(dataKey, data);
        }
      }

      if (typeof options === 'string') {
        var methodName = options;

        if (typeof data[methodName] === 'undefined') {
          throw new TypeError("No method named \"".concat(methodName, "\""));
        }

        data[methodName]();
      }
    });
  };

  $.fn[pluginName] = jQueryInterface; // in case of mulitple $(this) it will return 1st element plugin instance

  $.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function (options) {
    return $(this).data("plugin_" + pluginName);
  };

  $.fn[pluginName].Constructor = Plugin;

  $.fn[pluginName].noConflict = function () {
    $.fn[pluginName] = JQUERY_NO_CONFLICT;
    return jQueryInterface;
  };

  return Plugin;
}(window, $, Popper);

export default BsMultiSelect;

//# sourceMappingURL=BsMultiSelect.js.map