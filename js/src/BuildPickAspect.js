import {composeSync} from './ToolsJs';

export function BuildPickAspect(
        picksDom, 
        pickDomFactory,
        setOptionSelectedAspect, picks){
    return {
        buildPick(wrap, handleOnRemoveButton){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let setSelectedFalse = () => setOptionSelectedAspect.setOptionSelected(wrap, false);
            let removeOnButton = handleOnRemoveButton(setSelectedFalse);
            let {pickDomManager} = pickDomFactory.create(pickElement, wrap, removeOnButton); 
            let pickDomManagerHandlers = pickDomManager.init();

            let pick = {
                pickDomManagerHandlers,
                remove: setSelectedFalse,
                pickElementAttach: attach,
                dispose: () => { 
                    detach(); 
                    pickDomManager.dispose(); 
                    pickDomManagerHandlers = null;
                    pick.remove=null; 
                    pick.dispose=null;  
                    pick.pickElementAttach=null;
                    pick=null;
                }
            }
            wrap.pick = pick;
            //wrap.pick.pickElementAttach();

            //let removeFromList = picks.addPick(pick);
            //pick.dispose = composeSync(removeFromList, pick.dispose);
        }
    }
}