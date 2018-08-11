
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

// $(function() {

//   var page = window.location.pathname;

//   $('.nav li').filter(function(){
//      return $(this).find('a').attr('href').indexOf(page) !== -1
//   }).addClass('act');

//   $(".nav a").on("click", function() {
//     $(".nav").find(".act").removeClass("act");
//     $(this).parent().addClass("act");
//   });
// });