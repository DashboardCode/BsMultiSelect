export function BuildPickAspect(
        picksDom, 
        pickDomFactory
        ){
    return {
        buildPick(wrap, removeOnButton){
            let { pickElement, attach, detach } = picksDom.createPickElement(); 
            let {pickDomManager} = pickDomFactory.create(pickElement, wrap, removeOnButton); 
            let pickDomManagerHandlers = pickDomManager.init();

            let pick = {
                pickDomManagerHandlers,
                pickElementAttach: attach,
                dispose: () => { 
                    detach(); 
                    pickDomManager.dispose(); 
                    pickDomManagerHandlers = null;
                    pick.pickElementAttach=null;
                    pick.dispose=null;  
                    wrap.pick = null;
                }
            }
            wrap.pick = pick;
        }
    }
}