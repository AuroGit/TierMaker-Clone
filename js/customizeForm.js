"use strict";

import { getOSData } from "./tierDB.js";

const url = location.search;
const paramsURL = new URLSearchParams(url);

// Category Select Build
const selectCat = document.querySelector("select"),
    newCatDiv = document.getElementById("new-cat"),
    newCatInput = newCatDiv.querySelector("input"),
    addCatBtn = newCatDiv.querySelector("button");
const IDBRequest = indexedDB.open("tierDB",1);

const createOption = cat => {
    const fragment = document.createDocumentFragment();
    const option = document.createElement("OPTION");
    option.value = cat;
    option.innerText = cat;
    fragment.appendChild(option);
    selectCat.insertBefore(fragment, selectCat.querySelector("option[value='new']"));
    selectCat.value = selectCat.querySelector("option").innerText;
}
IDBRequest.onsuccess = ()=>{
    if (location.pathname.includes("customize")) {        
        const objStore = getOSData("readonly");
        objStore.getAll().onsuccess = (e)=>{
            e.target.result.forEach(item=>createOption(item.category));
            if (paramsURL.get("cat")) {
                selectCat.value = paramsURL.get("cat");
                selectCat.setAttribute("disabled", "");
            }
        };
    }
};
addCatBtn.addEventListener("click", (e)=>{
    e.preventDefault();

    if (newCatInput.value.trim() !== "") {
        createOption(newCatInput.value);
        selectCat.value = newCatInput.value;
        newCatInput.value = "";
        newCatDiv.style.display = "none";
    }
});
selectCat.addEventListener("input", ()=>{
    if (selectCat.value === "new") {
        selectCat.value = "";
        newCatDiv.removeAttribute("style");
    } else newCatDiv.style.display = "none";
});

// Name Validation
const checkValidName = name => {
    let titlesArr = [];
    const checkNameMsg = document.querySelector("[data-valid-name]");
    const objStore = getOSData("readonly");
    objStore.getAll().onsuccess = (e)=>{
        e.target.result.forEach(item => {
            item.tierlists.forEach(list=>{titlesArr.push(list.title);});
        });

        for (let str of titlesArr) {
            if (str == name) {
                checkNameMsg.dataset.validName = false;
                scroll({top: 0, behavior: "smooth"});
                break;
            } else {
                checkNameMsg.dataset.validName = true;
            }
        }
    };
    return checkNameMsg.dataset.validName;
}

// Extra Rows
const showExtraRows = document.getElementById("show-extra-rows");
const extraRows = document.querySelector(".extra-rows");
showExtraRows.addEventListener("click", ()=>{
    extraRows.classList.toggle("open");
    extraRows.classList.contains("open") ?
    showExtraRows.querySelector("h3").innerText = "Ocultar Etiquetas Extra"
    : showExtraRows.querySelector("h3").innerText = "Mostrar Etiquetas Extra";
});

// Button Validation
const submitBtn = document.getElementById("submit");
const nameInput = document.getElementById("name"),
    coverInput = document.getElementById("cover").querySelector("input"),
    imgSetInput = document.getElementById("set").querySelector("input");
const reqInputsArr = [nameInput, coverInput, imgSetInput];
const reqInputs = {name:"", cover:"", set:""};

const coverDiv = document.getElementById("cover"),
    imgSetDiv = document.getElementById("set");
reqInputsArr.forEach(item=>item.addEventListener("input", (e)=>{
    switch (e.target.dataset.id) {
        case "name":
            checkValidName(nameInput.value);
            break;
        case "cover":
            if (coverDiv.children.length > 2) coverDiv.removeChild(coverDiv.querySelector("img"));
            loadImg(e.target.files[0], coverDiv);
            break;
        case "set":
            if (e.target.files.length < 2 || e.target.files.length > 50) {
                if (confirm("Debes subir al menos 2 archivos y hasta un máximo de 30")) e.target.value = "";
            } else {
                while (imgSetDiv.querySelector("img")) imgSetDiv.removeChild(imgSetDiv.querySelector("img"));
                [...e.target.files].forEach(item=>loadImg(item, imgSetDiv));
            }
            break;
    }
    reqInputs[e.target.dataset.id] = e.target.value;
    reqInputs.name != "" && reqInputs.cover != "" && reqInputs.set != "" ?
    submitBtn.classList.remove("disabled") : submitBtn.classList.add("disabled")
}));

// Load imgs
const loadImg = (file, div)=>{
    const img = URL.createObjectURL(file);
    const elemIMG = document.createElement("IMG");
    elemIMG.src = img;
    div.id === "cover" ? elemIMG.classList.add("landscape") : imgOrientation(elemIMG);
    div.appendChild(elemIMG);
}

// Img Orientation
const orientSelect = document.getElementById("orientation");
const imgOrientation = img => {
    switch (orientSelect.value) {
        case "landscape":
            img.className = "landscape";
            break;
        case "portrait":
            img.className = "portrait";
            break;
        case "circle":
            img.className = "circle";
            break;
        case "square": default:
            img.className = "square";
            break;
    }
}
orientSelect.addEventListener("input", ()=>{
    const setImgsArr = imgSetDiv.getElementsByTagName("img");console.log(setImgsArr);
    if (setImgsArr.length > 0) {
        for (let img of setImgsArr) imgOrientation(img);
    }
})

// Submit
const template = {category:"", tierlists:[{title:"", cover:"", tierRowsLabels:[], imgOrientation:"", images:[]}]};
submitBtn.addEventListener("click", (e)=>{
    e.preventDefault();

    
    if (checkValidName(nameInput.value) && !submitBtn.disabled) {
        const catSelect = document.getElementById("category");
        const rowInputs = document.getElementById("rows").getElementsByTagName("input");
        
        template.category = paramsURL.get("cat") || catSelect.value != "new" ? catSelect.value : null;
        template.tierlists[0].title = nameInput.value;
        template.tierlists[0].imgOrientation = orientSelect.value;

        // const reader = new FileReader();
        // reader.onload = () =>  template.tierlists[0].cover = reader.result;
        // if (coverInput.files[0]) reader.readAsDataURL(coverInput.files[0]);
        template.tierlists[0].cover = "./assets/images/default.png";
        [...imgSetInput.files].forEach(img=>{
            // const reader = new FileReader();
            // reader.onload = () => template.tierlists[0].images.push({data:reader.result});
            // if (img) reader.readAsDataURL(img);
            template.tierlists[0].images.push("./assets/images/default.png");
        });

        let rows = [{color:"red", label:"S"},{color:"orange", label:"A"},
            {color:"yellow", label:"B"},{color:"lime", label:"C"},
            {color:"green", label:"D"}];
        for (let index in rows) {
            rows[index].label = rowInputs[index].value !== "" ? rowInputs[index].value
            : rowInputs[index].placeholder;
        }
        if (extraRows.classList.contains("open")) {
            let moreRows = [{color:"cyan", label:""},{color:"blue", label:""},
            {color:"dark-blue", label:""},{color:"pink", label:""},
            {color:"dark-pink", label:""}];
            for (let i = 5; i < rowInputs.length; i++) {
                if (rowInputs[i].value !== "") {
                    moreRows[i-5].label = rowInputs[i].value;
                    rows.push(moreRows[i-5]);
                }
            }
        }
        template.tierlists[0].tierRowsLabels = rows;
        if (paramsURL.get("cat")) {
            const objStore = getOSData("readwrite");
            objStore.get(paramsURL.get("cat")).onsuccess = (e) => {
                e.target.result.tierlists.push(template.tierlists[0]);
                objStore.put(e.target.result);
            }
        } else createObj(template);

        if (confirm("La subida de imágenes no está implementada aún, serán sustituidas por un archivo por defecto. ¿Quieres volver al inicio?")) {
            location.replace("./index.html");
        }
    }
});

const createObj = obj => {
    const objStore = getOSData("readwrite", `Objeto: "${obj.category}" creado correctamente.`);
    objStore.add(obj);
}