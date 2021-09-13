/*!
  * BsMultiSelect v1.2.0-beta.12 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2021 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under Apache 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery'), require('popper.js')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.dashboardcode = factory(global.jQuery, global.Popper));
}(this, (function ($, Popper) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var $__default = /*#__PURE__*/_interopDefaultLegacy($);
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
    }
    function ObjectValues(object) {
      // Object.values(plugins) - problem for IE11; full impementation of polifill is mor complex, but for our purpose this is enough
      var arr = [];

      for (var key in object) {
        arr.push(object[key]);
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

    function PluginManager(plugins, pluginData) {
      var instances = [];

      if (plugins) {
        for (var i = 0; i < plugins.length; i++) {
          var instance = plugins[i](pluginData);
          if (instance) instances.push(instance);
        }
      }

      var disposes = [];
      return {
        buildApi: function buildApi(api) {
          for (var _i = 0; _i < instances.length; _i++) {
            var _instances$_i$buildAp, _instances$_i;

            var dispose = (_instances$_i$buildAp = (_instances$_i = instances[_i]).buildApi) == null ? void 0 : _instances$_i$buildAp.call(_instances$_i, api);
            if (dispose) disposes.push(dispose);
          }
        },
        dispose: function dispose() {
          for (var _i2 = 0; _i2 < disposes.length; _i2++) {
            disposes[_i2]();
          }

          disposes = null;

          for (var _i3 = 0; _i3 < instances.length; _i3++) {
            var _instances$_i3$dispos, _instances$_i2;

            (_instances$_i3$dispos = (_instances$_i2 = instances[_i3]).dispose) == null ? void 0 : _instances$_i3$dispos.call(_instances$_i2);
          }

          instances = null;
        }
      };
    }
    function plugDefaultConfig(constructors, defaults) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$plugD, _constructors$i;

        (_constructors$i$plugD = (_constructors$i = constructors[i]).plugDefaultConfig) == null ? void 0 : _constructors$i$plugD.call(_constructors$i, defaults);
      }
    }
    function plugMergeSettings(constructors, configuration, defaults, settings) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$plugM, _constructors$i2;

        (_constructors$i$plugM = (_constructors$i2 = constructors[i]).plugMergeSettings) == null ? void 0 : _constructors$i$plugM.call(_constructors$i2, configuration, defaults, settings);
      }
    }
    function plugStaticDom(constructors, aspects) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$plugS, _constructors$i3;

        (_constructors$i$plugS = (_constructors$i3 = constructors[i]).plugStaticDom) == null ? void 0 : _constructors$i$plugS.call(_constructors$i3, aspects);
      }
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

    function PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect, pickButtonAspect) {
      return {
        create: function create(pickElement, wrap, remove) {
          var eventBinder = EventBinder();
          var buttonHTML = pickButtonAspect.getButtonHTML();
          pickElement.innerHTML = '<span></span>' + buttonHTML;
          var pickContentElement = pickElement.querySelector('SPAN');
          var pickButtonElement = pickElement.querySelector('BUTTON');
          eventBinder.bind(pickButtonElement, "click", remove);
          addStyling(pickContentElement, css.pickContent);
          addStyling(pickButtonElement, css.pickButton);
          var disableToggle = toggleStyling(pickContentElement, css.pickContent_disabled);

          function updateData() {
            pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option);
          }

          function updateDisabled() {
            disableToggle(wrap.isOptionDisabled);
          }

          function updateComponentDisabled() {
            pickButtonElement.disabled = componentPropertiesAspect.getDisabled();
          }

          return {
            pickDom: {
              pickContentElement: pickContentElement,
              pickButtonElement: pickButtonElement
            },
            pickDomManagerHandlers: {
              updateData: updateData,
              updateDisabled: updateDisabled,
              updateComponentDisabled: updateComponentDisabled
            },
            dispose: function dispose() {
              eventBinder.unbind();
            }
          };
        }
      };
    }

    function ChoiceDomFactory(css, optionPropertiesAspect, highlightAspect) {
      var updateHighlightedInternal = function updateHighlightedInternal(wrap, choiceDom, element) {
        var text = optionPropertiesAspect.getText(wrap.option);
        var highlighter = highlightAspect.getHighlighter();
        if (highlighter) highlighter(element, choiceDom, text);else element.textContent = text;
      };

      var updateDataInternal = function updateDataInternal(wrap, element) {
        element.textContent = optionPropertiesAspect.getText(wrap.option);
      }; //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there


      return {
        create: function create(choiceElement, wrap, toggle) {
          var choiceDom = null;
          var choiceDomManagerHandlers = null;
          var eventBinder = EventBinder();
          eventBinder.bind(choiceElement, "click", toggle);

          if (wrap.hasOwnProperty("isOptionSelected")) {
            choiceElement.innerHTML = '<div><input formnovalidate type="checkbox"><label></label></div>';
            var choiceContentElement = choiceElement.querySelector('DIV');
            var choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
            var choiceLabelElement = choiceContentElement.querySelector('LABEL');
            addStyling(choiceContentElement, css.choiceContent);
            addStyling(choiceCheckBoxElement, css.choiceCheckBox);
            addStyling(choiceLabelElement, css.choiceLabel);
            choiceDom = {
              choiceElement: choiceElement,
              choiceContentElement: choiceContentElement,
              choiceCheckBoxElement: choiceCheckBoxElement,
              choiceLabelElement: choiceLabelElement
            };
            var choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);

            var updateSelected = function updateSelected() {
              choiceSelectedToggle(wrap.isOptionSelected);
              choiceCheckBoxElement.checked = wrap.isOptionSelected;

              if (wrap.isOptionDisabled || wrap.choice.isHoverIn) {
                choiceHoverToggle(wrap.choice.isHoverIn, true);
              }
            };

            var choiceDisabledToggle = toggleStyling(choiceElement, css.choice_disabled);
            var choiceCheckBoxDisabledToggle = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled);
            var choiceLabelDisabledToggle = toggleStyling(choiceLabelElement, css.choiceLabel_disabled);
            var choiceCursorDisabledToggle = toggleStyling(choiceElement, {
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
              choiceCheckBoxElement.disabled = isCheckBoxDisabled;
              choiceCursorDisabledToggle(isCheckBoxDisabled);
            };

            var choiceHoverToggle = toggleStyling(choiceElement, function () {
              if (css.choice_disabled_hover && wrap.isOptionDisabled === true && wrap.isOptionSelected === false) return css.choice_disabled_hover;else return css.choice_hover;
            });

            var updateHoverIn = function updateHoverIn() {
              choiceHoverToggle(wrap.choice.isHoverIn);
            };

            choiceDomManagerHandlers = {
              updateData: function updateData() {
                return updateDataInternal(wrap, choiceLabelElement);
              },
              updateHighlighted: function updateHighlighted() {
                return updateHighlightedInternal(wrap, choiceDom, choiceLabelElement);
              },
              updateHoverIn: updateHoverIn,
              updateDisabled: updateDisabled,
              updateSelected: updateSelected
            };
          } else {
            var _choiceHoverToggle = toggleStyling(choiceElement, function () {
              return wrap.isOptionDisabled && css.choice_disabled_hover ? css.choice_disabled_hover : css.choice_hover;
            });

            var _updateHoverIn = function _updateHoverIn() {
              _choiceHoverToggle(wrap.choice.isHoverIn);
            };

            choiceElement.innerHTML = '<span></span>';

            var _choiceContentElement = choiceElement.querySelector('SPAN');

            choiceDom = {
              choiceElement: choiceElement,
              choiceContentElement: _choiceContentElement
            };
            choiceDomManagerHandlers = {
              updateData: function updateData() {
                return updateDataInternal(wrap, _choiceContentElement);
              },
              updateHighlighted: function updateHighlighted() {
                return updateHighlightedInternal(wrap, choiceDom, choiceElement);
              },
              updateHoverIn: _updateHoverIn
            };
          }

          return {
            choiceDom: choiceDom,
            choiceDomManagerHandlers: choiceDomManagerHandlers,
            dispose: function dispose() {
              eventBinder.unbind();
            }
          };
        }
      };
    }

    function CreateElementAspect(createElement) {
      return {
        createElement: createElement
      };
    }
    function StaticDomFactory(choicesDomFactory, createElementAspect) {
      return {
        create: function create(css) {
          var choicesDom = choicesDomFactory.create(css);
          return {
            choicesDom: choicesDom,
            createStaticDom: function createStaticDom(element, containerClass) {
              function showError(message) {
                element.style.backgroundColor = 'red';
                element.style.color = 'white';
                throw new Error(message);
              }

              var containerElement, picksElement;
              var removableContainerClass = false;

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

              var isDisposablePicksElement = false;

              if (!picksElement) {
                picksElement = createElementAspect.createElement('UL');
                isDisposablePicksElement = true;
              }

              return {
                choicesDom: choicesDom,
                staticDom: {
                  initialElement: element,
                  containerElement: containerElement,
                  picksElement: picksElement,
                  isDisposablePicksElement: isDisposablePicksElement
                },
                staticManager: {
                  appendToContainer: function appendToContainer() {
                    containerElement.appendChild(choicesDom.choicesElement);
                    if (isDisposablePicksElement) containerElement.appendChild(picksElement);
                  },
                  dispose: function dispose() {
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

    function PicksDom(picksElement, isDisposablePicksElement, createElementAspect, css) {
      var pickFilterElement = createElementAspect.createElement('LI');
      addStyling(picksElement, css.picks);
      addStyling(pickFilterElement, css.pickFilter);
      var disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
      var focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
      var isFocusIn = false;
      return {
        picksElement: picksElement,
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
          if (!isDisposablePicksElement) {
            disableToggleStyling(false);
            focusToggleStyling(false);
            if (pickFilterElement.parentNode) pickFilterElement.parentNode.removeChild(pickFilterElement);
          }
        }
      };
    }

    function FilterDom(isDisposablePicksElement, createElementAspect, css) {
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

          if (!isDisposablePicksElement) {
            if (filterInputElement.parentNode) filterInputElement.parentNode.removeChild(filterInputElement);
          }
        }
      };
    }

    function ChoicesDomFactory(createElementAspect) {
      return {
        create: function create(css) {
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

    function TriggerAspect(element, _trigger) {
      return {
        trigger: function trigger(eventName) {
          _trigger(element, eventName);
        }
      };
    }
    function OnChangeAspect(triggerAspect, name) {
      return {
        onChange: function onChange() {
          triggerAspect.trigger(name);
        }
      };
    }
    function ComponentPropertiesAspect(getDisabled) {
      return {
        getDisabled: getDisabled
      };
    }

    function OptionsAspect(options) {
      return {
        getOptions: function getOptions() {
          return options;
        }
      };
    }
    function OptionPropertiesAspect(getText) {
      if (!getText) {
        getText = function getText(option) {
          return option.text;
        };
      }

      return {
        getText: getText
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
            wrap.choice.setVisible(true);
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
            wrap.choice.setVisible(v);
          });
        }
      };
    }

    function BuildAndAttachChoiceAspect(buildChoiceAspect) {
      return {
        buildAndAttachChoice: function buildAndAttachChoice(wrap, getNextElement) {
          buildChoiceAspect.buildChoice(wrap);
          wrap.choice.choiceElementAttach(getNextElement == null ? void 0 : getNextElement());
        }
      };
    }
    function BuildChoiceAspect(choicesDom, choiceDomFactory, choiceClickAspect) {
      return {
        buildChoice: function buildChoice(wrap) {
          var _choicesDom$createCho = choicesDom.createChoiceElement(),
              choiceElement = _choicesDom$createCho.choiceElement,
              setVisible = _choicesDom$createCho.setVisible,
              attach = _choicesDom$createCho.attach,
              detach = _choicesDom$createCho.detach;

          wrap.choice.choiceElement = choiceElement;
          wrap.choice.choiceElementAttach = attach;
          wrap.choice.isChoiceElementAttached = true;

          var _choiceDomFactory$cre = choiceDomFactory.create(choiceElement, wrap, function () {
            return choiceClickAspect.choiceClick(wrap);
          }),
              dispose = _choiceDomFactory$cre.dispose,
              choiceDom = _choiceDomFactory$cre.choiceDom,
              choiceDomManagerHandlers = _choiceDomFactory$cre.choiceDomManagerHandlers;

          wrap.choice.choiceDom = choiceDom;
          choiceDomManagerHandlers.updateData();
          if (choiceDomManagerHandlers.updateSelected) choiceDomManagerHandlers.updateSelected();
          if (choiceDomManagerHandlers.updateDisabled) choiceDomManagerHandlers.updateDisabled();
          wrap.choice.choiceDomManagerHandlers = choiceDomManagerHandlers;

          wrap.choice.remove = function () {
            detach();
          };

          wrap.choice.isFilteredIn = true;

          wrap.choice.setHoverIn = function (v) {
            wrap.choice.isHoverIn = v;
            choiceDomManagerHandlers.updateHoverIn();
          };

          wrap.choice.setVisible = function (v) {
            wrap.choice.isFilteredIn = v;
            setVisible(wrap.choice.isFilteredIn);
          };

          wrap.choice.dispose = function () {
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

          wrap.dispose = function () {
            wrap.choice.dispose();
            wrap.dispose = null;
          };
        }
      };
    }

    function OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps) {
      return {
        attach: function attach(option) {
          var wrap = createWrapAspect.createWrap(option);
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
        loop: function loop() {
          var options = optionsAspect.getOptions();

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

    function IsChoiceSelectableAspect() {
      // TODO rename to IsSelectableByUserAspect ?
      return {
        isSelectable: function isSelectable(wrap) {
          return true;
        }
      };
    } // todo: remove?

    function ChoiceClickAspect(optionToggleAspect, filterDom) {
      return {
        choiceClick: function choiceClick(wrap) {
          optionToggleAspect.toggle(wrap);
          filterDom.setFocus();
        }
      };
    } // // fullMatchAspect trySetWrapSelected(fullMatchWrap.option, composeUpdateSelected(fullMatchWrap, true), true);

    function OptionToggleAspect(createPickHandlersAspect, addPickAspect
    /*, setOptionSelectedAspect*/
    ) {
      return {
        toggle: function toggle(wrap) {
          var pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
          addPickAspect.addPick(wrap, pickHandlers);
          return true; // TODO: process setOptionSelectedAspect
        }
      };
    }
    function AddPickAspect() {
      return {
        addPick: function addPick(wrap, pickHandlers) {
          return pickHandlers.producePick();
        }
      };
    }
    function FullMatchAspect(createPickHandlersAspect, addPickAspect) {
      return {
        fullMatch: function fullMatch(wrap) {
          var pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
          addPickAspect.addPick(wrap, pickHandlers);
          return true; // TODO: process setOptionSelectedAspect
        }
      };
    }
    function RemovePickAspect() {
      return {
        removePick: function removePick(wrap, pick) {
          pick.dispose(); // overrided in SelectedOptionPlugin with trySetWrapSelected(wrap, false);
        }
      };
    }
    function ProducePickAspect(picksList, removePickAspect, buildPickAspect) {
      return {
        producePick: function producePick(wrap, pickHandlers) {
          var pick = buildPickAspect.buildPick(wrap, function (event) {
            return pickHandlers.removeOnButton(event);
          });

          var fixSelectedFalse = function fixSelectedFalse() {
            return removePickAspect.removePick(wrap, pick);
          };

          pickHandlers.removeOnButton = fixSelectedFalse;
          pick.pickElementAttach();

          var _picksList$add = picksList.add(pick),
              removeFromPicksList = _picksList$add.remove;

          pick.setSelectedFalse = fixSelectedFalse;
          pick.wrap = wrap;
          pick.dispose = composeSync(removeFromPicksList, function () {
            pick.setSelectedFalse = null;
            pick.wrap = null;
          }, pick.dispose);

          pickHandlers.removeAndDispose = function () {
            return pick.dispose();
          };

          return pick;
        }
      };
    } // redefined in MultiSelectInlineLayout to redefine handlers removeOnButton
    // redefined in SelectedOptionPlugin to compose wrap.updateSelected

    function CreatePickHandlersAspect(producePickAspect) {
      return {
        createPickHandlers: function createPickHandlers(wrap) {
          var pickHandlers = {
            producePick: null,
            // not redefined directly, but redefined in addPickAspect
            removeAndDispose: null,
            // not redefined, 
            removeOnButton: null // redefined in MultiSelectInlineLayout

          };

          pickHandlers.producePick = function () {
            return producePickAspect.producePick(wrap, pickHandlers);
          };

          return pickHandlers;
        }
      };
    }
    function CreateChoiceBaseAspect(optionPropertiesAspect) {
      return {
        createChoiceBase: function createChoiceBase(option) {
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
        createWrap: function createWrap(option) {
          return {
            option: option
          };
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

    function PickButtonAspect(buttonHTML) {
      return {
        getButtonHTML: function getButtonHTML() {
          return buttonHTML;
        }
      };
    }

    function BuildPickAspect(picksDom, pickDomFactory) {
      return {
        buildPick: function buildPick(wrap, removeOnButton) {
          var _picksDom$createPickE = picksDom.createPickElement(),
              pickElement = _picksDom$createPickE.pickElement,
              attach = _picksDom$createPickE.attach,
              detach = _picksDom$createPickE.detach;

          var _pickDomFactory$creat = pickDomFactory.create(pickElement, wrap, removeOnButton),
              _dispose = _pickDomFactory$creat.dispose,
              pickDom = _pickDomFactory$creat.pickDom,
              pickDomManagerHandlers = _pickDomFactory$creat.pickDomManagerHandlers;

          pickDomManagerHandlers.updateData();
          if (pickDomManagerHandlers.updateDisabled) pickDomManagerHandlers.updateDisabled();
          if (pickDomManagerHandlers.updateComponentDisabled) pickDomManagerHandlers.updateComponentDisabled();
          var pick = {
            pickDom: pickDom,
            pickDomManagerHandlers: pickDomManagerHandlers,
            pickElementAttach: attach,
            dispose: function dispose() {
              detach();

              _dispose();

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
                var success = fullMatchAspect.fullMatch(fullMatchWrap);

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

    function MultiSelectInlineLayout(aspects) {
      var environment = aspects.environment,
          filterDom = aspects.filterDom,
          picksDom = aspects.picksDom,
          choicesDom = aspects.choicesDom,
          choicesVisibilityAspect = aspects.choicesVisibilityAspect,
          hoveredChoiceAspect = aspects.hoveredChoiceAspect,
          navigateAspect = aspects.navigateAspect,
          filterManagerAspect = aspects.filterManagerAspect,
          focusInAspect = aspects.focusInAspect,
          optionToggleAspect = aspects.optionToggleAspect,
          createPickHandlersAspect = aspects.createPickHandlersAspect,
          picksList = aspects.picksList,
          inputAspect = aspects.inputAspect,
          specialPicksEventsAspect = aspects.specialPicksEventsAspect,
          buildChoiceAspect = aspects.buildChoiceAspect,
          disableComponentAspect = aspects.disableComponentAspect,
          resetLayoutAspect = aspects.resetLayoutAspect,
          placeholderStopInputAspect = aspects.placeholderStopInputAspect,
          warningAspect = aspects.warningAspect,
          configuration = aspects.configuration,
          createPopperAspect = aspects.createPopperAspect,
          rtlAspect = aspects.rtlAspect,
          staticManager = aspects.staticManager;
      var picksElement = picksDom.picksElement;
      var choicesElement = choicesDom.choicesElement; // pop up layout, require createPopperPlugin

      var filterInputElement = filterDom.filterInputElement;
      var pop = createPopperAspect.createPopper(choicesElement, filterInputElement, true);
      staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop.init);
      var origBackSpace = specialPicksEventsAspect.backSpace;

      specialPicksEventsAspect.backSpace = function (pick) {
        origBackSpace(pick);
        pop.update();
      };

      if (rtlAspect) {
        var origUpdateRtl = rtlAspect.updateRtl;

        rtlAspect.updateRtl = function (isRtl) {
          origUpdateRtl(isRtl);
          pop.setRtl(isRtl);
        };
      }

      choicesVisibilityAspect.updatePopupLocation = composeSync(choicesVisibilityAspect.updatePopupLocation, function () {
        pop.update();
      });

      if (warningAspect) {
        var pop2 = createPopperAspect.createPopper(warningAspect.warningElement, filterInputElement, false);
        staticManager.appendToContainer = composeSync(staticManager.appendToContainer, pop2.init);

        if (rtlAspect) {
          var origUpdateRtl2 = rtlAspect.updateRtl;

          rtlAspect.updateRtl = function (isRtl) {
            origUpdateRtl2(isRtl);
            pop2.setRtl(isRtl);
          };
        }

        var origWarningAspectShow = warningAspect.show;

        warningAspect.show = function (msg) {
          pop2.update();
          origWarningAspectShow(msg);
        };

        pop.dispose = composeSync(pop.dispose, pop2.dispose);
      }

      var window = environment.window;
      var document = window.document;
      var eventLoopFlag = EventLoopProlongableFlag(window);
      var skipFocusout = false;

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
      };

      var documentMouseup = function documentMouseup(event) {
        // if we would left without focus then "close the drop" do not remove focus border
        if (choicesElement == event.target) filterDom.setFocus(); // if click outside container - close dropdown
        else if (!containsAndSelf(choicesElement, event.target) && !containsAndSelf(picksElement, event.target)) {
          resetLayoutAspect.resetLayout();
          focusInAspect.setFocusIn(false);
        }
      };

      function showChoices() {
        if (!choicesVisibilityAspect.isChoicesVisible()) {
          choicesVisibilityAspect.updatePopupLocation();
          eventLoopFlag.set();
          choicesVisibilityAspect.setChoicesVisible(true); // TODO: move to scroll plugin

          choicesElement.scrollTop = 0; // add listeners that manages close dropdown on  click outside container

          choicesElement.addEventListener("mousedown", skipoutMousedown);
          document.addEventListener("mouseup", documentMouseup);
        }
      }

      function hideChoices() {
        resetMouseCandidateChoice();
        hoveredChoiceAspect.resetHoveredChoice();

        if (choicesVisibilityAspect.isChoicesVisible()) {
          // COOMENT OUT DEBUGGING popup layout
          choicesVisibilityAspect.setChoicesVisible(false);
          choicesElement.removeEventListener("mousedown", skipoutMousedown);
          document.removeEventListener("mouseup", documentMouseup);
        }
      }

      var preventDefaultClickEvent = null;
      var componentDisabledEventBinder = EventBinder(); // TODO: remove setTimeout: set on start of mouse event reset on end

      function skipoutAndResetMousedown() {
        skipoutMousedown();
        window.setTimeout(function () {
          return resetSkipFocusout();
        });
      }

      picksElement.addEventListener("mousedown", skipoutAndResetMousedown);

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

      function processUncheck(uncheckOption, event) {
        // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
        // never remove elements in the same event iteration
        window.setTimeout(function () {
          return uncheckOption();
        });
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
        return function (event) {
          processUncheck(setSelectedFalse, event);
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
        var choiceElement = wrap.choice.choiceElement; // in chrome it happens on "become visible" so we need to skip it, 
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
      }

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
      }); // it can be initated by 3PP functionality
      // sample (1) BS functionality - input x button click - clears input
      // sample (2) BS functionality - esc keydown - clears input
      // and there could be difference in processing: (2) should hide the menu, then reset , when (1) should just reset without hiding.

      function afterInput() {
        var visibleCount = filterManagerAspect.getNavigateManager().getCount();

        if (visibleCount > 0) {
          if (warningAspect) {
            warningAspect.hide();
          }

          var panelIsVisble = choicesVisibilityAspect.isChoicesVisible();

          if (!panelIsVisble) {
            showChoices();
          }

          if (visibleCount == 1) {
            navigateAspect.hoverIn(filterManagerAspect.getNavigateManager().getHead());
          } else {
            if (panelIsVisble) hoveredChoiceAspect.resetHoveredChoice();
          }
        } else {
          if (choicesVisibilityAspect.isChoicesVisible()) {
            hideChoices();
          }

          if (warningAspect) {
            if (filterManagerAspect.getFilter()) warningAspect.show(configuration.noResultsWarning);else warningAspect.hide();
          }
        }
      }

      filterDom.onInput(function () {
        if (placeholderStopInputAspect && placeholderStopInputAspect.get()) {
          placeholderStopInputAspect.reset();
          return;
        }

        var _inputAspect$processI = inputAspect.processInput(),
            filterInputValue = _inputAspect$processI.filterInputValue,
            isEmpty = _inputAspect$processI.isEmpty;

        if (isEmpty) filterManagerAspect.processEmptyInput();else filterDom.setWidth(filterInputValue);
        eventLoopFlag.set(); // means disable mouse handlers that set hovered item; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

        afterInput();
      });

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
          var wasToggled = optionToggleAspect.toggle(hoveredWrap);

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

        if (keyCode == 9) {
          if (choicesVisibilityAspect.isChoicesVisible()) {
            hoveredToSelected();
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

      filterDom.onKeyDown(onKeyDown);
      filterDom.onKeyUp(onKeyUp);

      if (disableComponentAspect) {
        var origDisableComponent = disableComponentAspect.disableComponent;

        disableComponentAspect.disableComponent = function (isComponentDisabled) {
          origDisableComponent(isComponentDisabled);
          if (isComponentDisabled) componentDisabledEventBinder.unbind();else componentDisabledEventBinder.bind(picksElement, "click", clickToShowChoices);
        };
      }

      resetLayoutAspect.resetLayout = composeSync(hideChoices, function () {
        if (warningAspect) warningAspect.hide();
      }, resetLayoutAspect.resetLayout // resetFilter by default
      );
      var origCreatePickHandlers = createPickHandlersAspect.createPickHandlers;

      createPickHandlersAspect.createPickHandlers = function (wrap) {
        var pickHandlers = origCreatePickHandlers(wrap);
        pickHandlers.removeOnButton = handleOnRemoveButton(pickHandlers.removeOnButton);
        return pickHandlers;
      };

      var origBuildChoice = buildChoiceAspect.buildChoice;

      buildChoiceAspect.buildChoice = function (wrap) {
        origBuildChoice(wrap);
        var pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
        wrap.choice.remove = composeSync(wrap.choice.remove, function () {
          if (pickHandlers.removeAndDispose) {
            pickHandlers.removeAndDispose();
            pickHandlers.removeAndDispose = null;
          }
        });
        var unbindChoiceElement = adoptChoiceElement(wrap);
        wrap.choice.dispose = composeSync(unbindChoiceElement, wrap.choice.dispose);
      };

      return {
        dispose: function dispose() {
          resetMouseCandidateChoice();
          picksElement.removeEventListener("mousedown", skipoutAndResetMousedown);
          componentDisabledEventBinder.unbind();
          pop.dispose();
        }
      };
    }

    function ResetLayoutAspect(resetLayout) {
      return {
        resetLayout: resetLayout
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

    function CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection) {
      return {
        countableChoicesListInsert: function countableChoicesListInsert(wrap, key) {
          var choiceNext = wrapsCollection.getNext(key);
          countableChoicesList.add(wrap, choiceNext);
        }
      };
    }

    function BsMultiSelect$1(element, environment, plugins, configuration, onInit) {
      var _extendIfUndefined;

      var window = environment.window;
      environment.isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
      var containerClass = configuration.containerClass,
          css = configuration.css,
          getDisabled = configuration.getDisabled,
          options = configuration.options,
          getText = configuration.getText;
      var disposeAspect = {
        dispose: function dispose() {}
      };
      var triggerAspect = TriggerAspect(element, environment.trigger);
      var onChangeAspect = OnChangeAspect(triggerAspect, 'dashboardcode.multiselect:change');
      var componentPropertiesAspect = ComponentPropertiesAspect(getDisabled != null ? getDisabled : function () {
        return false;
      });
      var optionsAspect = OptionsAspect(options);
      var optionPropertiesAspect = OptionPropertiesAspect(getText);
      var isChoiceSelectableAspect = IsChoiceSelectableAspect();
      var createWrapAspect = CreateWrapAspect();
      var createChoiceBaseAspect = CreateChoiceBaseAspect(optionPropertiesAspect); //let rtlAspect = RtlAspect();
      //let setOptionSelectedAspect = SetOptionSelectedAspect(optionPropertiesAspect);

      var addPickAspect = AddPickAspect();
      var removePickAspect = RemovePickAspect();
      var createElementAspect = CreateElementAspect(function (name) {
        return window.document.createElement(name);
      });
      var choicesDomFactory = ChoicesDomFactory(createElementAspect);
      var staticDomFactory = StaticDomFactory(choicesDomFactory, createElementAspect);
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
      var countableChoicesListInsertAspect = CountableChoicesListInsertAspect(countableChoicesList, wrapsCollection);
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
      });
      var picksList = List();
      var wraps = Wraps(wrapsCollection, function () {
        return countableChoicesList.reset();
      }, function (w) {
        return countableChoicesList.remove(w);
      }, function (w, key) {
        return countableChoicesListInsertAspect.countableChoicesListInsert(w, key);
      });
      var aspects = {
        environment: environment,
        configuration: configuration,
        triggerAspect: triggerAspect,
        onChangeAspect: onChangeAspect,
        componentPropertiesAspect: componentPropertiesAspect,
        disposeAspect: disposeAspect,
        countableChoicesList: countableChoicesList,
        countableChoicesListInsertAspect: countableChoicesListInsertAspect,
        optionsAspect: optionsAspect,
        optionPropertiesAspect: optionPropertiesAspect,
        createWrapAspect: createWrapAspect,
        createChoiceBaseAspect: createChoiceBaseAspect,
        isChoiceSelectableAspect: isChoiceSelectableAspect,
        createElementAspect: createElementAspect,
        choicesDomFactory: choicesDomFactory,
        staticDomFactory: staticDomFactory,
        filterPredicateAspect: filterPredicateAspect,
        wrapsCollection: wrapsCollection,
        choicesEnumerableAspect: choicesEnumerableAspect,
        filteredChoicesList: filteredChoicesList,
        filterManagerAspect: filterManagerAspect,
        hoveredChoiceAspect: hoveredChoiceAspect,
        navigateAspect: navigateAspect,
        picksList: picksList,
        wraps: wraps,
        addPickAspect: addPickAspect,
        removePickAspect: removePickAspect
      };
      plugStaticDom(plugins, aspects); // apply cssPatch to css, apply selectElement support;  

      var _staticDomFactory$cre = staticDomFactory.create(css),
          choicesDom = _staticDomFactory$cre.choicesDom,
          createStaticDom = _staticDomFactory$cre.createStaticDom;

      var _createStaticDom = createStaticDom(element, containerClass),
          staticDom = _createStaticDom.staticDom,
          staticManager = _createStaticDom.staticManager; // after this we can use staticDom (means generated DOM elements) in plugin construtctor, what simplifies parameters passing a lot   
      // THINK: get filterDom, picksDom  from createStaticDom ?  But this would create excesive dublicate call in  selectElementPlugin


      var filterDom = FilterDom(staticDom.isDisposablePicksElement, createElementAspect, css);
      var picksDom = PicksDom(staticDom.picksElement, staticDom.isDisposablePicksElement, createElementAspect, css);
      var specialPicksEventsAspect = SpecialPicksEventsAspect();
      var choicesVisibilityAspect = ChoicesVisibilityAspect(choicesDom.choicesElement);
      var resetFilterListAspect = ResetFilterListAspect(filterDom, filterManagerAspect);
      var resetFilterAspect = ResetFilterAspect(filterDom, resetFilterListAspect);
      var focusInAspect = FocusInAspect(picksDom);
      var pickButtonAspect = PickButtonAspect(configuration.pickButtonHTML);
      var pickDomFactory = PickDomFactory(css, componentPropertiesAspect, optionPropertiesAspect, pickButtonAspect);
      var buildPickAspect = BuildPickAspect(picksDom, pickDomFactory);
      var producePickAspect = ProducePickAspect(picksList, removePickAspect, buildPickAspect);
      var createPickHandlersAspect = CreatePickHandlersAspect(producePickAspect);
      var optionToggleAspect = OptionToggleAspect(createPickHandlersAspect, addPickAspect);
      var fullMatchAspect = FullMatchAspect(createPickHandlersAspect, addPickAspect);
      var inputAspect = InputAspect(filterDom, filterManagerAspect, fullMatchAspect);
      var choiceClickAspect = ChoiceClickAspect(optionToggleAspect, filterDom);
      var choiceDomFactory = ChoiceDomFactory(css, optionPropertiesAspect, aspects.highlightAspect); // optional highlightAspect added by highlightPlugin

      var buildChoiceAspect = BuildChoiceAspect(choicesDom, choiceDomFactory, choiceClickAspect);
      var buildAndAttachChoiceAspect = BuildAndAttachChoiceAspect(buildChoiceAspect);
      var resetLayoutAspect = ResetLayoutAspect(function () {
        return resetFilterAspect.resetFilter();
      });
      var optionAttachAspect = OptionAttachAspect(createWrapAspect, createChoiceBaseAspect, buildAndAttachChoiceAspect, wraps);
      var optionsLoopAspect = OptionsLoopAspect(optionsAspect, optionAttachAspect);
      var updateDataAspect = UpdateDataAspect(choicesDom, wraps, picksList, optionsLoopAspect, resetLayoutAspect);
      var updateAspect = UpdateAspect(updateDataAspect);
      var loadAspect = LoadAspect(optionsLoopAspect);
      extendIfUndefined(aspects, (_extendIfUndefined = {
        staticDom: staticDom,
        picksDom: picksDom,
        choicesDom: choicesDom,
        filterDom: filterDom,
        resetLayoutAspect: resetLayoutAspect,
        pickDomFactory: pickDomFactory,
        choiceDomFactory: choiceDomFactory,
        choicesVisibilityAspect: choicesVisibilityAspect,
        staticManager: staticManager,
        buildChoiceAspect: buildChoiceAspect,
        optionToggleAspect: optionToggleAspect,
        choiceClickAspect: choiceClickAspect,
        buildAndAttachChoiceAspect: buildAndAttachChoiceAspect,
        optionsLoopAspect: optionsLoopAspect,
        optionAttachAspect: optionAttachAspect,
        buildPickAspect: buildPickAspect,
        producePickAspect: producePickAspect,
        createPickHandlersAspect: createPickHandlersAspect,
        inputAspect: inputAspect,
        resetFilterListAspect: resetFilterListAspect,
        resetFilterAspect: resetFilterAspect,
        specialPicksEventsAspect: specialPicksEventsAspect
      }, _extendIfUndefined["resetLayoutAspect"] = resetLayoutAspect, _extendIfUndefined.focusInAspect = focusInAspect, _extendIfUndefined.loadAspect = loadAspect, _extendIfUndefined.updateDataAspect = updateDataAspect, _extendIfUndefined.updateAspect = updateAspect, _extendIfUndefined.fullMatchAspect = fullMatchAspect, _extendIfUndefined));
      var pluginManager = PluginManager(plugins, aspects);
      var multiSelectInlineLayout = MultiSelectInlineLayout(aspects);
      var api = {
        component: "BsMultiSelect.api"
      }; // key to use in memory leak analyzes

      pluginManager.buildApi(api); // after this we can pass aspects methods call without wrapping - there should be no more overridings. TODO freeze aspects?

      api.dispose = composeSync(resetLayoutAspect.resetLayout, function () {
        disposeAspect.dispose();
      }, pluginManager.dispose, function () {
        picksList.forEach(function (pick) {
          return pick.dispose();
        });
      }, multiSelectInlineLayout.dispose, // TODO move to layout
      wraps.dispose, staticManager.dispose, picksDom.dispose, filterDom.dispose);

      api.updateData = function () {
        updateDataAspect.updateData();
      };

      api.update = function () {
        updateAspect.update();
      }; // TODO api.updateOption = (key) => {/* all updates: selected, disabled, hidden, text */}


      onInit == null ? void 0 : onInit(api, aspects);
      picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
      picksDom.picksElement.appendChild(picksDom.pickFilterElement);
      staticManager.appendToContainer();
      loadAspect.load();
      return api;
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

    function MultiSelectBuilder(environment, plugins) {
      var defaults = {
        containerClass: "dashboardcode-bsmultiselect"
      };

      var create = function create(element, options) {
        var _options2;

        if (options && options.plugins) console.log("DashboarCode.BsMultiSelect: 'options.plugins' is depricated, use - MultiSelectBuilder(environment, plugins) instead");
        var configuration = {};
        var buildConfiguration;

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

        configuration.css = createCss(defaults.css, (_options2 = options) == null ? void 0 : _options2.css);
        plugMergeSettings(plugins, configuration, defaults, options); // merge settings.cssPatch and defaults.cssPatch

        extendIfUndefined(configuration, options);
        extendIfUndefined(configuration, defaults);
        var onInit = buildConfiguration == null ? void 0 : buildConfiguration(element, configuration); // TODO: configuration should become an aspect

        var multiSelect = BsMultiSelect$1(element, environment, plugins, configuration, onInit); // onInit(api, aspects) - before load data

        return multiSelect;
      };

      plugDefaultConfig(plugins, defaults);
      return {
        create: create,
        defaultSettings: defaults
      };
    }

    function createForJQuery(window, $, globalPopper, name, pluginsSet, stylePlugin) {
      var trigger = null;
      var isJQyery = $ && !window.document.body.hasAttribute('data-bs-no-jquery');

      if (isJQyery) {
        trigger = function trigger(e, eventName) {
          return $(e).trigger(eventName);
        };
      } else {
        trigger = composeEventTrigger(window);
      }

      var plugins = shallowClearClone({
        stylePlugin: stylePlugin
      }, pluginsSet);
      var environment = {
        trigger: trigger,
        window: window,
        globalPopper: globalPopper
      };
      var pluginsArray = ObjectValues(plugins);

      var _MultiSelectBuilder = MultiSelectBuilder(environment, pluginsArray),
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

    function LabelForAttributePlugin(aspects) {
      var staticDom = aspects.staticDom,
          filterDom = aspects.filterDom,
          getLabelElementAspect = aspects.getLabelElementAspect,
          configuration = aspects.configuration,
          loadAspect = aspects.loadAspect,
          disposeAspect = aspects.disposeAspect;
      var containerClass = configuration.containerClass;
      var labelForAttributeAspect = LabelForAttributeAspect(staticDom, filterDom, containerClass, getLabelElementAspect, disposeAspect);
      aspects.labelForAttributeAspect = labelForAttributeAspect;
      loadAspect.load = composeSync(loadAspect.load, function () {
        return labelForAttributeAspect.update();
      });
    }

    LabelForAttributePlugin.plugDefaultConfig = function (defaults) {
      defaults.label = null;
    };

    LabelForAttributePlugin.plugStaticDom = function (aspects) {
      aspects.getLabelElementAspect = GetLabelElementAspect(aspects.configuration.label);
    };

    function GetLabelElementAspect(label) {
      return {
        getLabelElement: function getLabelElement() {
          // overrided by BS Appearance Plugin
          defCall(label);
        }
      };
    }

    function LabelForAttributeAspect(staticDom, filterDom, containerClass, getLabelElementAspect, disposeAspect) {
      return {
        update: function update() {
          var createInputId = null;
          var selectElement = staticDom.selectElement,
              containerElement = staticDom.containerElement;
          var filterInputElement = filterDom.filterInputElement;
          if (selectElement) createInputId = function createInputId() {
            return containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
          };else createInputId = function createInputId() {
            return containerClass + "-generated-filter-" + containerElement.id;
          };
          var labelElement = getLabelElementAspect.getLabelElement();

          if (labelElement) {
            var backupedForAttribute = labelElement.getAttribute('for');
            var newId = createInputId();
            filterInputElement.setAttribute('id', newId);
            labelElement.setAttribute('for', newId);

            if (backupedForAttribute) {
              disposeAspect.dispose = composeSync(disposeAspect.dispose, function () {
                return labelElement.setAttribute('for', backupedForAttribute);
              });
            }
          }
        }
      };
    }

    function RtlPlugin(aspects) {
      var configuration = aspects.configuration,
          rtlAspect = aspects.rtlAspect,
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

      return {
        buildApi: function buildApi(api) {
          // TODO: there is something wrong with this. may be should moved to specific plugin
          // sample of correct plugin - aspect pair is WarningPlugin: aspect is added on plugin constructor
          rtlAspect.updateRtl(isRtl);
        },
        dispose: function dispose() {
          attributeBackup.restore();
        }
      };
    }

    RtlPlugin.plugStaticDom = function (aspects) {
      aspects.rtlAspect = RtlAspect();
    };

    function RtlAspect() {
      return {
        updateRtl: function updateRtl() {}
      };
    }

    function FormResetPlugin(aspects) {
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

    function createValidity(valueMissing, customError) {
      return Object.freeze({
        valueMissing: valueMissing,
        customError: customError,
        valid: !(valueMissing || customError)
      });
    }

    function ValidityApi(visibleElement, isValueMissingObservable, valueMissingMessage, onValid, trigger) {
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

    var defValueMissingMessage = 'Please select an item in the list';
    function ValidationApiPlugin(pluginData) {
      var configuration = pluginData.configuration,
          triggerAspect = pluginData.triggerAspect,
          onChangeAspect = pluginData.onChangeAspect,
          optionsAspect = pluginData.optionsAspect,
          staticDom = pluginData.staticDom,
          filterDom = pluginData.filterDom,
          updateDataAspect = pluginData.updateDataAspect; // TODO: required could be a function

      var getIsValueMissing = configuration.getIsValueMissing,
          valueMissingMessage = configuration.valueMissingMessage,
          required = configuration.required,
          getValueRequired = configuration.getValueRequired;
      if (!isBoolean(required)) required = getValueRequired();
      valueMissingMessage = defCall(valueMissingMessage, function () {
        return getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "value-missing-message");
      }, defValueMissingMessage);

      if (!getIsValueMissing) {
        getIsValueMissing = function getIsValueMissing() {
          var count = 0;
          var optionsArray = optionsAspect.getOptions();

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
      onChangeAspect.onChange = composeSync(isValueMissingObservable.call, onChangeAspect.onChange);
      updateDataAspect.updateData = composeSync(isValueMissingObservable.call, updateDataAspect.updateData);
      pluginData.validationApiPluginData = {
        validationApiObservable: validationApiObservable
      };
      var validationApi = ValidityApi(filterDom.filterInputElement, isValueMissingObservable, valueMissingMessage, function (isValid) {
        return validationApiObservable.setValue(isValid);
      }, triggerAspect.trigger);
      return {
        buildApi: function buildApi(api) {
          api.validationApi = validationApi;
        },
        dispose: function dispose() {
          isValueMissingObservable.detachAll();
          validationApiObservable.detachAll();
        }
      };
    }

    ValidationApiPlugin.plugDefaultConfig = function (defaults) {
      defaults.getValueRequired = function () {
        return false;
      };

      defaults.valueMissingMessage = '';
    };

    function BsAppearancePlugin(pluginData) {
      var configuration = pluginData.configuration,
          validationApiPluginData = pluginData.validationApiPluginData,
          picksDom = pluginData.picksDom,
          staticDom = pluginData.staticDom,
          getLabelElementAspect = pluginData.getLabelElementAspect,
          updateAppearanceAspect = pluginData.updateAppearanceAspect,
          componentPropertiesAspect = pluginData.componentPropertiesAspect,
          floatingLabelAspect = pluginData.floatingLabelAspect;
      var getValidity = configuration.getValidity,
          getSize = configuration.getSize,
          useCssPatch = configuration.useCssPatch,
          css = configuration.css,
          composeGetSize = configuration.composeGetSize,
          getDefaultLabel = configuration.getDefaultLabel;
      var selectElement = staticDom.selectElement;
      var initialElement = staticDom.initialElement;
      var isFloatingLabel = false;

      if (floatingLabelAspect) {
        isFloatingLabel = closestByClassName(initialElement, 'form-floating');

        floatingLabelAspect.isFloatingLabel = function () {
          return isFloatingLabel;
        };
      }

      if (getLabelElementAspect) {
        var origGetLabelElementAspect = getLabelElementAspect.getLabelElement;

        getLabelElementAspect.getLabelElement = function () {
          var e = origGetLabelElementAspect();
          if (e) return e;else {
            if (selectElement) {
              var labelElement = getDefaultLabel(selectElement);
              return labelElement;
            }
          }
        };
      }

      if (staticDom.selectElement) {
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

      componentPropertiesAspect.getSize = getSize;
      componentPropertiesAspect.getValidity = getValidity;
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
        var wasValidatedElement = closestByClassName(staticDom.initialElement, 'was-validated');
        return wasValidatedElement ? true : false;
      };

      var wasUpdatedObservable = ObservableLambda(function () {
        return getWasValidated();
      });
      var getManualValidationObservable = ObservableLambda(function () {
        return getValidity();
      });
      var validationApiObservable = validationApiPluginData == null ? void 0 : validationApiPluginData.validationApiObservable;
      var validationObservable = ObservableLambda(function () {
        return wasUpdatedObservable.getValue() ? validationApiObservable.getValue() : getManualValidationObservable.getValue();
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
      if (validationApiObservable) validationApiObservable.attach(function () {
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

    function HiddenOptionPlugin(aspects) {
      var configuration = aspects.configuration,
          createWrapAspect = aspects.createWrapAspect,
          isChoiceSelectableAspect = aspects.isChoiceSelectableAspect,
          wrapsCollection = aspects.wrapsCollection,
          buildChoiceAspect = aspects.buildChoiceAspect,
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
              return updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect);
            });
          };

          api.updateOptionHidden = function (key) {
            return updateChoiceHidden(wrapsCollection.get(key), key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect);
          }; // TODO create updateHidden ? 
          // it is too complex since we need to find the next non hidden, when this depends on key 
          // there should be the backreference "wrap -> index" invited before
          // api.updateOptionHidden  = (key) => wrapsCollection.get(key).updateHidden();

        }
      };
    }

    function buildHiddenChoice(wrap) {
      wrap.updateSelected = function () {
        return void 0;
      };

      wrap.choice.isChoiceElementAttached = false;
      wrap.choice.choiceElement = null;
      wrap.choice.choiceElementAttach = null;
      wrap.choice.setVisible = null;
      wrap.choice.setHoverIn = null;
      wrap.choice.remove = null;

      wrap.choice.dispose = function () {
        wrap.choice.dispose = null;
      };

      wrap.dispose = function () {
        wrap.choice.dispose();
        wrap.dispose = null;
      };
    }

    function updateChoiceHidden(wrap, key, getNextNonHidden, countableChoicesList, getIsOptionHidden, buildChoiceAspect) {
      var newIsOptionHidden = getIsOptionHidden(wrap.option);

      if (newIsOptionHidden != wrap.isOptionHidden) {
        wrap.isOptionHidden = newIsOptionHidden;

        if (wrap.isOptionHidden) {
          countableChoicesList.remove(wrap);
          wrap.choice.remove();
          buildHiddenChoice(wrap);
        } else {
          var nextChoice = getNextNonHidden(key);
          countableChoicesList.add(wrap, nextChoice);
          buildChoiceAspect.buildChoice(wrap);
          wrap.choice.choiceElementAttach(nextChoice == null ? void 0 : nextChoice.choice.choiceElement);
        }
      }
    }

    function CssPatchPlugin() {}

    CssPatchPlugin.plugMergeSettings = function (configuration, defaults, settings) {
      var cssPatch = settings == null ? void 0 : settings.cssPatch;
      if (isBoolean(cssPatch)) throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

      configuration.cssPatch = createCss(defaults.cssPatch, cssPatch); // replace classes, merge styles
    };

    CssPatchPlugin.plugStaticDom = function (configurationPluginData) {
      var configuration = configurationPluginData.configuration;
      if (configuration.useCssPatch) extendCss(configuration.css, configuration.cssPatch);
    };

    function PlaceholderPlugin(aspects) {
      var configuration = aspects.configuration,
          staticManager = aspects.staticManager,
          picksList = aspects.picksList,
          picksDom = aspects.picksDom,
          filterDom = aspects.filterDom,
          staticDom = aspects.staticDom,
          updateDataAspect = aspects.updateDataAspect,
          resetFilterListAspect = aspects.resetFilterListAspect,
          filterManagerAspect = aspects.filterManagerAspect,
          environment = aspects.environment;
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

        aspects.placeholderStopInputAspect = placeholderStopInputAspect;
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

    function JQueryMethodsPlugin(aspects) {
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

    function OptionsApiPlugin(pluginData) {
      var buildAndAttachChoiceAspect = pluginData.buildAndAttachChoiceAspect,
          wraps = pluginData.wraps,
          wrapsCollection = pluginData.wrapsCollection,
          createWrapAspect = pluginData.createWrapAspect,
          createChoiceBaseAspect = pluginData.createChoiceBaseAspect,
          optionsAspect = pluginData.optionsAspect,
          resetLayoutAspect = pluginData.resetLayoutAspect;
      return {
        buildApi: function buildApi(api) {
          api.updateOptionAdded = function (key) {
            // TODO: generalize index as key 
            var options = optionsAspect.getOptions();
            var option = options[key];
            var wrap = createWrapAspect.createWrap(option);
            wrap.choice = createChoiceBaseAspect.createChoiceBase(option);
            wraps.insert(key, wrap);

            var nextChoice = function nextChoice() {
              return wrapsCollection.getNext(key, function (c) {
                return c.choice.choiceElement;
              });
            };

            buildAndAttachChoiceAspect.buildAndAttachChoice(wrap, function () {
              var _nextChoice;

              return (_nextChoice = nextChoice()) == null ? void 0 : _nextChoice.choice.choiceElement;
            });
          };

          api.updateOptionRemoved = function (key) {
            // TODO: generalize index as key 
            resetLayoutAspect.resetLayout(); // always hide 1st, then reset filter

            var wrap = wraps.remove(key);
            wrap.choice.remove == null ? void 0 : wrap.choice.remove();
            wrap.dispose == null ? void 0 : wrap.dispose();
          };
        }
      };
    }

    function FormRestoreOnBackwardPlugin(aspects) {
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

    function SelectElementPlugin(aspects) {
      var loadAspect = aspects.loadAspect,
          environment = aspects.environment;
      var origLoadAspectLoop = loadAspect.loop;
      var document = environment.window.document;

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

    SelectElementPlugin.plugStaticDom = function (aspects) {
      var configuration = aspects.configuration,
          staticDomFactory = aspects.staticDomFactory,
          createElementAspect = aspects.createElementAspect,
          componentPropertiesAspect = aspects.componentPropertiesAspect,
          onChangeAspect = aspects.onChangeAspect,
          triggerAspect = aspects.triggerAspect,
          optionsAspect = aspects.optionsAspect,
          optGroupAspect = aspects.optGroupAspect,
          disposeAspect = aspects.disposeAspect;
      var origStaticDomFactoryCreate = staticDomFactory.create;

      staticDomFactory.create = function (css) {
        var _origStaticDomFactory = origStaticDomFactoryCreate(css),
            choicesDom = _origStaticDomFactory.choicesDom,
            origCreateStaticDom = _origStaticDomFactory.createStaticDom;

        var choicesElement = choicesDom.choicesElement;
        return {
          choicesDom: choicesDom,
          createStaticDom: function createStaticDom(element, containerClass) {
            var selectElement = null;
            var containerElement = null;
            var picksElement = null;

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

            var disposableContainerElement = false;

            if (!containerElement) {
              containerElement = createElementAspect.createElement('DIV');
              containerElement.classList.add(containerClass);
              disposableContainerElement = true;
            }

            var isDisposablePicksElement = false;

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
              var getDisabled = configuration.getDisabled;

              if (!getDisabled) {
                var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');

                if (fieldsetElement) {
                  componentPropertiesAspect.getDisabled = function () {
                    return selectElement.disabled || fieldsetElement.disabled;
                  };
                } else {
                  componentPropertiesAspect.getDisabled = function () {
                    return selectElement.disabled;
                  };
                }
              }

              onChangeAspect.onChange = composeSync(function () {
                return triggerAspect.trigger('change');
              }, onChangeAspect.onChange);

              optionsAspect.getOptions = function () {
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

              disposeAspect.dispose = composeSync(disposeAspect.dispose, function () {
                selectElement.required = backupedRequired;
                selectElement.style.display = backupDisplay;
              });
            }

            return {
              staticDom: {
                initialElement: element,
                containerElement: containerElement,
                picksElement: picksElement,
                isDisposablePicksElement: isDisposablePicksElement,
                selectElement: selectElement
              },
              staticManager: {
                appendToContainer: function appendToContainer() {
                  if (disposableContainerElement) {
                    selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
                    containerElement.appendChild(choicesElement);
                  } else {
                    selectElement.parentNode.insertBefore(choicesElement, selectElement.nextSibling);
                  }

                  if (isDisposablePicksElement) containerElement.appendChild(picksElement);
                },
                dispose: function dispose() {
                  choicesElement.parentNode.removeChild(choicesElement);
                  if (disposableContainerElement) selectElement.parentNode.removeChild(containerElement);
                  if (isDisposablePicksElement) containerElement.removeChild(picksElement);
                }
              }
            };
          }
        };
      };
    };

    // plugin should overdrive them : call setWrapSelected and etc
    // therefore there should new component API methods
    // addOptionPick(key) -> call addPick(pick) which returns removePick() 
    // SetOptionSelectedAspect, OptionToggleAspect should be moved there 
    // OptionToggleAspect overrided in DisabledOptionPlugin
    // wrap.isOptionSelected ,  wrap.updateSelected

    function SelectedOptionPlugin(aspects) {
      var configuration = aspects.configuration,
          wrapsCollection = aspects.wrapsCollection,
          updateOptionsSelectedAspect = aspects.updateOptionsSelectedAspect,
          createWrapAspect = aspects.createWrapAspect,
          buildChoiceAspect = aspects.buildChoiceAspect,
          removePickAspect = aspects.removePickAspect,
          resetLayoutAspect = aspects.resetLayoutAspect,
          picksList = aspects.picksList,
          isChoiceSelectableAspect = aspects.isChoiceSelectableAspect,
          optionToggleAspect = aspects.optionToggleAspect,
          createPickHandlersAspect = aspects.createPickHandlersAspect,
          addPickAspect = aspects.addPickAspect,
          fullMatchAspect = aspects.fullMatchAspect,
          onChangeAspect = aspects.onChangeAspect,
          filterPredicateAspect = aspects.filterPredicateAspect;
      var getIsOptionSelected = configuration.getSelected,
          setIsOptionSelected = configuration.setSelected;
      var origFilterPredicate = filterPredicateAspect.filterPredicate;

      filterPredicateAspect.filterPredicate = function (wrap, text) {
        return !wrap.isOptionSelected && origFilterPredicate(wrap, text);
      };

      var origBuildChoice = buildChoiceAspect.buildChoice;

      buildChoiceAspect.buildChoice = function (wrap) {
        origBuildChoice(wrap);

        wrap.updateSelected = function () {
          wrap.choice.choiceDomManagerHandlers.updateSelected();
          onChangeAspect.onChange();
        };

        wrap.dispose = composeSync(function () {
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
        return function () {
          wrap.isOptionSelected = booleanValue;
          wrap.updateSelected();
        };
      }

      function trySetWrapSelected(option, updateSelected, booleanValue) {
        //  wrap.option
        var success = false;
        var confirmed = setIsOptionSelected(option, booleanValue);

        if (!(confirmed === false)) {
          updateSelected();
          success = true;
        }

        return success;
      }

      var origCreateWrap = createWrapAspect.createWrap;

      createWrapAspect.createWrap = function (option) {
        var wrap = origCreateWrap(option);
        wrap.isOptionSelected = getIsOptionSelected(option);
        wrap.updateSelected = null; // can it be combined ?

        return wrap;
      };

      optionToggleAspect.toggle; // TODO: improve design, no replace

      optionToggleAspect.toggle = function (wrap) {
        return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected);
      };

      fullMatchAspect.fullMatch;

      fullMatchAspect.fullMatch = function (wrap) {
        return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);
      };

      removePickAspect.removePick; // TODO: improve design, no replace

      removePickAspect.removePick = function (wrap, pick) {
        // TODO: try remove pick
        return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);
      };

      var origCreatePickHandlers = createPickHandlersAspect.createPickHandlers;

      createPickHandlersAspect.createPickHandlers = function (wrap) {
        var pickHandlers = origCreatePickHandlers(wrap);
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
        addPickAspect.addPick(wrap, pickHandlers);
        return pickHandlers;
      };

      var origAddPick = addPickAspect.addPick;

      addPickAspect.addPick = function (wrap, pickHandlers) {
        if (wrap.isOptionSelected) {
          var pick = origAddPick(wrap, pickHandlers);
          wrap.pick = pick;
          pick.dispose = composeSync(pick.dispose, function () {
            wrap.pick = null;
          });
          return pick;
        }
      };

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
            return updateChoiceSelected(wrapsCollection.get(key), getIsOptionSelected);
          };
        }
      };
    }

    SelectedOptionPlugin.plugStaticDom = function (aspects) {
      var configuration = aspects.configuration,
          wrapsCollection = aspects.wrapsCollection;
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

      configuration.getSelected = getIsOptionSelected;
      configuration.setSelected = setIsOptionSelected;
      aspects.updateOptionsSelectedAspect = UpdateOptionsSelectedAspect(wrapsCollection, getIsOptionSelected);
    };

    function UpdateOptionsSelectedAspect(wrapsCollection, getIsOptionSelected) {
      return {
        updateOptionsSelected: function updateOptionsSelected() {
          wrapsCollection.forLoop(function (wrap) {
            return updateChoiceSelected(wrap, getIsOptionSelected);
          });
        }
      };
    }

    function updateChoiceSelected(wrap, getIsOptionSelected) {
      var newIsSelected = getIsOptionSelected(wrap.option);

      if (newIsSelected != wrap.isOptionSelected) {
        wrap.isOptionSelected = newIsSelected;
        wrap.updateSelected == null ? void 0 : wrap.updateSelected(); // some hidden oesn't have element (and need to be updated)
      }
    }

    function DisabledOptionPlugin(pluginData) {
      var configuration = pluginData.configuration,
          isChoiceSelectableAspect = pluginData.isChoiceSelectableAspect,
          createWrapAspect = pluginData.createWrapAspect,
          buildChoiceAspect = pluginData.buildChoiceAspect,
          filterPredicateAspect = pluginData.filterPredicateAspect,
          wrapsCollection = pluginData.wrapsCollection,
          optionToggleAspect = pluginData.optionToggleAspect,
          buildPickAspect = pluginData.buildPickAspect;
      var getIsOptionDisabled = configuration.getIsOptionDisabled,
          options = configuration.options;

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

      var origToggle = optionToggleAspect.toggle;

      optionToggleAspect.toggle = function (wrap) {
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

      var origIsSelectable = isChoiceSelectableAspect.isSelectable;

      isChoiceSelectableAspect.isSelectable = function (wrap) {
        return origIsSelectable(wrap) && !wrap.isOptionDisabled;
      };

      var origFilterPredicate = filterPredicateAspect.filterPredicate;

      filterPredicateAspect.filterPredicate = function (wrap, text) {
        return !wrap.isOptionDisabled && origFilterPredicate(wrap, text);
      };

      var origBuildChoice = buildChoiceAspect.buildChoice;

      buildChoiceAspect.buildChoice = function (wrap) {
        origBuildChoice(wrap);
        wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled;
        wrap.choice.dispose = composeSync(function () {
          wrap.updateDisabled = null;
        }, wrap.choice.dispose);
      };

      var origBuildPick = buildPickAspect.buildPick;

      buildPickAspect.buildPick = function (wrap, removeOnButton) {
        var pick = origBuildPick(wrap, removeOnButton);

        pick.updateDisabled = function () {
          return pick.pickDomManagerHandlers.updateDisabled();
        };

        pick.dispose = composeSync(pick.dispose, function () {
          pick.updateDisabled = null;
        });
        var choiceUpdateDisabledBackup = wrap.updateDisabled;
        wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled); // add pickDisabled

        pick.dispose = composeSync(pick.dispose, function () {
          wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled

          wrap.updateDisabled(); // make "true disabled" without it checkbox only looks disabled
        });
        return pick;
      };

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

    function updateChoiceDisabled(wrap, getIsOptionDisabled) {
      var newIsDisabled = getIsOptionDisabled(wrap.option);

      if (newIsDisabled != wrap.isOptionDisabled) {
        wrap.isOptionDisabled = newIsDisabled;
        wrap.updateDisabled == null ? void 0 : wrap.updateDisabled(); // some hidden oesn't have element (and need to be updated)
      }
    }

    function PicksApiPlugin(pluginData) {
      var picksList = pluginData.picksList,
          createWrapAspect = pluginData.createWrapAspect,
          createPickHandlersAspect = pluginData.createPickHandlersAspect,
          addPickAspect = pluginData.addPickAspect;
      return {
        buildApi: function buildApi(api) {
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

            var pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            addPickAspect.addPick(wrap, pickHandlers);
          };
        }
      };
    }

    function PicksPlugin(aspects) {
      var configuration = aspects.configuration;
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

    PicksPlugin.plugStaticDom = function (aspects) {
      var configuration = aspects.configuration,
          picksList = aspects.picksList;
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
    };

    function CreatePopperPlugin(aspects) {
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

      aspects.createPopperAspect = CreatePopperAspect(createPopperVX, createModifiersVX);
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

    function CreatePopperAspect(createPopperVX, createModifiersVX) {
      return {
        createPopper: function createPopper(element, anchorElement, preventOverflow) {
          var modifiers = createModifiersVX(preventOverflow);
          var popperConfiguration = {
            placement: 'bottom-start',
            modifiers: modifiers
          };
          var popper = null;
          return {
            init: function init() {
              popper = createPopperVX(anchorElement, element, popperConfiguration);
            },
            update: function update() {
              popper.update(); // become async in popper 2; use forceUpdate if sync is needed? 
            },
            setRtl: function setRtl(isRtl) {
              if (isRtl) {
                popperConfiguration.placement = 'bottom-end';
              }
            },
            dispose: function dispose() {
              popper.destroy();
            }
          };
        }
      };
    }

    function FloatingLabelPlugin(pluginData) {
      var configuration = pluginData.configuration,
          picksList = pluginData.picksList,
          picksDom = pluginData.picksDom,
          filterDom = pluginData.filterDom,
          staticDom = pluginData.staticDom,
          updateDataAspect = pluginData.updateDataAspect,
          resetFilterListAspect = pluginData.resetFilterListAspect,
          floatingLabelAspect = pluginData.floatingLabelAspect;
      var css = configuration.css,
          getDefaultLabel = configuration.getDefaultLabel;
      var initialElement = staticDom.initialElement;

      if (floatingLabelAspect.isFloatingLabel()) {
        var liftedLabel = function liftedLabel(isEmpty) {
          liftToggleStyling1(isEmpty);
          liftToggleStyling2(isEmpty);
        };

        var updateLiftedLabel = function updateLiftedLabel() {
          liftedLabel(!isEmpty());
        };

        var labelElement = getDefaultLabel(initialElement);
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

    FloatingLabelPlugin.plugStaticDom = function (aspects) {
      aspects.floatingLabelAspect = FloatingLabelAspect();
    };

    function FloatingLabelAspect() {
      return {
        isFloatingLabel: function isFloatingLabel() {}
      };
    }

    // aka auto height and scrolling
    function ChoicesDynamicStylingPlugin(aspects) {
      var configuration = aspects.configuration;

      if (configuration.useChoicesDynamicStyling) {
        var choicesVisibilityAspect = aspects.choicesVisibilityAspect,
            specialPicksEventsAspect = aspects.specialPicksEventsAspect;
        var origSetChoicesVisible = choicesVisibilityAspect.setChoicesVisible;

        aspects.choicesVisibilityAspect.setChoicesVisible = function (visible) {
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

    function choicesDynamicStyling(aspects) {
      var configuration = aspects.configuration,
          environment = aspects.environment,
          choicesDom = aspects.choicesDom,
          navigateAspect = aspects.navigateAspect;
      var window = environment.window;
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
          if (wrap != null && wrap.choice != null && wrap.choice.choiceElement != null) wrap.choice.choiceElement.scrollIntoView(false); // alignTo false -  scroll to the top bottom of dropdown first
          // TODO: BUG if mouse left on the dropdow scroll to bottom and one after doesn't work properly

          return wrap;
        };
      }
    }

    ChoicesDynamicStylingPlugin.plugDefaultConfig = function (defaults) {
      defaults.useChoicesDynamicStyling = false;
      defaults.choicesDynamicStyling = choicesDynamicStyling;
      defaults.minimalChoicesDynamicStylingMaxHeight = 20;
    };

    var defNoResultsWarningMessage = 'No results found';
    function WarningPlugin(pluginData) {
      var configuration = pluginData.configuration,
          choicesDom = pluginData.choicesDom,
          createElementAspect = pluginData.createElementAspect,
          staticManager = pluginData.staticManager;
      var css = configuration.css;
      if (configuration.isNoResultsWarningEnabled) pluginData.warningAspect = WarningAspect(choicesDom, createElementAspect, staticManager, css);
    }

    WarningPlugin.plugDefaultConfig = function (defaults) {
      defaults.noResultsWarning = defNoResultsWarningMessage;
      defaults.isNoResultsWarningEnabled = false;
    };

    function WarningAspect(choicesDom, createElementAspect, staticManager, css) {
      var choicesElement = choicesDom.choicesElement;
      var warningElement = createElementAspect.createElement('DIV');
      var origAppendToContainer = staticManager.appendToContainer;

      staticManager.appendToContainer = function () {
        origAppendToContainer();
        choicesElement.parentNode.insertBefore(warningElement, choicesElement.nextSibling); // insert after
      };

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

    function HighlightPlugin(aspects) {
      var highlightAspect = aspects.highlightAspect,
          filterManagerAspect = aspects.filterManagerAspect,
          buildChoiceAspect = aspects.buildChoiceAspect;

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

        var origBuildChoice = buildChoiceAspect.buildChoice;

        buildChoiceAspect.buildChoice = function (wrap) {
          origBuildChoice(wrap);
          var origSetVisible = wrap.choice.setVisible;

          wrap.choice.setVisible = function (v) {
            origSetVisible(v);
            wrap.choice.choiceDomManagerHandlers.updateHighlighted();
          };
        };
      }
    }

    HighlightPlugin.plugStaticDom = function (aspects) {
      if (aspects.configuration.useHighlighting) aspects.highlightAspect = HighlightAspect();
    };

    HighlightPlugin.plugDefaultConfig = function (defaults) {
      defaults.useHighlighting = false;
    };

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

    function CustomChoiceStylingsPlugin(apsects) {
      var configuration = apsects.configuration,
          choiceDomFactory = apsects.choiceDomFactory;
      var customChoiceStylingsAspect = CustomChoiceStylingsAspect(configuration.customChoiceStylings);
      var origChoiceDomFactoryCreate = choiceDomFactory.create;

      choiceDomFactory.create = function (choiceElement, wrap, toggle) {
        var o = origChoiceDomFactoryCreate(choiceElement, wrap, toggle);
        customChoiceStylingsAspect.customize(wrap, o.choiceDom, o.choiceDomManagerHandlers);
        return o;
      };
    }

    CustomChoiceStylingsPlugin.plugDefaultConfig = function (defaults) {
      defaults.customChoiceStylings = null;
    };

    function CustomChoiceStylingsAspect(customChoiceStylings) {
      return {
        customize: function customize(wrap, choiceDom, choiceDomManagerHandlers) {
          if (customChoiceStylings) {
            var handlers = customChoiceStylings(choiceDom, wrap.option);

            if (handlers) {
              var customChoiceStylingsClosure = function customChoiceStylingsClosure(custom) {
                return function () {
                  custom({
                    isOptionSelected: wrap.isOptionSelected,
                    isOptionDisabled: wrap.isOptionDisabled,
                    isHoverIn: wrap.choice.isHoverIn //isHighlighted: wrap.choice.isHighlighted  // TODO isHighlighted should be developed

                  });
                };
              };

              if (choiceDomManagerHandlers.updateHoverIn && handlers.updateHoverIn) choiceDomManagerHandlers.updateHoverIn = composeSync(choiceDomManagerHandlers.updateHoverIn, customChoiceStylingsClosure(handlers.updateHoverIn));
              if (choiceDomManagerHandlers.updateSelected && handlers.updateSelected) choiceDomManagerHandlers.updateSelected = composeSync(choiceDomManagerHandlers.updateSelected, customChoiceStylingsClosure(handlers.updateSelected));
              if (choiceDomManagerHandlers.updateDisabled && handlers.updateDisabled) choiceDomManagerHandlers.updateDisabled = composeSync(choiceDomManagerHandlers.updateDisabled, customChoiceStylingsClosure(handlers.updateDisabled));
              if (choiceDomManagerHandlers.updateHighlighted && handlers.updateHighlighted) choiceDomManagerHandlers.updateHighlighted = composeSync(choiceDomManagerHandlers.updateHighlighted, customChoiceStylingsClosure(handlers.updateHighlighted));
            }
          }
        }
      };
    }

    function CustomPickStylingsPlugin(aspects) {
      var componentPropertiesAspect = aspects.componentPropertiesAspect,
          configuration = aspects.configuration,
          pickDomFactory = aspects.pickDomFactory;
      var customPickStylingsAspect = CustomPickStylingsAspect(componentPropertiesAspect, configuration.customPickStylings);
      var origPickDomFactoryCreate = pickDomFactory.create;

      pickDomFactory.create = function (pickElement, wrap, removeOnButton) {
        var o = origPickDomFactoryCreate(pickElement, wrap, removeOnButton);
        customPickStylingsAspect.customize(wrap, o.pickDom, o.pickDomManagerHandlers);
        return o;
      };
    }

    CustomPickStylingsPlugin.plugDefaultConfig = function (defaults) {
      defaults.customPickStylings = null;
    };

    function CustomPickStylingsAspect(componentPropertiesAspect, customPickStylings) {
      return {
        customize: function customize(wrap, pickDom, pickDomManagerHandlers) {
          if (customPickStylings) {
            var handlers = customPickStylings(pickDom, wrap.option);

            if (handlers) {
              var customPickStylingsClosure = function customPickStylingsClosure(custom) {
                return function () {
                  custom({
                    isOptionDisabled: wrap.isOptionDisabled,
                    isComponentDisabled: componentPropertiesAspect.getDisabled()
                  });
                };
              };

              if (pickDomManagerHandlers.updateDisabled && handlers.updateDisabled) pickDomManagerHandlers.updateDisabled = composeSync(pickDomManagerHandlers.updateDisabled, customPickStylingsClosure(handlers.updateDisabled));
              if (pickDomManagerHandlers.updateComponentDisabled && handlers.updateComponentDisabled) pickDomManagerHandlers.updateComponentDisabled = composeSync(pickDomManagerHandlers.updateComponentDisabled, customPickStylingsClosure(handlers.updateComponentDisabled));
            }
          }
        }
      };
    }

    function UpdateAppearancePlugin(aspects) {
      var updateAppearanceAspect = aspects.updateAppearanceAspect,
          updateAspect = aspects.updateAspect,
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

    UpdateAppearancePlugin.plugStaticDom = function (aspects) {
      aspects.updateAppearanceAspect = UpdateAppearanceAspect();
    };

    function UpdateAppearanceAspect() {
      return {
        updateAppearance: function updateAppearance() {}
      };
    }

    function DisableComponentPlugin(aspects) {
      var updateAppearanceAspect = aspects.updateAppearanceAspect,
          picksList = aspects.picksList,
          picksDom = aspects.picksDom,
          componentPropertiesAspect = aspects.componentPropertiesAspect;
      var disableComponentAspect = DisableComponentAspect(picksList, picksDom);
      aspects.disableComponentAspect = disableComponentAspect;
      var isComponentDisabled; // state! 

      function updateDisabled() {
        var newIsComponentDisabled = componentPropertiesAspect.getDisabled();

        if (isComponentDisabled !== newIsComponentDisabled) {
          isComponentDisabled = newIsComponentDisabled;
          disableComponentAspect.disableComponent(newIsComponentDisabled);
        }
      }

      updateAppearanceAspect.updateAppearance = composeSync(updateAppearanceAspect.updateAppearance, updateDisabled);
      return {
        buildApi: function buildApi(api) {
          api.updateDisabled = updateDisabled;
        }
      };
    }

    function DisableComponentAspect(picksList, picksDom) {
      return {
        disableComponent: function disableComponent(isComponentDisabled) {
          picksList.forEach(function (pick) {
            return pick.pickDomManagerHandlers.updateComponentDisabled();
          });
          picksDom.disable(isComponentDisabled);
        }
      };
    }

    var defaultPlugins = {
      CssPatchPlugin: CssPatchPlugin,
      SelectElementPlugin: SelectElementPlugin,
      LabelForAttributePlugin: LabelForAttributePlugin,
      HiddenOptionPlugin: HiddenOptionPlugin,
      ValidationApiPlugin: ValidationApiPlugin,
      UpdateAppearancePlugin: UpdateAppearancePlugin,
      BsAppearancePlugin: BsAppearancePlugin,
      DisableComponentPlugin: DisableComponentPlugin,
      FormResetPlugin: FormResetPlugin,
      CreatePopperPlugin: CreatePopperPlugin,
      WarningPlugin: WarningPlugin,
      RtlPlugin: RtlPlugin,
      PlaceholderPlugin: PlaceholderPlugin,
      FloatingLabelPlugin: FloatingLabelPlugin,
      OptionsApiPlugin: OptionsApiPlugin,
      JQueryMethodsPlugin: JQueryMethodsPlugin,
      SelectedOptionPlugin: SelectedOptionPlugin,
      FormRestoreOnBackwardPlugin: FormRestoreOnBackwardPlugin,
      DisabledOptionPlugin: DisabledOptionPlugin,
      PicksApiPlugin: PicksApiPlugin,
      HighlightPlugin: HighlightPlugin,
      ChoicesDynamicStylingPlugin: ChoicesDynamicStylingPlugin,
      CustomPickStylingsPlugin: CustomPickStylingsPlugin,
      CustomChoiceStylingsPlugin: CustomChoiceStylingsPlugin
    };
    var picksPlugins = {
      CssPatchPlugin: CssPatchPlugin,
      PicksPlugin: PicksPlugin,
      LabelForAttributePlugin: LabelForAttributePlugin,
      ValidationApiPlugin: ValidationApiPlugin,
      UpdateAppearancePlugin: UpdateAppearancePlugin,
      BsAppearancePlugin: BsAppearancePlugin,
      DisableComponentPlugin: DisableComponentPlugin,
      CreatePopperPlugin: CreatePopperPlugin,
      WarningPlugin: WarningPlugin,
      RtlPlugin: RtlPlugin,
      PlaceholderPlugin: PlaceholderPlugin,
      FloatingLabelPlugin: FloatingLabelPlugin,
      OptionsApiPlugin: OptionsApiPlugin,
      JQueryMethodsPlugin: JQueryMethodsPlugin,
      PicksApiPlugin: PicksApiPlugin,
      HighlightPlugin: HighlightPlugin,
      ChoicesDynamicStylingPlugin: ChoicesDynamicStylingPlugin,
      CustomPickStylingsPlugin: CustomPickStylingsPlugin,
      CustomChoiceStylingsPlugin: CustomChoiceStylingsPlugin
    };
    var allPlugins = shallowClearClone(defaultPlugins, {
      PicksPlugin: PicksPlugin
    }); // var defaultConfig = {
    //     plugins: defaultPlugins
    // }
    // var picksConfig = {
    //     plugins: picksPlugins
    // }
    // export function createConfig(arg){
    //     return config;
    // }

    function Bs4Plugin() {}

    Bs4Plugin.plugDefaultConfig = function (defaults) {
      defaults.css = css;
      setDefaults(defaults);
    };

    function setDefaults(defaults) {
      defaults.useCssPatch = true;
      defaults.cssPatch = cssPatch;
      defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>';
      defaults.composeGetSize = composeGetSize;
      defaults.getDefaultLabel = getDefaultLabel;
    }

    var css = {
      choices: 'dropdown-menu',
      // bs4, in bsmultiselect.scss as ul.dropdown-menu
      choicesList: '',
      // bs4, in bsmultiselect.scss as div.dropdown-menu>ul (first child)
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
      choiceLabel_disabled: '',
      warning: 'alert-warning bg-warning'
    };
    var cssPatch = {
      choicesList: {
        listStyleType: 'none',
        paddingLeft: '0',
        paddingRight: '0',
        marginBottom: '0'
      },
      picks: {
        listStyleType: 'none',
        display: 'flex',
        flexWrap: 'wrap',
        height: 'auto',
        marginBottom: '0',
        cursor: 'text'
      },
      choice: {
        classes: 'px-md-2 px-1',
        styles: {
          cursor: 'pointer'
        }
      },
      choice_hover: 'text-primary bg-light',
      choice_disabled_hover: 'bg-light',
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
      // used in PicksDom
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
      // used in BsAppearancePlugin
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
        lineHeight: '1.5em',
        paddingLeft: '0',
        paddingRight: '.5rem',
        paddingInlineStart: '0',
        paddingInlineEnd: '0.5rem'
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
        justifyContent: 'flex-start',
        cursor: 'inherit'
      },
      // BS problem: without this on inline form menu items justified center
      choiceLabel: {
        color: 'inherit',
        cursor: 'inherit'
      },
      // otherwise BS .was-validated set its color
      choiceCheckBox: {
        color: 'inherit',
        cursor: 'inherit'
      },
      choiceLabel_disabled: {
        opacity: '.65'
      },
      // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 
      warning: {
        paddingLeft: '.25rem',
        paddingRight: '.25rem',
        zIndex: 4,
        fontSize: 'small',
        backgroundColor: 'var(--bs-warning)'
      } // zIndex=4  since the input-group zIndex=3

    };

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

    function getDefaultLabel(selectElement) {
      var value = null;
      var formGroup = closestByClassName(selectElement, 'form-group');
      if (formGroup) value = formGroup.querySelector("label[for=\"" + selectElement.id + "\"]");
      return value;
    }

    var utilities = {
      composeSync: composeSync,
      EventBinder: EventBinder,
      addStyling: addStyling,
      toggleStyling: toggleStyling
    };

    var BsMultiSelect = function (window, jQuery, createPopper) {
      return createForJQuery(window, jQuery, createPopper, 'BsMultiSelect', defaultPlugins, Bs4Plugin);
    }(window, $__default['default'], Popper__default['default']);

    var BsPicks = function (window, jQuery, createPopper) {
      return createForJQuery(window, jQuery, createPopper, 'BsPicks', picksPlugins, Bs4Plugin);
    }(window, $__default['default'], Popper__default['default']);

    var BsMultiSelect_bs4_jquery = {
      BsMultiSelect: BsMultiSelect,
      BsPicks: BsPicks,
      MultiSelectTools: {
        MultiSelectBuilder: MultiSelectBuilder,
        plugins: shallowClearClone({
          Bs4Plugin: Bs4Plugin
        }, allPlugins),
        utilities: utilities
      }
    };

    return BsMultiSelect_bs4_jquery;

})));
//# sourceMappingURL=BsMultiSelect.bs4.js.map
