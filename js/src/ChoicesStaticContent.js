// export function ChoicesStaticContent(){
//     return {
//         choicesElement,
//         createChoiceElement(){
//             var choiceElement = createElement('LI');
//             addStyling(choiceElement, css.choice);
//             return {
//                 choiceElement, 
//                 setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
//                 attach: (element) => choicesElement.insertBefore(choiceElement, element),
//                 detach: () => removeElement(choiceElement)
//             };
//         },
//         dispose(){
//             choicesElement.parentNode.removeChild(choicesElement);
//         }
//     }
// } 