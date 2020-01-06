import $ from 'jquery';
import Popper from 'popper.js';
import { extendIfUndefined } from './ToolsJs';
import { MultiSelect } from './MultiSelect';
import { LabelAdapter } from './LabelAdapter';
import { addToJQueryPrototype } from './AddToJQueryPrototype';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import { StylingCorrector } from './StylingCorrector';
import { Styling } from './Styling';
import { BsPickContentGenerator, BsPickContentStylingCorrector } from './BsPickContentGenerator';
import { BsChoiceContentGenerator, BsChoiceContentStylingCorrector } from './BsChoiceContentGenerator';
import { ContainerAdapter } from './ContainerAdapter';
import { createBsAppearance } from './BsAppearance';
import { findDirectChildByTagName, setStyles } from './ToolsDom';
var classesDefaults = {
  containerClass: 'dashboardcode-bsmultiselect',
  choicesClass: 'dropdown-menu',
  choiceClassHover: 'text-primary bg-light',
  // dirty but BS doesn't provide better choices
  choiceClassSelected: '',
  // not used? should be used in OptionsPanel.js
  choiceClassDisabled: '',
  // not used? should be used in OptionsPanel.js
  picksClass: 'form-control',
  picksClassFocus: 'focus',
  // internal, not bs4, used in scss
  picksClassDisabled: 'disabled',
  // internal, not bs4, used in scss
  pickClassDisabled: '',
  // not used? should be used in PicksPanel.js
  pickFilterClass: '',
  filterInputClass: 'form-control',
  // used in BsPickContentStylingCorrector
  pickClass: 'badge',
  pickContentClassDisabled: 'disabled',
  // internal, not bs4, used in scss
  pickButtonClass: 'close',
  // used in BsChoiceContentStylingCorrector
  choiceClass: 'px-2',
  choiceCheckBoxClassDisabled: 'disabled',
  // internal, not bs4, used in scss
  choiceContentClass: 'custom-control custom-checkbox',
  choiceCheckBoxClass: 'custom-control-input',
  choiceLabelClass: 'custom-control-label justify-content-start'
};
var stylingDefaults = {
  // used in StylingCorrector
  picksStyle: {
    marginBottom: 0,
    height: 'auto'
  },
  picksStyleDisabled: {
    backgroundColor: '#e9ecef'
  },
  picksStyleFocus: {
    borderColor: '#80bdff',
    boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
  },
  picksStyleFocusValid: {
    boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'
  },
  picksStyleFocusInvalid: {
    boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
  },
  //filterInputStyle: {color: 'inherit' /*#495057 for default BS*/, fontWeight : 'inherit'},
  // used in BsAppearance
  picksStyleDef: {
    minHeight: 'calc(2.25rem + 2px)'
  },
  picksStyleLg: {
    minHeight: 'calc(2.875rem + 2px)'
  },
  picksStyleSm: {
    minHeight: 'calc(1.8125rem + 2px)'
  },
  // used in BsPickContentStylingCorrector
  pickStyle: {
    paddingLeft: '0px',
    lineHeight: '1.5em'
  },
  pickButtonStyle: {
    fontSize: '1.5em',
    lineHeight: '.9em'
  },
  pickContentStyleDisabled: {
    opacity: '.65'
  },
  // avoid opacity on pickElement's border
  // used in BsChoiceContentStylingCorrector
  choiceLabelStyleDisabled: {
    opacity: '.65'
  } // more flexible than {color: '#6c757d'}

};

(function (window, $) {
  function createPlugin(element, settings, onDispose) {
    if (typeof Popper === 'undefined') {
      throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
    }

    var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

    if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
    var useCss = configuration.useCss;
    var styling = configuration.styling;

    if (!configuration.adapter) {
      var stylingCorrector = configuration.stylingCorrector;

      if (!stylingCorrector) {
        if (!useCss) {
          extendIfUndefined(configuration, stylingDefaults);
          stylingCorrector = StylingCorrector(configuration);
          var defFocusIn = stylingCorrector.focusIn;

          stylingCorrector.focusIn = function (picksElement) {
            if (picksElement.classList.contains("is-valid")) {
              setStyles(picksElement, configuration.picksStyleFocusValid);
            } else if (picksElement.classList.contains("is-invalid")) {
              setStyles(picksElement, configuration.picksStyleFocusInvalid);
            } else {
              defFocusIn(picksElement);
            }
          };
        }
      }

      extendIfUndefined(configuration, classesDefaults);
      styling = Styling(configuration, stylingCorrector);
    }

    var optionsAdapter = null;
    var containerAdapter = null;
    if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
      var createElement = function createElement(name) {
        return window.document.createElement(name);
      };

      var trigger = function trigger(eventName) {
        $(element).trigger(eventName);
      };

      if (configuration.options) {
        optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-filter-").concat(element.id);
        }; // find direct child by tagName

        var picksElement = findDirectChildByTagName(element, "UL");
        containerAdapter = ContainerAdapter(createElement, null, element, picksElement);
      } else {
        var selectElement = null;
        var containerElement = null;
        if (element.tagName == "SELECT") selectElement = element;else {
          selectElement = findDirectChildByTagName(element, "SELECT");
          if (!selectElement) throw "There are no SELECT element or options in the configuraion";
          containerElement = element;
        }

        if (!containerElement && configuration.containerClass) {
          var $container = $(selectElement).closest('.' + configuration.containerClass);
          if ($container.length > 0) containerElement = $container.get(0);
        }

        if (!configuration.label) {
          var $formGroup = $(selectElement).closest('.form-group');

          if ($formGroup.length == 1) {
            var $label = $formGroup.find("label[for=\"".concat(selectElement.id, "\"]"));

            if ($label.length > 0) {
              var label = $label.get(0);
              var forId = label.getAttribute('for');

              if (forId == selectElement.id) {
                configuration.label = label;
              }
            }
          }
        }

        var $form = $(selectElement).closest('form');
        var form = null;

        if ($form.length == 1) {
          form = $form.get(0);
        }

        if (!configuration.getDisabled) {
          var $fieldset = $(selectElement).closest('fieldset');

          if ($fieldset.length == 1) {
            var fieldset = $fieldset.get(0);

            configuration.getDisabled = function () {
              return selectElement.disabled || fieldset.disabled;
            };
          } else {
            configuration.getDisabled = function () {
              return selectElement.disabled;
            };
          }
        }

        if (!configuration.getSize) {
          configuration.getSize = function () {
            var value = null;
            if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg')) value = 'custom-select-lg';else if (selectElement.classList.contains('custom-select-sm') || selectElement.classList.contains('form-control-sm')) value = 'custom-select-sm';else if (containerElement && containerElement.classList.contains('input-group-lg')) value = 'input-group-lg';else if (containerElement && containerElement.classList.contains('input-group-sm')) value = 'input-group-sm';
            return value;
          };
        }

        if (!configuration.getIsValid) {
          configuration.getIsValid = function () {
            return selectElement.classList.contains('is-valid');
          };
        }

        if (!configuration.getIsInvalid) {
          configuration.getIsInvalid = function () {
            return selectElement.classList.contains('is-invalid');
          };
        }

        optionsAdapter = OptionsAdapterElement(selectElement, configuration.getDisabled, configuration.getSize, configuration.getIsValid, configuration.getIsInvalid, trigger, form);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-input-").concat((selectElement.id ? selectElement.id : selectElement.name).toLowerCase(), "-id");
        };
        var picksElement = null;
        if (containerElement) picksElement = findDirectChildByTagName(containerElement, "UL");
        containerAdapter = ContainerAdapter(createElement, selectElement, containerElement, picksElement);
      }
    }
    var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
    var pickContentGenerator = configuration.pickContentGenerator;

    if (!pickContentGenerator) {
      var pickContentStylingCorrector = configuration.pickContentStylingCorrector;

      if (!pickContentStylingCorrector) {
        if (!useCss) {
          var pickStyle = stylingDefaults.pickStyle,
              pickButtonStyle = stylingDefaults.pickButtonStyle,
              pickContentStyleDisabled = stylingDefaults.pickContentStyleDisabled;
          extendIfUndefined(configuration, {
            pickStyle: pickStyle,
            pickButtonStyle: pickButtonStyle,
            pickContentStyleDisabled: pickContentStyleDisabled
          });
          pickContentStylingCorrector = BsPickContentStylingCorrector(configuration, $);
        }
      }

      var pickClass = classesDefaults.pickClass,
          pickButtonClass = classesDefaults.pickButtonClass,
          pickContentClassDisabled = classesDefaults.pickContentClassDisabled;
      extendIfUndefined(configuration, {
        pickClass: pickClass,
        pickButtonClass: pickButtonClass,
        pickContentClassDisabled: pickContentClassDisabled
      });
      pickContentGenerator = BsPickContentGenerator(configuration, pickContentStylingCorrector, $);
    }

    var choiceContentGenerator = configuration.choiceContentGenerator;

    if (!choiceContentGenerator) {
      var choiceContentStylingCorrector = configuration.choiceContentStylingCorrector;

      if (!useCss) {
        var choiceLabelStyleDisabled = stylingDefaults.choiceLabelStyleDisabled;
        extendIfUndefined(configuration, {
          choiceLabelStyleDisabled: choiceLabelStyleDisabled
        });
        choiceContentStylingCorrector = BsChoiceContentStylingCorrector(configuration);
      }

      var choiceClass = classesDefaults.choiceClass,
          choiceCheckBoxClassDisabled = classesDefaults.choiceCheckBoxClassDisabled;
      extendIfUndefined(configuration, {
        choiceClass: choiceClass,
        choiceCheckBoxClassDisabled: choiceCheckBoxClassDisabled
      });
      choiceContentGenerator = BsChoiceContentGenerator(configuration, choiceContentStylingCorrector);
    }

    var createStylingComposite = function createStylingComposite(pickFilterElement, inputElement, choicesElement) {
      return {
        container: containerAdapter.containerElement,
        picks: containerAdapter.picksElement,
        pickFilter: pickFilterElement,
        input: inputElement,
        choices: choicesElement
      };
    };

    var placeholderText = configuration.placeholder;

    if (!placeholderText) {
      if (selectElement) {
        placeholderText = $(selectElement).data("bsmultiselect-placeholder");
        if (!placeholderText) placeholderText = $(selectElement).data("placeholder");
      } else if (containerElement) {
        placeholderText = $(containerElement).data("bsmultiselect-placeholder");
        if (!placeholderText) placeholderText = $(containerElement).data("placeholder");
      }
    }

    var setSelected = configuration.setSelected;

    if (!setSelected) {
      setSelected = function setSelected(option, value) {
        option.selected = value;
      };
    }

    var bsAppearance = createBsAppearance(containerAdapter.picksElement, configuration, optionsAdapter);

    var onUpdate = function onUpdate() {
      bsAppearance.updateSize();
      bsAppearance.updateIsValid();
    };

    var multiSelect = new MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, pickContentGenerator, choiceContentGenerator, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, Popper, window);
    multiSelect.UpdateSize = bsAppearance.updateSize;
    multiSelect.UpdateIsValid = bsAppearance.updateIsValid;
    if (configuration.init) configuration.init(element, multiSelect);
    multiSelect.init();
    return multiSelect;
  }

  ;
  var defaults = {
    classes: classesDefaults,
    styling: stylingDefaults
  };
  addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
})(window, $, Popper);

//# sourceMappingURL=BsMultiSelect.js.map