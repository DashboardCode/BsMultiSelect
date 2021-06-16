import {addStyling} from './ToolsStyling';

export function ChoicesDomFactory(createElementAspect) {
    return {
        create(css){
            var choicesElement = createElementAspect.createElement('DIV');
            var choicesListElement = createElementAspect.createElement('UL');
            
            choicesElement.appendChild(choicesListElement);
            choicesElement.style.display = 'none';

            addStyling(choicesElement, css.choices);
            addStyling(choicesListElement, css.choicesList);
            return {
                choicesElement,
                choicesListElement,
                createChoiceElement(){
                    var choiceElement = createElementAspect.createElement('LI');
                    addStyling(choiceElement, css.choice);
                    return {
                        choiceElement,
                        setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
                        attach: (beforeElement) => choicesListElement.insertBefore(choiceElement, beforeElement),
                        detach: () => choicesListElement.removeChild(choiceElement)
                    };
                }
            }
        }
    }
}
