/*!
  * DashboardCode BsMultiSelect v0.6.0 (https://dashboardcode.github.io/BsMultiSelect/)
  * Copyright 2017-2020 Roman Pokrovskij (github user rpokrovskij)
  * Licensed under APACHE 2 (https://github.com/DashboardCode/BsMultiSelect/blob/master/LICENSE)
  */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jquery'), require('popper.js')) :
    typeof define === 'function' && define.amd ? define(['jquery', 'popper.js'], factory) :
    (global = global || self, factory(global.jQuery, global.Popper));
}(this, (function ($, Popper) { 'use strict';

    $ = $ && Object.prototype.hasOwnProperty.call($, 'default') ? $['default'] : $;
    Popper = Popper && Object.prototype.hasOwnProperty.call(Popper, 'default') ? Popper['default'] : Popper;

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
        return this.each(function (i, e) {
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

            instance[methodName]();
          }
        });
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
    function initiateDefaults(constructors, defaults) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$setDe, _constructors$i;

        (_constructors$i$setDe = (_constructors$i = constructors[i]).setDefaults) == null ? void 0 : _constructors$i$setDe.call(_constructors$i, defaults);
      }
    }
    function mergeDefaults(constructors, configuration, defaults, settings) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$merge, _constructors$i2;

        (_constructors$i$merge = (_constructors$i2 = constructors[i]).mergeDefaults) == null ? void 0 : _constructors$i$merge.call(_constructors$i2, configuration, defaults, settings);
      }
    }
    function onConfiguration(constructors, configuration) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$onCon, _constructors$i3;

        (_constructors$i$onCon = (_constructors$i3 = constructors[i]).onConfiguration) == null ? void 0 : _constructors$i$onCon.call(_constructors$i3, configuration);
      }
    }
    function staticDomDefaults(constructors, staticDomFactory) {
      for (var i = 0; i < constructors.length; i++) {
        var _constructors$i$stati, _constructors$i4;

        (_constructors$i$stati = (_constructors$i4 = constructors[i]).staticDomDefaults) == null ? void 0 : _constructors$i$stati.call(_constructors$i4, staticDomFactory);
      }
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
    function ListFacade(getPrev, setPrev, getNext, setNext) {
      var head = null,
          tail = null;
      var count = 0;

      var remove = function remove(e) {
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
      };

      return {
        add: function add(e, next) {
          if (!tail) {
            head = tail = e;
          } else {
            if (!next) {
              setPrev(e, tail);
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
    function DoublyLinkedCollection(getPrev, setPrev, getNext, setNext) {
      var list = [];
      var head = null,
          tail = null;
      var count = 0;

      var remove = function remove(key) {
        var e = list[key];
        list.splice(key, 1);
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
        return e;
      };

      return {
        getLength: function getLength() {
          return list.length;
        },
        push: function push(e) {
          list.push(e);

          if (!tail) {
            head = tail = e;
          } else {
            setPrev(e, tail);
            setNext(tail, e);
            tail = e;
          }

          count++;
        },
        add: function add(e, key) {
          if (!tail) {
            head = tail = e;
          } else {
            var next = list[key];

            if (!next) {
              setPrev(e, tail);
              setNext(tail, e);
              tail = e;
            } else {
              list.splice(key, 0, e);
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
        get: function get(key) {
          return list[key];
        },
        remove: remove,
        forLoop: function forLoop(f) {
          for (var i = 0; i < list.length; i++) {
            var e = list[i];
            f(e);
          }
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
          list = [];
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
        return functions.forEach(function (f) {
          if (f) f();
        });
      };
    }
    function def() {
      for (var _len3 = arguments.length, functions = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        functions[_key3] = arguments[_key3];
      }

      for (var _i = 0, _functions = functions; _i < _functions.length; _i++) {
        var f = _functions[_i];

        if (f) {
          return f;
        }
      }
    }
    function defCall() {
      for (var _len4 = arguments.length, functions = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        functions[_key4] = arguments[_key4];
      }

      for (var _i2 = 0, _functions2 = functions; _i2 < _functions2.length; _i2++) {
        var f = _functions2[_i2];

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

    function StaticDomFactory(createElement, choicesElement) {
      return {
        createElement: createElement,
        choicesElement: choicesElement,
        staticDomGenerator: function staticDomGenerator(element, containerClass) {
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

          var disposablePicksElement = false;

          if (!picksElement) {
            picksElement = createElement('UL');
            disposablePicksElement = true;
          }

          return {
            staticDom: {
              initialElement: element,
              containerElement: containerElement,
              picksElement: picksElement,
              disposablePicksElement: disposablePicksElement
            },
            staticManager: {
              appendToContainer: function appendToContainer() {
                containerElement.appendChild(choicesElement);
                if (disposablePicksElement) containerElement.appendChild(picksElement);
              },
              dispose: function dispose() {
                containerElement.removeChild(choicesElement);
                if (removableContainerClass) containerElement.classList.remove(containerClass);
                if (disposablePicksElement) containerElement.removeChild(picksElement);
              }
            }
          };
        }
      };
    }

    function PicksDom(picksElement, disposablePicksElement, createElement, css) {
      var pickFilterElement = createElement('LI');
      addStyling(picksElement, css.picks);
      addStyling(pickFilterElement, css.pickFilter);
      var disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
      var focusToggleStyling = toggleStyling(picksElement, css.picks_focus);
      var isFocusIn = false;
      return {
        picksElement: picksElement,
        pickFilterElement: pickFilterElement,
        createPickElement: function createPickElement() {
          var pickElement = createElement('LI');
          addStyling(pickElement, css.pick);
          return {
            pickElement: pickElement,
            attach: function attach() {
              return picksElement.insertBefore(pickElement, pickFilterElement);
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
          if (!disposablePicksElement) {
            disableToggleStyling(false);
            focusToggleStyling(false);
            if (pickFilterElement.parentNode) pickFilterElement.parentNode.removeChild(pickFilterElement);
          }
        }
      };
    }

    function FilterDom(disposablePicksElement, createElement, css) {
      var filterInputElement = createElement('INPUT');
      addStyling(filterInputElement, css.filterInput);
      filterInputElement.setAttribute("type", "search");
      filterInputElement.setAttribute("autocomplete", "off");
      return {
        filterInputElement: filterInputElement,
        isEmpty: function isEmpty() {
          return filterInputElement.value ? false : true;
        },
        setEmpty: function setEmpty() {
          filterInputElement.value = '';
        },
        setFocus: function setFocus() {
          filterInputElement.focus();
        },
        // TODO: check why I need this comparision? 
        setFocusIfNotTarget: function setFocusIfNotTarget(target) {
          if (target != filterInputElement) filterInputElement.focus();
        },
        dispose: function dispose() {
          if (!disposablePicksElement) {
            if (filterInputElement.parentNode) filterInputElement.parentNode.removeChild(filterInputElement);
          }
        }
      };
    }

    function ChoicesDom(createElement, css) {
      var choicesElement = createElement('UL');
      addStyling(choicesElement, css.choices);
      return {
        choicesElement: choicesElement,
        createChoiceElement: function createChoiceElement() {
          var choiceElement = createElement('LI');
          addStyling(choiceElement, css.choice);
          return {
            choiceElement: choiceElement,
            setVisible: function setVisible(isVisible) {
              return choiceElement.style.display = isVisible ? 'block' : 'none';
            },
            attach: function attach(element) {
              return choicesElement.insertBefore(choiceElement, element);
            },
            detach: function detach() {
              return choicesElement.removeChild(choiceElement);
            }
          };
        }
      };
    }

    function PopupAspect(choicesElement, filterInputElement, Popper) {
      choicesElement.style.display = 'none';
      var popper = null;
      var popperConfiguration = {
        placement: 'bottom-start',
        modifiers: {
          preventOverflow: {
            enabled: true
          },
          hide: {
            enabled: false
          },
          flip: {
            enabled: false
          }
        }
      };
      return {
        init: function init() {
          //if (!!Popper.prototype && !!Popper.prototype.constructor.name) {
          popper = new Popper(filterInputElement, choicesElement, popperConfiguration);
          /*}else{
              popper=Popper.createPopper(
                  filterInputElement,
                  choicesElement,
                  //  https://github.com/popperjs/popper.js/blob/next/docs/src/pages/docs/modifiers/prevent-overflow.mdx#mainaxis
                  // {
                  //     placement: isRtl?'bottom-end':'bottom-start',
                  //     modifiers: { preventOverflow: {enabled:false}, hide: {enabled:false}, flip: {enabled:false} }
                  // }
              );
          }*/
        },
        isChoicesVisible: function isChoicesVisible() {
          return choicesElement.style.display != 'none';
        },
        setChoicesVisible: function setChoicesVisible(visible) {
          choicesElement.style.display = visible ? 'block' : 'none';
        },
        popperConfiguration: popperConfiguration,
        updatePopupLocation: function updatePopupLocation() {
          popper.update();
        },
        dispose: function dispose() {
          popper.destroy();
        }
      };
    }

    function ComponentAspect(getDisabled, trigger) {
      if (!getDisabled) getDisabled = function getDisabled() {
        return false;
      };
      return {
        getDisabled: getDisabled,
        onChange: function onChange() {
          trigger('dashboardcode.multiselect:change');
        }
      };
    }

    function DataSourceAspect(options, getSelected, setSelected, getDisabled) {
      if (!getSelected) {
        getSelected = function getSelected(option) {
          return option.selected;
        };
      }

      if (!setSelected) {
        setSelected = function setSelected(option, value) {
          option.selected = value;
        }; // TODO: move to sql
        // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
        // if (value) option.setAttribute('selected','');
        // else option.removeAttribute('selected');

      }

      if (!getDisabled) getDisabled = function getDisabled(option) {
        return option.disabled === undefined ? false : option.disabled;
      };
      return {
        getOptions: function getOptions() {
          return options;
        },
        getSelected: getSelected,
        setSelected: setSelected,
        getDisabled: getDisabled
      };
    }

    function ChoicesGetNextAspect(getHead, getNext) {
      return {
        getHead: getHead,
        getNext: getNext
      };
    }
    function ChoicesEnumerableAspect(choicesGetNextAspect) {
      return {
        forEach: function (_forEach) {
          function forEach(_x) {
            return _forEach.apply(this, arguments);
          }

          forEach.toString = function () {
            return _forEach.toString();
          };

          return forEach;
        }(function (f) {
          var choice = choicesGetNextAspect.getHead(); // this.choices.getHead()

          while (choice) {
            forEach(function (choice) {
              f(choice);
              choice = choicesGetNextAspect.getNext(choice);
            });
          }
        })
      };
    }
    function FilterListAspect(choicesGetNextAspect, choicesEnumerableAspect) {
      var _ref;

      var filterListFacade = ListFacade(function (choice) {
        return choice.filteredPrev;
      }, function (choice, v) {
        return choice.filteredPrev = v;
      }, function (choice) {
        return choice.filteredNext;
      }, function (choice, v) {
        return choice.filteredNext = v;
      });

      var composeFilterPredicate = function composeFilterPredicate(text) {
        return function (choice) {
          return !choice.isOptionSelected && !choice.isOptionDisabled && choice.searchText.indexOf(text) >= 0;
        };
      };

      return _ref = {
        addFilterFacade: function addFilterFacade(choice) {
          // redefined in HidenOptionPulgin
          filterListFacade.add(choice);
        },
        insertFilterFacade: function insertFilterFacade(choice) {
          // redefined in HidenOptionPulgin
          var choiceNonhiddenBefore = choicesGetNextAspect.getNext(choice);
          filterListFacade.add(choice, choiceNonhiddenBefore);
        },
        navigate: function navigate(down, choice
        /* hoveredChoice */
        ) {
          if (down) {
            return choice ? choice.filteredNext : filterListFacade.getHead();
          } else {
            return choice ? choice.filteredPrev : filterListFacade.getTail();
          }
        },
        processEmptyInput: function processEmptyInput() {
          // redefined in PlaceholderPulgin
          filterListFacade.reset();
          choicesEnumerableAspect.forEach(function (choice) {
            choice.filteredPrev = choice.filteredNext = null;
            filterListFacade.add(choice);
            choice.setVisible(true);
          });
        },
        setFilter: function setFilter(text) {
          var getFilterIn = composeFilterPredicate(text);
          filterListFacade.reset();
          choicesEnumerableAspect.forEach(function (choice) {
            choice.filteredPrev = choice.filteredNext = null;
            var v = getFilterIn(choice);
            if (v) filterListFacade.add(choice);
            choice.setVisible(v);
          });
        },
        getCount: function getCount() {
          return filterListFacade.getCount();
        },
        getHead: function getHead() {
          return filterListFacade.getHead();
        },
        reset: function reset() {
          return filterListFacade.reset();
        },
        remove: function remove(c) {
          filterListFacade.remove(c);
        },
        add: function add(e, next) {
          filterListFacade.add(e, next);
        }
      }, _ref["remove"] = function remove(e) {
        filterListFacade.remove(e);
      }, _ref;
    }

    function ChoicesElementAspect(choicesDom, filterDom, choiceContentGenerator, componentAspect, optionToggleAspect, picksAspect) {
      return {
        buildChoiceElement: function buildChoiceElement(choice, adoptChoiceElement, // aspect.adoptChoiceElement
        handleOnRemoveButton // aspect.handleOnRemoveButton
        ) {
          var _choicesDom$createCho = choicesDom.createChoiceElement(),
              choiceElement = _choicesDom$createCho.choiceElement,
              setVisible = _choicesDom$createCho.setVisible,
              attach = _choicesDom$createCho.attach,
              detach = _choicesDom$createCho.detach;

          choice.choiceElement = choiceElement;
          choice.choiceElementAttach = attach;
          var choiceContent = choiceContentGenerator(choiceElement, function () {
            optionToggleAspect.toggleOptionSelected(choice);
            filterDom.setFocus();
          });

          var updateSelectedChoiceContent = function updateSelectedChoiceContent() {
            return choiceContent.select(choice.isOptionSelected);
          };

          var pickTools = {
            updateSelectedTrue: null,
            updateSelectedFalse: null
          };

          var updateSelectedTrue = function updateSelectedTrue() {
            var removePick = picksAspect.createPick(choice, handleOnRemoveButton);
            pickTools.updateSelectedFalse = removePick;
          };

          pickTools.updateSelectedTrue = updateSelectedTrue;

          choice.remove = function () {
            detach();

            if (pickTools.updateSelectedFalse) {
              pickTools.updateSelectedFalse();
              pickTools.updateSelectedFalse = null;
            }
          };

          choice.updateSelected = function () {
            updateSelectedChoiceContent();
            if (choice.isOptionSelected) pickTools.updateSelectedTrue();else {
              pickTools.updateSelectedFalse();
              pickTools.updateSelectedFalse = null;
            }
            componentAspect.onChange();
          };

          var unbindChoiceElement = adoptChoiceElement(choice, choiceElement);
          choice.isFilteredIn = true;
          choiceContent.setData(choice.option);

          choice.setHoverIn = function (v) {
            choice.isHoverIn = v;
            choiceContent.hoverIn(choice.isHoverIn);
          };

          choice.setVisible = function (v) {
            choice.isFilteredIn = v;
            setVisible(choice.isFilteredIn);
          };

          choice.updateDisabled = function () {
            choiceContent.disable(choice.isOptionDisabled, choice.isOptionSelected);
          };

          choice.dispose = function () {
            unbindChoiceElement();
            choiceContent.dispose();
            choice.choiceElement = null;
            choice.choiceElementAttach = null;
            choice.remove = null;
            choice.updateSelected = null;
            choice.updateDisabled = null; // not real data manipulation but internal state

            choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item

            choice.setHoverIn = null;
            choice.dispose = null;
          };

          if (choice.isOptionSelected) {
            updateSelectedChoiceContent();
            updateSelectedTrue();
          }

          choice.updateDisabled();
        }
      };
    }
    function ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect) {
      return {
        pushChoiceItem: function pushChoiceItem(choice, adoptChoiceElement, // multiSelectInputAspect.adoptChoiceElement
        handleOnRemoveButton // multiSelectInputAspect.handleOnRemoveButton
        ) {
          choicesElementAspect.buildChoiceElement(choice, adoptChoiceElement, handleOnRemoveButton);
          choice.choiceElementAttach();
        },
        insertChoiceItem: function insertChoiceItem(choice, adoptChoiceElement, // aspect.adoptChoiceElement
        handleOnRemoveButton) {
          choicesElementAspect.buildChoiceElement(choice, adoptChoiceElement, handleOnRemoveButton);
          var nextChoice = choicesGetNextAspect.getNext(choice);
          choice.choiceElementAttach(nextChoice == null ? void 0 : nextChoice.choiceElement);
        }
      };
    }
    function ChoicesAspect(document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect) {
      return {
        updateDataImpl: function updateDataImpl(adoptChoiceElement, // aspect.adoptChoiceElement
        handleOnRemoveButton) {
          var fillChoices = function fillChoices() {
            var options = dataSourceAspect.getOptions();

            for (var i = 0; i < options.length; i++) {
              var option = options[i];
              var choice = optionAspect.createChoice(option);
              choices.push(choice);
              choiceFactoryAspect.pushChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
            }
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
        }
      };
    }

    function UpdateDataAspect(multiSelectInputAspect, manageableResetFilterListAspect, choicesDom, choices, picks, choicesAspect) {
      return {
        updateData: function updateData() {
          // close drop down , remove filter
          multiSelectInputAspect.hideChoices(); // always hide 1st

          manageableResetFilterListAspect.resetFilter();
          choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"

          choices.clear();
          picks.clear();
          choicesAspect.updateDataImpl(function (c, e) {
            return multiSelectInputAspect.adoptChoiceElement(c, e);
          }, function (o, s) {
            return multiSelectInputAspect.handleOnRemoveButton(o, s);
          });
        }
      };
    }

    function Choice(option, isOptionSelected, isOptionDisabled) {
      var choice = {
        option: option,
        isOptionSelected: isOptionSelected,
        isOptionDisabled: isOptionDisabled,
        updateDisabled: null,
        updateSelected: null,
        // navigation and filter support
        filteredPrev: null,
        filteredNext: null,
        searchText: option.text.toLowerCase().trim(),
        // TODO make an index abstraction
        // internal state handlers, so they do not have "update semantics"
        isHoverIn: false,
        isFilterIn: false,
        setVisible: null,
        setHoverIn: null,
        // TODO: is it a really sense to have them there?
        choiceElement: null,
        choiceElementAttach: null,
        itemPrev: null,
        itemNext: null,
        remove: null,
        dispose: null,
        isOptionHidden: null
      };
      return choice;
    }

    function OptionAspect(dataSourceAspect) {
      return {
        setOptionSelected: function setOptionSelected(choice, value) {
          var success = false;
          var confirmed = dataSourceAspect.setSelected(choice.option, value);

          if (!(confirmed === false)) {
            choice.isOptionSelected = value;
            choice.updateSelected();
            success = true;
          }

          return success;
        },
        createChoice: function createChoice(option) {
          var isOptionSelected = dataSourceAspect.getSelected(option);
          var isOptionDisabled = dataSourceAspect.getDisabled(option);
          return Choice(option, isOptionSelected, isOptionDisabled);
        },
        isSelectable: function isSelectable(choice) {
          return !choice.isOptionSelected && !choice.isOptionDisabled;
        }
      };
    }
    function OptionToggleAspect(optionAspect) {
      return {
        toggleOptionSelected: function toggleOptionSelected(choice) {
          var success = false;
          if (choice.isOptionSelected || !choice.isOptionDisabled) success = optionAspect.setOptionSelected(choice, !choice.isOptionSelected);
          return success;
        }
      };
    }

    function Choices(collection, listFacade_reset, listFacade_remove, addFilterFacade, insertFilterFacade) {
      var push = function push(choice) {
        addFilterFacade(choice);
        collection.push(choice);
      };

      var item = {
        push: push,
        get: function get(key) {
          return collection.get(key);
        },
        insert: function insert(key, choice) {
          if (key >= collection.getLength()) {
            push(choice);
          } else {
            collection.add(choice, key);
            insertFilterFacade(choice);
          }
        },
        remove: function remove(key) {
          var choice = collection.remove(key);
          listFacade_remove(choice);
          return choice;
        },
        //  ---- dialog AI
        getHead: function getHead() {
          return collection.getHead();
        },
        forLoop: function forLoop(f) {
          return collection.forLoop(f);
        },
        clear: function clear() {
          collection.reset();
          listFacade_reset();
        },
        dispose: function dispose() {
          return collection.forLoop(function (choice) {
            return choice.dispose == null ? void 0 : choice.dispose();
          });
        }
      };
      return item;
    }

    function ChoicesHover(_navigate) {
      var hoveredChoice = null;

      function resetHoveredChoice() {
        if (hoveredChoice) {
          hoveredChoice.setHoverIn(false);
          hoveredChoice = null;
        }
      }

      return {
        getHoveredChoice: function getHoveredChoice() {
          return hoveredChoice;
        },
        hoverIn: function hoverIn(choice) {
          resetHoveredChoice();
          hoveredChoice = choice;
          hoveredChoice.setHoverIn(true);
        },
        resetHoveredChoice: resetHoveredChoice,
        navigate: function navigate(down) {
          return _navigate(down, hoveredChoice);
        }
      };
    }

    function Picks() {
      var list = List();
      return {
        addPick: function addPick(pick) {
          var removeFromList = list.add(pick);
          return removeFromList;
        },
        removePicksTail: function removePicksTail() {
          var pick = list.getTail();
          if (pick) pick.remove(); // always remove in this case

          return pick;
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

    function PicksAspect(picksDom, pickContentGenerator, componentAspect, dataSourceAspect, optionAspect, picks) {
      return {
        createPick: function createPick(choice, handleOnRemoveButton
        /* multiSelectInputAspect.handleOnRemoveButton */
        ) {
          var _picksDom$createPickE = picksDom.createPickElement(),
              pickElement = _picksDom$createPickE.pickElement,
              attach = _picksDom$createPickE.attach,
              detach = _picksDom$createPickE.detach;

          var pickContent = pickContentGenerator(pickElement);
          var pick = {
            disableRemove: function disableRemove() {
              return pickContent.disableRemove(componentAspect.getDisabled());
            },
            setData: function setData() {
              return pickContent.setData(choice.option);
            },
            disable: function disable() {
              return pickContent.disable(dataSourceAspect.getDisabled(choice.option));
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
          var removeFromList = picks.addPick(pick);

          var removePick = function removePick() {
            removeFromList();
            pick.dispose();
            choice.updateDisabled = choiceUpdateDisabledBackup;
            choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
          };

          var setSelectedFalse = function setSelectedFalse() {
            return optionAspect.setOptionSelected(choice, false);
          };

          pick.remove = setSelectedFalse;
          handleOnRemoveButton(pickContent.onRemove, setSelectedFalse);
          return removePick;
        }
      };
    }

    function InputAspect(filterListAspect, optionAspect, filterDom, popupAspect, choicesHover) {
      return {
        input: function input(filterInputValue, resetLength, eventLoopFlag_set, //multiSelectInputAspect.eventLoopFlag.set(); 
        aspect_showChoices, //multiSelectInputAspect.showChoices();
        aspect_hideChoices // multiSelectInputAspect.hideChoices();
        ) {
          var text = filterInputValue.trim().toLowerCase();
          var isEmpty = false;
          if (text == '') isEmpty = true;else {
            // check if exact match, otherwise new search
            filterListAspect.setFilter(text);

            if (filterListAspect.getCount() == 1) {
              var fullMatchChoice = filterListAspect.getHead();

              if (fullMatchChoice.searchText == text) {
                optionAspect.setOptionSelected(fullMatchChoice, true);
                filterDom.setEmpty();
                isEmpty = true;
              }
            }
          }

          if (isEmpty) {
            filterListAspect.processEmptyInput();
          } else resetLength();

          eventLoopFlag_set(); // means disable some mouse handlers; otherwise we will get "Hover On MouseEnter" when filter's changes should remove hover

          var visibleCount = filterListAspect.getCount();

          if (visibleCount > 0) {
            var panelIsVisble = popupAspect.isChoicesVisible();

            if (!panelIsVisble) {
              aspect_showChoices(); //multiSelectInputAspect.showChoices();
            }

            if (visibleCount == 1) {
              choicesHover.hoverIn(filterListAspect.getHead());
            } else {
              if (panelIsVisble) choicesHover.resetHoveredChoice();
            }
          } else {
            if (popupAspect.isChoicesVisible()) aspect_hideChoices();
          }
        }
      };
    }

    function ResetFilterListAspect(filterDom, filterListAspect) {
      return {
        forceResetFilter: function forceResetFilter() {
          // over in PlaceholderPlugin
          filterDom.setEmpty();
          filterListAspect.processEmptyInput(); // over in PlaceholderPlugin
        }
      };
    }
    function ManageableResetFilterListAspect(filterDom, resetFilterListAspect) {
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

    function MultiSelectInputAspect(window, setFocus, picksElement, choicesElement, isChoicesVisible, setChoicesVisible, resetHoveredChoice, hoverIn, resetFilter, isChoiceEmpty, onClick, resetFocus, alignToFilterInputItemLocation) {
      var document = window.document;
      var eventLoopFlag = EventLoopFlag(window);
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
        if (choicesElement == event.target) setFocus(); // if click outside container - close dropdown
        else if (!containsAndSelf(choicesElement, event.target) && !containsAndSelf(picksElement, event.target)) {
            hideChoices();
            resetFilter();
            resetFocus();
          }
      };

      var preventDefaultClickEvent = null;
      var componentDisabledEventBinder = EventBinder(); // TODO: remove setTimeout: set on start of mouse event reset on end

      function skipoutAndResetMousedown() {
        skipoutMousedown();
        window.setTimeout(function () {
          return resetSkipFocusout();
        });
      }

      picksElement.addEventListener("mousedown", skipoutAndResetMousedown);

      function showChoices() {
        if (!isChoicesVisible()) {
          alignToFilterInputItemLocation();
          eventLoopFlag.set();
          setChoicesVisible(true); // add listeners that manages close dropdown on  click outside container

          choicesElement.addEventListener("mousedown", skipoutMousedown);
          document.addEventListener("mouseup", documentMouseup);
        }
      }

      function clickToShowChoices(event) {
        onClick(event);

        if (preventDefaultClickEvent != event) {
          if (isChoicesVisible()) {
            hideChoices();
          } else {
            if (!isChoiceEmpty()) showChoices();
          }
        }

        preventDefaultClickEvent = null;
      }

      function hideChoices() {
        resetMouseCandidateChoice();
        resetHoveredChoice();

        if (isChoicesVisible()) {
          setChoicesVisible(false);
          choicesElement.removeEventListener("mousedown", skipoutMousedown);
          document.removeEventListener("mouseup", documentMouseup);
        }
      }

      function processUncheck(uncheckOption, event) {
        // we can't remove item on "click" in the same loop iteration - it is unfrendly for 3PP event handlers (they will get detached element)
        // never remove elements in the same event iteration
        window.setTimeout(function () {
          return uncheckOption();
        });
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
          picksElement.removeEventListener("mousedown", skipoutAndResetMousedown);
          componentDisabledEventBinder.unbind();
        },
        onFocusOut: function onFocusOut(action) {
          if (!getSkipFocusout()) {
            // skip initiated by mouse click (we manage it different way)
            resetFilter(); // if do not do this we will return to filtered list without text filter in input

            action();
          }

          resetSkipFocusout();
        },
        disable: function disable(isComponentDisabled) {
          if (isComponentDisabled) componentDisabledEventBinder.unbind();else componentDisabledEventBinder.bind(picksElement, "click", clickToShowChoices);
        },
        eventLoopFlag: eventLoopFlag,
        hideChoices: hideChoices,
        showChoices: showChoices,
        handleOnRemoveButton: handleOnRemoveButton
      };
    }

    function FilterAspect(filterInputElement, onFocusIn, // show dropdown
    onFocusOut, // hide dropdown
    onKeyDownArrowUp, onKeyDownArrowDown, onTabForEmpty, // tab on empty
    onBackspace, // backspace alike
    onTabToCompleate, // "compleate alike"
    onEnterToCompleate, onKeyUpEsc, // "esc" alike
    stopEscKeyDownPropogation, onInput // filter
    ) {
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
        dispose: function dispose() {
          eventBinder.unbind();
        }
      };
    }

    function DisabledComponentAspect(componentAspect, picks, multiSelectInputAspect, picksDom) {
      var isComponentDisabled;
      return {
        updateDisabledComponent: function updateDisabledComponent() {
          var newIsComponentDisabled = componentAspect.getDisabled();

          if (isComponentDisabled !== newIsComponentDisabled) {
            isComponentDisabled = newIsComponentDisabled;
            picks.disableRemoveAll(newIsComponentDisabled);
            multiSelectInputAspect.disable(newIsComponentDisabled);
            picksDom.disable(newIsComponentDisabled);
          }
        }
      };
    }
    function AppearanceAspect(disabledComponentAspect) {
      return {
        updateAppearance: function updateAppearance() {
          disabledComponentAspect.updateDisabledComponent();
        }
      };
    }
    function LoadAspect(choicesAspect, multiSelectInputAspect, appearanceAspect) {
      return {
        load: function load() {
          choicesAspect.updateDataImpl(function (c, e) {
            return multiSelectInputAspect.adoptChoiceElement(c, e);
          }, function (o, s) {
            return multiSelectInputAspect.handleOnRemoveButton(o, s);
          });
          appearanceAspect.updateAppearance();
        }
      };
    }

    function BsMultiSelect(element, environment, configuration, onInit) {
      var Popper = environment.Popper,
          window = environment.window,
          plugins = environment.plugins;

      var trigger = function trigger(eventName) {
        return environment.trigger(element, eventName);
      };

      if (typeof Popper === 'undefined') {
        throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
      }

      var containerClass = configuration.containerClass,
          css = configuration.css,
          options = configuration.options,
          getDisabled = configuration.getDisabled,
          getSelected = configuration.getSelected,
          setSelected = configuration.setSelected,
          getIsOptionDisabled = configuration.getIsOptionDisabled,
          common = configuration.common;
      if (!common) common = {};
      var componentAspect = ComponentAspect(getDisabled, trigger);
      common.getDisabled = componentAspect.getDisabled;
      var dataSourceAspect = DataSourceAspect(options, getSelected, setSelected, getIsOptionDisabled);
      var optionAspect = OptionAspect(dataSourceAspect);
      var optionToggleAspect = OptionToggleAspect(optionAspect);
      var PopupAspect$1 = def(configuration.staticContentGenerator, PopupAspect); // TODO: rename configuration.staticContentGenerator

      var createElement = function createElement(name) {
        return window.document.createElement(name);
      };

      var choicesDom = ChoicesDom(createElement, css);
      var staticDomFactory = StaticDomFactory(createElement, choicesDom.choicesElement);
      staticDomDefaults(plugins, staticDomFactory); // manipulates with staticDomFactory.staticDomGenerator

      var _staticDomFactory$sta = staticDomFactory.staticDomGenerator(element, containerClass),
          staticDom = _staticDomFactory$sta.staticDom,
          staticManager = _staticDomFactory$sta.staticManager;

      var filterDom = FilterDom(staticDom.disposablePicksElement, createElement, css); // TODO get picksDom  from staticDomFactory

      var picksDom = PicksDom(staticDom.picksElement, staticDom.disposablePicksElement, createElement, css);
      var focusInAspect = FocusInAspect(picksDom);
      var popupAspect = PopupAspect$1(choicesDom.choicesElement, filterDom.filterInputElement, Popper);
      var collection = DoublyLinkedCollection(function (choice) {
        return choice.itemPrev;
      }, function (choice, v) {
        return choice.itemPrev = v;
      }, function (choice) {
        return choice.itemNext;
      }, function (choice, v) {
        return choice.itemNext = v;
      });
      var choicesGetNextAspect = ChoicesGetNextAspect(function () {
        return collection.getHead();
      }, function (choice) {
        return choice.itemNext;
      });
      var choicesEnumerableAspect = ChoicesEnumerableAspect(choicesGetNextAspect);
      var filterListAspect = FilterListAspect(choicesGetNextAspect, choicesEnumerableAspect);
      var resetFilterListAspect = ResetFilterListAspect(filterDom, filterListAspect);
      var manageableResetFilterListAspect = ManageableResetFilterListAspect(filterDom, resetFilterListAspect); // TODO move to fully index collection

      var choices = Choices(collection, function () {
        return filterListAspect.reset();
      }, function (c) {
        return filterListAspect.remove(c);
      }, function (c) {
        return filterListAspect.addFilterFacade(c);
      }, function (c) {
        return filterListAspect.insertFilterFacade(c);
      });
      var choicesHover = ChoicesHover(function (down, hoveredChoice) {
        return filterListAspect.navigate(down, hoveredChoice);
      });
      var inputAspect = InputAspect(filterListAspect, optionAspect, filterDom, popupAspect, choicesHover);
      var picks = Picks();
      var pickContentGenerator$1 = def(configuration.pickContentGenerator, pickContentGenerator);
      var picksAspect = PicksAspect(picksDom, function (pickElement) {
        return pickContentGenerator$1(pickElement, common, css);
      }, componentAspect, dataSourceAspect, optionAspect, picks);
      var choiceContentGenerator$1 = def(configuration.choiceContentGenerator, choiceContentGenerator);
      var choicesElementAspect = ChoicesElementAspect(choicesDom, filterDom, function (choiceElement, toggle) {
        return choiceContentGenerator$1(choiceElement, common, css, toggle);
      }, componentAspect, optionToggleAspect, picksAspect);
      var choiceFactoryAspect = ChoiceFactoryAspect(choicesElementAspect, choicesGetNextAspect);
      var choicesAspect = ChoicesAspect(window.document, optionAspect, dataSourceAspect, choices, choiceFactoryAspect);
      var multiSelectInputAspect = MultiSelectInputAspect(window, function () {
        return filterDom.setFocus();
      }, picksDom.picksElement, choicesDom.choicesElement, function () {
        return popupAspect.isChoicesVisible();
      }, function (visible) {
        return popupAspect.setChoicesVisible(visible);
      }, function () {
        return choicesHover.resetHoveredChoice();
      }, function (choice) {
        return choicesHover.hoverIn(choice);
      }, function () {
        return manageableResetFilterListAspect.resetFilter();
      }, function () {
        return filterListAspect.getCount() == 0;
      },
      /*onClick*/
      function (event) {
        return filterDom.setFocusIfNotTarget(event.target);
      },
      /*resetFocus*/
      function () {
        return focusInAspect.setFocusIn(false);
      },
      /*alignToFilterInputItemLocation*/
      function () {
        return popupAspect.updatePopupLocation();
      });
      var disabledComponentAspect = DisabledComponentAspect(componentAspect, picks, multiSelectInputAspect, picksDom);
      var appearanceAspect = AppearanceAspect(disabledComponentAspect);
      var loadAspect = LoadAspect(choicesAspect, multiSelectInputAspect, appearanceAspect);

      function hoveredToSelected() {
        var hoveredChoice = choicesHover.getHoveredChoice();

        if (hoveredChoice) {
          var wasToggled = optionToggleAspect.toggleOptionSelected(hoveredChoice);

          if (wasToggled) {
            multiSelectInputAspect.hideChoices();
            manageableResetFilterListAspect.resetFilter();
          }
        }
      }

      function keyDownArrow(down) {
        var choice = choicesHover.navigate(down);

        if (choice) {
          choicesHover.hoverIn(choice);
          multiSelectInputAspect.showChoices();
        }
      }

      var filterAspect = FilterAspect(filterDom.filterInputElement, function () {
        return focusInAspect.setFocusIn(true);
      }, // focus in - show dropdown
      function () {
        return multiSelectInputAspect.onFocusOut(function () {
          return focusInAspect.setFocusIn(false);
        });
      }, // focus out - hide dropdown
      function () {
        return keyDownArrow(false);
      }, // arrow up
      function () {
        return keyDownArrow(true);
      }, // arrow down

      /*onTabForEmpty*/
      function () {
        return multiSelectInputAspect.hideChoices();
      }, // tab on empty
      function () {
        var p = picks.removePicksTail();
        if (p) popupAspect.updatePopupLocation();
      }, // backspace - "remove last"

      /*onTabToCompleate*/
      function () {
        if (popupAspect.isChoicesVisible()) {
          hoveredToSelected();
        }
      },
      /*onEnterToCompleate*/
      function () {
        if (popupAspect.isChoicesVisible()) {
          hoveredToSelected();
        } else {
          if (filterListAspect.getCount() > 0) {
            multiSelectInputAspect.showChoices();
          }
        }
      },
      /*onKeyUpEsc*/
      function () {
        multiSelectInputAspect.hideChoices(); // always hide 1st

        manageableResetFilterListAspect.resetFilter();
      }, // esc keyup 
      // tab/enter "compleate hovered"

      /*stopEscKeyDownPropogation */
      function () {
        return popupAspect.isChoicesVisible();
      },
      /*onInput*/
      function (filterInputValue, resetLength) {
        inputAspect.input(filterInputValue, resetLength, function () {
          return multiSelectInputAspect.eventLoopFlag.set();
        }, function () {
          return multiSelectInputAspect.showChoices();
        }, function () {
          return multiSelectInputAspect.hideChoices();
        });
      });
      var updateDataAspect = UpdateDataAspect(multiSelectInputAspect, manageableResetFilterListAspect, choicesDom, choices, picks, choicesAspect);
      var pluginData = {
        environment: environment,
        trigger: trigger,
        configuration: configuration,
        dataSourceAspect: dataSourceAspect,
        componentAspect: componentAspect,
        staticDom: staticDom,
        picksDom: picksDom,
        choicesDom: choicesDom,
        popupAspect: popupAspect,
        staticManager: staticManager,
        choicesGetNextAspect: choicesGetNextAspect,
        choicesEnumerableAspect: choicesEnumerableAspect,
        filterListAspect: filterListAspect,
        choices: choices,
        choicesHover: choicesHover,
        picks: picks,
        optionAspect: optionAspect,
        optionToggleAspect: optionToggleAspect,
        choicesElementAspect: choicesElementAspect,
        choiceFactoryAspect: choiceFactoryAspect,
        choicesAspect: choicesAspect,
        picksAspect: picksAspect,
        filterDom: filterDom,
        inputAspect: inputAspect,
        resetFilterListAspect: resetFilterListAspect,
        manageableResetFilterListAspect: manageableResetFilterListAspect,
        multiSelectInputAspect: multiSelectInputAspect,
        focusInAspect: focusInAspect,
        filterAspect: filterAspect,
        disabledComponentAspect: disabledComponentAspect,
        appearanceAspect: appearanceAspect,
        loadAspect: loadAspect,
        updateDataAspect: updateDataAspect,
        common: common // TODO: replace common with something new? 

      };
      var pluginManager = PluginManager(plugins, pluginData);
      var api = {
        component: "BsMultiSelect.api"
      };
      pluginManager.buildApi(api);
      api.dispose = composeSync(multiSelectInputAspect.hideChoices, pluginManager.dispose, picks.dispose, multiSelectInputAspect.dispose, choices.dispose, staticManager.dispose, popupAspect.dispose, picksDom.dispose, filterDom.dispose, filterAspect.dispose);
      api.updateData = updateDataAspect.updateData;

      api.update = function () {
        updateDataAspect.updateData();
        appearanceAspect.updateAppearance();
      };

      api.updateAppearance = appearanceAspect.updateAppearance;
      api.updateDisabled = disabledComponentAspect.updateDisabledComponent;
      onInit == null ? void 0 : onInit(api, pluginData);
      picksDom.pickFilterElement.appendChild(filterDom.filterInputElement);
      picksDom.picksElement.appendChild(picksDom.pickFilterElement);
      staticManager.appendToContainer();
      popupAspect.init();
      loadAspect.load();
      return api;
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
          staticDom = pluginData.staticDom,
          filterDom = pluginData.filterDom;
      var containerClass = configuration.containerClass,
          label = configuration.label;

      var getLabelElementAspect = function getLabelElementAspect() {
        return defCall(label);
      };

      var labelPluginData = {
        getLabelElementAspect: getLabelElementAspect
      }; // overrided by BS Appearance Plugin

      pluginData.labelPluginData = labelPluginData;
      var createInputId = null;
      var selectElement = staticDom.selectElement,
          containerElement = staticDom.containerElement;
      var filterInputElement = filterDom.filterInputElement;
      if (selectElement) createInputId = function createInputId() {
        return containerClass + "-generated-input-" + (selectElement.id ? selectElement.id : selectElement.name).toLowerCase() + "-id";
      };else createInputId = function createInputId() {
        return containerClass + "-generated-filter-" + containerElement.id;
      };
      return {
        buildApi: function buildApi() {
          var labelElement = labelPluginData.getLabelElementAspect();
          var backupedForAttribute = null; // state saved between init and dispose

          if (labelElement) {
            backupedForAttribute = labelElement.getAttribute('for');
            var newId = createInputId();
            filterInputElement.setAttribute('id', newId);
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
          popupAspect = pluginData.popupAspect,
          staticDom = pluginData.staticDom;
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

      if (isRtl) popupAspect.popperConfiguration.placement = 'bottom-end';
      return {
        dispose: function dispose() {
        }
      };
    }

    function FormResetPlugin(pluginData) {
      var staticDom = pluginData.staticDom,
          environment = pluginData.environment;
      return {
        buildApi: function buildApi(api) {
          var eventBuilder = EventBinder();

          if (staticDom.selectElement) {
            var form = closestByTagName(staticDom.selectElement, 'FORM');

            if (form) {
              eventBuilder.bind(form, 'reset', function () {
                return environment.window.setTimeout(function () {
                  return api.updateData();
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
          selectElementPluginData = pluginData.selectElementPluginData,
          staticDom = pluginData.staticDom,
          filterDom = pluginData.filterDom,
          componentAspect = pluginData.componentAspect,
          dataSourceAspect = pluginData.dataSourceAspect,
          trigger = pluginData.trigger;
      var getIsValueMissing = configuration.getIsValueMissing,
          valueMissingMessage = configuration.valueMissingMessage,
          required = configuration.required;
      if (!isBoolean(required)) required = selectElementPluginData == null ? void 0 : selectElementPluginData.required;else if (!isBoolean(required)) required = false;
      valueMissingMessage = defCall(valueMissingMessage, function () {
        return getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "value-missing-message");
      }, defValueMissingMessage);

      if (!getIsValueMissing) {
        getIsValueMissing = function getIsValueMissing() {
          var count = 0;
          var optionsArray = dataSourceAspect.getOptions();

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
      var origOnChange = componentAspect.onChange;

      componentAspect.onChange = function () {
        isValueMissingObservable.call();
        origOnChange();
      };

      pluginData.validationApiPluginData = {
        validationApiObservable: validationApiObservable
      };
      var validationApi = ValidityApi(filterDom.filterInputElement, isValueMissingObservable, valueMissingMessage, function (isValid) {
        return validationApiObservable.setValue(isValid);
      }, trigger);
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

    ValidationApiPlugin.setDefaults = function (defaults) {
      defaults.valueMissingMessage = '';
    };

    function BsAppearancePlugin(pluginData) {
      var configuration = pluginData.configuration,
          common = pluginData.common,
          validationApiPluginData = pluginData.validationApiPluginData,
          picksDom = pluginData.picksDom,
          staticDom = pluginData.staticDom,
          labelPluginData = pluginData.labelPluginData,
          appearanceAspect = pluginData.appearanceAspect;
      var getValidity = configuration.getValidity,
          getSize = configuration.getSize,
          useCssPatch = configuration.useCssPatch,
          css = configuration.css;
      var selectElement = staticDom.selectElement;

      if (labelPluginData) {
        var origGetLabelElementAspect = labelPluginData.getLabelElementAspect;

        labelPluginData.getLabelElementAspect = function () {
          var e = origGetLabelElementAspect();
          if (e) return e;else {
            var value = null;
            var formGroup = closestByClassName(selectElement, 'form-group');
            if (formGroup) value = formGroup.querySelector("label[for=\"" + selectElement.id + "\"]");
            return value;
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

      common.getSize = getSize;
      common.getValidity = getValidity;
      var updateSize;

      if (!useCssPatch) {
        updateSize = function updateSize() {
          return updateSizeForAdapter(picksDom.picksElement, getSize);
        };
      } else {
        var picks_lg = css.picks_lg,
            picks_sm = css.picks_sm,
            picks_def = css.picks_def;

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
      validationApiObservable.attach(function () {
        return validationObservable.call();
      });
      getManualValidationObservable.attach(function () {
        return validationObservable.call();
      });
      appearanceAspect.updateAppearance = composeSync(appearanceAspect.updateAppearance, updateSize, validationObservable.call, getManualValidationObservable.call);
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

    function HiddenOptionPlugin(pluginData) {
      var configuration = pluginData.configuration,
          dataSourceAspect = pluginData.dataSourceAspect,
          options = pluginData.options,
          optionAspect = pluginData.optionAspect,
          choices = pluginData.choices,
          choicesGetNextAspect = pluginData.choicesGetNextAspect,
          choicesEnumerableAspect = pluginData.choicesEnumerableAspect,
          choiceFactoryAspect = pluginData.choiceFactoryAspect,
          choicesElementAspect = pluginData.choicesElementAspect,
          filterListAspect = pluginData.filterListAspect,
          multiSelectInputAspect = pluginData.multiSelectInputAspect;
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

      choicesGetNextAspect.getNext = function (c) {
        return getNextNonHidden(c);
      };

      choicesEnumerableAspect.forEach = function (f) {
        var choice = choicesGetNextAspect.getHead();

        while (choice) {
          if (!choice.isOptionHidden) f(choice);
          choice = choicesGetNextAspect.getNext(choice);
        }
      };

      var origAddFilterFacade = filterListAspect.addFilterFacade;

      filterListAspect.addFilterFacade = function (choice) {
        if (!choice.isOptionHidden) {
          origAddFilterFacade(choice);
        }
      };

      var origInsertFilterFacade = filterListAspect.insertFilterFacade;

      filterListAspect.insertFilterFacade = function (choice) {
        if (!choice.isOptionHidden) {
          origInsertFilterFacade(choice);
        }
      };

      var origInsertChoiceItem = choiceFactoryAspect.insertChoiceItem;
      var origPushChoiceItem = choiceFactoryAspect.pushChoiceItem;

      choiceFactoryAspect.insertChoiceItem = function (choice, adoptChoiceElement, handleOnRemoveButton) {
        if (choice.isOptionHidden) {
          buildHiddenChoice(choice);
        } else {
          origInsertChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
        }
      };

      choiceFactoryAspect.pushChoiceItem = function (choice, adoptChoiceElement, handleOnRemoveButton) {
        if (choice.isOptionHidden) {
          buildHiddenChoice(choice);
        } else {
          origPushChoiceItem(choice, adoptChoiceElement, handleOnRemoveButton);
        }
      };

      var origIsSelectable = optionAspect.isSelectable;

      optionAspect.isSelectable = function (choice) {
        return origIsSelectable(choice) && !choice.isOptionHidden;
      };

      var origСreateChoice = optionAspect.createChoice;

      optionAspect.createChoice = function (option) {
        var choice = origСreateChoice(option);
        choice.isOptionHidden = getIsOptionHidden(option);
        return choice;
      };

      return {
        buildApi: function buildApi(api) {
          api.updateHidden = function (c) {
            return updateHidden(c, filterListAspect, choicesElementAspect, multiSelectInputAspect);
          };

          api.updateOptionsHidden = function () {
            return updateOptionsHidden(dataSourceAspect, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect);
          };

          api.updateOptionHidden = function (key) {
            return updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect);
          };
        }
      };
    }

    function updateHidden(choice, filterListAspect, choicesElementAspect, multiSelectInputAspect) {
      if (choice.isOptionHidden) {
        filterListAspect.remove(choice);
        choice.remove();
        buildHiddenChoice(choice);
      } else {
        var nextChoice = getNextNonHidden(choice);
        filterListAspect.add(choice, nextChoice);
        choicesElementAspect.buildChoiceElement(choice, function (c, e) {
          return multiSelectInputAspect.adoptChoiceElement(c, e);
        }, function (o, s) {
          return multiSelectInputAspect.handleOnRemoveButton(o, s);
        });
        choice.choiceElementAttach(nextChoice == null ? void 0 : nextChoice.choiceElement);
      }
    }

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

    function updateOptionHidden(key, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect) {
      var choice = choices.get(key);
      updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect);
    }

    function updateOptionsHidden(dataSourceAspect, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect) {
      var options = dataSourceAspect.getOptions();

      for (var i = 0; i < options.length; i++) {
        updateOptionHidden(i, choices, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect);
      }
    }

    function updateHiddenChoice(choice, getIsOptionHidden, filterListAspect, choicesElementAspect, multiSelectInputAspect) {
      var newIsOptionHidden = getIsOptionHidden(choice.option);

      if (newIsOptionHidden != choice.isOptionHidden) {
        choice.isOptionHidden = newIsOptionHidden;
        updateHidden(choice, filterListAspect, choicesElementAspect, multiSelectInputAspect);
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

    function CssPatchPlugin() {}

    CssPatchPlugin.setDefaults = function (defaults) {
      defaults.useCssPatch = true;
      defaults.cssPatch = cssPatch;
    };

    CssPatchPlugin.mergeDefaults = function (configuration, defaults, settings) {
      var cssPatch = settings == null ? void 0 : settings.cssPatch;
      if (isBoolean(cssPatch)) throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

      configuration.cssPatch = createCss(defaults.cssPatch, cssPatch); // replace classes, merge styles
    };

    CssPatchPlugin.onConfiguration = function (configuration) {
      if (configuration.useCssPatch) extendCss(configuration.css, configuration.cssPatch);
    };

    function PlaceholderPlugin(pluginData) {
      var configuration = pluginData.configuration,
          staticManager = pluginData.staticManager,
          picks = pluginData.picks,
          picksDom = pluginData.picksDom,
          filterDom = pluginData.filterDom,
          staticDom = pluginData.staticDom,
          updateDataAspect = pluginData.updateDataAspect,
          picksAspect = pluginData.picksAspect,
          inputAspect = pluginData.inputAspect,
          resetFilterListAspect = pluginData.resetFilterListAspect,
          filterListAspect = pluginData.filterListAspect;
      var placeholder = configuration.placeholder,
          css = configuration.css;
      var picksElement = picksDom.picksElement;
      var filterInputElement = filterDom.filterInputElement;

      if (!placeholder) {
        placeholder = getDataGuardedWithPrefix(staticDom.initialElement, "bsmultiselect", "placeholder");
      }

      function setEmptyInputWidth(isVisible) {
        if (isVisible) filterInputElement.style.width = '100%';else filterInputElement.style.width = '2ch';
      }

      var emptyToggleStyling = toggleStyling(filterInputElement, css.filterInput_empty);

      function showPlacehodler(isVisible) {
        if (isVisible) {
          filterInputElement.placeholder = placeholder ? placeholder : '';
          picksElement.style.display = 'block';
        } else {
          filterInputElement.placeholder = '';
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
        return picks.isEmpty() && filterDom.isEmpty();
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
      filterListAspect.processEmptyInput = composeSync(updateEmptyInputWidth, filterListAspect.processEmptyInput);
      resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updatePlacehodlerVisibility);
      var origInput = inputAspect.input;

      inputAspect.input = function (filterInputValue, resetLength, eventLoopFlag_set, aspect_showChoices, aspect_hideChoices) {
        updatePlacehodlerVisibility();
        origInput(filterInputValue, resetLength, eventLoopFlag_set, aspect_showChoices, aspect_hideChoices);
      };

      var origCreatePick = picksAspect.createPick;

      picksAspect.createPick = function (choice, handleOnRemoveButton) {
        var removePick = origCreatePick(choice, handleOnRemoveButton);
        if (picks.getCount() == 1) updatePlacehodlerVisibility();
        return function () {
          removePick();
          if (picks.getCount() == 0) updatePlacehodlerVisibility();
        };
      };

      updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updatePlacehodlerVisibility);
    }

    function JQueryMethodsPlugin(pluginData) {
      var staticDom = pluginData.staticDom,
          choicesDom = pluginData.choicesDom,
          filterDom = pluginData.filterDom,
          picks = pluginData.picks;
      return {
        buildApi: function buildApi(api) {
          api.getContainer = function () {
            return staticDom.containerElement;
          };

          api.getChoices = function () {
            return choicesDom.choicesElement;
          };

          api.getFilterInput = function () {
            return filterDom.filterInputElement;
          };

          api.getPicks = function () {
            return picksDom.picksElement;
          };

          api.picksCount = function () {
            return picks.getCount();
          }; //api.staticContent = popupAspect; // depricated, alternative accept to popupAspect.setChoicesVisible

        }
      };
    }

    function OptionsApiPlugin(pluginData) {
      var choiceFactoryAspect = pluginData.choiceFactoryAspect,
          manageableResetFilterListAspect = pluginData.manageableResetFilterListAspect,
          choices = pluginData.choices,
          optionAspect = pluginData.optionAspect,
          dataSourceAspect = pluginData.dataSourceAspect,
          multiSelectInputAspect = pluginData.multiSelectInputAspect;
      return {
        buildApi: function buildApi(api) {
          api.setOptionSelected = function (key, value) {
            var choice = choices.get(key);
            optionAspect.setOptionSelected(choice, value);
          };

          api.updateOptionSelected = function (key) {
            var choice = choices.get(key); // TODO: generalize index as key

            var newIsSelected = dataSourceAspect.getSelected(choice.option);

            if (newIsSelected != choice.isOptionSelected) {
              choice.isOptionSelected = newIsSelected;
              choice.updateSelected();
            }
          };

          api.updateOptionDisabled = function (key) {
            var choice = choices.get(key); // TODO: generalize index as key 

            var newIsDisabled = dataSourceAspect.getDisabled(choice.option);

            if (newIsDisabled != choice.isOptionDisabled) {
              choice.isOptionDisabled = newIsDisabled;
              choice.updateDisabled();
            }
          };

          api.updateOptionAdded = function (key) {
            // TODO: generalize index as key 
            var options = dataSourceAspect.getOptions();
            var option = options[key];
            var choice = optionAspect.createChoice(option);
            choices.insert(key, choice);
            choiceFactoryAspect.insertChoiceItem(choice, function (c, e) {
              return multiSelectInputAspect.adoptChoiceElement(c, e);
            }, function (o, s) {
              return multiSelectInputAspect.handleOnRemoveButton(o, s);
            });
          };

          api.updateOptionRemoved = function (key) {
            // TODO: generalize index as key 
            multiSelectInputAspect.hideChoices(); // always hide 1st, then reset filter

            manageableResetFilterListAspect.resetFilter();
            var choice = choices.remove(key);
            choice.remove == null ? void 0 : choice.remove();
            choice.dispose == null ? void 0 : choice.dispose();
          };
        }
      };
    }

    function FormRestoreOnBackwardPlugin(pluginData) {
      var staticDom = pluginData.staticDom,
          environment = pluginData.environment,
          loadAspect = pluginData.loadAspect;
      var window = environment.window;
      return {
        buildApi: function buildApi(api) {
          if (!api.updateOptionsSelected) throw new Error("BsMultisilect: FormRestoreOnBackwardPlugin requires UpdateOptionsSelectedApiPlugin defined first");
          var origLoad = loadAspect.load;

          loadAspect.load = function () {
            origLoad(); // support browser's "step backward" and form's values restore

            if (staticDom.selectElement && window.document.readyState != "complete") {
              window.setTimeout(function () {
                api.updateOptionsSelected();
              });
            }
          };
        }
      };
    }

    function SelectElementPlugin(pluginData) {
      var staticManager = pluginData.staticManager,
          staticDom = pluginData.staticDom,
          configuration = pluginData.configuration,
          trigger = pluginData.trigger,
          componentAspect = pluginData.componentAspect,
          dataSourceAspect = pluginData.dataSourceAspect;
      var backupDisplay = null;
      var selectElement = staticDom.selectElement;

      if (selectElement) {
        backupDisplay = selectElement.style.display;
        selectElement.style.display = 'none';
      }

      var backupedRequired = false;

      if (selectElement) {
        backupedRequired = selectElement.required;
        pluginData.selectElementPluginData = {
          required: selectElement.required
        };
        if (selectElement.required === true) selectElement.required = false;
      }

      var getDisabled = configuration.getDisabled,
          getIsOptionDisabled = configuration.getIsOptionDisabled;

      if (selectElement) {
        if (!getDisabled) {
          var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');

          if (fieldsetElement) {
            componentAspect.getDisabled = function () {
              return selectElement.disabled || fieldsetElement.disabled;
            };
          } else {
            componentAspect.getDisabled = function () {
              return selectElement.disabled;
            };
          }
        }

        componentAspect.onChange = function () {
          trigger('change');
          trigger('dashboardcode.multiselect:change');
        };

        dataSourceAspect.getOptions = function () {
          return selectElement.options;
        };

        if (!getIsOptionDisabled) dataSourceAspect.getDisabled = function (option) {
          return option.disabled;
        }; // if (!setSelected){
        //     setSelected = (option, value) => {option.selected = value};
        //     // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
        //     // if (value) option.setAttribute('selected','');
        //     // else option.removeAttribute('selected');
        // }

        var origDispose = staticManager.dispose;

        if (selectElement) {
          staticManager.dispose = function () {
            origDispose();
            selectElement.required = backupedRequired;
            selectElement.style.display = backupDisplay;
          };
        }

        staticManager.appendToContainer = composeSync(staticManager.appendToContainer, staticDom.attachContainerElement);
        staticManager.dispose = composeSync(staticDom.detachContainerElement, staticManager.dispose);
      }
    }

    SelectElementPlugin.staticDomDefaults = function (staticDomFactory) {
      var choicesElement = staticDomFactory.choicesElement,
          createElement = staticDomFactory.createElement,
          origStaticDomGenerator = staticDomFactory.staticDomGenerator;

      staticDomFactory.staticDomGenerator = function (element, containerClass) {
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
            return origStaticDomGenerator(element, containerClass);
          }
        }

        var disposableContainerElement = false;

        if (!containerElement) {
          containerElement = createElement('DIV');
          containerElement.classList.add(containerClass);
          disposableContainerElement = true;
        }

        var disposablePicksElement = false;

        if (!picksElement) {
          picksElement = createElement('UL');
          disposablePicksElement = true;
        }

        return {
          staticDom: {
            initialElement: element,
            containerElement: containerElement,
            picksElement: picksElement,
            disposablePicksElement: disposablePicksElement,
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

              if (disposablePicksElement) containerElement.appendChild(picksElement);
            },
            dispose: function dispose() {
              choicesElement.parentNode.removeChild(choicesElement);
              if (disposableContainerElement) selectElement.parentNode.removeChild(containerElement);
              if (disposablePicksElement) containerElement.removeChild(picksElement);
            }
          }
        };
      };
    };

    function SelectAllApiPlugin(pluginData) {
      var multiSelectInputAspect = pluginData.multiSelectInputAspect,
          choices = pluginData.choices,
          picks = pluginData.picks,
          optionAspect = pluginData.optionAspect,
          manageableResetFilterListAspect = pluginData.manageableResetFilterListAspect;
      return {
        buildApi: function buildApi(api) {
          api.selectAll = function () {
            multiSelectInputAspect.hideChoices(); // always hide 1st

            choices.forLoop(function (choice) {
              if (optionAspect.isSelectable(choice)) optionAspect.setOptionSelected(choice, true);
            });
            manageableResetFilterListAspect.resetFilter();
          };

          api.deselectAll = function () {
            multiSelectInputAspect.hideChoices(); // always hide 1st

            picks.removeAll();
            manageableResetFilterListAspect.resetFilter();
          };
        }
      };
    }

    function UpdateOptionsSelectedApiPlugin(pluginData) {
      var choices = pluginData.choices,
          dataSourceAspect = pluginData.dataSourceAspect;
      return {
        buildApi: function buildApi(api) {
          // used in FormRestoreOnBackwardPlugin
          api.updateOptionsSelected = function () {
            choices.forLoop(function (choice) {
              var newIsSelected = dataSourceAspect.getSelected(choice.option);

              if (newIsSelected != choice.isOptionSelected) {
                choice.isOptionSelected = newIsSelected;
                choice.updateSelected();
              }
            });
          };
        }
      };
    }

    function DisabledOptionApiPlugin(pluginData) {
      var choices = pluginData.choices,
          dataSourceAspect = pluginData.dataSourceAspect;
      return {
        buildApi: function buildApi(api) {
          api.updateOptionsDisabled = function () {
            return updateOptionsDisabled(choices, dataSourceAspect);
          };
        }
      };
    }

    function updateOptionsDisabled(choices, dataSourceAspect) {
      choices.forLoop(function (choice) {
        var newIsDisabled = dataSourceAspect.getDisabled(choice.option);

        if (newIsDisabled != choice.isOptionDisabled) {
          choice.isOptionDisabled = newIsDisabled;
          choice.updateDisabled();
        }
      });
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
        console.log("DashboarCode.BsMultiSelect: useCss(=true) is depricated, use - 'useCssPatch: false'");

        if (!css.pick_disabled) {
          settings.useCssPatch = !settings.useCss;
        }

        delete settings.useCss;
      }

      if (settings.getIsValid || settings.getIsInValid) {
        throw "DashboarCode.BsMultiSelect: parameters getIsValid and getIsInValid are depricated and removed, use - getValidity that should return (true|false|null) ";
      }
    }

    (function (window, $, Popper) {
      var defaults = {
        containerClass: "dashboardcode-bsmultiselect",
        css: css
      };
      var defaultPlugins = [CssPatchPlugin, SelectElementPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin, OptionsApiPlugin, SelectAllApiPlugin, JQueryMethodsPlugin, UpdateOptionsSelectedApiPlugin, FormRestoreOnBackwardPlugin, DisabledOptionApiPlugin];

      var createBsMultiSelect = function createBsMultiSelect(element, settings, removeInstanceData) {
        var _settings2;

        var trigger = function trigger(e, eventName) {
          return $(e).trigger(eventName);
        };

        var environment = {
          trigger: trigger,
          window: window,
          Popper: Popper
        };
        environment.plugins = defaultPlugins;
        var configuration = {};
        var buildConfiguration;

        if (settings instanceof Function) {
          buildConfiguration = settings;
          settings = null;
        } else {
          var _settings;

          buildConfiguration = (_settings = settings) == null ? void 0 : _settings.buildConfiguration;
        }

        if (settings) adjustLegacySettings(settings);
        configuration.css = createCss(defaults.css, (_settings2 = settings) == null ? void 0 : _settings2.css);
        mergeDefaults(defaultPlugins, configuration, defaults, settings);
        extendIfUndefined(configuration, settings);
        extendIfUndefined(configuration, defaults);
        var onInit = buildConfiguration == null ? void 0 : buildConfiguration(element, configuration);
        onConfiguration(defaultPlugins, configuration);
        var multiSelect = BsMultiSelect(element, environment, configuration, onInit);
        multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData);
        return multiSelect;
      };

      var prototypable = addToJQueryPrototype('BsMultiSelect', createBsMultiSelect, $);
      initiateDefaults(defaultPlugins, defaults);
      prototypable.defaults = defaults;
    })(window, $, Popper);

})));
//# sourceMappingURL=BsMultiSelect.js.map
