// This JS script is to handle the specific elements on the page which relate to the settings 
// depending on whether the user is dark mode or not

const themeSwitch = document.getElementById("theme-switch");
const themeIndicator = document.getElementById("theme-indicator");


const indicators = ["fa-moon", "fa-sun"]



function setTheme(theme) {
    localStorage.setItem("theme", themeStates[theme])
}

function setIndicator(theme) {
    themeIndicator.classList.remove(indicators[0])
    themeIndicator.classList.remove(indicators[1])
    themeIndicator.classList.add(indicators[theme])
}




if (currentTheme === null) {
    localStorage.setItem("theme", themeStates[0])
    setIndicator(0)
    themeSwitch.checked = true;
}

if (currentTheme === themeStates[0]) {
    setIndicator(0)
    themeSwitch.checked = true;

}
if (currentTheme === themeStates[1]) {
    setIndicator(1)
    themeSwitch.checked = false;
}


themeSwitch.addEventListener('change', function () {
    if (this.checked) {
        setTheme(0)
        setIndicator(0)
        setPage(0)
    } else {
        setTheme(1)
        setIndicator(1)
        setPage(1)
    }
});