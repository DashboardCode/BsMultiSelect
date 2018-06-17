import $ from 'jquery'
import Bs4AdapterCss from './Bs4AdapterCss'
import Bs4Adapter from './Bs4Adapter'
import MultiSelect from './MultiSelect'
import AddToJQueryPrototype from './AddToJQueryPrototype'

(
    (window, $) => {
        AddToJQueryPrototype('BsMultiSelect',
            (element, optionsObject, onDispose) => {
                let adapter = optionsObject && optionsObject.useCss
                ? new Bs4AdapterCss($, element, optionsObject)
                : new Bs4Adapter($, element, optionsObject);
                return new MultiSelect(element, optionsObject, onDispose, adapter, window, $);
            }, $);
    }
)(window, $)
