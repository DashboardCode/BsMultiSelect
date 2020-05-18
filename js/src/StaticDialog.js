import {removeElement} from './ToolsDom';
import {addStyling} from './ToolsStyling';

export function StaticDialog(createElement, css) { 
    var choicesElement = createElement('UL');
    addStyling(choicesElement, css.choices);
    return {
        choicesElement,
        createChoiceElement() {
            var choiceElement = createElement('LI');
            addStyling(choiceElement, css.choice);
            return {
                choiceElement, 
                setVisible: (isVisible) => choiceElement.style.display = isVisible ? 'block': 'none',
                attach: (element) => choicesElement.insertBefore(choiceElement, element),
                detach: () => removeElement(choiceElement)
            };
        }
    }
}