
import {defCall} from '../ToolsJs';

export function LabelPlugin(pluginData){
    let {configuration, containerClass, staticDom, staticPicks} = pluginData;
    let getLabelElementAspect = () => defCall(configuration.label); // overrided by BS Appearance Plugin
    let labelPluginData = {getLabelElementAspect};
    pluginData.labelPluginData=labelPluginData;
    let createInputId = null;
    let {selectElement, containerElement} = staticDom;
    let {filterInputElement} = staticPicks;
    if(selectElement)
        createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    else
        createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

    return {
        afterConstructor(){
            let labelElement = labelPluginData.getLabelElementAspect();
            let backupedForAttribute = null; // state saved between init and dispose
            if (labelElement) {
                backupedForAttribute = labelElement.getAttribute('for');
                var newId = createInputId();
                filterInputElement.setAttribute('id', newId);
                labelElement.setAttribute('for',newId);
            }
            if (backupedForAttribute)
                return () => labelElement.setAttribute('for',backupedForAttribute);
        }
    }
}