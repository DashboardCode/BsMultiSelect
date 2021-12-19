import {composeSync} from '../ToolsJs';
import {toggleStyling} from '../ToolsStyling';

export function SelectedOptionPlugin(){
    return {
        plug
    }
}

export function plug(configuration){ 
    let isChoiceSelectableAspect = IsChoiceSelectableAspect();
    return (aspects) => {
        aspects.isChoiceSelectableAspect=isChoiceSelectableAspect;
        let {getSelected : getIsOptionSelected, setSelected : setIsOptionSelected, options} = configuration;
        if (options) {
            if (!setIsOptionSelected){
                setIsOptionSelected = (option, value) => {option.selected = value};
            }
            if (!getIsOptionSelected)
                getIsOptionSelected = (option) => option.selected;     
        } else { // selectElement
            if (!getIsOptionSelected){
                getIsOptionSelected = (option) => option.selected;
            }
            if (!setIsOptionSelected){
                setIsOptionSelected = (option, value) => {option.selected = value};
                // NOTE: adding this (setAttribute) break Chrome's html form reset functionality:
                // if (value) option.setAttribute('selected','');
                // else option.removeAttribute('selected');
            }
        }
    
        var getSelectedAspect = {getSelected: getIsOptionSelected};
        var setSelectedAspect = {setSelected: setIsOptionSelected};
        aspects.getSelectedAspect=getSelectedAspect;
        aspects.setSelectedAspect=setSelectedAspect;

        return {
            plugStaticDom: ()=> {
                // TODO: move to createEventHandlers
                let {wrapsCollection} = aspects;
                aspects.updateOptionsSelectedAspect = UpdateOptionsSelectedAspect(wrapsCollection, getSelectedAspect);
            },
            layout: () => {
                let {wrapsCollection, updateOptionsSelectedAspect,
                    createWrapAspect, produceChoiceAspect,
                    resetLayoutAspect, picksList,
                    producePickAspect, 
                    onChangeAspect, filterPredicateAspect
                    } = aspects;
                
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
                    var confirmed = setSelectedAspect.setSelected(option, booleanValue); 
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
                    wrap.isOptionSelected = getSelectedAspect.getSelected(option);
                    wrap.updateSelected = null; // can it be combined ?
                    return wrap;
                }
                
            
                ExtendProducePickAspect(producePickAspect, trySetWrapSelected, composeUpdateSelected);
                
                return {
                    buildApi(api){
                        api.selectAll= ()=>{
                            resetLayoutAspect.resetLayout(); // always hide 1st
                            wrapsCollection.forLoop(
                                wrap => {
                                    if (isChoiceSelectableAspect.isSelectable(wrap) &&  !wrap.isOptionSelected)
                                        trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true)
                                }
                            ); 
                        }
                    
                        api.deselectAll= ()=>{
                            resetLayoutAspect.resetLayout(); // always hide 1st
                            picksList.forEach(pick=>pick.setSelectedFalse())
                        }
                    
                        api.setOptionSelected = (key, value) => {
                            let wrap = wrapsCollection.get(key);
                            return trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, value), value);
                        }
                    
                        // used in FormRestoreOnBackwardPlugin
                        api.updateOptionsSelected = () => updateOptionsSelectedAspect.updateOptionsSelected();
                        api.updateOptionSelected = (key) => updateChoiceSelected(wrapsCollection.get(key), getSelectedAspect)
                    }
                }
            }
        }
    }
}

function ExtendProduceChoiceAspectProduceChoice(produceChoiceAspect, onChangeAspect, trySetWrapSelected, composeUpdateSelected, producePickAspect, picksList){
    let  orig = produceChoiceAspect.produceChoice;
    produceChoiceAspect.produceChoice = (wrap) => {
        let val = orig(wrap);
        wrap.choice.choiceDomManagerHandlers.updateSelected();

        wrap.choice.tryToggleChoice = ()=>
            trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, !wrap.isOptionSelected), !wrap.isOptionSelected) 

        wrap.choice.fullMatch = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, true), true);

        wrap.choice.choiсeClick = (event) =>{ let wasToggled = wrap.choice.tryToggleChoice();} // TODO: add fail message?

        wrap.updateSelected = () => {
            wrap.choice.choiceDomManagerHandlers.updateSelected();
            onChangeAspect.onChange();
        }

        // addPickForChoice used only in load loop; updateSelected on toggle
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
            return pickHandlers; //removeAndDispose
        }

        wrap.dispose = composeSync( ()=>{
            wrap.updateSelected = null;
            wrap.choice.choiсeClick = null;
            wrap.choice.tryToggleChoice = null;
            wrap.choice.fullMatch = null;
            wrap.choice.addPickForChoice = null;
        }, wrap.dispose)
        return val;
    }
}

function ExtendProducePickAspect(producePickAspect, trySetWrapSelected, composeUpdateSelected){
    let orig = producePickAspect.producePick;
    producePickAspect.producePick = function(wrap, pickHandlers){
        let pick = orig(wrap, pickHandlers);
        pick.setSelectedFalse = () => trySetWrapSelected(wrap.option, composeUpdateSelected(wrap, false), false);
        pick.dispose = composeSync(
            pick.dispose, ()=> {pick.setSelectedFalse = null}
        );
        return pick;
    }
}

function ExtendChoiceDomFactory(choiceDomFactory, css, createElementAspect,  dataWrap){

    var updateDataInternal = function(wrap, element){
        element.textContent = dataWrap.getText(wrap.option);
    }

    let orig = choiceDomFactory.create;
    choiceDomFactory.create = function(choiceElement, wrap){
        orig(choiceElement, wrap);
        choiceHoverToggle = toggleStyling(choiceElement, () =>
            (wrap.isOptionDisabled===true && css.choice_disabled_hover && wrap.isOptionSelected===false)?
                css.choice_disabled_hover:css.choice_hover
        );

        createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
        let choiceContentElement = choiceElement.querySelector('DIV');
        let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
        let choiceLabelElement = choiceContentElement.querySelector('LABEL');
        
        addStyling(choiceContentElement,  css.choiceContent); 
        addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
        addStyling(choiceLabelElement,    css.choiceLabel); 

        choiceDom.choiceContentElement = choiceContentElement;
        choiceDom.choiceCheckBoxElement = choiceCheckBoxElement;
        choiceDom.choiceLabelElement = choiceLabelElement;
        
        let choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);
        let updateSelected = function(){ 
            choiceSelectedToggle(wrap.isOptionSelected);
            choiceCheckBoxElement.checked = wrap.isOptionSelected;
            if (wrap.isOptionDisabled || wrap.choice.isHoverIn){
                choiceHoverToggle(wrap.choice.isHoverIn, true);
            }
        }

        let choiceDisabledToggle = toggleStyling(choiceElement, css.choice_disabled);
        let choiceCheckBoxDisabledToggle = toggleStyling(choiceCheckBoxElement, css.choiceCheckBox_disabled);
        let choiceLabelDisabledToggle = toggleStyling(choiceLabelElement, css.choiceLabel_disabled);
        let choiceCursorDisabledToggle = toggleStyling(choiceElement, {classes:[], styles:{cursor:"default"}}); 
        let updateDisabled = function(){
            choiceDisabledToggle(wrap.isOptionDisabled);
            choiceCheckBoxDisabledToggle(wrap.isOptionDisabled);
            choiceLabelDisabledToggle(wrap.isOptionDisabled);
    
            // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
            let isCheckBoxDisabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
            choiceCheckBoxElement.disabled = isCheckBoxDisabled;
            choiceCursorDisabledToggle(isCheckBoxDisabled);
        }

        choiceDomManagerHandlers.updateData = ()=>updateDataInternal(wrap, choiceLabelElement);
        choiceDomManagerHandlers.updateHoverIn = updateHoverIn;
        choiceDomManagerHandlers.updateSelected = updateSelected;
        choiceDomManagerHandlers.updateDisabled = updateDisabled;
        composeSync(choice.dispose, ()=>{  
            choiceDomManagerHandlers.updateData = null;
            choiceDomManagerHandlers.updateHoverIn = null;
            choiceDomManagerHandlers.updateSelected = null;
            choiceDomManagerHandlers.updateDisabled = null;
            choiceDom.choiceContentElement = null;
            choiceDom.choiceCheckBoxElement = null;
            choiceDom.choiceLabelElement = null;
        });

        choiceDomManagerHandlers.updateData();

        let updateHoverIn = function(){
            choiceHoverToggle(wrap.choice.isHoverIn);
        }
        choiceDomManagerHandlers.updateHoverIn=updateHoverIn;

        let eventBinder = EventBinder();
        eventBinder.bind(choiceElement, "click", event=>choice.choiсeClick(event) );

        composeSync(choice.dispose, ()=>{  eventBinder.unbind(); });
    }
}


function UpdateOptionsSelectedAspect(wrapsCollection, getSelectedAspect){
    return {
        updateOptionsSelected(){
            wrapsCollection.forLoop( wrap => updateChoiceSelected(wrap, getSelectedAspect));
        }
    }
}

function updateChoiceSelected(wrap, getSelectedAspect){
    let newIsSelected = getSelectedAspect.getSelected(wrap.option);
    if (newIsSelected != wrap.isOptionSelected)
    {
        wrap.isOptionSelected = newIsSelected;
        wrap.updateSelected?.(); // some hidden oesn't have element (and need to be updated)
    }
}

export function IsChoiceSelectableAspect(){ // TODO rename to IsSelectableByUserAspect ?
    return {
        isSelectable: (wrap)=>true 
    }
}
