import $ from 'jquery'
import Popper from 'popper.js'

import {addToJQueryPrototype} from './AddToJQueryPrototype'

import {defaultPlugins} from './PluginSet'
import {Bs5Plugin} from './plugins/Bs5Plugin'

import {composeSync} from './ToolsJs'
import  {EventBinder} from './ToolsDom'
import  {addStyling, toggleStyling} from './ToolsStyling'

import  {MultiSelectBuilder} from './MultiSelectBuilder'

(
    (window, $, createPopper) => {
        let trigger = (e, eventName) => $(e).trigger(eventName);
        defaultPlugins.unshift(Bs5Plugin);
        let {constructor, defaultOptions} = MultiSelectBuilder(defaultPlugins, window, createPopper, trigger);
        let prototypable = addToJQueryPrototype('BsMultiSelect', constructor, $);
        
        prototypable.defaults = defaultOptions;
        prototypable.tools = {EventBinder, addStyling, toggleStyling, composeSync, MultiSelectBuilder, defaultPlugins} 
    }
)(window, $, Popper)

