# Bootstrap 4 Multiselect plugin
*Reuse boostrap 4 styles where it can*

There are many of such plugins but this is small since reuses maximum of bootrap 4 styles and code.

# Architecture
Instead of using BS4 Dropdown (it was possible) it uses popper.js directly.
But it utilize dropdown-menu, dropdown-item styles.
BS4 Custom checkboxes
BS4 Close buttons.

Plugin doesn't have own styles (this was liek a goad but was achived by a trick).
In ideal worls if you customize bootsrap 4 this plugin should change with your new styles. And there is the number of style that it inherits:

a)
b)
c)

Unfortunatly BS4 do not provide several important constants as classes so if you have customized those values you should redifine them in options.

d)
e)
f)

Other Bootstrap 4 extension ideas:
https://github.com/trumbitta/bootstrap-css-utils 
