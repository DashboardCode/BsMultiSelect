import $ from 'jquery'
import Popper from 'popper.js'

import {createForJQuery} from './CreateForJQuery'

import { Bs4PluginSet, multiSelectPlugins, picksPlugins, allPlugins} from './PluginSet'
import {createDefaultCssBs4} from './DomFactories'


import {MultiSelectBuilder} from './MultiSelectBuilder'
import {utilities} from './ToolSet'

import {shallowClearClone} from './ToolsJs'

const defaultCss = createDefaultCssBs4();

const BsMultiSelect = (
    (window, jQuery, createPopper) => {
        let plugins = shallowClearClone(Bs4PluginSet, multiSelectPlugins);
        return createForJQuery(window, jQuery, createPopper, 'BsMultiSelect', plugins, defaultCss )
    }
)(window, $, Popper)

const BsPicks = (
    (window, jQuery, createPopper) => {
        let plugins = shallowClearClone(Bs4PluginSet, picksPlugins);
        return createForJQuery(window, jQuery, createPopper, 'BsPicks', plugins, defaultCss)
    }
)(window, $, Popper)

export default {BsMultiSelect, BsPicks , MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone(Bs4PluginSet, allPlugins), defaultCss, utilities} }