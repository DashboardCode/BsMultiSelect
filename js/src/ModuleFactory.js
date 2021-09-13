import {defaultPlugins, picksPlugins, allPlugins} from './PluginSet'
import {shallowClearClone, ObjectValues} from './ToolsJs'
import {utilities} from './ToolSet'
import {MultiSelectBuilder} from './MultiSelectBuilder'

export function ModuleFactory(environment, customizationPlugins){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    let pluginsArray = ObjectValues(shallowClearClone(customizationPlugins, defaultPlugins));
    let {create: BsMultiSelect, BsMultiSelectDefault} = MultiSelectBuilder(environment, pluginsArray) 
    BsMultiSelect.Default = BsMultiSelectDefault;
    
    let picksPluginsArray = ObjectValues(shallowClearClone(customizationPlugins, picksPlugins));
    let {create: BsPicks, BsPicksDefault} = MultiSelectBuilder(environment, picksPluginsArray) 
    BsPicks.Default = BsPicksDefault; 

    return {
        BsMultiSelect,
        BsPicks,
        MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone(customizationPlugins, allPlugins), utilities} 
    }
}

// TEST
// function areValidElements(...args) {
//     const result = Object.values(obj);
//     return !args.some(
//       (element) =>
//         !(element && typeof element.getBoundingClientRect === 'function')
//     );
// }

// function ModuleFactory(environment) {
//     if (!environment.trigger)
//         environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

//     let pluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, defaultPlugins));
//     let {create: BsMultiSelect, BsMultiSelectDefault} = MultiSelectBuilder(environment, pluginsArray) 
//     BsMultiSelect.Default = BsMultiSelectDefault;
    
//     let picksPluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, picksPlugins));
//     let {create: BsPicks, BsPicksDefault} = MultiSelectBuilder(environment, picksPluginsArray) 
//     BsPicks.Default = BsPicksDefault;

//     return {
//         BsMultiSelect,
//         BsPicks,
//         MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone({Bs5Plugin}, allPlugins), utilities} 
//     }
// }
