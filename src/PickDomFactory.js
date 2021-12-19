import {composeSync} from './ToolsJs';
import {addStyling} from './ToolsStyling';

// empty but can be usefull in custom development
export function PickDomFactoryPlugCss(css){
    css.pickContent = '';
}

export function PickDomFactory(css, createElementAspect, dataWrap){ 
    return { 
        create(pick){
            let wrap = pick.wrap;
            let {pickDom, pickDomManagerHandlers} = pick;
            let pickElement = pickDom.pickElement;
            
            let pickContentElement = createElementAspect.createElement('SPAN');

            pickElement.appendChild(pickContentElement);
            pickDom.pickContentElement=pickContentElement;
            pickDomManagerHandlers.updateData = () => {
                // this is not a generic because there could be more then one text field.
                pickContentElement.textContent = dataWrap.getText(wrap.option); 
            }
            addStyling(pickContentElement, css.pickContent);
            pick.dispose=composeSync(pick.dispose, ()=>{
                pickDom.pickContentElement=null;
                pickDomManagerHandlers.updateData=null;
            })
            pickDomManagerHandlers.updateData(); // set visual text
        }
    }
}
