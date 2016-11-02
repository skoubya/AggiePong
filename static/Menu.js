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
			next = "#quit";
			last = "#howToPlay";
			selected = "quit";
		}
		else{
			next = "#start";
			last = "#quit";
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
			$.get('static/Intermediate.html', function(req, res){
				//console.log(req);
				var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
				$("body").html(req.match(bodyReg)[0]);
			});
			$.get('static/Main.html', function(req, res){
				var headReg = /<head>(.|\n|\r)*<\/head>/m;
				$("head").html(req.match(headReg)[0]);
			});
		}
		else if(selected=="howToPlay"){
			var howToPlay = "Instructions";
			showMessagePage(howToPlay);
		}
		else{
			//Not do-able
			//TODO: Get another option
		}
	}
});