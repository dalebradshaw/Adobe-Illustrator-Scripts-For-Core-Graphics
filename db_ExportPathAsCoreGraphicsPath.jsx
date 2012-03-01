/* References
EPS Specification http://partners.adobe.com/public/developer/en/ps/5002.EPSF_Spec.pdf

*/

var className = 'PathExportView';
var projectName = 'View Output from Illustrator Path Export Script';
var author = 'Dale Bradshaw';
var copyright = 'Dale Bradshaw';

var h  = "//\r" +
				"//  " + className + ".h\r" +

				"//  " + projectName + "\r" +

				"//\r" +

				"//  Created by " + author + " on " + new Date().toDateString() + ".\r" +

				"//  Copyright " + new Date().getFullYear() + " " + copyright + ". All rights reserved.\r" +

				"//\r" +

				"\r" +

				"#import <UIKit/UIKit.h>\r" +

				"\r" +

				"@interface " + className + " : UIView {\r" +

				"}\r";
	
var m = "//\r" +

				"//  " + className + ".m\r" +

				"//  " + projectName + "\r" +

				"//\r" +

				"//  Created by " + author + " on " + new Date().toDateString() + ".\r" +

				"//  Copyright " + new Date().getFullYear() + " " + copyright + ". All rights reserved.\r" +

				"//\r" +

				"\r" +

				"#import \"" + className + ".h\"\r" +

				"\r" +

				"@implementation " + className + "\r" +

				"\r" +

				"- (id)initWithFrame:(CGRect)frame {\r" + 

				"\tif (self = [super initWithFrame:frame]) {\r" + 

				"\t\t// Initialization code\r" + 

				"\t}\r" + 

				"\treturn self;\r" + 

				"}\r" + 

				"\r" +

				"- (void)drawRect:(CGRect)rect {\r" +

				"\tCGContextRef ctx = UIGraphicsGetCurrentContext();\r" +
				
				"\t//Flip the context state to match Illustrator,\r\t//make sure Illustrator is configured for Global Rulers. http://forums.adobe.com/thread/645926\r" + 
				
				"\tCGContextSaveGState(ctx);\r" +
				
				"\tCGContextTranslateCTM(ctx, 0.0f, self.bounds.size.height);\r" +
				
				"\tCGContextScaleCTM(ctx, 1.0f, -1.0f);\r";
				

var footer =    "\r\r" +
                "- (void)dealloc\r" +
                "{\r" +
                    "\t[super dealloc];\r" +
                "}\r" + 
                "\r" +
                "@end;\r";
                
function newFile(msg) {
	var filename = prompt(msg, className, "Export Path");
	if (filename != null) {
		var exportFile = new File("~/Desktop/" + filename + ".m");
		if (exportFile.exists) {
			exportFile = newFile("There is already a file by that name on your Desktop.  Please try another name.");
		}
		return exportFile;
	}
	else {
		return null;
	}		
}

function parsePath(pathObject){
    
	var assetText = '';
	var prefix = '';
	var suffix = '';
        var geometry = '';

        //Is opacity translated to alpha?
	var alpha = 1;
	if(pathObject.opacity){
		alpha = pathObject.opacity;
	}
	
	
	if (pathObject.closed == true) {
		closedFlag = 1;
	}
	else {
		closedFlag = 0;
	}
	 //assetText = assetText + 'closed: ' + closedFlag + '\n';
	
	var fillFlag = false;
			 
	if (pathObject.filled == true) {
		//Deal with unsupported fillColor types
		/*
		pathObject.fillColor.PatternColor" &&  
		pathObject.fillColor.typename != "SpotColor" &&  
		pathObject.fillColor.typename != "GrayColor"
		*/
					
		if(pathObject.fillColor.typename == 'GradientColor'){
			//alert('gradient');
		}
		
		fillFlag = true;
		if (pathObject.fillColor.typename == "CMYKColor") {
			fillRed = 1 - ((pathObject.fillColor.cyan/100) * (1 - pathObject.fillColor.black/100) + pathObject.fillColor.black/100);
			fillGreen = 1 - ((pathObject.fillColor.magenta/100) * (1 - pathObject.fillColor.black/100) + pathObject.fillColor.black/100);
			fillBlue = 1 - ((pathObject.fillColor.yellow/100) * (1 - pathObject.fillColor.black/100) + pathObject.fillColor.black/100);
		}
		else {
			fillRed = pathObject.fillColor.red / 255;
			fillGreen = pathObject.fillColor.green / 255;
			fillBlue = pathObject.fillColor.blue / 255;
		}
	}
	else {
		fillRed = 1;
		fillGreen = 1;
		fillBlue = 1;
	}
	
	//prefix = "\tCGContextSaveGState(ctx);\r\r";

	geometry = "\tCGMutablePathRef pathRef = CGPathCreateMutable();\r";
    
    if(fillFlag){
        suffix += "\r";
        suffix += "\tCGFloat cf[4] = { " + 

    		fillRed + ", " +

    		fillGreen + ", " +

    		fillBlue + ", " +

    		alpha +

    		" };\r" +

    		"\tCGContextSetFillColor(ctx, cf);\r" +
    		    
            "\tCGContextAddPath(ctx, pathRef);\r"+
            
    		"\tCGContextFillPath(ctx);\r";
    }

    var strokeFlag = false;
    
	if (pathObject.stroked == true) {
		strokeFlag = true;
		if (pathObject.strokeColor.typename == "CMYKColor") {
			strokeRed = 1 - ((pathObject.strokeColor.cyan/100) * (1 - pathObject.strokeColor.black/100) + pathObject.strokeColor.black/100);
			strokeGreen = 1 - ((pathObject.strokeColor.magenta/100) * (1 - pathObject.strokeColor.black/100) + pathObject.strokeColor.black/100);
			strokeBlue = 1 - ((pathObject.strokeColor.yellow/100) * (1 - pathObject.strokeColor.black/100) + pathObject.strokeColor.black/100);
		}
		else {
			strokeRed = pathObject.strokeColor.red / 255;
			strokeGreen = pathObject.strokeColor.green / 255;
			strokeBlue = pathObject.strokeColor.blue / 255;
		}
		strokeWidth = pathObject.strokeWidth + 1;
	}
	else {
		strokeWidth = 1;
		strokeRed = 1;
		strokeGreen = 1;
		strokeBlue = 1;
	}
	suffix += "\r";
	if(strokeFlag){
	   	suffix += "\tCGFloat cs[4] = { " +

    	strokeRed + ", " +

    	strokeGreen + ", " +

    	strokeBlue + ", " +

    	alpha +

    	" };\r" +

    	"\tCGContextSetStrokeColor(ctx, cs);\r" +

    	"\tCGContextSetLineWidth(ctx, " + strokeWidth + ");\r";

    	if (pathObject.strokeJoin == "StrokeJoin.MITERENDJOIN") {
    		suffix += "\tCGContextSetLineJoin(ctx, kCGLineJoinMiter);\r";
    		if(pathObject.strokeMiterLimit){
    			suffix += "\tCGContextSetMiterLimit(ctx, " + pathObject.strokeMiterLimit + ");\r";
    		}	
    	}
    	else if (pathObject.strokeJoin == "StrokeJoin.ROUNDENDJOIN") {
    		suffix += "\tCGContextSetLineJoin(ctx, kCGLineJoinRound);\r";
    	}
    	else if (pathObject.strokeJoin == "StrokeJoin.BEVELENDJOIN") {
    		suffix += "\tCGContextSetLineJoin(ctx, kCGLineJoinMiter);\r";	
    		if(pathObject.strokeMiterLimit){
    			suffix += "\tCGContextSetMiterLimit(ctx, " + pathObject.strokeMiterLimit + ");\r";
    		}	
    	} 
    	suffix += "\r";
    	suffix += "\tCGContextAddPath(ctx, pathRef);\r";
    	suffix += "\tCGContextStrokePath(ctx);\r"
	}

	
	prefix += "\r";
			
	var pathPoints = new Array();
			
	for (i = 0; i < pathObject.pathPoints.length; i++) {
		var pointObject = {pt:{x: 0, y: 0}, pre:{exists:false, pt:{x: 0, y: 0}}, post:{exists:false, pt:{x: 0, y: 0}}, description:'', cgString:'', type:''};

		if(i == 0){
			pointObject.type = 'm';
			pointObject.pt.x = pathObject.pathPoints[i].anchor[0];
			pointObject.pt.y = pathObject.pathPoints[i].anchor[1];
			pointObject.description = pointObject.pt.x + ' ' + pointObject.pt.y + ' ' + pointObject.type;
			pointObject.cgString =  cgString = 'CGPathMoveToPoint(pathRef, NULL, ' + pointObject.pt.x + ', ' + pointObject.pt.y   + ');';
			
			if(pathObject.pathPoints[i].anchor[0] != pathObject.pathPoints[i].leftDirection[0] || pathObject.pathPoints[i].anchor[1] != pathObject.pathPoints[i].leftDirection[1]  ){
				pointObject.pre.exists = true;
				pointObject.pre.pt.x = pathObject.pathPoints[i].leftDirection[0]
				pointObject.pre.pt.y = pathObject.pathPoints[i].leftDirection[1];
			}
				
				
			if(pathObject.pathPoints[i].anchor[0] != pathObject.pathPoints[i].rightDirection[0] || pathObject.pathPoints[i].anchor[1] != pathObject.pathPoints[i].rightDirection[1]){
				pointObject.post.exists = true;
				pointObject.post.pt.x = pathObject.pathPoints[i].rightDirection[0];
				pointObject.post.pt.y = pathObject.pathPoints[i].rightDirection[1];
			}

	
		}else{
			pointObject.pt.x = pathObject.pathPoints[i].anchor[0];
			pointObject.pt.y = pathObject.pathPoints[i].anchor[1];
					
			if(pathObject.pathPoints[i].anchor[0] != pathObject.pathPoints[i].leftDirection[0] || pathObject.pathPoints[i].anchor[1] != pathObject.pathPoints[i].leftDirection[1]  ){
				pointObject.pre.exists = true;
				pointObject.pre.pt.x = pathObject.pathPoints[i].leftDirection[0];
				pointObject.pre.pt.y = pathObject.pathPoints[i].leftDirection[1];
			}
					
			if(pathObject.pathPoints[i].anchor[0] != pathObject.pathPoints[i].rightDirection[0] || pathObject.pathPoints[i].anchor[1] != pathObject.pathPoints[i].rightDirection[1]){
				pointObject.post.exists = true;
				pointObject.post.pt.x = pathObject.pathPoints[i].rightDirection[0];
				pointObject.post.pt.y = pathObject.pathPoints[i].rightDirection[1];
			}
					
				    
			var pre = false;
			var post = false;
			var descriptionString = '';
		    var cgString = '';

			if(pathPoints[i-1]){
				if(pathPoints[i-1].post.exists){
					//
					pre = true;
					descriptionString = descriptionString  + pathPoints[i-1].post.pt.x + ' ' + pathPoints[i-1].post.pt.y + ' ';
					cgString = cgString + pathPoints[i-1].post.pt.x + ', ' + pathPoints[i-1].post.pt.y + ', ';
				}
			}


			if(!pointObject.pre.exists && !pointObject.post.exists && !pre){
				pointObject.type = 'l';//line
			}else if(pointObject.pre.exists && pointObject.post.exists && !pre){
				pointObject.type = 'v';//"curve to only"
				descriptionString = descriptionString + pointObject.pre.pt.x + ' ' + pointObject.pre.pt.y + ' ';
				//need previous point even though it's equal
				if(pathPoints[i-1]){
					cgString = cgString + pathPoints[i-1].pt.x + ', ' + pathPoints[i-1].pt.y + ', ' + pointObject.pre.pt.x + ', ' + pointObject.pre.pt.y + ', ';
				}
			}else if(!pointObject.pre.exists && !pointObject.post.exists && pre){
				pointObject.type = 'y';//"curve from only".
				descriptionString = descriptionString + pointObject.pt.x + ' ' + pointObject.pt.y + ' ';
				cgString = cgString + pointObject.pt.x + ', ' + pointObject.pt.y + ', ';

			}else if(pre && pointObject.pre.exists){
				pointObject.type = 'c'; //"curve from and to" 

			
				descriptionString = descriptionString + pointObject.pre.pt.x  + ' ' + pointObject.pre.pt.y  + ' ';
				cgString = cgString + pointObject.pre.pt.x + ', ' +  pointObject.pre.pt.y;


			}

			if(pointObject.type == 'l'){

				descriptionString = pointObject.pt.x + ' ' + pointObject.pt.y;
				cgString = 'CGPathAddLineToPoint(pathRef, NULL,' + pointObject.pt.x + ', ' + pointObject.pt.y +  ');';

			}else if(pointObject.type == 'c'){

				cgString =	'CGPathAddCurveToPoint(pathRef, NULL, ' + cgString + ', ' + pointObject.pt.x + ', ' + pointObject.pt.y +  ');';

			}else if(pointObject.type == 'v'){

				descriptionString = descriptionString  + ' ' + pointObject.pt.x + ' ' + pointObject.pt.y;
				cgString = 'CGPathAddCurveToPoint(pathRef, NULL, ' + cgString  + pointObject.pt.x + ', ' + pointObject.pt.y +  ');';

			}else if(pointObject.type == 'y'){
				cgString = 'CGPathAddCurveToPoint(pathRef, NULL, ' + cgString  + pointObject.pt.x + ', ' + pointObject.pt.y +  ');';
			}

			descriptionString = descriptionString + ' ' + pointObject.type;
			pointObject.description = descriptionString;
			pointObject.cgString = cgString;
		}

		pathPoints.push(pointObject);
        
        geometry += '\t' + pointObject.cgString + '\r'; 				
		
		//assetText = assetText + ' x: ' + pathObject.pathPoints[i].anchor[0] + ' xl: ' + pathObject.pathPoints[i].leftDirection[0] + ' xr: ' + pathObject.pathPoints[i].rightDirection[0] +'\n';
	    //assetText = assetText + ' y: ' + pathObject.pathPoints[i].anchor[1] + ' yl: ' + pathObject.pathPoints[i].leftDirection[1] + ' yr: ' + pathObject.pathPoints[i].rightDirection[1] +'\n';
		//assetText = assetText + ' ' + pointObject.description + '\n';
		//assetText = assetText + ' ' + pointObject.cgString + '\n';
		//assetText = assetText + '\n';
				
	}
        if(closedFlag){

			if(pointObject.post.exists || pathPoints[0].pre.exists){
			    
			    	if(pathPoints[0].pre.exists){
			    	    if( pointObject.post.exists){
			    	          //c style
                				geometry +=	'\tCGPathAddCurveToPoint(pathRef, NULL, ' + pointObject.post.pt.x + ', ' + pointObject.post.pt.y + ', ' + pathPoints[0].pre.pt.x + ', ' + pathPoints[0].pre.pt.y + ', ' + pathPoints[0].pt.x + ', ' + pathPoints[0].pt.y +  ');//c style\r';
			    	    }else{
			    	        //v style
			    	        geometry += '\tCGPathAddCurveToPoint(pathRef, NULL, '+ pointObject.pt.x  + ', ' + pointObject.pt.y + ', ' + pathPoints[0].pre.pt.x+ ', ' + pathPoints[0].pre.pt.y + ', '  + pathPoints[0].pt.x + ', ' + pathPoints[0].pt.y +  ');\r';
			    	    }
			    	  
        			}else{
        			    if( pointObject.post.exists){
        			         //y style
                			    geometry += '\tCGPathAddCurveToPoint(pathRef, NULL, ' + pointObject.post.pt.x  + ', ' + pointObject.post.pt.y + ', ' + pathPoints[0].pt.x+ ', ' + pathPoints[0].pt.y + ', '  + pathPoints[0].pt.x + ', ' + pathPoints[0].pt.y +  ');\r';
        			    }
        			   
        			}
			}else{
			    //l style
				geometry += '\tCGPathAddLineToPoint(pathRef, NULL,' + pathPoints[0].pt.x + ', ' + pathPoints[0].pt.y +  ');\r';
			}
			
			suffix += '\tCGPathCloseSubpath(pathRef);\r';
        }
        
        suffix += '\tCGContextRestoreGState(ctx);\r';        
        suffix += '\tCGPathRelease(pathRef);\r';
        suffix += '\r';
		suffix += '}\r';

		var pathInfo = {pathPoints: pathPoints, prefix:prefix, suffix: suffix, geometry:geometry};
		
		//alert(assetText);
		//return pathPoints;
        return pathInfo;
}

mySelection = app.activeDocument.selection;
 if (mySelection instanceof Array) {
 	if (mySelection.length > 1) {
 		alert("Multiple Selection\nYou have more than one item selected.  Only the first object will be exported.");
 	}
 	else {
 	    var assetText = '';
 	    
		theObject = mySelection[0];
		if (theObject.typename != "PathItem") {
			if (theObject.typename == "GroupItem") {
				alert("Type Error\nThe selected item is a group.  This script can only export path items.  Please ungroup and try again.");
			}
			else if (theObject.typename == "CompoundPathItem") {
				//alert(theObject.pathItems.length);
				
				var paths = new Array();
				
				for (i = theObject.pathItems.length - 1; i >= 0;   i--) {
					//alert(i);
					paths.push(theObject.pathItems[i]);
				}
				
				for (t = 0; t < paths.length; t++) {
					//alert(paths[t]);
					parsePath(paths[t]);
				}
				//add subpath close between points
				description = 'f';
				cgString = 'CGPathCloseSubpath(pathRef);\n';
				//alert(paths.length);
			}
			else {
				alert("Type Error\nThe selected item is a " + theObject.typename + ", not a path item.  Please select a path item and try again.");
			}
		}
		else {
			var p = parsePath(theObject);
			var cgString = '';
			cgString += h;
			cgString += m;
		        /*	
                        for(var pt = 0; pt < p.length; pt++){
				cgString += p[pt].cgString + '\n';
			}
                        */
            cgString += p.prefix;
            cgString += p.geometry;
            cgString += p.suffix;
            cgString += footer;
			//alert(cgString);
			
		/**/
		var exportfile = newFile("Please enter a name for the path export file.  It will be placed on your Desktop.");
		if (exportfile != null) {
			exportfile.open("w", "mofo", "txt");
			exportfile.write(cgString);
			foo = exportfile.close();
			if (foo == true) {
				alert("Export Successful\nAll done!");
			}
		}
		
	}
	}
 }      
 else {          
 	alert("You do not have a path object selected.");
 }
