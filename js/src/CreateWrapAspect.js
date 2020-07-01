import {composeSync} from './ToolsJs';

export function IsChoiceSelectableAspect(){
    return {
        isSelectable: (wrap)=>true 
    }
}


export function SetOptionSelectedAspect(optionPropertiesAspect){
    return {
        setOptionSelected: (wrap, booleanValue) => {
            let success = false;
            var confirmed = optionPropertiesAspect.setSelected(wrap.option, booleanValue);
            if (!(confirmed===false)) {
                wrap.isOptionSelected = booleanValue;
                wrap.updateSelected();
                success = true;
            }
            return success;
        }
    }
}

export function ChoiceClickAspect(wrapPickAspect, addPickAspect, filterDom){
    return {
        choiceClick: (wrap) => {
            let pickTools = wrapPickAspect.wrapPick(wrap);
            addPickAspect.addPick(wrap, pickTools);
            //optionToggleAspect.toggle(wrap);
            filterDom.setFocus();
        }
    }
}

export function OptionToggleAspect(setOptionSelectedAspect){
    return {
        toggle: (wrap) => {
            return setOptionSelectedAspect.setOptionSelected(wrap, !wrap.isOptionSelected)
        }
    }
}

export function AddPickAspect(){
    return {
        addPick(wrap, pickTools){
            pickTools.addPick();
        }
    }
}

export function RemovePickAspect(){
    return {
        removePick(wrap){
            wrap.pick.dispose();
        }
    }
}

export function WrapPickAspect(picksList, removePickAspect, buildPickAspect){
    return{
        wrapPick(wrap){
            let setSelectedFalse = () => removePickAspect.removePick(wrap)
            
            let pickTools = { 
                addPick: null, 
                removePick: null,  
                removeOnButton: setSelectedFalse 
            }
            
            pickTools.addPick = () => { 
                buildPickAspect.buildPick(wrap, (event)=>pickTools.removeOnButton(event));
                let pick = wrap.pick;
                pick.pickElementAttach();
                let removeFromList = picksList.add(wrap);
                pick.setSelectedFalse = setSelectedFalse; 
                pick.dispose = composeSync(
                    removeFromList,
                    ()=>{
                        pick.setSelectedFalse=null;
                    }, pick.dispose);
                pickTools.removePick = () => pick.dispose();
            };
            return pickTools;
        }
    }
}

export function CreateChoiceBaseAspect(optionPropertiesAspect){
    return {
        createChoiceBase(option){
            return {
                    
                //updateDisabled:null,  
                //updateHidden:null,
                
                // navigation and filter support
                filteredPrev: null, 
                filteredNext: null, 
                searchText: optionPropertiesAspect.getText(option).toLowerCase().trim(), // TODO make an index abstraction
                
                // internal state handlers, so they do not have "update semantics"
                isHoverIn: false,
                isFilteredIn: false,
                
                setVisible: null,
                setHoverIn: null,
                
                // TODO: is it a really sense to have them there?
                isChoiceElementAttached: false,
                choiceElement: null,
                choiceElementAttach: null,
                
                itemPrev: null,
                itemNext: null,
                
                remove: null,
                
                dispose: null
            }
        }
    }
}

export function CreateWrapAspect(){
    return {
        createWrap(option){
            return {
                option: option
            }
        }
    }
}