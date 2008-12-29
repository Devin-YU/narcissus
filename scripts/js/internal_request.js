/* The following function creates an XMLHttpRequest object... */

function createRequestObject(){
	var request_o; //declare the variable to hold the object.
	var browser = navigator.appName; //find the browser name
	if(browser == "Microsoft Internet Explorer"){
		/* Create the object using MSIE's method */
		request_o = new ActiveXObject("Microsoft.XMLHTTP");
	}else{
		/* Create the object using other browser's method */
		request_o = new XMLHttpRequest();
	}
	return request_o; //return the object
}

/* The variable http will hold our new XMLHttpRequest object. */
var http = createRequestObject(); 
var packagelist = new Array;
var packagestring = "";
var opackage = "";
var progress_text = ""
var FAIL_image = "<img src=\"img/X_mark.png\">";
var succes_image = "<img src=\"img/Green_tick\">";

function configureImage(){
    showHideElement('intro',0);
    showHideElement('image_progress',0);
	
	
	
	document.getElementById('image_link').innerHTML = "";
	document.getElementById('configure_progress').innerHTML = "";
	document.getElementById('image_progress').innerHTML = "";
	
    packagestring = concatArray(document.entry_form.pkg);
	
	if (packagestring == "" || packagestring == " ") {
 		document.getElementById('status').innerHTML = "You have to select at least one task, try 'task-boot' to get a minimal set.";
   		return; 
	}
	
    packagestring += concatArray(document.entry_form.wm); 
    packagestring += concatArray(document.entry_form.devel);
    packagestring += concatArray(document.entry_form.packages);
	
	var packagelisttemp = packagestring.split(" ");
	packagelist = unique(packagelisttemp);

	progress_text = "<br/><br/><table>\n";
	progress_text += "<tr><td colspan=\"2\">Preconfiguring image</td><td></td><td id='td-configure'></td></tr>\n";
	progress_text += "<tr><td colspan=\"2\">Installing packages:</td><td></td><td id='td-package'></td></tr>\n";
	
	for (var i in packagelist) {
		if (packagelist[i] != "" && packagelist[i] != " ") {
			progress_text += "<tr><td>&nbsp;</td><td>" + packagelist[i] + "</td><td>&nbsp;</td><td id=\"td-" +  packagelist[i] + "\"></td></tr>\n";
		}	
	}
	
	progress_text += "<tr><td colspan=\"2\">Assembling image</td><td></td><td id='td-assemble'></td></tr>\n";
	progress_text += "</table>\n";

	document.getElementById('pkg_progress').innerHTML = progress_text;
	
    
    var params = 'action=configure_image&machine=' + document.entry_form.machine.value + '&name=' + document.entry_form.name.value;
	http.open('post', 'backend.php');
	
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = configureProgress; 
	http.send(params);
	blindUp('form');
}

function assembleImage(){
    var params = 'action=assemble_image&machine=' + document.entry_form.machine.value + '&name=' + document.entry_form.name.value;
	http.open('post', 'backend.php');
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = assembleProgress; 
	http.send(params);
}

function installPackage(){
	if (opackage != "" && opackage != " ") {
		var params = 'action=install_package&machine=' + document.entry_form.machine.value + '&name=' + document.entry_form.name.value + '&pkgs=' + opackage;
		http.open('post', 'backend.php');
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		http.onreadystatechange = installProgress; 
		http.send(params);
	}
}

function showImagelink(){
    var params = 'action=show_image_link&machine=' + document.entry_form.machine.value + '&name=' + document.entry_form.name.value;
	http.open('post', 'backend.php');
	
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.onreadystatechange = imageDisplay; 
	http.send(params);
}

function configureProgress(){
    if(http.readyState == 4){
		var response = http.responseText;
        showHideElement('configure_progress',0);
        document.getElementById('configure_progress').innerHTML = response;
		document.getElementById('td-configure').innerHTML = succes_image;
		opackage = packagelist.shift();
		installPackage("test");
	}
}

function installProgress(){
    if(http.readyState == 4){
		var response = http.responseText;
		document.getElementById('image_progress').innerHTML = response;
		if(document.getElementById('imgsize')) {
			document.getElementById('status').innerHTML = "<br/>\nCurrent uncompressed image size: " + document.getElementById('imgsize').innerHTML.split(" ")[1];
		}	
		
		// We grep for an error code, so '0' is indeed an error
		if(document.getElementById('retval').innerHTML == "0") {
			document.getElementById('td-' + opackage).innerHTML = FAIL_image;
		}	
		else {
			document.getElementById('td-' + opackage).innerHTML = succes_image;
		}	
        if (packagelist.length > 1) {
            opackage = packagelist.shift();
            if (opackage != "" && opackage != " ") {
                installPackage(opackage);
            }
        }     
        else {
            assembleImage(opackage);
        }        
	}
}

function assembleProgress(){
	if(http.readyState == 4){ 
		var response = http.responseText;
		showHideElement('image_progress',0);
        document.getElementById('image_progress').innerHTML = response;
		if(document.getElementById('retval-image').innerHTML == "0") {
			document.getElementById('td-assemble').innerHTML = succes_image;
		}
		else {
			document.getElementById('td-assemble').innerHTML = FAIL_image;
		}		
	showImagelink();
	}
}

function imageDisplay(){
	if(http.readyState == 4){
        var response = http.responseText;
		if(document.getElementById('imgsize')) {
			document.getElementById('status').innerHTML = "<br/>\nCurrent uncompressed image size: " + document.getElementById('imgsize').innerHTML.split(" ")[1];
		}
		document.getElementById('image_link').innerHTML = response;
		pulsate(document.getElementById('image_link'));
	}
}

function showHideElement(elementId, showHideFlag) {
	var elementObj = document.getElementById(elementId);
	if(showHideFlag == 1) {
		elementObj.style.display = '';
	} 
	else if(showHideFlag == 0) {
		elementObj.style.display = 'none';
	}
}

function toggleVisibility(elementId) {
	var elementObj = document.getElementById(elementId);
	if (elementObj.style.display == '') {
		elementObj.style.display = 'none';
	}
	else {
		elementObj.style.display = '';
	}
}

function concatArray(varArray) {
    var packageslist = "";
    for(var i=0; i < varArray.length; i++){
		if(varArray[i].checked) {
			packageslist += varArray[i].value + " ";
		}
    }    
    return packageslist   
}

function unique(a)
{
	var r = new Array();
	o:for(var i = 0, n = a.length; i < n; i++) {
		for(var x = i + 1 ; x < n; x++)
		{
			if(a[x]==a[i]) continue o;
		}
		r[r.length] = a[i];
	}
	return r;
}