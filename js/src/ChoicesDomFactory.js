import {addStyling} from './ToolsStyling';

export function ChoicesDomFactory(createElementAspect) {
    return {
        create(css){
            var choicesElement = createElementAspect.createElement('UL'); 
            choicesElement.style.display = 'none';
            addStyling(choicesElement, css.choices);
            return {
                choicesElement,
                createChoiceElement() {
                    var choiceElement = createElementAspect.createElement('LI');
                    addStyling(choiceElement, css.choice);
                    return {
                        choiceElement, 
                        setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
                        attach: (beforeElement) => choicesElement.insertBefore(choiceElement, beforeElement),
                        detach: () => choicesElement.removeChild(choiceElement)
                    };
                }
            }
        }
    }
}
