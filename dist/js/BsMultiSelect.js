/*!
  * DashboardCode BsMultiSelect v0.4.34-beta (https://dashboardcode.github.io/BsMultiSelect/)
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

    function defFilterInputStyleSys(s) {
      s.border = '0px';
      s.padding = '0px';
      s.outline = 'none';
      s.backgroundColor = 'transparent';
    }

    function FilterPanel(createElement, insertIntoDom, onFocusIn, // show dropdown
    onFocusOut, // hide dropdown
    onKeyDownArrowUp, onKeyDownArrowDown, onTabForEmpty, // tab on empty
    onBackspace, // backspace alike
    onEnterOrTabToCompleate, // "compleate alike"
    onKeyDownEsc, onKeyUpEsc, // "esc" alike
    onInput, // filter
    setEmptyLength) {
      var inputElement = createElement('INPUT');
      inputElement.setAttribute("type", "search");
      inputElement.setAttribute("autocomplete", "off");
      defFilterInputStyleSys(inputElement.style);
      insertIntoDom(inputElement);

      var onfilterInputKeyDown = function onfilterInputKeyDown(event) {
        if ([38, 40, 13, 27].indexOf(event.which) >= 0 || event.which == 9 && inputElement.value) {
          event.preventDefault(); // preventDefault for tab(9) it enables keyup,
          // prevent form default button (13-enter) 
          // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
          // esc(27) there is just in case
        }

        if (event.which == 27) {
          onKeyDownEsc(inputElement.value ? false : true, event); // support BS do not close modal - event.stopPropagation inside
        } else if (event.which == 38) {
          onKeyDownArrowUp();
        } else if (event.which == 40) {
          onKeyDownArrowDown();
        } else if (event.which == 9
        /*tab*/
        ) {
            // no keydown for this
            if (!inputElement.value) {
              onTabForEmpty(); // filter is empty, nothing to reset
            }
          } else if (event.which == 8
        /*backspace*/
        ) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!inputElement.value) {
              onBackspace();
            }
          }
      };

      var onFilterInputKeyUp = function onFilterInputKeyUp(event) {
        if (event.which == 13 || event.which == 9) {
          onEnterOrTabToCompleate();
        } else if (event.which == 27) {
          // escape
          onKeyUpEsc(); // is it always empty (bs x can still it) 
        }
      }; // it can be initated by 3PP functionality
      // sample (1) BS functionality - input x button click - clears input
      // sample (2) BS functionality - esc keydown - clears input
      // and there could be difference in processing: (2) should hide the menu, then reset , when (1) should just reset without hiding.


      var onFilterInputInput = function onFilterInputInput() {
        var filterInputValue = inputElement.value;
        onInput(filterInputValue, function () {
          return inputElement.style.width = filterInputValue.length * 1.3 + 2 + "ch";
        });
      };

      inputElement.addEventListener('focusin', onFocusIn);
      inputElement.addEventListener('focusout', onFocusOut);
      inputElement.addEventListener('keydown', onfilterInputKeyDown);
      inputElement.addEventListener('keyup', onFilterInputKeyUp);
      inputElement.addEventListener('input', onFilterInputInput); // function setEmptyLength(){
      //     inputElement.style.width= "100%"; //--"1rem";
      // }
      //setEmptyLength();

      function setEmpty() {
        inputElement.value = '';
        setEmptyLength();
      }
      return {
        inputElement: inputElement,
        isEmpty: function isEmpty() {
          return inputElement.value ? false : true;
        },
        setEmpty: setEmpty,
        setEmptyLength: setEmptyLength,
        setFocus: function setFocus() {
          inputElement.focus();
        },
        isEventTarget: function isEventTarget(event) {
          return event.target == inputElement;
        },
        dispose: function dispose() {
          inputElement.removeEventListener('focusin', onFocusIn);
          inputElement.removeEventListener('focusout', onFocusOut);
          inputElement.removeEventListener('keydown', onfilterInputKeyDown);
          inputElement.removeEventListener('keyup', onFilterInputKeyUp);
          inputElement.removeEventListener('input', onFilterInputInput);
        }
      };
    }

    function defDropDownMenuStyleSys(s) {
      s.listStyleType = 'none';
    }

    function OptionsPanel(createElement, dropDownMenu, onShow, onHide, eventSkipper, dropDownItemContent, styling, getVisibleMultiSelectDataList, resetFilter, updateDropDownLocation, filterPanelSetFocus) {
      // prevent heavy understandable styling error
      defDropDownMenuStyleSys(dropDownMenu.style);
      var hoveredMultiSelectData = null;
      var hoveredMultiSelectDataIndex = null;
      var candidateToHoveredMultiSelectData = null;

      function hideDropDown() {
        if (candidateToHoveredMultiSelectData) {
          resetCandidateToHoveredMultiSelectData();
        }

        if (dropDownMenu.style.display != 'none') {
          dropDownMenu.style.display = 'none';
          onHide();
        }
      }

      function showDropDown() {
        if (dropDownMenu.style.display != 'block') {
          eventSkipper.setSkippable();
          dropDownMenu.style.display = 'block';
          onShow();
        }
      }

      var hoverInInternal = function hoverInInternal(index) {
        hoveredMultiSelectDataIndex = index;
        hoveredMultiSelectData = getVisibleMultiSelectDataList()[index];
        styling.HoverIn(hoveredMultiSelectData.dropDownMenuItemElement);
      };

      function resetDropDownMenuHover() {
        if (hoveredMultiSelectData) {
          styling.HoverOut(hoveredMultiSelectData.dropDownMenuItemElement);
          hoveredMultiSelectData = null;
          hoveredMultiSelectDataIndex = null;
        }
      }

      var resetCandidateToHoveredMultiSelectData = function resetCandidateToHoveredMultiSelectData() {
        candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousemove', processCandidateToHovered);
        candidateToHoveredMultiSelectData.dropDownMenuItemElement.removeEventListener('mousedown', processCandidateToHovered);
        candidateToHoveredMultiSelectData = null;
      };

      var processCandidateToHovered = function processCandidateToHovered() {
        if (hoveredMultiSelectData != candidateToHoveredMultiSelectData) {
          resetDropDownMenuHover();
          hoverInInternal(candidateToHoveredMultiSelectData.visibleIndex);
        }

        if (candidateToHoveredMultiSelectData) resetCandidateToHoveredMultiSelectData();
      };

      function toggleHovered() {
        if (hoveredMultiSelectData) {
          hoveredMultiSelectData.toggle();
          resetDropDownMenuHover();
          hideDropDown(); // always hide 1st

          resetFilter();
        }
      }

      function keyDownArrow(down) {
        var visibleMultiSelectDataList = getVisibleMultiSelectDataList();
        var length = visibleMultiSelectDataList.length;
        var newIndex = null;

        if (length > 0) {
          if (down) {
            var i = hoveredMultiSelectDataIndex == null ? 0 : hoveredMultiSelectDataIndex + 1;

            while (i < length) {
              if (visibleMultiSelectDataList[i].visible) {
                newIndex = i;
                break;
              }

              i++;
            }
          } else {
            var _i = hoveredMultiSelectDataIndex == null ? length - 1 : hoveredMultiSelectDataIndex - 1;

            while (_i >= 0) {
              if (visibleMultiSelectDataList[_i].visible) {
                newIndex = _i;
                break;
              }

              _i--;
            }
          }
        }

        if (newIndex != null) {
          if (hoveredMultiSelectData) styling.HoverOut(hoveredMultiSelectData.dropDownMenuItemElement);
          updateDropDownLocation();
          showDropDown();
          hoverInInternal(newIndex);
        }
      }

      var onDropDownMenuItemElementMouseoverGeneral = function onDropDownMenuItemElementMouseoverGeneral(MultiSelectData, dropDownMenuItemElement) {
        if (eventSkipper.isSkippable()) {
          if (candidateToHoveredMultiSelectData) resetCandidateToHoveredMultiSelectData();
          candidateToHoveredMultiSelectData = MultiSelectData;
          dropDownMenuItemElement.addEventListener('mousemove', processCandidateToHovered);
          dropDownMenuItemElement.addEventListener('mousedown', processCandidateToHovered);
        } else {
          if (hoveredMultiSelectData != MultiSelectData) {
            // mouseleave is not enough to guarantee remove hover styles in situations
            // when style was setuped without mouse (keyboard arrows)
            // therefore force reset manually
            resetDropDownMenuHover();
            hoverInInternal(MultiSelectData.visibleIndex);
          }
        }
      };

      function insertDropDownItem(MultiSelectData, createSelectedItemGen, setSelected, triggerChange, isSelected, isOptionDisabled) {
        var dropDownMenuItemElement = createElement('LI'); // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous

        var onDropDownMenuItemElementMouseover = function onDropDownMenuItemElementMouseover() {
          return onDropDownMenuItemElementMouseoverGeneral(MultiSelectData, dropDownMenuItemElement);
        };

        dropDownMenuItemElement.addEventListener('mouseover', onDropDownMenuItemElementMouseover); // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work

        var onDropDownMenuItemElementMouseleave = function onDropDownMenuItemElementMouseleave() {
          if (!eventSkipper.isSkippable()) {
            resetDropDownMenuHover();
          }
        };

        dropDownMenuItemElement.addEventListener('mouseleave', onDropDownMenuItemElementMouseleave);
        dropDownMenu.appendChild(dropDownMenuItemElement);
        var content = dropDownItemContent(dropDownMenuItemElement, MultiSelectData.option);
        MultiSelectData.dropDownMenuItemElement = dropDownMenuItemElement;
        MultiSelectData.DropDownItemContent = content;

        MultiSelectData.DisposeDropDownMenuItemElement = function () {
          dropDownMenuItemElement.removeEventListener('mouseover', onDropDownMenuItemElementMouseover);
          dropDownMenuItemElement.removeEventListener('mouseleave', onDropDownMenuItemElementMouseleave);
        };

        var setDropDownItemContentDisabled = function setDropDownItemContentDisabled(content, isSelected) {
          content.disabledStyle(true); // do not desable if selected! there should be possibility to unselect "disabled"

          content.disable(!isSelected);
        };

        if (isOptionDisabled) setDropDownItemContentDisabled(content, isSelected);
        content.onSelected(function () {
          MultiSelectData.toggle();
          filterPanelSetFocus();
        }); // ------------------------------------------------------------------------------

        var createSelectedItem = function createSelectedItem() {
          return createSelectedItemGen(MultiSelectData, isOptionDisabled, function () {
            return setDropDownItemContentDisabled(content, false);
          });
        };

        if (isSelected) {
          createSelectedItem();
        } else {
          MultiSelectData.excludedFromSearch = isOptionDisabled;
          if (isOptionDisabled) MultiSelectData.toggle = function () {};else MultiSelectData.toggle = function () {
            var confirmed = setSelected(MultiSelectData.option, true);

            if (confirmed == null || confirmed) {
              createSelectedItem();
              triggerChange();
            }
          };
        } // TODO: refactore it

      }

      var item = {
        hoverInInternal: hoverInInternal,
        stopAndResetDropDownMenuHover: function stopAndResetDropDownMenuHover() {
          eventSkipper.setSkippable(); //disable Hover On MouseEnter - filter's changes should remove hover

          resetDropDownMenuHover();
        },
        showDropDown: showDropDown,
        hideDropDown: hideDropDown,
        toggleHovered: toggleHovered,
        keyDownArrow: keyDownArrow,
        insertDropDownItem: insertDropDownItem,
        getIsVisble: function getIsVisble() {
          return dropDownMenu.style.display != 'none';
        }
      };
      return item;
    }

    function removeElement(e) {
      e.parentNode.removeChild(e);
    }

    function defSelectedPanelStyleSys(s) {
      s.display = 'flex';
      s.flexWrap = 'wrap';
      s.listStyleType = 'none';
    }

    function PicksPanel(setSelected, createElement, picksElement, init, selectedItemContent, isComponentDisabled, triggerChange, onRemove, onClick, onPicksEmptyChanged, //placeholderAspect.updatePlacehodlerVisibility(); call the same on enable/disable
    processRemoveButtonClick) {
      var picksCount = 0;

      function inc() {
        picksCount++;
        if (picksCount == 1) onPicksEmptyChanged();
      }

      function dec() {
        picksCount--;
        if (picksCount == 0) onPicksEmptyChanged();
      }

      function reset() {
        picksCount = 0;
        onPicksEmptyChanged();
      }

      function isEmpty() {
        return picksCount == 0;
      }
      defSelectedPanelStyleSys(picksElement.style);
      var inputItemElement = createElement('LI'); // detached

      picksElement.appendChild(inputItemElement); // located filter in selectionsPanel

      init(inputItemElement);
      var MultiSelectDataSelectedTail = null;

      function removeSelectedTail() {
        if (MultiSelectDataSelectedTail) {
          MultiSelectDataSelectedTail.toggle(); // always remove in this case
        }
      }

      function removeSelectedFromList(MultiSelectData) {
        if (MultiSelectData.selectedPrev) {
          MultiSelectData.selectedPrev.selectedNext = MultiSelectData.selectedNext;
        }

        if (MultiSelectData.selectedNext) {
          MultiSelectData.selectedNext.selectedPrev = MultiSelectData.selectedPrev;
        }

        if (MultiSelectDataSelectedTail == MultiSelectData) {
          MultiSelectDataSelectedTail = MultiSelectData.selectedPrev;
        }

        MultiSelectData.selectedNext = null;
        MultiSelectData.selectedPrev = null;
      }

      function createSelectedItem(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled) {
        var selectedItemElement = createElement('LI');
        MultiSelectData.selectedItemElement = selectedItemElement;

        if (MultiSelectDataSelectedTail) {
          MultiSelectDataSelectedTail.selectedNext = MultiSelectData;
          MultiSelectData.selectedPrev = MultiSelectDataSelectedTail;
        }

        MultiSelectDataSelectedTail = MultiSelectData;

        var removeSelectedItem = function removeSelectedItem() {
          var confirmed = setSelected(MultiSelectData.option, false);

          if (confirmed == null || confirmed) {
            MultiSelectData.excludedFromSearch = isOptionDisabled;

            if (isOptionDisabled) {
              setDropDownItemContentDisabled(MultiSelectData.DropDownItemContent, false);

              MultiSelectData.toggle = function () {};
            } else {
              MultiSelectData.toggle = function () {
                var confirmed = setSelected(MultiSelectData.option, true);

                if (confirmed == null || confirmed) {
                  createSelectedItem(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled);
                  triggerChange();
                }
              };
            }

            MultiSelectData.DropDownItemContent.select(false);
            removeElement(selectedItemElement);
            MultiSelectData.SelectedItemContent.dispose();
            MultiSelectData.SelectedItemContent = null;
            MultiSelectData.selectedItemElement = null;
            removeSelectedFromList(MultiSelectData);
            dec();
            triggerChange();
          }
        }; // processRemoveButtonClick removes the 
        // what is a problem with calling removeSelectedItem directly (not using  setTimeout(removeSelectedItem, 0)):
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


        var removeSelectedItemAndCloseDropDown = function removeSelectedItemAndCloseDropDown() {
          removeSelectedItem();
          onRemove();
        };

        var onRemoveSelectedItemEvent = function onRemoveSelectedItemEvent(event) {
          processRemoveButtonClick(function () {
            return removeSelectedItemAndCloseDropDown();
          }, event);
        };

        MultiSelectData.SelectedItemContent = selectedItemContent(selectedItemElement, MultiSelectData.option, onRemoveSelectedItemEvent);

        var disable = function disable(isDisabled) {
          return MultiSelectData.SelectedItemContent.disable(isDisabled);
        };

        disable(isComponentDisabled);
        MultiSelectData.excludedFromSearch = true; // all selected excluded from search

        MultiSelectData.disable = disable;
        picksElement.insertBefore(selectedItemElement, inputItemElement);

        MultiSelectData.toggle = function () {
          return removeSelectedItem();
        };

        MultiSelectData.DropDownItemContent.select(true);
        inc();
      }

      var selectedPanelClick = function selectedPanelClick(event) {
        onClick(event);
      };

      function iterateAll(isDisabled) {
        var i = MultiSelectDataSelectedTail;

        while (i) {
          i.disable(isDisabled);
          i = i.selectedPrev;
        }
      }

      var item = {
        inputItemElement: inputItemElement,
        insert: function insert(selectedItemElement) {
          this.selectedPanel.insertBefore(selectedItemElement, inputItemElement);
        },
        createSelectedItem: createSelectedItem,
        removeSelectedTail: removeSelectedTail,
        resetMultiSelectDataSelectedTail: function resetMultiSelectDataSelectedTail() {
          reset();
          MultiSelectDataSelectedTail = null;
        },
        isEmpty: isEmpty,
        enable: function enable() {
          isComponentDisabled = false;
          iterateAll(false);
          picksElement.addEventListener("click", selectedPanelClick);
        },
        disable: function disable() {
          isComponentDisabled = true;
          iterateAll(true);
          picksElement.removeEventListener("click", selectedPanelClick);
        },
        dispose: function dispose() {
          var toRemove = picksElement.firstChild;

          while (toRemove) {
            picksElement.removeChild(toRemove);
            toRemove = picksElement.firstChild;
          }

          picksElement.removeEventListener("click", selectedPanelClick); // OPEN dropdown
        }
      };
      return item;
    }

    function MultiSelectInputAspect(window, appendToContainer, filterInputItem, picksElement, optionsElement, showDropDown, hideDropDownAndResetFilter, isDropDownMenuEmpty, Popper) {
      appendToContainer();
      var document = window.document;
      var skipFocusout = false; // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container

      var skipoutMousedown = function skipoutMousedown() {
        skipFocusout = true;
      };

      var documentMouseup = function documentMouseup(event) {
        // if click outside container - close dropdown
        if (!(optionsElement === event.target || picksElement === event.target || optionsElement.contains(event.target) || picksElement.contains(event.target))) {
          hideDropDownAndResetFilter();
        }
      };

      var popper = new Popper(filterInputItem, optionsElement, {
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
      var filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

      var preventDefaultClickEvent = null;

      function alignAndShowDropDown(event) {
        if (preventDefaultClickEvent != event) {
          if (!isDropDownMenuEmpty()) {
            alignToFilterInputItemLocation(true);
            showDropDown();
          }
        }

        preventDefaultClickEvent = null;
      }

      function alignToFilterInputItemLocation(force) {
        var offsetLeft = filterInputItem.offsetLeft;

        if (force || filterInputItemOffsetLeft != offsetLeft) {
          // position changed
          popper.update();
          filterInputItemOffsetLeft = offsetLeft;
        }
      }

      return {
        dispose: function dispose() {
          popper.destroy();
        },
        alignToFilterInputItemLocation: alignToFilterInputItemLocation,
        alignAndShowDropDown: alignAndShowDropDown,
        processUncheck: function processUncheck(uncheckOption, event) {
          // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
          // never remove elements in the same event iteration
          window.setTimeout(function () {
            return uncheckOption();
          }, 0);
          preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
        },
        onDropDownShow: function onDropDownShow() {
          // add listeners that manages close dropdown on input's focusout and click outside container
          //container.removeEventListener("mousedown", containerMousedown);
          picksElement.addEventListener("mousedown", skipoutMousedown);
          optionsElement.addEventListener("mousedown", skipoutMousedown);
          document.addEventListener("mouseup", documentMouseup);
        },
        onDropDownHide: function onDropDownHide() {
          picksElement.removeEventListener("mousedown", skipoutMousedown);
          optionsElement.addEventListener("mousedown", skipoutMousedown);
          document.removeEventListener("mouseup", documentMouseup);
        },
        getSkipFocusout: function getSkipFocusout() {
          return skipFocusout;
        },
        resetSkipFocusout: function resetSkipFocusout() {
          skipFocusout = false;
        }
      };
    }

    function PlaceholderAsInputAspect(placeholderText, picksIsEmpty, filterIsEmpty, picksElement, inputElement) {
      function setEmptyInputWidth(isVisible) {
        if (isVisible) inputElement.style.width = "100%";else inputElement.style.width = "2ch";
      }

      function showPlacehodler(isVisible) {
        if (isVisible) {
          inputElement.placeholder = placeholderText ? placeholderText : "";
          picksElement.style.display = "block";
        } else {
          inputElement.placeholder = "";
          picksElement.style.display = "flex";
        }

        setEmptyInputWidth(isVisible);
      }

      showPlacehodler(true);
      return {
        init: function init() {},
        updatePlacehodlerVisibility: function updatePlacehodlerVisibility() {
          showPlacehodler(picksIsEmpty() && filterIsEmpty());
        },
        updateEmptyInputWidth: function updateEmptyInputWidth() {
          setEmptyInputWidth(picksIsEmpty() && filterIsEmpty());
        },
        setDisabled: function setDisabled(isDisabled) {
          inputElement.disabled = isDisabled;
        }
      };
    }

    function EventSkipper(window) {
      var _isSkippable = false;
      return {
        isSkippable: function isSkippable() {
          return _isSkippable;
        },
        setSkippable: function setSkippable() {
          _isSkippable = true;
          window.setTimeout(function () {
            _isSkippable = false;
          }, 0);
        }
      };
    }

    function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
      MultiSelectData.visible = isFiltered;
      MultiSelectData.visibleIndex = visibleIndex;
      MultiSelectData.dropDownMenuItemElement.style.display = isFiltered ? 'block' : 'none';
    }

    function resetDropDownMenu(MultiSelectDataList) {
      for (var i = 0; i < MultiSelectDataList.length; i++) {
        var multiSelectData = MultiSelectDataList[i];

        if (!multiSelectData.isHidden) {
          filterMultiSelectData(multiSelectData, true, i);
        }
      }
    }

    function collectFilterDropDownMenu(MultiSelectDataList, text) {
      var list = [];
      var j = 0;

      for (var i = 0; i < MultiSelectDataList.length; i++) {
        var multiSelectData = MultiSelectDataList[i];

        if (!multiSelectData.isHidden) {
          if (multiSelectData.excludedFromSearch || multiSelectData.searchText.indexOf(text) < 0) {
            filterMultiSelectData(multiSelectData, false);
          } else {
            filterMultiSelectData(multiSelectData, true, j++);
            list.push(multiSelectData);
          }
        }
      }

      return list;
    }

    var MultiSelect =
    /*#__PURE__*/
    function () {
      function MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, window) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
        }

        this.onUpdate = onUpdate;
        this.onDispose = onDispose; // readonly

        this.optionsAdapter = optionsAdapter;
        this.containerAdapter = containerAdapter;
        this.styling = styling;
        this.selectedItemContent = selectedItemContent;
        this.dropDownItemContent = dropDownItemContent;
        this.labelAdapter = labelAdapter;
        this.createStylingComposite = createStylingComposite;
        this.configuration = configuration;
        this.placeholderText = placeholderText;
        this.setSelected = setSelected; // should I rebind this for callbacks? setSelected.bind(this);

        this.window = window;
        this.visibleCount = 10;
        this.optionsPanel = null;
        this.stylingComposite = null;
        this.isComponentDisabled = null;
        this.resetMultiSelectDataList();
      }

      var _proto = MultiSelect.prototype;

      _proto.resetMultiSelectDataList = function resetMultiSelectDataList() {
        this.MultiSelectDataList = [];
        this.filteredMultiSelectDataList = null;
      };

      _proto.getVisibleMultiSelectDataList = function getVisibleMultiSelectDataList() {
        if (this.filteredMultiSelectDataList) return this.filteredMultiSelectDataList;else return this.MultiSelectDataList;
      };

      _proto.resetFilter = function resetFilter() {
        if (!this.filterPanel.isEmpty()) {
          this.filterPanel.setEmpty();
          this.processEmptyInput();
          this.placeholderAspect.updatePlacehodlerVisibility();
        }
      };

      _proto.processEmptyInput = function processEmptyInput() {
        this.filterPanel.setEmptyLength();
        resetDropDownMenu(this.MultiSelectDataList);
        this.filteredMultiSelectDataList = null;
      } // -----------------------------------------------------------------------------------------------------------------------
      ;

      _proto.GetContainer = function GetContainer() {
        return this.containerAdapter.container;
      };

      _proto.Update = function Update() {
        this.onUpdate();
        this.UpdateDisabled();
        this.UpdateData();
      }
      /*
      UpdateOption(index){
          let multiSelectData = this.MultiSelectDataList[index];
          let option = multiSelectData.option;
          multiSelectData.searchText = option.text.toLowerCase().trim();
          if (multiSelectData.isHidden != option.isHidden)
          {
              multiSelectData.isHidden=option.isHidden;
              if (multiSelectData.isHidden)
                  this.optionsPanel.insertDropDownItem(multiSelectData, 
                      (p1,p2,p3)=>this.picksPanel.createSelectedItem(p1,p2,p3),
                      ()=>this.optionsAdapter.triggerChange(),
                      option.isSelected, option.isDisabled);
              else
                  multiSelectData.removeDropDownMenuItemElement();
          }
          else 
          {
              if (multiSelectData.isSelected != option.isSelected)
              {
                  multiSelectData.isSelected=option.isSelected;
                  if (multiSelectData.isSelected)
                  {
                      // this.insertDropDownItem(multiSelectData, (e)=>this.dropDownMenu.appendChild(e), isSelected, isDisabled);
                  }
                  else
                  {
                      // multiSelectData.removeDropDownMenuItemElement();
                  }
              }
              if (multiSelectData.isDisabled != option.isDisabled)
              {
                  multiSelectData.isDisabled=option.isDisabled;
                  if (multiSelectData.isDisabled)
                  {
                      // this.insertDropDownItem(multiSelectData, (e)=>this.dropDownMenu.appendChild(e), isSelected, isDisabled);
                  }
                  else
                  {
                      // multiSelectData.removeDropDownMenuItemElement();
                  }
              }
          }    
          //multiSelectData.updateOption();
      }*/
      ;

      _proto.DeselectAll = function DeselectAll() {
        this.optionsPanel.hideDropDown(); // always hide 1st

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (multiSelectData.selectedItemElement) multiSelectData.toggle();
        }

        this.resetFilter();
      };

      _proto.SelectAll = function SelectAll() {
        this.optionsPanel.hideDropDown(); // always hide 1st

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (!multiSelectData.excludedFromSearch) multiSelectData.toggle();
        }

        this.resetFilter();
      };

      _proto.empty = function empty() {
        // close drop down , remove filter and listeners
        this.optionsPanel.hideDropDown(); // always hide 1st

        this.resetFilter();

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (multiSelectData.dropDownMenuItemElement) removeElement(multiSelectData.dropDownMenuItemElement);
          if (multiSelectData.selectedItemElement) removeElement(multiSelectData.selectedItemElement);
        }

        this.resetMultiSelectDataList();
        this.picksPanel.resetMultiSelectDataSelectedTail(); // this.MultiSelectDataSelectedTail = null;
      };

      _proto.UpdateData = function UpdateData() {
        this.empty(); // reinitiate

        this.updateDataImpl();
      };

      _proto.updateDataImpl = function updateDataImpl() {
        var _this = this;

        var createDropDownItems = function createDropDownItems() {
          var options = _this.optionsAdapter.getOptions();

          for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var isSelected = option.selected;
            var isDisabled = option.disabled ? option.disabled : false;
            var isHidden = option.hidden ? option.hidden : false;
            var MultiSelectData = {
              searchText: option.text.toLowerCase().trim(),
              excludedFromSearch: isSelected || isDisabled || isHidden,
              option: option,
              isHidden: isHidden,
              dropDownMenuItemElement: null,
              dropDownItemContent: null,
              selectedPrev: null,
              selectedNext: null,
              visible: false,
              toggle: null,
              selectedItemElement: null,
              remove: null,
              disable: null,
              removeDropDownMenuItemElement: null
            };

            _this.MultiSelectDataList.push(MultiSelectData);

            if (!isHidden) {
              MultiSelectData.visible = true;
              MultiSelectData.visibleIndex = i;

              _this.optionsPanel.insertDropDownItem(MultiSelectData, function (p1, p2, p3) {
                return _this.picksPanel.createSelectedItem(p1, p2, p3);
              }, function (o, i) {
                return _this.setSelected(o, i);
              }, function () {
                return _this.optionsAdapter.triggerChange();
              }, isSelected, isDisabled);
            }
          }

          _this.aspect.alignToFilterInputItemLocation(false); //this.placeholderAspect.updatePlacehodlerVisibility();

        }; // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event


        if (document.readyState != 'loading') {
          createDropDownItems();
        } else {
          var createDropDownItemsHandler = function createDropDownItemsHandler() {
            createDropDownItems();
            document.removeEventListener("DOMContentLoaded", createDropDownItemsHandler);
          };

          document.addEventListener('DOMContentLoaded', createDropDownItemsHandler); // IE9+
        }
      };

      _proto.Dispose = function Dispose() {
        if (this.onDispose) this.onDispose(); // primary used to remove from jQuery tables
        // remove event listeners
        // TODO check if open

        this.optionsPanel.hideDropDown();
        if (this.optionsAdapter.dispose) this.optionsAdapter.dispose();
        this.picksPanel.dispose();
        this.filterPanel.dispose();
        this.labelAdapter.dispose();
        this.aspect.dispose();
        this.containerAdapter.dispose();

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          multiSelectData.toggle = null;
          multiSelectData.remove = null;
          multiSelectData.removeDropDownMenuItemElement = null;
          if (multiSelectData.DisposeDropDownMenuItemElement) multiSelectData.DisposeDropDownMenuItemElement();
          if (multiSelectData.SelectedItemContent) multiSelectData.SelectedItemContent.dispose();
          if (multiSelectData.DropDownItemContent) multiSelectData.DropDownItemContent.dispose();
        }
      };

      _proto.UpdateDisabled = function UpdateDisabled() {
        var isComponentDisabled = this.optionsAdapter.getDisabled();

        if (this.isComponentDisabled !== isComponentDisabled) {
          if (isComponentDisabled) {
            this.picksPanel.disable();
            this.placeholderAspect.setDisabled(true);
            this.styling.Disable(this.stylingComposite);
          } else {
            this.picksPanel.enable();
            this.placeholderAspect.setDisabled(false);
            this.styling.Enable(this.stylingComposite);
          }

          this.isComponentDisabled = isComponentDisabled;
        }
      };

      _proto.input = function input(filterInputValue, resetLength) {
        var text = filterInputValue.trim().toLowerCase();
        var isEmpty = false;
        if (text == '') isEmpty = true;else {
          // check if exact match, otherwise new search
          this.filteredMultiSelectDataList = collectFilterDropDownMenu(this.MultiSelectDataList, text);

          if (this.filteredMultiSelectDataList.length == 1) {
            var fullMatchMultiSelectData = this.filteredMultiSelectDataList[0];

            if (fullMatchMultiSelectData.searchText == text) {
              fullMatchMultiSelectData.toggle();
              this.filterPanel.setEmpty(); // clear

              isEmpty = true;
            }
          }
        }
        if (isEmpty) this.processEmptyInput();else resetLength();
        this.optionsPanel.stopAndResetDropDownMenuHover();

        if (this.getVisibleMultiSelectDataList().length == 1) {
          this.optionsPanel.hoverInInternal(0);
        }

        if (this.getVisibleMultiSelectDataList().length > 0) {
          this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

          this.optionsPanel.showDropDown();
        } else {
          this.optionsPanel.hideDropDown();
        }
      };

      _proto.init = function init() {
        var _this2 = this;

        var document = this.window.document;

        var createElement = function createElement(name) {
          return document.createElement(name);
        };

        var container = this.containerAdapter.container;
        var lazyfilterItemInputElementAtach = null;
        this.filterPanel = FilterPanel(createElement, function (filterItemInputElement) {
          lazyfilterItemInputElementAtach = function lazyfilterItemInputElementAtach(filterItemElement) {
            filterItemElement.appendChild(filterItemInputElement);

            _this2.labelAdapter.init(filterItemInputElement);
          };
        }, function () {
          _this2.styling.FocusIn(_this2.stylingComposite);
        }, // focus in - show dropdown
        function () {
          if (!_this2.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
            {
              _this2.resetFilter(); // if do not do this we will return to filtered list without text filter in input


              _this2.styling.FocusOut(_this2.stylingComposite);
            }

          _this2.aspect.resetSkipFocusout();
        }, // focus out - hide dropdown
        function () {
          return _this2.optionsPanel.keyDownArrow(false);
        }, // arrow up
        function () {
          return _this2.optionsPanel.keyDownArrow(true);
        }, // arrow down
        function () {
          return _this2.optionsPanel.hideDropDown();
        }, // tab on empty
        function () {
          _this2.picksPanel.removeSelectedTail();

          _this2.aspect.alignToFilterInputItemLocation(false);
        }, // backspace - "remove last"
        function () {
          if (_this2.optionsPanel.getIsVisble()) _this2.optionsPanel.toggleHovered();
        }, // tab/enter "compleate hovered"
        function (isEmpty, event) {
          if (!isEmpty || _this2.optionsPanel.getIsVisble()) // supports bs modal - stop esc (close modal) propogation
            event.stopPropagation();
        }, // esc keydown
        function () {
          _this2.optionsPanel.hideDropDown(); // always hide 1st


          _this2.resetFilter();
        }, // esc keyup 
        function (filterInputValue, resetLength) {
          _this2.placeholderAspect.updatePlacehodlerVisibility();

          _this2.input(filterInputValue, resetLength);
        }, // filter
        function () {
          _this2.placeholderAspect.updateEmptyInputWidth();
        });
        this.picksPanel = PicksPanel(this.setSelected, createElement, this.containerAdapter.picksElement, function (filterItemElement) {
          lazyfilterItemInputElementAtach(filterItemElement);
        }, this.selectedItemContent, this.isComponentDisabled, function () {
          return _this2.optionsAdapter.triggerChange();
        }, function () {
          _this2.optionsPanel.hideDropDown(); // always hide 1st


          _this2.resetFilter();
        }, function (event) {
          if (!_this2.filterPanel.isEventTarget(event)) _this2.filterPanel.setFocus();

          _this2.aspect.alignAndShowDropDown(event);
        }, function () {
          return _this2.placeholderAspect.updatePlacehodlerVisibility();
        }, function (doUncheck, event) {
          _this2.aspect.processUncheck(doUncheck, event);
        });
        this.optionsPanel = OptionsPanel(createElement, this.containerAdapter.optionsElement, function () {
          return _this2.aspect.onDropDownShow();
        }, function () {
          return _this2.aspect.onDropDownHide();
        }, EventSkipper(this.window), this.dropDownItemContent, this.styling, function () {
          return _this2.getVisibleMultiSelectDataList();
        }, function () {
          return _this2.resetFilter();
        }, function () {
          return _this2.aspect.alignToFilterInputItemLocation(true);
        }, function () {
          return _this2.filterPanel.setFocus();
        }); // this.placeholderAspect = PlaceholderAsElementAspect(
        //     this.placeholderText, 
        //     () => this.picksPanel.isEmpty(),
        //     () => this.filterPanel.isEmpty(), 
        //     this.containerAdapter.picksElement,
        //     this.filterPanel.inputElement, 
        //     createElement, 
        //     ()=>this.isComponentDisabled,
        //     this.picksPanel.inputItemElement);

        this.placeholderAspect = PlaceholderAsInputAspect(this.placeholderText, function () {
          return _this2.picksPanel.isEmpty();
        }, function () {
          return _this2.filterPanel.isEmpty();
        }, this.containerAdapter.picksElement, this.filterPanel.inputElement);
        this.placeholderAspect.init();
        this.placeholderAspect.updateEmptyInputWidth();
        this.aspect = MultiSelectInputAspect(this.window, function () {
          return _this2.containerAdapter.appendToContainer();
        }, this.picksPanel.inputItemElement, this.containerAdapter.picksElement, this.containerAdapter.optionsElement, function () {
          return _this2.optionsPanel.showDropDown();
        }, function () {
          _this2.optionsPanel.hideDropDown();

          _this2.resetFilter();
        }, function () {
          return _this2.getVisibleMultiSelectDataList().length == 0;
        }, Popper);
        this.stylingComposite = this.createStylingComposite(container, this.containerAdapter.picksElement, this.picksPanel.placeholderItemElement, this.picksPanel.inputItemElement, this.filterPanel.inputElement, this.containerAdapter.optionsElement);
        this.styling.Init(this.stylingComposite);
        this.containerAdapter.attachContainer();
        this.onUpdate();
        this.UpdateDisabled(); // should be done after updateDataImpl

        this.updateDataImpl();
        if (this.optionsAdapter.subscribeToReset) this.optionsAdapter.subscribeToReset(function () {
          return _this2.window.setTimeout(function () {
            return _this2.UpdateData();
          });
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

    function OptionsAdapterElement(selectElement, getDisabled, getSize, getIsValid, getIsInvalid, trigger, form) {
      var backup;
      return {
        getOptions: function getOptions() {
          return selectElement.getElementsByTagName('OPTION');
        },
        triggerChange: function triggerChange() {
          trigger('change');
          trigger('multiselect:change');
        },
        getDisabled: getDisabled,
        getSize: getSize,
        getIsValid: getIsValid,
        getIsInvalid: getIsInvalid,
        subscribeToReset: function subscribeToReset(handler) {
          backup = handler;
          if (form) form.addEventListener('reset', backup);
        },
        dispose: function dispose() {
          if (form && backup) form.removeEventListener('reset', backup);
        }
      };
    }

    function OptionsAdapterJson(options, _getDisabled, _getSize, _getIsValid, _getIsInvalid, trigger) {
      return {
        getOptions: function getOptions() {
          return options;
        },
        triggerChange: function triggerChange() {
          trigger('multiselect:change');
        },
        getDisabled: function getDisabled() {
          return _getDisabled ? _getDisabled() : false;
        },
        getSize: function getSize() {
          return _getSize ? _getSize() : null;
        },
        getIsValid: function getIsValid() {
          return _getIsValid ? _getIsValid() : false;
        },
        getIsInvalid: function getIsInvalid() {
          return _getIsInvalid ? _getIsInvalid() : false;
        }
      };
    }

    function ExtendIfUndefined(destination, source) {
      for (var property in source) {
        if (destination[property] === undefined) destination[property] = source[property];
      }
    }

    function addClass(element, classes) {
      modifyClass(classes, function (e) {
        return element.classList.add(e);
      });
    }
    function removeClass(element, classes) {
      modifyClass(classes, function (e) {
        return element.classList.remove(e);
      });
    }

    function modifyClass(classes, modify) {
      if (classes) {
        if (Array.isArray(classes)) classes.forEach(function (e) {
          return modify(e);
        });else {
          var array = classes.split(" ");
          array.forEach(function (e) {
            return modify(e);
          });
        }
      }
    }

    var bs4StylingMethodCssDefaults = {
      selectedPanelFocusClass: 'focus',
      selectedPanelDisabledClass: 'disabled' //,
      //dropDownItemDisabledClass: 'disabled'

    };

    function Bs4StylingMethodCss(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults);
      return {
        Enable: function Enable(selectedPanel) {
          removeClass(selectedPanel, configuration.selectedPanelDisabledClass);
        },
        Disable: function Disable(selectedPanel) {
          addClass(selectedPanel, configuration.selectedPanelDisabledClass);
        },
        FocusIn: function FocusIn(selectedPanel) {
          addClass(selectedPanel, configuration.selectedPanelFocusClass);
        },
        FocusOut: function FocusOut(selectedPanel) {
          removeClass(selectedPanel, configuration.selectedPanelFocusClass);
        }
      };
    }

    function defSelectedPanelStyle(e) {
      e.style.marginBottom = 0;
      e.style.height = 'auto';
    }
    var bs4StylingMethodJsDefaults = {
      selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
      selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
      selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
      selectedPanelDisabledBackgroundColor: '#e9ecef',
      selectedPanelFocusBorderColor: '#80bdff',
      selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
      selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
      selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
      filterInputColor: 'inherit',
      //'#495057',
      filterInputFontWeight: 'inherit' //'#495057',

    };
    function Bs4StylingMethodJs(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults);
      return {
        OnInit: function OnInit(composite) {
          defSelectedPanelStyle(composite.selectedPanel);
          composite.filterInput.style.color = configuration.filterInputColor;
          composite.filterInput.style.fontWeight = configuration.filterInputFontWeight;
        },
        Enable: function Enable(selectedPanel) {
          selectedPanel.style.backgroundColor = "";
        },
        Disable: function Disable(selectedPanel) {
          selectedPanel.style.backgroundColor = configuration.selectedPanelDisabledBackgroundColor;
        },
        FocusIn: function FocusIn(selectedPanel) {
          if (selectedPanel.classList.contains("is-valid")) {
            selectedPanel.style.boxShadow = configuration.selectedPanelFocusValidBoxShadow;
          } else if (selectedPanel.classList.contains("is-invalid")) {
            selectedPanel.style.boxShadow = configuration.selectedPanelFocusInvalidBoxShadow;
          } else {
            selectedPanel.style.boxShadow = configuration.selectedPanelFocusBoxShadow;
            selectedPanel.style.borderColor = configuration.selectedPanelFocusBorderColor;
          }
        },
        FocusOut: function FocusOut(selectedPanel) {
          selectedPanel.style.boxShadow = "";
          selectedPanel.style.borderColor = "";
        }
      };
    }

    var MultiSelectСlassesDefaults = {
      containerClass: 'dashboardcode-bsmultiselect',
      dropDownMenuClass: 'dropdown-menu',
      dropDownItemClass: 'px-2',
      dropDownItemHoverClass: 'text-primary bg-light',
      // TODO looks like bullshit
      dropDownItemSelectedClass: '',
      // not used? should be used in OptionsPanel.js
      dropDownItemDisabledClass: '',
      // not used? should be used in OptionsPanel.js
      selectedPanelClass: 'form-control',
      selectedPanelFocusClass: '',
      //  TODO: integrate with methodCss ('focus')
      selectedPanelDisabledClass: '',
      // TODO: integrate with methodCss ('disabled')
      selectedItemClass: 'badge',
      selectedItemDisabledClass: '',
      // not used? should be used in PicksPanel.js
      removeSelectedItemButtonClass: 'close',
      selectedItemFilterClass: '',
      filterInputClass: ''
    };

    function Bs4Styling(stylingMethod, configuration) {
      ExtendIfUndefined(configuration, MultiSelectСlassesDefaults);
      return {
        Init: function Init(composite) {
          addClass(composite.container, configuration.containerClass);
          addClass(composite.selectedPanel, configuration.selectedPanelClass);
          addClass(composite.dropDownMenu, configuration.dropDownMenuClass);
          addClass(composite.filterInputItem, configuration.filterInputItemClass);
          addClass(composite.filterInput, configuration.filterInputClass);
          if (stylingMethod.OnInit) stylingMethod.OnInit(composite);
        },
        Enable: function Enable(composite) {
          removeClass(composite.selectedPanel, configuration.selectedPanelDisabledClass);
          stylingMethod.Enable(composite.selectedPanel);
        },
        Disable: function Disable(composite) {
          addClass(composite.selectedPanel, configuration.selectedPanelDisabledClass);
          stylingMethod.Disable(composite.selectedPanel);
        },
        FocusIn: function FocusIn(composite) {
          addClass(composite.selectedPanel, configuration.selectedPanelFocusClass);
          stylingMethod.FocusIn(composite.selectedPanel);
        },
        FocusOut: function FocusOut(composite) {
          removeClass(composite.selectedPanel, configuration.selectedPanelFocusClass);
          stylingMethod.FocusOut(composite.selectedPanel);
        },
        HoverIn: function HoverIn(dropDownItem) {
          addClass(dropDownItem, configuration.dropDownItemHoverClass);
        },
        HoverOut: function HoverOut(dropDownItem) {
          removeClass(dropDownItem, configuration.dropDownItemHoverClass);
        }
      };
    }

    function AddToJQueryPrototype(pluginName, createPlugin, defaults, $) {
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

      $.fn[prototypableName] = prototypable; // pluginName with first capitalized letter - return plugin instance (for 1st $selected item)

      $.fn[pluginName] = function () {
        return $(this).data(dataKey);
      };

      $.fn[prototypableName].noConflict = function () {
        $.fn[prototypableName] = noConflictPrototypable;
        return prototypable;
      };

      $.fn[prototypableName].defaults = defaults;
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
      return function (selectedItem, optionItem, removeSelectedItem) {
        var $selectedItem = $(selectedItem);
        $selectedItem.addClass(configuration.selectedItemClass);
        var $content = $("<span/>").text(optionItem.text);
        $content.appendTo($selectedItem);

        if (optionItem.disabled) {
          stylingMethod.disableSelectedItemContent($content);
        }

        var $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>') // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
        // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
        .css("float", "none").appendTo($selectedItem).addClass(configuration.removeSelectedItemButtonClass) // bs close class set the float:right
        .on("click", function (jqEvent) {
          return removeSelectedItem(jqEvent.originalEvent);
        });
        if (stylingMethod.createSelectedItemContent) stylingMethod.createSelectedItemContent($selectedItem, $button);
        return {
          disable: function disable(isDisabled) {
            $button.prop('disabled', isDisabled);
          },
          dispose: function dispose() {
            $button.unbind();
          }
        };
      };
    }

    var bs4StylingMethodCssDefaults$1 = {
      checkBoxDisabledClass: 'disabled'
    };

    function Bs4DropDownItemContentStylingMethodCss(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodCssDefaults$1);
      return {
        disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
          if (isDisbaled) $checkBox.addClass(configuration.checkBoxDisabledClass);else $checkBox.removeClass(configuration.checkBoxDisabledClass);
        }
      };
    }

    var bs4StylingMethodJsDefaults$2 = {
      checkBoxLabelDisabledColor: '#6c757d'
    };

    function Bs4DropDownItemContentStylingMethodJs(configuration) {
      ExtendIfUndefined(configuration, bs4StylingMethodJsDefaults$2);
      return {
        disabledStyle: function disabledStyle($checkBox, $checkBoxLabel, isDisbaled) {
          $checkBoxLabel.css('color', isDisbaled ? configuration.checkBoxLabelDisabledColor : '');
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
        var $dropDownItemContent = $("<div class=\"custom-control custom-checkbox\">\n            <input type=\"checkbox\" class=\"custom-control-input\">\n            <label class=\"custom-control-label justify-content-start\"></label>\n        </div>");
        $dropDownItemContent.appendTo(dropDownItem);
        var $checkBox = $dropDownItemContent.find("INPUT[type=\"checkbox\"]");
        var $checkBoxLabel = $dropDownItemContent.find("label");
        $checkBoxLabel.text(option.text);
        var tmp = {
          select: function select(isSelected) {
            $checkBox.prop('checked', isSelected);
          },
          // --- distinct disable and disabledStyle to provide a possibility to unselect disabled option
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
          },
          dispose: function dispose() {
            $checkBox.unbind();
            $dropDownItem.unbind();
          }
        };
        return tmp;
      };
    }

    /*
    // 1
    <select name="States1" id="edit-states1-id" class="form-control" 
            multiple="multiple" style="display: none;"> <!-- plugin element-->
                    <option value="AL">Alabama</option>
                    <option value="AK" disabled="">Alaska</option>
    </select>

    // 2
    <div class="dashboardcode-bsmultiselect"> 
        <div class="input-group" >
            <div class="input-group-prepend">
                <button class="btn btn-outline-secondary" type="button">Button</button>
            </div>

            <select name="States1" id="edit-states1-id" class="form-control"
                multiple="multiple" style="display: none;">  <!-- plugin element-->
                    <option value="AL">Alabama</option>
                    <option value="AK" disabled="">Alaska</option>
            </select>

            <ul class="form-control"></ul> <!-- optional - for "no flick" -->
        </div>
    </div>

    // 2
    <div></div> 

    // 3
    <div class="dashboardcode-bsmultiselect">
        <div class="input-group" >
            <div class="input-group-prepend">
                <button class="btn btn-outline-secondary" type="button">Button</button>
            </div>

            <ul class="form-control"></ul> <!-- json plugin key element -->
        </div>
    </div>
    */
    function ContainerAdapter(createElement, selectElement, containerElement, picksElement) {
      // select
      var ownContainerElement = false;
      var ownPicksElement = false;

      if (!containerElement) {
        containerElement = createElement('div');
        ownContainerElement = true;
      }

      if (!picksElement) {
        picksElement = createElement('UL');
        ownPicksElement = true;
      }

      var optionsElement = createElement('UL');
      optionsElement.style.display = "none";
      var backupDisplay = null;

      if (selectElement) {
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
      }

      return {
        container: containerElement,
        picksElement: picksElement,
        optionsElement: optionsElement,
        init: function init() {
          if (ownPicksElement) containerElement.appendChild(picksElement);
        },
        appendToContainer: function appendToContainer() {
          if (ownContainerElement || !selectElement) {
            if (ownPicksElement) containerElement.appendChild(picksElement);
            containerElement.appendChild(optionsElement);
          } else {
            if (selectElement) {
              selectElement.parentNode.insertBefore(optionsElement, selectElement.nextSibling);
              if (ownPicksElement) selectElement.parentNode.insertBefore(picksElement, optionsElement);
            }
          }
        },
        attachContainer: function attachContainer() {
          if (ownContainerElement) selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
        },
        dispose: function dispose() {
          if (ownContainerElement) containerElement.parentNode.removeChild(containerElement);
          if (ownPicksElement) picksElement.parentNode.removeChild(picksElement);
          optionsElement.parentNode.removeChild(optionsElement);
          if (selectElement) selectElement.style.display = backupDisplay;
        }
      };
    }

    function UpdateIsValid(selectedPanel, isValid, isInvalid) {
      if (isValid) selectedPanel.classList.add('is-valid');else selectedPanel.classList.remove('is-valid');
      if (isInvalid) selectedPanel.classList.add('is-invalid');else selectedPanel.classList.remove('is-invalid');
    }

    function UpdateSize(selectedPanel, size) {
      if (size == "custom-select-lg") {
        selectedPanel.classList.add('form-control-lg');
        selectedPanel.classList.remove('form-control-sm');
      } else if (size == "custom-select-sm") {
        selectedPanel.classList.remove('form-control-lg');
        selectedPanel.classList.add('form-control-sm');
      } else {
        selectedPanel.classList.remove('form-control-lg');
        selectedPanel.classList.remove('form-control-sm');
      }
    }

    function UpdateSizeJs(selectedPanel, size, configuration) {
      UpdateSize(selectedPanel, size);

      if (size == "custom-select-lg" || size == "input-group-lg") {
        selectedPanel.style.minHeight = configuration.selectedPanelLgMinHeight;
      } else if (size == "custom-select-sm" || size == "input-group-sm") {
        selectedPanel.style.minHeight = configuration.selectedPanelSmMinHeight;
      } else {
        selectedPanel.style.minHeight = configuration.selectedPanelDefMinHeight;
      }
    }

    function FindDirectChildByTagName(element, tagName) {
      var returnValue = null;

      for (var i = 0; i < element.children.length; i++) {
        var tmp = element.children[i];

        if (tmp.tagName == tagName) {
          returnValue = tmp;
          break;
        }
      }

      return returnValue;
    }

    (function (window, $) {
      // $.fn.bsMultiSelect.defaults. // TODO - set defaults parameters from there
      var createPlugin = function createPlugin(element, settings, onDispose) {
        var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

        if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
        var useCss = configuration.useCss;
        var styling = configuration.styling;

        if (!configuration.adapter) {
          var stylingMethod = configuration.stylingMethod;

          if (!stylingMethod) {
            if (useCss) stylingMethod = Bs4StylingMethodCss(configuration);else stylingMethod = Bs4StylingMethodJs(configuration);
          }

          styling = Bs4Styling(stylingMethod, configuration);
        }

        var optionsAdapter = null;
        var containerAdapter = null;
        if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
          var createElement = function createElement(name) {
            return window.document.createElement(name);
          };

          var trigger = function trigger(eventName) {
            $(element).trigger(eventName);
          };

          if (configuration.options) {
            optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger);
            if (!configuration.createInputId) configuration.createInputId = function () {
              return configuration.containerClass + "-generated-filter-" + element.id;
            }; // find direct child by tagName

            var picksElement = FindDirectChildByTagName(element, "UL");
            containerAdapter = ContainerAdapter(createElement, null, element, picksElement);
          } else {
            var selectElement = null;
            var containerElement = null;
            if (element.tagName == "SELECT") selectElement = element;else {
              selectElement = FindDirectChildByTagName(element, "SELECT");
              if (!selectElement) throw "There are no SELECT element or options in the configuraion";
              containerElement = element;
            }

            if (!containerElement && configuration.containerClass) {
              var $container = $(selectElement).closest('.' + configuration.containerClass);
              if ($container.length > 0) containerElement = $container.get(0);
            }

            if (!configuration.label) {
              var $formGroup = $(selectElement).closest('.form-group');

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
            }

            var $form = $(selectElement).closest('form');
            var form = null;

            if ($form.length == 1) {
              form = $form.get(0);
            }

            if (!configuration.getDisabled) {
              var $fieldset = $(selectElement).closest('fieldset');

              if ($fieldset.length == 1) {
                var fieldset = $fieldset.get(0);

                configuration.getDisabled = function () {
                  return selectElement.disabled || fieldset.disabled;
                };
              } else {
                configuration.getDisabled = function () {
                  return selectElement.disabled;
                };
              }
            }

            if (!configuration.getSize) {
              configuration.getSize = function () {
                var value = null;
                if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg')) value = 'custom-select-lg';else if (selectElement.classList.contains('custom-select-sm') || selectElement.classList.contains('form-control-sm')) value = 'custom-select-sm';else if (containerElement && containerElement.classList.contains('input-group-lg')) value = 'input-group-lg';else if (containerElement && containerElement.classList.contains('input-group-sm')) value = 'input-group-sm';
                return value;
              };
            }

            if (!configuration.getIsValid) {
              configuration.getIsValid = function () {
                return selectElement.classList.contains('is-valid');
              };
            }

            if (!configuration.getIsInvalid) {
              configuration.getIsInvalid = function () {
                return selectElement.classList.contains('is-invalid');
              };
            }

            optionsAdapter = OptionsAdapterElement(selectElement, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger, form);
            if (!configuration.createInputId) configuration.createInputId = function () {
              return configuration.containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
            };
            var picksElement = null;
            if (containerElement) picksElement = FindDirectChildByTagName(containerElement, "UL");
            containerAdapter = ContainerAdapter(createElement, selectElement, containerElement, picksElement);
          }
        }
        var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
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

        var createStylingComposite = function createStylingComposite(container, selectedPanel, placeholderItemElement, filterInputItem, filterInput, dropDownMenu) {
          return {
            container: container,
            selectedPanel: selectedPanel,
            filterInputItem: filterInputItem,
            filterInput: filterInput,
            dropDownMenu: dropDownMenu,
            $container: $(container),
            $selectedPanel: $(selectedPanel),
            $placeholderItem: placeholderItemElement ? $(placeholderItemElement) : null,
            $filterInputItem: $(filterInputItem),
            $filterInput: $(filterInput),
            $dropDownMenu: $(dropDownMenu)
          };
        };

        var placeholderText = configuration.placeholder;

        if (!placeholderText) {
          if (selectElement) placeholderText = $(selectElement).data("bsmultiselect-placeholder");else if (containerElement) placeholderText = $(containerElement).data("bsmultiselect-placeholder");
        }

        var setSelected = configuration.setSelected;

        if (!setSelected) {
          setSelected = function setSelected(option, value) {
            option.selected = value;
          };
        }

        var updateSize = null;

        if (configuration.useCss) {
          updateSize = function updateSize() {
            return UpdateSize(containerAdapter.picksElement, optionsAdapter.getSize());
          };
        } else {
          updateSize = function updateSize() {
            return UpdateSizeJs(containerAdapter.picksElement, optionsAdapter.getSize(), configuration);
          };
        }

        var updateIsValid = function updateIsValid() {
          return UpdateIsValid(containerAdapter.picksElement, optionsAdapter.getIsValid(), optionsAdapter.getIsInvalid());
        };

        var onUpdate = function onUpdate() {
          updateSize();
          updateIsValid();
        };

        var multiSelect = new MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, window);
        multiSelect.UpdateSize = updateSize;
        multiSelect.UpdateIsValid = updateIsValid;
        if (configuration.init) configuration.init(element, multiSelect);
        multiSelect.init();
        return multiSelect;
      };

      var defaults = {
        classes: MultiSelectСlassesDefaults
      };
      AddToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    })(window, $);

})));
//# sourceMappingURL=BsMultiSelect.js.map
