export function ProducePickAspect(picksDom, pickDomFactory){
    return {
        // overrided by DisableOptionPlugin
        producePick(wrap){
            let {pickElement, attach, detach} = picksDom.createPickElement(); 
            let pickDom = {pickElement};
            let pickDomManagerHandlers = {attach, detach};
            
            let pick = {
                wrap,
                pickDom,
                pickDomManagerHandlers,
                
                dispose: () => { 
                    detach();
                    pickDom.pickElement=null;
                    pickDomManagerHandlers.attach=null;
                    pick.wrap=null;
                    pick.pickDom=null;
                    pick.pickDomManagerHandlers=null;
                }
            }

            wrap.pick=pick;
            pickDomFactory.create(pick); 
                
            pick.pickDomManagerHandlers.attach();
            
            return pick;
        } 
    }
}