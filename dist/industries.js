const section=(id,n,title,body)=>`<section class="research-section" id="${id}"><div class="research-kicker">${n}</div><h2>${title}</h2>${body}</section>`;
const table=(heads,rows)=>`<div class="research-table" tabindex="0" role="region" aria-label="${heads.join(', ')}"><table><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>i?`<td>${v}</td>`:`<th scope="row">${v}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const note=t=>`<aside class="research-note">${t}</aside>`;

// Scores are Bagel Bros judgment calls under the rubric below, assuming zero launch cost.
// [industry, sector, L, P, D, E, M, R, U, tier, spotlight]
const SCORES=[
 ['A. Pharma & biologics','Health',2,2,2,1,1,1,2,'1',true],
 ['B. Cell & tissue','Health',2,2,2,1,1,0,2,'1',true],
 ['ZBLAN optical fiber','Materials',2,2,2,0,1,2,1,'1'],
 ['Return / reentry logistics','Transport',2,2,2,1,1,1,1,'1'],
 ['Hypersonic testing as a service','Defense',2,2,2,1,2,1,0,'1'],
 ['Semiconductor crystals','Materials',2,1,1,0,1,2,2,'1'],
 ['Space tourism','Habitation',1,2,2,1,2,1,1,'2'],
 ['Commercial stations','Platform',1,2,1,0,1,1,2,'2'],
 ['Debris removal','Sustainability',2,2,1,0,1,1,1,'2'],
 ['Orbital data centers','Computing',1,1,1,0,1,1,2,'2'],
 ['Space solar power','Energy',1,1,1,0,1,1,2,'2'],
 ['Servicing & assembly','Infrastructure',1,2,1,0,1,1,1,'2'],
 ['Point-to-point cargo','Transport',1,2,1,0,1,1,1,'2'],
 ['Orbital power grid','Energy',1,2,1,0,1,0,1,'2'],
 ['Mining for Earth sale','Resources',1,2,0,0,1,1,2,'3a'],
 ['Point-to-point passengers','Transport',1,2,0,0,0,0,2,'3a'],
 ['Bulk metals & alloys','Materials',1,0,0,0,0,1,1,'3a'],
 ['Water & propellant mining','Resources',0,2,1,0,1,1,1,'3b'],
 ['Space agriculture (crews)','Food',0,1,2,0,1,1,1,'3b']
];
const CRITERIA=[['L','Launch-proof'],['P','Space-specific advantage'],['D','Demonstrated in orbit'],['E','Non-launch economics'],['M','Paying customer'],['R','Regulatory path'],['U','Upside']];

function matrixTable(){
  const head=`<tr><th scope="col">Industry</th><th scope="col">Sector</th>${CRITERIA.map(([k,l])=>`<th scope="col" class="num"><abbr title="${l}">${k}</abbr></th>`).join('')}<th scope="col" class="num">Total</th><th scope="col" class="num">Tier</th></tr>`;
  const body=SCORES.map((r,i)=>{
    const [name,sector,...rest]=r, spot=r[10], tier=r[9];
    const scores=rest.slice(0,7), total=scores.reduce((a,b)=>a+b,0);
    const brk=SCORES[i+1]&&SCORES[i+1][9]!==tier?' band-break':'';
    return `<tr class="${spot?'spot':''}${brk}"><th scope="row">${name}</th><td>${sector}</td>${scores.map(s=>`<td class="sc sc${s}">${s}</td>`).join('')}<td class="total">${total}</td><td class="tiercell"><span class="tier-pill p${tier}">${tier}</span></td></tr>`;
  }).join('');
  return `<div class="score-matrix" tabindex="0" role="region" aria-label="Industry feasibility scoring matrix"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}

const TIERS=[
 ['t0','0','Baseline','Already real. Falling launch cost is what unlocked it.',['Communications & broadband','GNSS / navigation','Earth observation & GIS','Orbital logistics & ground services']],
 ['t1','1','Next','Launch-proof and already flying. What remains is science, regulation and return.',[['A. Pharma & biologics',1],['B. Cell & tissue',1],'ZBLAN optical fiber','Return / reentry logistics','Hypersonic testing','Semiconductor crystals']],
 ['t2','2','Open, not solved','Free launch helps, but heat, repair, safety, schedule or a missing payer gates it.',['Space tourism','Commercial stations','Debris removal','Orbital data centers','Space solar power','Servicing & assembly','Point-to-point cargo','Orbital power grid']],
 ['t3a','3a','Blocked','Free launch cannot fix the real problem.',['Mining for Earth sale','Point-to-point passengers','Bulk metals & alloys']],
 ['t3b','3b','Killed','The value was avoiding launch. Remove the launch cost and the business case goes with it.',['Water & propellant mining','Space agriculture for crews']]
];
const tierList=()=>`<div class="tier-list">${TIERS.map(([cls,id,name,meaning,items])=>
 `<div class="tier-row ${cls}"><div><span class="tier-id">TIER ${id}</span><span class="tier-name">${name}</span><span class="tier-meaning">${meaning}</span></div><div class="tier-chips">${items.map(x=>Array.isArray(x)?`<span class="chip star">★ ${x[0]}</span>`:`<span class="chip">${x}</span>`).join('')}</div></div>`).join('')}</div>`;

export function industries(){return `<article class="research-walkthrough industry-walkthrough">`+

section('premise','QUESTION 1 · THE QUESTION','What opens when launch is free?',`
<p class="research-deck">Tomorrow, launching mass to orbit becomes effectively free. What industries become possible, and which still don’t make sense?</p>
<p>Free launch removes one line from the budget. The hardware, the operations, the trip home, the regulator and the customer all still cost what they cost today. So we took the hypothetical literally, set the price of mass to low Earth orbit to zero, held everything else at today’s prices, and asked what still blocks each industry.</p>
<h3>How the scoring works</h3>
<p>We scored nineteen industries on seven criteria, each from 0 to 2. The scores are our judgment, made against the rubric below.</p>
<div class="rubric-legend">${CRITERIA.map(([k,l])=>`<div><b>${k}</b><span>${l}</span></div>`).join('')}</div>
<details class="research-details"><summary>What 0, 1 and 2 mean <b>+</b></summary>
${table(['Criterion','0','1','2'],[
 ['L · Launch-proof','The value was avoiding launch','Free launch helps but doesn’t settle it','The case doesn’t depend on launch cost'],
 ['P · Space-specific advantage','An Earth substitute exists','Partial advantage','Can’t be done on Earth'],
 ['D · Demonstrated in orbit','None','Partial','Process or product shown'],
 ['E · Non-launch economics','Not shown','Plausible','Paid work covers cost'],
 ['M · Paying customer','None','Deals or contracts','Recurring revenue'],
 ['R · Regulatory / legal path','Absent or blocked','Partial','Clear'],
 ['U · Upside','Small','Mid','Large']])}</details>
<h3>The tiers</h3>
<ol class="tier-rules">
 <li><strong>Tier 0</strong>: today’s baseline. Communications, navigation, Earth observation. Already at scale, not scored.</li>
 <li><strong>Tier 1</strong>: unlocked. Launch-proof (<code>L = 2</code>), already flown (<code>D ≥ 1</code>), total of 9 or more. Nothing much else stands in the way.</li>
 <li><strong>Tier 2</strong>: helped, not solved. Free launch is a real boost, but a scientific or technical problem still gates it.</li>
 <li><strong>Tier 3a</strong>: blocked. Nothing has flown (<code>D = 0</code>) or too little works (total of 5 or less). Launch was never the main problem.</li>
 <li><strong>Tier 3b</strong>: killed. The whole point was avoiding launch cost (<code>L = 0</code>). Make launch free and the business goes with it.</li>
</ol>`)+

section('matrix','QUESTION 1 · THE MATRIX','Nineteen industries, seven criteria.',`
${matrixTable()}
<p class="source-caption">Green = 2, amber = 1, red = 0. ★ marks the two industries the rest of this site follows. Tier 0 is left out because it already exists.</p>`)+

section('answer','QUESTION 1 · THE ANSWER','What thrives, and what doesn’t.',`
${tierList()}
<h3>What takes off</h3>
<p>The Tier 1 industries share one property: the product is worth thousands of times what it costs to launch. A biologic drug is worth about $47M per kilogram against roughly $7,000 per kilogram to fly it. Launch was never what held these back. All six have already flown something, and what is left is science, regulation and getting the product home. Free launch makes them bigger, not possible.</p>
<h3>What gets a boost but stays stuck</h3>
<p>Tourism, stations, data centers, solar power, servicing and the rest of Tier 2 all get cheaper, but launch is only one of their problems. Orbital data centers cost three to four times their Earth equivalent and launch is only about a fifth of that; space solar needs six separate improvements, of which cheaper launch is one. These open slowly and on their own schedule.</p>
<h3>What still doesn’t make sense</h3>
<p>Mining for sale on Earth, point-to-point passenger flight and bulk metals are blocked: nothing has flown, or the economics fail before launch enters the picture. Two industries are killed outright. Water and propellant mining exists to avoid paying $2,000 to $20,000 per kilogram to lift water; growing crops for crews exists to avoid resupply. Set launch to zero and there is nothing left to save.</p>
<h3>Where that leaves us</h3>
<p>Space medicine comes out on top, and it leads by a single point, so the ranking is an argument, not a proof. It is also the one place where microgravity itself, not cheap launch, is the advantage. That is why the rest of this site follows it: the cells, the drug behaviour in orbit, and the economics of bringing a dose home.</p>`)+

`</article>`;}
