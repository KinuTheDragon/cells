# Cells
## A cellular automaton designing engine
This engine is heavily inspired by [SandPond](https://github.com/TodePond/Sandpond)
by the amazing [Lu Wilson](https://github.com/TodePond/).

## So how does the engine work?
- The canvas on the left is where you can place various cells.
- The code panel on the right is where you define the rules for the cells.
- The gray box on the bottom-right is for logging error messages when updating the rules.
- The buttons in the upper-right are for various actions:

**Button**|**Function**
:-----:|:-----:
![image](images/update.png)|Update the rules
![image](images/pause.png)|Pause the simulation
![image](images/play.png)|Resume the simulation
![image](images/step.png)|Do one step of the simulation
![image](images/help.png)|Opens this documentation
![image](images/more.png)|Opens my main site for more cool stuff

## Canvas controls
- Press a key listed in the Elements section to select that element for your brush.
- Left-click to place the selected element.
- Right-click to delete cells.
- Middle-click to select the hovered cell's element.
- Scroll to change the brush size.

## How do I write code for it?
The code is divided into 1-3 sections separated by double newlines:
### Elements
Each line of this section is in the format
<code>&lt;name&gt; &lt;key&gt; &lt;color&gt;</code>.
The <code>name</code> is the name of the element,
the <code>key</code> is the [key to press to access it,](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)
and the <code>color</code> is a [CSS color](https://www.w3schools.com/css/css_colors.asp).
The first one listed is the one that will be used as the
element to fill the grid with initially.
### Replacements (optional)
Each line of this section is in the format
<code>&lt;start&gt; := &lt;end&gt;</code>.
This replaces the <code>start</code> with <code>end</code>
in the rules section.
#### Special replacements
Replacing certain things has special effects.
**Name**|**Result**
:-----:|:-----:
SIZE|Changes the size of the grid. Defaults to 50.
### Rules (optional)
The rules within this section are separated by double newlines.
Their format is best explained with examples.
#### Simple example
<pre><code>sand
air
=>
air
sand</code></pre>
This rule states that wherever sand occurs above air,
it will turn into air above sand. The rule is essentially
a "before" and "after" diagram of our desired state.
Commas are used to separate cells horizontally,
and newlines are used to separate cells vertically.

#### One-liners
Why waste valuable screen space for simple rules?
<pre><code>water,air => air,water</code></pre>
This is equivalent to
<pre><code>water,air
=>
air,water</code></pre>

#### The <code>*</code> operator
Let's say we also want the sand to slide down:
<pre><code>sand
*,air
=>
air
*,sand</code></pre>
Wherever we see sand over "something we don't care about"
which is to the left of air, swap the sand with the air.
The <code>\*</code> in the start state refers to anything,
and the <code>\*</code> in the end state means "do not change".

#### Tags
But now our sand is only sliding down and to the right;
we want it to slide in both directions.
We can achieve this by tacking a *tag* onto our rule:
<pre><code>sym:h
sand
*,air
=>
air
*,sand</code></pre>
This states that flipping this rule <code>h</code>orizontally is also valid.
Check the [list of tags](#list-of-tags) for more information on tags.

#### The <code>?</code> suffix
If we wanted to make our sand also fall off the bottom
of the grid, that's easy as well.
<pre><code>sand
air?
=>
air
sand

sym:h
sand
*?,air?
=>
air
*,sand</code></pre>
Appending <code>?</code> to something makes it also match
the out-of-bounds area of the grid. Trying to set that to anything
has no effect, so if the sand slides into it, nothing happens.
Furthermore, <code>?</code> by itself will match **only** out-of-bounds.

#### Labels
We can refer to elements in the start and end states with labels:
<pre><code>sand@1
air@2
=>
@2
@1</code></pre>
This does the same thing as the falling rule.
Note that the labels do NOT have to be numbers!
Furthermore, labeling two items in the start state
with the same label forces them to be the same to match the rule.

#### The <code>[]</code> operator
Want to match multiple possible elements? Easy peasy!
<pre><code>[sand water]@1
air@2
=>
@2
@1</code></pre>
This will match sand or water above air to move it downward.

#### The <code>!</code> prefix
Want to match everything but a few elements?
Simply write a <code>!</code> in front!
<pre><code>sym:r
infector,!air => *,infector</code></pre>
This causes the infector element to spread to any non-air cells around it.

## Other miscellaneous information
### List of tags
**Name**|**Values**|**Usage**
:-----:|:-----:|:-----:
<code>sym</code>|Any combination of <code>h</code>, <code>v</code>, and <code>r</code>|Defines the symmetries of a rule: <code>h</code>orizontal flipping, <code>v</code>ertical flipping, or <code>r</code>otation in any direction.
<code>chance</code>|Any number|Provides this rule with a given percentage chance to occur; e.g. <code>chance:50</code> gives a 50% chance.