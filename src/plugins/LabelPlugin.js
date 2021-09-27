import {defCall} from '../ToolsJs';

export function LabelPlugin(pluginData){
    let {configuration, staticDom, filterDom} = pluginData;
    let {containerClass, label} = configuration
    let getLabelElementAspect = () => defCall(label); 
    let labelPluginData = {getLabelElementAspect}; // overrided by BS Appearance Plugin
    pluginData.labelPluginData=labelPluginData;
    let createInputId = null;
    let {selectElement, containerElement} = staticDom;
    let {filterInputElement} = filterDom;
    if(selectElement)
        createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
    else
        createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;

    return {
        buildApi(){
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