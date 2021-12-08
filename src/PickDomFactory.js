import {composeSync} from './ToolsJs';
import {addStyling} from './ToolsStyling';

// empty but can be usefull in custom development
export function PickDomFactoryPlugCss(css){
    css.pickContent = '';
}

export function PickDomFactory(css, createElementAspect, optionPropertiesAspect){ 
    return { 
        create(pick){
            let pickContentElement = createElementAspect.createElement('SPAN');
            let {pickDom, pickDomManagerHandlers} = pick;
            pickDom.pickElement.appendChild(pickContentElement);
            pickDom.pickContentElement=pickContentElement;
            pickDomManagerHandlers.updateData = ()=>{
                pickContentElement.textContent = optionPropertiesAspect.getText(pick.wrap.option);
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


// export function PickDomFactoryAlt(css, createElementAspect, optionPropertiesAspect){ 
//     return { 
//         create(pickElement, option){
//             let pickContentElement = createElementAspect.createElement('SPAN');
//             pickElement.appendChild(pickContentElement);
//             addStyling(pickContentElement, css.pickContent);
//             function updateData(){
//                 pickContentElement.textContent = optionPropertiesAspect.getText(option);
//             }
//             updateData();
//             let pickDom = { pickContentElement };
//             let pickDomManagerHandlers = { updateData };
//             return {
//                 pickDom,
//                 pickDomManagerHandlers,
//                 dispose: {pickDom.pickContentElement=null; pickDomManagerHandlers.updateData=null;}
//             }
//         }
//     }
// }