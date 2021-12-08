import {composeSync} from '../ToolsJs';

// there wrap.isOptionSelected and wrap.updateSelected should be moved
export function SelectedPicksPlugin(){
    return {
        plug
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            layout: () => {
                let {wrapsCollection, 
                    createWrapAspect, produceChoiceAspect,
                    resetLayoutAspect, picksList, isChoiceSelectableAspect, 
                    producePickAspect,
                    onChangeAspect, filterPredicateAspect
                    } = aspects;
                let { options, picks, isOptionPicked, addPicked, removePicked } = configuration;
                
                // addPick = (option, key) => updateChoiceSelected(wrapsCollection.get(key), getIsOptionSelected)
                // removePick = (key) => updateChoiceSelected(picks.get(key), getIsOptionSelected)
                
                if (!options) {
                    throw 'SelectedPicksPlugin require options configuration';
                }
            
                if (!isOptionPicked)
                    isOptionPicked = (option) => picks.includes(option);

                if (!addPicked)
                    addPicked = (option, key) => {
                        picks.push(option);
                    }
                
                if (!removePicked)
                    removePicked = (key) => {
                        picks.splice(key, 1);
                    }
                
                let origFilterPredicate = filterPredicateAspect.filterPredicate;
                filterPredicateAspect.filterPredicate = (wrap, text) =>
                    !wrap.isOptionSelected  &&  origFilterPredicate(wrap, text)
                
                function composeUpdateSelected(wrap, booleanValue){
                    return () => {
                        wrap.isOptionSelected = booleanValue;
                        wrap.updateSelected();
                    }
                }
            
                function trySetWrapSelected(option, updateSelected, booleanValue){ //  wrap.option
                    let success = false;
                    var confirmed = setIsOptionSelected(option, booleanValue);
                    if (!(confirmed===false)) {
                        updateSelected();
                        success = true;
                    }
                    return success;
                }
            
                ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList);

                let origCreateWrap = createWrapAspect.createWrap;
                createWrapAspect.createWrap = (option)=>{
                    let wrap = origCreateWrap(option);
                    wrap.isOptionSelected = isOptionPicked(option);
                    wrap.updateSelected = null; // can it be combined ?
                    return wrap;
                }

            
            
                ExtendProducePickAspect(producePickAspect, trySetWrapSelected, composeUpdateSelected);

                return {
                    buildApi(api){
                        api.selectAll = () => {
                            resetLayoutAspect.resetLayout(); // always hide 1st
                            wrapsCollection.forLoop(
                                wrap => {
                                    if (isChoiceSelectableAspect.isSelectable(wrap) &&  !wrap.isOptionSelected)
                                        trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true)
                                }
                            ); 
                        }
                    
                        api.deselectAll = ()=>{
                            resetLayoutAspect.resetLayout(); // always hide 1st
                            picksList.forEach(pick=>pick.setSelectedFalse())
                        }
                    
                        api.setOptionSelected = (key, value) => {
                            let wrap = wrapsCollection.get(key);
                            return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, value), value);
                        }
                    
                        // used in FormRestoreOnBackwardPlugin
                        api.updateOptionsSelected = () => wrapsCollection.forLoop( wrap => updateChoiceSelected(wrap, isOptionPicked))
                        api.addPick = (option, key) => updateChoiceSelected(wrapsCollection.get(key), isOptionPicked)
                        api.removePick = (key) => updateChoiceSelected(picks.get(key), isOptionPicked)
                    }
                }
            
                function updateChoiceSelected(pick, isOptionPicked){
                    let newIsSelected = isOptionPicked(pick.option);
                    if (newIsSelected != wrap.isOptionSelected)
                    {
                        wrap.isOptionSelected = newIsSelected;
                        wrap.updateSelected?.(); // some hidden oesn't have element (and need to be updated)
                    }
                }
            }
        }
    }
}


function ExtendProducePickAspect(producePickAspect, trySetWrapSelected, composeUpdateSelected){
    let origProducePickAspectProducePick = producePickAspect.producePick;
    producePickAspect.producePick = function(wrap, pickHandlers){
        let pick = origProducePickAspectProducePick(wrap, pickHandlers);
        pick.setSelectedFalse = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);
        pick.dispose = composeSync(
            pick.dispose, ()=> {pick.setSelectedFalse = null}
        );
        return pick;
    }
}

function ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList){
    let  orig = produceChoiceAspect.produceChoice;
    produceChoiceAspect.produceChoice = (wrap) => {
        let val = orig(wrap);
        //wrap.choice.choiceDomManagerHandlers.updateSelected();

        wrap.choice.tryToggleChoice = ()=>
            trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected) 


        wrap.choice.choiсeClick = (event) =>{ let wasToggled = wrap.choice.tryToggleChoice();} // TODO: add fail message?

        wrap.updateSelected = () => {
            wrap.choice.choiceDomManagerHandlers.updateSelected();
            onChangeAspect.onChange();
        }

        wrap.choice.fullMatch = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);

        // this used only in load loop
        wrap.choice.addPickForChoice = () => {
            var pickHandlers = { 
                producePick: null,  // not redefined directly, but redefined in addPickAspect
                removeAndDispose: null,  // not redefined, used in MultiSelectInlineLayout injected into wrap.choice.choiceRemove 
            }
            
            pickHandlers.producePick = () => {
                let pick = producePickAspect.producePick(wrap);
                let {remove} = picksList.add(pick);
                pick.dispose = composeSync(remove, pick.dispose);
                pickHandlers.removeAndDispose = () => pick.dispose();
                return pick;
            }

            wrap.updateSelected = composeSync(
                ()=>{
                    if (wrap.isOptionSelected){
                        let pick = pickHandlers.producePick();
                        wrap.pick = pick;
                        pick.dispose = composeSync(pick.dispose, ()=>{wrap.pick=null;});
                    }
                    else {
                        pickHandlers.removeAndDispose();
                        pickHandlers.removeAndDispose=null;
                    }
                },
                wrap.updateSelected
            )

            if (wrap.isOptionSelected){
                let pick = pickHandlers.producePick();
                wrap.pick = pick;
                pick.dispose = composeSync(pick.dispose, ()=>{wrap.pick=null;});
            }
            return pickHandlers;
        }

        wrap.dispose = composeSync( ()=>{
            wrap.updateSelected = null;
            wrap.choice.tryToggleChoice = null;
            wrap.choice.choiсeClick = null;
            wrap.choice.fullMatch = null;
            wrap.choice.addPickForChoice = null;
        }, wrap.dispose)
        return val;

    }
}