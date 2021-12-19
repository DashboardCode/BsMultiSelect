/*!
  * BsMultiSelect v1.2.0-beta.27 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2021 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under Apache 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
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
}
function PickDomFactory(css, createElementAspect, dataWrap) {
  return {
    create(pick) {
      let wrap = pick.wrap;
      let {
        pickDom,
        pickDomManagerHandlers
      } = pick;
      let pickElement = pickDom.pickElement;
      let pickContentElement = createElementAspect.createElement('SPAN');
      pickElement.appendChild(pickContentElement);
      pickDom.pickContentElement = pickContentElement;

      pickDomManagerHandlers.updateData = () => {
        // this is not a generic because there could be more then one text field.
        pickContentElement.textContent = dataWrap.getText(wrap.option);
      };

      addStyling(pickContentElement, css.pickContent);
      pick.dispose = composeSync(pick.dispose, () => {
        pickDom.pickContentElement = null;
        pickDomManagerHandlers.updateData = null;
      });
      pickDomManagerHandlers.updateData(); // set visual text
    }

  };
}

function buildDom(choiceElement, choiceDom, createElementAspect, css) {
  createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
  let choiceContentElement = choiceElement.querySelector('DIV');
  let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
  let choiceLabelElement = choiceContentElement.querySelector('LABEL');
  choiceDom.choiceContentElement = choiceContentElement;
  choiceDom.choiceCheckBoxElement = choiceCheckBoxElement;
  choiceDom.choiceLabelElement = choiceLabelElement;
  addStyling(choiceContentElement, css.choiceContent);
  addStyling(choiceCheckBoxElement, css.choiceCheckBox);
  addStyling(choiceLabelElement, css.choiceLabel);
}

function buidDisabled(choiceDom, choiceDomManagerHandlers, css, wrap) {
  let choiceDisabledToggle = toggleStyling(choiceDom.choiceElement, css.choice_disabled);
  let choiceCheckBoxDisabledToggle = toggleStyling(choiceDom.choiceCheckBoxElement, css.choiceCheckBox_disabled);
  let choiceLabelDisabledToggle = toggleStyling(choiceDom.choiceLabelElement, css.choiceLabel_disabled);
  let choiceCursorDisabledToggle = toggleStyling(choiceDom.choiceElement, {
    classes: [],
    styles: {
      cursor: "default"
    }
  });

  let updateDisabled = function () {
    choiceDisabledToggle(wrap.isOptionDisabled);
    choiceCheckBoxDisabledToggle(wrap.isOptionDisabled);
    choiceLabelDisabledToggle(wrap.isOptionDisabled); // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"

    let isCheckBoxDisabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
    choiceDom.choiceCheckBoxElement.disabled = isCheckBoxDisabled;
    choiceCursorDisabledToggle(isCheckBoxDisabled);
  };

  choiceDomManagerHandlers.updateDisabled = updateDisabled;
}

function ChoiceDomFactory(css, createElementAspect, dataWrap) {
  //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
  return {
    create(choice) {
      let wrap = choice.wrap;
      let {
        choiceDom,
        choiceDomManagerHandlers
      } = choice;
      let choiceElement = choice.choiceDom.choiceElement;
      buildDom(choiceElement, choiceDom, createElementAspect, css); // --- --- --- ---

      let choiceHoverToggle = toggleStyling(choiceElement, () => wrap.isOptionDisabled === true && css.choice_disabled_hover && wrap.isOptionSelected === false ? css.choice_disabled_hover : css.choice_hover); //let choiceHoverToggle2 = toggleStyling(choiceElement, css.choice_disabled_hover, css.choice_hover);

      choiceDomManagerHandlers.updateHoverIn = () => choiceHoverToggle(choice.isHoverIn);

      let choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);

      let updateSelected = function () {
        choiceSelectedToggle(wrap.isOptionSelected);
        choiceDom.choiceCheckBoxElement.checked = wrap.isOptionSelected;

        if (wrap.isOptionDisabled || choice.isHoverIn) {
          choiceHoverToggle(choice.isHoverIn, true); // choiceHoverToggle2(
          //     choice.isHoverIn?(wrap.isOptionDisabled?1:2):0
          // );
        }
      };

      choiceDomManagerHandlers.updateSelected = updateSelected; // --- --- --- ---

      buidDisabled(choiceDom, choiceDomManagerHandlers, css, wrap);

      choiceDomManagerHandlers.updateData = () => {
        choiceDom.choiceLabelElement.textContent = dataWrap.getText(wrap.option);
      }; //updateDataInternal(wrap, choiceLabelElement, dataWrap);


      choiceDomManagerHandlers.updateData();
      let eventBinder = EventBinder();
      eventBinder.bind(choiceElement, "click", event => choice.choiсeClick(event));
      composeSync(choice.dispose, () => {
        eventBinder.unbind();
        choiceDomManagerHandlers.updateData = null;
        choiceDomManagerHandlers.updateHoverIn = null;
        choiceDomManagerHandlers.updateSelected = null;
        choiceDomManagerHandlers.updateDisabled = null;
        choiceDom.choiceContentElement = null;
        choiceDom.choiceCheckBoxElement = null;
        choiceDom.choiceLabelElement = null;
      });
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
  ChoiceDomFactoryPlugCss(css);
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
  cssPatch.choice_hover = 'bg-light text-primary';
}

function StaticDomFactory(staticDom) {
  return {
    createStaticDom() {
      let {
        createElementAspect,
        initialElement,
        containerClass
      } = staticDom;
      let containerElement, picksElement;
      let removableContainerClass = false;

      if (initialElement.tagName == 'DIV') {
        containerElement = initialElement;

        if (!containerElement.classList.contains(containerClass)) {
          containerElement.classList.add(containerClass);
          removableContainerClass = true;
        }

        picksElement = findDirectChildByTagName(containerElement, 'UL');
      } else if (initialElement.tagName == 'UL') {
        picksElement = initialElement;
        containerElement = closestByClassName(initialElement, containerClass);

        if (!containerElement) {
          throw new Error('BsMultiSelect: defined on UL but precedentant DIV for container not found; class=' + containerClass);
        }
      } else if (initialElement.tagName == "INPUT") {
        throw new Error('BsMultiSelect: INPUT element is not supported');
      }

      let isDisposablePicksElementFlag = false;

      if (!picksElement) {
        picksElement = createElementAspect.createElement('UL');
        isDisposablePicksElementFlag = true;
      }

      staticDom.containerElement = containerElement;
      staticDom.isDisposablePicksElementFlag = isDisposablePicksElementFlag;
      staticDom.picksElement = picksElement;
      return {
        staticManager: {
          appendToContainer() {
            let {
              containerElement,
              isDisposablePicksElementFlag,
              choicesDom,
              picksDom,
              filterDom
            } = staticDom;
            picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
            picksDom.picksElement.appendChild(picksDom.pickFilterElement);
            containerElement.appendChild(choicesDom.choicesElement);
            if (isDisposablePicksElementFlag) containerElement.appendChild(picksDom.picksElement);
          },

          dispose() {
            let {
              containerElement,
              containerClass,
              isDisposablePicksElementFlag,
              choicesDom,
              picksDom,
              filterDom
            } = staticDom;
            containerElement.removeChild(choicesDom.choicesElement);
            if (removableContainerClass) containerElement.classList.remove(containerClass);
            if (isDisposablePicksElementFlag) containerElement.removeChild(picksDom.picksElement);
            picksDom.dispose();
            filterDom.dispose();
          }

        }
      };
    }

  };
}

function CreateElementAspect(createElement, createElementFromHtml, createElementFromHtmlPutAfter) {
  return {
    createElement,
    createElementFromHtml,
    createElementFromHtmlPutAfter
  };
}

function PicksDomFactory(staticDom) {
  return {
    create() {
      var {
        picksElement,
        isDisposablePicksElementFlag,
        css,
        createElementAspect
      } = staticDom;
      var pickFilterElement = createElementAspect.createElement('LI');
      addStyling(picksElement, css.picks);
      addStyling(pickFilterElement, css.pickFilter);
      let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
      let focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
      let isFocusIn = false;
      return {
        picksElement,
        isDisposablePicksElementFlag,
        pickFilterElement,

        createPickElement() {
          var pickElement = createElementAspect.createElement('LI');
          addStyling(pickElement, css.pick);
          return {
            pickElement,
            attach: beforeElement => picksElement.insertBefore(pickElement, beforeElement ?? pickFilterElement),
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
          if (!isDisposablePicksElementFlag) {
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
  cssPatch.pick = {
    paddingLeft: '0',
    paddingRight: '.5rem',
    paddingInlineStart: '0',
    paddingInlineEnd: '0.5rem'
  };
}

function PicksDomFactoryPlugCssPatchBs4(cssPatch) {
  PicksDomFactoryPlugCssPatch(cssPatch); // TODO: this is done for button and should be moved to button plugin
  //cssPatch.pick.lineHeight = '1.5em';

  cssPatch.pick.paddingTop = '0.35em';
  cssPatch.pick.paddingBottom = '0.35em';
}
function PicksDomFactoryPlugCssPatchBs5(cssPatch) {
  PicksDomFactoryPlugCssPatch(cssPatch); // TODO: this is done for button and should be moved to button plugin

  cssPatch.pick.color = 'var(--bs-dark)';
}

function FilterDomFactory(staticDom) {
  return {
    create() {
      let {
        isDisposablePicksElementFlag,
        css,
        createElementAspect
      } = staticDom;
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

          if (!isDisposablePicksElementFlag) {
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

function ChoicesDomFactory(staticDom) {
  return {
    create() {
      let {
        css,
        createElementAspect
      } = staticDom;
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

function OnChangeAspect(staticDom, name) {
  return {
    onChange() {
      staticDom.trigger(name);
    }

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
        wrap.choice.choiceDomManagerHandlers.setVisible(true);
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
        wrap.choice.choiceDomManagerHandlers.setVisible(v);
      });
    }

  };
}

function BuildAndAttachChoiceAspect(produceChoiceAspect) {
  return {
    buildAndAttachChoice(wrap, getNextElement) {
      produceChoiceAspect.produceChoice(wrap);
      wrap.choice.choiceDomManagerHandlers.attach(getNextElement?.());
    }

  };
}
function ProduceChoiceAspect(choicesDom, choiceDomFactory) {
  return {
    // 1 overrided in highlight and option disable plugins
    // 2 call in HiddenPlugin (create)
    // 3 overrided in layout: pick created, choice.choiceDomManagerHandlers.detach updated to remove pick
    produceChoice(wrap) {
      var {
        choiceElement,
        attach,
        detach,
        setVisible
      } = choicesDom.createChoiceElement();
      let choice = wrap.choice;
      choice.wrap = wrap;
      choice.choiceDom = {
        choiceElement
      };
      let choiceDomManagerHandlers = {
        attach,
        detach,
        setVisible // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item

      };
      choice.choiceDomManagerHandlers = choiceDomManagerHandlers;
      choiceDomFactory.create(choice); // added by "navigation (by mouse and arrows) plugin"

      choice.isHoverIn = false; // internal state

      choice.setHoverIn = v => {
        choice.isHoverIn = v;
        choiceDomManagerHandlers.updateHoverIn();
      };

      choice.dispose = composeSync(() => {
        choice.choiceDom.choiceElement = null;
        choice.choiceDom = null;
        choiceDomManagerHandlers.attach = null;
        choiceDomManagerHandlers.detach = null;
        choiceDomManagerHandlers.setVisible = null;
        choice.choiceDomManagerHandlers = null;
        choice.choiсeClick = null;
        choice.setHoverIn = null;
        choice.wrap = null;
        choice.dispose = null;
      }, choice.dispose);

      wrap.dispose = () => {
        choice.dispose();
        wrap.dispose = null;
      };

      return choice;
    }

  };
}

function OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps) {
  return {
    attach(option) {
      let wrap = createWrapAspect.createWrap(option);
      wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
      wraps.push(wrap); // note: before attach because attach need it for navigation management

      buildAndAttachChoiceAspect.buildAndAttachChoice(wrap); //wraps.push(wrap);
    }

  };
}
function OptionsLoopAspect(dataWrap, optionAttachAspect) {
  return {
    loop() {
      let options = dataWrap.getOptions();

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

// no overrides (not an aspect, just )
function CreateChoiceBaseAspect(dataWrap) {
  return {
    createChoiceBase(option) {
      return {
        // navigation and filter support
        filteredPrev: null,
        filteredNext: null,
        searchText: dataWrap.getText(option).toLowerCase().trim(),
        // TODO make an index abstraction
        // internal state handlers, so they do not have "update semantics"
        isHoverIn: false,
        setHoverIn: null,
        choiceDom: null,
        itemPrev: null,
        itemNext: null,
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

function ProducePickAspect(picksDom, pickDomFactory) {
  return {
    // overrided by DisableOptionPlugin
    producePick(wrap) {
      let {
        pickElement,
        attach,
        detach
      } = picksDom.createPickElement();
      let pickDom = {
        pickElement
      };
      let pickDomManagerHandlers = {
        attach,
        detach
      };
      let pick = {
        wrap,
        pickDom,
        pickDomManagerHandlers,
        dispose: () => {
          detach();
          pickDom.pickElement = null;
          pickDomManagerHandlers.attach = null;
          pick.wrap = null;
          pick.pickDom = null;
          pick.pickDomManagerHandlers = null;
        }
      };
      wrap.pick = pick;
      pickDomFactory.create(pick);
      pick.pickDomManagerHandlers.attach();
      return pick;
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

function InputAspect(filterDom, filterManagerAspect) {
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
          let text = filterManagerAspect.getFilter();

          if (fullMatchWrap.choice.searchText == text) {
            let success = fullMatchWrap.choice.fullMatch();

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

function MultiSelectInlineLayoutAspect(environment, filterDom, choicesDom, choicesVisibilityAspect, hoveredChoiceAspect, navigateAspect, filterManagerAspect, focusInAspect, picksList, inputAspect, specialPicksEventsAspect, produceChoiceAspect, resetLayoutAspect, picksElementAspect, afterInputAspect, disposeAspect, pickDomFactory) {
  //return  
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

  var skipoutMousedown = function () {
    setSkipFocusout();
  }; // add listeners that manages close dropdown on  click outside container


  var choicesElementMousedownEventTumbler = EventTumbler(choicesElement, "mousedown", skipoutMousedown);
  var documentMouseupEventTumbler = EventTumbler(document, "mouseup", documentMouseup);

  var documentMouseup = function (event) {
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

  var preventDefaultClickEvent = null; // state

  function setPreventDefaultClickEvent(event) {
    preventDefaultClickEvent = event;
  } // TODO: remove setTimeout: set on start of mouse event reset on end


  function skipoutAndResetMousedown() {
    skipoutMousedown();
    window.setTimeout(() => resetSkipFocusout());
  } // function composeOnRemoveButtonEventHandler(onRemove, setSelectedFalse){
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
  // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
  // never remove elements in the same event iteration


  function composeOnRemoveButtonEventHandler(removeOnButton) {
    return event => {
      window.setTimeout(() => removeOnButton(event));
      setPreventDefaultClickEvent(event);
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
    let choiceElement = wrap.choice.choiceDom.choiceElement; // in chrome it happens on "become visible" so we need to skip it, 
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
      let wasToggled = hoveredWrap.choice.tryToggleChoice();

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
    layout() {
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
      var origCreatePickDomFactory = pickDomFactory.create;

      pickDomFactory.create = pick => {
        origCreatePickDomFactory(pick);

        if (pick.removeOnButton) {
          var origRemoveOnButton = pick.removeOnButton;
          pick.removeOnButton = composeOnRemoveButtonEventHandler(origRemoveOnButton);
        }
      };

      let origProduceChoice = produceChoiceAspect.produceChoice;

      produceChoiceAspect.produceChoice = wrap => {
        origProduceChoice(wrap);
        var pickHandlers = wrap.choice.addPickForChoice(); // note pickHandlers.removeAndDispose not exist (till produce is created)

        wrap.choice.choiceDomManagerHandlers.detach = composeSync(wrap.choice.choiceDomManagerHandlers.detach, () => {
          if (pickHandlers.removeAndDispose) {
            pickHandlers.removeAndDispose();
            pickHandlers.removeAndDispose = null;
          }
        });
        wrap.choice.choiсeClick = composeSync(wrap.choice.choiсeClick, () => filterDom.setFocus());
        let unbindChoiceElement = adoptChoiceElement(wrap);
        wrap.choice.dispose = composeSync(unbindChoiceElement, wrap.choice.dispose);
      };

      disposeAspect.dispose = composeSync(disposeAspect.dispose, resetMouseCandidateChoice, () => picksElementAspect.unbind());
    }

  };
}

function ResetLayoutAspect(resetFilterAspect) {
  return {
    resetLayout() {
      resetFilterAspect.resetFilter();
    }

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

function CountableChoicesListInsertAspect(wrapsCollection, countableChoicesList) {
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

function ShowErrorAspect(staticDom) {
  return {
    showError(error) {
      let {
        createElementAspect,
        initialElement
      } = staticDom;
      let errorElement = createElementAspect.createElement('SPAN');
      errorElement.style.backgroundColor = 'red';
      errorElement.style.color = 'white';
      errorElement.style.block = 'inline-block';
      errorElement.style.padding = '0.2rem 0.5rem';
      errorElement.textContent = 'BsMultiSelect ' + error.toString();
      initialElement.parentNode.insertBefore(errorElement, initialElement.nextSibling);
    }

  };
}

function BsMultiSelect(initialElement, environment, pluginManager, configuration) {
  let {
    css,
    getText,
    containerClass,
    options
  } = configuration;
  let {
    trigger
  } = environment;
  let createElementAspect = CreateElementAspect(name => environment.window.document.createElement(name), (element, html) => element.innerHTML = html, (element, html) => {
    var newElement = new environment.window.DOMParser().parseFromString(html, 'text/html').body.children[0];
    element.parentNode.insertBefore(newElement, element.nextSibling);
  });
  let dataWrap = {};
  let staticDom = {
    initialElement,
    css,
    createElementAspect,
    containerClass
  };
  let staticDomFactory = StaticDomFactory(staticDom);
  let picksDomFactory = PicksDomFactory(staticDom);
  let filterDomFactory = FilterDomFactory(staticDom);
  let choicesDomFactory = ChoicesDomFactory(staticDom);

  dataWrap.getText = getText ?? (option => option.text);

  dataWrap.getOptions = () => options;

  staticDom.trigger = eventName => trigger(initialElement, eventName);

  let pickDomFactory = PickDomFactory(css, staticDom.createElementAspect, dataWrap); // overrided in CustomPickStylingsPlugin, DisableComponentPlugin

  let choiceDomFactory = ChoiceDomFactory(css, staticDom.createElementAspect, dataWrap); // overrided in CustomChoicesStylingsPlugin, HighlightPlugin

  staticDom.environment = environment;
  staticDom.showErrorAspect = ShowErrorAspect(staticDom);

  try {
    let eventHandlers = pluginManager.createHandlers();
    return BsMultiSelectImpl(dataWrap, staticDom, staticDomFactory, picksDomFactory, filterDomFactory, choicesDomFactory, pickDomFactory, choiceDomFactory, eventHandlers);
  } catch (error) {
    staticDom.showErrorAspect.showError(error);
    throw error;
  }
}
function BsMultiSelectImpl(dataWrap, staticDom, staticDomFactory, picksDomFactory, filterDomFactory, choicesDomFactory, pickDomFactory, choiceDomFactory, eventHandlers) {
  let onChangeAspect = OnChangeAspect(staticDom, 'dashboardcode.multiselect:change');
  let disposeAspect = {
    dispose() {}

  };
  eventHandlers.dom({
    showErrorAspect: staticDom.showErrorAspect,
    environment: staticDom.environment,
    onChangeAspect,
    disposeAspect,
    staticDomFactory,
    choicesDomFactory,
    filterDomFactory,
    picksDomFactory,
    staticDom,
    dataWrap
  }); // --- --- --- --- --- --- --- --- --- --- --- --- --- ---

  let {
    staticManager
  } = staticDomFactory.createStaticDom();
  let choicesDom = choicesDomFactory.create();
  let picksDom = picksDomFactory.create();
  let filterDom = filterDomFactory.create();
  staticDom.choicesDom = choicesDom;
  staticDom.picksDom = picksDom;
  staticDom.filterDom = filterDom; // --- --- --- --- --- --- --- --- --- --- --- --- --- ---

  let producePickAspect = ProducePickAspect(picksDom, pickDomFactory);
  let picksList = List();
  let produceChoiceAspect = ProduceChoiceAspect(choicesDom, choiceDomFactory);
  let wrapsCollection = ArrayFacade();
  let countableChoicesList = DoublyLinkedList(wrap => wrap.choice.itemPrev, (warp, v) => warp.choice.itemPrev = v, wrap => wrap.choice.itemNext, (wrap, v) => wrap.choice.itemNext = v);
  let countableChoicesListInsertAspect = CountableChoicesListInsertAspect(wrapsCollection, countableChoicesList);
  let wraps = Wraps(wrapsCollection, () => countableChoicesList.reset(), w => countableChoicesList.remove(w), (w, key) => countableChoicesListInsertAspect.countableChoicesListInsert(w, key)); // !!!!!!!!!!!
  //let createChoiceHandlersAspect = CreateChoiceHandlersAspect(produceChoiceAspect, wraps);

  let createWrapAspect = CreateWrapAspect();
  let createChoiceBaseAspect = CreateChoiceBaseAspect(dataWrap); //let addPickAspect = AddPickAspect();
  //--------------------------

  let choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, wrap => wrap.choice.itemNext);
  let filteredChoicesList = DoublyLinkedList(wrap => wrap.choice.filteredPrev, (wrap, v) => wrap.choice.filteredPrev = v, wrap => wrap.choice.filteredNext, (wrap, v) => wrap.choice.filteredNext = v);
  let emptyNavigateManager = NavigateManager(countableChoicesList, wrap => wrap.choice.itemPrev, wrap => wrap.choice.itemNext);
  let filteredNavigateManager = NavigateManager(filteredChoicesList, wrap => wrap.choice.filteredPrev, wrap => wrap.choice.filteredNext);
  let filterPredicateAspect = FilterPredicateAspect();
  let filterManagerAspect = FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect);
  let hoveredChoiceAspect = HoveredChoiceAspect();
  let navigateAspect = NavigateAspect(hoveredChoiceAspect, (down, hoveredChoice) => filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice)); // TODO: union to events or create event bus

  eventHandlers.plugStaticDom({
    pickDomFactory,
    choiceDomFactory,
    countableChoicesList,
    countableChoicesListInsertAspect,
    wrapsCollection,
    choicesEnumerableAspect,
    filteredChoicesList,
    filterPredicateAspect,
    hoveredChoiceAspect,
    navigateAspect,
    filterManagerAspect,
    createWrapAspect,
    createChoiceBaseAspect,
    picksList,
    wraps,
    //addPickAspect,
    producePickAspect,
    produceChoiceAspect
  }); // apply selectElement support;  
  // TODO: to staticManager
  //let {staticManager, staticDom, filterDom, picksDom, choicesDom} = staticDomFactory.createStaticDom(); // overrided in SelectElementPlugin
  // after this we can use staticDom (means generated DOM elements) in plugin construtctor, what simplifies parameters passing a lot   

  let specialPicksEventsAspect = SpecialPicksEventsAspect();
  let resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
  let resetFilterAspect = ResetFilterAspect(filterDom, resetFilterListAspect);
  let focusInAspect = FocusInAspect(picksDom);
  let inputAspect = InputAspect(filterDom, filterManagerAspect
  /*, fullMatchAspect*/
  );
  let buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(produceChoiceAspect);
  let resetLayoutAspect = ResetLayoutAspect(resetFilterAspect); //!!!!!!!!!
  //createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps

  let optionAttachAspect = OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps);
  let optionsLoopAspect = OptionsLoopAspect(dataWrap, optionAttachAspect);
  let updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect);
  let loadAspect = LoadAspect(optionsLoopAspect); // !!!!!!!!!!!

  let updateAspect = UpdateAspect(updateDataAspect);
  let picksElementAspect = PicksElementAspect(picksDom.picksElement);
  let choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
  let afterInputAspect = AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect);
  let multiSelectInlineLayoutAspect = MultiSelectInlineLayoutAspect(staticDom.environment, filterDom, choicesDom, choicesVisibilityAspect, hoveredChoiceAspect, navigateAspect, filterManagerAspect, focusInAspect, picksList, inputAspect, specialPicksEventsAspect, produceChoiceAspect, resetLayoutAspect, picksElementAspect, afterInputAspect, disposeAspect, pickDomFactory);
  eventHandlers.layout({
    picksDom,
    choicesDom,
    filterDom,
    resetLayoutAspect,
    choicesVisibilityAspect,
    staticManager,
    buildAndAttachChoiceAspect,
    optionsLoopAspect,
    optionAttachAspect,
    inputAspect,
    resetFilterListAspect,
    resetFilterAspect,
    specialPicksEventsAspect,
    resetLayoutAspect,
    focusInAspect,
    loadAspect,
    updateDataAspect,
    updateAspect,
    picksElementAspect,
    afterInputAspect
  });
  multiSelectInlineLayoutAspect.layout(); // TODO: to staticManager

  eventHandlers.append();
  let api = {
    component: "BsMultiSelect.api",
    // key to use in memory leak analyzes
    updateData: () => {
      updateDataAspect.updateData();
    },
    update: () => {
      updateAspect.update();
    }
  };
  eventHandlers.buildApi(api); // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

  api.dispose = composeSync(resetLayoutAspect.resetLayout, () => {
    disposeAspect.dispose();
  }, eventHandlers.dispose, () => {
    picksList.forEach(pick => pick.dispose());
  }, wraps.dispose, staticManager.dispose, () => {
    staticDom.choicesDom = null;
    staticDom.picksDom = null;
    staticDom.filterDom = null;
  }); // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?        

  staticManager.appendToContainer();
  loadAspect.load();
  return api;
}

function parseEventHandler(key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes) {
  if (eventHandler) {
    if (eventHandler.dom) doms.push({
      key,
      value: eventHandler.dom
    });
    if (eventHandler.plugStaticDom) plugStaticDoms.push({
      key,
      value: eventHandler.plugStaticDom
    });
    if (eventHandler.preLayout) preLayouts.push({
      key,
      value: eventHandler.preLayout
    });
    if (eventHandler.layout) layouts.push({
      key,
      value: eventHandler.layout
    });
    if (eventHandler.append) appends.push({
      key,
      value: eventHandler.append
    });
    if (eventHandler.buildApi) buildApis.push({
      key,
      value: eventHandler.buildApi
    });
    if (eventHandler.dispose) disposes.push({
      key,
      value: eventHandler.dispose
    });
  }
}

function ComposePluginManagerFactory(plugins, defaults, environment) {
  let plugedList = [];
  let mergeList = [];

  for (let i = 0; i < plugins.length; i++) {
    let pluged = plugins[i].value(defaults, environment);

    if (pluged) {
      if (pluged.plug) plugedList.push({
        key: plugins[i].key,
        value: pluged.plug
      });
      if (pluged.merge) mergeList.push({
        key: plugins[i].key,
        value: pluged.merge
      });
    }
  }

  return (configuration, settings, inlineBuildAspects) => {
    let buildAspectsList = [];

    for (let i = 0; i < mergeList.length; i++) {
      let merge = mergeList[i].value;

      if (merge) {
        merge(configuration, settings);
      }
    }

    for (let j = 0; j < plugedList.length; j++) {
      let buildAspects = plugedList[j].value(configuration);

      if (buildAspects) {
        buildAspectsList.push({
          key: plugedList[j].key,
          value: buildAspects
        });
      }
    }

    if (inlineBuildAspects) buildAspectsList.push({
      key: "",
      value: inlineBuildAspects
    });
    return PluginManager(environment, buildAspectsList);
  };
}
function PluginManager(environment, buildAspectsList) {
  let aspects = {
    environment
  };

  let createHandlers = newAspects => {
    extendIfUndefined(aspects, newAspects);
    var doms = [];
    var plugStaticDoms = [];
    var preLayouts = [];
    var layouts = [];
    var appends = [];
    var buildApis = [];
    let disposes = [];

    for (let k = 0; k < buildAspectsList.length; k++) {
      let eventHandler = buildAspectsList[k].value(aspects);
      parseEventHandler(buildAspectsList[k].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
    }

    return {
      dom(newAspects) {
        extendIfUndefined(aspects, newAspects);

        for (let i = 0; i < doms.length; i++) {
          var eventHandler = doms[i].value?.();
          parseEventHandler(doms[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }
      },

      plugStaticDom(newAspects) {
        extendIfUndefined(aspects, newAspects);

        for (let i = 0; i < plugStaticDoms.length; i++) {
          var eventHandler = plugStaticDoms[i].value?.();
          parseEventHandler(plugStaticDoms[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }
      },

      layout(newAspects) {
        extendIfUndefined(aspects, newAspects);

        for (let i = 0; i < preLayouts.length; i++) {
          let eventHandler = preLayouts[i].value?.();
          parseEventHandler(preLayouts[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }

        for (let j = 0; j < layouts.length; j++) {
          let eventHandler = layouts[j].value?.();
          parseEventHandler(layouts[j].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }
      },

      append() {
        for (let i = 0; i < appends.length; i++) {
          var eventHandler = appends[i].value?.();
          parseEventHandler(appends[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }
      },

      buildApi(api) {
        for (let i = 0; i < buildApis.length; i++) {
          var eventHandler = buildApis[i].value?.(api);
          parseEventHandler(buildApis[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }
      },

      dispose() {
        for (let i = 0; i < disposes.length; i++) {
          disposes[i].value?.();
        }
      }

    };
  };

  return {
    aspects,
    createHandlers
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

// TODO: defaultCss should come together with DomFactories and Layout 

function MultiSelectBuilder(environment, plugins, defaultCss) {
  const defaults = {
    containerClass: "dashboardcode-bsmultiselect",
    css: defaultCss
  };
  var pluginManagerFactory = ComposePluginManagerFactory(plugins, defaults, environment);
  /*  NOTE: about namings
      defaults - defaults for module 
      setting - object that could modify defaults (not just overwrite)
      options - configuration "generalization": can be buildConfiguration function or settings
      configuration - for control instance
  */

  let create = (element, options) => {
    if (options && options.plugins) console.log("DashboarCode.BsMultiSelect: 'options.plugins' is depricated, use - MultiSelectBuilder(environment, plugins) instead");
    let buildConfiguration;
    let settings;

    if (options instanceof Function) {
      buildConfiguration = options;
      settings = null;
    } else {
      buildConfiguration = options?.buildConfiguration;
      settings = options;
    }

    if (settings) {
      adjustLegacySettings(settings);
    }

    let configuration = {};
    configuration.css = createCss(defaults.css, settings?.css);
    extendIfUndefined(configuration, settings); // next line: merging of cssPatch will be delayed to the CssPatchPlugin merge handler

    extendIfUndefined(configuration, defaults);
    let inlineBuildAspectsList = buildConfiguration?.(element, configuration); // next line merges settings.cssPatch and defaults.cssPatch also merge defaults.css and defaults.cssPatch 

    var pluginManager = pluginManagerFactory(configuration, settings, inlineBuildAspectsList); // now we can freeze configuration object

    Object.freeze(configuration);
    let multiSelect = BsMultiSelect(element, environment, pluginManager, configuration);
    return multiSelect;
  };

  return {
    create,
    defaultSettings: defaults
  };
}

function createDefaultCssBs5() {
  var defaultCss = {};
  PickDomFactoryPlugCss(defaultCss);
  PicksDomFactoryPlugCss(defaultCss);
  ChoiceDomFactoryPlugCssBs5(defaultCss);
  ChoicesDomFactoryPlugCss(defaultCss);
  FilterDomFactoryPlugCss(defaultCss);
  return defaultCss;
}

function BsAppearancePlugin() {
  return {
    plug: plug$q
  };
}
function plug$q(configuration) {
  let getSizeComponentAspect = {};
  let getValidityComponentAspect = {};
  return aspects => {
    aspects.getSizeComponentAspect = getSizeComponentAspect;
    aspects.getValidityComponentAspect = getValidityComponentAspect;
    return {
      // TODO1, LabelElement should be moved to StaticDomFactory and staticDom 
      // NOTE: preLayout means first after createStaticDom
      preLayout: () => {
        var {
          getLabelAspect,
          staticDom
        } = aspects;
        var {
          selectElement
        } = staticDom;
        var {
          getDefaultLabel
        } = configuration;
        let origLabelAspectGetLabel = getLabelAspect.getLabel;

        getLabelAspect.getLabel = () => {
          var e = origLabelAspectGetLabel();
          if (e) return e;else {
            if (selectElement) {
              let labelElement = getDefaultLabel(selectElement);
              return labelElement;
            }
          }
        };
      },
      layout: () => {
        let {
          validationApiAspect,
          picksDom,
          staticDom,
          updateAppearanceAspect,
          floatingLabelAspect
        } = aspects;
        let {
          getValidity,
          getSize,
          useCssPatch,
          css,
          composeGetSize
        } = configuration;
        let {
          selectElement,
          initialElement
        } = staticDom;
        let isFloatingLabel = false;

        if (floatingLabelAspect) {
          isFloatingLabel = closestByClassName(initialElement, 'form-floating');

          floatingLabelAspect.isFloatingLabel = () => isFloatingLabel;
        }

        if (selectElement) {
          if (!getValidity) getValidity = composeGetValidity(selectElement);
          if (!getSize) getSize = composeGetSize(selectElement);
        } else {
          if (!getValidity) getValidity = () => null;
          if (!getSize) getSize = () => null;
        }

        getSizeComponentAspect.getSize = getSize;
        getValidityComponentAspect.getValidity = getValidity;
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
          var wasValidatedElement = closestByClassName(initialElement, 'was-validated');
          return wasValidatedElement ? true : false;
        };

        var wasUpdatedObservable = ObservableLambda(() => getWasValidated());
        var getManualValidationObservable = ObservableLambda(() => getValidity());
        var validationObservable = ObservableLambda(() => wasUpdatedObservable.getValue() ? validationApiAspect.getValue() : getManualValidationObservable.getValue());
        validationObservable.attach(value => {
          var {
            validMessages,
            invalidMessages
          } = getMessagesElements(staticDom.containerElement);
          updateValidity(picksDom.picksElement, validMessages, invalidMessages, value);
          picksDom.toggleFocusStyling();
        });
        wasUpdatedObservable.attach(() => validationObservable.call());
        if (validationApiAspect) validationApiAspect.attach(() => validationObservable.call());
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
  defaults.composeGetSize = composeGetSize$1; // BsAppearancePlugin

  defaults.getDefaultLabel = getDefaultLabel$1; // FloatingLabelPlugin, BsAppearancePlugin

  return BsAppearancePlugin();
}

function composeGetSize$1(element) {
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

function getDefaultLabel$1(element) {
  let value = null;
  let formGroup = closestByClassName(element, 'form-group');
  if (formGroup) value = formGroup.querySelector(`label[for="${element.id}"]`);
  return value;
}

function BsAppearanceBs5Plugin(defaults) {
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
      if (element.classList.contains('form-select-lg') || element.classList.contains('form-control-lg')) // changed for BS
        value = 'lg';else if (element.classList.contains('form-select-sm') || element.classList.contains('form-control-sm')) value = 'sm';
      return value;
    };
  }

  return getSize;
}

function getDefaultLabel(element) {
  let value = null;
  let query = `label[for="${element.id}"]`;
  let p1 = element.parentElement;
  value = p1.querySelector(query); // label can be wrapped into col-auto

  if (!value) {
    let p2 = p1.parentElement;
    value = p2.querySelector(query);
  }

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

function BsAppearanceBs5CssPatchPlugin(defaults) {
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
  cssPatch.picks_floating_def = {
    minHeight: 'calc(3.5rem + 2px)'
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
    plug: plug$p
  };
}
function plug$p(configuration) {
  var getLabelAspect = {
    getLabel: () => defCall(configuration.label)
  };
  var createFilterInputElementIdAspect = {
    createFilterInputElementId: () => defCall(configuration.filterInputElementId)
  };
  return aspects => {
    aspects.getLabelAspect = getLabelAspect;
    aspects.createFilterInputElementIdAspect = createFilterInputElementIdAspect;
    return {
      layout: () => {
        var {
          filterDom,
          loadAspect,
          disposeAspect,
          staticDom
        } = aspects;
        loadAspect.load = composeSync(loadAspect.load, () => {
          let {
            filterInputElement
          } = filterDom;
          let labelElement = getLabelAspect.getLabel();

          if (labelElement) {
            let backupedForAttribute = labelElement.getAttribute('for');
            var inputId = createFilterInputElementIdAspect.createFilterInputElementId();

            if (!inputId) {
              let {
                containerClass
              } = configuration;
              let {
                containerElement
              } = staticDom;
              inputId = `${containerClass}-generated-filter-${containerElement.id}`;
            }

            filterInputElement.setAttribute('id', inputId);
            labelElement.setAttribute('for', inputId);

            if (backupedForAttribute) {
              disposeAspect.dispose = composeSync(disposeAspect.dispose, () => labelElement.setAttribute('for', backupedForAttribute));
            }
          }
        });
      }
    };
  };
}

function RtlPlugin() {
  return {
    plug: plug$o
  };
}
function plug$o(configuration) {
  return aspects => {
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
  };
}

function FormResetPlugin() {
  return {
    plug: plug$n
  };
}
function plug$n() {
  return aspects => {
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
  };
}

const defValueMissingMessage = 'Please select an item in the list';
function ValidationApiPlugin(defaults) {
  preset$5(defaults);
  return {
    plug: plug$m
  };
}
function preset$5(defaults) {
  defaults.getValueRequired = () => false;

  defaults.valueMissingMessage = '';
}
function plug$m(configuration) {
  let {
    required,
    getValueRequired,
    getIsValueMissing,
    valueMissingMessage
  } = configuration;
  var getValueRequiredAspect = GetValueRequiredAspect(required, getValueRequired);
  return aspects => {
    aspects.getValueRequiredAspect = getValueRequiredAspect;
    return {
      plugStaticDom: () => {
        var {
          dataWrap,
          staticDom
        } = aspects;
        var valueMissingMessageEx = defCall(valueMissingMessage, () => getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "value-missing-message"), defValueMissingMessage);

        if (!getIsValueMissing) {
          getIsValueMissing = () => {
            let count = 0;
            let optionsArray = dataWrap.getOptions();

            for (var i = 0; i < optionsArray.length; i++) {
              if (optionsArray[i].selected) count++;
            }

            return count === 0;
          };
        }

        return {
          preLayout() {
            // getValueRequiredAspect redefined on appendToContainer, so this can't be called on prelayout and layout
            var isValueMissingObservable = ObservableLambda(() => getValueRequiredAspect.getValueRequired() && getIsValueMissing());
            var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());
            aspects.validationApiAspect = ValidationApiAspect(validationApiObservable); // used in BsAppearancePlugin layout, possible races

            return {
              layout: () => {
                var {
                  onChangeAspect,
                  updateDataAspect
                } = aspects; // TODO: required could be a function
                //let {valueMissingMessage} = configuration;

                onChangeAspect.onChange = composeSync(isValueMissingObservable.call, onChangeAspect.onChange);
                updateDataAspect.updateData = composeSync(isValueMissingObservable.call, updateDataAspect.updateData);
                return {
                  buildApi(api) {
                    var {
                      staticDom,
                      filterDom
                    } = aspects;
                    api.validationApi = ValidityApi(filterDom.filterInputElement, // !!
                    isValueMissingObservable, valueMissingMessageEx, isValid => validationApiObservable.setValue(isValid), staticDom.trigger);
                  }

                };
              },

              dispose() {
                isValueMissingObservable.detachAll();
                validationApiObservable.detachAll();
              }

            };
          }

        };
      }
    };
  };
}

function GetValueRequiredAspect(required, getValueRequiredCfg) {
  return {
    getValueRequired() {
      let value = false;
      if (!isBoolean(required)) if (getValueRequiredCfg) value = getValueRequiredCfg();
      return value;
    }

  };
}

function ValidationApiAspect(validationApiObservable) {
  return {
    getValue() {
      return validationApiObservable.getValue();
    },

    attach(f) {
      validationApiObservable.attach(f);
    }

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
    plug: plug$l
  };
}
function plug$l(configuration) {
  return aspects => {
    return {
      layout: () => {
        let {
          createWrapAspect,
          isChoiceSelectableAspect,
          wrapsCollection,
          produceChoiceAspect,
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

            api.updateOptionsHidden = () => wrapsCollection.forLoop((wrap, key) => updateChoiceHidden$1(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, produceChoiceAspect));

            api.updateOptionHidden = key => updateChoiceHidden$1(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden, produceChoiceAspect); // TODO create updateHidden ? 
            // it is too complex since we need to find the next non hidden, when this depends on key 
            // there should be the backreference "wrap -> index" invited before
            // api.updateOptionHidden  = (key) => wrapsCollection.get(key).updateHidden();

          }

        };
      }
    };
  };
}

function buildHiddenChoice(wrap) {
  wrap.updateSelected = () => void 0;

  wrap.choice.choicesDom = {};
  wrap.choice.choiceDomManagerHandlers = {};
  wrap.choice.choiceDomManagerHandlers.setVisible = null;
  wrap.choice.setHoverIn = null;

  wrap.choice.dispose = () => {
    wrap.choice.dispose = null;
  };

  wrap.dispose = () => {
    wrap.choice.dispose();
    wrap.dispose = null;
  };
}

function updateChoiceHidden$1(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, produceChoiceAspect) {
  let newIsOptionHidden = getIsOptionHidden(wrap.option);

  if (newIsOptionHidden != wrap.isOptionHidden) {
    wrap.isOptionHidden = newIsOptionHidden;

    if (wrap.isOptionHidden) {
      countableChoicesList.remove(wrap);
      wrap.choice.choiceDomManagerHandlers.detach();
      buildHiddenChoice(wrap);
    } else {
      let nextChoice = getNextNonHidden(key);
      countableChoicesList.add(wrap, nextChoice);
      produceChoiceAspect.produceChoice(wrap);
      wrap.choice.choiceDomManagerHandlers.attach(nextChoice?.choice.choiceDom.choiceElement);
    }
  }
}

function HiddenOptionAltPlugin() {
  return {
    plug: plug$k
  };
}
function plug$k(configuration) {
  return aspects => {
    return {
      layout: () => {
        let {
          createWrapAspect,
          isChoiceSelectableAspect,
          wrapsCollection,
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
          origBuildAndAttachChoice(wrap, getNextElement);
          wrap.choice.choiceDomManagerHandlers.setVisible(!wrap.isOptionHidden);
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

            api.updateOptionsHidden = () => wrapsCollection.forLoop((wrap, key) => updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden));

            api.updateOptionHidden = key => updateChoiceHidden(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden);
          }

        };
      }
    };
  };
}

function updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden) {
  let newIsOptionHidden = getIsOptionHidden(wrap.option);

  if (newIsOptionHidden != wrap.isOptionHidden) {
    wrap.isOptionHidden = newIsOptionHidden;
    if (wrap.isOptionHidden) countableChoicesList.remove(wrap);else {
      let nextChoice = getNextNonHidden(key); // TODO: should not rely on element but do

      countableChoicesList.add(wrap, nextChoice);
    }
    wrap.choice.choiceDomManagerHandlers.setVisible(!wrap.isOptionHidden);
  }
}

function CssPatchPlugin(defaults) {
  defaults.useCssPatch = true;
  return {
    merge(configuration, settings) {
      let cssPatch = settings?.cssPatch;
      if (isBoolean(cssPatch)) throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

      configuration.cssPatch = createCss(defaults.cssPatch, cssPatch); // replace classes, merge styles
    },

    plug: plug$j
  };
}
function plug$j(configuration) {
  if (configuration.useCssPatch) {
    extendCss(configuration.css, configuration.cssPatch);
    configuration.cssPatch = undefined;
  }
}

function CssPatchBs4Plugin(defaults) {
  var cssPatch = {}; //PickDomFactoryPlugCssPatch(cssPatch);

  PicksDomFactoryPlugCssPatchBs4(cssPatch);
  ChoiceDomFactoryPlugCssPatch(cssPatch);
  ChoicesDomFactoryPlugCssPatch(cssPatch);
  FilterDomFactoryPlugCssPatch(cssPatch);
  defaults.cssPatch = cssPatch;
  return CssPatchPlugin(defaults);
}

function CssPatchBs5Plugin(defaults) {
  var cssPatch = {};
  PicksDomFactoryPlugCssPatchBs5(cssPatch);
  ChoiceDomFactoryPlugCssPatch(cssPatch);
  ChoicesDomFactoryPlugCssPatch(cssPatch);
  FilterDomFactoryPlugCssPatch(cssPatch);
  defaults.cssPatch = cssPatch;
  return CssPatchPlugin(defaults);
}

function JQueryMethodsPlugin() {
  return {
    plug: plug$i
  };
}
function plug$i() {
  return aspects => {
    return {
      layout: () => {
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
  };
}

function OptionsApiPlugin() {
  return {
    plug: plug$h
  };
}
function plug$h() {
  return aspects => {
    return {
      buildApi(api) {
        let {
          buildAndAttachChoiceAspect,
          wraps,
          wrapsCollection,
          createWrapAspect,
          createChoiceBaseAspect,
          dataWrap,
          resetLayoutAspect
        } = aspects;

        api.updateOptionAdded = key => {
          // TODO: generalize index as key 
          let options = dataWrap.getOptions();
          let option = options[key];
          let wrap = createWrapAspect.createWrap(option);
          wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
          wraps.insert(key, wrap);

          let nextChoice = () => wrapsCollection.getNext(key, c => c.choice.choiceDom.choiceElement);

          buildAndAttachChoiceAspect.buildAndAttachChoice(wrap, () => nextChoice()?.choice.choiceDom.choiceElement);
        };

        api.updateOptionRemoved = key => {
          // TODO: generalize index as key 
          resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter

          var wrap = wraps.remove(key);
          wrap.choice.choiceDomManagerHandlers.detach?.();
          wrap.dispose?.();
        };
      }

    };
  };
}

function FormRestoreOnBackwardPlugin() {
  return {
    plug: plug$g
  };
}
function plug$g() {
  return aspects => {
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
  };
}

function SelectElementPlugin() {
  return {
    plug: plug$f
  };
}
function plug$f(configuration) {
  return aspects => {
    return {
      data: (initialElement, staticDom, dataWrap, containerClass) => {
        let selectElement = null;
        staticDom.containerElement = null;

        if (initialElement.tagName == 'SELECT') {
          selectElement = initialElement;

          if (containerClass) {
            staticDom.containerElement = closestByClassName(selectElement, containerClass);
          }
        } else if (initialElement.tagName == 'DIV') {
          selectElement = findDirectChildByTagName(initialElement, 'SELECT');

          if (selectElement) {
            if (containerClass) {
              staticDom.containerElement = closestByClassName(initialElement, containerClass);
            }
          } else {
            return origCreateStaticDom(initialElement, containerClass);
          }
        }

        if (selectElement) {
          staticDom.selectElement = selectElement;

          dataWrap.getOptions = () => selectElement.options;
        }
      },
      dom: () => {
        let {
          staticDomFactory,
          onChangeAspect,
          dataWrap,
          disposeAspect,
          staticDom,
          showErrorAspect,
          getValueRequiredAspect,
          createFilterInputElementIdAspect,
          optGroupAspect,
          disabledComponentAspect
          /* those four are plugins */

        } = aspects;
        let {
          createElementAspect,
          initialElement
        } = staticDom;
        let containerClass = configuration.containerClass;
        let origCreateStaticDom = staticDomFactory.createStaticDom;

        staticDomFactory.createStaticDom = () => {
          let selectElement = null;
          let containerElement = null;

          if (initialElement.tagName == 'SELECT') {
            selectElement = initialElement;

            if (containerClass) {
              containerElement = closestByClassName(selectElement, containerClass);
            }
          } else if (initialElement.tagName == 'DIV') {
            selectElement = findDirectChildByTagName(initialElement, 'SELECT');

            if (selectElement) {
              if (containerClass) {
                containerElement = closestByClassName(initialElement, containerClass);
              }
            } else {
              return origCreateStaticDom(initialElement, containerClass);
            }
          }

          let picksElement = null;
          if (containerElement) picksElement = findDirectChildByTagName(containerElement, 'UL');
          let isDisposableContainerElementFlag = false;

          if (!containerElement) {
            containerElement = createElementAspect.createElement('DIV');
            containerElement.classList.add(containerClass);
            isDisposableContainerElementFlag = true;
          }

          if (selectElement) {
            showErrorAspect.showError = error => {
              let errorElement = createElementAspect.createElement('SPAN');
              errorElement.style.backgroundColor = 'red';
              errorElement.style.color = 'white';
              errorElement.style.padding = '0.2rem 0.5rem';
              errorElement.textContent = 'BsMultiSelect ' + error.toString();
              selectElement.parentNode.insertBefore(errorElement, selectElement.nextSibling);
            };

            var backupDisplay = selectElement.style.display;
            selectElement.style.display = 'none';
            var backupedRequired = selectElement.required;

            if (getValueRequiredAspect) {
              getValueRequiredAspect.getValueRequired = function () {
                return backupedRequired;
              };
            }

            if (selectElement.required === true) selectElement.required = false; // TODO: move to DisableCompenentPlugin
            //let {getDisabled} = configuration;

            if (disabledComponentAspect) {
              var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');
              var origGetDisabled = disabledComponentAspect.getDisabled;
              if (fieldsetElement) disabledComponentAspect.getDisabled = () => {
                var value = origGetDisabled();
                if (value === null) value = selectElement.disabled || fieldsetElement.disabled;
                return value;
              };else disabledComponentAspect.getDisabled = () => {
                var value = origGetDisabled();
                if (value === null) value = selectElement.disabled;
                return value;
              };
            }

            onChangeAspect.onChange = composeSync(() => staticDom.trigger('change'), onChangeAspect.onChange);

            dataWrap.getOptions = () => selectElement.options;

            if (optGroupAspect) {
              optGroupAspect.getOptionOptGroup = option => option.parentNode;

              optGroupAspect.getOptGroupText = optGroup => optGroup.label;

              optGroupAspect.getOptGroupId = optGroup => optGroup.id;
            }

            if (selectElement && createFilterInputElementIdAspect) {
              var origCreateFilterInputElementId = createFilterInputElementIdAspect.createFilterInputElementId;

              createFilterInputElementIdAspect.createFilterInputElementId = () => {
                let id = origCreateFilterInputElementId();

                if (!id) {
                  id = `${containerClass}-generated-input-${(selectElement.id ? selectElement.id : selectElement.name).toLowerCase()}-id`;
                }

                return id;
              };
            }

            disposeAspect.dispose = composeSync(disposeAspect.dispose, () => {
              selectElement.required = backupedRequired;
              selectElement.style.display = backupDisplay;
            });
          }

          let isDisposablePicksElementFlag = false;

          if (!picksElement) {
            picksElement = createElementAspect.createElement('UL');
            isDisposablePicksElementFlag = true;
          }

          staticDom.containerElement = containerElement;
          staticDom.isDisposablePicksElementFlag = isDisposablePicksElementFlag;
          staticDom.picksElement = picksElement;
          staticDom.selectElement = selectElement;
          return {
            staticManager: {
              appendToContainer() {
                let {
                  choicesDom,
                  filterDom,
                  picksDom,
                  isDisposablePicksElementFlag
                } = staticDom;
                picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
                picksDom.picksElement.appendChild(picksDom.pickFilterElement);

                if (isDisposableContainerElementFlag) {
                  selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
                  containerElement.appendChild(choicesDom.choicesElement);
                } else {
                  selectElement.parentNode.insertBefore(choicesDom.choicesElement, selectElement.nextSibling);
                }

                if (isDisposablePicksElementFlag) containerElement.appendChild(picksDom.picksElement);
              },

              dispose() {
                let {
                  choicesDom,
                  filterDom,
                  picksDom,
                  isDisposablePicksElementFlag
                } = staticDom;
                choicesDom.choicesElement.parentNode.removeChild(choicesDom.choicesElement);
                if (isDisposableContainerElementFlag) selectElement.parentNode.removeChild(containerElement);
                if (isDisposablePicksElementFlag) containerElement.removeChild(picksDom.picksElement);
                picksDom.dispose();
                filterDom.dispose();
              }

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
          // NOTE: they never "restore" selected-disabled options.
          // TODO: make the FROM Validation for 'selected-disabled' easy.
          if (document.readyState != 'loading') {
            origLoadAspectLoop();
          } else {
            var domContentLoadedHandler = function () {
              origLoadAspectLoop();
              document.removeEventListener("DOMContentLoaded", domContentLoadedHandler);
            };

            document.addEventListener('DOMContentLoaded', domContentLoadedHandler); // IE9+
          }
        };
      }
    };
  };
}

function SelectedOptionPlugin() {
  return {
    plug: plug$e
  };
}
function plug$e(configuration) {
  let isChoiceSelectableAspect = IsChoiceSelectableAspect();
  return aspects => {
    aspects.isChoiceSelectableAspect = isChoiceSelectableAspect;
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

    var getSelectedAspect = {
      getSelected: getIsOptionSelected
    };
    var setSelectedAspect = {
      setSelected: setIsOptionSelected
    };
    aspects.getSelectedAspect = getSelectedAspect;
    aspects.setSelectedAspect = setSelectedAspect;
    return {
      plugStaticDom: () => {
        // TODO: move to createEventHandlers
        let {
          wrapsCollection
        } = aspects;
        aspects.updateOptionsSelectedAspect = UpdateOptionsSelectedAspect(wrapsCollection, getSelectedAspect);
      },
      layout: () => {
        let {
          wrapsCollection,
          updateOptionsSelectedAspect,
          createWrapAspect,
          produceChoiceAspect,
          resetLayoutAspect,
          picksList,
          producePickAspect,
          onChangeAspect,
          filterPredicateAspect
        } = aspects;
        let origFilterPredicate = filterPredicateAspect.filterPredicate;

        filterPredicateAspect.filterPredicate = (wrap, text) => !wrap.isOptionSelected && origFilterPredicate(wrap, text);

        function composeUpdateSelected(wrap, booleanValue) {
          return () => {
            wrap.isOptionSelected = booleanValue;
            wrap.updateSelected();
          };
        }

        function trySetWrapSelected(option, updateSelected, booleanValue) {
          //  wrap.option
          let success = false;
          var confirmed = setSelectedAspect.setSelected(option, booleanValue);

          if (!(confirmed === false)) {
            updateSelected();
            success = true;
          }

          return success;
        }

        ExtendProduceChoiceAspectProduceChoice$1(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList);
        let origCreateWrap = createWrapAspect.createWrap;

        createWrapAspect.createWrap = option => {
          let wrap = origCreateWrap(option);
          wrap.isOptionSelected = getSelectedAspect.getSelected(option);
          wrap.updateSelected = null; // can it be combined ?

          return wrap;
        };

        ExtendProducePickAspect$1(producePickAspect, trySetWrapSelected, composeUpdateSelected);
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

            api.updateOptionSelected = key => updateChoiceSelected(wrapsCollection.get(key), getSelectedAspect);
          }

        };
      }
    };
  };
}

function ExtendProduceChoiceAspectProduceChoice$1(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList) {
  let orig = produceChoiceAspect.produceChoice;

  produceChoiceAspect.produceChoice = wrap => {
    let val = orig(wrap);
    wrap.choice.choiceDomManagerHandlers.updateSelected();

    wrap.choice.tryToggleChoice = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected);

    wrap.choice.fullMatch = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);

    wrap.choice.choiсeClick = event => {
      wrap.choice.tryToggleChoice();
    }; // TODO: add fail message?


    wrap.updateSelected = () => {
      wrap.choice.choiceDomManagerHandlers.updateSelected();
      onChangeAspect.onChange();
    }; // addPickForChoice used only in load loop; updateSelected on toggle


    wrap.choice.addPickForChoice = () => {
      var pickHandlers = {
        producePick: null,
        // not redefined directly, but redefined in addPickAspect
        removeAndDispose: null // not redefined, used in MultiSelectInlineLayout injected into wrap.choice.choiceRemove 

      };

      pickHandlers.producePick = () => {
        let pick = producePickAspect.producePick(wrap);
        let {
          remove
        } = picksList.add(pick);
        pick.dispose = composeSync(remove, pick.dispose);

        pickHandlers.removeAndDispose = () => pick.dispose();

        return pick;
      };

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

      if (wrap.isOptionSelected) {
        let pick = pickHandlers.producePick();
        wrap.pick = pick;
        pick.dispose = composeSync(pick.dispose, () => {
          wrap.pick = null;
        });
      }

      return pickHandlers; //removeAndDispose
    };

    wrap.dispose = composeSync(() => {
      wrap.updateSelected = null;
      wrap.choice.choiсeClick = null;
      wrap.choice.tryToggleChoice = null;
      wrap.choice.fullMatch = null;
      wrap.choice.addPickForChoice = null;
    }, wrap.dispose);
    return val;
  };
}

function ExtendProducePickAspect$1(producePickAspect, trySetWrapSelected, composeUpdateSelected) {
  let orig = producePickAspect.producePick;

  producePickAspect.producePick = function (wrap, pickHandlers) {
    let pick = orig(wrap, pickHandlers);

    pick.setSelectedFalse = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);

    pick.dispose = composeSync(pick.dispose, () => {
      pick.setSelectedFalse = null;
    });
    return pick;
  };
}

function UpdateOptionsSelectedAspect(wrapsCollection, getSelectedAspect) {
  return {
    updateOptionsSelected() {
      wrapsCollection.forLoop(wrap => updateChoiceSelected(wrap, getSelectedAspect));
    }

  };
}

function updateChoiceSelected(wrap, getSelectedAspect) {
  let newIsSelected = getSelectedAspect.getSelected(wrap.option);

  if (newIsSelected != wrap.isOptionSelected) {
    wrap.isOptionSelected = newIsSelected;
    wrap.updateSelected?.(); // some hidden oesn't have element (and need to be updated)
  }
}

function IsChoiceSelectableAspect() {
  // TODO rename to IsSelectableByUserAspect ?
  return {
    isSelectable: wrap => true
  };
}

function DisabledOptionCssPatchPlugin(defaults) {
  defaults.cssPatch.pickContent_disabled = {
    opacity: '.65'
  };
}
function DisabledOptionPlugin(defaults) {
  defaults.css.pickContent_disabled = 'disabled';
  return {
    plug: plug$d
  };
}
function plug$d(configuration) {
  return aspects => {
    return {
      layout: () => {
        let {
          isChoiceSelectableAspect,
          createWrapAspect,
          produceChoiceAspect,
          filterPredicateAspect,
          wrapsCollection,
          producePickAspect,
          pickDomFactory
        } = aspects;
        let {
          getIsOptionDisabled,
          options,
          css
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

        let origIsSelectable = isChoiceSelectableAspect.isSelectable;

        isChoiceSelectableAspect.isSelectable = wrap => {
          return origIsSelectable(wrap) && !wrap.isOptionDisabled;
        };

        let origFilterPredicate = filterPredicateAspect.filterPredicate;

        filterPredicateAspect.filterPredicate = (wrap, text) => {
          return !wrap.isOptionDisabled && origFilterPredicate(wrap, text);
        };

        ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect);
        ExtendProducePickAspectProducePick(producePickAspect);
        ExtendPickDomFactoryCreate(pickDomFactory, css);
        return {
          buildApi(api) {
            api.updateOptionsDisabled = () => wrapsCollection.forLoop(wrap => updateChoiceDisabled(wrap, getIsOptionDisabled));

            api.updateOptionDisabled = key => updateChoiceDisabled(wrapsCollection.get(key), getIsOptionDisabled);
          }

        };
      }
    };
  };
}

function ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect) {
  let orig = produceChoiceAspect.produceChoice;

  produceChoiceAspect.produceChoice = wrap => {
    let val = orig(wrap);
    wrap.choice.choiceDomManagerHandlers.updateDisabled();
    wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled;
    wrap.choice.dispose = composeSync(() => {
      wrap.updateDisabled = null;
    }, wrap.choice.dispose);
    let origToggle = wrap.choice.tryToggleChoice;

    wrap.choice.tryToggleChoice = () => {
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

    return val;
  };
}

function ExtendProducePickAspectProducePick(producePickAspect) {
  let orig = producePickAspect.producePick;

  producePickAspect.producePick = wrap => {
    let val = orig(wrap);
    let pick = wrap.pick;
    let choiceUpdateDisabledBackup = wrap.updateDisabled; // backup disable only choice

    wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, () => pick.pickDomManagerHandlers.updateDisabled()); // add pickDisabled

    pick.dispose = composeSync(pick.dispose, () => {
      wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled

      wrap.updateDisabled(); // make "true disabled" without it checkbox only looks disabled
    });
    return val;
  };
}

function ExtendPickDomFactoryCreate(pickDomFactory, css) {
  let orig = pickDomFactory.create;

  pickDomFactory.create = pick => {
    orig(pick);
    let {
      pickDom,
      pickDomManagerHandlers
    } = pick;
    let disableToggle = toggleStyling(pickDom.pickContentElement, css.pickContent_disabled);

    pickDomManagerHandlers.updateDisabled = () => {
      disableToggle(pick.wrap.isOptionDisabled);
    };

    pickDomManagerHandlers.updateDisabled();
  };
}

function updateChoiceDisabled(wrap, getIsOptionDisabled) {
  let newIsDisabled = getIsOptionDisabled(wrap.option);

  if (newIsDisabled != wrap.isOptionDisabled) {
    wrap.isOptionDisabled = newIsDisabled;
    wrap.updateDisabled?.(); // some hidden oesn't have element (and need to be updated)
  }
}

function PicksApiPlugin() {
  return {
    plug: plug$c
  };
}
function plug$c() {
  return aspects => {
    return {
      buildApi(api) {
        let {
          picksList,
          createWrapAspect
        } = aspects;

        api.forEachPeak = f => picksList.forEach(wrap => f(wrap.option)); // TODO: getHeadPeak


        api.getTailPeak = () => picksList.getTail()?.option;

        api.countPeaks = () => picksList.getCount();

        api.isEmptyPeaks = () => picksList.isEmpty();

        api.addPick = option => {
          let wrap = createWrapAspect.createWrap(option); // TODO should be moved to specific plugins

          wrap.updateDisabled = () => {};

          wrap.updateHidden = () => {};

          wrap.choice.addPickForChoice();
        };
      }

    };
  };
}

function PicksPlugin() {
  return {
    plug: plug$b
  };
}
function plug$b(configuration) {
  return aspects => {
    return {
      plugStaticDom: () => {
        let {
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
  };
}

function CreatePopperPlugin() {
  return {
    plug: plug$a
  };
}
function plug$a() {
  var popperRtlAspect = PopperRtlAspect();
  return aspects => {
    aspects.popperRtlAspect = popperRtlAspect;
    let {
      environment
    } = aspects;
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
    var createPopperAspect = CreatePopperAspect(createPopperVX, popperRtlAspect, createPopperConfigurationAspect);
    aspects.createPopperAspect = createPopperAspect;
    return {
      append() {
        let {
          filterDom,
          choicesDom,
          disposeAspect,
          staticManager,
          choicesVisibilityAspect,
          specialPicksEventsAspect
        } = aspects;
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

    };
  };
}

function PopperRtlAspect() {
  return {
    getIsRtl() {
      return false;
    }

  };
}

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
function ChoicesDynamicStylingPlugin(defaults, environment) {
  preset$4(defaults);
  return {
    plug: plug$9
  };
}
function preset$4(o) {
  o.useChoicesDynamicStyling = false;

  o.choicesDynamicStyling = aspects => choicesDynamicStyling(aspects, window);

  o.minimalChoicesDynamicStylingMaxHeight = 20;
}
function plug$9(configuration) {
  let {
    choicesDynamicStyling,
    useChoicesDynamicStyling
  } = configuration;
  return aspects => {
    return {
      layout: () => {
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
  };
}

function choicesDynamicStyling(aspects, window) {
  let {
    choicesDom,
    navigateAspect,
    configuration
  } = aspects;
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
      if (wrap != null && wrap.choice != null && wrap.choice.choiceDom.choiceElement != null) wrap.choice.choiceDom.choiceElement.scrollIntoView(false); // alignTo false -  scroll to the top bottom of dropdown first
      // TODO: BUG if mouse left on the dropdow scroll to bottom and one after doesn't work properly

      return wrap;
    };
  }
}

function HighlightPlugin(defaults) {
  defaults.useHighlighting = false;
  return {
    plug: plug$8
  };
}

function ExtendChoiceDomFactory$1(choiceDomFactory, dataWrap) {
  var origChoiceDomFactoryCreate = choiceDomFactory.create;

  choiceDomFactory.create = choice => {
    origChoiceDomFactoryCreate(choice);
    let choiceElement = choice.choiceDom.choiceElement;

    choice.choiceDomManagerHandlers.updateHighlighted = () => {
      var text = dataWrap.getText(choice.wrap.option);
      var highlighter = aspects.highlightAspect.getHighlighter();
      if (highlighter) highlighter(choiceElement, choice.choiceDom, text);else choiceElement.textContent = text;
    };
  };
}

function plug$8(configuration) {
  return aspects => {
    if (configuration.useHighlighting) aspects.highlightAspect = HighlightAspect();
    return {
      plugStaticDom() {
        var {
          choiceDomFactory,
          dataWrap
        } = aspects;
        ExtendChoiceDomFactory$1(choiceDomFactory, dataWrap);
      },

      layout() {
        let {
          highlightAspect,
          filterManagerAspect,
          produceChoiceAspect
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

          let origProduceChoice = produceChoiceAspect.produceChoice;

          produceChoiceAspect.produceChoice = function (wrap) {
            origProduceChoice(wrap);
            let origSetVisible = wrap.choice.choiceDomManagerHandlers.setVisible;

            wrap.choice.choiceDomManagerHandlers.setVisible = function (v) {
              origSetVisible(v);
              wrap.choice.choiceDomManagerHandlers.updateHighlighted();
            };
          };
        }
      }

    };
  };
}

function HighlightAspect() {
  let highlighter = null;
  return {
    getHighlighter() {
      return highlighter;
    },

    set(filter) {
      var guarded = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var regex = new RegExp("(" + guarded + ")", "gi");

      highlighter = function (e, choiceDom, text) {
        // TODO replace with
        // var pos = text.indexOf(filter);
        e.innerHTML = text.replace(regex, "<u>$1</u>"); // TODO to method
        // var nodes = e.querySelectorAll('u');
        // var array = Array.prototype.slice.call(nodes);
        // if (choiceDom.highlightedElements)
        //     choiceDom.highlightedElements.concat(array);
        // else
        //     choiceDom.highlightedElements = array;
      };
    },

    reset() {
      highlighter = null;
    }

  };
}

function CustomChoiceStylingsPlugin(defaults) {
  defaults.customChoiceStylings = null;
  return {
    plug: plug$7
  };
}
function plug$7(configuration) {
  return aspects => {
    return {
      plugStaticDom: () => {
        let {
          choiceDomFactory
        } = aspects;
        let customChoiceStylings = configuration.customChoiceStylings;

        if (customChoiceStylings) {
          let customChoiceStylingsAspect = CustomChoiceStylingsAspect(customChoiceStylings);
          ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect);
        }
      }
    };
  };
}

function ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect) {
  let origChoiceDomFactoryCreate = choiceDomFactory.create;

  choiceDomFactory.create = function (choice) {
    origChoiceDomFactoryCreate(choice);
    customChoiceStylingsAspect.customize(choice.wrap, choice.choiceDom, choice.choiceDomManagerHandlers);
  };
}

function CustomChoiceStylingsAspect(customChoiceStylings) {
  return {
    customize(choice) {
      var handlers = customChoiceStylings(choice.choiceDom, choice.wrap.option);

      if (handlers) {
        function customChoiceStylingsClosure(custom) {
          return function () {
            custom({
              isOptionSelected: choice.wrap.isOptionSelected,
              isOptionDisabled: choice.wrap.isOptionDisabled,
              isHoverIn: choice.isHoverIn //isHighlighted: wrap.choice.isHighlighted  // TODO isHighlighted should be developed

            });
          };
        }

        let choiceDomManagerHandlers = choice.choiceDomManagerHandlers;
        if (choiceDomManagerHandlers.updateHoverIn && handlers.updateHoverIn) choiceDomManagerHandlers.updateHoverIn = composeSync(choiceDomManagerHandlers.updateHoverIn, customChoiceStylingsClosure(handlers.updateHoverIn));
        if (choiceDomManagerHandlers.updateSelected && handlers.updateSelected) choiceDomManagerHandlers.updateSelected = composeSync(choiceDomManagerHandlers.updateSelected, customChoiceStylingsClosure(handlers.updateSelected));
        if (choiceDomManagerHandlers.updateDisabled && handlers.updateDisabled) choiceDomManagerHandlers.updateDisabled = composeSync(choiceDomManagerHandlers.updateDisabled, customChoiceStylingsClosure(handlers.updateDisabled));
        if (choiceDomManagerHandlers.updateHighlighted && handlers.updateHighlighted) choiceDomManagerHandlers.updateHighlighted = composeSync(choiceDomManagerHandlers.updateHighlighted, customChoiceStylingsClosure(handlers.updateHighlighted));
      }
    }

  };
}

function CustomPickStylingsPlugin(defaults) {
  defaults.customPickStylings = null;
  return {
    plug: plug$6
  };
}
function plug$6(configuration) {
  return aspects => {
    return {
      plugStaticDom: () => {
        let {
          disabledComponentAspect,
          pickDomFactory
        } = aspects;
        let customPickStylings = configuration.customPickStylings;
        let customPickStylingsAspect = CustomPickStylingsAspect(disabledComponentAspect, customPickStylings);
        ExtendPickDomFactory$2(pickDomFactory, customPickStylingsAspect);
      }
    };
  };
}

function ExtendPickDomFactory$2(pickDomFactory, customPickStylingsAspect) {
  let origCreatePickDomFactory = pickDomFactory.create;

  pickDomFactory.create = function (pick) {
    origCreatePickDomFactory(pick);
    customPickStylingsAspect.customize(pick);
  };
}

function CustomPickStylingsAspect(disabledComponentAspect, customPickStylings) {
  return {
    customize(pick) {
      if (customPickStylings) {
        var handlers = customPickStylings(pick.pickDom, pick.wrap.option);

        if (handlers) {
          function customPickStylingsClosure(custom) {
            return function () {
              custom({
                isOptionDisabled: pick.wrap.isOptionDisabled,
                // wrap.component.getDisabled();
                // wrap.group.getDisabled();
                isComponentDisabled: disabledComponentAspect.getDisabled()
              });
            };
          }

          let pickDomManagerHandlers = pick.pickDomManagerHandlers; // TODO: automate it

          if (pickDomManagerHandlers.updateDisabled && handlers.updateDisabled) pickDomManagerHandlers.updateDisabled = composeSync(pickDomManagerHandlers.updateDisabled, customPickStylingsClosure(handlers.updateDisabled));
          if (pickDomManagerHandlers.updateComponentDisabled && handlers.updateComponentDisabled) pickDomManagerHandlers.updateComponentDisabled = composeSync(pickDomManagerHandlers.updateComponentDisabled, customPickStylingsClosure(handlers.updateComponentDisabled));
        }
      }
    }

  };
}

function UpdateAppearancePlugin() {
  return {
    plug: plug$5
  };
}
function plug$5() {
  var updateAppearanceAspect = UpdateAppearanceAspect();
  return aspects => {
    aspects.updateAppearanceAspect = updateAppearanceAspect;
    return {
      layout: () => {
        var {
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
      }
    };
  };
}

function UpdateAppearanceAspect() {
  return {
    updateAppearance() {}

  };
}

function DisableComponentPlugin(defaults) {
  preset$3(defaults);
  return {
    plug: plug$4
  };
}
function preset$3(defaults) {
  defaults.getDisabled = () => null;
}
function plug$4(configuration) {
  let disabledComponentAspect = DisabledComponentAspect(configuration.getDisabled);
  return aspects => {
    aspects.disabledComponentAspect = disabledComponentAspect;
    return {
      plugStaticDom: () => {
        var {
          pickDomFactory
        } = aspects;
        ExtendPickDomFactory$1(pickDomFactory, disabledComponentAspect);
      },
      layout: () => {
        var {
          updateAppearanceAspect,
          picksList,
          picksDom,
          picksElementAspect
        } = aspects;

        var disableComponent = isComponentDisabled => {
          picksList.forEach(pick => pick.pickDomManagerHandlers.updateComponentDisabled());
          picksDom.disable(isComponentDisabled);
        };

        var origOnClick = picksElementAspect.onClick;

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
          let newIsComponentDisabled = disabledComponentAspect.getDisabled() ?? false;

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
  };
}
function DisabledComponentAspect(getDisabled) {
  return {
    getDisabled
  };
}

function ExtendPickDomFactory$1(pickDomFactory, disabledComponentAspect) {
  var origCreatePickDomFactory = pickDomFactory.create;

  pickDomFactory.create = pick => {
    origCreatePickDomFactory(pick);
    let pickDomManagerHandlers = pick.pickDomManagerHandlers;

    pickDomManagerHandlers.updateComponentDisabled = () => {
      if (pickDomManagerHandlers.disableButton) pickDomManagerHandlers.disableButton(disabledComponentAspect.getDisabled() ?? false);
    };

    pickDomManagerHandlers.updateComponentDisabled();
  };
}

function PlaceholderPlugin() {
  return {
    plug: plug$3
  };
}
function plug$3(configuration) {
  return aspects => {
    return {
      layout: () => {
        let {
          staticManager,
          picksList,
          picksDom,
          filterDom,
          updateDataAspect,
          resetFilterListAspect,
          filterManagerAspect,
          environment,
          staticDom
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
    plug: plug$2
  };
}
function plug$2(configuration) {
  return aspects => {
    return {
      plugStaticDom: () => {
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
          getLabelAspect
        } = aspects;
        let {
          css
        } = configuration;

        if (floatingLabelAspect.isFloatingLabel()) {
          let labelElement = getLabelAspect.getLabel();
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
  };
}

function FloatingLabelAspect() {
  return {
    isFloatingLabel() {}

  };
}

function FloatingLabelCssPatchBs5Plugin(defaults) {
  let cssPatch = defaults.cssPatch;
  cssPatch.label_floating_lifted = {
    opacity: '.65',
    transform: 'scale(.85) translateY(-.5rem) translateX(.15rem)'
  };
  cssPatch.picks_floating_lifted = {
    paddingTop: '1.625rem',
    paddingLeft: '0.8rem',
    paddingBottom: '0'
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
function preset$2(o) {
  o.noResultsWarning = defNoResultsWarningMessage;
  o.isNoResultsWarningEnabled = false;
}
function plug$1(configuration) {
  return aspects => {
    return {
      layout: () => {
        let {
          choicesDom,
          staticManager,
          afterInputAspect,
          filterManagerAspect,
          resetLayoutAspect,
          staticDom
        } = aspects;
        let {
          createElementAspect
        } = staticDom;
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
      append: () => {
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
  staticManager.appendToContainer = composeSync(staticManager.appendToContainer, () => choicesElement.parentNode.insertBefore(warningElement, choicesElement.nextSibling));
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
  preset$1(defaults);
  return {
    plug: plug$1
  };
}
function preset$1(defaults) {
  defaults.css.warning = 'alert-warning bg-warning';
  preset$2(defaults);
}

function WarningBs5Plugin(defaults) {
  preset(defaults);
  return {
    plug: plug$1
  };
}
function preset(defaults) {
  defaults.css.warning = 'alert-warning';
  preset$2(defaults);
}

function PickButtonPlugCssPatchBs4(defaults) {
  // increase font and limit the line
  defaults.cssPatch.pickButton = {
    float: "none",
    verticalAlign: "text-top",
    fontSize: '1.8em',
    lineHeight: '0.5em',
    fontWeight: '400'
  };
}
function PickButtonPlugCssPatchBs5(defaults) {
  defaults.cssPatch.pickButton = {
    float: "none",
    verticalAlign: "text-top",
    fontSize: '0.8em'
  };
}
function PickButtonBs4Plugin(defaults) {
  defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
  defaults.css.pickButton = 'close';
  return PickButtonPlugin();
}
function PickButtonBs5Plugin(defaults) {
  defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"></button>';
  defaults.css.pickButton = 'btn-close';
  return PickButtonPlugin();
}
function PickButtonPlugin() {
  return {
    plug
  };
}
function plug(configuration) {
  return aspects => {
    return {
      plugStaticDom: () => {
        var {
          pickDomFactory,
          staticDom
        } = aspects;
        ExtendPickDomFactory(pickDomFactory, staticDom.createElementAspect, configuration.pickButtonHTML, configuration.css);
      },
      layout: () => {
        var {
          producePickAspect
        } = aspects;
        ExtendProducePickAspect(producePickAspect);
      }
    };
  };
}

function ExtendProducePickAspect(producePickAspect) {
  let origProducePickPickAspect = producePickAspect.producePick;

  producePickAspect.producePick = wrap => {
    let pick = origProducePickPickAspect(wrap);

    pick.removeOnButton = event => {
      pick.setSelectedFalse();
    };

    pick.dispose = composeSync(pick.dispose, () => {
      pick.removeOnButton = null;
    });
    return pick;
  };
}

function ExtendPickDomFactory(pickDomFactory, createElementAspect, pickButtonHTML, css) {
  var origCreatePickDomFactory = pickDomFactory.create;

  pickDomFactory.create = pick => {
    origCreatePickDomFactory(pick);
    let {
      pickDom,
      pickDomManagerHandlers
    } = pick;
    createElementAspect.createElementFromHtmlPutAfter(pickDom.pickContentElement, pickButtonHTML);
    let pickButtonElement = pickDom.pickElement.querySelector('BUTTON');
    pickDom.pickButtonElement = pickButtonElement;

    pickDomManagerHandlers.disableButton = val => {
      pickButtonElement.disabled = val;
    };

    let eventBinder = EventBinder();
    eventBinder.bind(pickButtonElement, "click", event => pick.removeOnButton(event));
    addStyling(pickButtonElement, css.pickButton);
    pick.dispose = composeSync(pick.dispose, () => {
      eventBinder.unbind();
      pickDom.pickButtonElement = null;
      pickDomManagerHandlers.disableButton = null;
    });
  };
}

let Bs4PluginSet = {
  BsAppearanceBs4Plugin,
  PickButtonBs4Plugin,
  WarningBs4Plugin,
  CssPatchBs4Plugin,
  BsAppearanceBs4CssPatchPlugin,
  PickButtonPlugCssPatchBs4
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
  DisabledOptionCssPatchPlugin,
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

function ModuleFactory$1(environment, customizationPlugins, defaultCss) {
  if (!environment.trigger) environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name));
  if (!environment.isIE11) environment.isIE11 = !!environment.window.MSInputMethodContext && !!environment.window.document.documentMode;
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

export { BsAppearanceBs4CssPatchPlugin, BsAppearanceBs4Plugin, BsAppearanceBs5CssPatchPlugin, BsAppearanceBs5Plugin, legacyConstructor as BsMultiSelect, ChoicesDynamicStylingPlugin, CreatePopperPlugin, CssPatchBs4Plugin, CssPatchBs5Plugin, CustomChoiceStylingsPlugin, CustomPickStylingsPlugin, DisableComponentPlugin, DisabledOptionCssPatchPlugin, DisabledOptionPlugin, EventBinder, FloatingLabelCssPatchBs5Plugin, FloatingLabelPlugin, FormResetPlugin, FormRestoreOnBackwardPlugin, HiddenOptionAltPlugin, HiddenOptionPlugin, HighlightPlugin, JQueryMethodsPlugin, LabelForAttributePlugin, ModuleFactory, MultiSelectBuilder, ObjectValuesEx, OptionsApiPlugin, PickButtonBs4Plugin, PickButtonBs5Plugin, PickButtonPlugCssPatchBs4, PickButtonPlugCssPatchBs5, PicksApiPlugin, PicksPlugin, PlaceholderCssPatchPlugin, PlaceholderPlugin, RtlPlugin, SelectElementPlugin, SelectedOptionPlugin, UpdateAppearancePlugin, ValidationApiPlugin, WarningBs4Plugin, WarningBs5Plugin, WarningCssPatchPlugin, addStyling, composeSync, shallowClearClone, toggleStyling };
//# sourceMappingURL=BsMultiSelect.mjs.map
