/*!
  * DashboardCode BsMultiSelect v0.5.40 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2020 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
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
function containsAndSelf(node, otherNode) {
  return node === otherNode || node.contains(otherNode);
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

function getIsRtl(element) {
  var isRtl = false;
  var e = closestByAttribute(element, "dir", "rtl");
  if (e) isRtl = true;
  return isRtl;
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
function EventLoopFlag(window) {
  var flag = false;
  return {
    get: function get() {
      return flag;
    },
    set: function set() {
      flag = true;
      window.setTimeout(function () {
        flag = false;
      }, 0);
    }
  };
}

function FilterPanel(filterInputElement, onFocusIn, // show dropdown
onFocusOut, // hide dropdown
onKeyDownArrowUp, onKeyDownArrowDown, onTabForEmpty, // tab on empty
onBackspace, // backspace alike
onTabToCompleate, // "compleate alike"
onEnterToCompleate, onKeyUpEsc, // "esc" alike
stopEscKeyDownPropogation, onInput //, // filter
) {
  filterInputElement.setAttribute("type", "search");
  filterInputElement.setAttribute("autocomplete", "off");

  var isEmpty = function isEmpty() {
    return filterInputElement.value ? false : true;
  };

  var onfilterInputKeyDown = function onfilterInputKeyDown(event) {
    var keyCode = event.which;
    var empty = isEmpty();

    if ([13, 27 // '27-esc' there is "just in case", I can imagine that there are user agents that do UNDO
    ].indexOf(keyCode) >= 0 || keyCode == 9 && !empty //  otherwice there are no keyup (true at least for '9-tab'),
    ) {
        event.preventDefault(); // '13-enter'  - prevention against form's default button 
        // but doesn't help with bootsrap modal ESC or ENTER (close behaviour);
      }

    if ([38, 40].indexOf(keyCode) >= 0) event.preventDefault();

    if (keyCode == 8
    /*backspace*/
    ) {
        // NOTE: this will process backspace only if there are no text in the input field
        // If user will find this inconvinient, we will need to calculate something like this
        // let isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
        if (empty) {
          onBackspace();
        }
      } // ---------------------------------------------------------------------------------
      // NOTE: no preventDefault called in case of empty for 9-tab
    else if (keyCode == 9
      /*tab*/
      ) {
          // NOTE: no keydown for this (without preventDefaul after TAB keyup event will be targeted another element)  
          if (empty) {
            onTabForEmpty(); // hideChoices inside (and no filter reset since it is empty) 
          }
        } else if (keyCode == 27
      /*esc*/
      ) {
          // NOTE: forbid the ESC to close the modal (in case the nonempty or dropdown is open)
          if (!empty || stopEscKeyDownPropogation()) event.stopPropagation();
        } else if (keyCode == 38) {
        onKeyDownArrowUp();
      } else if (keyCode == 40) {
        onKeyDownArrowDown();
      }
  };

  var onFilterInputKeyUp = function onFilterInputKeyUp(event) {
    var keyCode = event.which; //var handler = keyUp[event.which/* key code */];
    //handler();

    if (keyCode == 9) {
      onTabToCompleate();
    } else if (keyCode == 13) {
      onEnterToCompleate();
    } else if (keyCode == 27) {
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
    } // TODO: better width calculation
    );
  };

  var eventBinder = EventBinder();
  eventBinder.bind(filterInputElement, 'focusin', onFocusIn);
  eventBinder.bind(filterInputElement, 'focusout', onFocusOut);
  eventBinder.bind(filterInputElement, 'input', onFilterInputInput);
  eventBinder.bind(filterInputElement, 'keydown', onfilterInputKeyDown);
  eventBinder.bind(filterInputElement, 'keyup', onFilterInputKeyUp);
  return {
    isEmpty: isEmpty,
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
      eventBinder.unbind();
    }
  };
}

function isBoolean(value) {
  return value === true || value === false;
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
          prev: tail,
          next: null
        };
        tail = tail.next;
      } else tail = {
        value: e,
        prev: null,
        next: null
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
function ListFacade(getPrev, setPrev, getNext, setNext) {
  var head = null,
      tail = null;
  var count = 0;

  var remove = function remove(e) {
    if (getPrev(e)) {
      setNext(getPrev(e), getNext(e));
    }

    if (getNext(e)) {
      setPrev(getNext(e), getPrev(e));
    }

    if (tail == e) {
      tail = getPrev(e);
    }

    if (head == e) {
      head = null;
    }

    count--;
  };

  return {
    add: function add(e, prev) {
      if (!tail) {
        head = tail = e;
      } else {
        if (!prev || prev === tail) {
          setPrev(e, tail);
          setNext(tail, e);
          tail = e;
        } else {
          setPrev(e, prev);
          setNext(e, getNext(prev));
          setNext(prev, e);
          setPrev(e.next, e);
        }
      }

      count++;
    },
    remove: remove,
    forEach: function forEach(f) {
      forEachRecursion(f, tail);
    },
    getHead: function getHead() {
      return head;
    },
    getTail: function getTail() {
      return tail;
    },
    getCount: function getCount() {
      return count;
    },
    isEmpty: function isEmpty() {
      return count == 0;
    },
    reset: function reset() {
      tail = head = null;
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
function def() {
  for (var _len4 = arguments.length, functions = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    functions[_key4] = arguments[_key4];
  }

  for (var _i = 0, _functions = functions; _i < _functions.length; _i++) {
    var _f = _functions[_i];

    if (_f) {
      return _f;
    }
  }
}
function defCall() {
  for (var _len5 = arguments.length, functions = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    functions[_key5] = arguments[_key5];
  }

  for (var _i2 = 0, _functions2 = functions; _i2 < _functions2.length; _i2++) {
    var _f2 = _functions2[_i2];

    if (_f2) {
      if (_f2 instanceof Function) return _f2();else return _f2;
    }
  }
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
} // export function isFunction(obj){
//     return typeof obj === 'function'
// }

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

function setChoices(forEach, filterFacade, getFilterIn) {
  filterFacade.reset();
  forEach(function (choice) {
    choice.prev = choice.next = null;

    if (!choice.isOptionHidden) {
      var v = getFilterIn(choice);
      if (v) filterFacade.add(choice);
      choice.setVisible(v);
    }
  });
}

function ChoicesPanel() {
  var choicesList = [];
  var hoveredChoice = null;
  var filterFacade = ListFacade(function (choice) {
    return choice.prev;
  }, function (choice, v) {
    return choice.prev = v;
  }, function (choice) {
    return choice.next;
  }, function (choice, v) {
    return choice.next = v;
  });

  function resetHoveredChoice() {
    if (hoveredChoice) {
      hoveredChoice.setHoverIn(false);
      hoveredChoice = null;
    }
  }

  function forEach(processChoice) {
    for (var i = 0; i < choicesList.length; i++) {
      var choice = choicesList[i];
      processChoice(choice);
    }
  }

  var item = {
    push: function push(choice) {
      if (!choice.isOptionHidden) filterFacade.add(choice);
      choicesList.push(choice);
    },
    get: function get(key) {
      return choicesList[key];
    },
    add: function add(key, choice) {
      if (!choice.isOptionHidden) {
        if (key == 0) filterFacade.add(choice);else {
          var keyAfter = key - 1;
          var afterChoice = choicesList[keyAfter];

          while (afterChoice.isOptionHidden) {
            keyAfter--;
            afterChoice = choicesList[keyAfter];
          }

          filterFacade.add(choice, afterChoice);
        }
      }

      choicesList.splice(key, 0, choice);
    },
    remove: function remove(key) {
      filterFacade.remove(choicesList[key]);
      choicesList.splice(key, 1);
    },
    forEach: forEach,
    getFirstVisibleChoice: function getFirstVisibleChoice() {
      return filterFacade.getHead();
    },
    getVisibleCount: function getVisibleCount() {
      return filterFacade.getCount();
    },
    getHasVisible: function getHasVisible() {
      return filterFacade.getCount() > 0;
    },
    getHoveredChoice: function getHoveredChoice() {
      return hoveredChoice;
    },
    hoverIn: function hoverIn(choice) {
      resetHoveredChoice();
      hoveredChoice = choice;
      hoveredChoice.setHoverIn(true);
    },
    resetHoveredChoice: resetHoveredChoice,
    setFilter: function setFilter(text) {
      return setChoices(forEach, filterFacade, function (choice) {
        return !choice.isOptionSelected && !choice.isOptionDisabled && choice.searchText.indexOf(text) >= 0;
      });
    },
    resetFilter: function resetFilter() {
      return setChoices(forEach, filterFacade, function () {
        return true;
      });
    },
    navigate: function navigate(down) {
      if (down) {
        return hoveredChoice ? hoveredChoice.next : filterFacade.getHead();
      } else {
        return hoveredChoice ? hoveredChoice.prev : filterFacade.getTail();
      }
    },
    clear: function clear() {
      choicesList = [];
      filterFacade.reset();
    },
    dispose: function dispose() {
      forEach(function (choice) {
        if (choice.dispose) {
          choice.dispose();
        }
      });
    }
  };
  return item;
}

function PicksList() {
  var list = List();
  return {
    addPick: function addPick(pick) {
      var removeFromList = list.add(pick);
      return removeFromList;
    },
    removePicksTail: function removePicksTail() {
      var i = list.getTail();
      if (i) i.remove(); // always remove in this case
    },
    isEmpty: list.isEmpty,
    // function
    getCount: list.getCount,
    disableRemoveAll: function disableRemoveAll() {
      list.forEach(function (i) {
        return i.disableRemove();
      });
    },
    removeAll: function removeAll() {
      list.forEach(function (i) {
        return i.remove();
      });
    },
    clear: function clear() {
      list.forEach(function (i) {
        return i.dispose();
      });
      list.reset();
    },
    dispose: function dispose() {
      list.forEach(function (i) {
        return i.dispose();
      });
    }
  };
}

function MultiSelectInputAspect(window, appendToContainer, filterInputElement, picksElement, choicesElement, isChoicesVisible, setChoicesVisible, resetHoveredChoice, hoverIn, resetFilter, isChoiceEmpty, onClick, isRtl, Popper) {
  appendToContainer();
  var document = window.document;
  var eventLoopFlag = EventLoopFlag(window); // showChoices

  var skipFocusout = false; // we want to escape the closing of the menu (because of focus out from) on a user's click inside the container

  var skipoutMousedown = function skipoutMousedown() {
    skipFocusout = true;
  };

  var documentMouseup = function documentMouseup(event) {
    // if click outside container - close dropdown
    if (!containsAndSelf(choicesElement, event.target) && !containsAndSelf(picksElement, event.target)) {
      hideChoices();
      resetFilter();
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
      if (isChoicesVisible()) {
        hideChoices();
      } else {
        if (!isChoiceEmpty()) {
          alignToFilterInputItemLocation(true);
          showChoices();
        }
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

  function showChoices() {
    if (!isChoicesVisible()) {
      eventLoopFlag.set();
      setChoicesVisible(true); // add listeners that manages close dropdown on input's focusout and click outside container
      //container.removeEventListener("mousedown", containerMousedown);

      picksElement.addEventListener("mousedown", skipoutMousedown);
      choicesElement.addEventListener("mousedown", skipoutMousedown);
      document.addEventListener("mouseup", documentMouseup);
    }
  }

  function hideChoices() {
    resetMouseCandidateChoice();
    resetHoveredChoice();

    if (isChoicesVisible()) {
      setChoicesVisible(false);
      picksElement.removeEventListener("mousedown", skipoutMousedown);
      choicesElement.removeEventListener("mousedown", skipoutMousedown);
      document.removeEventListener("mouseup", documentMouseup);
    }
  }

  function processUncheck(uncheckOption, event) {
    // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
    // never remove elements in the same event iteration
    window.setTimeout(function () {
      return uncheckOption();
    }, 0);
    preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
  }

  function handleOnRemoveButton(onRemove, setSelectedFalse) {
    // processRemoveButtonClick removes the item
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
    var processRemoveButtonClick = function processRemoveButtonClick(event) {
      processUncheck(setSelectedFalse, event);
      hideChoices();
      resetFilter();
    };

    onRemove(function (event) {
      processRemoveButtonClick(event);
    });
  }

  var mouseCandidateEventBinder = EventBinder();

  var resetMouseCandidateChoice = function resetMouseCandidateChoice() {
    mouseCandidateEventBinder.unbind();
  };

  var mouseOverToHoveredAndReset = function mouseOverToHoveredAndReset(choice) {
    if (!choice.isHoverIn) hoverIn(choice);
    resetMouseCandidateChoice();
  };

  function adoptChoiceElement(choice, choiceElement) {
    // in chrome it happens on "become visible" so we need to skip it, 
    // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
    // mouse moves inside the item. 
    // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous
    var onChoiceElementMouseover = function onChoiceElementMouseover() {
      if (eventLoopFlag.get()) {
        resetMouseCandidateChoice();
        mouseCandidateEventBinder.bind(choiceElement, 'mousemove', function () {
          return mouseOverToHoveredAndReset(choice);
        });
        mouseCandidateEventBinder.bind(choiceElement, 'mousedown', function () {
          return mouseOverToHoveredAndReset(choice);
        });
      } else {
        if (!choice.isHoverIn) {
          // NOTE: mouseleave is not enough to guarantee remove hover styles in situations
          // when style was setuped without mouse (keyboard arrows)
          // therefore force reset manually (done inside hoverIn)
          hoverIn(choice);
        }
      }
    }; // note 1: mouseleave preferred to mouseout - which fires on each descendant
    // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work


    var onChoiceElementMouseleave = function onChoiceElementMouseleave() {
      if (!eventLoopFlag.get()) {
        resetHoveredChoice();
      }
    };

    var overAndLeaveEventBinder = EventBinder();
    overAndLeaveEventBinder.bind(choiceElement, 'mouseover', onChoiceElementMouseover);
    overAndLeaveEventBinder.bind(choiceElement, 'mouseleave', onChoiceElementMouseleave);
    return overAndLeaveEventBinder.unbind;
  }

  return {
    adoptChoiceElement: adoptChoiceElement,
    dispose: function dispose() {
      resetMouseCandidateChoice();
      popper.destroy();
      componentDisabledEventBinder.unbind();
    },
    alignToFilterInputItemLocation: alignToFilterInputItemLocation,
    getSkipFocusout: function getSkipFocusout() {
      return skipFocusout;
    },
    resetSkipFocusout: function resetSkipFocusout() {
      skipFocusout = false;
    },
    disable: function disable(isComponentDisabled) {
      if (isComponentDisabled) componentDisabledEventBinder.unbind();else componentDisabledEventBinder.bind(picksElement, "click", function (event) {
        onClick(event);
        alignAndShowChoices(event);
      }); // OPEN dropdown
    },
    eventLoopFlag: eventLoopFlag,
    hideChoices: hideChoices,
    showChoices: showChoices,
    handleOnRemoveButton: handleOnRemoveButton
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
    if (param === "") {
      if (isRemoveEmptyClasses) {
        out.classes = [];
      }
    } else {
      var c = param.split(' ');
      out.classes = actionStr(c);
    }

    return true;
  } else if (param instanceof Array) {
    if (param.length == 0) {
      if (isRemoveEmptyClasses) {
        out.classes = [];
      }
    } else {
      out.classes = actionArr(param);
    }

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
    setDisabled: function setDisabled(isComponentDisabled) {
      inputElement.disabled = isComponentDisabled;
    }
  };
}

function Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden) {
  var choice = {
    option: option,
    isOptionHidden: isOptionHidden,
    isOptionSelected: isOptionSelected,
    isOptionDisabled: isOptionDisabled,
    isHoverIn: false,
    isFilterIn: false,
    prev: null,
    next: null,
    searchText: option.text.toLowerCase().trim(),
    insertAfter: null,
    remove: null,
    updateDisabled: null,
    updateSelected: null,
    // internal state handlers, so they do not have "update semantics"
    setVisible: null,
    setHoverIn: null,
    dispose: null
  };
  return choice;
}
function setOptionSelected(choice, value, setSelected) {
  var success = false;
  var confirmed = setSelected(choice.option, value);

  if (!(confirmed === false)) {
    choice.isOptionSelected = value;
    choice.updateSelected();
    success = true;
  }

  return success;
}
function updateSelectedChoice(choice) {
  var newIsSelected = choice.option.selected;

  if (newIsSelected != choice.isOptionSelected) {
    choice.isOptionSelected = newIsSelected;
    if (!choice.isOptionHidden) choice.updateSelected();
  }
}
function updateDisabledChoice(choice, getIsOptionDisabled) {
  var newIsDisabled = getIsOptionDisabled(choice.option);

  if (newIsDisabled != choice.isOptionDisabled) {
    choice.isOptionDisabled = newIsDisabled;
    if (!choice.isOptionHidden) choice.updateDisabled();
  }
}
function updateHiddenChoice(choice, getIsOptionHidden) {
  var newIsOptionHidden = getIsOptionHidden(choice.option);

  if (newIsOptionHidden != choice.isOptionHidden) {
    choice.isOptionHidden = newIsOptionHidden;
    if (!choice.isOptionHidden) choice.updateHidden();
  }
} // export function isVisibleChoice(choice){
//     return choice.isFilteredIn /*&& !choice.isOptionHidden*/
// }

var MultiSelect = /*#__PURE__*/function () {
  function MultiSelect(getOptions, common, getIsComponentDisabled, setSelected, getIsOptionDisabled, getIsOptionHidden, staticContent, pickContentGenerator, choiceContentGenerator, labelAdapter, placeholderText, isRtl, onChange, css, popper, window) {
    this.isRtl = isRtl; // readonly

    this.common = common;
    this.getOptions = getOptions;
    this.getIsOptionDisabled = getIsOptionDisabled;
    this.getIsOptionHidden = getIsOptionHidden;
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
    this.onChange = onChange;
    this.getIsComponentDisabled = getIsComponentDisabled;
  }

  var _proto = MultiSelect.prototype;

  _proto.toggleOptionSelected = function toggleOptionSelected(choice) {
    var success = false;
    if (choice.isOptionSelected || !choice.isOptionDisabled) success = setOptionSelected(choice, !choice.isOptionSelected, this.setSelected);
    return success;
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
    this.choicesPanel.resetFilter();
  } // -----------------------------------------------------------------------------------------------------------------------
  ;

  _proto.GetContainer = function GetContainer() {
    return this.staticContent.containerElement;
  };

  _proto.GetChoices = function GetChoices() {
    return this.staticContent.choicesElement;
  };

  _proto.GetFilterInput = function GetFilterInput() {
    return this.staticContent.filterInputElement;
  };

  _proto.Update = function Update() {
    this.UpdateAppearance();
    this.UpdateData();
  };

  _proto.DeselectAll = function DeselectAll() {
    this.aspect.hideChoices(); // always hide 1st

    this.picksList.removeAll();
    this.resetFilter();
  };

  _proto.PicksCount = function PicksCount() {
    return this.picksList.getCount();
  };

  _proto.SelectAll = function SelectAll() {
    var _this = this;

    this.aspect.hideChoices(); // always hide 1st

    this.choicesPanel.forEach(function (choice) {
      if (!choice.isOptionSelected && !choice.isOptionDisabled && !choice.isOptionHidden) setOptionSelected(choice, true, _this.setSelected);
    });
    this.resetFilter();
  };

  _proto.empty = function empty() {
    // close drop down , remove filter
    this.aspect.hideChoices(); // always hide 1st

    this.resetFilter();
    this.staticContent.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
    // for(let i=0; i<this.MultiSelectDataList.length; i++)
    // {
    //     let multiSelectData = this.MultiSelectDataList[i];
    //     if (multiSelectData.choice)
    //         multiSelectData.choice.remove();
    // }

    this.choicesPanel.clear();
    this.picksList.clear();
    this.placeholderAspect.updatePlacehodlerVisibility();
  };

  _proto.UpdateData = function UpdateData() {
    this.empty(); // reinitiate

    this.updateDataImpl();
  };

  _proto.UpdateOptionsDisabled = function UpdateOptionsDisabled() {
    var options = this.getOptions();

    for (var i = 0; i < options.length; i++) {
      this.UpdateOptionDisabled(i);
    }
  } // UpdateOption(key){
  //     let choice = this.choicesPanel.get(key); // TODO: 
  //     updateDisabledChoice(choice, this.getIsOptionDisabled)
  //     updateSelectedChoice(choice)
  //     // TODO REFRESH the content
  // }
  ;

  _proto.UpdateOptionDisabled = function UpdateOptionDisabled(key) {
    var choice = this.choicesPanel.get(key); // TODO: generalize index as key 

    updateDisabledChoice(choice, this.getIsOptionDisabled);
  };

  _proto.UpdateOptionsSelected = function UpdateOptionsSelected() {
    var options = this.getOptions();

    for (var i = 0; i < options.length; i++) {
      this.UpdateOptionSelected(i);
    }
  };

  _proto.UpdateOptionSelected = function UpdateOptionSelected(key) {
    var choice = this.choicesPanel.get(key); // TODO: generalize index as key 

    updateSelectedChoice(choice); // TODO: invite this.getIsOptionSelected
  };

  _proto.SetOptionSelected = function SetOptionSelected(key, value) {
    var choice = this.choicesPanel.get(key);
    setOptionSelected(choice, value, this.setSelected);
  };

  _proto.UpdateOptionsHidden = function UpdateOptionsHidden() {
    var options = this.getOptions();

    for (var i = 0; i < options.length; i++) {
      this.UpdateOptionHidden(i);
    }
  };

  _proto.UpdateOptionHidden = function UpdateOptionHidden(key) {
    var choice = this.choicesPanel.get(key); // TODO: generalize index as key 

    updateHiddenChoice(choice); // TODO: invite this.getIsOptionSelected
  };

  _proto.UpdateOptionAdded = function UpdateOptionAdded(key) {
    // TODO: generalize index as key 
    var options = this.getOptions();
    var option = options[key];
    var newChoice;

    if (key == 0) {
      newChoice = this.createChoice(option);
    } else {
      var tmp = this.choicesPanel.get(key - 1);
      newChoice = tmp.insertAfter ? tmp.insertAfter(option) : this.createChoice(option);
    }

    this.choicesPanel.add(key, newChoice);
    this.aspect.hideChoices(); // always hide 1st

    this.choicesPanel.resetFilter();
  };

  _proto.UpdateOptionRemoved = function UpdateOptionRemoved(key) {
    // TODO: generalize index as key 
    var choice = this.choicesPanel.get(key);
    if (choice.remove) choice.remove();
    if (choice.dispose) choice.dispose();
    this.choicesPanel.remove(key);
    this.aspect.hideChoices(); // always hide 1st

    this.choicesPanel.resetFilter();
  };

  _proto.createPick = function createPick(choice) {
    var _this2 = this;

    var _this$staticContent$c = this.staticContent.createPickElement(),
        pickElement = _this$staticContent$c.pickElement,
        attach = _this$staticContent$c.attach;

    var detach = function detach() {
      return removeElement(pickElement);
    };

    var pickContent = this.pickContentGenerator(pickElement);
    var pick = {
      disableRemove: function disableRemove() {
        return pickContent.disableRemove(_this2.getIsComponentDisabled());
      },
      setData: function setData() {
        return pickContent.setData(choice.option);
      },
      disable: function disable() {
        return pickContent.disable(_this2.getIsOptionDisabled(choice.option));
      },
      remove: null,
      dispose: function dispose() {
        detach();
        pickContent.dispose();
        pick.disableRemove = null;
        pick.setData = null;
        pick.disable = null;
        pick.remove = null;
        pick.dispose = null;
      }
    };
    pick.setData();
    pick.disableRemove();
    attach();
    var choiceUpdateDisabledBackup = choice.updateDisabled;
    choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.disable);
    var removeFromList = this.picksList.addPick(pick);

    var removePick = function removePick() {
      removeFromList();
      pick.dispose();
      choice.updateDisabled = choiceUpdateDisabledBackup;
      choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled

      if (_this2.picksList.getCount() == 0) _this2.placeholderAspect.updatePlacehodlerVisibility();
    };

    var setSelectedFalse = function setSelectedFalse() {
      return setOptionSelected(choice, false, _this2.setSelected);
    };

    pick.remove = setSelectedFalse;
    this.aspect.handleOnRemoveButton(pickContent.onRemove, setSelectedFalse);
    if (this.picksList.getCount() == 1) this.placeholderAspect.updatePlacehodlerVisibility();
    return removePick;
  };

  _proto.createChoice = function createChoice(option, prevVisibleChoice, prevVisibleChoiceElement) {
    var _this3 = this;

    var isOptionHidden = this.getIsOptionHidden(option);
    var isOptionSelected = option.selected;
    var isOptionDisabled = this.getIsOptionDisabled(option);
    var choice = Choice(option, isOptionSelected, isOptionDisabled, isOptionHidden);

    if (isOptionHidden) {
      choice.insertAfter = prevVisibleChoice ? prevVisibleChoice.insertAfter : null;

      choice.dispose = function () {
        choice.insertAfter = null;
        choice.dispose = null;
      };
    } else {
      var _this$staticContent$c2 = this.staticContent.createChoiceElement(),
          choiceElement = _this$staticContent$c2.choiceElement,
          setVisible = _this$staticContent$c2.setVisible,
          attach = _this$staticContent$c2.attach;

      choice.insertAfter = function (option) {
        var nextChoice = _this3.createChoice(option, choice, choiceElement);

        return nextChoice;
      };

      var choiceContent = this.choiceContentGenerator(choiceElement, function () {
        _this3.toggleOptionSelected(choice);

        _this3.filterPanel.setFocus();
      });

      var updateSelectedChoiceContent = function updateSelectedChoiceContent() {
        return choiceContent.select(choice.isOptionSelected);
      };

      var pickTools = {
        updateSelectedTrue: null,
        updateSelectedFalse: null
      };

      var createPick = function createPick() {
        var removePick = _this3.createPick(choice);

        pickTools.updateSelectedFalse = removePick;
      };

      pickTools.updateSelectedTrue = createPick;

      choice.remove = function () {
        removeElement(choiceElement);
        if (pickTools.updateSelectedFalse) pickTools.updateSelectedFalse();
      };

      choice.updateSelected = function () {
        updateSelectedChoiceContent();
        if (choice.isOptionSelected) pickTools.updateSelectedTrue();else pickTools.updateSelectedFalse();

        _this3.onChange();
      };

      var unbindChoiceElement = this.aspect.adoptChoiceElement(choice, choiceElement);
      choice.isFilteredIn = true;
      attach(prevVisibleChoiceElement);
      choiceContent.setData(choice.option);

      choice.setHoverIn = function (v) {
        choice.isHoverIn = v;
        choiceContent.hoverIn(choice.isHoverIn);
      };

      choice.setVisible = function (v) {
        choice.isFilteredIn = v;
        setVisible(choice.isFilteredIn);
      }; // updateHidden


      choice.updateDisabled = function () {
        choiceContent.disable(choice.isOptionDisabled, choice.isOptionSelected);
      };

      choice.dispose = function () {
        unbindChoiceElement();
        choiceContent.dispose();
        choice.insertAfter = null;
        choice.updateSelected = null;
        choice.updateDisabled = null; // not real data manipulation but internal state

        choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item

        choice.setHoverIn = null;
        choice.dispose = null;
      };

      if (choice.isOptionSelected) {
        updateSelectedChoiceContent();
        createPick();
      }

      choice.updateDisabled();
    }

    return choice;
  };

  _proto.updateDataImpl = function updateDataImpl() {
    var _this4 = this;

    var fillChoices = function fillChoices() {
      var options = _this4.getOptions();

      var prevChoice = null;

      for (var i = 0; i < options.length; i++) {
        var option = options[i];
        if (i == 0) prevChoice = _this4.createChoice(option); // insertAfter
        else {
            prevChoice = prevChoice.insertAfter ? prevChoice.insertAfter(option) : _this4.createChoice(option);
          }

        _this4.choicesPanel.push(prevChoice);
      }

      _this4.aspect.alignToFilterInputItemLocation(false);
    }; // browsers can change select value as part of "autocomplete" (IE11) 
    // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
    // but they never "restore" selected-disabled options.
    // TODO: make the FROM Validation for 'selected-disabled' easy.


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
    sync(this.aspect.hideChoices, this.picksList.dispose, this.filterPanel.dispose, this.labelAdapter.dispose, this.aspect.dispose, this.staticContent.dispose, this.choicesPanel.dispose);
  };

  _proto.UpdateAppearance = function UpdateAppearance() {
    this.UpdateDisabled();
  };

  _proto.UpdateDisabled = function UpdateDisabled() {
    var isComponentDisabled = this.getIsComponentDisabled();

    if (this.isComponentDisabled !== isComponentDisabled) {
      this.picksList.disableRemoveAll(isComponentDisabled);
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
      this.choicesPanel.setFilter(text);

      if (this.choicesPanel.getVisibleCount() == 1) {
        var fullMatchChoice = this.choicesPanel.getFirstVisibleChoice();

        if (fullMatchChoice.searchText == text) {
          setOptionSelected(fullMatchChoice, true, this.setSelected);
          this.filterPanel.setEmpty(); // clear

          this.placeholderAspect.updateEmptyInputWidth();
          isEmpty = true;
        }
      }
    }
    if (isEmpty) this.processEmptyInput();else resetLength();
    this.aspect.eventLoopFlag.set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

    if (this.choicesPanel.getVisibleCount() == 1) {
      this.choicesPanel.resetHoveredChoice();
      this.choicesPanel.hoverIn(this.choicesPanel.getFirstVisibleChoice());
    }

    if (this.choicesPanel.getHasVisible()) {
      this.aspect.alignToFilterInputItemLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

      this.aspect.showChoices();
    } else {
      this.aspect.hideChoices();
    }
  };

  _proto.hoveredToSelected = function hoveredToSelected() {
    var hoveredChoice = this.choicesPanel.getHoveredChoice();

    if (hoveredChoice) {
      var wasToggled = this.toggleOptionSelected(hoveredChoice);

      if (wasToggled) {
        //this.choicesPanel.resetHoveredChoice();
        this.aspect.hideChoices();
        this.resetFilter();
      }
    }
  };

  _proto.keyDownArrow = function keyDownArrow(down) {
    var iChoice = this.choicesPanel.navigate(down);

    if (iChoice) {
      this.choicesPanel.hoverIn(iChoice);
      this.aspect.alignToFilterInputItemLocation(true);
      this.aspect.showChoices();
    }
  };

  _proto.init = function init() {
    var _this5 = this;

    this.filterPanel = FilterPanel(this.staticContent.filterInputElement, function () {
      _this5.staticContent.setIsFocusIn(true);

      _this5.staticContent.toggleFocusStyling();
    }, // focus in - show dropdown
    function () {
      if (!_this5.aspect.getSkipFocusout()) // skip initiated by mouse click (we manage it different way)
        {
          _this5.resetFilter(); // if do not do this we will return to filtered list without text filter in input


          _this5.staticContent.setIsFocusIn(false);

          _this5.staticContent.toggleFocusStyling();
        }

      _this5.aspect.resetSkipFocusout();
    }, // focus out - hide dropdown
    function () {
      return _this5.keyDownArrow(false);
    }, // arrow up
    function () {
      return _this5.keyDownArrow(true);
    }, // arrow down

    /*onTabForEmpty*/
    function () {
      return _this5.aspect.hideChoices();
    }, // tab on empty
    function () {
      _this5.picksList.removePicksTail();

      _this5.aspect.alignToFilterInputItemLocation(false);
    }, // backspace - "remove last"

    /*onTabToCompleate*/
    function () {
      if (_this5.staticContent.isChoicesVisible()) {
        _this5.hoveredToSelected();
      }
    },
    /*onEnterToCompleate*/
    function () {
      if (_this5.staticContent.isChoicesVisible()) {
        _this5.hoveredToSelected();
      } else {
        if (_this5.choicesPanel.getHasVisible()) {
          _this5.aspect.alignToFilterInputItemLocation(true);

          _this5.aspect.showChoices();
        }
      }
    },
    /*onKeyUpEsc*/
    function () {
      _this5.aspect.hideChoices(); // always hide 1st
      //this.choicesPanel.resetHoveredChoice();


      _this5.resetFilter();
    }, // esc keyup 
    // tab/enter "compleate hovered"

    /*stopEscKeyDownPropogation */
    function () {
      return _this5.staticContent.isChoicesVisible();
    },
    /*onInput*/
    function (filterInputValue, resetLength) {
      _this5.placeholderAspect.updatePlacehodlerVisibility();

      _this5.input(filterInputValue, resetLength);
    }); // attach filterInputElement

    this.staticContent.pickFilterElement.appendChild(this.staticContent.filterInputElement);
    this.labelAdapter.init(this.staticContent.filterInputElement);
    this.staticContent.picksElement.appendChild(this.staticContent.pickFilterElement); // located filter in selectionsPanel       

    this.picksList = PicksList();
    this.choicesPanel = ChoicesPanel();
    this.placeholderAspect = PlaceholderAspect(this.placeholderText, function () {
      return _this5.picksList.isEmpty() && _this5.filterPanel.isEmpty();
    }, this.staticContent.picksElement, this.staticContent.filterInputElement, this.css);
    this.placeholderAspect.updateEmptyInputWidth();
    this.aspect = MultiSelectInputAspect(this.window, function () {
      return _this5.staticContent.appendToContainer();
    }, this.staticContent.filterInputElement, this.staticContent.picksElement, this.staticContent.choicesElement, function () {
      return _this5.staticContent.isChoicesVisible();
    }, function (visible) {
      return _this5.staticContent.setChoicesVisible(visible);
    }, function () {
      return _this5.choicesPanel.resetHoveredChoice();
    }, function (choice) {
      return _this5.choicesPanel.hoverIn(choice);
    }, function () {
      return _this5.resetFilter();
    }, function () {
      return !_this5.choicesPanel.getHasVisible();
    },
    /*onClick*/
    function (event) {
      if (!_this5.filterPanel.isEventTarget(event)) _this5.filterPanel.setFocus();
    }, this.isRtl, this.popper);
    this.staticContent.attachContainer();
    this.updateDataImpl();
    this.UpdateAppearance(); // TODO: now appearance should be done after updateDataImpl, because items should be "already in place", correct it
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

function updateSizeForAdapter(picksElement, getSize) {
  updateSize(picksElement, getSize());
}

function updateSizeJsForAdapter(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, getSize) {
  updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, getSize());
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

function bsAppearance(multiSelect, staticContent, getValidity, getSize, validityApiObservable, useCssPatch, css) {
  var updateSize;

  if (!useCssPatch) {
    updateSize = function updateSize() {
      return updateSizeForAdapter(staticContent.picksElement, getSize);
    };
  } else {
    var picks_lg = css.picks_lg,
        picks_sm = css.picks_sm,
        picks_def = css.picks_def;

    updateSize = function updateSize() {
      return updateSizeJsForAdapter(staticContent.picksElement, picks_lg, picks_sm, picks_def, getSize);
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
    return getValidity();
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

  multiSelect.UpdateAppearance = composeSync(multiSelect.UpdateAppearance.bind(multiSelect), updateSize, validationObservable.call, getManualValidationObservable.call);
  multiSelect.Dispose = composeSync(wasUpdatedObservable.detachAll, validationObservable.detachAll, getManualValidationObservable.detachAll, multiSelect.Dispose.bind(multiSelect));
}
function composeGetValidity(selectElement) {
  var getValidity = function getValidity() {
    return selectElement.classList.contains('is-invalid') ? false : selectElement.classList.contains('is-valid') ? true : null;
  };

  return getValidity;
}
function composeGetDisabled(selectElement) {
  var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');
  var getDisabled = null;

  if (fieldsetElement) {
    getDisabled = function getDisabled() {
      return selectElement.disabled || fieldsetElement.disabled;
    };
  } else {
    getDisabled = function getDisabled() {
      return selectElement.disabled;
    };
  }

  return getDisabled;
}
function composeGetSize(selectElement) {
  var inputGroupElement = closestByClassName(selectElement, 'input-group');
  var getSize = null;

  if (inputGroupElement) {
    getSize = function getSize() {
      var value = null;
      if (inputGroupElement.classList.contains('input-group-lg')) value = 'lg';else if (inputGroupElement.classList.contains('input-group-sm')) value = 'sm';
      return value;
    };
  } else {
    getSize = function getSize() {
      var value = null;
      if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg')) value = 'lg';else if (selectElement.classList.contains('custom-select-sm') || selectElement.classList.contains('form-control-sm')) value = 'sm';
      return value;
    };
  }

  return getSize;
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

function pickContentGenerator(pickElement, common, css) {
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

function choiceContentGenerator(choiceElement, common, css, toggle) {
  choiceElement.innerHTML = '<div><input formnovalidate type="checkbox"><label></label></div>';
  var choiceContentElement = choiceElement.querySelector('DIV');
  var choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
  var choiceLabelElement = choiceContentElement.querySelector('LABEL');
  addStyling(choiceContentElement, css.choiceContent);
  addStyling(choiceCheckBoxElement, css.choiceCheckBox);
  addStyling(choiceLabelElement, css.choiceLabel);
  var selectToggleStyling = toggleStyling(choiceElement, css.choice_selected);
  var disable1ToggleStyling = toggleStyling(choiceElement, css.choice_disabled);
  var hoverInToggleStyling = toggleStyling(choiceElement, css.choice_hover);
  var disable2ToggleStyling = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled);
  var disable3ToggleStyling = toggleStyling(choiceLabelElement, css.choiceLabel_disabled);
  var eventBinder = EventBinder();
  eventBinder.bind(choiceCheckBoxElement, "change", toggle);
  eventBinder.bind(choiceElement, "click", function (event) {
    if (containsAndSelf(choiceElement, event.target)) toggle();
  });
  return {
    setData: function setData(option) {
      choiceLabelElement.textContent = option.text;
    },
    select: function select(isOptionSelected) {
      selectToggleStyling(isOptionSelected);
      choiceCheckBoxElement.checked = isOptionSelected;
    },
    disable: function disable(isOptionDisabled, isOptionSelected) {
      disable1ToggleStyling(isOptionDisabled);
      disable2ToggleStyling(isOptionDisabled);
      disable3ToggleStyling(isOptionDisabled); // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"

      choiceCheckBoxElement.disabled = isOptionDisabled && !isOptionSelected;
    },
    hoverIn: function hoverIn(isHoverIn) {
      hoverInToggleStyling(isHoverIn);
    },
    dispose: function dispose() {
      eventBinder.unbind();
    }
  };
}

function staticContentGenerator(element, createElement, containerClass, forceRtlOnContainer, css) {
  var selectElement = null;
  var containerElement = null;
  var picksElement = null;
  var ownPicksElement = false;

  if (element.tagName == 'SELECT') {
    selectElement = element;

    if (containerClass) {
      //if (selectElement.nextSibling  && selectElement.nextSibling.classList.contains(containerClass) )
      //    containerElement = selectElement.nextSibling;
      //else 
      containerElement = closestByClassName(selectElement, containerClass);
    }
  } else if (element.tagName == "DIV" || element.tagName == "UL") {
    if (element.tagName == "DIV") {
      containerElement = element;
      selectElement = findDirectChildByTagName(element, 'SELECT');
    } else
      /*UL*/
      {
        picksElement = element;
        containerElement = closestByClassName(element, containerClass);

        if (!containerElement) {
          // TODO: create error message submethod
          element.style.backgroundColor = 'red';
          element.style.color = 'white';
          throw new Error('BsMultiSelect: definde on UL but container parent not found');
        }
      }
  } else {
    element.style.backgroundColor = 'red';
    element.style.color = 'white';
    throw new Error('BsMultiSelect: Only DIV and SELECT supported');
  }

  if (containerElement) picksElement = findDirectChildByTagName(containerElement, 'UL');

  if (!picksElement) {
    picksElement = createElement('UL');
    ownPicksElement = true;
  }

  var createPickElement = function createPickElement() {
    var pickElement = createElement('LI');
    addStyling(pickElement, css.pick);
    return {
      pickElement: pickElement,
      attach: function attach() {
        return picksElement.insertBefore(pickElement, pickFilterElement);
      }
    };
  };

  var createChoiceElement = function createChoiceElement() {
    var choiceElement = createElement('LI');
    addStyling(choiceElement, css.choice);
    return {
      choiceElement: choiceElement,
      setVisible: function setVisible(isVisible) {
        return choiceElement.style.display = isVisible ? 'block' : 'none';
      },
      attach: function attach(element) {
        if (element) element.parentNode.insertBefore(choiceElement, element.nextSibling);else choicesElement.insertBefore(choiceElement, choicesElement.firstChild);
      }
    };
  };

  var ownContainerElement = false;

  if (!containerElement) {
    containerElement = createElement('DIV');
    ownContainerElement = true;
  }

  containerElement.classList.add(containerClass);
  var attributeBackup = AttributeBackup();

  if (forceRtlOnContainer) {
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
    disable: function disable(isComponentDisabled) {
      disableToggleStyling(isComponentDisabled);
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
    isChoicesVisible: function isChoicesVisible() {
      return choicesElement.style.display != 'none';
    },
    setChoicesVisible: function setChoicesVisible(visible) {
      choicesElement.style.display = visible ? 'block' : 'none';
    },
    dispose: function dispose() {
      if (ownContainerElement) containerElement.parentNode.removeChild(containerElement);else attributeBackup.restore();

      if (ownPicksElement) {
        picksElement.parentNode.removeChild(picksElement);
      } else {
        // remove styles, TODO: find something better?
        disableToggleStyling(false);
        focusToggleStyling(false);
      }

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
  label: null,
  placeholder: '',
  staticContentGenerator: null,
  pickContentGenerator: null,
  choiceContentGenerator: null,
  buildConfiguration: null,
  isRtl: null,
  setSelected: null,
  required: null,

  /* null means look on select[required] or false if jso-source */
  common: null,
  options: null,
  getIsOptionDisabled: null,
  getIsOptionHidden: null,
  getDisabled: null,
  getSize: null,
  getValidity: null,
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
  var css = configuration.css,
      cssPatch = configuration.cssPatch,
      useCssPatch = configuration.useCssPatch,
      containerClass = configuration.containerClass,
      label = configuration.label,
      isRtl = configuration.isRtl,
      required = configuration.required,
      getIsValueMissing = configuration.getIsValueMissing,
      setSelected = configuration.setSelected,
      placeholder = configuration.placeholder,
      common = configuration.common,
      options = configuration.options,
      getDisabled = configuration.getDisabled,
      getValidity = configuration.getValidity,
      getSize = configuration.getSize,
      getIsOptionDisabled = configuration.getIsOptionDisabled,
      getIsOptionHidden = configuration.getIsOptionHidden;

  if (useCssPatch) {
    extendCss(css, cssPatch);
  }

  var staticContentGenerator$1 = def(configuration.staticContentGenerator, staticContentGenerator);
  var pickContentGenerator$1 = def(configuration.pickContentGenerator, pickContentGenerator);
  var choiceContentGenerator$1 = def(configuration.choiceContentGenerator, choiceContentGenerator);
  var valueMissingMessage = defCall(configuration.valueMissingMessage, function () {
    return getDataGuardedWithPrefix(element, "bsmultiselect", "value-missing-message");
  }, defValueMissingMessage);
  var forceRtlOnContainer = false;
  if (isBoolean(isRtl)) forceRtlOnContainer = true;else isRtl = getIsRtl(element);
  var staticContent = staticContentGenerator$1(element, function (name) {
    return window.document.createElement(name);
  }, containerClass, forceRtlOnContainer, css);
  required = def(required, staticContent.required);
  var lazyDefinedEvent;
  var onChange;
  var getOptions;

  if (options) {
    if (!getValidity) getValidity = function getValidity() {
      return null;
    };
    if (!getDisabled) getDisabled = function getDisabled() {
      return false;
    };
    if (!getSize) getSize = function getSize() {
      return null;
    };
    getOptions = function getOptions() {
      return options;
    }, onChange = function onChange() {
      lazyDefinedEvent();
      trigger('dashboardcode.multiselect:change');
    };
    if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
      return option.disabled === undefined ? false : option.disabled;
    };
    if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
      return option.hidden === undefined ? false : option.hidden;
    };
  } else {
    var selectElement = staticContent.selectElement;
    if (!getValidity) getValidity = composeGetValidity(selectElement);
    if (!getDisabled) getDisabled = composeGetDisabled(selectElement);
    if (!getSize) getSize = composeGetSize(selectElement);
    getOptions = function getOptions() {
      return selectElement.options;
    }, //.getElementsByTagName('OPTION'), 
    onChange = function onChange() {
      lazyDefinedEvent();
      trigger('change');
      trigger('dashboardcode.multiselect:change');
    };
    if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
      return option.disabled;
    };
    if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
      return option.hidden;
    };
  }

  if (!getIsValueMissing) {
    getIsValueMissing = function getIsValueMissing() {
      var count = 0;
      var optionsArray = getOptions();

      for (var i = 0; i < optionsArray.length; i++) {
        if (optionsArray[i].selected) count++;
      }

      return count === 0;
    };
  }

  var isValueMissingObservable = ObservableLambda(function () {
    return required && getIsValueMissing();
  });
  var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());

  lazyDefinedEvent = function lazyDefinedEvent() {
    return isValueMissingObservable.call();
  };

  var labelElement = defCall(label);
  if (!labelElement) labelElement = getLabelElement(staticContent.selectElement);
  var labelAdapter = LabelAdapter(labelElement, staticContent.createInputId);

  if (!placeholder) {
    placeholder = getDataGuardedWithPrefix(element, "bsmultiselect", "placeholder");
  }

  if (!setSelected) {
    setSelected = function setSelected(option, value) {
      option.selected = value;
    }; // NOTE: adding this break Chrome's form reset functionality
    // if (value) option.setAttribute('selected','');
    // else  option.removeAttribute('selected');

  }

  var validationApi = ValidityApi(staticContent.filterInputElement, isValueMissingObservable, valueMissingMessage, function (isValid) {
    return validationApiObservable.setValue(isValid);
  });

  if (!common) {
    common = {
      getDisabled: getDisabled,
      getValidity: getValidity,
      getSize: getSize
    };
  }

  var multiSelect = new MultiSelect(getOptions, common, getDisabled, setSelected, getIsOptionDisabled, getIsOptionHidden, staticContent, function (pickElement) {
    return pickContentGenerator$1(pickElement, common, css);
  }, function (choiceElement, toggle) {
    return choiceContentGenerator$1(choiceElement, common, css, toggle);
  }, labelAdapter, placeholder, isRtl, onChange, css, Popper, window);
  var resetDispose = null;

  if (staticContent.selectElement) {
    var form = closestByTagName(staticContent.selectElement, 'FORM');

    if (form) {
      var eventBuilder = EventBinder();
      eventBuilder.bind(form, 'reset', function () {
        return window.setTimeout(function () {
          return multiSelect.UpdateData();
        });
      });

      resetDispose = function resetDispose() {
        return eventBuilder.unbind();
      };
    }
  }

  multiSelect.Dispose = composeSync(multiSelect.Dispose.bind(multiSelect), isValueMissingObservable.detachAll, validationApiObservable.detachAll, resetDispose);
  multiSelect.validationApi = validationApi;
  bsAppearance(multiSelect, staticContent, getValidity, getSize, validationApiObservable, useCssPatch, css);
  if (init && init instanceof Function) init(multiSelect);
  multiSelect.init(); // support browser's "step backward" on form restore

  if (staticContent.selectElement && window.document.readyState != "complete") {
    window.setTimeout(function () {
      multiSelect.UpdateOptionsSelected();
    });
  }

  return multiSelect;
}

function BsMultiSelect$1(element, environment, settings) {
  if (!environment.trigger) environment.trigger = function (e, name) {
    return e.dispatchEvent(new environment.window.Event(name));
  };
  return BsMultiSelect(element, environment, settings);
}

export { BsMultiSelect$1 as BsMultiSelect };
//# sourceMappingURL=BsMultiSelect.esm.js.map
