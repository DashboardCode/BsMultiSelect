import $ from 'jquery';
import MultiSelect from './MultiSelect';
import LabelAdapter from './LabelAdapter';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import Bs4StylingMethodCss from './Bs4StylingMethodCss';
import Bs4StylingMethodJs from './Bs4StylingMethodJs';
import Bs4Styling from './Bs4Styling';
import AddToJQueryPrototype from './AddToJQueryPrototype';
import { Bs4SelectedItemContent, Bs4SelectedItemContentStylingMethodJs, Bs4SelectedItemContentStylingMethodCss } from './Bs4SelectedItemContent';
import { Bs4DropDownItemContent, Bs4DropDownItemContentStylingMethodJs, Bs4DropDownItemContentStylingMethodCss } from './Bs4DropDownItemContent';
import ContainerAdapter from './ContainerAdapter';

function FindDirectChildByTagName(element, tagName) {
  var returnValue = null;

  for (var i = 0; i < element.children.length; i++) {
    var tmp = element.children[i];

    if (tmp.tagName == tagName) {
      returnValue = tmp;
      break;
    }
  }

  return returnValue;
}

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, settings, onDispose) {
    var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

    if (configuration.preBuildConfiguration) configuration.preBuildConfiguration(element, configuration);
    var useCss = configuration.useCss;
    var styling = configuration.styling;

    if (!configuration.adapter) {
      var stylingMethod = configuration.stylingMethod;

      if (!stylingMethod) {
        if (useCss) stylingMethod = Bs4StylingMethodCss(configuration);else stylingMethod = Bs4StylingMethodJs(configuration);
      }

      styling = Bs4Styling(stylingMethod, configuration, $);
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
        optionsAdapter = OptionsAdapterJson(configuration.options, configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid, trigger);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-filter-").concat(element.id);
        }; // find direct child by tagName

        var picksElement = FindDirectChildByTagName(element, "UL");
        containerAdapter = ContainerAdapter(createElement, null, element, picksElement);
      } else {
        var selectElement = null;
        var containerElement = null;
        if (element.tagName == "SELECT") selectElement = element;else {
          selectElement = FindDirectChildByTagName(element, "SELECT");
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

        optionsAdapter = OptionsAdapterElement(selectElement, configuration.getDisabled, trigger, form);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-input-").concat((selectElement.id ? selectElement.id : selectElement.name).toLowerCase(), "-id");
        };
        var picksElement = null;
        if (containerElement) picksElement = FindDirectChildByTagName(containerElement, "UL");
        containerAdapter = ContainerAdapter(createElement, selectElement, containerElement, picksElement);
      }
    }
    var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
    var selectedItemContent = configuration.selectedItemContent;

    if (!selectedItemContent) {
      var selectedItemContentStylingMethod = configuration.selectedItemContentStylingMethod;

      if (!selectedItemContentStylingMethod) {
        if (useCss) selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodCss(configuration, $);else selectedItemContentStylingMethod = Bs4SelectedItemContentStylingMethodJs(configuration, $);
      }

      selectedItemContent = Bs4SelectedItemContent(selectedItemContentStylingMethod, configuration, $);
    }

    var dropDownItemContent = configuration.bs4DropDownItemContent;

    if (!dropDownItemContent) {
      var dropDownItemContentStylingMethod = configuration.dropDownItemContentStylingMethod;
      if (useCss) dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodCss(configuration, $);else dropDownItemContentStylingMethod = Bs4DropDownItemContentStylingMethodJs(configuration, $);
      dropDownItemContent = Bs4DropDownItemContent(dropDownItemContentStylingMethod, configuration, $);
    }

    var createStylingComposite = function createStylingComposite(container, selectedPanel, placeholderItemElement, filterInputItem, filterInput, dropDownMenu) {
      return {
        $container: $(container),
        $selectedPanel: $(selectedPanel),
        $placeholderItem: placeholderItemElement ? $(placeholderItemElement) : null,
        $filterInputItem: $(filterInputItem),
        $filterInput: $(filterInput),
        $dropDownMenu: $(dropDownMenu)
      };
    };

    var placeholderText = configuration.placeholder;

    if (!placeholderText) {
      if (selectElement) placeholderText = $(selectElement).data("bsmultiselect-placeholder");else if (containerElement) placeholderText = $(containerElement).data("bsmultiselect-placeholder");
    }

    var multiSelect = new MultiSelect(optionsAdapter, containerAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, placeholderText, configuration, onDispose, window);
    if (configuration.postBuildConfiguration) configuration.postBuildConfiguration(element, multiSelect);
    multiSelect.init();
    return multiSelect;
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map