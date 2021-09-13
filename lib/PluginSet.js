import { CssPatchPlugin, SelectElementPlugin, LabelForAttributePlugin, ValidationApiPlugin, UpdateAppearancePlugin, BsAppearancePlugin, DisableComponentPlugin, FormResetPlugin, CreatePopperPlugin, WarningPlugin, RtlPlugin, PlaceholderPlugin, FloatingLabelPlugin, OptionsApiPlugin, JQueryMethodsPlugin, SelectedOptionPlugin, FormRestoreOnBackwardPlugin, DisabledOptionPlugin, PicksApiPlugin, HighlightPlugin, ChoicesDynamicStylingPlugin, CustomPickStylingsPlugin, CustomChoiceStylingsPlugin, PicksPlugin, HiddenOptionPlugin
/*HiddenOptionAltPlugin as HiddenOptionPlugin*/
} from "./plugins/index.js";
import { shallowClearClone } from "./ToolsJs.js";
export let defaultPlugins = {
  CssPatchPlugin,
  SelectElementPlugin,
  LabelForAttributePlugin,
  HiddenOptionPlugin,
  ValidationApiPlugin,
  UpdateAppearancePlugin,
  BsAppearancePlugin,
  DisableComponentPlugin,
  FormResetPlugin,
  CreatePopperPlugin,
  WarningPlugin,
  RtlPlugin,
  PlaceholderPlugin,
  FloatingLabelPlugin,
  OptionsApiPlugin,
  JQueryMethodsPlugin,
  SelectedOptionPlugin,
  FormRestoreOnBackwardPlugin,
  DisabledOptionPlugin,
  PicksApiPlugin,
  HighlightPlugin,
  ChoicesDynamicStylingPlugin,
  CustomPickStylingsPlugin,
  CustomChoiceStylingsPlugin
};
export let picksPlugins = {
  CssPatchPlugin,
  PicksPlugin,
  LabelForAttributePlugin,
  ValidationApiPlugin,
  UpdateAppearancePlugin,
  BsAppearancePlugin,
  DisableComponentPlugin,
  CreatePopperPlugin,
  WarningPlugin,
  RtlPlugin,
  PlaceholderPlugin,
  FloatingLabelPlugin,
  OptionsApiPlugin,
  JQueryMethodsPlugin,
  PicksApiPlugin,
  HighlightPlugin,
  ChoicesDynamicStylingPlugin,
  CustomPickStylingsPlugin,
  CustomChoiceStylingsPlugin
};
export let allPlugins = /*#__PURE__*/shallowClearClone(defaultPlugins, {
  PicksPlugin
}); // var defaultConfig = {
//     plugins: defaultPlugins
// }
// var picksConfig = {
//     plugins: picksPlugins
// }
// export function createConfig(arg){
//     return config;
// }