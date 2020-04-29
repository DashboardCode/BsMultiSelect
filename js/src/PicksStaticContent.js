// export function PicksStaticContent(){
//     return {
//         pickFilterElement,
//         filterInputElement,
//         picksElement,
//         // ---------------------------------------
//         createPickElement(){
//             var pickElement = createElement('LI');
//             addStyling(pickElement, css.pick);
//             return {
//                 pickElement, 
//                 attach: () => picksElement.insertBefore(pickElement, pickFilterElement),
//                 detach: () => removeElement(pickElement)
//             };
//         }, 
//         dispose(){
//             if (ownPicksElement){
//                 picksElement.parentNode.removeChild(picksElement);
//             }else{
//                 // remove styles, TODO: find something better?
//                 disableToggleStyling(false);
//                 focusToggleStyling(false); 
//             }
//             if (pickFilterElement.parentNode)
//                 pickFilterElement.parentNode.removeChild(pickFilterElement);
//             if (filterInputElement.parentNode)
//                 filterInputElement.parentNode.removeChild(filterInputElement);
//         }
//     }
// }