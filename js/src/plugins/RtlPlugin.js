import {getIsRtl, AttributeBackup} from '../ToolsDom';
import {isBoolean} from '../ToolsJs';

export function RtlPlugin(pluginData){
    let {configuration, staticContent, staticDom} = pluginData;
    let {isRtl} = configuration;
    let forceRtlOnContainer = false; 
    if (isBoolean(isRtl))
        forceRtlOnContainer = true;
    else
        isRtl = getIsRtl(staticDom.initialElement);
    
    var attributeBackup = AttributeBackup();
    if (forceRtlOnContainer){
        attributeBackup.set(staticDom.containerElement, "dir", "rtl");
    }
    else if (staticDom.selectElement){
        var dirAttributeValue = staticDom.selectElement.getAttribute("dir");
        if (dirAttributeValue){
            attributeBackup.set(staticDom.containerElement, "dir", dirAttributeValue);
        }
    } 
    if (isRtl)
        staticContent.popperConfiguration.placement = 'bottom-end';
    return {
        dispose(){
            attributeBackup.restore;
        }
    }
}
