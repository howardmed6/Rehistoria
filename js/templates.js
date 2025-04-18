

// Función para cargar CSS de manera asíncrona
const loadCSS = (href) => {
  return new Promise((resolve, reject) => {
    const fullHref = href.startsWith('http') ? href : `${BASE_PATH}${href.startsWith('/') ? '' : '/'}${href}`;
    
    // Verificar si el CSS ya está cargado
    if (document.querySelector(`link[href="${fullHref}"]`)) {
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fullHref;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`No se pudo cargar el CSS: ${fullHref}`));
    document.head.appendChild(link);
  });
};

// Función para evaluar scripts en línea
const evalInlineScript = (scriptContent) => {
  const script = document.createElement('script');
  script.textContent = scriptContent;
  document.body.appendChild(script);
};

// Función para cargar scripts de manera asíncrona
const loadScript = (scriptElement) => {
  return new Promise((resolve) => {
    // Para scripts con src (externos)
    if (scriptElement.src || scriptElement.getAttribute('src')) {
      const newScript = document.createElement('script');
      
      // Copiar todos los atributos
      Array.from(scriptElement.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Si es una ruta relativa y no comienza con http, añadir BASE_PATH
      if (newScript.src && !newScript.src.startsWith('http') && !newScript.src.startsWith('//')) {
        const srcAttr = newScript.getAttribute('src');
        newScript.setAttribute('src', `${BASE_PATH}${srcAttr.startsWith('/') ? '' : '/'}${srcAttr}`);
      }
      
      newScript.onload = resolve;
      newScript.onerror = resolve; // Continuamos incluso si hay error
      document.body.appendChild(newScript);
    } 
    // Para scripts en línea
    else {
      try {
        // Evaluamos el contenido del script
        evalInlineScript(scriptElement.textContent);
      } catch (error) {
        console.error('Error al ejecutar script en línea:', error);
      }
      // Resolvemos inmediatamente después de la evaluación
      setTimeout(resolve, 0);
    }
  });
};

// Función mejorada para cargar recursos de componentes
const loadComponentResources = async (componentElement) => {
  try {
    // 1. Cargar todos los estilos primero y esperar a que terminen
    const styles = componentElement.querySelectorAll('link[rel="stylesheet"]');
    const stylePromises = Array.from(styles).map(link => 
      loadCSS(link.getAttribute('href'))
    );
    
    await Promise.all(stylePromises);
    
    // 2. Cargar scripts en orden secuencial para respetar dependencias
    const scripts = componentElement.querySelectorAll('script');
    for (const script of Array.from(scripts)) {
      await loadScript(script);
    }
  } catch (error) {
    console.error('Error cargando recursos del componente:', error);
  }
};

// Función para procesar componentes HTML
const processComponent = async (element, templateContent) => {
  // Limpiar el contenido actual
  element.innerHTML = '';
  
  // Clonar el contenido antes de insertarlo
  const clone = templateContent.cloneNode(true);
  
  // Insertar el contenido clonado
  element.appendChild(clone);
  
  // Extraer y ejecutar scripts en línea
  const inlineScripts = Array.from(element.querySelectorAll('script')).filter(script => !script.src);
  inlineScripts.forEach(script => {
    // Crear un nuevo script y evaluarlo
    const newScript = document.createElement('script');
    newScript.textContent = script.textContent;
    document.body.appendChild(newScript);
    
    // Opcional: eliminar el script original para evitar duplicidad
    script.parentNode.removeChild(script);
  });
};

// Componente para el head
class SiteHead extends HTMLElement {
  async connectedCallback() {
    try {
      // Mostrar indicador de carga si es necesario
      this.innerHTML = '<div>Cargando encabezado...</div>';
      
      const response = await fetch(`/templates/head.html`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar head.html: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      // Usar template para procesar correctamente
      const template = document.createElement('template');
      template.innerHTML = html;
      
      // Cargar recursos antes de insertar el contenido
      await loadComponentResources(template.content);
      
      // Procesar el componente
      await processComponent(this, template.content);
    } catch (error) {
      console.error('Error cargando el encabezado:', error);
      this.innerHTML = '<div>Error al cargar el encabezado</div>';
    }
  }
}

// Componente para el footer
class SiteFooter extends HTMLElement {
  async connectedCallback() {
    try {
      // Mostrar indicador de carga si es necesario
      this.innerHTML = '<div>Cargando pie de página...</div>';
      
      const response = await fetch(`/templates/footer.html`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar footer.html: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      const template = document.createElement('template');
      template.innerHTML = html;
      
      // Cargar recursos antes de insertar el contenido
      await loadComponentResources(template.content);
      
      // Procesar el componente
      await processComponent(this, template.content);
    } catch (error) {
      console.error('Error cargando el pie de página:', error);
      this.innerHTML = '<div>Error al cargar el pie de página</div>';
    }
  }
}

// Componente genérico para incluir cualquier HTML
class HTMLInclude extends HTMLElement {
  async connectedCallback() {
    try {
      // Obtener la ruta del atributo src
      const src = this.getAttribute('src');
      if (!src) {
        throw new Error('El atributo src es obligatorio para html-include');
      }
      
      // Mostrar indicador de carga
      this.innerHTML = '<div>Cargando contenido...</div>';
      
      const response = await fetch(`${BASE_PATH}${src.startsWith('/') ? '' : '/'}${src}`);
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${src}: ${response.statusText}`);
      }
      
      const html = await response.text();
      
      const template = document.createElement('template');
      template.innerHTML = html;
      
      // Cargar recursos antes de insertar el contenido
      await loadComponentResources(template.content);
      
      // Procesar el componente
      await processComponent(this, template.content);
    } catch (error) {
      console.error('Error cargando incluido HTML:', error);
      this.innerHTML = '<div>Error al cargar el contenido</div>';
    }
  }
}

// Registrar componentes
customElements.define('site-head', SiteHead);
customElements.define('site-footer', SiteFooter);
customElements.define('html-include', HTMLInclude);

// Notificar cuando todos los componentes están cargados
window.addEventListener('DOMContentLoaded', () => {
  console.log('Todos los componentes web están registrados y listos para usar');
});