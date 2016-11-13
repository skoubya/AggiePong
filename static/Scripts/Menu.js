var selected = "start"

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
			next = "#quit";
			last = "#start";
			selected = "quit";
		}
		else if(selected=="howToPlay"){
			next = "#start";
			last = "#howToPlay";
			selected = "start";
		}
		else{
			next = "#howToPlay";
			last = "#quit";
			selected = "howToPlay";
		}
		var src1 = $(next).attr("src").replace(".png", "Sel.png");
		$(next).attr("src",src1);
		var src2 = $(last).attr("src").replace("Sel.png", ".png");
		$(last).attr("src", src2);
	}
	else if(event.which == 13){ //enter
		if(selected=="start"){
			$.get('static/Pages/Main.html', function(req, res){ //'part1.html'
				var headReg = /<head>(.|\n|\r)*<\/head>/m;
				$("head").html(req.match(headReg)[0]);
			});
			$.get('static/Pages/Intermediate.html', function(req, res){ //'part1.html'
				var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
				$("body").html(req.match(bodyReg)[0]);
			});
		}
		else if(selected=="howToPlay"){
			var howToPlay = "<u>How to Play</u><br />The purpose of this game is to protect your goal from having anything go into it.  If you let a ball past, the other player gets a point. If you stop a power-up ball from getting past (i.e. it hits your paddle), you get the power-up.  If you let a bomb past, you will be temporarily stunned. <br /><br /> <u>Keys</u><br /> <table><tr><th>Left arrow</th><th> - </th><th class='left'>move paddle left</th></tr><tr><th>Right arrow</th><th> - </th><th class='left'>move paddle right</th></tr><tr><th>\\\"A\\\" key</th><th> - </th><th class='left'>rotate counter-clockwise</th></tr><tr><th>\\\"D\\\" key</th><th> - </th><th class='left'>rotate clockwise</th></tr></table>";
			showMessagePage(howToPlay);
		}
		else{
			var aboutUs = "<u>Our Team</u><br /> somethingGood <br /><br /><u>Team Members</u> <br />Garrett Haynes <br />Nick Jackson <br />Aaron Skouby <br />Luke Sloniger";
			showMessagePage(aboutUs);
		}
	}
});