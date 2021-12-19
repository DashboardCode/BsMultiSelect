import {composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';
import {toggleStyling} from '../ToolsStyling';
import {ResetableFlag} from '../ToolsDom'

export function PlaceholderPlugin(){
    return {
        plug
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            layout: () => {
                let {staticManager, picksList, picksDom, filterDom, updateDataAspect,
                    resetFilterListAspect, filterManagerAspect, environment, staticDom} = aspects;
                let isIE11 = environment.isIE11;
                let {placeholder,  css} = configuration;
                let {picksElement} = picksDom;
                let filterInputElement = filterDom.filterInputElement;
                
                function setPlaceholder(placeholder){
                    filterInputElement.placeholder = placeholder;
                }
                if (isIE11){
                    var ignoreNextInputResetableFlag = ResetableFlag(); 
                    let placeholderStopInputAspect = PlaceholderStopInputAspect(ignoreNextInputResetableFlag);
                    var setPlaceholderOrig = setPlaceholder;
                    setPlaceholder = function(placeholder){
                        ignoreNextInputResetableFlag.set();
                        setPlaceholderOrig(placeholder);
                    }
                    var origOnInput = filterDom.onInput;
                    filterDom.onInput = (handler) => {
                        origOnInput(
                            ()=>{if (placeholderStopInputAspect.get()){
                                placeholderStopInputAspect.reset();
                            } else {
                                handler();
                            }
                        });
                    }
                }
            
                if (!placeholder){
                    placeholder = getDataGuardedWithPrefix(staticDom.initialElement,"bsmultiselect","placeholder");
                }
            
                function setEmptyInputWidth(isVisible){
                    if(isVisible)
                        filterInputElement.style.width ='100%';
                    else 
                        filterInputElement.style.width ='2ch';
                }
                var emptyToggleStyling = toggleStyling(filterInputElement, css.filterInput_empty);
                function showPlacehodler(isVisible){
                    if (isVisible)
                    {
                        setPlaceholder(placeholder?placeholder:'');
                        picksElement.style.display = 'block';
                    }
                    else
                    {
                        setPlaceholder('');
                        picksElement.style.display = 'flex';
                    }
                    emptyToggleStyling(isVisible);
                    setEmptyInputWidth(isVisible);
                }
                showPlacehodler(true);
            
                function setDisabled(isComponentDisabled){ 
                    filterInputElement.disabled = isComponentDisabled;
                };
                let isEmpty = () => picksList.isEmpty() && filterDom.isEmpty()
            
                function updatePlacehodlerVisibility(){
                    showPlacehodler(isEmpty());
                };
                function updateEmptyInputWidth(){
                    setEmptyInputWidth(isEmpty())
                };
                
                let origDisable = picksDom.disable;
                picksDom.disable = (isComponentDisabled)=>{
                    setDisabled(isComponentDisabled);
                    origDisable(isComponentDisabled);
                };
            
                staticManager.appendToContainer = composeSync(staticManager.appendToContainer, updateEmptyInputWidth);
            
                filterManagerAspect.processEmptyInput = composeSync(updateEmptyInputWidth, filterManagerAspect.processEmptyInput);
                resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updatePlacehodlerVisibility);
                        
                let origAdd = picksList.add;
                picksList.add = (pick) => { 
                    let returnValue = origAdd(pick);
                    if (picksList.getCount()==1 ){ // make flex
                        if (filterDom.isEmpty()){
                            setPlaceholder('');
                            picksElement.style.display = 'flex';
                            emptyToggleStyling(false);
                            filterInputElement.style.width ='2ch';
                        } else {
                            picksElement.style.display = 'flex';
                        }
                    }
                    pick.dispose = composeSync(pick.dispose, function()
                        { 
                            if (isEmpty()) {
                                showPlacehodler(true);
                            }
                        });
                    return returnValue;
                };
            
                updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updatePlacehodlerVisibility);
            }
        }
    }
}

// ie11 support
function PlaceholderStopInputAspect(resetableFlag){
    return{
        get(){
            return resetableFlag.get();
        },
        reset(){
            return resetableFlag.reset();
        }             
    }
}