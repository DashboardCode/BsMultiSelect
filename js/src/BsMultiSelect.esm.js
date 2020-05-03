import {BsMultiSelect as BsMultiSelectBase}  from './BsMultiSelect'
import {initiateDefaults, mergeDefaults, onConfiguration}  from './PluginManager';
import {css} from './BsCss'
import {LabelPlugin} from './plugins/LabelPlugin';
import {RtlPlugin} from './plugins/RtlPlugin';
import {FormResetPlugin} from './plugins/FormResetPlugin';
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin';
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin';
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin';
import {CssPatchPlugin} from './plugins/CssPatchPlugin';
import {PlaceholderPlugin} from './plugins/PlaceholderPlugin';
import {JQueryMethodsPlugin} from './plugins/JQueryMethodsPlugin';
import {OptionsApiPlugin} from './plugins/OptionsApiPlugin';

import {createCss} from './ToolsStyling';
import {extendIfUndefined} from './ToolsJs';

const defaults = {containerClass : "dashboardcode-bsmultiselect", css: css}
const defaultPlugins = [CssPatchPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
    BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin , OptionsApiPlugin, JQueryMethodsPlugin];

export function BsMultiSelect(element, environment, settings){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    if (!environment.plugins)
        environment.plugins = defaultPlugins;
    
    let configuration = {};
   
    if (settings)
        adjustLegacySettings(settings);
    
    configuration.css = createCss(defaults.css, settings?.css);
    mergeDefaults(defaultPlugins, configuration, defaults, settings);

    extendIfUndefined(configuration, settings); 
    extendIfUndefined(configuration, defaults); 

    onConfiguration(defaultPlugins, configuration);

    return BsMultiSelectBase(element, environment, configuration, settings?.onInit);
}

initiateDefaults(defaultPlugins, defaults);
BsMultiSelect.defaults=defaults;