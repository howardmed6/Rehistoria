-- Paso 1: Insertar el artículo con meta descripción mejorada
INSERT INTO articulos (
  layout, 
  title, 
  permalink, 
  author, 
  date, 
  image, 
  description, 
  meta_title, 
  meta_description, 
  alt_text, 
  content
) VALUES (
  'none',
  'La formación de la Tierra, eón Fanerozoico: la era Mesozoica y las especies del Periodo Triásico, Jurásico y Cretácico',
  '/la-formacion-de-la-tierra-fanerozoico-era-mesozoica-especies-triasico-jurasico-cretacico/',
  'Howard Medina',
  '2025-04-18',
  'https://res.cloudinary.com/dpj17zdr2/image/upload/v1745024251/66003874-siluetas-de-dinosaurios-del-periodo-cretacico-de-la-era-mesozoica-con-nombres_gygkty.jpg',
  'Un recorrido por la era Mesozoica, desde los primeros dinosaurios del Triásico hasta la gran extinción que marcó el fin del Cretácico.',
  'El eón Fanerozoico y la era Mesozoica: el dominio de los dinosaurios | Relatatoria',
  'Descubre cómo evolucionaron y dominaron los dinosaurios durante la era Mesozoica, desde los primeros arcosaurios hasta la extinción masiva causada por el impacto del meteorito hace 65 millones de años.',
  'Representación de la vida durante la era Mesozoica',
  'Contenido completo del artículo aquí...'
);

-- Paso 2: Insertar categorías si no existen
INSERT INTO categorias (name) VALUES ('Ciencia'), ('Historia'), ('Especial') ON CONFLICT (name) DO NOTHING;

-- Paso 3: Relacionar el artículo con sus categorías
INSERT INTO articulo_categoria (articulo_id, categoria_id)
VALUES (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-fanerozoico-era-mesozoica-especies-triasico-jurasico-cretacico/'),
  (SELECT id FROM categorias WHERE name = 'Ciencia')
), (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-fanerozoico-era-mesozoica-especies-triasico-jurasico-cretacico/'),
  (SELECT id FROM categorias WHERE name = 'Historia')
), (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-fanerozoico-era-mesozoica-especies-triasico-jurasico-cretacico/'),
  (SELECT id FROM categorias WHERE name = 'Especial')
);