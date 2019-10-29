import $ from 'jquery';
import StylingBs4AdapterCss from './Bs4AdapterCss';
import StylingBs4AdapterJs from './Bs4AdapterJs';
import MultiSelect from './MultiSelect';
import AddToJQueryPrototype from './AddToJQueryPrototype';
import Bs4Adapter from './Bs4Adapter';
import LabelAdapter from './LabelAdapter';
import { OptionsAdapterJson, OptionsAdapterElement } from './OptionsAdapters';
import { Bs4SelectedItemContent, Bs4SelectedItemContentJs, Bs4SelectedItemContentCss } from './Bs4SelectedItemContent';
import { Bs4DropDownItemContent, Bs4DropDownItemContentJs, Bs4DropDownItemContentCss } from './Bs4DropDownItemContent';

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, settings, onDispose) {
    var configuration = $.extend({}, settings); // settings used per jQuery intialization, configuration per element

    if (configuration.buildConfiguration) configuration.buildConfiguration(element, configuration);
    var optionsAdapter = null;
    if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
      if (configuration.options) {
        optionsAdapter = OptionsAdapterJson(element, configuration.options, configuration.hasOwnProperty("getDisabled") ? configuration.getDisabled : function () {
          return false;
        }, $);
        if (!configuration.createInputId) configuration.createInputId = function () {
          return "".concat(configuration.containerClass, "-generated-filter-").concat(element.id);
        };
      } else {
        configuration.getIsValid = function () {
          return element.classList.contains('is-valid');
        };

        configuration.getIsInvalid = function () {
          return element.classList.contains('is-invalid');
        };

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
      var stylingAdapter = configuration.useCss ? StylingBs4AdapterCss(configuration) : StylingBs4AdapterJs(configuration);
      adapter = new Bs4Adapter(stylingAdapter, configuration);
    } // configuration.createSelectedItemContent = function(selectedItem, optionItem, removeSelectedItem){
    //     let $selectedItem = $(selectedItem)
    //     $selectedItem.addClass(configuration.selectedItemClass);
    //     let $content = this.$(`<span/>`).text(optionItem.text);
    //     $content.appendTo($selectedItem);
    //     if (optionItem.disabled)
    //         this.stylingAdapter.DisableSelectedItemContent($content);
    //     if (this.stylingAdapter.CreateSelectedItemContent)
    //         this.stylingAdapter.CreateSelectedItemContent($selectedItem, null);
    //     return {
    //          disable(isDisabled){  }
    //     };
    // }

    var stylingAdapter2 = configuration.useCss ? new Bs4SelectedItemContentCss(configuration, $) : new Bs4SelectedItemContentJs(configuration, $);
    var stylingAdapter3 = configuration.useCss ? new Bs4DropDownItemContentCss(configuration, $) : new Bs4DropDownItemContentJs(configuration, $);
    var bs4SelectedItemContent = new Bs4SelectedItemContent(stylingAdapter2, configuration, $);
    var bs4DropDownItemContent = new Bs4DropDownItemContent(stylingAdapter3, configuration, $);
    var multiSelect = new MultiSelect(optionsAdapter, adapter, bs4SelectedItemContent, bs4DropDownItemContent, labelAdapter, configuration, onDispose, window, $);
    return multiSelect;
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map