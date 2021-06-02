import {BsMultiSelect} from './BsMultiSelect'
import {plugMergeSettings, plugDefaultConfig} from './PluginManager'

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {createCss} from './ToolsStyling'
import {extendIfUndefined} from './ToolsJs'

// TODO: remove environment - replace it with plugins
export function MultiSelectBuilder(environment, plugins) 
{
    const defaults = {containerClass: "dashboardcode-bsmultiselect"}

    let create = (element, options) => { 
        if (options && options.plugins)
            console.log("DashboarCode.BsMultiSelect: 'options.plugins' is depricated, use - MultiSelectBuilder(environment, plugins) instead");
        let configuration = {};
        let buildConfiguration;
        if (options instanceof Function) {
            buildConfiguration = options;
            options = null;
        } else {
            buildConfiguration = options?.buildConfiguration;
        }
        if (options){
            adjustLegacySettings(options);
        }
        configuration.css = createCss(defaults.css, options?.css);
        plugMergeSettings(plugins, configuration, defaults, options); // merge settings.cssPatch and defaults.cssPatch
        extendIfUndefined(configuration, options);
        extendIfUndefined(configuration, defaults);
        let onInit = buildConfiguration?.(element, configuration);
        let multiSelect = BsMultiSelect(element, environment, plugins, configuration, onInit); // onInit(api, aspects) - before load data
        return multiSelect;
    }
    plugDefaultConfig(plugins, defaults);
    return {create, defaultSettings: defaults}
}
