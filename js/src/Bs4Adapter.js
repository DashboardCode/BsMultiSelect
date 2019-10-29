import  { ExtendIfUndefinedFluent } from './Tools';

// addClass, removeClass, css, siblings('label'), hasClass, find('BUTTON').prop(..)
const defaults = {
    containerClass: 'dashboardcode-bsmultiselect',
    dropDownMenuClass: 'dropdown-menu',
    dropDownItemClass:  'px-2',
    dropDownItemHoverClass: 'text-primary bg-light',
    selectedPanelClass: 'form-control',
    selectedItemClass: 'badge',
    removeSelectedItemButtonClass: 'close',
    filterInputItemClass: '',
    filterInputClass: ''
}

class Bs4Adapter {

    constructor(stylingMethod, configuration){
        this.stylingMethod = stylingMethod;
        this.configuration = ExtendIfUndefinedFluent(configuration, defaults);
    }
   
    Init(dom){
        dom.container.addClass(this.configuration.containerClass);
        dom.selectedPanel.addClass(this.configuration.selectedPanelClass);
        dom.dropDownMenu.addClass(this.configuration.dropDownMenuClass);
        dom.filterInputItem.addClass(this.configuration.filterInputItemClass);
        dom.filterInput.addClass(this.configuration.filterInputClass);
        if (this.stylingMethod.OnInit)
            this.stylingMethod.OnInit(dom)
    }

    UpdateIsValid($selectedPanel, isValid, isInvalid){
        if (isValid){
            $selectedPanel.addClass("is-valid");
        }

        if (isInvalid){
            $selectedPanel.addClass("is-invalid");
        }
    }

    UpdateSize($selectedPanel){
        if(this.stylingMethod.UpdateSize)
            this.stylingMethod.UpdateSize($selectedPanel)
    }

    HoverIn($dropDownItem){
        $dropDownItem.addClass(this.configuration.dropDownItemHoverClass);
    }

    HoverOut($dropDownItem){
        $dropDownItem.removeClass(this.configuration.dropDownItemHoverClass);
    }

    Enable($selectedPanel){
        this.stylingMethod.Enable($selectedPanel)
    }

    Disable($selectedPanel){
        this.stylingMethod.Disable($selectedPanel)
    }

    FocusIn($selectedPanel){
        this.stylingMethod.FocusIn($selectedPanel)
    }

    FocusOut($selectedPanel){
        this.stylingMethod.FocusOut($selectedPanel)
    }
}

export default Bs4Adapter;
