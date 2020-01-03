/*!
  * DashboardCode BsMultiSelect v0.4.34-beta (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2020 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('popper.js')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
    (global = global || self, factory(global.jQuery, global.Popper));
}(this, (function ($, Popper) { 'use strict';

    $ = $ && $.hasOwnProperty('default') ? $['default'] : $;
    Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

    function extendIfUndefined(destination, source) {
      for (var property in source) {
        if (destination[property] === undefined) destination[property] = source[property];
      }
    }
    function createEmpty(source, value) {
      var destination = {};

      for (var property in source) {
        destination[property] = value;
      }

      return destination;
    }

    function removeElement(e) {
      e.parentNode.removeChild(e);
    }
    function findDirectChildByTagName(element, tagName) {
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
    function addClass(element, c) {
      element.classList.add(c);
    }
    function removeClass(element, c) {
      element.classList.remove(c);
    }
    function addClasses(element, classes) {
      modifyClasses(classes, function (e) {
        return addClass(element, e);
      });
    }
    function removeClasses(element, classes) {
      modifyClasses(classes, function (e) {
        return removeClass(element, e);
      });
    }
    function setStyles(element, styles) {
      for (var property in styles) {
        element.style[property] = styles[property];
      }
    }

    function modifyClasses(classes, modify) {
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

    var filterInputStyle = {
      border: '0px',
      padding: '0px',
      outline: 'none',
      backgroundColor: 'transparent'
    };
    function FilterPanel(createElement, insertIntoDom, onFocusIn, // show dropdown
    onFocusOut, // hide dropdown
    onKeyDownArrowUp, onKeyDownArrowDown, onTabForEmpty, // tab on empty
    onBackspace, // backspace alike
    onEnterOrTabToCompleate, // "compleate alike"
    onKeyDownEsc, onKeyUpEsc, // "esc" alike
    onInput, // filter
    setEmptyLength) {
      var filterInputElement = createElement('INPUT');
      filterInputElement.setAttribute("type", "search");
      filterInputElement.setAttribute("autocomplete", "off");
      setStyles(filterInputElement, filterInputStyle);
      insertIntoDom(filterInputElement);

      var onfilterInputKeyDown = function onfilterInputKeyDown(event) {
        if ([38, 40, 13, 27].indexOf(event.which) >= 0 || event.which == 9 && filterInputElement.value) {
          event.preventDefault(); // preventDefault for tab(9) it enables keyup,
          // prevent form default button (13-enter) 
          // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
          // esc(27) there is just in case
        }

        if (event.which == 27) {
          onKeyDownEsc(filterInputElement.value ? false : true, event); // support BS do not close modal - event.stopPropagation inside
        } else if (event.which == 38) {
          onKeyDownArrowUp();
        } else if (event.which == 40) {
          onKeyDownArrowDown();
        } else if (event.which == 9
        /*tab*/
        ) {
            // no keydown for this
            if (!filterInputElement.value) {
              onTabForEmpty(); // filter is empty, nothing to reset
            }
          } else if (event.which == 8
        /*backspace*/
        ) {
            // NOTE: this will process backspace only if there are no text in the input field
            // If user will find this inconvinient, we will need to calculate something like this
            // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
            if (!filterInputElement.value) {
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
        var filterInputValue = filterInputElement.value;
        onInput(filterInputValue, function () {
          return filterInputElement.style.width = filterInputValue.length * 1.3 + 2 + "ch";
        });
      };

      filterInputElement.addEventListener('focusin', onFocusIn);
      filterInputElement.addEventListener('focusout', onFocusOut);
      filterInputElement.addEventListener('keydown', onfilterInputKeyDown);
      filterInputElement.addEventListener('keyup', onFilterInputKeyUp);
      filterInputElement.addEventListener('input', onFilterInputInput); // function setEmptyLength(){
      //     inputElement.style.width= "100%"; //--"1rem";
      // }
      //setEmptyLength();

      function setEmpty() {
        filterInputElement.value = '';
        setEmptyLength();
      }
      return {
        filterInputElement: filterInputElement,
        isEmpty: function isEmpty() {
          return filterInputElement.value ? false : true;
        },
        setEmpty: setEmpty,
        setEmptyLength: setEmptyLength,
        setFocus: function setFocus() {
          filterInputElement.focus();
        },
        isEventTarget: function isEventTarget(event) {
          return event.target == filterInputElement;
        },
        dispose: function dispose() {
          filterInputElement.removeEventListener('focusin', onFocusIn);
          filterInputElement.removeEventListener('focusout', onFocusOut);
          filterInputElement.removeEventListener('keydown', onfilterInputKeyDown);
          filterInputElement.removeEventListener('keyup', onFilterInputKeyUp);
          filterInputElement.removeEventListener('input', onFilterInputInput);
        }
      };
    }

    var choicesStyle = {
      listStyleType: 'none'
    }; // remove bullets since this is ul

    function ChoicesPanel(createElement, choicesElement, onShow, onHide, eventSkipper, dropDownItemContent, getVisibleMultiSelectDataList, resetFilter, updateDropDownLocation, filterPanelSetFocus) {
      // prevent heavy understandable styling error
      setStyles(choicesElement, choicesStyle);
      var hoveredMultiSelectData = null;
      var hoveredMultiSelectDataIndex = null;
      var candidateToHoveredMultiSelectData = null;

      function hideDropDown() {
        if (candidateToHoveredMultiSelectData) {
          resetCandidateToHoveredMultiSelectData();
        }

        if (choicesElement.style.display != 'none') {
          choicesElement.style.display = 'none';
          onHide();
        }
      }

      function showDropDown() {
        if (choicesElement.style.display != 'block') {
          eventSkipper.setSkippable();
          choicesElement.style.display = 'block';
          onShow();
        }
      }

      var hoverInInternal = function hoverInInternal(index) {
        hoveredMultiSelectDataIndex = index;
        hoveredMultiSelectData = getVisibleMultiSelectDataList()[index];
        hoveredMultiSelectData.DropDownItemContent.hoverIn();
      };

      function resetDropDownMenuHover() {
        if (hoveredMultiSelectData) {
          hoveredMultiSelectData.DropDownItemContent.hoverOut();
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
          if (hoveredMultiSelectData) hoveredMultiSelectData.DropDownItemContent.hoverOut(); //styling.HoverOut(hoveredMultiSelectData.dropDownMenuItemElement);

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
        choicesElement.appendChild(dropDownMenuItemElement);
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
          return choicesElement.style.display != 'none';
        }
      };
      return item;
    }

    var picksStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      listStyleType: 'none'
    }; // remove bullets since this is ul

    function PicksPanel(setSelected, createElement, picksElement, init, pickContentGenerator, isComponentDisabled, triggerChange, onRemove, onClick, onPicksEmptyChanged, //placeholderAspect.updatePlacehodlerVisibility(); call the same on enable/disable
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
      setStyles(picksElement, picksStyle);
      var pickFilterElement = createElement('LI'); // detached

      picksElement.appendChild(pickFilterElement); // located filter in selectionsPanel

      init(pickFilterElement);
      var MultiSelectDataSelectedTail = null;

      function removePicksTail() {
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

      function createPick(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled) {
        var pickElement = createElement('LI');
        MultiSelectData.pickElement = pickElement;

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
                  createPick(MultiSelectData, isOptionDisabled, setDropDownItemContentDisabled);
                  triggerChange();
                }
              };
            }

            MultiSelectData.DropDownItemContent.select(false);
            removeElement(pickElement);
            MultiSelectData.PickContent.dispose();
            MultiSelectData.PickContent = null;
            MultiSelectData.pickElement = null;
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

        MultiSelectData.PickContent = pickContentGenerator(pickElement, MultiSelectData.option, onRemoveSelectedItemEvent);

        var disable = function disable(isDisabled) {
          return MultiSelectData.PickContent.disable(isDisabled);
        };

        disable(isComponentDisabled);
        MultiSelectData.excludedFromSearch = true; // all selected excluded from search

        MultiSelectData.disable = disable;
        picksElement.insertBefore(pickElement, pickFilterElement);

        MultiSelectData.toggle = function () {
          return removeSelectedItem();
        };

        MultiSelectData.DropDownItemContent.select(true);
        inc();
      }

      var picksClick = function picksClick(event) {
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
        pickFilterElement: pickFilterElement,
        createPick: createPick,
        removePicksTail: removePicksTail,
        resetMultiSelectDataSelectedTail: function resetMultiSelectDataSelectedTail() {
          reset();
          MultiSelectDataSelectedTail = null;
        },
        isEmpty: isEmpty,
        enable: function enable() {
          isComponentDisabled = false;
          iterateAll(false);
          picksElement.addEventListener("click", picksClick);
        },
        disable: function disable() {
          isComponentDisabled = true;
          iterateAll(true);
          picksElement.removeEventListener("click", picksClick);
        },
        dispose: function dispose() {
          var toRemove = picksElement.firstChild;

          while (toRemove) {
            picksElement.removeChild(toRemove);
            toRemove = picksElement.firstChild;
          }

          picksElement.removeEventListener("click", picksClick); // OPEN dropdown
        }
      };
      return item;
    }

    function MultiSelectInputAspect(window, appendToContainer, choiceFilterInputElement, picksElement, choicesElement, showDropDown, hideDropDownAndResetFilter, isDropDownMenuEmpty, Popper) {
      appendToContainer();
      var document = window.document;
      var skipFocusout = false; // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container

      var skipoutMousedown = function skipoutMousedown() {
        skipFocusout = true;
      };

      var documentMouseup = function documentMouseup(event) {
        // if click outside container - close dropdown
        if (!(choicesElement === event.target || picksElement === event.target || choicesElement.contains(event.target) || picksElement.contains(event.target))) {
          hideDropDownAndResetFilter();
        }
      };

      var popper = new Popper(choiceFilterInputElement, choicesElement, {
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
        var offsetLeft = choiceFilterInputElement.offsetLeft;

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
          choicesElement.addEventListener("mousedown", skipoutMousedown);
          document.addEventListener("mouseup", documentMouseup);
        },
        onDropDownHide: function onDropDownHide() {
          picksElement.removeEventListener("mousedown", skipoutMousedown);
          choicesElement.addEventListener("mousedown", skipoutMousedown);
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

    function PlaceholderAspect(placeholderText, picksIsEmpty, filterIsEmpty, picksElement, inputElement) {
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
      function MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, pickContentGenerator, choiceContentGenerator, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, window) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
        }

        this.onUpdate = onUpdate;
        this.onDispose = onDispose; // readonly

        this.optionsAdapter = optionsAdapter;
        this.containerAdapter = containerAdapter;
        this.styling = styling;
        this.pickContentGenerator = pickContentGenerator;
        this.choiceContentGenerator = choiceContentGenerator;
        this.labelAdapter = labelAdapter;
        this.createStylingComposite = createStylingComposite;
        this.configuration = configuration;
        this.placeholderText = placeholderText;
        this.setSelected = setSelected; // should I rebind this for callbacks? setSelected.bind(this);

        this.window = window;
        this.visibleCount = 10;
        this.choicesPanel = null;
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
        return this.containerAdapter.containerElement;
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
                      (p1,p2,p3)=>this.picksPanel.createPick(p1,p2,p3),
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
        this.choicesPanel.hideDropDown(); // always hide 1st

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (multiSelectData.pickElement) multiSelectData.toggle();
        }

        this.resetFilter();
      };

      _proto.SelectAll = function SelectAll() {
        this.choicesPanel.hideDropDown(); // always hide 1st

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (!multiSelectData.excludedFromSearch) multiSelectData.toggle();
        }

        this.resetFilter();
      };

      _proto.empty = function empty() {
        // close drop down , remove filter and listeners
        this.choicesPanel.hideDropDown(); // always hide 1st

        this.resetFilter();

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (multiSelectData.dropDownMenuItemElement) removeElement(multiSelectData.dropDownMenuItemElement);
          if (multiSelectData.pickElement) removeElement(multiSelectData.pickElement);
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
              pickElement: null,
              remove: null,
              disable: null,
              removeDropDownMenuItemElement: null
            };

            _this.MultiSelectDataList.push(MultiSelectData);

            if (!isHidden) {
              MultiSelectData.visible = true;
              MultiSelectData.visibleIndex = i;

              _this.choicesPanel.insertDropDownItem(MultiSelectData, function (p1, p2, p3) {
                return _this.picksPanel.createPick(p1, p2, p3);
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

        this.choicesPanel.hideDropDown();
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
          if (multiSelectData.PickContent) multiSelectData.PickContent.dispose();
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
        this.choicesPanel.stopAndResetDropDownMenuHover();

        if (this.getVisibleMultiSelectDataList().length == 1) {
          this.choicesPanel.hoverInInternal(0);
        }

        if (this.getVisibleMultiSelectDataList().length > 0) {
          this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

          this.choicesPanel.showDropDown();
        } else {
          this.choicesPanel.hideDropDown();
        }
      };

      _proto.init = function init() {
        var _this2 = this;

        var document = this.window.document;

        var createElement = function createElement(name) {
          return document.createElement(name);
        };

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
          return _this2.choicesPanel.keyDownArrow(false);
        }, // arrow up
        function () {
          return _this2.choicesPanel.keyDownArrow(true);
        }, // arrow down
        function () {
          return _this2.choicesPanel.hideDropDown();
        }, // tab on empty
        function () {
          _this2.picksPanel.removePicksTail();

          _this2.aspect.alignToFilterInputItemLocation(false);
        }, // backspace - "remove last"
        function () {
          if (_this2.choicesPanel.getIsVisble()) _this2.choicesPanel.toggleHovered();
        }, // tab/enter "compleate hovered"
        function (isEmpty, event) {
          if (!isEmpty || _this2.choicesPanel.getIsVisble()) // supports bs modal - stop esc (close modal) propogation
            event.stopPropagation();
        }, // esc keydown
        function () {
          _this2.choicesPanel.hideDropDown(); // always hide 1st


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
        }, this.pickContentGenerator, this.isComponentDisabled, function () {
          return _this2.optionsAdapter.triggerChange();
        }, function () {
          _this2.choicesPanel.hideDropDown(); // always hide 1st


          _this2.resetFilter();
        }, function (event) {
          if (!_this2.filterPanel.isEventTarget(event)) _this2.filterPanel.setFocus();

          _this2.aspect.alignAndShowDropDown(event);
        }, function () {
          return _this2.placeholderAspect.updatePlacehodlerVisibility();
        }, function (doUncheck, event) {
          _this2.aspect.processUncheck(doUncheck, event);
        });
        this.choicesPanel = ChoicesPanel(createElement, this.containerAdapter.choicesElement, function () {
          return _this2.aspect.onDropDownShow();
        }, function () {
          return _this2.aspect.onDropDownHide();
        }, EventSkipper(this.window), this.choiceContentGenerator, function () {
          return _this2.getVisibleMultiSelectDataList();
        }, function () {
          return _this2.resetFilter();
        }, function () {
          return _this2.aspect.alignToFilterInputItemLocation(true);
        }, function () {
          return _this2.filterPanel.setFocus();
        });
        this.placeholderAspect = PlaceholderAspect(this.placeholderText, function () {
          return _this2.picksPanel.isEmpty();
        }, function () {
          return _this2.filterPanel.isEmpty();
        }, this.containerAdapter.picksElement, this.filterPanel.filterInputElement);
        this.placeholderAspect.init();
        this.placeholderAspect.updateEmptyInputWidth();
        this.aspect = MultiSelectInputAspect(this.window, function () {
          return _this2.containerAdapter.appendToContainer();
        }, this.picksPanel.pickFilterElement, this.containerAdapter.picksElement, this.containerAdapter.choicesElement, function () {
          return _this2.choicesPanel.showDropDown();
        }, function () {
          _this2.choicesPanel.hideDropDown();

          _this2.resetFilter();
        }, function () {
          return _this2.getVisibleMultiSelectDataList().length == 0;
        }, Popper);
        this.stylingComposite = this.createStylingComposite(this.picksPanel.pickFilterElement, this.filterPanel.filterInputElement, this.containerAdapter.choicesElement);
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

    function LabelAdapter(labelElement, createInputId) {
      var backupedForAttribute = null; // state saved between init and dispose

      return {
        init: function init(filterInputElement) {
          if (labelElement) {
            backupedForAttribute = labelElement.getAttribute('for');
            var newId = createInputId();
            filterInputElement.setAttribute('id', newId);
            labelElement.setAttribute('for', newId);
          }
        },
        dispose: function dispose() {
          if (backupedForAttribute) labelElement.setAttribute('for', backupedForAttribute);
        }
      };
    }

    function addToJQueryPrototype(pluginName, createPlugin, defaults, $) {
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

    function StylingCorrector(configuration) {
      var resetDisable = createEmpty(configuration.picksStyleDisabled, "");
      var resetFocus = createEmpty(configuration.picksStyleFocus, "");
      return {
        init: function init(elements) {
          setStyles(elements.picks, configuration.picksStyle);
          setStyles(elements.input, configuration.filterInputStyle);
        },
        enable: function enable(picksElement) {
          setStyles(picksElement, resetDisable);
        },
        disable: function disable(picksElement) {
          setStyles(picksElement, configuration.picksStyleDisabled);
        },
        focusIn: function focusIn(picksElement) {
          setStyles(picksElement, configuration.picksStyleFocus);
        },
        focusOut: function focusOut(picksElement) {
          setStyles(picksElement, resetFocus);
        }
      };
    }

    function Styling(configuration, stylingCorrector) {
      return {
        Init: function Init(elements) {
          addClasses(elements.container, configuration.containerClass);
          addClasses(elements.picks, configuration.picksClass);
          addClasses(elements.choices, configuration.choicesClass);
          addClasses(elements.pickFilter, configuration.pickFilterClass);
          addClasses(elements.input, configuration.filterInputClass);
          if (stylingCorrector && stylingCorrector.init) stylingCorrector.init(elements);
        },
        Enable: function Enable(elements) {
          removeClasses(elements.picks, configuration.picksClassDisabled);
          if (stylingCorrector && stylingCorrector.enable) stylingCorrector.enable(elements.picks);
        },
        Disable: function Disable(elements) {
          addClasses(elements.picks, configuration.picksClassDisabled);
          if (stylingCorrector && stylingCorrector.disable) stylingCorrector.disable(elements.picks);
        },
        FocusIn: function FocusIn(elements) {
          addClasses(elements.picks, configuration.picksClassFocus);
          if (stylingCorrector && stylingCorrector.focusIn) stylingCorrector.focusIn(elements.picks);
        },
        FocusOut: function FocusOut(elements) {
          removeClasses(elements.picks, configuration.picksClassFocus);
          if (stylingCorrector && stylingCorrector.focusOut) stylingCorrector.focusOut(elements.picks);
        }
      };
    }

    function BsPickContentStylingCorrector(configuration) {
      return {
        disablePickContent: function disablePickContent(content) {
          setStyles(content, configuration.pickContentStyleDisabled);
        },
        createPickContent: function createPickContent(selectedItem, button) {
          setStyles(selectedItem, configuration.pickStyle);
          setStyles(button, configuration.pickButtonStyle);
        }
      };
    }
    function BsPickContentGenerator(configuration, stylingCorrector, $) {
      return function (selectedItem, optionItem, removeSelectedItem) {
        var $selectedItem = $(selectedItem);
        addClasses(selectedItem, configuration.pickClass);
        var $content = $("<span/>").text(optionItem.text);
        var content = $content.get(0);
        $content.appendTo($selectedItem);

        if (optionItem.disabled) {
          addClasses(content, configuration.pickContentClassDisabled);
          if (stylingCorrector && stylingCorrector.disablePickContent) stylingCorrector.disablePickContent(content);
        }

        var $button = $('<button aria-label="Close" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>') // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
        // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 
        .css("float", "none").appendTo($selectedItem).addClass(configuration.pickRemoveButtonClass) // bs close class set the float:right
        .on("click", function (jqEvent) {
          return removeSelectedItem(jqEvent.originalEvent);
        });
        if (stylingCorrector && stylingCorrector.createPickContent) stylingCorrector.createPickContent(selectedItem, $button.get(0));
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

    function BsChoiceContentStylingCorrector(configuration) {
      var resetStyle = createEmpty(resetStyle, configuration.choiceLabelStyleDisabled);
      return {
        disabledStyle: function disabledStyle(checkBox, checkBoxLabel, isDisbaled) {
          setStyles(checkBoxLabel, isDisbaled ? configuration.choiceLabelStyleDisabled : resetStyle);
        }
      };
    }
    function BsChoiceContentGenerator(configuration, stylingCorrector, $) {
      return function (choiceElement, option) {
        var $choiceElement = $(choiceElement);
        $choiceElement.addClass(configuration.choiceClass);
        var $choiceContent = $("<div class=\"custom-control custom-checkbox\">\n            <input type=\"checkbox\" class=\"custom-control-input\">\n            <label class=\"custom-control-label justify-content-start\"></label>\n        </div>");
        $choiceContent.appendTo(choiceElement);
        var $checkBox = $choiceContent.find("INPUT[type=\"checkbox\"]");
        var $checkBoxLabel = $choiceContent.find("label");
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
            if (isDisbaled) $checkBox.addClass(configuration.choiceCheckBoxClassDisabled);else $checkBox.removeClass(configuration.choiceCheckBoxClassDisabled);
            if (stylingCorrector && stylingCorrector.disabledStyle) stylingCorrector.disabledStyle($checkBox.get(0), $checkBoxLabel.get(0), isDisbaled);
          },
          hoverIn: function hoverIn() {
            addClasses(choiceElement, configuration.choiceClassHover);
          },
          hoverOut: function hoverOut() {
            removeClasses(choiceElement, configuration.choiceClassHover);
          },
          onSelected: function onSelected(toggle) {
            $checkBox.on("change", toggle);
            $choiceElement.on("click", function (event) {
              if (choiceElement === event.target || $.contains(choiceElement, event.target)) {
                toggle();
              }
            });
          },
          dispose: function dispose() {
            $checkBox.unbind();
            $choiceElement.unbind();
          }
        };
        return tmp;
      };
    }

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

      var choicesElement = createElement('UL');
      choicesElement.style.display = "none";
      var backupDisplay = null;

      if (selectElement) {
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
      }

      return {
        containerElement: containerElement,
        picksElement: picksElement,
        choicesElement: choicesElement,
        init: function init() {
          if (ownPicksElement) containerElement.appendChild(picksElement);
        },
        appendToContainer: function appendToContainer() {
          if (ownContainerElement || !selectElement) {
            if (ownPicksElement) containerElement.appendChild(picksElement);
            containerElement.appendChild(choicesElement);
          } else {
            if (selectElement) {
              selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
              if (ownPicksElement) selectElement.parentNode.insertBefore(picksElement, choicesElement);
            }
          }
        },
        attachContainer: function attachContainer() {
          if (ownContainerElement) selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
        },
        dispose: function dispose() {
          if (ownContainerElement) containerElement.parentNode.removeChild(containerElement);
          if (ownPicksElement) picksElement.parentNode.removeChild(picksElement);
          choicesElement.parentNode.removeChild(choicesElement);
          if (selectElement) selectElement.style.display = backupDisplay;
        }
      };
    }

    function updateIsValid(picksElement, isValid, isInvalid) {
      if (isValid) addClass(picksElement, 'is-valid');else removeClass(picksElement, 'is-valid');
      if (isInvalid) addClass(picksElement, 'is-invalid');else removeClass(picksElement, 'is-invalid');
    }

    function updateSize(picksElement, size) {
      if (size == "custom-select-lg") {
        addClass(picksElement, 'form-control-lg');
        removeClass(picksElement, 'form-control-sm');
      } else if (size == "custom-select-sm") {
        removeClass(picksElement, 'form-control-lg');
        addClass(picksElement, 'form-control-sm');
      } else {
        removeClass(picksElement, 'form-control-lg');
        removeClass(picksElement, 'form-control-sm');
      }
    }

    function updateSizeJs(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, size) {
      updateSize(picksElement, size);

      if (size == "custom-select-lg" || size == "input-group-lg") {
        setStyles(picksElement, picksStyleLg);
      } else if (size == "custom-select-sm" || size == "input-group-sm") {
        setStyles(picksElement, picksStyleSm);
      } else {
        setStyles(picksElement, picksStyleDef);
      }
    }

    function updateIsValidForAdapter(picksElement, optionsAdapter) {
      updateIsValid(picksElement, optionsAdapter.getIsValid(), optionsAdapter.getIsInvalid());
    }

    function updateSizeForAdapter(picksElement, optionsAdapter) {
      updateSize(picksElement, optionsAdapter.getSize());
    }

    function updateSizeJsForAdapter(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, optionsAdapter) {
      updateSizeJs(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, optionsAdapter.getSize());
    }

    function createBsAppearance(picksElement, configuration, optionsAdapter) {
      var updateIsValid = function updateIsValid() {
        return updateIsValidForAdapter(picksElement, optionsAdapter);
      };

      if (configuration.useCss) {
        return Object.create({
          updateIsValid: updateIsValid,
          updateSize: function updateSize() {
            return updateSizeForAdapter(picksElement, optionsAdapter);
          }
        });
      } else {
        var picksStyleLg = configuration.picksStyleLg,
            picksStyleSm = configuration.picksStyleSm,
            picksStyleDef = configuration.picksStyleDef;
        return Object.create({
          updateIsValid: updateIsValid,
          updateSize: function updateSize() {
            return updateSizeJsForAdapter(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, optionsAdapter);
          }
        });
      }
    }

    var classesDefaults = {
      containerClass: 'dashboardcode-bsmultiselect',
      choicesClass: 'dropdown-menu',
      choiceClassHover: 'text-primary bg-light',
      // TODO looks like bullshit
      choiceClassSelected: '',
      // not used? should be used in OptionsPanel.js
      choiceClassDisabled: '',
      // not used? should be used in OptionsPanel.js
      picksClass: 'form-control',
      picksClassFocus: 'focus',
      // internal, not bs4, used in scss
      picksClassDisabled: 'disabled',
      // internal, not bs4, used in scss
      pickClassDisabled: '',
      // not used? should be used in PicksPanel.js
      pickFilterClass: '',
      filterInputClass: '',
      // used in BsPickContentStylingCorrector
      pickClass: 'badge',
      pickRemoveButtonClass: 'close',
      pickContentClassDisabled: 'disabled',
      // internal, not bs4, used in scss
      // used in BsChoiceContentStylingCorrector
      choiceClass: 'px-2',
      choiceCheckBoxClassDisabled: 'disabled' // internal, not bs4, used in scss

    };
    var stylingDefaults = {
      // used in StylingCorrector
      picksStyle: {
        marginBottom: 0,
        height: 'auto'
      },
      picksStyleDisabled: {
        backgroundColor: '#e9ecef'
      },
      picksStyleFocus: {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
      },
      picksStyleFocusValid: {
        boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'
      },
      picksStyleFocusInvalid: {
        boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
      },
      filterInputStyle: {
        color: 'inherit'
        /*#495057 for default BS*/
        ,
        fontWeight: 'inherit'
      },
      // used in BsAppearance
      picksStyleDef: {
        minHeight: 'calc(2.25rem + 2px)'
      },
      picksStyleLg: {
        minHeight: 'calc(2.875rem + 2px)'
      },
      picksStyleSm: {
        minHeight: 'calc(1.8125rem + 2px)'
      },
      // used in BsPickContentStylingCorrector
      pickStyle: {
        paddingLeft: '0px',
        lineHeight: '1.5em'
      },
      pickButtonStyle: {
        fontSize: '1.5em',
        lineHeight: '.9em'
      },
      pickContentStyleDisabled: {
        opacity: '.65'
      },
      // used in BsChoiceContentStylingCorrector
      choiceLabelStyleDisabled: {
        color: '#6c757d'
      }
    };

    (function (window, $) {
      function createPlugin(element, settings, onDispose) {
        var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

        if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
        var useCss = configuration.useCss;
        var styling = configuration.styling;

        if (!configuration.adapter) {
          var stylingCorrector = configuration.stylingCorrector;

          if (!stylingCorrector) {
            if (!useCss) {
              extendIfUndefined(configuration, stylingDefaults);
              stylingCorrector = StylingCorrector(configuration);
              var defFocusIn = stylingCorrector.focusIn;

              stylingCorrector.focusIn = function (picksElement) {
                if (picksElement.classList.contains("is-valid")) {
                  setStyles(picksElement, configuration.picksStyleFocusValid);
                } else if (picksElement.classList.contains("is-invalid")) {
                  setStyles(picksElement, configuration.picksStyleFocusInvalid);
                } else {
                  defFocusIn(picksElement);
                }
              };
            }
          }

          extendIfUndefined(configuration, classesDefaults);
          styling = Styling(configuration, stylingCorrector);
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

            var picksElement = findDirectChildByTagName(element, "UL");
            containerAdapter = ContainerAdapter(createElement, null, element, picksElement);
          } else {
            var selectElement = null;
            var containerElement = null;
            if (element.tagName == "SELECT") selectElement = element;else {
              selectElement = findDirectChildByTagName(element, "SELECT");
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
            if (containerElement) picksElement = findDirectChildByTagName(containerElement, "UL");
            containerAdapter = ContainerAdapter(createElement, selectElement, containerElement, picksElement);
          }
        }
        var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
        var pickContentGenerator = configuration.pickContentGenerator;

        if (!pickContentGenerator) {
          var pickContentStylingCorrector = configuration.pickContentStylingCorrector;

          if (!pickContentStylingCorrector) {
            if (!useCss) {
              var pickStyle = stylingDefaults.pickStyle,
                  pickButtonStyle = stylingDefaults.pickButtonStyle,
                  pickContentStyleDisabled = stylingDefaults.pickContentStyleDisabled;
              extendIfUndefined(configuration, {
                pickStyle: pickStyle,
                pickButtonStyle: pickButtonStyle,
                pickContentStyleDisabled: pickContentStyleDisabled
              });
              pickContentStylingCorrector = BsPickContentStylingCorrector(configuration);
            }
          }

          var pickClass = classesDefaults.pickClass,
              pickRemoveButtonClass = classesDefaults.pickRemoveButtonClass,
              pickContentClassDisabled = classesDefaults.pickContentClassDisabled;
          extendIfUndefined(configuration, {
            pickClass: pickClass,
            pickRemoveButtonClass: pickRemoveButtonClass,
            pickContentClassDisabled: pickContentClassDisabled
          });
          pickContentGenerator = BsPickContentGenerator(configuration, pickContentStylingCorrector, $);
        }

        var choiceContentGenerator = configuration.choiceContentGenerator;

        if (!choiceContentGenerator) {
          var choiceContentStylingCorrector = configuration.choiceContentStylingCorrector;

          if (!useCss) {
            var choiceLabelStyleDisabled = stylingDefaults.choiceLabelStyleDisabled;
            extendIfUndefined(configuration, {
              choiceLabelStyleDisabled: choiceLabelStyleDisabled
            });
            choiceContentStylingCorrector = BsChoiceContentStylingCorrector(configuration);
          }

          var choiceClass = classesDefaults.choiceClass,
              choiceCheckBoxClassDisabled = classesDefaults.choiceCheckBoxClassDisabled;
          extendIfUndefined(configuration, {
            choiceClass: choiceClass,
            choiceCheckBoxClassDisabled: choiceCheckBoxClassDisabled
          });
          choiceContentGenerator = BsChoiceContentGenerator(configuration, choiceContentStylingCorrector, $);
        }

        var createStylingComposite = function createStylingComposite(pickFilterElement, inputElement, choicesElement) {
          return {
            container: containerAdapter.containerElement,
            picks: containerAdapter.picksElement,
            pickFilter: pickFilterElement,
            input: inputElement,
            choices: choicesElement
          };
        };

        var placeholderText = configuration.placeholder;

        if (!placeholderText) {
          if (selectElement) {
            placeholderText = $(selectElement).data("bsmultiselect-placeholder");
            if (!placeholderText) placeholderText = $(selectElement).data("placeholder");
          } else if (containerElement) {
            placeholderText = $(containerElement).data("bsmultiselect-placeholder");
            if (!placeholderText) placeholderText = $(containerElement).data("placeholder");
          }
        }

        var setSelected = configuration.setSelected;

        if (!setSelected) {
          setSelected = function setSelected(option, value) {
            option.selected = value;
          };
        }

        var bsAppearance = createBsAppearance(containerAdapter.picksElement, configuration, optionsAdapter);

        var onUpdate = function onUpdate() {
          bsAppearance.updateSize();
          bsAppearance.updateIsValid();
        };

        var multiSelect = new MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, pickContentGenerator, choiceContentGenerator, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, window);
        multiSelect.UpdateSize = bsAppearance.updateSize;
        multiSelect.UpdateIsValid = bsAppearance.updateIsValid;
        if (configuration.init) configuration.init(element, multiSelect);
        multiSelect.init();
        return multiSelect;
      }
      var defaults = {
        classes: classesDefaults,
        styling: stylingDefaults
      };
      addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    })(window, $);

})));
//# sourceMappingURL=BsMultiSelect.js.map
