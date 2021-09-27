import {CssPatchPlugin, SelectElementPlugin, 
    LabelForAttributePlugin, ValidationApiPlugin, 
    UpdateAppearancePlugin, BsAppearancePlugin, DisableComponentPlugin,
    FormResetPlugin, CreatePopperPlugin, WarningPlugin, RtlPlugin,  PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, 
    JQueryMethodsPlugin, 
    SelectedOptionPlugin, FormRestoreOnBackwardPlugin, 
    DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin,
    ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin,
    
    PicksPlugin,

    HiddenOptionPlugin,
    /*HiddenOptionAltPlugin as HiddenOptionPlugin*/} from './plugins/index'

import {shallowClearClone} from './ToolsJs'

export let multiSelectPlugins = {CssPatchPlugin, SelectElementPlugin, 
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

export let allPlugins =  shallowClearClone(multiSelectPlugins, {PicksPlugin});




// var defaultConfig = {
//     plugins: multiSelectPlugins
// }

// var picksConfig = {
//     plugins: picksPlugins
// }

// export function createConfig(arg){
//     return config;
// }