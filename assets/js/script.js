
var page= window.location.pathname;

var active = document.querySelectorAll(".nav li a");

active.forEach(function(ele){
	    ele.classList.remove("act");
    if(ele.getAttribute("href") == page)
        ele.classList.add("act");
    else if(ele.getAttribute("href") ==page)
        ele.classList.add("act");
    else if(ele.getAttribute("href") ==page)
        ele.classList.add("act");	            
    else
    	ele.classList.remove("act");
});

