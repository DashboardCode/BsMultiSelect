import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect, defaults} from './BsMultiSelect';
import {composeSync} from './ToolsJs';

import {LabelPlugin} from './plugins/LabelPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';

(
    (window, $, Popper) => {
        let createPlugin = (element, settings, removeInstanceData) => { 
            let trigger = (e, eventName) => $(e).trigger(eventName);
            let environment = {trigger, window, Popper}

            environment.plugins = [LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin];
            
            let multiSelect = BsMultiSelect(element, environment, settings);
            multiSelect.Dispose = composeSync(multiSelect.Dispose, removeInstanceData);
            return multiSelect;
        }
        addToJQueryPrototype('BsMultiSelect', createPlugin, defaults, $);
    }
)(window, $, Popper)
