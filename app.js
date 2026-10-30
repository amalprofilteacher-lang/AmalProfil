/* Static content remains usable when the optional upload service is unavailable. */
(() => {
'use strict';
const D=window.PORTFOLIO;if(!D)return;
const $=id=>document.getElementById(id),S={lang:'ar',category:'all',type:'all',query:'',limit:9,remote:[],client:null,user:null,busy:false,active:null,editPath:null};
const words={all:['جميع المجالات','All categories'],items:['شاهد','items'],image:['صورة','Photo'],video:['فيديو','Video'],pdf:['ملف PDF','PDF'],open:['عرض الشاهد','View evidence'],pages:['صفحات','pages'],pending:['بانتظار إضافة الشواهد','Evidence to be added'],noResults:['لا توجد شواهد تطابق البحث. جربي كلمة أخرى أو اختاري جميع المجالات.','No matching evidence. Try another keyword or select all categories.'],download:['فتح الملف الأصلي','Open original file'],connect:['تعذر الاتصال بخدمة الرفع. تأكدي من الإنترنت ثم أعيدي المحاولة. الشواهد الحالية متاحة للعرض.','The upload service is unavailable. Check your connection and try again. Existing evidence remains available.'],signin:['سجّلي الدخول بحساب إدارة الملف لإضافة الشواهد.','Sign in with the portfolio administrator account to add evidence.'],authFailed:['تعذر تسجيل الدخول. راجعي البريد وكلمة المرور.','Sign-in failed. Check your email and password.'],busy:['جارٍ الرفع… يرجى إبقاء النافذة مفتوحة.','Uploading… Please keep this window open.'],fileError:['الصيغ المتاحة: JPG، PNG، WebP، MP4، PDF. الحد الأقصى لكل ملف ٥٠ ميجابايت.','Available formats: JPG, PNG, WebP, MP4, PDF. Maximum 50 MB per file.'],empty:['اختاري ملفًا واحدًا على الأقل.','Choose at least one file.'],consent:['أكدي مناسبة الملفات للعرض العام قبل الرفع.','Confirm that these files are suitable for public viewing.'],category:['اختاري مجال الشاهد.','Choose an evidence category.'],signedOut:['تم تسجيل الخروج.','Signed out.'],service:['الاتصال بخدمة الرفع…','Connecting to the upload service…'],original:['من أرشيف الملف','Portfolio archive'],none:['لم تُضف شواهد لهذا المجال بعد. يمكن إضافة محاضر الاجتماعات، وتبادل الزيارات، والشهادات المهنية عند توفرها.','No evidence has been added yet. Meeting records, peer observations, and professional certificates can be added when available.'],add:['إضافة شاهد لهذا المجال','Add evidence to this category']};
const t=k=>words[k]?.[S.lang==='ar'?0:1]||k,tr=v=>typeof v==='string'?v:v?.[S.lang]||v?.ar||'',n=v=>new Intl.NumberFormat(S.lang==='ar'?'ar-SA':'en').format(v),cat=id=>D.categories.find(c=>c.id===id);
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};

/* Crisp, consistent vector icons (independent of operating-system emoji fonts). */
const UI_ICON_PATHS={"up-left":"<path d=\"M17 17 7 7M17 7H7v10\"/>","up-right":"<path d=\"M7 17 17 7M7 7h10v10\"/>","left":"<path d=\"m12 19-7-7 7-7M5 12h14\"/>","right":"<path d=\"m12 5 7 7-7 7M19 12H5\"/>","up":"<path d=\"m5 12 7-7 7 7M12 19V5\"/>","plus":"<path d=\"M12 5v14M5 12h14\"/>","x":"<path d=\"M18 6 6 18M6 6l12 12\"/>","play":"<path d=\"m8 5 11 7-11 7V5Z\"/>","file":"<path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z\"/><path d=\"M14 2v6h6M8 13h8M8 17h6\"/>","video":"<rect x=\"3\" y=\"5\" width=\"15\" height=\"14\" rx=\"2\"/><path d=\"m18 10 3-2v8l-3-2\"/>","check":"<path d=\"m20 6-11 11-5-5\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-4-4\"/>"};
function icon(name,size=18){
  const node=document.createElementNS('http://www.w3.org/2000/svg','svg');
  node.setAttribute('class','ui-icon');
  node.setAttribute('viewBox','0 0 24 24');
  node.setAttribute('width',String(size));
  node.setAttribute('height',String(size));
  node.setAttribute('fill','none');
  node.setAttribute('stroke','currentColor');
  node.setAttribute('stroke-width','1.8');
  node.setAttribute('stroke-linecap','round');
  node.setAttribute('stroke-linejoin','round');
  node.setAttribute('aria-hidden','true');
  node.setAttribute('focusable','false');
  node.innerHTML=UI_ICON_PATHS[name]||UI_ICON_PATHS.plus;
  return node;
}
function rowArrow(name){const node=el('span','row-arrow');node.append(icon(name,18));return node;}
function planMeta(pages){const node=el('span','plan-pages',`${n(pages)} ${t('pages')} `);node.append(icon('up-right',14));return node;}

const norm=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي');
const priority=['media-10','media-17','plan-week-2','media-01','media-02','media-27','media-11','media-22','media-06'];
function all(){return [...S.remote.filter(i=>i.remotePath?.includes('/v2.')),...[...D.evidence].sort((a,b)=>{const x=priority.indexOf(a.id),y=priority.indexOf(b.id);return(x<0?1000:x)-(y<0?1000:y);}),...S.remote.filter(i=>!i.remotePath?.includes('/v2.'))];}
function url(v){try{const u=new URL(v,document.baseURI);if(['http:','https:','file:'].includes(u.protocol))return u.href;}catch{}return '';}
function bytes(v){if(!v)return '';const mb=v/1048576;return mb>=1?`${n(Math.round(mb*10)/10)} MB`:`${n(Math.ceil(v/1024))} KB`;}
function time(v){if(v==null||!Number.isFinite(Number(v)))return '';v=Math.round(v);return`${Math.floor(v/60)}:${String(v%60).padStart(2,'0')}`;}
function status(id,v,error=false){$(id).textContent=v;$(id).classList.toggle('error',error);}
function dialog(id){if(!$(id).open)$(id).showModal();document.body.classList.add('dialog-open');}
function card(item){const b=el('button','evidence-card');b.type='button';b.dataset.id=item.id;b.setAttribute('aria-label',`${t('open')}: ${tr(item.title)}`);const visual=el('div','media-thumb');if(item.thumbnail||item.type==='image'){const i=el('img');i.src=url(item.thumbnail||item.src);i.alt=tr(item.title);i.loading='lazy';i.decoding='async';visual.append(i);}else{visual.classList.add('video-placeholder');const placeholder=el('span','placeholder-symbol');placeholder.append(icon(item.type==='pdf'?'file':'video',34));visual.append(placeholder);}visual.append(el('span','type-tag',t(item.type)));if(item.type==='video'){const play=el('span','play-icon');play.append(icon('play',22));visual.append(play);}const body=el('div','card-body');body.append(el('span','card-category',tr(cat(item.categories?.[0])?.title)||t('original')),el('h3','card-title',tr(item.title)),el('span','card-meta',[item.type==='video'?time(item.duration):'',item.pages?`${n(item.pages)} ${t('pages')}`:'',bytes(item.bytes)].filter(Boolean).join(' · ')));b.append(visual,body);b.addEventListener('click',()=>openItem(item));return b;}
function gallery(){const matches=all().filter(i=>{if(S.type!=='all'&&i.type!==S.type)return false;if(S.category!=='all'&&!i.categories?.includes(S.category))return false;return !S.query||norm([i.title?.ar,i.title?.en,i.description?.ar,i.description?.en,...(i.categories||[]).map(id=>tr(cat(id)?.title))].join(' ')).includes(norm(S.query));});$('evidenceGrid').replaceChildren(...matches.slice(0,S.limit).map(card));$('evidenceCount').textContent=`${n(matches.length)} ${t('items')}`;$('loadMore').hidden=matches.length<=S.limit;$('emptyState').hidden=matches.length!==0;/* Keep the accessible bilingual empty-state heading and description intact. */}
function categories(){$('categoryList').replaceChildren(...D.categories.map((c,index)=>{const count=all().filter(i=>i.categories?.includes(c.id)).length,b=el('button','category-row');b.type='button';b.dataset.category=c.id;const copy=el('span','category-copy');copy.append(el('h3','',tr(c.title)),el('p','',tr(c.description)));b.append(el('span','category-number',n(index+1)),copy,el('span','category-count',count?`${n(count)} ${t('items')}`:t('pending')),rowArrow(S.lang==='ar'?'up-left':'up-right'));b.addEventListener('click',()=>openCategory(c.id));return b;}));$('stat-categories').textContent=n(D.categories.length);$('stat-evidence').textContent=n(all().length);$('stat-plans').textContent=n(D.plans.length);}
function selects(){const selected=$('uploadCategory').value;$('categoryFilter').replaceChildren(new Option(t('all'),'all'),...D.categories.map(c=>new Option(tr(c.title),c.id)));$('categoryFilter').value=S.category;$('uploadCategory').replaceChildren(new Option(S.lang==='ar'?'اختاري المجال':'Choose a category',''),...D.categories.map(c=>new Option(tr(c.title),c.id)));$('uploadCategory').value=selected;const existing=$('manageCategory').value;$('manageCategory').replaceChildren(new Option(S.lang==='ar'?'اختاري المجال':'Choose a category',''),...D.categories.map(c=>new Option(tr(c.title),c.id)));$('manageCategory').value=existing;}
function plans(){$('plansList').replaceChildren(...D.plans.map(id=>{const i=D.evidence.find(x=>x.id===id);if(!i)return document.createDocumentFragment();const b=el('button','plan-item'),info=el('span','plan-info');b.type='button';info.append(el('strong','',tr(i.title)),el('span','',tr(i.description)));b.append(el('span','plan-week',n(i.week)),info,planMeta(i.pages));b.addEventListener('click',()=>openItem(i));return b;}));}
function openCategory(id){const c=cat(id);if(!c)return;S.active=id;$('categoryTitle').textContent=tr(c.title);$('categoryDescription').textContent=tr(c.description);const items=all().filter(i=>i.categories?.includes(id));if(items.length)$('categoryDialogGrid').replaceChildren(...items.map(card));else{const empty=el('div','category-empty'),b=el('button','btn',t('add'));b.type='button';b.addEventListener('click',()=>{$('categoryDialog').close();admin(id);});empty.append(el('p','',t('none')),b);$('categoryDialogGrid').replaceChildren(empty);}dialog('categoryDialog');}
function openItem(i){$('mediaTitle').textContent=tr(i.title);$('mediaCaption').textContent=tr(i.description);const box=$('mediaContent'),src=url(i.src);box.replaceChildren();if(i.type==='image'){const img=el('img','full-image');img.src=src;img.alt=tr(i.title);box.append(img);}else if(i.type==='video'){const v=el('video','full-video');v.controls=true;v.playsInline=true;v.preload='metadata';if(i.thumbnail)v.poster=url(i.thumbnail);const source=el('source');source.src=src;source.type=i.mime||({'webm':'video/webm','mov':'video/quicktime','ogv':'video/ogg'}[i.src.split('.').pop()?.toLowerCase()]||'video/mp4');v.append(source);box.append(v);}else if(i.previewPages?.length){const reader=el('div','pdf-pages');reader.tabIndex=0;reader.setAttribute('role','region');reader.setAttribute('aria-label',tr(i.title));i.previewPages.forEach((page,index)=>{const figure=el('figure','pdf-page'),img=el('img');img.src=url(page);img.alt=tr(i.title)+' — '+(S.lang==='ar'?'صفحة ':'page ')+n(index+1);img.loading=index?'lazy':'eager';img.decoding='async';figure.append(img,el('figcaption','',n(index+1)+' / '+n(i.previewPages.length)));reader.append(figure);});box.append(reader);}else{const f=el('iframe','pdf-frame');f.src=`${src}#toolbar=1&navpanes=0`;f.title=tr(i.title);box.append(f);}const a=el('a','original-link',t('download'));a.append(icon('up-right',14));a.href=src;a.target='_blank';a.rel='noopener noreferrer';box.append(a);dialog('mediaDialog');}
function language(lang,persist=true){S.lang=lang;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.body.classList.toggle('lang-en',lang==='en');document.body.classList.toggle('lang-ar',lang==='ar');$('languageBtn').replaceChildren(document.createTextNode(lang==='ar'?'English ':'العربية '),icon('up-right',12));$('languageBtn').setAttribute('aria-label',lang==='ar'?'Switch to English':'التبديل إلى العربية');document.querySelectorAll('[data-close]').forEach(b=>b.setAttribute('aria-label',lang==='ar'?'إغلاق':'Close'));$('uploadTitle').placeholder=lang==='ar'?'مثال: نشاط تعلّم تعاوني':'For example: cooperative learning activity';$('uploadDescription').placeholder=lang==='ar'?'ما الذي يوثّقه هذا الشاهد؟':'What does this evidence show?';$('searchInput').placeholder=lang==='ar'?'ابحثي عن نشاط، خطة أو مهارة…':'Search for an activity, plan, or skill…';$('searchInput').setAttribute('aria-label',lang==='ar'?'البحث في الشواهد':'Search evidence');$('categoryFilter').setAttribute('aria-label',lang==='ar'?'تصفية حسب المجال':'Filter by category');if(persist){try{localStorage.setItem('amal-portfolio-language',lang);}catch{}}selects();gallery();categories();plans();if($('categoryDialog').open&&S.active)openCategory(S.active);}

function renderManager(){
  const target=$('manageMediaList');if(!target)return;
  target.replaceChildren();if(!S.user)return;
  const items=S.remote.filter(item=>item.remotePath);
  if(!items.length){target.append(el('p','manager-empty',S.lang==='ar'?'لا توجد وسائط مرفوعة، أو لم تكتمل قراءة القائمة بعد.':'No uploads found, or the list is still loading.'));return;}
  for(const item of items){
    const row=el('div','manage-media-row'),preview=el('span','manage-preview');
    if(item.type==='image'){const img=el('img');img.src=url(item.thumbnail||item.src);img.alt='';img.loading='lazy';preview.append(img);}
    else preview.append(icon(item.type==='pdf'?'file':'video',23));
    const info=el('span','manage-media-copy');
    info.append(el('span','manage-media-title',tr(item.title)),el('span','manage-media-type',t(item.type)));
    const buttons=el('span','manage-row-actions'),edit=el('button','manage-edit-button',S.lang==='ar'?'تعديل':'Edit'),remove=el('button','manage-remove-button',S.lang==='ar'?'حذف':'Delete');
    edit.type=remove.type='button';
    edit.addEventListener('click',()=>openManagerEdit(item.remotePath));
    remove.addEventListener('click',()=>deleteRemote(item.remotePath));
    buttons.append(edit,remove);row.append(preview,info,buttons);target.append(row);
  }
}
function openManagerEdit(path){
  if(S.busy||!S.user)return;
  const item=S.remote.find(x=>x.remotePath===path);if(!item)return;
  S.editPath=path;
  $('manageTitle').value=tr(item.title);
  $('manageDescription').value=tr(item.description);
  $('manageCategory').value=item.categories?.[0]||'';
  $('manageEditPanel').hidden=false;
  status('manageStatus','');
  $('manageEditPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function closeManagerEdit(){S.editPath=null;$('manageEditPanel').hidden=true;$('manageEditForm').reset();}
async function saveManagerEdit(e){
  e.preventDefault();
  const item=S.remote.find(x=>x.remotePath===S.editPath);
  if(!item||S.busy||!S.user)return;
  const title=$('manageTitle').value.trim().slice(0,120),description=$('manageDescription').value.trim().slice(0,1000),category=$('manageCategory').value;
  if(!title||!cat(category)){status('manageStatus',S.lang==='ar'?'أدخلي عنوانًا واختاري مجال الأداء.':'Enter a title and a performance area.',true);return;}
  const c=await client();if(!c){status('manageStatus',t('connect'),true);return;}
  S.busy=true;$('manageSave').disabled=true;
  try{
    const {data:auth,error:authErr}=await c.auth.getUser();
    if(authErr||!auth?.user)throw new Error('Not authenticated');
    const uid=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const meta={version:3,path:item.remotePath,title,description,category,type:item.type,bytes:item.bytes};
    const blob=new Blob([JSON.stringify(meta)],{type:'application/json'});
    const {error}=await c.storage.from(D.supabase.bucket).upload(`${D.supabase.basePath}/catalog/edit-${uid}.json`,blob,{contentType:'application/json',cacheControl:'60',upsert:false});
    if(error)throw error;
    item.title={ar:title,en:title};item.description={ar:description,en:description};item.categories=[category];
    closeManagerEdit();renderManager();categories();gallery();
    status('manageStatus',S.lang==='ar'?'تم حفظ بيانات الشاهد.':'Evidence details saved.');
  }catch{
    status('manageStatus',S.lang==='ar'?'تعذر حفظ التعديل. تحققي من صلاحيات حساب الإدارة في خدمة التخزين.':'Could not save changes. Check the account’s storage permissions.',true);
  }finally{S.busy=false;$('manageSave').disabled=false;}
}
async function deleteRemote(path){
  if(!S.user||S.busy)return;
  const item=S.remote.find(x=>x.remotePath===path);if(!item)return;
  const msg=S.lang==='ar'?`حذف «${tr(item.title)}» نهائيًا من الشواهد المرفوعة؟ لا يمكن التراجع.`:`Permanently delete “${tr(item.title)}” from uploaded evidence? This cannot be undone.`;
  if(!window.confirm(msg))return;
  const c=await client();if(!c){status('manageStatus',t('connect'),true);return;}
  S.busy=true;
  try{
    const {data:auth,error:authErr}=await c.auth.getUser();
    if(authErr||!auth?.user)throw new Error('Not authenticated');
    const {error}=await c.storage.from(D.supabase.bucket).remove([path]);if(error)throw error;
    S.remote=S.remote.filter(x=>x.remotePath!==path);
    if(S.editPath===path)closeManagerEdit();
    renderManager();categories();gallery();
    status('manageStatus',S.lang==='ar'?'تم حذف الملف من خدمة الرفع.':'Uploaded file deleted.');
  }catch{
    status('manageStatus',S.lang==='ar'?'تعذر حذف الملف. تأكدي من صلاحيات الحذف لحساب الإدارة.':'Could not delete the file. Verify delete permissions for your admin account.',true);
  }finally{S.busy=false;}
}
function authError(err){
  const code=String(err?.code||'').toLowerCase(),message=String(err?.message||'').toLowerCase();
  if(code.includes('invalid_credentials')||message.includes('invalid login credentials'))
    return S.lang==='ar'?'البريد أو كلمة المرور غير صحيحة، أو لا يوجد حساب إدارة مسجّل لهذا الموقع. هذه ليست بيانات GitHub.':'Incorrect email/password or no management account exists for this site. GitHub credentials do not work here.';
  if(code.includes('email_not_confirmed')||message.includes('email not confirmed'))
    return S.lang==='ar'?'يرجى تأكيد البريد الإلكتروني الخاص بحساب إدارة الموقع أولًا.':'Please confirm the email address of the portfolio management account first.';
  if(code.includes('over_request')||message.includes('too many requests'))
    return S.lang==='ar'?'محاولات كثيرة لتسجيل الدخول. أعيدي المحاولة لاحقًا.':'Too many sign-in attempts. Please try again later.';
  if(message.includes('fetch')||message.includes('network')||code.includes('network'))
    return S.lang==='ar'?'تعذر الاتصال بخدمة الحسابات. تحققي من الإنترنت أو إعدادات Supabase.':'Could not reach the account service. Check your connection or Supabase configuration.';
  return t('authFailed');
}
const ready=new Promise(resolve=>{const script=$('supabaseSdk'),init=()=>{if(!window.supabase?.createClient||!D.supabase?.url||!D.supabase?.anonKey){resolve(null);return;}try{S.client=window.supabase.createClient(D.supabase.url,D.supabase.anonKey);resolve(S.client);}catch{resolve(null);}};if(window.supabase)init();else if(script){script.addEventListener('load',init,{once:true});script.addEventListener('error',()=>resolve(null),{once:true});}else resolve(null);});
async function client(){return Promise.race([ready,new Promise(r=>setTimeout(()=>r(null),12000))]);}
function authView(){$('loginView').hidden=!!S.user;$('uploadView').hidden=!S.user;$('passwordInput').value='';$('signInBtn').disabled=false;renderManager();}
async function admin(category=''){dialog('adminDialog');if(category)$('uploadCategory').value=category;status('authStatus',t('service'));const c=await client();if(!c){status('authStatus',t('connect'),true);return;}try{const{data}=await c.auth.getSession();S.user=data?.session?.user||null;authView();if(S.user)remote();else status('authStatus',t('signin'));}catch{status('authStatus',t('connect'),true);}}
async function signIn(e){e.preventDefault();const email=$('emailInput').value.trim(),password=$('passwordInput').value;if(!email||!password)return;$('signInBtn').disabled=true;status('authStatus',S.lang==='ar'?'جارٍ تسجيل الدخول…':'Signing in…');const c=await client();if(!c){status('authStatus',t('connect'),true);$('signInBtn').disabled=false;return;}try{const{data,error}=await c.auth.signInWithPassword({email,password});if(error||!data?.user)throw error||new Error('Unavailable');S.user=data.user;authView();remote();status('uploadStatus','');}catch(err){status('authStatus',authError(err),true);}finally{$('signInBtn').disabled=false;}}
const encode=v=>btoa(String.fromCharCode(...new TextEncoder().encode(v))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
const decode=v=>new TextDecoder().decode(Uint8Array.from(atob(v.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)));
function kind(f){const ext=f.name.split('.').pop()?.toLowerCase(),type={jpg:'image',jpeg:'image',png:'image',webp:'image',mp4:'video',pdf:'pdf'}[ext],mime={jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',mp4:'video/mp4',pdf:'application/pdf'}[ext];return !type||!f.size||f.size>52428800||f.type&&f.type!==mime?null:{type,ext,mime};}
async function upload(e){e.preventDefault();if(S.busy)return;const files=[...$('uploadFile').files],category=$('uploadCategory').value;if(!files.length){status('uploadStatus',t('empty'),true);return;}if(!cat(category)){status('uploadStatus',t('category'),true);return;}if(!$('uploadPublicConfirm').checked){status('uploadStatus',t('consent'),true);return;}if(files.some(f=>!kind(f))){status('uploadStatus',t('fileError'),true);return;}S.busy=true;$('uploadSubmit').disabled=true;const unlock=()=>{S.busy=false;$('uploadSubmit').disabled=false;};const c=await client();if(!c){status('uploadStatus',t('connect'),true);unlock();return;}try{const{data,error}=await c.auth.getUser();if(error||!data?.user){S.user=null;authView();status('authStatus',t('signin'),true);unlock();return;}}catch{status('uploadStatus',t('connect'),true);unlock();return;}S.busy=true;$('uploadSubmit').disabled=true;$('signOutBtn').disabled=true;$('uploadProgress').hidden=false;$('uploadProgress').max=files.length;$('uploadProgress').value=0;status('uploadStatus',t('busy'));$('uploadForm').querySelectorAll('input,select,textarea').forEach(x=>x.disabled=true);$('uploadSummary').replaceChildren();let count=0;const failed=[];
for(const[index,f]of files.entries()){const{type,ext,mime}=kind(f),base=($('uploadTitle').value.trim()||f.name.replace(/\.[^.]+$/,'')).slice(0,120),title=files.length>1&&$('uploadTitle').value.trim()?`${base} ${index+1}`:base,description=$('uploadDescription').value.trim().slice(0,1000),uid=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`,folder=type==='image'?'images':type==='video'?'videos':'documents',path=`${D.supabase.basePath}/${folder}/v2.${category}.${encode(title)}.${uid}.${ext}`;let warning='';try{const{error}=await c.storage.from(D.supabase.bucket).upload(path,f,{contentType:mime,cacheControl:'3600',upsert:false});if(error)throw error;count++;const src=c.storage.from(D.supabase.bucket).getPublicUrl(path).data.publicUrl,item={id:`remote-${uid}`,type,src,title:{ar:title,en:title},description:{ar:description,en:description},categories:[category],bytes:f.size,remotePath:path};if(type==='image')item.thumbnail=src;S.remote.unshift(item);if(description){try{const meta={version:2,path,title,description,category,type,bytes:f.size},blob=new Blob([JSON.stringify(meta)],{type:'application/json'}),{error}=await c.storage.from(D.supabase.bucket).upload(`${D.supabase.basePath}/catalog/${uid}.json`,blob,{contentType:'application/json',upsert:false});if(error)throw error;}catch{warning=S.lang==='ar'?' (نُشر الملف بعنوانه ومجاله؛ لم يُحفظ الوصف الإضافي)':' (Published with title and category; extra description was not saved)';}}{const result=el('li','upload-success');result.append(icon('check',16),document.createTextNode(' '+title+warning));$('uploadSummary').append(result);}}catch{failed.push(f);{const result=el('li','upload-failed');result.append(icon('x',16),document.createTextNode(` ${f.name}: ${S.lang==='ar'?'تعذر الرفع؛ راجعي الاتصال وصلاحية حساب الإدارة.':'Upload failed; check the connection and administrator permissions.'}`));$('uploadSummary').append(result);}}$('uploadProgress').value=index+1;}
S.busy=false;$('uploadSubmit').disabled=false;$('signOutBtn').disabled=false;$('uploadForm').querySelectorAll('input,select,textarea').forEach(x=>x.disabled=false);gallery();categories();status('uploadStatus',S.lang==='ar'?`تم نشر ${n(count)} من ${n(files.length)} ملف.`:`Published ${n(count)} of ${n(files.length)} files.`,failed.length>0);if(!failed.length){$('uploadForm').reset();$('uploadCategory').value=category;renderManager();}else{try{const dt=new DataTransfer();failed.forEach(f=>dt.items.add(f));$('uploadFile').files=dt.files;}catch{$('uploadFile').value='';}}}
async function list(c,folder){const path=`${D.supabase.basePath}/${folder}`,out=[];for(let offset=0;offset<5000;offset+=100){const{data,error}=await c.storage.from(D.supabase.bucket).list(path,{limit:100,offset,sortBy:{column:'created_at',order:'desc'}});if(error)throw error;out.push(...(data||[]).filter(f=>f.id&&f.name&&f.name!=='.emptyFolderPlaceholder').map(f=>({...f,path:`${path}/${f.name}`})));if(!data||data.length<100)break;}return out;}
async function remote(){const c=await client();if(!c||!navigator.onLine)return;try{const lists=await Promise.all(['images','videos','documents'].map(async folder=>{try{return await list(c,folder);}catch{return [];}})),loaded=lists.flatMap((files,index)=>files.map((f,fileIndex)=>{const type=['image','video','pdf'][index],ext=f.name.split('.').pop()?.toLowerCase();if(!{image:['jpg','jpeg','png','webp','gif','avif','svg','bmp'],video:['mp4','webm','mov','m4v','ogv'],pdf:['pdf']}[type].includes(ext))return null;let title=(S.lang==='ar'?(type==='image'?'من أرشيف أمل — صورة ':'من أرشيف أمل — فيديو '):(type==='image'?'Amal’s archive — photo ':'Amal’s archive — video '))+n(fileIndex+1),category='';if(f.name.startsWith('v2.')){const parts=f.name.split('.');try{title=decode(parts[2]).slice(0,140);}catch{title=S.lang==='ar'?'شاهد مضاف':'Added evidence';}if(cat(parts[1]))category=parts[1];}const src=c.storage.from(D.supabase.bucket).getPublicUrl(f.path).data.publicUrl;return{id:`remote-${f.id}`,type,src,thumbnail:type==='image'?src:undefined,title:{ar:f.name.startsWith('v2.')?title:(type==='image'?'من أرشيف أمل — صورة ':'من أرشيف أمل — فيديو ')+new Intl.NumberFormat('ar-SA').format(fileIndex+1),en:f.name.startsWith('v2.')?title:(type==='image'?'Amal’s archive — photo ':'Amal’s archive — video ')+(fileIndex+1)},description:{ar:f.name.startsWith('v2.')?'':'من المعرض المحفوظ في النسخة السابقة من الموقع.',en:f.name.startsWith('v2.')?'':'Preserved from the website’s previous gallery.'},categories:category?[category]:[],bytes:Number(f.metadata?.size)||0,remotePath:f.path};}).filter(Boolean));try{
    const catalogs=await list(c,'catalog');
    const records=await Promise.all(catalogs.filter(f=>f.name.endsWith('.json')).slice(0,500).map(async f=>{
      try{
        const {data:blob,error}=await c.storage.from(D.supabase.bucket).download(f.path);
        if(error||!blob||blob.size>20000)return null;
        return JSON.parse(await blob.text());
      }catch{return null;}
    }));
    const applied=new Set();
    for(const meta of records){
      if(!meta||typeof meta.path!=='string'||applied.has(meta.path))continue;
      const item=loaded.find(x=>x.remotePath===meta.path);
      if(!item)continue;
      applied.add(meta.path);
      if(typeof meta.description==='string')item.description={ar:meta.description.slice(0,1000),en:meta.description.slice(0,1000)};
      if(typeof meta.title==='string'&&meta.title.trim())item.title={ar:meta.title.slice(0,120),en:meta.title.slice(0,120)};
      if(cat(meta.category))item.categories=[meta.category];
    }
  }catch{}S.remote=[...S.remote.filter(i=>!loaded.some(x=>x.remotePath===i.remotePath)),...loaded];categories();gallery();renderManager();}catch{}}
document.querySelectorAll('dialog').forEach(d=>{d.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{if(!(S.busy&&d.id==='adminDialog'))d.close();}));d.addEventListener('cancel',e=>{if(S.busy&&d.id==='adminDialog')e.preventDefault();});d.addEventListener('click',e=>{if(e.target!==d||S.busy&&d.id==='adminDialog')return;const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();});d.addEventListener('close',()=>{if(d.id==='mediaDialog'){d.querySelector('video')?.pause();$('mediaContent').replaceChildren();}if(d.id==='adminDialog')$('passwordInput').value='';document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]'));});});
$('languageBtn').addEventListener('click',()=>language(S.lang==='ar'?'en':'ar'));
$('menuBtn').addEventListener('click',()=>{const open=$('menuBtn').getAttribute('aria-expanded')!=='true';$('menuBtn').setAttribute('aria-expanded',String(open));$('mainNav').classList.toggle('is-open',open);});$('mainNav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('mainNav').classList.remove('is-open');$('menuBtn').setAttribute('aria-expanded','false');}));
$('searchInput').addEventListener('input',()=>{S.query=$('searchInput').value.trim();S.limit=9;gallery();});$('categoryFilter').addEventListener('change',()=>{S.category=$('categoryFilter').value;S.limit=9;gallery();});$('typeFilters').querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{S.type=b.dataset.type;S.limit=9;$('typeFilters').querySelectorAll('[data-type]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});gallery();}));$('loadMore').addEventListener('click',()=>{S.limit+=9;gallery();});$('adminBtn').addEventListener('click',()=>admin());$('openUploadBtn')?.addEventListener('click',()=>admin());$('loginForm').addEventListener('submit',signIn);
$('manageEditForm').addEventListener('submit',saveManagerEdit);
$('manageCancel').addEventListener('click',closeManagerEdit);
$('refreshMediaBtn').addEventListener('click',()=>{status('manageStatus',S.lang==='ar'?'تحديث القائمة…':'Refreshing list…');remote();});$('uploadForm').addEventListener('submit',upload);$('signOutBtn').addEventListener('click',async()=>{if(!S.client||S.busy)return;try{const{error}=await S.client.auth.signOut();if(error)throw error;S.user=null;closeManagerEdit();authView();status('authStatus',t('signedOut'));}catch{status('uploadStatus',t('connect'),true);}});
let saved;try{saved=localStorage.getItem('amal-portfolio-language');}catch{}language(saved==='en'?'en':'ar',false);ready.then(c=>{if(!c)return;c.auth.onAuthStateChange((_event,session)=>{S.user=session?.user||null;if($('adminDialog').open&&!S.busy)authView();});remote();});
})();
