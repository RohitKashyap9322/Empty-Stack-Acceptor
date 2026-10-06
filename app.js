const $=s=>document.querySelector(s);
const input=$("#input"),start=$("#start"),mode=$("#mode"),stackEl=$("#stack"),trace=$("#trace");
let steps=[],pos=0,finalStack=[];
function rules(){
 const data=mode.value==="anbn"?[["a,Z","push a"],["a,a","push a"],["b,a","pop a"],["b,Z","reject"]]:[["(,Z","push ("],["(,(","push ("],[",,(","reject"],["),(","pop ("],["),Z","reject"]];
 $("#rules").innerHTML=data.map(function(r){return '<div class="rule"><b>'+r[0]+'</b> → '+r[1]+'</div>'}).join("");
}
function initial(){return (start.value||"Z").split("")}
function build(){
 steps=[];pos=0;finalStack=initial();const s=input.value;
 for(let i=0;i<s.length;i++){
  const ch=s[i],before=finalStack.join("");let action="",ok=true;
  if(mode.value==="anbn"){
   if(ch==="a"){finalStack.unshift("a");action="push a"}
   else if(ch==="b"&&finalStack[0]==="a"){finalStack.shift();action="pop a"}
   else{action="reject — no transition";ok=false}
  }else{
   if(ch==="("){finalStack.unshift("(");action="push ("}
   else if(ch===")"&&finalStack[0]==="("){finalStack.shift();action="pop ("}
   else{action="reject — no transition";ok=false}
  }
  steps.push({ch:ch,before:before,action:action,after:finalStack.join(""),ok:ok});if(!ok)break;
 }
 if(finalStack.length===1&&finalStack[0]==="Z") steps.push({ch:"ε",before:"Z",action:"pop Z at final boundary",after:"",ok:true});
}
function stackAt(n){if(n===0)return initial();return (steps[n-1]?steps[n-1].after:"").split("")}
function render(){
 const st=stackAt(pos);
 stackEl.innerHTML=st.length?st.map(function(x,i){return '<div class="item '+(i===0?"top":"")+'>'+x+'</div>'}).join(""):'<div class="empty-stack">ε — stack is empty</div>';
 $("#remaining").textContent=input.value.slice(pos)||"ε";$("#progress").style.width=(input.value.length?Math.min(100,pos/input.value.length*100):100)+"%";
 $("#count").textContent=pos+" step"+(pos===1?"":"s");
 trace.innerHTML=pos?steps.slice(0,pos).map(function(x,i){return '<tr><td>'+(i+1)+'</td><td>'+x.ch+'</td><td><code>'+x.before+'</code></td><td>'+x.action+'</td><td><code>'+x.after+'</code></td></tr>'}).join(""):'<tr><td colspan="5" class="empty">Run validation to see the trace.</td></tr>';
 const finished=pos>=steps.length,accepted=finished&&steps.length>0&&steps[steps.length-1].after===""&&steps[steps.length-1].ch==="ε"&&steps.filter(function(x){return x.ch!=="ε"}).length===input.value.length;
 $("#status").textContent=finished?(accepted?"Accepted":"Rejected"):"Running";$("#status").className="pill "+(finished?(accepted?"ok":"no"):"");
 const result=$("#result");
 if(finished){result.className="result "+(accepted?"ok":"no");result.innerHTML='<h3>'+(accepted?"✓ Accepted by empty stack":"✕ Rejected")+'</h3><p>'+(accepted?"The complete input is consumed and the stack is empty at the final character boundary.":"The input does not finish with an empty stack, or a required transition is unavailable.")+'</p>'}
 else result.className="result hidden";
}
function validate(){build();pos=steps.length;render()}
function next(){if(!steps.length)build();if(pos<steps.length)pos++;render()}
$("#validate").onclick=validate;$("#step").onclick=next;
$("#reset").onclick=function(){steps=[];pos=0;finalStack=[];$("#result").className="result hidden";$("#status").textContent="Ready";$("#status").className="pill";render()};
mode.onchange=function(){rules();$("#reset").click()};input.onkeydown=function(e){if(e.key==="Enter")validate()};
document.querySelectorAll("[data-x]").forEach(function(b){b.onclick=function(){input.value=b.dataset.x;validate()}});
rules();render();