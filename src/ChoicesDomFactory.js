import {addStyling} from './ToolsStyling';

export function ChoicesDomFactory(staticDom) {
    return {
        create(){
            let {css, createElementAspect} = staticDom;
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
                    }
                }
            }
        }
    }
}

export function ChoicesDomFactoryPlugCss(css){
    css.choices = 'dropdown-menu';
    css.choicesList = '';
    css.choice = '';
}

export function ChoicesDomFactoryPlugCssPatch(cssPatch){
    cssPatch.choicesList = {listStyleType:'none', paddingLeft:'0', paddingRight:'0', marginBottom:'0'};
    cssPatch.choice = {classes:'px-md-2 px-1', styles:{cursor:'pointer'}};
}