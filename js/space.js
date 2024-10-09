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
    //Borro todo lo que hay en contenedor
    document.getElementById("contenedor").innerHTML = "";

    //Muestro spinner
    document.getElementById("spinner").style.display="block";
    let input = document.getElementById("inputBuscar").value;
    if(input != ""){
        let response = await getData(URL+"search?q="+input);
        data = response.collection;
    }
    displayData(data);
}

function displayData(collection){
    let items = collection.items;
    console.log("displayData:", items.length);
    let contenedor = document.getElementById("contenedor");
    let content = '';

    //oculto spinner
    document.getElementById("spinner").style.display="none";

    if(items.length == 0){
        //No hay coincidencias en la busqueda.
        content= `
        <div class="alert alert-danger" role="alert">
        No se encontraron resultados en la busqueda
        </div>`
        contenedor.innerHTML = content;
    }else{
        //Muestro resultados
        //Hacemos for para usar el i como id para recuperar elemento al abrir modal
        //El json no trae id, y el nasa_id trae a veces comillas que no puedo parsear bien.
        for(i=0; i < items.length;i++){
            let item = items[i];
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
                        contenedor.insertAdjacentHTML('beforeend', content);

                    break;
                    case "video":
                        //El elemento es un video
                        content = `
                        <div class="card col-3 mx-2 mt-2" >
                        <div class="image-container img-thumbnail mb-1" >
                            <img src="${item.links[0].href}" class="card-img-top image" onclick="displayModal('${i}')">
                        </div>
                        <div class="card-body">
                        <span class="badge bg-success">video</span>
                        <h5 class="card-title">${item.data[0].title}</h5>
                        <p class="card-text">${item.data[0].description}</p>
                        </div>
                    </div>`;
                    contenedor.insertAdjacentHTML('afterbegin', content);
                    break;
                    case "audio":
                        //contenido es audio
                        content = `
                        <div class="card col-3 mx-2 mt-2" >
                        <div class="image-container img-thumbnail mb-1" >
                            <img src="audio.png" class="card-img-top image" onclick="displayModal('${i}')">
                        </div>
                        <div class="card-body">
                        <span class="badge bg-warning text-dark">Audio</span>
                        <h5 class="card-title">${item.data[0].title}</h5>
                        <p class="card-text">${item.data[0].description}</p>
                        </div>
                    </div>`;
                    contenedor.insertAdjacentHTML('afterbegin', content);
                    break;
                    default:
                        //no encontre el tipo de elemento
                        console.log("Otro media_type:",item);
                }
            } catch (error){
                console.log("error al display:",item, i);
            }
        };
}
}

let videoLinks =" ";
async function displayModal(id){
    console.log("displayModal:",id);
    let item = data.items[id];
    //item = item[0];
    console.log("displayModal item:", item)
    let content = "";

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
        case "audio":
            //Es un audio
            console.log("audio")
            let audioLinks = await getData(item.href);
            console.log("displayModal audio links:", audioLinks.length, " audio links");
            let audioLink = audioLinks.filter((link)=>link.includes("128k.mp3"));
            content = `
            <audio controls>
                <source src="${audioLink}" type="audio/mp3">
                Your browser does not support the audio element.
            </audio>`
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

//Funcion para cerrar el modal cuando se está reproduciendo video y limpiar contenido
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