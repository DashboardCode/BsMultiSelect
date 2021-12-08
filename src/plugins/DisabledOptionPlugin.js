import {composeSync} from '../ToolsJs';
import {toggleStyling} from '../ToolsStyling';

export function DisabledOptionCssPatchPlugin(defaults){
    defaults.cssPatch.pickContent_disabled = {opacity: '.65'};
}

export function DisabledOptionPlugin(defaults){
    defaults.css.pickContent_disabled = 'disabled';
    return {
        plug    
    }
}

export function plug(configuration){
    return (aspects) => {
        return {
            layout: () => {
                let {isChoiceSelectableAspect, createWrapAspect,  produceChoiceAspect,
                    filterPredicateAspect, wrapsCollection,  producePickAspect, pickDomFactory } = aspects;
                
                let {getIsOptionDisabled, options, css} = configuration;
                if (options) {
                    if (!getIsOptionDisabled)
                        getIsOptionDisabled = (option) => (option.disabled===undefined) ? false : option.disabled;     
                } else { // selectElement
                    if (!getIsOptionDisabled)
                        getIsOptionDisabled = (option) => option.disabled;
                }
            
                // TODO check this instead of wrap.updateDisabled
                // function updateDisabled(wrap){
                //     wrap?.choice?.choiceDomManagerHandlers?.updateDisabled?.();
                //     wrap?.pick?.pickDomManagerHandlers?.updateDisabled?.();
                // }
            
                let origCreateWrap = createWrapAspect.createWrap;
                createWrapAspect.createWrap = (option) => {
                    let wrap = origCreateWrap(option);
                    wrap.isOptionDisabled = getIsOptionDisabled(option); // TODO: remove usage wrap.isOptionDisabled
                    wrap.updateDisabled = null; 
                    return wrap;
                };
            
                
            
                let origIsSelectable = isChoiceSelectableAspect.isSelectable;
                isChoiceSelectableAspect.isSelectable = (wrap) => {
                    return  origIsSelectable(wrap) && !wrap.isOptionDisabled;
                };
            
                let origFilterPredicate = filterPredicateAspect.filterPredicate;
                filterPredicateAspect.filterPredicate = (wrap, text) => {
                    return  !wrap.isOptionDisabled && origFilterPredicate(wrap, text) ;
                };
            
                ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect);
                
                ExtendProducePickAspectProducePick(producePickAspect);
            
                ExtendPickDomFactoryCreate(pickDomFactory, css);

                return {
                    buildApi(api){
                        api.updateOptionsDisabled = () => wrapsCollection.forLoop( wrap => updateChoiceDisabled(wrap, getIsOptionDisabled))
                        api.updateOptionDisabled = (key) => updateChoiceDisabled(wrapsCollection.get(key), getIsOptionDisabled)
                    }
                };
            }
        }
    }
}

function ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect){
    let orig = produceChoiceAspect.produceChoice;
    produceChoiceAspect.produceChoice = (wrap) => {
        let val = orig(wrap);
        wrap.choice.choiceDomManagerHandlers.updateDisabled();
        wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled
        wrap.choice.dispose = composeSync(()=>{wrap.updateDisabled=null;}, wrap.choice.dispose);

        let origToggle = wrap.choice.tryToggleChoice;
        wrap.choice.tryToggleChoice = () => {
            let success = false;
            if (wrap.isOptionSelected!==undefined){
                if (wrap.isOptionSelected || !wrap.isOptionDisabled) // TODO: declare dependency on SelectedOptionPlugin
                    success = origToggle(wrap);
            }
            else{
                if (!wrap.isOptionDisabled) {
                    success = origToggle(wrap);
                }
            }
            return success;
        };

        return val;
    }
}

function ExtendProducePickAspectProducePick(producePickAspect){
    let orig = producePickAspect.producePick;
    producePickAspect.producePick = (wrap) => {
        let val = orig(wrap);
        let pick = wrap.pick;
        let choiceUpdateDisabledBackup = wrap.updateDisabled; // backup disable only choice
        wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, () => pick.pickDomManagerHandlers.updateDisabled()); // add pickDisabled
        pick.dispose = composeSync(pick.dispose, 
                ()=>{
                     wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled
                     wrap.updateDisabled(); // make "true disabled" without it checkbox only looks disabled
                }
        )
        return val;
    }
}

function ExtendPickDomFactoryCreate(pickDomFactory, css){
    let orig = pickDomFactory.create;
    pickDomFactory.create = (pick) => {
        orig(pick);
        let {pickDom, pickDomManagerHandlers} = pick;
        let disableToggle = toggleStyling(pickDom.pickContentElement, css.pickContent_disabled);
        pickDomManagerHandlers.updateDisabled = ()=>{
            disableToggle(pick.wrap.isOptionDisabled);
        }
        pickDomManagerHandlers.updateDisabled();
    }
}

function updateChoiceDisabled(wrap, getIsOptionDisabled){
    let newIsDisabled = getIsOptionDisabled(wrap.option);
    if (newIsDisabled != wrap.isOptionDisabled)
    {
        wrap.isOptionDisabled= newIsDisabled;
        wrap.updateDisabled?.(); // some hidden oesn't have element (and need to be updated)
    }
}