import {LabelPlugin} from './plugins/LabelPlugin'
import {RtlPlugin} from './plugins/RtlPlugin'
import {FormResetPlugin} from './plugins/FormResetPlugin'
import {ValidationApiPlugin} from './plugins/ValidationApiPlugin'
import {BsAppearancePlugin} from './plugins/BsAppearancePlugin'

import {HiddenOptionPlugin} from './plugins/HiddenOptionPlugin'
//import {HiddenOptionPlugin} from './plugins/HiddenOptionAltPlugin'

import {CssPatchPlugin} from './plugins/CssPatchPlugin'
import {PlaceholderPlugin} from './plugins/PlaceholderPlugin'
import {JQueryMethodsPlugin} from './plugins/JQueryMethodsPlugin'
import {OptionsApiPlugin} from './plugins/OptionsApiPlugin'
import {FormRestoreOnBackwardPlugin} from './plugins/FormRestoreOnBackwardPlugin'
import {SelectElementPlugin} from './plugins/SelectElementPlugin'
import {SelectedOptionPlugin} from './plugins/SelectedOptionPlugin'
import {DisabledOptionPlugin} from './plugins/DisabledOptionPlugin'
import {PicksApiPlugin} from './plugins/PicksApiPlugin'
import {PicksPlugin} from './plugins/PicksPlugin'

import {PopperPlugin} from './plugins/PopperPlugin'

import {FloatingLabelPlugin} from './plugins/FloatingLabelPlugin'


export let defaultPlugins = {CssPatchPlugin, SelectElementPlugin, LabelPlugin, HiddenOptionPlugin, ValidationApiPlugin, 
    BsAppearancePlugin, FormResetPlugin, PopperPlugin, RtlPlugin,  PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, 
    JQueryMethodsPlugin, SelectedOptionPlugin, FormRestoreOnBackwardPlugin, DisabledOptionPlugin, PicksApiPlugin};

export let ajaxPlugins = {CssPatchPlugin, PicksPlugin, LabelPlugin, ValidationApiPlugin, 
    BsAppearancePlugin, PopperPlugin, RtlPlugin,  PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, 
    JQueryMethodsPlugin, PicksApiPlugin};