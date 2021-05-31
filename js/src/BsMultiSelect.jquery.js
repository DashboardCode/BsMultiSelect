import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {defaultPlugins} from './PluginSet'
import {Bs5Plugin} from './plugins/Bs5Plugin'

import {composeSync, shallowClearClone, ObjectValues} from './ToolsJs'
import {utilities} from './ToolSet'

import  {MultiSelectBuilder} from './MultiSelectBuilder'
(
    (window, $, createPopper) => {
        let trigger = (e, eventName) => $(e).trigger(eventName);
        let plugins = shallowClearClone({Bs5Plugin}, defaultPlugins);
        let environment = {trigger, window, createPopper}
        let pluginsArray = ObjectValues(plugins)
        let {construct, defaultSettings} = MultiSelectBuilder(environment, pluginsArray);
        let constructor2 = (element, settings, removeInstanceData) => {let multiSelect = construct(element, settings); multiSelect.dispose = composeSync(multiSelect.dispose, removeInstanceData); return multiSelect;} 
        let prototypable = addToJQueryPrototype('BsMultiSelect', constructor2, $);
        
        prototypable.defaults = defaultSettings;
        prototypable.tools = {MultiSelectBuilder, plugins, utilities} 
    }
)(window, $, Popper)

