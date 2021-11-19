import {BsMultiSelect} from './BsMultiSelect'
import {ComposePluginManagerFactory} from './PluginManager'

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {extendIfUndefined} from './ToolsJs'

import {createCss} from './ToolsStyling'

// TODO: remove environment - replace it with plugins
export function MultiSelectBuilder(environment, plugins, defaultCss) 
{
    const defaults = {containerClass: "dashboardcode-bsmultiselect", css: defaultCss}

    var pluginManagerFactory = ComposePluginManagerFactory(plugins, defaults);

    let create = (element, options) => { 
        if (options && options.plugins)
            console.log("DashboarCode.BsMultiSelect: 'options.plugins' is depricated, use - MultiSelectBuilder(environment, plugins) instead");
        
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
        let configuration = {};
        
        // TODO: move to each plugin that add css (as plugMergeSettings) 
        configuration.css = createCss(defaults.css, options?.css);
        
        var pluginManager = pluginManagerFactory(configuration, options); // merge settings.cssPatch and defaults.cssPatch

        extendIfUndefined(configuration, options);
        extendIfUndefined(configuration, defaults);
        let onInit = buildConfiguration?.(element, configuration); // TODO: configuration should become an aspect
        let multiSelect = BsMultiSelect(element, environment, pluginManager, configuration, onInit); // onInit(api, aspects) - before load data
        return multiSelect;
    }
    
    return {create, defaultSettings: defaults}
}
