import {Bs5Plugin} from './plugins/Bs5Plugin'
import {defaultPlugins, picksPlugins, allPlugins} from './PluginSet'
import {shallowClearClone, ObjectValues} from './ToolsJs'
import {utilities} from './ToolSet'
import {MultiSelectBuilder} from './MultiSelectBuilder'

function ModuleFactory(environment){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    let pluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, defaultPlugins));
    let {create: BsMultiSelect, BsMultiSelectDefault} = MultiSelectBuilder(environment, pluginsArray) 
    BsMultiSelect.Default = BsMultiSelectDefault;
    
    let picksPluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, picksPlugins));
    let {create: BsPicks, BsPicksDefault} = MultiSelectBuilder(environment, picksPluginsArray) 
    BsPicks.Default = BsPicksDefault;

    return {
        BsMultiSelect,
        BsPicks,
        MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone({Bs5Plugin}, allPlugins), utilities} 
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