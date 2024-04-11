// This JS script is to handle the dark mode BEFORE document loads for eliminating
// the flicker effect

const page = document.body;
const themeStates = ["light", "dark"]
const pageClass = ["bg-gray-100", "dark-page"]
let currentTheme = localStorage.getItem("theme");

function setPage(theme) {
    page.classList.remove(pageClass[0])
    page.classList.remove(pageClass[1])
    page.classList.add(pageClass[theme])
}


if (currentTheme === null) {
    localStorage.setItem("theme", themeStates[0])
    setPage(0)
}

if (currentTheme === themeStates[0]) {
    setPage(0)
}
if (currentTheme === themeStates[1]) {
    setPage(1)
}
