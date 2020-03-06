import { MultiSelect } from './MultiSelect';
import { LabelAdapter } from './LabelAdapter';
import { bsAppearance, getLabelElement, composeGetValidity, composeGetDisabled, composeGetSize } from './BsAppearance';
import { ValidityApi } from './ValidityApi';
import { getDataGuardedWithPrefix, EventBinder, closestByTagName, getIsRtl } from './ToolsDom';
import { createCss, extendCss } from './ToolsStyling';
import { extendOverriding, extendIfUndefined, composeSync, ObservableValue, ObservableLambda, def, defCall, isBoolean } from './ToolsJs';
import { adjustLegacyConfiguration as adjustLegacySettings } from './BsMultiSelectDepricatedParameters';
import { pickContentGenerator as defPickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator as defChoiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator as defStaticContentGenerator } from './StaticContentGenerator';
import { css, cssPatch } from './BsCss';
var defValueMissingMessage = 'Please select an item in the list';
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
      required = configuration.required,
      getIsValueMissing = configuration.getIsValueMissing,
      setSelected = configuration.setSelected,
      placeholder = configuration.placeholder,
      common = configuration.common,
      options = configuration.options,
      getDisabled = configuration.getDisabled,
      getValidity = configuration.getValidity,
      getSize = configuration.getSize,
      getIsOptionDisabled = configuration.getIsOptionDisabled,
      getIsOptionHidden = configuration.getIsOptionHidden;

  if (useCssPatch) {
    extendCss(css, cssPatch);
  }

  var staticContentGenerator = def(configuration.staticContentGenerator, defStaticContentGenerator);
  var pickContentGenerator = def(configuration.pickContentGenerator, defPickContentGenerator);
  var choiceContentGenerator = def(configuration.choiceContentGenerator, defChoiceContentGenerator);
  var valueMissingMessage = defCall(configuration.valueMissingMessage, function () {
    return getDataGuardedWithPrefix(element, "bsmultiselect", "value-missing-message");
  }, defValueMissingMessage);
  var forceRtlOnContainer = false;
  if (isBoolean(isRtl)) forceRtlOnContainer = true;else isRtl = getIsRtl(element);
  var staticContent = staticContentGenerator(element, function (name) {
    return window.document.createElement(name);
  }, containerClass, forceRtlOnContainer, css);
  required = def(required, staticContent.required);
  var lazyDefinedEvent;
  var onChange;
  var getOptions;

  if (options) {
    if (!getValidity) getValidity = function getValidity() {
      return null;
    };
    if (!getDisabled) getDisabled = function getDisabled() {
      return false;
    };
    if (!getSize) getSize = function getSize() {
      return null;
    };
    getOptions = function getOptions() {
      return options;
    }, onChange = function onChange() {
      lazyDefinedEvent();
      trigger('dashboardcode.multiselect:change');
    };
    if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
      return option.disabled === undefined ? false : option.disabled;
    };
    if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
      return option.hidden === undefined ? false : option.hidden;
    };
  } else {
    var selectElement = staticContent.selectElement;
    if (!getValidity) getValidity = composeGetValidity(selectElement);
    if (!getDisabled) getDisabled = composeGetDisabled(selectElement);
    if (!getSize) getSize = composeGetSize(selectElement);
    getOptions = function getOptions() {
      return selectElement.options;
    }, //.getElementsByTagName('OPTION'), 
    onChange = function onChange() {
      lazyDefinedEvent();
      trigger('change');
      trigger('dashboardcode.multiselect:change');
    };
    if (!getIsOptionDisabled) getIsOptionDisabled = function getIsOptionDisabled(option) {
      return option.disabled;
    };
    if (!getIsOptionHidden) getIsOptionHidden = function getIsOptionHidden(option) {
      return option.hidden;
    };
  }

  if (!getIsValueMissing) {
    getIsValueMissing = function getIsValueMissing() {
      var count = 0;
      var optionsArray = getOptions();

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

  lazyDefinedEvent = function lazyDefinedEvent() {
    return isValueMissingObservable.call();
  };

  var labelElement = defCall(label);
  if (!labelElement) labelElement = getLabelElement(staticContent.selectElement);
  var labelAdapter = LabelAdapter(labelElement, staticContent.createInputId);

  if (!placeholder) {
    placeholder = getDataGuardedWithPrefix(element, "bsmultiselect", "placeholder");
  }

  if (!setSelected) {
    setSelected = function setSelected(option, value) {
      option.selected = value;
    }; // NOTE: adding this break Chrome's form reset functionality
    // if (value) option.setAttribute('selected','');
    // else  option.removeAttribute('selected');

  }

  var validationApi = ValidityApi(staticContent.filterInputElement, isValueMissingObservable, valueMissingMessage, function (isValid) {
    return validationApiObservable.setValue(isValid);
  });

  if (!common) {
    common = {
      getDisabled: getDisabled,
      getValidity: getValidity,
      getSize: getSize
    };
  }

  var multiSelect = new MultiSelect(getOptions, common, getDisabled, setSelected, getIsOptionDisabled, getIsOptionHidden, staticContent, function (pickElement) {
    return pickContentGenerator(pickElement, common, css);
  }, function (choiceElement, toggle) {
    return choiceContentGenerator(choiceElement, common, css, toggle);
  }, labelAdapter, placeholder, isRtl, onChange, css, Popper, window);
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
  bsAppearance(multiSelect, staticContent, getValidity, getSize, validationApiObservable, useCssPatch, css);
  if (init && init instanceof Function) init(multiSelect);
  multiSelect.init(); // support browser's "step backward" on form restore

  if (staticContent.selectElement && window.document.readyState != "complete") {
    window.setTimeout(function () {
      multiSelect.UpdateOptionsSelected();
    });
  }

  return multiSelect;
}

//# sourceMappingURL=BsMultiSelect.js.map