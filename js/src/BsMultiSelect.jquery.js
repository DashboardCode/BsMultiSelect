import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect, defaults} from './BsMultiSelect';
import {composeSync} from './ToolsJs';

(
    (window, $, Popper) => {
        let createPlugin = (element, settings, removeInstanceData) => { 
            let trigger = (e, eventName) => $(e).trigger(eventName);
            let environment = {trigger, window, Popper}
            let multiSelect = BsMultiSelect(element, environment, settings);
            multiSelect.Dispose = composeSync(multiSelect.Dispose, removeInstanceData);
            return multiSelect;
        }
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
