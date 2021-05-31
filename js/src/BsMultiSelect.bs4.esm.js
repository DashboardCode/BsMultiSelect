import {Bs4Plugin} from './plugins/Bs4Plugin'
import {defaultPlugins} from './PluginSet'
import {shallowClearClone, ObjectValues} from './ToolsJs'
import {utilities} from './ToolSet'
import  {MultiSelectBuilder} from './MultiSelectBuilder'

function ModuleFactory(environment){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))
    let plugins = shallowClearClone({Bs4Plugin}, defaultPlugins);

    let pluginsArray = ObjectValues(plugins);
    let {construct, defaultSettings} = MultiSelectBuilder(environment, pluginsArray) 
    construct.Default = defaultSettings;
    
    return {
        BsMultiSelect: construct,
        plugins,
        utilities  
    }
}

function legacyConstructor(element, environment, settings){
    console.log(`DashboarCode.BsMultiSelect: 'BsMultiSelect' is depricated, use - ModuleFactory(environment).BsMultiSelect(element, settings) `);
    var {BsMultiSelect} =  ModuleFactory(environment);
    var bsMultiSelect = BsMultiSelect(element, settings);
    return bsMultiSelect;
}

export  { 
    legacyConstructor as BsMultiSelect,
    ModuleFactory
}