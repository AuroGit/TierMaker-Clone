"use strict";

import { getOSData } from "./tierDB.js";

const IDBRequest = indexedDB.open("tierDB",1);

IDBRequest.onsuccess = ()=>{
    if (location.pathname.includes("category")) categoryBuild();
};

// Category Build
const url = location.search;
const paramsURL = new URLSearchParams(url);

const title = document.getElementsByTagName("title")[0];
title.innerText += paramsURL.get("cat");

const customItemA = document.querySelector(".custom-item").querySelector("a");
customItemA.href = `./customize.html?cat=${paramsURL.get("cat")}`;

const container = document.querySelector(".container"),
    category = container.querySelector("h2");
category.innerText = paramsURL.get("cat");

const categoryUL = container.querySelector(".category");

const createTierElement = tierlistObj => {
    const html = `<a href="./tierlist.html?cat=${paramsURL.get("cat")}&tierlist=${tierlistObj.title}"><span>${tierlistObj.title}</span></a>`;
    const itemLI = document.createElement("LI");
    itemLI.style.backgroundImage = `url(${tierlistObj.cover})`;
    itemLI.innerHTML = html;
    return itemLI;
}

const categoryBuild = ()=>{
    const objStore = getOSData("readonly");

    objStore.get(paramsURL.get("cat")).onsuccess = (e)=>{
        const tierlistsArr = e.target.result.tierlists;
        for (let item of tierlistsArr) {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(createTierElement(item));
            categoryUL.appendChild(fragment);
        }
    };
}