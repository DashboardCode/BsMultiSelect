import {composeSync} from './ToolsJs';

export function PicksAspect(picksDom, pickDomFactory, 
    choiceAspect, picks){
    return {
        createPick(choice, handleOnRemoveButton /* multiSelectInputAspect.handleOnRemoveButton */){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let setSelectedFalse = () => choiceAspect.setOptionSelected(choice, false)
            let remove = handleOnRemoveButton(setSelectedFalse);
            let {pickDomManager} = pickDomFactory.create(pickElement, choice, remove); 
            let pickHandlers = pickDomManager.init();

            var pick = {
                updateRemoveDisabled: () => pickHandlers.updateRemoveDisabled(),
                updateData: () => pickHandlers.updateData(),
                updateDisabled: () => pickHandlers.updateDisabled(),
                remove: setSelectedFalse,
                dispose: () => { 
                    detach(); 
                    pickDomManager.dispose(); 
                    pick.updateRemoveDisabled=null; pick.updateData=null; pick.updateDisabled=null; pick.remove=null; 
                    pick.dispose=null;  
                }, 
            }
            
            attach();
            let choiceUpdateDisabledBackup = choice.updateDisabled;
            choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled);
    
            var removeFromList = picks.addPick(pick);
            let removePick = () => {
                removeFromList();
                pick.dispose();
    
                choice.updateDisabled = choiceUpdateDisabledBackup; 
                choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
            }
            
            return removePick;
        }
    }
}