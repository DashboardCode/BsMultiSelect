export function BuildAndAttachChoiceAspect(
    buildChoiceAspect,
    ){
    return {
        buildAndAttachChoice(
            wrap,
            getNextElement 
            ){
                buildChoiceAspect.buildChoice(wrap);
                wrap.choice.choiceElementAttach(getNextElement?.());
        }
    }
}

export function BuildChoiceAspect(
        choicesDom,
        choiceDomFactory,
        choiceClickAspect
    ) {
    return {
        buildChoice(wrap) {
            var {choiceElement, setVisible, attach, detach} = choicesDom.createChoiceElement();
            wrap.choice.choiceElement = choiceElement;
            wrap.choice.choiceElementAttach = attach;
            wrap.choice.isChoiceElementAttached = true;
            
            let {dispose, choiceDom, choiceDomManagerHandlers} = choiceDomFactory.create(choiceElement, wrap, () => choiceClickAspect.choiceClick(wrap));
            wrap.choice.choiceDom=choiceDom;
            choiceDomManagerHandlers.updateData();
            if (choiceDomManagerHandlers.updateSelected)  
                choiceDomManagerHandlers.updateSelected();
            if (choiceDomManagerHandlers.updateDisabled)  
                choiceDomManagerHandlers.updateDisabled();
            

            wrap.choice.choiceDomManagerHandlers = choiceDomManagerHandlers;
            
            wrap.choice.remove = () => {
                detach();
            };
            
            wrap.choice.isFilteredIn = true;
            
            wrap.choice.setHoverIn = (v) => {
                wrap.choice.isHoverIn =v ;
                choiceDomManagerHandlers.updateHoverIn();
            }
        
            wrap.choice.setVisible = (v) => {
                wrap.choice.isFilteredIn = v;
                setVisible(wrap.choice.isFilteredIn)
            }
            
            wrap.choice.dispose = () => {
                wrap.choice.choiceDomManagerHandlers = null;
                dispose();
    
                wrap.choice.choiceElement = null;
                wrap.choice.choiceDom = null;
                wrap.choice.choiceElementAttach = null;
                wrap.choice.isChoiceElementAttached = false;
                wrap.choice.remove = null; 
        
                // not real data manipulation but internal state
                wrap.choice.setVisible = null; // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
                wrap.choice.setHoverIn = null;
        
                wrap.choice.dispose = null;
            }

            wrap.dispose = () => {
                wrap.choice.dispose();
                wrap.dispose = null;
            }
        }
    }
}