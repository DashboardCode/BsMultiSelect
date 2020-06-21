import {composeSync} from './ToolsJs';
 
export function BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory){
    return {
        buildPick(choice, handleOnRemoveButton){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let setSelectedFalse = () => setOptionSelectedAspect.setOptionSelected(choice, false)
            let remove = handleOnRemoveButton(setSelectedFalse);
            let {pickDomManager} = pickDomFactory.create(pickElement, choice, remove); 
            let pickDomManagerHandlers = pickDomManager.init();

            var pick = {
                pickDomManagerHandlers,
                updateRemoveDisabled: () => pickDomManagerHandlers.updateRemoveDisabled(),
                updateData: () => pickDomManagerHandlers.updateData(),
                remove: setSelectedFalse,
                dispose: () => { 
                    detach(); 
                    pickDomManager.dispose(); 
                    pick.updateRemoveDisabled=null; pick.updateData=null; 
                    pick.remove=null; 
                    pick.dispose=null;  
                    pickDomManagerHandlers = null;
                }
            }
            
            attach();
    
            let removeFromList = picks.addPick(pick);
            pick.dispose = composeSync(removeFromList, pick.dispose);
            return pick;
        }
    }
}