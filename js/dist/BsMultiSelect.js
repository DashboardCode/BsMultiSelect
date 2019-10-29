import $ from 'jquery';
import Bs4AdapterStylingMethodCss from './Bs4AdapterStylingMethodCss';
import Bs4AdapterStylingMethodJs from './Bs4AdapterStylingMethodJs';
import MultiSelect from './MultiSelect';
import AddToJQueryPrototype from './AddToJQueryPrototype';
import Bs4Adapter from './Bs4Adapter';
import LabelAdapter from './LabelAdapter';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import { ComposeBs4SelectedItemContentFactory, Bs4SelectedItemContentStylingMethodJs, Bs4SelectedItemContentStylingMethodCss } from './Bs4SelectedItemContentFactory';
import { ComposeBs4DropDownItemContentFactory, Bs4DropDownItemContentStylingMethodJs, Bs4DropDownItemContentStylingMethodCss } from './Bs4DropDownItemContentFactory';

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, settings, onDispose) {
    var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

    if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
    var optionsAdapter = null;
    if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
      if (configuration.options) {
        optionsAdapter = OptionsAdapterJson(element, configuration.options, configuration.getDisabled, configuration.getIsValid, configuration.getIsInvalid, $);
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

        optionsAdapter = OptionsAdapterElement(element, $);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-input-").concat((element.id ? element.id : element.name).toLowerCase(), "-id");
        };
      }
    }
    var labelAdapter = LabelAdapter(configuration.label, configuration.createInputId);
    var adapter = null;
    if (configuration.adapter) adapter = configuration.adapter;else {
      var stylingAdapter = configuration.useCss ? Bs4AdapterStylingMethodCss(configuration) : Bs4AdapterStylingMethodJs(configuration);
      adapter = new Bs4Adapter(stylingAdapter, configuration);
    }
    var stylingAdapter2 = configuration.useCss ? Bs4SelectedItemContentStylingMethodCss(configuration, $) : Bs4SelectedItemContentStylingMethodJs(configuration, $);
    var stylingAdapter3 = configuration.useCss ? Bs4DropDownItemContentStylingMethodCss(configuration, $) : Bs4DropDownItemContentStylingMethodJs(configuration, $);
    var bs4SelectedItemContent = ComposeBs4SelectedItemContentFactory(stylingAdapter2, configuration, $);
    var bs4DropDownItemContent = ComposeBs4DropDownItemContentFactory(stylingAdapter3, configuration, $);
    var multiSelect = new MultiSelect(optionsAdapter, adapter, bs4SelectedItemContent, bs4DropDownItemContent, labelAdapter, configuration, onDispose, window, $);
    return multiSelect;
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map