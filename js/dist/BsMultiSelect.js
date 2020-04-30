import { MultiSelect } from './MultiSelect';
import { PluginManager } from './PluginManager';
import { getDataGuardedWithPrefix, closestByTagName
/*, getIsRtl*/
} from './ToolsDom';
import { createCss, extendCss } from './ToolsStyling';
import { extendOverriding, extendIfUndefined, composeSync, def, isBoolean, isObject } from './ToolsJs';
import { adjustLegacySettings } from './BsMultiSelectDepricatedParameters';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator as defStaticContentGenerator } from './StaticContentGenerator';
import { css } from './BsCss';
export var defaults = {
  useCssPatch: true,
  containerClass: "dashboardcode-bsmultiselect",
  css: css
};
export function initiateDefaults(constructors) {
  for (var i = 0; i < constructors.length; i++) {
    var _constructors$i$setDe, _constructors$i;

    (_constructors$i$setDe = (_constructors$i = constructors[i]).setDefaults) == null ? void 0 : _constructors$i$setDe.call(_constructors$i, defaults);
  }
}
export function BsMultiSelect(element, environment, settings) {
  var Popper = environment.Popper,
      window = environment.window,
      plugins = environment.plugins;

  var trigger = function trigger(eventName) {
    return environment.trigger(element, eventName);
  };

  if (typeof Popper === 'undefined') {
    throw new Error("BsMultiSelect: Popper.js (https://popper.js.org) is required");
  }

  var configuration = {};

  if (isObject(settings)) {
    adjustLegacySettings(settings);
    extendOverriding(configuration, settings); // settings used per jQuery intialization, configuration per element
  }

  var cfgCss = configuration.css;
  configuration.css = null;
  var cfgCssPatch = configuration.cssPatch;
  configuration.cssPatch = null;
  extendIfUndefined(configuration, defaults); // copy 1st level of properties

  var defCss = createCss(defaults.css, cfgCss); // replace classes, merge styles

  configuration.css = defCss;
  if (isBoolean(defaults.cssPatch) || isBoolean(cfgCssPatch)) throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

  var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // replace classes, merge styles

  configuration.cssPatch = defCssPatch;
  var init = null;
  if (settings instanceof Function) init = settings(element, configuration);else if (configuration.buildConfiguration) init = configuration.buildConfiguration(element, configuration);
  var css = configuration.css,
      cssPatch = configuration.cssPatch,
      useCssPatch = configuration.useCssPatch,
      containerClass = configuration.containerClass,
      getSelected = configuration.getSelected,
      setSelected = configuration.setSelected,
      placeholder = configuration.placeholder,
      common = configuration.common,
      options = configuration.options,
      getDisabled = configuration.getDisabled,
      getIsOptionDisabled = configuration.getIsOptionDisabled; // TODO move to plugin

  if (useCssPatch) {
    extendCss(css, cssPatch);
  }

  var staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var staticContent = staticContentGenerator(element, function (name) {
    return window.document.createElement(name);
  }, containerClass, css);

  if (!common) {
    common = {};
  }

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

  if (!placeholder) {
    placeholder = getDataGuardedWithPrefix(element, "bsmultiselect", "placeholder");
  }

  if (!getSelected) {
    getSelected = function getSelected(option) {
      return option.selected;
    };
  }

  if (!setSelected) {
    setSelected = function setSelected(option, value) {
      option.selected = value;
    }; // NOTE: adding this break Chrome's form reset functionality
    // if (value) option.setAttribute('selected','');
    // else  option.removeAttribute('selected');

  }

  common.getDisabled = getDisabled;
  var multiSelect = new MultiSelect(getOptions, getDisabled, setSelected, getSelected, getIsOptionDisabled, staticContent, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, placeholder, onChange, css, Popper, window);
  pluginManager.afterConstructor(multiSelect);
  multiSelect.Dispose = composeSync(pluginManager.dispose, multiSelect.Dispose.bind(multiSelect));
  if (init && init instanceof Function) init(multiSelect);
  multiSelect.init();
  multiSelect.load(); // support browser's "step backward" on form restore

  if (staticContent.selectElement && window.document.readyState != "complete") {
    window.setTimeout(function () {
      multiSelect.UpdateOptionsSelected();
    });
  }

  return multiSelect;
}

//# sourceMappingURL=BsMultiSelect.js.map