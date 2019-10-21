import $ from 'jquery'
import Bs4AdapterCss from './Bs4AdapterCss'
import Bs4AdapterJs from './Bs4AdapterJs'
import MultiSelect from './MultiSelect'
import AddToJQueryPrototype from './AddToJQueryPrototype'
import Bs4Adapter from './Bs4Adapter';
import OptionsAdapterElement from './OptionsAdapterElement';
import OptionsAdapterJson from './OptionsAdapterJson';

(
    (window, $) => {
        AddToJQueryPrototype('BsMultiSelect',
            (element, configuration, onDispose) => {
                let optionsAdapter = null;
                configuration= $.extend({}, configuration);
                if (configuration.optionsAdapter)
                    optionsAdapter = configuration.optionsAdapter;
                else
                {
                    optionsAdapter = configuration.options
                        ? new OptionsAdapterJson(element, configuration)
                        : new OptionsAdapterElement(element, configuration, $);
                }

                let adapter=null;
                if (configuration.adapter)
                    adapter = configuration.adapter;
                else
                {
                    let stylingAdapter = configuration.useCss
                        ? new Bs4AdapterCss(configuration, $)
                        : new Bs4AdapterJs(configuration, $);
                    adapter = new Bs4Adapter(stylingAdapter, configuration, $);
                }

                let multiSelect = new MultiSelect(optionsAdapter, adapter, configuration, onDispose, window, $);
                return multiSelect;
            }, $);
    }
)(window, $)
