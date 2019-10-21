import $ from 'jquery';
import Bs4AdapterCss from './Bs4AdapterCss';
import Bs4AdapterJs from './Bs4AdapterJs';
import MultiSelect from './MultiSelect';
import AddToJQueryPrototype from './AddToJQueryPrototype';
import Bs4Adapter from './Bs4Adapter';
import OptionsAdapterElement from './OptionsAdapterElement';
import OptionsAdapterJson from './OptionsAdapterJson';

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, configuration, onDispose) {
    var optionsAdapter = null;
    configuration = $.extend({}, configuration);
    if (configuration.optionsAdapter) optionsAdapter = configuration.optionsAdapter;else {
      optionsAdapter = configuration.options ? new OptionsAdapterJson(element, configuration) : new OptionsAdapterElement(element, configuration, $);
    }
    var adapter = null;
    if (configuration.adapter) adapter = configuration.adapter;else {
      var stylingAdapter = configuration.useCss ? new Bs4AdapterCss(configuration, $) : new Bs4AdapterJs(configuration, $);
      adapter = new Bs4Adapter(stylingAdapter, configuration, $);
    }
    var multiSelect = new MultiSelect(optionsAdapter, adapter, configuration, onDispose, window, $);
    return multiSelect;
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map