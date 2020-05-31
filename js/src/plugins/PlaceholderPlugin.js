import {composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';
import {toggleStyling} from '../ToolsStyling';

export function PlaceholderPlugin(pluginData){
    let {configuration, staticManager, picks, picksDom, filterDom, staticDom, updateDataAspect,
        picksAspect, inputAspect, resetFilterListAspect, filterListAspect} = pluginData;
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

    filterListAspect.processEmptyInput = composeSync(updateEmptyInputWidth, filterListAspect.processEmptyInput);

    resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updatePlacehodlerVisibility);
            
    let origInput = inputAspect.input;

    inputAspect.input = (filterInputValue, resetLength, eventLoopFlag_set, aspect_showChoices, aspect_hideChoices) =>{
        updatePlacehodlerVisibility();
        origInput(filterInputValue, resetLength, eventLoopFlag_set, aspect_showChoices, aspect_hideChoices);
    }

    let origCreatePick = picksAspect.createPick;
    picksAspect.createPick = (choice, handleOnRemoveButton)=>{ 
        let removePick = origCreatePick(choice, handleOnRemoveButton);
        if (picks.getCount()==1) 
            updatePlacehodlerVisibility()
        return ()=>
            { 
                removePick();
                if (picks.getCount()==0) 
                    updatePlacehodlerVisibility()
            }
    };

    updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updatePlacehodlerVisibility);
    
}