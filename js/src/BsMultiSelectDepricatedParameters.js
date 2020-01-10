export function adjustConfiguration(configuration){
    if (!configuration.classes)
        configuration.classes={}

    if (configuration["selectedPanelDisabledBackgroundColor"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelDisabledBackgroundColor is depricated, use - picks_disabled: {backgroundColor: '#e9ecef'}");
        if(!configuration["picks_disabled"]){
            configuration.picks_disabled={backgroundColor: configuration["selectedPanelDisabledBackgroundColor"]}
        }
        delete person.selectedPanelDisabledBackgroundColor;
    }
    if (configuration["selectedPanelFocusBorderColor"] || configuration["selectedPanelFocusBoxShadow"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusBorderColor and selectedPanelFocusBoxShadow are depricated, use - picks_focus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'}");
        if(!configuration["picks_focus"]){
            configuration.picks_focus= {boxShadow:  configuration["selectedPanelFocusBoxShadow"], borderColor: configuration["selectedPanelFocusBorderColor"]}
        }
        delete person.selectedPanelFocusBorderColor;
        delete person.selectedPanelFocusBoxShadow;
    }

    if (configuration["selectedPanelFocusValidBoxShadow"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusValidBoxShadow is depricated, use - picks_focus_valid: {boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'}");
        if(!configuration["picks_focus_valid"]){
            configuration.picks_focus_valid= {boxShadow:  configuration["selectedPanelFocusValidBoxShadow"]}
        }
        delete person.selectedPanelFocusValidBoxShadow;
    }
    if (configuration["selectedPanelFocusInvalidBoxShadow"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusInvalidBoxShadow is depricated, use - picks_focus_invalid: {boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'}");
        if(!configuration["picks_focus_invalid"]){
            configuration.picks_focus_invalid= {boxShadow:  configuration["selectedPanelFocusInvalidBoxShadow"]}
        }
        delete person.selectedPanelFocusInvalidBoxShadow;
    }
    if (configuration["selectedPanelDefMinHeight"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelDefMinHeight is depricated, use - picks_def: {minHeight: 'calc(2.25rem + 2px)'}");
        if(!configuration["picks_def"]){
            configuration.picks_def= {minHeight:  configuration["selectedPanelDefMinHeight"]}
        }
        delete person.selectedPanelDefMinHeight;
    }
    if (configuration["selectedPanelLgMinHeight"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelLgMinHeight is depricated, use - picks_lg:  {minHeight: 'calc(2.875rem + 2px)'}");
        if(!configuration["picks_lg"]){
            configuration.picks_lg= {minHeight:  configuration["selectedPanelLgMinHeight"]}
        }
        delete person.selectedPanelLgMinHeight;
    }
    if (configuration["selectedPanelSmMinHeight"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelSmMinHeight is depricated, use - picks_sm:  {minHeight: 'calc(1.8125rem + 2px)'}");
        if(!configuration["picks_sm"]){
            configuration.picks_sm= {minHeight:  configuration["selectedPanelSmMinHeight"]}
        }
        delete person.selectedPanelSmMinHeight;
    }
    if (configuration["selectedItemContentDisabledOpacity"]){
        console.log("DashboarCode.BsMultiSelect: selectedItemContentDisabledOpacity is depricated, use - choiceLabel_disabled: {opacity: '.65'}");
        if(!configuration["choiceLabel_disabled"]){
            configuration.choiceLabel_disabled= {opacity:  configuration["selectedItemContentDisabledOpacity"]}
        }
        delete person.selectedItemContentDisabledOpacity;
    }
    if (configuration["inputColor"]){
        console.log("inputColor is depricated, remove parameter");
        delete person.inputColor;
    }
    
    if (!configuration.styling)
        configuration.styling={}
    var styling =configuration.styling;
    if (configuration["dropDownMenuClass"]){
        console.log("DashboarCode.BsMultiSelect: dropDownMenuClass is depricated, use - styling.choices: 'dropdown-menu'");
        if(!styling["choices"]){
            styling.choices= configuration["dropDownMenuClass"]
        }
        delete person.dropDownMenuClass;
    }
    if (configuration["dropDownItemClass"]){
        console.log("DashboarCode.BsMultiSelect: dropDownItemClass is depricated, use - styling.choice: 'px-2'");
        if(!styling["choice"]){
            styling.choice= configuration["dropDownItemClass"]
        }
        delete person.dropDownItemClass;
    }

    if (configuration["dropDownItemHoverClass"]){
        console.log("DashboarCode.BsMultiSelect: dropDownItemHoverClass is depricated, use - styling.choice_hover: 'text-primary bg-light'");
        if(!styling["choice_hover"]){
            styling.choice_hover= configuration["dropDownItemHoverClass"]
        }
        delete person.dropDownItemHoverClass;
    }

    if (configuration["selectedPanelClass"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelClass is depricated, use - styling.picks: 'form-control'");
        if(!styling["picks"]){
            styling.picks= configuration["selectedPanelClass"]
        }
        delete person.selectedPanelClass;
    }

    if (configuration["selectedItemClass"]){
        console.log("DashboarCode.BsMultiSelect: selectedItemClass is depricated, use - styling.pick: 'badge'");
        if(!styling["pick"]){
            styling.pick= configuration["selectedItemClass"]
        }
        delete person.selectedItemClass;
    }

    if (configuration["removeSelectedItemButtonClass"]){
        console.log("DashboarCode.BsMultiSelect: removeSelectedItemButtonClass is depricated, use - styling.pickButton: 'close'");
        if(!styling["pickButton"]){
            styling.pickButton= configuration["removeSelectedItemButtonClass"]
        }
        delete person.removeSelectedItemButtonClass;
    }    

    if (configuration["filterInputItemClass"]){
        console.log("DashboarCode.BsMultiSelect: filterInputItemClass is depricated, use - styling.pickFilter: ''");
        if(!styling["pickFilter"]){
            styling.pickFilter= configuration["filterInputItemClass"]
        }
        delete person.filterInputItemClass;
    }    

    if (configuration["filterInputClass"]){
        console.log("DashboarCode.BsMultiSelect: filterInputClass is depricated, use - styling.filterInput: ''");
        if(!styling["filterInput"]){
            styling.filterInput= configuration["filterInputClass"]
        }
        delete person.filterInputClass;
    }    

    if (configuration["selectedPanelFocusClass"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelFocusClass is depricated, use - styling.picks_focus : 'focus'");
        if(!styling["picks_focus"]){
            styling.picks_focus= configuration["selectedPanelFocusClass"]
        }
        delete person.selectedPanelFocusClass;
    }  

    if (configuration["selectedPanelDisabledClass"]){
        console.log("DashboarCode.BsMultiSelect: selectedPanelDisabledClass is depricated, use - styling.picks_disabled: 'disabled'");
        if(!styling["picks_focus"]){
            styling.picks_focus= configuration["selectedPanelDisabledClass"]
        }
        delete person.selectedPanelDisabledClass;
    }  

    if (configuration["selectedItemContentDisabledClass"]){
        console.log("DashboarCode.BsMultiSelect: selectedItemContentDisabledClass is depricated, use - styling.pick_disabled: 'disabled'");
        if(!styling["pick_disabled"]){
            styling.pick_disabled= configuration["selectedItemContentDisabledClass"]
        }
        delete person.selectedItemContentDisabledClass;
    }  
}