import  { ExtendIfUndefined } from './Tools';

import  { addClass, removeClass } from './DomTools';

const MultiSelectСlassesDefaults = {
    containerClass: 'dashboardcode-bsmultiselect',

    dropDownMenuClass: 'dropdown-menu',

    dropDownItemClass: 'px-2',
    dropDownItemHoverClass: 'text-primary bg-light', // TODO looks like bullshit
    dropDownItemSelectedClass: '', // not used? should be used in OptionsPanel.js
    dropDownItemDisabledClass: '', // not used? should be used in OptionsPanel.js

    selectedPanelClass: 'form-control',  
    selectedPanelFocusClass: '', //  TODO: integrate with methodCss ('focus')
    selectedPanelDisabledClass: '', // TODO: integrate with methodCss ('disabled')

    selectedItemClass: 'badge',
    selectedItemDisabledClass: '', // not used? should be used in PicksPanel.js
    
    removeSelectedItemButtonClass: 'close',
    selectedItemFilterClass: '',
    filterInputClass: ''
}


function Bs4Styling(stylingMethod, configuration) {
    ExtendIfUndefined(configuration, MultiSelectСlassesDefaults);

    return {
        Init(composite){
            addClass(composite.container, configuration.containerClass);
            addClass(composite.selectedPanel, configuration.selectedPanelClass);
            addClass(composite.dropDownMenu, configuration.dropDownMenuClass);
            addClass(composite.filterInputItem, configuration.filterInputItemClass);
            addClass(composite.filterInput, configuration.filterInputClass);
            if (stylingMethod.OnInit)
                stylingMethod.OnInit(composite)
        },

        Enable(composite){
            removeClass(composite.selectedPanel, configuration.selectedPanelDisabledClass);
            stylingMethod.Enable(composite.selectedPanel)
        },

        Disable(composite){
            addClass(composite.selectedPanel, configuration.selectedPanelDisabledClass);
            stylingMethod.Disable(composite.selectedPanel)
        },

        FocusIn(composite){
            addClass(composite.selectedPanel, configuration.selectedPanelFocusClass);
            stylingMethod.FocusIn(composite.selectedPanel)
        },

        FocusOut(composite){
            removeClass(composite.selectedPanel, configuration.selectedPanelFocusClass);
            stylingMethod.FocusOut(composite.selectedPanel)
        },

        HoverIn(dropDownItem){
            addClass(dropDownItem, configuration.dropDownItemHoverClass);
        },

        HoverOut(dropDownItem){
            removeClass(dropDownItem, configuration.dropDownItemHoverClass);
        }
    }
}

export {Bs4Styling, MultiSelectСlassesDefaults};