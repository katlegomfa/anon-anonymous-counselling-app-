const fallbackServices=[
  'Online therapy','Depression support','OCD support','Anxiety support',"Men's wellbeing",'Relationship counselling','Self-esteem support','Grief counselling','Maternal mental health','LGBTQIA+ affirming support','Addiction counselling','Mental-health assessments','HIV/AIDS counselling','Gambling-harm support','Relationship therapy (CBT, emotion-focused and communication approaches)',"Veterans' support",'Postpartum mental health'
];
const descriptions=[
  'Learn about talking-based support, what a first conversation may involve and questions you may wish to ask a qualified provider.',
  'Understand common experiences linked with low mood and explore gentle ways to seek appropriate professional support.',
  'Explore what obsessive thoughts and compulsive behaviours can feel like and learn about evidence-informed care conversations.',
  'Learn about worry, fear and anxious feelings, plus practical grounding ideas and options for professional assessment.',
  'A respectful space to explore emotional wellbeing, stress, identity, relationships and barriers men may experience when seeking support.',
  'Explore communication, boundaries, trust and ways to approach relationship concerns with care and respect.',
  'Learn about self-worth, self-compassion and practical ways to notice the language you use towards yourself.',
  'Explore grief, loss and different ways people experience bereavement, with gentle ideas for support and connection.',
  'Learn about emotional wellbeing through pregnancy and early parenthood, and when to discuss concerns with a qualified professional.',
  'Explore affirming, respectful support that recognises diverse identities and the importance of dignity, confidentiality and safety.',
  'Learn about patterns of substance use, stigma-free support options and how to approach a conversation about change.',
  'Understand the purpose and limits of mental-health screening. A screening tool is not a diagnosis or substitute for a clinician.',
  'Explore supportive, stigma-free information around HIV and emotional wellbeing. Do not disclose HIV status in this demonstration.',
  'Learn about gambling-related harm, its possible effects and ways to explore confidential, qualified support.',
  'Explore relationship approaches named in the architecture, including cognitive behavioural, emotion-focused and communication-based methods.',
  'Acknowledge service-related experiences, transition, stress and the importance of respectful, culturally aware support.',
  'Learn about emotional wellbeing after childbirth and why timely, compassionate professional support can matter.'
];
const keywords=[
  'talking therapy therapist video text','low mood sadness hopelessness','obsessive thoughts compulsions','worry panic fear stress','men masculinity stress emotional health','couples communication boundaries trust','confidence self compassion worth','bereavement loss mourning','pregnancy perinatal parenthood','inclusive identity affirming safe','substance alcohol drugs recovery','screening assessment mental health check','HIV stigma emotional support','betting gambling financial harm','CBT emotion focused couples communication','military service transition trauma','after birth new parent mood'
];
const grid=document.querySelector('#services');
const select=document.querySelector('#service');
const search=document.querySelector('#search');
const resultCount=document.querySelector('#resultCount');
const apiStatus=document.querySelector('#apiStatus');
const catalogStatus=document.querySelector('#catalogStatus');
const backendNote=document.querySelector('#backendNote');
let serviceList=fallbackServices.slice();
let apiOnline=false;
let catalogLive=false;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function render(filter=''){
  const q=filter.trim().toLowerCase();
  const matches=serviceList.map((name,index)=>({name,index})).filter(({name,index})=>(name+' '+descriptions[index]+' '+keywords[index]).toLowerCase().includes(q));
  resultCount.textContent=matches.length+' '+(matches.length===1?'pathway':'pathways');
  grid.innerHTML=matches.length?matches.map(({name,index})=>`<article class="service"><span class="service-number">PATHWAY  ${String(index+1).padStart(2,'0')}</span><b>${escapeHTML(name)}</b><p>${escapeHTML(descriptions[index])}</p><button type="button" data-service-index="${index}">Explore this topic <span aria-hidden="true">↗</span></button></article>`).join(''):'<p>No matching pathways. Try a broader word, such as stress, relationships or wellbeing.</p>';
}
function populateSelect(){
  select.innerHTML='<option value="">Choose a support area</option>'+serviceList.map(name=>'<option value="'+escapeHTML(name)+'">'+escapeHTML(name)+'</option>').join('');
}
grid.addEventListener('click',event=>{
  const button=event.target.closest('[data-service-index]');
  if(!button)return;
  const index=Number(button.dataset.serviceIndex);
  select.value=serviceList[index]||'';
  document.querySelector('#requestForm').scrollIntoView({behavior:'smooth',block:'center'});
  select.focus({preventScroll:true});
});
search.addEventListener('input',event=>render(event.target.value));
async function loadBackend(){
  const healthPromise=fetch('/api/health',{headers:{'Accept':'application/json'},cache:'no-store'}).then(async response=>{
    if(!response.ok)throw new Error('Health endpoint returned '+response.status);
    return response.json();
  });
  const catalogPromise=fetch('/api/catalog',{headers:{'Accept':'application/json'},cache:'no-store'}).then(async response=>{
    if(!response.ok)throw new Error('Directory endpoint returned '+response.status);
    return response.json();
  });
  try{
    const [health,catalog]=await Promise.all([healthPromise,catalogPromise]);
    apiOnline=health.status==='ok';
    catalogLive=Array.isArray(catalog.services)&&catalog.services.length===17;
    if(Array.isArray(catalog.services)&&catalog.services.length){
      serviceList=catalog.services;
      populateSelect();
      render(search.value);
    }
    apiStatus.textContent=apiOnline?'Connected':'Unavailable';
    apiStatus.classList.toggle('status-off',!apiOnline);
    catalogStatus.textContent=catalogLive?'17 topics loaded':'Loaded · '+serviceList.length;
    catalogStatus.classList.toggle('status-off',!catalogLive);
    backendNote.textContent=apiOnline&&catalogLive?'The live demo API is responding and all 17 support topics loaded from the backend. No clinical service or counsellor availability is implied.':'The API responded, but the directory differs from the expected 17-topic architecture. Please review the backend catalogue.';
  }catch(error){
    apiStatus.textContent='Unavailable';
    apiStatus.classList.add('status-off');
    catalogStatus.textContent='Using local fallback';
    catalogStatus.classList.add('status-off');
    backendNote.textContent='The live API could not be reached from this page. The topic directory is shown from a built-in fallback list; demo submissions may not work.';
  }
}
populateSelect();
render();
loadBackend();

document.querySelector('#requestForm').addEventListener('submit',async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  const result=document.querySelector('#result');
  const submit=form.querySelector('button[type="submit"]');
  if(!form.reportValidity())return;
  submit.disabled=true;
  submit.textContent='Submitting demonstration…';
  result.textContent='Sending a non-clinical demo entry to the application backend…';
  try{
    const response=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({service:select.value,pseudonym:document.querySelector('#alias').value,consent:document.querySelector('#consent').checked,contactPreference:'anonymous-information-only'})});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'The request could not be recorded.');
    result.textContent='Demo entry received. Reference: '+data.reference+'. '+data.message;
    form.reset();
  }catch(error){
    result.textContent=error.message==='Failed to fetch'?'Connection unavailable. Please try again later.':error.message;
  }finally{
    submit.disabled=false;
    submit.innerHTML='Submit demo request <span>↗</span>';
  }
});

const menuToggle=document.querySelector('#menuToggle');
const nav=document.querySelector('.top nav');
menuToggle.addEventListener('click',()=>{
  const open=nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded',String(open));
  menuToggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
});
nav.addEventListener('click',event=>{
  if(event.target.closest('a')){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}
});

let promptEvent;
const install=document.querySelector('#install');
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  promptEvent=event;
  install.hidden=false;
});
install.addEventListener('click',async()=>{
  if(!promptEvent)return;
  promptEvent.prompt();
  await promptEvent.userChoice;
  promptEvent=null;
  install.hidden=true;
});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
