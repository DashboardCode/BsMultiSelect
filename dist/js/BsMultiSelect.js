/*!
  * BsMultiSelect v1.2.0-beta.27 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2021 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under Apache 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@popperjs/core')) :
    typeof define === 'function' && define.amd ? define(['@popperjs/core'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.dashboardcode = factory(global.Popper));
})(this, (function (Popper) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var Popper__default = /*#__PURE__*/_interopDefaultLegacy(Popper);

    function addToJQueryPrototype(pluginName, createPlugin, $) {
      var firstChar = pluginName.charAt(0);
      var firstCharLower = firstChar.toLowerCase();

      if (firstCharLower == firstChar) {
        throw new Error("Plugin name '" + pluginName + "' should be started from upper case char");
      }

      var prototypableName = firstCharLower + pluginName.slice(1);
      var noConflictPrototypable = $.fn[prototypableName];
      var noConflictPrototypableForInstance = $.fn[pluginName];
      var dataKey = "DashboardCode." + pluginName;

      function createInstance(options, e, $e) {
        var optionsRef = typeof options === 'object' || options instanceof Function ? options : null;
        var instance = createPlugin(e, optionsRef, function () {
          $e.removeData(dataKey);
        });
        $e.data(dataKey, instance);
        return instance;
      }

      function prototypable(options) {
        var output = [];
        this.each(function (i, e) {
          var $e = $(e);
          var instance = $e.data(dataKey);
          var isMethodName = typeof options === 'string';

          if (!instance) {
            if (isMethodName && /Dispose/.test(options)) return;
            instance = createInstance(options, e, $e);
          }

          if (isMethodName) {
            var methodName = options;

            if (typeof instance[methodName] === 'undefined') {
              var lMethodName = methodName.charAt(0).toLowerCase() + methodName.slice(1);

              if (typeof instance[lMethodName] === 'undefined') {
                throw new Error("No method named '" + methodName + "'");
              } else {
                methodName = lMethodName;
              }
            }

            var result = instance[methodName]();

            if (result !== undefined) {
              output.push(result);
            }
          }
        });
        if (output.length == 0) return this;else if (output.length == 1) return output[0];else return output;
      }

      function prototypableForInstance(options) {
        var instance = this.data(dataKey);
        if (instance) return instance;else if (this.length === 1) {
          return createInstance(options, this.get(0), this);
        } else if (this.length > 1) {
          var output = [];
          this.each(function (i, e) {
            output.push(createInstance(options, e, $(e)));
          });
          return output;
        }
      }

      $.fn[prototypableName] = prototypable;

      $.fn[prototypableName].noConflict = function () {
        $.fn[prototypableName] = noConflictPrototypable;
        return prototypable;
      };

      $.fn[pluginName] = prototypableForInstance;

      $.fn[pluginName].noConflict = function () {
        $.fn[pluginName] = noConflictPrototypableForInstance;
        return prototypableForInstance;
      };

      return prototypable;
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

    function forEachRecursion(f, e) {
      if (!e) return;
      var goOn = f(e.value);
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

          function index() {
            return indexRecursion(0, node);
          }

          return {
            remove: remove,
            index: index
          };
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
    function DoublyLinkedList(getPrev, setPrev, getNext, setNext) {
      var head = null,
          tail = null;
      var count = 0;
      return {
        add: function add(e, next) {
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
              var prev = getPrev(next);
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
        remove: function remove(e) {
          var next = getNext(e);
          var prev = getPrev(e);

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
    function ArrayFacade() {
      var list = [];
      return {
        push: function push(e) {
          list.push(e);
        },
        add: function add(e, key) {
          list.splice(key, 0, e);
        },
        get: function get(key) {
          return list[key];
        },
        getNext: function getNext(key, predicate) {
          var count = list.length;
          var start = key + 1;

          if (key < count) {
            if (!predicate) return list[start];

            for (var i = start; i < count; i++) {
              var c = list[i];
              if (predicate(c)) return c;
            }
          }
        },
        remove: function remove(key) {
          var e = list[key];
          list.splice(key, 1);
          return e;
        },
        forLoop: function forLoop(f) {
          for (var i = 0; i < list.length; i++) {
            var e = list[i];
            f(e, i);
          }
        },
        getHead: function getHead() {
          return list[0];
        },
        getCount: function getCount() {
          return list.length;
        },
        isEmpty: function isEmpty() {
          return list.length == 0;
        },
        reset: function reset() {
          list = [];
        }
      };
    }
    function composeSync() {
      for (var _len2 = arguments.length, functions = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        functions[_key2] = arguments[_key2];
      }

      return function () {
        return functions.forEach(function (f) {
          if (f) f();
        });
      };
    }
    function defCall() {
      for (var _len3 = arguments.length, functions = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        functions[_key3] = arguments[_key3];
      }

      for (var _i = 0, _functions = functions; _i < _functions.length; _i++) {
        var f = _functions[_i];

        if (f) {
          if (f instanceof Function) {
            var tmp = f();
            if (tmp) return tmp;
          } else return f;
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
    function composeEventTrigger(window) {
      var trigger;

      if (typeof window.Event === 'function') {
        trigger = function trigger(e, eventName) {
          var event = new window.Event(eventName);
          e.dispatchEvent(event);
        };
      } else trigger = function trigger(e, eventName) {
        // IE 11 polyfill
        var event = window.document.createEvent("CustomEvent");
        event.initCustomEvent(eventName, false, false, undefined);
        e.dispatchEvent(event);
      };

      return trigger;
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
    function EventTumbler(element, eventName, handler) {
      return {
        on: function on() {
          element.addEventListener(eventName, handler);
        },
        off: function off() {
          element.removeEventListener(eventName, handler);
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
    function EventLoopProlongableFlag(window) {
      var flag = false;
      var pr = null;
      return {
        get: function get() {
          return flag;
        },
        set: function set(timeout) {
          if (flag && pr) {
            window.clearTimeout(pr);
          }

          flag = true;
          pr = window.setTimeout(function () {
            flag = false;
            pr = null;
          }, timeout ? timeout : 0);
        }
      };
    }
    function ResetableFlag() {
      var flag = false;
      return {
        get: function get() {
          return flag;
        },
        set: function set() {
          flag = true;
        },
        reset: function reset() {
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
      var isF = styling instanceof Function;
      return function (value, force) {
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

    function PickDomFactoryPlugCss(css) {
      css.pickContent = '';
    }
    function PickDomFactory(css, createElementAspect, dataWrap) {
      return {
        create: function create(pick) {
          var wrap = pick.wrap;
          var pickDom = pick.pickDom,
              pickDomManagerHandlers = pick.pickDomManagerHandlers;
          var pickElement = pickDom.pickElement;
          var pickContentElement = createElementAspect.createElement('SPAN');
          pickElement.appendChild(pickContentElement);
          pickDom.pickContentElement = pickContentElement;

          pickDomManagerHandlers.updateData = function () {
            // this is not a generic because there could be more then one text field.
            pickContentElement.textContent = dataWrap.getText(wrap.option);
          };

          addStyling(pickContentElement, css.pickContent);
          pick.dispose = composeSync(pick.dispose, function () {
            pickDom.pickContentElement = null;
            pickDomManagerHandlers.updateData = null;
          });
          pickDomManagerHandlers.updateData(); // set visual text
        }
      };
    }

    function buildDom(choiceElement, choiceDom, createElementAspect, css) {
      createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
      var choiceContentElement = choiceElement.querySelector('DIV');
      var choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
      var choiceLabelElement = choiceContentElement.querySelector('LABEL');
      choiceDom.choiceContentElement = choiceContentElement;
      choiceDom.choiceCheckBoxElement = choiceCheckBoxElement;
      choiceDom.choiceLabelElement = choiceLabelElement;
      addStyling(choiceContentElement, css.choiceContent);
      addStyling(choiceCheckBoxElement, css.choiceCheckBox);
      addStyling(choiceLabelElement, css.choiceLabel);
    }

    function buidDisabled(choiceDom, choiceDomManagerHandlers, css, wrap) {
      var choiceDisabledToggle = toggleStyling(choiceDom.choiceElement, css.choice_disabled);
      var choiceCheckBoxDisabledToggle = toggleStyling(choiceDom.choiceCheckBoxElement, css.choiceCheckBox_disabled);
      var choiceLabelDisabledToggle = toggleStyling(choiceDom.choiceLabelElement, css.choiceLabel_disabled);
      var choiceCursorDisabledToggle = toggleStyling(choiceDom.choiceElement, {
        classes: [],
        styles: {
          cursor: "default"
        }
      });

      var updateDisabled = function updateDisabled() {
        choiceDisabledToggle(wrap.isOptionDisabled);
        choiceCheckBoxDisabledToggle(wrap.isOptionDisabled);
        choiceLabelDisabledToggle(wrap.isOptionDisabled); // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"

        var isCheckBoxDisabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
        choiceDom.choiceCheckBoxElement.disabled = isCheckBoxDisabled;
        choiceCursorDisabledToggle(isCheckBoxDisabled);
      };

      choiceDomManagerHandlers.updateDisabled = updateDisabled;
    }

    function ChoiceDomFactory(css, createElementAspect, dataWrap) {
      //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
      return {
        create: function create(choice) {
          var wrap = choice.wrap;
          var choiceDom = choice.choiceDom,
              choiceDomManagerHandlers = choice.choiceDomManagerHandlers;
          var choiceElement = choice.choiceDom.choiceElement;
          buildDom(choiceElement, choiceDom, createElementAspect, css); // --- --- --- ---

          var choiceHoverToggle = toggleStyling(choiceElement, function () {
            return wrap.isOptionDisabled === true && css.choice_disabled_hover && wrap.isOptionSelected === false ? css.choice_disabled_hover : css.choice_hover;
          }); //let choiceHoverToggle2 = toggleStyling(choiceElement, css.choice_disabled_hover, css.choice_hover);

          choiceDomManagerHandlers.updateHoverIn = function () {
            return choiceHoverToggle(choice.isHoverIn);
          };

          var choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);

          var updateSelected = function updateSelected() {
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

          choiceDomManagerHandlers.updateData = function () {
            choiceDom.choiceLabelElement.textContent = dataWrap.getText(wrap.option);
          }; //updateDataInternal(wrap, choiceLabelElement, dataWrap);


          choiceDomManagerHandlers.updateData();
          var eventBinder = EventBinder();
          eventBinder.bind(choiceElement, "click", function (event) {
            return choice.choiсeClick(event);
          });
          composeSync(choice.dispose, function () {
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
        createStaticDom: function createStaticDom() {
          var createElementAspect = staticDom.createElementAspect,
              initialElement = staticDom.initialElement,
              containerClass = staticDom.containerClass;
          var containerElement, picksElement;
          var removableContainerClass = false;

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

          var isDisposablePicksElementFlag = false;

          if (!picksElement) {
            picksElement = createElementAspect.createElement('UL');
            isDisposablePicksElementFlag = true;
          }

          staticDom.containerElement = containerElement;
          staticDom.isDisposablePicksElementFlag = isDisposablePicksElementFlag;
          staticDom.picksElement = picksElement;
          return {
            staticManager: {
              appendToContainer: function appendToContainer() {
                var containerElement = staticDom.containerElement,
                    isDisposablePicksElementFlag = staticDom.isDisposablePicksElementFlag,
                    choicesDom = staticDom.choicesDom,
                    picksDom = staticDom.picksDom,
                    filterDom = staticDom.filterDom;
                picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
                picksDom.picksElement.appendChild(picksDom.pickFilterElement);
                containerElement.appendChild(choicesDom.choicesElement);
                if (isDisposablePicksElementFlag) containerElement.appendChild(picksDom.picksElement);
              },
              dispose: function dispose() {
                var containerElement = staticDom.containerElement,
                    containerClass = staticDom.containerClass,
                    isDisposablePicksElementFlag = staticDom.isDisposablePicksElementFlag,
                    choicesDom = staticDom.choicesDom,
                    picksDom = staticDom.picksDom,
                    filterDom = staticDom.filterDom;
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
        createElement: createElement,
        createElementFromHtml: createElementFromHtml,
        createElementFromHtmlPutAfter: createElementFromHtmlPutAfter
      };
    }

    function PicksDomFactory(staticDom) {
      return {
        create: function create() {
          var picksElement = staticDom.picksElement,
              isDisposablePicksElementFlag = staticDom.isDisposablePicksElementFlag,
              css = staticDom.css,
              createElementAspect = staticDom.createElementAspect;
          var pickFilterElement = createElementAspect.createElement('LI');
          addStyling(picksElement, css.picks);
          addStyling(pickFilterElement, css.pickFilter);
          var disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
          var focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
          var isFocusIn = false;
          return {
            picksElement: picksElement,
            isDisposablePicksElementFlag: isDisposablePicksElementFlag,
            pickFilterElement: pickFilterElement,
            createPickElement: function createPickElement() {
              var pickElement = createElementAspect.createElement('LI');
              addStyling(pickElement, css.pick);
              return {
                pickElement: pickElement,
                attach: function attach(beforeElement) {
                  return picksElement.insertBefore(pickElement, beforeElement != null ? beforeElement : pickFilterElement);
                },
                detach: function detach() {
                  return picksElement.removeChild(pickElement);
                }
              };
            },
            disable: function disable(isComponentDisabled) {
              disableToggleStyling(isComponentDisabled);
            },
            toggleFocusStyling: function toggleFocusStyling() {
              focusToggleStyling(isFocusIn);
            },
            getIsFocusIn: function getIsFocusIn() {
              return isFocusIn;
            },
            setIsFocusIn: function setIsFocusIn(newIsFocusIn) {
              isFocusIn = newIsFocusIn;
            },
            dispose: function dispose() {
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
    function PicksDomFactoryPlugCssPatchBs5(cssPatch) {
      PicksDomFactoryPlugCssPatch(cssPatch); // TODO: this is done for button and should be moved to button plugin

      cssPatch.pick.color = 'var(--bs-dark)';
    }

    function FilterDomFactory(staticDom) {
      return {
        create: function create() {
          var isDisposablePicksElementFlag = staticDom.isDisposablePicksElementFlag,
              css = staticDom.css,
              createElementAspect = staticDom.createElementAspect;
          var filterInputElement = createElementAspect.createElement('INPUT');
          addStyling(filterInputElement, css.filterInput);
          filterInputElement.setAttribute("type", "search");
          filterInputElement.setAttribute("autocomplete", "off");
          var eventBinder = EventBinder();
          return {
            filterInputElement: filterInputElement,
            isEmpty: function isEmpty() {
              return filterInputElement.value ? false : true;
            },
            setEmpty: function setEmpty() {
              filterInputElement.value = '';
            },
            getValue: function getValue() {
              return filterInputElement.value;
            },
            setFocus: function setFocus() {
              filterInputElement.focus();
            },
            setWidth: function setWidth(text) {
              filterInputElement.style.width = text.length * 1.3 + 2 + "ch";
            },
            // TODO: check why I need this comparision? 
            setFocusIfNotTarget: function setFocusIfNotTarget(target) {
              if (target != filterInputElement) filterInputElement.focus();
            },
            onInput: function onInput(onFilterInputInput) {
              eventBinder.bind(filterInputElement, 'input', onFilterInputInput);
            },
            onFocusIn: function onFocusIn(_onFocusIn) {
              eventBinder.bind(filterInputElement, 'focusin', _onFocusIn);
            },
            onFocusOut: function onFocusOut(_onFocusOut) {
              eventBinder.bind(filterInputElement, 'focusout', _onFocusOut);
            },
            onKeyDown: function onKeyDown(onfilterInputKeyDown) {
              eventBinder.bind(filterInputElement, 'keydown', onfilterInputKeyDown);
            },
            onKeyUp: function onKeyUp(onFilterInputKeyUp) {
              eventBinder.bind(filterInputElement, 'keyup', onFilterInputKeyUp);
            },
            dispose: function dispose() {
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
        create: function create() {
          var css = staticDom.css,
              createElementAspect = staticDom.createElementAspect;
          var choicesElement = createElementAspect.createElement('DIV');
          var choicesListElement = createElementAspect.createElement('UL');
          choicesElement.appendChild(choicesListElement);
          choicesElement.style.display = 'none';
          addStyling(choicesElement, css.choices);
          addStyling(choicesListElement, css.choicesList);
          return {
            choicesElement: choicesElement,
            choicesListElement: choicesListElement,
            createChoiceElement: function createChoiceElement() {
              var choiceElement = createElementAspect.createElement('LI');
              addStyling(choiceElement, css.choice);
              return {
                choiceElement: choiceElement,
                setVisible: function setVisible(isVisible) {
                  return choiceElement.style.display = isVisible ? 'block' : 'none';
                },
                attach: function attach(beforeElement) {
                  return choicesListElement.insertBefore(choiceElement, beforeElement);
                },
                detach: function detach() {
                  return choicesListElement.removeChild(choiceElement);
                }
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
        isChoicesVisible: function isChoicesVisible() {
          return choicesElement.style.display != 'none';
        },
        setChoicesVisible: function setChoicesVisible(visible) {
          choicesElement.style.display = visible ? 'block' : 'none';
        },
        updatePopupLocation: function updatePopupLocation() {}
      };
    }

    function SpecialPicksEventsAspect() {
      return {
        backSpace: function backSpace(pick) {
          pick.setSelectedFalse();
        }
      };
    }

    function OnChangeAspect(staticDom, name) {
      return {
        onChange: function onChange() {
          staticDom.trigger(name);
        }
      };
    }

    function ChoicesEnumerableAspect(countableChoicesList, getNext) {
      return {
        forEach: function forEach(f) {
          var wrap = countableChoicesList.getHead();

          while (wrap) {
            f(wrap);
            wrap = getNext(wrap);
          }
        }
      };
    }

    function NavigateManager(list, getPrev, getNext) {
      return {
        navigate: function navigate(down, wrap
        /* hoveredChoice */
        ) {
          if (down) {
            return wrap ? getNext(wrap) : list.getHead();
          } else {
            return wrap ? getPrev(wrap) : list.getTail();
          }
        },
        getCount: function getCount() {
          return list.getCount();
        },
        getHead: function getHead() {
          return list.getHead();
        }
      };
    }
    function FilterPredicateAspect() {
      return {
        filterPredicate: function filterPredicate(wrap, text) {
          return wrap.choice.searchText.indexOf(text) >= 0;
        }
      };
    }
    function FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect) {
      var showEmptyFilter = true;
      var filterText = "";
      return {
        getNavigateManager: function getNavigateManager() {
          return showEmptyFilter ? emptyNavigateManager : filteredNavigateManager;
        },
        processEmptyInput: function processEmptyInput() {
          // redefined in PlaceholderPulgin, HighlightPlugin
          showEmptyFilter = true;
          filterText = "";
          choicesEnumerableAspect.forEach(function (wrap) {
            wrap.choice.choiceDomManagerHandlers.setVisible(true);
          });
        },
        getFilter: function getFilter() {
          return filterText;
        },
        setFilter: function setFilter(text) {
          // redefined in  HighlightPlugin
          showEmptyFilter = false;
          filterText = text;
          filteredChoicesList.reset();
          choicesEnumerableAspect.forEach(function (wrap) {
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
        buildAndAttachChoice: function buildAndAttachChoice(wrap, getNextElement) {
          produceChoiceAspect.produceChoice(wrap);
          wrap.choice.choiceDomManagerHandlers.attach(getNextElement == null ? void 0 : getNextElement());
        }
      };
    }
    function ProduceChoiceAspect(choicesDom, choiceDomFactory) {
      return {
        // 1 overrided in highlight and option disable plugins
        // 2 call in HiddenPlugin (create)
        // 3 overrided in layout: pick created, choice.choiceDomManagerHandlers.detach updated to remove pick
        produceChoice: function produceChoice(wrap) {
          var _choicesDom$createCho = choicesDom.createChoiceElement(),
              choiceElement = _choicesDom$createCho.choiceElement,
              attach = _choicesDom$createCho.attach,
              detach = _choicesDom$createCho.detach,
              setVisible = _choicesDom$createCho.setVisible;

          var choice = wrap.choice;
          choice.wrap = wrap;
          choice.choiceDom = {
            choiceElement: choiceElement
          };
          var choiceDomManagerHandlers = {
            attach: attach,
            detach: detach,
            setVisible: setVisible // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item

          };
          choice.choiceDomManagerHandlers = choiceDomManagerHandlers;
          choiceDomFactory.create(choice); // added by "navigation (by mouse and arrows) plugin"

          choice.isHoverIn = false; // internal state

          choice.setHoverIn = function (v) {
            choice.isHoverIn = v;
            choiceDomManagerHandlers.updateHoverIn();
          };

          choice.dispose = composeSync(function () {
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

          wrap.dispose = function () {
            choice.dispose();
            wrap.dispose = null;
          };

          return choice;
        }
      };
    }

    function OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps) {
      return {
        attach: function attach(option) {
          var wrap = createWrapAspect.createWrap(option);
          wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
          wraps.push(wrap); // note: before attach because attach need it for navigation management

          buildAndAttachChoiceAspect.buildAndAttachChoice(wrap); //wraps.push(wrap);
        }
      };
    }
    function OptionsLoopAspect(dataWrap, optionAttachAspect) {
      return {
        loop: function loop() {
          var options = dataWrap.getOptions();

          for (var i = 0; i < options.length; i++) {
            var option = options[i];
            optionAttachAspect.attach(option);
          }
        }
      };
    }

    function UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect) {
      return {
        updateData: function updateData() {
          // close drop down , remove filter
          resetLayoutAspect.resetLayout();
          choicesDom.choicesListElement.innerHTML = ""; // TODO: there should better "optimization"

          wraps.clear();
          picksList.forEach(function (pick) {
            return pick.dispose();
          });
          picksList.reset();
          optionsLoopAspect.loop();
        }
      };
    }
    function UpdateAspect(updateDataAspect) {
      return {
        update: function update() {
          updateDataAspect.updateData();
        }
      };
    }

    // no overrides (not an aspect, just )
    function CreateChoiceBaseAspect(dataWrap) {
      return {
        createChoiceBase: function createChoiceBase(option) {
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
        createWrap: function createWrap(option) {
          return {
            option: option
          };
        }
      };
    }

    function ProducePickAspect(picksDom, pickDomFactory) {
      return {
        // overrided by DisableOptionPlugin
        producePick: function producePick(wrap) {
          var _picksDom$createPickE = picksDom.createPickElement(),
              pickElement = _picksDom$createPickE.pickElement,
              attach = _picksDom$createPickE.attach,
              detach = _picksDom$createPickE.detach;

          var pickDom = {
            pickElement: pickElement
          };
          var pickDomManagerHandlers = {
            attach: attach,
            detach: detach
          };
          var pick = {
            wrap: wrap,
            pickDom: pickDom,
            pickDomManagerHandlers: pickDomManagerHandlers,
            dispose: function dispose() {
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
      var hoveredChoice = null;
      return {
        getHoveredChoice: function getHoveredChoice() {
          return hoveredChoice;
        },
        setHoveredChoice: function setHoveredChoice(wrap) {
          hoveredChoice = wrap;
        },
        resetHoveredChoice: function resetHoveredChoice() {
          if (hoveredChoice) {
            hoveredChoice.choice.setHoverIn(false);
            hoveredChoice = null;
          }
        }
      };
    }
    function NavigateAspect(hoveredChoiceAspect, _navigate) {
      return {
        hoverIn: function hoverIn(wrap) {
          hoveredChoiceAspect.resetHoveredChoice();
          hoveredChoiceAspect.setHoveredChoice(wrap);
          wrap.choice.setHoverIn(true);
        },
        navigate: function navigate(down) {
          return _navigate(down, hoveredChoiceAspect.getHoveredChoice());
        }
      };
    }

    function Wraps(wrapsCollection, listFacade_reset, listFacade_remove, listFacade_add) {
      return {
        push: function push(wrap) {
          return _push(wrap, wrapsCollection, listFacade_add);
        },
        insert: function insert(key, wrap) {
          return _insert(key, wrap, wrapsCollection, listFacade_add);
        },
        remove: function remove(key) {
          var wrap = wrapsCollection.remove(key);
          listFacade_remove(wrap);
          return wrap;
        },
        clear: function clear() {
          wrapsCollection.reset();
          listFacade_reset();
        },
        dispose: function dispose() {
          return wrapsCollection.forLoop(function (wrap) {
            return wrap.dispose();
          });
        }
      };
    }

    function _push(wrap, wrapsCollection, listFacade_add) {
      wrapsCollection.push(wrap);
      listFacade_add(wrap);
    }

    function _insert(key, wrap, wrapsCollection, listFacade_add) {
      if (key >= wrapsCollection.getCount()) {
        _push(wrap, wrapsCollection, listFacade_add);
      } else {
        wrapsCollection.add(wrap, key);
        listFacade_add(wrap, key);
      }
    }

    function InputAspect(filterDom, filterManagerAspect) {
      return {
        // overrided in SelectedOptionPlugin
        processInput: function processInput() {
          var filterInputValue = filterDom.getValue();
          var text = filterInputValue.trim();
          var isEmpty = false;
          if (text == '') isEmpty = true;else {
            filterManagerAspect.setFilter(text.toLowerCase());
          }

          if (!isEmpty) {
            if (filterManagerAspect.getNavigateManager().getCount() == 1) {
              // todo: move exact match to filterManager
              var fullMatchWrap = filterManagerAspect.getNavigateManager().getHead();

              var _text = filterManagerAspect.getFilter();

              if (fullMatchWrap.choice.searchText == _text) {
                var success = fullMatchWrap.choice.fullMatch();

                if (success) {
                  filterDom.setEmpty();
                  isEmpty = true;
                }
              }
            }
          }

          return {
            filterInputValue: filterInputValue,
            isEmpty: isEmpty
          };
        }
      };
    }

    function ResetFilterListAspect(filterDom, filterManagerAspect) {
      return {
        forceResetFilter: function forceResetFilter() {
          // over in PlaceholderPlugin
          filterDom.setEmpty();
          filterManagerAspect.processEmptyInput(); // over in PlaceholderPlugin
        }
      };
    }
    function ResetFilterAspect(filterDom, resetFilterListAspect) {
      return {
        resetFilter: function resetFilter() {
          // call in OptionsApiPlugin
          if (!filterDom.isEmpty()) // call in Placeholder
            resetFilterListAspect.forceResetFilter(); // over in Placeholder
        }
      };
    }
    function FocusInAspect(picksDom) {
      return {
        setFocusIn: function setFocusIn(focus) {
          // call in OptionsApiPlugin
          picksDom.setIsFocusIn(focus); // unique call, call BsAppearancePlugin

          picksDom.toggleFocusStyling(); // over BsAppearancePlugin
        }
      };
    }

    function MultiSelectInlineLayoutAspect(environment, filterDom, choicesDom, choicesVisibilityAspect, hoveredChoiceAspect, navigateAspect, filterManagerAspect, focusInAspect, picksList, inputAspect, specialPicksEventsAspect, produceChoiceAspect, resetLayoutAspect, picksElementAspect, afterInputAspect, disposeAspect, pickDomFactory) {
      //return  
      var choicesElement = choicesDom.choicesElement;
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

      var preventDefaultClickEvent = null; // state

      function setPreventDefaultClickEvent(event) {
        preventDefaultClickEvent = event;
      } // TODO: remove setTimeout: set on start of mouse event reset on end


      function skipoutAndResetMousedown() {
        skipoutMousedown();
        window.setTimeout(function () {
          return resetSkipFocusout();
        });
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
        return function (event) {
          window.setTimeout(function () {
            return removeOnButton(event);
          });
          setPreventDefaultClickEvent(event);
          resetLayoutAspect.resetLayout();
        };
      }

      var mouseCandidateEventBinder = EventBinder();

      var resetMouseCandidateChoice = function resetMouseCandidateChoice() {
        mouseCandidateEventBinder.unbind();
      };

      var mouseOverToHoveredAndReset = function mouseOverToHoveredAndReset(wrap) {
        if (!wrap.choice.isHoverIn) navigateAspect.hoverIn(wrap);
        resetMouseCandidateChoice();
      };

      function adoptChoiceElement(wrap) {
        var choiceElement = wrap.choice.choiceDom.choiceElement; // in chrome it happens on "become visible" so we need to skip it, 
        // for IE11 and edge it doesn't happens, but for IE11 and Edge it doesn't happens on small 
        // mouse moves inside the item. 
        // https://stackoverflow.com/questions/59022563/browser-events-mouseover-doesnt-happen-when-you-make-element-visible-and-mous

        var onChoiceElementMouseover = function onChoiceElementMouseover() {
          if (eventLoopFlag.get()) {
            resetMouseCandidateChoice();
            mouseCandidateEventBinder.bind(choiceElement, 'mousemove', function () {
              return mouseOverToHoveredAndReset(wrap);
            });
            mouseCandidateEventBinder.bind(choiceElement, 'mousedown', function () {
              return mouseOverToHoveredAndReset(wrap);
            });
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


        var onChoiceElementMouseleave = function onChoiceElementMouseleave() {
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
        var visibleCount = filterManagerAspect.getNavigateManager().getCount();

        if (visibleCount > 0) {
          afterInputAspect.visible(showChoices, visibleCount);
        } else {
          afterInputAspect.notVisible(hideChoices);
        }
      }

      function keyDownArrow(down) {
        var wrap = navigateAspect.navigate(down);

        if (wrap) {
          // TODO: next line should be moved to planned  "HeightAndScroll" plugin, actual only for scrolling with keyDown functionality
          eventLoopFlag.set(400); // means disable mouse handlers that set hovered choice item; arrowDown can intiate scrolling when scrolling can itiate mouse leave on hovered item; this stops it

          navigateAspect.hoverIn(wrap); // !

          showChoices();
        }
      }

      function hoveredToSelected() {
        var hoveredWrap = hoveredChoiceAspect.getHoveredChoice();

        if (hoveredWrap) {
          var wasToggled = hoveredWrap.choice.tryToggleChoice();

          if (wasToggled) {
            resetLayoutAspect.resetLayout();
          }
        }
      } // TODO: bind it more declarative way? (compact code)


      var onKeyDown = function onKeyDown(event) {
        var keyCode = event.which;
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
            var pick = picksList.getTail();

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

      var onKeyUp = function onKeyUp(event) {
        var keyCode = event.which; //var handler = keyUp[event.which/* key code */];
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
        layout: function layout() {
          filterDom.onFocusIn(function () {
            return focusInAspect.setFocusIn(true);
          });
          filterDom.onFocusOut(function () {
            if (!getSkipFocusout()) {
              // skip initiated by mouse click (we manage it different way)
              resetLayoutAspect.resetLayout(); // if do not do this we will return to filtered list without text filter in input

              focusInAspect.setFocusIn(false);
            }

            resetSkipFocusout();
          });
          filterDom.onInput(function () {
            var _inputAspect$processI = inputAspect.processInput(),
                filterInputValue = _inputAspect$processI.filterInputValue,
                isEmpty = _inputAspect$processI.isEmpty;

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

          pickDomFactory.create = function (pick) {
            origCreatePickDomFactory(pick);

            if (pick.removeOnButton) {
              var origRemoveOnButton = pick.removeOnButton;
              pick.removeOnButton = composeOnRemoveButtonEventHandler(origRemoveOnButton);
            }
          };

          var origProduceChoice = produceChoiceAspect.produceChoice;

          produceChoiceAspect.produceChoice = function (wrap) {
            origProduceChoice(wrap);
            var pickHandlers = wrap.choice.addPickForChoice(); // note pickHandlers.removeAndDispose not exist (till produce is created)

            wrap.choice.choiceDomManagerHandlers.detach = composeSync(wrap.choice.choiceDomManagerHandlers.detach, function () {
              if (pickHandlers.removeAndDispose) {
                pickHandlers.removeAndDispose();
                pickHandlers.removeAndDispose = null;
              }
            });
            wrap.choice.choiсeClick = composeSync(wrap.choice.choiсeClick, function () {
              return filterDom.setFocus();
            });
            var unbindChoiceElement = adoptChoiceElement(wrap);
            wrap.choice.dispose = composeSync(unbindChoiceElement, wrap.choice.dispose);
          };

          disposeAspect.dispose = composeSync(disposeAspect.dispose, resetMouseCandidateChoice, function () {
            return picksElementAspect.unbind();
          });
        }
      };
    }

    function ResetLayoutAspect(resetFilterAspect) {
      return {
        resetLayout: function resetLayout() {
          resetFilterAspect.resetFilter();
        }
      };
    }

    function LoadAspect(optionsLoopAspect) {
      return {
        load: function load() {
          // redriven in AppearancePlugin, FormRestoreOnBackwardPlugin
          optionsLoopAspect.loop();
        }
      };
    }

    function CountableChoicesListInsertAspect(wrapsCollection, countableChoicesList) {
      return {
        countableChoicesListInsert: function countableChoicesListInsert(wrap, key) {
          var choiceNext = wrapsCollection.getNext(key);
          countableChoicesList.add(wrap, choiceNext);
        }
      };
    }

    function PicksElementAspect(picksElement) {
      var componentDisabledEventBinder = EventBinder();
      var skipoutAndResetMousedownEventBinder = EventBinder();
      return {
        containsAndSelf: function containsAndSelf$1(element) {
          return containsAndSelf(picksElement, element);
        },
        onClickUnbind: function onClickUnbind() {
          componentDisabledEventBinder.unbind();
        },
        onClick: function onClick(handler) {
          componentDisabledEventBinder.bind(picksElement, "click", handler);
        },
        onMousedown: function onMousedown(handler) {
          skipoutAndResetMousedownEventBinder.bind(picksElement, "mousedown", handler);
        },
        unbind: function unbind() {
          skipoutAndResetMousedownEventBinder.unbind();
          componentDisabledEventBinder.unbind();
        }
      };
    }

    function AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect) {
      return {
        visible: function visible(showChoices, visibleCount) {
          var panelIsVisble = choicesVisibilityAspect.isChoicesVisible();

          if (!panelIsVisble) {
            showChoices();
          }

          if (visibleCount == 1) {
            navigateAspect.hoverIn(filterManagerAspect.getNavigateManager().getHead());
          } else {
            if (panelIsVisble) hoveredChoiceAspect.resetHoveredChoice();
          }
        },
        notVisible: function notVisible(hideChoices) {
          if (choicesVisibilityAspect.isChoicesVisible()) {
            hideChoices();
          }
        }
      };
    }

    function ShowErrorAspect(staticDom) {
      return {
        showError: function showError(error) {
          var createElementAspect = staticDom.createElementAspect,
              initialElement = staticDom.initialElement;
          var errorElement = createElementAspect.createElement('SPAN');
          errorElement.style.backgroundColor = 'red';
          errorElement.style.color = 'white';
          errorElement.style.block = 'inline-block';
          errorElement.style.padding = '0.2rem 0.5rem';
          errorElement.textContent = 'BsMultiSelect ' + error.toString();
          initialElement.parentNode.insertBefore(errorElement, initialElement.nextSibling);
        }
      };
    }

    function BsMultiSelect$1(initialElement, environment, pluginManager, configuration) {
      var css = configuration.css,
          getText = configuration.getText,
          containerClass = configuration.containerClass,
          options = configuration.options;
      var trigger = environment.trigger;
      var createElementAspect = CreateElementAspect(function (name) {
        return environment.window.document.createElement(name);
      }, function (element, html) {
        return element.innerHTML = html;
      }, function (element, html) {
        var newElement = new environment.window.DOMParser().parseFromString(html, 'text/html').body.children[0];
        element.parentNode.insertBefore(newElement, element.nextSibling);
      });
      var dataWrap = {};
      var staticDom = {
        initialElement: initialElement,
        css: css,
        createElementAspect: createElementAspect,
        containerClass: containerClass
      };
      var staticDomFactory = StaticDomFactory(staticDom);
      var picksDomFactory = PicksDomFactory(staticDom);
      var filterDomFactory = FilterDomFactory(staticDom);
      var choicesDomFactory = ChoicesDomFactory(staticDom);
      dataWrap.getText = getText != null ? getText : function (option) {
        return option.text;
      };

      dataWrap.getOptions = function () {
        return options;
      };

      staticDom.trigger = function (eventName) {
        return trigger(initialElement, eventName);
      };

      var pickDomFactory = PickDomFactory(css, staticDom.createElementAspect, dataWrap); // overrided in CustomPickStylingsPlugin, DisableComponentPlugin

      var choiceDomFactory = ChoiceDomFactory(css, staticDom.createElementAspect, dataWrap); // overrided in CustomChoicesStylingsPlugin, HighlightPlugin

      staticDom.environment = environment;
      staticDom.showErrorAspect = ShowErrorAspect(staticDom);

      try {
        var eventHandlers = pluginManager.createHandlers();
        return BsMultiSelectImpl(dataWrap, staticDom, staticDomFactory, picksDomFactory, filterDomFactory, choicesDomFactory, pickDomFactory, choiceDomFactory, eventHandlers);
      } catch (error) {
        staticDom.showErrorAspect.showError(error);
        throw error;
      }
    }
    function BsMultiSelectImpl(dataWrap, staticDom, staticDomFactory, picksDomFactory, filterDomFactory, choicesDomFactory, pickDomFactory, choiceDomFactory, eventHandlers) {
      var _eventHandlers$layout;

      var onChangeAspect = OnChangeAspect(staticDom, 'dashboardcode.multiselect:change');
      var disposeAspect = {
        dispose: function dispose() {}
      };
      eventHandlers.dom({
        showErrorAspect: staticDom.showErrorAspect,
        environment: staticDom.environment,
        onChangeAspect: onChangeAspect,
        disposeAspect: disposeAspect,
        staticDomFactory: staticDomFactory,
        choicesDomFactory: choicesDomFactory,
        filterDomFactory: filterDomFactory,
        picksDomFactory: picksDomFactory,
        staticDom: staticDom,
        dataWrap: dataWrap
      }); // --- --- --- --- --- --- --- --- --- --- --- --- --- ---

      var _staticDomFactory$cre = staticDomFactory.createStaticDom(),
          staticManager = _staticDomFactory$cre.staticManager;

      var choicesDom = choicesDomFactory.create();
      var picksDom = picksDomFactory.create();
      var filterDom = filterDomFactory.create();
      staticDom.choicesDom = choicesDom;
      staticDom.picksDom = picksDom;
      staticDom.filterDom = filterDom; // --- --- --- --- --- --- --- --- --- --- --- --- --- ---

      var producePickAspect = ProducePickAspect(picksDom, pickDomFactory);
      var picksList = List();
      var produceChoiceAspect = ProduceChoiceAspect(choicesDom, choiceDomFactory);
      var wrapsCollection = ArrayFacade();
      var countableChoicesList = DoublyLinkedList(function (wrap) {
        return wrap.choice.itemPrev;
      }, function (warp, v) {
        return warp.choice.itemPrev = v;
      }, function (wrap) {
        return wrap.choice.itemNext;
      }, function (wrap, v) {
        return wrap.choice.itemNext = v;
      });
      var countableChoicesListInsertAspect = CountableChoicesListInsertAspect(wrapsCollection, countableChoicesList);
      var wraps = Wraps(wrapsCollection, function () {
        return countableChoicesList.reset();
      }, function (w) {
        return countableChoicesList.remove(w);
      }, function (w, key) {
        return countableChoicesListInsertAspect.countableChoicesListInsert(w, key);
      }); // !!!!!!!!!!!
      //let createChoiceHandlersAspect = CreateChoiceHandlersAspect(produceChoiceAspect, wraps);

      var createWrapAspect = CreateWrapAspect();
      var createChoiceBaseAspect = CreateChoiceBaseAspect(dataWrap); //let addPickAspect = AddPickAspect();
      //--------------------------

      var choicesEnumerableAspect = ChoicesEnumerableAspect(countableChoicesList, function (wrap) {
        return wrap.choice.itemNext;
      });
      var filteredChoicesList = DoublyLinkedList(function (wrap) {
        return wrap.choice.filteredPrev;
      }, function (wrap, v) {
        return wrap.choice.filteredPrev = v;
      }, function (wrap) {
        return wrap.choice.filteredNext;
      }, function (wrap, v) {
        return wrap.choice.filteredNext = v;
      });
      var emptyNavigateManager = NavigateManager(countableChoicesList, function (wrap) {
        return wrap.choice.itemPrev;
      }, function (wrap) {
        return wrap.choice.itemNext;
      });
      var filteredNavigateManager = NavigateManager(filteredChoicesList, function (wrap) {
        return wrap.choice.filteredPrev;
      }, function (wrap) {
        return wrap.choice.filteredNext;
      });
      var filterPredicateAspect = FilterPredicateAspect();
      var filterManagerAspect = FilterManagerAspect(emptyNavigateManager, filteredNavigateManager, filteredChoicesList, choicesEnumerableAspect, filterPredicateAspect);
      var hoveredChoiceAspect = HoveredChoiceAspect();
      var navigateAspect = NavigateAspect(hoveredChoiceAspect, function (down, hoveredChoice) {
        return filterManagerAspect.getNavigateManager().navigate(down, hoveredChoice);
      }); // TODO: union to events or create event bus

      eventHandlers.plugStaticDom({
        pickDomFactory: pickDomFactory,
        choiceDomFactory: choiceDomFactory,
        countableChoicesList: countableChoicesList,
        countableChoicesListInsertAspect: countableChoicesListInsertAspect,
        wrapsCollection: wrapsCollection,
        choicesEnumerableAspect: choicesEnumerableAspect,
        filteredChoicesList: filteredChoicesList,
        filterPredicateAspect: filterPredicateAspect,
        hoveredChoiceAspect: hoveredChoiceAspect,
        navigateAspect: navigateAspect,
        filterManagerAspect: filterManagerAspect,
        createWrapAspect: createWrapAspect,
        createChoiceBaseAspect: createChoiceBaseAspect,
        picksList: picksList,
        wraps: wraps,
        //addPickAspect,
        producePickAspect: producePickAspect,
        produceChoiceAspect: produceChoiceAspect
      }); // apply selectElement support;  
      // TODO: to staticManager
      //let {staticManager, staticDom, filterDom, picksDom, choicesDom} = staticDomFactory.createStaticDom(); // overrided in SelectElementPlugin
      // after this we can use staticDom (means generated DOM elements) in plugin construtctor, what simplifies parameters passing a lot   

      var specialPicksEventsAspect = SpecialPicksEventsAspect();
      var resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
      var resetFilterAspect = ResetFilterAspect(filterDom, resetFilterListAspect);
      var focusInAspect = FocusInAspect(picksDom);
      var inputAspect = InputAspect(filterDom, filterManagerAspect
      /*, fullMatchAspect*/
      );
      var buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(produceChoiceAspect);
      var resetLayoutAspect = ResetLayoutAspect(resetFilterAspect); //!!!!!!!!!
      //createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps

      var optionAttachAspect = OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps);
      var optionsLoopAspect = OptionsLoopAspect(dataWrap, optionAttachAspect);
      var updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect);
      var loadAspect = LoadAspect(optionsLoopAspect); // !!!!!!!!!!!

      var updateAspect = UpdateAspect(updateDataAspect);
      var picksElementAspect = PicksElementAspect(picksDom.picksElement);
      var choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
      var afterInputAspect = AfterInputAspect(filterManagerAspect, navigateAspect, choicesVisibilityAspect, hoveredChoiceAspect);
      var multiSelectInlineLayoutAspect = MultiSelectInlineLayoutAspect(staticDom.environment, filterDom, choicesDom, choicesVisibilityAspect, hoveredChoiceAspect, navigateAspect, filterManagerAspect, focusInAspect, picksList, inputAspect, specialPicksEventsAspect, produceChoiceAspect, resetLayoutAspect, picksElementAspect, afterInputAspect, disposeAspect, pickDomFactory);
      eventHandlers.layout((_eventHandlers$layout = {
        picksDom: picksDom,
        choicesDom: choicesDom,
        filterDom: filterDom,
        resetLayoutAspect: resetLayoutAspect,
        choicesVisibilityAspect: choicesVisibilityAspect,
        staticManager: staticManager,
        buildAndAttachChoiceAspect: buildAndAttachChoiceAspect,
        optionsLoopAspect: optionsLoopAspect,
        optionAttachAspect: optionAttachAspect,
        inputAspect: inputAspect,
        resetFilterListAspect: resetFilterListAspect,
        resetFilterAspect: resetFilterAspect,
        specialPicksEventsAspect: specialPicksEventsAspect
      }, _eventHandlers$layout["resetLayoutAspect"] = resetLayoutAspect, _eventHandlers$layout.focusInAspect = focusInAspect, _eventHandlers$layout.loadAspect = loadAspect, _eventHandlers$layout.updateDataAspect = updateDataAspect, _eventHandlers$layout.updateAspect = updateAspect, _eventHandlers$layout.picksElementAspect = picksElementAspect, _eventHandlers$layout.afterInputAspect = afterInputAspect, _eventHandlers$layout));
      multiSelectInlineLayoutAspect.layout(); // TODO: to staticManager

      eventHandlers.append();
      var api = {
        component: "BsMultiSelect.api",
        // key to use in memory leak analyzes
        updateData: function updateData() {
          updateDataAspect.updateData();
        },
        update: function update() {
          updateAspect.update();
        }
      };
      eventHandlers.buildApi(api); // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}

      api.dispose = composeSync(resetLayoutAspect.resetLayout, function () {
        disposeAspect.dispose();
      }, eventHandlers.dispose, function () {
        picksList.forEach(function (pick) {
          return pick.dispose();
        });
      }, wraps.dispose, staticManager.dispose, function () {
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
          key: key,
          value: eventHandler.dom
        });
        if (eventHandler.plugStaticDom) plugStaticDoms.push({
          key: key,
          value: eventHandler.plugStaticDom
        });
        if (eventHandler.preLayout) preLayouts.push({
          key: key,
          value: eventHandler.preLayout
        });
        if (eventHandler.layout) layouts.push({
          key: key,
          value: eventHandler.layout
        });
        if (eventHandler.append) appends.push({
          key: key,
          value: eventHandler.append
        });
        if (eventHandler.buildApi) buildApis.push({
          key: key,
          value: eventHandler.buildApi
        });
        if (eventHandler.dispose) disposes.push({
          key: key,
          value: eventHandler.dispose
        });
      }
    }

    function ComposePluginManagerFactory(plugins, defaults, environment) {
      var plugedList = [];
      var mergeList = [];

      for (var i = 0; i < plugins.length; i++) {
        var pluged = plugins[i].value(defaults, environment);

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

      return function (configuration, settings, inlineBuildAspects) {
        var buildAspectsList = [];

        for (var _i = 0; _i < mergeList.length; _i++) {
          var merge = mergeList[_i].value;

          if (merge) {
            merge(configuration, settings);
          }
        }

        for (var j = 0; j < plugedList.length; j++) {
          var buildAspects = plugedList[j].value(configuration);

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
      var aspects = {
        environment: environment
      };

      var createHandlers = function createHandlers(newAspects) {
        extendIfUndefined(aspects, newAspects);
        var doms = [];
        var plugStaticDoms = [];
        var preLayouts = [];
        var layouts = [];
        var appends = [];
        var buildApis = [];
        var disposes = [];

        for (var k = 0; k < buildAspectsList.length; k++) {
          var eventHandler = buildAspectsList[k].value(aspects);
          parseEventHandler(buildAspectsList[k].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
        }

        return {
          dom: function dom(newAspects) {
            extendIfUndefined(aspects, newAspects);

            for (var i = 0; i < doms.length; i++) {
              var _doms$i$value, _doms$i;

              var eventHandler = (_doms$i$value = (_doms$i = doms[i]).value) == null ? void 0 : _doms$i$value.call(_doms$i);
              parseEventHandler(doms[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
            }
          },
          plugStaticDom: function plugStaticDom(newAspects) {
            extendIfUndefined(aspects, newAspects);

            for (var i = 0; i < plugStaticDoms.length; i++) {
              var _plugStaticDoms$i$val, _plugStaticDoms$i;

              var eventHandler = (_plugStaticDoms$i$val = (_plugStaticDoms$i = plugStaticDoms[i]).value) == null ? void 0 : _plugStaticDoms$i$val.call(_plugStaticDoms$i);
              parseEventHandler(plugStaticDoms[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
            }
          },
          layout: function layout(newAspects) {
            extendIfUndefined(aspects, newAspects);

            for (var i = 0; i < preLayouts.length; i++) {
              var _preLayouts$i$value, _preLayouts$i;

              var _eventHandler = (_preLayouts$i$value = (_preLayouts$i = preLayouts[i]).value) == null ? void 0 : _preLayouts$i$value.call(_preLayouts$i);

              parseEventHandler(preLayouts[i].key, _eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
            }

            for (var j = 0; j < layouts.length; j++) {
              var _layouts$j$value, _layouts$j;

              var _eventHandler2 = (_layouts$j$value = (_layouts$j = layouts[j]).value) == null ? void 0 : _layouts$j$value.call(_layouts$j);

              parseEventHandler(layouts[j].key, _eventHandler2, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
            }
          },
          append: function append() {
            for (var i = 0; i < appends.length; i++) {
              var _appends$i$value, _appends$i;

              var eventHandler = (_appends$i$value = (_appends$i = appends[i]).value) == null ? void 0 : _appends$i$value.call(_appends$i);
              parseEventHandler(appends[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
            }
          },
          buildApi: function buildApi(api) {
            for (var i = 0; i < buildApis.length; i++) {
              var _buildApis$i$value, _buildApis$i;

              var eventHandler = (_buildApis$i$value = (_buildApis$i = buildApis[i]).value) == null ? void 0 : _buildApis$i$value.call(_buildApis$i, api);
              parseEventHandler(buildApis[i].key, eventHandler, doms, plugStaticDoms, preLayouts, layouts, appends, buildApis, disposes);
            }
          },
          dispose: function dispose() {
            for (var i = 0; i < disposes.length; i++) {
              var _disposes$i$value, _disposes$i;

              (_disposes$i$value = (_disposes$i = disposes[i]).value) == null ? void 0 : _disposes$i$value.call(_disposes$i);
            }
          }
        };
      };

      return {
        aspects: aspects,
        createHandlers: createHandlers
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

      transformStyles.forEach(function (i) {
        if (settings[i.old]) {
          console.log("DashboarCode.BsMultiSelect: " + i.old + " is depricated, use - cssPatch:{" + i.opt + ":{" + i.style + ":'myValue'}}");

          if (!settings[i.opt]) {
            var opt = {};
            opt[i.style] = settings[i.old];
            settings.cssPatch[i.opt] = opt;
          }

          delete settings[i.old];
        }
      });
      transformClasses.forEach(function (i) {
        if (settings[i.old]) {
          console.log("DashboarCode.BsMultiSelect: " + i.old + " is depricated, use - css:{" + i.opt + ":'myValue'}");

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
      var defaults = {
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

      var create = function create(element, options) {
        var _settings;

        if (options && options.plugins) console.log("DashboarCode.BsMultiSelect: 'options.plugins' is depricated, use - MultiSelectBuilder(environment, plugins) instead");
        var buildConfiguration;
        var settings;

        if (options instanceof Function) {
          buildConfiguration = options;
          settings = null;
        } else {
          buildConfiguration = options == null ? void 0 : options.buildConfiguration;
          settings = options;
        }

        if (settings) {
          adjustLegacySettings(settings);
        }

        var configuration = {};
        configuration.css = createCss(defaults.css, (_settings = settings) == null ? void 0 : _settings.css);
        extendIfUndefined(configuration, settings); // next line: merging of cssPatch will be delayed to the CssPatchPlugin merge handler

        extendIfUndefined(configuration, defaults);
        var inlineBuildAspectsList = buildConfiguration == null ? void 0 : buildConfiguration(element, configuration); // next line merges settings.cssPatch and defaults.cssPatch also merge defaults.css and defaults.cssPatch 

        var pluginManager = pluginManagerFactory(configuration, settings, inlineBuildAspectsList); // now we can freeze configuration object

        Object.freeze(configuration);
        var multiSelect = BsMultiSelect$1(element, environment, pluginManager, configuration);
        return multiSelect;
      };

      return {
        create: create,
        defaultSettings: defaults
      };
    }

    function createForJQuery(window, $, globalPopper, name, plugins, defaultCss) {
      var trigger = null;
      var isJQyery = $ && !window.document.body.hasAttribute('data-bs-no-jquery');

      if (isJQyery) {
        trigger = function trigger(e, eventName) {
          return $(e).trigger(eventName);
        };
      } else {
        trigger = composeEventTrigger(window);
      }

      var isIE11 = !!window.MSInputMethodContext && !!window.document.documentMode;
      var environment = {
        trigger: trigger,
        window: window,
        globalPopper: globalPopper,
        isIE11: isIE11
      };
      var pluginsArray = ObjectValuesEx(plugins);

      var _MultiSelectBuilder = MultiSelectBuilder(environment, pluginsArray, defaultCss),
          create = _MultiSelectBuilder.create,
          defaultSettings = _MultiSelectBuilder.defaultSettings;

      var createForUmd = function createForUmd(element, settings) {
        if (isString(element)) element = window.document.querySelector(element);
        return create(element, settings);
      };

      createForUmd.Default = defaultSettings;

      if (isJQyery) {
        var constructorForJquery = function constructorForJquery(element, settings, removeInstanceData) {
          var multiSelect = create(element, settings);
          multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData);
          return multiSelect;
        };

        var prototypable = addToJQueryPrototype(name, constructorForJquery, $);
        prototypable.defaults = defaultSettings;
      }

      return createForUmd;
    }

    function BsAppearancePlugin() {
      return {
        plug: plug$p
      };
    }
    function plug$p(configuration) {
      var getSizeComponentAspect = {};
      var getValidityComponentAspect = {};
      return function (aspects) {
        aspects.getSizeComponentAspect = getSizeComponentAspect;
        aspects.getValidityComponentAspect = getValidityComponentAspect;
        return {
          // TODO1, LabelElement should be moved to StaticDomFactory and staticDom 
          // NOTE: preLayout means first after createStaticDom
          preLayout: function preLayout() {
            var getLabelAspect = aspects.getLabelAspect,
                staticDom = aspects.staticDom;
            var selectElement = staticDom.selectElement;
            var getDefaultLabel = configuration.getDefaultLabel;
            var origLabelAspectGetLabel = getLabelAspect.getLabel;

            getLabelAspect.getLabel = function () {
              var e = origLabelAspectGetLabel();
              if (e) return e;else {
                if (selectElement) {
                  var labelElement = getDefaultLabel(selectElement);
                  return labelElement;
                }
              }
            };
          },
          layout: function layout() {
            var validationApiAspect = aspects.validationApiAspect,
                picksDom = aspects.picksDom,
                staticDom = aspects.staticDom,
                updateAppearanceAspect = aspects.updateAppearanceAspect,
                floatingLabelAspect = aspects.floatingLabelAspect;
            var getValidity = configuration.getValidity,
                getSize = configuration.getSize,
                useCssPatch = configuration.useCssPatch,
                css = configuration.css,
                composeGetSize = configuration.composeGetSize;
            var selectElement = staticDom.selectElement,
                initialElement = staticDom.initialElement;
            var isFloatingLabel = false;

            if (floatingLabelAspect) {
              isFloatingLabel = closestByClassName(initialElement, 'form-floating');

              floatingLabelAspect.isFloatingLabel = function () {
                return isFloatingLabel;
              };
            }

            if (selectElement) {
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

            getSizeComponentAspect.getSize = getSize;
            getValidityComponentAspect.getValidity = getValidity;
            var updateSize;

            if (!useCssPatch) {
              updateSize = function updateSize() {
                return updateSizeForAdapter(picksDom.picksElement, getSize);
              };
            } else {
              var picks_lg = css.picks_lg,
                  picks_sm = css.picks_sm,
                  picks_def = css.picks_def,
                  picks_floating_def = css.picks_floating_def;
              if (isFloatingLabel) picks_lg = picks_sm = picks_def = picks_floating_def;

              updateSize = function updateSize() {
                return updateSizeJsForAdapter(picksDom.picksElement, picks_lg, picks_sm, picks_def, getSize);
              };
            }

            if (useCssPatch) {
              var origToggleFocusStyling = picksDom.toggleFocusStyling;

              picksDom.toggleFocusStyling = function () {
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

            var getWasValidated = function getWasValidated() {
              var wasValidatedElement = closestByClassName(initialElement, 'was-validated');
              return wasValidatedElement ? true : false;
            };

            var wasUpdatedObservable = ObservableLambda(function () {
              return getWasValidated();
            });
            var getManualValidationObservable = ObservableLambda(function () {
              return getValidity();
            });
            var validationObservable = ObservableLambda(function () {
              return wasUpdatedObservable.getValue() ? validationApiAspect.getValue() : getManualValidationObservable.getValue();
            });
            validationObservable.attach(function (value) {
              var _getMessagesElements = getMessagesElements(staticDom.containerElement),
                  validMessages = _getMessagesElements.validMessages,
                  invalidMessages = _getMessagesElements.invalidMessages;

              updateValidity(picksDom.picksElement, validMessages, invalidMessages, value);
              picksDom.toggleFocusStyling();
            });
            wasUpdatedObservable.attach(function () {
              return validationObservable.call();
            });
            if (validationApiAspect) validationApiAspect.attach(function () {
              return validationObservable.call();
            });
            getManualValidationObservable.attach(function () {
              return validationObservable.call();
            });
            updateAppearanceAspect.updateAppearance = composeSync(updateAppearanceAspect.updateAppearance, updateSize, validationObservable.call, getManualValidationObservable.call);
            return {
              buildApi: function buildApi(api) {
                api.updateSize = updateSize;

                api.updateValidity = function () {
                  return getManualValidationObservable.call();
                };

                api.updateWasValidated = function () {
                  return wasUpdatedObservable.call();
                };
              },
              dispose: function dispose() {
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

    function BsAppearanceBs5Plugin(defaults) {
      defaults.composeGetSize = composeGetSize; // BsAppearancePlugin

      defaults.getDefaultLabel = getDefaultLabel; // FloatingLabelPlugin, BsAppearancePlugin

      return BsAppearancePlugin();
    }

    function composeGetSize(element) {
      var inputGroupElement = closestByClassName(element, 'input-group');
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
          if (element.classList.contains('form-select-lg') || element.classList.contains('form-control-lg')) // changed for BS
            value = 'lg';else if (element.classList.contains('form-select-sm') || element.classList.contains('form-control-sm')) value = 'sm';
          return value;
        };
      }

      return getSize;
    }

    function getDefaultLabel(element) {
      var value = null;
      var query = "label[for=\"" + element.id + "\"]";
      var p1 = element.parentElement;
      value = p1.querySelector(query); // label can be wrapped into col-auto

      if (!value) {
        var p2 = p1.parentElement;
        value = p2.querySelector(query);
      }

      return value;
    }

    function BsAppearanceBs5CssPatchPlugin(defaults) {
      var cssPatch = defaults.cssPatch;
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
        plug: plug$o
      };
    }
    function plug$o(configuration) {
      var getLabelAspect = {
        getLabel: function getLabel() {
          return defCall(configuration.label);
        }
      };
      var createFilterInputElementIdAspect = {
        createFilterInputElementId: function createFilterInputElementId() {
          return defCall(configuration.filterInputElementId);
        }
      };
      return function (aspects) {
        aspects.getLabelAspect = getLabelAspect;
        aspects.createFilterInputElementIdAspect = createFilterInputElementIdAspect;
        return {
          layout: function layout() {
            var filterDom = aspects.filterDom,
                loadAspect = aspects.loadAspect,
                disposeAspect = aspects.disposeAspect,
                staticDom = aspects.staticDom;
            loadAspect.load = composeSync(loadAspect.load, function () {
              var filterInputElement = filterDom.filterInputElement;
              var labelElement = getLabelAspect.getLabel();

              if (labelElement) {
                var backupedForAttribute = labelElement.getAttribute('for');
                var inputId = createFilterInputElementIdAspect.createFilterInputElementId();

                if (!inputId) {
                  var containerClass = configuration.containerClass;
                  var containerElement = staticDom.containerElement;
                  inputId = containerClass + "-generated-filter-" + containerElement.id;
                }

                filterInputElement.setAttribute('id', inputId);
                labelElement.setAttribute('for', inputId);

                if (backupedForAttribute) {
                  disposeAspect.dispose = composeSync(disposeAspect.dispose, function () {
                    return labelElement.setAttribute('for', backupedForAttribute);
                  });
                }
              }
            });
          }
        };
      };
    }

    function RtlPlugin() {
      return {
        plug: plug$n
      };
    }
    function plug$n(configuration) {
      return function (aspects) {
        return {
          layout: function layout() {
            var popperRtlAspect = aspects.popperRtlAspect,
                staticDom = aspects.staticDom;
            var isRtl = configuration.isRtl;
            var forceRtlOnContainer = false;
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

            if (popperRtlAspect) popperRtlAspect.getIsRtl = function () {
              return isRtl;
            };
            return {
              dispose: function dispose() {
                attributeBackup.restore();
              }
            };
          }
        };
      };
    }

    function FormResetPlugin() {
      return {
        plug: plug$m
      };
    }
    function plug$m() {
      return function (aspects) {
        return {
          layout: function layout() {
            var staticDom = aspects.staticDom,
                updateDataAspect = aspects.updateDataAspect,
                environment = aspects.environment;
            var eventBuilder = EventBinder();

            if (staticDom.selectElement) {
              var form = closestByTagName(staticDom.selectElement, 'FORM');

              if (form) {
                eventBuilder.bind(form, 'reset', function () {
                  return environment.window.setTimeout(function () {
                    return updateDataAspect.updateData();
                  });
                });
              }
            }

            return {
              dispose: function dispose() {
                eventBuilder.unbind();
              }
            };
          }
        };
      };
    }

    var defValueMissingMessage = 'Please select an item in the list';
    function ValidationApiPlugin(defaults) {
      preset$4(defaults);
      return {
        plug: plug$l
      };
    }
    function preset$4(defaults) {
      defaults.getValueRequired = function () {
        return false;
      };

      defaults.valueMissingMessage = '';
    }
    function plug$l(configuration) {
      var required = configuration.required,
          getValueRequired = configuration.getValueRequired,
          getIsValueMissing = configuration.getIsValueMissing,
          valueMissingMessage = configuration.valueMissingMessage;
      var getValueRequiredAspect = GetValueRequiredAspect(required, getValueRequired);
      return function (aspects) {
        aspects.getValueRequiredAspect = getValueRequiredAspect;
        return {
          plugStaticDom: function plugStaticDom() {
            var dataWrap = aspects.dataWrap,
                staticDom = aspects.staticDom;
            var valueMissingMessageEx = defCall(valueMissingMessage, function () {
              return getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "value-missing-message");
            }, defValueMissingMessage);

            if (!getIsValueMissing) {
              getIsValueMissing = function getIsValueMissing() {
                var count = 0;
                var optionsArray = dataWrap.getOptions();

                for (var i = 0; i < optionsArray.length; i++) {
                  if (optionsArray[i].selected) count++;
                }

                return count === 0;
              };
            }

            return {
              preLayout: function preLayout() {
                // getValueRequiredAspect redefined on appendToContainer, so this can't be called on prelayout and layout
                var isValueMissingObservable = ObservableLambda(function () {
                  return getValueRequiredAspect.getValueRequired() && getIsValueMissing();
                });
                var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());
                aspects.validationApiAspect = ValidationApiAspect(validationApiObservable); // used in BsAppearancePlugin layout, possible races

                return {
                  layout: function layout() {
                    var onChangeAspect = aspects.onChangeAspect,
                        updateDataAspect = aspects.updateDataAspect; // TODO: required could be a function
                    //let {valueMissingMessage} = configuration;

                    onChangeAspect.onChange = composeSync(isValueMissingObservable.call, onChangeAspect.onChange);
                    updateDataAspect.updateData = composeSync(isValueMissingObservable.call, updateDataAspect.updateData);
                    return {
                      buildApi: function buildApi(api) {
                        var staticDom = aspects.staticDom,
                            filterDom = aspects.filterDom;
                        api.validationApi = ValidityApi(filterDom.filterInputElement, // !!
                        isValueMissingObservable, valueMissingMessageEx, function (isValid) {
                          return validationApiObservable.setValue(isValid);
                        }, staticDom.trigger);
                      }
                    };
                  },
                  dispose: function dispose() {
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
        getValueRequired: function getValueRequired() {
          var value = false;
          if (!isBoolean(required)) if (getValueRequiredCfg) value = getValueRequiredCfg();
          return value;
        }
      };
    }

    function ValidationApiAspect(validationApiObservable) {
      return {
        getValue: function getValue() {
          return validationApiObservable.getValue();
        },
        attach: function attach(f) {
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
          valueMissing: valueMissing,
          customError: customError,
          valid: !(valueMissing || customError)
        });
        validationMessage = customError ? customValidationMessage : valueMissing ? valueMissingMessage : "";
        visibleElement.setCustomValidity(validationMessage);
        onValid(validity.valid);
      }

      setMessage(isValueMissingObservable.getValue(), false);
      isValueMissingObservable.attach(function (value) {
        setMessage(value, validity.customError);
      });

      var checkValidity = function checkValidity() {
        if (!validity.valid) trigger('dashboardcode.multiselect:invalid');
        return validity.valid;
      };

      return {
        validationMessage: validationMessage,
        willValidate: willValidate,
        validity: validity,
        setCustomValidity: function setCustomValidity(message) {
          customValidationMessage = message;
          setMessage(validity.valueMissing, customValidationMessage ? true : false);
        },
        checkValidity: checkValidity,
        reportValidity: function reportValidity() {
          visibleElement.reportValidity();
          return checkValidity();
        }
      };
    }

    function HiddenOptionPlugin() {
      return {
        plug: plug$k
      };
    }
    function plug$k(configuration) {
      return function (aspects) {
        return {
          layout: function layout() {
            var createWrapAspect = aspects.createWrapAspect,
                isChoiceSelectableAspect = aspects.isChoiceSelectableAspect,
                wrapsCollection = aspects.wrapsCollection,
                produceChoiceAspect = aspects.produceChoiceAspect,
                buildAndAttachChoiceAspect = aspects.buildAndAttachChoiceAspect,
                countableChoicesListInsertAspect = aspects.countableChoicesListInsertAspect,
                countableChoicesList = aspects.countableChoicesList;

            countableChoicesListInsertAspect.countableChoicesListInsert = function (wrap, key) {
              if (!wrap.isOptionHidden) {
                var choiceNext = wrapsCollection.getNext(key, function (c) {
                  return !c.isOptionHidden;
                });
                countableChoicesList.add(wrap, choiceNext);
              }
            };

            var origBuildAndAttachChoice = buildAndAttachChoiceAspect.buildAndAttachChoice;

            buildAndAttachChoiceAspect.buildAndAttachChoice = function (wrap, getNextElement) {
              if (wrap.isOptionHidden) {
                buildHiddenChoice(wrap);
              } else {
                origBuildAndAttachChoice(wrap, getNextElement);
              }
            };

            var origIsSelectable = isChoiceSelectableAspect.isSelectable;

            isChoiceSelectableAspect.isSelectable = function (wrap) {
              return origIsSelectable(wrap) && !wrap.isOptionHidden;
            };

            var getIsOptionHidden = configuration.getIsOptionHidden,
                options = configuration.options;

            if (options) {
              if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
                return option.hidden === undefined ? false : option.hidden;
              };
            } else {
              if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
                return option.hidden;
              };
            }

            var origCreateWrap = createWrapAspect.createWrap;

            createWrapAspect.createWrap = function (option) {
              var wrap = origCreateWrap(option);
              wrap.isOptionHidden = getIsOptionHidden(option);
              return wrap;
            };

            return {
              buildApi: function buildApi(api) {
                var getNextNonHidden = function getNextNonHidden(key) {
                  return wrapsCollection.getNext(key, function (c) {
                    return !c.isOptionHidden;
                  });
                };

                api.updateOptionsHidden = function () {
                  return wrapsCollection.forLoop(function (wrap, key) {
                    return updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, produceChoiceAspect);
                  });
                };

                api.updateOptionHidden = function (key) {
                  return updateChoiceHidden(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden, produceChoiceAspect);
                }; // TODO create updateHidden ? 
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
      wrap.updateSelected = function () {
        return void 0;
      };

      wrap.choice.choicesDom = {};
      wrap.choice.choiceDomManagerHandlers = {};
      wrap.choice.choiceDomManagerHandlers.setVisible = null;
      wrap.choice.setHoverIn = null;

      wrap.choice.dispose = function () {
        wrap.choice.dispose = null;
      };

      wrap.dispose = function () {
        wrap.choice.dispose();
        wrap.dispose = null;
      };
    }

    function updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, produceChoiceAspect) {
      var newIsOptionHidden = getIsOptionHidden(wrap.option);

      if (newIsOptionHidden != wrap.isOptionHidden) {
        wrap.isOptionHidden = newIsOptionHidden;

        if (wrap.isOptionHidden) {
          countableChoicesList.remove(wrap);
          wrap.choice.choiceDomManagerHandlers.detach();
          buildHiddenChoice(wrap);
        } else {
          var nextChoice = getNextNonHidden(key);
          countableChoicesList.add(wrap, nextChoice);
          produceChoiceAspect.produceChoice(wrap);
          wrap.choice.choiceDomManagerHandlers.attach(nextChoice == null ? void 0 : nextChoice.choice.choiceDom.choiceElement);
        }
      }
    }

    function CssPatchPlugin(defaults) {
      defaults.useCssPatch = true;
      return {
        merge: function merge(configuration, settings) {
          var cssPatch = settings == null ? void 0 : settings.cssPatch;
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
      return function (aspects) {
        return {
          layout: function layout() {
            var staticDom = aspects.staticDom,
                choicesDom = aspects.choicesDom,
                filterDom = aspects.filterDom,
                picksList = aspects.picksList,
                picksDom = aspects.picksDom;
            return {
              buildApi: function buildApi(api) {
                api.getContainer = function () {
                  return staticDom.containerElement;
                };

                api.getChoices = function () {
                  return choicesDom.choicesElement;
                };

                api.getChoicesList = function () {
                  return choicesDom.choicesListElement;
                };

                api.getFilterInput = function () {
                  return filterDom.filterInputElement;
                };

                api.getPicks = function () {
                  return picksDom.picksElement;
                };

                api.picksCount = function () {
                  return picksList.getCount();
                };
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
      return function (aspects) {
        return {
          buildApi: function buildApi(api) {
            var buildAndAttachChoiceAspect = aspects.buildAndAttachChoiceAspect,
                wraps = aspects.wraps,
                wrapsCollection = aspects.wrapsCollection,
                createWrapAspect = aspects.createWrapAspect,
                createChoiceBaseAspect = aspects.createChoiceBaseAspect,
                dataWrap = aspects.dataWrap,
                resetLayoutAspect = aspects.resetLayoutAspect;

            api.updateOptionAdded = function (key) {
              // TODO: generalize index as key 
              var options = dataWrap.getOptions();
              var option = options[key];
              var wrap = createWrapAspect.createWrap(option);
              wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
              wraps.insert(key, wrap);

              var nextChoice = function nextChoice() {
                return wrapsCollection.getNext(key, function (c) {
                  return c.choice.choiceDom.choiceElement;
                });
              };

              buildAndAttachChoiceAspect.buildAndAttachChoice(wrap, function () {
                var _nextChoice;

                return (_nextChoice = nextChoice()) == null ? void 0 : _nextChoice.choice.choiceDom.choiceElement;
              });
            };

            api.updateOptionRemoved = function (key) {
              // TODO: generalize index as key 
              resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter

              var wrap = wraps.remove(key);
              wrap.choice.choiceDomManagerHandlers.detach == null ? void 0 : wrap.choice.choiceDomManagerHandlers.detach();
              wrap.dispose == null ? void 0 : wrap.dispose();
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
      return function (aspects) {
        return {
          layout: function layout() {
            var staticDom = aspects.staticDom,
                environment = aspects.environment,
                loadAspect = aspects.loadAspect,
                updateOptionsSelectedAspect = aspects.updateOptionsSelectedAspect;
            var window = environment.window;

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
      return function (aspects) {
        return {
          data: function data(initialElement, staticDom, dataWrap, containerClass) {
            var selectElement = null;
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

              dataWrap.getOptions = function () {
                return selectElement.options;
              };
            }
          },
          dom: function dom() {
            var staticDomFactory = aspects.staticDomFactory,
                onChangeAspect = aspects.onChangeAspect,
                dataWrap = aspects.dataWrap,
                disposeAspect = aspects.disposeAspect,
                staticDom = aspects.staticDom,
                showErrorAspect = aspects.showErrorAspect,
                getValueRequiredAspect = aspects.getValueRequiredAspect,
                createFilterInputElementIdAspect = aspects.createFilterInputElementIdAspect,
                optGroupAspect = aspects.optGroupAspect,
                disabledComponentAspect = aspects.disabledComponentAspect;
            var createElementAspect = staticDom.createElementAspect,
                initialElement = staticDom.initialElement;
            var containerClass = configuration.containerClass;
            var origCreateStaticDom = staticDomFactory.createStaticDom;

            staticDomFactory.createStaticDom = function () {
              var selectElement = null;
              var containerElement = null;

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

              var picksElement = null;
              if (containerElement) picksElement = findDirectChildByTagName(containerElement, 'UL');
              var isDisposableContainerElementFlag = false;

              if (!containerElement) {
                containerElement = createElementAspect.createElement('DIV');
                containerElement.classList.add(containerClass);
                isDisposableContainerElementFlag = true;
              }

              if (selectElement) {
                showErrorAspect.showError = function (error) {
                  var errorElement = createElementAspect.createElement('SPAN');
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
                  if (fieldsetElement) disabledComponentAspect.getDisabled = function () {
                    var value = origGetDisabled();
                    if (value === null) value = selectElement.disabled || fieldsetElement.disabled;
                    return value;
                  };else disabledComponentAspect.getDisabled = function () {
                    var value = origGetDisabled();
                    if (value === null) value = selectElement.disabled;
                    return value;
                  };
                }

                onChangeAspect.onChange = composeSync(function () {
                  return staticDom.trigger('change');
                }, onChangeAspect.onChange);

                dataWrap.getOptions = function () {
                  return selectElement.options;
                };

                if (optGroupAspect) {
                  optGroupAspect.getOptionOptGroup = function (option) {
                    return option.parentNode;
                  };

                  optGroupAspect.getOptGroupText = function (optGroup) {
                    return optGroup.label;
                  };

                  optGroupAspect.getOptGroupId = function (optGroup) {
                    return optGroup.id;
                  };
                }

                if (selectElement && createFilterInputElementIdAspect) {
                  var origCreateFilterInputElementId = createFilterInputElementIdAspect.createFilterInputElementId;

                  createFilterInputElementIdAspect.createFilterInputElementId = function () {
                    var id = origCreateFilterInputElementId();

                    if (!id) {
                      id = containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
                    }

                    return id;
                  };
                }

                disposeAspect.dispose = composeSync(disposeAspect.dispose, function () {
                  selectElement.required = backupedRequired;
                  selectElement.style.display = backupDisplay;
                });
              }

              var isDisposablePicksElementFlag = false;

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
                  appendToContainer: function appendToContainer() {
                    var choicesDom = staticDom.choicesDom,
                        filterDom = staticDom.filterDom,
                        picksDom = staticDom.picksDom,
                        isDisposablePicksElementFlag = staticDom.isDisposablePicksElementFlag;
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
                  dispose: function dispose() {
                    var choicesDom = staticDom.choicesDom,
                        filterDom = staticDom.filterDom,
                        picksDom = staticDom.picksDom,
                        isDisposablePicksElementFlag = staticDom.isDisposablePicksElementFlag;
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
          layout: function layout() {
            var loadAspect = aspects.loadAspect,
                environment = aspects.environment;
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
                var domContentLoadedHandler = function domContentLoadedHandler() {
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
      var isChoiceSelectableAspect = IsChoiceSelectableAspect();
      return function (aspects) {
        aspects.isChoiceSelectableAspect = isChoiceSelectableAspect;
        var getIsOptionSelected = configuration.getSelected,
            setIsOptionSelected = configuration.setSelected,
            options = configuration.options;

        if (options) {
          if (!setIsOptionSelected) {
            setIsOptionSelected = function setIsOptionSelected(option, value) {
              option.selected = value;
            };
          }

          if (!getIsOptionSelected) getIsOptionSelected = function getIsOptionSelected(option) {
            return option.selected;
          };
        } else {
          // selectElement
          if (!getIsOptionSelected) {
            getIsOptionSelected = function getIsOptionSelected(option) {
              return option.selected;
            };
          }

          if (!setIsOptionSelected) {
            setIsOptionSelected = function setIsOptionSelected(option, value) {
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
          plugStaticDom: function plugStaticDom() {
            // TODO: move to createEventHandlers
            var wrapsCollection = aspects.wrapsCollection;
            aspects.updateOptionsSelectedAspect = UpdateOptionsSelectedAspect(wrapsCollection, getSelectedAspect);
          },
          layout: function layout() {
            var wrapsCollection = aspects.wrapsCollection,
                updateOptionsSelectedAspect = aspects.updateOptionsSelectedAspect,
                createWrapAspect = aspects.createWrapAspect,
                produceChoiceAspect = aspects.produceChoiceAspect,
                resetLayoutAspect = aspects.resetLayoutAspect,
                picksList = aspects.picksList,
                producePickAspect = aspects.producePickAspect,
                onChangeAspect = aspects.onChangeAspect,
                filterPredicateAspect = aspects.filterPredicateAspect;
            var origFilterPredicate = filterPredicateAspect.filterPredicate;

            filterPredicateAspect.filterPredicate = function (wrap, text) {
              return !wrap.isOptionSelected && origFilterPredicate(wrap, text);
            };

            function composeUpdateSelected(wrap, booleanValue) {
              return function () {
                wrap.isOptionSelected = booleanValue;
                wrap.updateSelected();
              };
            }

            function trySetWrapSelected(option, updateSelected, booleanValue) {
              //  wrap.option
              var success = false;
              var confirmed = setSelectedAspect.setSelected(option, booleanValue);

              if (!(confirmed === false)) {
                updateSelected();
                success = true;
              }

              return success;
            }

            ExtendProduceChoiceAspectProduceChoice$1(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList);
            var origCreateWrap = createWrapAspect.createWrap;

            createWrapAspect.createWrap = function (option) {
              var wrap = origCreateWrap(option);
              wrap.isOptionSelected = getSelectedAspect.getSelected(option);
              wrap.updateSelected = null; // can it be combined ?

              return wrap;
            };

            ExtendProducePickAspect$1(producePickAspect, trySetWrapSelected, composeUpdateSelected);
            return {
              buildApi: function buildApi(api) {
                api.selectAll = function () {
                  resetLayoutAspect.resetLayout(); // always hide 1st

                  wrapsCollection.forLoop(function (wrap) {
                    if (isChoiceSelectableAspect.isSelectable(wrap) && !wrap.isOptionSelected) trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);
                  });
                };

                api.deselectAll = function () {
                  resetLayoutAspect.resetLayout(); // always hide 1st

                  picksList.forEach(function (pick) {
                    return pick.setSelectedFalse();
                  });
                };

                api.setOptionSelected = function (key, value) {
                  var wrap = wrapsCollection.get(key);
                  return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, value), value);
                }; // used in FormRestoreOnBackwardPlugin


                api.updateOptionsSelected = function () {
                  return updateOptionsSelectedAspect.updateOptionsSelected();
                };

                api.updateOptionSelected = function (key) {
                  return updateChoiceSelected(wrapsCollection.get(key), getSelectedAspect);
                };
              }
            };
          }
        };
      };
    }

    function ExtendProduceChoiceAspectProduceChoice$1(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList) {
      var orig = produceChoiceAspect.produceChoice;

      produceChoiceAspect.produceChoice = function (wrap) {
        var val = orig(wrap);
        wrap.choice.choiceDomManagerHandlers.updateSelected();

        wrap.choice.tryToggleChoice = function () {
          return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected);
        };

        wrap.choice.fullMatch = function () {
          return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);
        };

        wrap.choice.choiсeClick = function (event) {
          wrap.choice.tryToggleChoice();
        }; // TODO: add fail message?


        wrap.updateSelected = function () {
          wrap.choice.choiceDomManagerHandlers.updateSelected();
          onChangeAspect.onChange();
        }; // addPickForChoice used only in load loop; updateSelected on toggle


        wrap.choice.addPickForChoice = function () {
          var pickHandlers = {
            producePick: null,
            // not redefined directly, but redefined in addPickAspect
            removeAndDispose: null // not redefined, used in MultiSelectInlineLayout injected into wrap.choice.choiceRemove 

          };

          pickHandlers.producePick = function () {
            var pick = producePickAspect.producePick(wrap);

            var _picksList$add = picksList.add(pick),
                remove = _picksList$add.remove;

            pick.dispose = composeSync(remove, pick.dispose);

            pickHandlers.removeAndDispose = function () {
              return pick.dispose();
            };

            return pick;
          };

          wrap.updateSelected = composeSync(function () {
            if (wrap.isOptionSelected) {
              var pick = pickHandlers.producePick();
              wrap.pick = pick;
              pick.dispose = composeSync(pick.dispose, function () {
                wrap.pick = null;
              });
            } else {
              pickHandlers.removeAndDispose();
              pickHandlers.removeAndDispose = null;
            }
          }, wrap.updateSelected);

          if (wrap.isOptionSelected) {
            var pick = pickHandlers.producePick();
            wrap.pick = pick;
            pick.dispose = composeSync(pick.dispose, function () {
              wrap.pick = null;
            });
          }

          return pickHandlers; //removeAndDispose
        };

        wrap.dispose = composeSync(function () {
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
      var orig = producePickAspect.producePick;

      producePickAspect.producePick = function (wrap, pickHandlers) {
        var pick = orig(wrap, pickHandlers);

        pick.setSelectedFalse = function () {
          return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);
        };

        pick.dispose = composeSync(pick.dispose, function () {
          pick.setSelectedFalse = null;
        });
        return pick;
      };
    }

    function UpdateOptionsSelectedAspect(wrapsCollection, getSelectedAspect) {
      return {
        updateOptionsSelected: function updateOptionsSelected() {
          wrapsCollection.forLoop(function (wrap) {
            return updateChoiceSelected(wrap, getSelectedAspect);
          });
        }
      };
    }

    function updateChoiceSelected(wrap, getSelectedAspect) {
      var newIsSelected = getSelectedAspect.getSelected(wrap.option);

      if (newIsSelected != wrap.isOptionSelected) {
        wrap.isOptionSelected = newIsSelected;
        wrap.updateSelected == null ? void 0 : wrap.updateSelected(); // some hidden oesn't have element (and need to be updated)
      }
    }

    function IsChoiceSelectableAspect() {
      // TODO rename to IsSelectableByUserAspect ?
      return {
        isSelectable: function isSelectable(wrap) {
          return true;
        }
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
      return function (aspects) {
        return {
          layout: function layout() {
            var isChoiceSelectableAspect = aspects.isChoiceSelectableAspect,
                createWrapAspect = aspects.createWrapAspect,
                produceChoiceAspect = aspects.produceChoiceAspect,
                filterPredicateAspect = aspects.filterPredicateAspect,
                wrapsCollection = aspects.wrapsCollection,
                producePickAspect = aspects.producePickAspect,
                pickDomFactory = aspects.pickDomFactory;
            var getIsOptionDisabled = configuration.getIsOptionDisabled,
                options = configuration.options,
                css = configuration.css;

            if (options) {
              if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
                return option.disabled === undefined ? false : option.disabled;
              };
            } else {
              // selectElement
              if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
                return option.disabled;
              };
            } // TODO check this instead of wrap.updateDisabled
            // function updateDisabled(wrap){
            //     wrap?.choice?.choiceDomManagerHandlers?.updateDisabled?.();
            //     wrap?.pick?.pickDomManagerHandlers?.updateDisabled?.();
            // }


            var origCreateWrap = createWrapAspect.createWrap;

            createWrapAspect.createWrap = function (option) {
              var wrap = origCreateWrap(option);
              wrap.isOptionDisabled = getIsOptionDisabled(option); // TODO: remove usage wrap.isOptionDisabled

              wrap.updateDisabled = null;
              return wrap;
            };

            var origIsSelectable = isChoiceSelectableAspect.isSelectable;

            isChoiceSelectableAspect.isSelectable = function (wrap) {
              return origIsSelectable(wrap) && !wrap.isOptionDisabled;
            };

            var origFilterPredicate = filterPredicateAspect.filterPredicate;

            filterPredicateAspect.filterPredicate = function (wrap, text) {
              return !wrap.isOptionDisabled && origFilterPredicate(wrap, text);
            };

            ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect);
            ExtendProducePickAspectProducePick(producePickAspect);
            ExtendPickDomFactoryCreate(pickDomFactory, css);
            return {
              buildApi: function buildApi(api) {
                api.updateOptionsDisabled = function () {
                  return wrapsCollection.forLoop(function (wrap) {
                    return updateChoiceDisabled(wrap, getIsOptionDisabled);
                  });
                };

                api.updateOptionDisabled = function (key) {
                  return updateChoiceDisabled(wrapsCollection.get(key), getIsOptionDisabled);
                };
              }
            };
          }
        };
      };
    }

    function ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect) {
      var orig = produceChoiceAspect.produceChoice;

      produceChoiceAspect.produceChoice = function (wrap) {
        var val = orig(wrap);
        wrap.choice.choiceDomManagerHandlers.updateDisabled();
        wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled;
        wrap.choice.dispose = composeSync(function () {
          wrap.updateDisabled = null;
        }, wrap.choice.dispose);
        var origToggle = wrap.choice.tryToggleChoice;

        wrap.choice.tryToggleChoice = function () {
          var success = false;

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
      var orig = producePickAspect.producePick;

      producePickAspect.producePick = function (wrap) {
        var val = orig(wrap);
        var pick = wrap.pick;
        var choiceUpdateDisabledBackup = wrap.updateDisabled; // backup disable only choice

        wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, function () {
          return pick.pickDomManagerHandlers.updateDisabled();
        }); // add pickDisabled

        pick.dispose = composeSync(pick.dispose, function () {
          wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled

          wrap.updateDisabled(); // make "true disabled" without it checkbox only looks disabled
        });
        return val;
      };
    }

    function ExtendPickDomFactoryCreate(pickDomFactory, css) {
      var orig = pickDomFactory.create;

      pickDomFactory.create = function (pick) {
        orig(pick);
        var pickDom = pick.pickDom,
            pickDomManagerHandlers = pick.pickDomManagerHandlers;
        var disableToggle = toggleStyling(pickDom.pickContentElement, css.pickContent_disabled);

        pickDomManagerHandlers.updateDisabled = function () {
          disableToggle(pick.wrap.isOptionDisabled);
        };

        pickDomManagerHandlers.updateDisabled();
      };
    }

    function updateChoiceDisabled(wrap, getIsOptionDisabled) {
      var newIsDisabled = getIsOptionDisabled(wrap.option);

      if (newIsDisabled != wrap.isOptionDisabled) {
        wrap.isOptionDisabled = newIsDisabled;
        wrap.updateDisabled == null ? void 0 : wrap.updateDisabled(); // some hidden oesn't have element (and need to be updated)
      }
    }

    function PicksApiPlugin() {
      return {
        plug: plug$c
      };
    }
    function plug$c() {
      return function (aspects) {
        return {
          buildApi: function buildApi(api) {
            var picksList = aspects.picksList,
                createWrapAspect = aspects.createWrapAspect;

            api.forEachPeak = function (f) {
              return picksList.forEach(function (wrap) {
                return f(wrap.option);
              });
            }; // TODO: getHeadPeak


            api.getTailPeak = function () {
              var _picksList$getTail;

              return (_picksList$getTail = picksList.getTail()) == null ? void 0 : _picksList$getTail.option;
            };

            api.countPeaks = function () {
              return picksList.getCount();
            };

            api.isEmptyPeaks = function () {
              return picksList.isEmpty();
            };

            api.addPick = function (option) {
              var wrap = createWrapAspect.createWrap(option); // TODO should be moved to specific plugins

              wrap.updateDisabled = function () {};

              wrap.updateHidden = function () {};

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
      return function (aspects) {
        return {
          plugStaticDom: function plugStaticDom() {
            var picksList = aspects.picksList;
            var picks = configuration.picks;

            if (picks) {
              var origAdd = picksList.add,
                  origReset = picksList.reset;

              picksList.add = function (e) {
                var _origAdd = origAdd(e),
                    remove = _origAdd.remove,
                    index = _origAdd.index;

                picks.push(e);
                return {
                  remove: composeSync(remove, function () {
                    return void picks.splice(index(), 1);
                  }),
                  index: index
                };
              };

              picksList.reset = function () {
                origReset();
                picks.length = 0;
              };
            }
          },
          layout: function layout() {
            aspects.inputAspect;
                aspects.filterDom;
                aspects.filterManagerAspect;
            configuration.picks;
                configuration.addOptionPicked;
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
      return function (aspects) {
        aspects.popperRtlAspect = popperRtlAspect;
        var environment = aspects.environment;
        var createPopper = environment.createPopper,
            Popper = environment.Popper,
            globalPopper = environment.globalPopper;
        var createModifiersVX = null;
        var createPopperVX = null;

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
          append: function append() {
            var filterDom = aspects.filterDom,
                choicesDom = aspects.choicesDom,
                disposeAspect = aspects.disposeAspect,
                staticManager = aspects.staticManager,
                choicesVisibilityAspect = aspects.choicesVisibilityAspect,
                specialPicksEventsAspect = aspects.specialPicksEventsAspect;
            var filterInputElement = filterDom.filterInputElement;
            var choicesElement = choicesDom.choicesElement;
            var pop = createPopperAspect.createPopper(choicesElement, filterInputElement, true);
            staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop.init);
            var origBackSpace = specialPicksEventsAspect.backSpace;

            specialPicksEventsAspect.backSpace = function (pick) {
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
        getIsRtl: function getIsRtl() {
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
        createPopper: function createPopper(element, anchorElement, preventOverflow) {
          var popper = null;
          return {
            init: function init() {
              var isRtl = popperRtlAspect.getIsRtl();
              var popperConfiguration = createPopperConfigurationAspect.createConfiguration(preventOverflow, isRtl);
              popper = createPopperVX(anchorElement, element, popperConfiguration);
            },
            update: function update() {
              popper.update(); // become async in popper 2; use forceUpdate if sync is needed? 
            },
            dispose: function dispose() {
              popper.destroy();
            }
          };
        }
      };
    }

    function CreatePopperConfigurationAspect(createModifiersVX) {
      return {
        createConfiguration: function createConfiguration(preventOverflow, isRtl) {
          var modifiers = createModifiersVX(preventOverflow);
          var popperConfiguration = {
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
      preset$3(defaults);
      return {
        plug: plug$9
      };
    }
    function preset$3(o) {
      o.useChoicesDynamicStyling = false;

      o.choicesDynamicStyling = function (aspects) {
        return choicesDynamicStyling(aspects, window);
      };

      o.minimalChoicesDynamicStylingMaxHeight = 20;
    }
    function plug$9(configuration) {
      var choicesDynamicStyling = configuration.choicesDynamicStyling,
          useChoicesDynamicStyling = configuration.useChoicesDynamicStyling;
      return function (aspects) {
        return {
          layout: function layout() {
            if (useChoicesDynamicStyling) {
              var choicesVisibilityAspect = aspects.choicesVisibilityAspect,
                  specialPicksEventsAspect = aspects.specialPicksEventsAspect;
              var origSetChoicesVisible = choicesVisibilityAspect.setChoicesVisible;

              choicesVisibilityAspect.setChoicesVisible = function (visible) {
                if (visible) choicesDynamicStyling(aspects);
                origSetChoicesVisible(visible);
              };

              var origBackSpace = specialPicksEventsAspect.backSpace;

              specialPicksEventsAspect.backSpace = function (pick) {
                origBackSpace(pick);
                choicesDynamicStyling(aspects);
              };
            }
          }
        };
      };
    }

    function choicesDynamicStyling(aspects, window) {
      var choicesDom = aspects.choicesDom,
          navigateAspect = aspects.navigateAspect,
          configuration = aspects.configuration;
      var choicesElement = choicesDom.choicesElement;
      var minimalChoicesDynamicStylingMaxHeight = configuration.minimalChoicesDynamicStylingMaxHeight; //find height of the browser window

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

      choiceDomFactory.create = function (choice) {
        origChoiceDomFactoryCreate(choice);
        var choiceElement = choice.choiceDom.choiceElement;

        choice.choiceDomManagerHandlers.updateHighlighted = function () {
          var text = dataWrap.getText(choice.wrap.option);
          var highlighter = aspects.highlightAspect.getHighlighter();
          if (highlighter) highlighter(choiceElement, choice.choiceDom, text);else choiceElement.textContent = text;
        };
      };
    }

    function plug$8(configuration) {
      return function (aspects) {
        if (configuration.useHighlighting) aspects.highlightAspect = HighlightAspect();
        return {
          plugStaticDom: function plugStaticDom() {
            var choiceDomFactory = aspects.choiceDomFactory,
                dataWrap = aspects.dataWrap;
            ExtendChoiceDomFactory$1(choiceDomFactory, dataWrap);
          },
          layout: function layout() {
            var highlightAspect = aspects.highlightAspect,
                filterManagerAspect = aspects.filterManagerAspect,
                produceChoiceAspect = aspects.produceChoiceAspect;

            if (highlightAspect) {
              var origProcessEmptyInput = filterManagerAspect.processEmptyInput;

              filterManagerAspect.processEmptyInput = function () {
                highlightAspect.reset();
                origProcessEmptyInput();
              };

              var origSetFilter = filterManagerAspect.setFilter;

              filterManagerAspect.setFilter = function (text) {
                highlightAspect.set(text);
                origSetFilter(text);
              };

              var origProduceChoice = produceChoiceAspect.produceChoice;

              produceChoiceAspect.produceChoice = function (wrap) {
                origProduceChoice(wrap);
                var origSetVisible = wrap.choice.choiceDomManagerHandlers.setVisible;

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
      var highlighter = null;
      return {
        getHighlighter: function getHighlighter() {
          return highlighter;
        },
        set: function set(filter) {
          var guarded = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var regex = new RegExp("(" + guarded + ")", "gi");

          highlighter = function highlighter(e, choiceDom, text) {
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
        reset: function reset() {
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
      return function (aspects) {
        return {
          plugStaticDom: function plugStaticDom() {
            var choiceDomFactory = aspects.choiceDomFactory;
            var customChoiceStylings = configuration.customChoiceStylings;

            if (customChoiceStylings) {
              var customChoiceStylingsAspect = CustomChoiceStylingsAspect(customChoiceStylings);
              ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect);
            }
          }
        };
      };
    }

    function ExtendChoiceDomFactory(choiceDomFactory, customChoiceStylingsAspect) {
      var origChoiceDomFactoryCreate = choiceDomFactory.create;

      choiceDomFactory.create = function (choice) {
        origChoiceDomFactoryCreate(choice);
        customChoiceStylingsAspect.customize(choice.wrap, choice.choiceDom, choice.choiceDomManagerHandlers);
      };
    }

    function CustomChoiceStylingsAspect(customChoiceStylings) {
      return {
        customize: function customize(choice) {
          var handlers = customChoiceStylings(choice.choiceDom, choice.wrap.option);

          if (handlers) {
            var customChoiceStylingsClosure = function customChoiceStylingsClosure(custom) {
              return function () {
                custom({
                  isOptionSelected: choice.wrap.isOptionSelected,
                  isOptionDisabled: choice.wrap.isOptionDisabled,
                  isHoverIn: choice.isHoverIn //isHighlighted: wrap.choice.isHighlighted  // TODO isHighlighted should be developed

                });
              };
            };

            var choiceDomManagerHandlers = choice.choiceDomManagerHandlers;
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
      return function (aspects) {
        return {
          plugStaticDom: function plugStaticDom() {
            var disabledComponentAspect = aspects.disabledComponentAspect,
                pickDomFactory = aspects.pickDomFactory;
            var customPickStylings = configuration.customPickStylings;
            var customPickStylingsAspect = CustomPickStylingsAspect(disabledComponentAspect, customPickStylings);
            ExtendPickDomFactory$2(pickDomFactory, customPickStylingsAspect);
          }
        };
      };
    }

    function ExtendPickDomFactory$2(pickDomFactory, customPickStylingsAspect) {
      var origCreatePickDomFactory = pickDomFactory.create;

      pickDomFactory.create = function (pick) {
        origCreatePickDomFactory(pick);
        customPickStylingsAspect.customize(pick);
      };
    }

    function CustomPickStylingsAspect(disabledComponentAspect, customPickStylings) {
      return {
        customize: function customize(pick) {
          if (customPickStylings) {
            var handlers = customPickStylings(pick.pickDom, pick.wrap.option);

            if (handlers) {
              var customPickStylingsClosure = function customPickStylingsClosure(custom) {
                return function () {
                  custom({
                    isOptionDisabled: pick.wrap.isOptionDisabled,
                    // wrap.component.getDisabled();
                    // wrap.group.getDisabled();
                    isComponentDisabled: disabledComponentAspect.getDisabled()
                  });
                };
              };

              var pickDomManagerHandlers = pick.pickDomManagerHandlers; // TODO: automate it

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
      return function (aspects) {
        aspects.updateAppearanceAspect = updateAppearanceAspect;
        return {
          layout: function layout() {
            var updateAspect = aspects.updateAspect,
                loadAspect = aspects.loadAspect;
            updateAspect.update = composeSync(updateAspect.update, function () {
              return updateAppearanceAspect.updateAppearance();
            });
            loadAspect.load = composeSync(loadAspect.load, function () {
              return updateAppearanceAspect.updateAppearance();
            });
            return {
              buildApi: function buildApi(api) {
                api.updateAppearance = function () {
                  return updateAppearanceAspect.updateAppearance();
                };
              }
            };
          }
        };
      };
    }

    function UpdateAppearanceAspect() {
      return {
        updateAppearance: function updateAppearance() {}
      };
    }

    function DisableComponentPlugin(defaults) {
      preset$2(defaults);
      return {
        plug: plug$4
      };
    }
    function preset$2(defaults) {
      defaults.getDisabled = function () {
        return null;
      };
    }
    function plug$4(configuration) {
      var disabledComponentAspect = DisabledComponentAspect(configuration.getDisabled);
      return function (aspects) {
        aspects.disabledComponentAspect = disabledComponentAspect;
        return {
          plugStaticDom: function plugStaticDom() {
            var pickDomFactory = aspects.pickDomFactory;
            ExtendPickDomFactory$1(pickDomFactory, disabledComponentAspect);
          },
          layout: function layout() {
            var updateAppearanceAspect = aspects.updateAppearanceAspect,
                picksList = aspects.picksList,
                picksDom = aspects.picksDom,
                picksElementAspect = aspects.picksElementAspect;

            var disableComponent = function disableComponent(isComponentDisabled) {
              picksList.forEach(function (pick) {
                return pick.pickDomManagerHandlers.updateComponentDisabled();
              });
              picksDom.disable(isComponentDisabled);
            };

            var origOnClick = picksElementAspect.onClick;

            picksElementAspect.onClick = function (handler) {
              disableComponent = function disableComponent(isComponentDisabled) {
                picksList.forEach(function (pick) {
                  return pick.pickDomManagerHandlers.updateComponentDisabled();
                });
                picksDom.disable(isComponentDisabled);
                if (isComponentDisabled) picksElementAspect.onClickUnbind(); //componentDisabledEventBinder.unbind();
                else origOnClick(handler); //componentDisabledEventBinder.bind(picksElement, "click",  handler); 
              };
            };

            var isComponentDisabled; // state! 

            function updateDisabled() {
              var _disabledComponentAsp;

              var newIsComponentDisabled = (_disabledComponentAsp = disabledComponentAspect.getDisabled()) != null ? _disabledComponentAsp : false;

              if (isComponentDisabled !== newIsComponentDisabled) {
                isComponentDisabled = newIsComponentDisabled;
                disableComponent(newIsComponentDisabled);
              }
            }

            updateAppearanceAspect.updateAppearance = composeSync(updateAppearanceAspect.updateAppearance, updateDisabled);
            return {
              buildApi: function buildApi(api) {
                api.updateDisabled = updateDisabled;
              }
            };
          }
        };
      };
    }
    function DisabledComponentAspect(getDisabled) {
      return {
        getDisabled: getDisabled
      };
    }

    function ExtendPickDomFactory$1(pickDomFactory, disabledComponentAspect) {
      var origCreatePickDomFactory = pickDomFactory.create;

      pickDomFactory.create = function (pick) {
        origCreatePickDomFactory(pick);
        var pickDomManagerHandlers = pick.pickDomManagerHandlers;

        pickDomManagerHandlers.updateComponentDisabled = function () {
          var _disabledComponentAsp2;

          if (pickDomManagerHandlers.disableButton) pickDomManagerHandlers.disableButton((_disabledComponentAsp2 = disabledComponentAspect.getDisabled()) != null ? _disabledComponentAsp2 : false);
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
      return function (aspects) {
        return {
          layout: function layout() {
            var staticManager = aspects.staticManager,
                picksList = aspects.picksList,
                picksDom = aspects.picksDom,
                filterDom = aspects.filterDom,
                updateDataAspect = aspects.updateDataAspect,
                resetFilterListAspect = aspects.resetFilterListAspect,
                filterManagerAspect = aspects.filterManagerAspect,
                environment = aspects.environment,
                staticDom = aspects.staticDom;
            var isIE11 = environment.isIE11;
            var placeholder = configuration.placeholder,
                css = configuration.css;
            var picksElement = picksDom.picksElement;
            var filterInputElement = filterDom.filterInputElement;

            function setPlaceholder(placeholder) {
              filterInputElement.placeholder = placeholder;
            }

            if (isIE11) {
              var ignoreNextInputResetableFlag = ResetableFlag();
              var placeholderStopInputAspect = PlaceholderStopInputAspect(ignoreNextInputResetableFlag);
              var setPlaceholderOrig = setPlaceholder;

              setPlaceholder = function setPlaceholder(placeholder) {
                ignoreNextInputResetableFlag.set();
                setPlaceholderOrig(placeholder);
              };

              var origOnInput = filterDom.onInput;

              filterDom.onInput = function (handler) {
                origOnInput(function () {
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

            var isEmpty = function isEmpty() {
              return picksList.isEmpty() && filterDom.isEmpty();
            };

            function updatePlacehodlerVisibility() {
              showPlacehodler(isEmpty());
            }

            function updateEmptyInputWidth() {
              setEmptyInputWidth(isEmpty());
            }
            var origDisable = picksDom.disable;

            picksDom.disable = function (isComponentDisabled) {
              setDisabled(isComponentDisabled);
              origDisable(isComponentDisabled);
            };

            staticManager.appendToContainer = composeSync(staticManager.appendToContainer, updateEmptyInputWidth);
            filterManagerAspect.processEmptyInput = composeSync(updateEmptyInputWidth, filterManagerAspect.processEmptyInput);
            resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updatePlacehodlerVisibility);
            var origAdd = picksList.add;

            picksList.add = function (pick) {
              var returnValue = origAdd(pick);

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
        get: function get() {
          return resetableFlag.get();
        },
        reset: function reset() {
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
      return function (aspects) {
        return {
          plugStaticDom: function plugStaticDom() {
            aspects.floatingLabelAspect = FloatingLabelAspect();
          },
          layout: function layout() {
            var picksList = aspects.picksList,
                picksDom = aspects.picksDom,
                filterDom = aspects.filterDom,
                updateDataAspect = aspects.updateDataAspect,
                resetFilterListAspect = aspects.resetFilterListAspect,
                floatingLabelAspect = aspects.floatingLabelAspect,
                getLabelAspect = aspects.getLabelAspect;
            var css = configuration.css;

            if (floatingLabelAspect.isFloatingLabel()) {
              var liftedLabel = function liftedLabel(isEmpty) {
                liftToggleStyling1(isEmpty);
                liftToggleStyling2(isEmpty);
              };

              var updateLiftedLabel = function updateLiftedLabel() {
                liftedLabel(!isEmpty());
              };

              var labelElement = getLabelAspect.getLabel();
              var picksElement = picksDom.picksElement;
              var liftToggleStyling1 = toggleStyling(labelElement, css.label_floating_lifted);
              var liftToggleStyling2 = toggleStyling(picksElement, css.picks_floating_lifted);

              var isEmpty = function isEmpty() {
                return picksList.isEmpty() && filterDom.isEmpty() && !picksDom.getIsFocusIn();
              };
              updateLiftedLabel();
              resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updateLiftedLabel);
              var origAdd = picksList.add;

              picksList.add = function (pick) {
                var returnValue = origAdd(pick);
                if (picksList.getCount() == 1) updateLiftedLabel();
                pick.dispose = composeSync(pick.dispose, function () {
                  if (picksList.getCount() == 0) updateLiftedLabel();
                });
                return returnValue;
              };

              var origToggleFocusStyling = picksDom.toggleFocusStyling;

              picksDom.toggleFocusStyling = function () {
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
        isFloatingLabel: function isFloatingLabel() {}
      };
    }

    function FloatingLabelCssPatchBs5Plugin(defaults) {
      var cssPatch = defaults.cssPatch;
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

    var defNoResultsWarningMessage = 'No results found';
    function preset$1(o) {
      o.noResultsWarning = defNoResultsWarningMessage;
      o.isNoResultsWarningEnabled = false;
    }
    function plug$1(configuration) {
      return function (aspects) {
        return {
          layout: function layout() {
            var choicesDom = aspects.choicesDom,
                staticManager = aspects.staticManager,
                afterInputAspect = aspects.afterInputAspect,
                filterManagerAspect = aspects.filterManagerAspect,
                resetLayoutAspect = aspects.resetLayoutAspect,
                staticDom = aspects.staticDom;
            var createElementAspect = staticDom.createElementAspect;
            var css = configuration.css,
                noResultsWarning = configuration.noResultsWarning;

            if (configuration.isNoResultsWarningEnabled) {
              var warningAspect = WarningAspect(choicesDom, createElementAspect, staticManager, css);
              aspects.warningAspect = warningAspect;
              ExtendAfterInputAspect(afterInputAspect, warningAspect, filterManagerAspect, noResultsWarning);
              resetLayoutAspect.resetLayout = composeSync(function () {
                return warningAspect.hide();
              }, resetLayoutAspect.resetLayout);
            }
          },
          append: function append() {
            var createPopperAspect = aspects.createPopperAspect,
                filterDom = aspects.filterDom,
                warningAspect = aspects.warningAspect,
                staticManager = aspects.staticManager,
                disposeAspect = aspects.disposeAspect;

            if (warningAspect) {
              var filterInputElement = filterDom.filterInputElement;
              var pop2 = createPopperAspect.createPopper(warningAspect.warningElement, filterInputElement, false);
              staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop2.init);
              var origWarningAspectShow = warningAspect.show;

              warningAspect.show = function (msg) {
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

      afterInputAspect.visible = function (showChoices, visibleCount) {
        warningAspect.hide();
        origVisible(showChoices, visibleCount);
      };

      var origNotVisible = afterInputAspect.notVisible;

      afterInputAspect.notVisible = function (hideChoices) {
        origNotVisible(hideChoices);
        if (filterManagerAspect.getFilter()) warningAspect.show(noResultsWarning);else warningAspect.hide();
      };
    }

    function WarningAspect(choicesDom, createElementAspect, staticManager, css) {
      var choicesElement = choicesDom.choicesElement;
      var warningElement = createElementAspect.createElement('DIV');
      staticManager.appendToContainer = composeSync(staticManager.appendToContainer, function () {
        return choicesElement.parentNode.insertBefore(warningElement, choicesElement.nextSibling);
      });
      warningElement.style.display = 'none';
      addStyling(warningElement, css.warning);
      return {
        warningElement: warningElement,
        show: function show(message) {
          warningElement.style.display = 'block';
          warningElement.innerHTML = message;
        },
        hide: function hide() {
          warningElement.style.display = 'none';
          warningElement.innerHTML = "";
        }
      };
    }

    function WarningBs5Plugin(defaults) {
      preset(defaults);
      return {
        plug: plug$1
      };
    }
    function preset(defaults) {
      defaults.css.warning = 'alert-warning';
      preset$1(defaults);
    }

    function PickButtonPlugCssPatchBs5(defaults) {
      defaults.cssPatch.pickButton = {
        float: "none",
        verticalAlign: "text-top",
        fontSize: '0.8em'
      };
    }
    function PickButtonBs5Plugin(defaults) {
      defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"></button>';
      defaults.css.pickButton = 'btn-close';
      return PickButtonPlugin();
    }
    function PickButtonPlugin() {
      return {
        plug: plug
      };
    }
    function plug(configuration) {
      return function (aspects) {
        return {
          plugStaticDom: function plugStaticDom() {
            var pickDomFactory = aspects.pickDomFactory,
                staticDom = aspects.staticDom;
            ExtendPickDomFactory(pickDomFactory, staticDom.createElementAspect, configuration.pickButtonHTML, configuration.css);
          },
          layout: function layout() {
            var producePickAspect = aspects.producePickAspect;
            ExtendProducePickAspect(producePickAspect);
          }
        };
      };
    }

    function ExtendProducePickAspect(producePickAspect) {
      var origProducePickPickAspect = producePickAspect.producePick;

      producePickAspect.producePick = function (wrap) {
        var pick = origProducePickPickAspect(wrap);

        pick.removeOnButton = function (event) {
          pick.setSelectedFalse();
        };

        pick.dispose = composeSync(pick.dispose, function () {
          pick.removeOnButton = null;
        });
        return pick;
      };
    }

    function ExtendPickDomFactory(pickDomFactory, createElementAspect, pickButtonHTML, css) {
      var origCreatePickDomFactory = pickDomFactory.create;

      pickDomFactory.create = function (pick) {
        origCreatePickDomFactory(pick);
        var pickDom = pick.pickDom,
            pickDomManagerHandlers = pick.pickDomManagerHandlers;
        createElementAspect.createElementFromHtmlPutAfter(pickDom.pickContentElement, pickButtonHTML);
        var pickButtonElement = pickDom.pickElement.querySelector('BUTTON');
        pickDom.pickButtonElement = pickButtonElement;

        pickDomManagerHandlers.disableButton = function (val) {
          pickButtonElement.disabled = val;
        };

        var eventBinder = EventBinder();
        eventBinder.bind(pickButtonElement, "click", function (event) {
          return pick.removeOnButton(event);
        });
        addStyling(pickButtonElement, css.pickButton);
        pick.dispose = composeSync(pick.dispose, function () {
          eventBinder.unbind();
          pickDom.pickButtonElement = null;
          pickDomManagerHandlers.disableButton = null;
        });
      };
    }

    var Bs5PluginSet = {
      BsAppearanceBs5Plugin: BsAppearanceBs5Plugin,
      PickButtonBs5Plugin: PickButtonBs5Plugin,
      WarningBs5Plugin: WarningBs5Plugin,
      CssPatchBs5Plugin: CssPatchBs5Plugin,
      BsAppearanceBs5CssPatchPlugin: BsAppearanceBs5CssPatchPlugin,
      PickButtonPlugCssPatchBs5: PickButtonPlugCssPatchBs5,
      FloatingLabelCssPatchBs5Plugin: FloatingLabelCssPatchBs5Plugin
    };
    var multiSelectPlugins = {
      SelectElementPlugin: SelectElementPlugin,
      LabelForAttributePlugin: LabelForAttributePlugin,
      HiddenOptionPlugin: HiddenOptionPlugin,
      ValidationApiPlugin: ValidationApiPlugin,
      UpdateAppearancePlugin: UpdateAppearancePlugin,
      DisableComponentPlugin: DisableComponentPlugin,
      FormResetPlugin: FormResetPlugin,
      CreatePopperPlugin: CreatePopperPlugin,
      WarningCssPatchPlugin: WarningCssPatchPlugin,
      RtlPlugin: RtlPlugin,
      PlaceholderPlugin: PlaceholderPlugin,
      PlaceholderCssPatchPlugin: PlaceholderCssPatchPlugin,
      FloatingLabelPlugin: FloatingLabelPlugin,
      OptionsApiPlugin: OptionsApiPlugin,
      JQueryMethodsPlugin: JQueryMethodsPlugin,
      SelectedOptionPlugin: SelectedOptionPlugin,
      FormRestoreOnBackwardPlugin: FormRestoreOnBackwardPlugin,
      DisabledOptionPlugin: DisabledOptionPlugin,
      DisabledOptionCssPatchPlugin: DisabledOptionCssPatchPlugin,
      PicksApiPlugin: PicksApiPlugin,
      HighlightPlugin: HighlightPlugin,
      ChoicesDynamicStylingPlugin: ChoicesDynamicStylingPlugin,
      CustomPickStylingsPlugin: CustomPickStylingsPlugin,
      CustomChoiceStylingsPlugin: CustomChoiceStylingsPlugin
    };
    var picksPlugins = {
      PicksPlugin: PicksPlugin,
      LabelForAttributePlugin: LabelForAttributePlugin,
      ValidationApiPlugin: ValidationApiPlugin,
      UpdateAppearancePlugin: UpdateAppearancePlugin,
      DisableComponentPlugin: DisableComponentPlugin,
      CreatePopperPlugin: CreatePopperPlugin,
      WarningCssPatchPlugin: WarningCssPatchPlugin,
      RtlPlugin: RtlPlugin,
      PlaceholderPlugin: PlaceholderPlugin,
      PlaceholderCssPatchPlugin: PlaceholderCssPatchPlugin,
      FloatingLabelPlugin: FloatingLabelPlugin,
      OptionsApiPlugin: OptionsApiPlugin,
      JQueryMethodsPlugin: JQueryMethodsPlugin,
      PicksApiPlugin: PicksApiPlugin,
      HighlightPlugin: HighlightPlugin,
      ChoicesDynamicStylingPlugin: ChoicesDynamicStylingPlugin,
      CustomPickStylingsPlugin: CustomPickStylingsPlugin,
      CustomChoiceStylingsPlugin: CustomChoiceStylingsPlugin
    };
    var allPlugins = shallowClearClone(multiSelectPlugins, {
      PicksPlugin: PicksPlugin
    }); // var defaultConfig = {
    //     plugins: multiSelectPlugins
    // }
    // var picksConfig = {
    //     plugins: picksPlugins
    // }
    // export function createConfig(arg){
    //     return config;
    // }

    function createDefaultCssBs5() {
      var defaultCss = {};
      PickDomFactoryPlugCss(defaultCss);
      PicksDomFactoryPlugCss(defaultCss);
      ChoiceDomFactoryPlugCssBs5(defaultCss);
      ChoicesDomFactoryPlugCss(defaultCss);
      FilterDomFactoryPlugCss(defaultCss);
      return defaultCss;
    }

    var utilities = {
      composeSync: composeSync,
      EventBinder: EventBinder,
      addStyling: addStyling,
      toggleStyling: toggleStyling
    };

    var defaultCss = createDefaultCssBs5();

    var BsMultiSelect = function (window, jQuery, globalPopper) {
      var plugins = shallowClearClone(Bs5PluginSet, multiSelectPlugins);
      return createForJQuery(window, jQuery, globalPopper, 'BsMultiSelect', plugins, defaultCss);
    }(window, window.jQuery, Popper__default["default"]);

    var BsPicks = function (window, jQuery, globalPopper) {
      var plugins = shallowClearClone(Bs5PluginSet, picksPlugins);
      return createForJQuery(window, jQuery, globalPopper, 'BsPicks', plugins, defaultCss);
    }(window, window.jQuery, Popper__default["default"]);

    var BsMultiSelect_jquery = {
      BsMultiSelect: BsMultiSelect,
      BsPicks: BsPicks,
      MultiSelectTools: {
        MultiSelectBuilder: MultiSelectBuilder,
        plugins: shallowClearClone(Bs5PluginSet, allPlugins),
        defaultCss: defaultCss,
        utilities: utilities
      }
    };

    return BsMultiSelect_jquery;

}));
//# sourceMappingURL=BsMultiSelect.js.map
