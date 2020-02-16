
import {BsMultiSelect}  from './BsMultiSelect.esm'

export class BsMultiSelectElement extends HTMLElement {
    constructor() {
        super(); // must by spec
        var shadowRoot  = this.attachShadow({mode: 'open'});
        this.multiSelect = BsMultiSelect(this, environment, settings)     
        shadowRoot.innerHTML = `<div>stub text</div>`; // container
        // https://developers.google.com/web/fundamentals/web-components/shadowdom
    }
    // connectedCallback(){

    // }
    // disconnectedCallback(){

    // }
    // attributeChangedCallback(attrName, oldVal, newVal){

    // }
    // adoptedCallback(){

    // }
}
