import {BsMultiSelect as BsMultiSelectBase, defaults, initiateDefaults}  from './BsMultiSelect'

import {LabelPlugin} from './plugins/LabelPlugin';
import {RtlPlugin} from './plugins/RtlPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';
import {CssPatchPlugin} from './plugins/CssPatchPlugin';

const defaultPlugins = [CssPatchPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin, RtlPlugin];

export function BsMultiSelect(element, environment, settings){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    if (!environment.plugins)
        environment.plugins = defaultPlugins;
    
    return BsMultiSelectBase(element, environment, settings)
}

initiateDefaults(defaultPlugins);
BsMultiSelect.defaults=defaults;