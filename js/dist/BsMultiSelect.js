import { MultiSelect } from './MultiSelect';
import { PluginManager } from './PluginManager';
import { closestByTagName } from './ToolsDom';
import { composeSync, def } from './ToolsJs';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator as defStaticContentGenerator } from './StaticContentGenerator';
export function BsMultiSelect(element, environment, configuration, onInit) {
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
  var staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var staticContent = staticContentGenerator(element, function (name) {
    return window.document.createElement(name);
  }, containerClass, css, Popper);
  if (!common) common = {};
  var pluginData = {
    window: window,
    configuration: configuration,
    staticContent: staticContent,
    common: common
  }; // TODO replace common with staticContent (but staticContent should be splitted)

  var pluginManager = PluginManager(plugins, pluginData);
  var onChange;
  var getOptions;

  if (options) {
    if (!getDisabled) getDisabled = function getDisabled() {
      return false;
    };

    getOptions = function getOptions() {
      return options;
    };

    onChange = function onChange() {
      trigger('dashboardcode.multiselect:change');
    };

    if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
      return option.disabled === undefined ? false : option.disabled;
    };
  } else {
    var selectElement = staticContent.selectElement;

    if (!getDisabled) {
      var fieldsetElement = closestByTagName(selectElement, 'FIELDSET');

      if (fieldsetElement) {
        getDisabled = function getDisabled() {
          return selectElement.disabled || fieldsetElement.disabled;
        };
      } else {
        getDisabled = function getDisabled() {
          return selectElement.disabled;
        };
      }
    }

    getOptions = function getOptions() {
      return selectElement.options;
    };

    onChange = function onChange() {
      trigger('change');
      trigger('dashboardcode.multiselect:change');
    };

    if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
      return option.disabled;
    };
  }

  if (!getSelected) {
    getSelected = function getSelected(option) {
      return option.selected;
    };
  }

  if (!setSelected) {
    setSelected = function setSelected(option, value) {
      option.selected = value;
    }; // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
    // if (value) option.setAttribute('selected','');
    // else option.removeAttribute('selected');

  }

  common.getDisabled = getDisabled;
  var multiSelect = new MultiSelect(getOptions, getDisabled, setSelected, getSelected, getIsOptionDisabled, staticContent, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, onChange, window);
  pluginManager.afterConstructor(multiSelect);
  multiSelect.dispose = composeSync(pluginManager.dispose, multiSelect.dispose.bind(multiSelect));
  onInit == null ? void 0 : onInit(multiSelect);
  multiSelect.init();
  multiSelect.load();
  return multiSelect;
}

//# sourceMappingURL=BsMultiSelect.js.map