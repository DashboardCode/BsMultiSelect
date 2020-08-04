import {composeSync} from './ToolsJs';

export function IsChoiceSelectableAspect(){ // TODO rename to IsSelectableByUserAspect ?
    return {
        isSelectable: (wrap)=>true 
    }
}

// todo: remove?
export function ChoiceClickAspect(optionToggleAspect, filterDom){
    return {

        choiceClick: (wrap) => {
            //let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            //addPickAspect.addPick(wrap, pickHandlers);
            optionToggleAspect.toggle(wrap); // TODO: return to it?
            filterDom.setFocus();
        }
    }
}

export function OptionToggleAspect(createPickHandlersAspect, addPickAspect /*, setOptionSelectedAspect*/){
    return {
        toggle: (wrap) => {
            let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            addPickAspect.addPick(wrap, pickHandlers);
            //return setOptionSelectedAspect.setOptionSelected(wrap, !wrap.isOptionSelected)
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

export function CreatePickHandlersAspect(picksList, removePickAspect, buildPickAspect){
    return{
        createPickHandlers(wrap){
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