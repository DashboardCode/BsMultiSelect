import { Bs5Plugin } from "./plugins/Bs5Plugin.js";
import { Bs4Plugin } from "./plugins/Bs4Plugin.js";

//import { multiSelectPlugins, picksPlugins} from "./PluginSet.js";
import { shallowClearClone, ObjectValues } from "./ToolsJs.js";

import { composeSync } from "./ToolsJs.js";
import { EventBinder } from "./ToolsDom.js";
import { addStyling, toggleStyling } from "./ToolsStyling.js";

import { MultiSelectBuilder } from "./MultiSelectBuilder.js";
import { BsMultiSelect, ModuleFactory } from "./BsMultiSelect.esm.js";

import { CssPatchPlugin, SelectElementPlugin, LabelForAttributePlugin, ValidationApiPlugin, UpdateAppearancePlugin, BsAppearancePlugin, DisableComponentPlugin, 
    FormResetPlugin, CreatePopperPlugin, WarningPlugin, RtlPlugin, PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, JQueryMethodsPlugin, SelectedOptionPlugin, 
    FormRestoreOnBackwardPlugin, DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin, ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin, 
    PicksPlugin, HiddenOptionPlugin, HiddenOptionAltPlugin
    } from "./plugins/index.js";

export { 
    Bs5Plugin, Bs4Plugin, 
    
    CssPatchPlugin, 
    SelectElementPlugin, PicksPlugin,
    
    LabelForAttributePlugin, ValidationApiPlugin, UpdateAppearancePlugin, BsAppearancePlugin, DisableComponentPlugin, 
    FormResetPlugin, CreatePopperPlugin, WarningPlugin, RtlPlugin, PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, JQueryMethodsPlugin, SelectedOptionPlugin, 
    FormRestoreOnBackwardPlugin, DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin, ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin, 
    
    HiddenOptionPlugin, HiddenOptionAltPlugin,

    shallowClearClone, ObjectValues, composeSync, EventBinder, addStyling, toggleStyling,
    MultiSelectBuilder, BsMultiSelect, ModuleFactory };