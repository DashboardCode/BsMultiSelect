export function BuildPickAspect(
        picksDom, 
        pickDomFactory,
        setOptionSelectedAspect){
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
        }
    }
}