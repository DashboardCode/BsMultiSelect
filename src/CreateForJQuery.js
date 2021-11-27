import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {composeSync, ObjectValuesEx, isString} from './ToolsJs'
import {composeEventTrigger} from './ToolsDom'

import {MultiSelectBuilder} from './MultiSelectBuilder'

export function createForJQuery(window, $,  globalPopper, name, plugins, defaultCss){
    let trigger = null;
    let isJQyery = $ && !window.document.body.hasAttribute('data-bs-no-jquery');
    if (isJQyery) {
        trigger = (e, eventName) => $(e).trigger(eventName);
    } else {
        trigger = composeEventTrigger(window);
    }

    var isIE11 = !!window.MSInputMethodContext && !!window.document.documentMode;

    let environment = {trigger, window, globalPopper, isIE11}
    let pluginsArray = ObjectValuesEx(plugins)
    let {create, defaultSettings} = MultiSelectBuilder(environment, pluginsArray, defaultCss);
    let createForUmd = (element, settings) => {
        if (isString(element))
            element = window.document.querySelector(element);
        return create(element, settings);
    }
    createForUmd.Default = defaultSettings;

    if (isJQyery) {
        let constructorForJquery = (element, settings, removeInstanceData) => {let multiSelect = create(element, settings); multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData); return multiSelect;} 
        let prototypable = addToJQueryPrototype(name, constructorForJquery, $);
    
        prototypable.defaults = defaultSettings;
    }
    return createForUmd;   
}
