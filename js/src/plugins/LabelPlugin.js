
import {defCall} from '../ToolsJs';

export function LabelPlugin(pluginData){
    let {configuration, staticContent} = pluginData;
    let {label} = configuration;
    staticContent.getLabelElement = () => defCall(label); // overrided by BS Appearance Plugin

    let createInputId = null;
    let {selectElement, containerClass, containerElement} = staticContent;
    if(selectElement)
        createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    else
        createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

    return {
        afterConstructor(){
            let labelElement = staticContent.getLabelElement();
            let backupedForAttribute = null; // state saved between init and dispose
            if (labelElement) {
                backupedForAttribute = labelElement.getAttribute('for');
                var newId = createInputId();
                staticContent.filterInputElement.setAttribute('id', newId);
                labelElement.setAttribute('for',newId);
            }
            if (backupedForAttribute)
                return ()=> labelElement.setAttribute('for',backupedForAttribute);
        }
    }
}