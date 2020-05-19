import {composeSync} from '../ToolsJs';
import {getDataGuardedWithPrefix} from '../ToolsDom';
import {toggleStyling} from '../ToolsStyling';

export function PlaceholderPlugin(pluginData){
    let {configuration, staticManager, picksDom, staticDom} = pluginData;
    let {placeholder,  css} = configuration;
    let {picksElement, filterInputElement} = picksDom;

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

    return {
        afterConstructor(multiSelect){
            function updatePlacehodlerVisibility(){
                showPlacehodler(multiSelect.isEmpty());
            };
            function updateEmptyInputWidth(){
                setEmptyInputWidth(multiSelect.isEmpty())
            };
                    
            let origDisable = picksDom.disable;
            picksDom.disable = (isComponentDisabled)=>{
                setDisabled(isComponentDisabled);
                origDisable(isComponentDisabled);
            };

            staticManager.appendToContainer = composeSync(staticManager.appendToContainer, updateEmptyInputWidth);

            let origProcessEmptyInput = multiSelect.processEmptyInput.bind(multiSelect);
            multiSelect.processEmptyInput = composeSync(updateEmptyInputWidth, origProcessEmptyInput);

            let origEmpty = multiSelect.empty.bind(multiSelect);
            multiSelect.empty = composeSync(origEmpty, updatePlacehodlerVisibility);

            let origForceResetFilter = multiSelect.forceResetFilter.bind(multiSelect);
            multiSelect.forceResetFilter = composeSync(origForceResetFilter, updatePlacehodlerVisibility);
            
            let origInput = multiSelect.input.bind(multiSelect);
            multiSelect.input = (filterInputValue, resetLength) =>{
                updatePlacehodlerVisibility();
                origInput(filterInputValue, resetLength);
            }

            let origCreatePick = multiSelect.createPick.bind(multiSelect);
            multiSelect.createPick = (choice)=>{
                let removePick = origCreatePick(choice);
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