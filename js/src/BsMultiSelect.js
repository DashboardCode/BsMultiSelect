import $ from 'jquery'
import Bs4AdapterCss from './Bs4AdapterCss'
import Bs4AdapterJs from './Bs4AdapterJs'
import MultiSelect from './MultiSelect'
import AddToJQueryPrototype from './AddToJQueryPrototype'
import Bs4Adapter from './Bs4Adapter';

(
    (window, $) => {
        AddToJQueryPrototype('BsMultiSelect',
            (element, optionsObject, onDispose) => {
                let adapter = optionsObject && optionsObject.useCss
                ? new Bs4AdapterCss(optionsObject, $)
                : new Bs4AdapterJs(optionsObject, $);
                let facade = new Bs4Adapter(element, adapter, optionsObject, $);
                return new MultiSelect(element, optionsObject, onDispose, facade, window, $);
            }, $);
    }
)(window, $)
