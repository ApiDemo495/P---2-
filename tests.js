import assert from 'node:assert/strict';
import {decomposeWord,transliterateLatin} from './phonemeData.js';

const samples=['कमल','पानी','नमस्ते','क्षमा','श्रद्धा','त्रिकोण','ज्ञान','आम','खग','घड़ी','छाता','झरना','टमाटर','ढोल','ण','थाली','दादी','पुस्तक','वायु','संस्कृति','कक्षा','मित्र','प्रार्थना','औषधि'];
for(const word of samples){const result=decomposeWord(word);assert.ok(result.length>0,`decomposes ${word}`);assert.ok(result.some(x=>x.char),`has a sound for ${word}`);}
assert.equal(transliterateLatin('kamal'),'कमल');
assert.equal(transliterateLatin('paani'),'पानी');
assert.equal(transliterateLatin('kshama'),'क्षमा');
assert.equal(transliterateLatin('namaste'),'नमस्ते');
assert.equal(transliterateLatin('trikoN'),'त्रिकोण');
assert.ok(decomposeWord('क्ष').some(x=>x.char==='्'),'preserves halant for conjuncts');
assert.ok(decomposeWord('चाँद').some(x=>x.char==='ँ'),'recognizes chandrabindu');
assert.ok(decomposeWord('हः').some(x=>x.manner==='breath'),'recognizes visarga');
assert.ok(decomposeWord('पानी').some(x=>x.matra&&x.char==='ा'),'separates dependent vowel signs for coaching');
console.log(`Passed ${samples.length} Hindi word decomposition cases and transliteration/modifier checks.`);

globalThis.matchMedia=()=>({matches:false});
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
const {defaults,recordArticulation,recordVoice,syncDay,reconcileStreak,localDate}=await import('./gamification.js');
const state=defaults();
recordArticulation(state,'कमल',decomposeWord('कमल'),false);
assert.equal(state.progressData.articulationToday,false,'articulation needs a self-report');
state.progressData.articulationToday=true;recordVoice(state,'breathing');
assert.equal(syncDay(state),true,'both categories complete the daily goal');
assert.equal(state.streakData.current,1);
assert.equal(syncDay(state),false,'same-day completion is not counted twice');
assert.equal(state.streakData.current,1);
const recovery=defaults(),today=new Date(),last=new Date();last.setDate(today.getDate()-3);recovery.streakData={...recovery.streakData,current:5,best:5,freezeTokens:2,lastCompletedDate:(()=>{const d=new Date(last.getTime()-last.getTimezoneOffset()*60000);return d.toISOString().slice(0,10)})(),calendar:{}};recovery.progressData.articulationToday=true;recovery.progressData.voiceToday=true;reconcileStreak(recovery);assert.equal(Object.values(recovery.streakData.calendar).filter(x=>x==='rest').length,2,'rest tokens auto-apply while the app opens');assert.equal(syncDay(recovery),true);assert.equal(recovery.streakData.current,6,'two freezes bridge two missed local calendar days');assert.equal(recovery.streakData.freezeTokens,0);assert.equal(Object.values(recovery.streakData.calendar).filter(x=>x==='rest').length,2);
process.env.TZ='America/New_York';const springBefore=new Date(2026,2,8,1,59),springAfter=new Date(springBefore.getTime()+2*60*1000);assert.equal(localDate(springBefore),localDate(springAfter),'spring-forward keeps the local calendar date stable');const dstRecovery=defaults();dstRecovery.streakData={...dstRecovery.streakData,current:6,best:6,freezeTokens:1,lastCompletedDate:'2026-03-07',calendar:{}};dstRecovery.progressData.articulationToday=true;dstRecovery.progressData.voiceToday=true;assert.equal(syncDay(dstRecovery,new Date(2026,2,9,12)),true,'streak recovery crosses spring-forward by calendar days');assert.equal(dstRecovery.streakData.current,7);assert.equal(dstRecovery.streakData.calendar['2026-03-08'],'rest');
console.log('Passed daily goal, self-report gating, duplicate completion, multi-day freeze recovery, and DST/local-date checks.');
