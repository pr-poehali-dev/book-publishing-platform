import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API_BOOKS = "https://functions.poehali.dev/b585f907-8b95-4716-9712-36fa05038f48";
const API_CHAPTERS = "https://functions.poehali.dev/e9e3081f-b2c4-4a12-a181-074c55d09645";
const API_COMMENTS = "https://functions.poehali.dev/6054197d-d598-4c96-a374-f777faf5d790";
const ADMIN_PASSWORD = "admin123";

type Section = "home" | "book" | "content" | "chat" | "author" | "contacts" | "admin";
type BookView = "library" | "chapters" | "reading";
type AdminTab = "books" | "chapters";

interface Book {
  id: number;
  title: string;
  subtitle: string;
  year: string;
  cover_url: string;
  description: string;
  status: string;
  sort_order: number;
}

interface Chapter {
  id: number;
  book_id: number;
  number: string;
  title: string;
  teaser: string;
  content: string;
  read_time: string;
  sort_order: number;
}

interface Comment {
  id: number;
  chapter_id: number;
  author: string;
  text: string;
  created_at: string;
}

interface Bookmark {
  chapterId: number;
  chapterTitle: string;
  paragraphIndex: number;
  text: string;
  savedAt: string;
}

interface ChatMessage {
  id: string;
  author: string;
  text: string;
  time: string;
}

const contentItems = [
  { id: "c1", type: "Интервью", title: "Как рождается история", date: "10 апреля 2026", description: "Разговор об источниках вдохновения, о тумане как метафоре и о том, почему первые черновики всегда страшнее чистого листа.", duration: "24 мин" },
  { id: "c2", type: "Эссе", title: "О городах, которых больше нет", date: "2 марта 2026", description: "Личное эссе о памяти, пространстве и о том, как места продолжают жить в нас даже после того, как мы их покидаем.", duration: "12 мин" },
  { id: "c3", type: "Черновик", title: "Удалённые сцены: встреча на вокзале", date: "15 февраля 2026", description: "Сцена, которая не вошла в книгу. Первая встреча Марины и Антона — версия, от которой пришлось отказаться.", duration: "8 мин" },
  { id: "c4", type: "Плейлист", title: "Музыка книги", date: "1 февраля 2026", description: "Треки, которые звучали во время написания. Сорок пять минут тишины с голосом.", duration: "45 мин" },
  { id: "c5", type: "Фото", title: "Места, вдохновившие книгу", date: "20 января 2026", description: "Небольшой фотодневник: улицы, кафе, парки.", duration: "5 мин" },
  { id: "c6", type: "Лекция", title: "Структура молчания в прозе", date: "5 января 2026", description: "Запись лекции о роли пауз, недосказанности и пространства между словами.", duration: "51 мин" },
];

const initialChatMessages: ChatMessage[] = [
  { id: "1", author: "Алина К.", text: "Только что дочитала вторую главу. Сцена с письмом — до мурашек.", time: "14:22" },
  { id: "2", author: "Михаил Р.", text: "Я думаю, это мать. По стилю очень похоже на то, как она говорит позже.", time: "14:35" },
  { id: "3", author: "Дмитрий", text: "Фраза «рука знает больше, чем голова» — это вообще про всю книгу целиком.", time: "15:03" },
];

const emptyBook: Omit<Book, "id"> = { title: "", subtitle: "", year: "", cover_url: "", description: "", status: "Новинка", sort_order: 0 };
const emptyChapter: Omit<Chapter, "id"> = { book_id: 0, number: "", title: "", teaser: "", content: "", read_time: "", sort_order: 0 };

export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [bookView, setBookView] = useState<BookView>("library");
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; }
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [chatInput, setChatInput] = useState("");
  const [chatName, setChatName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [hoveredParagraph, setHoveredParagraph] = useState<string | null>(null);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");

  // Admin
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>("books");
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [bookForm, setBookForm] = useState<Omit<Book, "id">>(emptyBook);
  const [chapterForm, setChapterForm] = useState<Omit<Chapter, "id">>(emptyChapter);
  const [saving, setSaving] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchBooks = useCallback(async () => {
    const r = await fetch(API_BOOKS);
    const d = await r.json();
    setBooks(d.books || []);
  }, []);

  const fetchChapters = useCallback(async (bookId?: number) => {
    const url = bookId ? `${API_CHAPTERS}?book_id=${bookId}` : API_CHAPTERS;
    const r = await fetch(url);
    const d = await r.json();
    setChapters(d.chapters || []);
  }, []);

  const fetchComments = useCallback(async (chapterId: number) => {
    const r = await fetch(`${API_COMMENTS}?chapter_id=${chapterId}`);
    const d = await r.json();
    setComments(d.comments || []);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { localStorage.setItem("bookmarks", JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => {
    if (section === "chat") setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [section, chatMessages]);

  const navItems: { id: Section; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "book", label: "Книги" },
    { id: "content", label: "Контент" },
    { id: "chat", label: "Чат" },
    { id: "author", label: "Об авторе" },
    { id: "contacts", label: "Контакты" },
  ];

  const selectedBook = books.find(b => b.id === selectedBookId) ?? null;
  const bookChapters = chapters.filter(c => c.book_id === selectedBookId);
  const selectedChapter = bookChapters.find(c => c.id === selectedChapterId) ?? null;

  const goToSection = (s: Section) => {
    setSection(s);
    if (s === "book") setBookView("library");
    setMobileMenuOpen(false);
  };

  const openBook = async (bookId: number) => {
    setSelectedBookId(bookId);
    setLoading(true);
    await fetchChapters(bookId);
    setLoading(false);
    setBookView("chapters");
    setSection("book");
  };

  const openChapter = async (chapterId: number) => {
    setSelectedChapterId(chapterId);
    setBookView("reading");
    setComments([]);
    await fetchComments(chapterId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addBookmark = (chapterId: number, chapterTitle: string, paragraphIndex: number, text: string) => {
    const exists = bookmarks.find(b => b.chapterId === chapterId && b.paragraphIndex === paragraphIndex);
    if (exists) {
      setBookmarks(prev => prev.filter(b => !(b.chapterId === chapterId && b.paragraphIndex === paragraphIndex)));
      setBookmarkToast("Закладка удалена");
    } else {
      setBookmarks(prev => [...prev, { chapterId, chapterTitle, paragraphIndex, text: text.slice(0, 80) + "...", savedAt: new Date().toLocaleDateString("ru-RU") }]);
      setBookmarkToast("Закладка сохранена");
    }
    setTimeout(() => setBookmarkToast(null), 2500);
  };

  const isBookmarked = (chapterId: number, paragraphIndex: number) =>
    bookmarks.some(b => b.chapterId === chapterId && b.paragraphIndex === paragraphIndex);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !nameSet) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), author: chatName, text: chatInput.trim(), time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const sendComment = async () => {
    if (!commentInput.trim() || !commentAuthor.trim() || !selectedChapterId) return;
    const r = await fetch(API_COMMENTS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chapter_id: selectedChapterId, author: commentAuthor.trim(), text: commentInput.trim() }) });
    const d = await r.json();
    if (d.ok) {
      setComments(prev => [...prev, { id: d.id, chapter_id: selectedChapterId, author: commentAuthor, text: commentInput.trim(), created_at: d.created_at }]);
      setCommentInput("");
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const currentChapterIndex = bookChapters.findIndex(c => c.id === selectedChapterId);

  // Parse chapter content (split by \n\n or \n)
  const getParagraphs = (content: string) =>
    content.split(/\n\n|\n/).map(p => p.trim()).filter(Boolean);

  // ── ADMIN helpers ──
  const handleAdminLogin = () => {
    if (adminPwInput === ADMIN_PASSWORD) { setAdminAuthed(true); setAdminPwError(false); fetchChapters(); }
    else setAdminPwError(true);
  };

  const startEditBook = (book: Book) => { setEditingBook(book); setBookForm({ title: book.title, subtitle: book.subtitle, year: book.year, cover_url: book.cover_url, description: book.description, status: book.status, sort_order: book.sort_order }); };
  const startNewBook = () => { setEditingBook({ id: -1 } as Book); setBookForm(emptyBook); };

  const saveBook = async () => {
    setSaving(true);
    if (editingBook!.id === -1) {
      await fetch(API_BOOKS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookForm) });
    } else {
      await fetch(API_BOOKS, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingBook!.id, ...bookForm }) });
    }
    await fetchBooks();
    setEditingBook(null);
    setSaving(false);
  };

  const deleteBook = async (id: number) => {
    if (!confirm("Удалить книгу и все её главы?")) return;
    await fetch(`${API_BOOKS}?id=${id}`, { method: "DELETE" });
    await fetchBooks();
  };

  const startEditChapter = (ch: Chapter) => { setEditingChapter(ch); setChapterForm({ book_id: ch.book_id, number: ch.number, title: ch.title, teaser: ch.teaser, content: ch.content, read_time: ch.read_time, sort_order: ch.sort_order }); };
  const startNewChapter = (bookId?: number) => { setEditingChapter({ id: -1 } as Chapter); setChapterForm({ ...emptyChapter, book_id: bookId ?? (books[0]?.id ?? 0) }); };

  const saveChapter = async () => {
    setSaving(true);
    if (editingChapter!.id === -1) {
      await fetch(API_CHAPTERS, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(chapterForm) });
    } else {
      await fetch(API_CHAPTERS, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingChapter!.id, ...chapterForm }) });
    }
    await fetchChapters();
    setEditingChapter(null);
    setSaving(false);
  };

  const deleteChapter = async (id: number) => {
    if (!confirm("Удалить главу и все её комментарии?")) return;
    await fetch(`${API_CHAPTERS}?id=${id}`, { method: "DELETE" });
    await fetchChapters();
  };

  const inputCls = "w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-3 py-2 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/60 transition-colors";

  return (
    <div className="min-h-screen bg-[var(--fog-1)] noise">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--fog-1)]/90 backdrop-blur-sm border-b border-[var(--fog-3)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => goToSection("home")} className="font-display text-lg font-light tracking-wide text-[var(--fog-text)] hover:text-[var(--fog-accent)] transition-colors">
            Серый свет
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => goToSection(item.id)}
                className={`px-4 py-1.5 text-sm rounded transition-all duration-200 font-body ${section === item.id ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium" : "text-[var(--fog-muted)] hover:text-[var(--fog-text)] hover:bg-[var(--fog-2)]"}`}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowBookmarks(!showBookmarks)} className="relative fog-btn px-3 py-1.5 rounded flex items-center gap-1.5 text-sm">
              <Icon name="Bookmark" size={14} />
              <span className="hidden sm:inline">Закладки</span>
              {bookmarks.length > 0 && <span className="ml-0.5 bg-[var(--fog-accent)] text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{bookmarks.length}</span>}
            </button>
            <button onClick={() => goToSection("admin")} className="fog-btn px-2.5 py-1.5 rounded" title="Админ-панель">
              <Icon name="Settings" size={15} />
            </button>
            <button className="md:hidden fog-btn px-2.5 py-1.5 rounded" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={16} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--fog-3)] bg-[var(--fog-1)] px-6 py-3 flex flex-col gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => goToSection(item.id)}
                className={`text-left px-3 py-2 text-sm rounded transition-all font-body ${section === item.id ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium" : "text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)]"}`}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setShowBookmarks(false)}>
          <div className="w-full max-w-sm bg-white border-l border-[var(--fog-3)] h-full overflow-y-auto shadow-xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--fog-3)] flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--fog-text)]">Закладки</h3>
              <button onClick={() => setShowBookmarks(false)}><Icon name="X" size={18} className="text-[var(--fog-muted)]" /></button>
            </div>
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center text-[var(--fog-muted)] text-sm font-body">
                <Icon name="BookmarkX" size={32} className="mx-auto mb-3 opacity-40" />
                <p>Закладок пока нет. Наведите на абзац при чтении.</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                {bookmarks.map((bm, i) => (
                  <div key={i} className="p-4 bg-[var(--fog-1)] rounded border border-[var(--fog-3)] cursor-pointer hover:bg-[var(--fog-2)] transition-colors"
                    onClick={() => { openChapter(bm.chapterId); setShowBookmarks(false); }}>
                    <div className="text-xs text-[var(--fog-muted)] mb-1 font-body">{bm.chapterTitle} · {bm.savedAt}</div>
                    <div className="text-sm text-[var(--fog-text)] font-body italic">«{bm.text}»</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {bookmarkToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--fog-text)] text-white text-sm px-4 py-2 rounded-full font-body animate-fade-in shadow-lg">
          {bookmarkToast}
        </div>
      )}

      {/* ── ADMIN ── */}
      {section === "admin" && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          {!adminAuthed ? (
            <div className="max-w-sm mx-auto mt-20">
              <div className="text-center mb-8">
                <Icon name="Lock" size={32} className="mx-auto mb-4 text-[var(--fog-muted)]" />
                <h1 className="font-display text-3xl text-[var(--fog-text)] font-light">Вход в панель</h1>
              </div>
              <div className="bg-white rounded border border-[var(--fog-3)] p-6 space-y-4">
                <input type="password" placeholder="Пароль" value={adminPwInput} onChange={e => setAdminPwInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()} className={inputCls} />
                {adminPwError && <p className="text-xs text-red-500 font-body">Неверный пароль</p>}
                <button onClick={handleAdminLogin} className="w-full fog-btn py-2.5 rounded font-medium">Войти</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-1">Управление</p>
                  <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Админ-панель</h1>
                </div>
                <button onClick={() => goToSection("book")} className="fog-btn px-4 py-2 rounded text-sm flex items-center gap-2">
                  <Icon name="Eye" size={14} /> Просмотр сайта
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-8 bg-[var(--fog-2)] p-1 rounded w-fit">
                {(["books", "chapters"] as AdminTab[]).map(tab => (
                  <button key={tab} onClick={() => setAdminTab(tab)}
                    className={`px-5 py-2 rounded text-sm font-body transition-all ${adminTab === tab ? "bg-white text-[var(--fog-text)] shadow-sm font-medium" : "text-[var(--fog-muted)] hover:text-[var(--fog-text)]"}`}>
                    {tab === "books" ? "Книги" : "Главы"}
                  </button>
                ))}
              </div>

              {/* BOOKS TAB */}
              {adminTab === "books" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl text-[var(--fog-text)]">Книги ({books.length})</h2>
                    <button onClick={startNewBook} className="fog-btn px-4 py-2 rounded text-sm flex items-center gap-2">
                      <Icon name="Plus" size={14} /> Добавить книгу
                    </button>
                  </div>

                  {books.length === 0 && !editingBook && (
                    <div className="py-16 text-center text-[var(--fog-muted)] font-body">
                      <Icon name="BookPlus" size={40} className="mx-auto mb-4 opacity-30" />
                      <p className="mb-4">Книг пока нет</p>
                      <button onClick={startNewBook} className="fog-btn px-5 py-2 rounded text-sm">Добавить первую книгу</button>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    {books.map(book => (
                      <div key={book.id} className="bg-white rounded border border-[var(--fog-3)] p-4 flex items-center gap-4">
                        {book.cover_url ? <img src={book.cover_url} alt="" className="w-12 h-16 object-cover rounded shrink-0" /> : <div className="w-12 h-16 bg-[var(--fog-2)] rounded shrink-0 flex items-center justify-center"><Icon name="Book" size={16} className="text-[var(--fog-muted)]" /></div>}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[var(--fog-text)] font-body text-sm truncate">{book.title}</div>
                          <div className="text-xs text-[var(--fog-muted)] font-body mt-0.5">{book.subtitle} · {book.year} · <span className="bg-[var(--fog-1)] px-1.5 py-0.5 rounded">{book.status}</span></div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => startEditBook(book)} className="fog-btn px-3 py-1.5 rounded text-xs flex items-center gap-1"><Icon name="Pencil" size={12} />Ред.</button>
                          <button onClick={() => deleteBook(book.id)} className="px-3 py-1.5 rounded text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 border border-red-200 transition-colors"><Icon name="Trash2" size={12} />Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Book form */}
                  {editingBook && (
                    <div className="bg-white rounded border border-[var(--fog-3)] p-6">
                      <h3 className="font-display text-lg text-[var(--fog-text)] mb-5">{editingBook.id === -1 ? "Новая книга" : "Редактировать книгу"}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Название *</label>
                          <input className={inputCls} placeholder="Серый свет" value={bookForm.title} onChange={e => setBookForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Подзаголовок</label>
                          <input className={inputCls} placeholder="Роман" value={bookForm.subtitle} onChange={e => setBookForm(f => ({ ...f, subtitle: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Год</label>
                          <input className={inputCls} placeholder="2026" value={bookForm.year} onChange={e => setBookForm(f => ({ ...f, year: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Статус</label>
                          <input className={inputCls} placeholder="Новинка" value={bookForm.status} onChange={e => setBookForm(f => ({ ...f, status: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">URL обложки</label>
                          <input className={inputCls} placeholder="https://..." value={bookForm.cover_url} onChange={e => setBookForm(f => ({ ...f, cover_url: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Описание</label>
                          <textarea rows={3} className={inputCls + " resize-none"} placeholder="Краткое описание книги..." value={bookForm.description} onChange={e => setBookForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Порядок сортировки</label>
                          <input type="number" className={inputCls} value={bookForm.sort_order} onChange={e => setBookForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5">
                        <button onClick={saveBook} disabled={saving || !bookForm.title} className="fog-btn px-5 py-2 rounded font-medium disabled:opacity-40 flex items-center gap-2">
                          {saving ? <><Icon name="Loader" size={14} className="animate-spin" />Сохранение...</> : <><Icon name="Check" size={14} />Сохранить</>}
                        </button>
                        <button onClick={() => setEditingBook(null)} className="fog-btn-outline border border-[var(--fog-3)] px-5 py-2 rounded font-body text-sm">Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CHAPTERS TAB */}
              {adminTab === "chapters" && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl text-[var(--fog-text)]">Главы ({chapters.length})</h2>
                    <button onClick={() => startNewChapter()} className="fog-btn px-4 py-2 rounded text-sm flex items-center gap-2">
                      <Icon name="Plus" size={14} /> Добавить главу
                    </button>
                  </div>

                  {books.length === 0 && (
                    <div className="py-8 text-center text-[var(--fog-muted)] font-body text-sm">
                      <p>Сначала создайте хотя бы одну книгу во вкладке «Книги»</p>
                    </div>
                  )}

                  {/* Group by book */}
                  {books.map(book => {
                    const bChapters = chapters.filter(c => c.book_id === book.id);
                    return (
                      <div key={book.id} className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] font-medium">{book.title}</h3>
                          <button onClick={() => startNewChapter(book.id)} className="text-xs text-[var(--fog-muted)] hover:text-[var(--fog-text)] font-body flex items-center gap-1 transition-colors">
                            <Icon name="Plus" size={11} /> Глава
                          </button>
                        </div>
                        {bChapters.length === 0 && <p className="text-xs text-[var(--fog-muted)] font-body italic px-1">Глав пока нет</p>}
                        <div className="space-y-2">
                          {bChapters.map(ch => (
                            <div key={ch.id} className="bg-white rounded border border-[var(--fog-3)] p-3 flex items-center gap-3">
                              <span className="font-display text-lg text-[var(--fog-muted)] w-6 shrink-0">{ch.number}</span>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-[var(--fog-text)] font-body text-sm truncate">{ch.title}</div>
                                <div className="text-xs text-[var(--fog-muted)] font-body">{ch.read_time} · {getParagraphs(ch.content).length} абз.</div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => startEditChapter(ch)} className="fog-btn px-3 py-1.5 rounded text-xs flex items-center gap-1"><Icon name="Pencil" size={12} />Ред.</button>
                                <button onClick={() => deleteChapter(ch.id)} className="px-3 py-1.5 rounded text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 border border-red-200 transition-colors"><Icon name="Trash2" size={12} />Удалить</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Chapter form */}
                  {editingChapter && (
                    <div className="bg-white rounded border border-[var(--fog-3)] p-6 mt-4">
                      <h3 className="font-display text-lg text-[var(--fog-text)] mb-5">{editingChapter.id === -1 ? "Новая глава" : "Редактировать главу"}</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Книга *</label>
                          <select className={inputCls} value={chapterForm.book_id} onChange={e => setChapterForm(f => ({ ...f, book_id: Number(e.target.value) }))}>
                            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Номер (напр. I, II, 1)</label>
                          <input className={inputCls} placeholder="I" value={chapterForm.number} onChange={e => setChapterForm(f => ({ ...f, number: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Название главы *</label>
                          <input className={inputCls} placeholder="Туман над городом" value={chapterForm.title} onChange={e => setChapterForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Время чтения</label>
                          <input className={inputCls} placeholder="7 мин" value={chapterForm.read_time} onChange={e => setChapterForm(f => ({ ...f, read_time: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Порядок сортировки</label>
                          <input type="number" className={inputCls} value={chapterForm.sort_order} onChange={e => setChapterForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">Анонс (короткий тизер)</label>
                          <input className={inputCls} placeholder="Утро начиналось так, как начинаются все важные утра..." value={chapterForm.teaser} onChange={e => setChapterForm(f => ({ ...f, teaser: e.target.value }))} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-[var(--fog-muted)] font-body block mb-1">
                            Текст главы <span className="text-[var(--fog-muted)]">(каждый абзац — с новой строки)</span>
                          </label>
                          <textarea rows={12} className={inputCls + " resize-y"} placeholder={"Первый абзац...\n\nВторой абзац...\n\nТретий абзац..."} value={chapterForm.content} onChange={e => setChapterForm(f => ({ ...f, content: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-5">
                        <button onClick={saveChapter} disabled={saving || !chapterForm.title || !chapterForm.book_id} className="fog-btn px-5 py-2 rounded font-medium disabled:opacity-40 flex items-center gap-2">
                          {saving ? <><Icon name="Loader" size={14} className="animate-spin" />Сохранение...</> : <><Icon name="Check" size={14} />Сохранить</>}
                        </button>
                        <button onClick={() => setEditingChapter(null)} className="fog-btn-outline border border-[var(--fog-3)] px-5 py-2 rounded font-body text-sm">Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ── HOME ── */}
      {section === "home" && (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-up">
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-6">Новый роман · 2026</p>
              <h1 className="font-display text-6xl md:text-7xl font-light text-[var(--fog-text)] leading-[1.05] mb-6">Серый<br /><em>свет</em></h1>
              <p className="text-[var(--fog-muted)] font-body leading-relaxed mb-8 text-lg">История о возвращении, о письмах без адреса и о том, что остаётся после тумана.</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => goToSection("book")} className="fog-btn px-6 py-2.5 rounded font-medium">Библиотека</button>
                <button onClick={() => goToSection("content")} className="fog-btn-outline border border-[var(--fog-3)] px-6 py-2.5 rounded text-[var(--fog-text)] hover:bg-[var(--fog-2)] transition-all font-body text-sm">Материалы</button>
              </div>
            </div>
            <div className="animate-fade-up-delay flex justify-center gap-6 flex-wrap">
              {books.slice(0, 3).map((book, i) => (
                <div key={book.id} className={`relative cursor-pointer group ${i === 1 ? "mt-8" : ""}`} onClick={() => openBook(book.id)}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--fog-3)] to-transparent rounded blur-xl opacity-40 group-hover:opacity-60 transition-opacity scale-105" />
                  {book.cover_url
                    ? <img src={book.cover_url} alt={book.title} className="relative w-36 md:w-44 aspect-[3/4] object-cover rounded shadow-xl group-hover:shadow-2xl transition-shadow" />
                    : <div className="relative w-36 md:w-44 aspect-[3/4] bg-[var(--fog-2)] rounded shadow-xl flex items-center justify-center border border-[var(--fog-3)]"><Icon name="Book" size={32} className="text-[var(--fog-muted)]" /></div>
                  }
                </div>
              ))}
              {books.length === 0 && (
                <div className="w-36 md:w-44 aspect-[3/4] bg-[var(--fog-2)] rounded shadow border border-[var(--fog-3)] flex flex-col items-center justify-center gap-2 text-[var(--fog-muted)]">
                  <Icon name="BookPlus" size={28} />
                  <span className="text-xs font-body text-center px-3">Добавьте книги через Admin</span>
                </div>
              )}
            </div>
          </div>
          <div className="animate-fade-up-delay-2 mt-20 grid grid-cols-3 gap-8 border-t border-[var(--fog-3)] pt-12">
            {[{ num: String(books.length || 0), label: "Книги" }, { num: String(chapters.length || 0), label: "Глав" }, { num: "6", label: "Материалов" }].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl text-[var(--fog-text)] font-light">{s.num}</div>
                <div className="text-xs text-[var(--fog-muted)] font-body mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-20">
            <h2 className="font-display text-3xl text-[var(--fog-text)] font-light mb-8">Последние материалы</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {contentItems.slice(0, 3).map(item => (
                <div key={item.id} className="p-5 bg-white rounded border border-[var(--fog-3)] hover:shadow-sm transition-all cursor-pointer" onClick={() => goToSection("content")}>
                  <span className="text-xs tracking-wide uppercase text-[var(--fog-muted)] font-body">{item.type}</span>
                  <h3 className="font-display text-lg text-[var(--fog-text)] mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--fog-muted)] font-body leading-relaxed line-clamp-2">{item.description}</p>
                  <div className="mt-3 text-xs text-[var(--fog-muted)] font-body flex items-center gap-1"><Icon name="Clock" size={12} />{item.duration}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ── BOOK: LIBRARY ── */}
      {section === "book" && bookView === "library" && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Все произведения</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Библиотека</h1>
          </div>
          {books.length === 0 && (
            <div className="py-20 text-center text-[var(--fog-muted)] font-body">
              <Icon name="BookOpen" size={40} className="mx-auto mb-4 opacity-30" />
              <p className="mb-4">Книг пока нет</p>
              <button onClick={() => goToSection("admin")} className="fog-btn px-5 py-2 rounded text-sm">Добавить книги в Admin</button>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {books.map(book => (
              <div key={book.id} className="group bg-white rounded border border-[var(--fog-3)] overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => openBook(book.id)}>
                <div className="flex">
                  <div className="w-36 shrink-0 relative overflow-hidden">
                    {book.cover_url
                      ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full min-h-[160px] bg-[var(--fog-2)] flex items-center justify-center"><Icon name="Book" size={28} className="text-[var(--fog-muted)]" /></div>
                    }
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-body text-[var(--fog-muted)] bg-[var(--fog-1)] px-2 py-0.5 rounded">{book.status}</span>
                        <span className="text-xs font-body text-[var(--fog-muted)]">{book.year}</span>
                      </div>
                      <h2 className="font-display text-2xl text-[var(--fog-text)] font-light leading-tight mb-1">{book.title}</h2>
                      <p className="text-xs text-[var(--fog-muted)] font-body mb-3 uppercase tracking-wide">{book.subtitle}</p>
                      <p className="text-sm text-[var(--fog-muted)] font-body leading-relaxed line-clamp-3">{book.description}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-[var(--fog-muted)] font-body flex items-center gap-1.5">
                        <Icon name="BookOpen" size={12} />
                        {chapters.filter(c => c.book_id === book.id).length} глав
                      </span>
                      <span className="text-xs text-[var(--fog-accent)] font-body flex items-center gap-1 group-hover:gap-2 transition-all">
                        Читать <Icon name="ArrowRight" size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── BOOK: CHAPTERS ── */}
      {section === "book" && bookView === "chapters" && selectedBook && (
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-8 text-sm font-body text-[var(--fog-muted)]">
            <button onClick={() => setBookView("library")} className="hover:text-[var(--fog-text)] transition-colors">Библиотека</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-[var(--fog-text)]">{selectedBook.title}</span>
          </div>
          {loading ? (
            <div className="py-20 text-center text-[var(--fog-muted)] font-body flex items-center justify-center gap-2">
              <Icon name="Loader" size={20} className="animate-spin" /> Загрузка...
            </div>
          ) : (
            <div className="grid md:grid-cols-[200px_1fr] gap-10 items-start">
              <div className="md:sticky md:top-24">
                {selectedBook.cover_url
                  ? <img src={selectedBook.cover_url} alt={selectedBook.title} className="w-full aspect-[3/4] object-cover rounded shadow-xl mb-4" />
                  : <div className="w-full aspect-[3/4] bg-[var(--fog-2)] rounded shadow border border-[var(--fog-3)] flex items-center justify-center mb-4"><Icon name="Book" size={36} className="text-[var(--fog-muted)]" /></div>
                }
                <p className="text-sm font-body font-medium text-[var(--fog-text)]">{selectedBook.subtitle} · {selectedBook.year}</p>
                <p className="text-xs text-[var(--fog-muted)] font-body mt-0.5">{bookChapters.length} глав</p>
              </div>
              <div>
                <h1 className="font-display text-4xl md:text-5xl text-[var(--fog-text)] font-light mb-2">{selectedBook.title}</h1>
                <p className="text-[var(--fog-muted)] font-body text-sm mb-8 leading-relaxed">{selectedBook.description}</p>
                {bookChapters.length === 0 && (
                  <div className="py-12 text-center text-[var(--fog-muted)] font-body text-sm">
                    <Icon name="FileText" size={32} className="mx-auto mb-3 opacity-30" />
                    <p>Главы ещё не добавлены</p>
                    <button onClick={() => { setAdminTab("chapters"); goToSection("admin"); }} className="mt-3 fog-btn px-4 py-2 rounded text-xs">Добавить главы</button>
                  </div>
                )}
                <h2 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-4">Содержание</h2>
                <div className="flex flex-col divide-y divide-[var(--fog-3)]">
                  {bookChapters.map(ch => (
                    <button key={ch.id} onClick={() => openChapter(ch.id)} className="group text-left py-5 hover:bg-[var(--fog-2)] -mx-3 px-3 rounded transition-all">
                      <div className="flex items-start gap-4">
                        <span className="font-display text-3xl text-[var(--fog-muted)] font-light leading-none mt-1 w-8 shrink-0">{ch.number}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <h3 className="font-display text-xl text-[var(--fog-text)] group-hover:text-[var(--fog-accent)] transition-colors">{ch.title}</h3>
                            <span className="text-xs text-[var(--fog-muted)] font-body flex items-center gap-1 shrink-0">
                              <Icon name="Clock" size={11} />{ch.read_time}
                            </span>
                          </div>
                          {ch.teaser && <p className="text-sm text-[var(--fog-muted)] font-body italic leading-relaxed">{ch.teaser}</p>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── BOOK: READING ── */}
      {section === "book" && bookView === "reading" && selectedBook && selectedChapter && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-8 text-sm font-body text-[var(--fog-muted)]">
            <button onClick={() => setBookView("library")} className="hover:text-[var(--fog-text)] transition-colors">Библиотека</button>
            <Icon name="ChevronRight" size={14} />
            <button onClick={() => setBookView("chapters")} className="hover:text-[var(--fog-text)] transition-colors">{selectedBook.title}</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-[var(--fog-text)]">{selectedChapter.title}</span>
          </div>
          <div className="grid md:grid-cols-[1fr_260px] gap-10">
            <div>
              <div className="mb-8 pb-6 border-b border-[var(--fog-3)]">
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] font-body mb-2">Глава {currentChapterIndex + 1} из {bookChapters.length}</p>
                <h1 className="font-display text-3xl md:text-4xl text-[var(--fog-text)] font-light">
                  <span className="text-[var(--fog-muted)]">{selectedChapter.number}.</span> {selectedChapter.title}
                </h1>
              </div>
              <div className="space-y-6">
                {getParagraphs(selectedChapter.content).map((para, pi) => {
                  const key = `${selectedChapter.id}-${pi}`;
                  const bookmarked = isBookmarked(selectedChapter.id, pi);
                  return (
                    <div key={pi} className="relative group" onMouseEnter={() => setHoveredParagraph(key)} onMouseLeave={() => setHoveredParagraph(null)}>
                      <p className="font-body text-[var(--fog-text)] leading-[1.9] text-base md:text-[17px] pr-8">{para}</p>
                      <button onClick={() => addBookmark(selectedChapter.id, selectedChapter.title, pi, para)}
                        className={`absolute top-1 right-0 transition-all duration-200 p-1 rounded ${hoveredParagraph === key || bookmarked ? "opacity-100" : "opacity-0"} ${bookmarked ? "text-[var(--fog-accent)]" : "text-[var(--fog-muted)] hover:text-[var(--fog-accent)]"}`}>
                        <Icon name={bookmarked ? "Bookmark" : "BookmarkPlus"} size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {/* Chapter nav */}
              <div className="mt-12 pt-6 border-t border-[var(--fog-3)] flex justify-between">
                <button onClick={() => { if (currentChapterIndex > 0) openChapter(bookChapters[currentChapterIndex - 1].id); }}
                  disabled={currentChapterIndex === 0} className="fog-btn px-4 py-2 rounded disabled:opacity-30 flex items-center gap-2">
                  <Icon name="ChevronLeft" size={14} /> Назад
                </button>
                <button onClick={() => setBookView("chapters")} className="fog-btn px-4 py-2 rounded flex items-center gap-2">
                  <Icon name="List" size={14} /> К главам
                </button>
                <button onClick={() => { if (currentChapterIndex < bookChapters.length - 1) openChapter(bookChapters[currentChapterIndex + 1].id); }}
                  disabled={currentChapterIndex === bookChapters.length - 1} className="fog-btn px-4 py-2 rounded disabled:opacity-30 flex items-center gap-2">
                  Далее <Icon name="ChevronRight" size={14} />
                </button>
              </div>

              {/* Comments */}
              <div className="mt-14">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-display text-2xl text-[var(--fog-text)] font-light">Комментарии</h2>
                  {comments.length > 0 && <span className="bg-[var(--fog-2)] text-[var(--fog-muted)] text-xs font-body px-2.5 py-1 rounded-full">{comments.length}</span>}
                </div>
                <div className="space-y-4 mb-8">
                  {comments.length === 0 ? (
                    <div className="py-10 text-center text-[var(--fog-muted)] font-body text-sm">
                      <Icon name="MessageSquare" size={28} className="mx-auto mb-3 opacity-30" />
                      <p>Станьте первым, кто оставит комментарий</p>
                    </div>
                  ) : comments.map(cmt => (
                    <div key={cmt.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-[var(--fog-2)] rounded-full flex items-center justify-center shrink-0 text-xs font-body font-medium text-[var(--fog-muted)] border border-[var(--fog-3)]">
                        {cmt.author[0]}
                      </div>
                      <div className="flex-1 bg-white rounded-lg border border-[var(--fog-3)] px-4 py-3">
                        <div className="flex items-baseline justify-between mb-1.5">
                          <span className="text-sm font-medium text-[var(--fog-text)] font-body">{cmt.author}</span>
                          <span className="text-xs text-[var(--fog-muted)] font-body">{cmt.created_at}</span>
                        </div>
                        <p className="text-sm text-[var(--fog-accent)] font-body leading-relaxed">{cmt.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={commentsEndRef} />
                </div>
                <div className="bg-white rounded-lg border border-[var(--fog-3)] p-5">
                  <h3 className="text-sm font-body font-medium text-[var(--fog-text)] mb-4">Оставить комментарий</h3>
                  <div className="space-y-3">
                    <input type="text" placeholder="Ваше имя" value={commentAuthor} onChange={e => setCommentAuthor(e.target.value)} className={inputCls} />
                    <textarea rows={3} placeholder="Ваши мысли о главе..." value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendComment(); }} className={inputCls + " resize-none"} />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--fog-muted)] font-body">Ctrl+Enter для отправки</span>
                      <button onClick={sendComment} disabled={!commentInput.trim() || !commentAuthor.trim()} className="fog-btn px-5 py-2 rounded font-medium disabled:opacity-40 flex items-center gap-2 text-sm">
                        <Icon name="Send" size={13} /> Отправить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:block">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-3">Главы</h3>
                  <nav className="flex flex-col gap-0.5">
                    {bookChapters.map(ch => (
                      <button key={ch.id} onClick={() => openChapter(ch.id)}
                        className={`text-left px-3 py-2.5 rounded text-sm font-body transition-all truncate ${ch.id === selectedChapterId ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium" : "text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)]"}`}>
                        {ch.number}. {ch.title}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* ── CONTENT ── */}
      {section === "content" && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Дополнительные материалы</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Контент</h1>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {contentItems.map(item => (
              <div key={item.id} className="bg-white rounded border border-[var(--fog-3)] p-6 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs tracking-wide uppercase text-[var(--fog-muted)] font-body bg-[var(--fog-1)] px-2.5 py-1 rounded">{item.type}</span>
                  <span className="text-xs text-[var(--fog-muted)] font-body flex items-center gap-1"><Icon name="Clock" size={11} />{item.duration}</span>
                </div>
                <h3 className="font-display text-xl text-[var(--fog-text)] mb-2 group-hover:text-[var(--fog-accent)] transition-colors">{item.title}</h3>
                <p className="text-sm text-[var(--fog-muted)] font-body leading-relaxed mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--fog-muted)] font-body">{item.date}</span>
                  <button className="fog-btn px-3 py-1.5 rounded text-xs flex items-center gap-1.5">Открыть <Icon name="ArrowRight" size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ── CHAT ── */}
      {section === "chat" && (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Общение</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Общий чат</h1>
          </div>
          <div className="bg-white rounded border border-[var(--fog-3)] h-[420px] overflow-y-auto p-5 flex flex-col gap-4 mb-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-[var(--fog-text)] font-body">{msg.author}</span>
                  <span className="text-xs text-[var(--fog-muted)] font-body">{msg.time}</span>
                </div>
                <p className="text-sm text-[var(--fog-accent)] font-body leading-relaxed">{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          {!nameSet ? (
            <div className="flex gap-3">
              <input type="text" placeholder="Ваше имя для чата..." value={chatName} onChange={e => setChatName(e.target.value)} onKeyDown={e => e.key === "Enter" && chatName.trim() && setNameSet(true)} className={inputCls} />
              <button onClick={() => chatName.trim() && setNameSet(true)} className="fog-btn px-5 py-2.5 rounded font-medium">Войти</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input type="text" placeholder="Написать сообщение..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage()} className={inputCls} />
              <button onClick={sendChatMessage} disabled={!chatInput.trim()} className="fog-btn px-5 py-2.5 rounded font-medium disabled:opacity-40 flex items-center gap-2">
                <Icon name="Send" size={14} /> Отправить
              </button>
            </div>
          )}
          {nameSet && <p className="text-xs text-[var(--fog-muted)] font-body mt-2">Вы как <span className="font-medium text-[var(--fog-text)]">{chatName}</span></p>}
        </main>
      )}

      {/* ── AUTHOR ── */}
      {section === "author" && (
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Автор</p>
              <h1 className="font-display text-5xl text-[var(--fog-text)] font-light mb-2">Анна Светлова</h1>
              <p className="text-sm text-[var(--fog-muted)] font-body mb-8">Писатель, эссеист, лектор</p>
              <div className="space-y-5 text-[var(--fog-accent)] font-body leading-relaxed">
                <p>Родилась в 1988 году в Петербурге. Изучала филологию в СПбГУ, затем несколько лет преподавала современную литературу.</p>
                <p>Пишет о городских пространствах, памяти и одиночестве в современном мире. Убеждена, что хорошая проза должна уметь молчать.</p>
                <p>«Серый свет» — третья книга. Над ней работала четыре года.</p>
              </div>
              <div className="mt-8 flex gap-3">
                <button className="fog-btn px-4 py-2 rounded flex items-center gap-2"><Icon name="Instagram" size={14} />Instagram</button>
                <button className="fog-btn px-4 py-2 rounded flex items-center gap-2"><Icon name="BookOpen" size={14} />Goodreads</button>
              </div>
            </div>
            <div>
              <div className="bg-[var(--fog-2)] rounded aspect-[4/5] flex items-center justify-center border border-[var(--fog-3)]">
                <div className="text-center text-[var(--fog-muted)]"><Icon name="User" size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-body">Фото автора</p></div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[{ num: String(books.length), label: "Книги" }, { num: "12", label: "Рассказов" }, { num: "40+", label: "Лекций" }].map(s => (
                  <div key={s.label} className="bg-white rounded border border-[var(--fog-3)] p-3 text-center">
                    <div className="font-display text-2xl text-[var(--fog-text)]">{s.num}</div>
                    <div className="text-xs text-[var(--fog-muted)] font-body mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── CONTACTS ── */}
      {section === "contacts" && (
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Связь</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Контакты</h1>
          </div>
          <div className="space-y-4 mb-10">
            {[{ icon: "Mail", label: "Почта", value: "anna@greylightbook.ru", sub: "Для прессы и сотрудничества" }, { icon: "MessageCircle", label: "Telegram", value: "@annasvetlova", sub: "Личные сообщения" }].map(c => (
              <div key={c.label} className="bg-white rounded border border-[var(--fog-3)] p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--fog-2)] rounded flex items-center justify-center shrink-0">
                  <Icon name={c.icon as "Mail" | "MessageCircle"} size={18} className="text-[var(--fog-accent)]" />
                </div>
                <div>
                  <div className="text-xs text-[var(--fog-muted)] font-body">{c.label}</div>
                  <div className="text-sm font-medium text-[var(--fog-text)] font-body mt-0.5">{c.value}</div>
                  <div className="text-xs text-[var(--fog-muted)] font-body mt-0.5">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded border border-[var(--fog-3)] p-6">
            <h2 className="font-display text-xl text-[var(--fog-text)] mb-5">Написать сообщение</h2>
            <div className="space-y-4">
              <div><label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Ваше имя</label><input type="text" placeholder="Как вас зовут" className={inputCls} /></div>
              <div><label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Email</label><input type="email" placeholder="your@email.com" className={inputCls} /></div>
              <div><label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Сообщение</label><textarea rows={4} placeholder="Ваш вопрос..." className={inputCls + " resize-none"} /></div>
              <button className="w-full fog-btn py-2.5 rounded font-medium">Отправить</button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-[var(--fog-3)] mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg text-[var(--fog-muted)] font-light">Серый свет</span>
          <p className="text-xs text-[var(--fog-muted)] font-body">© 2026 · Анна Светлова</p>
          <div className="flex gap-4">
            {navItems.slice(1).map(item => (
              <button key={item.id} onClick={() => goToSection(item.id)} className="text-xs text-[var(--fog-muted)] hover:text-[var(--fog-text)] font-body transition-colors">{item.label}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
