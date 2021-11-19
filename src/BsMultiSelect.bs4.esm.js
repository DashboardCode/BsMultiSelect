import { createDefaultCssBs4 } from './DomFactories'
import { Bs4PluginSet } from './PluginSet'
import { ModuleFactory as ModuleFactoryImpl } from "./ModuleFactory"

const defaultCss = createDefaultCssBs4();

function ModuleFactory(environment){
    return ModuleFactoryImpl(environment, Bs4PluginSet, defaultCss);
} 

function legacyConstructor(element, environment, settings){
    console.log("DashboarCode.BsMultiSelect: 'BsMultiSelect' is depricated, use - ModuleFactory(environment).BsMultiSelect(element, settings)");
    var {BsMultiSelect} =  ModuleFactory(environment);
    var bsMultiSelect = BsMultiSelect(element, settings);
    return bsMultiSelect;
}

export  { 
    legacyConstructor as BsMultiSelect,
    ModuleFactory
}