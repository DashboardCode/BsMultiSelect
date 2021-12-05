import {composeSync} from './ToolsJs';

// redefined in SelectedOptionPlugin to compose wrap.updateSelected
export function CreatePickHandlersAspect(producePickAspect, picksList){ 
    return{
        createPickHandlers(wrap){
            var pickHandlers = { 
                producePick: null,  // not redefined directly, but redefined in addPickAspect
                removeAndDispose: null,  // not redefined, used in MultiSelectInlineLayout injected into wrap.choice.remove 
            }
            
            pickHandlers.producePick = () => {
                let pick = producePickAspect.producePick(wrap);
                let {remove: removeFromPicksList} = picksList.add(pick);
                pick.dispose = composeSync(removeFromPicksList, pick.dispose);
                pickHandlers.removeAndDispose = () => pick.dispose();
                return pick;
            }
            return pickHandlers;
        }
    }
}