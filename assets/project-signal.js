(() => {
  'use strict';
  const root = document.querySelector('#project-signal');
  if (!root) return;
  const map = root.querySelector('.signal-map'), nodes = root.querySelector('.signal-node-list');
  const path = root.querySelector('.signal-trace'), title = root.querySelector('.signal-title');
  const text = root.querySelector('.signal-text'), link = root.querySelector('.signal-link');
  const groups = {
    agents: [
      ['mcptape','MCPTape','Replay a fictional tool conversation and compare two schemas without reaching the original service.','یک گفت‌وگوی نمونه با ابزار را آفلاین بازپخش کن و تفاوت دو طرح‌واره را ببین.'],
      ['tokenxray','TokenXRay','Scrub across a sample transcript and watch its context budget accumulate.','بین مرحله‌های یک گفت‌وگو جابه‌جا شو و ببین بودجهٔ توکن چطور خرج می‌شه.'],
      ['slopguard','SlopGuard','Compare a suggested dependency with a known local inventory before installing anything.','قبل از نصب، وابستگی پیشنهادی را با فهرست نمونهٔ پکیج‌های معتبر مقایسه کن.'],
      ['agentfence','AgentFence','See how a local policy gate handles allowed and blocked fictional actions.','ببین دروازهٔ دسترسی با عمل‌های مجاز و غیرمجازِ نمونه چه کار می‌کنه.'],
      ['skilltrace','Skilltrace','Review conflicts between coding-agent instructions, one finding at a time.','تعارض بین دستورهای ایجنت‌ها رو مورد به مورد بررسی کن.']
    ],
    data: [
      ['ragxray','RagXRay','Move a chunk boundary and see what happens to a phrase when you add overlap.','مرز قطعه را جابه‌جا کن و اثر هم‌پوشانی را روی پیدا شدن یک عبارت ببین.'],
      ['parsieval','Parsieval','Compare Persian examples before and after correcting spacing, letters or digits.','قبل و بعدِ اصلاح نیم‌فاصله، شکل حروف و اعداد رو کنار هم ببین.'],
      ['promptbisect','PromptBisect','Follow a narrowing window to the first revision that fails a fixed check.','کادر بازبینی رو دنبال کن تا به اولین نسخه‌ای برسی که آزمون مشخص رو رد می‌کنه.'],
      ['agentcontract','AgentContract','See which existing callers a change to a fictional schema would break.','ببین تغییر یک طرح‌وارهٔ نمونه کدوم درخواست‌های قبلی رو ناسازگار می‌کنه.']
    ],
    systems: [
      ['routefall','RouteFall','Trace a fictional request through the primary route, fallback and budget gate.','درخواست نمونه رو از مسیر اصلی تا مسیر پشتیبان و کنترل بودجه دنبال کن.'],
      ['planroom','Planroom','Change a fictional savings scenario and watch its projection redraw.','سناریوی فرضی پس‌انداز رو عوض کن و تغییر نمودارش رو همون‌جا ببین.'],
      ['shellparity','ShellParity','Compare two shell environments with the original split-view demo.','فرق دو محیط شل رو در دموی مقایسه‌ای اصلی ببین.']
    ]
  };
  const coordinates = [[25,24],[75,23],[80,69],[23,72],[50,86]];
  let current = 'agents', active = 0;
  const localize = () => {
    const lang = document.documentElement.lang === 'fa' ? 'fa' : 'en';
    const slug = groups[current][active][0];
    link.href = (['planroom','shellparity'].includes(slug) ? '/' : '/showcase/') + slug + '/?lang=' + lang;
    root.querySelector('.signal-list-link').href = '/projects/?lang=' + lang;
  };
  function select(i, motion) {
    active = i;
    const [slug, name, en, fa] = groups[current][i], [x,y] = coordinates[i];
    title.textContent = name;
    text.querySelector('.l-en').textContent = en;
    text.querySelector('.l-fa').textContent = fa;
    root.querySelector('.signal-counter').textContent = String(i+1).padStart(2,'0') + ' / ' + String(groups[current].length).padStart(2,'0');
    for (const [j,b] of [...nodes.children].entries()) b.setAttribute('aria-pressed',String(j===i));
    path.setAttribute('d', `M 50 32.5 L ${50+(x-50)*.45} ${y*.3+23} L ${x} ${y*.65}`);
    map.classList.remove('signal-transmit');
    if (motion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void map.offsetWidth;
      map.classList.add('signal-transmit');
    }
    localize();
  }
  function setGroup(group, motion) {
    current = group;
    for (const b of root.querySelectorAll('[data-signal-group]')) b.setAttribute('aria-pressed',String(b.dataset.signalGroup===group));
    nodes.replaceChildren(...groups[group].map((item,i) => {
      const b = document.createElement('button'); b.type='button'; b.className='signal-node';
      b.textContent=item[1]; b.style.setProperty('--x',coordinates[i][0]+'%'); b.style.setProperty('--y',coordinates[i][1]+'%');
      b.addEventListener('click', () => select(i,true));
      b.addEventListener('keydown', e => {
        if (!['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)) return;
        e.preventDefault(); const n = nodes.children.length;
        const j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (n+i+(['ArrowRight','ArrowDown'].includes(e.key) ? 1 : -1)) % n;
        nodes.children[j].focus(); select(j,true);
      });
      return b;
    }));
    select(0,motion);
  }
  for (const b of root.querySelectorAll('[data-signal-group]')) b.addEventListener('click', () => setGroup(b.dataset.signalGroup,true));
  new MutationObserver(localize).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  setGroup(current,false);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([entry]) => { if(entry.isIntersecting){select(active,true); io.disconnect()} },{threshold:.21});
    io.observe(map);
  }
})();
