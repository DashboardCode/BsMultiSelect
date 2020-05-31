export class MultiSelect {
    constructor(
        dataSourceAspect,
        choicesDom,
        choices, 
        picks,
        choicesAspect,
        manageableResetFilterListAspect,
        multiSelectInputAspect,
        disabledComponentAspect, appearanceAspect) {

        this.dataSourceAspect=dataSourceAspect;
        this.choicesDom = choicesDom;

        this.choices =  choices;
        this.picks = picks;


        this.choicesAspect = choicesAspect;

        this.manageableResetFilterListAspect=manageableResetFilterListAspect;

        this.multiSelectInputAspect = multiSelectInputAspect;
        this.disabledComponentAspect = disabledComponentAspect;
        this.appearanceAspect=appearanceAspect;
    }
    
    update(){
        this.updateData();
        this.updateAppearance();
    }

    // used in placeHolderPlugin
    updateData(){
        // close drop down , remove filter
        this.multiSelectInputAspect.hideChoices(); // always hide 1st
        this.manageableResetFilterListAspect.resetFilter();

        this.choicesDom.choicesElement.innerHTML = ""; // TODO: there should better "optimization"
        
        this.choices.clear();
        this.picks.clear();

        this.choicesAspect.updateDataImpl(
            (c,e) => this.multiSelectInputAspect.adoptChoiceElement(c,e),
            (o,s) => this.multiSelectInputAspect.handleOnRemoveButton(o,s)
        );
    }

    updateAppearance(){
        this.appearanceAspect.updateAppearance();    
    }

    updateDisabled(){
        this.disabledComponentAspect.updateDisabled();    
    }

    updateOptionsDisabled(){
        this.choices.forLoop(
            choice => {
                let newIsDisabled = multiSelect.dataSourceAspect.getDisabled(choice.option);
                if (newIsDisabled != choice.isOptionDisabled)
                {
                    choice.isOptionDisabled= newIsDisabled;
                    choice.updateDisabled();
                }
            }
        );
    }

    // used in FormRestoreOnBackwardPlugin
    updateOptionsSelected(){
        this.choices.forLoop(
            choice => {
                let newIsSelected = this.dataSourceAspect.getSelected(choice.option);
                if (newIsSelected != choice.isOptionSelected)
                {
                    choice.isOptionSelected = newIsSelected;
                    choice.updateSelected();
                }
            }
        );
    }
}