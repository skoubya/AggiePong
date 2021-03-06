/* Menu
 * 
 * Navigates the game structure via the menu
 *
 */

var selected = "start"

/* Does the actions for the coresponding option 
 * Parameters:
 *		sel - string representing the option that is currently selected
 */
function choose(sel){
	if(sel=="start"){
		var waitingFor = "Waiting for another player to connect.";
		showMessagePage(waitingFor);
		$("head").append("<script src='/socket.io/socket.io.js'></script> \n <script type='text/javascript' src='static/Scripts/Waiting.js'></script>");
	}
	else if(sel=="howToPlay"){
		var howToPlay = "<u>How to Play</u><br />The purpose of this game is to protect your goal from having anything go into it.  If you let a ball past, the other player gets a point. If you stop a power-up ball from getting past (i.e. it hits your paddle), you get the power-up.  The power-up speeds up the player's paddle. If you let a bomb past, you will be temporarily stunned. <br /><br /> <u>Keys</u><br /> <table><tr><th>Left arrow</th><th> - </th><th class='left'>move paddle left</th></tr><tr><th>Right arrow</th><th> - </th><th class='left'>move paddle right</th></tr><tr><th>\\\"A\\\" key</th><th> - </th><th class='left'>rotate counter-clockwise</th></tr><tr><th>\\\"D\\\" key</th><th> - </th><th class='left'>rotate clockwise</th></tr><tr><th>\\\"S\\\" key</th><th> - </th><th class='left'>return paddle to horizontal</th></tr></table>";
		showMessagePage(howToPlay);
	}
	else{
		var aboutUs = "<u>Our Team</u><br /> somethingGood <br /><br /><u>Team Members</u> <br />Garrett Haynes <br />Nick Jackson <br />Aaron Skouby <br />Luke Sloniger <br /><br /><p style='font-size:65%'>Explosion animation by Ville Seppanen (www.villeseppanen.com)<br />Game music by joshuaempyre (freesound.org)<br /> Losing sound by Corsica_S (freesound.org) (License: https://creativecommons.org/licenses/by/3.0/)</p>";
		showMessagePage(aboutUs);
	}
}

/* Make selection when clicked */
$(document).ready(function(){
	$('.myButton').click(function(){
		choose($(this).attr('id'));
	});
});

/* Change selection and make selection with enter */
$(document).keydown(function(event){
	var next;
	var last;
	if(event.which == 40){ //down
		if(selected=="start"){
			next = "#howToPlay";
			last = "#start";
			selected = "howToPlay";
		}
		else if(selected=="howToPlay"){
			next = "#aboutUs";
			last = "#howToPlay";
			selected = "aboutUs";
		}
		else{
			next = "#start";
			last = "#aboutUs";
			selected = "start";
		}
		var src1 = $(next).attr("src").replace(".png", "Sel.png");
		$(next).attr("src",src1);
		var src2 = $(last).attr("src").replace("Sel.png", ".png");
		$(last).attr("src", src2);
	}
	else if(event.which == 38){ //up
		if(selected=="start"){
			next = "#aboutUs";
			last = "#start";
			selected = "aboutUs";
		}
		else if(selected=="howToPlay"){
			next = "#start";
			last = "#howToPlay";
			selected = "start";
		}
		else{
			next = "#howToPlay";
			last = "#aboutUs";
			selected = "howToPlay";
		}
		var src1 = $(next).attr("src").replace(".png", "Sel.png");
		$(next).attr("src",src1);
		var src2 = $(last).attr("src").replace("Sel.png", ".png");
		$(last).attr("src", src2);
	}
	else if(event.which == 13){ //enter
		choose(selected);
	}
});
