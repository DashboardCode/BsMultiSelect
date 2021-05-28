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
            if (selectElement.classList.contains('form-select-lg') || selectElement.classList.contains('form-control-lg')) // changed for BS4
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
    choices: 'dropdown-menu', // bs4, in bsmultiselect.scss as ul.dropdown-menu
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
    pick: 'badge text-dark', // bs4
    pickContent: '',
    pickContent_disabled: 'disabled', // not bs4, in scss 'ul.form-control li span.disabled'
    pickButton: 'btn-close', // bs4

    // used in choiceContentGenerator
    // choice:  'dropdown-item', // it seems like hover should be managed manually since there should be keyboard support
    choiceCheckBox_disabled: 'disabled', //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    choiceContent: 'form-check', // bs4 d-flex required for rtl to align items
    choiceCheckBox: 'form-check-input', // bs4
    choiceLabel: 'form-check-label',
    choiceLabel_disabled: ''  
}

const cssPatch = {
    choices: {listStyleType:'none'},
    picks: {listStyleType:'none', display:'flex', flexWrap:'wrap',  height: 'auto', marginBottom: '0'},
    choice: 'px-md-2 px-1',  
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
    picks_focus_valid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
    picks_focus_invalid: {borderColor: '', boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},
    
    // used in BsAppearancePlugin
    picks_def: {minHeight: 'calc(2.25rem + 2px)'},
    picks_lg:  {minHeight: 'calc(2.875rem + 2px)'},
    picks_sm:  {minHeight: 'calc(1.8125rem + 2px)'},
    
    // used in pickContentGenerator
    pick: {paddingLeft: '0px' },
    pickButton: {fontSize:'0.8em',  float : "none", verticalAlign: "text-top"},
    pickContent_disabled: {opacity: '.65'}, 
    
    // used in choiceContentGenerator
    choiceContent: {justifyContent: 'flex-start'}, // BS problem: without this on inline form menu items justified center
    choiceLabel: {color: 'inherit'}, // otherwise BS .was-validated set its color
    choiceCheckBox: {color: 'inherit'},
    choiceLabel_disabled: {opacity: '.65'},  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 

    //floating plugin
    floating_choices: {minHeight: '58px'},
    floating_choices_empty_unfocus: {paddingTop: '1.625rem', paddingBottom : '.625rem', },
    floating_label_empty_unfocus: {opacity: '.65', transform : 'scale(.85) translateY(-.5rem) translateX(.15rem)'},
}

