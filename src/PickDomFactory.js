import  {addStyling} from './ToolsStyling';

// empty but can be usefull in custom development
export function PickDomFactoryPlugCss(css){
    css.pickContent = '';
}

export function PickDomFactory(css, createElementAspect, optionPropertiesAspect){
    return { 
        create(pickElement, wrap){
            let pickContentElement = createElementAspect.createElement('SPAN');
            pickElement.appendChild(pickContentElement);
            
            addStyling(pickContentElement, css.pickContent);
            
            function updateData(){
                pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option); 
            }

            return {
                pickDom:{
                    pickContentElement
                },
                pickDomManagerHandlers:{
                    updateData
                },
                dispose(){ // empty but usefull for plugins
                }
            }
        }
    }
}