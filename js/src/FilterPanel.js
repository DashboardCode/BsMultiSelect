import Popper from 'popper.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul
function defFilterInputStyleSys(s) {s.width='2ch'; s.border='0'; s.padding='0'; s.outline='none'; s.backgroundColor='transparent' };
function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul
function removeElement(e) {e.parentNode.removeChild(e)}

function FilterPanel(bus) {
    
    var filterInput = document.createElement('INPUT'); 
    filterInput.setAttribute("type","search");
    filterInput.setAttribute("autocomplete","off");
        
    defFilterInputStyleSys(this.filterInput.style);

    filterInput.addEventListener('focusin', () => 
            this.styling.FocusIn(this.stylingComposite));
        
    filterInput.addEventListener('focusout', () => {
            if (!this.skipFocusout)
                this.styling.FocusOut(this.stylingComposite)
            });

    filterInput.addEventListener('keydown', (event) => {
            if ([38/*keyUp*/, 40/*keyDown*/, 13/*enter*/].indexOf(event.which)>=0 || (event.which == 9 && filterInput.value) ) {
                event.preventDefault();
            }
            if (event.which == 38) {
                bus.keyDownArrowUp();
            }
            else if (event.which == 40) {
                bus.keyDownArrowDown();
            }
            else if (event.which == 9 /*tab*/) {
                if (!filterInput.value) 
                    bus.closeDropDown();
            }
            else if (event.which == 8 /*backspace*/ )  {
                // NOTE: this will process backspace only if there are no text in the input field
                // If user will find this inconvinient, we will need to calculate something like this
                // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
                if (!filterInput.value)
                    bus.removeSelectedTail();
            }

            if ([38, 40, 13, 9].indexOf(event.which)==-1)
                bus.resetDropDownMenuHover();
        });
    
        filterInput.addEventListener('keyup', (event) => {
            if (event.which == 13 || event.which == 9 ) {
                console.log("TAB");
                if (this.hoveredMultiSelectData) {
                    this.hoveredMultiSelectData.toggle();
                    this.closeDropDown();
                } 
            }
            else if (event.which == 27) { // escape
                this.closeDropDown();
            }
            // TODO may be do it on "space" (when there is left only one)?
            else {
                let text = this.filterInput.value.trim().toLowerCase();
                let visibleMultiSelectDataList = this.getVisibleMultiSelectDataList();
                if (text && visibleMultiSelectDataList.length == 1)
                {
                    let fullMatchMultiSelectData=  visibleMultiSelectDataList[0];
                    if (fullMatchMultiSelectData.searchText == text)
                    {
                        fullMatchMultiSelectData.toggle();
                        // clear
                        this.filterInput.value = '';
                        this.processEmptyInput();
                        this.resetDropDownMenuHover();
                        this.hideDropDown();
                    }
                }
            }
        });
    
    filterInput.addEventListener('input', () => {
            var filterInputValue = filterInput.value;
            let text = filterInputValue.trim().toLowerCase();
            if (text=='')
                this.processEmptyInput();
            else
            {
                filterInput.style.width = filterInputValue.length*1.3 + 2 + "ch";
                this.visibleMultiSelectDataList = filterDropDownMenu(this.MultiSelectDataList, text);
            }

            this.resetDropDownMenuHover();

            if (this.getVisibleMultiSelectDataList().length == 1) {
                this.hoverInInternal(0)
            }

            if (this.getVisibleMultiSelectDataList().length > 0) {
                this.updateDropDownLocation(true); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)
                this.showDropDown();
            } else {
                this.hideDropDown();
            }
        });

    var filterPanel = {
        referenceObject=filterInput,
        labelReferencedInput=filterInput,
        isEmpty(){
            return filterInput.value ? false:true;
        },
        setEmpty(){
            filterInput.value ='';
            filterInput.length="2ch";
        },
        setFocus(){
            filterInput.focus();
        },
        hide(){
            filterInput.style.display = "none";
        },
        show(){
            filterInput.style.display = "inline-block";
        }
    }
    return filterPanel;
}

export default FilterPanel;
