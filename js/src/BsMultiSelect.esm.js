import {BsMultiSelect as BsMultiSelectBase}  from './BsMultiSelect'
import {plugDefaultConfig, plugMergeSettings}  from './PluginManager'
import {css} from './BsCss'
import {LabelPlugin} from './plugins/LabelPlugin'
import {RtlPlugin} from './plugins/RtlPlugin'
import {FormResetPlugin} from './plugins/FormResetPlugin'
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin'
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin'
import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin'
import {CssPatchPlugin} from './plugins/CssPatchPlugin'
import {PlaceholderPlugin} from './plugins/PlaceholderPlugin'
import {JQueryMethodsPlugin} from './plugins/JQueryMethodsPlugin'
import {OptionsApiPlugin} from './plugins/OptionsApiPlugin'
import {SelectElementPlugin} from './plugins/SelectElementPlugin'

import {SelectedOptionPlugin} from './plugins/SelectedOptionPlugin'
import {DisabledOptionPlugin} from './plugins/DisabledOptionPlugin'
import {FormRestoreOnBackwardPlugin} from './plugins/FormRestoreOnBackwardPlugin'
import {PicksApiPlugin} from './plugins/PicksApiPlugin'

import {createCss} from './ToolsStyling'
import {extendIfUndefined, composeSync} from './ToolsJs'

import  {EventBinder} from './ToolsDom'
import  {addStyling, toggleStyling} from './ToolsStyling'

const defaults = {containerClass : "dashboardcode-bsmultiselect", css: css}
const defaultPlugins = [CssPatchPlugin, SelectElementPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
    BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin , OptionsApiPlugin,
    JQueryMethodsPlugin, SelectedOptionPlugin, FormRestoreOnBackwardPlugin,  DisabledOptionPlugin, PicksApiPlugin];

export function BsMultiSelect(element, environment, settings){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    if (!environment.plugins)
        environment.plugins = defaultPlugins;
    
    let configuration = {};

    configuration.css = createCss(defaults.css, settings?.css);
    plugMergeSettings(defaultPlugins, configuration, defaults, settings);

    extendIfUndefined(configuration, settings);
    extendIfUndefined(configuration, defaults);

    return BsMultiSelectBase(element, environment, configuration, settings?.onInit);
}

plugDefaultConfig(defaultPlugins, defaults);
BsMultiSelect.defaults=defaults;
BsMultiSelect.tools = {EventBinder, addStyling, toggleStyling, composeSync}
BsMultiSelect.plugins = {CssPatchPlugin, SelectElementPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
    BsAppearancePlugin, FormResetPlugin, RtlPlugin, PlaceholderPlugin , OptionsApiPlugin, JQueryMethodsPlugin, SelectedOptionPlugin, FormRestoreOnBackwardPlugin,  DisabledOptionPlugin, PicksApiPlugin}