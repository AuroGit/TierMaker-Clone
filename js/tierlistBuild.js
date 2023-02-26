"use strict";

import { getOSData } from "./tierDB.js";

const IDBRequest = indexedDB.open("tierDB",1);
let dragableArr, zonasArr;
IDBRequest.onsuccess = ()=>{
    if (location.pathname.includes("tierlist")) tierlistBuild();
};

// Drag&Drop
let draggingNode;

function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.char:not(.moving)')];
    return draggableElements.reduce((prev, current)=> {
        const box = current.getBoundingClientRect();
        const offsetX = x - box.left - box.width / 2;
        const offsetY = y - box.top - box.height;
        if (offsetX < 0 && offsetX > prev.offsetX && offsetY < 0 && offsetY > prev.offsetY) {
            return {offsetX : offsetX, offsetY : offsetY, element : current};
        } else {
            return prev;
        }
    }, {offsetX : Number.NEGATIVE_INFINITY, offsetY : Number.NEGATIVE_INFINITY}).element;
}

// Tier Build
const url = location.search;
const paramsURL = new URLSearchParams(url);

const title = document.getElementsByTagName("title")[0];
title.innerText += paramsURL.get("tierlist").replace("_"," ");
const container = document.querySelector(".container");
const category = container.getElementsByTagName("h1")[0];
category.innerText = paramsURL.get("tierlist").replace("_"," ");

const addNewTier = tierObj => {
    const tierDiv = document.createElement("DIV");
    var label = tierObj ? tierObj.label : 'NUEVO';
    const html = `<div class="tier-title" contenteditable="true" spellcheck="false">
        <h3>${label}</h3>
    </div>
    <div class="zona"></div>
    <div class="tier-settings">
        <div class="options">
            <svg fill="#fff" width="30px" x="0px" y="0px" viewBox="0 0 50 50">
                <path d="M44.2,21.7l5.8-3.3L43.3,6.7L37.5,10c-2.6,1.5-5.8-0.4-5.8-3.3V0H18.3v6.7c0,3-3.2,4.8-5.8,3.3L6.7,6.7L0,18.3
                l5.8,3.3c2.6,1.5,2.6,5.2,0,6.7L0,31.7l6.7,11.6l5.8-3.3c2.6-1.5,5.8,0.4,5.8,3.3V50h13.4v-6.7c0-3,3.2-4.8,5.8-3.3l5.8,3.3L50,31.7
                l-5.8-3.3C41.6,26.9,41.6,23.1,44.2,21.7z M25,31.8c-3.8,0-6.8-3.1-6.8-6.8s3.1-6.8,6.8-6.8s6.8,3.1,6.8,6.8S28.8,31.8,25,31.8z"/>
            </svg>
        </div>
        <div class="order">
            <div data-value="up">
                <svg fill="#fff" width="25px" x="0px" y="0px" viewBox="0 0 50 28.4">
                    <polygon points="0,25 25,0 50,25 46.6,28.4 25,6.8 3.4,28.4 "/>
                </svg>
            </div>
            <div data-value="down">
                <svg fill="#fff" width="25px" x="0px" y="0px" viewBox="0 0 50 28.4">
                    <polygon points="50,3.4 25,28.4 0,3.4 3.4,0 25,21.6 46.6,0 "/>
                </svg>
            </div>
        </div>
    </div>`;
    tierDiv.id = document.querySelectorAll(".tier").length + 1;
    tierDiv.className = tierObj ? `tier ${tierObj.color}`: 'tier yellow';
    tierDiv.innerHTML = html;
    setTierListeners(tierDiv);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(tierDiv);
    return fragment;
}
const tierlistBuild = ()=>{
    const charZone = document.querySelector(".char-container");
    charZone.addEventListener("dragover", (e)=>{
        e.preventDefault();
        charZone.appendChild(draggingNode);
        const afterElement = getDragAfterElement(charZone, e.clientX, e.clientY);
        if (!afterElement) charZone.appendChild(draggingNode);
        else charZone.insertBefore(draggingNode, afterElement);
    });
    const objStore = getOSData("readonly");

    objStore.get(paramsURL.get("cat")).onsuccess = (e)=>{
        let currentTierlist;
        const tierlistsArr = e.target.result.tierlists;
        tierlistsArr.forEach(elem=>{
            if (elem.title === paramsURL.get("tierlist").replace("_", " ")) {
                currentTierlist = elem;
            }
        });
        for (let item of currentTierlist.tierRowsLabels) {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(addNewTier(item));
            tierContainer.appendChild(fragment);
        }

        const charContainer = document.querySelector(".char-container");
        for (let i = 0; i < currentTierlist.images.length; i++) {
            const fragment = document.createDocumentFragment();
            const elemIMG = document.createElement("IMG");
            elemIMG.id = i+1;
            elemIMG.src = currentTierlist.images[i];
            elemIMG.title = currentTierlist.images[i].split("/")[currentTierlist.images[i].split("/").length-1];
            elemIMG.classList.add("char");
            elemIMG.classList.add(currentTierlist.imgOrientation);
            elemIMG.draggable = true;
            fragment.appendChild(elemIMG);
            charContainer.appendChild(fragment);
        }
        dragableArr = document.querySelectorAll(".char");
        dragableArr.forEach(img => {
            img.addEventListener("dragstart", (e)=>{
                draggingNode = e.target;
                e.target.classList.toggle("moving");
                document.querySelectorAll(".tier-title").forEach(elem=>elem.contentEditable = false);
            });
            img.addEventListener("dragend", (e)=>{
                e.target.classList.toggle("moving");
                draggingNode = undefined;
                document.querySelectorAll(".tier-title").forEach(elem=>elem.contentEditable = true);
            });
        });
    };
}
let orderBtns;
const setTierListeners = tier => {
    const zona = tier.querySelector(".zona");
    zona.addEventListener("dragover", (e)=>{
        e.preventDefault();
        zona.appendChild(draggingNode);
        const afterElement = getDragAfterElement(zona, e.clientX, e.clientY);
        if (!afterElement) zona.appendChild(draggingNode);
        else zona.insertBefore(draggingNode, afterElement);
    });
    if (tier.className === "char-container zona") return;
    orderBtns = {
        options : tier.querySelector(".options"),
        up : tier.querySelector("[data-value='up']"),
        down : tier.querySelector("[data-value='down']")
    }
    
    orderBtns.options.addEventListener("click", (e)=>{
        openTierSettings(e.target.parentElement.parentElement, 
            e.target.parentElement.parentElement.className, 
            e.target.parentElement.parentElement.children[0].textContent)
        });
        orderBtns.up.addEventListener("click", (e)=>{
        sortTier(e.target.parentElement.parentElement.parentElement, e.target.dataset.value)
    });
    orderBtns.down.addEventListener("click", (e)=>{
        sortTier(e.target.parentElement.parentElement.parentElement, e.target.dataset.value)
    });
}

// Sorting & Settings
const tierContainer = document.querySelector(".tier-container");
const sortTier = (currentTier, newPos)=>{
    const tiersArr = tierContainer.querySelectorAll(".tier");
    let afterTier, i = 0;
    switch (newPos) {
        case "up":
            for (; i < tiersArr.length; i++) {
                if (i == 0 && tiersArr[i].id === currentTier.id) return;
                afterTier = i == 0 ? undefined : tiersArr[i-1];
                if (tiersArr[i].id === currentTier.id) break;
            }
            break;
        case "down":
            for (; i < tiersArr.length; i++) {
                if (i == tiersArr.length-1) break;
                afterTier = tiersArr[i+2];
                if (tiersArr[i] === currentTier) break;
            }
            break;
    }
    if (newPos == "down" && i == tiersArr.length-2) tierContainer.appendChild(currentTier);
    else tierContainer.insertBefore(currentTier, afterTier);
}

const settingsWindow = document.getElementById("settings-overlay");
const closeSettingsBtn = document.getElementById("close");
const colorLiArr = settingsWindow.getElementsByTagName("li");
const txtArea = settingsWindow.getElementsByTagName("textarea")[0];
let tierToEdit;

const openTierSettings = (tier, color, label)=>{
    tierToEdit = tier;
    color = color.split(" ")[1];
    for (let li of colorLiArr) {
        li.classList.remove("current-color");
        if (li.className == color) {
            li.classList.add("current-color");
        }
    }
    txtArea.value = label.trim();
    settingsWindow.classList.remove("d-none");
}
const changeTierColor = colorBtn => {
    const newColor = colorBtn.dataset.value;
    for (let li of colorLiArr) {
        if (li == colorBtn) {
            li.classList.add("current-color");
        }
        else li.classList.remove("current-color");
    }
    tierToEdit.className = "tier " + newColor;
}
const changeTierLabel = ()=>{tierToEdit.getElementsByTagName("h3")[0].innerText = txtArea.value;}
const closeTierSettings = ()=>{settingsWindow.classList.add("d-none");}

closeSettingsBtn.addEventListener("click", ()=>{
    changeTierLabel();
    closeTierSettings();
});
for (let li of colorLiArr) {li.addEventListener("click", (e)=>{changeTierColor(e.target)})}

// Tier Management Buttons
const clearBtn = document.getElementById("clear-tier"),
    deleteBtn = document.getElementById("delete-tier"),
    addAboveBtn = document.getElementById("add-tier-above"),
    addBelowBtn = document.getElementById("add-tier-below");

clearBtn.addEventListener("click", ()=>clearTier());
deleteBtn.addEventListener("click", ()=>{clearTier(), deleteTier()});
addAboveBtn.addEventListener("click", ()=>addTier("above"));
addBelowBtn.addEventListener("click", ()=>addTier("below"));

const clearTier = ()=>{
    const zona = tierToEdit.querySelector(".zona");
    for (let i = zona.children.length; i > 0; i--) {
        zonasArr[zonasArr.length-1].appendChild(zona.children[0]);
    }
}
const deleteTier = ()=> {tierToEdit.remove(); closeTierSettings();}
const addTier = pos => {
    switch (pos) {
        case "above":
            tierContainer.insertBefore(addNewTier(), tierToEdit);
            break;
        case "below":
            const tiersArr = document.querySelectorAll(".tier");
            for (let i = 0; i < tiersArr.length; i++) {
                if (tiersArr[i] == tierToEdit) {
                    tierContainer.insertBefore(addNewTier(), tiersArr[i+1]);
                }
            }
            break;
    }
}
