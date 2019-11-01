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

    if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
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
    var adapter = null;
    if (configuration.adapter) adapter = configuration.adapter;else {
      var stylingMethod = configuration.useCss ? Bs4StylingMethodCss(configuration) : Bs4StylingMethodJs(configuration);
      adapter = Bs4Styling(stylingMethod, configuration, $);
    }
    var stylingAdapter2 = configuration.useCss ? Bs4SelectedItemContentStylingMethodCss(configuration, $) : Bs4SelectedItemContentStylingMethodJs(configuration, $);
    var stylingAdapter3 = configuration.useCss ? Bs4DropDownItemContentStylingMethodCss(configuration, $) : Bs4DropDownItemContentStylingMethodJs(configuration, $);
    var bs4SelectedItemContent = Bs4SelectedItemContent(stylingAdapter2, configuration, $);
    var bs4DropDownItemContent = Bs4DropDownItemContent(stylingAdapter3, configuration, $);

    var createStylingComposite = function createStylingComposite(container, selectedPanel, filterInputItem, filterInput, dropDownMenu) {
      return {
        $container: $(container),
        $selectedPanel: $(selectedPanel),
        $filterInputItem: $(filterInputItem),
        $filterInput: $(filterInput),
        $dropDownMenu: $(dropDownMenu)
      };
    };

    var multiSelect = new MultiSelect(optionsAdapter, adapter, bs4SelectedItemContent, bs4DropDownItemContent, labelAdapter, createStylingComposite, configuration, onDispose, window);
    return multiSelect;
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map