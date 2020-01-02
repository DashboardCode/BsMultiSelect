import $ from 'jquery';
import { ExtendIfUndefined } from './JsTools';
import MultiSelect from './MultiSelect';
import LabelAdapter from './LabelAdapter';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import Bs4StylingMethodJs from './Bs4StylingMethodJs';
import { Styling } from './Styling';
import AddToJQueryPrototype from './AddToJQueryPrototype';
import { Bs4SelectedItemContent, Bs4SelectedItemContentStylingMethodJs } from './Bs4SelectedItemContent';
import { Bs4DropDownItemContent, Bs4DropDownItemContentStylingMethodJs } from './Bs4DropDownItemContent';
import ContainerAdapter from './ContainerAdapter';
import { createBsAppearance } from './BsAppearance';
import { findDirectChildByTagName } from './DomTools';
var classesDefaults = {
  containerClass: 'dashboardcode-bsmultiselect',
  dropDownMenuClass: 'dropdown-menu',
  dropDownItemHoverClass: 'text-primary bg-light',
  // TODO looks like bullshit
  dropDownItemSelectedClass: '',
  // not used? should be used in OptionsPanel.js
  dropDownItemDisabledClass: '',
  // not used? should be used in OptionsPanel.js
  selectedPanelClass: 'form-control',
  selectedPanelFocusClass: 'focus',
  // internal, not bs4, used in scss
  selectedPanelDisabledClass: 'disabled',
  // internal, not bs4, used in scss
  selectedItemDisabledClass: '',
  // not used? should be used in PicksPanel.js
  selectedItemFilterClass: '',
  filterInputClass: ''
};
var bs4SelectedItemContentDefaults = {
  selectedItemClass: 'badge',
  removeSelectedItemButtonClass: 'close',
  selectedItemContentDisabledClass: 'disabled' // internal, not bs4, used in scss

};
var bs4DropDownItemContentDefaults = {
  dropDownItemClass: 'px-2',
  checkBoxDisabledClass: 'disabled' // internal, not bs4, used in scss

};
var stylingDefaults = {
  selectedPanelDefMinHeight: 'calc(2.25rem + 2px)',
  selectedPanelLgMinHeight: 'calc(2.875rem + 2px)',
  selectedPanelSmMinHeight: 'calc(1.8125rem + 2px)',
  selectedPanelDisabledBackgroundColor: '#e9ecef',
  selectedPanelFocusBorderColor: '#80bdff',
  selectedPanelFocusBoxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)',
  selectedPanelFocusValidBoxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)',
  selectedPanelFocusInvalidBoxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)',
  filterInputColor: 'inherit',
  //'#495057',
  filterInputFontWeight: 'inherit' //'#495057',

};
var bs4SelectedItemContentStylingMethodJsDefaults = {
  selectedItemContentDisabledOpacity: '.65',
  defSelectedItemStyle: {
    'padding-left': '0px',
    'line-height': '1.5em'
  },
  defRemoveSelectedItemButtonStyle: {
    'font-size': '1.5em',
    'line-height': '.9em'
  }
};
var bs4DropDownItemContentStylingMethodJsDefaults = {
  checkBoxLabelDisabledColor: '#6c757d'
};

(function (window, $) {
  function createPlugin(element, settings, onDispose) {
    var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

    if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
    var useCss = configuration.useCss;
    var styling = configuration.styling;

    if (!configuration.adapter) {
      var stylingMethod = configuration.stylingMethod;

      if (!stylingMethod) {
        if (!useCss) {
          ExtendIfUndefined(configuration, stylingDefaults);
          stylingMethod = Bs4StylingMethodJs(configuration);
        }
      }

      ExtendIfUndefined(configuration, classesDefaults);
      styling = Styling(configuration, stylingMethod);
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
    var selectedItemContent = configuration.selectedItemContent;

    if (!selectedItemContent) {
      var selectedItemContentStylingMethod = configuration.selectedItemContentStylingMethod;

      if (!selectedItemContentStylingMethod) {
        if (!useCss) {
          ExtendIfUndefined(configuration, bs4SelectedItemContentStylingMethodJsDefaults);
          selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodJs(configuration, $);
        }
      }

      ExtendIfUndefined(configuration, bs4SelectedItemContentDefaults);
      selectedItemContent = Bs4SelectedItemContent(configuration, selectedItemContentStylingMethod, $);
    }

    var dropDownItemContent = configuration.bs4DropDownItemContent;

    if (!dropDownItemContent) {
      var dropDownItemContentStylingMethod = configuration.dropDownItemContentStylingMethod;

      if (!useCss) {
        ExtendIfUndefined(configuration, bs4DropDownItemContentStylingMethodJsDefaults);
        dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodJs(configuration, $);
      }

      ExtendIfUndefined(configuration, bs4DropDownItemContentDefaults);
      dropDownItemContent = Bs4DropDownItemContent(configuration, dropDownItemContentStylingMethod, $);
    }

    var createStylingComposite = function createStylingComposite(inputItemElement, inputElement, optionsElement) {
      return {
        container: containerAdapter.containerElement,
        picks: containerAdapter.picksElement,
        inputItem: inputItemElement,
        input: inputElement,
        options: optionsElement
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

    var multiSelect = new MultiSelect(optionsAdapter, setSelected, containerAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, placeholderText, configuration, onUpdate, onDispose, window);
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
  AddToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map