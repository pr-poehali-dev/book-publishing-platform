import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const COVER_1 = "https://cdn.poehali.dev/projects/7a7b34a8-cdd1-434d-98f9-9c406f15e4f0/files/7b7206fc-8127-4e30-b4c8-a4da1b111873.jpg";
const COVER_2 = "https://cdn.poehali.dev/projects/7a7b34a8-cdd1-434d-98f9-9c406f15e4f0/files/39b2d537-b575-4930-b6b3-396444ebebde.jpg";

type Section = "home" | "book" | "content" | "chat" | "author" | "contacts";
type BookView = "library" | "chapters" | "reading";

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

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  chapterId: string;
}

const books = [
  {
    id: "book1",
    title: "Серый свет",
    subtitle: "Роман",
    year: "2026",
    cover: COVER_1,
    description: "История о возвращении, о письмах без адреса и о том, что остаётся после тумана. Роман о трёх людях, чьи жизни пересекаются в одном городе в течение одной осени.",
    chaptersCount: 3,
    status: "Новинка",
    chapters: [
      {
        id: "ch1",
        number: "I",
        title: "Туман над городом",
        teaser: "Утро начиналось так, как начинаются все важные утра — незаметно...",
        readTime: "7 мин",
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
        number: "II",
        title: "Письмо без адреса",
        teaser: "Конверт лежал под дверью. Без марки, без обратного адреса...",
        readTime: "6 мин",
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
        number: "III",
        title: "Возвращение",
        teaser: "Три года — это много или мало? Это зависит от того, что ты с ними делаешь...",
        readTime: "8 мин",
        content: [
          "Три года — это много или мало? Это зависит от того, что ты с ними делаешь. Антон провёл их в движении: три страны, семь городов, сотни разговоров с незнакомыми людьми. И всё равно вернулся туда, откуда ушёл.",
          "Старый дом выглядел меньше, чем в памяти. Это всегда так — детские места сжимаются, когда ты вырастаешь. Но сад был тот же: яблоня у забора, скрипучая калитка, запах прелых листьев.",
          "Мать не удивилась. Просто открыла дверь, посмотрела на него долгую секунду и сказала: «Ужин через час». Это было лучше любых слов.",
          "За столом они говорили о пустяках. О соседях, о погоде, о том, что крышу снова надо чинить. Настоящий разговор жил между строк — в паузах, в том, как она накладывала ему ещё картошки, в том, как он не уходил из-за стола.",
          "Ночью он долго не мог уснуть. Лежал и смотрел в потолок, где детской рукой была нацарапана звезда. Маленькая, кривая, почти незаметная. Но она была там. Всё это время — была там.",
        ],
      },
    ],
  },
  {
    id: "book2",
    title: "Мотыльки",
    subtitle: "Сборник рассказов",
    year: "2022",
    cover: COVER_2,
    description: "Двенадцать историй о людях, которые летят на свет — и сгорают. О любви, которая слишком поздно становится понятной. О выборах, которые делают нас теми, кто мы есть.",
    chaptersCount: 4,
    status: "Предыдущая книга",
    chapters: [
      {
        id: "m1",
        number: "I",
        title: "Лампа в окне",
        teaser: "Каждый вечер в восемь она зажигала лампу. Не для себя...",
        readTime: "5 мин",
        content: [
          "Каждый вечер в восемь она зажигала лампу. Не для себя — для него. Хотя он не возвращался уже три года.",
          "Соседи привыкли. Даже не смотрели больше в сторону её окна. Только новый жилец с третьего этажа однажды спросил — кого она ждёт?",
          "Она долго молчала. Потом сказала: «Никого». И это была чистая правда.",
          "Лампа горела не для того, чтобы кто-то пришёл. Лампа горела, потому что темнота без неё была бы слишком настоящей.",
          "Он позвонил в марте. Голос был тот же, только тише. Она сняла трубку, послушала, положила обратно. И выключила лампу.",
        ],
      },
      {
        id: "m2",
        number: "II",
        title: "Последний поезд",
        teaser: "На перроне всегда что-то заканчивается. Редко что-то начинается...",
        readTime: "6 мин",
        content: [
          "На перроне всегда что-то заканчивается. Редко что-то начинается.",
          "Павел стоял с билетом в руке. Поезд уходил через четыре минуты. За спиной — пять лет жизни, впереди — ничего конкретного. Только название города и смутное ощущение, что там будет иначе.",
          "«Иначе» — слово-обманка. Люди берут его с собой в дорогу, а потом обнаруживают, что оно весит столько же, сколько всё остальное.",
          "Поезд тронулся. Он не сел. Просто смотрел, как он уходит, и чувствовал что-то похожее на облегчение.",
          "На следующий день он купил новый билет. На другой поезд, в другой город. Может быть, дело было не в направлении.",
        ],
      },
      {
        id: "m3",
        number: "III",
        title: "Соль",
        teaser: "Они познакомились в очереди за солью во время дефицита...",
        readTime: "7 мин",
        content: [
          "Они познакомились в очереди за солью во время дефицита. Это был восемьдесят девятый год, и очереди тогда были особенными — в них люди говорили правду.",
          "Она сказала: «Вы похожи на человека, который никогда не высыпается». Он ответил: «Вы правы». Больше ничего не нужно было говорить.",
          "Они вместе дошли до её дома. Потом он вернулся на следующий день — без очереди, просто так. Потом ещё раз.",
          "Тридцать лет спустя он всё ещё просыпался раньше неё. Смотрел в потолок. Думал о соли.",
          "Некоторые вещи не объясняются. Они просто случаются — и держат.",
        ],
      },
      {
        id: "m4",
        number: "IV",
        title: "Мотыльки",
        teaser: "В детстве она боялась мотыльков. Во взрослой жизни поняла почему...",
        readTime: "9 мин",
        content: [
          "В детстве она боялась мотыльков. Во взрослой жизни поняла почему: они летят на свет, не зная, что он может убить. Это называется — верить.",
          "Её первая любовь была именно такой. Слепой, горячей, неотвратимой. Она летела — и сгорела. Классическая история.",
          "Но мотыльки не учатся. В этом и есть их красота — они каждый раз выбирают свет заново.",
          "Она думала об этом в сорок три года, стоя у окна больницы. За стеклом мелькал один такой — кружил вокруг фонаря, упрямо и бесконечно.",
          "«Дура», — сказала она мотыльку. Тихо, почти нежно. И почувствовала что-то давно забытое — что-то похожее на уважение.",
        ],
      },
    ],
  },
];

const contentItems = [
  { id: "c1", type: "Интервью", title: "Как рождается история", date: "10 апреля 2026", description: "Разговор об источниках вдохновения, о тумане как метафоре и о том, почему первые черновики всегда страшнее чистого листа.", duration: "24 мин" },
  { id: "c2", type: "Эссе", title: "О городах, которых больше нет", date: "2 марта 2026", description: "Личное эссе о памяти, пространстве и о том, как места продолжают жить в нас даже после того, как мы их покидаем.", duration: "12 мин" },
  { id: "c3", type: "Черновик", title: "Удалённые сцены: встреча на вокзале", date: "15 февраля 2026", description: "Сцена, которая не вошла в книгу. Первая встреча Марины и Антона — версия, от которой пришлось отказаться.", duration: "8 мин" },
  { id: "c4", type: "Плейлист", title: "Музыка книги", date: "1 февраля 2026", description: "Треки, которые звучали во время написания. Сорок пять минут тишины с голосом.", duration: "45 мин" },
  { id: "c5", type: "Фото", title: "Места, вдохновившие книгу", date: "20 января 2026", description: "Небольшой фотодневник: улицы, кафе, парки — всё то, что стало фоном для историй.", duration: "5 мин" },
  { id: "c6", type: "Лекция", title: "Структура молчания в прозе", date: "5 января 2026", description: "Запись лекции о роли пауз, недосказанности и пространства между словами в современной русской прозе.", duration: "51 мин" },
];

const initialChatMessages: ChatMessage[] = [
  { id: "1", author: "Алина К.", text: "Только что дочитала вторую главу. Сцена с письмом — до мурашек. Кто же написал это письмо?", time: "14:22" },
  { id: "2", author: "Михаил Р.", text: "Я думаю, это мать. По стилю очень похоже на то, как она говорит позже в третьей главе.", time: "14:35" },
  { id: "3", author: "Евгения", text: "А мне кажется это сама Марина написала себе в будущем 😅 Магический реализм же никто не отменял", time: "14:41" },
  { id: "4", author: "Дмитрий", text: "Фраза «рука знает больше, чем голова» — это вообще про всю книгу целиком. Гениально.", time: "15:03" },
];

const initialComments: Comment[] = [
  { id: "cmt1", chapterId: "ch1", author: "Наташа В.", text: "Образ мигающего фонаря — это что-то невероятное. Перечитываю уже третий раз.", time: "вчера, 19:41" },
  { id: "cmt2", chapterId: "ch1", author: "Семён", text: "«Рука знает больше, чем голова» — буду помнить эту фразу долго.", time: "вчера, 21:05" },
  { id: "cmt3", chapterId: "ch2", author: "Лера М.", text: "До последнего ждала, что узнаем автора письма. Автор умеет держать в напряжении!", time: "2 дня назад" },
  { id: "cmt4", chapterId: "ch3", author: "Игорь Т.", text: "Сцена за ужином — самая пронзительная в книге. Столько сказано через молчание.", time: "3 дня назад" },
  { id: "cmt5", chapterId: "m1", author: "Вика", text: "Финал этого рассказа — как удар под дых. Тихий и точный.", time: "1 неделю назад" },
];

export default function Index() {
  const [section, setSection] = useState<Section>("home");
  const [bookView, setBookView] = useState<BookView>("library");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
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
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentInput, setCommentInput] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

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
  const selectedChapter = selectedBook?.chapters.find(c => c.id === selectedChapterId) ?? null;
  const chapterComments = comments.filter(c => c.chapterId === selectedChapterId);

  const goToSection = (s: Section) => {
    setSection(s);
    if (s === "book") setBookView("library");
    setMobileMenuOpen(false);
  };

  const openBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setBookView("chapters");
    setSection("book");
  };

  const openChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setBookView("reading");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addBookmark = (chapterId: string, chapterTitle: string, paragraphIndex: number, text: string) => {
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

  const isBookmarked = (chapterId: string, paragraphIndex: number) =>
    bookmarks.some(b => b.chapterId === chapterId && b.paragraphIndex === paragraphIndex);

  const sendChatMessage = () => {
    if (!chatInput.trim() || !nameSet) return;
    setChatMessages(prev => [...prev, { id: Date.now().toString(), author: chatName, text: chatInput.trim(), time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) }]);
    setChatInput("");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const sendComment = () => {
    if (!commentInput.trim() || !commentAuthor.trim() || !selectedChapterId) return;
    setComments(prev => [...prev, { id: Date.now().toString(), chapterId: selectedChapterId, author: commentAuthor.trim(), text: commentInput.trim(), time: "только что" }]);
    setCommentInput("");
    setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const currentChapterIndex = selectedBook?.chapters.findIndex(c => c.id === selectedChapterId) ?? -1;

  return (
    <div className="min-h-screen bg-[var(--fog-1)] noise">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--fog-1)]/90 backdrop-blur-sm border-b border-[var(--fog-3)]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => goToSection("home")} className="font-display text-lg font-light tracking-wide text-[var(--fog-text)] hover:text-[var(--fog-accent)] transition-colors">
            Серый свет
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
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
            <button className="md:hidden fog-btn px-2.5 py-1.5 rounded" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={16} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--fog-3)] bg-[var(--fog-1)] px-6 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
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
              <button onClick={() => setShowBookmarks(false)} className="text-[var(--fog-muted)] hover:text-[var(--fog-text)]"><Icon name="X" size={18} /></button>
            </div>
            {bookmarks.length === 0 ? (
              <div className="p-8 text-center text-[var(--fog-muted)] text-sm font-body">
                <Icon name="BookmarkX" size={32} className="mx-auto mb-3 opacity-40" />
                <p>Закладок пока нет. Наведите на абзац при чтении и нажмите значок.</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                {bookmarks.map((bm, i) => {
                  const book = books.find(b => b.chapters.some(c => c.id === bm.chapterId));
                  return (
                    <div key={i} className="p-4 bg-[var(--fog-1)] rounded border border-[var(--fog-3)] cursor-pointer hover:bg-[var(--fog-2)] transition-colors"
                      onClick={() => { if (book) { setSelectedBookId(book.id); openChapter(bm.chapterId); setSection("book"); } setShowBookmarks(false); }}>
                      <div className="text-xs text-[var(--fog-muted)] mb-1 font-body">{bm.chapterTitle} · {bm.savedAt}</div>
                      <div className="text-sm text-[var(--fog-text)] font-body leading-relaxed italic">«{bm.text}»</div>
                    </div>
                  );
                })}
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
            <div className="animate-fade-up-delay flex justify-center gap-6">
              {books.map((book, i) => (
                <div key={book.id} className={`relative cursor-pointer group ${i === 1 ? "mt-8" : ""}`} onClick={() => openBook(book.id)}>
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--fog-3)] to-transparent rounded blur-xl opacity-40 scale-105 group-hover:opacity-60 transition-opacity" />
                  <img src={book.cover} alt={book.title} className="relative w-36 md:w-44 aspect-[3/4] object-cover rounded shadow-xl group-hover:shadow-2xl transition-shadow" />
                  <div className="absolute inset-0 bg-[var(--fog-text)]/0 group-hover:bg-[var(--fog-text)]/10 transition-colors rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="animate-fade-up-delay-2 mt-20 grid grid-cols-3 gap-8 border-t border-[var(--fog-3)] pt-12">
            {[{ num: String(books.length), label: "Книги" }, { num: String(books.reduce((a, b) => a + b.chapters.length, 0)), label: "Глав" }, { num: "6", label: "Материалов" }].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl text-[var(--fog-text)] font-light">{s.num}</div>
                <div className="text-xs text-[var(--fog-muted)] font-body mt-1 tracking-wide">{s.label}</div>
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
          <div className="grid md:grid-cols-2 gap-6">
            {books.map((book) => (
              <div key={book.id} className="group bg-white rounded border border-[var(--fog-3)] overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={() => openBook(book.id)}>
                <div className="flex gap-0">
                  {/* Cover */}
                  <div className="w-36 shrink-0 relative overflow-hidden">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                  </div>
                  {/* Info */}
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
                        {book.chaptersCount} {book.chaptersCount === 1 ? "глава" : book.chaptersCount < 5 ? "главы" : "глав"}
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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm font-body text-[var(--fog-muted)]">
            <button onClick={() => setBookView("library")} className="hover:text-[var(--fog-text)] transition-colors">Библиотека</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-[var(--fog-text)]">{selectedBook.title}</span>
          </div>

          <div className="grid md:grid-cols-[200px_1fr] gap-10 items-start">
            {/* Book cover + info */}
            <div className="md:sticky md:top-24">
              <img src={selectedBook.cover} alt={selectedBook.title} className="w-full aspect-[3/4] object-cover rounded shadow-xl mb-4" />
              <div className="text-xs text-[var(--fog-muted)] font-body space-y-1">
                <p className="font-medium text-[var(--fog-text)]">{selectedBook.subtitle} · {selectedBook.year}</p>
                <p>{selectedBook.chapters.length} {selectedBook.chapters.length < 5 ? "главы" : "глав"}</p>
              </div>
            </div>

            {/* Chapters list */}
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-[var(--fog-text)] font-light mb-2">{selectedBook.title}</h1>
              <p className="text-[var(--fog-muted)] font-body text-sm mb-8 leading-relaxed">{selectedBook.description}</p>

              <h2 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-4">Содержание</h2>
              <div className="flex flex-col divide-y divide-[var(--fog-3)]">
                {selectedBook.chapters.map((ch, i) => {
                  const chComments = comments.filter(c => c.chapterId === ch.id);
                  return (
                    <button key={ch.id} onClick={() => openChapter(ch.id)}
                      className="group text-left py-5 hover:bg-[var(--fog-2)] -mx-3 px-3 rounded transition-all">
                      <div className="flex items-start gap-4">
                        <span className="font-display text-3xl text-[var(--fog-muted)] font-light leading-none mt-1 w-8 shrink-0">{ch.number}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <h3 className="font-display text-xl text-[var(--fog-text)] group-hover:text-[var(--fog-accent)] transition-colors">{ch.title}</h3>
                            <div className="flex items-center gap-3 shrink-0">
                              {chComments.length > 0 && (
                                <span className="text-xs text-[var(--fog-muted)] font-body flex items-center gap-1">
                                  <Icon name="MessageSquare" size={11} />
                                  {chComments.length}
                                </span>
                              )}
                              <span className="text-xs text-[var(--fog-muted)] font-body flex items-center gap-1">
                                <Icon name="Clock" size={11} />
                                {ch.readTime}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-[var(--fog-muted)] font-body italic leading-relaxed">{ch.teaser}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ── BOOK: READING ── */}
      {section === "book" && bookView === "reading" && selectedBook && selectedChapter && (
        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-sm font-body text-[var(--fog-muted)]">
            <button onClick={() => setBookView("library")} className="hover:text-[var(--fog-text)] transition-colors">Библиотека</button>
            <Icon name="ChevronRight" size={14} />
            <button onClick={() => setBookView("chapters")} className="hover:text-[var(--fog-text)] transition-colors">{selectedBook.title}</button>
            <Icon name="ChevronRight" size={14} />
            <span className="text-[var(--fog-text)]">{selectedChapter.title}</span>
          </div>

          <div className="grid md:grid-cols-[1fr_280px] gap-10">
            {/* Reading area */}
            <div>
              <div className="mb-8 pb-6 border-b border-[var(--fog-3)]">
                <p className="text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] font-body mb-2">
                  Глава {currentChapterIndex + 1} из {selectedBook.chapters.length}
                </p>
                <h1 className="font-display text-3xl md:text-4xl text-[var(--fog-text)] font-light">
                  <span className="text-[var(--fog-muted)]">{selectedChapter.number}.</span> {selectedChapter.title}
                </h1>
              </div>

              <div className="space-y-6">
                {selectedChapter.content.map((para, pi) => {
                  const key = `${selectedChapter.id}-${pi}`;
                  const bookmarked = isBookmarked(selectedChapter.id, pi);
                  return (
                    <div key={pi} className="relative group" onMouseEnter={() => setHoveredParagraph(key)} onMouseLeave={() => setHoveredParagraph(null)}>
                      <p className="font-body text-[var(--fog-text)] leading-[1.9] text-base md:text-[17px] pr-8">{para}</p>
                      <button
                        onClick={() => addBookmark(selectedChapter.id, selectedChapter.title, pi, para)}
                        className={`absolute top-1 right-0 transition-all duration-200 p-1 rounded ${hoveredParagraph === key || bookmarked ? "opacity-100" : "opacity-0"} ${bookmarked ? "text-[var(--fog-accent)]" : "text-[var(--fog-muted)] hover:text-[var(--fog-accent)]"}`}
                      >
                        <Icon name={bookmarked ? "Bookmark" : "BookmarkPlus"} size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Chapter nav */}
              <div className="mt-12 pt-6 border-t border-[var(--fog-3)] flex justify-between">
                <button onClick={() => { if (currentChapterIndex > 0) openChapter(selectedBook.chapters[currentChapterIndex - 1].id); }}
                  disabled={currentChapterIndex === 0} className="fog-btn px-4 py-2 rounded disabled:opacity-30 flex items-center gap-2">
                  <Icon name="ChevronLeft" size={14} /> Назад
                </button>
                <button onClick={() => setBookView("chapters")} className="fog-btn px-4 py-2 rounded flex items-center gap-2">
                  <Icon name="List" size={14} /> К главам
                </button>
                <button onClick={() => { if (currentChapterIndex < selectedBook.chapters.length - 1) openChapter(selectedBook.chapters[currentChapterIndex + 1].id); }}
                  disabled={currentChapterIndex === selectedBook.chapters.length - 1} className="fog-btn px-4 py-2 rounded disabled:opacity-30 flex items-center gap-2">
                  Далее <Icon name="ChevronRight" size={14} />
                </button>
              </div>

              {/* Comments section */}
              <div className="mt-14">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="font-display text-2xl text-[var(--fog-text)] font-light">Комментарии</h2>
                  {chapterComments.length > 0 && (
                    <span className="bg-[var(--fog-2)] text-[var(--fog-muted)] text-xs font-body px-2.5 py-1 rounded-full">{chapterComments.length}</span>
                  )}
                </div>

                {/* Comments list */}
                <div className="space-y-4 mb-8">
                  {chapterComments.length === 0 ? (
                    <div className="py-10 text-center text-[var(--fog-muted)] font-body text-sm">
                      <Icon name="MessageSquare" size={28} className="mx-auto mb-3 opacity-30" />
                      <p>Станьте первым, кто оставит комментарий к этой главе</p>
                    </div>
                  ) : (
                    chapterComments.map(cmt => (
                      <div key={cmt.id} className="flex gap-3 group">
                        <div className="w-8 h-8 bg-[var(--fog-2)] rounded-full flex items-center justify-center shrink-0 text-xs font-body text-[var(--fog-muted)] font-medium border border-[var(--fog-3)]">
                          {cmt.author[0]}
                        </div>
                        <div className="flex-1 bg-white rounded-lg border border-[var(--fog-3)] px-4 py-3">
                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-sm font-medium text-[var(--fog-text)] font-body">{cmt.author}</span>
                            <span className="text-xs text-[var(--fog-muted)] font-body">{cmt.time}</span>
                          </div>
                          <p className="text-sm text-[var(--fog-accent)] font-body leading-relaxed">{cmt.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={commentsEndRef} />
                </div>

                {/* Comment form */}
                <div className="bg-white rounded-lg border border-[var(--fog-3)] p-5">
                  <h3 className="text-sm font-body font-medium text-[var(--fog-text)] mb-4">Оставить комментарий</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={commentAuthor}
                      onChange={e => setCommentAuthor(e.target.value)}
                      className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors"
                    />
                    <textarea
                      rows={3}
                      placeholder="Ваши мысли о главе..."
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendComment(); }}
                      className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--fog-muted)] font-body">Ctrl+Enter для отправки</span>
                      <button onClick={sendComment} disabled={!commentInput.trim() || !commentAuthor.trim()}
                        className="fog-btn px-5 py-2 rounded font-medium disabled:opacity-40 flex items-center gap-2 text-sm">
                        <Icon name="Send" size={13} /> Отправить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar: chapter nav + bookmarks */}
            <aside className="hidden md:block">
              <div className="sticky top-24 space-y-6">
                <div>
                  <h3 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-3">Главы</h3>
                  <nav className="flex flex-col gap-0.5">
                    {selectedBook.chapters.map((ch) => {
                      const chCmts = comments.filter(c => c.chapterId === ch.id);
                      return (
                        <button key={ch.id} onClick={() => openChapter(ch.id)}
                          className={`text-left px-3 py-2.5 rounded text-sm font-body transition-all flex items-center justify-between gap-2 ${ch.id === selectedChapterId ? "bg-[var(--fog-3)] text-[var(--fog-text)] font-medium" : "text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)]"}`}>
                          <span className="truncate">{ch.number}. {ch.title}</span>
                          {chCmts.length > 0 && <span className="text-xs text-[var(--fog-muted)] shrink-0">{chCmts.length}</span>}
                        </button>
                      );
                    })}
                  </nav>
                </div>
                {bookmarks.filter(bm => selectedBook.chapters.some(c => c.id === bm.chapterId)).length > 0 && (
                  <div>
                    <h3 className="font-body text-xs tracking-[0.15em] uppercase text-[var(--fog-muted)] mb-3">Закладки</h3>
                    <div className="flex flex-col gap-1">
                      {bookmarks.filter(bm => selectedBook.chapters.some(c => c.id === bm.chapterId)).map((bm, i) => (
                        <button key={i} onClick={() => openChapter(bm.chapterId)}
                          className="text-left px-3 py-2 rounded text-xs font-body text-[var(--fog-muted)] hover:bg-[var(--fog-2)] hover:text-[var(--fog-text)] transition-all flex items-start gap-2">
                          <Icon name="Bookmark" size={11} className="mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{bm.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
              <div key={item.id} className="bg-white rounded border border-[var(--fog-3)] p-6 hover:shadow-sm hover:border-[var(--fog-accent)]/30 transition-all cursor-pointer group">
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
            <p className="text-sm text-[var(--fog-muted)] font-body mt-2">Обсуждайте книги с другими читателями</p>
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
              <input type="text" placeholder="Ваше имя для чата..." value={chatName} onChange={e => setChatName(e.target.value)} onKeyDown={e => e.key === "Enter" && chatName.trim() && setNameSet(true)}
                className="flex-1 bg-white border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors" />
              <button onClick={() => chatName.trim() && setNameSet(true)} className="fog-btn px-5 py-2.5 rounded font-medium">Войти в чат</button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input type="text" placeholder="Написать сообщение..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                className="flex-1 bg-white border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors" />
              <button onClick={sendChatMessage} disabled={!chatInput.trim()} className="fog-btn px-5 py-2.5 rounded font-medium disabled:opacity-40 flex items-center gap-2">
                <Icon name="Send" size={14} /> Отправить
              </button>
            </div>
          )}
          {nameSet && <p className="text-xs text-[var(--fog-muted)] font-body mt-2">Вы в чате как <span className="font-medium text-[var(--fog-text)]">{chatName}</span></p>}
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
                <p>Родилась в 1988 году в Петербурге. Изучала филологию в СПбГУ, затем несколько лет преподавала современную литературу. Первый сборник рассказов вышел в 2017 году и был отмечен премией «Дебют».</p>
                <p>Пишет о городских пространствах, памяти и одиночестве в современном мире. Убеждена, что хорошая проза должна уметь молчать — так же, как и говорить.</p>
                <p>«Серый свет» — третья книга. Над ней работала четыре года, несколько раз бросала и возвращалась. Считает это нормальным.</p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="fog-btn px-4 py-2 rounded flex items-center gap-2"><Icon name="Instagram" size={14} />Instagram</button>
                <button className="fog-btn px-4 py-2 rounded flex items-center gap-2"><Icon name="BookOpen" size={14} />Goodreads</button>
              </div>
            </div>
            <div>
              <div className="bg-[var(--fog-2)] rounded aspect-[4/5] flex items-center justify-center border border-[var(--fog-3)]">
                <div className="text-center text-[var(--fog-muted)]"><Icon name="User" size={48} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-body">Фото автора</p></div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[{ num: "2", label: "Книги" }, { num: "12", label: "Рассказов" }, { num: "40+", label: "Лекций" }].map(s => (
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
            {[{ icon: "Mail", label: "Почта", value: "anna@greylightbook.ru", sub: "Для прессы и сотрудничества" }, { icon: "MessageCircle", label: "Telegram", value: "@annasvеtlova", sub: "Личные сообщения" }].map(c => (
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
                <input type="text" placeholder="Как вас зовут" className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Email</label>
                <input type="email" placeholder="your@email.com" className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-[var(--fog-muted)] font-body block mb-1.5">Сообщение</label>
                <textarea rows={4} placeholder="Ваш вопрос или предложение..." className="w-full bg-[var(--fog-1)] border border-[var(--fog-3)] rounded px-4 py-2.5 text-sm font-body text-[var(--fog-text)] placeholder:text-[var(--fog-muted)] focus:outline-none focus:border-[var(--fog-accent)]/50 transition-colors resize-none" />
              </div>
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
