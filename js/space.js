const URL='https://images-api.nasa.gov/';
let data=[];
let defaultModalContent = `
    <div class="d-flex justify-content-center align-items-center">
    <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
    </div`;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnBuscar").addEventListener("click", search);
    //Boton cerrar modal (por video)
    document.getElementById("colseModal").addEventListener("click", closeModal);

});

async function search(){
    //Muestro spinner
    document.getElementById("spinner").style.display="block";
    let input = document.getElementById("inputBuscar").value;
    if(input != ""){
        data = await fetch(URL+"search?q="+input)
        .then(response => response.json())
        .then(data => 
            //chequear que no sea vacio
            data.collection);
    }
    displayData(data);
}

function displayData(collection){
    let items = collection.items;
    console.log("displayData:", items.length)
    let content = '';

    //oculto spinner
    document.getElementById("spinner").style.display="none";

    items.forEach(item => {
        try{
            switch(item.data[0].media_type){
                case "image":
                    //El elemento es una imagen
                    content = `
                    <div class="card col-3 mx-2 mt-2" >
                    <div class="image-container img-thumbnail mb-1">
                        <img src="${item.links[0].href}" class="card-img-top image" onclick="displayModal('${item.data[0].nasa_id}')">
                    </div>
                    <div class="card-body">
                    <span class="badge bg-primary">image</span>
                    <h5 class="card-title">${item.data[0].title}</h5>
                    <p class="card-text">${item.data[0].description}</p>
                    </div>
                    </div>`;
                document.getElementById("contenedor").insertAdjacentHTML('beforeend', content);

                break;
                case "video":
                    //El elemento es un video
                    content = `
                    <div class="card col-3 mx-2 mt-2" >
                    <div class="image-container img-thumbnail mb-1" >
                        <img src="${item.links[0].href}" class="card-img-top image" onclick="displayModal('${item.data[0].nasa_id}')">
                    </div>
                    <div class="card-body">
                    <span class="badge bg-success">video</span>
                    <h5 class="card-title">${item.data[0].title}</h5>
                    <p class="card-text">${item.data[0].description}</p>
                    </div>
                </div>`;
                document.getElementById("contenedor").insertAdjacentHTML('afterbegin', content);
                break;
                case "audio":
                    //contenido es audio
                    content = `
                    <div class="card col-3 mx-2 mt-2" >
                    <div class="image-container img-thumbnail mb-1" >
                        <img src="audio.png" class="card-img-top image" onclick="displayModal('${item.data[0].nasa_id}')">
                    </div>
                    <div class="card-body">
                    <span class="badge bg-warning text-dark">Audio</span>
                    <h5 class="card-title">${item.data[0].title}</h5>
                    <p class="card-text">${item.data[0].description}</p>
                    </div>
                </div>`;
                document.getElementById("contenedor").insertAdjacentHTML('afterbegin', content);
                break;
                default:
                    //no encontre el tipo de elemento
                    console.log("Otro media_type:",item);
            }
        } catch (error){
            console.log("error al display:",item)
        }


    });
}
let videoLinks =" ";
async function displayModal(id){
    console.log("displayModal:",id);
    let item = data.items.filter((item) => item.data[0].nasa_id == id );
    item = item[0];
    console.log("displayModal item:", item)

    //creo contenido.
    switch(item.data[0].media_type){
        case "image":
            //Es una imagen
            content = `
            <img src="${item.links[0].href}" class="img-fluid img-modal"></img>
            `
        break;
        case "video":
            //es un video
            videoLinks = await getData(item.href);
            console.log("displayModal video links:", videoLinks.length, " video links");
            let videoLink = videoLinks.filter((link)=>link.includes("orig.mp4"));
            console.log("displayModal video:", videoLink);
            content = `
            <div class="ratio ratio-16x9">
            <video id="modalVideo" controls>
                <source src="${videoLink}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            </div>`;

        break;
        default: console.log("displayModal error switch");
    }


    //inserto contenido
    document.getElementById("modalContent").innerHTML = content;
    document.getElementById("ModalLabel").innerHTML = item.data[0].title;
    //muestro modal
    let myModal = new bootstrap.Modal(document.getElementById('detailModal'));
    myModal.show();
}

function closeModal(){
    let myModal = new bootstrap.Modal(document.getElementById('detailModal'));
    let video = document.getElementById("modalVideo");

    //pauso video
    if(video != null){
        video.pause();
    }
    //cierro modal
    myModal.hide();
    document.getElementById("modalContent").innerHTML = defaultModalContent;
    document.getElementById("ModalLabel").innerHTML = "Cargando...";
}


async function getData(url){
    return await fetch(url)
    .then(response => response.json())
}