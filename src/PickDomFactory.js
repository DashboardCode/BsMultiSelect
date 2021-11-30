import  {addStyling, toggleStyling} from './ToolsStyling';

export function PickDomFactoryPlugCss(css){
    css.pickContent = '';
    css.pickContent_disabled = 'disabled';
}

export function PickDomFactoryPlugCssPatch(cssPatch){
    cssPatch.pickContent_disabled = {opacity: '.65'};
}

export function PickDomFactory(css, createElementAspect, optionPropertiesAspect){
    return { 
        create(pickElement, wrap, remove){
            let pickContentElement = createElementAspect.createElement('SPAN');
            pickElement.appendChild(pickContentElement);
            
            addStyling(pickContentElement, css.pickContent);
            
            let disableToggle = toggleStyling(pickContentElement, css.pickContent_disabled);

            function updateData(){
                pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option); 
            }
            function updateDisabled(){
                disableToggle(wrap.isOptionDisabled)
            }

            return {
                pickDom:{
                    pickContentElement
                },
                pickDomManagerHandlers:{
                    updateData,
                    updateDisabled,
                },
                dispose(){
                }
            }
        }
    }
}