import {pushUnique} from './ToolsJs';

export function removeElement(e) {e.parentNode.removeChild(e)}

export function findDirectChildByTagName(element, tagName){
    let value = null;
    for (let i = 0; i<element.children.length; i++)
    {
        let tmp = element.children[i];
        if (tmp.tagName==tagName)
        {
            value = tmp;
            break;
        }
    }
    return value;
}

export function closestByTagName(element, tagName){
    return closest(element, e => e.tagName===tagName)
}

export function closestByClassName(element, className){
    return closest(element, e => e.classList.contains(className))
}

export function closest(element, predicate){
    if (!element) return null;
    if (predicate(element)) return element;
    return closest(element.parentNode, predicate);
}

export function addClass(element, c){
    element.classList.add(c);
}

export function removeClass(element, c){
    element.classList.remove(c);
}

export function addClasses(element, classes){
    modifyClasses(classes, e=>addClass(element,e))
}

export function removeClasses(element, classes){
    modifyClasses(classes, e=>removeClass(element,e))
}

export function setStyle(element, style){
    for (let property in style)
        element.style[property] = style[property];
}

function modifyClasses(classes, modify){
    if (classes){
        if (Array.isArray(classes))
            classes.forEach(e => modify(e))
        else{
            let array = classes.split(" ");
            array.forEach(e => modify(e))
        }
    }
}

export function removeChildren(element){
    var toRemove = element.firstChild;
    while( toRemove ) {
        element.removeChild( toRemove );
        toRemove = element.firstChild;
    }
}

export function setClassAndStyle(element, classes, styles){
    classes.forEach(
        function(e){
            element.classList.add(e);
        }
    )
    for (let property in styles)
        element.style[property]  = styles[property];
}

export function unsetClassAndStyle(element, classes, styles){
    classes.forEach(
        function(e){
            element.classList.remove(e);
        }
    )
    for (let property in styles)
        element.style[property]  = '';
}

export function EventBinder(){
    var list = [];
    return {
        bind(element, eventName, handler){
            element.addEventListener(eventName, handler)
            list.push( {element, eventName, handler} )
        },
        unbind(){
            list.forEach( e=>
            {
                let {element, eventName, handler}=e;
                element.removeEventListener(eventName, handler)
            })
        }
    }
}



/*
const styling = {
    choices: 'dropdown-menu', // bs4, in bsmultiselect.scss as ul.dropdown-menu

    choice_hover:  'hover',  //  not bs4, in scss as 'ul.dropdown-menu li.hover'
    // TODO
    choice_selected: '', // not used? should be used in OptionsPanel.js
    choice_disabled: '', // not used? should be used in OptionsPanel.js

    picks: 'form-control',  // bs4, in scss 'ul.form-control'
    picks_focus: 'focus', // not bs4, in scss 'ul.form-control.focus'
    picks_disabled: 'disabled', //  not bs4, in scss 'ul.form-control.disabled'

    pick_disabled: '',  
    
    pickFilter: '', 
    filterInput: '',

    // used in BsPickContentStylingCorrector
    pick: 'badge', // bs4
    pickContent_disabled: 'disabled', // not bs4, in scss 'ul.form-control li span.disabled'
    pickButton: 'close', // bs4

    // used in BsChoiceContentStylingCorrector
    choice:  '',
    choiceCheckBox_disabled: 'disabled', //  not bs4, in scss as 'ul.form-control li .custom-control-input.disabled ~ .custom-control-label'
    choiceContent: 'custom-control custom-checkbox', // bs4
    choiceCheckBox: 'custom-control-input', // bs4
    choiceLabel: 'custom-control-label justify-content-start' // bs4
}

const compensation = {
    choices: { listStyleType:'none' },
    choice:   'px-2' ,  
    choice_hover: 'text-primary bg-light', 
    filterInput: { 
        class: 'form-control', 
        style: {display:'flex', flexWrap:'wrap', listStyleType:'none', marginBottom: 0, height: 'auto'}
    },

    // used in StylingCorrector
    picks_disabled: {backgroundColor: '#e9ecef'},

    picks_focus: {borderColor: '#80bdff', boxShadow: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'},
    picks_focus_valid: {boxShadow: '0 0 0 0.2rem rgba(40, 167, 69, 0.25)'},
    picks_focus_invalid: {boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'},
    
    // used in BsAppearance
    picks_def: {minHeight: 'calc(2.25rem + 2px)'},
    picks_lg:  {minHeight: 'calc(2.875rem + 2px)'},
    picks_dm:  {minHeight: 'calc(1.8125rem + 2px)'},
    
    // used in BsPickContentStylingCorrector
    pick: {paddingLeft: '0px', lineHeight: '1.5em'},
    pickButton: {fontSize:'1.5em', lineHeight: '.9em'},
    pickContent_disabled: {opacity: '.65'}, // on content avoid opacity on pickElement's border
    
    // used in BsChoiceContentStylingCorrector
    choiceLabel_disabled: {opacity: '.65'}  
}
*/


export function constructStyling(source){
    var destination = {classes:[], styles:{}};
    if (source)
    {
        if (source instanceof String){
            source.split(" ").forEach(e => pushUnique(destination.classes, e))
        } else if (source instanceof Array){
            source.forEach(e => pushUnique(destination.classes, e))
        } else if (source instanceof Object){
            if (source.classes){
                let classes = source.classes;
                if (source instanceof String){
                    classes.split(" ").forEach(e => pushUnique(destination.classes, e))
                } else if (classes instanceof Array){
                    classes.forEach(e => pushUnique(destination.classes, e))
                }
            } else
            {
                let styles = null;
                if (source.styles) {
                    styles = source.styles;
                } else {
                    styles = source;
                }
                for (let property in styles)
                    destination.styles[property] = styles[property];
            }
        }
    }
    return destination;
}

export function addStyling(element, classes, styles){
    if (classes && Array.isArray(classes)){
        classes.forEach(
            function(e){
                element.classes.removeClass(e);
            }
        )
    }
    if (styles){
        for (let property in styles)
           element.style[property]='';
    }
}

export function removeStyling(element, classes, styles){
    if (classes && Array.isArray(classes)){
        classes.forEach(
            function(e){
                element.classes.addClass(e);
            }
        )
    }
    if (styles){
        for (let property in styles)
           element.style[property]=styles[property];
    }    
}