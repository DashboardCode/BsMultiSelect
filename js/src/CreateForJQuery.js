import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {composeSync, shallowClearClone, ObjectValues, isString} from './ToolsJs'
import {composeEventTrigger} from './ToolsDom'

import {MultiSelectBuilder} from './MultiSelectBuilder'

export function createForJQuery(window, $,  createPopper, name, pluginsSet, stylePlugin){
    let trigger = null;
    let isJQyery = $ && !window.document.body.hasAttribute('data-bs-no-jquery');
    if (isJQyery) {
        trigger = (e, eventName) => $(e).trigger(eventName);
    } else {
        trigger = composeEventTrigger(window);
    }
    let plugins = shallowClearClone({stylePlugin}, pluginsSet);

    let environment = {trigger, window, createPopper}
    let pluginsArray = ObjectValues(plugins)
    let {create, defaultSettings} = MultiSelectBuilder(environment, pluginsArray);
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
