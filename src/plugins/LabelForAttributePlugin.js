import {defCall, composeSync} from '../ToolsJs';

export function LabelForAttributePlugin(aspects){
    var {staticDom, filterDom, getLabelElementAspect, configuration, loadAspect, disposeAspect} = aspects;
    var {containerClass} = configuration;
                                                          
    var labelForAttributeAspect = LabelForAttributeAspect(staticDom, filterDom, containerClass, getLabelElementAspect, disposeAspect);
    aspects.labelForAttributeAspect=labelForAttributeAspect;
    loadAspect.load = composeSync(loadAspect.load, ()=>labelForAttributeAspect.update())
}

LabelForAttributePlugin.plugDefaultConfig = (defaults)=>{
    defaults.label = null;
}

LabelForAttributePlugin.plugStaticDom = (aspects) => {
    aspects.getLabelElementAspect = GetLabelElementAspect(aspects.configuration.label);
}

function GetLabelElementAspect(label){
    return{
        getLabelElement(){  // overrided by BS Appearance Plugin
            defCall(label);
        } 
    }
}

function LabelForAttributeAspect(staticDom, filterDom, containerClass, getLabelElementAspect, disposeAspect){
    return{
        update(){  
            let createInputId = null;
            let {selectElement, containerElement} = staticDom;
            let {filterInputElement} = filterDom;
            if(selectElement)
                createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
            else
                createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;
            
            let labelElement = getLabelElementAspect.getLabelElement();
            
            if (labelElement) {
                let backupedForAttribute = labelElement.getAttribute('for');
                var newId = createInputId();
                filterInputElement.setAttribute('id', newId);
                labelElement.setAttribute('for',newId);
                if (backupedForAttribute){
                    disposeAspect.dispose = composeSync(
                        disposeAspect.dispose, 
                        () =>labelElement.setAttribute('for',backupedForAttribute)
                    )
                }
            }
        } 
    }
}