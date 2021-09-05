import Popper from '@popperjs/core'

import {createForJQuery} from './CreateForJQuery'

import {defaultPlugins, picksPlugins, allPlugins} from './PluginSet'
import {Bs5Plugin} from './plugins/Bs5Plugin'

import {MultiSelectBuilder} from './MultiSelectBuilder'
import {utilities} from './ToolSet'

import {shallowClearClone} from './ToolsJs'

const BsMultiSelect = (
    (window, jQuery, globalPopper) => {
         return createForJQuery(window, jQuery, globalPopper, 'BsMultiSelect', defaultPlugins, Bs5Plugin)
    }
)(window, window.jQuery, Popper)

const BsPicks = (
    (window, jQuery, globalPopper) => {
         return createForJQuery(window, jQuery, globalPopper, 'BsPicks', picksPlugins, Bs5Plugin)
    }
)(window, window.jQuery, Popper)

export default { BsMultiSelect, BsPicks, 
    MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone({Bs5Plugin}, allPlugins), utilities}
}