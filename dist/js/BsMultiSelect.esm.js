/*!
  * BsMultiSelect v1.2.0-beta.18 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2021 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under Apache 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
function findDirectChildByTagName(element, tagName) {
  let value = null;

  for (let i = 0; i < element.children.length; i++) {
    let tmp = element.children[i];

    if (tmp.tagName == tagName) {
      value = tmp;
      break;
    }
  }

  return value;
}
function closestByTagName(element, tagName) {
  return closest(element, e => e.tagName === tagName); // TODO support xhtml?  e.tagName.toUpperCase() ?
}
function closestByClassName(element, className) {
  return closest(element, e => e.classList.contains(className));
}
function closestByAttribute(element, attributeName, attribute) {
  return closest(element, e => e.getAttribute(attributeName) === attribute);
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
}
function getIsRtl(element) {
  var isRtl = false;
  var e = closestByAttribute(element, "dir", "rtl");
  if (e) isRtl = true;
  return isRtl;
}
function EventBinder() {
  var list = [];
  return {
    bind(element, eventName, handler) {
      element.addEventListener(eventName, handler);
      list.push({
        element,
        eventName,
        handler
      });
    },

    unbind() {
      list.forEach(e => {
        let {
          element,
          eventName,
          handler
        } = e;
        element.removeEventListener(eventName, handler);
      });
    }

  };
}
function EventTumbler(element, eventName, handler) {
  return {
    on() {
      element.addEventListener(eventName, handler);
    },

    off() {
      element.removeEventListener(eventName, handler);
    }

  };
}
function AttributeBackup() {
  var list = [];
  return {
    set(element, attributeName, attribute) {
      var currentAtribute = element.getAttribute(attributeName);
      list.push({
        element,
        currentAtribute,
        attribute
      });
      element.setAttribute(attributeName, attribute);
    },

    restore() {
      list.forEach(e => {
        let {
          element,
          attributeName,
          attribute
        } = e;
        if (attributeName) element.setAttribute(attributeName, attribute);else element.removeAttribute(attributeName);
      });
    }

  };
}
function EventLoopProlongableFlag(window) {
  var flag = false;
  var pr = null;
  return {
    get() {
      return flag;
    },

    set(timeout) {
      if (flag && pr) {
        window.clearTimeout(pr);
      }

      flag = true;
      pr = window.setTimeout(() => {
        flag = false;
        pr = null;
      }, timeout ? timeout : 0);
    }

  };
}
function ResetableFlag() {
  var flag = false;
  return {
    get() {
      return flag;
    },

    set() {
      flag = true;
    },

    reset() {
      flag = false;
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
  for (let property in source) if (destination[property] === undefined) destination[property] = source[property];
}
function shallowClearClone(source, ...sources) {
  // override previous, no null and undefined
  var destination = {};

  for (let property in source) {
    // TODO:  Object.assign (need polyfill for IE11)
    let v = source[property];
    if (!(v === null || v === undefined)) destination[property] = v;
  }

  if (sources) sources.forEach(s => {
    for (let property in s) {
      let v = s[property];
      if (!(v === null || v === undefined)) destination[property] = v;else if (destination.hasOwnProperty(property)) {
        delete destination[property];
      }
    }
  });
  return destination;
}

function forEachRecursion(f, e) {
  if (!e) return;
  let goOn = f(e.value);
  if (!(goOn === false)) forEachRecursion(f, e.prev);
}

function indexRecursion(index, e) {
  if (!e.prev) return index;
  indexRecursion(++index, e.prev);
}

function List() {
  var tail = null;
  var count = 0;
  return {
    add(e) {
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
      let node = tail;

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

      function index() {
        return indexRecursion(0, node);
      }

      return {
        remove,
        index
      };
    },

    forEach(f) {
      forEachRecursion(f, tail);
    },

    getTail() {
      return tail ? tail.value : null;
    },

    getCount() {
      return count;
    },

    isEmpty() {
      return count == 0;
    },

    reset() {
      tail = null;
      count = 0;
    }

  };
}
function DoublyLinkedList(getPrev, setPrev, getNext, setNext) {
  var head = null,
      tail = null;
  var count = 0;
  return {
    add(e, next) {
      if (!tail) {
        head = tail = e;
        setPrev(e, null);
        setNext(e, null);
      } else {
        if (!next) {
          setPrev(e, tail);
          setNext(e, null);
          setNext(tail, e);
          tail = e;
        } else {
          if (next === head) head = e;
          let prev = getPrev(next);
          setNext(e, next);
          setPrev(next, e);

          if (prev) {
            setPrev(e, prev);
            setNext(prev, e);
          } else {
            setPrev(e, null);
          }
        }
      }

      count++;
    },

    remove(e) {
      let next = getNext(e);
      let prev = getPrev(e);

      if (prev) {
        setNext(prev, next);
      }

      if (next) {
        setPrev(next, prev);
      }

      if (tail == e) {
        tail = prev;
      }

      if (head == e) {
        head = next;
      }

      count--;
    },

    getHead() {
      return head;
    },

    getTail() {
      return tail;
    },

    getCount() {
      return count;
    },

    isEmpty() {
      return count == 0;
    },

    reset() {
      tail = head = null;
      count = 0;
    }

  };
}
function ArrayFacade() {
  var list = [];
  return {
    push(e) {
      list.push(e);
    },

    add(e, key) {
      list.splice(key, 0, e);
    },

    get: key => list[key],
    getNext: (key, predicate) => {
      let count = list.length;
      let start = key + 1;

      if (key < count) {
        if (!predicate) return list[start];

        for (let i = start; i < count; i++) {
          let c = list[i];
          if (predicate(c)) return c;
        }
      }
    },

    remove(key) {
      var e = list[key];
      list.splice(key, 1);
      return e;
    },

    forLoop(f) {
      for (let i = 0; i < list.length; i++) {
        let e = list[i];
        f(e, i);
      }
    },

    getHead() {
      return list[0];
    },

    getCount() {
      return list.length;
    },

    isEmpty() {
      return list.length == 0;
    },

    reset() {
      list = [];
    }

  };
}
function composeSync(...functions) {
  return () => functions.forEach(f => {
    if (f) f();
  });
}
function defCall(...functions) {
  for (let f of functions) if (f) {
    if (f instanceof Function) {
      let tmp = f();
      if (tmp) return tmp;
    } else return f;
  }
}
function ObservableValue(value) {
  var list = List();
  return {
    getValue() {
      return value;
    },

    setValue(newValue) {
      value = newValue;
      list.forEach(f => f(newValue));
    },

    attach(f) {
      return list.add(f);
    },

    detachAll() {
      list.reset();
    }

  };
}
function ObservableLambda(func) {
  var list = List();
  var value = func();
  return {
    getValue() {
      return value;
    },

    call() {
      value = func();
      list.forEach(f => f(value));
    },

    attach(f) {
      return list.add(f);
    },

    detachAll() {
      list.reset();
    }

  };
} // export function ObjectValues(object){ // Object.values(plugins) - problem for IE11; full impementation of polifill is mor complex, but for our purpose this is enough
//     var arr = [];
// 	for (var key in object) {
//         arr.push(object[key]);
// 	}
// 	return arr;
// }

function ObjectValuesEx(object) {
  var arr = [];

  for (var key in object) {
    arr.push({
      key: key,
      value: object[key]
    });
  }

  return arr;
}

function addStyling(element, styling) {
  var backupStyling = {
    classes: [],
    styles: {}
  };

  if (styling) {
    var {
      classes,
      styles
    } = styling;
    classes.forEach(e => element.classList.add(e)); // todo use add(classes)

    backupStyling.classes = classes.slice();

    for (let property in styles) {
      backupStyling.styles[property] = element.style[property];
      element.style[property] = styles[property]; // todo use Object.assign (need polyfill for IE11)
    }
  }

  return backupStyling;
}

function removeStyling(element, styling) {
  if (styling) {
    var {
      classes,
      styles
    } = styling;
    classes.forEach(e => element.classList.remove(e)); // todo use remove(classes)

    for (let property in styles) element.style[property] = styles[property]; // todo use Object.assign (need polyfill for IE11)

  }
}

function toggleStyling(element, styling) {
  var backupStyling = {
    classes: [],
    styles: {}
  };
  var isOn = false;
  var isF = styling instanceof Function;
  return (value, force) => {
    if (value) {
      if (isOn === false) {
        backupStyling = addStyling(element, isF ? styling() : styling);
        isOn = true;
      } else if (force) {
        removeStyling(element, backupStyling);
        backupStyling = addStyling(element, isF ? styling() : styling);
      }
    } else {
      if (isOn === true || force === true) {
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
      let c = param.split(' ');
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
      var {
        classes,
        styles
      } = param;
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
    extend(value, param, a => a, a => a.slice(), o => shallowClearClone(o), true);
  }

  return Object.freeze(value);
}

function createStyling(isReplace, param, ...params) {
  var value = {
    classes: [],
    styles: {}
  };

  if (param) {
    extend(value, param, a => a, a => a.slice(), o => shallowClearClone(o), true);

    if (params) {
      var {
        classes,
        styles
      } = value;
      var extendInt = isReplace ? p => extend(value, p, s => s, a => a.slice(), o => shallowClearClone(styles, o), true) : p => extend(value, p, a => classes.concat(a), a => classes.concat(a), o => shallowClearClone(styles, o), false);
      params.forEach(p => extendInt(p));
    }
  }

  return Styling(value);
}

function createCss(stylings1, stylings2) {
  var destination = {};

  for (let property in stylings1) {
    let param1 = stylings1[property];
    let param2 = stylings2 ? stylings2[property] : undefined;
    if (param2 === undefined) destination[property] = Styling(param1);else {
      destination[property] = createStyling(true, param1, param2);
    }
  }

  if (stylings2) for (let property in stylings2) {
    if (!stylings1[property]) destination[property] = Styling(stylings2[property]);
  }
  return destination;
}
function extendCss(stylings1, stylings2) {
  for (let property in stylings2) {
    let param2 = stylings2[property];
    let param1 = stylings1[property];
    if (param1 === undefined) stylings1[property] = Styling(param2);else {
      stylings1[property] = createStyling(false, param1, param2);
    }
  }
}

function PickDomFactoryPlugCss(css) {
  css.pickContent = '';
  css.pickContent_disabled = 'disabled';
  css.pickButton = 'close';
}
function PickDomFactoryPlugCssBs5(css) {
  css.pickButton = 'btn-close';
}
function PickDomFactoryPlugCssPatch(cssPatch) {
  cssPatch.pickContent_disabled = {
    opacity: '.65'
  };
}
function PickDomFactoryPlugCssPatchBs4(cssPatch) {
  cssPatch.pickButton = {
    float: "none",
    fontSize: '1.5em',
    lineHeight: '.9em'
  };
}
function PickDomFactory(css, createElementAspect, optionPropertiesAspect, pickButtonAspect) {
  return {
    create(pickElement, wrap, remove) {
      let buttonHTML = pickButtonAspect.getButtonHTML();
      createElementAspect.createElementFromHtml(pickElement, '<span></span>' + buttonHTML);
      let pickContentElement = pickElement.querySelector('SPAN');
      let pickButtonElement = pickElement.querySelector('BUTTON');
      let eventBinder = EventBinder();
      eventBinder.bind(pickButtonElement, "click", remove);
      addStyling(pickContentElement, css.pickContent);
      addStyling(pickButtonElement, css.pickButton);
      let disableToggle = toggleStyling(pickContentElement, css.pickContent_disabled);

      function updateData() {
        pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option);
      }

      function updateDisabled() {
        disableToggle(wrap.isOptionDisabled);
      }

      return {
        pickDom: {
          pickContentElement,
          pickButtonElement
        },
        pickDomManagerHandlers: {
          updateData,
          updateDisabled
        },

        dispose() {
          eventBinder.unbind();
        }

      };
    }

  };
}

function PicksDomFactory(css, createElementAspect) {
  return {
    create(picksElement, isDisposablePicksElement) {
      var pickFilterElement = createElementAspect.createElement('LI');
      addStyling(picksElement, css.picks);
      addStyling(pickFilterElement, css.pickFilter);
      let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
      let focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
      let isFocusIn = false;
      return {
        picksElement,
        pickFilterElement,

        createPickElement() {
          var pickElement = createElementAspect.createElement('LI');
          addStyling(pickElement, css.pick);
          return {
            pickElement,
            attach: beforeElement => picksElement.insertBefore(pickElement, beforeElement != null ? beforeElement : pickFilterElement),
            detach: () => picksElement.removeChild(pickElement)
          };
        },

        disable(isComponentDisabled) {
          disableToggleStyling(isComponentDisabled);
        },

        toggleFocusStyling() {
          focusToggleStyling(isFocusIn);
        },

        getIsFocusIn() {
          return isFocusIn;
        },

        setIsFocusIn(newIsFocusIn) {
          isFocusIn = newIsFocusIn;
        },

        dispose() {
          if (!isDisposablePicksElement) {
            disableToggleStyling(false);
            focusToggleStyling(false);
            if (pickFilterElement.parentNode) pickFilterElement.parentNode.removeChild(pickFilterElement);
          }
        }

      };
    }

  };
}
function PicksDomFactoryPlugCss(css) {
  css.picks = 'form-control';
  css.pickFilter = '';
  css.picks_disabled = 'disabled';
  css.picks_focus = 'focus';
  css.pick = 'badge';
}
function PicksDomFactoryPlugCssPatch(cssPatch) {
  cssPatch.picks = {
    listStyleType: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    height: 'auto',
    marginBottom: '0',
    cursor: 'text'
  }, cssPatch.picks_disabled = {
    backgroundColor: '#e9ecef'
  };
  cssPatch.picks_focus = {
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
  };
}
function PicksDomFactoryPlugCssPatchBs4(cssPatch) {
  cssPatch.pick = {
    paddingLeft: '0',
    paddingRight: '.5rem',
    paddingInlineStart: '0',
    paddingInlineEnd: '0.5rem',
    lineHeight: '1.5em'
  };
}

function ChoiceDomFactory(css, createElementAspect, optionPropertiesAspect) {
  var updateDataInternal = function updateDataInternal(wrap, element) {
    element.textContent = optionPropertiesAspect.getText(wrap.option);
  }; //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there


  return {
    create(choiceElement, wrap, toggle) {
      let choiceDom = null;
      let choiceDomManagerHandlers = null;
      let eventBinder = EventBinder();
      eventBinder.bind(choiceElement, "click", toggle);

      if (wrap.hasOwnProperty("isOptionSelected")) {
        createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
        let choiceContentElement = choiceElement.querySelector('DIV');
        let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
        let choiceLabelElement = choiceContentElement.querySelector('LABEL');
        addStyling(choiceContentElement, css.choiceContent);
        addStyling(choiceCheckBoxElement, css.choiceCheckBox);
        addStyling(choiceLabelElement, css.choiceLabel);
        choiceDom = {
          choiceElement,
          choiceContentElement,
          choiceCheckBoxElement,
          choiceLabelElement
        };
        let choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);

        let updateSelected = function updateSelected() {
          choiceSelectedToggle(wrap.isOptionSelected);
          choiceCheckBoxElement.checked = wrap.isOptionSelected;

          if (wrap.isOptionDisabled || wrap.choice.isHoverIn) {
            choiceHoverToggle(wrap.choice.isHoverIn, true);
          }
        };

        let choiceDisabledToggle = toggleStyling(choiceElement, css.choice_disabled);
        let choiceCheckBoxDisabledToggle = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled);
        let choiceLabelDisabledToggle = toggleStyling(choiceLabelElement, css.choiceLabel_disabled);
        let choiceCursorDisabledToggle = toggleStyling(choiceElement, {
          classes: [],
          styles: {
            cursor: "default"
          }
        });

        let updateDisabled = function updateDisabled() {
          choiceDisabledToggle(wrap.isOptionDisabled);
          choiceCheckBoxDisabledToggle(wrap.isOptionDisabled);
          choiceLabelDisabledToggle(wrap.isOptionDisabled); // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"

          let isCheckBoxDisabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
          choiceCheckBoxElement.disabled = isCheckBoxDisabled;
          choiceCursorDisabledToggle(isCheckBoxDisabled);
        };

        let choiceHoverToggle = toggleStyling(choiceElement, () => {
          if (css.choice_disabled_hover && wrap.isOptionDisabled === true && wrap.isOptionSelected === false) return css.choice_disabled_hover;else return css.choice_hover;
        });

        let updateHoverIn = function updateHoverIn() {
          choiceHoverToggle(wrap.choice.isHoverIn);
        };

        choiceDomManagerHandlers = {
          updateData: () => updateDataInternal(wrap, choiceLabelElement),
          updateHoverIn,
          updateDisabled,
          updateSelected
        };
      } else {
        let choiceHoverToggle = toggleStyling(choiceElement, () => wrap.isOptionDisabled && css.choice_disabled_hover ? css.choice_disabled_hover : css.choice_hover);

        let updateHoverIn = function updateHoverIn() {
          choiceHoverToggle(wrap.choice.isHoverIn);
        };

        choiceElement.innerHTML = '<span></span>';
        let choiceContentElement = choiceElement.querySelector('SPAN');
        choiceDom = {
          choiceElement,
          choiceContentElement
        };
        choiceDomManagerHandlers = {
          updateData: () => updateDataInternal(wrap, choiceContentElement),
          updateHoverIn
        };
      }

      return {
        choiceDom,
        choiceDomManagerHandlers,

        dispose() {
          eventBinder.unbind();
        }

      };
    }

  };
}
function ChoiceDomFactoryPlugCss(css) {
  css.choiceCheckBox_disabled = 'disabled'; //  not bs, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'

  css.choiceLabel_disabled = '';
  css.choice_disabled_hover = '';
  css.choice_hover = 'hover'; //  not bs, in scss as 'ul.dropdown-menu li.hover'
}
function ChoiceDomFactoryPlugCssBs5(css) {
  css.choiceCheckBox = 'form-check-input'; // bs

  css.choiceContent = 'form-check'; // bs d-flex required for rtl to align items

  css.choiceLabel = 'form-check-label';
  css.choice_selected = 'selected'; //  not bs,

  css.choice_disabled = 'disabled'; //  not bs,
}
function ChoiceDomFactoryPlugCssPatch(cssPatch) {
  cssPatch.choiceCheckBox = {
    color: 'inherit',
    cursor: 'inherit'
  };
  cssPatch.choiceContent = {
    justifyContent: 'flex-start',
    cursor: 'inherit'
  }; // BS problem: without this on inline form menu items justified center

  cssPatch.choiceLabel = {
    color: 'inherit',
    cursor: 'inherit'
  }; // otherwise BS .was-validated set its color

  cssPatch.choiceLabel_disabled = {
    opacity: '.65'
  }; // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 

  cssPatch.choice_disabled_hover = 'bg-light';
  cssPatch.choice_hover = 'text-primary bg-light';
}

function ChoicesDomFactory(css, createElementAspect) {
  return {
    create() {
      var choicesElement = createElementAspect.createElement('DIV');
      var choicesListElement = createElementAspect.createElement('UL');
      choicesElement.appendChild(choicesListElement);
      choicesElement.style.display = 'none';
      addStyling(choicesElement, css.choices);
      addStyling(choicesListElement, css.choicesList);
      return {
        choicesElement,
        choicesListElement,

        createChoiceElement() {
          var choiceElement = createElementAspect.createElement('LI');
          addStyling(choiceElement, css.choice);
          return {
            choiceElement,
            setVisible: isVisible => choiceElement.style.display = isVisible ? 'block' : 'none',
            attach: beforeElement => choicesListElement.insertBefore(choiceElement, beforeElement),
            detach: () => choicesListElement.removeChild(choiceElement)
          };
        }

      };
    }

  };
}
function ChoicesDomFactoryPlugCss(css) {
  css.choices = 'dropdown-menu';
  css.choicesList = '';
  css.choice = '';
}
function ChoicesDomFactoryPlugCssPatch(cssPatch) {
  cssPatch.choicesList = {
    listStyleType: 'none',
    paddingLeft: '0',
    paddingRight: '0',
    marginBottom: '0'
  };
  cssPatch.choice = {
    classes: 'px-md-2 px-1',
    styles: {
      cursor: 'pointer'
    }
  };
}

function FilterDomFactory(css, createElementAspect) {
  return {
    create(isDisposablePicksElement) {
      var filterInputElement = createElementAspect.createElement('INPUT');
      addStyling(filterInputElement, css.filterInput);
      filterInputElement.setAttribute("type", "search");
      filterInputElement.setAttribute("autocomplete", "off");
      var eventBinder = EventBinder();
      return {
        filterInputElement,

        isEmpty() {
          return filterInputElement.value ? false : true;
        },

        setEmpty() {
          filterInputElement.value = '';
        },

        getValue() {
          return filterInputElement.value;
        },

        setFocus() {
          filterInputElement.focus();
        },

        setWidth(text) {
          filterInputElement.style.width = text.length * 1.3 + 2 + "ch";
        },

        // TODO: check why I need this comparision? 
        setFocusIfNotTarget(target) {
          if (target != filterInputElement) filterInputElement.focus();
        },

        onInput(onFilterInputInput) {
          eventBinder.bind(filterInputElement, 'input', onFilterInputInput);
        },

        onFocusIn(onFocusIn) {
          eventBinder.bind(filterInputElement, 'focusin', onFocusIn);
        },

        onFocusOut(onFocusOut) {
          eventBinder.bind(filterInputElement, 'focusout', onFocusOut);
        },

        onKeyDown(onfilterInputKeyDown) {
          eventBinder.bind(filterInputElement, 'keydown', onfilterInputKeyDown);
        },

        onKeyUp(onFilterInputKeyUp) {
          eventBinder.bind(filterInputElement, 'keyup', onFilterInputKeyUp);
        },

        dispose() {
          eventBinder.unbind();

          if (!isDisposablePicksElement) {
            if (filterInputElement.parentNode) filterInputElement.parentNode.removeChild(filterInputElement);
          }
        }

      };
    }

  };
}
function FilterDomFactoryPlugCss(css) {
  css.filterInput = '';
}
function FilterDomFactoryPlugCssPatch(cssPatch) {
  cssPatch.filterInput = {
    border: '0px',
    height: 'auto',
    boxShadow: 'none',
    padding: '0',
    margin: '0',
    outline: 'none',
    backgroundColor: 'transparent',
    backgroundImage: 'none' // otherwise BS .was-validated set its image

  };
}

function createDefaultCssBs5() {
  var defaultCss = {};
  PickDomFactoryPlugCss(defaultCss);
  PickDomFactoryPlugCssBs5(defaultCss);
  PicksDomFactoryPlugCss(defaultCss);
  ChoiceDomFactoryPlugCss(defaultCss);
  ChoiceDomFactoryPlugCssBs5(defaultCss);
  ChoicesDomFactoryPlugCss(defaultCss);
  FilterDomFactoryPlugCss(defaultCss);
  return defaultCss;
}

function BsAppearancePlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDomBus: {
          after: "LabelForAttributePlugin",
          plugStaticDom: () => {
            console.log("TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
            var {
              labelAspect,
              staticDom,
              configuration
            } = aspects;
            var {
              selectElement
            } = staticDom;
            var {
              getDefaultLabel
            } = configuration;
            let origLabelAspectGetLabel = labelAspect.getLabel;
            console.log("BsAppearancePlugin - new labelAspect.getLabel  ");

            labelAspect.getLabel = () => {
              var e = origLabelAspectGetLabel();
              if (e) return e;else {
                console.log("BsAppearancePlugin - new labelAspect.getLabel  - selectElement");

                if (selectElement) {
                  console.log("BsAppearancePlugin - new labelAspect.getLabel  - selectElement +");
                  let labelElement = getDefaultLabel(selectElement);
                  console.log({
                    name: "BsAppearancePlugin - new labelAspect.getLabel  - selectElement +",
                    labelElement
                  });
                  return labelElement;
                }
              }
            };
          }
        },
        layout: () => {
          let {
            validationApiAspect,
            picksDom,
            staticDom,
            updateAppearanceAspect,
            componentPropertiesAspect,
            floatingLabelAspect
          } = aspects;
          let {
            getValidity,
            getSize,
            useCssPatch,
            css,
            composeGetSize
          } = configuration;
          let selectElement = staticDom.selectElement;
          let initialElement = staticDom.initialElement;
          let isFloatingLabel = false;

          if (floatingLabelAspect) {
            isFloatingLabel = closestByClassName(initialElement, 'form-floating');

            floatingLabelAspect.isFloatingLabel = () => isFloatingLabel;
          }

          if (staticDom.selectElement) {
            if (!getValidity) getValidity = composeGetValidity(selectElement);
            if (!getSize) getSize = composeGetSize(selectElement);
          } else {
            if (!getValidity) getValidity = () => null;
            if (!getSize) getSize = () => null;
          }

          componentPropertiesAspect.getSize = getSize;
          componentPropertiesAspect.getValidity = getValidity;
          var updateSize;

          if (!useCssPatch) {
            updateSize = () => updateSizeForAdapter(picksDom.picksElement, getSize);
          } else {
            let {
              picks_lg,
              picks_sm,
              picks_def,
              picks_floating_def
            } = css;
            if (isFloatingLabel) picks_lg = picks_sm = picks_def = picks_floating_def;

            updateSize = () => updateSizeJsForAdapter(picksDom.picksElement, picks_lg, picks_sm, picks_def, getSize);
          }

          if (useCssPatch) {
            var origToggleFocusStyling = picksDom.toggleFocusStyling;

            picksDom.toggleFocusStyling = () => {
              var validity = validationObservable.getValue();
              var isFocusIn = picksDom.getIsFocusIn();
              origToggleFocusStyling(isFocusIn);

              if (isFocusIn) {
                if (validity === false) {
                  // but not toggle events (I know it will be done in future)
                  picksDom.setIsFocusIn(isFocusIn);
                  addStyling(picksDom.picksElement, css.picks_focus_invalid);
                } else if (validity === true) {
                  // but not toggle events (I know it will be done in future)
                  picksDom.setIsFocusIn(isFocusIn);
                  addStyling(picksDom.picksElement, css.picks_focus_valid);
                }
              }
            };
          }

          var getWasValidated = () => {
            var wasValidatedElement = closestByClassName(staticDom.initialElement, 'was-validated');
            return wasValidatedElement ? true : false;
          };

          var wasUpdatedObservable = ObservableLambda(() => getWasValidated());
          var getManualValidationObservable = ObservableLambda(() => getValidity());
          let validationApiObservable = validationApiAspect == null ? void 0 : validationApiAspect.validationApiObservable;
          var validationObservable = ObservableLambda(() => wasUpdatedObservable.getValue() ? validationApiObservable.getValue() : getManualValidationObservable.getValue());
          validationObservable.attach(value => {
            var {
              validMessages,
              invalidMessages
            } = getMessagesElements(staticDom.containerElement);
            updateValidity(picksDom.picksElement, validMessages, invalidMessages, value);
            picksDom.toggleFocusStyling();
          });
          wasUpdatedObservable.attach(() => validationObservable.call());
          if (validationApiObservable) validationApiObservable.attach(() => validationObservable.call());
          getManualValidationObservable.attach(() => validationObservable.call());
          updateAppearanceAspect.updateAppearance = composeSync(updateAppearanceAspect.updateAppearance, updateSize, validationObservable.call, getManualValidationObservable.call);
          return {
            buildApi(api) {
              api.updateSize = updateSize;

              api.updateValidity = () => getManualValidationObservable.call();

              api.updateWasValidated = () => wasUpdatedObservable.call();
            },

            dispose() {
              wasUpdatedObservable.detachAll();
              validationObservable.detachAll();
              getManualValidationObservable.detachAll();
            }

          };
        }
      };
    }
  };
}

function updateValidity(picksElement, validMessages, invalidMessages, validity) {
  if (validity === false) {
    picksElement.classList.add('is-invalid');
    picksElement.classList.remove('is-valid');
    invalidMessages.map(e => e.style.display = 'block');
    validMessages.map(e => e.style.display = 'none');
  } else if (validity === true) {
    picksElement.classList.remove('is-invalid');
    picksElement.classList.add('is-valid');
    invalidMessages.map(e => e.style.display = 'none');
    validMessages.map(e => e.style.display = 'block');
  } else {
    picksElement.classList.remove('is-invalid');
    picksElement.classList.remove('is-valid');
    invalidMessages.map(e => e.style.display = '');
    validMessages.map(e => e.style.display = '');
  }
}

function updateSizeClasses(picksElement, size) {
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

function updateSizeJsPicks(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size) {
  if (size == "lg") {
    addStyling(picksElement, picksLgStyling);
  } else if (size == "sm") {
    addStyling(picksElement, picksSmStyling);
  } else {
    addStyling(picksElement, picksDefStyling);
  }
}

function updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size) {
  updateSizeClasses(picksElement, size);
  updateSizeJsPicks(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, size);
}

function updateSizeForAdapter(picksElement, getSize) {
  updateSizeClasses(picksElement, getSize());
}

function updateSizeJsForAdapter(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, getSize) {
  updateSizeJs(picksElement, picksLgStyling, picksSmStyling, picksDefStyling, getSize());
}

function getMessagesElements(containerElement) {
  var siblings = siblingsAsArray(containerElement);
  var invalidMessages = siblings.filter(e => e.classList.contains('invalid-feedback') || e.classList.contains('invalid-tooltip'));
  var validMessages = siblings.filter(e => e.classList.contains('valid-feedback') || e.classList.contains('valid-tooltip'));
  return {
    validMessages,
    invalidMessages
  };
}

function composeGetValidity(selectElement) {
  var getValidity = () => selectElement.classList.contains('is-invalid') ? false : selectElement.classList.contains('is-valid') ? true : null;

  return getValidity;
}

function BsAppearanceBs4Plugin(defaults) {
  defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
  defaults.composeGetSize = composeGetSize; // BsAppearancePlugin

  defaults.getDefaultLabel = getDefaultLabel; // FloatingLabelPlugin, BsAppearancePlugin

  return BsAppearancePlugin();
}

function composeGetSize(element) {
  let inputGroupElement = closestByClassName(element, 'input-group');
  let getSize = null;

  if (inputGroupElement) {
    getSize = function () {
      var value = null;
      if (inputGroupElement.classList.contains('input-group-lg')) value = 'lg';else if (inputGroupElement.classList.contains('input-group-sm')) value = 'sm';
      return value;
    };
  } else {
    getSize = function () {
      var value = null;
      if (element.classList.contains('custom-select-lg') || element.classList.contains('form-control-lg')) value = 'lg';else if (element.classList.contains('custom-select-sm') || element.classList.contains('form-control-sm')) value = 'sm';
      return value;
    };
  }

  return getSize;
}

function getDefaultLabel(element) {
  let value = null;
  let formGroup = closestByClassName(element, 'form-group');
  if (formGroup) value = formGroup.querySelector(`label[for="${element.id}"]`);
  return value;
}

function BsAppearanceBs4CssPatchPlugin(defaults) {
  let cssPatch = defaults.cssPatch;
  cssPatch.picks_def = {
    minHeight: 'calc(2.25rem + 2px)'
  };
  cssPatch.picks_lg = {
    minHeight: 'calc(2.875rem + 2px)'
  };
  cssPatch.picks_sm = {
    minHeight: 'calc(1.8125rem + 2px)'
  };
  cssPatch.picks_focus_valid = {
    borderColor: '',
    boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'
  };
  cssPatch.picks_focus_invalid = {
    borderColor: '',
    boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
  };
}

function LabelForAttributePlugin(defaults) {
  defaults.label = null;
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: () => {
          aspects.labelAspect = LabelAspect(configuration);
          aspects.labelNewIdAspect = LabelNewIdAspect(aspects); // ?
        },
        layout: () => {
          var {
            filterDom,
            labelAspect,
            loadAspect,
            labelNewIdAspect,
            disposeAspect
          } = aspects; // TODO: move to 

          console.log("LabelForAttributePlugin, labelNewIdAspect");
          var labelForAttributeAspect = LabelForAttributeAspect(filterDom, labelAspect, labelNewIdAspect, disposeAspect);
          aspects.labelForAttributeAspect = labelForAttributeAspect;
          loadAspect.load = composeSync(loadAspect.load, () => labelForAttributeAspect.update());
        }
      };
    }
  };
}

function LabelAspect(configuration) {
  return {
    getLabel() {
      return defCall(configuration.label);
    }

  };
} // TODO migrate to configuration


function LabelNewIdAspect(aspects) {
  return {
    createInputId() {
      let {
        configuration,
        staticDom
      } = aspects;
      let {
        containerClass
      } = configuration;
      let {
        containerElement
      } = staticDom;
      let a = `${containerClass}-generated-filter-${containerElement.id}`;
      console.log('LabelNewIdAspect - ' + a);
      return a; //`${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    }

  };
}

function LabelForAttributeAspect(filterDom, labelAspect, labelNewIdAspect, disposeAspect) {
  return {
    update() {
      //let createInputId = null;
      //let {selectElement, containerElement} = staticDom;
      let {
        filterInputElement
      } = filterDom; // if (selectElement)
      //     createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
      // else
      //     createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

      let labelElement = labelAspect.getLabel(); //getLabelElementAspect.getLabelElement();

      console.log("LabelForAttributeAspect - ");

      if (labelElement) {
        console.log("LabelForAttributeAspect + ");
        let backupedForAttribute = labelElement.getAttribute('for');
        var newId = labelNewIdAspect.createInputId();
        filterInputElement.setAttribute('id', newId);
        labelElement.setAttribute('for', newId);

        if (backupedForAttribute) {
          disposeAspect.dispose = composeSync(disposeAspect.dispose, () => labelElement.setAttribute('for', backupedForAttribute));
        }
      }
    }

  };
}

function RtlPlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          let {
            popperRtlAspect,
            staticDom
          } = aspects;
          let {
            isRtl
          } = configuration;
          let forceRtlOnContainer = false;
          if (isBoolean(isRtl)) forceRtlOnContainer = true;else isRtl = getIsRtl(staticDom.initialElement);
          var attributeBackup = AttributeBackup();

          if (forceRtlOnContainer) {
            attributeBackup.set(staticDom.containerElement, "dir", "rtl");
          } else if (staticDom.selectElement) {
            var dirAttributeValue = staticDom.selectElement.getAttribute("dir");

            if (dirAttributeValue) {
              attributeBackup.set(staticDom.containerElement, "dir", dirAttributeValue);
            }
          }

          if (popperRtlAspect) popperRtlAspect.getIsRtl = () => isRtl;
          return {
            dispose() {
              attributeBackup.restore();
            }

          };
        }
      };
    }
  };
}

function FormResetPlugin() {
  return {
    buildAspects: aspects => {
      return {
        layout: () => {
          var {
            staticDom,
            updateDataAspect,
            environment
          } = aspects;
          var eventBuilder = EventBinder();

          if (staticDom.selectElement) {
            var form = closestByTagName(staticDom.selectElement, 'FORM');

            if (form) {
              eventBuilder.bind(form, 'reset', () => environment.window.setTimeout(() => updateDataAspect.updateData()));
            }
          }

          return {
            dispose() {
              eventBuilder.unbind();
            }

          };
        }
      };
    }
  };
}

const defValueMissingMessage = 'Please select an item in the list';
function ValidationApiPlugin(defaults) {
  defaults.getValueRequired = function () {
    return false;
  };

  defaults.valueMissingMessage = '';
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          var {
            triggerAspect,
            onChangeAspect,
            optionsAspect,
            staticDom,
            filterDom,
            updateDataAspect
          } = aspects; // TODO: required could be a function

          let {
            getIsValueMissing,
            valueMissingMessage,
            required,
            getValueRequired
          } = configuration;
          if (!isBoolean(required)) required = getValueRequired();
          valueMissingMessage = defCall(valueMissingMessage, () => getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "value-missing-message"), defValueMissingMessage);

          if (!getIsValueMissing) {
            getIsValueMissing = () => {
              let count = 0;
              let optionsArray = optionsAspect.getOptions();

              for (var i = 0; i < optionsArray.length; i++) {
                if (optionsArray[i].selected) count++;
              }

              return count === 0;
            };
          }

          var isValueMissingObservable = ObservableLambda(() => required && getIsValueMissing());
          var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());
          onChangeAspect.onChange = composeSync(isValueMissingObservable.call, onChangeAspect.onChange);
          updateDataAspect.updateData = composeSync(isValueMissingObservable.call, updateDataAspect.updateData);
          aspects.validationApiAspect = ValidationApiAspect(validationApiObservable);
          return {
            buildApi(api) {
              api.validationApi = ValidityApi(filterDom.filterInputElement, isValueMissingObservable, valueMissingMessage, isValid => validationApiObservable.setValue(isValid), triggerAspect.trigger);
            },

            dispose() {
              isValueMissingObservable.detachAll();
              validationApiObservable.detachAll();
            }

          };
        },
        layoutInit: aspects => {}
      };
    }
  };
}

function ValidationApiAspect(validationApiObservable) {
  return {
    validationApiObservable
  };
}

function ValidityApi(visibleElement, isValueMissingObservable, valueMissingMessage, onValid, trigger) {
  var customValidationMessage = "";
  var validationMessage = "";
  var validity = null;
  var willValidate = true;

  function setMessage(valueMissing, customError) {
    validity = Object.freeze({
      valueMissing,
      customError,
      valid: !(valueMissing || customError)
    });
    validationMessage = customError ? customValidationMessage : valueMissing ? valueMissingMessage : "";
    visibleElement.setCustomValidity(validationMessage);
    onValid(validity.valid);
  }

  setMessage(isValueMissingObservable.getValue(), false);
  isValueMissingObservable.attach(value => {
    setMessage(value, validity.customError);
  });

  var checkValidity = () => {
    if (!validity.valid) trigger('dashboardcode.multiselect:invalid');
    return validity.valid;
  };

  return {
    validationMessage,
    willValidate,
    validity,

    setCustomValidity(message) {
      customValidationMessage = message;
      setMessage(validity.valueMissing, customValidationMessage ? true : false);
    },

    checkValidity,

    reportValidity() {
      visibleElement.reportValidity();
      return checkValidity();
    }

  };
}

function HiddenOptionPlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          let {
            createWrapAspect,
            isChoiceSelectableAspect,
            wrapsCollection,
            buildChoiceAspect,
            buildAndAttachChoiceAspect,
            countableChoicesListInsertAspect,
            countableChoicesList
          } = aspects;

          countableChoicesListInsertAspect.countableChoicesListInsert = (wrap, key) => {
            if (!wrap.isOptionHidden) {
              let choiceNext = wrapsCollection.getNext(key, c => !c.isOptionHidden);
              countableChoicesList.add(wrap, choiceNext);
            }
          };

          let origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;

          buildAndAttachChoiceAspect.buildAndAttachChoice = (wrap, getNextElement) => {
            if (wrap.isOptionHidden) {
              buildHiddenChoice(wrap);
            } else {
              origBuildAndAttachChoice(wrap, getNextElement);
            }
          };

          var origIsSelectable = isChoiceSelectableAspect.isSelectable;

          isChoiceSelectableAspect.isSelectable = wrap => origIsSelectable(wrap) && !wrap.isOptionHidden;

          let {
            getIsOptionHidden,
            options
          } = configuration;

          if (options) {
            if (!getIsOptionHidden) getIsOptionHidden = option => option.hidden === undefined ? false : option.hidden;
          } else {
            if (!getIsOptionHidden) getIsOptionHidden = option => {
              return option.hidden;
            };
          }

          var origCreateWrap = createWrapAspect.createWrap;

          createWrapAspect.createWrap = option => {
            let wrap = origCreateWrap(option);
            wrap.isOptionHidden = getIsOptionHidden(option);
            return wrap;
          };

          return {
            buildApi(api) {
              let getNextNonHidden = key => wrapsCollection.getNext(key, c => !c.isOptionHidden);

              api.updateOptionsHidden = () => wrapsCollection.forLoop((wrap, key) => updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect));

              api.updateOptionHidden = key => updateChoiceHidden(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect); // TODO create updateHidden ? 
              // it is too complex since we need to find the next non hidden, when this depends on key 
              // there should be the backreference "wrap -> index" invited before
              // api.updateOptionHidden  = (key) => wrapsCollection.get(key).updateHidden();

            }

          };
        }
      };
    }
  };
}

function buildHiddenChoice(wrap) {
  wrap.updateSelected = () => void 0;

  wrap.choice.isChoiceElementAttached = false;
  wrap.choice.choiceElement = null;
  wrap.choice.choiceElementAttach = null;
  wrap.choice.setVisible = null;
  wrap.choice.setHoverIn = null;
  wrap.choice.remove = null;

  wrap.choice.dispose = () => {
    wrap.choice.dispose = null;
  };

  wrap.dispose = () => {
    wrap.choice.dispose();
    wrap.dispose = null;
  };
}

function updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect) {
  let newIsOptionHidden = getIsOptionHidden(wrap.option);

  if (newIsOptionHidden != wrap.isOptionHidden) {
    wrap.isOptionHidden = newIsOptionHidden;

    if (wrap.isOptionHidden) {
      countableChoicesList.remove(wrap);
      wrap.choice.remove();
      buildHiddenChoice(wrap);
    } else {
      let nextChoice = getNextNonHidden(key);
      countableChoicesList.add(wrap, nextChoice);
      buildChoiceAspect.buildChoice(wrap);
      wrap.choice.choiceElementAttach(nextChoice == null ? void 0 : nextChoice.choice.choiceElement);
    }
  }
}

function CssPatchPlugin(defaults) {
  defaults.useCssPatch = true;
  return {
    buildAspects: (aspects, configuration, settings) => {
      // merge
      let cssPatch = settings == null ? void 0 : settings.cssPatch;
      if (isBoolean(cssPatch)) throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

      configuration.cssPatch = createCss(defaults.cssPatch, cssPatch); // replace classes, merge styles

      return {
        // TODO: this means after all cssPatch added, but this should be done different way (another static extension point?)
        plugStaticDom: () => {
          if (configuration.useCssPatch) extendCss(configuration.css, configuration.cssPatch);
        }
      };
    }
  };
}

function CssPatchBs4Plugin(defaults) {
  var cssPatch = {};
  PickDomFactoryPlugCssPatch(cssPatch);
  PickDomFactoryPlugCssPatchBs4(cssPatch);
  PicksDomFactoryPlugCssPatch(cssPatch);
  PicksDomFactoryPlugCssPatchBs4(cssPatch);
  ChoiceDomFactoryPlugCssPatch(cssPatch);
  ChoicesDomFactoryPlugCssPatch(cssPatch);
  FilterDomFactoryPlugCssPatch(cssPatch);
  defaults.cssPatch = cssPatch;
  return CssPatchPlugin(defaults);
}

function JQueryMethodsPlugin() {
  return {
    buildAspects: () => {
      return {
        layout: aspects => {
          let {
            staticDom,
            choicesDom,
            filterDom,
            picksList,
            picksDom
          } = aspects;
          return {
            buildApi(api) {
              api.getContainer = () => staticDom.containerElement;

              api.getChoices = () => choicesDom.choicesElement;

              api.getChoicesList = () => choicesDom.choicesListElement;

              api.getFilterInput = () => filterDom.filterInputElement;

              api.getPicks = () => picksDom.picksElement;

              api.picksCount = () => picksList.getCount();
            }

          };
        }
      };
    }
  };
}

function OptionsApiPlugin() {
  return {
    buildAspects: aspects => {
      return {
        layout: () => {
          let {
            buildAndAttachChoiceAspect,
            wraps,
            wrapsCollection,
            createWrapAspect,
            createChoiceBaseAspect,
            optionsAspect,
            resetLayoutAspect
          } = aspects;
          return {
            buildApi(api) {
              api.updateOptionAdded = key => {
                // TODO: generalize index as key 
                let options = optionsAspect.getOptions();
                let option = options[key];
                let wrap = createWrapAspect.createWrap(option);
                wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
                wraps.insert(key, wrap);

                let nextChoice = () => wrapsCollection.getNext(key, c => c.choice.choiceElement);

                buildAndAttachChoiceAspect.buildAndAttachChoice(wrap, () => {
                  var _nextChoice;

                  return (_nextChoice = nextChoice()) == null ? void 0 : _nextChoice.choice.choiceElement;
                });
              };

              api.updateOptionRemoved = key => {
                // TODO: generalize index as key 
                resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter

                var wrap = wraps.remove(key);
                wrap.choice.remove == null ? void 0 : wrap.choice.remove();
                wrap.dispose == null ? void 0 : wrap.dispose();
              };
            }

          };
        }
      };
    }
  };
}

function FormRestoreOnBackwardPlugin() {
  return {
    buildAspects: aspects => {
      return {
        layout: () => {
          let {
            staticDom,
            environment,
            loadAspect,
            updateOptionsSelectedAspect
          } = aspects;
          let window = environment.window;

          if (staticDom.selectElement && updateOptionsSelectedAspect) {
            loadAspect.load = composeSync(loadAspect.load, function () {
              // support browser's "step backward" and form's values restore
              if (window.document.readyState != "complete") {
                window.setTimeout(function () {
                  updateOptionsSelectedAspect.updateOptionsSelected(); // there are no need to add more updates as api.updateWasValidated() because backward never trigger .was-validate
                  // also backward never set the state to invalid
                });
              }
            });
          }
        }
      };
    }
  };
}

function SelectElementPlugin() {
  return {
    buildAspects: aspects => {
      return {
        plugStaticDom: () => {
          let {
            configuration,
            staticDomFactory,
            createElementAspect,
            componentPropertiesAspect,
            onChangeAspect,
            triggerAspect,
            optionsAspect,
            optGroupAspect,
            disposeAspect
          } = aspects;
          let origStaticDomFactoryCreate = staticDomFactory.create;

          staticDomFactory.create = (choicesDomFactory, filterDomFactory, picksDomFactory) => {
            let {
              createStaticDom: origCreateStaticDom
            } = origStaticDomFactoryCreate(choicesDomFactory, filterDomFactory, picksDomFactory);
            return {
              createStaticDom(element, containerClass) {
                console.log("createStaticDom");
                let selectElement = null;
                let containerElement = null;
                let picksElement = null;

                if (element.tagName == 'SELECT') {
                  selectElement = element;

                  if (containerClass) {
                    containerElement = closestByClassName(selectElement, containerClass);
                    if (containerElement) picksElement = findDirectChildByTagName(containerElement, 'UL');
                  }
                } else if (element.tagName == 'DIV') {
                  selectElement = findDirectChildByTagName(element, 'SELECT');

                  if (selectElement) {
                    if (containerClass) {
                      containerElement = closestByClassName(element, containerClass);
                      if (containerElement) picksElement = findDirectChildByTagName(containerElement, 'UL');
                    }
                  } else {
                    return origCreateStaticDom(element, containerClass);
                  }
                }

                let disposableContainerElement = false;

                if (!containerElement) {
                  containerElement = createElementAspect.createElement('DIV');
                  containerElement.classList.add(containerClass);
                  disposableContainerElement = true;
                }

                let isDisposablePicksElement = false;

                if (!picksElement) {
                  picksElement = createElementAspect.createElement('UL');
                  isDisposablePicksElement = true;
                }

                if (selectElement) {
                  var backupDisplay = selectElement.style.display;
                  selectElement.style.display = 'none';
                  var backupedRequired = selectElement.required;

                  configuration.getValueRequired = function () {
                    return backupedRequired;
                  };

                  if (selectElement.required === true) selectElement.required = false;
                  let {
                    getDisabled
                  } = configuration;

                  if (!getDisabled) {
                    var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');

                    if (fieldsetElement) {
                      componentPropertiesAspect.getDisabled = () => selectElement.disabled || fieldsetElement.disabled;
                    } else {
                      componentPropertiesAspect.getDisabled = () => selectElement.disabled;
                    }
                  }

                  onChangeAspect.onChange = composeSync(() => triggerAspect.trigger('change'), onChangeAspect.onChange);

                  optionsAspect.getOptions = () => selectElement.options;

                  if (optGroupAspect) {
                    optGroupAspect.getOptionOptGroup = option => option.parentNode;

                    optGroupAspect.getOptGroupText = optGroup => optGroup.label;

                    optGroupAspect.getOptGroupId = optGroup => optGroup.id;
                  }

                  if (aspects.labelNewIdAspect) {
                    console.log("new aspects.labelNewIdAspect");

                    aspects.labelNewIdAspect.createInputId = () => `${containerClass}-generated-input-${(selectElement.id ? selectElement.id : selectElement.name).toLowerCase()}-id`;
                  } else {
                    console.log("no new aspects.labelNewIdAspect");
                  }

                  disposeAspect.dispose = composeSync(disposeAspect.dispose, () => {
                    selectElement.required = backupedRequired;
                    selectElement.style.display = backupDisplay;
                  });
                }

                let choicesDom = choicesDomFactory.create();
                let filterDom = filterDomFactory.create(isDisposablePicksElement);
                let picksDom = picksDomFactory.create(picksElement, isDisposablePicksElement);
                let {
                  choicesElement
                } = choicesDom;
                return {
                  choicesDom,
                  filterDom,
                  picksDom,
                  staticDom: {
                    initialElement: element,
                    containerElement,
                    picksElement,
                    isDisposablePicksElement,
                    selectElement
                  },
                  staticManager: {
                    appendToContainer() {
                      if (disposableContainerElement) {
                        selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
                        containerElement.appendChild(choicesElement);
                      } else {
                        selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
                      }

                      if (isDisposablePicksElement) containerElement.appendChild(picksElement);
                    },

                    dispose() {
                      choicesElement.parentNode.removeChild(choicesElement);
                      if (disposableContainerElement) selectElement.parentNode.removeChild(containerElement);
                      if (isDisposablePicksElement) containerElement.removeChild(picksElement);
                    }

                  }
                };
              }

            };
          };
        },
        layout: () => {
          var {
            loadAspect,
            environment
          } = aspects;
          var document = environment.window.document;
          var origLoadAspectLoop = loadAspect.loop;

          loadAspect.loop = function () {
            // browsers can change select value as part of "autocomplete" (IE11) at load time
            // or "show preserved on go back" (Chrome) after page is loaded but before "ready" event;
            // mote: they never "restore" selected-disabled options.
            // TODO: make the FROM Validation for 'selected-disabled' easy.
            if (document.readyState != 'loading') {
              origLoadAspectLoop();
            } else {
              var domContentLoadedHandler = function domContentLoadedHandler() {
                origLoadAspectLoop();
                document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
              };

              document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
            }
          };
        }
      };
    }
  };
}

// plugin should overdrive them : call setWrapSelected and etc
// therefore there should new component API methods
// addOptionPick(key) -> call addPick(pick) which returns removePick() 
// SetOptionSelectedAspect, OptionToggleAspect should be moved there 
// OptionToggleAspect overrided in DisabledOptionPlugin

function SelectedOptionPlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: () => {
          let {
            wrapsCollection
          } = aspects;
          let {
            getSelected: getIsOptionSelected,
            setSelected: setIsOptionSelected,
            options
          } = configuration;

          if (options) {
            if (!setIsOptionSelected) {
              setIsOptionSelected = (option, value) => {
                option.selected = value;
              };
            }

            if (!getIsOptionSelected) getIsOptionSelected = option => option.selected;
          } else {
            // selectElement
            if (!getIsOptionSelected) {
              getIsOptionSelected = option => option.selected;
            }

            if (!setIsOptionSelected) {
              setIsOptionSelected = (option, value) => {
                option.selected = value;
              }; // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
              // if (value) option.setAttribute('selected','');
              // else option.removeAttribute('selected');

            }
          }

          configuration.getSelected = getIsOptionSelected;
          configuration.setSelected = setIsOptionSelected;
          aspects.updateOptionsSelectedAspect = UpdateOptionsSelectedAspect(wrapsCollection, getIsOptionSelected);
        },
        layout: () => {
          let {
            wrapsCollection,
            updateOptionsSelectedAspect,
            createWrapAspect,
            buildChoiceAspect,
            removePickAspect,
            resetLayoutAspect,
            picksList,
            isChoiceSelectableAspect,
            optionToggleAspect,

            /*inputAspect, filterDom, filterManagerAspect,*/
            createPickHandlersAspect,
            addPickAspect,
            fullMatchAspect,
            onChangeAspect,
            filterPredicateAspect
          } = aspects;
          let {
            getSelected: getIsOptionSelected,
            setSelected: setIsOptionSelected
          } = configuration;
          let origFilterPredicate = filterPredicateAspect.filterPredicate;

          filterPredicateAspect.filterPredicate = (wrap, text) => !wrap.isOptionSelected && origFilterPredicate(wrap, text);

          let origBuildChoice = buildChoiceAspect.buildChoice;

          buildChoiceAspect.buildChoice = wrap => {
            origBuildChoice(wrap);

            wrap.updateSelected = () => {
              wrap.choice.choiceDomManagerHandlers.updateSelected();
              onChangeAspect.onChange();
            };

            wrap.dispose = composeSync(() => {
              wrap.updateSelected = null;
            }, wrap.dispose);
          }; // TODO: test this instead of wrap.updateSelected
          // function updateSelected(wrap){
          //     if (wrap.pick){
          //         if (wrap.isOptionSelected)
          //             pickHandlers.producePick();
          //         else {
          //             pickHandlers.removeAndDispose();
          //             pickHandlers.removeAndDispose=null;
          //         }
          //     }
          //     wrap.choice.choiceDomManagerHandlers.updateSelected();
          //     onChangeAspect.onChange();
          // }


          function composeUpdateSelected(wrap, booleanValue) {
            return () => {
              wrap.isOptionSelected = booleanValue;
              wrap.updateSelected();
            };
          }

          function trySetWrapSelected(option, updateSelected, booleanValue) {
            //  wrap.option
            let success = false;
            var confirmed = setIsOptionSelected(option, booleanValue);

            if (!(confirmed === false)) {
              updateSelected();
              success = true;
            }

            return success;
          }

          let origCreateWrap = createWrapAspect.createWrap;

          createWrapAspect.createWrap = option => {
            let wrap = origCreateWrap(option);
            wrap.isOptionSelected = getIsOptionSelected(option);
            wrap.updateSelected = null; // can it be combined ?

            return wrap;
          };

          optionToggleAspect.toggle; // TODO: improve design, no replace

          optionToggleAspect.toggle = wrap => {
            return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected);
          };

          fullMatchAspect.fullMatch;

          fullMatchAspect.fullMatch = wrap => {
            return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);
          };

          removePickAspect.removePick; // TODO: improve design, no replace

          removePickAspect.removePick = (wrap, pick) => {
            // TODO: try remove pick
            return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);
          };

          let origCreatePickHandlers = createPickHandlersAspect.createPickHandlers;

          createPickHandlersAspect.createPickHandlers = wrap => {
            let pickHandlers = origCreatePickHandlers(wrap);
            wrap.updateSelected = composeSync(() => {
              if (wrap.isOptionSelected) {
                let pick = pickHandlers.producePick();
                wrap.pick = pick;
                pick.dispose = composeSync(pick.dispose, () => {
                  wrap.pick = null;
                });
              } else {
                pickHandlers.removeAndDispose();
                pickHandlers.removeAndDispose = null;
              }
            }, wrap.updateSelected);
            addPickAspect.addPick(wrap, pickHandlers);
            return pickHandlers;
          };

          let origAddPick = addPickAspect.addPick;

          addPickAspect.addPick = (wrap, pickHandlers) => {
            if (wrap.isOptionSelected) {
              let pick = origAddPick(wrap, pickHandlers);
              wrap.pick = pick;
              pick.dispose = composeSync(pick.dispose, () => {
                wrap.pick = null;
              });
              return pick;
            }
          };

          return {
            buildApi(api) {
              api.selectAll = () => {
                resetLayoutAspect.resetLayout(); // always hide 1st

                wrapsCollection.forLoop(wrap => {
                  if (isChoiceSelectableAspect.isSelectable(wrap) && !wrap.isOptionSelected) trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);
                });
              };

              api.deselectAll = () => {
                resetLayoutAspect.resetLayout(); // always hide 1st

                picksList.forEach(pick => pick.setSelectedFalse());
              };

              api.setOptionSelected = (key, value) => {
                let wrap = wrapsCollection.get(key);
                return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, value), value);
              }; // used in FormRestoreOnBackwardPlugin


              api.updateOptionsSelected = () => updateOptionsSelectedAspect.updateOptionsSelected();

              api.updateOptionSelected = key => updateChoiceSelected(wrapsCollection.get(key), getIsOptionSelected);
            }

          };
        }
      };
    }
  };
}

function UpdateOptionsSelectedAspect(wrapsCollection, getIsOptionSelected) {
  return {
    updateOptionsSelected() {
      wrapsCollection.forLoop(wrap => updateChoiceSelected(wrap, getIsOptionSelected));
    }

  };
}

function updateChoiceSelected(wrap, getIsOptionSelected) {
  let newIsSelected = getIsOptionSelected(wrap.option);

  if (newIsSelected != wrap.isOptionSelected) {
    wrap.isOptionSelected = newIsSelected;
    wrap.updateSelected == null ? void 0 : wrap.updateSelected(); // some hidden oesn't have element (and need to be updated)
  }
}

function DisabledOptionPlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          let {
            isChoiceSelectableAspect,
            createWrapAspect,
            buildChoiceAspect,
            filterPredicateAspect,
            wrapsCollection,
            optionToggleAspect,
            buildPickAspect
          } = aspects;
          let {
            getIsOptionDisabled,
            options
          } = configuration;

          if (options) {
            if (!getIsOptionDisabled) getIsOptionDisabled = option => option.disabled === undefined ? false : option.disabled;
          } else {
            // selectElement
            if (!getIsOptionDisabled) getIsOptionDisabled = option => option.disabled;
          } // TODO check this instead of wrap.updateDisabled
          // function updateDisabled(wrap){
          //     wrap?.choice?.choiceDomManagerHandlers?.updateDisabled?.();
          //     wrap?.pick?.pickDomManagerHandlers?.updateDisabled?.();
          // }


          let origCreateWrap = createWrapAspect.createWrap;

          createWrapAspect.createWrap = option => {
            let wrap = origCreateWrap(option);
            wrap.isOptionDisabled = getIsOptionDisabled(option); // TODO: remove usage wrap.isOptionDisabled

            wrap.updateDisabled = null;
            return wrap;
          };

          let origToggle = optionToggleAspect.toggle;

          optionToggleAspect.toggle = wrap => {
            let success = false;

            if (wrap.isOptionSelected !== undefined) {
              if (wrap.isOptionSelected || !wrap.isOptionDisabled) // TODO: declare dependency on SelectedOptionPlugin
                success = origToggle(wrap);
            } else {
              if (!wrap.isOptionDisabled) {
                success = origToggle(wrap);
              }
            }

            return success;
          };

          let origIsSelectable = isChoiceSelectableAspect.isSelectable;

          isChoiceSelectableAspect.isSelectable = wrap => {
            return origIsSelectable(wrap) && !wrap.isOptionDisabled;
          };

          let origFilterPredicate = filterPredicateAspect.filterPredicate;

          filterPredicateAspect.filterPredicate = (wrap, text) => {
            return !wrap.isOptionDisabled && origFilterPredicate(wrap, text);
          };

          let origBuildChoice = buildChoiceAspect.buildChoice;

          buildChoiceAspect.buildChoice = wrap => {
            origBuildChoice(wrap);
            wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled;
            wrap.choice.dispose = composeSync(() => {
              wrap.updateDisabled = null;
            }, wrap.choice.dispose);
          };

          let origBuildPick = buildPickAspect.buildPick;

          buildPickAspect.buildPick = (wrap, removeOnButton) => {
            let pick = origBuildPick(wrap, removeOnButton);

            pick.updateDisabled = () => pick.pickDomManagerHandlers.updateDisabled();

            pick.dispose = composeSync(pick.dispose, () => {
              pick.updateDisabled = null;
            });
            let choiceUpdateDisabledBackup = wrap.updateDisabled;
            wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled); // add pickDisabled

            pick.dispose = composeSync(pick.dispose, () => {
              wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled

              wrap.updateDisabled(); // make "true disabled" without it checkbox only looks disabled
            });
            return pick;
          };

          return {
            buildApi(api) {
              api.updateOptionsDisabled = () => wrapsCollection.forLoop(wrap => updateChoiceDisabled(wrap, getIsOptionDisabled));

              api.updateOptionDisabled = key => updateChoiceDisabled(wrapsCollection.get(key), getIsOptionDisabled);
            }

          };
        }
      };
    }
  };
}

function updateChoiceDisabled(wrap, getIsOptionDisabled) {
  let newIsDisabled = getIsOptionDisabled(wrap.option);

  if (newIsDisabled != wrap.isOptionDisabled) {
    wrap.isOptionDisabled = newIsDisabled;
    wrap.updateDisabled == null ? void 0 : wrap.updateDisabled(); // some hidden oesn't have element (and need to be updated)
  }
}

function PicksApiPlugin() {
  return {
    buildAspects: aspects => {
      return {
        layout: () => {
          let {
            picksList,
            createWrapAspect,
            createPickHandlersAspect,
            addPickAspect
          } = aspects;
          return {
            buildApi(api) {
              api.forEachPeak = f => picksList.forEach(wrap => f(wrap.option)); // TODO: getHeadPeak


              api.getTailPeak = () => {
                var _picksList$getTail;

                return (_picksList$getTail = picksList.getTail()) == null ? void 0 : _picksList$getTail.option;
              };

              api.countPeaks = () => picksList.getCount();

              api.isEmptyPeaks = () => picksList.isEmpty();

              api.addPick = option => {
                let wrap = createWrapAspect.createWrap(option); // TODO should be moved to specific plugins

                wrap.updateDisabled = () => {};

                wrap.updateHidden = () => {};

                let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
                addPickAspect.addPick(wrap, pickHandlers);
              };
            }

          };
        }
      };
    }
  };
}

function PicksPlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: () => {
          let {
            configuration,
            picksList
          } = aspects;
          let {
            picks
          } = configuration;

          if (picks) {
            let {
              add: origAdd,
              reset: origReset
            } = picksList;

            picksList.add = e => {
              let {
                remove,
                index
              } = origAdd(e);
              picks.push(e);
              return {
                remove: composeSync(remove, () => void picks.splice(index(), 1)),
                index
              };
            };

            picksList.reset = () => {
              origReset();
              picks.length = 0;
            };
          }
        },
        layout: () => {
          /*
          if (!addOptionPicked){
              addOptionPicked = (option, index, value) => {
                  if (value)
                      picks.push(option);
                  else
                      picks.splice(index, 1);
                  return true;
              };
          }
                            function trySetWrapSelected(option, updateSelected, booleanValue){
              let success = false;
              var confirmed = setIsOptionSelected(option, booleanValue);
              if (!(confirmed===false)) {
                  updateSelected();
                  success = true;
              }
              return success;
          }
                            let origProcessInput = inputAspect.processInput;
          inputAspect.processInput = () => {
              let origResult = origProcessInput();
              if (!origResult.isEmpty)
              {
                  if ( filterManagerAspect.getNavigateManager().getCount() == 1)
                  {
                      // todo: move exact match to filterManager
                      let fullMatchWrap =  filterManagerAspect.getNavigateManager().getHead();
                      let text = filterManagerAspect.getFilter();
                      if (fullMatchWrap.choice.searchText == text)
                      {
                          let success = trySetWrapSelected(fullMatchWrap, true);
                          if (success) {
                              filterDom.setEmpty();
                              origResult.isEmpty = true;
                          }
                      }
                  }
              }
              return origResult;
          }*/
        }
      };
    }
  };
}

function CreatePopperPlugin() {
  return {
    buildAspects: aspects => {
      return {
        plugStaticDom() {
          let {
            environment
          } = aspects;
          var popperRtlAspect = PopperRtlAspect();
          aspects.popperRtlAspect = popperRtlAspect;
          let {
            createPopper,
            Popper,
            globalPopper
          } = environment;
          let createModifiersVX = null;
          let createPopperVX = null;

          if (Popper) {
            // V2
            createPopperVX = createPopper = function (createPopperConstructor) {
              return function (anchorElement, element, popperConfiguration) {
                return new createPopperConstructor(anchorElement, element, popperConfiguration);
              };
            }(Popper);
            createModifiersVX = CreateModifiersV1;
          } else if (createPopper) {
            createPopperVX = createPopper;
            createModifiersVX = CreateModifiersV2;
          } else if (globalPopper) {
            if (globalPopper.createPopper) {
              createPopperVX = globalPopper.createPopper;
              createModifiersVX = CreateModifiersV2;
            } else {
              createPopperVX = createPopper = function (createPopperConstructor) {
                return function (anchorElement, element, popperConfiguration) {
                  return new createPopperConstructor(anchorElement, element, popperConfiguration);
                };
              }(globalPopper);

              createModifiersVX = CreateModifiersV1;
            }
          } else {
            throw new Error("BsMultiSelect: Popper component (https://popper.js.org) is required");
          }

          var createPopperConfigurationAspect = CreatePopperConfigurationAspect(createModifiersVX);
          aspects.createPopperAspect = CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect);
        },

        attach() {
          let {
            createPopperAspect,
            filterDom,
            choicesDom,
            disposeAspect,
            staticManager,
            choicesVisibilityAspect,
            specialPicksEventsAspect
          } = aspects;
          CreatePopper_ConstrunctorAspect(createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect);
        }

      };
    }
  };
}

function CreatePopper_ConstrunctorAspect(createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect) {
  let filterInputElement = filterDom.filterInputElement;
  let choicesElement = choicesDom.choicesElement;
  let pop = createPopperAspect.createPopper(choicesElement, filterInputElement, true);
  staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop.init);
  var origBackSpace = specialPicksEventsAspect.backSpace;

  specialPicksEventsAspect.backSpace = pick => {
    origBackSpace(pick);
    pop.update();
  };

  disposeAspect.dispose = composeSync(disposeAspect.dispose, pop.dispose);
  choicesVisibilityAspect.updatePopupLocation = composeSync(choicesVisibilityAspect.updatePopupLocation, function () {
    pop.update();
  });
}

function PopperRtlAspect() {
  return {
    getIsRtl() {
      return false;
    }

  };
} // CreatePopperPlugin.attach = (aspects)=> {
//     let {createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect} = aspects;
//     CreatePopper_ConstrunctorAspect(createPopperAspect, filterDom, choicesDom, disposeAspect, staticManager, choicesVisibilityAspect, specialPicksEventsAspect);
// }
// CreatePopperPlugin.plugStaticDom = (aspects) => {
//     let {environment} = aspects;
//     var popperRtlAspect = PopperRtlAspect();
//     aspects.popperRtlAspect = popperRtlAspect;
//     let {createPopper, Popper, globalPopper} = environment;
//     let createModifiersVX = null;
//     let createPopperVX = null;
//     if (Popper) { // V2
//         createPopperVX = createPopper =  (function(createPopperConstructor) {
//             return function(anchorElement, element, popperConfiguration) {
//                 return new createPopperConstructor(anchorElement, element, popperConfiguration);
//             }
//         })(Popper);;
//         createModifiersVX = CreateModifiersV1;
//     } else if (createPopper) {
//         createPopperVX = createPopper;
//         createModifiersVX = CreateModifiersV2;
//     } else if (globalPopper) {
//         if (globalPopper.createPopper) {
//             createPopperVX = globalPopper.createPopper;
//             createModifiersVX = CreateModifiersV2;
//         } else {
//             createPopperVX = createPopper =  (function(createPopperConstructor) {
//                 return function(anchorElement, element, popperConfiguration) {
//                     return new createPopperConstructor(anchorElement, element, popperConfiguration);
//                 }
//             })(globalPopper);
//             createModifiersVX = CreateModifiersV1;
//         }
//     } else {
//         throw new Error("BsMultiSelect: Popper component (https://popper.js.org) is required");
//     }
//     var createPopperConfigurationAspect = CreatePopperConfigurationAspect(createModifiersVX);
//     aspects.createPopperAspect = CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect);
// }


function CreateModifiersV1(preventOverflow) {
  return {
    preventOverflow: {
      enabled: preventOverflow
    },
    hide: {
      enabled: false
    },
    flip: {
      enabled: false
    }
  };
}

function CreateModifiersV2(preventOverflow) {
  var modifiers = [{
    name: 'flip',
    options: {
      fallbackPlacements: ['bottom']
    }
  }];

  if (preventOverflow) {
    modifiers.push({
      name: 'preventOverflow'
    });
  }

  return modifiers;
}

function CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect) {
  return {
    createPopper(element, anchorElement, preventOverflow) {
      let popper = null;
      return {
        init() {
          var isRtl = popperRtlAspect.getIsRtl();
          var popperConfiguration = createPopperConfigurationAspect.createConfiguration(preventOverflow, isRtl);
          popper = createPopperVX(anchorElement, element, popperConfiguration);
        },

        update() {
          popper.update(); // become async in popper 2; use forceUpdate if sync is needed? 
        },

        dispose() {
          popper.destroy();
        }

      };
    }

  };
}

function CreatePopperConfigurationAspect(createModifiersVX) {
  return {
    createConfiguration(preventOverflow, isRtl) {
      let modifiers = createModifiersVX(preventOverflow);
      let popperConfiguration = {
        placement: 'bottom-start',
        modifiers: modifiers
      };

      if (isRtl) {
        popperConfiguration.placement = 'bottom-end';
      }

      return popperConfiguration;
    }

  };
}

// aka auto height and scrolling
function ChoicesDynamicStylingPlugin(defaults) {
  defaults.useChoicesDynamicStyling = false;
  defaults.choicesDynamicStyling = choicesDynamicStyling;
  defaults.minimalChoicesDynamicStylingMaxHeight = 20;
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          let {
            choicesDynamicStyling,
            useChoicesDynamicStyling
          } = configuration;

          if (useChoicesDynamicStyling) {
            let {
              choicesVisibilityAspect,
              specialPicksEventsAspect
            } = aspects;
            var origSetChoicesVisible = choicesVisibilityAspect.setChoicesVisible;

            choicesVisibilityAspect.setChoicesVisible = function (visible) {
              if (visible) choicesDynamicStyling(aspects);
              origSetChoicesVisible(visible);
            };

            var origBackSpace = specialPicksEventsAspect.backSpace;

            specialPicksEventsAspect.backSpace = pick => {
              origBackSpace(pick);
              choicesDynamicStyling(aspects);
            };
          }
        }
      };
    }
  };
}

function choicesDynamicStyling(aspects) {
  let {
    configuration,
    environment,
    choicesDom,
    navigateAspect
  } = aspects;
  let window = environment.window;
  let choicesElement = choicesDom.choicesElement;
  let minimalChoicesDynamicStylingMaxHeight = configuration.minimalChoicesDynamicStylingMaxHeight; //find height of the browser window

  var g = window.document.getElementsByTagName('body')[0],
      e = window.document.documentElement,
      y = window.innerHeight || e.clientHeight || g.clientHeight; //find position of choicesElement, if it's at the bottom of the page make the choicesElement shorter

  var pos = choicesElement.parentNode.getBoundingClientRect();
  var new_y = y - pos.top; //calculate multi select max-height

  var msHeight = Math.max(minimalChoicesDynamicStylingMaxHeight, Math.round(new_y * 0.85)); // Michalek: 0.85 is empiric value, without it list was longer than footer height ; TODO: propose better way
  //add css height value

  choicesElement.style.setProperty("max-height", msHeight + "px");
  choicesElement.style.setProperty("overflow-y", "auto");

  if (!choicesDom.ChoicesDynamicStylingPlugin_scrollHandle) {
    choicesDom.ChoicesDynamicStylingPlugin_scrollHandle = true;
    var origNavigateAspectNavigate = navigateAspect.navigate;

    navigateAspect.navigate = function (down) {
      var wrap = origNavigateAspectNavigate(down);
      if (wrap != null && wrap.choice != null && wrap.choice.choiceElement != null) wrap.choice.choiceElement.scrollIntoView(false); // alignTo false -  scroll to the top bottom of dropdown first
      // TODO: BUG if mouse left on the dropdow scroll to bottom and one after doesn't work properly

      return wrap;
    };
  }
}

function HighlightPlugin(defaults) {
  defaults.useHighlighting = false;
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: () => {
          if (configuration.useHighlighting) aspects.highlightAspect = HighlightAspect();
        },
        plugStaticDomFactories: () => {
          var {
            choiceDomFactory,
            optionPropertiesAspect
          } = aspects;
          var origCreateChoiceDomFactory = choiceDomFactory.create;

          choiceDomFactory.create = (choiceElement, wrap, toggle) => {
            var value = origCreateChoiceDomFactory(choiceElement, wrap, toggle);

            value.choiceDomManagerHandlers.updateHighlighted = () => {
              var text = optionPropertiesAspect.getText(wrap.option);
              var highlighter = aspects.highlightAspect.getHighlighter();
              if (highlighter) highlighter(choiceElement, value.choiceDom, text);else choiceElement.textContent = text;
            };

            return value;
          };
        },
        layout: () => {
          let {
            highlightAspect,
            filterManagerAspect,
            buildChoiceAspect
          } = aspects;

          if (highlightAspect) {
            let origProcessEmptyInput = filterManagerAspect.processEmptyInput;

            filterManagerAspect.processEmptyInput = function () {
              highlightAspect.reset();
              origProcessEmptyInput();
            };

            let origSetFilter = filterManagerAspect.setFilter;

            filterManagerAspect.setFilter = function (text) {
              highlightAspect.set(text);
              origSetFilter(text);
            };

            let origBuildChoice = buildChoiceAspect.buildChoice;

            buildChoiceAspect.buildChoice = function (wrap) {
              origBuildChoice(wrap);
              let origSetVisible = wrap.choice.setVisible;

              wrap.choice.setVisible = function (v) {
                origSetVisible(v);
                wrap.choice.choiceDomManagerHandlers.updateHighlighted();
              };
            };
          }
        }
      };
    }
  };
}

function CustomChoiceStylingsPlugin(defaults) {
  defaults.customChoiceStylings = null;
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: () => {
          let {
            choiceDomFactory
          } = aspects;
          let customChoiceStylings = configuration.customChoiceStylings;
          let customChoiceStylingsAspect = CustomChoiceStylingsAspect(customChoiceStylings);
          ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect);
        }
      };
    }
  };
}

function ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect) {
  let origChoiceDomFactoryCreate = choiceDomFactory.create;

  choiceDomFactory.create = function (choiceElement, wrap, toggle) {
    var o = origChoiceDomFactoryCreate(choiceElement, wrap, toggle);
    customChoiceStylingsAspect.customize(wrap, o.choiceDom, o.choiceDomManagerHandlers);
    return o;
  };
}

function CustomChoiceStylingsAspect(customChoiceStylings) {
  return {
    customize(wrap, choiceDom, choiceDomManagerHandlers) {
      if (customChoiceStylings) {
        var handlers = customChoiceStylings(choiceDom, wrap.option);

        if (handlers) {
          function customChoiceStylingsClosure(custom) {
            return function () {
              custom({
                isOptionSelected: wrap.isOptionSelected,
                isOptionDisabled: wrap.isOptionDisabled,
                isHoverIn: wrap.choice.isHoverIn //isHighlighted: wrap.choice.isHighlighted  // TODO isHighlighted should be developed

              });
            };
          }

          if (choiceDomManagerHandlers.updateHoverIn && handlers.updateHoverIn) choiceDomManagerHandlers.updateHoverIn = composeSync(choiceDomManagerHandlers.updateHoverIn, customChoiceStylingsClosure(handlers.updateHoverIn));
          if (choiceDomManagerHandlers.updateSelected && handlers.updateSelected) choiceDomManagerHandlers.updateSelected = composeSync(choiceDomManagerHandlers.updateSelected, customChoiceStylingsClosure(handlers.updateSelected));
          if (choiceDomManagerHandlers.updateDisabled && handlers.updateDisabled) choiceDomManagerHandlers.updateDisabled = composeSync(choiceDomManagerHandlers.updateDisabled, customChoiceStylingsClosure(handlers.updateDisabled));
          if (choiceDomManagerHandlers.updateHighlighted && handlers.updateHighlighted) choiceDomManagerHandlers.updateHighlighted = composeSync(choiceDomManagerHandlers.updateHighlighted, customChoiceStylingsClosure(handlers.updateHighlighted));
        }
      }
    }

  };
}

function CustomPickStylingsPlugin(defaults) {
  defaults.customPickStylings = null;
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: () => {
          let {
            componentPropertiesAspect,
            pickDomFactory
          } = aspects;
          let customPickStylings = configuration.customPickStylings;
          let customPickStylingsAspect = CustomPickStylingsAspect(componentPropertiesAspect, customPickStylings);
          ExtendPickDomFactory(pickDomFactory, customPickStylingsAspect);
        }
      };
    }
  };
}

function ExtendPickDomFactory(pickDomFactory, customPickStylingsAspect) {
  let origPickDomFactoryCreate = pickDomFactory.create;

  pickDomFactory.create = function (pickElement, wrap, removeOnButton) {
    var o = origPickDomFactoryCreate(pickElement, wrap, removeOnButton);
    customPickStylingsAspect.customize(wrap, o.pickDom, o.pickDomManagerHandlers);
    return o;
  };
}

function CustomPickStylingsAspect(componentPropertiesAspect, customPickStylings) {
  return {
    customize(wrap, pickDom, pickDomManagerHandlers) {
      if (customPickStylings) {
        var handlers = customPickStylings(pickDom, wrap.option);

        if (handlers) {
          function customPickStylingsClosure(custom) {
            return function () {
              custom({
                isOptionDisabled: wrap.isOptionDisabled,
                isComponentDisabled: componentPropertiesAspect.getDisabled()
              });
            };
          }

          if (pickDomManagerHandlers.updateDisabled && handlers.updateDisabled) pickDomManagerHandlers.updateDisabled = composeSync(pickDomManagerHandlers.updateDisabled, customPickStylingsClosure(handlers.updateDisabled));
          if (pickDomManagerHandlers.updateComponentDisabled && handlers.updateComponentDisabled) pickDomManagerHandlers.updateComponentDisabled = composeSync(pickDomManagerHandlers.updateComponentDisabled, customPickStylingsClosure(handlers.updateComponentDisabled));
        }
      }
    }

  };
}

function UpdateAppearancePlugin() {
  return {
    buildAspects: aspects => {
      return {
        layout: () => {
          var {
            updateAppearanceAspect,
            updateAspect,
            loadAspect
          } = aspects;
          updateAspect.update = composeSync(updateAspect.update, () => updateAppearanceAspect.updateAppearance());
          loadAspect.load = composeSync(loadAspect.load, () => updateAppearanceAspect.updateAppearance());
          return {
            buildApi(api) {
              api.updateAppearance = () => updateAppearanceAspect.updateAppearance();
            }

          };
        },
        plugStaticDom: () => {
          aspects.updateAppearanceAspect = UpdateAppearanceAspect();
        }
      };
    }
  };
} // export function UpdateAppearancePlugin(aspects){
//     var {updateAppearanceAspect, updateAspect, loadAspect} = aspects;
//     updateAspect.update = composeSync(updateAspect.update, ()=>updateAppearanceAspect.updateAppearance())
//     loadAspect.load = composeSync(loadAspect.load, ()=>updateAppearanceAspect.updateAppearance())
//     return{
//         buildApi(api){
//             api.updateAppearance = ()=>updateAppearanceAspect.updateAppearance();
//         }
//     }
// }
// UpdateAppearancePlugin.plugStaticDom = (aspects) => {
//     aspects.updateAppearanceAspect = UpdateAppearanceAspect();
// }

function UpdateAppearanceAspect() {
  return {
    updateAppearance() {}

  };
}

function DisableComponentPlugin() {
  return {
    buildAspects: aspects => {
      return {
        plugStaticDomFactories: () => {
          var {
            pickDomFactory,
            componentPropertiesAspect
          } = aspects;
          var origCreatePickDomFactory = pickDomFactory.create;

          pickDomFactory.create = (pickElement, wrap, remove) => {
            var value = origCreatePickDomFactory(pickElement, wrap, remove);

            value.pickDomManagerHandlers.updateComponentDisabled = () => {
              value.pickDom.pickButtonElement.disabled = componentPropertiesAspect.getDisabled();
            };

            return value;
          };
        },
        layout: () => {
          var {
            updateAppearanceAspect,
            picksList,
            picksDom,
            componentPropertiesAspect,
            picksElementAspect
          } = aspects;
          var origOnClick = picksElementAspect.onClick;

          var disableComponent = isComponentDisabled => {
            picksList.forEach(pick => pick.pickDomManagerHandlers.updateComponentDisabled());
            picksDom.disable(isComponentDisabled);
          };

          picksElementAspect.onClick = handler => {
            disableComponent = isComponentDisabled => {
              picksList.forEach(pick => pick.pickDomManagerHandlers.updateComponentDisabled());
              picksDom.disable(isComponentDisabled);
              if (isComponentDisabled) picksElementAspect.onClickUnbind(); //componentDisabledEventBinder.unbind();
              else origOnClick(handler); //componentDisabledEventBinder.bind(picksElement, "click",  handler); 
            };
          };

          let isComponentDisabled; // state! 

          function updateDisabled() {
            let newIsComponentDisabled = componentPropertiesAspect.getDisabled();

            if (isComponentDisabled !== newIsComponentDisabled) {
              isComponentDisabled = newIsComponentDisabled;
              disableComponent(newIsComponentDisabled);
            }
          }

          updateAppearanceAspect.updateAppearance = composeSync(updateAppearanceAspect.updateAppearance, updateDisabled);
          return {
            buildApi(api) {
              api.updateDisabled = updateDisabled;
            }

          };
        }
      };
    }
  };
}

function PlaceholderPlugin() {
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          let {
            staticManager,
            picksList,
            picksDom,
            filterDom,
            staticDom,
            updateDataAspect,
            resetFilterListAspect,
            filterManagerAspect,
            environment
          } = aspects;
          let isIE11 = environment.isIE11;
          let {
            placeholder,
            css
          } = configuration;
          let {
            picksElement
          } = picksDom;
          let filterInputElement = filterDom.filterInputElement;

          function setPlaceholder(placeholder) {
            filterInputElement.placeholder = placeholder;
          }

          if (isIE11) {
            var ignoreNextInputResetableFlag = ResetableFlag();
            let placeholderStopInputAspect = PlaceholderStopInputAspect(ignoreNextInputResetableFlag);
            var setPlaceholderOrig = setPlaceholder;

            setPlaceholder = function (placeholder) {
              ignoreNextInputResetableFlag.set();
              setPlaceholderOrig(placeholder);
            };

            var origOnInput = filterDom.onInput;

            filterDom.onInput = handler => {
              origOnInput(() => {
                if (placeholderStopInputAspect.get()) {
                  placeholderStopInputAspect.reset();
                } else {
                  handler();
                }
              });
            };
          }

          if (!placeholder) {
            placeholder = getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "placeholder");
          }

          function setEmptyInputWidth(isVisible) {
            if (isVisible) filterInputElement.style.width = '100%';else filterInputElement.style.width = '2ch';
          }

          var emptyToggleStyling = toggleStyling(filterInputElement, css.filterInput_empty);

          function showPlacehodler(isVisible) {
            if (isVisible) {
              setPlaceholder(placeholder ? placeholder : '');
              picksElement.style.display = 'block';
            } else {
              setPlaceholder('');
              picksElement.style.display = 'flex';
            }

            emptyToggleStyling(isVisible);
            setEmptyInputWidth(isVisible);
          }

          showPlacehodler(true);

          function setDisabled(isComponentDisabled) {
            filterInputElement.disabled = isComponentDisabled;
          }

          let isEmpty = () => picksList.isEmpty() && filterDom.isEmpty();

          function updatePlacehodlerVisibility() {
            showPlacehodler(isEmpty());
          }

          function updateEmptyInputWidth() {
            setEmptyInputWidth(isEmpty());
          }
          let origDisable = picksDom.disable;

          picksDom.disable = isComponentDisabled => {
            setDisabled(isComponentDisabled);
            origDisable(isComponentDisabled);
          };

          staticManager.appendToContainer = composeSync(staticManager.appendToContainer, updateEmptyInputWidth);
          filterManagerAspect.processEmptyInput = composeSync(updateEmptyInputWidth, filterManagerAspect.processEmptyInput);
          resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updatePlacehodlerVisibility);
          let origAdd = picksList.add;

          picksList.add = pick => {
            let returnValue = origAdd(pick);

            if (picksList.getCount() == 1) {
              // make flex
              if (filterDom.isEmpty()) {
                setPlaceholder('');
                picksElement.style.display = 'flex';
                emptyToggleStyling(false);
                filterInputElement.style.width = '2ch';
              } else {
                picksElement.style.display = 'flex';
              }
            }

            pick.dispose = composeSync(pick.dispose, function () {
              if (isEmpty()) {
                showPlacehodler(true);
              }
            });
            return returnValue;
          };

          updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updatePlacehodlerVisibility);
        }
      };
    }
  };
} // ie11 support

function PlaceholderStopInputAspect(resetableFlag) {
  return {
    get() {
      return resetableFlag.get();
    },

    reset() {
      return resetableFlag.reset();
    }

  };
}

function PlaceholderCssPatchPlugin(defaults) {
  defaults.cssPatch.filterInput_empty = 'form-control';
}

function FloatingLabelPlugin(defaults) {
  defaults.css.label_floating_lifted = 'floating-lifted';
  defaults.css.picks_floating_lifted = 'floating-lifted';
  return {
    buildAspects: (aspects, configuration) => {
      return {
        plugStaticDom: aspects => {
          aspects.floatingLabelAspect = FloatingLabelAspect();
        },
        layout: () => {
          let {
            picksList,
            picksDom,
            filterDom,
            updateDataAspect,
            resetFilterListAspect,
            floatingLabelAspect,
            labelAspect
          } = aspects;
          let {
            css
          } = configuration;

          if (floatingLabelAspect.isFloatingLabel()) {
            let labelElement = labelAspect.getLabel();
            let picksElement = picksDom.picksElement;
            var liftToggleStyling1 = toggleStyling(labelElement, css.label_floating_lifted);
            var liftToggleStyling2 = toggleStyling(picksElement, css.picks_floating_lifted);

            function liftedLabel(isEmpty) {
              liftToggleStyling1(isEmpty);
              liftToggleStyling2(isEmpty);
            }

            let isEmpty = () => picksList.isEmpty() && filterDom.isEmpty() && !picksDom.getIsFocusIn();

            function updateLiftedLabel() {
              liftedLabel(!isEmpty());
            }
            updateLiftedLabel();
            resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updateLiftedLabel);
            let origAdd = picksList.add;

            picksList.add = pick => {
              let returnValue = origAdd(pick);
              if (picksList.getCount() == 1) updateLiftedLabel();
              pick.dispose = composeSync(pick.dispose, () => {
                if (picksList.getCount() == 0) updateLiftedLabel();
              });
              return returnValue;
            };

            var origToggleFocusStyling = picksDom.toggleFocusStyling;

            picksDom.toggleFocusStyling = () => {
              var isFocusIn = picksDom.getIsFocusIn();
              origToggleFocusStyling(isFocusIn);
              updateLiftedLabel();
            };

            updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updateLiftedLabel);
          }
        }
      };
    }
  };
}

function FloatingLabelAspect() {
  return {
    isFloatingLabel() {}

  };
}

function WarningCssPatchPlugin(defaults) {
  defaults.cssPatch.warning = {
    paddingLeft: '.25rem',
    paddingRight: '.25rem',
    zIndex: 4,
    fontSize: 'small',
    backgroundColor: 'var(--bs-warning)'
  };
}

const defNoResultsWarningMessage = 'No results found';
function WarningPlugin(defaults) {
  defaults.noResultsWarning = defNoResultsWarningMessage;
  defaults.isNoResultsWarningEnabled = false;
  return {
    buildAspects: (aspects, configuration) => {
      return {
        layout: () => {
          let {
            choicesDom,
            createElementAspect,
            staticManager,
            afterInputAspect,
            filterManagerAspect,
            resetLayoutAspect
          } = aspects;
          let {
            css,
            noResultsWarning
          } = configuration;

          if (configuration.isNoResultsWarningEnabled) {
            let warningAspect = WarningAspect(choicesDom, createElementAspect, staticManager, css);
            aspects.warningAspect = warningAspect;
            ExtendAfterInputAspect(afterInputAspect, warningAspect, filterManagerAspect, noResultsWarning);
            resetLayoutAspect.resetLayout = composeSync(() => warningAspect.hide(), resetLayoutAspect.resetLayout);
          }
        },
        attach: () => {
          let {
            createPopperAspect,
            filterDom,
            warningAspect,
            staticManager,
            disposeAspect
          } = aspects;

          if (warningAspect) {
            let filterInputElement = filterDom.filterInputElement;
            let pop2 = createPopperAspect.createPopper(warningAspect.warningElement, filterInputElement, false);
            staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop2.init);
            var origWarningAspectShow = warningAspect.show;

            warningAspect.show = msg => {
              pop2.update();
              origWarningAspectShow(msg);
            };

            disposeAspect.dispose = composeSync(disposeAspect.dispose, pop2.dispose);
          }
        }
      };
    }
  };
}

function ExtendAfterInputAspect(afterInputAspect, warningAspect, filterManagerAspect, noResultsWarning) {
  var origVisible = afterInputAspect.visible;

  afterInputAspect.visible = (showChoices, visibleCount) => {
    warningAspect.hide();
    origVisible(showChoices, visibleCount);
  };

  var origNotVisible = afterInputAspect.notVisible;

  afterInputAspect.notVisible = hideChoices => {
    origNotVisible(hideChoices);
    if (filterManagerAspect.getFilter()) warningAspect.show(noResultsWarning);else warningAspect.hide();
  };
}

function WarningAspect(choicesDom, createElementAspect, staticManager, css) {
  let choicesElement = choicesDom.choicesElement;
  var warningElement = createElementAspect.createElement('DIV');
  var origAppendToContainer = staticManager.appendToContainer;

  staticManager.appendToContainer = function () {
    origAppendToContainer();
    choicesElement.parentNode.insertBefore(warningElement, choicesElement.nextSibling); // insert after
  };

  warningElement.style.display = 'none';
  addStyling(warningElement, css.warning);
  return {
    warningElement,

    show(message) {
      warningElement.style.display = 'block';
      warningElement.innerHTML = message;
    },

    hide() {
      warningElement.style.display = 'none';
      warningElement.innerHTML = "";
    }

  };
}

function WarningBs4Plugin(defaults) {
  defaults.css.warning = 'alert-warning bg-warning';
  return WarningPlugin(defaults);
}

let Bs4PluginSet = {
  BsAppearanceBs4Plugin,
  WarningBs4Plugin,
  CssPatchBs4Plugin,
  BsAppearanceBs4CssPatchPlugin
};
let multiSelectPlugins = {
  SelectElementPlugin,
  LabelForAttributePlugin,
  HiddenOptionPlugin,
  ValidationApiPlugin,
  UpdateAppearancePlugin,
  DisableComponentPlugin,
  FormResetPlugin,
  CreatePopperPlugin,
  WarningCssPatchPlugin,
  RtlPlugin,
  PlaceholderPlugin,
  PlaceholderCssPatchPlugin,
  FloatingLabelPlugin,
  OptionsApiPlugin,
  JQueryMethodsPlugin,
  SelectedOptionPlugin,
  FormRestoreOnBackwardPlugin,
  DisabledOptionPlugin,
  PicksApiPlugin,
  HighlightPlugin,
  ChoicesDynamicStylingPlugin,
  CustomPickStylingsPlugin,
  CustomChoiceStylingsPlugin
};
let picksPlugins = {
  PicksPlugin,
  LabelForAttributePlugin,
  ValidationApiPlugin,
  UpdateAppearancePlugin,
  DisableComponentPlugin,
  CreatePopperPlugin,
  WarningCssPatchPlugin,
  RtlPlugin,
  PlaceholderPlugin,
  PlaceholderCssPatchPlugin,
  FloatingLabelPlugin,
  OptionsApiPlugin,
  JQueryMethodsPlugin,
  PicksApiPlugin,
  HighlightPlugin,
  ChoicesDynamicStylingPlugin,
  CustomPickStylingsPlugin,
  CustomChoiceStylingsPlugin
};
let allPlugins = shallowClearClone(multiSelectPlugins, {
  PicksPlugin
}); // var defaultConfig = {
//     plugins: multiSelectPlugins
// }
// var picksConfig = {
//     plugins: picksPlugins
// }
// export function createConfig(arg){
//     return config;
// }

let utilities = {
  composeSync,
  EventBinder,
  addStyling,
  toggleStyling
};

function StaticDomFactory(createElementAspect) {
  return {
    create(choicesDomFactory, filterDomFactory, picksDomFactory) {
      let choicesDom = choicesDomFactory.create();
      return {
        createStaticDom(element, containerClass) {
          function showError(message) {
            element.style.backgroundColor = 'red';
            element.style.color = 'white';
            throw new Error(message);
          }

          let containerElement, picksElement;
          let removableContainerClass = false;

          if (element.tagName == 'DIV') {
            containerElement = element;

            if (!containerElement.classList.contains(containerClass)) {
              containerElement.classList.add(containerClass);
              removableContainerClass = true;
            }

            picksElement = findDirectChildByTagName(containerElement, 'UL');
          } else if (element.tagName == 'UL') {
            picksElement = element;
            containerElement = closestByClassName(element, containerClass);

            if (!containerElement) {
              showError('BsMultiSelect: defined on UL but precedentant DIV for container not found; class=' + containerClass);
            }
          } else if (element.tagName == "INPUT") {
            showError('BsMultiSelect: INPUT element is not supported');
          }

          let isDisposablePicksElement = false;

          if (!picksElement) {
            picksElement = createElementAspect.createElement('UL');
            isDisposablePicksElement = true;
          }

          let filterDom = filterDomFactory.create(isDisposablePicksElement);
          let picksDom = picksDomFactory.create(picksElement, isDisposablePicksElement);
          return {
            choicesDom,
            filterDom,
            picksDom,
            staticDom: {
              initialElement: element,
              containerElement,
              picksElement,
              isDisposablePicksElement
            },
            staticManager: {
              appendToContainer() {
                containerElement.appendChild(choicesDom.choicesElement);
                if (isDisposablePicksElement) containerElement.appendChild(picksElement);
              },

              dispose() {
                containerElement.removeChild(choicesDom.choicesElement);
                if (removableContainerClass) containerElement.classList.remove(containerClass);
                if (isDisposablePicksElement) containerElement.removeChild(picksElement);
              }

            }
          };
        }

      };
    }

  };
}

function CreateElementAspect(createElement, createElementFromHtml) {
  return {
    createElement,
    createElementFromHtml
  };
}

function ChoicesVisibilityAspect(choicesElement) {
  return {
    isChoicesVisible() {
      return choicesElement.style.display != 'none';
    },

    setChoicesVisible(visible) {
      choicesElement.style.display = visible ? 'block' : 'none';
    },

    updatePopupLocation() {}

  };
}

function SpecialPicksEventsAspect() {
  return {
    backSpace(pick) {
      pick.setSelectedFalse();
    }

  };
}

function TriggerAspect(element, trigger) {
  return {
    trigger: eventName => {
      trigger(element, eventName);
    }
  };
}
function OnChangeAspect(triggerAspect, name) {
  return {
    onChange() {
      triggerAspect.trigger(name);
    }

  };
}
function ComponentPropertiesAspect(getDisabled) {
  return {
    getDisabled
  };
}

function OptionsAspect(options) {
  return {
    getOptions: () => options
  };
}
function OptionPropertiesAspect(getText) {
  if (!getText) {
    getText = option => option.text;
  }

  return {
    getText
  };
}

function ChoicesEnumerableAspect(countableChoicesList, getNext) {
  return {
    forEach(f) {
      let wrap = countableChoicesList.getHead();

      while (wrap) {
        f(wrap);
        wrap = getNext(wrap);
      }
    }

  };
}

function NavigateManager(list, getPrev, getNext) {
  return {
    navigate(down, wrap
    /* hoveredChoice */
    ) {
      if (down) {
        return wrap ? getNext(wrap) : list.getHead();
      } else {
        return wrap ? getPrev(wrap) : list.getTail();
      }
    },

    getCount() {
      return list.getCount();
    },

    getHead() {
      return list.getHead();
    }

  };
}
function FilterPredicateAspect() {
  return {
    filterPredicate: (wrap, text) => wrap.choice.searchText.indexOf(text) >= 0
  };
}
function FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect) {
  let showEmptyFilter = true;
  let filterText = "";
  return {
    getNavigateManager() {
      return showEmptyFilter ? emptyNavigateManager : filteredNavigateManager;
    },

    processEmptyInput() {
      // redefined in PlaceholderPulgin, HighlightPlugin
      showEmptyFilter = true;
      filterText = "";
      choicesEnumerableAspect.forEach(wrap => {
        wrap.choice.setVisible(true);
      });
    },

    getFilter() {
      return filterText;
    },

    setFilter(text) {
      // redefined in  HighlightPlugin
      showEmptyFilter = false;
      filterText = text;
      filteredChoicesList.reset();
      choicesEnumerableAspect.forEach(wrap => {
        wrap.choice.filteredPrev = wrap.choice.filteredNext = null;
        var v = filterPredicateAspect.filterPredicate(wrap, text);
        if (v) filteredChoicesList.add(wrap);
        wrap.choice.setVisible(v);
      });
    }

  };
}

function BuildAndAttachChoiceAspect(buildChoiceAspect) {
  return {
    buildAndAttachChoice(wrap, getNextElement) {
      buildChoiceAspect.buildChoice(wrap);
      wrap.choice.choiceElementAttach(getNextElement == null ? void 0 : getNextElement());
    }

  };
}
function BuildChoiceAspect(choicesDom, choiceDomFactory, choiceClickAspect) {
  return {
    buildChoice(wrap) {
      var {
        choiceElement,
        setVisible,
        attach,
        detach
      } = choicesDom.createChoiceElement();
      wrap.choice.choiceElement = choiceElement;
      wrap.choice.choiceElementAttach = attach;
      wrap.choice.isChoiceElementAttached = true;
      let {
        dispose,
        choiceDom,
        choiceDomManagerHandlers
      } = choiceDomFactory.create(choiceElement, wrap, () => choiceClickAspect.choiceClick(wrap));
      wrap.choice.choiceDom = choiceDom;
      choiceDomManagerHandlers.updateData();
      if (choiceDomManagerHandlers.updateSelected) choiceDomManagerHandlers.updateSelected();
      if (choiceDomManagerHandlers.updateDisabled) choiceDomManagerHandlers.updateDisabled();
      wrap.choice.choiceDomManagerHandlers = choiceDomManagerHandlers;

      wrap.choice.remove = () => {
        detach();
      };

      wrap.choice.isFilteredIn = true;

      wrap.choice.setHoverIn = v => {
        wrap.choice.isHoverIn = v;
        choiceDomManagerHandlers.updateHoverIn();
      };

      wrap.choice.setVisible = v => {
        wrap.choice.isFilteredIn = v;
        setVisible(wrap.choice.isFilteredIn);
      };

      wrap.choice.dispose = () => {
        wrap.choice.choiceDomManagerHandlers = null;
        dispose();
        wrap.choice.choiceElement = null;
        wrap.choice.choiceDom = null;
        wrap.choice.choiceElementAttach = null;
        wrap.choice.isChoiceElementAttached = false;
        wrap.choice.remove = null; // not real data manipulation but internal state

        wrap.choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item

        wrap.choice.setHoverIn = null;
        wrap.choice.dispose = null;
      };

      wrap.dispose = () => {
        wrap.choice.dispose();
        wrap.dispose = null;
      };
    }

  };
}

function OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps) {
  return {
    attach(option) {
      let wrap = createWrapAspect.createWrap(option);
      wrap.choice = createChoiceBaseAspect.createChoiceBase(option); // let optGroup = optGroupAspect.getOptionOptGroup(option);
      // if (prevOptGroup != optGroup){
      //     currentOptGroup = optGroup;
      //     var optGroupWrap = optGroupBuildAspect.wrapAndAttachOptGroupItem(option);
      // }
      // wrap.optGroup = currentOptGroup;

      wraps.push(wrap); // note: before attach because attach need it for navigation management

      buildAndAttachChoiceAspect.buildAndAttachChoice(wrap); //wraps.push(wrap);
    }

  };
}
function OptionsLoopAspect(optionsAspect, optionAttachAspect) {
  return {
    loop() {
      let options = optionsAspect.getOptions();

      for (let i = 0; i < options.length; i++) {
        let option = options[i];
        optionAttachAspect.attach(option);
      }
    }

  };
}

function UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect) {
  return {
    updateData() {
      // close drop down , remove filter
      resetLayoutAspect.resetLayout();
      choicesDom.choicesListElement.innerHTML = ""; // TODO: there should better "optimization"

      wraps.clear();
      picksList.forEach(pick => pick.dispose());
      picksList.reset();
      optionsLoopAspect.loop();
    }

  };
}
function UpdateAspect(updateDataAspect) {
  return {
    update() {
      updateDataAspect.updateData();
    }

  };
}

function IsChoiceSelectableAspect() {
  // TODO rename to IsSelectableByUserAspect ?
  return {
    isSelectable: wrap => true
  };
} // todo: remove?

function ChoiceClickAspect(optionToggleAspect, filterDom) {
  return {
    choiceClick: wrap => {
      optionToggleAspect.toggle(wrap);
      filterDom.setFocus();
    }
  };
} // // fullMatchAspect trySetWrapSelected(fullMatchWrap.option, composeUpdateSelected(fullMatchWrap, true), true);

function OptionToggleAspect(createPickHandlersAspect, addPickAspect
/*, setOptionSelectedAspect*/
) {
  return {
    toggle: wrap => {
      let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
      addPickAspect.addPick(wrap, pickHandlers);
      return true; // TODO: process setOptionSelectedAspect
    }
  };
}
function AddPickAspect() {
  return {
    addPick(wrap, pickHandlers) {
      return pickHandlers.producePick();
    }

  };
}
function FullMatchAspect(createPickHandlersAspect, addPickAspect) {
  return {
    fullMatch(wrap) {
      let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
      addPickAspect.addPick(wrap, pickHandlers);
      return true; // TODO: process setOptionSelectedAspect
    }

  };
}
function RemovePickAspect() {
  return {
    removePick(wrap, pick) {
      pick.dispose(); // overrided in SelectedOptionPlugin with trySetWrapSelected(wrap, false);
    }

  };
}
function ProducePickAspect(picksList, removePickAspect, buildPickAspect) {
  return {
    producePick(wrap, pickHandlers) {
      let pick = buildPickAspect.buildPick(wrap, event => pickHandlers.removeOnButton(event));

      let fixSelectedFalse = () => removePickAspect.removePick(wrap, pick);

      pickHandlers.removeOnButton = fixSelectedFalse;
      pick.pickElementAttach();
      let {
        remove: removeFromPicksList
      } = picksList.add(pick);
      pick.setSelectedFalse = fixSelectedFalse;
      pick.wrap = wrap;
      pick.dispose = composeSync(removeFromPicksList, () => {
        pick.setSelectedFalse = null;
        pick.wrap = null;
      }, pick.dispose);

      pickHandlers.removeAndDispose = () => pick.dispose();

      return pick;
    }

  };
} // redefined in MultiSelectInlineLayout to redefine handlers removeOnButton
// redefined in SelectedOptionPlugin to compose wrap.updateSelected

function CreatePickHandlersAspect(producePickAspect) {
  return {
    createPickHandlers(wrap) {
      let pickHandlers = {
        producePick: null,
        // not redefined directly, but redefined in addPickAspect
        removeAndDispose: null,
        // not redefined, 
        removeOnButton: null // redefined in MultiSelectInlineLayout

      };

      pickHandlers.producePick = () => producePickAspect.producePick(wrap, pickHandlers);

      return pickHandlers;
    }

  };
}
function CreateChoiceBaseAspect(optionPropertiesAspect) {
  return {
    createChoiceBase(option) {
      return {
        //updateDisabled:null,  
        //updateHidden:null,
        // navigation and filter support
        filteredPrev: null,
        filteredNext: null,
        searchText: optionPropertiesAspect.getText(option).toLowerCase().trim(),
        // TODO make an index abstraction
        // internal state handlers, so they do not have "update semantics"
        isHoverIn: false,
        isFilteredIn: false,
        setVisible: null,
        setHoverIn: null,
        // TODO: is it a really sense to have them there?
        isChoiceElementAttached: false,
        choiceElement: null,
        choiceDom: null,
        choiceElementAttach: null,
        itemPrev: null,
        itemNext: null,
        remove: null,
        dispose: null
      };
    }

  };
}
function CreateWrapAspect() {
  return {
    createWrap(option) {
      return {
        option: option
      };
    }

  };
}

function HoveredChoiceAspect() {
  let hoveredChoice = null;
  return {
    getHoveredChoice: () => hoveredChoice,
    setHoveredChoice: wrap => {
      hoveredChoice = wrap;
    },

    resetHoveredChoice() {
      if (hoveredChoice) {
        hoveredChoice.choice.setHoverIn(false);
        hoveredChoice = null;
      }
    }

  };
}
function NavigateAspect(hoveredChoiceAspect, navigate) {
  return {
    hoverIn(wrap) {
      hoveredChoiceAspect.resetHoveredChoice();
      hoveredChoiceAspect.setHoveredChoice(wrap);
      wrap.choice.setHoverIn(true);
    },

    navigate: down => navigate(down, hoveredChoiceAspect.getHoveredChoice())
  };
}

function Wraps(wrapsCollection, listFacade_reset, listFacade_remove, listFacade_add) {
  return {
    push: wrap => push(wrap, wrapsCollection, listFacade_add),
    insert: (key, wrap) => insert(key, wrap, wrapsCollection, listFacade_add),
    remove: key => {
      var wrap = wrapsCollection.remove(key);
      listFacade_remove(wrap);
      return wrap;
    },
    clear: () => {
      wrapsCollection.reset();
      listFacade_reset();
    },
    dispose: () => wrapsCollection.forLoop(wrap => wrap.dispose())
  };
}

function push(wrap, wrapsCollection, listFacade_add) {
  wrapsCollection.push(wrap);
  listFacade_add(wrap);
}

function insert(key, wrap, wrapsCollection, listFacade_add) {
  if (key >= wrapsCollection.getCount()) {
    push(wrap, wrapsCollection, listFacade_add);
  } else {
    wrapsCollection.add(wrap, key);
    listFacade_add(wrap, key);
  }
}

function PickButtonAspect(buttonHTML) {
  return {
    getButtonHTML: () => buttonHTML
  };
}

function BuildPickAspect(picksDom, pickDomFactory) {
  return {
    buildPick(wrap, removeOnButton) {
      let {
        pickElement,
        attach,
        detach
      } = picksDom.createPickElement();
      let {
        dispose,
        pickDom,
        pickDomManagerHandlers
      } = pickDomFactory.create(pickElement, wrap, removeOnButton);
      pickDomManagerHandlers.updateData();
      if (pickDomManagerHandlers.updateDisabled) pickDomManagerHandlers.updateDisabled();
      if (pickDomManagerHandlers.updateComponentDisabled) pickDomManagerHandlers.updateComponentDisabled();
      let pick = {
        pickDom,
        pickDomManagerHandlers,
        pickElementAttach: attach,
        dispose: () => {
          detach();
          dispose();
          pick.pickDomManagerHandlers = null;
          pick.pickDom = pickDom;
          pick.pickElementAttach = null;
          pick.dispose = null;
        }
      };
      return pick;
    }

  };
}

function InputAspect(filterDom, filterManagerAspect, fullMatchAspect) {
  return {
    // overrided in SelectedOptionPlugin
    processInput() {
      let filterInputValue = filterDom.getValue();
      let text = filterInputValue.trim();
      var isEmpty = false;
      if (text == '') isEmpty = true;else {
        filterManagerAspect.setFilter(text.toLowerCase());
      }

      if (!isEmpty) {
        if (filterManagerAspect.getNavigateManager().getCount() == 1) {
          // todo: move exact match to filterManager
          let fullMatchWrap = filterManagerAspect.getNavigateManager().getHead();

          let _text = filterManagerAspect.getFilter();

          if (fullMatchWrap.choice.searchText == _text) {
            let success = fullMatchAspect.fullMatch(fullMatchWrap);

            if (success) {
              filterDom.setEmpty();
              isEmpty = true;
            }
          }
        }
      }

      return {
        filterInputValue,
        isEmpty
      };
    }

  };
}

function ResetFilterListAspect(filterDom, filterManagerAspect) {
  return {
    forceResetFilter() {
      // over in PlaceholderPlugin
      filterDom.setEmpty();
      filterManagerAspect.processEmptyInput(); // over in PlaceholderPlugin
    }

  };
}
function ResetFilterAspect(filterDom, resetFilterListAspect) {
  return {
    resetFilter() {
      // call in OptionsApiPlugin
      if (!filterDom.isEmpty()) // call in Placeholder
        resetFilterListAspect.forceResetFilter(); // over in Placeholder
    }

  };
}
function FocusInAspect(picksDom) {
  return {
    setFocusIn(focus) {
      // call in OptionsApiPlugin
      picksDom.setIsFocusIn(focus); // unique call, call BsAppearancePlugin

      picksDom.toggleFocusStyling(); // over BsAppearancePlugin
    }

  };
}

function MultiSelectInlineLayoutAspect(environment, filterDom, choicesDom, choicesVisibilityAspect, hoveredChoiceAspect, navigateAspect, filterManagerAspect, focusInAspect, optionToggleAspect, createPickHandlersAspect, picksList, inputAspect, specialPicksEventsAspect, buildChoiceAspect, resetLayoutAspect, picksElementAspect, afterInputAspect, disposeAspect) {
  let choicesElement = choicesDom.choicesElement;
  var window = environment.window;
  var document = window.document;
  var eventLoopFlag = EventLoopProlongableFlag(window);
  var skipFocusout = false; // state

  function getSkipFocusout() {
    return skipFocusout;
  }

  function resetSkipFocusout() {
    skipFocusout = false;
  }

  function setSkipFocusout() {
    skipFocusout = true;
  }

  var skipoutMousedown = function skipoutMousedown() {
    setSkipFocusout();
  }; // add listeners that manages close dropdown on  click outside container


  var choicesElementMousedownEventTumbler = EventTumbler(choicesElement, "mousedown", skipoutMousedown);
  var documentMouseupEventTumbler = EventTumbler(document, "mouseup", documentMouseup);

  var documentMouseup = function documentMouseup(event) {
    // if we would left without focus then "close the drop" do not remove focus border
    if (choicesElement == event.target) filterDom.setFocus(); // if click outside container - close dropdown
    else if (!containsAndSelf(choicesElement, event.target) && !picksElementAspect.containsAndSelf(event.target)) {
      resetLayoutAspect.resetLayout();
      focusInAspect.setFocusIn(false);
    }
  };

  function showChoices() {
    if (!choicesVisibilityAspect.isChoicesVisible()) {
      choicesVisibilityAspect.updatePopupLocation();
      eventLoopFlag.set();
      choicesVisibilityAspect.setChoicesVisible(true); // TODO: move to scroll plugin

      choicesElement.scrollTop = 0;
      choicesElementMousedownEventTumbler.on();
      documentMouseupEventTumbler.on();
    }
  }

  function hideChoices() {
    resetMouseCandidateChoice();
    hoveredChoiceAspect.resetHoveredChoice();

    if (choicesVisibilityAspect.isChoicesVisible()) {
      // COOMENT OUT DEBUGGING popup layout
      choicesVisibilityAspect.setChoicesVisible(false);
      choicesElementMousedownEventTumbler.off();
      documentMouseupEventTumbler.off();
    }
  }

  var preventDefaultClickEvent = null; // TODO: remove setTimeout: set on start of mouse event reset on end

  function skipoutAndResetMousedown() {
    skipoutMousedown();
    window.setTimeout(() => resetSkipFocusout());
  }

  function processUncheck(uncheckOption, event) {
    // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
    // never remove elements in the same event iteration
    window.setTimeout(() => uncheckOption());
    preventDefaultClickEvent = event; // setPreventDefaultMultiSelectEvent
  } // function handleOnRemoveButton(onRemove, setSelectedFalse){
  //     // processRemoveButtonClick removes the item
  //     // what is a problem with calling 'remove' directly (not using  setTimeout('remove', 0)):
  //     // consider situation "MultiSelect" on DROPDOWN (that should be closed on the click outside dropdown)
  //     // therefore we aslo have document's click's handler where we decide to close or leave the DROPDOWN open.
  //     // because of the event's bubling process 'remove' runs first. 
  //     // that means the event's target element on which we click (the x button) will be removed from the DOM together with badge 
  //     // before we could analize is it belong to our dropdown or not.
  //     // important 1: we can't just the stop propogation using stopPropogate because click outside dropdown on the similar 
  //     // component that use stopPropogation will not close dropdown (error, dropdown should be closed)
  //     // important 2: we can't change the dropdown's event handler to leave dropdown open if event's target is null because of
  //     // the situation described above: click outside dropdown on the same component.
  //     // Alternatively it could be possible to use stopPropogate but together create custom click event setting new target 
  //     // that belomgs to DOM (e.g. panel)
  //     onRemove(event => {
  //         processUncheck(setSelectedFalse, event);
  //         hideChoices();
  //         resetFilterAspect.resetFilter(); 
  //     });
  // }


  function handleOnRemoveButton(setSelectedFalse) {
    return event => {
      processUncheck(setSelectedFalse, event);
      resetLayoutAspect.resetLayout();
    };
  }

  let mouseCandidateEventBinder = EventBinder();

  var resetMouseCandidateChoice = () => {
    mouseCandidateEventBinder.unbind();
  };

  var mouseOverToHoveredAndReset = wrap => {
    if (!wrap.choice.isHoverIn) navigateAspect.hoverIn(wrap);
    resetMouseCandidateChoice();
  };

  function adoptChoiceElement(wrap) {
    let choiceElement = wrap.choice.choiceElement; // in chrome it happens on "become visible" so we need to skip it, 
    // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
    // mouse moves inside the item. 
    // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous

    var onChoiceElementMouseover = () => {
      if (eventLoopFlag.get()) {
        resetMouseCandidateChoice();
        mouseCandidateEventBinder.bind(choiceElement, 'mousemove', () => mouseOverToHoveredAndReset(wrap));
        mouseCandidateEventBinder.bind(choiceElement, 'mousedown', () => mouseOverToHoveredAndReset(wrap));
      } else {
        if (!wrap.choice.isHoverIn) {
          // NOTE: mouseleave is not enough to guarantee remove hover styles in situations
          // when style was setuped without mouse (keyboard arrows)
          // therefore force reset manually (done inside hoverIn)
          navigateAspect.hoverIn(wrap);
        }
      }
    }; // note 1: mouseleave preferred to mouseout - which fires on each descendant
    // note 2: since I want add aditional info panels to the dropdown put mouseleave on dropdwon would not work


    var onChoiceElementMouseleave = () => {
      if (!eventLoopFlag.get()) {
        hoveredChoiceAspect.resetHoveredChoice();
      }
    };

    var overAndLeaveEventBinder = EventBinder();
    overAndLeaveEventBinder.bind(choiceElement, 'mouseover', onChoiceElementMouseover);
    overAndLeaveEventBinder.bind(choiceElement, 'mouseleave', onChoiceElementMouseleave);
    return overAndLeaveEventBinder.unbind;
  } // it can be initated by 3PP functionality
  // sample (1) BS functionality - input x button click - clears input
  // sample (2) BS functionality - esc keydown - clears input
  // and there could be difference in processing: (2) should hide the menu, then reset , when (1) should just reset without hiding.


  function afterInput() {
    let visibleCount = filterManagerAspect.getNavigateManager().getCount();

    if (visibleCount > 0) {
      afterInputAspect.visible(showChoices, visibleCount);
    } else {
      afterInputAspect.notVisible(hideChoices);
    }
  }

  function keyDownArrow(down) {
    let wrap = navigateAspect.navigate(down);

    if (wrap) {
      // TODO: next line should be moved to planned  "HeightAndScroll" plugin, actual only for scrolling with keyDown functionality
      eventLoopFlag.set(400); // means disable mouse handlers that set hovered choice item; arrowDown can intiate scrolling when scrolling can itiate mouse leave on hovered item; this stops it

      navigateAspect.hoverIn(wrap); // !

      showChoices();
    }
  }

  function hoveredToSelected() {
    let hoveredWrap = hoveredChoiceAspect.getHoveredChoice();

    if (hoveredWrap) {
      let wasToggled = optionToggleAspect.toggle(hoveredWrap);

      if (wasToggled) {
        resetLayoutAspect.resetLayout();
      }
    }
  } // TODO: bind it more declarative way? (compact code)


  var onKeyDown = event => {
    let keyCode = event.which;
    var empty = filterDom.isEmpty();

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
        let pick = picksList.getTail();

        if (pick) {
          specialPicksEventsAspect.backSpace(pick);
        }
      }
    } // ---------------------------------------------------------------------------------
    // NOTE: no preventDefault called in case of empty for 9-tab
    else if (keyCode == 9
    /*tab*/
    ) {
      // NOTE: no keydown for this (without preventDefaul after TAB keyup event will be targeted another element)  
      if (empty) {
        hideChoices(); // hideChoices inside (and no filter reset since it is empty) 
      }
    } else if (keyCode == 27
    /*esc*/
    ) {
      // NOTE: forbid the ESC to close the modal (in case the nonempty or dropdown is open)
      if (!empty || choicesVisibilityAspect.isChoicesVisible()) event.stopPropagation();
    } else if (keyCode == 38) {
      keyDownArrow(false); // up
    } else if (keyCode == 40) {
      keyDownArrow(true); // down
    }
  };

  var onKeyUp = event => {
    let keyCode = event.which; //var handler = keyUp[event.which/* key code */];
    //handler();    

    if (keyCode == 9
    /*tab*/
    ) {
      if (choicesVisibilityAspect.isChoicesVisible()) {
        keyDownArrow(true);
      } else {
        if (filterManagerAspect.getNavigateManager().getCount() > 0) {
          showChoices();
        }
      }
    } else if (keyCode == 13) {
      if (choicesVisibilityAspect.isChoicesVisible()) {
        hoveredToSelected();
      } else {
        if (filterManagerAspect.getNavigateManager().getCount() > 0) {
          showChoices();
        }
      }
    } else if (keyCode == 27) {
      // escape
      // is it always empty (bs x can still it) 
      resetLayoutAspect.resetLayout();
    }
  };

  function clickToShowChoices(event) {
    filterDom.setFocusIfNotTarget(event.target);

    if (preventDefaultClickEvent != event) {
      if (choicesVisibilityAspect.isChoicesVisible()) {
        hideChoices();
      } else {
        if (filterManagerAspect.getNavigateManager().getCount() > 0) showChoices();
      }
    }

    preventDefaultClickEvent = null;
  }

  return {
    init() {
      filterDom.onFocusIn(() => focusInAspect.setFocusIn(true));
      filterDom.onFocusOut(() => {
        if (!getSkipFocusout()) {
          // skip initiated by mouse click (we manage it different way)
          resetLayoutAspect.resetLayout(); // if do not do this we will return to filtered list without text filter in input

          focusInAspect.setFocusIn(false);
        }

        resetSkipFocusout();
      });
      filterDom.onInput(() => {
        let {
          filterInputValue,
          isEmpty
        } = inputAspect.processInput();
        if (isEmpty) filterManagerAspect.processEmptyInput();else filterDom.setWidth(filterInputValue);
        eventLoopFlag.set(); // means disable mouse handlers that set hovered item; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

        afterInput();
      });
      filterDom.onKeyDown(onKeyDown);
      filterDom.onKeyUp(onKeyUp);
      picksElementAspect.onClick(clickToShowChoices);
      picksElementAspect.onMousedown(skipoutAndResetMousedown);
      resetLayoutAspect.resetLayout = composeSync(hideChoices, resetLayoutAspect.resetLayout // resetFilter by default
      );
      let origCreatePickHandlers = createPickHandlersAspect.createPickHandlers;

      createPickHandlersAspect.createPickHandlers = wrap => {
        let pickHandlers = origCreatePickHandlers(wrap);
        pickHandlers.removeOnButton = handleOnRemoveButton(pickHandlers.removeOnButton);
        return pickHandlers;
      };

      let origBuildChoice = buildChoiceAspect.buildChoice;

      buildChoiceAspect.buildChoice = wrap => {
        origBuildChoice(wrap);
        let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
        wrap.choice.remove = composeSync(wrap.choice.remove, () => {
          if (pickHandlers.removeAndDispose) {
            pickHandlers.removeAndDispose();
            pickHandlers.removeAndDispose = null;
          }
        });
        let unbindChoiceElement = adoptChoiceElement(wrap);
        wrap.choice.dispose = composeSync(unbindChoiceElement, wrap.choice.dispose);
      };

      disposeAspect.dispose = composeSync(disposeAspect.dispose, resetMouseCandidateChoice, () => picksElementAspect.unbind());
    }

  };
}

function ResetLayoutAspect(resetLayout) {
  return {
    resetLayout
  };
}

function LoadAspect(optionsLoopAspect) {
  return {
    load() {
      // redriven in AppearancePlugin, FormRestoreOnBackwardPlugin
      optionsLoopAspect.loop();
    }

  };
}

function CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection) {
  return {
    countableChoicesListInsert(wrap, key) {
      let choiceNext = wrapsCollection.getNext(key);
      countableChoicesList.add(wrap, choiceNext);
    }

  };
}

function PicksElementAspect(picksElement) {
  var componentDisabledEventBinder = EventBinder();
  var skipoutAndResetMousedownEventBinder = EventBinder();
  return {
    containsAndSelf(element) {
      return containsAndSelf(picksElement, element);
    },

    onClickUnbind() {
      componentDisabledEventBinder.unbind();
    },

    onClick(handler) {
      componentDisabledEventBinder.bind(picksElement, "click", handler);
    },

    onMousedown(handler) {
      skipoutAndResetMousedownEventBinder.bind(picksElement, "mousedown", handler);
    },

    unbind() {
      skipoutAndResetMousedownEventBinder.unbind();
      componentDisabledEventBinder.unbind();
    }

  };
}

function AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect) {
  return {
    visible(showChoices, visibleCount) {
      let panelIsVisble = choicesVisibilityAspect.isChoicesVisible();

      if (!panelIsVisble) {
        showChoices();
      }

      if (visibleCount == 1) {
        navigateAspect.hoverIn(filterManagerAspect.getNavigateManager().getHead());
      } else {
        if (panelIsVisble) hoveredChoiceAspect.resetHoveredChoice();
      }
    },

    notVisible(hideChoices) {
      if (choicesVisibilityAspect.isChoicesVisible()) {
        hideChoices();
      }
    }

  };
}

function BsMultiSelect(element, environment, pluginManager, configuration, onInit) {
  var {
    window
  } = environment;
  environment.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
  let {
    containerClass,
    css,
    getDisabled,
    options,
    getText
  } = configuration;
  let disposeAspect = {
    dispose() {}

  };
  let triggerAspect = TriggerAspect(element, environment.trigger);
  let onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
  let componentPropertiesAspect = ComponentPropertiesAspect(getDisabled != null ? getDisabled : () => false);
  let optionsAspect = OptionsAspect(options);
  let optionPropertiesAspect = OptionPropertiesAspect(getText);
  let isChoiceSelectableAspect = IsChoiceSelectableAspect();
  let createWrapAspect = CreateWrapAspect();
  let createChoiceBaseAspect = CreateChoiceBaseAspect(optionPropertiesAspect);
  let addPickAspect = AddPickAspect();
  let removePickAspect = RemovePickAspect();
  let createElementAspect = CreateElementAspect(name => window.document.createElement(name), (element, html) => element.innerHTML = html);
  let wrapsCollection = ArrayFacade();
  let countableChoicesList = DoublyLinkedList(wrap => wrap.choice.itemPrev, (warp, v) => warp.choice.itemPrev = v, wrap => wrap.choice.itemNext, (wrap, v) => wrap.choice.itemNext = v);
  let countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection);
  let choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, wrap => wrap.choice.itemNext);
  let filteredChoicesList = DoublyLinkedList(wrap => wrap.choice.filteredPrev, (wrap, v) => wrap.choice.filteredPrev = v, wrap => wrap.choice.filteredNext, (wrap, v) => wrap.choice.filteredNext = v);
  let emptyNavigateManager = NavigateManager(countableChoicesList, wrap => wrap.choice.itemPrev, wrap => wrap.choice.itemNext);
  let filteredNavigateManager = NavigateManager(filteredChoicesList, wrap => wrap.choice.filteredPrev, wrap => wrap.choice.filteredNext);
  let filterPredicateAspect = FilterPredicateAspect();
  let filterManagerAspect = FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect);
  let hoveredChoiceAspect = HoveredChoiceAspect();
  let navigateAspect = NavigateAspect(hoveredChoiceAspect, (down, hoveredChoice) => filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice));
  let picksList = List();
  let wraps = Wraps(wrapsCollection, () => countableChoicesList.reset(), w => countableChoicesList.remove(w), (w, key) => countableChoicesListInsertAspect.countableChoicesListInsert(w, key));
  let picksDomFactory = PicksDomFactory(css, createElementAspect);
  let filterDomFactory = FilterDomFactory(css, createElementAspect);
  let choicesDomFactory = ChoicesDomFactory(css, createElementAspect);
  let pickButtonAspect = PickButtonAspect(configuration.pickButtonHTML);
  let pickDomFactory = PickDomFactory(css, createElementAspect, optionPropertiesAspect, pickButtonAspect);
  let choiceDomFactory = ChoiceDomFactory(css, createElementAspect, optionPropertiesAspect);
  pluginManager.plugStaticDomFactories({
    environment,
    configuration,
    disposeAspect,
    triggerAspect,
    onChangeAspect,
    componentPropertiesAspect,
    countableChoicesList,
    countableChoicesListInsertAspect,
    optionPropertiesAspect,
    createElementAspect,
    wrapsCollection,
    choicesEnumerableAspect,
    filteredChoicesList,
    filterPredicateAspect,
    isChoiceSelectableAspect,
    hoveredChoiceAspect,
    navigateAspect,
    choicesDomFactory,
    filterDomFactory,
    picksDomFactory,
    pickDomFactory,
    choiceDomFactory,
    filterManagerAspect,
    optionsAspect,
    createWrapAspect,
    createChoiceBaseAspect,
    picksList,
    wraps,
    addPickAspect,
    removePickAspect
  });
  let staticDomFactory = StaticDomFactory(createElementAspect);
  pluginManager.plugStaticDom({
    staticDomFactory
  }); // apply cssPatch to css, apply selectElement support;  

  let {
    createStaticDom
  } = staticDomFactory.create(choicesDomFactory, filterDomFactory, picksDomFactory); // overrided in SelectElementPlugin

  let {
    staticDom,
    filterDom,
    picksDom,
    staticManager,
    choicesDom
  } = createStaticDom(element, containerClass); // after this we can use staticDom (means generated DOM elements) in plugin construtctor, what simplifies parameters passing a lot   

  let specialPicksEventsAspect = SpecialPicksEventsAspect();
  let choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
  let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
  let resetFilterAspect = ResetFilterAspect(filterDom, resetFilterListAspect);
  let focusInAspect = FocusInAspect(picksDom);
  let buildPickAspect = BuildPickAspect(picksDom, pickDomFactory);
  let producePickAspect = ProducePickAspect(picksList, removePickAspect, buildPickAspect);
  let createPickHandlersAspect = CreatePickHandlersAspect(producePickAspect);
  let optionToggleAspect = OptionToggleAspect(createPickHandlersAspect, addPickAspect);
  let fullMatchAspect = FullMatchAspect(createPickHandlersAspect, addPickAspect);
  let inputAspect = InputAspect(filterDom, filterManagerAspect, fullMatchAspect);
  let choiceClickAspect = ChoiceClickAspect(optionToggleAspect, filterDom);
  let buildChoiceAspect = BuildChoiceAspect(choicesDom, choiceDomFactory, choiceClickAspect);
  let buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(buildChoiceAspect);
  let resetLayoutAspect = ResetLayoutAspect(() => resetFilterAspect.resetFilter());
  let optionAttachAspect = OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps);
  let optionsLoopAspect = OptionsLoopAspect(optionsAspect, optionAttachAspect);
  let updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect);
  let updateAspect = UpdateAspect(updateDataAspect);
  let loadAspect = LoadAspect(optionsLoopAspect);
  let picksElementAspect = PicksElementAspect(picksDom.picksElement);
  let afterInputAspect = AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect);
  let multiSelectInlineLayoutAspect = MultiSelectInlineLayoutAspect(environment, filterDom, choicesDom, choicesVisibilityAspect, hoveredChoiceAspect, navigateAspect, filterManagerAspect, focusInAspect, optionToggleAspect, createPickHandlersAspect, picksList, inputAspect, specialPicksEventsAspect, buildChoiceAspect, resetLayoutAspect, picksElementAspect, afterInputAspect, disposeAspect);
  pluginManager.layout({
    staticDom,
    picksDom,
    choicesDom,
    filterDom,
    resetLayoutAspect,
    choicesVisibilityAspect,
    staticManager,
    buildChoiceAspect,
    optionToggleAspect,
    choiceClickAspect,
    buildAndAttachChoiceAspect,
    optionsLoopAspect,
    optionAttachAspect,
    buildPickAspect,
    producePickAspect,
    createPickHandlersAspect,
    inputAspect,
    resetFilterListAspect,
    resetFilterAspect,
    specialPicksEventsAspect,
    resetLayoutAspect,
    focusInAspect,
    loadAspect,
    updateDataAspect,
    updateAspect,
    fullMatchAspect,
    picksElementAspect,
    afterInputAspect,
    multiSelectInlineLayoutAspect
  });
  multiSelectInlineLayoutAspect.init();
  pluginManager.attach();
  let api = {
    component: "BsMultiSelect.api"
  }; // key to use in memory leak analyzes

  pluginManager.buildApi(api); // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?

  api.dispose = composeSync(resetLayoutAspect.resetLayout, () => {
    disposeAspect.dispose();
  }, pluginManager.dispose, () => {
    picksList.forEach(pick => pick.dispose());
  }, wraps.dispose, staticManager.dispose, picksDom.dispose, filterDom.dispose);

  api.updateData = () => {
    updateDataAspect.updateData();
  };

  api.update = () => {
    updateAspect.update();
  }; // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}


  onInit == null ? void 0 : onInit(api, pluginManager.aspects);
  picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
  picksDom.picksElement.appendChild(picksDom.pickFilterElement);
  staticManager.appendToContainer();
  loadAspect.load();
  return api;
}

function ComposePluginManagerFactory(plugins, defaults) {
  let buildAspectsList = [];

  for (let i = 0; i < plugins.length; i++) {
    let buildAspects = plugins[i].value(defaults);

    if (buildAspects) {
      buildAspectsList.push({
        key: plugins[i].key,
        value: buildAspects
      });
    }
  }

  return (configuration, settings) => {
    let eventHandlers = [];
    let aspects = {};

    for (let i = 0; i < buildAspectsList.length; i++) {
      let events = buildAspectsList[i].value.buildAspects(aspects, configuration, settings);

      if (events) {
        eventHandlers.push({
          key: buildAspectsList[i].key,
          value: events
        });
      }
    }

    return PluginManager(aspects, eventHandlers);
  };
}
function PluginManager(aspects, eventHandlers) {
  let instances = [];
  let disposes = [];
  return {
    aspects,

    // TODO: hide
    buildApi(api) {
      for (let i = 0; i < instances.length; i++) {
        var _instances$i$buildApi, _instances$i;

        let dispose = (_instances$i$buildApi = (_instances$i = instances[i]).buildApi) == null ? void 0 : _instances$i$buildApi.call(_instances$i, api);
        if (dispose) disposes.push(dispose);
      }
    },

    dispose() {
      for (let i = 0; i < disposes.length; i++) {
        disposes[i]();
      }

      disposes = null;

      for (let i = 0; i < instances.length; i++) {
        var _instances$i$dispose, _instances$i2;

        (_instances$i$dispose = (_instances$i2 = instances[i]).dispose) == null ? void 0 : _instances$i$dispose.call(_instances$i2);
      }

      instances = null;
    },

    plugStaticDomFactories(newAspects) {
      extendIfUndefined(aspects, newAspects);

      for (let i = 0; i < eventHandlers.length; i++) {
        var _eventHandlers$i$valu, _eventHandlers$i$valu2;

        (_eventHandlers$i$valu = (_eventHandlers$i$valu2 = eventHandlers[i].value).plugStaticDomFactories) == null ? void 0 : _eventHandlers$i$valu.call(_eventHandlers$i$valu2, aspects);
      }
    },

    plugStaticDom(newAspects) {
      extendIfUndefined(aspects, newAspects);

      for (let i = 0; i < eventHandlers.length; i++) {
        var _eventHandlers$i$valu3, _eventHandlers$i$valu4;

        (_eventHandlers$i$valu3 = (_eventHandlers$i$valu4 = eventHandlers[i].value).plugStaticDom) == null ? void 0 : _eventHandlers$i$valu3.call(_eventHandlers$i$valu4, aspects);
      }
    },

    layout(newAspects) {
      extendIfUndefined(aspects, newAspects);

      if (eventHandlers) {
        // TODO: complete to full bus event system
        for (let i = 0; i < eventHandlers.length; i++) {
          let a = eventHandlers[i].value;

          if (a.plugStaticDomBus) {
            if (eventHandlers.some(c => c.key === a.plugStaticDomBus.after)) a.plugStaticDomBus.plugStaticDom == null ? void 0 : a.plugStaticDomBus.plugStaticDom(aspects);
          }
        }

        for (let i = 0; i < eventHandlers.length; i++) {
          var _eventHandlers$i$valu5, _eventHandlers$i$valu6;

          let instance = (_eventHandlers$i$valu5 = (_eventHandlers$i$valu6 = eventHandlers[i].value).layout) == null ? void 0 : _eventHandlers$i$valu5.call(_eventHandlers$i$valu6, aspects);
          if (instance) instances.push(instance);
        }
      }
    },

    attach() {
      if (eventHandlers) for (let i = 0; i < eventHandlers.length; i++) {
        var _eventHandlers$i$valu7, _eventHandlers$i$valu8;

        (_eventHandlers$i$valu7 = (_eventHandlers$i$valu8 = eventHandlers[i].value).attach) == null ? void 0 : _eventHandlers$i$valu7.call(_eventHandlers$i$valu8, aspects);
      }
    }

  };
}

const transformStyles = [{
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
const transformClasses = [{
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
function adjustLegacySettings(settings) {
  if (!settings.css) settings.css = {};
  var css = settings.css;
  if (!settings.cssPatch) settings.cssPatch = {};
  var cssPatch = settings.cssPatch;

  if (settings.selectedPanelFocusBorderColor || settings.selectedPanelFocusBoxShadow) {
    console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - cssPatch:{picks_focus:{borderColor:'myValue', boxShadow:'myValue'}}");

    if (!cssPatch.picks_focus) {
      cssPatch.picks_focus = {
        boxShadow: settings.selectedPanelFocusBoxShadow,
        borderColor: settings.selectedPanelFocusBorderColor
      };
    }

    delete settings.selectedPanelFocusBorderColor;
    delete settings.selectedPanelFocusBoxShadow;
  }

  transformStyles.forEach(i => {
    if (settings[i.old]) {
      console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - cssPatch:{${i.opt}:{${i.style}:'myValue'}}`);

      if (!settings[i.opt]) {
        let opt = {};
        opt[i.style] = settings[i.old];
        settings.cssPatch[i.opt] = opt;
      }

      delete settings[i.old];
    }
  });
  transformClasses.forEach(i => {
    if (settings[i.old]) {
      console.log(`DashboarCode.BsMultiSelect: ${i.old} is depricated, use - css:{${i.opt}:'myValue'}`);

      if (!css[i.opt]) {
        css[i.opt] = settings[i.old];
      }

      delete settings[i.old];
    }
  });

  if (settings.inputColor) {
    console.log("DashboarCode.BsMultiSelect: inputColor is depricated, remove parameter");
    delete settings.inputColor;
  }

  if (settings.useCss) {
    console.log("DashboarCode.BsMultiSelect: 'useCss: true' is depricated, use - 'useCssPatch: false'");

    if (!css.pick_disabled) {
      settings.useCssPatch = !settings.useCss;
    }

    delete settings.useCss;
  }

  if (settings.getIsValid || settings.getIsInValid) {
    throw "DashboarCode.BsMultiSelect: parameters getIsValid and getIsInValid are depricated and removed, use - getValidity that should return (true|false|null) ";
  }
}

function MultiSelectBuilder(environment, plugins, defaultCss) {
  const defaults = {
    containerClass: "dashboardcode-bsmultiselect",
    css: defaultCss
  };
  var pluginManagerFactory = ComposePluginManagerFactory(plugins, defaults);

  let create = (element, options) => {
    var _options2;

    if (options && options.plugins) console.log("DashboarCode.BsMultiSelect: 'options.plugins' is depricated, use - MultiSelectBuilder(environment, plugins) instead");
    let buildConfiguration;

    if (options instanceof Function) {
      buildConfiguration = options;
      options = null;
    } else {
      var _options;

      buildConfiguration = (_options = options) == null ? void 0 : _options.buildConfiguration;
    }

    if (options) {
      adjustLegacySettings(options);
    }

    let configuration = {}; // TODO: move to each plugin that add css (as plugMergeSettings) 

    configuration.css = createCss(defaults.css, (_options2 = options) == null ? void 0 : _options2.css);
    var pluginManager = pluginManagerFactory(configuration, options); // merge settings.cssPatch and defaults.cssPatch

    extendIfUndefined(configuration, options);
    extendIfUndefined(configuration, defaults);
    let onInit = buildConfiguration == null ? void 0 : buildConfiguration(element, configuration); // TODO: configuration should become an aspect

    let multiSelect = BsMultiSelect(element, environment, pluginManager, configuration, onInit); // onInit(api, aspects) - before load data

    return multiSelect;
  };

  return {
    create,
    defaultSettings: defaults
  };
}

function ModuleFactory$1(environment, customizationPlugins, defaultCss) {
  if (!environment.trigger) environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name));
  let multiSelectPluginsObj = shallowClearClone(customizationPlugins, multiSelectPlugins);
  let pluginsArray = ObjectValuesEx(multiSelectPluginsObj);
  let {
    create: BsMultiSelect,
    BsMultiSelectDefault
  } = MultiSelectBuilder(environment, pluginsArray, defaultCss);
  BsMultiSelect.Default = BsMultiSelectDefault;
  let picksPluginsObj = shallowClearClone(customizationPlugins, picksPlugins);
  let picksPluginsArray = ObjectValuesEx(picksPluginsObj);
  let {
    create: BsPicks,
    BsPicksDefault
  } = MultiSelectBuilder(environment, picksPluginsArray, defaultCss);
  BsPicks.Default = BsPicksDefault;
  return {
    BsMultiSelect,
    BsPicks,
    MultiSelectTools: {
      MultiSelectBuilder,
      plugins: shallowClearClone(customizationPlugins, allPlugins),
      defaultCss,
      utilities
    }
  };
} // TEST
// function areValidElements(...args) {
//     const result = Object.values(obj);
//     return !args.some(
//       (element) =>
//         !(element && typeof element.getBoundingClientRect === 'function')
//     );
// }
// function ModuleFactory(environment) {
//     if (!environment.trigger)
//         environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))
//     let pluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, multiSelectPlugins));
//     let {create: BsMultiSelect, BsMultiSelectDefault} = MultiSelectBuilder(environment, pluginsArray) 
//     BsMultiSelect.Default = BsMultiSelectDefault;
//     let picksPluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, picksPlugins));
//     let {create: BsPicks, BsPicksDefault} = MultiSelectBuilder(environment, picksPluginsArray) 
//     BsPicks.Default = BsPicksDefault;
//     return {
//         BsMultiSelect,
//         BsPicks,
//         MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone({Bs5Plugin}, allPlugins), utilities} 
//     }
// }

const defaultCss = createDefaultCssBs5();

function ModuleFactory(environment) {
  return ModuleFactory$1(environment, Bs4PluginSet, defaultCss);
}

function legacyConstructor(element, environment, settings) {
  console.log("DashboarCode.BsMultiSelect: 'BsMultiSelect' is depricated, use - ModuleFactory(environment).BsMultiSelect(element, settings)");
  var {
    BsMultiSelect
  } = ModuleFactory(environment);
  var bsMultiSelect = BsMultiSelect(element, settings);
  return bsMultiSelect;
}

export { legacyConstructor as BsMultiSelect, ModuleFactory };
//# sourceMappingURL=BsMultiSelect.esm.js.map
