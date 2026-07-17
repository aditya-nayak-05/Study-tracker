import{c as l,R as T,u as $,r as s,g as N,j as e}from"./index-9Yf-H3Dp.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M10 2v2",key:"7u0qdc"}],["path",{d:"M14 2v2",key:"6buw04"}],["path",{d:"M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1",key:"pwadti"}],["path",{d:"M6 2v2",key:"colzsn"}]],E=l("coffee",z);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["rect",{x:"14",y:"4",width:"4",height:"16",rx:"1",key:"zuxfzm"}],["rect",{x:"6",y:"4",width:"4",height:"16",rx:"1",key:"1okwgv"}]],L=l("pause",D);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=[["polygon",{points:"6 3 20 12 6 21 6 3",key:"1oa8hb"}]],B=l("play",W);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],H=l("rotate-ccw",q),F=T.memo(function({compact:t=!1}){const{state:d,dispatch:y,showToast:u}=$(),{pomodoroWork:o=25,pomodoroBreak:x=5}=d.settings,[r,f]=s.useState("work"),[h,v]=s.useState(o*60),[n,k]=s.useState(!1),[m,S]=s.useState(0),p=s.useRef(null),g=s.useRef(null),b=s.useRef(null),R=r==="work"?o*60:x*60,j=1-h/R,w=t?40:70,c=2*Math.PI*w;s.useEffect(()=>{g.current&&N.fromTo(g.current,{scale:.9,opacity:0},{scale:1,opacity:1,duration:.4,ease:"back.out(1.5)"})},[]),s.useEffect(()=>{p.current&&N.to(p.current,{strokeDashoffset:c*(1-j),duration:.5,ease:"power2.out"})},[j,c]),s.useEffect(()=>(n&&(b.current=setInterval(()=>{v(i=>i<=1?(clearInterval(b.current),k(!1),r==="work"?(S(I=>I+1),y({type:"LOG_STUDY_HOURS",payload:{hours:0,minutes:o,notes:"Pomodoro session",planId:d.ui.activePlanId}}),u("Pomodoro complete! Take a break 🎉","success"),f("break"),x*60):(u("Break over! Time to focus 💪","info"),f("work"),o*60)):i-1)},1e3)),()=>clearInterval(b.current)),[n,r,o,x,y,u,d.ui.activePlanId]);const P=s.useCallback(()=>k(i=>!i),[]),_=s.useCallback(()=>{k(!1),f("work"),v(o*60)},[o]),C=Math.floor(h/60),M=h%60,a=t?100:170;return e.jsxs("div",{ref:g,className:"flex flex-col items-center gap-3",children:[e.jsxs("div",{className:"relative",children:[e.jsxs("svg",{width:a,height:a,className:"-rotate-90",children:[e.jsx("circle",{cx:a/2,cy:a/2,r:w,fill:"none",stroke:"rgba(99,102,241,0.1)",strokeWidth:t?4:6}),e.jsx("circle",{ref:p,cx:a/2,cy:a/2,r:w,fill:"none",stroke:r==="work"?"#6366f1":"#34d399",strokeWidth:t?4:6,strokeLinecap:"round",strokeDasharray:c,strokeDashoffset:c,style:{filter:`drop-shadow(0 0 8px ${r==="work"?"rgba(99,102,241,0.4)":"rgba(52,211,153,0.4)"})`}})]}),e.jsxs("div",{className:"absolute inset-0 flex flex-col items-center justify-center",children:[e.jsxs("span",{className:`font-mono font-bold text-white ${t?"text-lg":"text-3xl"}`,children:[String(C).padStart(2,"0"),":",String(M).padStart(2,"0")]}),e.jsx("span",{className:`text-dark-300 capitalize ${t?"text-[10px]":"text-xs"}`,children:r==="work"?"Focus":"Break"})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:P,className:`p-2.5 rounded-xl cursor-pointer transition-all ${n?"bg-neon-amber/15 text-neon-amber hover:bg-neon-amber/25":"bg-brand-500/15 text-brand-400 hover:bg-brand-500/25"}`,children:n?e.jsx(L,{className:"w-4 h-4"}):e.jsx(B,{className:"w-4 h-4"})}),e.jsx("button",{onClick:_,className:"p-2.5 rounded-xl bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600 transition-all cursor-pointer",children:e.jsx(H,{className:"w-4 h-4"})})]}),!t&&m>0&&e.jsxs("p",{className:"text-[11px] text-dark-400 flex items-center gap-1",children:[e.jsx(E,{className:"w-3 h-3"})," ",m," session",m!==1?"s":""," today"]})]})});export{B as P,F as a};
