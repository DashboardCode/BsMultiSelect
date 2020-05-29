import {composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';
import {toggleStyling} from '../ToolsStyling';

export function PlaceholderPlugin(pluginData){
    let {configuration, staticManager, picks, picksDom, filterDom, staticDom, picksAspect, inputAspect} = pluginData;
    let {placeholder,  css} = configuration;
    let {picksElement} = picksDom;
    let filterInputElement = filterDom.filterInputElement;
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
            filterInputElement.placeholder = placeholder?placeholder:'';
            picksElement.style.display = 'block';
        }
        else
        {
            filterInputElement.placeholder = '';
            picksElement.style.display = 'flex';
        }
        emptyToggleStyling(isVisible);
        setEmptyInputWidth(isVisible);
    }
    showPlacehodler(true);
   
    function setDisabled(isComponentDisabled){ 
        filterInputElement.disabled = isComponentDisabled;
    };
    let isEmpty = () => picks.isEmpty() && filterDom.isEmpty()
    return {
        afterConstructor(multiSelect){
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

            let origProcessEmptyInput = multiSelect.filterListAspect.processEmptyInput;
            multiSelect.filterListAspect.processEmptyInput = composeSync(updateEmptyInputWidth, origProcessEmptyInput);

            let origEmpty = multiSelect.empty.bind(multiSelect);
            multiSelect.empty = composeSync(origEmpty, updatePlacehodlerVisibility);

            let origForceResetFilter = multiSelect.forceResetFilter.bind(multiSelect);
            multiSelect.forceResetFilter = composeSync(origForceResetFilter, updatePlacehodlerVisibility);
            
            let origInput = inputAspect.input;

            inputAspect.input = (filterInputValue, resetLength, eventLoopFlag_set, aspect_showChoices, aspect_hideChoices) =>{
                updatePlacehodlerVisibility();
                origInput(filterInputValue, resetLength, eventLoopFlag_set, aspect_showChoices, aspect_hideChoices);
            }

            let origCreatePick = picksAspect.createPick;
            picksAspect.createPick = (choice, handleOnRemoveButton)=>{ 
                let removePick = origCreatePick(choice, handleOnRemoveButton);
                if (multiSelect.picks.getCount()==1) 
                    updatePlacehodlerVisibility()
                return ()=>
                    { 
                        removePick();
                        if (multiSelect.picks.getCount()==0) 
                            updatePlacehodlerVisibility()
                    }
            };
        }
    }
}