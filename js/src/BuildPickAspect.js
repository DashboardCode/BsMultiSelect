import {composeSync} from './ToolsJs';

export function BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory){
    return {
        buildPick(choice, handleOnRemoveButton){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let setSelectedFalse = () => setOptionSelectedAspect.setOptionSelected(choice, false)
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
            choice.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled); // add pickDisabled
    
            var removeFromList = picks.addPick(pick);
            let removePick = () => {
                removeFromList();
                pick.dispose();
    
                choice.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled
                choice.updateDisabled(); // make "true disabled" without it checkbox looks disabled
            }
            
            return removePick;
        }
    }
}