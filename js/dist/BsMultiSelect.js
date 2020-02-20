import { MultiSelect } from './MultiSelect';
import { LabelAdapter } from './LabelAdapter';
import { RtlAdapter } from './RtlAdapter';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import { bsAppearance, adjustBsOptionAdapterConfiguration } from './BsAppearance';
import { ValidityApi } from './ValidityApi';
import { getDataGuardedWithPrefix } from './ToolsDom';
import { createCss, extendCss } from './ToolsStyling';
import { extendOverriding, extendIfUndefined, composeSync, ObservableValue, ObservableLambda } from './ToolsJs';
import { adjustLegacyConfiguration as adjustLegacySettings } from './BsMultiSelectDepricatedParameters';
import { pickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator } from './StaticContentGenerator';
import { getLabelElement } from './BsAppearance';
import { css, cssPatch } from './BsCss';
var defValueMissingMessage = 'Please select an item in the list';
export var defaults = {
  useCssPatch: true,
  containerClass: "dashboardcode-bsmultiselect",
  css: css,
  cssPatch: cssPatch,
  placeholder: '',
  staticContentGenerator: null,
  getLabelElement: null,
  pickContentGenerator: null,
  choiceContentGenerator: null,
  buildConfiguration: null,
  isRtl: null,
  setSelected: null,
  required: null,

  /* null means look on select[required] or false if jso-source */
  optionsAdapter: null,
  options: null,
  getDisabled: null,
  getSize: null,
  getValidity: null,
  labelElement: null,
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
  var css = configuration.css;
  var useCssPatch = configuration.useCssPatch;
  var putRtlToContainer = false;

  if (useCssPatch) {
    extendCss(css, configuration.cssPatch);
  }

  if (!configuration.staticContentGenerator) configuration.staticContentGenerator = staticContentGenerator;
  if (!configuration.getLabelElement) configuration.getLabelElement = getLabelElement;
  if (!configuration.pickContentGenerator) configuration.pickContentGenerator = pickContentGenerator;
  if (!configuration.choiceContentGenerator) configuration.choiceContentGenerator = choiceContentGenerator;
  if (configuration.isRtl === undefined || configuration.isRtl === null) configuration.isRtl = RtlAdapter(element);else if (configuration.isRtl === true) putRtlToContainer = true;
  var staticContent = configuration.staticContentGenerator(element, function (name) {
    return window.document.createElement(name);
  }, configuration.containerClass, putRtlToContainer, css);
  if (configuration.required === null) configuration.required = staticContent.required;
  var optionsAdapter = configuration.optionsAdapter;
  var lazyDefinedEvent;

  if (!optionsAdapter) {
    if (configuration.options) {
      optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getSize, configuration.getValidity, function () {
        lazyDefinedEvent();
        trigger('dashboardcode.multiselect:change');
      });
    } else {
      adjustBsOptionAdapterConfiguration(configuration, staticContent.selectElement);
      optionsAdapter = OptionsAdapterElement(staticContent.selectElement, configuration.getDisabled, configuration.getSize, configuration.getValidity, function () {
        lazyDefinedEvent();
        trigger('change');
        trigger('dashboardcode.multiselect:change');
      });
    }
  }

  if (!configuration.getIsValueMissing) {
    configuration.getIsValueMissing = function () {
      var count = 0;
      var options = optionsAdapter.getOptions();

      for (var i = 0; i < options.length; i++) {
        if (options[i].selected) count++;
      }

      return count === 0;
    };
  }

  var isValueMissingObservable = ObservableLambda(function () {
    return configuration.required && configuration.getIsValueMissing();
  });
  var validationApiObservable = ObservableValue(!isValueMissingObservable.getValue());

  lazyDefinedEvent = function lazyDefinedEvent() {
    return isValueMissingObservable.call();
  };

  var labelAdapter = LabelAdapter(configuration.labelElement, staticContent.createInputId);

  if (!configuration.placeholder) {
    configuration.placeholder = getDataGuardedWithPrefix(element, "bsmultiselect", "placeholder");
  }

  if (!configuration.valueMissingMessage) {
    configuration.valueMissingMessage = getDataGuardedWithPrefix(element, "bsmultiselect", "value-missing-message");

    if (!configuration.valueMissingMessage) {
      configuration.valueMissingMessage = defValueMissingMessage;
    }
  }

  var setSelected = configuration.setSelected;

  if (!setSelected) {
    setSelected = function setSelected(option, value) {
      option.selected = value;
    }; // NOTE: adding this break Chrome's form reset functionality
    // if (value) option.setAttribute('selected','');
    // else  option.removeAttribute('selected');

  }

  var validationApi = ValidityApi(staticContent.filterInputElement, isValueMissingObservable, configuration.valueMissingMessage, function (isValid) {
    return validationApiObservable.setValue(isValid);
  });
  var multiSelect = new MultiSelect(optionsAdapter, setSelected, staticContent, function (pickElement) {
    return configuration.pickContentGenerator(pickElement, css);
  }, function (choiceElement) {
    return configuration.choiceContentGenerator(choiceElement, css);
  }, labelAdapter, configuration.placeholder, configuration.isRtl, css, Popper, window);
  multiSelect.Dispose = composeSync(multiSelect.Dispose.bind(multiSelect), isValueMissingObservable.detachAll, validationApiObservable.detachAll);
  multiSelect.validationApi = validationApi;
  bsAppearance(multiSelect, staticContent, optionsAdapter, validationApiObservable, useCssPatch, css);
  if (init && init instanceof Function) init(multiSelect);
  multiSelect.init(); // support browser's "step backward" on form restore

  if (staticContent.selectElement && window.document.readyState != "complete") {
    window.setTimeout(function () {
      multiSelect.UpdateSelected();
    });
  }

  return multiSelect;
}

//# sourceMappingURL=BsMultiSelect.js.map