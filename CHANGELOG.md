# CHANGELOG
````
0.5.40 - optimizations
0.5.39 - optimizations, better UX (I hope) click on picks with opened dropdown - closes dropdown
0.5.38 - problem disposing hidden options resolved
0.5.37 - UpdateOptionRemoved, UpdateOptionInserted improved renamed to UpdateOptionAdded
0.5.36 - UpdateOptionInserted new method
0.5.35 - optimizations
0.5.34 - optimizations
0.5.33 - optimizations
0.5.32 - new method UpdateOptionsDisabled (breaking change UpdateSelected renamed to UpdateOptionsSelected)
0.5.31 - resolved: notselective filter + enter opens empty dropdown
0.5.30 - changes in hidden API, possible memory leak bug resolved (on detach wtith open dropdown)
0.5.29 - optimizations, ENTER inside empty filter opens dropdown
0.5.28 - partial single match enter/tab reset filter
0.5.27 - full match problem solved
0.5.26 - optimizations
0.5.25 - optimizations
0.5.24 - new UpdateSelected method, optimizations
0.5.23 - optimizations
0.5.22 - optimizations
0.5.21 - optimizations, removes the disabled and focused styling from "no flick picks element" on plugin detach   
0.5.20 - remove x button problem resloved
0.5.19 - optimizations 
0.5.18 - changes in non published API (getIsOptionDisabled, getIsOptionHidden)
0.5.17 - changes in non published API (`common` generation parameter)
0.5.16 - optimizations
0.5.15 - revert 0.5.8 update; now bsMultiselect doesn't remove/add selected attribute (removing attributes break Chrome's form reset functionality) 
0.5.14 - new method UpdateAppearance - update everithing except item options (that means size, componetnt disabled, custom validity, .was-validated parent status; Update() = UpdateData() + UpdateAppearance()) 
0.5.13 - BsMultiSelect jQuery prototype can create instance (was only return)
0.5.12 - cssPatch bug on "empty string remove classes" resolved;
0.5.11 - GetChoices() method that returns 'dropdown' menu; 
0.5.10 - ES6 module; 
0.5.9  - optimizations; getIsValueMissing():boolean available from config
0.5.8  - default setSelected add/removes "selected" attribute
0.5.7  - optimizations
0.5.6  - optimizations
0.5.5  - useCssPatch=false mode, 'disabled dropdown's item' styling bug resolved
0.5.4  - configuring css/cssPatch, assuming null/undefined value to styles property - the property will be removed from default styles dictionary
0.5.3  - justification in dropdown menu for inline form solved
0.5.2  - styles patching throug js bug resolved
0.5.1  - form reset and fieldset disabled bug solved
0.5.0  - new styling parameters, rtl support, validation. breaking changes! (update your css and configuration);
0.4.33 - better suport of group-input append radius corners
0.4.32 - getSize, getDisabled, getIsValid, getIsInValid (actual for js-object initiated) are available to setup from configuration
0.4.31 - better padding support for placehoder for BS sizes
0.4.30 - configuration.setSelected as hook for pre and post selection events
0.4.29 - return to the support of form-control-lg/sm on ul.form-control 
0.4.28 - supports input-group-lg and input-group-sm (on container) - call UpdateSize is required; update bsmultiselect.css if you use it
0.4.27 - better look on phone devices
0.4.26 - second placeholder realisation (through filter input traceholder)
0.4.25 - problem  has been solved : placeholder absent after "esc"
0.4.24 - placeholder color in css error; update bsmultiselect.css;
0.4.23 - placeholder on disabled looks better
0.4.22 - problem solved: after Form Reset/UpdataData the placeholder was not shown
0.4.21 - configuration .placeholderText renamed to .placeholder; placeholder white space break fixed; update bsmultiselect.css;
0.4.20 - placeholder on IE11 looks better
0.4.19 - placeholder support added (through configuration "placeholder" or "data-bsmultiselect-placeholder"); update bsmultiselect.css if you use it
0.4.18 - "no flick" dom elements instantioning in html;  bootstrap prepend, append; select all and deselect all methods
0.4.17 - fieldset disabled supported
0.4.16 - console output removed
0.4.15 - bug resolved: x button (uncheck selected) on intially disabled component still works
0.4.14 - breaking change: now "GetContainer" returns container div (field .container removed)
0.4.13 - form reset support, UpdateData method to push changes in options to component.
0.4.12 - esc first close the dropdown then modal (stopPropogation on keydown used)
0.4.10 - uncheck selected error has been solved
0.4.9  - small optimizations.
0.4.8  - x button on selected items in selections panel bug solved.
0.4.7  - small problem solved: `mouseleave` event initated by new  filter (that rearrange menu item) resets the default hover (when only one item left by filter) 
0.4.6  - esc keydown now processed with preventDefault (to do not duplicate clear text custom functionality)
0.4.5  - bug solved (enter toggles the selected menu item even if dropdown is not visible)
0.4.4  - click inside selected panel doesn't clear the filter input (we have bootrap x for this and ESC button)
0.4.3  - there was a bug "two dropdown items can be hovered for a moment" (one by mouse second from keyboard) that is solved;
0.4.2  - configuration API changed; "selected" happens when full text entered.
0.4.1  - jquery eliminated from component core, ready for no jQuery bs5 (and migration to web components). 
0.4.0  - customization through build method added; id generation for label-input was redesigned once more (now id is used first, if id is absent then name); checkboxes now doesn't have ids (events are used to reference label and checbox).
0.3.0  - full customization from jquery plugin configuration object.
         BREAKING CHANGES: 1) configuration object is now named "configuration" (was options)
         2) id generation - new ids (btw, id generation can be customized assigning configuration.createCheckBoxId and configuration.createInputId methods)
0.2.24 - adding (hardcoded) css foat:none to "cancel" button span (x)  because BS team have added float:rigth to it (why?) in one of newest BS versions; this was the reason that sometimes badge's "x" button moved to new line separately.
0.2.23 - support bsMultiSelect on dropdown: click to remove/unselect the item is now processed in setTimout(..,0) this helps filter out close clicks in dropdown's hide event handler (investigate that clicks target was bsMultiSelect and ignore it)
0.2.22 - better UX, when only one left in aotosuggestion list - tab and enter select it
0.2.21 - "change" event propogation bug resolved
0.2.20 - Bootstrap security problems: "before 3.4.1, XSS is possible" https://blog.getbootstrap.com/2019/02/13/bootstrap-4-3-1-and-3-4-1/
0.2.19 - minor changes related to the rollup.js update - define global as self if it was not defined - important only for module imports scenarious
0.2.18 - input's height 'initial' changed  to height 'auto' (to support IE11)
0.2.17 - bug fixes (grab newest BsMultiSelect.scss if you use useCss=true)
0.2.16 - support Bootstrap 4.1.3 and its fixed height .form-control (grab newest BsMultiSelect.scss if you use useCss=true)
0.2.13-15 - bug fixes
0.2.12 - open autosuggest on arrow down (40 char)
0.2.8-11 - bug fixes
0.2.7 - hidden option support
0.2.6 - disabled option when selected is displayed with opacity (default value .65)
0.2.5 - disabled option support
0.2.4 - npm published
````
