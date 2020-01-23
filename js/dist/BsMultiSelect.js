import $ from 'jquery';
import Popper from 'popper.js';
import { MultiSelect } from './MultiSelect';
import { LabelAdapter } from './LabelAdapter';
import { RtlAdapter } from './RtlAdapter';
import { addToJQueryPrototype } from './AddToJQueryPrototype';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import { pickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator } from './StaticContentGenerator';
import { bsAppearance, adjustBsOptionAdapterConfiguration, pushIsValidClassToPicks, getLabelElement } from './BsAppearance';
import { createCss, extendCss } from './ToolsStyling';
import { extendOverriding, extendIfUndefined } from './ToolsJs';
import { adjustLegacyConfiguration as adjustLegacySettings } from './BsMultiSelectDepricatedParameters';
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
  // used in BsPickContentStylingCorrector
  pick: 'badge',
  // bs4
  pickContent_disabled: 'disabled',
  // not bs4, in scss 'ul.form-control li span.disabled'
  pickButton: 'close',
  // bs4
  // used in BsChoiceContentStylingCorrector
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
    classes: 'form-control',
    styles: {
      border: '0px',
      height: 'auto',
      boxShadow: 'none',
      padding: '0',
      margin: '0',
      outline: 'none',
      backgroundColor: 'transparent'
    }
  },
  // used in staticContentGenerator
  picks_disabled: {
    backgroundColor: '#e9ecef'
  },
  picks_focus: {
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
  },
  picks_focus_valid: {
    boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'
  },
  picks_focus_invalid: {
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
  choiceLabel_disabled: {
    opacity: '.65'
  } // more flexible than {color: '#6c757d'}, avoid opacity on pickElement's border

};

function extendConfigurtion(configuration, defaults) {
  var cfgCss = configuration.css;
  var cfgCssPatch = configuration.cssPatch;
  configuration.css = null;
  configuration.cssPatch = null;
  extendIfUndefined(configuration, defaults);
  var defCss = createCss(defaults.css, cfgCss); // replace classes, merge styles

  if (defaults.cssPatch instanceof Boolean || typeof defaults.cssPatch === "boolean" || cfgCssPatch instanceof Boolean || typeof cfgCssPatch === "boolean") throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'"); // often type of error

  var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // ? classes, merge styles

  configuration.css = defCss;
  configuration.cssPatch = defCssPatch;
}

(function (window, $, Popper) {
  var defaults = {
    useCssPatch: true,
    containerClass: "dashboardcode-bsmultiselect",
    css: css,
    cssPatch: cssPatch,
    placeholder: '',
    staticContentGenerator: staticContentGenerator,
    getLabelElement: getLabelElement,
    pickContentGenerator: pickContentGenerator,
    choiceContentGenerator: choiceContentGenerator,
    buildConfiguration: null,
    setSelected: function setSelected(option, value) {
      option.selected = value;
    },
    optionsAdapter: null,
    options: null,
    getDisabled: null,
    getSize: null,
    getIsValid: null,
    getIsInvalid: null
  };

  function createPlugin(element, settings, onDispose) {
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
    if (useCssPatch) extendCss(css, configuration.cssPatch);
    if (configuration.isRtl === undefined || configuration.isRtl === null) configuration.isRtl = RtlAdapter(element);else if (configuration.isRtl === true) putRtlToContainer = true;
    var staticContent = configuration.staticContentGenerator(element, function (name) {
      return window.document.createElement(name);
    }, configuration.containerClass, putRtlToContainer, css);
    var optionsAdapter = configuration.optionsAdapter;

    if (!optionsAdapter) {
      var trigger = function trigger(eventName) {
        $(element).trigger(eventName);
      };

      if (configuration.options) {
        optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger);
      } else {
        adjustBsOptionAdapterConfiguration(configuration, staticContent.selectElement);
        optionsAdapter = OptionsAdapterElement(staticContent.selectElement, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger);
      }
    }

    if (useCssPatch) pushIsValidClassToPicks(staticContent, css);
    var labelAdapter = LabelAdapter(configuration.labelElement, staticContent.createInputId);

    if (!configuration.placeholder) {
      configuration.placeholder = $(element).data("bsmultiselect-placeholder");
      if (!configuration.placeholder) configuration.placeholder = $(element).data("placeholder");
    }

    var multiSelect = new MultiSelect(optionsAdapter, configuration.setSelected, staticContent, function (pickElement) {
      return configuration.pickContentGenerator(pickElement, css);
    }, function (choiceElement) {
      return configuration.choiceContentGenerator(choiceElement, css);
    }, labelAdapter, configuration.placeholder, configuration.isRtl, Popper, window);
    multiSelect.onDispose = onDispose;
    bsAppearance(multiSelect, staticContent.picksElement, optionsAdapter, useCssPatch, css);
    if (init && init instanceof Function) init(multiSelect);
    multiSelect.init();
    return multiSelect;
  }

  addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
})(window, $, Popper);

//# sourceMappingURL=BsMultiSelect.js.map