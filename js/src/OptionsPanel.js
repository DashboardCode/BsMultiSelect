import Popper from 'popper.js'

function defSelectedPanelStyleSys(s) {s.display='flex'; s.flexWrap='wrap'; s.listStyleType='none'};  // remove bullets since this is ul
function defFilterInputStyleSys(s) {s.width='2ch'; s.border='0'; s.padding='0'; s.outline='none'; s.backgroundColor='transparent' };
function defDropDownMenuStyleSys(s) {s.listStyleType='none'}; // remove bullets since this is ul
function removeElement(e) {e.parentNode.removeChild(e)}

class OptionsPanel {
    constructor(){ 
        
    }
 
}

export default OptionsPanel;
