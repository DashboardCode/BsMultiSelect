/*
// 1
<select name="States1" id="edit-states1-id" class="form-control" 
        multiple="multiple" style="display: none;"> <!-- plugin element-->
                <option value="AL">Alabama</option>
                <option value="AK" disabled="">Alaska</option>
</select>

// 2
<div class="dashboardcode-bsmultiselect"> 
    <div class="input-group" >
        <div class="input-group-prepend">
            <button class="btn btn-outline-secondary" type="button">Button</button>
        </div>

        <select name="States1" id="edit-states1-id" class="form-control"
            multiple="multiple" style="display: none;">  <!-- plugin element-->
                <option value="AL">Alabama</option>
                <option value="AK" disabled="">Alaska</option>
        </select>

        <ul class="form-control"></ul> <!-- optional - for "no flick" -->
    </div>
</div>

// 2
<div></div> 

// 3
<div class="dashboardcode-bsmultiselect">
    <div class="input-group" >
        <div class="input-group-prepend">
            <button class="btn btn-outline-secondary" type="button">Button</button>
        </div>

        <ul class="form-control"></ul> <!-- json plugin key element -->
    </div>
</div>
*/

export default function ContainerAdapter(createElement, selectElement, containerElement, picksElement) { // select
    var ownContainerElement = false;
    var ownPicksElement = false;
    
    if (!containerElement){
        containerElement = createElement('div');
        ownContainerElement= true;
    }
    if (!picksElement){
        picksElement = createElement('UL');
        ownPicksElement = true;
    }

    var optionsElement = createElement('UL');
    optionsElement.style.display="none";
    
    var backupDisplay = null;
    if (selectElement)
    { 
        backupDisplay = selectElement.style.display;
        selectElement.style.display='none';
    }
    
    return {
        container: containerElement,
        picksElement,
        optionsElement,
        init(){
            if (ownPicksElement)
                containerElement.appendChild(picksElement);
        },
        appendToContainer(){
            if (ownContainerElement || !selectElement)            
            {
                if (ownPicksElement)
                    containerElement.appendChild(picksElement);
                containerElement.appendChild(optionsElement);
            }
            else
            {
                if (selectElement)
                {
                    selectElement.parentNode.insertBefore(optionsElement, selectElement.nextSibling);
                    if (ownPicksElement)
                        selectElement.parentNode.insertBefore(picksElement, optionsElement);
                }
            }
        },
        attachContainer(){
            if (ownContainerElement)
                selectElement.parentNode.insertBefore(containerElement, selectElement.nextSibling);
        },
        dispose(){
            if (ownContainerElement)
                containerElement.parentNode.removeChild(containerElement);
            if (ownPicksElement)
                picksElement.parentNode.removeChild(picksElement);
            optionsElement.parentNode.removeChild(optionsElement);
            if (selectElement)
                selectElement.style.display = backupDisplay;
        }
    }
}