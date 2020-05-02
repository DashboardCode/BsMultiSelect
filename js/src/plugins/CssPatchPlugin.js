import {createCss, extendCss} from '../ToolsStyling';
import {isBoolean} from '../ToolsJs';
import {cssPatch} from '../BsCss'

export function CssPatchPlugin(){
}

CssPatchPlugin.setDefaults = (defaults)=>{
    defaults.useCssPatch = true;
    defaults.cssPatch = cssPatch;
}

CssPatchPlugin.mergeDefaults = (configuration, defaults, settings)=>{
    if (isBoolean(settings.cssPatch))
        throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'") // often type of error
    var defCssPatch = createCss(defaults.cssPatch, settings.cssPatch); // replace classes, merge styles
    configuration.cssPatch = defCssPatch;
}

CssPatchPlugin.buildedConfiguration = (configuration) =>{
    if (configuration.useCssPatch)
        extendCss(configuration.css, configuration.cssPatch); 
}