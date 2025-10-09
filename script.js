/* === OUTILS GÉNÉRAUX === */
function toText(id){const e=document.getElementById(id);return e?e.value.trim():"";}
function toggleBlock(h){const b=h.nextElementSibling;b.style.display=b.style.display==="none"?"block":"none";}
function deleteBlock(e,btn){e.stopPropagation();btn.closest('.dynamic-block').remove();}
function getFallbackLogo(){return `<svg class="logo" viewBox='0 0 200 140'><rect width='66.6' height='140' fill='#0055A4'/><rect x='66.6' width='66.6' height='140' fill='#fff'/><rect x='133.2' width='66.8' height='140' fill='#EF4135'/></svg>`;}

/* === BLOCS DYNAMIQUES === */
let assistantCount=1, esiCount=1;

function addAssistant(){
  assistantCount++;
  const c=document.getElementById('assistantsContainer');
  const b=document.createElement('div');
  b.className='assistant-block dynamic-block';
  b.innerHTML=`<div class='block-header' onclick='toggleBlock(this)'>
    <span>👮 Assistant ${assistantCount}</span>
    <button class='delete-btn' onclick='deleteBlock(event,this)'>🗑️</button>
  </div>
  <div class='block-body'>
    <div class='grid4'>
      <input class='assistantGrade' placeholder='Grade'>
      <input class='assistantNom' placeholder='Nom'>
      <input class='assistantPrenom' placeholder='Prénom'>
      <input class='assistantQual' placeholder='Qualité (APJA, APJ...)'>
    </div>
  </div>`;
  c.appendChild(b);
}

function addESI(){
  esiCount++;
  const c=document.getElementById('esiContainer');
  const b=document.createElement('div');
  b.className='esi-block dynamic-block';
  b.innerHTML=`<div class='block-header' onclick='toggleBlock(this)'>
    <span>👤 ESI ${esiCount}</span>
    <button class='delete-btn' onclick='deleteBlock(event,this)'>🗑️</button>
  </div>
  <div class='block-body'>
    <div class='grid6'>
      <input class='esiNom' placeholder='Nom complet'>
      <input class='esiNaiss' type='date' placeholder='Naissance'>
      <input class='esiNat' placeholder='Nationalité'>
      <select class='esiSexe'>
        <option value=''>Sexe</option>
        <option value='M'>Masculin</option>
        <option value='F'>Féminin</option>
      </select>
      <input class='esiDoc' placeholder='Document (passeport, aucun...)'>
      <input class='esiStatut' placeholder='Statut (valide, périmé, sans visa...)'>
    </div>
  </div>`;
  c.appendChild(b);
}

/* === DATE EN LETTRES === */
function dateFrLitterale(dateStr,heureStr){
  if(!dateStr) return "";
  const d=new Date(dateStr+"T12:00:00");
  const mois=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][d.getMonth()];
  const j=d.getDate(), a=d.getFullYear();
  const anTxt={2024:"deux mille vingt-quatre",2025:"deux mille vingt-cinq",2026:"deux mille vingt-six"}[a]||`deux mille ${a-2000}`;
  let heureTxt="";
  if(heureStr){const[h,m]=(heureStr||"").split(":");heureTxt=` à ${parseInt(h)}h${m?m:""}`;}
  return`L’an ${anTxt}, le ${j} ${mois}${heureTxt}`;
}

/* === GÉNÉRATION DU PV === */
function generatePV(){
  const grade=toText('agentGrade'), nom=toText('agentNom'), qual=toText('agentQual'),
  datepv=toText('datepv'), hRedac=toText('heureRedac'), lieu=toText('lieu'),
  hCtrl=toText('heureControle'), hPAF=toText('heureContactPAF'), hDep=toText('heureDepart'),
  hRem=toText('heureRemise'), veh=toText('vehicule'), marq=toText('marque'),
  imm=toText('immat'), paf=toText('pafLieu');

  const assistants=[...document.querySelectorAll('.assistant-block')].map(b=>{
    const g=b.querySelector('.assistantGrade')?.value.trim(),
    n=b.querySelector('.assistantNom')?.value.trim(),
    p=b.querySelector('.assistantPrenom')?.value.trim(),
    q=b.querySelector('.assistantQual')?.value.trim();
    return(g||n||p||q)?`${g||""} ${n||""} ${p||""}, ${q||""}`.replace(/\s+,/g,",").trim():null;
  }).filter(Boolean);

  const esiList=[...document.querySelectorAll('.esi-block')].map(b=>({
    nom:b.querySelector('.esiNom')?.value.trim(),
    naiss:b.querySelector('.esiNaiss')?.value.trim(),
    nat:b.querySelector('.esiNat')?.value.trim(),
    sexe:b.querySelector('.esiSexe')?.value,
    doc:b.querySelector('.esiDoc')?.value.trim(),
    statut:b.querySelector('.esiStatut')?.value.trim()
  })).filter(e=>e.nom);

  const nb=esiList.length, pluriel=nb>1;

  let html=`<p>Nous, ${grade} ${nom}, militaire de la gendarmerie nationale, agissant en qualité d’${qual||"agent de police judiciaire adjoint"}, revêtu de notre uniforme réglementaire et porteur de nos insignes distinctifs de fonction, conformément aux articles 20, 21-1 et 21-2 du code de procédure pénale`;
  if(assistants.length) html+=`, assisté${assistants.length>1?"s":""} de ${assistants.join("; ")}`;
  html+=`, avons rédigé le présent procès-verbal.</p>`;

  html+=`<p>${dateFrLitterale(datepv,hRedac)}, alors que nous étions engagés dans un dispositif de contrôle fixe de la circulation, mis en place dans le cadre de la lutte contre l’immigration irrégulière, nous avons procédé au contrôle du véhicule ${veh} ${marq} immatriculé ${imm}, circulant sur ${lieu}.</p>`;
  html+=`<p>Le contrôle a débuté à ${hCtrl||"—"}.</p>`;

  if(nb){
    html+=`<h3>Lors de la vérification d’identité ${pluriel?"des individus":"de l’individu"} :</h3>`;
    esiList.forEach(e=>{
      let genre="L’intéressé(e)"; if(e.sexe==="F") genre="L’intéressée"; else if(e.sexe==="M") genre="L’intéressé";
      let naissTxt=""; if(e.naiss){const d=new Date(e.naiss); naissTxt=`né${e.sexe==="F"?"e":""} le ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;}
      const nomnat = `${e.nom||""}${naissTxt?`, ${naissTxt}`:""}${e.nat?`, de nationalité ${e.nat}`:""}`;
      const line = (e.doc && e.doc.toLowerCase()!=="aucun") ?
        `${genre} ${nomnat}, a présenté ${e.doc.toLowerCase()}${e.statut?`, ${e.statut}`:""}.` :
        `${genre} ${nomnat}, n’a présenté aucun document d’identité.`;
      html+=`<p>${line}</p>`;
    });
  }

  // accords finaux
  let ref="intéressé", quPronom="qu’il", condu="conduit", remis="remis", entendu="entendu", droit="son";
  if(nb===1 && esiList[0]?.sexe==="F"){ref="intéressée"; quPronom="qu’elle"; condu="conduite"; remis="remise"; entendu="entendue";}
  else if(pluriel){ref="intéressés"; quPronom="qu’ils"; condu="conduits"; remis="remis"; entendu="entendus"; droit="leur";}

  html+=`
  <p>Après en avoir immédiatement rendu compte à notre hiérarchie, celle-ci nous a mis en relation avec l’officier de police judiciaire de la Police aux Frontières (PAF) territorialement compétent, contacté à ${hPAF||"—"}.</p>
  <p>Ce dernier, après examen des situations administratives respectives de ${nb>1?"des "+ref:"l’"+ref}, a décidé ${quPronom} devait être ${condu} à la brigade de la PAF de ${paf||"—"} afin d’y être ${entendu} et de faire l’objet des vérifications administratives relatives à ${droit} droit au séjour.</p>
  <p>Le départ du lieu de contrôle a eu lieu à ${hDep||"—"}, et nous sommes arrivés à la brigade de la PAF à ${hRem||"—"}, où ${nb>1?"les "+ref+" ont été "+remis:"l’"+ref+" a été "+remis} à l’officier de police judiciaire de service.</p>
  <p>Le présent procès-verbal est dressé pour rendre compte de l’interpellation administrative ${pluriel?"des "+ref:"de l’"+ref} et de ${pluriel?"leur":"son"} remise à l’autorité compétente.</p>`;

  // signatures
  const assistantsText = assistants.length>1?"Les assistants":assistants.length===1?"L’assistant":"L’assistant";
  html+=`
  <br><br><br>
  <table style="width:100%;text-align:center;font-weight:600;">
    <tr><td>L’Officier de Police Judiciaire</td><td>Le rédacteur</td><td>${assistantsText}</td></tr>
    <tr><td colspan="3" style="height:70px;"></td></tr>
  </table>`;

  document.getElementById('sheet').innerHTML=html;

  // noms ESI colonne gauche
  const leftNames=esiList.map(e=>{
    const date=e.naiss?new Date(e.naiss):null;
    const dn=date?` (${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()})`:"";
    return `${e.nom||""}${dn}`;
  }).join("<br>");
  document.getElementById("esiListLeft").innerHTML=leftNames;

  // sauvegarde
  const savedPV={id:Date.now(),date:new Date().toLocaleString("fr-FR"),redacteur:nom,contenu:html};
  const pvList=JSON.parse(localStorage.getItem("pv_list")||"[]"); pvList.push(savedPV);
  localStorage.setItem("pv_list",JSON.stringify(pvList)); displaySavedPV();
}

/* === GESTION DES PV SAUVEGARDÉS === */
function displaySavedPV(){
  const list=JSON.parse(localStorage.getItem("pv_list")||"[]");
  const el=document.getElementById("savedPVList");
  if(!el)return;
  if(!list.length){el.innerHTML="<p style='color:#555;'>Aucun PV sauvegardé.</p>";return;}
  el.innerHTML=list.map(pv=>`
  <div style="border:1px solid #ccc;border-radius:8px;padding:10px;margin:8px 0;background:#f9fafb;">
    <b>${pv.redacteur||"Rédacteur inconnu"}</b> — <small>${pv.date}</small><br>
    <button class='btn' onclick='loadPV(${pv.id})'>📄 Ouvrir</button>
    <button class='btn btn-danger' onclick='deletePV(${pv.id})'>🗑️ Supprimer</button>
  </div>`).join("");
}
function loadPV(id){
  const list=JSON.parse(localStorage.getItem("pv_list")||"[]");
  const pv=list.find(x=>x.id===id); if(!pv) return alert("PV introuvable.");
  document.getElementById('sheet').innerHTML=pv.contenu;
  window.scrollTo({top:0,behavior:"smooth"});
}
function deletePV(id){
  if(!confirm("Supprimer ce PV ?"))return;
  let list=JSON.parse(localStorage.getItem("pv_list")||"[]");
  list=list.filter(x=>x.id!==id);
  localStorage.setItem("pv_list",JSON.stringify(list)); displaySavedPV();
}
function clearAllPV(){
  if(!confirm("Tout effacer ?"))return;
  localStorage.removeItem("pv_list"); displaySavedPV();
}
window.addEventListener("DOMContentLoaded",displaySavedPV);

/* === PDF === */
async function saveAsPDF() {
  const elem = document.querySelector('.paper');
  const firstESI = document.querySelector('.esiNom')?.value.trim() || "PV";
  const filename = `PV_${firstESI}.pdf`;

  // S'assurer que le PV est généré
  if (!document.getElementById('sheet').innerText.trim()) {
    alert("⚠️ Générez d'abord le PV avant de l'enregistrer en PDF !");
    return;
  }

  // Temporisation pour que le DOM soit bien stable
  await new Promise(r => setTimeout(r, 400));

  // Duplication propre du contenu dans une div invisible pour éviter flex/overflow
  const clone = elem.cloneNode(true);
  clone.style.position = "absolute";
  clone.style.left = "-9999px";
  clone.style.top = "0";
  clone.style.width = "210mm";
  clone.style.background = "#fff";
  document.body.appendChild(clone);

  const opt = {
    margin: [10, 12, 10, 12],
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(clone).save();
  } catch (err) {
    console.error("Erreur PDF:", err);
    alert("Une erreur est survenue pendant la génération du PDF.");
  }

  clone.remove();
}


/* === MAIL === */
async function shareByEmail(){
  try{
    const elem=document.querySelector('.paper');
    const firstESI=document.querySelector('.esiNom')?.value.trim()||"PV";
    const filename=`PV_${firstESI}.pdf`;
    const worker=html2pdf().set({
      margin:[10,12,10,12],
      html2canvas:{scale:2,useCORS:true},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
    }).from(elem).toPdf();
    const pdf=await worker.get('pdf');
    const blob=pdf.output('blob');
    const file=new File([blob],filename,{type:'application/pdf'});
    if(navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:'PV d’interpellation',text:'PV en pièce jointe.'});
      return;
    }
  }catch(e){}
  const subject=encodeURIComponent("PV d’interpellation administrative");
  const body=encodeURIComponent(document.getElementById('sheet').innerText);
  location.href=`mailto:?subject=${subject}&body=${body}`;
}

/* === SERVICE WORKER === */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
