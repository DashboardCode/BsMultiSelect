import $ from 'jquery'
import Popper from 'popper.js'

import {createForJQuery} from './CreateForJQuery'

import {multiSelectPlugins, picksPlugins, allPlugins} from './PluginSet'
import {Bs4Plugin} from './plugins/Bs4Plugin'

import {MultiSelectBuilder} from './MultiSelectBuilder'
import {utilities} from './ToolSet'

import {shallowClearClone} from './ToolsJs'

const BsMultiSelect = (
    (window, jQuery, createPopper) => {
         return createForJQuery(window, jQuery, createPopper, 'BsMultiSelect', multiSelectPlugins, Bs4Plugin)
    }
)(window, $, Popper)

const BsPicks = (
    (window, jQuery, createPopper) => {
         return createForJQuery(window, jQuery, createPopper, 'BsPicks', picksPlugins, Bs4Plugin)
    }
)(window, $, Popper)

export default {BsMultiSelect, BsPicks , MultiSelectTools: {MultiSelectBuilder, plugins: shallowClearClone({Bs4Plugin}, allPlugins), utilities} }