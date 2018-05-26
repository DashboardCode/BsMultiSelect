function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import $ from 'jquery';
import Popper from 'popper.js';
import Bootstrap4Adapter from './Bootstrap4Adapter.es8'; // TODO: try to find convinient way to declare private members. Is it convinient enough to move them into IIFE?

var BsMultiSelect = function (window, $, Popper) {
  var JQUERY_NO_CONFLICT = $.fn[pluginName];
  var pluginName = 'dashboardCodeBsMultiSelect';
  var dataKey = "plugin_".concat(pluginName);
  var defSelectedPanelClass = 'form-control';
  var defSelectedPanelStyle = {
    'margin-bottom': '0'
  }; // 16 is for bootstrap reboot for UL

  var defSelectedPanelStyleSys = {
    'display': 'flex',
    "flex-wrap": "wrap"
  };
  var defFilterInputItemStyleSys = {
    'list-style-type': 'none'
  };
  var defFilterInputStyleSys = {
    'width': '2ch',
    'border': '0',
    'padding': '0',
    'outline': 'none'
  };
  var defDropDownMenuStyleSys = {
    'list-style-type': 'none'
  }; // ul usualy has bullets

  var defaults = {
    doManageFocus: true,
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

  var Plugin =
  /*#__PURE__*/
  function () {
    function Plugin(element, options) {
      _classCallCheck(this, Plugin);

      if (typeof Popper === 'undefined') {
        throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
      } // readonly


      this.hiddenSelect = element;
      this.options = $.extend({}, defaults, options);
      this.jQuery = $;
      this.adapter = new Bootstrap4Adapter($, this.options, this.hiddenSelect);
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

    _createClass(Plugin, [{
      key: "updateDropDownPosition",
      value: function updateDropDownPosition(force) {
        var offsetLeft = this.filterInputItem.offsetLeft;

        if (force || this.filterInputItemOffsetLeft != offsetLeft) {
          this.popper.update();
          this.filterInputItemOffsetLeft = offsetLeft;
        }
      }
    }, {
      key: "hideDropDown",
      value: function hideDropDown() {
        $(this.dropDownMenu).hide();
      }
    }, {
      key: "showDropDown",
      value: function showDropDown() {
        this.updateDropDownPosition(true);
        $(this.dropDownMenu).show();
      }
    }, {
      key: "setHiddenSelectOptionSelected",
      value: function setHiddenSelectOptionSelected(optionId, isChecked) {
        for (var i = 0; i < this.hiddenSelect.options.length; i += 1) {
          var option = this.hiddenSelect.options[i];

          if (option.value == optionId) {
            this.hiddenSelect.options[i].selected = isChecked;
            break;
          }
        }
      } // Public methods

    }, {
      key: "getInputValue",
      value: function getInputValue() {
        return $(this.hiddenSelect).val();
      }
    }, {
      key: "closeDropDown",
      value: function closeDropDown() {
        this.resetSelectDropDownMenu();
        this.clearFilterInput();
        this.hideDropDown();
        this.updateDropDownPosition();
      }
    }, {
      key: "clearFilterInput",
      value: function clearFilterInput(updatePosition) {
        if (this.filterInput.value != '') {
          this.filterInput.value = '';
          this.adoptFilterInputLength();
          this.filterDropDownMenu();

          if (updatePosition && this.hasItems) {
            this.updateDropDownPosition(false);
          }
        }
      }
    }, {
      key: "filterDropDownMenu",
      value: function filterDropDownMenu() {
        var text = this.filterInput.value.trim().toLowerCase();
        var visible = 0;
        $(this.dropDownMenu).find('LI').each(function (i, dropDownMenuItem) {
          var $dropDownMenuItem = $(dropDownMenuItem);

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
        this.hasItems = visible > 0;
        this.resetSelectDropDownMenu();
      }
    }, {
      key: "clickDropDownItem",
      value: function clickDropDownItem(event) {
        event.preventDefault();
        event.stopPropagation();
        var toggleItem = $(event.currentTarget).closest("LI").data("option-toggle");
        toggleItem();
        this.clearFilterInput(false);
        this.filterInput.focus();
      }
    }, {
      key: "appendDropDownItem",
      value: function appendDropDownItem(optionElement) {
        var _this = this;

        var optionId = optionElement.value;
        var itemText = optionElement.text;
        var isSelected = optionElement.selected;
        var $dropDownItem = $("<li/>");
        $dropDownItem.data("option-id", optionId);
        $dropDownItem.data("option-text", itemText.toLowerCase());
        var adoptDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected);
        $dropDownItem.appendTo($(this.dropDownMenu));

        var appendItem = function appendItem() {
          $dropDownItem.data("option-selected", true);
          var $selectedItem = $("<li/>");
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

          _this.adapter.CreateSelectedItemContent($selectedItem, itemText, function () {
            removeItem();

            _this.clearFilterInput(true);

            _this.updateDropDownPosition(false);

            $(_this.filterInput).focus();
          });

          $selectedItem.insertBefore(_this.jQuery(_this.filterInputItem));
          $dropDownItem.data("option-toggle", removeItem);
          $selectedItem.data("option-remove", removeItem);
          return $selectedItem;
        };

        $dropDownItem.data("option-toggle", function () {
          return appendItem();
        });

        if (isSelected) {
          appendItem();
        }
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
        var dropDownItems = this.dropDownMenu.querySelectorAll("LI");
        var dropDownItem = null;

        for (var i = 0; i < dropDownItems.length; ++i) {
          var it = dropDownItems[i];

          if (it.textContent.trim().toLowerCase() == text) {
            dropDownItem = it;
            break;
          }
        }

        if (dropDownItem) {
          var $dropDownItem = $(dropDownItem);
          var isSelected = $dropDownItem.data("option-selected");

          if (!isSelected) {
            var toggle = $dropDownItem.data("option-toggle");
            toggle();
          }

          this.clearFilterInput(true);
        }
      }
    }, {
      key: "resetSelectDropDownMenu",
      value: function resetSelectDropDownMenu() {
        if (this.selectedDropDownItem !== null) {
          this.adapter.Hover($(this.selectedDropDownItem), false);
          this.selectedDropDownItem = null;
        }

        this.selectedDropDownIndex = null;
      }
    }, {
      key: "keydownArrow",
      value: function keydownArrow(down) {
        var visibleNodeListArray = $(this.dropDownMenu).find('LI:not([style*="display: none"])').toArray();

        if (visibleNodeListArray.length > 0) {
          if (this.hasItems) {
            this.showDropDown();
          }

          if (this.selectedDropDownItem === null) {
            this.selectedDropDownIndex = down ? 0 : visibleNodeListArray.length - 1;
          } else {
            // IE10-11 doesn't support multiple arguments in classList remove 
            this.adapter.Hover($(this.selectedDropDownItem), false);

            if (down) {
              var newIndex = this.selectedDropDownIndex + 1;
              this.selectedDropDownIndex = newIndex < visibleNodeListArray.length ? newIndex : 0;
            } else {
              var _newIndex = this.selectedDropDownIndex - 1;

              this.selectedDropDownIndex = _newIndex >= 0 ? _newIndex : visibleNodeListArray.length - 1;
            }
          }

          this.selectedDropDownItem = visibleNodeListArray[this.selectedDropDownIndex]; // IE10-11 doesn't support multiple arguments in classList add 

          this.adapter.Hover($(this.selectedDropDownItem), true);
        }
      }
    }, {
      key: "init",
      value: function init() {
        var _this2 = this;

        var $hiddenSelect = $(this.hiddenSelect);
        $hiddenSelect.hide();
        var disabled = this.hiddenSelect.disabled;
        var $container = $("<div/>");
        $container.addClass(this.options.containerClass);
        $container.insertAfter($hiddenSelect);
        this.container = $container.get(0);
        var $selectedPanel = $("<ul/>");
        $selectedPanel.css(defSelectedPanelStyleSys);

        if (!this.options.selectedPanelClass) {
          $selectedPanel.addClass(defSelectedPanelClass);
          $selectedPanel.css(defSelectedPanelStyle);
          $selectedPanel.css({
            "min-height": this.options.selectedPanelMinHeight
          });
        } else $selectedPanel.addClass(this.options.selectedPanelClass);

        $selectedPanel.appendTo(this.container);
        this.selectedPanel = $selectedPanel.get(0);
        this.adapter.Init($selectedPanel);
        var $filterInputItem = $('<li/>');
        this.filterInputItem = $filterInputItem.get(0);
        $filterInputItem.css(defFilterInputItemStyleSys);
        if (!this.options.filterInputItemClass) $filterInputItem.addClass(this.options.filterInputItemClass);
        $filterInputItem.appendTo(this.selectedPanel);
        var $filterInput = $('<input type="search" autocomplete="off">');

        if (!this.options.filterInputClass) {
          $filterInput.css(defFilterInputStyleSys);
          $filterInput.css("color", this.options.filterInputColor);
        } else {
          $filterInput.addClass(this.options.filterInputClass);
        }

        $filterInput.appendTo(this.filterInputItem);
        this.filterInput = $filterInput.get(0);
        var $dropDownMenu = $("<ul/>").css({
          "display": "none"
        }).appendTo($container);
        this.dropDownMenu = $dropDownMenu.get(0);
        $dropDownMenu.addClass(this.options.dropDownMenuClass); // prevent heavy understandable styling error

        $dropDownMenu.css(defDropDownMenuStyleSys);
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
        }); // some browsers (IE11) can change select value ("autocomplet") after page is loaded but before "ready" event

        $(document).ready(function () {
          var selectOptions = $hiddenSelect.find('option');
          selectOptions.each(function (index, optionElement) {
            _this2.appendDropDownItem(optionElement);
          });
          _this2.hasItems = selectOptions.length > 0;

          _this2.updateDropDownPosition(false);

          $dropDownMenu.find('li').click(function (event) {
            _this2.clickDropDownItem(event);
          });
          $dropDownMenu.find("li").on("mouseover", function (event) {
            _this2.adapter.Hover($(event.target).closest("li"), true);
          });
          $dropDownMenu.find("li").on("mouseout", function (event) {
            _this2.adapter.Hover($(event.target).closest("li"), false);
          });
        });

        if (disabled) {
          this.filterInput.style.display = "none";
          this.adapter.Enable($(this.selectedPanel), false);
        } else {
          this.filterInput.style.display = "inline-block";
          this.adapter.Enable($(this.selectedPanel), true);
          $dropDownMenu.click(function (event) {
            event.stopPropagation();
          });
          $dropDownMenu.on("mouseover", function () {
            _this2.resetSelectDropDownMenu();
          });
          $selectedPanel.click(function (event) {
            if (event.target.nodeName != "INPUT") $(_this2.filterInput).val('').focus();
            if (_this2.hasItems) if (_this2.adapter.FilterClick(event)) _this2.showDropDown();
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
                // detect that backspace is at start of input field (this will be used at keydown)
                _this2.backspaceAtStartPoint = _this2.filterInput.selectionStart == 0 && _this2.filterInput.selectionEnd == 0;
              }

              _this2.resetSelectDropDownMenu();
            }
          });
          $filterInput.on("keyup", function (event) {
            if (event.which == 13 || event.which == 9) {
              if (_this2.selectedDropDownItem) {
                var $selectedDropDownItem = $(_this2.selectedDropDownItem);
                var toggleItem = $selectedDropDownItem.data("option-toggle");
                toggleItem();

                _this2.closeDropDown();
              } else {
                _this2.analyzeInputText();
              }
            } else if (event.which == 8) {
              if (_this2.filterInput.selectionEnd == 0 && _this2.filterInput.selectionStart == 0 && _this2.backspaceAtStartPoint) {
                var $penult = $(_this2.selectedPanel).find("LI:last").prev();

                if ($penult.length) {
                  var removeItem = $penult.data("option-remove");
                  removeItem();
                }
              }

              _this2.backspaceAtStartPoint = null; //if ($dropDownMenu.is(':hidden'))

              _this2.updateDropDownPosition(false);
            } else if (event.which == 27) {
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

          if (this.options.doManageFocus) {
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
            $(window.document).mouseup(function () {
              _this2.skipFocusout = false;
            });
          }

          $(window.document).mouseup(function (event) {
            if (!(_this2.container === event.target || $.contains(_this2.container, event.target))) {
              _this2.closeDropDown();
            }
          });
        }
      }
    }]);

    return Plugin;
  }();

  function jQueryInterface(options) {
    return this.each(function () {
      var data = $(this).data(dataKey);

      if (!data) {
        if (/dispose|hide/.test(options)) {
          return;
        }

        var optionsObject = _typeof(options) === 'object' ? options : null;
        data = new Plugin(this, optionsObject);
        $(this).data(dataKey, data);
      }

      if (typeof options === 'string') {
        var methodName = options;

        if (typeof data[methodName] === 'undefined') {
          throw new TypeError("No method named \"".concat(methodName, "\""));
        }

        data[methodName]();
      }
    });
  }

  $.fn[pluginName] = jQueryInterface; // in case of mulitple $(this) it will return 1st element plugin instance

  $.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function () {
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