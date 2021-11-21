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
        let settings;
        if (options instanceof Function) {
            buildConfiguration = options;
            settings = null;
        } else {
            buildConfiguration = options?.buildConfiguration;
            settings = options;
        }
        if (settings){
            adjustLegacySettings(settings);
        }
        let configuration = {};
        
        // TODO: move to each plugin that add css (as plugMergeSettings) 
        configuration.css = createCss(defaults.css, settings?.css);
        
        extendIfUndefined(configuration, settings);
        extendIfUndefined(configuration, defaults);
        var pluginManager = pluginManagerFactory(configuration, settings); // merge settings.cssPatch and defaults.cssPatch
        let onInit = buildConfiguration?.(element, configuration); 
        Object.freeze(configuration);
        let multiSelect = BsMultiSelect(element, environment, pluginManager, configuration, onInit); // onInit(api, aspects) - before load data
        return multiSelect;
    }
    
    return {create, defaultSettings: defaults}
}