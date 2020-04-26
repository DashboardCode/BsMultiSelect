import { MultiSelect } from './MultiSelect';
import { LabelPlugin } from './LabelPlugin';
import { FormResetPlugin } from './FormResetPlugin';
import { ValidationApiPlugin } from './ValidationApiPlugin';
import { BsAppearancePlugin } from './BsAppearancePlugin';
import { getDataGuardedWithPrefix, closestByTagName, getIsRtl } from './ToolsDom';
import { createCss, extendCss } from './ToolsStyling';
import { extendOverriding, extendIfUndefined, composeSync, def, defCall, isBoolean } from './ToolsJs';
import { adjustLegacyConfiguration as adjustLegacySettings } from './BsMultiSelectDepricatedParameters';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator as defStaticContentGenerator } from './StaticContentGenerator';
import { css, cssPatch } from './BsCss';
import { HiddenPlugin } from './HiddenPlugin';
import { PluginManager } from './PluginManager';
export var defaults = {
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
  getSelected: null,
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

export function BsMultiSelect(element, environment, settings) {
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
      adjustLegacySettings(settings);
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
      getSelected = configuration.getSelected,
      setSelected = configuration.setSelected,
      placeholder = configuration.placeholder,
      common = configuration.common,
      options = configuration.options,
      getDisabled = configuration.getDisabled,
      getIsOptionDisabled = configuration.getIsOptionDisabled;

  if (useCssPatch) {
    extendCss(css, cssPatch);
  }

  var staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var forceRtlOnContainer = false;
  if (isBoolean(isRtl)) forceRtlOnContainer = true;else isRtl = getIsRtl(element);
  var labelElement = defCall(label);
  var staticContent = staticContentGenerator(element, labelElement, function (name) {
    return window.document.createElement(name);
  }, containerClass, forceRtlOnContainer, css);
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
    }; //.getElementsByTagName('OPTION'), 


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

  if (!common) {
    common = {
      getDisabled: getDisabled
    };
  }

  var multiSelect = new MultiSelect(getOptions, getDisabled, setSelected, getSelected, getIsOptionDisabled, staticContent, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, placeholder, isRtl, onChange, css, Popper, window); // ------------------------------------

  var plugins = [LabelPlugin, HiddenPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin];
  var pluginData = {
    configuration: configuration,
    options: options,
    common: common,
    staticContent: staticContent,
    element: element,
    css: css,
    useCssPatch: useCssPatch,
    window: window
  };
  var pluginManager = PluginManager(plugins, pluginData);
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