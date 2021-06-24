import {closestByClassName} from '../ToolsDom'

export function Bs4Plugin(){
}

Bs4Plugin.plugDefaultConfig = (defaults) => {
    defaults.css = css;
    setDefaults(defaults);
}

function setDefaults(defaults){
    defaults.useCssPatch = true;
    defaults.cssPatch = cssPatch;
    defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"><span aria-hidden="true">&times;</span></button>'
    defaults.composeGetSize = composeGetSize;
    defaults.getDefaultLabel = getDefaultLabel;
}

const css = {
    choices: 'dropdown-menu', // bs4, in bsmultiselect.scss as ul.dropdown-menu
    choicesList: '', // bs4, in bsmultiselect.scss as div.dropdown-menu>ul (first child)
    choice_hover:  'hover',  //  not bs4, in scss as 'ul.dropdown-menu li.hover'
    choice_selected: '', 
    choice_disabled: '', 

    picks: 'form-control',  // bs4, in scss 'ul.form-control'
    picks_focus: 'focus', // not bs4, in scss 'ul.form-control.focus'
    picks_disabled: 'disabled', //  not bs4, in scss 'ul.form-control.disabled'
    pick_disabled: '',  
    
    pickFilter: '', 
    filterInput: '',

    // used in pickContentGenerator
    pick: 'badge', // bs4
    pickContent: '',
    pickContent_disabled: 'disabled', // not bs4, in scss 'ul.form-control li span.disabled'
    pickButton: 'close', // bs4

    // used in choiceContentGenerator
    // choice:  'dropdown-item', // it seems like hover should be managed manually since there should be keyboard support
    choiceCheckBox_disabled: 'disabled', //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    choiceContent: 'custom-control custom-checkbox d-flex', // bs4 d-flex required for rtl to align items
    choiceCheckBox: 'custom-control-input', // bs4
    choiceLabel: 'custom-control-label justify-content-start',
    choiceLabel_disabled: '',

    warning: 'alert-warning bg-warning'
}

const cssPatch = {
    choicesList: {listStyleType:'none', paddingLeft:'0', paddingRight:'0', marginBottom:'0'},
    picks: {listStyleType:'none', display:'flex', flexWrap:'wrap',  height: 'auto', marginBottom: '0',cursor: 'text'},
    choice: {classes:'px-md-2 px-1', styles:{cursor:'pointer'}},    
    choice_hover: 'text-primary bg-light', 
    filterInput: {border:'0px', height: 'auto', boxShadow:'none', 
        padding:'0', margin:'0', 
        outline:'none', backgroundColor:'transparent',
        backgroundImage: 'none' // otherwise BS .was-validated set its image
    },
    filterInput_empty: 'form-control', // need for placeholder, TODO test form-control-plaintext

    // used in PicksDom
    picks_disabled: {backgroundColor: '#e9ecef'},

    picks_focus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'},
    picks_focus_valid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
    picks_focus_invalid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},
    
    // used in BsAppearancePlugin
    picks_def: {minHeight: 'calc(2.25rem + 2px)'},
    picks_lg:  {minHeight: 'calc(2.875rem + 2px)'},
    picks_sm:  {minHeight: 'calc(1.8125rem + 2px)'},
    
    // used in pickContentGenerator
    pick: {lineHeight: '1.5em', paddingLeft: '0', paddingRight: '.5rem', paddingInlineStart:'0', paddingInlineEnd:'0.5rem'},
    pickButton: {fontSize:'1.5em', lineHeight: '.9em', float : "none"},
    pickContent_disabled: {opacity: '.65'}, 
    
    // used in choiceContentGenerator
    choiceContent: {justifyContent: 'flex-start', cursor:'inherit'}, // BS problem: without this on inline form menu items justified center
    choiceLabel: {color: 'inherit', cursor:'inherit'}, // otherwise BS .was-validated set its color
    choiceCheckBox: {color: 'inherit', cursor:'inherit'},
    choiceLabel_disabled: {opacity: '.65'},  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 

    warning: {paddingLeft: '.25rem', paddingRight: '.25rem', zIndex: 4,  fontSize:'small', backgroundColor: 'var(--bs-warning)'}, // zIndex=4  since the input-group zIndex=3
};


function composeGetSize(selectElement){
    let inputGroupElement = closestByClassName(selectElement, 'input-group');
    let getSize = null;
    if (inputGroupElement){
        getSize = function(){
            var value = null;
            if (inputGroupElement.classList.contains('input-group-lg'))
                value = 'lg';
            else if (inputGroupElement.classList.contains('input-group-sm'))
                value = 'sm';
            return value;
        }
    }
    else{ 
        getSize = function(){
            var value = null;
            if (selectElement.classList.contains('custom-select-lg') || selectElement.classList.contains('form-control-lg'))
                value = 'lg';
            else if (selectElement.classList.contains('custom-select-sm') || selectElement.classList.contains('form-control-sm'))
                value = 'sm'; 
            return value;
        }
    }
    return getSize;
}

function getDefaultLabel(selectElement){
    let value = null;
    let formGroup = closestByClassName(selectElement,'form-group');
    if (formGroup) 
        value = formGroup.querySelector(`label[for="${selectElement.id}"]`);
    return value;
}
