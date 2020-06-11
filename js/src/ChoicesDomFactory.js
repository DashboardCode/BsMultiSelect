import {addStyling} from './ToolsStyling';

export function ChoicesDomFactory(createElementAspect) { 
    return {
        create(css){
            var choicesElement = createElementAspect.createElement('UL');
            addStyling(choicesElement, css.choices);
            choicesElement.style.display = 'none';
            return {
                choicesElement,
                createChoiceElement() {
                    var choiceElement = createElementAspect.createElement('LI');
                    addStyling(choiceElement, css.choice);
                    return {
                        choiceElement, 
                        setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
                        attach: (element) => choicesElement.insertBefore(choiceElement, element),
                        detach: () => choicesElement.removeChild(choiceElement)
                    };
                }
            }
        }
    }
}