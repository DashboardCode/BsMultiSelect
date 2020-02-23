import { MultiSelect } from './MultiSelect';
import { LabelAdapter } from './LabelAdapter';
import { RtlAdapter } from './RtlAdapter';
import { bsAppearance, adjustBsOptionAdapterConfiguration } from './BsAppearance';
import { ValidityApi } from './ValidityApi';
import { getDataGuardedWithPrefix, EventBinder, closestByTagName } from './ToolsDom';
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
  common: null,
  options: null,
  getIsOptionDisabled: null,
  getIsOptionHidden: null,
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
  var lazyDefinedEvent;
  var onChange;
  var getOptions;

  if (configuration.options) {
    if (!configuration.getValidity) configuration.getValidity = function () {
      return null;
    };
    if (!configuration.getDisabled) configuration.getDisabled = function () {
      return false;
    };
    if (!configuration.getSize) configuration.getSize = function () {
      return null;
    };
    var options = configuration.options;
    getOptions = function getOptions() {
      return options;
    }, onChange = function onChange() {
      lazyDefinedEvent();
      trigger('dashboardcode.multiselect:change');
    };
    if (!configuration.getIsOptionDisabled) configuration.getIsOptionDisabled = function (option) {
      return option.disabled === undefined ? false : option.disabled;
    };
    if (!configuration.getIsOptionHidden) configuration.getIsOptionHidden = function (option) {
      return option.hidden === undefined ? false : option.hidden;
    };
  } else {
    adjustBsOptionAdapterConfiguration(configuration, staticContent.selectElement);
    getOptions = function getOptions() {
      return staticContent.selectElement.options;
    }, //.getElementsByTagName('OPTION'), 
    onChange = function onChange() {
      lazyDefinedEvent();
      trigger('change');
      trigger('dashboardcode.multiselect:change');
    };
    if (!configuration.getIsOptionDisabled) configuration.getIsOptionDisabled = function (option) {
      return option.disabled;
    };
    if (!configuration.getIsOptionHidden) configuration.getIsOptionHidden = function (option) {
      return option.hidden;
    };
  }

  if (!configuration.getIsValueMissing) {
    configuration.getIsValueMissing = function () {
      var count = 0;
      var optionsArray = getOptions();

      for (var i = 0; i < optionsArray.length; i++) {
        if (optionsArray[i].selected) count++;
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

  if (!configuration.common) {
    configuration.common = {
      getDisabled: configuration.getDisabled,
      getValidity: configuration.getValidity,
      getSize: configuration.getSize
    };
  }

  var multiSelect = new MultiSelect(getOptions, configuration.common, configuration.getDisabled, setSelected, configuration.getIsOptionDisabled, configuration.getIsOptionHidden, staticContent, function (pickElement) {
    return configuration.pickContentGenerator(pickElement, configuration.common, css);
  }, function (choiceElement) {
    return configuration.choiceContentGenerator(choiceElement, configuration.common, css);
  }, labelAdapter, configuration.placeholder, configuration.isRtl, onChange, css, Popper, window);
  var resetDispose = null;

  if (staticContent.selectElement) {
    var form = closestByTagName(staticContent.selectElement, 'FORM');

    if (form) {
      var eventBuilder = EventBinder();
      eventBuilder.bind(form, 'reset', function () {
        return window.setTimeout(function () {
          return multiSelect.UpdateData();
        });
      });

      resetDispose = function resetDispose() {
        return eventBuilder.unbind();
      };
    }
  }

  multiSelect.Dispose = composeSync(multiSelect.Dispose.bind(multiSelect), isValueMissingObservable.detachAll, validationApiObservable.detachAll, resetDispose);
  multiSelect.validationApi = validationApi;
  bsAppearance(multiSelect, staticContent, configuration.getValidity, configuration.getSize, validationApiObservable, useCssPatch, css);
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