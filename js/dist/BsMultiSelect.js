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

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, settings, onDispose) {
    var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

    if (configuration.preBuildConfiguration) configuration.preBuildConfiguration(element, configuration);
    var $element = $(element);
    var optionsAdapter = null;
    if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
      var trigger = function trigger(eventName) {
        $element.trigger(eventName);
      };

      if (configuration.options) {
        optionsAdapter = OptionsAdapterJson(element, configuration.options, configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid, trigger);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-filter-").concat(element.id);
        };
      } else {
        if (!configuration.label) {
          var $formGroup = $(element).closest('.form-group');

          if ($formGroup.length == 1) {
            var $label = $formGroup.find("label[for=\"".concat(element.id, "\"]"));

            if ($label.length > 0) {
              var label = $label.get(0);
              var forId = label.getAttribute('for');

              if (forId == element.id) {
                configuration.label = label;
              }
            }
          }
        }

        optionsAdapter = OptionsAdapterElement(element, trigger);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-input-").concat((element.id ? element.id : element.name).toLowerCase(), "-id");
        };
      }
    }
    var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
    var useCss = configuration.useCss;
    var styling = configuration.styling;

    if (!configuration.adapter) {
      var stylingMethod = configuration.stylingMethod;

      if (!stylingMethod) {
        if (useCss) stylingMethod = Bs4StylingMethodCss(configuration);else stylingMethod = Bs4StylingMethodJs(configuration);
      }

      styling = Bs4Styling(stylingMethod, configuration, $);
    }

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

    var createStylingComposite = function createStylingComposite(container, selectedPanel, filterInputItem, filterInput, dropDownMenu) {
      return {
        $container: $(container),
        $selectedPanel: $(selectedPanel),
        $filterInputItem: $(filterInputItem),
        $filterInput: $(filterInput),
        $dropDownMenu: $(dropDownMenu)
      };
    };

    var multiSelect = new MultiSelect(optionsAdapter, styling, selectedItemContent, dropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window);
    if (configuration.postBuildConfiguration) configuration.postBuildConfiguration(element, multiSelect);
    multiSelect.init();
    return multiSelect;
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map