import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect, defaults} from './BsMultiSelect';
import {composeSync} from './ToolsJs';

(
    (window, $, Popper) => {
        let createPlugin = (element, settings, onDispose) => { 
            let trigger = eventName => $(element).trigger(eventName);
            let environment = {trigger, window, Popper}
            let multiSelect = BsMultiSelect(element, settings, environment);
            multiSelect.onDispose = composeSync(multiSelect.onDispose, onDispose);
            return multiSelect;
        }
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
