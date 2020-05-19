export const css = {
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
    choiceLabel_disabled: ''  
}

export const cssPatch = {
    choices: {listStyleType:'none'},
    picks: {listStyleType:'none', display:'flex', flexWrap:'wrap',  height: 'auto', marginBottom: '0'},
    choice: 'px-md-2 px-1',  
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
    pick: {paddingLeft: '0px', lineHeight: '1.5em'},
    pickButton: {fontSize:'1.5em', lineHeight: '.9em', float : "none"},
    pickContent_disabled: {opacity: '.65'}, 
    
    // used in choiceContentGenerator
    choiceContent: {justifyContent: 'flex-start'}, // BS problem: without this on inline form menu items justified center
    choiceLabel: {color: 'inherit'}, // otherwise BS .was-validated set its color
    choiceCheckBox: {color: 'inherit'},
    choiceLabel_disabled: {opacity: '.65'}  // more flexible than {color: '#6c757d'}; note: avoid opacity on pickElement's border; TODO write to BS4 
};