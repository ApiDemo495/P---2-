const groups = [
  { place:'Kanthy · velar', tongue:'velar', sounds:[['क','k','k','voiceless unaspirated'],['ख','kʰ','kh','voiceless aspirated'],['ग','ɡ','g','voiced unaspirated'],['घ','ɡʱ','gh','voiced aspirated'],['ङ','ŋ','ng','voiced nasal']] },
  { place:'Taalavya · palatal', tongue:'palatal', sounds:[['च','t͡ʃ','ch','voiceless unaspirated'],['छ','t͡ʃʰ','chh','voiceless aspirated'],['ज','d͡ʒ','j','voiced unaspirated'],['झ','d͡ʒʱ','jh','voiced aspirated'],['ञ','ɲ','ny','voiced nasal']] },
  { place:'Moordhanya · retroflex', tongue:'retroflex', sounds:[['ट','ʈ','T','voiceless unaspirated'],['ठ','ʈʰ','Th','voiceless aspirated'],['ड','ɖ','D','voiced unaspirated'],['ढ','ɖʱ','Dh','voiced aspirated'],['ण','ɳ','N','voiced nasal']] },
  { place:'Dantya · dental', tongue:'dental', sounds:[['त','t̪','t','voiceless unaspirated'],['थ','t̪ʰ','th','voiceless aspirated'],['द','d̪','d','voiced unaspirated'],['ध','d̪ʱ','dh','voiced aspirated'],['न','n','n','voiced nasal']] },
  { place:'Oshthya · bilabial', tongue:'bilabial', sounds:[['प','p','p','voiceless unaspirated'],['फ','pʰ','ph','voiceless aspirated'],['ब','b','b','voiced unaspirated'],['भ','bʱ','bh','voiced aspirated'],['म','m','m','voiced nasal']] },
  { place:'Approximants & fricatives', tongue:'palatal', sounds:[['य','j','y','voiced approximant'],['र','ɾ','r','voiced tap'],['ल','l','l','voiced lateral'],['व','ʋ','v','voiced approximant'],['श','ʃ','sh','voiceless fricative'],['ष','ʂ','Sh','voiceless fricative'],['स','s','s','voiceless fricative'],['ह','ɦ','h','voiced fricative']] }
];
const vowelRows = [
  ['अ','ə','a','Kanthy · central','open'],['आ','aː','aa','Kanthy · open','open'],['इ','ɪ','i','Taalavya · front','spread'],['ई','iː','ee','Taalavya · front','spread'],['उ','ʊ','u','Oshthya · back','rounded'],['ऊ','uː','oo','Oshthya · back','rounded'],['ऋ','r̩','ri','Moordhanya · syllabic','neutral'],['ए','eː','e','Kanth-Taalavya · front','spread'],['ऐ','ɛː','ai','Kanth-Taalavya · open-front','spread'],['ओ','oː','o','Kanth-Oshthya · back','rounded'],['औ','ɔː','au','Kanth-Oshthya · open-back','rounded']
];
const matras = [['ा','आ'],['ि','इ'],['ी','ई'],['ु','उ'],['ू','ऊ'],['ृ','ऋ'],['े','ए'],['ै','ऐ'],['ो','ओ'],['ौ','औ'],['ॅ','ए'],['ॉ','ओ']];
const matraVowels = Object.fromEntries(matras);
export const modifiers = { 'ं':{name:'Anusvara',ipa:'̃',kind:'nasal',instruction:'Let the vowel resonate gently through your nose.'},'ँ':{name:'Chandrabindu',ipa:'̃',kind:'nasal',instruction:'Nasalize the vowel — soften and lower the velum.'},'ः':{name:'Visarga',ipa:'h',kind:'breath',instruction:'Finish with a light, breathy release.'},'्':{name:'Halant',ipa:'',kind:'halant',instruction:'Keep the first consonant held; do not release it separately.'} };
const keyframes = {
  dental:{tip:[.48,.45],body:[.56,.55],velum:'raised',lips:'neutral',jaw:.12}, alveolar:{tip:[.50,.42],body:[.56,.54],velum:'raised',lips:'neutral',jaw:.10}, retroflex:{tip:[.54,.38],body:[.58,.50],rotation:-30,velum:'raised',lips:'neutral',jaw:.12}, palatal:{tip:[.50,.38],body:[.52,.42],velum:'raised',lips:'spread',jaw:.12}, velar:{tip:[.55,.57],body:[.60,.40],velum:'raised',lips:'neutral',jaw:.14}, bilabial:{tip:[.56,.59],body:[.58,.57],velum:'raised',lips:'closed',jaw:.06}, open:{tip:[.55,.62],body:[.57,.60],velum:'raised',lips:'open',jaw:.34}, rounded:{tip:[.55,.61],body:[.59,.49],velum:'raised',lips:'rounded',jaw:.12}, neutral:{tip:[.55,.60],body:[.57,.56],velum:'raised',lips:'neutral',jaw:.16}
};
const instruction = {dental:'Touch your tongue tip lightly to the back of your upper teeth.',alveolar:'Place the tongue tip just behind your upper teeth.',retroflex:'Curl your tongue tip gently back toward the roof of your mouth.',palatal:'Raise the middle of your tongue toward the hard palate.',velar:'Lift the back of your tongue toward the soft palate.',bilabial:'Bring both lips together, then release gently.',open:'Let your jaw relax and open; keep the tongue easy.',rounded:'Round your lips softly and keep the back of the tongue raised.',neutral:'Keep your tongue relaxed and let the sound flow easily.'};
const hiInstruction={dental:'जीभ की नोक को ऊपर के दाँतों के पीछे हल्के से रखें।',retroflex:'जीभ की नोक को आराम से पीछे मोड़ें।',palatal:'जीभ के बीच के भाग को तालू की ओर उठाएँ।',velar:'जीभ के पिछले भाग को नरम तालू की ओर उठाएँ।',bilabial:'दोनों होंठ मिलाएँ और धीरे से छोड़ें।',open:'जबड़े को आराम से खोलें और जीभ सहज रखें।',rounded:'होंठों को धीरे से गोल करें।',neutral:'जीभ को सहज रखें और ध्वनि को आसानी से निकलने दें।'};
const data = {};
for (const group of groups) for (const [char,ipa,roman,manner] of group.sounds) {
  const voiced = !manner.startsWith('voiceless');
  data[char]={char,ipa,roman,place:group.place,tongue:group.tongue,manner,voiced,aspirated:manner.includes('aspirated'),targets:keyframes[group.tongue]||keyframes.neutral,instruction:instruction[group.tongue]||instruction.neutral,instructionHi:hiInstruction[group.tongue]||hiInstruction.neutral};
}
for (const [char,ipa,roman,place,lips] of vowelRows) {
  const tongue=place.includes('Oshthya')||place.includes('Oshthya')&&char==='आ'?'rounded':(['आ','अ','ऐ','औ'].includes(char)?'open':place.includes('Taalavya')?'palatal':'neutral');
  data[char]={char,ipa,roman,place,tongue,manner:'vowel',voiced:true,aspirated:false,targets:{...keyframes[tongue],lips: lips==='rounded'?'rounded':lips==='spread'?'spread':'open',jaw:['आ','अ','ऐ','औ'].includes(char)?.34:char==='ए'||char==='ओ'?.2:.12},instruction:char==='आ'||char==='अ'?'Open your jaw comfortably and sustain the vowel.':char==='उ'||char==='ऊ'||char==='ओ'||char==='औ'?'Round your lips gently; keep the sound relaxed.':'Let the tongue stay easy and shape the vowel with your lips.',instructionHi:'स्वर को सहजता से और आराम से बोलें।'};
}
const nuktaSounds={'क़':['q','Kanthy · uvular','velar'],'ख़':['x','Kanthy · uvular','velar'],'ग़':['ɣ','Kanthy · uvular','velar'],'ज़':['z','Taalavya · fricative','palatal'],'ड़':['ɽ','Moordhanya · retroflex flap','retroflex'],'ढ़':['ɽʱ','Moordhanya · retroflex flap','retroflex'],'फ़':['f','Dant-Oshthya · labiodental','neutral']};
for(const [char,[ipa,place,tongue]] of Object.entries(nuktaSounds))data[char]={char,ipa,roman:'',place,tongue,manner:'voiced fricative',voiced:true,aspirated:false,targets:keyframes[tongue]||keyframes.neutral,instruction:instruction[tongue]||instruction.neutral,instructionHi:hiInstruction[tongue]||hiInstruction.neutral};
export const phonemeData=data;
export const vowelData=vowelRows.map(([char])=>data[char]);
export const matraMap=matraVowels;
export const nasalChars=new Set(['ङ','ञ','ण','न','म']);
export const conjuncts={'क्ष':['क','्','ष'],'त्र':['त','्','र'],'ज्ञ':['ज','्','ञ'],'श्र':['श','्','र']};

const latinMap={ksh:'क्ष',shr:'श्र',tra:'त्र',tr:'त्र',gy:'ज्ञ',kh:'ख',gh:'घ',chh:'छ',ch:'च',jh:'झ',Th:'ठ',th:'थ',Dh:'ढ',dh:'ध',ph:'फ',bh:'भ',Sh:'ष',sh:'श',q:'क़',x:'ख़',z:'ज़',aa:'आ',ā:'आ',ee:'ई',ī:'ई',ii:'ई',oo:'ऊ',ū:'ऊ',uu:'ऊ',ai:'ऐ',au:'औ',ri:'ऋ',ng:'ङ',ny:'ञ',k:'क',g:'ग',j:'ज',T:'ट',D:'ड',N:'ण',t:'त',d:'द',n:'न',p:'प',f:'फ',b:'ब',m:'म',y:'य',r:'र',l:'ल',v:'व',w:'व',s:'स',h:'ह',a:'अ',i:'इ',u:'उ',e:'ए',o:'ओ'};
const latinKeys=Object.keys(latinMap).sort((a,b)=>b.length-a.length);
export function transliterateLatin(input){
  const src=input.trim();const lexicon={paani:'पानी',pani:'पानी',trikon:'त्रिकोण',ghadi:'घड़ी',kshama:'क्षमा',shraddha:'श्रद्धा',dhanyavaad:'धन्यवाद',khana:'खाना'};if(lexicon[src.toLowerCase()])return lexicon[src.toLowerCase()];let out='',i=0,lastConsonant=false;
  const vowelKeys=new Set(['a','aa','ā','i','ee','ī','ii','u','oo','ū','uu','e','ai','o','au','ri']);
  const vowelToMatra={a:'',aa:'ा','ā':'ा',i:'ि',ee:'ी','ī':'ी',ii:'ी',u:'ु',oo:'ू','ū':'ू',uu:'ू',e:'े',ai:'ै',o:'ो',au:'ौ',ri:'ृ'};
  const vowelIndependent={a:'अ',aa:'आ','ā':'आ',i:'इ',ee:'ई','ī':'ई',ii:'ई',u:'उ',oo:'ऊ','ū':'ऊ',uu:'ऊ',e:'ए',ai:'ऐ',o:'ओ',au:'औ',ri:'ऋ'};
  while(i<src.length){const ch=src[i];if(!/[A-Za-zāīū]/.test(ch)){out+=ch;i++;lastConsonant=false;continue;}
    const rest=src.slice(i);let key=latinKeys.find(k=>rest.startsWith(k));if(!key){const lower=rest.toLowerCase();key=latinKeys.find(k=>k.toLowerCase()===lower.slice(0,k.length));}
    if(!key){out+=ch;i++;lastConsonant=false;continue;}
    let mapped=latinMap[key];
    if(vowelKeys.has(key)){
      if(lastConsonant){mapped=vowelToMatra[key];}
      else mapped=vowelIndependent[key]||mapped;
      lastConsonant=false;
    }else{
      if(lastConsonant)out+='्';
      lastConsonant=true;
    }
    out+=mapped;i+=key.length;
  }
  return out;
}
function info(char){if(data[char])return data[char];if(matraVowels[char])return {...data[matraVowels[char]],char,matra:true,baseVowel:matraVowels[char]};if(modifiers[char])return {char,ipa:modifiers[char].ipa,place:modifiers[char].name,tongue:'neutral',manner:modifiers[char].kind,voiced:false,aspirated:false,targets:keyframes.neutral,instruction:modifiers[char].instruction,instructionHi:'ध्वनि को धीरे और सहजता से जोड़ें।',modifier:true};return {char,ipa:'',place:'Sound',tongue:'neutral',manner:'other',voiced:false,aspirated:false,targets:keyframes.neutral,instruction:'Notice the shape and let the sound flow.',instructionHi:'ध्वनि को सहजता से बोलें।'};}
export function decomposeWord(raw){
  const text=/[\u0900-\u097f]/.test(raw)?raw:transliterateLatin(raw);
  const chars=Array.from(text.normalize('NFC'));const tokens=[];
  for(let i=0;i<chars.length;i++){
    let ch=chars[i];
    if(/\s/.test(ch)||/[।,!?؛]/.test(ch)){tokens.push({char:ch,ipa:'',place:'Pause',tongue:'neutral',targets:keyframes.neutral,instruction:'Take a gentle pause.',manner:'pause'});continue;}
    if(!/[\u0900-\u097f]/.test(ch)){continue;}
    if(chars[i+1]==='़'){const combined=ch+'़';if(data[combined]){tokens.push({...data[combined],display:combined});i++;continue;}}
    let item=info(ch);
    // Devanagari consonant + matra is one syllable tile, while keeping vowel as a separate playable phase.
    if(data[ch]&&item.manner!=='vowel'&&chars[i+1]&&matraVowels[chars[i+1]]){
      const matra=chars[i+1],v=info(matra);tokens.push({...item,display:ch,baseChar:ch,syllable:true});tokens.push({...v,char:matra,display:matra,matra:true});i++;continue;
    }
    if(data[ch]&&item.manner!=='vowel'&&(!chars[i+1]||(!matraVowels[chars[i+1]]&&chars[i+1]!=='्'&&!['ं','ँ','ः'].includes(chars[i+1])))){item={...item,implicitVowel:true};}
    tokens.push({...item,display:ch});
  }
  // Conjunct markers indicate a held transition rather than a released sound.
  return tokens.map((token,index)=>({...token,index,held:token.char==='्'||tokens[index+1]?.char==='्'}));
}
