import {EventBinder} from './ToolsDom';
import {addStyling, toggleStyling} from './ToolsStyling';
import {composeSync} from './ToolsJs';

function buildDom(choiceElement, choiceDom, createElementAspect, css){
    createElementAspect.createElementFromHtml(choiceElement, '<div><input formnovalidate type="checkbox"><label></label></div>');
    let choiceContentElement = choiceElement.querySelector('DIV');
    let choiceCheckBoxElement = choiceContentElement.querySelector('INPUT');
    let choiceLabelElement = choiceContentElement.querySelector('LABEL');
    
    choiceDom.choiceContentElement = choiceContentElement;
    choiceDom.choiceCheckBoxElement = choiceCheckBoxElement;
    choiceDom.choiceLabelElement = choiceLabelElement;

    addStyling(choiceContentElement,  css.choiceContent); 
    addStyling(choiceCheckBoxElement, css.choiceCheckBox); 
    addStyling(choiceLabelElement,    css.choiceLabel); 
}

function buidDisabled(choiceDom, choiceDomManagerHandlers, css, wrap){
    let choiceDisabledToggle = toggleStyling(choiceDom.choiceElement, css.choice_disabled);
    let choiceCheckBoxDisabledToggle = toggleStyling(choiceDom.choiceCheckBoxElement, css.choiceCheckBox_disabled);
    let choiceLabelDisabledToggle = toggleStyling(choiceDom.choiceLabelElement, css.choiceLabel_disabled);
    let choiceCursorDisabledToggle = toggleStyling(choiceDom.choiceElement, {classes:[], styles:{cursor:"default"}}); 
    
    let updateDisabled = function(){
        choiceDisabledToggle(wrap.isOptionDisabled);
        choiceCheckBoxDisabledToggle(wrap.isOptionDisabled);
        choiceLabelDisabledToggle(wrap.isOptionDisabled);

        // do not desable checkBox if option is selected! there should be possibility to unselect "disabled"
        let isCheckBoxDisabled = wrap.isOptionDisabled && !wrap.isOptionSelected;
        choiceDom.choiceCheckBoxElement.disabled = isCheckBoxDisabled;
        choiceCursorDisabledToggle(isCheckBoxDisabled);
    }
    choiceDomManagerHandlers.updateDisabled = updateDisabled;    
}

export function ChoiceDomFactory(css, createElementAspect,  dataWrap){
    //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
    return {
        create(choice){
            let wrap = choice.wrap;
            let {choiceDom, choiceDomManagerHandlers} = choice;
            let choiceElement = choice.choiceDom.choiceElement;

            buildDom(choiceElement, choiceDom, createElementAspect, css);
            
            // --- --- --- ---
            let choiceHoverToggle = toggleStyling(choiceElement, () =>
                    (wrap.isOptionDisabled===true && css.choice_disabled_hover && wrap.isOptionSelected===false)?
                        css.choice_disabled_hover:
                        css.choice_hover
            );

            //let choiceHoverToggle2 = toggleStyling(choiceElement, css.choice_disabled_hover, css.choice_hover);
            choiceDomManagerHandlers.updateHoverIn=()=>choiceHoverToggle(choice.isHoverIn);

            let choiceSelectedToggle = toggleStyling(choiceElement, css.choice_selected);
            let updateSelected = function(){ 
                choiceSelectedToggle(wrap.isOptionSelected);
                choiceDom.choiceCheckBoxElement.checked = wrap.isOptionSelected;
                if (wrap.isOptionDisabled || choice.isHoverIn){
                    choiceHoverToggle(choice.isHoverIn, true);
                    // choiceHoverToggle2(
                    //     choice.isHoverIn?(wrap.isOptionDisabled?1:2):0
                    // );
                }
            }
            choiceDomManagerHandlers.updateSelected = updateSelected;
            // --- --- --- ---

            buidDisabled(choiceDom, choiceDomManagerHandlers, css, wrap)

            choiceDomManagerHandlers.updateData = ()=> {choiceDom.choiceLabelElement.textContent = dataWrap.getText(wrap.option)};
                //updateDataInternal(wrap, choiceLabelElement, dataWrap);
            choiceDomManagerHandlers.updateData();

            let eventBinder = EventBinder();
            eventBinder.bind(choiceElement, "click", event=>choice.choiсeClick(event) );

            composeSync(choice.dispose, ()=>{  
                eventBinder.unbind(); 
                choiceDomManagerHandlers.updateData = null;
                choiceDomManagerHandlers.updateHoverIn = null;
                choiceDomManagerHandlers.updateSelected = null;
                choiceDomManagerHandlers.updateDisabled = null;
                choiceDom.choiceContentElement = null;
                choiceDom.choiceCheckBoxElement = null;
                choiceDom.choiceLabelElement = null;
            });
        }
    }
}

function ChoiceDomFactoryPlugCss(css){
    css.choiceCheckBox_disabled = 'disabled'; //  not bs, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    css.choiceLabel_disabled = '';
    css.choice_disabled_hover  = '';
    css.choice_hover = 'hover'; //  not bs, in scss as 'ul.dropdown-menu li.hover'
}

export function ChoiceDomFactoryPlugCssBs4(css){
    ChoiceDomFactoryPlugCss(css)
    css.choiceCheckBox = 'custom-control-input';
    css.choiceContent = 'custom-control custom-checkbox d-flex';
    css.choiceLabel = 'custom-control-label justify-content-start';
    css.choice_selected = '';
    css.choice_disabled = '';
}

export function ChoiceDomFactoryPlugCssBs5(css){
    ChoiceDomFactoryPlugCss(css)
    css.choiceCheckBox = 'form-check-input'; // bs
    css.choiceContent = 'form-check'; // bs d-flex required for rtl to align items
    css.choiceLabel = 'form-check-label';
    css.choice_selected = 'selected'; //  not bs,
    css.choice_disabled = 'disabled'; //  not bs,
}

export function ChoiceDomFactoryPlugCssPatch(cssPatch){
    cssPatch.choiceCheckBox = {color: 'inherit', cursor:'inherit'};
    cssPatch.choiceContent = {justifyContent: 'flex-start', cursor:'inherit'}; // BS problem: without this on inline form menu items justified center
    cssPatch.choiceLabel = {color: 'inherit', cursor:'inherit'}; // otherwise BS .was-validated set its color
    cssPatch.choiceLabel_disabled = {opacity: '.65'};  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 
    cssPatch.choice_disabled_hover = 'bg-light';
    cssPatch.choice_hover = 'bg-light text-primary';
}

export function ChoiceDomFactory2(css, createElementAspect, dataWrap){
    //TODO move check which aspects availbale like wrap.hasOwnProperty("isOptionSelected") to there
    return {
        create(choice){
            let wrap = choice.wrap;
            let {choiceDom, choiceDomManagerHandlers} = choice;
            let choiceElement = choice.choiceDom.choiceElement;

            choiceElement.innerHTML = '<span></span>';
            let choiceContentElement = choiceElement.querySelector('span');

            choiceDom.choiceContentElement = choiceContentElement;
            
            choiceDomManagerHandlers.updateData = () => {
                choiceContentElement.textContent = dataWrap.getText(wrap.option);
            }
            choiceDomManagerHandlers.updateData();

            let choiceHoverToggle = toggleStyling(choiceElement, css.choice_hover);

            choiceDomManagerHandlers.updateHoverIn = () => choiceHoverToggle(choice.isHoverIn);

            let eventBinder = EventBinder();
            eventBinder.bind(choiceElement, "click", event=>choice.choiсeClick(event));

            composeSync(choice.dispose, ()=>{ 
                choiceDomManagerHandlers.updateData = null;
                choiceDomManagerHandlers.updateHoverIn = null;
                choiceDom.choiceContentElement = null;
                eventBinder.unbind(); 
            });
        }
    }
}