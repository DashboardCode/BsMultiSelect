import {closestByClassName} from '../ToolsDom'

export function Bs5Plugin(){
}

Bs5Plugin.plugDefaultConfig = (defaults) => {
    defaults.css = css;
    setDefaults(defaults);
}


function setDefaults(defaults){
    defaults.useCssPatch = true;
    defaults.cssPatch = cssPatch;
    defaults.pickButtonHTML = '<button aria-label="Remove" tabIndex="-1" type="button"></button>'
    defaults.composeGetSize = composeGetSize;
    defaults.getDefaultLabel = getDefaultLabel;
}

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
            if (selectElement.classList.contains('form-select-lg') || selectElement.classList.contains('form-control-lg')) // changed for BS
                value = 'lg';
            else if (selectElement.classList.contains('form-select-sm') || selectElement.classList.contains('form-control-sm'))
                value = 'sm'; 
            return value;
        }
    }
    return getSize;
}

function getDefaultLabel(selectElement){
    let value = null;
    let query = `label[for="${selectElement.id}"]`;
    let p1 = selectElement.parentElement;
    value = p1.querySelector(query); // label can be wrapped into col-auto
    if (!value){
        let p2 = p1.parentElement;
        value = p2.querySelector(query);
    }
    return value;
}

const css = {
    choices: 'dropdown-menu', // bs, in bsmultiselect.scss as div.dropdown-menu
    choicesList: '', // bs, in bsmultiselect.scss as div.dropdown-menu>ul (first child)
    choice_hover:  'hover',  //  not bs, in scss as 'ul.dropdown-menu li.hover'
    choice_selected: '', 
    choice_disabled: '', 

    picks: 'form-control',  // bs, in scss 'ul.form-control'
    picks_focus: 'focus', // not bs, in scss 'ul.form-control.focus'
    picks_disabled: 'disabled', //  not bs, in scss 'ul.form-control.disabled'
    pick_disabled: '',  
    
    pickFilter: '', 
    filterInput: '',

    // used in pickContentGenerator
    pick: 'badge text-dark', // bs
    pickContent: '',
    pickContent_disabled: 'disabled', // not bs, in scss 'ul.form-control li span.disabled'
    pickButton: 'btn-close', // bs

    // used in choiceContentGenerator
    // choice:  'dropdown-item', // it seems like hover should be managed manually since there should be keyboard support
    choiceCheckBox_disabled: 'disabled', //  not bs, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    choiceContent: 'form-check', // bs d-flex required for rtl to align items
    choiceCheckBox: 'form-check-input', // bs
    choiceLabel: 'form-check-label',
    choiceLabel_disabled: '',

    label_floating_lifted: 'floating-lifted',
    picks_floating_lifted: 'floating-lifted',

    warning: 'alert-warning',
}

const cssPatch = {
    choicesList: {listStyleType:'none', paddingLeft:'0', paddingRight:'0', marginBottom:'0'},
    picks: {listStyleType:'none', display:'flex', flexWrap:'wrap',  height: 'auto', marginBottom: '0', cursor: 'text'},
    choice: {classes:'px-md-2 px-1', styles:{cursor:'pointer'}},
    choice_hover: 'text-primary bg-light', 
    filterInput: {
        border:'0px', height: 'auto', boxShadow:'none', 
        padding:'0', margin:'0', 
        outline:'none', backgroundColor:'transparent',
        backgroundImage: 'none' // otherwise BS .was-validated set its image
    },
    filterInput_empty: 'form-control', // need for placeholder, TODO test form-control-plaintext

    // used in PicksDom
    picks_disabled: {backgroundColor: '#e9ecef'},

    picks_focus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'},
    picks_focus_valid: {borderColor: '',  boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
    picks_focus_invalid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},
    
    // used in BsAppearancePlugin
    picks_def: {minHeight: 'calc(2.25rem + 2px)'},
    picks_lg:  {minHeight: 'calc(2.875rem + 2px)'},
    picks_sm:  {minHeight: 'calc(1.8125rem + 2px)'},
    picks_floating_def: {minHeight: 'calc(3.5rem + 2px)'},
    
    // used in pickContentGenerator
    pick: {paddingLeft: '0', paddingRight: '.5rem', paddingInlineStart:'0', paddingInlineEnd:'0.5rem'},
    pickButton: {fontSize:'0.8em',  float : "none", verticalAlign: "text-top"},
    pickContent_disabled: {opacity: '.65'}, 
    
    // used in choiceContentGenerator
    choiceContent: {justifyContent: 'flex-start', cursor:'inherit'}, // BS problem: without this on inline form menu items justified center
    choiceLabel: {color: 'inherit', cursor:'inherit'}, // otherwise BS .was-validated set its color
    choiceCheckBox: {color: 'inherit', cursor:'inherit'},
    choiceLabel_disabled: {opacity: '.65'},  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS 

    // floating plugin
    label_floating_lifted: {opacity: '.65', transform : 'scale(.85) translateY(-.5rem) translateX(.15rem)'},
    picks_floating_lifted: {paddingTop: '1.625rem', paddingLeft:'0.8rem', paddingBottom : '0'},

    warning: {paddingLeft: '.25rem', paddingRight: '.25rem', zIndex: 4,  fontSize:'small', backgroundColor: 'var(--bs-warning)'}, // zIndex=4  since the input-group zIndex=3
}

