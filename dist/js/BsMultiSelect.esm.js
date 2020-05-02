/*!
  * DashboardCode BsMultiSelect v0.5.55 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2020 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
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
      if (_f2 instanceof Function) {
        var tmp = _f2();

        if (tmp) return tmp;
      } else return _f2;
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

function initiateDefaults(constructors, defaults) {
  for (var i = 0; i < constructors.length; i++) {
    var _constructors$i$setDe, _constructors$i;

    (_constructors$i$setDe = (_constructors$i = constructors[i]).setDefaults) == null ? void 0 : _constructors$i$setDe.call(_constructors$i, defaults);
  }
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
  // used in pickContentGenerator
  pick: 'badge',
  // bs4
  pickContent: '',
  pickContent_disabled: 'disabled',
  // not bs4, in scss 'ul.form-control li span.disabled'
  pickButton: 'close',
  // bs4
  // used in choiceContentGenerator
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
    justifyContent: 'flex-start'
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

function LabelPlugin(pluginData) {
  var configuration = pluginData.configuration,
      staticContent = pluginData.staticContent;
  var label = configuration.label;

  staticContent.getLabelElement = function () {
    return defCall(label);
  }; // overrided by BS Appearance Plugin


  var createInputId = null;
  var selectElement = staticContent.selectElement,
      containerClass = staticContent.containerClass,
      containerElement = staticContent.containerElement;
  if (selectElement) createInputId = function createInputId() {
    return containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
  };else createInputId = function createInputId() {
    return containerClass + "-generated-filter-" + containerElement.id;
  };
  return {
    afterConstructor: function afterConstructor() {
      var labelElement = staticContent.getLabelElement();
      var backupedForAttribute = null; // state saved between init and dispose

      if (labelElement) {
        backupedForAttribute = labelElement.getAttribute('for');
        var newId = createInputId();
        staticContent.filterInputElement.setAttribute('id', newId);
        labelElement.setAttribute('for', newId);
      }

      if (backupedForAttribute) return function () {
        return labelElement.setAttribute('for', backupedForAttribute);
      };
    }
  };
}

function RtlPlugin(pluginData) {
  var configuration = pluginData.configuration,
      staticContent = pluginData.staticContent;
  var isRtl = configuration.isRtl;
  var forceRtlOnContainer = false;
  if (isBoolean(isRtl)) forceRtlOnContainer = true;else isRtl = getIsRtl(staticContent.initialElement);
  var attributeBackup = AttributeBackup();

  if (forceRtlOnContainer) {
    attributeBackup.set(staticContent.containerElement, "dir", "rtl");
  } else if (staticContent.selectElement) {
    var dirAttributeValue = staticContent.selectElement.getAttribute("dir");

    if (dirAttributeValue) {
      attributeBackup.set(staticContent.containerElement, "dir", dirAttributeValue);
    }
  }

  return {
    afterConstructor: function afterConstructor(multiSelect) {
      var origCreatePopperConfiguration = multiSelect.createPopperConfiguration.bind(multiSelect);

      multiSelect.createPopperConfiguration = function () {
        var configuration = origCreatePopperConfiguration();
        if (isRtl) configuration.placement = 'bottom-end';
        return configuration;
      };

      return attributeBackup.restore;
    }
  };
}

function FormResetPlugin(pluginData) {
  var staticContent = pluginData.staticContent,
      window = pluginData.window;
  return {
    afterConstructor: function afterConstructor(multiSelect) {
      var eventBuilder = EventBinder();

      if (staticContent.selectElement) {
        var form = closestByTagName(staticContent.selectElement, 'FORM');

        if (form) {
          eventBuilder.bind(form, 'reset', function () {
            return window.setTimeout(function () {
              return multiSelect.UpdateData();
            });
          });
        }
      }

      return eventBuilder.unbind;
    }
  };
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

var defValueMissingMessage = 'Please select an item in the list';
function ValidationApiPlugin(pluginData) {
  var configuration = pluginData.configuration,
      staticContent = pluginData.staticContent,
      staticContent = pluginData.staticContent;
  var _configuration = configuration,
      getIsValueMissing = _configuration.getIsValueMissing,
      valueMissingMessage = _configuration.valueMissingMessage,
      required = _configuration.required;
  required = def(required, staticContent.required);
  valueMissingMessage = defCall(valueMissingMessage, function () {
    return getDataGuardedWithPrefix(staticContent.initialElement, "bsmultiselect", "value-missing-message");
  }, defValueMissingMessage);
  return {
    afterConstructor: function afterConstructor(multiSelect) {
      if (!getIsValueMissing) {
        getIsValueMissing = function getIsValueMissing() {
          var count = 0;
          var optionsArray = multiSelect.getOptions();

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
      staticContent.validationApiObservable = validationApiObservable;
      var origOnChange = multiSelect.onChange;

      multiSelect.onChange = function () {
        isValueMissingObservable.call();
        origOnChange();
      };

      var validationApi = ValidityApi(staticContent.filterInputElement, isValueMissingObservable, valueMissingMessage, function (isValid) {
        return validationApiObservable.setValue(isValid);
      });
      multiSelect.validationApi = validationApi;
      return function () {
        return composeSync(isValueMissingObservable.detachAll, validationApiObservable.detachAll);
      };
    }
  };
}

ValidationApiPlugin.setDefaults = function (defaults) {
  defaults.valueMissingMessage = '';
};

function BsAppearancePlugin(pluginData) {
  var configuration = pluginData.configuration,
      common = pluginData.common,
      staticContent = pluginData.staticContent;
  var getValidity = configuration.getValidity,
      getSize = configuration.getSize,
      useCssPatch = configuration.useCssPatch,
      css = configuration.css;
  var selectElement = staticContent.selectElement;

  if (staticContent.getLabelElement) {
    var origGetLabelElement = staticContent.getLabelElement;

    staticContent.getLabelElement = function () {
      var e = origGetLabelElement();
      if (e) return e;else return getLabelElement(selectElement);
    };
  }

  if (staticContent.selectElement) {
    if (!getValidity) getValidity = composeGetValidity(selectElement);
    if (!getSize) getSize = composeGetSize(selectElement);
  } else {
    if (!getValidity) getValidity = function getValidity() {
      return null;
    };
    if (!getSize) getSize = function getSize() {
      return null;
    };
  }

  common.getSize = getSize;
  common.getValidity = getValidity;
  return {
    afterConstructor: function afterConstructor(multiSelect) {
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
          }
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
      var validationApiObservable = staticContent.validationApiObservable;
      var validationObservable = ObservableLambda(function () {
        return wasUpdatedObservable.getValue() ? validationApiObservable.getValue() : getManualValidationObservable.getValue();
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
      validationApiObservable.attach(function () {
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
      return (
        /* dispose */
        function () {
          wasUpdatedObservable.detachAll();
          validationObservable.detachAll();
          getManualValidationObservable.detachAll();
        }
      );
    }
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

function composeGetValidity(selectElement) {
  var getValidity = function getValidity() {
    return selectElement.classList.contains('is-invalid') ? false : selectElement.classList.contains('is-valid') ? true : null;
  };

  return getValidity;
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

function updateHiddenChoice(choice, updateHidden, getIsOptionHidden) {
  var newIsOptionHidden = getIsOptionHidden(choice.option);

  if (newIsOptionHidden != choice.isOptionHidden) {
    choice.isOptionHidden = newIsOptionHidden;
    updateHidden(choice);
  }
}

function getNextNonHidden(choice) {
  // TODO get next visible
  var next = choice.itemNext;

  if (!next) {
    return null;
  } else if (next.choiceElement) {
    return next;
  }

  return getNextNonHidden(next);
}

function HiddenOptionPlugin(pluginData) {
  var configuration = pluginData.configuration,
      options = pluginData.options;
  var getIsOptionHidden = configuration.getIsOptionHidden;

  if (options) {
    if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
      return option.hidden === undefined ? false : option.hidden;
    };
  } else {
    if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
      return option.hidden;
    };
  }

  return {
    afterConstructor: function afterConstructor(multiSelect) {
      multiSelect.getNext = function (c) {
        return getNextNonHidden(c);
      };

      var origIsSelectable = multiSelect.isSelectable.bind(multiSelect);

      multiSelect.isSelectable = function (choice) {
        return origIsSelectable(choice) && !choice.isOptionHidden;
      };

      function buildHiddenChoice(choice) {
        choice.updateSelected = function () {
          return void 0;
        };

        choice.updateDisabled = function () {
          return void 0;
        };

        choice.choiceElement = null;
        choice.choiceElementAttach = null;
        choice.setVisible = null;
        choice.setHoverIn = null;
        choice.remove = null;

        choice.dispose = function () {
          choice.dispose = null;
        };
      }

      function updateHidden(choice) {
        if (choice.isOptionHidden) {
          multiSelect.filterListFacade.remove(choice);
          choice.remove();
          buildHiddenChoice(choice);
        } else {
          var nextChoice = getNextNonHidden(choice);
          multiSelect.filterListFacade.add(choice, nextChoice);
          multiSelect.createChoiceElement(choice);
          choice.choiceElementAttach(nextChoice == null ? void 0 : nextChoice.choiceElement); // itemPrev?.choiceElement
        }
      }

      multiSelect.updateHidden = function (c) {
        return updateHidden(c);
      };

      function UpdateOptionHidden(key) {
        var choice = multiSelect.choicesPanel.get(key); // TODO: generalize index as key 

        updateHiddenChoice(choice, function (c) {
          return multiSelect.updateHidden(c);
        }, getIsOptionHidden); // TODO: invite this.getIsOptionSelected
      }

      function UpdateOptionsHidden() {
        var options = multiSelect.getOptions();

        for (var i = 0; i < options.length; i++) {
          UpdateOptionHidden(i);
        }
      }

      multiSelect.UpdateOptionsHidden = function () {
        return UpdateOptionsHidden();
      };

      multiSelect.UpdateOptionHidden = function (key) {
        return UpdateOptionHidden(key);
      };

      var origСreateChoice = multiSelect.createChoice.bind(multiSelect);

      multiSelect.createChoice = function (option) {
        var choice = origСreateChoice(option);
        choice.isOptionHidden = getIsOptionHidden(option);
        return choice;
      };

      var origInsertChoiceItem = multiSelect.insertChoiceItem.bind(multiSelect);
      var origPushChoiceItem = multiSelect.pushChoiceItem.bind(multiSelect);

      multiSelect.insertChoiceItem = function (choice) {
        if (choice.isOptionHidden) {
          buildHiddenChoice(choice);
        } else {
          origInsertChoiceItem(choice);
        }
      };

      multiSelect.pushChoiceItem = function (choice) {
        if (choice.isOptionHidden) {
          buildHiddenChoice(choice);
        } else {
          origPushChoiceItem(choice);
        }
      };

      multiSelect.forEach = function (f) {
        var choice = multiSelect.choicesPanel.getHead();

        while (choice) {
          if (!choice.isOptionHidden) f(choice);
          choice = multiSelect.getNext(choice);
        }
      };

      var origAddFilterFacade = multiSelect.addFilterFacade.bind(multiSelect);

      multiSelect.addFilterFacade = function (choice) {
        if (!choice.isOptionHidden) {
          origAddFilterFacade(choice);
        }
      };

      var origInsertFilterFacade = multiSelect.insertFilterFacade.bind(multiSelect);

      multiSelect.addFilterFacade = function (choice) {
        if (!choice.isOptionHidden) {
          origInsertFilterFacade(choice);
        }
      };
    }
  };
}

function CssPatchPlugin() {}

CssPatchPlugin.setDefaults = function (defaults) {
  defaults.useCssPatch = true;
  defaults.cssPatch = cssPatch;
};

CssPatchPlugin.mergeDefaults = function (configuration, defaults, settings) {
  if (isBoolean(settings.cssPatch)) throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

  var defCssPatch = createCss(defaults.cssPatch, settings.cssPatch); // replace classes, merge styles

  configuration.cssPatch = defCssPatch;
};

CssPatchPlugin.buildedConfiguration = function (configuration) {
  if (configuration.useCssPatch) extendCss(configuration.css, configuration.cssPatch);
};

var defaults = {
  containerClass: "dashboardcode-bsmultiselect",
  css: css
};
var defaultPlugins = [CssPatchPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin, RtlPlugin];
function BsMultiSelect(element, environment, settings) {
  if (!environment.trigger) environment.trigger = function (e, name) {
    return e.dispatchEvent(new environment.window.Event(name));
  };
  if (!environment.plugins) environment.plugins = defaultPlugins;
  var configuration = {};
  if (settings) adjustLegacySettings(settings);
  configuration.css = createCss(defaults.css, settings == null ? void 0 : settings.css);
  mergeDefaults(defaultPlugins, configuration, defaults, settings);
  extendIfUndefined(configuration, settings);
  extendIfUndefined(configuration, defaults);
  buildedConfiguration(defaultPlugins, configuration);
  return BsMultiSelect(element, environment, configuration, settings == null ? void 0 : settings.onInit);
}
initiateDefaults(defaultPlugins, defaults);
BsMultiSelect.defaults = defaults;

export { BsMultiSelect };
//# sourceMappingURL=BsMultiSelect.esm.js.map
