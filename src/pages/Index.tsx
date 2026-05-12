import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BOOK_COVER = "https://cdn.poehali.dev/projects/7a7b34a8-cdd1-434d-98f9-9c406f15e4f0/files/7b7206fc-8127-4e30-b4c8-a4da1b111873.jpg";

type Section = "home" | "book" | "content" | "chat" | "author" | "contacts";

interface Bookmark {
  chapterId: string;
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

const chapters = [
  {
    id: "ch1",
    title: "Глава I. Туман над городом",
    content: [
      "Утро начиналось так, как начинаются все важные утра — незаметно. Город ещё спал, укрытый серым покрывалом облаков, когда Марина вышла на улицу с единственной мыслью: что-то должно измениться.",
      "Она шла по мокрому асфальту, слушая, как каблуки отбивают тихий ритм. Каждый шаг — как страница в книге, которую никто не читал. Каждый вдох — как абзац без знаков препинания.",
      "Туман стелился низко, почти касаясь земли. В такие дни мир казался незаконченным рисунком — будто художник бросил работу на полпути, оставив края размытыми, неопределёнными.",
      "На углу Садовой она остановилась. Старый фонарь мигал раз в три секунды. Она считала — один, два, три, свет — один, два, три, темнота. Что-то в этом ритме успокаивало.",
      "Кофейня «Серое небо» открывалась в семь. До открытия оставалось восемнадцать минут. Марина достала блокнот и начала писать — не слова, просто линии. Иногда рука знает больше, чем голова.",
    ],
  },
  {
    id: "ch2",
    title: "Глава II. Письмо без адреса",
    content: [
      "Конверт лежал под дверью. Без марки, без обратного адреса — только её имя, написанное почерком, который она не узнала.",
      "Внутри — один лист. Двенадцать строк. Никакой подписи. Слова были простыми, почти детскими, но каждое из них попадало точно в то место, которое она думала давно забыла.",
      "Она перечитала трижды. Потом ещё раз — медленнее. Потом отложила, встала, налила воды, выпила стакан, вернулась, перечитала снова.",
      "Кто мог знать? Кто мог написать именно это, именно сейчас? Список людей, знавших правду, был коротким. Настолько коротким, что умещался на одной руке. И ни один из них не казался способным на такое.",
      "Она взяла ручку. Написала «Дорогой...» — и остановилась. Кому? Она не знала. Но ответить было необходимо. Хотя бы себе.",
    ],
  },
  {
    id: "ch3",
    title: "Глава III. Возвращение",
    content: [
      "Три года — это много или мало? Это зависит от того, что ты с ними делаешь. Антон провёл их в движении: три страны, семь городов, сотни разговоров с незнакомыми людьми. И всё равно вернулся туда, откуда ушёл.",
      "Старый дом выглядел меньше, чем в памяти. Это всегда так — детские места сжимаются, когда ты вырастаешь. Но сад был тот же: яблоня у забора, скрипучая калитка, запах прелых листьев.",
      "Мать не удивилась. Просто открыла дверь, посмотрела на него долгую секунду и сказала: «Ужин через час». Это было лучше любых слов.",
      "За столом они говорили о пустяках. О соседях, о погоде, о том, что крышу снова надо чинить. Настоящий разговор жил между строк — в паузах, в том, как она накладывала ему ещё картошки, в том, как он не уходил из-за стола.",
      "Ночью он долго не мог уснуть. Лежал и смотрел в потолок, где детской рукой была нацарапана звезда. Маленькая, кривая, почти незаметная. Но она была там. Всё это время — была там.",
    ],
  },
];

const contentItems = [
  {
    id: "c1",
    type: "Интервью",
    title: "Как рождается история",
    date: "10 апреля 2026",
    description: "Разговор об источниках вдохновения, о тумане как метафоре и о том, почему первые черновики всегда страшнее чистого листа.",
    duration: "24 мин",
  },
  {
    id: "c2",
    type: "Эссе",
    title: "О городах, которых больше нет",
    date: "2 марта 2026",
    description: "Личное эссе о памяти, пространстве и о том, как места продолжают жить в нас даже после того, как мы их покидаем.",
    duration: "12 мин",
  },
  {
    id: "c3",
    type: "Черновик",
    title: "Удалённые сцены: встреча на вокзале",
    date: "15 февраля 2026",
    description: "Сцена, которая не вошла в книгу. Первая встреча Марины и Антона — версия, от которой пришлось отказаться.",
    duration: "8 мин",
  },
  {
    id: "c4",
    type: "Плейлист",
    title: "Музыка книги",
    date: "1 февраля 2026",
    description: "Треки, которые звучали во время написания. Сорок пять минут тишины с голосом.",
    duration: "45 мин",
  },
  {
    id: "c5",
    type: "Фото",
    title: "Места, вдохновившие книгу",
    date: "20 января 2026",
    description: "Небольшой фотодневник: улицы, кафе, парки — всё то, что стало фоном для историй.",
    duration: "5 мин",
  },
  {
    id: "c6",
    type: "Лекция",
    title: "Структура молчания в прозе",
    date: "5 января 2026",
    description: "Запись лекции о роли пауз, недосказанности и пространства между словами в современной русской прозе.",
    duration: "51 мин",
  },
];

const initialMessages: ChatMessage[] = [
  { id: "1", author: "Алина К.", text: "Только что дочитала вторую главу. Сцена с письмом — до мурашек. Кто же написал это письмо?", time: "14:22" },
  { id: "2", author: "Михаил Р.", text: "Я думаю, это мать. По стилю очень похоже на то, как она говорит позже в третьей главе.", time: "14:35" },
  { id: "3", author: "Евгения", text: "А мне кажется это сама Марина написала себе в будущем 😅 Магический реализм же никто не отменял", time: "14:41" },
  { id: "4", author: "Дмитрий", text: "Фраза «рука знает больше, чем голова» — это вообще про всю книгу целиком. Гениально сформулировано.", time: "15:03" },
  { id: "5", author: "Алина К.", text: "Михаил, интересная версия! Перечитала с этой мыслью — и правда есть что-то общее в интонации.", time: "15:18" },
];

export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [activeChapter, setActiveChapter] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bookmarks") || "[]");
    } catch {
      return [];
    }
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const [chatName, setChatName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [hoveredParagraph, setHoveredParagraph] = useState<string | null>(null);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    if (section === "chat") {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [section, messages]);

  const navItems: { id: Section; label: string }[] = [
    { id: "home", label: "Главная" },
    { id: "book", label: "Книга" },
    { id: "content", label: "Контент" },
    { id: "chat", label: "Чат" },
    { id: "author", label: "Об авторе" },
    { id: "contacts", label: "Контакты" },
  ];

  const addBookmark = (chapterId: string, chapterTitle: string, paragraphIndex: number, text: string) => {
    const exists = bookmarks.find(b => b.chapterId === chapterId && b.paragraphIndex === paragraphIndex);
    if (exists) {
      setBookmarks(prev => prev.filter(b => !(b.chapterId === chapterId && b.paragraphIndex === paragraphIndex)));
      setBookmarkToast("Закладка удалена");
    } else {
      const newBookmark: Bookmark = {
        chapterId,
        chapterTitle,
        paragraphIndex,
        text: text.slice(0, 80) + "...",
        savedAt: new Date().toLocaleDateString("ru-RU"),
      };
      setBookmarks(prev => [...prev, newBookmark]);
      setBookmarkToast("Закладка сохранена");
    }
    setTimeout(() => setBookmarkToast(null), 2500);
  };

  const isBookmarked = (chapterId: string, paragraphIndex: number) =>
    bookmarks.some(b => b.chapterId === chapterId && b.paragraphIndex === paragraphIndex);

  const sendMessage = () => {
    if (!chatInput.trim() || !nameSet) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      author: chatName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages(prev => [...prev, msg]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen bg-[var(--fog-1)] noise">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--fog-1)]/90 backdrop-blur-sm border-b border-[var(--fog-3)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => setSection("home")}
            className="font-display text-lg font-light tracking-wide text-[var(--fog-text)] hover:text-[var(--fog-accent)] transition-colors"
          >
            Серый свет
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`px-4 py-1.5 text-sm rounded transition-all duration-200 font-body ${
                  section === item.id
                    ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium"
                    : "text-[var(--fog-muted)] hover:text-[var(--fog-text)] hover:bg-[var(--fog-2)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Bookmarks + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className="relative fog-btn px-3 py-1.5 rounded flex items-center gap-1.5 text-sm"
            >
              <Icon name="Bookmark" size={14} />
              <span className="hidden sm:inline">Закладки</span>
              {bookmarks.length > 0 && (
                <span className="ml-0.5 bg-[var(--fog-accent)] text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {bookmarks.length}
                </span>
              )}
            </button>
            <button
              className="md:hidden fog-btn px-2.5 py-1.5 rounded"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={16} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--fog-3)] bg-[var(--fog-1)] px-6 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 text-sm rounded transition-all font-body ${
                  section === item.id
                    ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium"
                    : "text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={() => setShowBookmarks(false)}>
          <div
            className="w-full max-w-sm bg-white border-l border-[var(--fog-3)] h-full overflow-y-auto shadow-xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[var(--fog-3)] flex items-center justify-between">
              <h3 className="font-display text-xl text-[var(--fog-text)]">Закладки</h3>
              <button onClick={() => setShowBookmarks(false)} className="text-[var(--fog-muted)] hover:text-[var(--fog-text)]">
                <Icon name="X" size={18} />
              </button>
            </div>
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center text-[var(--fog-muted)] text-sm font-body">
                <Icon name="BookmarkX" size={32} className="mx-auto mb-3 opacity-40" />
                <p>Закладок пока нет. Наведите на абзац при чтении и нажмите значок.</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                {bookmarks.map((bm, i) => (
                  <div
                    key={i}
                    className="p-4 bg-[var(--fog-1)] rounded border border-[var(--fog-3)] cursor-pointer hover:bg-[var(--fog-2)] transition-colors"
                    onClick={() => {
                      setSection("book");
                      const idx = chapters.findIndex(c => c.id === bm.chapterId);
                      if (idx !== -1) setActiveChapter(idx);
                      setShowBookmarks(false);
                    }}
                  >
                    <div className="text-xs text-[var(--fog-muted)] mb-1 font-body">{bm.chapterTitle} · {bm.savedAt}</div>
                    <div className="text-sm text-[var(--fog-text)] font-body leading-relaxed italic">«{bm.text}»</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {bookmarkToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--fog-text)] text-white text-sm px-4 py-2 rounded-full font-body animate-fade-in shadow-lg">
          {bookmarkToast}
        </div>
      )}

      {/* HOME */}
      {section === "home" && (
        <main className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-up">
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-6">
                Новый роман · 2026
              </p>
              <h1 className="font-display text-6xl md:text-7xl font-light text-[var(--fog-text)] leading-[1.05] mb-6">
                Серый<br />
                <em>свет</em>
              </h1>
              <p className="text-[var(--fog-muted)] font-body leading-relaxed mb-8 text-lg">
                История о возвращении, о письмах без адреса и о том, что остаётся после тумана.
                Роман о трёх людях, чьи жизни пересекаются в одном городе в течение одной осени.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSection("book")}
                  className="fog-btn px-6 py-2.5 rounded font-medium"
                >
                  Читать книгу
                </button>
                <button
                  onClick={() => setSection("content")}
                  className="fog-btn-outline border border-[var(--fog-3)] px-6 py-2.5 rounded text-[var(--fog-text)] hover:bg-[var(--fog-2)] transition-all font-body text-sm"
                >
                  Материалы
                </button>
              </div>
            </div>

            <div className="animate-fade-up-delay flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--fog-3)] to-transparent rounded blur-2xl opacity-60 scale-110" />
                <img
                  src={BOOK_COVER}
                  alt="Обложка книги"
                  className="relative w-72 md:w-80 aspect-[3/4] object-cover rounded shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="animate-fade-up-delay-2 mt-20 grid grid-cols-3 gap-8 border-t border-[var(--fog-3)] pt-12">
            {[
              { num: "3", label: "Главы доступны" },
              { num: "6", label: "Материалов" },
              { num: "∞", label: "Закладок" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl text-[var(--fog-text)] font-light">{s.num}</div>
                <div className="text-xs text-[var(--fog-muted)] font-body mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Latest content */}
          <div className="mt-20">
            <h2 className="font-display text-3xl text-[var(--fog-text)] font-light mb-8">Последние материалы</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {contentItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-white rounded border border-[var(--fog-3)] hover:border-[var(--fog-accent)]/30 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => setSection("content")}
                >
                  <span className="text-xs tracking-wide uppercase text-[var(--fog-muted)] font-body">{item.type}</span>
                  <h3 className="font-display text-lg text-[var(--fog-text)] mt-1 mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--fog-muted)] font-body leading-relaxed line-clamp-2">{item.description}</p>
                  <div className="mt-3 text-xs text-[var(--fog-muted)] font-body flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    {item.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* BOOK */}
      {section === "book" && (
        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Chapter nav */}
            <aside className="md:w-56 shrink-0">
              <h2 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-4">Содержание</h2>
              <nav className="flex flex-col gap-1">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(i)}
                    className={`text-left px-3 py-2.5 rounded text-sm font-body transition-all leading-snug ${
                      activeChapter === i
                        ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium"
                        : "text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)]"
                    }`}
                  >
                    {ch.title}
                  </button>
                ))}
              </nav>

              {bookmarks.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-3">Закладки</h3>
                  <div className="flex flex-col gap-1">
                    {bookmarks.map((bm, i) => (
                      <button
                        key={i}
                        className="text-left px-3 py-2 rounded text-xs font-body text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)] transition-all flex items-start gap-2"
                        onClick={() => {
                          const idx = chapters.findIndex(c => c.id === bm.chapterId);
                          if (idx !== -1) setActiveChapter(idx);
                        }}
                      >
                        <Icon name="Bookmark" size={11} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{bm.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Chapter content */}
            <article className="flex-1 max-w-2xl">
              <div className="mb-8 pb-6 border-b border-[var(--fog-3)]">
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] font-body mb-2">
                  Глава {activeChapter + 1} из {chapters.length}
                </p>
                <h1 className="font-display text-3xl md:text-4xl text-[var(--fog-text)] font-light">
                  {chapters[activeChapter].title}
                </h1>
              </div>

              <div className="space-y-6">
                {chapters[activeChapter].content.map((para, pi) => {
                  const key = `${chapters[activeChapter].id}-${pi}`;
                  const bookmarked = isBookmarked(chapters[activeChapter].id, pi);
                  return (
                    <div
                      key={pi}
                      className="relative group"
                      onMouseEnter={() => setHoveredParagraph(key)}
                      onMouseLeave={() => setHoveredParagraph(null)}
                    >
                      <p className="font-body text-[var(--fog-text)] leading-[1.9] text-base md:text-[17px] pr-8">
                        {para}
                      </p>
                      <button
                        onClick={() => addBookmark(chapters[activeChapter].id, chapters[activeChapter].title, pi, para)}
                        className={`absolute top-1 right-0 transition-all duration-200 p-1 rounded ${
                          hoveredParagraph === key || bookmarked ? "opacity-100" : "opacity-0"
                        } ${bookmarked ? "text-[var(--fog-accent)]" : "text-[var(--fog-muted)] hover:text-[var(--fog-accent)]"}`}
                        title={bookmarked ? "Удалить закладку" : "Добавить закладку"}
                      >
                        <Icon name={bookmarked ? "Bookmark" : "BookmarkPlus"} size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="mt-12 pt-6 border-t border-[var(--fog-3)] flex justify-between">
                <button
                  onClick={() => setActiveChapter(Math.max(0, activeChapter - 1))}
                  disabled={activeChapter === 0}
                  className="fog-btn px-4 py-2 rounded disabled:opacity-30 flex items-center gap-2"
                >
                  <Icon name="ChevronLeft" size={14} />
                  Назад
                </button>
                <button
                  onClick={() => setActiveChapter(Math.min(chapters.length - 1, activeChapter + 1))}
                  disabled={activeChapter === chapters.length - 1}
                  className="fog-btn px-4 py-2 rounded disabled:opacity-30 flex items-center gap-2"
                >
                  Далее
                  <Icon name="ChevronRight" size={14} />
                </button>
              </div>
            </article>
          </div>
        </main>
      )}

      {/* CONTENT */}
      {section === "content" && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Дополнительные материалы</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Контент</h1>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {contentItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded border border-[var(--fog-3)] p-6 hover:shadow-sm hover:border-[var(--fog-accent)]/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs tracking-wide uppercase text-[var(--fog-muted)] font-body bg-[var(--fog-1)] px-2.5 py-1 rounded">
                    {item.type}
                  </span>
                  <span className="text-xs text-[var(--fog-muted)] font-body flex items-center gap-1">
                    <Icon name="Clock" size={11} />
                    {item.duration}
                  </span>
                </div>
                <h3 className="font-display text-xl text-[var(--fog-text)] mb-2 group-hover:text-[var(--fog-accent)] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--fog-muted)] font-body leading-relaxed mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--fog-muted)] font-body">{item.date}</span>
                  <button className="fog-btn px-3 py-1.5 rounded text-xs flex items-center gap-1.5">
                    Открыть <Icon name="ArrowRight" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* CHAT */}
      {section === "chat" && (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="mb-8">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Общение</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Общий чат</h1>
            <p className="text-sm text-[var(--fog-muted)] font-body mt-2">Обсуждайте книгу с другими читателями</p>
          </div>

          <div className="bg-white rounded border border-[var(--fog-3)] h-[420px] overflow-y-auto p-5 flex flex-col gap-4 mb-4">
            {messages.map((msg) => (
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
              <input
                type="text"
                placeholder="Ваше имя для чата..."
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && chatName.trim() && setNameSet(true)}
                className="flex-1 bg-white border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors"
              />
              <button
                onClick={() => chatName.trim() && setNameSet(true)}
                className="fog-btn px-5 py-2.5 rounded font-medium"
              >
                Войти в чат
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Написать сообщение..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-white border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim()}
                className="fog-btn px-5 py-2.5 rounded font-medium disabled:opacity-40 flex items-center gap-2"
              >
                <Icon name="Send" size={14} />
                Отправить
              </button>
            </div>
          )}
          {nameSet && (
            <p className="text-xs text-[var(--fog-muted)] font-body mt-2">
              Вы в чате как <span className="font-medium text-[var(--fog-text)]">{chatName}</span>
            </p>
          )}
        </main>
      )}

      {/* AUTHOR */}
      {section === "author" && (
        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Автор</p>
              <h1 className="font-display text-5xl text-[var(--fog-text)] font-light mb-2">Анна Светлова</h1>
              <p className="text-sm text-[var(--fog-muted)] font-body mb-8">Писатель, эссеист, лектор</p>

              <div className="space-y-5 text-[var(--fog-accent)] font-body leading-relaxed">
                <p>
                  Родилась в 1988 году в Петербурге. Изучала филологию в СПбГУ, затем несколько лет преподавала
                  современную литературу. Первый сборник рассказов вышел в 2017 году и был отмечен премией «Дебют».
                </p>
                <p>
                  Пишет о городских пространствах, памяти и одиночестве в современном мире. Убеждена,
                  что хорошая проза должна уметь молчать — так же, как и говорить.
                </p>
                <p>
                  «Серый свет» — третья книга. Над ней работала четыре года, несколько раз бросала и
                  возвращалась. Считает это нормальным.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button className="fog-btn px-4 py-2 rounded flex items-center gap-2">
                  <Icon name="Instagram" size={14} />
                  Instagram
                </button>
                <button className="fog-btn px-4 py-2 rounded flex items-center gap-2">
                  <Icon name="BookOpen" size={14} />
                  Goodreads
                </button>
              </div>
            </div>

            <div>
              <div className="bg-[var(--fog-2)] rounded aspect-[4/5] flex items-center justify-center border border-[var(--fog-3)]">
                <div className="text-center text-[var(--fog-muted)]">
                  <Icon name="User" size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-body">Фото автора</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { num: "3", label: "Книги" },
                  { num: "12", label: "Рассказов" },
                  { num: "40+", label: "Лекций" },
                ].map((s) => (
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

      {/* CONTACTS */}
      {section === "contacts" && (
        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className="mb-10">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--fog-muted)] font-body mb-3">Связь</p>
            <h1 className="font-display text-4xl text-[var(--fog-text)] font-light">Контакты</h1>
          </div>

          <div className="space-y-4 mb-10">
            {[
              { icon: "Mail", label: "Почта", value: "anna@greylightbook.ru", sub: "Для прессы и сотрудничества" },
              { icon: "MessageCircle", label: "Telegram", value: "@annasvеtlova", sub: "Личные сообщения" },
            ].map((c) => (
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
              <div>
                <label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Ваше имя</label>
                <input
                  type="text"
                  placeholder="Как вас зовут"
                  className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Сообщение</label>
                <textarea
                  rows={4}
                  placeholder="Ваш вопрос или предложение..."
                  className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors resize-none"
                />
              </div>
              <button className="w-full fog-btn py-2.5 rounded font-medium">
                Отправить
              </button>
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
            {navItems.slice(1).map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className="text-xs text-[var(--fog-muted)] hover:text-[var(--fog-text)] font-body transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
