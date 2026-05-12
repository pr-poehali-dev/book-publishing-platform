
CREATE TABLE t_p54894760_book_publishing_plat.books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  year TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Новинка',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p54894760_book_publishing_plat.chapters (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES t_p54894760_book_publishing_plat.books(id),
  number TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  teaser TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  read_time TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p54894760_book_publishing_plat.comments (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES t_p54894760_book_publishing_plat.chapters(id),
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
