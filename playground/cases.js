// Each case describes one decision and its consequences using sample data.
// Localized strings use [English, Persian]. Run state is ordered [before, first choice, second choice].
const playgroundCases = [
  {
    id: 'shellparity', group: 'systems', motif: 'terminal', color: '#9ce66b',
    title: ['Same machine. Different shell.', 'یک دستگاه، دو محیط شل'],
    brief: ['Your terminal finds Node. A non-interactive coding agent running the same command cannot. How do you isolate the difference?', 'ترمینال تو Node را پیدا می‌کند، اما ایجنت با همان دستور خطا می‌گیرد. چطور تفاوت را پیدا می‌کنی؟'],
    actions: [['Compare both environments', 'دو محیط را مقایسه کن'], ['Reinstall Node', 'Node را دوباره نصب کن']],
    outcomes: [['Only the interactive PATH contains the Node directory. The evidence points to shell initialization.', 'فقط PATH شل تعاملی مسیر Node را دارد. سرنخ اصلی در نحوهٔ راه‌اندازی شل است.'], ['The installation changes, but the agent still starts with a different PATH.', 'نصب تغییر می‌کند، اما ایجنت همچنان با PATH متفاوتی بالا می‌آید.']],
    evidence: [['terminal · node v22', 'agent · node not found'], ['terminal · /tools/node', 'agent · /tools/node missing'], ['terminal · node v22', 'agent · node not found']]
  },
  {
    id: 'whystuck', group: 'systems', motif: 'pulse', color: '#ffaa6d',
    title: ['Read the silence', 'سکوت فرایند را بخوان'],
    brief: ['A subprocess has printed nothing for 45 seconds. It inherited stdin and never returned. What do you inspect first?', 'یک زیرفرایند ۴۵ ثانیه هیچ خروجی ندارد. ورودی استاندارد را به ارث برده و هنوز تمام نشده. اول چه چیز را بررسی می‌کنی؟'],
    actions: [['Inspect the process and stdin', 'فرایند و ورودی را بررسی کن'], ['Double the timeout', 'زمان انتظار را دو برابر کن']],
    outcomes: [['The sample process is waiting for input. Check whether the command supports a non-interactive flag.', 'فرایند نمونه منتظر ورودی است. بررسی کن دستور گزینهٔ اجرای غیرتعاملی دارد یا خیر.'], ['The timer runs longer. The same subprocess remains blocked on input.', 'زمان بیشتری می‌گذرد و همان فرایند همچنان منتظر ورودی می‌ماند.']],
    evidence: [['START', '45s idle', 'stdin open'], ['PROCESS', 'stdin wait', 'input required'], ['START', '90s idle', 'stdin open']]
  },
  {
    id: 'whystale', group: 'systems', motif: 'film', color: '#ffca75',
    title: ['Find the old artifact', 'خروجی قدیمی را پیدا کن'],
    brief: ['You saved the source at 14:12. Your running service is loading a bundle timestamped 13:40. Which layer do you investigate?', 'کد منبع ساعت ۱۴:۱۲ ذخیره شده و سرویس هنوز بستهٔ ساعت ۱۳:۴۰ را می‌خواند. سراغ چه لایه‌ای می‌روی؟'],
    actions: [['Check the build artifact and running process', 'خروجی ساخت و فرایند را بررسی کن'], ['Edit the source again', 'دوباره کد منبع را ویرایش کن']],
    outcomes: [['The source is newer than the bundle. Rebuild and verify which bundle the process loads.', 'منبع جدیدتر از بسته است. بسته را دوباره بساز و مسیر فایل بارگذاری‌شده را بررسی کن.'], ['A second edit widens the age gap. The active process still uses the old bundle.', 'فاصلهٔ زمانی بیشتر می‌شود و فرایند فعال همچنان بستهٔ قدیمی را می‌خواند.']],
    evidence: [['13:40 bundle', '14:12 source'], ['14:12 source', '14:14 rebuilt', '14:15 loaded'], ['13:40 bundle', '14:16 source']]
  },
  {
    id: 'whycached', group: 'systems', motif: 'route', color: '#77dfff',
    title: ['Follow the cached response', 'مسیر پاسخ کش‌شده را دنبال کن'],
    brief: ['The origin serves revision 19. Your public URL still returns revision 18 with an Age header. Where do you look?', 'سرور مبدأ نسخهٔ ۱۹ را می‌دهد، اما آدرس عمومی نسخهٔ ۱۸ را با هدر Age برمی‌گرداند. کجا را بررسی می‌کنی؟'],
    actions: [['Compare origin and edge response headers', 'هدرهای مبدأ و لبه را مقایسه کن'], ['Clear local history', 'تاریخچهٔ مرورگر را پاک کن']],
    outcomes: [['The sample edge still has revision 18. Verify its cache rule and invalidate the affected URL if appropriate.', 'لبه در این نمونه هنوز نسخهٔ ۱۸ را دارد. قانون کش را بررسی کن و در صورت نیاز همان آدرس را پاک‌سازی کن.'], ['The edge keeps serving the same response after the local history is gone.', 'با پاک شدن تاریخچهٔ محلی، لبه همچنان همان پاسخ را می‌دهد.']],
    evidence: [['Browser v18', 'Edge v18', 'Origin v19'], ['Browser v19', 'Edge v19', 'Origin v19'], ['Browser v18', 'Edge v18', 'Origin v19']]
  },
  {
    id: 'whyenv', group: 'systems', motif: 'layers', color: '#eab2ff',
    title: ['Which value wins?', 'کدام مقدار اعمال می‌شود؟'],
    brief: ['You changed PORT in .env, but the service still listens on 8080. In this sample the process environment overrides the file.', 'مقدار PORT را در ‎.env عوض کرده‌ای ولی سرویس هنوز روی ۸۰۸۰ است. در این نمونه مقدار محیط فرایند بر فایل اولویت دارد.'],
    actions: [['Trace the effective value', 'منبع مقدار اعمال‌شده را پیدا کن'], ['Change .env again', 'دوباره ‎.env را عوض کن']],
    outcomes: [['The inherited process value wins. Correct that source and verify the effective configuration after restart.', 'مقدار به‌ارث‌رسیدهٔ فرایند اعمال می‌شود. همان منبع را اصلاح و پس از راه‌اندازی مجدد بررسی کن.'], ['The file value changes, but the higher-priority source still supplies 8080.', 'مقدار فایل تغییر می‌کند، اما منبع با اولویت بالاتر هنوز ۸۰۸۰ را می‌دهد.']],
    evidence: [['.env · 3000', 'process · 8080'], ['.env · 3000', 'process · 3000'], ['.env · 4500', 'process · 8080']]
  },
  {
    id: 'persianprobe', group: 'language', motif: 'paper', color: '#ffd887',
    title: ['Two strings that look alike', 'دو رشته که شبیه هم دیده می‌شوند'],
    brief: ['An NFC-normalized search still misses a Persian name containing Arabic Yeh. What should your runtime test compare?', 'جست‌وجوی نرمال‌شده با NFC هنوز نام فارسی دارای یای عربی را پیدا نمی‌کند. در آزمون محیط اجرا چه چیزی را مقایسه می‌کنی؟'],
    actions: [['Compare Unicode code points', 'نقاط کد یونیکد را مقایسه کن'], ['Compare the rendered screenshot', 'فقط ظاهر متن را مقایسه کن']],
    outcomes: [['Persian Yeh is U+06CC. Arabic Yeh is U+064A. If the product treats them as equivalent, test that mapping explicitly.', 'ی فارسی U+06CC و ی عربی U+064A است. اگر محصول آن‌ها را برابر می‌داند، تبدیل را صریح آزمایش کن.'], ['A screenshot shows rendering. It cannot prove that the stored characters are identical.', 'تصویر ظاهر را نشان می‌دهد و برابری نویسه‌های ذخیره‌شده را مشخص نمی‌کند.']],
    evidence: [['علي', 'علی'], ['ي · U+064A', 'ی · U+06CC'], ['علي', 'علی']]
  },
  {
    id: 'vazhgun', group: 'language', motif: 'paper', color: '#ecc591',
    title: ['Keep a figure number in order', 'ترتیب شمارهٔ شکل را نگه دار'],
    brief: ['A Persian figure label mixes digits and a hyphen in an RTL paragraph. The exported view reorders the components.', 'برچسب شکل در پاراگراف راست‌به‌چپ ترکیبی از عدد و خط تیره است. خروجی ترتیب اجزا را به هم می‌زند.'],
    actions: [['Inspect the text’s direction controls', 'کنترل‌های جهت متن را بررسی کن'], ['Reverse the stored digits', 'رقم‌ها را در خود متن برعکس کن']],
    outcomes: [['Keep the logical number and test the bidirectional display in the target application.', 'ترتیب منطقی شماره را حفظ کن و نمایش دوجهته را در نرم‌افزار مقصد آزمایش کن.'], ['Reversing stored digits can alter what copying, searching, and accessible reading report.', 'برعکس کردن رقم‌ها ممکن است نتیجهٔ کپی، جست‌وجو و خواندن با صفحه‌خوان را تغییر دهد.']],
    evidence: [['شکل ۲-۳', 'RTL paragraph'], ['logical ۲-۳', 'isolated number'], ['logical ۳-۲', 'source changed']]
  },
  {
    id: 'payanlint', group: 'language', motif: 'layers', color: '#acceff',
    title: ['Style or direct formatting?', 'سبک سند یا قالب‌بندی مستقیم؟'],
    brief: ['Two Word headings look the same, but only one appears in the table of contents. What evidence is missing?', 'دو عنوان در Word شبیه هم‌اند، ولی فقط یکی در فهرست مطالب می‌آید. چه چیزی را باید بررسی کنی؟'],
    actions: [['Inspect paragraph styles and outline levels', 'سبک پاراگراف و سطح ساختار را بررسی کن'], ['Increase the font size', 'اندازهٔ فونت را بیشتر کن']],
    outcomes: [['A semantic heading style carries the outline level used by the table of contents.', 'سبک معنایی عنوان همان سطحی را مشخص می‌کند که فهرست مطالب استفاده می‌کند.'], ['Visual size changes. The paragraph still has no heading style.', 'اندازهٔ ظاهری تغییر می‌کند و پاراگراف همچنان سبک عنوان ندارد.']],
    evidence: [['Chapter one · Heading 1', 'Chapter two · Normal'], ['Chapter one · Heading 1', 'Chapter two · Heading 1'], ['Chapter two · Normal', 'Font · 22pt']]
  },
  {
    id: 'arjaa', group: 'language', motif: 'route', color: '#ffb68b',
    title: ['Follow a reference to its target', 'ارجاع را تا مقصد دنبال کن'],
    brief: ['Your thesis text mentions Figure 2-4, but the visible captions end at Figure 2-3. What should the report verify?', 'متن پایان‌نامه به شکل ۲-۴ ارجاع می‌دهد، اما کپشن‌ها تا شکل ۲-۳ هستند. گزارش چه چیزی را باید بررسی کند؟'],
    actions: [['Pair the citation with actual captions', 'ارجاع را با کپشن‌های واقعی تطبیق بده'], ['Assume the next figure exists', 'فرض کن شکل بعدی وجود دارد']],
    outcomes: [['The reference has no matching caption. Inspect the intended target before correcting the number.', 'ارجاع کپشن متناظر ندارد. پیش از اصلاح شماره، مقصد درست را پیدا کن.'], ['The reader still cannot navigate to the intended figure.', 'خواننده همچنان نمی‌تواند شکل مقصد را پیدا کند.']],
    evidence: [['Ref · 2-4', 'Captions · 2-1…2-3'], ['Ref · 2-4', 'Target missing', 'Review needed'], ['Ref · 2-4', 'Unverified']]
  },
  {
    id: 'neveshtar', group: 'language', motif: 'paper', color: '#f4a3d2',
    title: ['Edit the sentence, preserve the claim', 'جمله را ویرایش کن، ادعا را حفظ کن'],
    brief: ['A paragraph says «لازم به ذکر است که مدل در این آزمون دقیق‌تر بود». What can you change without extending the claim?', 'در متن آمده «لازم به ذکر است که مدل در این آزمون دقیق‌تر بود». چطور جمله را ساده می‌کنی و دامنهٔ ادعا را حفظ می‌کنی؟'],
    actions: [['Trim the introductory phrase', 'عبارت زائد ابتدای جمله را حذف کن'], ['Claim it always performs better', 'بنویس مدل همیشه بهتر است']],
    outcomes: [['“The model was more accurate in this test.” The qualifier remains attached to the result.', '«مدل در این آزمون دقیق‌تر بود.» قیدِ محدودکنندهٔ نتیجه همچنان در جمله آمده است.'], ['“Always” overstates a result measured in a single test.', '«همیشه» نتیجهٔ یک آزمون را بیش از حد تعمیم می‌دهد.']],
    evidence: [['لازم به ذکر است که…', 'مدل در این آزمون دقیق‌تر بود.'], ['مدل در این آزمون دقیق‌تر بود.'], ['مدل همیشه دقیق‌تر است.']]
  },
  {
    id: 'ganjineh', group: 'agents', motif: 'layers', color: '#f7c484',
    title: ['Give the next agent the decision', 'تصمیم را به ایجنت بعدی منتقل کن'],
    brief: ['Yesterday the team chose PostgreSQL over a remote dependency. Today a different assistant is about to re-open the decision.', 'دیروز تیم PostgreSQL را به یک وابستگی راه‌دور ترجیح داد. امروز یک دستیار دیگر می‌خواهد همان تصمیم را دوباره بررسی کند.'],
    actions: [['Record a concise decision and rationale', 'تصمیم و دلیلش را کوتاه ثبت کن'], ['Paste an entire unstructured conversation', 'تمام گفت‌وگو را بدون ساختار کپی کن']],
    outcomes: [['A dated decision links the choice to its constraints. The next assistant can retrieve it on demand.', 'یک تصمیم تاریخ‌دار انتخاب را به محدودیت‌هایش وصل می‌کند. دستیار بعدی به‌موقع آن را پیدا می‌کند.'], ['The decision is buried in unrelated messages and costs more context to retrieve.', 'تصمیم لابه‌لای پیام‌های نامرتبط گم می‌شود و زمینهٔ بیشتری مصرف می‌کند.']],
    evidence: [['chat · yesterday', 'new session · today'], ['decision · PostgreSQL', 'reason · local deployment'], ['chat archive · long', 'decision · buried']]
  },
  {
    id: 'gosast', group: 'showcase', motif: 'wipe', color: '#ffb489',
    title: ['Give a page a paper edge', 'صفحه‌ای با لبهٔ کاغذی'],
    brief: ['The page is treated as paper. Preview where the tear should start and see how its origin changes the composition.', 'صفحه را مثل کاغذ تصور کن. نقطهٔ شروع پارگی را عوض کن و شکل نهایی را ببین.'],
    actions: [['Tear from the margin', 'از حاشیه پاره کن'], ['Tear through the middle', 'از میانه پاره کن']],
    outcomes: [['A narrow strip peels away while the central layout remains visible.', 'نوار باریکی از حاشیه جدا می‌شود و بخش مرکزی صفحه دیده می‌ماند.'], ['A broader edge opens through the center, revealing the backing underneath.', 'شکاف بزرگ‌تری از وسط باز می‌شود و لایهٔ زیر را نشان می‌دهد.']],
    evidence: [['paper · intact'], ['margin · 22%'], ['section · 54%']]
  },
];

function addCase(id, group, motif, color, title, brief, actions, outcomes, evidence) {
  playgroundCases.push({ id, group, motif, color, title, brief, actions, outcomes, evidence });
}

addCase('mcptape', 'agents', 'film', '#efb783',
  ['Play back a tool exchange','بازپخش گفت‌وگوی ابزار'],
  ['A test fixture captures a harmless price lookup. You want to verify a schema change offline.','نمونهٔ آزمون یک استعلام قیمت فرضی ضبط کرده است. می‌خواهی تغییر طرح‌واره را آفلاین بررسی کنی.'],
  [['Replay the saved fixture','نمونهٔ ضبط‌شده را بازپخش کن'],['Call the live service','سرویس زنده را صدا بزن']],
  [['The fixture reproduces the same exchange and exposes the new required field.','نمونه همان گفت‌وگو را تکرار می‌کند و فیلد اجباری تازه را نشان می‌دهد.'],['The live response can change between runs, so the comparison is less repeatable.','پاسخ زنده بین اجراها می‌تواند عوض شود و تکرارپذیری مقایسه را کم کند.']],
  [['00:01 request','00:02 response'],['request','fixture response','added · currency'],['request','live response','variable']]);

addCase('tokenxray', 'agents', 'meter', '#acccff',
  ['Find what fills the context','عامل پر شدن زمینه را پیدا کن'],
  ['A sample 100K context contains 24K of prompts and 63K of repeated tool output. Where can you recover space?','در زمینهٔ نمونهٔ ۱۰۰ هزارتوکنی، ۲۴ هزار توکن پرامپت و ۶۳ هزار توکن خروجی تکراری ابزار داری. از کجا فضا آزاد می‌کنی؟'],
  [['Summarize the repeated tool output','خروجی تکراری ابزار را خلاصه کن'],['Trim only the latest question','فقط سؤال آخر را کوتاه کن']],
  [['Holding the useful tool results in a short summary reduces repeated content.','خلاصهٔ کوتاه نتایج مهم، محتوای تکراری را کم می‌کند.'],['The small question changes, while the largest source of context remains.','سؤال کوتاه‌تر می‌شود و بیشترین مصرف‌کنندهٔ زمینه باقی می‌ماند.']],
  [['24% prompts','63% tool output'],['24% prompts','18% tool summary'],['23% prompts','63% tool output']]);

addCase('slopguard', 'agents', 'terminal', '#a6e1ae',
  ['Check one dependency suggestion','پیشنهاد یک وابستگی را بررسی کن'],
  ['An assistant suggested a new package for a feature your installed library might already support.','دستیار برای قابلیتی که شاید کتابخانهٔ نصب‌شده دارد یک بستهٔ تازه پیشنهاد کرده است.'],
  [['Read the lockfile and local API','فایل قفل و API محلی را بخوان'],['Accept the suggested package name','نام بستهٔ پیشنهادی را بپذیر']],
  [['Local evidence shows the capability is available without a new dependency.','شواهد محلی نشان می‌دهد آن قابلیت بدون وابستگی تازه در دسترس است.'],['The change adds an unverified dependency and leaves the original claim unchecked.','تغییر یک وابستگی تأییدنشده اضافه می‌کند و ادعای اول بررسی نمی‌شود.']],
  [['suggested dependency','evidence · pending'],['lockfile · checked','local API · present'],['dependency · proposed','verification · missing']]);

addCase('agentfence', 'agents', 'route', '#f4a2af',
  ['Decide what a tool may read','تعیین کن ابزار به چه داده‌ای دسترسی داشته باشد'],
  ['A test assistant can read fixtures. It asks for a folder outside that authorized workspace.','دستیار آزمایشی مجاز به خواندن نمونه‌هاست و درخواست خواندن پوشه‌ای خارج از فضای مجاز را می‌دهد.'],
  [['Apply the workspace boundary','محدودهٔ فضای کاری را اعمال کن'],['Grant access to every folder','به همهٔ پوشه‌ها دسترسی بده']],
  [['The simulated policy gate blocks the out-of-scope read and records its reason.','سیاست نمونه درخواست خارج از محدوده را مسدود و دلیلش را ثبت می‌کند.'],['The simulation shows how the broader grant exposes files the task never required.','شبیه‌سازی نشان می‌دهد دسترسی گسترده فایل‌های غیرضروری برای این کار را در معرض دسترسی قرار می‌دهد.']],
  [['Tool read','Policy check','Fixture scope'],['Tool read','Outside scope','Denied'],['Tool read','Broad access','Excess scope']]);

addCase('ragxray', 'agents', 'layers', '#a3e6b6',
  ['Keep context attached to the answer','زمینه را کنار پاسخ نگه دار'],
  ['The relevant paragraph is split between two retrieved chunks. One chunk has the action and the other has the condition.','پاراگراف مرتبط بین دو قطعهٔ بازیابی‌شده نصف شده است. شرط در یکی و اقدام در دیگری است.'],
  [['Inspect boundaries and add overlap','مرز قطعه‌ها را بررسی کن و هم‌پوشانی بده'],['Increase the answer length','طول پاسخ را بیشتر کن']],
  [['The query can now retrieve a passage containing both the condition and the action.','پرس‌وجو اکنون بخشی را بازیابی می‌کند که شرط و اقدام را کنار هم دارد.'],['A longer answer cannot recover wording missing from its retrieval context.','طول بیشتر پاسخ متنِ غایب در نتایج بازیابی را برنمی‌گرداند.']],
  [['chunk 1 · condition','chunk 2 · action'],['overlap · condition + action','retrieve · 1 complete passage'],['context · still split','response · longer']]);

addCase('routefall', 'agents', 'route', '#72e1db',
  ['When the primary route stalls','وقتی مسیر اصلی پاسخ نمی‌دهد'],
  ['A simulated model provider misses its timeout. This request has an eligible secondary provider.','ارائه‌دهندهٔ مدل در شبیه‌سازی در زمان تعیین‌شده پاسخ نمی‌دهد. ارائه‌دهندهٔ پشتیبانِ مجاز وجود دارد.'],
  [['Route to the eligible fallback','از مسیر پشتیبان مجاز استفاده کن'],['Wait indefinitely','بدون سقف زمانی صبر کن']],
  [['The simulated request moves to the backup route and reports the primary timeout.','درخواست نمونه به مسیر پشتیبان می‌رود و دلیل تغییر مسیر را گزارش می‌کند.'],['The response clock keeps running while the primary remains unavailable.','زمان می‌گذرد و مسیر اصلی همچنان در دسترس نیست.']],
  [['Request','Primary timeout','Backup idle'],['Request','Primary timeout','Backup served'],['Request','Primary pending','Client waiting']]);

addCase('promptbisect', 'agents', 'film', '#ffdb8a',
  ['Recover the first failing revision','اولین نسخهٔ خراب را پیدا کن'],
  ['The same prompt test passes on r04 and fails on r12. Assume the sample failure is deterministic.','آزمون یکسان پرامپت در r04 موفق و در r12 ناموفق است. در این نمونه خطا قطعی است.'],
  [['Test the midpoint r08','نسخهٔ میانی r08 را آزمایش کن'],['Rewrite the final prompt now','همین الان پرامپت آخر را بازنویسی کن']],
  [['The midpoint passes. Narrow the investigation to r09–r12.','نسخهٔ میانی موفق است. بررسی را به r09 تا r12 محدود کن.'],['A rewrite may hide the symptom while leaving the offending change unidentified.','بازنویسی شاید علامت را پنهان کند، ولی نسخهٔ مسبب همچنان مجهول می‌ماند.']],
  [['r04 pass','r08 ?','r12 fail'],['r08 pass','r09–r12','next midpoint'],['r12 rewritten','cause unknown']]);

addCase('agentcontract', 'agents', 'layers', '#bdb7ff',
  ['Catch a breaking schema change','تغییر ناسازگار طرح‌واره را پیدا کن'],
  ['A tool adds a required locale field. An older client sends only query.','ابزار فیلد اجباری locale اضافه کرده و کلاینت قدیمی فقط query می‌فرستد.'],
  [['Diff required fields','فیلدهای اجباری را مقایسه کن'],['Check the tool name only','فقط نام ابزار را بررسی کن']],
  [['The compatibility check identifies the new required property before release.','بررسی سازگاری فیلد اجباری تازه را پیش از انتشار پیدا می‌کند.'],['The unchanged tool name hides a breaking request contract.','نام ثابت ابزار تغییر ناسازگار قرارداد درخواست را پنهان می‌کند.']],
  [['v1 · query','v2 · query + locale'],['required · locale','old fixture · rejected'],['tool name · same','contract · unchecked']]);

addCase('parsieval', 'language', 'paper', '#a5e1be',
  ['Judge Persian output with explicit criteria','خروجی فارسی را با معیار روشن ارزیابی کن'],
  ['Two answers express the same meaning. One uses mixed Arabic characters and lacks the requested half-space.','دو پاسخ معنای یکسانی دارند، ولی یکی نویسه‌های عربی و فارسی مخلوط دارد و نیم‌فاصلهٔ خواسته‌شده را رعایت نکرده.'],
  [['Check both meaning and orthography','معنا و رسم‌الخط را بررسی کن'],['Score character count only','فقط تعداد نویسه‌ها را امتیاز بده']],
  [['The report separates meaning from orthographic expectations so the discrepancy is actionable.','گزارش معنا و انتظار رسم‌الخط را جداگانه بررسی می‌کند تا اصلاح مشخص باشد.'],['Similar lengths do not catch letter normalization or half-space issues.','طول مشابه مشکل نرمال‌سازی یا نیم‌فاصله را مشخص نمی‌کند.']],
  [['مي رود', 'می‌رود'],['meaning · equivalent','orthography · differs'],['length · similar','quality · unmeasured']]);

addCase('skilltrace', 'agents', 'meter', '#b9e68c',
  ['Make repeated guidance fit the budget','حجم دستورهای تکراری را کم کن'],
  ['An instruction bundle devotes 58% of its sample budget to repeated guidance. A small section defines required project behavior.','در نمونه، ۵۸٪ بودجهٔ دستورها صرف متن تکراری می‌شود. بخش کوتاهی رفتار ضروری پروژه را تعریف می‌کند.'],
  [['Review duplicates and keep the required rule','تکرارها را بررسی کن و قانون ضروری را نگه دار'],['Delete the longest section blindly','بلندترین بخش را بدون بررسی حذف کن']],
  [['A compact bundle preserves the project rule and leaves more space for task context.','بستهٔ کوتاه‌شده قانون ضروری را حفظ می‌کند و برای زمینهٔ وظیفه جا باز می‌شود.'],['The shorter bundle may omit behavior the project depends on.','بستهٔ کوتاه‌تر ممکن است رفتاری را حذف کند که پروژه به آن وابسته است.']],
  [['58% repeats','27% required'],['12% repeats','27% required'],['22% repeats','8% required']]);

addCase('planroom', 'showcase', 'meter', '#9addc9',
  ['Make room for a cost change','برای تغییر هزینه جا باز کن'],
  ['A sample savings plan allocates 65% to the goal and 20% to essentials. Essentials rise to 35% of the sample income.','برنامهٔ نمونه ۶۵٪ درآمد را به هدف و ۲۰٪ را به مخارج ضروری می‌دهد. مخارج ضروری به ۳۵٪ می‌رسد.'],
  [['Compare the updated plan with the baseline','برنامهٔ تازه را با حالت پایه مقایسه کن'],['Keep the original forecast','پیش‌بینی قبلی را نگه دار']],
  [['The updated scenario makes the expense change visible and leaves room to reconsider the contribution.','سناریوی تازه تغییر هزینه را نشان می‌دهد و می‌توانی سهم پس‌انداز را بازبینی کنی.'],['The old forecast assumes an expense level that no longer matches the scenario.','پیش‌بینی قبلی بر هزینه‌ای تکیه دارد که با سناریوی تازه هم‌خوانی ندارد.']],
  [['65% goal','20% essentials'],['50% goal','35% essentials'],['65% goal','35% essentials']]);

addCase('agentforge', 'agents', 'layers', '#f8b5a1',
  ['Carry the same rule into two editors','یک قانون مشترک برای دو ویرایشگر'],
  ['Two assistants edit one repository, but read their project rules from different files.','دو دستیار یک مخزن را ویرایش می‌کنند، اما قانون پروژه را از فایل‌های متفاوت می‌خوانند.'],
  [['Generate both formats from one rule','هر دو قالب را از یک قانون بساز'],['Maintain two independent copies','دو نسخهٔ مستقل نگه دار']],
  [['The provider files stay aligned when the source rule changes.','وقتی قانون اصلی تغییر می‌کند، فایل‌های ارائه‌دهندگان هماهنگ می‌مانند.'],['Each copy can drift as it is edited in isolation.','هر نسخه با ویرایش مستقل ممکن است از دیگری فاصله بگیرد.']],
  [['rule · one project','format · two targets'],['source rule','editor A','editor B'],['copy A · changed','copy B · old']]);

addCase('dibs', 'agents', 'terminal', '#ffd894',
  ['Keep the handwritten part','بخش دست‌نویس را حفظ کن'],
  ['You made a small manual edit while an assistant proposed a larger replacement nearby.','هم‌زمان با پیشنهاد تغییر بزرگ توسط دستیار، خودت یک بخش کوچک را دستی ویرایش کرده‌ای.'],
  [['Review the affected range','محدودهٔ درگیر را بازبینی کن'],['Apply the whole replacement','کل جایگزینی را اعمال کن']],
  [['The review surfaces the overlapping range before you choose which changes to keep.','بازبینی، هم‌پوشانی را پیش از انتخاب تغییرات نشان می‌دهد.'],['The broad replacement would discard the manual edit in this example.','جایگزینی کامل در این نمونه ویرایش دستی را از بین می‌برد.']],
  [['line 12 · hand edit','lines 10–18 · assistant'],['overlap · line 12','decision · review'],['replacement · 10–18','manual edit · lost']]);

addCase('hamyad', 'agents', 'layers', '#c2aeef',
  ['Leave a usable project handoff','تحویل پروژه را قابل استفاده کن'],
  ['A new assistant needs the current objective, the test command, and the last unresolved issue.','دستیار تازه به هدف فعلی، دستور آزمون و آخرین مسئلهٔ حل‌نشده نیاز دارد.'],
  [['Save a structured handoff','تحویل ساختاریافته ثبت کن'],['Start over from the chat archive','از بایگانی گفت‌وگو دوباره شروع کن']],
  [['The next session can pick up the objective and the open work without repeating discovery.','نشست بعدی هدف و کارِ باز را می‌فهمد و بررسی قبلی را تکرار نمی‌کند.'],['The archive includes old assumptions and requires an extra pass to find the active state.','بایگانی فرض‌های قدیمی را هم دارد و پیدا کردن وضعیت فعلی زمان می‌برد.']],
  [['objective','test command','open issue'],['state · shared','next action · known'],['archive · long','current state · unclear']]);

addCase('awesome-persian-developer-resources', 'language', 'paper', '#eac891',
  ['Find the right Persian resource','منبع فارسی مناسب را پیدا کن'],
  ['A new contributor wants Persian language tooling and needs a maintainable reference to start.','مشارکت‌کنندهٔ تازه ابزار زبان فارسی می‌خواهد و به مرجعی قابل نگهداری برای شروع نیاز دارد.'],
  [['Browse the relevant curated category','دستهٔ مرتبط را بررسی کن'],['Open a random tutorial','یک آموزش تصادفی باز کن']],
  [['A relevant category makes it easier to compare tools and inspect their official repositories.','دستهٔ مرتبط مقایسهٔ ابزارها و بررسی مخزن‌های رسمی را آسان می‌کند.'],['One tutorial may skip licensing, maintenance, and the available alternatives.','یک آموزش ممکن است مجوز، وضعیت نگهداری و گزینه‌های دیگر را نادیده بگیرد.']],
  [['Need · Persian tooling'],['Category · language','Repository · verify'],['Tutorial · random','Maintenance · unknown']]);

addCase('paknevis', 'language', 'paper', '#99dcb5',
  ['Fix the typography in a draft','رسم‌الخط پیش‌نویس را اصلاح کن'],
  ['The sample text contains “مي رود” and inconsistent punctuation spacing.','در متن نمونه «مي رود» و فاصله‌گذاری ناهماهنگ نشانه‌ها دیده می‌شود.'],
  [['Preview the suggested fixes','اصلاح پیشنهادی را پیش‌نمایش کن'],['Change the font','فونت را عوض کن']],
  [['The preview shows normalized characters and half-space while leaving the meaning intact.','پیش‌نمایش نویسه‌های نرمال و نیم‌فاصله را نشان می‌دهد و معنا حفظ می‌شود.'],['A new font changes appearance while the underlying characters stay the same.','فونت ظاهر را تغییر می‌دهد، اما نویسه‌های زیرین همان‌اند.']],
  [['مي رود  ،'],['می‌رود،'],['مي رود  ،']]);

addCase('jenkins', 'systems', 'route', '#ff997e',
  ['See where the pipeline stopped','مرحلهٔ توقف پایپ‌لاین را پیدا کن'],
  ['A build succeeds but the test stage fails. The deployment depends on both stages.','ساخت موفق است، اما مرحلهٔ آزمون خطا دارد و انتشار به هر دو وابسته است.'],
  [['Inspect the failing stage','مرحلهٔ خراب را بررسی کن'],['Retry deployment directly','مستقیم انتشار را تکرار کن']],
  [['The test logs provide the specific failure and the simulation leaves deployment pending.','لاگ آزمون خطای مشخص را نشان می‌دهد و انتشار در شبیه‌سازی در انتظار می‌ماند.'],['Starting from deploy skips the evidence required to explain the failure.','شروع از انتشار از شواهد لازم برای توضیح خطا عبور می‌کند.']],
  [['Build ✓','Test failed','Deploy pending'],['Build ✓','Inspect test log','Deploy pending'],['Build ✓','Test failed','Retry blocked']]);

addCase('dokhaneh', 'systems', 'route', '#f9c685',
  ['Verify a release at the mirror','انتشار را در آینه بررسی کن'],
  ['A sample mirror offers a release file during an outage. You have the expected digest from the release manifest.','در زمان قطعی، آینه یک فایل انتشار دارد. هش مورد انتظار را از مانیفست انتشار داری.'],
  [['Compare the file digest','هش فایل را مقایسه کن'],['Compare only the filename','فقط نام فایل را مقایسه کن']],
  [['The digest establishes whether the mirrored bytes match the expected release.','هش مشخص می‌کند بایت‌های فایل آینه با انتشار مورد انتظار تطبیق دارد یا خیر.'],['Two files can have the same name and different bytes.','دو فایل هم‌نام می‌توانند محتوای متفاوت داشته باشند.']],
  [['Release manifest','Mirror file','Need check'],['Expected digest','Mirror digest','Matched'],['Filename','Mirror path','Bytes unchecked']]);

addCase('flowpilot', 'systems', 'route', '#abcbff',
  ['Stop duplicate workflow steps','اجرای تکراری گردش‌کار را متوقف کن'],
  ['A sample Telegram event is delivered twice after a transient retry. Only one notification should be sent.','رویداد نمونهٔ تلگرام پس از تلاش مجدد دوبار می‌رسد. فقط یک اعلان باید ارسال شود.'],
  [['Track the incoming event ID','شناسهٔ رویداد ورودی را ثبت کن'],['Notify on every delivery','با هر تحویل اعلان بفرست']],
  [['The workflow recognizes the repeat and performs the notification once.','گردش‌کار تکرار را تشخیص می‌دهد و یک‌بار اعلان می‌فرستد.'],['Two deliveries produce two notifications for the same event.','دو تحویل برای همان رویداد دو اعلان می‌سازد.']],
  [['Event 42','Retry 42','Notify?'],['Event 42','Same ID','One notify'],['Event 42','Retry 42','Two notifications']]);

addCase('marz', 'systems', 'route', '#edb3ac',
  ['Map the unavailable dependency','وابستگیِ در دسترس‌نبودنی را پیدا کن'],
  ['A web page loads but a required remote font service is unavailable in the sample region.','صفحهٔ وب باز می‌شود ولی سرویس فونت راه‌دور در منطقهٔ نمونه دردسترس نیست.'],
  [['Check the dependency and fallback','وابستگی و مسیر جایگزین را بررسی کن'],['Count a successful page response only','فقط پاسخ موفق صفحه را حساب کن']],
  [['The audit finds the missing asset and identifies where a self-hosted fallback could help.','ممیزی دارایی غایب و محل مناسب برای جایگزین خودمیزبان را پیدا می‌کند.'],['A successful HTML response hides partially broken rendering.','پاسخ موفق HTML خرابی بخشی از رندر را پنهان می‌کند.']],
  [['Browser','App 200','Font unavailable'],['Browser','App 200','Local fallback'],['Browser','App 200','Font untested']]);

addCase('netdoctor-ir', 'systems', 'pulse', '#92dfd3',
  ['DNS or connectivity?', 'DNS یا اتصال؟'],
  ['Name resolution succeeds in the sample, but the connection to the package host then times out.','نام دامنه در نمونه حل می‌شود، اما اتصال به میزبان بسته بعد از آن تایم‌اوت می‌شود.'],
  [['Inspect the connection test','آزمون اتصال را بررسی کن'],['Change DNS immediately','بلافاصله DNS را عوض کن']],
  [['The checks separate a successful lookup from a connection failure.','آزمون‌ها حل نام موفق را از خطای اتصال جدا می‌کنند.'],['Changing the resolver does not explain the connection failure after a valid answer.','تعویض حل‌کننده، خطای اتصال بعد از پاسخ معتبر را توضیح نمی‌دهد.']],
  [['DNS 31 ms','connect timeout'],['DNS success','connect failure'],['resolver changed','connect still untested']]);

addCase('sabr', 'systems', 'meter', '#8be1ab',
  ['Resume the interrupted download','دانلود قطع‌شده را ادامه بده'],
  ['A fictional transfer stopped at 68%. The server supports range requests and the validator still matches.','انتقال فرضی در ۶۸٪ قطع شد. سرور درخواست بازه‌دار را می‌پذیرد و شناسهٔ نسخه هنوز تطبیق دارد.'],
  [['Continue from the verified offset','از موقعیت تأییدشده ادامه بده'],['Start again from zero','از صفر شروع کن']],
  [['Only the remaining bytes need to be transferred in this example.','در این نمونه فقط بایت‌های باقی‌مانده منتقل می‌شوند.'],['The already verified bytes are downloaded again.','بایت‌های قبلاً تأییدشده دوباره دانلود می‌شوند.']],
  [['68% verified'],['68% retained','32% fetched'],['100% fetched again']]);

addCase('mihanstack', 'systems', 'layers', '#91d4ff',
  ['Test a callback without a live account','کال‌بک را بدون حساب واقعی آزمایش کن'],
  ['You need to check how a local application responds to payment callbacks for success and failure.','می‌خواهی واکنش برنامهٔ محلی به کال‌بک موفق و ناموفق پرداخت را بررسی کنی.'],
  [['Replay fixtures against local services','نمونه‌ها را روی سرویس محلی اجرا کن'],['Use a production payment account','از حساب پرداخت تولید استفاده کن']],
  [['Both outcomes can be reproduced locally with the same fixture data.','هر دو حالت با دادهٔ نمونهٔ یکسان به‌صورت محلی تکرار می‌شوند.'],['The production account introduces external state and conditions unrelated to the local test.','حساب تولید، وضعیت و شرایط خارجیِ نامرتبط با آزمون محلی را وارد می‌کند.']],
  [['App · local','Callback · pending'],['Success · fixture','Failure · fixture'],['Production · external','Repeatability · reduced']]);

addCase('page-smash', 'showcase', 'wipe', '#ffad88',
  ['Choose the game’s canvas','بوم بازی را انتخاب کن'],
  ['Try the visual transformation on a sample page, then restore the original view.','تغییر بصری را روی یک صفحهٔ نمونه امتحان کن و بعد نمای اصلی را برگردان.'],
  [['Reveal part of the canvas','بخشی از بوم را نمایان کن'],['Reveal the central section','بخش مرکزی را نمایان کن']],
  [['A small area changes, keeping the rest of the page as a reference.','ناحیه‌ای کوچک تغییر می‌کند و بقیهٔ صفحه به‌عنوان مرجع می‌ماند.'],['A larger area shifts the emphasis and reveals the backing.','تغییر ناحیهٔ بزرگ‌تر، مرکز توجه را جابه‌جا می‌کند و لایهٔ زیر را نشان می‌دهد.']],
  [['preview · intact'],['edge · 22%'],['center · 54%']]);

addCase('universal-video-downloader', 'showcase', 'film', '#c8baff',
  ['Read a sample media manifest','مانیفست رسانهٔ نمونه را بخوان'],
  ['A public-domain training clip offers 720p and 1080p variants with different bitrates. Which fits a small preview?','ویدیوی آموزشیِ آزاد دو نسخهٔ ۷۲۰ و ۱۰۸۰ با نرخ بیت متفاوت دارد. برای پیش‌نمایش سبک کدام مناسب است؟'],
  [['Inspect the 720p variant','نسخهٔ ۷۲۰ را بررسی کن'],['Choose the largest stream','بزرگ‌ترین جریان را انتخاب کن']],
  [['The lower-bitrate variant reduces transfer size for the preview.','نسخهٔ با نرخ بیت کمتر، اندازهٔ انتقال پیش‌نمایش را کم می‌کند.'],['The high-resolution variant uses more bandwidth than the small preview needs.','نسخهٔ پُروضوح بیشتر از نیاز پیش‌نمایش کوچک پهنای باند مصرف می‌کند.']],
  [['manifest','720p · 2 Mb/s','1080p · 5 Mb/s'],['preview · 720p','2 Mb/s'],['preview · 1080p','5 Mb/s']]);

addCase('image-boutique-papeterie', 'showcase', 'film', '#e4bb96',
  ['Choose the paper for an illustrated page','کاغذ مناسب صفحهٔ تصویرسازی را انتخاب کن'],
  ['An illustrated invitation will be given as a keepsake. You want to compare the tactile look before shopping.','دعوت‌نامهٔ تصویرسازی‌شده قرار است یادگاری بماند. می‌خواهی پیش از خرید حس ظاهری گزینه‌ها را مقایسه کنی.'],
  [['Inspect the paper and texture','بافت و جنس کاغذ را بررسی کن'],['Choose by product title alone','فقط از روی عنوان انتخاب کن']],
  [['The storefront lets you look closely at physical details before opening the collection.','در فروشگاه می‌توانی پیش از دیدن مجموعه، جزئیات ظاهری محصول را از نزدیک بررسی کنی.'],['Two papers with similar labels can render the illustration differently.','دو کاغذ با عنوان مشابه می‌توانند تصویر را متفاوت نشان بدهند.']],
  [['illustrated invitation','paper options'],['texture','finish','collection'],['product title','texture unchecked']]);

addCase('naghsh-demo', 'showcase', 'film', '#ffd1a7',
  ['Choose the route through the shop','مسیر ورود به فروشگاه را انتخاب کن'],
  ['A first-time visitor can explore the storefront visually or jump straight into a print-estimate workflow.','بازدیدکننده می‌تواند ویترین را تصویری بگردد یا مستقیم سراغ مسیر برآورد چاپ برود.'],
  [['Walk through the boutique','ویترین بوتیک را بگرد'],['Start with the print studio','از استودیوی چاپ شروع کن']],
  [['The boutique puts the products and material first.','در طراحی بوتیک، محصول و جنس مواد اول دیده می‌شود.'],['The studio leads with search and the steps of a custom print order.','طراحی استودیو جست‌وجو و مراحل سفارش چاپ را جلو می‌آورد.']],
  [['Two concepts','One stationery shop'],['Boutique','Materials','Products'],['Studio','Search','Print estimate']]);

addCase('website-portfolio-demos', 'showcase', 'film', '#cbc4ff',
  ['Connect the case to the work','از نمونه به پروژه برس'],
  ['A visitor wants a real sample of the work behind the portfolio. Where should the introduction lead?', 'بازدیدکننده یک نمونهٔ واقعی از کار پشت این پورتفولیو می‌خواهد. معرفی باید به کجا برسد؟'],
  [['Open a project and its evidence','پروژه و شواهدش را باز کن'],['Stay on the biography','روی زندگی‌نامه بمان']],
  [['The project page ties the description to a demonstration the visitor can try.','صفحهٔ پروژه توضیحات را به دمویی که قابل امتحان است وصل می‌کند.'],['The biography gives context while leaving the requested example undiscovered.','زندگی‌نامه زمینه می‌دهد ولی نمونهٔ درخواستی هنوز پیدا نشده است.']],
  [['Portfolio','Visitor · curious'],['Project page','Demo','Source'],['Biography','Example not opened']]);
addCase('printbridge', 'systems', 'route', '#ead0a0',
  ['Preview a printable label','برچسب چاپی را پیش‌نمایش کن'],
  ['A label must fit 50 × 30 mm stock in a sample print queue.','برچسب نمونه باید روی کاغذ ۵۰ در ۳۰ میلی‌متری چاپ شود.'],
  [['Check output size first','اول اندازهٔ خروجی را بررسی کن'],['Send with default paper size','با اندازهٔ پیش‌فرض بفرست']],
  [['The queue can use the intended stock without shrinking or clipping the label.','صف می‌تواند از اندازهٔ درست استفاده کند و برچسب کوچک یا بریده نمی‌شود.'],['A page-sized default may reposition or scale the label.','اندازهٔ پیش‌فرض صفحه ممکن است موقعیت یا مقیاس برچسب را تغییر دهد.']],
  [['Design · 50×30 mm','Queue · waiting'],['Stock · 50×30 mm','Preview · fits'],['Stock · A4','Output · verify']]);

addCase('achievement-lab', 'showcase', 'film', '#e8aee3',
  ['Follow the repository timeline','رد فعالیت مخزن را دنبال کن'],
  ['You want to understand how a sample pull request moved from opening through review to merge.','می‌خواهی بدانی یک درخواست ادغام نمونه از باز شدن تا بازبینی و ادغام چه مسیری طی کرده.'],
  [['Inspect the events in order','رویدادها را به‌ترتیب بررسی کن'],['Look only at the final badge','فقط نشان نهایی را نگاه کن']],
  [['The timeline identifies the people and decisions involved at each stage.','خط زمانی افراد و تصمیم‌های هر مرحله را روشن می‌کند.'],['A final badge is less informative about how the work progressed.','نشان نهایی دربارهٔ مسیر پیشرفت کار جزئیات کمتری دارد.']],
  [['Pull request','Review pending'],['Opened','Reviewed','Merged'],['Badge','History unseen']]);
