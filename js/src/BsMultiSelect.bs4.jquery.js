import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {defaultPlugins} from './PluginSet'
import {Bs4Plugin} from './plugins/Bs4Plugin'

import {composeSync, shallowClearClone, ObjectValues, isString} from './ToolsJs'
import {composeEventTrigger} from './ToolsDom'

import {MultiSelectBuilder} from './MultiSelectBuilder'
import {utilities} from './ToolSet'

const BsMultiSelect = (
    (window, $, createPopper) => {
        let trigger = null;
        let isJQyery = $ && !window.document.body.hasAttribute('data-bs-no-jquery');
        if (isJQyery) {
            trigger = (e, eventName) => $(e).trigger(eventName);
        } else {
            trigger = composeEventTrigger(window);
        }
        let plugins = shallowClearClone({Bs4Plugin}, defaultPlugins);
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
            let prototypable = addToJQueryPrototype('BsMultiSelect', constructorForJquery, $);
        
            prototypable.defaults = defaultSettings;
            prototypable.tools = {MultiSelectBuilder, plugins, utilities} 
        }
        return createForUmd;    
    }
)(window, $, Popper)
export default {BsMultiSelect}