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
            optionToggleAspect.toggle(wrap);
            filterDom.setFocus();
        }
    }
}

// // fullMatchAspect trySetWrapSelected(fullMatchWrap.option, composeUpdateSelected(fullMatchWrap, true), true);

export function OptionToggleAspect(createPickHandlersAspect, addPickAspect /*, setOptionSelectedAspect*/){
    return {
        toggle: (wrap) => {
            let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            addPickAspect.addPick(wrap, pickHandlers);
            return true; // TODO: process setOptionSelectedAspect
        }
    }
}

export function AddPickAspect(){
    return {
        addPick(wrap, pickHandlers){
            return pickHandlers.producePick();
        }
    }
}

export function FullMatchAspect(createPickHandlersAspect, addPickAspect){
    return {
        fullMatch(wrap){
            let pickHandlers = createPickHandlersAspect.createPickHandlers(wrap);
            addPickAspect.addPick(wrap, pickHandlers);
            return true; // TODO: process setOptionSelectedAspect
        }
    }
}

export function RemovePickAspect(){
    return {
        removePick(wrap, pick){
            pick.dispose(); // overrided in SelectedOptionPlugin with trySetWrapSelected(wrap, false);
        }
    }
}

export function ProducePickAspect(picksList, removePickAspect, buildPickAspect){
    return {
        producePick(wrap, pickHandlers){
            let pick = buildPickAspect.buildPick(wrap, (event)=>pickHandlers.removeOnButton(event));
                
            let fixSelectedFalse = () => removePickAspect.removePick(wrap, pick)

            pickHandlers.removeOnButton = fixSelectedFalse;
            
            pick.pickElementAttach();
            let {remove: removeFromPicksList} = picksList.add(pick);
            pick.setSelectedFalse = fixSelectedFalse;
            pick.wrap = wrap; 
            pick.dispose = composeSync(
                removeFromPicksList,
                ()=>{
                    pick.setSelectedFalse=null;
                    pick.wrap = null;
                }, 
                pick.dispose);
            pickHandlers.removeAndDispose = () => pick.dispose();
            return pick;
        }
    }
}

// redefined in MultiSelectInlineLayout to redefine handlers removeOnButton
// redefined in SelectedOptionPlugin to compose wrap.updateSelected
export function CreatePickHandlersAspect(producePickAspect){
    return{
        createPickHandlers(wrap){
            let pickHandlers = { 
                producePick: null,  // not redefined directly, but redefined in addPickAspect
                removeAndDispose: null,  // not redefined, 
                removeOnButton: null // redefined in MultiSelectInlineLayout
            }
            
            pickHandlers.producePick = () => producePickAspect.producePick(wrap, pickHandlers);
            return pickHandlers;
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
                choiceDom:null,
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