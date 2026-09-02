
/* MithraQ data protection layer.
   Creates a separate IndexedDB snapshot before/while the existing app persists data.
   It does not modify or delete the application's existing records. */
(function(){
  "use strict";
  const DB="MithraQSafetyBackup";
  const STORE="snapshots";
  let dbp=null;

  function openDB(){
    if(dbp)return dbp;
    dbp=new Promise((resolve,reject)=>{
      const r=indexedDB.open(DB,1);
      r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"id"})};
      r.onsuccess=()=>resolve(r.result);
      r.onerror=()=>reject(r.error);
    });
    return dbp;
  }

  async function snapshot(reason){
    try{
      const data=(typeof d==="object"&&d)?structuredClone(d):null;
      if(!data)return;
      const db=await openDB();
      const tx=db.transaction(STORE,"readwrite");
      tx.objectStore(STORE).put({
        id:Date.now(),
        reason:reason||"auto",
        createdAt:new Date().toISOString(),
        data:data
      });
      /* Keep only the newest 5 safety snapshots. */
      tx.oncomplete=async()=>{
        try{
          const db2=await openDB(), t=db2.transaction(STORE,"readwrite"), s=t.objectStore(STORE);
          const keys=await new Promise((res,rej)=>{
            const q=s.getAllKeys(); q.onsuccess=()=>res(q.result); q.onerror=()=>rej(q.error);
          });
          keys.sort((a,b)=>a-b);
          keys.slice(0,-5).forEach(k=>s.delete(k));
        }catch(_){}
      };
    }catch(_){}
  }

  function install(){
    /* Snapshot the current data before the first UI session. */
    setTimeout(()=>snapshot("before-ui-session"),900);

    /* Protect data before the app's own persistence routine runs. */
    if(typeof window.mqPersist==="function" && !window.mqPersist.__mithraSafetyWrapped){
      const original=window.mqPersist;
      const wrapped=function(){
        snapshot("before-persist");
        return original.apply(this,arguments);
      };
      wrapped.__mithraSafetyWrapped=true;
      window.mqPersist=wrapped;
    }
    if(typeof window.save==="function" && !window.save.__mithraSafetyWrapped){
      const originalSave=window.save;
      const wrappedSave=function(){
        snapshot("before-save");
        return originalSave.apply(this,arguments);
      };
      wrappedSave.__mithraSafetyWrapped=true;
      window.save=wrappedSave;
    }

    /* Make a one-time marker so the user can see the protection layer is active. */
    try{localStorage.setItem("mithraq_data_protection","enabled");}catch(_){}
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
  window.mithraSafetySnapshot=snapshot;
})();
