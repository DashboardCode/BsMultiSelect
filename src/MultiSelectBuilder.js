import {BsMultiSelect} from './BsMultiSelect'
import {ComposePluginManagerFactory} from './PluginManager'

import {adjustLegacySettings} from './BsMultiSelectDepricatedParameters'

import {extendIfUndefined} from './ToolsJs'

import {createCss} from './ToolsStyling'

// TODO: remove environment - replace it with plugins
// TODO: defaultCss should come together with DomFactories and Layout 
export function MultiSelectBuilder(environment, plugins, defaultCss) 
{
    const defaults = {containerClass: "dashboardcode-bsmultiselect", css: defaultCss}
    
    var pluginManagerFactory = ComposePluginManagerFactory(plugins, defaults, environment);

    /*  NOTE: about namings
        defaults - defaults for module 
        setting - object that could modify defaults (not just overwrite)
        options - configuration "generalization": can be buildConfiguration function or settings
        configuration - for control instance
    */
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
        
        configuration.css = createCss(defaults.css, settings?.css);
        
        extendIfUndefined(configuration, settings);
        // next line: merging of cssPatch will be delayed to the CssPatchPlugin merge handler
        extendIfUndefined(configuration, defaults); 
        let inlineBuildAspectsList = buildConfiguration?.(element, configuration); 
        // next line merges settings.cssPatch and defaults.cssPatch also merge defaults.css and defaults.cssPatch 
        var pluginManager = pluginManagerFactory(configuration, settings, inlineBuildAspectsList); 
        // now we can freeze configuration object
        Object.freeze(configuration);
        let multiSelect = BsMultiSelect(element, environment, pluginManager, configuration); 
        return multiSelect;
    }
    
    return {create, defaultSettings: defaults}
}