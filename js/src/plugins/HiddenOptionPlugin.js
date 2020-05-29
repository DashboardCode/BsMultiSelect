export function HiddenOptionPlugin(pluginData){
    let {configuration, options, choicesGetNextAspect, choicesEnumerableAspect, filterListAspect, choiceFactoryAspect, choicesElementAspect} = pluginData;
    let {getIsOptionHidden} = configuration;
    if (options){
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>(option.hidden===undefined)?false:option.hidden;     
    } else{
        if (!getIsOptionHidden)
            getIsOptionHidden = (option)=>option.hidden;     
    }

    choicesGetNextAspect.getNext = (c)=>getNextNonHidden(c);

    choicesEnumerableAspect.forEach = (f) => {
        let choice = choicesGetNextAspect.getHead();
        while(choice){
            if (!choice.isOptionHidden)
                f(choice);
            choice = choicesGetNextAspect.getNext(choice);
        }
    }    

    var origAddFilterFacade = filterListAspect.addFilterFacade;
    filterListAspect.addFilterFacade = (choice) => {
        if ( !choice.isOptionHidden ) {
            origAddFilterFacade(choice);
        }
    }
    
    var origInsertFilterFacade = filterListAspect.insertFilterFacade;
    filterListAspect.insertFilterFacade = (choice) => {
        if ( !choice.isOptionHidden ){
            origInsertFilterFacade(choice);
        }
    }

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

    let origInsertChoiceItem = choiceFactoryAspect.insertChoiceItem;
    let origPushChoiceItem = choiceFactoryAspect.pushChoiceItem;
        
    
    choiceFactoryAspect.insertChoiceItem=(choice,setFocus, createPick, adoptChoiceElement)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origInsertChoiceItem(choice,setFocus, createPick, adoptChoiceElement);
        }
    }
    
    choiceFactoryAspect.pushChoiceItem=(choice,setFocus, createPick, adoptChoiceElement)=>{
        if (choice.isOptionHidden){ 
            buildHiddenChoice(choice);
        }
        else{ 
            origPushChoiceItem(choice,setFocus, createPick, adoptChoiceElement);
        }
    }

    return {
        afterConstructor(multiSelect){
            var origIsSelectable = multiSelect.isSelectable.bind(multiSelect);
            multiSelect.isSelectable = (choice) => origIsSelectable(choice) && !choice.isOptionHidden;
        
            function updateHidden(choice) {
                if (choice.isOptionHidden) {
                    filterListAspect.remove(choice);
                    choice.remove(); 
                    buildHiddenChoice(choice);
                } else {
                    let nextChoice = getNextNonHidden(choice);
                    filterListAspect.add(choice, nextChoice);
                    choicesElementAspect.createChoiceElement(choice,
                        ()=>multiSelect.filterPanel.setFocus(),
                        (c)=>multiSelect.createPick(c),
                        (c,e)=>multiSelect.aspect.adoptChoiceElement(c,e) 
                        );
                    choice.choiceElementAttach(nextChoice?.choiceElement);
                }
            }
            
            multiSelect.updateHidden = (c) => updateHidden(c);
        
            function UpdateOptionHidden(key){
                let choice = multiSelect.choices.get(key);
                updateHiddenChoice(choice, (c)=>multiSelect.updateHidden(c), getIsOptionHidden)
            }
            
            function UpdateOptionsHidden(){
                let options = multiSelect.dataSourceAspect.getOptions();
                for(let i = 0; i<options.length; i++){
                    UpdateOptionHidden(i)
                }
            }
        
            multiSelect.UpdateOptionsHidden = () => UpdateOptionsHidden();
            multiSelect.UpdateOptionHidden = (key) => UpdateOptionHidden(key);
        
            var origСreateChoice = multiSelect.optionAspect.createChoice;
        
            multiSelect.optionAspect.createChoice = (option) => {
                let choice = origСreateChoice(option);
                choice.isOptionHidden = getIsOptionHidden(option);
                return choice;
            };
        }
    }
}

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