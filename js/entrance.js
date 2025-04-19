document.addEventListener('DOMContentLoaded', function() {
    const newsContainer = document.getElementById('news-container');
    const BASE_URL = 'https://www.rehistoria.com';
    
    // Configuración de Supabase
    const SUPABASE_URL = 'https://hkvkwwxwrkxckmxmvcdl.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhrdmt3d3h3cmt4Y2tteG12Y2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDg3MjIsImV4cCI6MjA2MDQ4NDcyMn0.dxOFrOk5GhGJnypRN7TtMcue2TbG-KchsF8WMTVAWNM';
    
    // Función para mostrar errores
    function showError(message) {
        newsContainer.innerHTML = `
            <div class="news-error">
                Error: ${message}
            </div>
        `;
        console.error('Error:', message);
    }
    
    // Función para formatear fecha
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
    
    // Función para mostrar las noticias
    function displayNews(news) {
        if (!news || news.length === 0) {
            newsContainer.innerHTML = `
                <div class="news-error">
                    No se encontraron noticias disponibles.
                </div>
            `;
            return;
        }
        
        let newsHTML = '';
        
        news.forEach((article) => {
            const fullUrl = `${BASE_URL}${article.permalink}`;
            const formattedDate = article.date ? formatDate(article.date) : '';
            
            newsHTML += `
                <a href="${fullUrl}" class="news-link">
                    <div class="news-item">
                        <img src="${article.image}" alt="${article.title}" class="news-thumbnail" onerror="this.src='https://via.placeholder.com/70x70'">
                        <div class="news-content">
                            <h4 class="news-title">${article.title}</h4>
                            <span class="news-date">${formattedDate}</span>
                        </div>
                    </div>
                </a>
            `;
        });
        
        newsContainer.innerHTML = newsHTML;
    }
    
    // Verificar que Supabase está disponible
    if (typeof supabase === 'undefined') {
        showError('La biblioteca de Supabase no se cargó correctamente.');
        return;
    }
    
    try {
        // Versión más reciente de la API de Supabase
        const { createClient } = supabase;
        const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Consulta async/await para mejor manejo de errores
        (async function() {
            try {
                console.log('Iniciando consulta a Supabase para noticias...');
                
                // Obtener el ID de la categoría "Noticias"
                const { data: categoriaData, error: categoriaError } = await supabaseClient
                    .from('categorias')
                    .select('id')
                    .eq('name', 'Noticias')
                    .single();
                    
                if (categoriaError) {
                    throw new Error(`Error al obtener la categoría: ${categoriaError.message}`);
                }
                
                if (!categoriaData) {
                    throw new Error('No se encontró la categoría "Noticias"');
                }
                
                const categoriaId = categoriaData.id;
                
                // Obtener los IDs de artículos que tienen la categoría "Noticias"
                const { data: relacionesData, error: relacionesError } = await supabaseClient
                    .from('articulo_categoria')
                    .select('articulo_id')
                    .eq('categoria_id', categoriaId);
                    
                if (relacionesError) {
                    throw new Error(`Error al obtener relaciones: ${relacionesError.message}`);
                }
                
                if (!relacionesData || relacionesData.length === 0) {
                    throw new Error('No hay artículos con la categoría "Noticias"');
                }
                
                const articuloIds = relacionesData.map(rel => rel.articulo_id);
                
                // Obtener los artículos con los IDs obtenidos
                const { data: articulosData, error: articulosError } = await supabaseClient
                    .from('articulos')
                    .select('id, title, permalink, image, date')
                    .in('id', articuloIds)
                    .order('id', { ascending: false })
                    .limit(6);
                    
                if (articulosError) {
                    throw new Error(`Error al obtener artículos: ${articulosError.message}`);
                }
                
                console.log('Noticias recibidas:', articulosData);
                displayNews(articulosData);
            } catch (err) {
                showError(`No se pudieron cargar las noticias: ${err.message}`);
                console.error('Error completo:', err);
            }
        })();
        
    } catch (err) {
        showError(`Error al inicializar Supabase: ${err.message}`);
        console.error('Error completo:', err);
    }
});