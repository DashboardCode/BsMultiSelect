import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelectGenerator, defaults} from './BsMultiSelectGenerator';

(
    (window, $, Popper) => {
        let createPlugin = (element, settings, onDispose) => { 
            let trigger = eventName => $(element).trigger(eventName);
            return  BsMultiSelectGenerator(element, settings, onDispose, trigger, window, Popper);
        }
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
