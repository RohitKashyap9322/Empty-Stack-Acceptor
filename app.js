const $=s=>document.querySelector(s);
const input=$("#input"),start=$("#start"),language=$("#language"),stackEl=$("#stack"),trace=$("#trace");
let steps=[],pos=0,finalStack=[];
function resolveLanguage(){
 const raw=language.value.trim().toLowerCase().replace(/ⁿ/g,"^n").replace(/\s+/g,"");
 const aliases={"a^nb^n":"anbn","a^nb^n,n>=0":"anbn","a^nb^n(n>=0)":"anbn","a^nb^n,n>=1":"anbn1","a^nb^n(n>=1)":"anbn1","0^n1^n":"zeroone","0^n1^n,n>=0":"zeroone","0^n1^n(n>=0)":"zeroone","0^n1^n,n>=1":"zeroone1","0^n1^n(n>=1)":"zeroone1","balancedparentheses":"paren","parentheses":"paren","balanced()":"paren","()":"paren","(ab)*":"abstar","a*b*":"astarbstar","a+b+":"aplusbplus","(01)*":"zeronepair","(10)*":"onezeropair"};
 return aliases[raw]||null;
}
function initial(){return (start.value||"Z").slice(0,1).split("")}
function rules(){
 const kind=resolveLanguage();
 const all={
  anbn:[["a,Z","push a"],["a,a","push a"],["b,a","pop a"],["ε,Z","pop Z at final boundary"]],
  anbn1:[["a,Z","push a"],["a,a","push a"],["b,a","pop a"],["ε,Z","pop Z only after at least one pair"]],
  zeroone:[["0,Z","push 0"],["0,0","push 0"],["1,0","pop 0"],["ε,Z","pop Z at final boundary"]],
  zeroone1:[["0,Z","push 0"],["0,0","push 0"],["1,0","pop 0"],["ε,Z","pop Z only after at least one pair"]],
  paren:[["(,Z","push ("],["(,(","push ("],[ "),(","pop ("],["ε,Z","pop Z at final boundary"]],
  abstar:[["a,Z","keep stack"],["b,Z","keep stack"],["ε,Z","pop Z if input matches (ab)*"]],
  astarbstar:[["a,Z","keep stack before b's"],["b,Z","keep stack after a's"],["ε,Z","pop Z if input matches a*b*"]],
  aplusbplus:[["a,Z","keep stack in a+ block"],["b,Z","keep stack after a+ block"],["ε,Z","pop Z if both blocks are non-empty"]],
  zeronepair:[["0,Z","keep stack"],["1,Z","keep stack"],["ε,Z","pop Z if input matches (01)*"]],
  onezeropair:[["1,Z","keep stack"],["0,Z","keep stack"],["ε,Z","pop Z if input matches (10)*"]]
 };
 const data=all[kind]||[];
 $("#rules").innerHTML=data.map(r=>'<div class="rule"><b>'+r[0]+'</b> → '+r[1]+'</div>').join("");
}
function regularMatch(kind,s){
 if(kind==="abstar")return /^(ab)*$/.test(s);
 if(kind==="astarbstar")return /^a*b*$/.test(s);
 if(kind==="aplusbplus")return /^a+b+$/.test(s);
 if(kind==="zeronepair")return /^(01)*$/.test(s);
 if(kind==="onezeropair")return /^(10)*$/.test(s);
 return false;
}
function build(){
 steps=[];pos=0;finalStack=initial();
 const s=input.value,kind=resolveLanguage(),base=finalStack[0];
 if(!kind){steps.push({ch:"",before:finalStack.join(""),action:"Unknown language rule — use one of the supported notations",after:finalStack.join(""),ok:false});return}
 let phase="first",seenA=false,seenB=false,valid=true;
 const regular=["abstar","astarbstar","aplusbplus","zeronepair","onezeropair"].includes(kind);
 for(let i=0;i<s.length;i++){
  const ch=s[i],before=finalStack.join("");let action="",ok=true;
  if(kind==="anbn"||kind==="anbn1"||kind==="zeroone"||kind==="zeroone1"){
   const left=(kind==="anbn"||kind==="anbn1")?"a":"0",right=(kind==="anbn"||kind==="anbn1")?"b":"1";
   if(ch===left&&phase==="first"){finalStack.unshift(left);seenA=true;action="push "+left}
   else if(ch===right&&finalStack[0]===left){phase="second";finalStack.shift();seenB=true;action="pop "+left}
   else{action="reject — no transition";ok=false;valid=false}
  }else if(kind==="paren"){
   if(ch==="("){finalStack.unshift("(");action="push ("}
   else if(ch===")"&&finalStack[0]==="("){finalStack.shift();action="pop ("}
   else{action="reject — no transition";ok=false;valid=false}
  }else{
   const alphabet=(kind==="abstar"||kind==="astarbstar"||kind==="aplusbplus")?["a","b"]:(kind==="zeronepair"?["0","1"]:["1","0"]);
   if(!alphabet.includes(ch)){action="reject — symbol not in alphabet";ok=false;valid=false}
   else if((kind==="astarbstar"||kind==="aplusbplus")&&ch==="a"&&phase==="second"){action="reject — a cannot follow b";ok=false;valid=false}
   else{if((kind==="astarbstar"||kind==="aplusbplus")&&ch==="b")phase="second";if(kind==="aplusbplus"&&ch==="a")seenA=true;if(kind==="aplusbplus"&&ch==="b")seenB=true;action="keep stack"}
  }
  steps.push({ch:ch,before:before,action:action,after:finalStack.join(""),ok:ok});if(!ok)break;
 }
 if(valid&&regular&&!regularMatch(kind,s))valid=false;
 if(valid&&(kind==="anbn1"||kind==="zeroone1")&&(!seenA||!seenB))valid=false;
 if(valid&&finalStack.length===1&&finalStack[0]===base)steps.push({ch:"ε",before:base,action:"pop "+base+" at final boundary",after:"",ok:true});
}
function stackAt(n){if(n===0)return initial();return (steps[n-1]?steps[n-1].after:"").split("")}
function render(){
 const st=stackAt(pos);
 stackEl.innerHTML=st.length?st.map((x,i)=>'<div class="item '+(i===0?"top":"")+'>'+x+'</div>').join(""):'<div class="empty-stack">ε — stack is empty</div>';
 $("#remaining").textContent=input.value.slice(Math.min(pos,input.value.length))||"ε";
 $("#progress").style.width=(input.value.length?Math.min(100,pos/input.value.length*100):100)+"%";
 $("#count").textContent=pos+" step"+(pos===1?"":"s");
 trace.innerHTML=pos?steps.slice(0,pos).map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+x.ch+'</td><td><code>'+x.before+'</code></td><td>'+x.action+'</td><td><code>'+x.after+'</code></td></tr>').join(""):'<tr><td colspan="5" class="empty">Run validation to see the trace.</td></tr>';
 const finished=pos>=steps.length,accepted=finished&&steps.length>0&&steps[steps.length-1].after===""&&steps[steps.length-1].ch==="ε"&&steps.filter(x=>x.ch!=="ε"&&x.ch!=="").length===input.value.length;
 $("#status").textContent=finished?(accepted?"Accepted":"Rejected"):"Running";$("#status").className="pill "+(finished?(accepted?"ok":"no"):"");
 const result=$("#result");
 if(finished){result.className="result "+(accepted?"ok":"no");result.innerHTML='<h3>'+(accepted?"✓ Accepted by empty stack":"✕ Rejected")+'</h3><p>'+(accepted?"The complete input is consumed and the stack is empty at the final character boundary.":"The input does not match the typed language rule, or a required transition is unavailable.")+'</p>'}else result.className="result hidden";
}
function validate(){build();pos=steps.length;render()}
function next(){if(!steps.length)build();if(pos<steps.length)pos++;render()}
$("#validate").onclick=validate;$("#step").onclick=next;
$("#reset").onclick=function(){steps=[];pos=0;finalStack=[];$("#result").className="result hidden";$("#status").textContent="Ready";$("#status").className="pill";render()};
language.onchange=function(){rules();$("#reset").click()};language.onkeydown=function(e){if(e.key==="Enter")validate()};input.onkeydown=function(e){if(e.key==="Enter")validate()};
document.querySelectorAll("[data-x]").forEach(b=>{b.onclick=function(){input.value=b.dataset.x;validate()}});
rules();render();