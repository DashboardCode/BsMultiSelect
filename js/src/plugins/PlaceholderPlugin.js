import {composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';
import {toggleStyling} from '../ToolsStyling';

export function PlaceholderPlugin(pluginData){
    let {configuration, staticManager, picks, picksDom, filterDom, staticDom, updateDataAspect,
        buildPickAspect, resetFilterListAspect, filterManagerAspect} = pluginData;
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

    filterManagerAspect.processEmptyInput = composeSync(updateEmptyInputWidth, filterManagerAspect.processEmptyInput);
    resetFilterListAspect.forceResetFilter = composeSync(resetFilterListAspect.forceResetFilter, updatePlacehodlerVisibility);
            
    let origBuildPick = buildPickAspect.buildPick;
    buildPickAspect.buildPick = (choice, handleOnRemoveButton)=>{ 
        origBuildPick(choice, handleOnRemoveButton);
        let pick = choice.pick;
        if (picks.getCount()==1) 
            updatePlacehodlerVisibility()
        pick.dispose = composeSync(pick.dispose, ()=>
            { 
                if (picks.getCount()==0) 
                    updatePlacehodlerVisibility()
            })
    };

    updateDataAspect.updateData = composeSync(updateDataAspect.updateData, updatePlacehodlerVisibility);
    
}