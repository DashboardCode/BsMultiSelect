import { Bs4Plugin } from "./plugins/Bs4Plugin.js";
import { ModuleFactory as ModuleFactoryImpl } from "./ModuleFactory.js";

function ModuleFactory(environment) {
  return ModuleFactoryImpl(environment, {
    Bs4Plugin
  });
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