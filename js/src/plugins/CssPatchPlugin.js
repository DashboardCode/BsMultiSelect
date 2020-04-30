//import {createCss, extendCss} from './ToolsStyling';
import {cssPatch} from '../BsCss'

export function CssPatchPlugin(){
    // configuration, defaults
    // let cfgCssPatch = configuration.cssPatch;
    // configuration.cssPatch = null;
    // if (defaults.cssPatch instanceof Boolean || typeof defaults.cssPatch ==="boolean" 
    //     || cfgCssPatch instanceof Boolean || typeof cfgCssPatch==="boolean" 
    // )
    //     throw new Error("BsMultiSelect: 'cssPatch' was used instead of 'useCssPatch'") // often type of error
    // var defCssPatch = createCss(defaults.cssPatch, cfgCssPatch); // replace classes, merge styles
    // configuration.cssPatch = defCssPatch;
    return {
    //     onBuildConfiguration(){
    //         let {css, cssPatch, useCssPatch} = configuration;
        
    //         if (useCssPatch) {
    //             extendCss(css, cssPatch); 
    //         }
    //     },
    //     onStaticContent(staticContent){
    //          staticContent.useCssPatch=useCssPatch;
    //     }
    }
}

CssPatchPlugin.setDefaults = (defaults)=>{
    defaults.cssPatch = cssPatch;
}