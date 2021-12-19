import {addStyling, toggleStyling} from './ToolsStyling';

export function PicksDomFactory(staticDom){
    return {
        create(){
            var {picksElement, isDisposablePicksElementFlag, css, createElementAspect} = staticDom;
            var pickFilterElement  = createElementAspect.createElement('LI');
    
            addStyling(picksElement,      css.picks);
            addStyling(pickFilterElement, css.pickFilter);
        
            let disableToggleStyling = toggleStyling(picksElement, css.picks_disabled);
            let focusToggleStyling   = toggleStyling(picksElement, css.picks_focus);
            let isFocusIn = false;
        
            return {
                picksElement,
                isDisposablePicksElementFlag,
                pickFilterElement,

                createPickElement(){
                    var pickElement = createElementAspect.createElement('LI');
                    addStyling(pickElement, css.pick);
                    return {
                        pickElement, 
                        attach: (beforeElement) => picksElement.insertBefore(pickElement, beforeElement??pickFilterElement),
                        detach: () => picksElement.removeChild(pickElement)
                    };
                },
                disable(isComponentDisabled){
                    disableToggleStyling(isComponentDisabled)
                },
                toggleFocusStyling(){
                    focusToggleStyling(isFocusIn)
                },
                getIsFocusIn(){
                    return isFocusIn;
                },
                setIsFocusIn(newIsFocusIn){
                    isFocusIn = newIsFocusIn
                }, 
                dispose(){
                    if (!isDisposablePicksElementFlag){
                        disableToggleStyling(false)
                        focusToggleStyling(false)

                        if (pickFilterElement.parentNode)
                            pickFilterElement.parentNode.removeChild(pickFilterElement)
                    }
                }
            }
        }
    }
}

export function PicksDomFactoryPlugCss(css){
    css.picks = 'form-control';
    css.pickFilter = '';
    css.picks_disabled = 'disabled';
    css.picks_focus = 'focus';
    css.pick = 'badge';
}

function PicksDomFactoryPlugCssPatch(cssPatch){
    cssPatch.picks = {listStyleType:'none', display:'flex', flexWrap:'wrap',  height: 'auto', marginBottom: '0',cursor: 'text'},
    cssPatch.picks_disabled =  {backgroundColor: '#e9ecef'};
    cssPatch.picks_focus = {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'};
    cssPatch.pick = {paddingLeft: '0', paddingRight: '.5rem', paddingInlineStart:'0', paddingInlineEnd:'0.5rem'}
}

export function PicksDomFactoryPlugCssPatchBs4(cssPatch){
    PicksDomFactoryPlugCssPatch(cssPatch)
    // TODO: this is done for button and should be moved to button plugin
    //cssPatch.pick.lineHeight = '1.5em';
    cssPatch.pick.paddingTop = '0.35em';
    cssPatch.pick.paddingBottom = '0.35em';
}

export function PicksDomFactoryPlugCssPatchBs5(cssPatch){
     PicksDomFactoryPlugCssPatch(cssPatch)
     // TODO: this is done for button and should be moved to button plugin
     cssPatch.pick.color ='var(--bs-dark)';
}