import  {EventBinder} from './ToolsDom';
import  {addStyling, toggleStyling} from './ToolsStyling';


export function PickDomFactoryPlugCss(css){
    css.pickContent = '';
    css.pickContent_disabled = 'disabled';
    css.pickButton = 'close';
}

export function PickDomFactoryPlugCssBs4(css){
    css.pickButton = 'close';
}

export function PickDomFactoryPlugCssBs5(css){
    css.pickButton = 'btn-close';
}

export function PickDomFactoryPlugCssPatch(cssPatch){
    cssPatch.pickContent_disabled = {opacity: '.65'};
}

export function PickDomFactoryPlugCssPatchBs4(cssPatch){
    cssPatch.pickButton = {float : "none", fontSize:'1.5em', lineHeight: '.9em', };
}


export function PickDomFactoryPlugCssPatchBs5(cssPatch){
    cssPatch.pickButton = {float : "none", fontSize:'0.8em', verticalAlign: "text-top"};
}

export function PickDomFactory(css, createElementAspect, optionPropertiesAspect, pickButtonAspect){
    return { 
        create(pickElement, wrap, remove){
            let buttonHTML = pickButtonAspect.getButtonHTML();
            createElementAspect.createElementFromHtml(pickElement, '<span></span>'+buttonHTML);
            let pickContentElement = pickElement.querySelector('SPAN');
            let pickButtonElement  = pickElement.querySelector('BUTTON');
            let eventBinder = EventBinder();
            eventBinder.bind(pickButtonElement, "click", remove);
            
            addStyling(pickContentElement, css.pickContent);
            addStyling(pickButtonElement, css.pickButton);
            let disableToggle = toggleStyling(pickContentElement, css.pickContent_disabled);

            function updateData(){
                pickContentElement.textContent = optionPropertiesAspect.getText(wrap.option); 
            }
            function updateDisabled(){
                disableToggle(wrap.isOptionDisabled)
            }

            return {
                pickDom:{
                    pickContentElement,
                    pickButtonElement,
                },
                pickDomManagerHandlers:{
                    updateData,
                    updateDisabled,
                },
                dispose(){
                    eventBinder.unbind();
                }
            }
        }
    }
}


