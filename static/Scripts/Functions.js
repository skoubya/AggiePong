/* Functions
 *
 * Additional functions used throughout the game structure
 *
 */

/* Puts specified message into the text section of the intermediate page 
 * Parameters:
 *		msg - string that will be displayed
 */
function showMessagePage(msg){
	$.get('static/Pages/Intermediate.html', function(req, res){
				var bodyReg = /<body>(.|\n|\r)*<\/body>/m;
				$("body").html(req.match(bodyReg)[0]);
				var headReg = /<head>(.|\n|\r)*<\/head>/m;
				var headText = req.match(headReg)[0];
				var endTags = '</script>\r\n</head>';
				headText =  headText.substring(0,headText.length - endTags.length);
				var addInstr = "$(\"#message\").html(\"";
				addInstr = addInstr.concat(msg, '\");');
				headText = headText.concat(addInstr, endTags);
				$("head").html(headText);
	});
}