import $ from 'jquery';
import Popper from 'popper.js';
import { MultiSelect } from './MultiSelect';
import { LabelAdapter } from './LabelAdapter';
import { addToJQueryPrototype } from './AddToJQueryPrototype';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import { pickContentGenerator } from './PickContentGenerator';
import { choiceContentGenerator } from './ChoiceContentGenerator';
import { staticContentGenerator } from './StaticContentGenerator';
import { createBsAppearance, adjustBsOptionAdapterConfiguration, pushIsValidClassToPicks, getLabelElement } from './BsAppearance';
import { createCss, extendCss, Styling } from './ToolsStyling';
import { extendOverriding, extendIfUndefined } from './ToolsJs';
import { adjustLegacyConfiguration as adjustLegacySettings } from './BsMultiSelectDepricatedParameters';
var css = {
  choices: 'dropdown-menu',
  // bs4, in bsmultiselect.scss as ul.dropdown-menu
  choice_hover: 'hover',
  //  not bs4, in scss as 'ul.dropdown-menu li.hover'
  // TODO
  choice_selected: '',
  // not used? should be used in OptionsPanel.js
  choice_disabled: '',
  // not used? should be used in OptionsPanel.js
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
  choice: '',
  choiceCheckBox_disabled: 'disabled',
  //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
  choiceContent: 'custom-control custom-checkbox',
  // bs4
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
  choice: 'px-2',
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
  // used in StylingCorrector
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
  // used in BsPickContentStylingCorrector
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
  // used in BsChoiceContentStylingCorrector
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

  var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // ? classes, merge styles

  configuration.css = defCss;
  configuration.cssPatch = defCssPatch;
} // 1) do not use css - classes  + styling js + prediction clases + compensation js
// 2) use scss - classes only 


(function (window, $, Popper) {
  var defaults = {
    useOwnCss: false,
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
        adjustLegacySettings(settngs);
        extendOverriding(configuration, settings); // settings used per jQuery intialization, configuration per element
      }

      extendConfigurtion(configuration, defaults);
    } // -----------------------------------------------------------------


    if (configuration.buildConfiguration) init = configuration.buildConfiguration(element, configuration);
    var css = configuration.css; // -----------------------------------------------------------------

    var useOwnCss = configuration.useOwnCss; // useOwnCss

    if (!useOwnCss) {
      extendCss(css, configuration.cssPatch); // TODO merge
    }

    console.log(css);
    var staticContent = configuration.staticContentGenerator(element, function (name) {
      return window.document.createElement(name);
    }, configuration.containerClass, css);
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

    if (!useOwnCss) {
      pushIsValidClassToPicks(staticContent, css);
    }

    var labelAdapter = LabelAdapter(configuration.labelElement, staticContent.createInputId);

    if (!configuration.placeholder) {
      configuration.placeholder = $(element).data("bsmultiselect-placeholder");
      if (!configuration.placeholder) configuration.placeholder = $(element).data("placeholder");
    }

    var bsAppearance = createBsAppearance(staticContent.picksElement, optionsAdapter, useOwnCss, css);

    var onUpdate = function onUpdate() {
      bsAppearance.updateSize();
      bsAppearance.updateIsValid();
    };

    var multiSelect = new MultiSelect(optionsAdapter, configuration.setSelected, staticContent, function (pickElement) {
      return configuration.pickContentGenerator(pickElement, css);
    }, function (choiceElement) {
      return configuration.choiceContentGenerator(choiceElement, css);
    }, labelAdapter, configuration.placeholder, onUpdate, onDispose, Popper, window);
    multiSelect.UpdateSize = bsAppearance.updateSize;
    multiSelect.UpdateIsValid = bsAppearance.updateIsValid;
    if (init && init instanceof Function) init(multiSelect);
    multiSelect.init();
    return multiSelect;
  }

  addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
})(window, $, Popper);

//# sourceMappingURL=BsMultiSelect.js.map