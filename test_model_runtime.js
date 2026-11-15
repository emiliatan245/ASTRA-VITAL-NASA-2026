const fs = require('fs'); const vm = require('vm');
const ctx={window:{}}; vm.createContext(ctx); vm.runInContext(fs.readFileSync('model.js','utf8'),ctx);
const m=ctx.window.ASTRA_MODEL;
function predict(x){const sums=[0,0,0];for(const tree of m.trees){let i=0,guard=0;while(tree[i]&&tree[i].f>=0&&guard++<100){const n=tree[i];i=x[n.f]<=n.t?n.l:n.r;}tree[i].p.forEach((v,j)=>sums[j]+=v);}const p=sums.map(x=>x/m.trees.length);const ix=p.indexOf(Math.max(...p));return {label:m.meta.classes[ix],p};}
const cases={routine:[67,98.4,15,36.7,7.8,2,4,0,0,0],mixed:[104,93.8,24,37.4,5.7,4,2,1,0,1],priority:[132,86,32,39,3.2,5,1,1,1,1]};
for(const [k,v] of Object.entries(cases)){const out=predict(v);console.log(k,out.label,out.p.map(x=>x.toFixed(3)).join(','));}
console.log('metrics',m.meta.test_accuracy,m.meta.test_macro_f1,'trees',m.trees.length,'features',m.meta.features.length);
if(m.trees.length!==51||m.meta.features.length!==10)process.exit(2);
