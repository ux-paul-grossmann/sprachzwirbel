"use strict";
if (localStorage.getItem("theme")) {
    var theme = localStorage.getItem("theme");
    document.body.classList.add(theme)
}

var toggleLight = document.querySelector(".toggle-light");
var toggleDark = document.querySelector(".toggle-dark");
var toggleStarfall = document.querySelector(".toggle-starfall");
var toggleTau = document.querySelector(".toggle-tau");

toggleLight.addEventListener("click", function(e) {
    e.preventDefault();
    document.body.classList.remove("dark");
    document.body.classList.remove("starfall");
    document.body.classList.remove("tau");
    localStorage.removeItem("theme", ":root")
});
toggleDark.addEventListener("click", function(e) {
    e.preventDefault();
    document.body.classList.add("dark");
    document.body.classList.remove("starfall");
    document.body.classList.remove("tau");
    localStorage.setItem("theme", "dark")
});
toggleStarfall.addEventListener("click", function(e) {
    e.preventDefault();
    document.body.classList.add("starfall");
    document.body.classList.remove("dark");
    document.body.classList.remove("tau");
    localStorage.setItem("theme", "starfall")
});
toggleTau.addEventListener("click", function(e) {
    e.preventDefault();
    document.body.classList.add("tau");
    document.body.classList.remove("dark");
    document.body.classList.remove("starfall");
    localStorage.setItem("theme", "tau")
});
