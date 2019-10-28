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

    constructor(stylingAdapter, configuration, $){
        this.stylingAdapter = stylingAdapter;
        this.configuration = ExtendIfUndefinedFluent(configuration, defaults);
        this.$ = $;
        this.bs4LabelDispose = null;
    }
   
    Init(dom){
        dom.container.addClass(this.configuration.containerClass);
        dom.selectedPanel.addClass(this.configuration.selectedPanelClass);
        dom.dropDownMenu.addClass(this.configuration.dropDownMenuClass);
        dom.filterInputItem.addClass(this.configuration.filterInputItemClass);
        dom.filterInput.addClass(this.configuration.filterInputClass);
        if (this.stylingAdapter.OnInit)
            this.stylingAdapter.OnInit(dom)
        //this.bs4LabelDispose = this.handleLabel(dom.filterInput);
    }

    // handleLabel($filterInput){
    //     var label = this.configuration.label;
    //     if (label!=null) {
    //         var newForId = this.configuration.createInputId();
    //         var backupForId =  label.getAttribute('for');
    //         $filterInput.attr('id', newForId);
    //         label.setAttribute('for',newForId);
    //         return () => {
    //             label.setAttribute('for',backupForId);
    //         }
    //     }
    //     return null;
    // }

    // Dispose(){
    //     if (this.bs4LabelDispose)
    //         this.bs4LabelDispose();
    // }

    UpdateIsValid($selectedPanel){
        if (this.configuration.getIsValid()){
            $selectedPanel.addClass("is-valid");
        }

        if (this.configuration.getIsInvalid()){
            $selectedPanel.addClass("is-invalid");
        }
    }

    UpdateSize($selectedPanel){
        if(this.stylingAdapter.UpdateSize)
            this.stylingAdapter.UpdateSize($selectedPanel)
    }

    HoverIn($dropDownItem){
        $dropDownItem.addClass(this.configuration.dropDownItemHoverClass);
    }

    HoverOut($dropDownItem){
        $dropDownItem.removeClass(this.configuration.dropDownItemHoverClass);
    }

    Enable($selectedPanel){
        this.stylingAdapter.Enable($selectedPanel)
    }

    Disable($selectedPanel){
        this.stylingAdapter.Disable($selectedPanel)
    }

    FocusIn($selectedPanel){
        this.stylingAdapter.FocusIn($selectedPanel)
    }

    FocusOut($selectedPanel){
        this.stylingAdapter.FocusOut($selectedPanel)
    }
}

export default Bs4Adapter;
