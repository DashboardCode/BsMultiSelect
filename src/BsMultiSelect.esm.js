import { Bs5Plugin} from "./plugins/Bs5Plugin";
import { ModuleFactory as ModuleFactoryImpl } from "./ModuleFactory";

function ModuleFactory(environment){
    return ModuleFactoryImpl(environment, { Bs5Plugin } );
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