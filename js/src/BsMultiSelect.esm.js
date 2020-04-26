import {BsMultiSelect as BsMultiSelectBase}  from './BsMultiSelect'

import {LabelPlugin} from './plugins/LabelPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';

export function BsMultiSelect(element, environment, settings){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    if (!environment.plugins)
        environment.plugins = [LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, BsAppearancePlugin, FormResetPlugin];
    
    return BsMultiSelectBase(element, environment, settings)
}