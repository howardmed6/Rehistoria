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
  'La formación de la Tierra, el Precámbrico y los primeros signos de vida',
  '/la-formacion-de-la-tierra-precambrico-y-primeros-signos-de-vida/',
  'Howard Medina',
  '2025-04-18',
  'https://upload.wikimedia.org/wikipedia/commons/7/73/LithosphereAndAsthenosphere.jpg',
  'Un recorrido por la formación de nuestro planeta, desde el polvo estelar hasta los primeros organismos vivos durante el Precámbrico.',
  'La formación de la Tierra y primeros signos de vida | Relatatoria',
  'Descubre cómo se formó la Tierra a partir del polvo cósmico, la evolución durante el Precámbrico y la aparición de los primeros organismos vivos hace millones de años.',
  'Representación de la formación de la Tierra primitiva',
  'Contenido completo del artículo aquí...'
);

-- Paso 2: Insertar categorías si no existen
INSERT INTO categorias (name) VALUES ('Ciencia'), ('Historia'), ('Especial') ON CONFLICT (name) DO NOTHING;

-- Paso 3: Relacionar el artículo con sus categorías
INSERT INTO articulo_categoria (articulo_id, categoria_id)
VALUES (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-precambrico-y-primeros-signos-de-vida/'),
  (SELECT id FROM categorias WHERE name = 'Ciencia')
), (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-precambrico-y-primeros-signos-de-vida/'),
  (SELECT id FROM categorias WHERE name = 'Historia')
), (
  (SELECT id FROM articulos WHERE permalink = '/la-formacion-de-la-tierra-precambrico-y-primeros-signos-de-vida/'),
  (SELECT id FROM categorias WHERE name = 'Especial')
);