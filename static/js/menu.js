function navigateToPage(path) {
    window.location.href = path;
}

function createMenu() {
    const menu = document.createElement("section");
    menu.classList.add("form");

    const homeButton = document.createElement("button");
    homeButton.setAttribute("type", "menu");
    homeButton.textContent = "Home";
    homeButton.onclick = function () { navigateToPage('index.html'); };
    menu.appendChild(homeButton);

    const menuItem1 = document.createElement("button");
    menuItem1.setAttribute("type", "menu");
    menuItem1.textContent = "Get RSZ";
    menuItem1.onclick = function () { navigateToPage('txn_signatures.html'); };
    menu.appendChild(menuItem1);

    // const telegramButton = document.createElement("button");
    // telegramButton.setAttribute("type", "telegram");
    // telegramButton.textContent = "Telegram";
    // telegramButton.onclick = function () { window.open('https://github.com/Goatghosts/bitutils.com', '_blank'); };
    // menu.appendChild(telegramButton);

    const githubButton = document.createElement("button");
    githubButton.setAttribute("type", "github");
    githubButton.textContent = "View on GitHub";
    githubButton.onclick = function () { window.open('https://github.com/Goatghosts/bitutils.com', '_blank'); };
    menu.appendChild(githubButton);

    return menu;
}

document.addEventListener("DOMContentLoaded", function () {
    const menuContainer = document.querySelector(".block-left");
    menuContainer.appendChild(createMenu());
});