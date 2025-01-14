<?php $title="Westminster-style parliament diagram generator"; ?>
<?php require('header.php'); ?>

<script type="text/javascript" src="js/westminster.js"></script>

<div class=block>
  <div class="notice">This tool is in Beta testing. Please help to test it, but if you use it to generate diagrams for Wikipedia, please make sure that you confirm with other editors what the consensus is on which layout and settings to use.</div><br/>
  This is a tool to generate Westminster-style parliament diagrams, with a house composed of a left bench, a right bench, a cross-bench group and a "head" - for example Speaker of Parliament.<br/>
</div>
<div class=block>
  To use this tool, fill in the name and support of each party in the legislature, clicking "add party" whenever you need to add a new party.
  Then click "Make my diagram", and a link will appear to your SVG diagram. You can then freely download and use the diagram.
  To use it in Wikipedia, I recommend uploading it to Wikimedia Commons.
  If you do upload it, I recommend adding it to the <a href="https://commons.wikimedia.org/wiki/Category:Election_apportionment_diagrams">election apportionment diagrams</a> category.<br/>
</div>
<div class=block>
  <div id="spotshapeoptioncontainer" class=block>
    <h3>Spot shape options</h3>
    Try out different values of corner radius to round out the blocks (negative
    values will be set to 0, and anything over 0.5 is a circle). Many Wikipedia
    diagrams use sharp-cornered squares (radius 0).<br/>
    <div class="left">Corner radius</div><input class="right" type="number" name="radius"  value = 1.0 ><br/>
    Try out different values of spot spacing to separate the blocks (only
    values between 0 and 0.99 will be used: 0 means the spots touch; 1 will
    give invisible spots.)<br/>
    <div class="left">Spot spacing </div><input class="right" type="number" name="spacing" value = 0.1 ><br/>
  </div>
  <div id="layoutoptioncontainer" class=block>
    <h3>Layout options</h3>
    To use the automatic layout, leave "wing rows" and "cross-bench columns" at
    0, otherwise use them to specify the number of rows in the left and right
    wings of the diagram, and the number of columns in the cross-bench section,
    respectively.<br/>
    <div class="left">Wing rows           </div><input class="right" type="number" name="wingrows" value = 0 ><br/>
    <div class="left">Cross-bench columns </div><input class="right" type="number" name="centercols" value = 0 ><br/>
    <br/>
    Would you like the left and right wings to use the full width of the
    diagram, by making one wing thinner than the other?<br/>
    <input type="checkbox" class="left" name="fullwidth" value="fullwidth" >Use full width <br/>
    <br/>
    Would you like to allow parties to share a column in the diagram?<br/>
    <input type="checkbox" class="left" name="cozy" value="cozy" checked>Let parties share columns<br/>
    <br/>
    To create a group of spots for "speakers" or similar functions, you can add parties with the "group" set to "Speaker". To automatically create one or more "speaker" spots with the colour of the largest party, without creating them as separate parties, you can just type a number in the checkbox below:<br/>
    <div class="left">Speaker spots</div><input class="right" type="number" name="autospeaker" value = 0 ><br/>
  </div>
  <div id="partylistcontainer" class=block>
    <h3>List of parties</h3>
    <div id="party1">
      <div class="left">Party 1 name      </div><input class="right" type="text"   name="Name1"   value= "Party 1" ><br/>
      <div class="left">Party 1 delegates </div><input class="right" type="number" name="Number1" value = 1        ><br/>
      <div class="left">Party 1 group     </div>
      <select class="right" name="Group 1">
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="center">Cross-bench</option>
        <option value="head">Speaker</option>
      </select><br/>
      <div class="left">Party 1 color </div><input class="right jscolor" type="text" name="Color1" value= AD1FFF ><br/>
      <div class="button deletebutton" onclick="deleteParty(1)">Delete party 1</div><br/>
      <br/>
    </div>
  </div>
</div>
<div class=button onclick="addParty()">
  Add a party
</div>
<div class=button onclick="CallDiagramScript()">
  Make my diagram
</div>
<div class="block">
  <div id="postcontainer">
    <br/>
  </div>
</div>

<?php require('footer.php'); ?>
