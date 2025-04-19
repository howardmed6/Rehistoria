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
  'El origen del hombre moderno, su expansión y desarrollo antes de las civilizaciones de Mesopotamia',
  '/el-origen-hombre-moderno-expansion-desarrollo-antes-civilizaciones-mesopotamia/',
  'Howard Medina',
  '2025-04-18',
  'https://res.cloudinary.com/dpj17zdr2/image/upload/v1745025125/Expansion-hombre-moderno-768x302_vgumur.jpg',
  'Un recorrido por los orígenes del homo sapiens, su expansión por el mundo y desarrollo cultural antes del surgimiento de las primeras civilizaciones en Mesopotamia.',
  'El origen del hombre moderno y su expansión global | Relatatoria',
  'Descubre el fascinante viaje del homo sapiens desde África hace 150.000 años, su expansión por el mundo y el desarrollo cultural que sentó las bases para las primeras civilizaciones.',
  '',
  'Contenido completo del artículo aquí...'
);

-- Paso 2: Insertar categorías si no existen
INSERT INTO categorias (name) VALUES ('Historia'), ('Antropología'), ('Especial') ON CONFLICT (name) DO NOTHING;

-- Paso 3: Relacionar el artículo con sus categorías
INSERT INTO articulo_categoria (articulo_id, categoria_id)
VALUES (
  (SELECT id FROM articulos WHERE permalink = '/origen-hombre-moderno-expansion-desarrollo-antes-civilizaciones-mesopotamia/'),
  (SELECT id FROM categorias WHERE name = 'Historia')
), (
  (SELECT id FROM articulos WHERE permalink = '/origen-hombre-moderno-expansion-desarrollo-antes-civilizaciones-mesopotamia/'),
  (SELECT id FROM categorias WHERE name = 'Antropología')
), (
  (SELECT id FROM articulos WHERE permalink = '/origen-hombre-moderno-expansion-desarrollo-antes-civilizaciones-mesopotamia/'),
  (SELECT id FROM categorias WHERE name = 'Especial')
);