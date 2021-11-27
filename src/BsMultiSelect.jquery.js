import Popper from '@popperjs/core'

import {createForJQuery} from './CreateForJQuery'

import {Bs5PluginSet, multiSelectPlugins, picksPlugins, allPlugins} from './PluginSet'
import {createDefaultCssBs5} from './DomFactories'

import {MultiSelectBuilder} from './MultiSelectBuilder'
import {utilities} from './ToolSet'

import {shallowClearClone} from './ToolsJs'

const defaultCss = createDefaultCssBs5();

const BsMultiSelect = (
    (window, jQuery, globalPopper) => {
        let plugins = shallowClearClone(Bs5PluginSet, multiSelectPlugins);
        return createForJQuery(window, jQuery, globalPopper, 'BsMultiSelect', plugins, defaultCss)
    }
)(window, window.jQuery, Popper)

const BsPicks = (
    (window, jQuery, globalPopper) => {
        let plugins = shallowClearClone(Bs5PluginSet, picksPlugins);
        return createForJQuery(window, jQuery, globalPopper, 'BsPicks', plugins, defaultCss)
    }
)(window, window.jQuery, Popper)

export default { BsMultiSelect, BsPicks, 
    MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone(Bs5PluginSet, allPlugins), defaultCss, utilities}
}