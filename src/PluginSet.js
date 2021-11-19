import {
    BsAppearanceBs4Plugin, BsAppearanceBs5Plugin, 
    
    CssPatchBs4Plugin, CssPatchBs5Plugin,
    BsAppearanceBs4CssPatchPlugin, BsAppearanceBs5CssPatchPlugin,
    
    SelectElementPlugin, 
    LabelForAttributePlugin, ValidationApiPlugin, 
    UpdateAppearancePlugin, 
    
    DisableComponentPlugin,
    FormResetPlugin, CreatePopperPlugin,  RtlPlugin,  PlaceholderPlugin, PlaceholderCssPatchPlugin, 
     OptionsApiPlugin, 
    JQueryMethodsPlugin, 
    SelectedOptionPlugin, FormRestoreOnBackwardPlugin, 
    DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin,
    ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin,
    
    FloatingLabelPlugin, FloatingLabelCssPatchBs5Plugin, 
    
    WarningCssPatchPlugin, WarningBs4Plugin, WarningBs5Plugin,

    PicksPlugin,

    HiddenOptionPlugin,
    /*HiddenOptionAltPlugin as HiddenOptionPlugin*/} from './plugins/index'

import {shallowClearClone} from './ToolsJs'


export let Bs4PluginSet = {BsAppearanceBs4Plugin, WarningBs4Plugin, CssPatchBs4Plugin, BsAppearanceBs4CssPatchPlugin }

export let Bs5PluginSet = {BsAppearanceBs5Plugin, WarningBs5Plugin, CssPatchBs5Plugin, BsAppearanceBs5CssPatchPlugin, FloatingLabelCssPatchBs5Plugin }

export let multiSelectPlugins = {SelectElementPlugin, 
    LabelForAttributePlugin, HiddenOptionPlugin, ValidationApiPlugin, 
    UpdateAppearancePlugin, 
    DisableComponentPlugin,
    FormResetPlugin, CreatePopperPlugin, WarningCssPatchPlugin, RtlPlugin,  PlaceholderPlugin, PlaceholderCssPatchPlugin, FloatingLabelPlugin,  OptionsApiPlugin, 
    JQueryMethodsPlugin, 
    SelectedOptionPlugin, FormRestoreOnBackwardPlugin, 
    DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin,
    ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin};

export let picksPlugins = {PicksPlugin, 
    LabelForAttributePlugin, ValidationApiPlugin, 
    UpdateAppearancePlugin, 
    DisableComponentPlugin, 
    CreatePopperPlugin, WarningCssPatchPlugin, RtlPlugin,  PlaceholderPlugin, PlaceholderCssPatchPlugin, FloatingLabelPlugin, OptionsApiPlugin, 
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