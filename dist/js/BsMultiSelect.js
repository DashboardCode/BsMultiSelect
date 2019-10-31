/*!
  * DashboardCode BsMultiSelect v0.4.1-beta (https://dashboardcode.github.io/BsMultiSelect/)
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
    // jQuery used for:
    // $.contains, $("<div>"), $(function(){}) aka ready
    // $e.unbind, $e.on; but namespaces are not used;
    // events: "focusin", "focusout", "mouseover", "mouseout", "keydown", "keyup", "click"
    // $e.show, $e.hide, $e.focus, $e.css
    // $e.appendTo, $e.remove, $e.find, $e.closest, $e.prev, $e.data, $e.val

    var MultiSelect =
    /*#__PURE__*/
    function () {
      function MultiSelect(optionsAdapter, styling, selectedItemContentFactory, dropDownItemContentFactory, labelAdapter, createStylingComposite, configuration, onDispose, window, $) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
        } // readonly


        this.optionsAdapter = optionsAdapter;
        this.container = optionsAdapter.container; // part of published api

        this.styling = styling;
        this.labelAdapter = labelAdapter;
        this.window = window;
        this.document = window.document;
        this.onDispose = onDispose;
        this.createStylingComposite = createStylingComposite;
        this.configuration = configuration;
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
        this.hoveredDropDownItem = null;
        this.hoveredDropDownIndex = null;
        this.hasDropDownVisible = false;
        this.selectedItemContentFactory = selectedItemContentFactory;
        this.dropDownItemContentFactory = dropDownItemContentFactory; // jquery adapters

        this.$ = $; //optionsAdapter(this.fillContainer, this.init);

        this.init();
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
          this.styling.HoverOut(this.hoveredDropDownItem);
          this.hoveredDropDownItem = null;
          this.hoveredDropDownIndex = null;
        }
      };

      _proto.filterDropDownMenu = function filterDropDownMenu() {
        var text = this.filterInput.value.trim().toLowerCase();
        var visible = 0;
        var dropDownMenuItems = this.dropDownMenu.getElementsByTagName('LI');

        for (var i = 0; i < dropDownMenuItems.length; i++) {
          var dropDownMenuItem = dropDownMenuItems[i];

          if (text == '') {
            dropDownMenuItem.style.display = 'block';
            visible++;
          } else {
            //let $dropDownMenuItem = this.$(dropDownMenuItem);
            var itemText = dropDownMenuItem.MultiSelectData.optionText; //$dropDownMenuItem.data("option-text");

            var option = dropDownMenuItem.MultiSelectData.option; //$dropDownMenuItem.data("option");

            if (!option.selected && !option.hidden && !option.disabled && itemText.indexOf(text) >= 0) {
              dropDownMenuItem.style.display = 'block';
              visible++;
            } else {
              dropDownMenuItem.style.display = 'none';
            }
          }
        }

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

      _proto.appendDropDownItem = function appendDropDownItem(optionElement) {
        var _this = this;

        var isHidden = optionElement.hidden;
        var itemText = optionElement.text; //let $dropDownItem = this.$("<LI/>").prop("hidden", isHidden)
        //let dropDownItem = $dropDownItem.get(0);
        //let dropDownItem = 

        var dropDownItem = this.document.createElement('LI');
        dropDownItem.hidden = isHidden;
        var MultiSelectData = {
          optionText: itemText.toLowerCase(),
          option: optionElement,
          optionToggle: null,
          optionRemove: null,
          optionDisable: null
        };
        dropDownItem.MultiSelectData = MultiSelectData; //this.$(dropDownItem).data("option-text", itemText.toLowerCase())
        //this.$(dropDownItem).data("option", optionElement);

        this.dropDownMenu.appendChild(dropDownItem);
        var adjustDropDownItem = this.dropDownItemContentFactory(dropDownItem, optionElement);
        var isDisabled = optionElement.disabled;
        var isSelected = optionElement.selected;
        if (isSelected && isDisabled) adjustDropDownItem.disabledStyle(true);else if (isDisabled) adjustDropDownItem.disable(isDisabled);
        adjustDropDownItem.onSelected(function () {
          var toggleItem = dropDownItem.MultiSelectData.optionToggle; // this.$(dropDownItem).data("option-toggle");

          toggleItem();

          _this.filterInput.focus();
        });

        var selectItem = function selectItem(doPublishEvents) {
          if (optionElement.hidden) return;

          var selectedItem = _this.document.createElement('LI');

          selectedItem.MultiSelectData = MultiSelectData;

          var adjustPair = function adjustPair(isSelected, toggle, remove, disable) {
            optionElement.selected = isSelected;
            adjustDropDownItem.select(isSelected);
            MultiSelectData.optionToggle = toggle; //this.$(dropDownItem).data("option-toggle", toggle);                    

            MultiSelectData.optionRemove = remove;
            MultiSelectData.optionDisable = disable;
          };

          var removeItem = function removeItem() {
            adjustDropDownItem.disabledStyle(false);
            adjustDropDownItem.disable(optionElement.disabled);
            adjustPair(false, function () {
              if (optionElement.disabled) return;
              selectItem(true);
            }, null, null);
            selectedItem.parentNode.removeChild(selectedItem);

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

          var onRemoveItemEvent = function onRemoveItemEvent(jqEvent) {
            setTimeout(function () {
              removeItem();

              _this.closeDropDown();
            }, 0);
            _this.ProcessedBySelectedItemContentEvent = jqEvent;
          };

          var bsSelectedItemContent = _this.selectedItemContentFactory(selectedItem, optionElement, onRemoveItemEvent); //bsSelectedItemContentList.push(bsSelectedItemContent);


          bsSelectedItemContent.disable(_this.disabled);
          adjustPair(true, function () {
            return removeItem();
          }, removeItemAndCloseDropDown, bsSelectedItemContent.disable); //$selectedItem.insertBefore(this.filterInputItem);

          _this.selectedPanel.insertBefore(selectedItem, _this.filterInputItem);

          if (doPublishEvents) {
            _this.optionsAdapter.triggerChange();
          }
        };

        this.$(dropDownItem).mouseover(function () {
          return _this.styling.HoverIn(dropDownItem);
        }).mouseout(function () {
          return _this.styling.HoverOut(dropDownItem);
        });
        if (optionElement.selected) selectItem(false);else MultiSelectData.optionToggle = function () {
          if (optionElement.disabled) return;
          selectItem(true);
        };
      };

      _proto.getVisibleNodeListArray = function getVisibleNodeListArray() {
        return this.$(this.dropDownMenu).find('LI:not([style*="display: none"]):not(:hidden)').toArray();
      };

      _proto.hoverInInternal = function hoverInInternal(visibleNodeListArray, index) {
        this.hoveredDropDownIndex = index;
        this.hoveredDropDownItem = visibleNodeListArray[index];
        this.styling.HoverIn(this.hoveredDropDownItem);
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
            this.styling.HoverOut(this.hoveredDropDownItem);

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
        this.styling.UpdateIsValid(this.stylingComposite, this.optionsAdapter.getIsValid(), this.optionsAdapter.getIsInvalid());
        this.UpdateSize();
        this.UpdateDisabled();
      };

      _proto.Dispose = function Dispose() {
        if (this.onDispose) this.onDispose(); // primary used to remove from jQuery tables
        // removable handlers

        this.$(this.document).unbind("mouseup", this.documentMouseup).unbind("mouseup", this.documentMouseup2);
        this.labelAdapter.dispose();

        if (this.popper !== null) {
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
          var selectedPanelItems = _this2.selectedPanel.getElementsByTagName('LI'); // TODO : improove


          for (var i = 0; i < selectedPanelItems.length; i++) {
            var selectedPanelItem = selectedPanelItems[i];
            if (selectedPanelItem.MultiSelectData) selectedPanelItem.MultiSelectData.optionDisable(isDisabled);
          }
        };

        if (this.disabled !== disabled) {
          if (disabled) {
            this.filterInput.style.display = "none";
            this.styling.Disable(this.stylingComposite);
            itarate(true);
            this.$(this.container).unbind("mousedown", this.containerMousedown);
            this.$(this.document).unbind("mouseup", this.documentMouseup);
            this.$(this.selectedPanel).unbind("click", this.selectedPanelClick);
            this.$(this.document).unbind("mouseup", this.documentMouseup2);
          } else {
            this.filterInput.style.display = "inline-block";
            this.styling.Enable(this.stylingComposite);
            itarate(false);
            this.$(this.container).mousedown(this.containerMousedown); // removable

            this.$(this.document).mouseup(this.documentMouseup); // removable

            this.$(this.selectedPanel).click(this.selectedPanelClick); // removable

            this.$(this.document).mouseup(this.documentMouseup2); // removable
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
        this.filterInput = document.createElement('INPUT'); //$filterInput.get(0);

        this.filterInput.setAttribute("type", "search");
        this.filterInput.setAttribute("autocomplete", "off");
        defFilterInputStyleSys(this.filterInput.style);
        this.filterInputItem.appendChild(this.filterInput);
        this.dropDownMenu = document.createElement('UL');
        this.dropDownMenu.style.display = "none";
        this.container.appendChild(this.dropDownMenu); // prevent heavy understandable styling error

        defDropDownMenuStyleSys(this.dropDownMenu.style);

        this.documentMouseup = function () {
          _this3.skipFocusout = false;
        };

        this.containerMousedown = function () {
          _this3.skipFocusout = true;
        };

        this.documentMouseup2 = function (event) {
          if (!(container === event.target || container.contains(event.target))) {
            // IE8+
            _this3.closeDropDown();
          }
        };

        this.selectedPanelClick = function (jqEvent) {
          if (jqEvent.target.nodeName != "INPUT") // TODO: should be improoved
            {
              _this3.filterInput.value = '';

              _this3.filterInput.focus(); // event.preventDefault()  // TODO: should I use preventDefault this ?  click can move focus...

            }

          if (_this3.hasDropDownVisible && (_this3.ProcessedBySelectedItemContentEvent == null || _this3.ProcessedBySelectedItemContentEvent.originalEvent != jqEvent.originalEvent)) {
            _this3.updateDropDownPosition(true);

            _this3.showDropDown();
          }

          _this3.ProcessedBySelectedItemContentEvent = null;
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

        var createDropDownItems = function createDropDownItems() {
          var options = _this3.optionsAdapter.options;

          for (var i = 0; i < options.length; i++) {
            _this3.appendDropDownItem(options[i]);
          }

          _this3.hasDropDownVisible = options.length > 0;

          _this3.updateDropDownPosition(false);
        }; // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event


        if (this.document.readyState != 'loading') {
          createDropDownItems();
        } else {
          this.document.addEventListener('DOMContentLoaded', createDropDownItems); // IE9+
        } // there was unmotivated stopPropagation call. commented out.
        // $dropDownMenu.click(  event => { 
        //    event.stopPropagation();
        // });


        this.$(this.dropDownMenu).mouseover(function () {
          return _this3.resetDropDownMenuHover();
        });
        this.$(this.filterInput).focusin(function () {
          return _this3.styling.FocusIn(_this3.stylingComposite);
        }).focusout(function () {
          if (!_this3.skipFocusout) _this3.styling.FocusOut(_this3.stylingComposite);
        });
        this.$(this.filterInput).on("keydown", function (event) {
          if ([38, 40, 13].indexOf(event.which) >= 0 || event.which == 9 && _this3.filterInput.value) {
            event.preventDefault();
          }

          if (event.which == 38) {
            _this3.keydownArrow(false);
          } else if (event.which == 40) {
            if (_this3.hoveredDropDownItem === null && _this3.hasDropDownVisible) {
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
              var penultSelectedItem = _this3.filterInputItem.previousElementSibling; // IE9+

              if (penultSelectedItem && penultSelectedItem.MultiSelectData) {
                penultSelectedItem.MultiSelectData.optionRemove();
              }

              _this3.updateDropDownPosition(false);
            }
          }

          if ([38, 40, 13, 9].indexOf(event.which) == -1) _this3.resetDropDownMenuHover();
        });
        this.$(this.filterInput).on("keyup", function (event) {
          if (event.which == 13 || event.which == 9) {
            if (_this3.hoveredDropDownItem) {
              _this3.hoveredDropDownItem.MultiSelectData.optionToggle();

              _this3.closeDropDown();
            } else {
              var text = _this3.filterInput.value.trim().toLowerCase();

              var dropDownItems = _this3.dropDownMenu.querySelectorAll("LI");

              var dropDownItem = null;

              for (var i = 0; i < dropDownItems.length; ++i) {
                var it = dropDownItems[i];

                if (it.textContent.trim().toLowerCase() == text) {
                  dropDownItem = it;
                  break;
                }
              }

              if (dropDownItem) {
                var option = dropDownItem.MultiSelectData.option;

                if (!option.selected) {
                  dropDownItem.MultiSelectData.optionToggle();
                }

                _this3.clearFilterInput(true);
              }
            }
          } else if (event.which == 27) {
            // escape
            _this3.closeDropDown();
          }
        });
        this.$(this.filterInput).on('input', function () {
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

    var defaults = {
      selectedPanelFocusClass: 'focus',
      selectedPanelDisabledClass: 'disabled',
      dropDownItemDisabledClass: 'disabled'
    };

    function Bs4StylingMethodCss(configuration) {
      ExtendIfUndefined(configuration, defaults);
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
    var defaults$1 = {
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
      ExtendIfUndefined(configuration, defaults$1);
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

    var defaults$2 = {
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
      ExtendIfUndefined(configuration, defaults$2);
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

    function Bs4SelectedItemContentStylingMethodCss(configuration) {
      var defaults = {
        selectedItemContentDisabledClass: 'disabled'
      };
      ExtendIfUndefined(configuration, defaults);
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

    function Bs4SelectedItemContentStylingMethodJs(configuration) {
      var defaults = {
        selectedItemContentDisabledOpacity: '.65'
      };
      ExtendIfUndefined(configuration, defaults);
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

    function Bs4SelectedItemContent(stylingMethod, configuration, $) {
      var defaults = {
        selectedItemClass: 'badge',
        removeSelectedItemButtonClass: 'close'
      };
      ExtendIfUndefined(configuration, defaults);
      return function (selectedItem, optionItem, removeSelectedItem) {
        var $selectedItem = $(selectedItem);
        $selectedItem.addClass(configuration.selectedItemClass);
        var $content = $("<span/>").text(optionItem.text);
        $content.appendTo($selectedItem);
        if (optionItem.disabled) stylingMethod.disableSelectedItemContent($content);
        var $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>') // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
        // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
        .css("float", "none").appendTo($selectedItem).addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
        .on("click", function (jqEvent) {
          return removeSelectedItem(jqEvent);
        });
        if (stylingMethod.createSelectedItemContent) stylingMethod.createSelectedItemContent($selectedItem, $button);
        return {
          disable: function disable(isDisabled) {
            $button.prop('disabled', isDisabled);
          }
        };
      };
    }

    function Bs4DropDownItemContentStylingMethodCss(configuration) {
      var defaults = {
        selectedItemContentDisabledClass: 'disabled'
      };
      ExtendIfUndefined(configuration, defaults);
      return {
        disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
          if (isDisbaled) $checkBox.addClass(configuration.dropDownItemDisabledClass);else $checkBox.removeClass(configuration.dropDownItemDisabledClass);
        }
      };
    }

    function Bs4DropDownItemContentStylingMethodJs(configuration) {
      var defaults = {
        selectedItemContentDisabledOpacity: '.65',
        dropdDownLabelDisabledColor: '#6c757d'
      };
      ExtendIfUndefined(configuration, defaults);
      return {
        disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
          $checkBoxLabel.css('color', isDisbaled ? configuration.dropdDownLabelDisabledColor : '');
        }
      };
    }

    function Bs4DropDownItemContent(stylingMethod, configuration, $) {
      var defaults = {
        dropDownItemClass: 'px-2'
      };
      ExtendIfUndefined(configuration, defaults);
      return function (dropDownItem, option) {
        var $dropDownItem = $(dropDownItem);
        $dropDownItem.addClass(configuration.dropDownItemClass);
        var $dropDownItemContent = $("<div class=\"custom-control custom-checkbox\">\n                    <input type=\"checkbox\" class=\"custom-control-input\">\n                    <label class=\"custom-control-label\"></label>\n                </div>");
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

        if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
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
        var adapter = null;
        if (configuration.adapter) adapter = configuration.adapter;else {
          var stylingMethod = configuration.useCss ? Bs4StylingMethodCss(configuration) : Bs4StylingMethodJs(configuration);
          adapter = Bs4Styling(stylingMethod, configuration, $);
        }
        var stylingAdapter2 = configuration.useCss ? Bs4SelectedItemContentStylingMethodCss(configuration) : Bs4SelectedItemContentStylingMethodJs(configuration);
        var stylingAdapter3 = configuration.useCss ? Bs4DropDownItemContentStylingMethodCss(configuration) : Bs4DropDownItemContentStylingMethodJs(configuration);
        var bs4SelectedItemContent = Bs4SelectedItemContent(stylingAdapter2, configuration, $);
        var bs4DropDownItemContent = Bs4DropDownItemContent(stylingAdapter3, configuration, $);

        var createStylingComposite = function createStylingComposite(container, selectedPanel, filterInputItem, filterInput, dropDownMenu) {
          return {
            $container: $(container),
            $selectedPanel: $(selectedPanel),
            $filterInputItem: $(filterInputItem),
            $filterInput: $(filterInput),
            $dropDownMenu: $(dropDownMenu)
          };
        };

        var multiSelect = new MultiSelect(optionsAdapter, adapter, bs4SelectedItemContent, bs4DropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window, $);
        return multiSelect;
      }, $);
    })(window, $);

}));
//# sourceMappingURL=BsMultiSelect.js.map
