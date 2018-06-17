import $ from 'jquery';
import Bs4AdapterCss from './Bs4AdapterCss';
import Bs4Adapter from './Bs4Adapter';
import MultiSelect from './MultiSelect';
import AddToJQueryPrototype from './AddToJQueryPrototype';

(function (window, $) {
  AddToJQueryPrototype('BsMultiSelect', function (element, optionsObject) {
    var adapter = optionsObject && optionsObject.useCss ? new Bs4AdapterCss($, element, optionsObject) : new Bs4Adapter($, element, optionsObject);
    return new MultiSelect(element, optionsObject, adapter, window, $);
  }, $);
})(window, $);

//# sourceMappingURL=BsMultiSelect.js.map