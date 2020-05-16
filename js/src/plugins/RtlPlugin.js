import {getIsRtl, AttributeBackup} from '../ToolsDom';
import {isBoolean} from '../ToolsJs';

export function RtlPlugin(pluginData){
    let {configuration, staticContent} = pluginData;
    let {isRtl} = configuration;
    let forceRtlOnContainer = false; 
    if (isBoolean(isRtl))
        forceRtlOnContainer = true;
    else
        isRtl = getIsRtl(staticContent.staticDom.initialElement);
    
    var attributeBackup = AttributeBackup();
    if (forceRtlOnContainer){
        attributeBackup.set(staticContent.staticDom.containerElement, "dir", "rtl");
    }
    else if (staticContent.staticDom.selectElement){
        var dirAttributeValue = staticContent.staticDom.selectElement.getAttribute("dir");
        if (dirAttributeValue){
            attributeBackup.set(staticContent.staticDom.containerElement, "dir", dirAttributeValue);
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