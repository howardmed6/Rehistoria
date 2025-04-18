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
  'post',
  'La revolución invisible: cómo la teoría de cuerdas ha transformado la física moderna',
  'revolucion-teoria-cuerdas',
  'Howard Medina',
  '2025-04-18',
  'https://upload.wikimedia.org/wikipedia/commons/d/d4/Calabi-Yau.png',
  'Exploración de la teoría de cuerdas y su impacto en la física teórica contemporánea.',
  'Teoría de cuerdas: qué es y por qué revoluciona la física | Rehistoria',
  'Guía completa sobre teoría de cuerdas: desde sus fundamentos hasta cómo unifica la relatividad y la mecánica cuántica. Explicación con ejemplos visuales.', -- 156 caracteres (óptimo para SEO)
  'Diagrama 3D de una variedad Calabi-Yau, estructura matemática usada en teoría de cuerdas',
  'Contenido completo del artículo aquí...'
);

-- Pasos 2 y 3 (categorías) se mantienen igual que antes
INSERT INTO categorias (name) VALUES ('Noticias'), ('Ciencias'), ('Especial') ON CONFLICT (name) DO NOTHING;

INSERT INTO articulo_categoria (articulo_id, categoria_id)
VALUES (
  (SELECT id FROM articulos WHERE slug = 'revolucion-teoria-cuerdas'),
  (SELECT id FROM categorias WHERE name = 'Ciencias')
), (
  (SELECT id FROM articulos WHERE slug = 'revolucion-teoria-cuerdas'),
  (SELECT id FROM categorias WHERE name = 'Especial')
);