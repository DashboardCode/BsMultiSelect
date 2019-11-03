/*!
  * DashboardCode BsMultiSelect v0.4.2 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2019 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('popper.js')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
    (global = global || self, factory(global.jQuery, global.Popper));
}(this, (function ($, Popper) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

    function defSelectedPanelStyleSys(s) {
      s.display = 'flex';
      s.flexWrap = 'wrap';
      s.listStyleType = 'none';
    }

    function defFilterInputStyleSys(s) {
      s.width = '2ch';
      s.border = '0';
      s.padding = '0';
      s.outline = 'none';
      s.backgroundColor = 'transparent';
    }

    function defDropDownMenuStyleSys(s) {
      s.listStyleType = 'none';
    }

    var MultiSelect =
    /*#__PURE__*/
    function () {
      function MultiSelect(optionsAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
        } // readonly


        this.optionsAdapter = optionsAdapter;
        this.container = optionsAdapter.container; // part of published api

        this.styling = styling;
        this.selectedItemContent = selectedItemContent;
        this.dropDownItemContent = dropDownItemContent;
        this.labelAdapter = labelAdapter;
        this.createStylingComposite = createStylingComposite;
        this.configuration = configuration;
        this.onDispose = onDispose;
        this.window = window;
        this.document = window.document;
        this.selectedPanel = null;
        this.filterInputItem = null;
        this.filterInput = null;
        this.dropDownMenu = null;
        this.popper = null;
        this.getDisabled = null;
        this.stylingComposite = null; // removable handlers

        this.selectedPanelClick = null;
        this.documentMouseup = null;
        this.containerMousedown = null;
        this.documentMouseup2 = null; // state

        this.disabled = null;
        this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

        this.skipFocusout = false;
        this.hoveredMultiSelectData = null;
        this.hoveredMultiSelectDataIndex = null; //this.hasDropDownVisible = false;

        this.MultiSelectDataList = [];
        this.MultiSelectDataSelectedTail = null;
        this.visibleMultiSelectDataList = null;
        this.visibleCount = 10;
      }

      var _proto = MultiSelect.prototype;

      _proto.getVisibleMultiSelectDataList = function getVisibleMultiSelectDataList() {
        if (this.visibleMultiSelectDataList) return this.visibleMultiSelectDataList;else return this.MultiSelectDataList;
      };

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
      };

      _proto.resetDropDownMenuHover = function resetDropDownMenuHover() {
        if (this.hoveredMultiSelectData !== null) {
          this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);
          this.hoveredMultiSelectData = null;
          this.hoveredMultiSelectDataIndex = null;
        }
      };

      _proto.filterMultiSelectData = function filterMultiSelectData(MultiSelectData, isFiltered) {
        MultiSelectData.visible = isFiltered;
        MultiSelectData.dropDownMenuItemElement.style.display = isFiltered ? 'block' : 'none';
      };

      _proto.filterDropDownMenu = function filterDropDownMenu() {
        var text = this.filterInput.value.trim().toLowerCase();

        if (text == '') {
          for (var i = 0; i < this.MultiSelectDataList.length; i++) {
            this.filterMultiSelectData(this.MultiSelectDataList[i], true);
          }

          this.visibleMultiSelectDataList = null;
        } else {
          this.visibleMultiSelectDataList = [];

          for (var _i = 0; _i < this.MultiSelectDataList.length; _i++) {
            var multiSelectData = this.MultiSelectDataList[_i];
            var option = multiSelectData.option;
            if (option.selected || option.disabled || multiSelectData.searchText.indexOf(text) < 0) this.filterMultiSelectData(multiSelectData, false);else {
              this.filterMultiSelectData(multiSelectData, true);
              this.visibleMultiSelectDataList.push(multiSelectData);
            }
          }
        }

        this.resetDropDownMenuHover();

        if (this.getVisibleMultiSelectDataList().length == 1) {
          this.hoverInInternal(0);
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

      _proto.removeSelectedFromList = function removeSelectedFromList(MultiSelectData) {
        if (MultiSelectData.selectedPrev) {
          MultiSelectData.selectedPrev.selectedNext = MultiSelectData.selectedNext;
        }

        if (MultiSelectData.selectedNext) {
          MultiSelectData.selectedNext.selectedPrev = MultiSelectData.selectedPrev;
        }

        if (this.MultiSelectDataSelectedTail == MultiSelectData) {
          this.MultiSelectDataSelectedTail = MultiSelectData.selectedPrev;
        }

        MultiSelectData.selectedNext = null;
        MultiSelectData.selectedPrev = null;
      };

      _proto.appendDropDownItem = function appendDropDownItem(option) {
        var _this = this;

        var dropDownMenuItemElement = this.document.createElement('LI');
        this.dropDownMenu.appendChild(dropDownMenuItemElement);
        var dropDownItemContent = this.dropDownItemContent(dropDownMenuItemElement, option);
        var isDisabled = option.disabled;
        var isSelected = option.selected;
        if (isSelected && isDisabled) dropDownItemContent.disabledStyle(true);else if (isDisabled) dropDownItemContent.disable(isDisabled);
        var MultiSelectData = {
          searchText: option.text.toLowerCase().trim(),
          option: option,
          dropDownMenuItemElement: dropDownMenuItemElement,
          dropDownItemContent: dropDownItemContent,
          selectedPrev: null,
          selectedNext: null,
          visible: true,
          toggle: null,
          selectedItemElement: null,
          remove: null,
          disable: null
        };
        this.MultiSelectDataList.push(MultiSelectData);
        dropDownItemContent.onSelected(function () {
          MultiSelectData.toggle();

          _this.filterInput.focus();
        });

        var selectItem = function selectItem(doPublishEvents) {
          //if (option.hidden)
          //    return;
          var selectedItemElement = _this.document.createElement('LI');

          MultiSelectData.selectedItemElement = selectedItemElement;

          if (_this.MultiSelectDataSelectedTail) {
            _this.MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
            MultiSelectData.selectedPrev = _this.MultiSelectDataSelectedTail;
          }

          _this.MultiSelectDataSelectedTail = MultiSelectData;

          var adjustPair = function adjustPair(isSelected, toggle, remove, disable) {
            option.selected = isSelected;
            dropDownItemContent.select(isSelected);
            MultiSelectData.toggle = toggle;
            MultiSelectData.remove = remove;
            MultiSelectData.disable = disable;
          };

          var removeItem = function removeItem() {
            dropDownItemContent.disabledStyle(false);
            dropDownItemContent.disable(option.disabled);
            adjustPair(false, function () {
              if (option.disabled) return;
              selectItem(true);
            }, null, null);
            selectedItemElement.parentNode.removeChild(selectedItemElement);

            _this.removeSelectedFromList(MultiSelectData);

            _this.optionsAdapter.triggerChange();
          }; // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
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


          var removeItemAndCloseDropDown = function removeItemAndCloseDropDown() {
            removeItem();

            _this.closeDropDown();
          };

          var onRemoveItemEvent = function onRemoveItemEvent() {
            setTimeout(function () {
              removeItem();

              _this.closeDropDown();
            }, 0);
          };

          var preventDefaultMultiSelect = function preventDefaultMultiSelect(event) {
            _this.preventDefaultMultiSelectEvent = event;
          };

          var bsSelectedItemContent = _this.selectedItemContent(selectedItemElement, option, onRemoveItemEvent, preventDefaultMultiSelect);

          bsSelectedItemContent.disable(_this.disabled);
          adjustPair(true, function () {
            return removeItem();
          }, removeItemAndCloseDropDown, bsSelectedItemContent.disable);

          _this.selectedPanel.insertBefore(selectedItemElement, _this.filterInputItem);

          if (doPublishEvents) {
            _this.optionsAdapter.triggerChange();
          }
        };

        dropDownMenuItemElement.addEventListener('mouseover', function () {
          return _this.styling.HoverIn(dropDownMenuItemElement);
        });
        dropDownMenuItemElement.addEventListener('mouseout', function () {
          return _this.styling.HoverOut(dropDownMenuItemElement);
        });
        if (option.selected) selectItem(false);else MultiSelectData.toggle = function () {
          if (option.disabled) return;
          selectItem(true);
        };
        return MultiSelectData;
      };

      _proto.hoverInInternal = function hoverInInternal(index) {
        this.visibleIndex = 0;
        this.hoveredMultiSelectDataIndex = index;
        this.hoveredMultiSelectData = this.getVisibleMultiSelectDataList()[index];
        this.styling.HoverIn(this.hoveredMultiSelectData.dropDownMenuItemElement);
      };

      _proto.keydownArrow = function keydownArrow(down) {
        var visibleMultiSelectDataList = this.getVisibleMultiSelectDataList();

        if (visibleMultiSelectDataList.length > 0) {
          if (visibleMultiSelectDataList.length > 0) {
            this.updateDropDownPosition(true);
            this.showDropDown();
          }

          var index;

          if (this.hoveredMultiSelectData === null) {
            index = down ? 0 : visibleMultiSelectDataList.length - 1;
          } else {
            this.styling.HoverOut(this.hoveredMultiSelectData.dropDownMenuItemElement);

            if (down) {
              var newIndex = this.hoveredMultiSelectDataIndex + 1;
              index = newIndex < visibleMultiSelectDataList.length ? newIndex : 0;
            } else {
              var _newIndex = this.hoveredMultiSelectDataIndex - 1;

              index = _newIndex >= 0 ? _newIndex : visibleMultiSelectDataList.length - 1;
            }
          }

          this.hoverInInternal(index);
        }
      };

      _proto.input = function input(forceUpdatePosition) {
        this.filterInput.style.width = this.filterInput.value.length * 1.3 + 2 + "ch";
        this.filterDropDownMenu();

        if (this.getVisibleMultiSelectDataList().length > 0) {
          if (forceUpdatePosition) // ignore it if it is called from
            this.updateDropDownPosition(forceUpdatePosition); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

          this.showDropDown();
        } else {
          this.hideDropDown();
        }
      };

      _proto.Update = function Update() {
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        this.UpdateSize();
        this.UpdateDisabled();
      };

      _proto.Dispose = function Dispose() {
        if (this.onDispose) this.onDispose(); // primary used to remove from jQuery tables
        // removable handlers

        this.document.removeEventListener("mouseup", this.documentMouseup);
        this.document.removeEventListener("mouseup", this.documentMouseup2);
        this.document.removeEventListener("DOMContentLoaded", this.createDropDownItems);
        this.container.removeEventListener("mousedown", this.containerMousedown);
        this.labelAdapter.dispose();

        if (this.popper) {
          this.popper.destroy();
        }

        if (this.optionsAdapter.dispose) {
          this.optionsAdapter.dispose();
        }
      };

      _proto.UpdateSize = function UpdateSize() {
        if (this.styling.UpdateSize) this.styling.UpdateSize(this.stylingComposite);
      };

      _proto.UpdateDisabled = function UpdateDisabled() {
        var _this2 = this;

        var disabled = this.optionsAdapter.getDisabled();

        var itarate = function itarate(isDisabled) {
          var i = _this2.MultiSelectDataSelectedTail;

          while (i) {
            i.disable(isDisabled);
            i = i.selectedPrev;
          }
        };

        if (this.disabled !== disabled) {
          if (disabled) {
            this.filterInput.style.display = "none";
            this.styling.Disable(this.stylingComposite);
            itarate(true);
            this.container.removeEventListener("mousedown", this.containerMousedown);
            this.document.removeEventListener("mouseup", this.documentMouseup);
            this.selectedPanel.removeEventListener("click", this.selectedPanelClick);
            this.document.removeEventListener("mouseup", this.documentMouseup2);
          } else {
            this.filterInput.style.display = "inline-block";
            this.styling.Enable(this.stylingComposite);
            itarate(false);
            this.container.addEventListener("mousedown", this.containerMousedown);
            this.document.addEventListener("mouseup", this.documentMouseup);
            this.selectedPanel.addEventListener("click", this.selectedPanelClick);
            this.document.addEventListener("mouseup", this.documentMouseup2);
          }

          this.disabled = disabled;
        }
      };

      _proto.init = function init() {
        var _this3 = this;

        var container = this.optionsAdapter.container;
        this.selectedPanel = this.document.createElement('UL');
        defSelectedPanelStyleSys(this.selectedPanel.style);
        container.appendChild(this.selectedPanel);
        this.filterInputItem = this.document.createElement('LI');
        this.selectedPanel.appendChild(this.filterInputItem);
        this.filterInput = document.createElement('INPUT');
        this.filterInput.setAttribute("type", "search");
        this.filterInput.setAttribute("autocomplete", "off");
        defFilterInputStyleSys(this.filterInput.style);
        this.filterInputItem.appendChild(this.filterInput);
        this.dropDownMenu = document.createElement('UL');
        this.dropDownMenu.style.display = "none";
        container.appendChild(this.dropDownMenu); // prevent heavy understandable styling error

        defDropDownMenuStyleSys(this.dropDownMenu.style);

        this.documentMouseup = function () {
          _this3.skipFocusout = false;
        };

        this.containerMousedown = function () {
          _this3.skipFocusout = true;
        };

        this.documentMouseup2 = function (event) {
          if (!(container === event.target || container.contains(event.target))) {
            _this3.closeDropDown();
          }
        };

        this.selectedPanelClick = function (event) {
          if (event.target != _this3.filterInput) {
            _this3.filterInput.value = '';

            _this3.filterInput.focus();
          }

          if (_this3.getVisibleMultiSelectDataList().length > 0 && _this3.preventDefaultMultiSelectEvent != event) {
            _this3.updateDropDownPosition(true);

            _this3.showDropDown();
          }

          _this3.preventDefaultMultiSelectEvent = null;
        };

        this.stylingComposite = this.createStylingComposite(container, this.selectedPanel, this.filterInputItem, this.filterInput, this.dropDownMenu);
        this.styling.Init(this.stylingComposite);
        this.labelAdapter.init(this.filterInput);
        if (this.optionsAdapter.afterContainerFilled) this.optionsAdapter.afterContainerFilled();
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
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        this.UpdateSize();
        this.UpdateDisabled();

        this.createDropDownItems = function () {
          var options = _this3.optionsAdapter.options;

          for (var i = 0; i < options.length; i++) {
            var option = options[i];

            if (!option.hidden) {
              _this3.appendDropDownItem(option);
            }
          } //this.hasDropDownVisible = options.length > 0;


          _this3.updateDropDownPosition(false);
        }; // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event


        if (this.document.readyState != 'loading') {
          this.createDropDownItems();
        } else {
          this.document.addEventListener('DOMContentLoaded', this.createDropDownItems); // IE9+
        } // there was unmotivated stopPropagation call. commented out.
        // $dropDownMenu.click(  event => { 
        //    event.stopPropagation();
        // });


        this.dropDownMenu.addEventListener('mouseover', function () {
          return _this3.resetDropDownMenuHover();
        });
        this.filterInput.addEventListener('focusin', function () {
          return _this3.styling.FocusIn(_this3.stylingComposite);
        });
        this.filterInput.addEventListener('focusout', function () {
          if (!_this3.skipFocusout) _this3.styling.FocusOut(_this3.stylingComposite);
        });
        this.filterInput.addEventListener('keydown', function (event) {
          if ([38, 40, 13].indexOf(event.which) >= 0 || event.which == 9 && _this3.filterInput.value) {
            event.preventDefault();
          }

          if (event.which == 38) {
            _this3.keydownArrow(false);
          } else if (event.which == 40) {
            if (_this3.hoveredMultiSelectData === null && _this3.getVisibleMultiSelectDataList().length > 0) {
              _this3.showDropDown();
            }

            _this3.keydownArrow(true);
          } else if (event.which == 9) {
            if (!_this3.filterInput.value) {
              _this3.closeDropDown();
            }
          } else if (event.which == 8) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!_this3.filterInput.value) {
              if (_this3.MultiSelectDataSelectedTail) {
                _this3.MultiSelectDataSelectedTail.remove();
              }

              _this3.updateDropDownPosition(false);
            }
          }

          if ([38, 40, 13, 9].indexOf(event.which) == -1) _this3.resetDropDownMenuHover();
        });
        this.filterInput.addEventListener('keyup', function (event) {
          if (event.which == 13 || event.which == 9) {
            if (_this3.hoveredMultiSelectData) {
              _this3.hoveredMultiSelectData.toggle();

              _this3.closeDropDown();
            }
          } else if (event.which == 27) {
            // escape
            _this3.closeDropDown();
          } // TODO may be do it on "space" (when there is left only one)?
          else {
              var text = _this3.filterInput.value.trim().toLowerCase();

              var visibleMultiSelectDataList = _this3.getVisibleMultiSelectDataList();

              if (text && visibleMultiSelectDataList.length == 1) {
                var fullMatchMultiSelectData = visibleMultiSelectDataList[0];

                if (fullMatchMultiSelectData.searchText == text) {
                  fullMatchMultiSelectData.toggle();

                  _this3.clearFilterInput(true);
                }
              }
            }
        });
        this.filterInput.addEventListener('input', function () {
          _this3.input(true);
        });
      };

      return MultiSelect;
    }();

    function LabelAdapter(label, createInputId) {
      var backupedFor = null; // state saved between init and dispose

      return {
        init: function init(filterInput) {
          if (label) {
            backupedFor = label.getAttribute('for');
            var newId = createInputId();
            filterInput.setAttribute('id', newId);
            label.setAttribute('for', newId);
          }
        },
        dispose: function dispose() {
          if (backupedFor) label.setAttribute('for', backupedFor);
        }
      };
    }

    function OptionsAdapterJson(container, options, _getDisabled, _getIsValid, _getIsInvalid, trigger) {
      return {
        container: container,
        options: options,
        dispose: function dispose() {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
        },
        triggerChange: function triggerChange() {
          trigger('multiselect:change');
        },
        getDisabled: function getDisabled() {
          return _getDisabled ? _getDisabled() : false;
        },
        getIsValid: function getIsValid() {
          return _getIsValid ? _getIsValid() : false;
        },
        getIsInvalid: function getIsInvalid() {
          return _getIsInvalid ? _getIsInvalid() : false;
        }
      };
    }

    function OptionsAdapterElement(selectElement, trigger) {
      selectElement.style.display = 'none';
      var container = document.createElement('div');
      var options = selectElement.getElementsByTagName('OPTION');
      return {
        container: container,
        options: options,
        dispose: function dispose() {
          container.parentNode.removeChild(container);
        },
        afterContainerFilled: function afterContainerFilled() {
          selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
        },
        triggerChange: function triggerChange() {
          trigger('change');
          trigger('multiselect:change');
        },
        getDisabled: function getDisabled() {
          return selectElement.disabled;
        },
        getIsValid: function getIsValid() {
          return selectElement.classList.contains('is-valid');
        },
        getIsInvalid: function getIsInvalid() {
          return selectElement.classList.contains('is-invalid');
        }
      };
    }

    function ExtendIfUndefined(destination, source) {
      for (var property in source) {
        if (destination[property] === undefined) destination[property] = source[property];
      }
    }

    var bs4StylingMethodCssDefaults = {
      selectedPanelFocusClass: 'focus',
      selectedPanelDisabledClass: 'disabled',
      dropDownItemDisabledClass: 'disabled'
    };

    function Bs4StylingMethodCss(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults);
      return {
        Enable: function Enable($selectedPanel) {
          $selectedPanel.removeClass(configuration.selectedPanelDisabledClass);
        },
        Disable: function Disable($selectedPanel) {
          $selectedPanel.addClass(configuration.selectedPanelDisabledClass);
        },
        FocusIn: function FocusIn($selectedPanel) {
          $selectedPanel.addClass(configuration.selectedPanelFocusClass);
        },
        FocusOut: function FocusOut($selectedPanel) {
          $selectedPanel.removeClass(configuration.selectedPanelFocusClass);
        }
      };
    }

    var defSelectedPanelStyle = {
      'margin-bottom': '0',
      'height': 'auto'
    };
    var bs4StylingMethodJsDefaults = {
      selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
      selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
      selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
      selectedPanelDisabledBackgroundColor: '#e9ecef',
      selectedPanelFocusBorderColor: '#80bdff',
      selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
      selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
      selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
      filterInputColor: '#495057' //selectedItemContentDisabledOpacity: '.65'

    };

    function Bs4StylingMethodJs(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);
      return {
        OnInit: function OnInit(composite) {
          composite.$selectedPanel.css(defSelectedPanelStyle);
          composite.$filterInput.css("color", configuration.filterInputColor);
        },
        UpdateSize: function UpdateSize($selectedPanel) {
          if ($selectedPanel.hasClass("form-control-lg")) {
            $selectedPanel.css("min-height", configuration.selectedPanelLgMinHeight);
          } else if ($selectedPanel.hasClass("form-control-sm")) {
            $selectedPanel.css("min-height", configuration.selectedPanelSmMinHeight);
          } else {
            $selectedPanel.css("min-height", configuration.selectedPanelDefMinHeight);
          }
        },
        Enable: function Enable($selectedPanel) {
          $selectedPanel.css("background-color", "");
        },
        Disable: function Disable($selectedPanel) {
          $selectedPanel.css("background-color", configuration.selectedPanelDisabledBackgroundColor);
        },
        FocusIn: function FocusIn($selectedPanel) {
          if ($selectedPanel.hasClass("is-valid")) {
            $selectedPanel.css("box-shadow", configuration.selectedPanelFocusValidBoxShadow);
          } else if ($selectedPanel.hasClass("is-invalid")) {
            $selectedPanel.css("box-shadow", configuration.selectedPanelFocusInvalidBoxShadow);
          } else {
            $selectedPanel.css("box-shadow", configuration.selectedPanelFocusBoxShadow).css("border-color", configuration.selectedPanelFocusBorderColor);
          }
        },
        FocusOut: function FocusOut($selectedPanel) {
          $selectedPanel.css("box-shadow", "").css("border-color", "");
        }
      };
    }

    var bs4StylingDefaults = {
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

    function Bs4Styling(stylingMethod, configuration, $) {
      ExtendIfUndefined(configuration, bs4StylingDefaults);
      return {
        Init: function Init(composite) {
          composite.$container.addClass(configuration.containerClass);
          composite.$selectedPanel.addClass(configuration.selectedPanelClass);
          composite.$dropDownMenu.addClass(configuration.dropDownMenuClass);
          composite.$filterInputItem.addClass(configuration.filterInputItemClass);
          composite.$filterInput.addClass(configuration.filterInputClass);
          if (stylingMethod.OnInit) stylingMethod.OnInit(composite);
        },
        UpdateIsValid: function UpdateIsValid(composite, isValid, isInvalid) {
          if (isValid) composite.$selectedPanel.addClass('is-valid');
          if (isInvalid) composite.$selectedPanel.addClass('is-invalid');
        },
        UpdateSize: function UpdateSize(composite) {
          if (stylingMethod.UpdateSize) stylingMethod.UpdateSize(composite.$selectedPanel);
        },
        Enable: function Enable(composite) {
          stylingMethod.Enable(composite.$selectedPanel);
        },
        Disable: function Disable(composite) {
          stylingMethod.Disable(composite.$selectedPanel);
        },
        FocusIn: function FocusIn(composite) {
          stylingMethod.FocusIn(composite.$selectedPanel);
        },
        FocusOut: function FocusOut(composite) {
          stylingMethod.FocusOut(composite.$selectedPanel);
        },
        HoverIn: function HoverIn(dropDownItem) {
          $(dropDownItem).addClass(configuration.dropDownItemHoverClass);
        },
        HoverOut: function HoverOut(dropDownItem) {
          $(dropDownItem).removeClass(configuration.dropDownItemHoverClass);
        }
      };
    }

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

    var bs4StylingMethodCssdefaults = {
      selectedItemContentDisabledClass: 'disabled'
    };

    function Bs4SelectedItemContentStylingMethodCss(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodCssdefaults);
      return {
        disableSelectedItemContent: function disableSelectedItemContent($content) {
          $content.addClass(configuration.selectedItemContentDisabledClass);
        }
      };
    }

    var defSelectedItemStyle = {
      'padding-left': '0px',
      'line-height': '1.5em'
    };
    var defRemoveSelectedItemButtonStyle = {
      'font-size': '1.5em',
      'line-height': '.9em'
    };
    var bs4StylingMethodJsDefaults$1 = {
      selectedItemContentDisabledOpacity: '.65'
    };

    function Bs4SelectedItemContentStylingMethodJs(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults$1);
      return {
        disableSelectedItemContent: function disableSelectedItemContent($content) {
          $content.css("opacity", configuration.selectedItemContentDisabledOpacity);
        },
        createSelectedItemContent: function createSelectedItemContent($selectedItem, $button) {
          $selectedItem.css(defSelectedItemStyle);
          if ($button) $button.css(defRemoveSelectedItemButtonStyle);
        }
      };
    }

    var bs4SelectedItemContentDefaults = {
      selectedItemClass: 'badge',
      removeSelectedItemButtonClass: 'close'
    };

    function Bs4SelectedItemContent(stylingMethod, configuration, $) {
      ExtendIfUndefined(configuration, bs4SelectedItemContentDefaults);
      return function (selectedItem, optionItem, removeSelectedItem, preventDefaultMultiSelect) {
        var $selectedItem = $(selectedItem);
        $selectedItem.addClass(configuration.selectedItemClass);
        var $content = $("<span/>").text(optionItem.text);
        $content.appendTo($selectedItem);
        if (optionItem.disabled) stylingMethod.disableSelectedItemContent($content);
        var $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>') // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
        // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
        .css("float", "none").appendTo($selectedItem).addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
        .on("click", function (jqEvent) {
          removeSelectedItem();
          preventDefaultMultiSelect(jqEvent.originalEvent);
        });
        if (stylingMethod.createSelectedItemContent) stylingMethod.createSelectedItemContent($selectedItem, $button);
        return {
          disable: function disable(isDisabled) {
            $button.prop('disabled', isDisabled);
          }
        };
      };
    }

    var bs4StylingMethodCssDefaults$1 = {
      selectedItemContentDisabledClass: 'disabled'
    };

    function Bs4DropDownItemContentStylingMethodCss(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults$1);
      return {
        disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
          if (isDisbaled) $checkBox.addClass(configuration.dropDownItemDisabledClass);else $checkBox.removeClass(configuration.dropDownItemDisabledClass);
        }
      };
    }

    var bs4StylingMethodJsDefaults$2 = {
      selectedItemContentDisabledOpacity: '.65',
      dropdDownLabelDisabledColor: '#6c757d'
    };

    function Bs4DropDownItemContentStylingMethodJs(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults$2);
      return {
        disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
          $checkBoxLabel.css('color', isDisbaled ? configuration.dropdDownLabelDisabledColor : '');
        }
      };
    }

    var bs4DropDownItemContentDefaults = {
      dropDownItemClass: 'px-2'
    };

    function Bs4DropDownItemContent(stylingMethod, configuration, $) {
      ExtendIfUndefined(configuration, bs4DropDownItemContentDefaults);
      return function (dropDownItem, option) {
        var $dropDownItem = $(dropDownItem);
        $dropDownItem.addClass(configuration.dropDownItemClass);
        var $dropDownItemContent = $("<div class=\"custom-control custom-checkbox\">\n            <input type=\"checkbox\" class=\"custom-control-input\">\n            <label class=\"custom-control-label\"></label>\n        </div>");
        $dropDownItemContent.appendTo(dropDownItem);
        var $checkBox = $dropDownItemContent.find("INPUT[type=\"checkbox\"]");
        var $checkBoxLabel = $dropDownItemContent.find("label");
        $checkBoxLabel.text(option.text);
        return {
          select: function select(isSelected) {
            $checkBox.prop('checked', isSelected);
          },
          disable: function disable(isDisabled) {
            $checkBox.prop('disabled', isDisabled);
          },
          disabledStyle: function disabledStyle(isDisbaled) {
            stylingMethod.disabledStyle($checkBox, $checkBoxLabel, isDisbaled);
          },
          onSelected: function onSelected(toggle) {
            $checkBox.on("change", toggle);
            $dropDownItem.on("click", function (event) {
              if (dropDownItem === event.target || $.contains(dropDownItem, event.target)) {
                toggle();
              }
            });
          }
        };
      };
    }

    (function (window, $) {
      AddToJQueryPrototype('BsMultiSelect', function (element, settings, onDispose) {
        var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

        if (configuration.preBuildConfiguration) configuration.preBuildConfiguration(element, configuration);
        var $element = $(element);
        var optionsAdapter = null;
        if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
          var trigger = function trigger(eventName) {
            $element.trigger(eventName);
          };

          if (configuration.options) {
            optionsAdapter = OptionsAdapterJson(element, configuration.options, configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid, trigger);
            if (!configuration.createInputId) configuration.createInputId = function () {
              return configuration.containerClass + "-generated-filter-" + element.id;
            };
          } else {
            if (!configuration.label) {
              var $formGroup = $(element).closest('.form-group');

              if ($formGroup.length == 1) {
                var $label = $formGroup.find("label[for=\"" + element.id + "\"]");

                if ($label.length > 0) {
                  var label = $label.get(0);
                  var forId = label.getAttribute('for');

                  if (forId == element.id) {
                    configuration.label = label;
                  }
                }
              }
            }

            optionsAdapter = OptionsAdapterElement(element, trigger);
            if (!configuration.createInputId) configuration.createInputId = function () {
              return configuration.containerClass + "-generated-input-" + (element.id ? element.id : element.name).toLowerCase() + "-id";
            };
          }
        }
        var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
        var useCss = configuration.useCss;
        var styling = configuration.styling;

        if (!configuration.adapter) {
          var stylingMethod = configuration.stylingMethod;

          if (!stylingMethod) {
            if (useCss) stylingMethod = Bs4StylingMethodCss(configuration);else stylingMethod = Bs4StylingMethodJs(configuration);
          }

          styling = Bs4Styling(stylingMethod, configuration, $);
        }

        var selectedItemContent = configuration.selectedItemContent;

        if (!selectedItemContent) {
          var selectedItemContentStylingMethod = configuration.selectedItemContentStylingMethod;

          if (!selectedItemContentStylingMethod) {
            if (useCss) selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodCss(configuration);else selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodJs(configuration);
          }

          selectedItemContent = Bs4SelectedItemContent(selectedItemContentStylingMethod, configuration, $);
        }

        var dropDownItemContent = configuration.bs4DropDownItemContent;

        if (!dropDownItemContent) {
          var dropDownItemContentStylingMethod = configuration.dropDownItemContentStylingMethod;
          if (useCss) dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodCss(configuration);else dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodJs(configuration);
          dropDownItemContent = Bs4DropDownItemContent(dropDownItemContentStylingMethod, configuration, $);
        }

        var createStylingComposite = function createStylingComposite(container, selectedPanel, filterInputItem, filterInput, dropDownMenu) {
          return {
            $container: $(container),
            $selectedPanel: $(selectedPanel),
            $filterInputItem: $(filterInputItem),
            $filterInput: $(filterInput),
            $dropDownMenu: $(dropDownMenu)
          };
        };

        var multiSelect = new MultiSelect(optionsAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window);
        if (configuration.postBuildConfiguration) configuration.postBuildConfiguration(element, multiSelect);
        multiSelect.init();
        return multiSelect;
      }, $);
    })(window, $);

})));
//# sourceMappingURL=BsMultiSelect.js.map
