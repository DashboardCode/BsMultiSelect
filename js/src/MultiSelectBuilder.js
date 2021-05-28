import {BsMultiSelect} from './BsMultiSelect'
import {plugMergeSettings, plugDefaultConfig} from './PluginManager'

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {createCss} from './ToolsStyling'
import {extendIfUndefined, composeSync} from './ToolsJs'

export function MultiSelectBuilder(plugins ,window, createPopper,  trigger) 
{
    if (createPopper.createPopper) {
        createPopper = createPopper.createPopper;
    }

    const defaults = {containerClass: "dashboardcode-bsmultiselect"}

    let createBsMultiSelect = (element, settings, removeInstanceData) => { 
        let environment = {trigger, window, createPopper}
        let configuration = {};
        let buildConfiguration;
        if (settings instanceof Function) {
            buildConfiguration = settings;
            settings = null;
        } else {
            buildConfiguration = settings?.buildConfiguration;
        }
        if (settings){
            adjustLegacySettings(settings);
            if (settings.plugins) {
                environment.plugins = settings.plugins;
                settings.plugins = null;
            }
        }
        if (!environment.plugins) {
            environment.plugins = plugins;
        }
        configuration.css = createCss(defaults.css, settings?.css);
        plugMergeSettings(environment.plugins, configuration, defaults, settings); // merge settings.cssPatch and defaults.cssPatch
        extendIfUndefined(configuration, settings);
        extendIfUndefined(configuration, defaults);
        let onInit = buildConfiguration?.(element, configuration);
        let multiSelect = BsMultiSelect(element, environment, configuration, onInit); // onInit(api, aspects) - before load data
        multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData);
        return multiSelect;
    }
    plugDefaultConfig(plugins, defaults);
    return {constructor:createBsMultiSelect, defaultOptions: defaults}
}
