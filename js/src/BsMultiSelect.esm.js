import {Bs5Plugin} from './plugins/Bs5Plugin'
import {defaultPlugins} from './PluginSet'
import {shallowClearClone, ObjectValues} from './ToolsJs'
import {utilities} from './ToolSet'
import  {MultiSelectBuilder} from './MultiSelectBuilder'

function ModuleFactory(environment){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))
    let plugins = shallowClearClone({Bs5Plugin}, defaultPlugins);
    let pluginsArray = ObjectValues(plugins);
    
    let {create, defaultSettings} = MultiSelectBuilder(environment, pluginsArray) 
    create.Default = defaultSettings;
    
    return {
        BsMultiSelect: create,
        plugins,
        utilities  
    }
}

function legacyConstructor(element, environment, settings){
    console.log("DashboarCode.BsMultiSelect: 'BsMultiSelect' is depricated, use - ModuleFactory(environment).BsMultiSelect(element, settings)");
    var {BsMultiSelect} =  ModuleFactory(environment);
    var bsMultiSelect = BsMultiSelect(element, settings);
    return bsMultiSelect;
}

export  { 
    legacyConstructor as BsMultiSelect,
    ModuleFactory
}