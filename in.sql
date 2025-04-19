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
  'Era Cenozoica: el periodo Cuaternario, la evolución hasta los humanos modernos',
  '/era-cenozoica-periodo-cuaternario-evolucion-humanos-modernos/',
  'Howard Medina',
  '2025-04-18',
  'https://res.cloudinary.com/dpj17zdr2/image/upload/v1745024076/taxonomia-de-los-primates1-768x843_pnppja.jpg',
  'Un recorrido por el periodo Cuaternario de la Era Cenozoica, centrado en la evolución de los homínidos hasta convertirse en los humanos modernos.',
  'Era Cenozoica: periodo Cuaternario y evolución de los homínidos | Relatatoria',
  'Descubre cómo evolucionaron los primates durante el periodo Cuaternario, desde el Australopithecus anamensis hasta el Homo sapiens, y cómo se desarrolló la prehistoria humana.',
  '',
  'Contenido completo del artículo aquí...'
);

-- Paso 2: Insertar categorías si no existen
INSERT INTO categorias (name) VALUES ('Ciencia'), ('Historia'), ('Especial') ON CONFLICT (name) DO NOTHING;

-- Paso 3: Relacionar el artículo con sus categorías
INSERT INTO articulo_categoria (articulo_id, categoria_id)
VALUES (
  (SELECT id FROM articulos WHERE permalink = '/era-cenozoica-periodo-cuaternario-evolucion-humanos-modernos/'),
  (SELECT id FROM categorias WHERE name = 'Ciencia')
), (
  (SELECT id FROM articulos WHERE permalink = '/era-cenozoica-periodo-cuaternario-evolucion-humanos-modernos/'),
  (SELECT id FROM categorias WHERE name = 'Historia')
), (
  (SELECT id FROM articulos WHERE permalink = '/era-cenozoica-periodo-cuaternario-evolucion-humanos-modernos/'),
  (SELECT id FROM categorias WHERE name = 'Especial')
);