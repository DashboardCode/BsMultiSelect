import { Bs4Plugin } from "./plugins/Bs4Plugin.js";
import { defaultPlugins, picksPlugins, allPlugins } from "./PluginSet.js";
import { shallowClearClone, ObjectValues } from "./ToolsJs.js";
import { utilities } from "./ToolSet.js";
import { MultiSelectBuilder } from "./MultiSelectBuilder.js";

function ModuleFactory(environment) {
  if (!environment.trigger) environment.trigger = (e, name) => e.dispatchEvent(new environment.window.Event(name));
  let pluginsArray = ObjectValues(shallowClearClone({
    Bs4Plugin
  }, defaultPlugins));
  let {
    create: BsMultiSelect,
    BsMultiSelectDefault
  } = MultiSelectBuilder(environment, pluginsArray);
  BsMultiSelect.Default = BsMultiSelectDefault;
  let picksPluginsArray = ObjectValues(shallowClearClone({
    Bs4Plugin
  }, picksPlugins));
  let {
    create: BsPicks,
    BsPicksDefault
  } = MultiSelectBuilder(environment, picksPluginsArray);
  BsPicks.Default = BsPicksDefault;
  return {
    BsMultiSelect,
    BsPicks,
    MultiSelectTools: {
      MultiSelectBuilder,
      plugins: shallowClearClone({
        Bs4Plugin
      }, allPlugins),
      utilities
    }
  };
}

function legacyConstructor(element, environment, settings) {
  console.log("DashboarCode.BsMultiSelect: 'BsMultiSelect' is depricated, use - ModuleFactory(environment).BsMultiSelect(element, settings)");
  var {
    BsMultiSelect
  } = ModuleFactory(environment);
  var bsMultiSelect = BsMultiSelect(element, settings);
  return bsMultiSelect;
}

export { legacyConstructor as BsMultiSelect, ModuleFactory };