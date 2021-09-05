import {LabelForAttributePlugin} from './plugins/LabelForAttributePlugin'
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

import {CreatePopperPlugin} from './plugins/CreatePopperPlugin'

import {FloatingLabelPlugin} from './plugins/FloatingLabelPlugin'

import {ChoicesDynamicStylingPlugin} from './plugins/ChoicesDynamicStylingPlugin'

import {shallowClearClone} from './ToolsJs'

import {WarningPlugin} from './plugins/WarningPlugin'
import {HighlightPlugin} from './plugins/HighlightPlugin'

import {CustomChoiceStylingsPlugin} from './plugins/CustomChoiceStylingsPlugin'
import {CustomPickStylingsPlugin} from './plugins/CustomPickStylingsPlugin'

import {UpdateAppearancePlugin} from './plugins/UpdateAppearancePlugin'
import {DisableComponentPlugin} from './plugins/DisableComponentPlugin'

export let defaultPlugins = {CssPatchPlugin, SelectElementPlugin, 
    LabelForAttributePlugin, HiddenOptionPlugin, ValidationApiPlugin, 
    UpdateAppearancePlugin, BsAppearancePlugin, DisableComponentPlugin,
    FormResetPlugin, CreatePopperPlugin, WarningPlugin, RtlPlugin,  PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, 
    JQueryMethodsPlugin, 
    SelectedOptionPlugin, FormRestoreOnBackwardPlugin, 
    DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin,
    ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin};

export let picksPlugins = {CssPatchPlugin, PicksPlugin, 
    LabelForAttributePlugin, ValidationApiPlugin, 
    UpdateAppearancePlugin, BsAppearancePlugin, DisableComponentPlugin, 
    CreatePopperPlugin, WarningPlugin, RtlPlugin,  PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, 
    JQueryMethodsPlugin, PicksApiPlugin, HighlightPlugin,
    ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin};

export let allPlugins =  shallowClearClone(defaultPlugins, {PicksPlugin});


// var defaultConfig = {
//     plugins: defaultPlugins
// }

// var picksConfig = {
//     plugins: picksPlugins
// }

// export function createConfig(arg){
//     return config;
// }