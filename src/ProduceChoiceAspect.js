import {composeSync} from './ToolsJs';
export function BuildAndAttachChoiceAspect(
    produceChoiceAspect,
    ){
    return {
        buildAndAttachChoice(
            wrap,
            getNextElement 
            )
        {
            produceChoiceAspect.produceChoice(wrap);
            wrap.choice.choiceDomManagerHandlers.attach(getNextElement?.());
        }
    }
}

export function ProduceChoiceAspect(choicesDom, choiceDomFactory) {
    return {
        // 1 overrided in highlight and option disable plugins
        // 2 call in HiddenPlugin (create)
        // 3 overrided in layout: pick created, choice.choiceDomManagerHandlers.detach updated to remove pick
        produceChoice(wrap) { 
            var {choiceElement, attach, detach, setVisible} = choicesDom.createChoiceElement();
            
            let choice = wrap.choice;
            choice.wrap = wrap;

            choice.choiceDom={
                choiceElement
            };
 
            let choiceDomManagerHandlers = {
                attach, 
                detach,
                setVisible // TODO: refactor it there should be 3 types of not visibility: for hidden, for filtered out, for optgroup, for message item
            }
            choice.choiceDomManagerHandlers = choiceDomManagerHandlers
            choiceDomFactory.create(choice);

            // added by "navigation (by mouse and arrows) plugin"
            choice.isHoverIn = false; // internal state
            choice.setHoverIn = (v) => {
                choice.isHoverIn =v ;
                choiceDomManagerHandlers.updateHoverIn();
            }

            choice.dispose =  composeSync(() =>{
                choice.choiceDom.choiceElement = null;
                choice.choiceDom = null;
                choiceDomManagerHandlers.attach=null;
                choiceDomManagerHandlers.detach=null;
                choiceDomManagerHandlers.setVisible=null;
                choice.choiceDomManagerHandlers = null;
                choice.choiсeClick=null;
    
                choice.setHoverIn = null;
        
                choice.wrap = null;
                choice.dispose = null;
            }, choice.dispose)

            wrap.dispose = () => {
                choice.dispose();
                wrap.dispose = null;
            }
            return choice;
        }
    }
}