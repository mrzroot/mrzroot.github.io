(() => {
  const copy = {
    skip: ['Skip to the case', 'رفتن به سناریو'],
    catalog: ['Project catalog', 'فهرست پروژه‌ها'],
    heading: ['Project Playground.', 'آزمایشگاه پروژه‌ها.'],
    intro: ['Explore a practical problem from each project. Make a choice, see its outcome, and follow the full demo.', 'برای هر پروژه یک مسئلهٔ واقعی‌نما را امتحان کن. تصمیم بگیر، نتیجه‌اش را ببین و سراغ دموی کامل برو.'],
    open: ['Open project ↗', 'باز کردن پروژه ↗'],
    source: ['Source code ↗', 'کد منبع ↗'],
    reset: ['Reset case ↺', 'بازنشانی سناریو ↺'],
    choose: ['Choose a project', 'یک پروژه انتخاب کن'],
    search: ['Search projects', 'جست‌وجوی پروژه‌ها'],
    empty: ['No projects match this search.', 'پروژه‌ای برای این جست‌وجو پیدا نشد.'],
    footer: ['Cases use illustrative data and run in your browser.', 'سناریوها با دادهٔ نمونه در مرورگر تو اجرا می‌شوند.'],
    actions: ['Choose an action', 'یک اقدام انتخاب کن'],
    before: ['Sample input', 'ورودی نمونه'],
    after: ['Sample result', 'نتیجهٔ نمونه'],
    result: ['What happens', 'چه اتفاقی می‌افتد'],
    prompt: ['Choose an action to see its outcome.', 'یک اقدام انتخاب کن تا نتیجه را ببینی.']
  };
  const labels = {
    all: ['All projects', 'همهٔ پروژه‌ها'],
    systems: ['Systems', 'سامانه‌ها'],
    agents: ['AI tooling', 'ابزارهای هوش مصنوعی'],
    language: ['Language & data', 'زبان و داده'],
    showcase: ['Design & demos', 'طراحی و دمو']
  };
  const showcaseImages = new Set(['mcptape', 'tokenxray', 'slopguard', 'agentfence', 'ragxray', 'routefall', 'promptbisect', 'agentcontract', 'parsieval', 'skilltrace']);
  const hasShowcaseImage = new Set([...showcaseImages, 'achievement-lab', 'printbridge', 'naghsh-demo', 'website-portfolio-demos', 'image-boutique-papeterie']);
  const byId = new Map(playgroundCases.map(entry => [entry.id, entry]));
  const get = id => document.getElementById(id);
  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    element.className = className;
    if (value) element.textContent = value;
    return element;
  };
  const params = () => new URLSearchParams(location.search);
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, '');
  const remembered = (() => { try { return localStorage.getItem('mrz-lang'); } catch { return null; } })();
  let language = (params().get('lang') || remembered) === 'fa' ? 'fa' : 'en';
  let project = byId.get(params().get('project')) || playgroundCases[0];
  let category = 'all';
  let choice = -1;
  const translated = pair => pair[language === 'fa' ? 1 : 0];
  const thumbnail = id => '/assets/thumbs/' + (hasShowcaseImage.has(id) ? 'showcase-' : '') + id + '.webp';

  function renderEvidence() {
    const frame = get('case-visual');
    const values = project.evidence[choice + 1];
    const heading = translated(choice < 0 ? copy.before : copy.after);
    frame.className = 'case-tape visual-' + project.motif;
    frame.dataset.played = String(choice >= 0);
    frame.dataset.action = String(choice);
    frame.replaceChildren(make('span', 'case-mode', heading));
    values.forEach((value, index) => {
      const unit = make('span', 'case-cell', value);
      unit.dir = 'auto';
      unit.style.setProperty('--order', index);
      if (project.motif === 'meter') unit.style.setProperty('--value', value.split('%')[0] + '%');
      frame.append(unit);
    });
    get('visual-caption').textContent = heading + ' · ' + values.join(' / ');
  }

  function choose(index) {
    choice = index;
    for (const [position, button] of [...get('answers').children].entries()) {
      button.setAttribute('aria-pressed', String(position === choice));
    }
    get('reset').hidden = choice < 0;
    get('response-title').textContent = choice < 0 ? '' : translated(copy.result);
    get('response-copy').textContent = choice < 0 ? translated(copy.prompt) : translated(project.outcomes[choice]);
    renderEvidence();
  }

  function renderCase() {
    get('case').style.setProperty('--case-hue', project.color);
    get('case').dataset.group = project.group;
    get('case').dataset.motif = project.motif;
    get('project-name').textContent = project.id;
    get('case-title').textContent = translated(project.title);
    get('case-brief').textContent = translated(project.brief);
    get('case-image').src = thumbnail(project.id);
    get('open-project').href = ('/') + project.id + '/?lang=' + language;
    if (['achievement-lab', 'printbridge'].includes(project.id)) get('open-project').href = 'https://github.com/mrzroot/' + project.id;
    get('open-source').href = 'https://github.com/mrzroot/' + project.id;
    get('answers').setAttribute('aria-label', translated(copy.actions));
    get('answers').replaceChildren(...project.actions.map((pair, index) => {
      const button = make('button', 'answer');
      button.type = 'button';
      button.append(make('span', 'answer-label', translated(pair)), make('span', 'answer-arrow', '↗'));
      button.lastChild.setAttribute('aria-hidden', 'true');
      button.addEventListener('click', () => choose(index));
      return button;
    }));
    choose(choice);
  }

  function setUrl(mode) {
    const url = new URL(location.href);
    url.searchParams.set('project', project.id);
    url.searchParams.set('lang', language);
    url.hash = '';
    history[mode](null, '', url);
  }

  function selectProject(entry) {
    project = entry;
    choice = -1;
    setUrl('pushState');
    renderCase();
    renderGallery();
    get('case-title').focus({ preventScroll: true });
    get('case').scrollIntoView({ block: 'start' });
  }

  function renderGallery() {
    const query = normalize(get('search').value.trim());
    const entries = playgroundCases.filter(entry => (
      (category === 'all' || category === entry.group) &&
      normalize([entry.id, ...entry.title].join(' ')).includes(query)
    ));
    get('empty').hidden = entries.length > 0;
    get('gallery').replaceChildren(...entries.map(entry => {
      const card = make('a', 'card');
      card.href = '?' + new URLSearchParams({ project: entry.id, lang: language });
      card.style.setProperty('--case-hue', entry.color);
      if (entry.id === project.id) card.setAttribute('aria-current', 'true');
      const cover = make('img', 'card-cover');
      cover.src = thumbnail(entry.id);
      cover.loading = 'lazy';
      cover.decoding = 'async';
      cover.alt = '';
      cover.width = 320;
      cover.height = 180;
      const title = make('span', 'card-title', entry.id);
      title.dir = 'ltr';
      card.append(cover, title);
      card.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        event.preventDefault();
        selectProject(entry);
      });
      return card;
    }));
  }

  function renderFilters() {
    get('filters').replaceChildren(...Object.entries(labels).map(([id, label]) => {
      const button = make('button', 'filter', translated(label));
      button.type = 'button';
      button.setAttribute('aria-pressed', String(id === category));
      button.addEventListener('click', () => {
        category = id;
        for (const filter of get('filters').children) filter.setAttribute('aria-pressed', String(filter === button));
        renderGallery();
      });
      return button;
    }));
  }

  function renderLanguage() {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    const toggle = get('language');
    toggle.lang = language === 'fa' ? 'en' : 'fa';
    toggle.textContent = language === 'fa' ? 'English' : 'فارسی';
    document.querySelectorAll('[data-text]').forEach(element => {
      element.textContent = translated(copy[element.dataset.text]);
    });
    get('search').placeholder = language === 'fa' ? 'مثلاً شل یا shellparity' : 'e.g. shellparity';
    renderCase();
    renderFilters();
    renderGallery();
  }

  get('language').addEventListener('click', () => {
    language = language === 'fa' ? 'en' : 'fa';
    try { localStorage.setItem('mrz-lang', language); } catch { /* The page still works in storage-blocked contexts. */ }
    setUrl('replaceState');
    renderLanguage();
  });
  get('reset').addEventListener('click', () => {
    choose(-1);
    get('answers').firstElementChild.focus();
  });
  get('search').addEventListener('input', renderGallery);
  window.addEventListener('popstate', () => {
    project = byId.get(params().get('project')) || playgroundCases[0];
    language = (params().get('lang') || remembered) === 'fa' ? 'fa' : 'en';
    choice = -1;
    renderLanguage();
  });
  renderLanguage();
  get('experience').hidden = false;
})();
