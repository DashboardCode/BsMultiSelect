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
                let {isChoiceSelectableAspect, createWrapAspect,  buildChoiceAspect,
                    filterPredicateAspect, wrapsCollection, optionToggleAspect, buildPickAspect } = aspects;
                
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
            
                let origToggle = optionToggleAspect.toggle;
                optionToggleAspect.toggle = (wrap) => {
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
            
                let origIsSelectable = isChoiceSelectableAspect.isSelectable;
                isChoiceSelectableAspect.isSelectable = (wrap) => {
                    return  origIsSelectable(wrap) && !wrap.isOptionDisabled;
                };
            
                let origFilterPredicate = filterPredicateAspect.filterPredicate;
                filterPredicateAspect.filterPredicate = (wrap, text) => {
                    return  !wrap.isOptionDisabled && origFilterPredicate(wrap, text) ;
                };
            
                let origBuildChoice = buildChoiceAspect.buildChoice;
                buildChoiceAspect.buildChoice = (wrap) => {
                    origBuildChoice(wrap);
                    wrap.updateDisabled = wrap.choice.choiceDomManagerHandlers.updateDisabled
                    wrap.choice.dispose = composeSync(()=>{wrap.updateDisabled=null;}, wrap.choice.dispose);
                }
                
                let origBuildPick = buildPickAspect.buildPick;
                buildPickAspect.buildPick = (wrap /*, removeOnButton*/) => {
                    let pick = origBuildPick(wrap /*, removeOnButton*/);
                    
                    let disableToggle = toggleStyling(pick.pickDom.pickContentElement, css.pickContent_disabled);
                    pick.pickDomManagerHandlers.updateDisabled = ()=>{
                        disableToggle(wrap.isOptionDisabled);
                    }

                    pick.pickDomManagerHandlers.updateDisabled();

                    pick.updateDisabled = () => pick.pickDomManagerHandlers.updateDisabled();
                    pick.dispose = composeSync(pick.dispose, ()=>{pick.updateDisabled=null});
            
                    let choiceUpdateDisabledBackup = wrap.updateDisabled;
                    wrap.updateDisabled = composeSync(choiceUpdateDisabledBackup, pick.updateDisabled); // add pickDisabled
                    pick.dispose = composeSync(pick.dispose, 
                        ()=>{
                            wrap.updateDisabled = choiceUpdateDisabledBackup; // remove pickDisabled
                            wrap.updateDisabled(); // make "true disabled" without it checkbox only looks disabled
                        }
                    )
                    return pick;
                }
            
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

function updateChoiceDisabled(wrap, getIsOptionDisabled){
    let newIsDisabled = getIsOptionDisabled(wrap.option);
    if (newIsDisabled != wrap.isOptionDisabled)
    {
        wrap.isOptionDisabled= newIsDisabled;
        wrap.updateDisabled?.(); // some hidden oesn't have element (and need to be updated)
    }
}