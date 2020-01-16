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

    function extendAndOverride(destination, source) {
      for (var property in source) {
        destination[property] = source[property];
      }
    }

    function forEachRecursion(f, i) {
      if (!i) return;
      f(i.value);
      forEachRecursion(f, i.prev);
    }

    function List() {
      var tail = null;
      var count = 0;
      return {
        add: function add(e) {
          if (tail) {
            tail.next = {
              value: e,
              prev: tail
            };
            tail = tail.next;
          } else tail = {
            value: e
          };

          count++;
          var node = tail;

          function remove() {
            if (node.prev) {
              node.prev.next = node.next;
            }

            if (node.next) {
              node.next.prev = node.prev;
            }

            if (tail == node) {
              tail = node.prev;
            }

            count--;
          }

          return remove;
        },
        forEach: function forEach(f) {
          forEachRecursion(f, tail);
        },
        getTail: function getTail() {
          return tail ? tail.value : null;
        },
        getCount: function getCount() {
          return count;
        },
        isEmpty: function isEmpty() {
          return count == 0;
        },
        reset: function reset() {
          tail = null;
          count = 0;
        }
      };
    }
    function sync() {
      for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
        functions[_key] = arguments[_key];
      }

      functions.forEach(function (f) {
        if (f) f();
      });
    }

    function removeElement(e) {
      e.parentNode.removeChild(e);
    }
    function findDirectChildByTagName(element, tagName) {
      var value = null;

      for (var i = 0; i < element.children.length; i++) {
        var tmp = element.children[i];

        if (tmp.tagName == tagName) {
          value = tmp;
          break;
        }
      }

      return value;
    }
    function closestByTagName(element, tagName) {
      return closest(element, function (e) {
        return e.tagName === tagName;
      });
    }
    function closestByClassName(element, className) {
      return closest(element, function (e) {
        return e.classList.contains(className);
      });
    }
    function closest(element, predicate) {
      if (!element) return null;
      if (predicate(element)) return element;
      return closest(element.parentNode, predicate);
    }
    function addClass(element, c) {
      element.classList.add(c);
    }
    function removeClass(element, c) {
      element.classList.remove(c);
    }
    function setStyle(element, style) {
      for (var property in style) {
        element.style[property] = style[property];
      }
    }
    function setClassAndStyle(element, classes, styles) {
      classes.forEach(function (e) {
        element.classList.add(e);
      });

      for (var property in styles) {
        element.style[property] = styles[property];
      }
    }
    function unsetClassAndStyle(element, classes, styles) {
      classes.forEach(function (e) {
        element.classList.remove(e);
      });

      for (var property in styles) {
        element.style[property] = '';
      }
    }
    function EventBinder() {
      var list = [];
      return {
        bind: function bind(element, eventName, handler) {
          element.addEventListener(eventName, handler);
          list.push({
            element: element,
            eventName: eventName,
            handler: handler
          });
        },
        unbind: function unbind() {
          list.forEach(function (e) {
            var element = e.element,
                eventName = e.eventName,
                handler = e.handler;
            element.removeEventListener(eventName, handler);
          });
        }
      };
    }

    var filterInputStyle = {
      border: '0px',
      height: 'auto',
      boxShadow: 'none',
      padding: '0px',
      margin: '0px',
      outline: 'none',
      backgroundColor: 'transparent'
    };
    function FilterPanel(filterInputElement, insertIntoDom, onFocusIn, // show dropdown
    onFocusOut, // hide dropdown
    onKeyDownArrowUp, onKeyDownArrowDown, onTabForEmpty, // tab on empty
    onBackspace, // backspace alike
    onEnterOrTabToCompleate, // "compleate alike"
    onKeyDownEsc, onKeyUpEsc, // "esc" alike
    onInput, // filter
    setEmptyLength) {
      filterInputElement.setAttribute("type", "search");
      filterInputElement.setAttribute("autocomplete", "off");
      setStyle(filterInputElement, filterInputStyle);
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
          filterInputElement.style.width = filterInputValue.length * 1.3 + 2 + "ch";
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

    function ChoicesPanel(createElement, choicesElement, onShow, onHide, eventSkipper, choiceContentGenerator, getVisibleMultiSelectDataList, resetFilter, updateChoicesLocation, filterPanelSetFocus) {
      var hoveredMultiSelectData = null;
      var hoveredMultiSelectDataIndex = null;
      var candidateToHoveredMultiSelectData = null;

      function hideChoices() {
        if (candidateToHoveredMultiSelectData) {
          resetCandidateToHoveredMultiSelectData();
        }

        if (choicesElement.style.display != 'none') {
          choicesElement.style.display = 'none';
          onHide();
        }
      }

      function showChoices() {
        if (choicesElement.style.display != 'block') {
          eventSkipper.setSkippable();
          choicesElement.style.display = 'block';
          onShow();
        }
      }

      var hoverInInternal = function hoverInInternal(index) {
        hoveredMultiSelectDataIndex = index;
        hoveredMultiSelectData = getVisibleMultiSelectDataList()[index];
        hoveredMultiSelectData.ChoiceContent.hoverIn();
      };

      function resetChoicesHover() {
        if (hoveredMultiSelectData) {
          hoveredMultiSelectData.ChoiceContent.hoverOut();
          hoveredMultiSelectData = null;
          hoveredMultiSelectDataIndex = null;
        }
      }

      var resetCandidateToHoveredMultiSelectData = function resetCandidateToHoveredMultiSelectData() {
        candidateToHoveredMultiSelectData.choiceElement.removeEventListener('mousemove', processCandidateToHovered);
        candidateToHoveredMultiSelectData.choiceElement.removeEventListener('mousedown', processCandidateToHovered);
        candidateToHoveredMultiSelectData = null;
      };

      var processCandidateToHovered = function processCandidateToHovered() {
        if (hoveredMultiSelectData != candidateToHoveredMultiSelectData) {
          resetChoicesHover();
          hoverInInternal(candidateToHoveredMultiSelectData.visibleIndex);
        }

        if (candidateToHoveredMultiSelectData) resetCandidateToHoveredMultiSelectData();
      };

      function toggleHovered() {
        if (hoveredMultiSelectData) {
          if (hoveredMultiSelectData.toggle) hoveredMultiSelectData.toggle();
          resetChoicesHover();
          hideChoices(); // always hide 1st

          resetFilter();
        }
      }

      function keyDownArrow(down) {
        var visibleMultiSelectDataList = getVisibleMultiSelectDataList();
        var length = visibleMultiSelectDataList.length;
        var newIndex = null;

        if (length > 0) {
          if (down) {
            var i = hoveredMultiSelectDataIndex === null ? 0 : hoveredMultiSelectDataIndex + 1;

            while (i < length) {
              if (visibleMultiSelectDataList[i].visible) {
                newIndex = i;
                break;
              }

              i++;
            }
          } else {
            var _i = hoveredMultiSelectDataIndex === null ? length - 1 : hoveredMultiSelectDataIndex - 1;

            while (_i >= 0) {
              if (visibleMultiSelectDataList[_i].visible) {
                newIndex = _i;
                break;
              }

              _i--;
            }
          }
        }

        if (newIndex !== null) {
          if (hoveredMultiSelectData) hoveredMultiSelectData.ChoiceContent.hoverOut(); // styling.HoverOut(hoveredMultiSelectData.choiceElement);

          updateChoicesLocation();
          showChoices();
          hoverInInternal(newIndex);
        }
      }

      var onChoiceElementMouseoverGeneral = function onChoiceElementMouseoverGeneral(MultiSelectData, choiceElement) {
        if (eventSkipper.isSkippable()) {
          if (candidateToHoveredMultiSelectData) resetCandidateToHoveredMultiSelectData();
          candidateToHoveredMultiSelectData = MultiSelectData;
          choiceElement.addEventListener('mousemove', processCandidateToHovered);
          choiceElement.addEventListener('mousedown', processCandidateToHovered);
        } else {
          if (hoveredMultiSelectData != MultiSelectData) {
            // mouseleave is not enough to guarantee remove hover styles in situations
            // when style was setuped without mouse (keyboard arrows)
            // therefore force reset manually
            resetChoicesHover();
            hoverInInternal(MultiSelectData.visibleIndex);
          }
        }
      };

      function insertChoice(MultiSelectData, createSelectedItemGen, setSelected, triggerChange, isSelected
      /*, isOptionDisabled*/
      ) {
        var choiceElement = createElement('LI'); // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous

        var onChoiceElementMouseover = function onChoiceElementMouseover() {
          return onChoiceElementMouseoverGeneral(MultiSelectData, choiceElement);
        };

        choiceElement.addEventListener('mouseover', onChoiceElementMouseover); // note 1: mouseleave preferred to mouseout - which fires on each descendant
        // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work

        var onChoiceElementMouseleave = function onChoiceElementMouseleave() {
          if (!eventSkipper.isSkippable()) {
            resetChoicesHover();
          }
        };

        choiceElement.addEventListener('mouseleave', onChoiceElementMouseleave);
        choicesElement.appendChild(choiceElement);
        var choiceContent = choiceContentGenerator(MultiSelectData.option, choiceElement);
        MultiSelectData.choiceElement = choiceElement;
        MultiSelectData.ChoiceContent = choiceContent;

        MultiSelectData.DisposeChoiceElement = function () {
          choiceElement.removeEventListener('mouseover', onChoiceElementMouseover);
          choiceElement.removeEventListener('mouseleave', onChoiceElementMouseleave);
        }; // var setChoiceContentDisabled = (isSelected) => {
        //     choiceContent.disabledStyle(true);
        //     // do not desable if selected! there should be possibility to unselect "disabled"
        //     choiceContent.disable(!isSelected);
        // }
        // choiceContent.setChoiceContentDisabled= setChoiceContentDisabled;


        if (MultiSelectData.isOptionDisabled) choiceContent.setChoiceContentDisabled(isSelected);
        choiceContent.onSelected(function () {
          if (MultiSelectData.toggle) MultiSelectData.toggle();
          filterPanelSetFocus();
        }); // ------------------------------------------------------------------------------

        var createSelectedItem = function createSelectedItem() {
          return createSelectedItemGen(MultiSelectData //,
          //MultiSelectData.isOptionDisabled,
          //() => setChoiceContentDisabled(content, false)
          );
        };

        if (isSelected) {
          createSelectedItem();
        } else {
          MultiSelectData.excludedFromSearch = MultiSelectData.isOptionDisabled;
          if (MultiSelectData.isOptionDisabled) MultiSelectData.toggle = null;else MultiSelectData.toggle = function () {
            var confirmed = setSelected(MultiSelectData.option, true);

            if (confirmed === null || confirmed) {
              createSelectedItem();
              triggerChange();
            }
          };
        } // TODO: refactore it

      }

      var item = {
        hoverInInternal: hoverInInternal,
        stopAndResetChoicesHover: function stopAndResetChoicesHover() {
          eventSkipper.setSkippable(); //disable Hover On MouseEnter - filter's changes should remove hover

          resetChoicesHover();
        },
        showChoices: showChoices,
        hideChoices: hideChoices,
        toggleHovered: toggleHovered,
        keyDownArrow: keyDownArrow,
        insertChoice: insertChoice,
        getIsVisble: function getIsVisble() {
          return choicesElement.style.display != 'none';
        }
      };
      return item;
    }

    function PicksPanel(createElement, pickContentGenerator, isComponentDisabled, requestPickCreate, requestPickRemove, processRemoveButtonClick // click to remove button
    ) {
      var list = List();

      function _createPick(multiSelectData, option) {
        var _createElement = createElement(),
            pickElement = _createElement.pickElement,
            attach = _createElement.attach;

        var item = {
          pickElement: pickElement
        };
        var removeFromList = list.add(item);

        var removeSelectedItem = function removeSelectedItem() {
          requestPickRemove(multiSelectData, function () {
            removeElement(pickElement);
            item.pickContent.dispose();
            removeFromList();
            return {
              createPick: function createPick() {
                return _createPick(multiSelectData, option);
              },
              count: list.getCount()
            };
          });
        };

        item.removeSelectedItem = removeSelectedItem; // processRemoveButtonClick removes the 
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
        // let removePickAndCloseChoices = () => {
        //     removeSelectedItem();
        //     //afterRemove();
        // };

        item.pickContent = pickContentGenerator(option, pickElement);
        item.pickContent.onRemove(function (event) {
          processRemoveButtonClick(removeSelectedItem, event);
        });
        item.pickContent.disable(isComponentDisabled);
        attach();
        requestPickCreate(multiSelectData, removeSelectedItem, list.getCount());
      }

      return {
        createPick: _createPick,
        removePicksTail: function removePicksTail() {
          var item = list.getTail();
          if (item) item.removeSelectedItem(); // always remove in this case
        },
        isEmpty: list.isEmpty,
        disable: function disable(isDisabled) {
          isComponentDisabled = isDisabled;
          list.forEach(function (i) {
            return i.pickContent.disable(isDisabled);
          });
        },
        deselectAll: function deselectAll() {
          list.forEach(function (i) {
            return i.removeSelectedItem();
          });
        },
        clear: function clear() {
          list.forEach(function (i) {
            return removeElement(i.pickElement);
          });
          list.reset();
        },
        dispose: function dispose() {
          list.forEach(function (i) {
            i.pickContent.dispose();
            removeElement(i.pickElement);
          });
        }
      };
    }

    function MultiSelectInputAspect(window, appendToContainer, filterInputElement, picksElement, choicesElement, showChoices, hideChoicesAndResetFilter, isChoiceEmpty, onClick, Popper) {
      appendToContainer();
      var document = window.document;
      var skipFocusout = false; // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container

      var skipoutMousedown = function skipoutMousedown() {
        skipFocusout = true;
      };

      var documentMouseup = function documentMouseup(event) {
        // if click outside container - close dropdown
        if (!(choicesElement === event.target || picksElement === event.target || choicesElement.contains(event.target) || picksElement.contains(event.target))) {
          hideChoicesAndResetFilter();
        }
      };

      var popper = null; //if (!!Popper.prototype && !!Popper.prototype.constructor.name) {

      popper = new Popper(filterInputElement, choicesElement, {
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
      /*}else{
          popper=Popper.createPopper( 
              choiceFilterInputElement, 
              choicesElement
              // ,  https://github.com/popperjs/popper.js/blob/next/docs/src/pages/docs/modifiers/prevent-overflow.mdx#mainaxis
              // {
              //     placement: 'bottom-start',
              //     modifiers: {
              //         preventOverflow: {enabled:false},
              //         hide: {enabled:false},
              //         flip: {enabled:false}
              //     }
              // }
          );
      }*/

      var filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

      var preventDefaultClickEvent = null;

      function alignAndShowChoices(event) {
        if (preventDefaultClickEvent != event) {
          if (!isChoiceEmpty()) {
            alignToFilterInputItemLocation(true);
            showChoices();
          }
        }

        preventDefaultClickEvent = null;
      }

      function alignToFilterInputItemLocation(force) {
        var offsetLeft = filterInputElement.offsetLeft;

        if (force || filterInputItemOffsetLeft != offsetLeft) {
          // position changed
          popper.update();
          filterInputItemOffsetLeft = offsetLeft;
        }
      }

      var componentDisabledEventBinder = EventBinder();
      return {
        dispose: function dispose() {
          popper.destroy();
          componentDisabledEventBinder.unbind();
        },
        alignToFilterInputItemLocation: alignToFilterInputItemLocation,
        processUncheck: function processUncheck(uncheckOption, event) {
          // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
          // never remove elements in the same event iteration
          window.setTimeout(function () {
            return uncheckOption();
          }, 0);
          preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
        },
        onChoicesShow: function onChoicesShow() {
          // add listeners that manages close dropdown on input's focusout and click outside container
          //container.removeEventListener("mousedown", containerMousedown);
          picksElement.addEventListener("mousedown", skipoutMousedown);
          choicesElement.addEventListener("mousedown", skipoutMousedown);
          document.addEventListener("mouseup", documentMouseup);
        },
        onChoicesHide: function onChoicesHide() {
          picksElement.removeEventListener("mousedown", skipoutMousedown);
          choicesElement.addEventListener("mousedown", skipoutMousedown);
          document.removeEventListener("mouseup", documentMouseup);
        },
        getSkipFocusout: function getSkipFocusout() {
          return skipFocusout;
        },
        resetSkipFocusout: function resetSkipFocusout() {
          skipFocusout = false;
        },
        enable: function enable() {
          componentDisabledEventBinder.bind(picksElement, "click", function (event) {
            onClick(event);
            alignAndShowChoices(event);
          }); // OPEN dropdown
        },
        disable: function disable() {
          componentDisabledEventBinder.unbind();
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
      MultiSelectData.choiceElement.style.display = isFiltered ? 'block' : 'none';
    }

    function resetChoices(MultiSelectDataList) {
      for (var i = 0; i < MultiSelectDataList.length; i++) {
        var multiSelectData = MultiSelectDataList[i];

        if (!multiSelectData.isHidden) {
          filterMultiSelectData(multiSelectData, true, i);
        }
      }
    }

    function collectFilterChoices(MultiSelectDataList, text) {
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
      function MultiSelect(optionsAdapter, setSelected, staticContent,
      /* styling, */
      pickContentGenerator, choiceContentGenerator, labelAdapter, //MultiSelect, 
      placeholderText, onUpdate, onDispose, popper, window) {
        this.onUpdate = onUpdate;
        this.onDispose = onDispose; // readonly

        this.optionsAdapter = optionsAdapter;
        this.staticContent = staticContent; //this.styling = styling;

        this.pickContentGenerator = pickContentGenerator;
        this.choiceContentGenerator = choiceContentGenerator;
        this.labelAdapter = labelAdapter; //this.createStylingComposite = createStylingComposite;

        this.placeholderText = placeholderText;
        this.setSelected = setSelected; // should I rebind this for callbacks? setSelected.bind(this);

        this.popper = popper;
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
        return this.filteredMultiSelectDataList ? this.filteredMultiSelectDataList : this.MultiSelectDataList;
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
        resetChoices(this.MultiSelectDataList);
        this.filteredMultiSelectDataList = null;
      } // -----------------------------------------------------------------------------------------------------------------------
      ;

      _proto.GetContainer = function GetContainer() {
        return this.staticContent.containerElement;
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
                  this.optionsPanel.insertChoice(multiSelectData, 
                      (p1,p2,p3)=>this.picksPanel.createPick(p1,p2,p3),
                      ()=>this.optionsAdapter.triggerChange(),
                      option.isSelected, option.isDisabled);
              else
                  multiSelectData.removeChoiceElement();
          }
          else 
          {
              if (multiSelectData.isSelected != option.isSelected)
              {
                  multiSelectData.isSelected=option.isSelected;
                  if (multiSelectData.isSelected)
                  {
                      // this.insertChoice(multiSelectData, (e)=>this.choicesElement.appendChild(e), isSelected, isDisabled);
                  }
                  else
                  {
                      // multiSelectData.removeChoiceElement();
                  }
              }
              if (multiSelectData.isDisabled != option.isDisabled)
              {
                  multiSelectData.isDisabled=option.isDisabled;
                  if (multiSelectData.isDisabled)
                  {
                      // this.insertChoice(multiSelectData, (e)=>this.choicesElement.appendChild(e), isSelected, isDisabled);
                  }
                  else
                  {
                      // multiSelectData.removeChoiceElement();
                  }
              }
          }    
          //multiSelectData.updateOption();
      }*/
      ;

      _proto.DeselectAll = function DeselectAll() {
        this.choicesPanel.hideChoices(); // always hide 1st

        this.picksPanel.deselectAll();
        this.resetFilter();
      };

      _proto.SelectAll = function SelectAll() {
        this.choicesPanel.hideChoices(); // always hide 1st

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (!multiSelectData.excludedFromSearch) if (multiSelectData.toggle) multiSelectData.toggle();
        }

        this.resetFilter();
      };

      _proto.empty = function empty() {
        // close drop down , remove filter
        this.choicesPanel.hideChoices(); // always hide 1st

        this.resetFilter();

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          if (multiSelectData.choiceElement) removeElement(multiSelectData.choiceElement);
        }

        this.resetMultiSelectDataList();
        this.picksPanel.clear();
        this.placeholderAspect.updatePlacehodlerVisibility();
      };

      _proto.UpdateData = function UpdateData() {
        this.empty(); // reinitiate

        this.updateDataImpl();
      };

      _proto.updateDataImpl = function updateDataImpl() {
        var _this = this;

        var fillChoices = function fillChoices() {
          var options = _this.optionsAdapter.getOptions();

          for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var isSelected = option.selected;
            var isOptionDisabled = option.disabled ? option.disabled : false;
            var isOptionHidden = option.hidden ? option.hidden : false;
            var MultiSelectData = {
              searchText: option.text.toLowerCase().trim(),
              excludedFromSearch: isSelected || isOptionDisabled || isOptionHidden,
              option: option,
              isOptionDisabled: isOptionDisabled,
              isHidden: isOptionHidden,
              choiceElement: null,
              choiceContent: null,
              //selectedPrev: null,
              //selectedNext: null,
              visible: false,
              toggle: null,
              pickElement: null,
              remove: null,
              disable: null,
              removeChoiceElement: null
            };

            _this.MultiSelectDataList.push(MultiSelectData);

            if (!isOptionHidden) {
              MultiSelectData.visible = true;
              MultiSelectData.visibleIndex = i;

              _this.choicesPanel.insertChoice(MultiSelectData,
              /*createSelectedItemGen*/
              function (multiSelectData
              /*,isOptionDisabled,setChoiceContentDisabled*/
              ) {
                _this.picksPanel.createPick(multiSelectData, multiSelectData.option
                /*,
                isOptionDisabled,
                setChoiceContentDisabled
                */
                ); //

              }, function (o, i) {
                return _this.setSelected(o, i);
              }, function () {
                return _this.optionsAdapter.triggerChange();
              }, isSelected //,isOptionDisabled
              );
            }
          }

          _this.aspect.alignToFilterInputItemLocation(false); //this.placeholderAspect.updatePlacehodlerVisibility();

        }; // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event


        if (document.readyState != 'loading') {
          fillChoices();
        } else {
          var domContentLoadedHandler = function domContentLoadedHandler() {
            fillChoices();
            document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
          };

          document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
        }
      };

      _proto.Dispose = function Dispose() {
        sync(this.onDispose, this.choicesPanel.hideChoices, this.optionsAdapter.dispose, this.picksPanel.dispose, this.filterPanel.dispose, this.labelAdapter.dispose, this.aspect.dispose, this.staticContent.dispose); //if (this.onDispose)
        //    this.onDispose(); // primary used to remove from jQuery tables
        // remove event listeners
        // TODO check if open
        // this.choicesPanel.hideChoices();
        // if (this.optionsAdapter.dispose)
        //    this.optionsAdapter.dispose();
        // if (this.picksPanel.dispose)
        // this.picksPanel.dispose();
        // removeElement(this.pickFilterElement);
        // this.filterPanel.dispose();
        // this.labelAdapter.dispose();
        // this.aspect.dispose();
        // this.containerAdapter.dispose();

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          multiSelectData.toggle = null;
          multiSelectData.remove = null;
          multiSelectData.removeChoiceElement = null;
          if (multiSelectData.DisposeChoiceElement) multiSelectData.DisposeChoiceElement();
          if (multiSelectData.ChoiceContent) multiSelectData.ChoiceContent.dispose();
        }
      };

      _proto.UpdateDisabled = function UpdateDisabled() {
        var isComponentDisabled = this.optionsAdapter.getDisabled();

        if (this.isComponentDisabled !== isComponentDisabled) {
          if (isComponentDisabled) {
            this.picksPanel.disable(true);
            this.aspect.disable();
            this.placeholderAspect.setDisabled(true);
            this.staticContent.disable();
          } else {
            this.picksPanel.disable(false);
            this.aspect.enable();
            this.placeholderAspect.setDisabled(false);
            this.staticContent.enable();
          }

          this.isComponentDisabled = isComponentDisabled;
        }
      };

      _proto.input = function input(filterInputValue, resetLength) {
        var text = filterInputValue.trim().toLowerCase();
        var isEmpty = false;
        if (text == '') isEmpty = true;else {
          // check if exact match, otherwise new search
          this.filteredMultiSelectDataList = collectFilterChoices(this.MultiSelectDataList, text);

          if (this.filteredMultiSelectDataList.length == 1) {
            var fullMatchMultiSelectData = this.filteredMultiSelectDataList[0];

            if (fullMatchMultiSelectData.searchText == text) {
              if (fullMatchMultiSelectData.toggle) fullMatchMultiSelectData.toggle();
              this.filterPanel.setEmpty(); // clear

              isEmpty = true;
            }
          }
        }
        if (isEmpty) this.processEmptyInput();else resetLength();
        this.choicesPanel.stopAndResetChoicesHover();

        if (this.getVisibleMultiSelectDataList().length == 1) {
          this.choicesPanel.hoverInInternal(0);
        }

        if (this.getVisibleMultiSelectDataList().length > 0) {
          this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

          this.choicesPanel.showChoices();
        } else {
          this.choicesPanel.hideChoices();
        }
      };

      _proto.init = function init() {
        var _this2 = this;

        var document = this.window.document;

        var createElement = function createElement(name) {
          return document.createElement(name);
        }; //var pickFilterElement = createElement('LI'); // detached
        //this.pickFilterElement=pickFilterElement;


        this.filterPanel = FilterPanel(createElement, function (filterInputElement) {
          _this2.staticContent.pickFilterElement.appendChild(filterInputElement);

          _this2.labelAdapter.init(filterInputElement);

          _this2.staticContent.picksElement.appendChild(_this2.staticContent.pickFilterElement); // located filter in selectionsPanel                    

        }, function () {
          _this2.staticContent.focusIn();
        }, // focus in - show dropdown
        function () {
          if (!_this2.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
            {
              _this2.resetFilter(); // if do not do this we will return to filtered list without text filter in input


              _this2.staticContent.focusOut();
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
          return _this2.choicesPanel.hideChoices();
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
          _this2.choicesPanel.hideChoices(); // always hide 1st


          _this2.resetFilter();
        }, // esc keyup 
        function (filterInputValue, resetLength) {
          _this2.placeholderAspect.updatePlacehodlerVisibility();

          _this2.input(filterInputValue, resetLength);
        }, // filter
        function () {
          _this2.placeholderAspect.updateEmptyInputWidth();
        });
        this.picksPanel = PicksPanel(
        /*createElement*/
        function () {
          var pickElement = createElement('LI');
          return {
            pickElement: pickElement,
            attach: function attach() {
              return _this2.staticContent.picksElement.insertBefore(pickElement, _this2.staticContent.pickFilterElement);
            }
          };
        }, this.pickContentGenerator, this.isComponentDisabled,
        /*onPickCreated*/
        function (multiSelectData, removePick, count) {
          multiSelectData.excludedFromSearch = true; // all selected excluded from search

          multiSelectData.toggle = function () {
            return removePick();
          };

          multiSelectData.ChoiceContent.select(true);
          if (count == 1) _this2.placeholderAspect.updatePlacehodlerVisibility();
        },
        /*onPickRemoved*/
        function (multiSelectData, removePick) {
          var confirmed = _this2.setSelected(multiSelectData.option, false);

          if (confirmed === null || confirmed) {
            var _removePick = removePick(),
                createPick = _removePick.createPick,
                count = _removePick.count;

            multiSelectData.excludedFromSearch = multiSelectData.isOptionDisabled;

            if (multiSelectData.isOptionDisabled) {
              multiSelectData.ChoiceContent.disable(
              /*isDisabled*/
              true,
              /*isSelected*/
              true); // TODO test it, THERE SHOULD BE SOMETHING WRONGGGG

              multiSelectData.toggle = null;
            } else {
              multiSelectData.toggle = function () {
                var confirmed = _this2.setSelected(multiSelectData.option, true);

                if (confirmed === null || confirmed) {
                  createPick(multiSelectData, multiSelectData.option);

                  _this2.optionsAdapter.triggerChange();
                }
              };
            }

            multiSelectData.ChoiceContent.select(false);
            if (count == 0) _this2.placeholderAspect.updatePlacehodlerVisibility();

            _this2.optionsAdapter.triggerChange();
          }
        }, function (doUncheck, event) {
          _this2.aspect.processUncheck(doUncheck, event);

          _this2.choicesPanel.hideChoices(); // always hide 1st


          _this2.resetFilter();
        });
        this.choicesPanel = ChoicesPanel(createElement, this.staticContent.choicesElement, function () {
          return _this2.aspect.onChoicesShow();
        }, function () {
          return _this2.aspect.onChoicesHide();
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
        }, this.staticContent.picksElement, this.staticContent.filterInputElement);
        this.placeholderAspect.updateEmptyInputWidth();
        this.aspect = MultiSelectInputAspect(this.window, function () {
          return _this2.staticContent.appendToContainer();
        }, this.staticContent.filterInputElement, this.staticContent.picksElement, this.staticContent.choicesElement, function () {
          return _this2.choicesPanel.showChoices();
        }, function () {
          _this2.choicesPanel.hideChoices();

          _this2.resetFilter();
        }, function () {
          return _this2.getVisibleMultiSelectDataList().length == 0;
        },
        /*onClick*/
        function (event) {
          if (!_this2.filterPanel.isEventTarget(event)) _this2.filterPanel.setFocus();
        }, this.popper);
        this.staticContent.attachContainer();
        this.onUpdate();
        this.UpdateDisabled(); // should be done after updateDataImpl

        this.updateDataImpl();
        if (this.optionsAdapter.onReset) this.optionsAdapter.onReset(function () {
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

    function extractClasses(styling) {
      var value = [];

      if (styling instanceof String) {
        value = [].concat(styling.split(' '));
      } else if (styling instanceof Array) {
        value = [].concat(styling);
      } else if (styling instanceof Object) {
        if (styling.classes) {
          if (styling.classes instanceof String) {
            value = [].concat(styling.classes.split(' '));
          } else if (styling.classes instanceof Array) {
            value = [].concat(styling.classes);
          }
        }
      }

      return value;
    }

    function mergeStylingItem(destination, styling) {
      if (styling) {
        if (styling instanceof String) {
          destination.classes = [].concat(styling.split(' '));
        } else if (styling instanceof Array) {
          destination.classes = [].concat(styling);
        } else if (styling instanceof Object) {
          if (styling.classes) {
            if (styling.classes instanceof String) {
              destination.classes = [].concat(styling.classes.split(' '));
            } else if (styling.classes instanceof Array) {
              destination.classes = [].concat(styling.classes);
            }
          } else {
            if (styling.styles) {
              extendAndOverride(destination.styles, styling.styles);
            } else {
              extendAndOverride(destination.styles, styling);
            }
          }
        }
      }

      return destination;
    }

    function cloneStylings(stylings) {
      var destination = {};

      if (stylings) {
        for (var property in stylings) {
          destination[property] = {
            classes: [],
            styles: {}
          };
          mergeStylingItem(destination[property], stylings[property]);
        }
      }

      return destination;
    }
    function mergeStylings(stylings, compensations) {
      if (compensations) {
        for (var property in compensations) {
          mergeStylingItem(stylings[property], compensations[property]);
        }
      }

      return stylings;
    }
    function setStylingStyles(stylings, name, styles) {
      var styling = stylings[name];

      if (!styling) {
        styling = {
          styles: {},
          classe: []
        };
        stylings[name] = styling;
      }

      extendAndOverride(styling.styles, styles);
    }
    function setStylingСlasses(destStylings, name, sourceStylings) {
      if (!sourceStylings[name]) {
        sourceStylings[name] = {
          styles: {},
          classe: []
        };
      }

      if (!destStylings[name]) destStylings[name] = {
        styles: {},
        classe: []
      };
      var classes = extractClasses(sourceStylings[name]);
      destStylings[name].classes = classes;
    }
    function setStyling$1(styling) {
      setClassAndStyle(styling.classes, styling.styles);
    }
    function unsetStyling(styling) {
      unsetClassAndStyle(styling.classes, styling.styles);
    }

    function pickContentGenerator(option, pickElement, stylings) {
      setStyling$1(pickElement, stylings.pick);
      pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
      var pickContentElement = pickElement.querySelector("SPAN");
      pickContentElement.textContent = option.text;

      var disable = function disable(isDisabled) {
        if (isDisabled) setStyling$1(pickElement, stylings.pickContent_disabled);else unsetStyling(pickElement, stylings.pickContent_disabled);
        pickButtonElement.disabled = isDisabled;
      };

      disable(option.disabled);
      var pickButtonElement = pickContentElement.querySelector("BUTTON"); // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
      // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 

      pickButtonElement.style.float = "none";
      setStyling$1(pickButtonElement, stylings.pickButton); // bs close class set the float:right

      var eventBinder = EventBinder();
      setStyling$1(pickElement, stylings.pick);
      setStyling$1(pickButtonElement, stylings.pickButton);
      return {
        disable: disable,
        onRemove: function onRemove(removePick) {
          eventBinder.bind(pickButtonElement, "click", function (event) {
            return removePick(event);
          });
        },
        dispose: function dispose() {
          eventBinder.unbind();
        }
      };
    }

    function choiceContentGenerator(option, choiceElement, stylings) {
      setStyling$1(choiceElement, stylings.choice);
      choiceElement.innerHTML = '<div><input type="checkbox"><label></label></div>';
      var choiceContentElement = choiceElement.querySelector('DIV');
      var choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
      var choiceLabelElement = choiceContentElement.querySelector('LABEL');
      setStyling$1(choiceContentElement, stylings.choiceContent);
      setStyling$1(choiceCheckBoxElement, stylings.choiceCheckBox);
      setStyling$1(choiceLabelElement, stylings.choiceLabel);
      choiceLabelElement.textContent = option.text;
      var eventBinder = EventBinder();
      return {
        select: function select(isSelected) {
          choiceCheckBoxElement.checked = isSelected;
        },
        disable: function disable(isDisabled, isSelected) {
          var action = isDisabled ? setStyling$1 : unsetStyling;
          action(choiceCheckBoxElement, stylings.choiceCheckBox_disabled);
          action(choiceLabelElement, stylings.choiceLabel_disabled); // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"

          choiceCheckBoxElement.disabled = isDisabled && !isSelected;
        },
        hoverIn: function hoverIn() {
          setStyling$1(choiceElement, stylings.choice_hover);
        },
        hoverOut: function hoverOut() {
          unsetStyling(choiceElement, stylings.choice_hover);
        },
        onSelected: function onSelected(toggle) {
          eventBinder.bind(choiceCheckBoxElement, "change", toggle);
          eventBinder.bind(choiceElement, "click", function (event) {
            if (choiceElement === event.target || choiceElement.contains(event.target)) {
              toggle();
            }
          });
        },
        dispose: function dispose() {
          eventBinder.unbind();
        }
      };
    }

    function staticContentGenerator(element, createElement, containerClass, stylings) {
      var selectElement = null;
      var containerElement = null;

      if (element.tagName == 'SELECT') {
        selectElement = element;

        if (containerClass) {
          containerElement = closestByClassName(selectElement, containerClass); // TODO: do I need this?    
          //if (selectElement.nextSibling  && selectElement.nextSibling.classList.contains(containerClass) )
          //    containerElement = selectElement.parentNode;
        }
      } else if (element.tagName == "DIV") {
        containerElement = element;
        selectElement = findDirectChildByTagName(element, 'SELECT');
        if (!selectElement) throw new Error("BsMultiSelect: There are no SELECT element or options in the configuraion");
      } else {
        element.style.backgroundColor = 'red';
        element.style.color = 'white';
        throw new Error('BsMultiSelect: Only DIV and SELECT supported');
      }

      var picksElement = null;
      var ownPicksElement = false;
      if (containerElement) picksElement = findDirectChildByTagName(containerElement, 'UL');

      if (!picksElement) {
        picksElement = createElement('UL');
        ownPicksElement = true;
      }

      var ownContainerElement = false;

      if (!containerElement) {
        containerElement = createElement('DIV');
        ownContainerElement = true;
      }

      setStyling$1(containerElement);
      var choicesElement = createElement('UL');
      choicesElement.style.display = "none";
      var backupDisplay = null;

      if (selectElement) {
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
      }

      var pickFilterElement = createElement('LI');
      var filterInputElement = createElement('INPUT');
      setStyling$1(picksElement, stylings.picks);
      setStyling$1(choicesElement, stylings.choices);
      setStyling$1(pickFilterElement, stylings.pickFilter);
      setStyling$1(filterInputElement, stylings.filterInput);
      var createInputId = null;
      if (selectElement) createInputId = function createInputId() {
        return containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
      };else createInputId = function createInputId() {
        return containerClass + "-generated-filter-" + containerElement.id;
      };
      return {
        containerElement: containerElement,
        picksElement: picksElement,
        choicesElement: choicesElement,
        pickFilterElement: pickFilterElement,
        filterInputElement: filterInputElement,
        createInputId: createInputId,
        // init(){
        //     if (ownPicksElement)
        //         containerElement.appendChild(picksElement);
        // },
        attachContainer: function attachContainer() {
          if (ownContainerElement) selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
        },
        appendToContainer: function appendToContainer() {
          if (ownContainerElement || !selectElement) {
            if (ownPicksElement) containerElement.appendChild(picksElement);
            containerElement.appendChild(choicesElement);
          } else {
            if (selectElement) {
              // TODO picksElement element should be moved to attach
              selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
              if (ownPicksElement) selectElement.parentNode.insertBefore(picksElement, choicesElement);
            }
          }
        },
        enable: function enable() {
          unsetStyling(picksElement, stylings.picks_disabled);
        },
        disable: function disable() {
          setStyle(picksElement, stylings.picks_disabled);
        },
        focusIn: function focusIn() {
          setStyle(picksElement, stylings.picks_focus);
        },
        focusOut: function focusOut() {
          unsetStyling(picksElement, stylings.picks_focus);
        },
        dispose: function dispose() {
          if (ownContainerElement) containerElement.parentNode.removeChild(containerElement);
          if (ownPicksElement) picksElement.parentNode.removeChild(picksElement);
          choicesElement.parentNode.removeChild(choicesElement);
          if (pickFilterElement.parentNode) pickFilterElement.parentNode.removeChild(pickFilterElement);
          if (filterInputElement.parentNode) filterInputElement.parentNode.removeChild(filterInputElement);
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
        setStyle(picksElement, picksStyleLg);
      } else if (size == "custom-select-sm" || size == "input-group-sm") {
        setStyle(picksElement, picksStyleSm);
      } else {
        setStyle(picksElement, picksStyleDef);
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
      var value = null;

      var updateIsValid = function updateIsValid() {
        return updateIsValidForAdapter(picksElement, optionsAdapter);
      };

      if (configuration.useCss) {
        value = Object.create({
          updateIsValid: updateIsValid,
          updateSize: function updateSize() {
            return updateSizeForAdapter(picksElement, optionsAdapter);
          }
        });
      } else {
        var picksStyleLg = configuration.picksStyleLg,
            picksStyleSm = configuration.picksStyleSm,
            picksStyleDef = configuration.picksStyleDef;
        value = Object.create({
          updateIsValid: updateIsValid,
          updateSize: function updateSize() {
            return updateSizeJsForAdapter(picksElement, picksStyleLg, picksStyleSm, picksStyleDef, optionsAdapter);
          }
        });
      }

      return value;
    }
    function pushIsValidClassToPicks(staticContent, stylings) {
      var defFocusIn = staticContent.focusIn;

      staticContent.focusIn = function () {
        var picksElement = staticContent.picksElement;

        if (picksElement.classList.contains("is-valid")) {
          setStyling(picksElement, stylings.picks_focus_valid);
        } else if (picksElement.classList.contains("is-invalid")) {
          setStyling(picksElement, stylings.picks_focus_invalid);
        } else {
          defFocusIn();
        }
      };
    }
    function adjustBsOptionAdapterConfiguration(configuration, selectElement, containerElement) {
      if (!configuration.getDisabled) {
        var fieldset = closestByTagName(selectElement, 'fieldset');

        if (fieldset) {
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
    }
    function getLabelElement(selectElement) {
      var value = null;
      var formGroup = closestByClassName(selectElement, 'form-group');

      if (formGroup) {
        value = formGroup.querySelector("label[for=\"" + selectElement.id + "\"]");
      }

      return value;
    }

    var transformStyles = [{
      old: 'selectedPanelDisabledBackgroundColor',
      opt: 'nocss_picks_disabled',
      style: "backgroundColor",
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelFocusValidBoxShadow',
      opt: 'nocss_picks_focus_valid',
      style: "boxShadow",
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelFocusInvalidBoxShadow',
      opt: 'nocss_picks_focus_invalid',
      style: "boxShadow",
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelDefMinHeight',
      opt: 'nocss_picks_def',
      style: "minHeight",
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelLgMinHeight',
      opt: 'nocss_picks_lg',
      style: "minHeight",
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelSmMinHeight',
      opt: 'nocss_picks_sm',
      style: "minHeight",
      samplVal: "'myValue'"
    }, {
      old: 'selectedItemContentDisabledOpacity',
      opt: 'nocss_choiceLabel_disabled',
      style: "opacity",
      samplVal: "'myValue'"
    }];
    var transformClasses = [{
      old: 'dropDownMenuClass',
      opt: 'choices',
      samplVal: "'myValue'"
    }, {
      old: 'dropDownItemClass',
      opt: 'choice',
      samplVal: "'myValue'"
    }, {
      old: 'dropDownItemHoverClass',
      opt: 'choice_hover',
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelClass',
      opt: 'picks',
      samplVal: "'myValue'"
    }, {
      old: 'selectedItemClass',
      opt: 'pick',
      samplVal: "'myValue'"
    }, {
      old: 'removeSelectedItemButtonClass',
      opt: 'pickButton',
      samplVal: "'myValue'"
    }, {
      old: 'filterInputItemClass',
      opt: 'pickFilter',
      samplVal: "'myValue'"
    }, {
      old: 'filterInputClass',
      opt: 'filterInput',
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelFocusClass',
      opt: 'picks_focus',
      samplVal: "'myValue'"
    }, {
      old: 'selectedPanelDisabledClass',
      opt: 'picks_disabled',
      samplVal: "'myValue'"
    }, {
      old: 'selectedItemContentDisabledClass',
      opt: 'pick_disabled',
      samplVal: "'myValue'"
    }];
    function adjustLegacyConfiguration(configuration) {
      if (configuration.selectedPanelFocusBorderColor || configuration.selectedPanelFocusBoxShadow) {
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - nocss_picks_focus:{borderColor:'myValue', boxShadow:'myValue'}");

        if (!configuration.nocss_picks_focus) {
          configuration.nocss_picks_focus = {
            boxShadow: configuration.selectedPanelFocusBoxShadow,
            borderColor: configuration.selectedPanelFocusBorderColor
          };
        }

        delete configuration.selectedPanelFocusBorderColor;
        delete configuration.selectedPanelFocusBoxShadow;
      }

      transformStyles.forEach(function (i) {
        if (configuration[i.old]) {
          console.log("DashboarCode.BsMultiSelect: " + i.old + " is depricated, use - " + i.opt + ":{" + i.style + ":'" + i.samplVal + "'}");

          if (!configuration[i.opt]) {
            var opt = {};
            opt[i.style] = configuration[i.old];
            configuration[i.opt] = opt.xx;
          }

          delete configuration[i.old];
        }
      });

      if (configuration.inputColor) {
        console.log("DashboarCode.BsMultiSelect: inputColor is depricated, remove parameter");
        delete configuration.inputColor;
      }

      transformClasses.forEach(function (i) {
        if (configuration[i.old]) {
          console.log("DashboarCode.BsMultiSelect: " + i.old + " is depricated, use - stylings:{" + i.opt + ":" + i.samplVal + "}");

          if (!stylings[i.opt]) {
            stylings[i.opt] = configuration[i.old];
          }

          delete configuration[i.old];
        }
      });
      if (!configuration.stylings) configuration.stylings = {};
      var stylings = configuration.stylings;

      if (configuration.useCss) {
        console.log("DashboarCode.BsMultiSelect: useCss is depricated, use - 'useOwnCss: false|true'");

        if (!stylings.pick_disabled) {
          configuration.useOwnCss = configuration.useCss;
        }

        delete configuration.useCss;
      }
    }
    function replaceConfigurationClassValues(stylings, configuration) {
      var cfgStylings = configuration.stylings;

      if (cfgStylings) {
        if (cfgStylings.choices) {
          setStylingСlasses(stylings, "choices", cfgStylings);
        }

        if (cfgStylings.choice) {
          setStylingСlasses(stylings, "choice", cfgStylings);
        }

        if (cfgStylings.choice_hover) {
          setStylingСlasses(stylings, "choice_hover", cfgStylings);
        }

        if (cfgStylings.picks) {
          setStylingСlasses(stylings, "picks", cfgStylings);
        }

        if (cfgStylings.pick) {
          setStylingСlasses(stylings, "classes", cfgStylings);
        }

        if (cfgStylings.pickButton) {
          setStylingСlasses(stylings, "pickButton", cfgStylings);
        }

        if (cfgStylings.pickFilter) {
          setStylingСlasses(stylings, "pickFilter", cfgStylings);
        }

        if (cfgStylings.filterInput) {
          setStylingСlasses(stylings, "filterInput", cfgStylings);
        }

        if (cfgStylings.picks_focus) {
          setStylingСlasses(stylings, "picks_focus", cfgStylings);
        }

        if (cfgStylings.picks_disabled) {
          setStylingСlasses(stylings, "picks_disabled", cfgStylings);
        }

        if (cfgStylings.pick_disabled) {
          setStylingСlasses(stylings, "pick_disabled", cfgStylings);
        }
      }
    }
    function injectConfigurationStyleValues(stylings, configuration) {
      if (configuration.nocss_picks_disabled) {
        setStylingStyles(stylings, "picks_disabled", configuration.nocss_picks_disabled);
      }

      if (configuration.nocss_picks_focus) {
        setStylingStyles(stylings, "picks_focus", configuration.nocss_picks_focus);
      }

      if (configuration.nocss_picks_focus_valid) {
        setStylingStyles(stylings, "picks_focus_valid", configuration.nocss_picks_focus_valid);
      }

      if (configuration.nocss_picks_focus_invalid) {
        setStylingStyles(stylings, "picks_focus_invalid", configuration.nocss_picks_focus_invalid);
      }

      if (configuration.nocss_picks_def) {
        setStylingStyles(stylings, "picks_def", configuration.nocss_picks_def);
      }

      if (configuration.nocss_picks_lg) {
        setStylingStyles(stylings, "picks_lg", configuration.nocss_picks_lg);
      }

      if (configuration.nocss_picks_sm) {
        setStylingStyles(stylings, "picks_sm", configuration.nocss_picks_sm);
      }

      if (configuration.nocss_choiceLabel_disabled) {
        setStylingStyles(stylings, "choiceLabel_disabled", configuration.nocss_choiceLabel_disabled);
      }
    }

    var stylings = {
      choices: 'dropdown-menu',
      // bs4, in bsmultiselect.scss as ul.dropdown-menu
      choice_hover: 'hover',
      //  not bs4, in scss as 'ul.dropdown-menu li.hover'
      // TODO
      choice_selected: '',
      // not used? should be used in OptionsPanel.js
      choice_disabled: '',
      // not used? should be used in OptionsPanel.js
      picks: 'form-control',
      // bs4, in scss 'ul.form-control'
      picks_focus: 'focus',
      // not bs4, in scss 'ul.form-control.focus'
      picks_disabled: 'disabled',
      //  not bs4, in scss 'ul.form-control.disabled'
      pick_disabled: '',
      pickFilter: '',
      filterInput: '',
      // used in BsPickContentStylingCorrector
      pick: 'badge',
      // bs4
      pickContent_disabled: 'disabled',
      // not bs4, in scss 'ul.form-control li span.disabled'
      pickButton: 'close',
      // bs4
      // used in BsChoiceContentStylingCorrector
      choice: '',
      choiceCheckBox_disabled: 'disabled',
      //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
      choiceContent: 'custom-control custom-checkbox',
      // bs4
      choiceCheckBox: 'custom-control-input',
      // bs4
      choiceLabel: 'custom-control-label justify-content-start' // 

    };
    var compensation = {
      choices: {
        listStyleType: 'none'
      },
      picks: {
        listStyleType: 'none',
        display: 'flex',
        flexWrap: 'wrap'
      },
      choice: 'px-2',
      choice_hover: 'text-primary bg-light',
      filterInput: {
        class: 'form-control',
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          listStyleType: 'none',
          marginBottom: 0,
          height: 'auto'
        }
      },
      // used in StylingCorrector
      picks_disabled: {
        backgroundColor: '#e9ecef'
      },
      picks_focus: {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
      },
      picks_focus_valid: {
        boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'
      },
      picks_focus_invalid: {
        boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
      },
      // used in BsAppearance
      picks_def: {
        minHeight: 'calc(2.25rem + 2px)'
      },
      picks_lg: {
        minHeight: 'calc(2.875rem + 2px)'
      },
      picks_sm: {
        minHeight: 'calc(1.8125rem + 2px)'
      },
      // used in BsPickContentStylingCorrector
      pick: {
        paddingLeft: '0px',
        lineHeight: '1.5em'
      },
      pickButton: {
        fontSize: '1.5em',
        lineHeight: '.9em'
      },
      pickContent_disabled: {
        opacity: '.65'
      },
      // avoid opacity on pickElement's border
      // used in BsChoiceContentStylingCorrector
      choiceLabel_disabled: {
        opacity: '.65'
      } // more flexible than {color: '#6c757d'}

    } // 1) do not use css - classes  + styling js + prediction clases + compensation js
    // 2) use scss - classes only 
    (function (window, $) {
      var defaults = {
        useOwnCss: false,
        containerClass: "dashboardcode-bsmultiselect",
        stylings: stylings,
        compensation: compensation,
        placeholder: '',
        staticContentGenerator: staticContentGenerator,
        getLabelElement: getLabelElement,
        pickContentGenerator: pickContentGenerator,
        choiceContentGenerator: choiceContentGenerator,
        buildConfiguration: null,
        setSelected: function setSelected(option, value) {
          option.selected = value;
        },
        optionsAdapter: null,
        options: null,
        getDisabled: null,
        getSize: null,
        getIsValid: null,
        getIsInvalid: null
      };

      function createPlugin(element, settings, onDispose) {
        if (typeof Popper === 'undefined') {
          throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
        }

        var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

        adjustLegacyConfiguration(configuration);
        var cfgStylings = configuration.stylings;
        var cfgCompensation = configuration.compensation;
        configuration.stylings = null;
        configuration.compensation = null;
        $.extend(settings, defaults);
        configuration.stylings = cloneStylings(defaults.stylings); // TODO

        configuration.compensation = cloneStylings(defaults.compensation); // TODO
        //TODO: do something with cfgStylings and cfgCompensation

        injectConfigurationStyleValues(configuration.stylings, configuration);
        replaceConfigurationClassValues(configuration.stylings, configuration); // --------------------------------------------------------------

        var init = configuration.buildConfiguration(element, configuration); // --------------------------------------------------------------

        var stylings = configuration.stylings;
        var useOwnCss = configuration.useOwnCss; // useOwnCss

        if (!useOwnCss) {
          mergeStylings(stylings, configuration.compensation); // TODO merge
        }

        var staticContent = configuration.staticContentGenerator(element, function (name) {
          return window.document.createElement(name);
        }, stylings, configuration.containerClass);
        var optionsAdapter = configuration.optionsAdapter;

        if (!optionsAdapter) {
          var trigger = function trigger(eventName) {
            $(element).trigger(eventName);
          };

          if (configuration.options) {
            optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger);
          } else {
            adjustBsOptionAdapterConfiguration(configuration, staticContent.selectElement, staticContent.containerElement);
            optionsAdapter = OptionsAdapterElement(staticContent.selectElement, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger);
          }
        }

        if (!useOwnCss) {
          pushIsValidClassToPicks(staticContent, stylings);
        }

        var labelAdapter = LabelAdapter(configuration.labelElement, staticContent.createInputId);

        if (!configuration.placeholder) {
          configuration.placeholder = $(element).data("bsmultiselect-placeholder");
          if (!configuration.placeholder) configuration.placeholder = $(element).data("placeholder");
        }

        var bsAppearance = createBsAppearance(staticContent.picksElement, configuration, optionsAdapter);

        var onUpdate = function onUpdate() {
          bsAppearance.updateSize();
          bsAppearance.updateIsValid();
        };

        var multiSelect = new MultiSelect(optionsAdapter, configuration.setSelected, staticContent, function (option, pickElement) {
          return configuration.pickContentGenerator(option, pickElement, stylings);
        }, function (option, choiceElement) {
          return configuration.choiceContentGenerator(option, choiceElement, stylings);
        }, //pickContentGeneratorInst,
        //choiceContentGeneratorInst,
        labelAdapter, //createStylingComposite,
        configuration.placeholder, onUpdate, onDispose, Popper, window);
        multiSelect.UpdateSize = bsAppearance.updateSize;
        multiSelect.UpdateIsValid = bsAppearance.updateIsValid;
        if (init && init instanceof Function) init(multiSelect);
        multiSelect.init();
        return multiSelect;
      }

      addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    })(window, $, Popper);

})));
//# sourceMappingURL=BsMultiSelect.js.map
