const API_KEY = '192e0b9821564f26f52949758ea3c473';
const BASE_URL = 'https://api.themoviedb.org/3';
const contenedor = document.getElementById('contenedor');

const fetchData = async (url) => {
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        return await respuesta.json();
    } catch (error) {
        console.error(error);
    }
};

const cargarPeliculasPopulares = async () => {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-MX&page=1`;
    const datos = await fetchData(url);
    mostrarPeliculas(datos.results);
};

const cargarImagenesSerie = async (idSerie) => {
    const url = `${BASE_URL}/tv/${idSerie}/images?api_key=${API_KEY}`;
    const datos = await fetchData(url);
    mostrarImagenesSerie(datos.backdrops);
};

// Obtener todas las películas desde la API local
const obtenerPeliculas = async () => {
    try {
        const respuesta = await fetch(API_KEY);
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        const datos = await respuesta.json();
        mostraPeliculas(datos.peliculas);
    } catch (error) {
        console.error('Error al obtener películas:', error);
    }
};
const mostraPeliculas = (peliculas) => {
    contenedor.innerHTML = peliculas.map(pelicula => `
        <div class="pelicula">
            <img class="poster" src="https://image.tmdb.org/t/p/w500/${pelicula.poster_path}">
            <h3 class="titulo">${pelicula.title}</h3>
        </div>
    `).join('');
};

const mostrarImagenesSerie = (imagenes) => {
    contenedor.innerHTML = imagenes.map(imagen => `
        <div class="imagen-serie">
            <img class="poster-serie" src="https://image.tmdb.org/t/p/w500/${imagen.file_path}" alt="Imagen de serie">
			<h3 class="titulo">${imagenes.title}</h3>
        </div>
    `).join('');
};

const manejarEventoMenu = () => {
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', async function (e) {
            e.preventDefault();
            const seccion = this.getAttribute('href').substring(1);
            contenedor.innerHTML = ''; // Limpia el contenedor
            document.getElementById('inicio').style.display = seccion === 'inicio' ? 'block' : 'none';

            if (seccion === 'populares') {
                await cargarPeliculasPopulares();
                window.removeEventListener('scroll', infinitoScroll);
            } else if (seccion === 'proximamente') {
                await cargarImagenesSerie(12345); // Cambia 12345 por el ID de la serie que quieras mostrar
                window.removeEventListener('scroll', infinitoScroll);
            }
        });
    });
};
// Crear una nueva película en la API local
const crearPelicula = async (pelicula) => {
    try {
        const respuesta = await fetch(API_KEY, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pelicula)
        });
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        const nuevaPelicula = await respuesta.json();
        console.log('Película creada:', nuevaPelicula);
        obtenerPeliculas(); // Refresca la lista de películas
    } catch (error) {
        console.error('Error al crear película:', error);
    }
};

// Actualizar una película existente en la API local
const actualizarPelicula = async (id, pelicula) => {
    try {
        const respuesta = await fetch(`${API_LOCAL}/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pelicula)
        });
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        const peliculaActualizada = await respuesta.json();
        console.log('Película actualizada:', peliculaActualizada);
        obtenerPeliculas(); // Refresca la lista de películas
    } catch (error) {
        console.error('Error al actualizar película:', error);
    }
};

// Eliminar una película de la API local
const eliminarPelicula = async (id) => {
    try {
        const respuesta = await fetch(`${API_LOCAL}/${id}`, {
            method: 'DELETE'
        });
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        const peliculaEliminada = await respuesta.json();
        console.log('Película eliminada:', peliculaEliminada);
        obtenerPeliculas(); // Refresca la lista de películas
    } catch (error) {
        console.error('Error al eliminar película:', error);
    }
};

// Mostrar películas desde la API local en el DOM
const mostrarPeliculas = (peliculas) => {
    contenedor.innerHTML = peliculas.map(pelicula => `
        <div class="pelicula">
            <img class="poster" src="${pelicula.imagen}" alt="Poster de ${pelicula.titulo}">
            <h3 class="titulo">${pelicula.titulo}</h3>
            <p>${pelicula.descripcion}</p>
            <p>Precio: $${pelicula.precio}</p>
            <p>Clasificación: ${pelicula.clasificacion}/5</p>
            <button onclick="editarPelicula(${pelicula.id})">Editar</button>
            <button onclick="eliminarPelicula(${pelicula.id})">Eliminar</button>
        </div>
    `).join('');
};

// Función para manejar la edición de una película
const editarPelicula = (id) => {
    const titulo = prompt('Nuevo título:');
    const descripcion = prompt('Nueva descripción:');
    const imagen = prompt('Nueva URL de la imagen:');
    const precio = prompt('Nuevo precio:');
    const clasificacion = prompt('Nueva clasificación (1-5):');

    const peliculaActualizada = { titulo, descripcion, imagen, precio, clasificacion };
    actualizarPelicula(id, peliculaActualizada);
};

const infinitoScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        pagina++;
        cargarPeliculasPopulares();
    }
};

const init = () => {
    manejarEventoMenu();
    cargarPeliculasPopulares(); // Cargar películas populares por defecto
    window.addEventListener('scroll', infinitoScroll);
};

init();
