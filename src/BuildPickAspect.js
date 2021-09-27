export function BuildPickAspect(
    picksDom, 
    pickDomFactory
){
    return {
        buildPick(wrap, removeOnButton){
            let {pickElement, attach, detach} = picksDom.createPickElement(); 
            let {dispose, pickDom, pickDomManagerHandlers} = pickDomFactory.create(pickElement, wrap, removeOnButton); 
            
            pickDomManagerHandlers.updateData();
            if (pickDomManagerHandlers.updateDisabled)
                pickDomManagerHandlers.updateDisabled();
            if (pickDomManagerHandlers.updateComponentDisabled)
                pickDomManagerHandlers.updateComponentDisabled();
            let pick = {
                pickDom,
                pickDomManagerHandlers,
                pickElementAttach: attach,
                dispose: () => { 
                    detach(); 
                    dispose(); 
                    pick.pickDomManagerHandlers = null;
                    pick.pickDom = pickDom;
                    pick.pickElementAttach = null;
                    pick.dispose = null;
                }
            }
            return pick;
        }
    }
}