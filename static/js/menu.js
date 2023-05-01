function navigateToPage(path) {
    window.location.href = path;
}

function createMenu() {
    const menu = document.createElement("section");
    menu.classList.add("form");

    const menuItem1 = document.createElement("button");
    menuItem1.setAttribute("type", "menu");
    menuItem1.textContent = "Get RSZ";
    menuItem1.onclick = function () { navigateToPage('txn_signatures.html'); };
    menu.appendChild(menuItem1);

    const menuItem2 = document.createElement("button");
    menuItem2.setAttribute("type", "menu");
    menuItem2.textContent = "Private Key Details";
    menuItem2.onclick = function () { navigateToPage('wallet_details.html'); };
    menu.appendChild(menuItem2);

    const telegramButton = document.createElement("button");
    telegramButton.setAttribute("type", "telegram");
    telegramButton.textContent = "Telegram";
    telegramButton.onclick = function () { window.open('https://t.me/bitutils', '_blank'); };
    menu.appendChild(telegramButton);

    const githubButton = document.createElement("button");
    githubButton.setAttribute("type", "github");
    githubButton.textContent = "View on GitHub";
    githubButton.onclick = function () { window.open('https://github.com/Goatghosts/bitutils.com', '_blank'); };
    menu.appendChild(githubButton);

    return menu;
}

document.addEventListener("DOMContentLoaded", function () {
    const menuContainer = document.querySelector(".menu");
    menuContainer.appendChild(createMenu());
});