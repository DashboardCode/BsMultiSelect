
import {defCall} from '../ToolsJs';

export function LabelPlugin(pluginData){
    let {configuration, staticContent} = pluginData;
    let {label} = configuration;
    staticContent.getLabelElement = () => defCall(label);

    return {
        afterConstructor(){
            let labelElement = staticContent.getLabelElement();
            let backupedForAttribute = null; // state saved between init and dispose
            if (labelElement) {
                backupedForAttribute = labelElement.getAttribute('for');
                var newId = staticContent.createInputId();
                staticContent.filterInputElement.setAttribute('id', newId);
                labelElement.setAttribute('for',newId);
            }
            if (backupedForAttribute)
                return ()=> labelElement.setAttribute('for',backupedForAttribute);
        }
    }
}