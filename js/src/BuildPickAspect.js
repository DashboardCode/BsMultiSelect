import {composeSync} from './ToolsJs';
 
export function BuildPickAspect(setOptionSelectedAspect, picks, picksDom, pickDomFactory){
    return {
        buildPick(choice, handleOnRemoveButton){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let setSelectedFalse = () => setOptionSelectedAspect.setOptionSelected(choice, false);
            let removeOnButton = handleOnRemoveButton(setSelectedFalse);
            let {pickDomManager} = pickDomFactory.create(pickElement, choice, removeOnButton); 
            let pickDomManagerHandlers = pickDomManager.init();

            var pick = {
                pickDomManagerHandlers,
                remove: setSelectedFalse,
                dispose: () => { 
                    detach(); 
                    pickDomManager.dispose(); 
                    pickDomManagerHandlers = null;
                    pick.remove=null; 
                    pick.dispose=null;  
                    pick=null;
                }
            }
            
            attach();
    
            let removeFromList = picks.addPick(pick);
            pick.dispose = composeSync(removeFromList, pick.dispose);
            choice.pick = pick;
        }
    }
}