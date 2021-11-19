import {defCall, composeSync} from '../ToolsJs';

export function LabelForAttributePlugin(defaults){
    defaults.label = null;
    return {
        buildAspects: (aspects, configuration) => {
            return {
	            plugStaticDom: ()=> {
                    aspects.labelAspect = LabelAspect(configuration);
                    aspects.labelNewIdAspect = LabelNewIdAspect(aspects); // ?
        	    },
                layout: () => {
                    var {filterDom, labelAspect, loadAspect, labelNewIdAspect, disposeAspect} = aspects;
    
                    // TODO: move to 
                    console.log("LabelForAttributePlugin, labelNewIdAspect");
                    
                    var labelForAttributeAspect = LabelForAttributeAspect(filterDom, labelAspect, labelNewIdAspect, disposeAspect);
                    aspects.labelForAttributeAspect=labelForAttributeAspect;
                    
                    loadAspect.load = composeSync(loadAspect.load, ()=>labelForAttributeAspect.update())
                }
            }
        }
    }
}

function LabelAspect(configuration){
    return {
        getLabel(){
            return defCall(configuration.label); 
        }
    }
}

// TODO migrate to configuration
function LabelNewIdAspect(aspects){
    return {
        createInputId(){
            let {configuration, staticDom}=aspects;
            let {containerClass} = configuration;
            let {containerElement} = staticDom;
        
            let a =`${containerClass}-generated-filter-${containerElement.id}` 
            console.log('LabelNewIdAspect - ' + a);
            return a; 
            //`${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
        }
    }
}

function LabelForAttributeAspect(filterDom, labelAspect, labelNewIdAspect, disposeAspect){
    return{
        update(){  
            //let createInputId = null;
            //let {selectElement, containerElement} = staticDom;
            let {filterInputElement} = filterDom;

            // if (selectElement)
            //     createInputId = () => `${containerClass}-generated-input-${((selectElement.id)?selectElement.id:selectElement.name).toLowerCase()}-id`;
            // else
            //     createInputId = () => `${containerClass}-generated-filter-${containerElement.id}`;
            
            let labelElement =  labelAspect.getLabel(); //getLabelElementAspect.getLabelElement();
            console.log("LabelForAttributeAspect - " );
            if (labelElement) {
                console.log("LabelForAttributeAspect + " );
                let backupedForAttribute = labelElement.getAttribute('for');
                var newId = labelNewIdAspect.createInputId();
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