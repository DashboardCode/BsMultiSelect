function updateHiddenChoice(choice, updateHidden , getIsOptionHidden){
    let newIsOptionHidden = getIsOptionHidden(choice.option);
    if (newIsOptionHidden != choice.isOptionHidden)
    {
        choice.isOptionHidden= newIsOptionHidden;
        updateHidden(choice)
    }
}

function getNextNonHidden(choice) { // TODO get next visible
    let next = choice.itemNext;
    if (!next) {
        return null;
    } else if (next.choiceElement) {
        return next;
    }
    return getNextNonHidden(next)
}

export function HiddenPlugin(configuration, options, common, staticContent){
    let { getIsOptionHidden } = configuration;
    if (options){
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>(option.hidden===undefined)?false:option.hidden;     
    } else{
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>option.hidden;     
    }

    return {
        afterConstructor(multiSelect){
            multiSelect.getNext = (c)=>getNextNonHidden(c);
    
            var origIsSelectable = multiSelect.isSelectable.bind(multiSelect);
            multiSelect.isSelectable = (choice) => origIsSelectable(choice) && !choice.isOptionHidden;
            
            function buildHiddenChoice(choice){
                choice.updateSelected = () => void 0;
                choice.updateDisabled = () => void 0;
                
                choice.choiceElement = null;
                choice.choiceElementAttach = null;
                choice.setVisible = null; 
                choice.setHoverIn = null;
                choice.remove = null; 
                
                choice.dispose = () => { 
                    choice.dispose = null;
                };
            }
        
            function updateHidden(choice) {
                if (choice.isOptionHidden) {
                    multiSelect.filterListFacade.remove(choice);
                    choice.remove(); 
                    buildHiddenChoice(choice);
                } else {
                    let nextChoice = getNextNonHidden(choice);
                    multiSelect.filterListFacade.add(choice, nextChoice);
                    multiSelect.createChoiceElement(choice);
                    choice.choiceElementAttach(nextChoice?.choiceElement); // itemPrev?.choiceElement
                }
            }
            
            multiSelect.updateHidden = (c) => updateHidden(c);
        
            function UpdateOptionHidden(key){
                let choice = multiSelect.choicesPanel.get(key); // TODO: generalize index as key 
                updateHiddenChoice(choice, (c)=>multiSelect.updateHidden(c), getIsOptionHidden) // TODO: invite this.getIsOptionSelected
            }
            
            function UpdateOptionsHidden(){
                let options = multiSelect.getOptions();
                for(let i = 0; i<options.length; i++){
                    UpdateOptionHidden(i)
                }
            }
        
            multiSelect.UpdateOptionsHidden = () => UpdateOptionsHidden();
            multiSelect.UpdateOptionHidden = (key) => UpdateOptionHidden(key);
        
            var origСreateChoice = multiSelect.createChoice.bind(multiSelect);
        
            multiSelect.createChoice = (option) => {
                let choice = origСreateChoice(option);
                choice.isOptionHidden = getIsOptionHidden(option);
                return choice;
            };
        
            var origInsertChoiceItem = multiSelect.insertChoiceItem.bind(multiSelect);
            var origPushChoiceItem = multiSelect.pushChoiceItem.bind(multiSelect);
        
            multiSelect.insertChoiceItem=(choice)=>{
                if (choice.isOptionHidden){ 
                    buildHiddenChoice(choice);
                }
                else{ 
                    origInsertChoiceItem(choice);
                }
            }
        
            multiSelect.pushChoiceItem=(choice)=>{
                if (choice.isOptionHidden){ 
                    buildHiddenChoice(choice);
                }
                else{ 
                    origPushChoiceItem(choice);
                }
            }
        
            multiSelect.forEach = (f) => {
                let choice = multiSelect.choicesPanel.getHead();
                while(choice){
                    if (!choice.isOptionHidden)
                        f(choice);
                    choice = multiSelect.getNext(choice);
                }
            }
        
            var origAddFilterFacade = multiSelect.addFilterFacade.bind(multiSelect);
            multiSelect.addFilterFacade = (choice) => {
                if ( !choice.isOptionHidden ) {
                    origAddFilterFacade(choice);
                }
            }
        
            var origInsertFilterFacade = multiSelect.insertFilterFacade.bind(multiSelect);
            multiSelect.addFilterFacade = (choice) => {
                if ( !choice.isOptionHidden ){
                    origInsertFilterFacade(choice);
                }
            }
        }
        /*,
        afterInit(multiSelect){

        },
        afterLoad(multiSelect){
        
        }*/
    }

}