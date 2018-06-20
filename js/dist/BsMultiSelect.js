import $ from 'jquery';
import Bs4AdapterCss from './Bs4AdapterCss';
import Bs4AdapterJs from './Bs4AdapterJs';
import MultiSelect from './MultiSelect';
import AddToJQueryPrototype from './AddToJQueryPrototype';
import Bs4Adapter from './Bs4Adapter';

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, optionsObject, onDispose) {
    var adapter = optionsObject && optionsObject.useCss ? new Bs4AdapterCss(optionsObject, $) : new Bs4AdapterJs(optionsObject, $);
    var facade = new Bs4Adapter(element, adapter, optionsObject, $);
    return new MultiSelect(element, optionsObject, onDispose, facade, window, $);
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map