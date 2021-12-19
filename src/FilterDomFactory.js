import {addStyling} from './ToolsStyling';
import {EventBinder} from './ToolsDom';

export function FilterDomFactory(staticDom){
    return {
        create(){
            let {isDisposablePicksElementFlag, css, createElementAspect} = staticDom;
            var filterInputElement = createElementAspect.createElement('INPUT');
            addStyling(filterInputElement, css.filterInput);
        
            filterInputElement.setAttribute("type","search");
            filterInputElement.setAttribute("autocomplete","off");
            var eventBinder = EventBinder();

            return {
                filterInputElement,
                isEmpty(){return filterInputElement.value ? false : true},
                setEmpty(){
                    filterInputElement.value ='';
                },
                getValue(){
                    return filterInputElement.value;
                },
                setFocus(){
                    filterInputElement.focus();
                },
                setWidth(text){
                    filterInputElement.style.width = text.length * 1.3 + 2 + "ch"
                },
                // TODO: check why I need this comparision? 
                setFocusIfNotTarget(target){
                    if (target != filterInputElement)
                        filterInputElement.focus();
                },
                onInput(onFilterInputInput){
                    eventBinder.bind(filterInputElement,'input',    onFilterInputInput);
                },
                onFocusIn(onFocusIn){
                    eventBinder.bind(filterInputElement,'focusin',  onFocusIn);
                },
                onFocusOut(onFocusOut){
                    eventBinder.bind(filterInputElement,'focusout', onFocusOut);
                },
                onKeyDown(onfilterInputKeyDown){
                    eventBinder.bind(filterInputElement,'keydown',  onfilterInputKeyDown);    
                },
                onKeyUp(onFilterInputKeyUp){
                    eventBinder.bind(filterInputElement,'keyup',    onFilterInputKeyUp);
                },
                dispose(){
                    eventBinder.unbind();
                    if (!isDisposablePicksElementFlag){
                        if (filterInputElement.parentNode)
                            filterInputElement.parentNode.removeChild(filterInputElement)
                    }
                }
            }
        }
    }
}

export function FilterDomFactoryPlugCss(css){
    css.filterInput = '';
}

export function FilterDomFactoryPlugCssPatch(cssPatch){
    cssPatch.filterInput = {
        border:'0px', height: 'auto', boxShadow:'none', 
        padding:'0', margin:'0', 
        outline:'none', backgroundColor:'transparent',
        backgroundImage: 'none' // otherwise BS .was-validated set its image
    };
}
