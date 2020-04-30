import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'
import {BsMultiSelect, defaults, initiateDefaults} from './BsMultiSelect';
import {composeSync} from './ToolsJs';

import {LabelPlugin} from './plugins/LabelPlugin';
import {RtlPlugin} from './plugins/RtlPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';
import {CssPatchPlugin} from './plugins/CssPatchPlugin';

(
    (window, $, Popper) => {
        let plugins = [CssPatchPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin, RtlPlugin];
        let createBsMultiSelect = (element, settings, removeInstanceData) => { 
            let trigger = (e, eventName) => $(e).trigger(eventName);
            let environment = {trigger, window, Popper}
            environment.plugins = plugins;
            let bsMultiSelect = BsMultiSelect(element, environment, settings);
            bsMultiSelect.Dispose = composeSync(bsMultiSelect.Dispose, removeInstanceData);
            return bsMultiSelect;
        }
        let prototypable = addToJQueryPrototype('BsMultiSelect', createBsMultiSelect, $);

        initiateDefaults(plugins);
        prototypable.defaults = defaults;
    }
)(window, $, Popper)
