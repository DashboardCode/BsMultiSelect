import {defCall, composeSync} from '../ToolsJs';

export function LabelForAttributePlugin(defaults){
    defaults.label = null;
    return {
        plug
    }
}

export function plug(configuration){
    var getLabelAspect = {getLabel : ()=>defCall(configuration.label)}
    var createFilterInputElementIdAspect = {
        createFilterInputElementId : ()=>defCall(configuration.filterInputElementId),
    }; 
    return (aspects) => {
        aspects.getLabelAspect = getLabelAspect;
        aspects.createFilterInputElementIdAspect = createFilterInputElementIdAspect;
        return {
            layout: () => {
                var {filterDom, loadAspect, disposeAspect, staticDom} = aspects;

                loadAspect.load = composeSync(loadAspect.load, ()=>{
                    let {filterInputElement} = filterDom;

                    let labelElement =  getLabelAspect.getLabel(); 
                    if (labelElement){
                        let backupedForAttribute = labelElement.getAttribute('for');
                        var inputId = createFilterInputElementIdAspect.createFilterInputElementId();
                    
                        if (!inputId){
                            let {containerClass} = configuration;
                            let {containerElement} = staticDom;
                            inputId =`${containerClass}-generated-filter-${containerElement.id}` 
                        }
                        filterInputElement.setAttribute('id', inputId);
                        labelElement.setAttribute('for',inputId);
                        if (backupedForAttribute){
                            disposeAspect.dispose = composeSync(
                                disposeAspect.dispose, 
                                () =>labelElement.setAttribute('for', backupedForAttribute)
                            )
                        }
                    }
                })
            }
        }
    }
}