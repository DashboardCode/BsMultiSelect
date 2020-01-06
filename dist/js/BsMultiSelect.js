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

    function removeChildren(element) {
      var toRemove = element.firstChild;

      while (toRemove) {
        element.removeChild(toRemove);
        toRemove = element.firstChild;
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

    function ChoicesPanel(createElement, choicesElement, onShow, onHide, eventSkipper, choiceContentGenerator, getVisibleMultiSelectDataList, resetFilter, updateChoicesLocation, filterPanelSetFocus) {
      // prevent heavy understandable styling error
      setStyles(choicesElement, choicesStyle);
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
          hoveredMultiSelectData.toggle();
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
        var choiceContent = choiceContentGenerator(choiceElement, MultiSelectData.option);
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
          MultiSelectData.toggle();
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
          if (MultiSelectData.isOptionDisabled) MultiSelectData.toggle = function () {};else MultiSelectData.toggle = function () {
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

    function PicksPanel(createElement, picksElement, init, pickContentGenerator, isComponentDisabled, //afterRemove,
    onClick, // click to open dropdown
    onPickCreated, onPickRemoved, processRemoveButtonClick // click to remove button
    ) {
      var list = List();
      var pickFilterElement = createElement('LI'); // detached

      picksElement.appendChild(pickFilterElement); // located filter in selectionsPanel

      init(pickFilterElement);

      function createPick(multiSelectData, option) {
        var pickElement = createElement('LI');
        var item = {
          pickElement: pickElement
        };
        var removeFromList = list.add(item);

        var removeSelectedItem = function removeSelectedItem() {
          onPickRemoved(multiSelectData, function () {
            removeElement(pickElement);
            item.pickContent.dispose();
            removeFromList();
            return {
              createSelectedItem: function createSelectedItem() {
                createPick(multiSelectData, option);
                onPickCreated(multiSelectData, removeSelectedItem, list.getCount());
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

        var onRemoveSelectedItemEvent = function onRemoveSelectedItemEvent(event) {
          processRemoveButtonClick(removeSelectedItem
          /*() => removePickAndCloseChoices()*/
          , event);
        };

        item.pickContent = pickContentGenerator(pickElement, option, onRemoveSelectedItemEvent);
        item.pickContent.disable(isComponentDisabled);
        picksElement.insertBefore(pickElement, pickFilterElement);
        onPickCreated(multiSelectData, list.getCount(), removeSelectedItem);
      }

      var eventBinder = EventBinder();
      return {
        pickFilterElement: pickFilterElement,
        createPick: createPick,
        removePicksTail: function removePicksTail() {
          var item = list.getTail();
          if (item) item.removeSelectedItem(); // always remove in this case
        },
        isEmpty: list.isEmpty,
        enable: function enable() {
          isComponentDisabled = false;
          list.forEach(function (i) {
            return i.pickContent.disable(false);
          });
          eventBinder.bind(picksElement, "click", function (event) {
            return onClick(event);
          }); // OPEN dropdown
        },
        disable: function disable() {
          isComponentDisabled = true;
          list.forEach(function (i) {
            return i.pickContent.disable(true);
          });
          eventBinder.unbind();
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
          removeChildren(picksElement);
          eventBinder.unbind();
          list.forEach(function (i) {
            return i.pickContent.dispose();
          });
        }
      };
    }

    function MultiSelectInputAspect(window, appendToContainer, choiceFilterInputElement, picksElement, choicesElement, showChoices, hideChoicesAndResetFilter, isChoiceEmpty, Popper) {
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

      popper = new Popper(choiceFilterInputElement, choicesElement, {
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
        alignAndShowChoices: alignAndShowChoices,
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
      function MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, pickContentGenerator, choiceContentGenerator, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, popper, window) {
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
        resetChoices(this.MultiSelectDataList);
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
          if (!multiSelectData.excludedFromSearch) multiSelectData.toggle();
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
        if (this.onDispose) this.onDispose(); // primary used to remove from jQuery tables
        // remove event listeners
        // TODO check if open

        this.choicesPanel.hideChoices();
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
          multiSelectData.removeChoiceElement = null;
          if (multiSelectData.DisposeChoiceElement) multiSelectData.DisposeChoiceElement();
          if (multiSelectData.ChoiceContent) multiSelectData.ChoiceContent.dispose();
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
          this.filteredMultiSelectDataList = collectFilterChoices(this.MultiSelectDataList, text);

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
        this.picksPanel = PicksPanel( //this.setSelected,
        createElement, this.containerAdapter.picksElement, function (filterItemElement) {
          lazyfilterItemInputElementAtach(filterItemElement);
        }, this.pickContentGenerator, this.isComponentDisabled, // /*afterRemove*/() => {
        //     this.choicesPanel.hideChoices(); // always hide 1st
        //     this.resetFilter();
        // },

        /*onClick*/
        function (event) {
          if (!_this2.filterPanel.isEventTarget(event)) _this2.filterPanel.setFocus();

          _this2.aspect.alignAndShowChoices(event);
        },
        /*onPickCreated*/
        function (multiSelectData, count, removePick) {
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

          if (confirmed == null || confirmed) {
            var _removePick = removePick(),
                createSelectedItem = _removePick.createSelectedItem,
                count = _removePick.count;

            multiSelectData.excludedFromSearch = multiSelectData.isOptionDisabled;

            if (multiSelectData.isOptionDisabled) {
              multiSelectData.ChoiceContent.setChoiceContentDisabled(false);

              multiSelectData.toggle = function () {};
            } else {
              multiSelectData.toggle = function () {
                var confirmed = _this2.setSelected(multiSelectData.option, true);

                if (confirmed == null || confirmed) {
                  createSelectedItem(multiSelectData, multiSelectData.option);

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
        this.choicesPanel = ChoicesPanel(createElement, this.containerAdapter.choicesElement, function () {
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
        }, this.containerAdapter.picksElement, this.filterPanel.filterInputElement);
        this.placeholderAspect.init();
        this.placeholderAspect.updateEmptyInputWidth();
        this.aspect = MultiSelectInputAspect(this.window, function () {
          return _this2.containerAdapter.appendToContainer();
        }, this.picksPanel.pickFilterElement, this.containerAdapter.picksElement, this.containerAdapter.choicesElement, function () {
          return _this2.choicesPanel.showChoices();
        }, function () {
          _this2.choicesPanel.hideChoices();

          _this2.resetFilter();
        }, function () {
          return _this2.getVisibleMultiSelectDataList().length == 0;
        }, this.popper);
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
        disablePickContent: function disablePickContent(pickContentElement) {
          setStyles(pickContentElement, configuration.pickContentStyleDisabled);
        },
        createPickContent: function createPickContent(pickElement, pickButtonElement) {
          setStyles(pickElement, configuration.pickStyle);
          setStyles(pickButtonElement, configuration.pickButtonStyle);
        }
      };
    }

    function bsPickContentGenerator(pickElement, option, removePick, configuration, stylingCorrector) {
      addClasses(pickElement, configuration.pickClass);
      pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
      var pickContentElement = pickElement.querySelector("SPAN");
      pickContentElement.textContent = option.text;

      if (option.disabled) {
        addClasses(pickContentElement, configuration.pickContentClassDisabled);
        if (stylingCorrector && stylingCorrector.disablePickContent) stylingCorrector.disablePickContent(pickContentElement);
      }

      var pickButtonElement = pickElement.querySelector("BUTTON"); // bs 'close' class that will be added to button set the float:right, therefore it impossible to configure no-warp policy 
      // with .css("white-space", "nowrap") or  .css("display", "inline-block"); TODO: migrate to flex? 

      pickButtonElement.style.float = "none";
      addClasses(pickButtonElement, configuration.pickButtonClass); // bs close class set the float:right

      var eventBinder = EventBinder();
      eventBinder.bind(pickButtonElement, "click", function (event) {
        return removePick(event);
      });
      if (stylingCorrector && stylingCorrector.createPickContent) stylingCorrector.createPickContent(pickElement, pickButtonElement);
      return {
        disable: function disable(isDisabled) {
          pickButtonElement.disabled = isDisabled;
        },
        dispose: function dispose() {
          eventBinder.unbind();
        }
      };
    }

    function BsPickContentGenerator(configuration, stylingCorrector) {
      return function (pickElement, option, removePick) {
        return bsPickContentGenerator(pickElement, option, removePick, configuration, stylingCorrector);
      };
    }

    function BsChoiceContentStylingCorrector(configuration) {
      var resetStyle = createEmpty(resetStyle, configuration.choiceLabelStyleDisabled);
      return {
        disabledStyle: function disabledStyle(choiceLabelElement, isDisbaled) {
          setStyles(choiceLabelElement, isDisbaled ? configuration.choiceLabelStyleDisabled : resetStyle);
        }
      };
    }

    function bsChoiceContentGenerator(choiceElement, option, configuration, stylingCorrector) {
      addClasses(choiceElement, configuration.choiceClass);
      choiceElement.innerHTML = '<div><input type="checkbox"><label></label></div>';
      var choiceCheckBoxElement = choiceElement.querySelector('INPUT');
      var choiceLabelElement = choiceElement.querySelector('LABEL');
      var choiceContentElement = choiceElement.querySelector('DIV');
      addClasses(choiceContentElement, configuration.choiceContentClass);
      addClasses(choiceCheckBoxElement, configuration.choiceCheckBoxClass);
      addClasses(choiceLabelElement, configuration.choiceLabelClass);
      choiceLabelElement.textContent = option.text;
      var eventBinder = EventBinder();

      function disabledStyle(isDisabled) {
        if (isDisabled) addClasses(choiceCheckBoxElement, configuration.choiceCheckBoxClassDisabled);else removeClasses(choiceCheckBoxElement, configuration.choiceCheckBoxClassDisabled);
        if (stylingCorrector && stylingCorrector.disabledStyle) stylingCorrector.disabledStyle(choiceLabelElement, isDisabled);
      }
      return {
        select: function select(isSelected) {
          choiceCheckBoxElement.checked = isSelected;
        },
        // --- distinct disable and disabledStyle to provide a possibility to unselect disabled option
        //disable,//disable(isDisabled){ choiceCheckBoxElement.disabled = isDisabled },
        //disabledStyle,
        setChoiceContentDisabled: function setChoiceContentDisabled(isSelected) {
          disabledStyle(true); // TODO add option update
          // do not desable checkBix if selected! there should be possibility to unselect "disabled"

          choiceCheckBoxElement.disabled = !isSelected;
        },
        hoverIn: function hoverIn() {
          addClasses(choiceElement, configuration.choiceClassHover);
        },
        hoverOut: function hoverOut() {
          removeClasses(choiceElement, configuration.choiceClassHover);
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

    function BsChoiceContentGenerator(configuration, stylingCorrector) {
      return function (choiceElement, option) {
        return bsChoiceContentGenerator(choiceElement, option, configuration, stylingCorrector);
      };
    }

    var picksStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      listStyleType: 'none'
    }; // remove bullets since this is ul

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

      setStyles(picksElement, picksStyle);
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
      // dirty but BS doesn't provide better choices
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
      filterInputClass: 'form-control',
      // used in BsPickContentStylingCorrector
      pickClass: 'badge',
      pickContentClassDisabled: 'disabled',
      // internal, not bs4, used in scss
      pickButtonClass: 'close',
      // used in BsChoiceContentStylingCorrector
      choiceClass: 'px-2',
      choiceCheckBoxClassDisabled: 'disabled',
      // internal, not bs4, used in scss
      choiceContentClass: 'custom-control custom-checkbox',
      choiceCheckBoxClass: 'custom-control-input',
      choiceLabelClass: 'custom-control-label justify-content-start'
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
      //filterInputStyle: {color: 'inherit' /*#495057 for default BS*/, fontWeight : 'inherit'},
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
      // avoid opacity on pickElement's border
      // used in BsChoiceContentStylingCorrector
      choiceLabelStyleDisabled: {
        opacity: '.65'
      } // more flexible than {color: '#6c757d'}

    };

    (function (window, $) {
      function createPlugin(element, settings, onDispose) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
        }

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
              pickButtonClass = classesDefaults.pickButtonClass,
              pickContentClassDisabled = classesDefaults.pickContentClassDisabled;
          extendIfUndefined(configuration, {
            pickClass: pickClass,
            pickButtonClass: pickButtonClass,
            pickContentClassDisabled: pickContentClassDisabled
          });
          pickContentGenerator = BsPickContentGenerator(configuration, pickContentStylingCorrector);
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
          choiceContentGenerator = BsChoiceContentGenerator(configuration, choiceContentStylingCorrector);
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

        var multiSelect = new MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, pickContentGenerator, choiceContentGenerator, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, Popper, window);
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
