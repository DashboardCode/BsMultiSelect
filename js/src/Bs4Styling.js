import  { ExtendIfUndefined } from './Tools';

// Bs4Styling
const bs4StylingDefaults = {
    containerClass: 'dashboardcode-bsmultiselect',
    dropDownMenuClass: 'dropdown-menu',
    dropDownItemClass:  'px-2',
    dropDownItemHoverClass: 'text-primary bg-light',
    selectedPanelClass: 'form-control',  
    selectedItemClass: 'badge',
    removeSelectedItemButtonClass: 'close',
    placeholderItemClass: '',
    filterInputItemClass: '',
    filterInputClass: '',
}

function Bs4Styling(stylingMethod, configuration, $) {
    ExtendIfUndefined(configuration, bs4StylingDefaults);

    return {
        Init(composite){
            composite.$container.addClass(configuration.containerClass);
            composite.$selectedPanel.addClass(configuration.selectedPanelClass);
            composite.$dropDownMenu.addClass(configuration.dropDownMenuClass);
            composite.$filterInputItem.addClass(configuration.filterInputItemClass);
            composite.$filterInput.addClass(configuration.filterInputClass);
            if (stylingMethod.OnInit)
                stylingMethod.OnInit(composite)
        },

        UpdateIsValid(composite, isValid, isInvalid){
            if (isValid)
                composite.$selectedPanel.addClass('is-valid');

            if (isInvalid)
                composite.$selectedPanel.addClass('is-invalid');
        },

        UpdateSize(composite, size){
                if (size=="custom-select-lg"){
                    composite.$selectedPanel.addClass('form-control-lg');
                    composite.$selectedPanel.removeClass('form-control-sm');
                }
                else if (size=="custom-select-sm"){
                    composite.$selectedPanel.removeClass('form-control-lg');
                    composite.$selectedPanel.addClass('form-control-sm');
                }
                else{
                    composite.$selectedPanel.removeClass('form-control-lg');
                    composite.$selectedPanel.removeClass('form-control-sm');
                }
            if(stylingMethod.UpdateSize)
               stylingMethod.UpdateSize(composite.$selectedPanel, size)
        },

        Enable(composite){
            stylingMethod.Enable(composite.$selectedPanel)
        },

        Disable(composite){
            stylingMethod.Disable(composite.$selectedPanel)
        },

        FocusIn(composite){
            stylingMethod.FocusIn(composite.$selectedPanel)
        },

        FocusOut(composite){
            stylingMethod.FocusOut(composite.$selectedPanel)
        },

        HoverIn(dropDownItem){
            $(dropDownItem).addClass(configuration.dropDownItemHoverClass);
        },

        HoverOut(dropDownItem){
            $(dropDownItem).removeClass(configuration.dropDownItemHoverClass);
        }
    }
    
}

export default Bs4Styling;