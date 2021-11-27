import {multiSelectPlugins, picksPlugins, allPlugins} from './PluginSet'
import {shallowClearClone, ObjectValuesEx} from './ToolsJs'
import {utilities} from './ToolSet'
import {MultiSelectBuilder} from './MultiSelectBuilder'

export function ModuleFactory(environment, customizationPlugins, defaultCss){
    if (!environment.trigger)
        environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name))

    if (!environment.isIE11)
        environment.isIE11 = !!environment.window.MSInputMethodContext && !!environment.window.document.documentMode;

    let multiSelectPluginsObj = shallowClearClone(customizationPlugins, multiSelectPlugins);
    let pluginsArray = ObjectValuesEx(multiSelectPluginsObj);
    let {create: BsMultiSelect, BsMultiSelectDefault} = MultiSelectBuilder(environment, pluginsArray, defaultCss) 
    BsMultiSelect.Default = BsMultiSelectDefault;
    
    let picksPluginsObj = shallowClearClone(customizationPlugins, picksPlugins);
    let picksPluginsArray = ObjectValuesEx(picksPluginsObj);
    let {create: BsPicks, BsPicksDefault} = MultiSelectBuilder(environment, picksPluginsArray, defaultCss) 
    BsPicks.Default = BsPicksDefault; 

    return {
        BsMultiSelect,
        BsPicks,
        MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone(customizationPlugins, allPlugins), defaultCss, utilities} 
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

//     let pluginsArray = ObjectValues(shallowClearClone({Bs5Plugin}, multiSelectPlugins));
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
