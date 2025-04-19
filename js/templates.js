/* component-loader.js */
// Asegúrate de definir BASE_PATH antes de usarlo
const BASE_PATH = window.BASE_PATH || '';

/**
 * Carga un CSS de forma asíncrona en un target (document.head o shadowRoot)
 */
const loadCSS = (href, targetRoot = document.head) => {
  return new Promise((resolve, reject) => {
    const fullHref = href.startsWith('http')
      ? href
      : `${BASE_PATH}${href.startsWith('/') ? '' : '/'}${href}`;

    if (targetRoot.querySelector(`link[href="${fullHref}"]`)) {
      resolve();
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fullHref;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`No se pudo cargar el CSS: ${fullHref}`));
    targetRoot.appendChild(link);
  });
};

/**
 * Evalúa contenido de script en línea en el contexto global
 */
const evalInlineScript = (scriptContent) => {
  try {
    new Function(scriptContent)();
  } catch (error) {
    console.error('Error evaluando script en línea:', error);
  }
};

/**
 * Carga un <script> (externo o en línea) y espera a que termine
 */
const loadScript = (scriptElement) => {
  return new Promise((resolve) => {
    const src = scriptElement.getAttribute('src') || scriptElement.src;
    if (src) {
      const newScript = document.createElement('script');
      Array.from(scriptElement.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (newScript.src && !newScript.src.startsWith('http') && !newScript.src.startsWith('//')) {
        const relative = scriptElement.getAttribute('src');
        newScript.src = `${BASE_PATH}${relative.startsWith('/') ? '' : '/'}${relative}`;
      }
      newScript.onload = resolve;
      newScript.onerror = resolve;
      document.body.appendChild(newScript);
    } else {
      evalInlineScript(scriptElement.textContent);
      setTimeout(resolve, 0);
    }
  });
};

/**
 * Carga primero todos los <link> y luego los <script> de un template
 */
const loadComponentResources = async (componentElement) => {
  try {
    // Target = shadowRoot si existe, sino document.head
    const targetRoot = componentElement.shadowRoot || document.head;

    // Cargar estilos
    const styles = componentElement.querySelectorAll('link[rel="stylesheet"]');
    const stylePromises = Array.from(styles).map(link =>
      loadCSS(link.getAttribute('href'), targetRoot)
    );
    await Promise.all(stylePromises);

    // Cargar scripts en orden
    const scripts = componentElement.querySelectorAll('script');
    for (const script of Array.from(scripts)) {
      await loadScript(script);
    }
  } catch (error) {
    console.error('Error cargando recursos del componente:', error);
  }
};

/**
 * Inserta contenido clonado (template.content) en el elemento (puede ser shadowRoot)
 */
const processComponent = async (element, templateContent) => {
  const root = element.shadowRoot || element;
  root.innerHTML = '';
  const clone = templateContent.cloneNode(true);
  root.appendChild(clone);
};

/**
 * Componente <site-head> aislado con Shadow DOM
 */
class SiteHead extends HTMLElement {
  constructor() {
    super();
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
      await loadComponentResources(template.content);
      await processComponent(this, template.content);
    } catch (error) {
      console.error('Error cargando el encabezado:', error);
      this.shadowRoot.innerHTML = '<div>Error al cargar el encabezado</div>';
    }
  }
}

/**
 * Componente <site-footer> aislado con Shadow DOM
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
      await loadComponentResources(template.content);
      await processComponent(this, template.content);
    } catch (error) {
      console.error('Error cargando el pie de página:', error);
      this.shadowRoot.innerHTML = '<div>Error al cargar el pie de página</div>';
    }
  }
}

/**
 * Componente <html-include src="..."> aislado con Shadow DOM
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
      await loadComponentResources(template.content);
      await processComponent(this, template.content);
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
