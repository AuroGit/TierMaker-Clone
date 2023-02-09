const IDBRequest = indexedDB.open("tierDB",1);

IDBRequest.onsuccess = ()=>{
    if (location.pathname.includes("index") || location.pathname == '/TierMaker-Clone/') indexBuild();
    console.log("Base de datos 'tierDB' abierta correctamente.")
};
IDBRequest.onerror = (e)=>{
    console.log("Error al abrir base de datos.");
    console.log(e.target.error);
};
IDBRequest.onupgradeneeded = ()=>{
    const db = IDBRequest.result;
    db.createObjectStore("category", { keyPath: "category" });
    getJSON();
};

async function getJSON(){
    return await fetch("./js/tierlists.json")
        .then(response=>response.json())
        .then(data=>{
            for (let item of data) createObj(item);
            indexBuild();
        })
}

// CRUD
const createObj = obj => {
    const objStore = getOSData("readwrite", `Objeto: "${obj.category}" creado correctamente.`);
    objStore.add(obj);
}

export function getOSData(mode, msg) {
    const db = IDBRequest.result;
    const IDBTransaction = db.transaction("category", mode);
    const objStore = IDBTransaction.objectStore("category");
    IDBTransaction.addEventListener("complete", ()=>{if (msg) console.log(msg)});
    return objStore;
}

// Index Build
const createCategoryElement = dbObj => {
    let tiersLI = "";
    for (let item of dbObj.tierlists) {
        tiersLI += `<li style="background-image: url(${item.cover || './assets/images/default.png'})">
            <a href="./tierlist.html?cat=${dbObj.category}&tierlist=${item.title.replace(" ", "_")}"><span>${item.title}</span></a>
        </li>`;
    }
    const html = `<h2><a href="./category.html?cat=${dbObj.category}">${dbObj.category}</a></h2>
    <ul class="category">${tiersLI}</ul>`;

    const categoryLI = document.createElement("LI");
    categoryLI.innerHTML = html;
    return categoryLI;
}

const indexBuild = ()=>{
    const categoriesUL = document.getElementById("categories");

    const objStore = getOSData("readonly");
    objStore.getAll().onsuccess = (e)=>{
        e.target.result.forEach(item => {
            const fragment = document.createDocumentFragment();
            fragment.appendChild(createCategoryElement(item));
            categoriesUL.appendChild(fragment);
        });
    };
}
