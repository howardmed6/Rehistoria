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
  'La formación de la Tierra, eón Fanerozoico: la era Cenozoica y el surgimiento de los mamíferos',
  '/la-formacion-de-la-tierra-fanerozoico-era-cenozoica-surgimiento-mamiferos/',
  'Howard Medina',
  '2025-04-18',
  'https://res.cloudinary.com/dpj17zdr2/image/upload/v1745023943/ANIMALES-DE-LA-ERA-CENOZOICA-1024x682_nkcljx.jpg',
  'Un recorrido por la era Cenozoica, desde los primeros mamíferos tras la extinción de los dinosaurios hasta el surgimiento de los homínidos y la evolución humana.',
  'El eón Fanerozoico y la era Cenozoica: el surgimiento de los mamíferos | Relatatoria',
  'Descubre cómo evolucionaron y dominaron los mamíferos durante la era Cenozoica, desde los pequeños supervivientes de la extinción masiva hasta el surgimiento de los homínidos y la evolución humana.',
  'Representación de la vida durante la era Cenozoica',
  'Contenido completo del artículo aquí...'
);

-- Paso 2: Insertar categorías si no existen
INSERT INTO categorias (name) VALUES ('Ciencia'), ('Historia'), ('Especial') ON CONFLICT (name) DO NOTHING;

-- Paso 3: Relacionar el artículo con sus categorías
INSERT INTO articulo_categoria (articulo_id, categoria_id)
VALUES (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-fanerozoico-era-cenozoica-surgimiento-mamiferos/'),
  (SELECT id FROM categorias WHERE name = 'Ciencia')
), (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-fanerozoico-era-cenozoica-surgimiento-mamiferos/'),
  (SELECT id FROM categorias WHERE name = 'Historia')
), (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-fanerozoico-era-cenozoica-surgimiento-mamiferos/'),
  (SELECT id FROM categorias WHERE name = 'Especial')
);