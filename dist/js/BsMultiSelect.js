/*!
  * DashboardCode BsMultiSelect v0.5.10 (https://dashboardcode.github.io/BsMultiSelect/)
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
            if (isMethodName && /Dispose/.test(options)) return;
            var optionsRef = typeof options === 'object' || typeof options === 'function' ? options : null;
            instance = createPlugin(this, optionsRef, function () {
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

    function FilterPanel(filterInputElement, insertIntoDom, onFocusIn, // show dropdown
    onFocusOut, // hide dropdown
    onKeyDownArrowUp, onKeyDownArrowDown, onTabForEmpty, // tab on empty
    onBackspace, // backspace alike
    onEnterOrTabToCompleate, // "compleate alike"
    onKeyDownEsc, onKeyUpEsc, // "esc" alike
    onInput //, // filter
    ) {
      filterInputElement.setAttribute("type", "search");
      filterInputElement.setAttribute("autocomplete", "off"); //setStyle(filterInputElement, filterInputStyle);

      insertIntoDom();

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
      filterInputElement.addEventListener('input', onFilterInputInput);
      return {
        isEmpty: function isEmpty() {
          return filterInputElement.value ? false : true;
        },
        setEmpty: function setEmpty() {
          filterInputElement.value = '';
        },
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

    function ChoicesPanel(createChoiceElement, choicesElement, onShow, onHide, eventSkipper, choiceContentGenerator, getVisibleMultiSelectDataList, resetFilter, updateChoicesLocation, filterPanelSetFocus) {
      var hoveredMultiSelectData = null;
      var hoveredMultiSelectDataIndex = null;
      var candidateToHoveredMultiSelectData = null;

      function hideChoices() {
        if (candidateToHoveredMultiSelectData) {
          candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData();
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
        hoveredMultiSelectData.ChoiceContent.hoverIn(true);
      };

      function resetChoicesHover() {
        if (hoveredMultiSelectData) {
          hoveredMultiSelectData.ChoiceContent.hoverIn(false);
          hoveredMultiSelectData = null;
          hoveredMultiSelectDataIndex = null;
        }
      }

      var processCandidateToHovered = function processCandidateToHovered() {
        if (hoveredMultiSelectData != candidateToHoveredMultiSelectData) {
          resetChoicesHover();
          hoverInInternal(candidateToHoveredMultiSelectData.visibleIndex);
        }

        if (candidateToHoveredMultiSelectData) candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData();
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
          if (hoveredMultiSelectData) hoveredMultiSelectData.ChoiceContent.hoverIn(false);
          updateChoicesLocation();
          showChoices();
          hoverInInternal(newIndex);
        }
      }

      var onChoiceElementMouseoverGeneral = function onChoiceElementMouseoverGeneral(MultiSelectData, choiceElement) {
        if (eventSkipper.isSkippable()) {
          if (candidateToHoveredMultiSelectData) candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData();
          candidateToHoveredMultiSelectData = MultiSelectData;
          choiceElement.addEventListener('mousemove', processCandidateToHovered);
          choiceElement.addEventListener('mousedown', processCandidateToHovered);

          candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData = function () {
            choiceElement.removeEventListener('mousemove', processCandidateToHovered);
            choiceElement.removeEventListener('mousedown', processCandidateToHovered);
            candidateToHoveredMultiSelectData.resetCandidateToHoveredMultiSelectData = null;
            candidateToHoveredMultiSelectData = null;
          };
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

      function createChoice(MultiSelectData, createSelectedItemGen, setSelected, triggerChange, isSelected
      /*, isOptionDisabled*/
      ) {
        var choiceElement = createChoiceElement(); // in chrome it happens on "become visible" so we need to skip it, 
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
        var choiceContent = choiceContentGenerator(choiceElement);
        choiceContent.setData(MultiSelectData.option);
        MultiSelectData.ChoiceContent = choiceContent;

        MultiSelectData.select = function (isSelected) {
          choiceContent.select(isSelected);
        };

        MultiSelectData.disable = function (isDisabled, isSelected) {
          choiceContent.disable(isDisabled, isSelected);
        };

        MultiSelectData.disposeChoice = function () {
          choiceElement.removeEventListener('mouseover', onChoiceElementMouseover);
          choiceElement.removeEventListener('mouseleave', onChoiceElementMouseleave);
          choiceContent.dispose();
          MultiSelectData.select = null;
          MultiSelectData.disable = null;
          MultiSelectData.disposeChoice = null;
        };

        if (MultiSelectData.isOptionDisabled) choiceContent.disable(true, isSelected);
        choiceContent.onSelected(function () {
          if (MultiSelectData.toggle) MultiSelectData.toggle();
          filterPanelSetFocus();
        }); // ------------------------------------------------------------------------------

        var createSelectedItem = function createSelectedItem() {
          return createSelectedItemGen(MultiSelectData);
        };

        if (isSelected) {
          createSelectedItem();
        } else {
          MultiSelectData.excludedFromSearch = MultiSelectData.isOptionDisabled;
          if (MultiSelectData.isOptionDisabled) MultiSelectData.toggle = null;else MultiSelectData.toggle = function () {
            var confirmed = setSelected(MultiSelectData.option, true);

            if (!(confirmed === false)) {
              createSelectedItem();
              triggerChange();
            }
          };
        }

        return {
          visible: function visible(isFiltered) {
            choiceElement.style.display = isFiltered ? 'block' : 'none';
          }
        };
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
        createChoice: createChoice,
        getIsVisble: function getIsVisble() {
          return choicesElement.style.display != 'none';
        },
        clear: function clear() {
          choicesElement.innerHTML = "";
        }
      };
      return item;
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
      }); // TODO support xhtml?  e.tagName.toUpperCase() ?
    }
    function closestByClassName(element, className) {
      return closest(element, function (e) {
        return e.classList.contains(className);
      });
    }
    function closestByAttribute(element, attributeName, attribute) {
      return closest(element, function (e) {
        return e.getAttribute(attributeName) === attribute;
      });
    }
    function getDataGuardedWithPrefix(element, prefix, name) {
      var tmp1 = element.getAttribute('data-' + prefix + '-' + name);

      if (tmp1) {
        return tmp1;
      } else {
        var tmp2 = element.getAttribute('data-' + name);
        if (tmp2) return tmp2;
      }

      return null;
    }

    function closest(element, predicate) {
      if (!element || !(element instanceof Element)) return null; // should be element, not document (TODO: check iframe)

      if (predicate(element)) return element;
      return closest(element.parentNode, predicate);
    }

    function siblingsAsArray(element) {
      var value = [];

      if (element.parentNode) {
        var children = element.parentNode.children;
        var l = element.parentNode.children.length;

        if (children.length > 1) {
          for (var i = 0; i < l; ++i) {
            var e = children[i];
            if (e != element) value.push(e);
          }
        }
      }

      return value;
    } // export function ShowBinder(element){
    //     return {
    //         show(){
    //         },
    //         hide(){
    //             //
    //         }
    //     }
    // }

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
    function AttributeBackup() {
      var list = [];
      return {
        set: function set(element, attributeName, attribute) {
          var currentAtribute = element.getAttribute(attributeName);
          list.push({
            element: element,
            currentAtribute: currentAtribute,
            attribute: attribute
          });
          element.setAttribute(attributeName, attribute);
        },
        restore: function restore() {
          list.forEach(function (e) {
            var element = e.element,
                attributeName = e.attributeName,
                attribute = e.attribute;
            if (attributeName) element.setAttribute(attributeName, attribute);else element.removeAttribute(attributeName);
          });
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

    function isString(value) {
      return value instanceof String || typeof value === 'string';
    }
    function extendIfUndefined(destination, source) {
      for (var property in source) {
        if (destination[property] === undefined) destination[property] = source[property];
      }
    }
    function extendOverriding(destination, source) {
      for (var property in source) {
        destination[property] = source[property];
      }
    }
    function shallowClearClone(source) {
      // override previous, no null and undefined
      var destination = {};

      for (var property in source) {
        // TODO:  Object.assign (need polyfill for IE11)
        var v = source[property];
        if (!(v === null || v === undefined)) destination[property] = v;
      }

      for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      if (sources) sources.forEach(function (s) {
        for (var _property in s) {
          var _v = s[_property];
          if (!(_v === null || _v === undefined)) destination[_property] = _v;else if (destination.hasOwnProperty(_property)) {
            delete destination[_property];
          }
        }
      });
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
    function composeSync() {
      for (var _len2 = arguments.length, functions = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        functions[_key2] = arguments[_key2];
      }

      return function () {
        return sync.apply(void 0, functions);
      };
    }
    function sync() {
      for (var _len3 = arguments.length, functions = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        functions[_key3] = arguments[_key3];
      }

      functions.forEach(function (f) {
        if (f) f();
      });
    }
    function ObservableValue(value) {
      var list = List();
      return {
        getValue: function getValue() {
          return value;
        },
        setValue: function setValue(newValue) {
          value = newValue;
          list.forEach(function (f) {
            return f(newValue);
          });
        },
        attach: function attach(f) {
          return list.add(f);
        },
        detachAll: function detachAll() {
          list.reset();
        }
      };
    }
    function ObservableLambda(func) {
      var list = List();
      var value = func();
      return {
        getValue: function getValue() {
          return value;
        },
        call: function call() {
          value = func();
          list.forEach(function (f) {
            return f(value);
          });
        },
        attach: function attach(f) {
          return list.add(f);
        },
        detachAll: function detachAll() {
          list.reset();
        }
      };
    }

    function PicksPanel(createPickElement, pickContentGenerator, processRemoveButtonClick // click to remove button
    ) {
      var list = List();

      function createPick(requestPickRemove, option, isComponentDisabled) {
        var _createPickElement = createPickElement(),
            pickElement = _createPickElement.pickElement,
            attach = _createPickElement.attach;

        var item = {
          pickElement: pickElement
        };
        var removeFromList = list.add(item);

        var removeImpl = function removeImpl() {
          removeElement(pickElement);
          item.pickContent.dispose();
          removeFromList();
          return createPick;
        };

        var remove = function remove() {
          return requestPickRemove(removeImpl);
        };

        item.remove = remove; // processRemoveButtonClick removes the item
        // what is a problem with calling 'remove' directly (not using  setTimeout('remove', 0)):
        // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
        // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
        // because of the event's bubling process 'remove' runs first. 
        // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
        // before we could analize is it belong to our dropdown or not.
        // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
        // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
        // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
        // the situation described above: click outside dropdown on the same component.
        // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target 
        // that belomgs to DOM (e.g. panel)

        item.pickContent = pickContentGenerator(pickElement);
        item.pickContent.setData(option);
        item.pickContent.disable(option.disabled);
        item.pickContent.disableRemove(isComponentDisabled);
        item.pickContent.onRemove(function (event) {
          return processRemoveButtonClick(remove, event);
        });
        attach();
        return remove;
      }

      return {
        createPick: createPick,
        removePicksTail: function removePicksTail() {
          var item = list.getTail();
          if (item) item.remove(); // always remove in this case
        },
        isEmpty: list.isEmpty,
        // function
        getCount: list.getCount,
        disable: function disable(isComponentDisabled) {
          list.forEach(function (i) {
            return i.pickContent.disableRemove(isComponentDisabled);
          });
        },
        deselectAll: function deselectAll() {
          list.forEach(function (i) {
            return i.remove();
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

    function MultiSelectInputAspect(window, appendToContainer, filterInputElement, picksElement, choicesElement, showChoices, hideChoicesAndResetFilter, isChoiceEmpty, onClick, isRtl, Popper) {
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
        placement: isRtl ? 'bottom-end' : 'bottom-start',
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
              filterInputElement,
              choicesElement,
              //  https://github.com/popperjs/popper.js/blob/next/docs/src/pages/docs/modifiers/prevent-overflow.mdx#mainaxis
              // {
              //     placement: isRtl?'bottom-end':'bottom-start',
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
        disable: function disable(isDisabled) {
          if (isDisabled) componentDisabledEventBinder.unbind();else componentDisabledEventBinder.bind(picksElement, "click", function (event) {
            onClick(event);
            alignAndShowChoices(event);
          }); // OPEN dropdown
        }
      };
    }

    function addStyling(element, styling) {
      var backupStyling = {
        classes: [],
        styles: {}
      };

      if (styling) {
        var classes = styling.classes,
            styles = styling.styles;
        classes.forEach(function (e) {
          return element.classList.add(e);
        }); // todo use add(classes)

        backupStyling.classes = classes.slice();

        for (var property in styles) {
          backupStyling.styles[property] = element.style[property];
          element.style[property] = styles[property]; // todo use Object.assign (need polyfill for IE11)
        }
      }

      return backupStyling;
    }

    function removeStyling(element, styling) {
      if (styling) {
        var classes = styling.classes,
            styles = styling.styles;
        classes.forEach(function (e) {
          return element.classList.remove(e);
        }); // todo use remove(classes)

        for (var property in styles) {
          element.style[property] = styles[property];
        } // todo use Object.assign (need polyfill for IE11)

      }
    }

    function toggleStyling(element, styling) {
      var backupStyling = {
        classes: [],
        styles: {}
      };
      var isOn = false;
      return function (value) {
        if (value) {
          if (isOn === false) {
            backupStyling = addStyling(element, styling);
            isOn = true;
          }
        } else {
          if (isOn === true) {
            removeStyling(element, backupStyling);
            isOn = false;
          }
        }
      };
    }

    function extendClasses(out, param, actionStr, actionArr, isRemoveEmptyClasses) {
      if (isString(param)) {
        var c = param.split(' ');
        if (!isRemoveEmptyClasses || c.length > 0) out.classes = actionStr(c);else if (c == "") out.classes = [];
        return true;
      } else if (param instanceof Array) {
        if (!isRemoveEmptyClasses || param.length > 0) out.classes = actionArr(param);else if (param.length == 0) out.classes = [];
        return true;
      }

      return false;
    }

    function extend(value, param, actionStr, actionArr, actionObj, isRemoveEmptyClasses) {
      var success = extendClasses(value, param, actionStr, actionArr, isRemoveEmptyClasses);

      if (success === false) {
        if (param instanceof Object) {
          var classes = param.classes,
              styles = param.styles;
          extendClasses(value, classes, actionStr, actionArr, isRemoveEmptyClasses);

          if (styles) {
            value.styles = actionObj(styles);
          } else if (!classes) {
            value.styles = actionObj(param);
          }
        }
      }
    }

    function Styling(param) {
      var value = {
        classes: [],
        styles: {}
      };

      if (param) {
        extend(value, param, function (a) {
          return a;
        }, function (a) {
          return a.slice();
        }, function (o) {
          return shallowClearClone(o);
        }, true);
      }

      return Object.freeze(value);
    }

    function createStyling(isReplace, param) {
      var value = {
        classes: [],
        styles: {}
      };

      if (param) {
        extend(value, param, function (a) {
          return a;
        }, function (a) {
          return a.slice();
        }, function (o) {
          return shallowClearClone(o);
        }, true);

        for (var _len = arguments.length, params = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          params[_key - 2] = arguments[_key];
        }

        if (params) {
          var classes = value.classes,
              styles = value.styles;
          var extendInt = isReplace ? function (p) {
            return extend(value, p, function (s) {
              return s;
            }, function (a) {
              return a.slice();
            }, function (o) {
              return shallowClearClone(styles, o);
            }, true);
          } : function (p) {
            return extend(value, p, function (a) {
              return classes.concat(a);
            }, function (a) {
              return classes.concat(a);
            }, function (o) {
              return shallowClearClone(styles, o);
            }, false);
          };
          params.forEach(function (p) {
            return extendInt(p);
          });
        }
      }

      return Styling(value);
    }

    function createCss(stylings1, stylings2) {
      var destination = {};

      for (var property in stylings1) {
        var param1 = stylings1[property];
        var param2 = stylings2 ? stylings2[property] : undefined;
        if (param2 === undefined) destination[property] = Styling(param1);else {
          destination[property] = createStyling(true, param1, param2);
        }
      }

      if (stylings2) for (var _property in stylings2) {
        if (!stylings1[_property]) destination[_property] = Styling(stylings2[_property]);
      }
      return destination;
    }
    function extendCss(stylings1, stylings2) {
      for (var property in stylings2) {
        var param2 = stylings2[property];
        var param1 = stylings1[property];
        if (param1 === undefined) stylings1[property] = Styling(param2);else {
          stylings1[property] = createStyling(false, param1, param2);
        }
      }
    }

    function PlaceholderAspect(placeholderText, isEmpty, picksElement, inputElement, css) {
      function setEmptyInputWidth(isVisible) {
        if (isVisible) inputElement.style.width = '100%';else inputElement.style.width = '2ch';
      }

      var emptyToggleStyling = toggleStyling(inputElement, css.filterInput_empty);

      function showPlacehodler(isVisible) {
        if (isVisible) {
          inputElement.placeholder = placeholderText ? placeholderText : '';
          picksElement.style.display = 'block';
        } else {
          inputElement.placeholder = '';
          picksElement.style.display = 'flex';
        }

        emptyToggleStyling(isVisible);
        setEmptyInputWidth(isVisible);
      }

      showPlacehodler(true);
      return {
        updatePlacehodlerVisibility: function updatePlacehodlerVisibility() {
          showPlacehodler(isEmpty());
        },
        updateEmptyInputWidth: function updateEmptyInputWidth() {
          setEmptyInputWidth(isEmpty());
        },
        setDisabled: function setDisabled(isDisabled) {
          inputElement.disabled = isDisabled;
        }
      };
    }

    function filterMultiSelectData(MultiSelectData, isFiltered, visibleIndex) {
      MultiSelectData.visible = isFiltered;
      MultiSelectData.visibleIndex = visibleIndex;
      MultiSelectData.choice.visible(isFiltered); //MultiSelectData.choiceElement.style.display = isFiltered ? 'block': 'none';
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
            filterMultiSelectData(multiSelectData, false, null);
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
      function MultiSelect(optionsAdapter, setSelected, staticContent, pickContentGenerator, choiceContentGenerator, labelAdapter, placeholderText, isRtl, css, popper, window) {
        this.onUpdate = null;
        this.onDispose = null; //this.onInput = null; 

        this.isRtl = isRtl; // readonly

        this.optionsAdapter = optionsAdapter;
        this.staticContent = staticContent; //this.styling = styling;

        this.pickContentGenerator = pickContentGenerator;
        this.choiceContentGenerator = choiceContentGenerator;
        this.labelAdapter = labelAdapter; //this.createStylingComposite = createStylingComposite;

        this.placeholderText = placeholderText;
        this.setSelected = setSelected; // should I rebind this for callbacks? setSelected.bind(this);

        this.css = css;
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
          this.placeholderAspect.updateEmptyInputWidth();
          this.processEmptyInput();
          this.placeholderAspect.updatePlacehodlerVisibility();
        }
      };

      _proto.processEmptyInput = function processEmptyInput() {
        this.placeholderAspect.updateEmptyInputWidth();
        resetChoices(this.MultiSelectDataList);
        this.filteredMultiSelectDataList = null;
      } // -----------------------------------------------------------------------------------------------------------------------
      ;

      _proto.GetContainer = function GetContainer() {
        return this.staticContent.containerElement;
      };

      _proto.GetFilterInput = function GetFilterInput() {
        return this.staticContent.filterInputElement;
      };

      _proto.Update = function Update() {
        if (this.onUpdate) this.onUpdate();
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

      _proto.PicksCount = function PicksCount() {
        return this.picksPanel.getCount();
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
        this.choicesPanel.clear(); // for(let i=0; i<this.MultiSelectDataList.length; i++)
        // {
        //     let multiSelectData = this.MultiSelectDataList[i];
        //     if (multiSelectData.choice)
        //         multiSelectData.choice.remove();
        // }

        this.resetMultiSelectDataList();
        this.picksPanel.clear();
        this.placeholderAspect.updatePlacehodlerVisibility();
      };

      _proto.UpdateData = function UpdateData() {
        this.empty(); // reinitiate

        this.updateDataImpl();
      };

      _proto.UpdateSelected = function UpdateSelected() {
        var options = this.optionsAdapter.getOptions();

        for (var i = 0; i < options.length; i++) {
          var option = options[i];
          var newIsSelected = option.selected;
          var multiSelectData = this.MultiSelectDataList[i];
          var isSelected = multiSelectData.isSelected;
          if (newIsSelected != isSelected) if (multiSelectData.toggle) multiSelectData.toggle();
        }
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
              isSelected: isSelected,
              choiceElement: null,
              choiceContent: null,
              visible: false,
              toggle: null,
              pickElement: null,
              disable: null,
              removeChoiceElement: null
            };

            _this.MultiSelectDataList.push(MultiSelectData);

            if (!isOptionHidden) {
              MultiSelectData.visible = true;
              MultiSelectData.visibleIndex = i;

              var choice = _this.choicesPanel.createChoice(MultiSelectData,
              /*createSelectedItemGen*/
              function (multiSelectData
              /*,isOptionDisabled,setChoiceContentDisabled*/
              ) {
                var remove = _this.picksPanel.createPick(function (removePick) {
                  return _this.requestPickRemove(multiSelectData, removePick);
                },
                /*multiSelectData,*/
                multiSelectData.option, _this.isComponentDisabled);

                _this.requestPickCreate(multiSelectData, remove, _this.picksPanel.getCount());
              }, function (o, i) {
                return _this.setSelected(o, i);
              }, function () {
                return _this.optionsAdapter.onChange();
              }, isSelected);

              MultiSelectData.choice = choice;
            }
          }

          _this.aspect.alignToFilterInputItemLocation(false);
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
        sync(this.onDispose, this.choicesPanel.hideChoices, this.optionsAdapter.dispose, this.picksPanel.dispose, this.filterPanel.dispose, this.labelAdapter.dispose, this.aspect.dispose, this.staticContent.dispose);

        for (var i = 0; i < this.MultiSelectDataList.length; i++) {
          var multiSelectData = this.MultiSelectDataList[i];
          multiSelectData.toggle = null;

          if (multiSelectData.disposeChoice) {
            multiSelectData.disposeChoice();
          }
        }
      };

      _proto.UpdateDisabled = function UpdateDisabled() {
        var isComponentDisabled = this.optionsAdapter.getDisabled();

        if (this.isComponentDisabled !== isComponentDisabled) {
          this.picksPanel.disable(isComponentDisabled);
          this.aspect.disable(isComponentDisabled);
          this.placeholderAspect.setDisabled(isComponentDisabled);
          this.staticContent.disable(isComponentDisabled);
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

              this.placeholderAspect.updateEmptyInputWidth();
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

      _proto.requestPickCreate = function requestPickCreate(multiSelectData, removePick, count) {
        multiSelectData.isSelected = true;
        multiSelectData.excludedFromSearch = true; // all selected excluded from search

        multiSelectData.toggle = function () {
          return removePick();
        };

        multiSelectData.select(true);
        if (count == 1) this.placeholderAspect.updatePlacehodlerVisibility();
      };

      _proto.requestPickRemove = function requestPickRemove(multiSelectData, removePick) {
        var _this2 = this;

        var confirmed = this.setSelected(multiSelectData.option, false);

        if (!(confirmed === false)) {
          var createPick = removePick();
          multiSelectData.isSelected = false;
          multiSelectData.excludedFromSearch = multiSelectData.isOptionDisabled;

          if (multiSelectData.isOptionDisabled) {
            multiSelectData.disable(
            /*isDisabled*/
            true,
            /*isSelected*/
            false);
            multiSelectData.toggle = null;
          } else {
            multiSelectData.toggle = function () {
              var confirmed = _this2.setSelected(multiSelectData.option, true);

              if (!(confirmed === false)) {
                var remove = createPick(function (removePick) {
                  return _this2.requestPickRemove(multiSelectData, removePick);
                }, multiSelectData.option, _this2.isComponentDisabled);

                _this2.requestPickCreate(multiSelectData, remove, _this2.picksPanel.getCount());

                _this2.optionsAdapter.onChange();
              }
            };
          }

          multiSelectData.select(false);
          if (this.picksPanel.getCount() == 0) this.placeholderAspect.updatePlacehodlerVisibility();
          this.optionsAdapter.onChange();
        }
      };

      _proto.init = function init() {
        var _this3 = this;

        this.filterPanel = FilterPanel(this.staticContent.filterInputElement, function () {
          _this3.staticContent.pickFilterElement.appendChild(_this3.staticContent.filterInputElement);

          _this3.labelAdapter.init(_this3.staticContent.filterInputElement);

          _this3.staticContent.picksElement.appendChild(_this3.staticContent.pickFilterElement); // located filter in selectionsPanel                    

        }, function () {
          _this3.staticContent.setIsFocusIn(true);

          _this3.staticContent.toggleFocusStyling();
        }, // focus in - show dropdown
        function () {
          if (!_this3.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
            {
              _this3.resetFilter(); // if do not do this we will return to filtered list without text filter in input


              _this3.staticContent.setIsFocusIn(false);

              _this3.staticContent.toggleFocusStyling();
            }

          _this3.aspect.resetSkipFocusout();
        }, // focus out - hide dropdown
        function () {
          return _this3.choicesPanel.keyDownArrow(false);
        }, // arrow up
        function () {
          return _this3.choicesPanel.keyDownArrow(true);
        }, // arrow down
        function () {
          return _this3.choicesPanel.hideChoices();
        }, // tab on empty
        function () {
          _this3.picksPanel.removePicksTail();

          _this3.aspect.alignToFilterInputItemLocation(false);
        }, // backspace - "remove last"
        function () {
          if (_this3.choicesPanel.getIsVisble()) _this3.choicesPanel.toggleHovered();
        }, // tab/enter "compleate hovered"
        function (isEmpty, event) {
          if (!isEmpty || _this3.choicesPanel.getIsVisble()) // supports bs modal - stop esc (close modal) propogation
            event.stopPropagation();
        }, // esc keydown
        function () {
          _this3.choicesPanel.hideChoices(); // always hide 1st


          _this3.resetFilter();
        }, // esc keyup 
        function (filterInputValue, resetLength) {
          _this3.placeholderAspect.updatePlacehodlerVisibility();

          _this3.input(filterInputValue, resetLength);
        });
        this.picksPanel = PicksPanel(
        /*createElement*/
        function () {
          var pickElement = _this3.staticContent.createPickElement();

          return {
            pickElement: pickElement,
            attach: function attach() {
              return _this3.staticContent.picksElement.insertBefore(pickElement, _this3.staticContent.pickFilterElement);
            }
          };
        }, this.pickContentGenerator, function (doUncheck, event) {
          _this3.aspect.processUncheck(doUncheck, event);

          _this3.choicesPanel.hideChoices(); // always hide 1st


          _this3.resetFilter();
        });
        this.choicesPanel = ChoicesPanel(function () {
          return _this3.staticContent.createChoiceElement();
        }, this.staticContent.choicesElement, function () {
          return _this3.aspect.onChoicesShow();
        }, function () {
          return _this3.aspect.onChoicesHide();
        }, EventSkipper(this.window), this.choiceContentGenerator, function () {
          return _this3.getVisibleMultiSelectDataList();
        }, function () {
          return _this3.resetFilter();
        }, function () {
          return _this3.aspect.alignToFilterInputItemLocation(true);
        }, function () {
          return _this3.filterPanel.setFocus();
        });
        this.placeholderAspect = PlaceholderAspect(this.placeholderText, function () {
          return _this3.picksPanel.isEmpty() && _this3.filterPanel.isEmpty();
        }, this.staticContent.picksElement, this.staticContent.filterInputElement, this.css);
        this.placeholderAspect.updateEmptyInputWidth();
        this.aspect = MultiSelectInputAspect(this.window, function () {
          return _this3.staticContent.appendToContainer();
        }, this.staticContent.filterInputElement, this.staticContent.picksElement, this.staticContent.choicesElement, function () {
          return _this3.choicesPanel.showChoices();
        }, function () {
          _this3.choicesPanel.hideChoices();

          _this3.resetFilter();
        }, function () {
          return _this3.getVisibleMultiSelectDataList().length == 0;
        },
        /*onClick*/
        function (event) {
          if (!_this3.filterPanel.isEventTarget(event)) _this3.filterPanel.setFocus();
        }, this.isRtl, this.popper);
        this.staticContent.attachContainer();
        this.updateDataImpl();
        if (this.onUpdate) this.onUpdate();
        this.UpdateDisabled(); // should be done after updateDataImpl

        if (this.optionsAdapter.onReset) {
          this.optionsAdapter.onReset(function () {
            _this3.window.setTimeout(function () {
              return _this3.UpdateData();
            });
          });
        }
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

    function RtlAdapter(element) {
      var isRtl = false;
      var e = closestByAttribute(element, "dir", "rtl");
      if (e) isRtl = true;
      return isRtl;
    }

    function OptionsAdapterElement(selectElement, getDisabled, getSize, getValidity, onChange) {
      var form = closestByTagName(selectElement, 'FORM');
      var eventBuilder = EventBinder();
      if (!getValidity) getValidity = function getValidity() {
        return selectElement.classList.contains('is-invalid') ? false : selectElement.classList.contains('is-valid') ? true : null;
      };
      return {
        getOptions: function getOptions() {
          return selectElement.getElementsByTagName('OPTION');
        },
        onChange: onChange,
        getDisabled: getDisabled,
        getSize: getSize,
        getValidity: getValidity,
        onReset: function onReset(handler) {
          if (form) eventBuilder.bind(form, 'reset', handler);
        },
        dispose: function dispose() {
          if (form) eventBuilder.unbind();
        }
      };
    }

    function OptionsAdapterJson(options, _getDisabled, _getSize, getValidity, onChange) {
      if (!getValidity) {
        getValidity = function getValidity() {
          return null;
        };
      }

      return {
        getOptions: function getOptions() {
          return options;
        },
        onChange: onChange,
        getDisabled: function getDisabled() {
          return _getDisabled ? _getDisabled() : false;
        },
        getSize: function getSize() {
          return _getSize ? _getSize() : null;
        },
        getValidity: getValidity
      };
    }

    function updateValidity(picksElement, validMessages, invalidMessages, validity) {
      if (validity === false) {
        picksElement.classList.add('is-invalid');
        picksElement.classList.remove('is-valid');
        invalidMessages.map(function (e) {
          return e.style.display = 'block';
        });
        validMessages.map(function (e) {
          return e.style.display = 'none';
        });
      } else if (validity === true) {
        picksElement.classList.remove('is-invalid');
        picksElement.classList.add('is-valid');
        invalidMessages.map(function (e) {
          return e.style.display = 'none';
        });
        validMessages.map(function (e) {
          return e.style.display = 'block';
        });
      } else {
        picksElement.classList.remove('is-invalid');
        picksElement.classList.remove('is-valid');
        invalidMessages.map(function (e) {
          return e.style.display = '';
        });
        validMessages.map(function (e) {
          return e.style.display = '';
        });
      }
    }

    function updateSize(picksElement, size) {
      if (size == "lg") {
        picksElement.classList.add('form-control-lg');
        picksElement.classList.remove('form-control-sm');
      } else if (size == "sm") {
        picksElement.classList.remove('form-control-lg');
        picksElement.classList.add('form-control-sm');
      } else {
        picksElement.classList.remove('form-control-lg');
        picksElement.classList.remove('form-control-sm');
      }
    }

    function updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size) {
      updateSize(picksElement, size);

      if (size == "lg") {
        addStyling(picksElement, picksLgStyling);
      } else if (size == "sm") {
        addStyling(picksElement, picksSmStyling);
      } else {
        addStyling(picksElement, picksDefStyling);
      }
    }

    function updateSizeForAdapter(picksElement, optionsAdapter) {
      updateSize(picksElement, optionsAdapter.getSize());
    }

    function updateSizeJsForAdapter(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, optionsAdapter) {
      updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, optionsAdapter.getSize());
    }

    function bsAppearance(multiSelect, staticContent, optionsAdapter, validityApiObservable, useCssPatch, css) {
      var updateSize;

      if (!useCssPatch) {
        updateSize = function updateSize() {
          return updateSizeForAdapter(staticContent.picksElement, optionsAdapter);
        };
      } else {
        var picks_lg = css.picks_lg,
            picks_sm = css.picks_sm,
            picks_def = css.picks_def;

        updateSize = function updateSize() {
          return updateSizeJsForAdapter(staticContent.picksElement, picks_lg, picks_sm, picks_def, optionsAdapter);
        };
      }

      multiSelect.UpdateSize = updateSize;

      if (useCssPatch) {
        var defToggleFocusStyling = staticContent.toggleFocusStyling;

        staticContent.toggleFocusStyling = function () {
          var validity = validationObservable.getValue();
          var isFocusIn = staticContent.getIsFocusIn();
          defToggleFocusStyling(isFocusIn);

          if (isFocusIn) {
            if (validity === false) {
              // but not toggle events (I know it will be done in future)
              staticContent.setIsFocusIn(isFocusIn);
              addStyling(staticContent.picksElement, css.picks_focus_invalid);
            } else if (validity === true) {
              // but not toggle events (I know it will be done in future)
              staticContent.setIsFocusIn(isFocusIn);
              addStyling(staticContent.picksElement, css.picks_focus_valid);
            }
          } // if (isFocusIn)
          // {
          //     if (validity===false) { 
          //         // but not toggle events (I know it will be done in future)
          //         staticContent.setIsFocusIn(isFocusIn);
          //         addStyling(staticContent.picksElement, css.picks_focus_invalid)
          //     } else if (validity===true) {
          //         // but not toggle events (I know it will be done in future)
          //         staticContent.setIsFocusIn(isFocusIn);
          //         addStyling(staticContent.picksElement, css.picks_focus_valid)
          //     } else {
          //         defToggleFocusStyling(isFocusIn)
          //     }
          // }
          // else{
          //     defToggleFocusStyling(isFocusIn)
          // }

        };
      }

      var getWasValidated = function getWasValidated() {
        var wasValidatedElement = closestByClassName(staticContent.initialElement, 'was-validated');
        return wasValidatedElement ? true : false;
      };

      var wasUpdatedObservable = ObservableLambda(function () {
        return getWasValidated();
      });
      var getManualValidationObservable = ObservableLambda(function () {
        return optionsAdapter.getValidity();
      });
      var validationObservable = ObservableLambda(function () {
        return wasUpdatedObservable.getValue() ? validityApiObservable.getValue() : getManualValidationObservable.getValue();
      });
      validationObservable.attach(function (value) {
        var _getMessagesElements = getMessagesElements(staticContent.containerElement),
            validMessages = _getMessagesElements.validMessages,
            invalidMessages = _getMessagesElements.invalidMessages;

        updateValidity(staticContent.picksElement, validMessages, invalidMessages, value);
        staticContent.toggleFocusStyling();
      });
      wasUpdatedObservable.attach(function () {
        return validationObservable.call();
      });
      validityApiObservable.attach(function () {
        return validationObservable.call();
      });
      getManualValidationObservable.attach(function () {
        return validationObservable.call();
      });

      multiSelect.UpdateValidity = function () {
        return getManualValidationObservable.call();
      };

      multiSelect.UpdateWasValidated = function () {
        return wasUpdatedObservable.call();
      };

      multiSelect.onUpdate = function () {
        updateSize();
        validationObservable.call();
      };

      var onDisposePrev = multiSelect.onDispose;

      multiSelect.onDispose = function () {
        wasUpdatedObservable.detachAll();
        validationObservable.detachAll();
        getManualValidationObservable.detachAll();
        onDisposePrev();
      };
    }
    function adjustBsOptionAdapterConfiguration(configuration, selectElement) {
      if (!configuration.getDisabled) {
        var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');

        if (fieldsetElement) {
          configuration.getDisabled = function () {
            return selectElement.disabled || fieldsetElement.disabled;
          };
        } else {
          configuration.getDisabled = function () {
            return selectElement.disabled;
          };
        }
      }

      if (!configuration.getSize) {
        var inputGroupElement = closestByClassName(selectElement, 'input-group');
        if (inputGroupElement) configuration.getSize = function () {
          var value = null;
          if (inputGroupElement.classList.contains('input-group-lg')) value = 'lg';else if (inputGroupElement.classList.contains('input-group-sm')) value = 'sm';
          return value;
        };else configuration.getSize = function () {
          var value = null;
          if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg')) value = 'lg';else if (selectElement.classList.contains('custom-select-sm') || selectElement.classList.contains('form-control-sm')) value = 'sm';
          return value;
        };
      }
    }

    function getMessagesElements(containerElement) {
      var siblings = siblingsAsArray(containerElement);
      var invalidMessages = siblings.filter(function (e) {
        return e.classList.contains('invalid-feedback') || e.classList.contains('invalid-tooltip');
      });
      var validMessages = siblings.filter(function (e) {
        return e.classList.contains('valid-feedback') || e.classList.contains('valid-tooltip');
      });
      return {
        validMessages: validMessages,
        invalidMessages: invalidMessages
      };
    }

    function getLabelElement(selectElement) {
      var value = null;
      var formGroup = closestByClassName(selectElement, 'form-group');

      if (formGroup) {
        value = formGroup.querySelector("label[for=\"" + selectElement.id + "\"]");
      }

      return value;
    }

    function createValidity(valueMissing, customError) {
      return Object.freeze({
        valueMissing: valueMissing,
        customError: customError,
        valid: !(valueMissing || customError)
      });
    }

    function ValidityApi(visibleElement, isValueMissingObservable, valueMissingMessage, onValid) {
      var customValidationMessage = "";
      var validationMessage = "";
      var validity = null;
      var willValidate = true;

      function setMessage(valueMissing, customError) {
        validity = createValidity(valueMissing, customError);
        validationMessage = customError ? customValidationMessage : valueMissing ? valueMissingMessage : "";
        visibleElement.setCustomValidity(validationMessage);
        onValid(validity.valid);
      }

      setMessage(isValueMissingObservable.getValue(), false);
      isValueMissingObservable.attach(function (value) {
        setMessage(value, validity.customError);
      });
      return {
        validationMessage: validationMessage,
        willValidate: willValidate,
        validity: validity,
        setCustomValidity: function setCustomValidity(message) {
          customValidationMessage = message;
          setMessage(validity.valueMissing, customValidationMessage ? true : false);
        },
        checkValidity: function checkValidity() {
          if (!validity.valid) trigger('dashboardcode.multiselect:invalid');
          return validity.valid;
        },
        reportValidity: function reportValidity() {
          staticContent.filterInputElement.reportValidity();
          return checkValidity();
        }
      };
    }

    var transformStyles = [{
      old: 'selectedPanelDisabledBackgroundColor',
      opt: 'picks_disabled',
      style: "backgroundColor"
    }, {
      old: 'selectedPanelFocusValidBoxShadow',
      opt: 'picks_focus_valid',
      style: "boxShadow"
    }, {
      old: 'selectedPanelFocusInvalidBoxShadow',
      opt: 'picks_focus_invalid',
      style: "boxShadow"
    }, {
      old: 'selectedPanelDefMinHeight',
      opt: 'picks_def',
      style: "minHeight"
    }, {
      old: 'selectedPanelLgMinHeight',
      opt: 'picks_lg',
      style: "minHeight"
    }, {
      old: 'selectedPanelSmMinHeight',
      opt: 'picks_sm',
      style: "minHeight"
    }, {
      old: 'selectedItemContentDisabledOpacity',
      opt: 'choiceLabel_disabled',
      style: "opacity"
    }];
    var transformClasses = [{
      old: 'dropDownMenuClass',
      opt: 'choices'
    }, {
      old: 'dropDownItemClass',
      opt: 'choice'
    }, {
      old: 'dropDownItemHoverClass',
      opt: 'choice_hover'
    }, {
      old: 'selectedPanelClass',
      opt: 'picks'
    }, {
      old: 'selectedItemClass',
      opt: 'pick'
    }, {
      old: 'removeSelectedItemButtonClass',
      opt: 'pickButton'
    }, {
      old: 'filterInputItemClass',
      opt: 'pickFilter'
    }, {
      old: 'filterInputClass',
      opt: 'filterInput'
    }, {
      old: 'selectedPanelFocusClass',
      opt: 'picks_focus'
    }, {
      old: 'selectedPanelDisabledClass',
      opt: 'picks_disabled'
    }, {
      old: 'selectedItemContentDisabledClass',
      opt: 'pick_disabled'
    }];
    function adjustLegacyConfiguration(configuration) {
      if (!configuration.css) configuration.css = {};
      var css = configuration.css;
      if (!configuration.cssPatch) configuration.cssPatch = {};
      var cssPatch = configuration.cssPatch;

      if (configuration.selectedPanelFocusBorderColor || configuration.selectedPanelFocusBoxShadow) {
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - cssPatch:{picks_focus:{borderColor:'myValue', boxShadow:'myValue'}}");

        if (!cssPatch.picks_focus) {
          cssPatch.picks_focus = {
            boxShadow: configuration.selectedPanelFocusBoxShadow,
            borderColor: configuration.selectedPanelFocusBorderColor
          };
        }

        delete configuration.selectedPanelFocusBorderColor;
        delete configuration.selectedPanelFocusBoxShadow;
      }

      transformStyles.forEach(function (i) {
        if (configuration[i.old]) {
          console.log("DashboarCode.BsMultiSelect: " + i.old + " is depricated, use - cssPatch:{" + i.opt + ":{" + i.style + ":'myValue'}}");

          if (!configuration[i.opt]) {
            var opt = {};
            opt[i.style] = configuration[i.old];
            configuration.cssPatch[i.opt] = opt;
          }

          delete configuration[i.old];
        }
      });
      transformClasses.forEach(function (i) {
        if (configuration[i.old]) {
          console.log("DashboarCode.BsMultiSelect: " + i.old + " is depricated, use - css:{" + i.opt + ":'myValue'}");

          if (!css[i.opt]) {
            css[i.opt] = configuration[i.old];
          }

          delete configuration[i.old];
        }
      });

      if (configuration.inputColor) {
        console.log("DashboarCode.BsMultiSelect: inputColor is depricated, remove parameter");
        delete configuration.inputColor;
      }

      if (configuration.useCss) {
        console.log("DashboarCode.BsMultiSelect: useCss(=true) is depricated, use - 'useCssPatch: false'");

        if (!css.pick_disabled) {
          configuration.useCssPatch = !configuration.useCss;
        }

        delete configuration.useCss;
      }

      if (configuration.getIsValid || configuration.getIsInValid) {
        throw "DashboarCode.BsMultiSelect: parameters getIsValid and getIsInValid are depricated and removed, use - getValidity that should return (true|false|null) ";
      }
    }

    function pickContentGenerator(pickElement, css) {
      pickElement.innerHTML = '<span></span><button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
      var pickContentElement = pickElement.querySelector('SPAN');
      var pickButtonElement = pickElement.querySelector('BUTTON');
      addStyling(pickContentElement, css.pickContent);
      addStyling(pickButtonElement, css.pickButton);
      var eventBinder = EventBinder();
      var disableToggleStyling = toggleStyling(pickContentElement, css.pickContent_disabled);
      return {
        setData: function setData(option) {
          pickContentElement.textContent = option.text;
        },
        disable: function disable(isDisabled) {
          return disableToggleStyling(isDisabled);
        },
        disableRemove: function disableRemove(isRemoveDisabled) {
          pickButtonElement.disabled = isRemoveDisabled;
        },
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

    function choiceContentGenerator(choiceElement, css) {
      choiceElement.innerHTML = '<div><input formnovalidate type="checkbox"><label></label></div>';
      var choiceContentElement = choiceElement.querySelector('DIV');
      var choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
      var choiceLabelElement = choiceContentElement.querySelector('LABEL');
      addStyling(choiceContentElement, css.choiceContent);
      addStyling(choiceCheckBoxElement, css.choiceCheckBox);
      addStyling(choiceLabelElement, css.choiceLabel);
      var selectToggleStyling = toggleStyling(choiceElement, css.choice_selected);
      var disable1ToggleStyling = toggleStyling(choiceElement, css.choice_disabled);
      var disable2ToggleStyling = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled);
      var disable3ToggleStyling = toggleStyling(choiceLabelElement, css.choiceLabel_disabled);
      var hoverInToggleStyling = toggleStyling(choiceElement, css.choice_hover);
      var eventBinder = EventBinder();
      return {
        setData: function setData(option) {
          choiceLabelElement.textContent = option.text;
        },
        select: function select(isSelected) {
          selectToggleStyling(isSelected);
          choiceCheckBoxElement.checked = isSelected;
        },
        disable: function disable(isDisabled, isSelected) {
          disable1ToggleStyling(isDisabled);
          disable2ToggleStyling(isDisabled);
          disable3ToggleStyling(isDisabled); // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"

          choiceCheckBoxElement.disabled = isDisabled && !isSelected;
        },
        hoverIn: function hoverIn(isHoverIn) {
          hoverInToggleStyling(isHoverIn);
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

    function staticContentGenerator(element, createElement, containerClass, putRtlToContainer, css) {
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

      var createPickElement = function createPickElement() {
        var pickElement = createElement('LI');
        addStyling(pickElement, css.pick);
        return pickElement;
      };

      var createChoiceElement = function createChoiceElement() {
        var choiceElement = createElement('LI');
        addStyling(choiceElement, css.choice);
        return choiceElement;
      };

      var ownContainerElement = false;

      if (!containerElement) {
        containerElement = createElement('DIV');
        ownContainerElement = true;
      }

      containerElement.classList.add(containerClass);
      var attributeBackup = AttributeBackup();

      if (putRtlToContainer) {
        attributeBackup.set(containerElement, "dir", "rtl");
      } else if (selectElement) {
        var dirAttributeValue = selectElement.getAttribute("dir");

        if (dirAttributeValue) {
          attributeBackup.set(containerElement, "dir", dirAttributeValue);
        }
      }

      var choicesElement = createElement('UL');
      choicesElement.style.display = 'none';
      var backupDisplay = null;

      if (selectElement) {
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
      }

      var pickFilterElement = createElement('LI');
      var filterInputElement = createElement('INPUT');
      var required = false;

      if (selectElement) {
        var backupedRequired = selectElement.required;

        if (selectElement.required === true) {
          required = true;
          selectElement.required = false;
        }
      }

      addStyling(picksElement, css.picks);
      addStyling(choicesElement, css.choices);
      addStyling(pickFilterElement, css.pickFilter);
      addStyling(filterInputElement, css.filterInput);
      var createInputId = null;
      if (selectElement) createInputId = function createInputId() {
        return containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
      };else createInputId = function createInputId() {
        return containerClass + "-generated-filter-" + containerElement.id;
      };
      var isFocusIn = false;
      var disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
      var focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
      return {
        initialElement: element,
        selectElement: selectElement,
        containerElement: containerElement,
        picksElement: picksElement,
        createPickElement: createPickElement,
        choicesElement: choicesElement,
        createChoiceElement: createChoiceElement,
        pickFilterElement: pickFilterElement,
        filterInputElement: filterInputElement,
        createInputId: createInputId,
        required: required,
        attachContainer: function attachContainer() {
          if (ownContainerElement && selectElement) // otherwise it is attached
            selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
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
        disable: function disable(isDisabled) {
          disableToggleStyling(isDisabled);
        },
        getIsFocusIn: function getIsFocusIn() {
          return isFocusIn;
        },
        setIsFocusIn: function setIsFocusIn(newIsFocusIn) {
          isFocusIn = newIsFocusIn;
        },
        toggleFocusStyling: function toggleFocusStyling() {
          focusToggleStyling(isFocusIn);
        },
        dispose: function dispose() {
          if (ownContainerElement) containerElement.parentNode.removeChild(containerElement);else attributeBackup.restore();
          if (ownPicksElement) picksElement.parentNode.removeChild(picksElement);
          choicesElement.parentNode.removeChild(choicesElement);
          if (pickFilterElement.parentNode) pickFilterElement.parentNode.removeChild(pickFilterElement);
          if (filterInputElement.parentNode) filterInputElement.parentNode.removeChild(filterInputElement);

          if (selectElement) {
            selectElement.required = backupedRequired;
            selectElement.style.display = backupDisplay;
          }
        }
      };
    }

    var css = {
      choices: 'dropdown-menu',
      // bs4, in bsmultiselect.scss as ul.dropdown-menu
      choice_hover: 'hover',
      //  not bs4, in scss as 'ul.dropdown-menu li.hover'
      choice_selected: '',
      choice_disabled: '',
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
      pickContent: '',
      pickContent_disabled: 'disabled',
      // not bs4, in scss 'ul.form-control li span.disabled'
      pickButton: 'close',
      // bs4
      // used in BsChoiceContentStylingCorrector
      // choice:  'dropdown-item', // it seems like hover should be managed manually since there should be keyboard support
      choiceCheckBox_disabled: 'disabled',
      //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
      choiceContent: 'custom-control custom-checkbox d-flex',
      // bs4 d-flex required for rtl to align items
      choiceCheckBox: 'custom-control-input',
      // bs4
      choiceLabel: 'custom-control-label justify-content-start',
      choiceLabel_disabled: ''
    };
    var cssPatch = {
      choices: {
        listStyleType: 'none'
      },
      picks: {
        listStyleType: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        height: 'auto',
        marginBottom: '0'
      },
      choice: 'px-md-2 px-1',
      choice_hover: 'text-primary bg-light',
      filterInput: {
        border: '0px',
        height: 'auto',
        boxShadow: 'none',
        padding: '0',
        margin: '0',
        outline: 'none',
        backgroundColor: 'transparent',
        backgroundImage: 'none' // otherwise BS .was-validated set its image

      },
      filterInput_empty: 'form-control',
      // need for placeholder, TODO test form-control-plaintext
      // used in staticContentGenerator
      picks_disabled: {
        backgroundColor: '#e9ecef'
      },
      picks_focus: {
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
      },
      picks_focus_valid: {
        borderColor: '',
        boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'
      },
      picks_focus_invalid: {
        borderColor: '',
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
      // used in pickContentGenerator
      pick: {
        paddingLeft: '0px',
        lineHeight: '1.5em'
      },
      pickButton: {
        fontSize: '1.5em',
        lineHeight: '.9em',
        float: "none"
      },
      pickContent_disabled: {
        opacity: '.65'
      },
      // used in choiceContentGenerator
      choiceContent: {
        justifyContent: 'initial'
      },
      // BS problem: without this on inline form menu items justified center
      choiceLabel: {
        color: 'inherit'
      },
      // otherwise BS .was-validated set its color
      choiceCheckBox: {
        color: 'inherit'
      },
      choiceLabel_disabled: {
        opacity: '.65'
      } // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 

    };

    var defValueMissingMessage = 'Please select an item in the list';
    var defaults = {
      useCssPatch: true,
      containerClass: "dashboardcode-bsmultiselect",
      css: css,
      cssPatch: cssPatch,
      placeholder: '',
      staticContentGenerator: null,
      getLabelElement: null,
      pickContentGenerator: null,
      choiceContentGenerator: null,
      buildConfiguration: null,
      isRtl: null,
      setSelected: null,
      required: null,

      /* null means look on select[required] or false if jso-source */
      optionsAdapter: null,
      options: null,
      getDisabled: null,
      getSize: null,
      getValidity: null,
      labelElement: null,
      valueMissingMessage: '',
      getIsValueMissing: null
    };

    function extendConfigurtion(configuration, defaults) {
      var cfgCss = configuration.css;
      var cfgCssPatch = configuration.cssPatch;
      configuration.css = null;
      configuration.cssPatch = null;
      extendIfUndefined(configuration, defaults);
      var defCss = createCss(defaults.css, cfgCss); // replace classes, merge styles

      if (defaults.cssPatch instanceof Boolean || typeof defaults.cssPatch === "boolean" || cfgCssPatch instanceof Boolean || typeof cfgCssPatch === "boolean") throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

      var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // replace classes, merge styles

      configuration.css = defCss;
      configuration.cssPatch = defCssPatch;
    }

    function BsMultiSelect(element, environment, settings) {
      var Popper = environment.Popper,
          window = environment.window;

      var trigger = function trigger(eventName) {
        return environment.trigger(element, eventName);
      };

      if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
      }

      var configuration = {};
      var init = null;

      if (settings instanceof Function) {
        extendConfigurtion(configuration, defaults);
        init = settings(element, configuration);
      } else {
        if (settings) {
          adjustLegacyConfiguration(settings);
          extendOverriding(configuration, settings); // settings used per jQuery intialization, configuration per element
        }

        extendConfigurtion(configuration, defaults);
      }

      if (configuration.buildConfiguration) init = configuration.buildConfiguration(element, configuration);
      var css = configuration.css;
      var useCssPatch = configuration.useCssPatch;
      var putRtlToContainer = false;

      if (useCssPatch) {
        extendCss(css, configuration.cssPatch);
      }

      if (!configuration.staticContentGenerator) configuration.staticContentGenerator = staticContentGenerator;
      if (!configuration.getLabelElement) configuration.getLabelElement = getLabelElement;
      if (!configuration.pickContentGenerator) configuration.pickContentGenerator = pickContentGenerator;
      if (!configuration.choiceContentGenerator) configuration.choiceContentGenerator = choiceContentGenerator;
      if (configuration.isRtl === undefined || configuration.isRtl === null) configuration.isRtl = RtlAdapter(element);else if (configuration.isRtl === true) putRtlToContainer = true;
      var staticContent = configuration.staticContentGenerator(element, function (name) {
        return window.document.createElement(name);
      }, configuration.containerClass, putRtlToContainer, css);
      if (configuration.required === null) configuration.required = staticContent.required;
      var optionsAdapter = configuration.optionsAdapter;
      var lazyDefinedEvent;

      if (!optionsAdapter) {
        if (configuration.options) {
          optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getSize, configuration.getValidity, function () {
            lazyDefinedEvent();
            trigger('dashboardcode.multiselect:change');
          });
        } else {
          adjustBsOptionAdapterConfiguration(configuration, staticContent.selectElement);
          optionsAdapter = OptionsAdapterElement(staticContent.selectElement, configuration.getDisabled, configuration.getSize, configuration.getValidity, function () {
            lazyDefinedEvent();
            trigger('change');
            trigger('dashboardcode.multiselect:change');
          });
        }
      }

      if (!configuration.getIsValueMissing) {
        configuration.getIsValueMissing = function () {
          var count = 0;
          var options = optionsAdapter.getOptions();

          for (var i = 0; i < options.length; i++) {
            if (options[i].selected) count++;
          }

          return count === 0;
        };
      }

      var isValueMissingObservable = ObservableLambda(function () {
        return configuration.required && configuration.getIsValueMissing();
      });
      var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());

      lazyDefinedEvent = function lazyDefinedEvent() {
        return isValueMissingObservable.call();
      };

      var labelAdapter = LabelAdapter(configuration.labelElement, staticContent.createInputId);

      if (!configuration.placeholder) {
        configuration.placeholder = getDataGuardedWithPrefix(element, "bsmultiselect", "placeholder");
      }

      if (!configuration.valueMissingMessage) {
        configuration.valueMissingMessage = getDataGuardedWithPrefix(element, "bsmultiselect", "value-missing-message");

        if (!configuration.valueMissingMessage) {
          configuration.valueMissingMessage = defValueMissingMessage;
        }
      }

      var setSelected = configuration.setSelected;

      if (!setSelected) {
        if (configuration.options) setSelected = function setSelected(option, value) {
          option.selected = value;
        };else setSelected = function setSelected(option, value) {
          if (value) option.setAttribute('selected', '');else {
            option.removeAttribute('selected');
            option.selected = false;
          }
        };
      }

      var validationApi = ValidityApi(staticContent.filterInputElement, isValueMissingObservable, configuration.valueMissingMessage, function (isValid) {
        return validationApiObservable.setValue(isValid);
      });
      var multiSelect = new MultiSelect(optionsAdapter, setSelected, staticContent, function (pickElement) {
        return configuration.pickContentGenerator(pickElement, css);
      }, function (choiceElement) {
        return configuration.choiceContentGenerator(choiceElement, css);
      }, labelAdapter, configuration.placeholder, configuration.isRtl, css, Popper, window);
      multiSelect.onDispose = composeSync(multiSelect.onDispose, isValueMissingObservable.detachAll, validationApiObservable.detachAll);
      multiSelect.validationApi = validationApi;
      bsAppearance(multiSelect, staticContent, optionsAdapter, validationApiObservable, useCssPatch, css);
      if (init && init instanceof Function) init(multiSelect);
      multiSelect.init(); // support browser's "step backward" on form restore

      if (staticContent.selectElement && window.document.readyState != "complete") {
        window.setTimeout(function () {
          multiSelect.UpdateSelected();
        });
      }

      return multiSelect;
    }

    (function (window, $, Popper) {
      var createPlugin = function createPlugin(element, settings, onDispose) {
        var trigger = function trigger(e, eventName) {
          return $(e).trigger(eventName);
        };

        var environment = {
          trigger: trigger,
          window: window,
          Popper: Popper
        };
        var multiSelect = BsMultiSelect(element, environment, settings);
        multiSelect.onDispose = composeSync(multiSelect.onDispose, onDispose);
        return multiSelect;
      };

      addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    })(window, $, Popper);

})));
//# sourceMappingURL=BsMultiSelect.js.map
