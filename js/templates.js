/* component-loader.js - Versión combinada */
// Definimos BASE_PATH si no existe
const BASE_PATH = window.BASE_PATH || '';

/**
 * Carga un CSS con prioridad en el documento o en un shadowRoot
 */
const loadCSS = (href, targetRoot = document.head) => {
  return new Promise((resolve, reject) => {
    const fullHref = href.startsWith('http')
      ? href
      : `${BASE_PATH}${href.startsWith('/') ? '' : '/'}${href}`;

    // Verificar si ya está cargado
    if (targetRoot.querySelector(`link[href="${fullHref}"]`)) {
      resolve();
      return;
    }

    // Para CSS que no son de frameworks externos, usamos !important
    if (!fullHref.includes('bootstrap') && 
        !fullHref.includes('fontawesome') && 
        !fullHref.includes('cdnjs')) {
      
      // En lugar de cargar el link normal, hacemos fetch y modificamos
      fetch(fullHref)
        .then(response => {
          if (!response.ok) throw new Error(`No se pudo cargar el CSS: ${fullHref}`);
          return response.text();
        })
        .then(cssText => {
          // Agregar !important a todas las propiedades
          const modifiedCSS = cssText.replace(/([^{:]+)(:[^;!]+)(;|$)/g, "$1$2 !important$3");
          
          // Crear una etiqueta style en lugar de link
          const style = document.createElement('style');
          style.setAttribute('data-source', fullHref);
          style.textContent = modifiedCSS;
          
          // Agregar al target (document.head o shadowRoot)
          targetRoot.appendChild(style);
          resolve();
        })
        .catch(err => {
          console.error('Error al cargar y modificar CSS:', err);
          reject(err);
        });
    } else {
      // Para CSS de frameworks, cargamos normalmente
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fullHref;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`No se pudo cargar el CSS: ${fullHref}`));
      targetRoot.appendChild(link);
    }
  });
};

/**
 * Evalúa contenido de script en línea en el contexto adecuado
 */
const evalInlineScript = (scriptContent, component = null) => {
  try {
    if (component) {
      // Crear una función que tenga acceso al componente y helper functions
      const scriptFunction = new Function('component', `
        // Helpers para acceder a elementos dentro del componente
        const getElementById = (id) => component.querySelector('#' + id);
        const querySelector = (selector) => component.querySelector(selector);
        const querySelectorAll = (selector) => component.querySelectorAll(selector);
        
        // El script original
        ${scriptContent}
      `);
      
      // Ejecutar la función con el componente como argumento
      scriptFunction(component);
    } else {
      // Script global normal
      new Function(scriptContent)();
    }
  } catch (error) {
    console.error('Error evaluando script en línea:', error);
    console.error('Contenido con error:', scriptContent.substring(0, 150) + '...');
  }
};

/**
 * Carga un <script> (externo o en línea) y espera a que termine
 */
const loadScript = (scriptElement, component = null) => {
  return new Promise((resolve) => {
    const src = scriptElement.getAttribute('src') || scriptElement.src;
    
    if (src) {
      // Script externo
      const fullSrc = src.startsWith('http') || src.startsWith('//')
        ? src
        : `${BASE_PATH}${src.startsWith('/') ? '' : '/'}${src}`;
      
      if (component) {
        // Para scripts externos en componentes, hacemos fetch y lo evaluamos
        fetch(fullSrc)
          .then(response => response.text())
          .then(content => {
            evalInlineScript(content, component);
            resolve();
          })
          .catch(error => {
            console.error('Error cargando script externo para componente:', error);
            resolve();
          });
      } else {
        // Script normal para el documento
        const newScript = document.createElement('script');
        Array.from(scriptElement.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        newScript.src = fullSrc;
        newScript.onload = resolve;
        newScript.onerror = () => {
          console.error('Error cargando script:', fullSrc);
          resolve();
        };
        document.body.appendChild(newScript);
      }
    } else {
      // Script en línea
      evalInlineScript(scriptElement.textContent, component);
      setTimeout(resolve, 0);
    }
  });
};

/**
 * Procesa scripts específicamente para el menú de navegación
 */
const setupNavigationMenu = (component) => {
  // Activar el menú móvil
  const menuToggle = component.querySelector('#menuToggle');
  const mainMenu = component.querySelector('#mainMenu');
  
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', function() {
      mainMenu.classList.toggle('active');
    });
  }
  
  // Activar el comportamiento sticky
  const navWrapper = component.querySelector('#navWrapper56');
  const mainNav = component.querySelector('#mainNav');
  
  if (navWrapper && mainNav) {
    // Función para manejar el scroll
    const handleScroll = function() {
      const navPosition = navWrapper.getBoundingClientRect().top;
      
      if (navPosition <= 0) {
        mainNav.classList.add('sticky');
      } else {
        mainNav.classList.remove('sticky');
      }
    };
    
    // Inicializar al cargar
    handleScroll();
    
    // Agregar event listener
    window.addEventListener('scroll', handleScroll);
  }
};

/**
 * Inserta contenido clonado en el elemento y procesa recursos
 */
const processComponent = async (element, templateContent) => {
  try {
    // Limpiar el elemento
    element.innerHTML = '';
    
    // Clonar el contenido
    const clone = templateContent.cloneNode(true);
    
    // 1. Primero cargar los estilos
    const styles = clone.querySelectorAll('link[rel="stylesheet"]');
    const stylePromises = Array.from(styles).map(link =>
      loadCSS(link.getAttribute('href'), element)
    );
    await Promise.all(stylePromises);
    
    // 2. Insertar el contenido clonado
    element.appendChild(clone);
    
    // 3. Procesar scripts
    const scripts = element.querySelectorAll('script');
    for (const script of Array.from(scripts)) {
      await loadScript(script, element);
      
      // Opcional: remover script después de ejecutar para evitar duplicados
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }
    
    // 4. Setup específico para navegación si existe
    if (element.querySelector('.navigationnav23')) {
      setupNavigationMenu(element);
    }
    
    // 5. Disparar evento de componente cargado
    element.dispatchEvent(new CustomEvent('component-loaded', { 
      bubbles: true, 
      detail: { component: element } 
    }));
  } catch (error) {
    console.error('Error procesando componente:', error);
    element.innerHTML = '<div>Error al cargar el componente</div>';
  }
};

/**
 * Componente <site-head>
 */
class SiteHead extends HTMLElement {
  constructor() {
    super();
    // Usamos shadowRoot para mayor aislamiento
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      this.shadowRoot.innerHTML = '<div>Cargando encabezado...</div>';
      const response = await fetch(`${BASE_PATH}/templates/head.html`);
      if (!response.ok) throw new Error(`No se pudo cargar head.html: ${response.statusText}`);
      const html = await response.text();
      const template = document.createElement('template');
      template.innerHTML = html;
      await processComponent(this.shadowRoot, template.content);
    } catch (error) {
      console.error('Error cargando el encabezado:', error);
      this.shadowRoot.innerHTML = '<div>Error al cargar el encabezado</div>';
    }
  }
}

/**
 * Componente <site-footer>
 */
class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      this.shadowRoot.innerHTML = '<div>Cargando pie de página...</div>';
      const response = await fetch(`${BASE_PATH}/templates/footer.html`);
      if (!response.ok) throw new Error(`No se pudo cargar footer.html: ${response.statusText}`);
      const html = await response.text();
      const template = document.createElement('template');
      template.innerHTML = html;
      await processComponent(this.shadowRoot, template.content);
    } catch (error) {
      console.error('Error cargando el pie de página:', error);
      this.shadowRoot.innerHTML = '<div>Error al cargar el pie de página</div>';
    }
  }
}

/**
 * Componente <html-include src="...">
 */
class HTMLInclude extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {
      const src = this.getAttribute('src');
      if (!src) throw new Error('El atributo src es obligatorio para html-include');
      this.shadowRoot.innerHTML = '<div>Cargando contenido...</div>';
      const response = await fetch(`${BASE_PATH}${src.startsWith('/') ? '' : '/'}${src}`);
      if (!response.ok) throw new Error(`No se pudo cargar ${src}: ${response.statusText}`);
      const html = await response.text();
      const template = document.createElement('template');
      template.innerHTML = html;
      await processComponent(this.shadowRoot, template.content);
    } catch (error) {
      console.error('Error cargando incluido HTML:', error);
      this.shadowRoot.innerHTML = '<div>Error al cargar el contenido</div>';
    }
  }
}

// Registramos los componentes
customElements.define('site-head', SiteHead);
customElements.define('site-footer', SiteFooter);
customElements.define('html-include', HTMLInclude);

// Aviso de que todo está listo
window.addEventListener('DOMContentLoaded', () => {
  console.log('Componentes web registrados y listos');
});