import {industrySources} from './industry-sources.js';
const c=(...ids)=>ids.map(id=>`<a class="ref" href="#industries/ref-${id}" aria-label="Source ${id}">[${id}]</a>`).join(' ');
const section=(id,n,title,body)=>`<section class="research-section" id="${id}"><div class="research-kicker">${n} / BAGEL BROS</div><h2>${title}</h2>${body}</section>`;
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

const card=(name,sector,score,body,gateLabel,gate,cls='')=>`<article class="ind-card ${cls}"><h3>${name}<em>${score}</em></h3><span class="ind-sector">${sector}</span>${body}<p class="gate"><b>${gateLabel}</b>${gate}</p></article>`;

export function industries(){return `<article class="research-walkthrough industry-walkthrough">`+

section('premise','QUESTION 1 · THE PREMISE','Free to launch is not free to operate.',`
<p class="research-deck">Tomorrow, launching mass to orbit becomes effectively free. What industries become possible, and which still don’t make sense?</p>
<div class="thesis-block"><p>Zero launch cost removes one line from the budget. It does not remove the hardware, the operations, the trip home, the regulator, or the customer. So the question is not “what gets cheaper?” — almost nothing does. The question is <strong>which industries were ever gated by launch in the first place</strong>.</p></div>
<p>We take the hypothetical literally: mass reaches <strong>low Earth orbit</strong> for free. We hold everything else at today’s prices. Transfer vehicles beyond LEO — lunar landers, asteroid tugs — still cost money even when LEO mass does not, which matters a great deal for Tier 3.</p>
<div class="premise-split">
 <div class="premise-card goes-zero"><h3>Goes to zero</h3><ul><li>Mass to low Earth orbit</li></ul><p class="one-line">One line. That is the entire gift of the hypothetical — and for most of the list beside it, it is not the line that was binding.</p></div>
 <div class="premise-card stays"><h3>Still costs exactly what it costs today</h3><ul><li>Spacecraft and payload hardware</li><li>Operations, power and thermal management</li><li>Reentry, recovery and range access</li><li>Regulation, licensing and liability</li><li>R&amp;D, insurance and clinical development</li><li>Finding a customer who will pay twice</li></ul></div>
</div>
<h3>The baseline this hypothetical starts from</h3>
<p>Launch has already fallen a long way, and that fall is what built the industry we have. The space economy is roughly <strong>$626B</strong>, about four-fifths commercial ${c('I1')} — the OECD’s narrower count puts 2025 revenue at <strong>$550–600B</strong> across more than <strong>14,000</strong> operating satellites ${c('I2')}. Those two numbers disagree by more than a tenth of the total; we show both rather than pick one.</p>
<div class="stat-band">
 <div><b>~$626B</b><span>Space economy, roughly four-fifths commercial ${c('I1')}</span></div>
 <div><b>14,000+</b><span>Operating satellites by end-2025 ${c('I2')}</span></div>
 <div><b>~$7,000/kg</b><span>Rideshare to LEO today, reportedly rising ~$500/kg a year ${c('I6')}</span></div>
 <div><b>$67M → $74M</b><span>Falcon 9 list price, moving the wrong way ${c('I7')}</span></div>
</div>
<p>Comms, navigation and Earth observation were all once impractical and are now ordinary. Orbital Radar describes the fall from tens of thousands of dollars per kilogram to under three thousand as the thing that made them viable ${c('I1')}. Starlink alone is about 11,000 of roughly 16,800 active satellites ${c('I3')}; navigation and Earth observation now feed precision agriculture, transport, timing and emergency response ${c('I4')}; AWS, Azure and KSAT sell ground-station access by the minute ${c('I5')}.</p>
${note('<strong>A caveat we have to own.</strong> Launch cost is not clearly still falling. Rideshare sits around $7,000/kg and is reportedly rising about $500/kg a year ${I6}, and Falcon 9’s list price went from $67M to $74M ${I7}. The hypothetical sidesteps this, but it means the historical trend is a <em>hope</em>, not a trajectory, until Starship flies often. We are modeling a world that does not arrive on its own.'.replace('${I6}',c('I6')).replace('${I7}',c('I7')))}`)+

section('split','QUESTION 1 · THE ORGANISING IDEA','Space-for-Earth survives zero launch. Space-for-space doesn’t.',`
<p>One distinction does most of the work in this analysis, and it runs the opposite way to most people’s intuition. The industries that sell a product <em>on the ground</em> barely notice launch cost, because their value per kilogram is thousands of times the price of a ride. The industries whose entire value proposition is <em>not having to launch something</em> lose their reason to exist the moment launching is free.</p>
<div class="split-cards">
 <div class="split-card survives"><span class="verdict-chip">Survives</span><h3>Space-for-Earth</h3><p>The customer is on the ground. Orbit is a <strong>process step</strong>, not a destination. Value per kilogram runs into the tens of millions of dollars, so launch was already a rounding error — which means making it free changes the scale of the business, not whether it exists.</p><p class="examples">Pharmaceuticals · cells and tissue · specialty optical fiber · semiconductor crystals. One market report frames space-for-Earth as roughly half of in-space manufacturing demand today ${c('I8')}.</p></div>
 <div class="split-card dies"><span class="verdict-chip">Dies</span><h3>Space-for-space</h3><p>The product exists to spare someone a launch. Mining water in orbit is worth doing because launching water out of Earth’s gravity well costs <strong>$2,000–20,000/kg</strong> ${c('I69')}. Set that to zero and you have built a business to avoid a cost that no longer exists.</p><p class="examples">Water and propellant mining · crew agriculture · the mass-saving half of power beaming. The same logic weakens propellant depots and every “build it in space to avoid launch” pitch <em>(our inference)</em>.</p></div>
</div>
<p><strong>The ordering principle.</strong> Industries open in order of how little they depend on launch cost — the least launch-sensitive first. That is why Tier 0 opened first and why mass-light biotech is opening now. It is also why the honest version of our answer is uncomfortable: the industries best placed to survive zero launch are the ones that never needed it.</p>
<h3>The same sector splits by where the output goes</h3>
<p>Energy is the clearest demonstration. Four businesses, one physical capability, four different fates — determined entirely by who receives the energy.</p>
${table(['Where the energy goes','Industry','Tier','Why'],[
 ['To other satellites','Orbital power grid','2',`Funded and early. The mass-saving pitch weakens at zero launch ${c('I67')}; the eclipse-uptime pitch survives <em>(our inference)</em> ${c('I64')}`],
 ['To Earth','Space solar power','2',`Launch is the single biggest cost driver ${c('I63')}, but five other improvements are still needed ${c('I62')}`],
 ['Into compute','Orbital data centers','2',`Launch is about a fifth of 20-year cost ${c('I57')}; heat and repair gate the rest ${c('I58')}`],
 ['To Earth as fuel','Lunar helium-3','3a',`Kilogram-scale output is unlikely before the early 2030s ${c('I71')}`]])}
<p class="source-caption">Free launch is decisive for none of these and irrelevant to none of them — it is a partial credit in every row. That is the signature of a Tier 2 industry.</p>`)+

section('matrix','QUESTION 1 · METHOD','The feasibility matrix.',`
<p>We scored nineteen industries against seven criteria, each from 0 to 2, assuming zero launch cost throughout. <strong>Every score is our judgment call</strong>, and we have published the rubric so the calls can be argued with rather than taken on trust.</p>
<div class="rubric-legend">${CRITERIA.map(([k,l])=>`<div><b>${k}</b><span>${l}</span></div>`).join('')}</div>
<details class="research-details"><summary>Full scoring rubric — what 0, 1 and 2 mean <b>+</b></summary>
${table(['Criterion','0','1','2'],[
 ['L · Launch-proof','The value was avoiding launch','Free launch helps but doesn’t settle it','The case doesn’t depend on launch cost'],
 ['P · Space-specific advantage','An Earth substitute exists','Partial advantage','Can’t be done on Earth'],
 ['D · Demonstrated in orbit','None','Partial','Process or product shown'],
 ['E · Non-launch economics','Not shown','Plausible','Paid work covers cost'],
 ['M · Paying customer','None','Deals or contracts','Recurring revenue'],
 ['R · Regulatory / legal path','Absent or blocked','Partial','Clear'],
 ['U · Upside','Small','Mid','Large']])}</details>
<h3>Tier rules, applied in this order</h3>
<ol class="tier-rules">
 <li><strong>Tier 3b (killed)</strong> if <code>L = 0</code>. The value was avoiding launch.</li>
 <li><strong>Tier 3a (blocked)</strong> if <code>D = 0</code> or <code>total ≤ 5</code>. Nothing has flown, or too little works.</li>
 <li><strong>Tier 1 (next)</strong> if <code>L = 2</code> and <code>D ≥ 1</code> and <code>total ≥ 9</code>. Launch-proof and already flying.</li>
 <li><strong>Tier 2 (open)</strong> — everything else with <code>D ≥ 1</code>.</li>
 <li><strong>Tier 0 (baseline)</strong> is not scored. It is already at scale.</li>
</ol>
<p>Ordering matters: water and propellant mining scores 6, which would otherwise put it in Tier 2, but <code>L = 0</code> fires first and sends it to 3b. That is the rule doing exactly the work we want — it separates “hard” from “pointless under this hypothetical”.</p>
${matrixTable()}
<p class="source-caption">★ marks our two spotlight industries. Green = 2, amber = 1, red = 0. Tier 0 industries are excluded because they are already at scale.</p>
${note('<strong>How close the ranking is.</strong> Pharma and biologics scores highest at <strong>11</strong>, and only one point separates it from four other Tier 1 industries. Moving any single score by one point would shift semiconductor crystals, commercial stations or debris removal across a tier line. Treat every boundary case as arguable — we do.')}`)+

section('tiers','QUESTION 1 · THE ANSWER','The tier list.',`
<p>Five tiers, from the industries that already work to the ones this hypothetical quietly destroys.</p>
${tierList()}
<p class="microcopy">Tier 0 is unscored baseline. Tiers 1–3b follow directly from the rules above; no industry was placed by hand.</p>`)+

section('opens','QUESTION 1A · WHAT BECOMES POSSIBLE','Six industries are launch-proof and already flying.',`
<p>Tier 1 industries share one property: value per kilogram is thousands of times the cost of a ride, so launch was never the binding constraint. Each has already flown something. What remains is science, regulation and the trip home.</p>
<div class="ind-grid">
${card('★ A. Pharma &amp; biologics','Health · Tier 1',11,`<p>Merck’s ISS experiments produced crystals with a uniform <b>39 µm</b> size, against a two-mode 13 and 102 µm mix on the ground ${c('I9')}. Varda recovered ritonavir Form III — a metastable polymorph — intact after reentry ${c('I10')}. United Therapeutics signed with Varda in May 2026 ${c('I11')}, and Redwire’s SpaceMD cites royalty agreements ${c('I12')}.</p><p>A biologic drug lists at about <b>$47M/kg</b> ${c('I14')}. The value is IP and formulation, not mass — which is precisely why free launch scales it rather than unlocking it: more flights and bigger batches, from Varda’s tens of kg ${c('I15')} toward Outpost’s planned 16 m³ ${c('I16')}.</p><p><b>The caveat we keep:</b> the approved subcutaneous Keytruda is made on Earth. NASA says the orbital results helped refine ground-based production ${c('I13')} — orbit informed the science, but it is not in the product.</p>`,'Gate','Science proof, then regulation. No orbit-made medicine is approved anywhere; the UK published the first dedicated pathway in March 2026 ${I18}, the FDA has issued no guidance ${I19}, and regulators must still settle traceability, batch release and inspection of orbital platforms ${I20}.'.replace('${I18}',c('I18')).replace('${I19}',c('I19')).replace('${I20}',c('I20')),'lead')}
${card('★ B. Cell &amp; tissue','Health · Tier 1',10,`<p>Cardiac progenitors grown on the ISS were <b>3× larger with about 20× more cells</b> and better calcium handling ${c('I22')}. Space-grown mesenchymal stem cells were more immunosuppressive with no evidence of tumor formation ${c('I23')}, and a large-scale blood stem cell run is underway ${c('I24')}. A review calls microgravity a biologically active culture environment, not just a place to repeat Earth procedures ${c('I25')}.</p><p>The counter-evidence is real and we keep it: the same blood stem cells showed suppressed red-cell production ${c('I26')}, and researchers have raised concerns about cancer-causing changes in other types ${c('I27')}. The likeliest first product is organoids and tissue models for drug testing, which pharma already runs on the ISS ${c('I29')}.</p>`,'Gate','Clinical proof and regulatory comparability — a different manufacturing environment likely means a different product to qualify <em>(our reasoning, not sourced)</em>. Ground bioreactors that simulate microgravity are already sold commercially ${I28}.'.replace('${I28}',c('I28')),'lead')}
${card('ZBLAN optical fiber','Materials · Tier 1',10,`<p>The ISS drew more than <b>11.9 km</b> in about a month ${c('I32')}, and a 2026 study found lower attenuation than ground fiber ${c('I33')}. We found no quantified improvement factor.</p><p>A kilometre is about 50 g of glass <em>(our calc, 125 µm fiber at ~4.3 g/cm³)</em>, so logistics is trivial and operating cost dominates.</p>`,'Kill risk','No demonstrated price premium — the reported price is $1,000/m, equal to the terrestrial rate ${I34}. A $10M mission <em>(our assumption)</em> needs at least 10 km just to break even at parity pricing.'.replace('${I34}',c('I34')))}
${card('Return / reentry logistics','Transport · Tier 1',10,`<p>The enabler everything else depends on. Only Dragon and Varda’s W-series routinely bring hardware back ${c('I17')}; five of six Varda capsules were recovered ${c('I36')}.</p><p>For station cargo the spacecraft, not the rocket, is most of the cost — NASA’s inspector general put cargo capability at about <b>$63,200/kg</b> ${c('I37')}.</p>`,'Gate','Licensing, ranges and a funded customer line ${I17}. Varda’s W-1 sat in orbit for months waiting on a reentry licence, and its reentry licensing runs through 2029 ${I21}. Free launch means more vehicles, not cheaper ones.'.replace('${I17}',c('I17')).replace('${I21}',c('I21')))}
${card('Hypersonic testing as a service','Defense · Tier 1',10,`<p>The only Tier 1 industry with a score of <b>2 for paying customers</b>. Varda holds a <b>$60M</b> Air Force contract using its capsule as a hypersonic testbed ${c('I39')}; W-5 carried a Navy payload ${c('I40')}; the sixth flight was a government-funded reentry test ${c('I35')}.</p><p>It matters out of proportion to its size: it is real revenue paying for the same return vehicles pharma needs.</p>`,'Gate','Upside scores 0. It is narrow and depends entirely on defense budgets — a bridge business, not a destination.')}
${card('Semiconductor crystals','Materials · Tier 1',9,`<p>Space Forge’s ForgeStar-1 reached orbit in June 2025 and generated plasma at 1,000 °C ${c('I11')}. The UK funded £300,000 toward semiconductor production ${c('I41')}.</p><p>This is a platform milestone, not a product.</p>`,'Caveat','Sits exactly on the Tier 1 cutoff at 9. We found no proof of a yield advantage; one point down and it is Tier 2.')}
</div>
<h3>Tier 2: free launch helps, something else is in the way</h3>
<p>These eight have demos and customers. Launch is a real cost for each of them — unlike Tier 1 — but removing it still doesn’t finish the job.</p>
${table(['Industry','What zero launch actually changes','What still blocks it'],[
 ['Space tourism',`Prices are $750,000 suborbital with about 650 ticket holders already waiting ${c('I43')}. A Falcon 9 lists at $74M; over four seats that is about $18M of a $55M seat, roughly a third <em>(our calc)</em> ${c('I7')} ${c('I44')}`,`Supply is vanishing for unrelated reasons — no US rocket seat flies in 2026 ${c('I42')}. Capsule, training and NASA’s ~$35,000/day life-support charge remain ${c('I45')}, and occupant-safety rules wait until January 2028 ${c('I46')}`],
 ['Commercial stations',`Cheaper deployment of 14,000 kg-class modules ${c('I47')}`,`Operations dominate cost — the ISS costs NASA $3–4B a year ${c('I48')} and retires around 2030–2031 ${c('I50')}. The binding constraint is funding and schedule: NASA’s final solicitation closes 8 December 2026 with up to $34B through 2042 but only $100M guaranteed ${c('I49')}, and NASA reversed its own plan in 2026 ${c('I35')}`],
 ['Debris removal',`Launch is probably a small share of a removal mission <em>(our inference)</em>, but free launch means <strong>more satellites</strong> — 4,000+ went up in 2025 alone ${c('I3')}`,`Nobody has budgeted to buy it ${c('I53')} — ESA pays about €86M to remove a single 112 kg object ${c('I51')}, and ClearSpace-1 has slipped to 2028 ${c('I52')}. Avoidance wins today: Starlink flew 207,152 collision-avoidance maneuvers in six months ${c('I3')}. Market sizing runs from $1.24B ${c('I54')} to $13.5B by 2035 ${c('I53')}`],
 ['Orbital data centers',`BCG puts launch at about 20% of 20-year cost ${c('I57')}. Removing 20% of a 4× gap leaves roughly 3× <em>(our rough combination of two sources with different assumptions)</em> ${c('I56')}`,`Non-IT capital cost is $3.1M in space against $382K on Earth for a 30.5 kW deployment ${c('I55')}. Heat — radiators and arrays can be 65–70% of satellite mass ${c('I58')} — plus repair, which BCG puts more than ten years out, and ~9% compute loss per year ${c('I59')}. The money is real regardless: Starcloud raised $250M in August 2026 ${c('I60')}`],
 ['Space solar power',`A lot. Launch is the single biggest driver of cost and emissions ${c('I63')}, and space solar beats the best off-grid ground installations below about $250/kg ${c('I59')}`,`NASA’s cut in launch cost alone only reached $0.20–0.50/kWh against $0.02–0.05 on the ground; competitiveness needed <strong>six improvements at once</strong> ${c('I62')}. Zero launch covers one ${c('I61')}`],
 ['Servicing &amp; assembly',`More servicer vehicles for the same budget`,`Contracts are bespoke and one at a time, and demand is mostly government ${c('I35')}`],
 ['Point-to-point cargo',`The core economics, since the vehicle <em>is</em> the launch`,`Customers are government and defense, for urgent delivery rather than replacing freight ${c('I38')}. Narrow but real`],
 ['Orbital power grid',`It <strong>weakens</strong> the pitch. "Build smaller, lighter, cheaper spacecraft" ${c('I67')} is a mass argument; the eclipse-uptime argument survives <em>(our inference)</em>`,`Delivered ground power is far below what a large satellite needs — a record 1.1 kW beam ${c('I65')}; tracking precision, heat and multi-year durability are open ${c('I68')}. Star Catcher has $65M and seven PPAs ${c('I64')}, and Protostar launched in October 2026 with no results yet ${c('I66')}`]])}`)+

section('blocked','QUESTION 1B · WHAT STILL DOESN’T MAKE SENSE','Three industries stay blocked. Two are killed outright.',`
<p>This is the half of the question people skip. Free launch is not a universal solvent: three industries are blocked by something it cannot touch, and two lose their entire reason to exist.</p>
<h3>Tier 3a — blocked by something free launch can’t fix</h3>
<div class="ind-grid">
${card('Mining for Earth sale','Resources · Tier 3a',7,`<p>No commercial asteroid operation has sold resource-derived material, and AstroForge’s Odin was lost in March 2025 ${c('I69')}. Helium-3 sold for about <b>$19M/kg</b> in 2024 and Interlune plans a 2029 pilot excavator ${c('I70')} — the value density is genuinely there.</p>`,'Why free launch doesn’t fix it','Kilogram-scale output is unlikely before the early 2030s, and fusion-grade tonnes are a 2040s question ${I71}. Returned material still pays reentry and recovery, beyond-LEO transfer vehicles still cost money <em>(our reasoning)</em>, and a flood of supply could crash Earth prices ${I72}.'.replace('${I71}',c('I71')).replace('${I72}',c('I72')))}
${card('Point-to-point passengers','Transport · Tier 3a',5,`<p>The lowest score in the matrix, with <b>zeros</b> for demonstration, paying customers and regulatory path. There is no dated plan, and SpaceX has scaled back visible promotion ${c('I74')}.</p><p>Legal status is unsettled: a reusable rocket may count as a “space object”, which changes liability and insurance ${c('I75')}.</p>`,'Why free launch doesn’t fix it','Safety and law block it, not cost. A passenger version needs human-rating to aviation standards, FAA and international approval, environmental studies, noise and abort solutions, and an insurance framework ${I73}. Concorde is the cautionary comparison — rich customers didn’t save its economics ${I76}.'.replace('${I73}',c('I73')).replace('${I76}',c('I76')))}
${card('Bulk metals &amp; alloys','Materials · Tier 3a',3,`<p>The weakest case we scored, and the only industry with <b>zeros on four criteria</b>. We found no orbit-made bulk product at all.</p>`,'Why free launch doesn’t fix it','<em>Our reasoning:</em> anything worth far less per kilogram than reentry and recovery cannot pay for the return trip, and Earth supplies it cheaply. Zero launch only solves the outbound leg.')}
</div>
<h3>Tier 3b — killed <em>by</em> free launch</h3>
<p>These two are the most interesting answers in the whole exercise, because the hypothetical doesn’t just fail to help them — it is the thing that destroys them.</p>
<div class="ind-grid">
${card('Water &amp; propellant mining','Resources · Tier 3b',6,`<p>Scored 6 — mid-table, and it has partial orbital demonstration. On the raw total it would sit comfortably in Tier 2.</p><p>But the entire business case is avoiding the cost of launching water out of Earth’s gravity well, roughly <b>$2,000–20,000/kg</b> ${c('I69')}.</p>`,'Killed because','At zero launch cost that value simply vanishes. The same logic weakens orbital propellant depots and every "build it in space to avoid launch" manufacturing pitch <em>(our inference)</em>.','killed')}
${card('Space agriculture for crews','Food · Tier 3b',6,`<p>Plants have grown on the ISS since 2014, but resupply remains the economical choice for ISS-length missions and Veggie is still a research program ${c('I77')}. Food resupply is estimated at $10,000–30,000/kg ${c('I78')} or $20,000–40,000/kg ${c('I79')}, at about 1.8 kg per astronaut per day.</p><p>Free launch <strong>widens</strong> the gap in favor of resupply, and space-qualified hardware inflates development cost 5–10× ${c('I78')}.</p>`,'What survives','Mission-length reasons, not launch-cost reasons. A three-year Mars trip needs 10,000–11,000 kg of food for four people ${I79} and packaged vitamins degrade over long missions ${I80} — neither is a launch-price argument. Low-value crops like lettuce can never pay for a return trip. The spillover runs the other way: vertical farming’s real market is high-value perishables on the ground ${I81}.'.replace('${I79}',c('I79')).replace('${I80}',c('I80')).replace('${I81}',c('I81')),'killed')}
</div>
${note('<strong>The sector test, run twice.</strong> Food for crews is Tier 3b, but crop genetics as a research service is the one food activity that resembles our spotlight — Redwire’s plant habitat has hosted cotton-genome work ${I83}, where the product is IP, not calories. Health runs the same way: pharma and cells are launch-proof, while the only consumer-facing space angle, skincare, is mostly research tie-ins and marketing — brands have flown skin-tissue experiments ${I84}, but the commercial products citing NASA use <em>ground</em> bioreactors ${I28}. Within every sector, the version that sells to Earth survives and the version that only avoids launch does not.'.replace('${I83}',c('I83')).replace('${I84}',c('I84')).replace('${I28}',c('I28')))}`)+

section('density','QUESTION 1 · WHY','Launch was never the gate for the industries that win.',`
<p>Here is the arithmetic underneath the whole tier list. A biologic drug is worth about <strong>6,700 times</strong> today’s rideshare launch price per kilogram. At that ratio, launch is not a cost — it is a rounding error.</p>
${table(['Product','Value per kg','Multiple of $7,000/kg rideshare'],[
 ['Biologic drug (Keytruda list price)',`about $47M ${c('I14')}`,'about 6,700×'],
 ['ZBLAN fiber at $1,000/m',`about $20M <em>(our calc, ~50 g per km)</em> ${c('I34')}`,'about 2,900×'],
 ['Orbital tourism seat',`about $0.7M <em>(our calc, $55M per ~80 kg)</em> ${c('I44')}`,'about 100×']])}
<p class="source-caption">Reference launch prices: about $7,000/kg on SpaceX rideshare ($350,000 for the first 50 kg) ${c('I6')} and about $3,245/kg on a full dedicated Falcon 9 ${c('I7')}.</p>
<h3>Which is why free launch moves so little</h3>
${table(['Industry','Launch share of total cost today','Basis'],[
 ['Pharma, cells, ZBLAN','Negligible','Our calc from the value-density ladder above'],
 ['Orbital tourism','About one third of a seat',`Our calc: $74M Falcon 9 over four seats ${c('I7')}`],
 ['Orbital data centers','About 20% of 20-year cost',`BCG via AI Infrastructure ${c('I57')}`],
 ['Space solar power','The single biggest driver',`Enlit ${c('I63')}`]])}
<p>Read the two tables together and the tier list stops being a ranking and becomes a consequence. The industries at the top are there <em>because</em> launch is negligible to them. The industries in Tier 2 are the ones where launch genuinely matters — and they are stuck anyway.</p>
<h3>Honest flags</h3>
${table(['The flag','Why it matters'],[
 ['Tier 1 opens <em>before</em> zero launch, not because of it','Pharma and cells already work at today’s prices. Zero launch scales them — more flights, bigger batches — it does not unlock them.'],
 ['Our own weakness, stated plainly','If launch were the unlock, Tier 1 would already be fully open. It isn’t. So non-launch constraints — science, regulation, return — dominate, and our spotlight has to argue those can be solved.'],
 ['A leads by a single point','ZBLAN, return logistics, hypersonic testing and cell/tissue all score within one point of pharma. We should be ready to defend A over ZBLAN on value density and market size, not on the total.'],
 ['B’s regulatory zero is reasoning, not a source','Cell and tissue scores 0 on regulatory path because of our argument about manufacturing comparability — not a sourced finding.'],
 ['Market sizes conflict badly',`In-orbit pharma is sized at $455M by 2034 ${c('I11')} and at $2.8–4.2B ${c('I85')}; space agriculture at $2.1B ${c('I78')} and $5.68B ${c('I82')} for the same year. Treat all of it as promoter-grade.`],
 ['Most sources are not neutral','Companies, industry bodies and investor blogs dominate. Figures marked <em>our calc</em> or <em>our inference</em> are our own arithmetic, not published numbers.']])}
${note('<strong>The sentence we are defending:</strong> falling launch cost opened industries in order of value density. Tier 0 opened first, mass-light biotech is opening now, and mass-heavy industries come later — if they come at all. The strongest structural argument for making space medicine the spotlight is that it sits in the group this hypothetical leaves intact, and its remaining gates are all non-launch.')}
<div class="handoff">
 <a href="#economy"><span class="nx">Question 2 · next</span><strong>The first product that is fundamentally cheaper in microgravity</strong><em>Spotlights A and B in detail: the science, the return trip, and the launch, manufacturing and return costs at which it becomes viable.</em></a>
 <a href="#infrastructure"><span class="nx">Question 1C · the space-only question</span><strong>The first self-sustaining industry that sells only to customers in space</strong><em>Orbital data centers over fifty years, and whether servicing them becomes a business of its own.</em></a>
</div>`)+

section('sources','RESEARCH','Sources and limitations.',`
<p>All figures were gathered on 24 October 2026 from search results and source pages. Most sources are companies, industry bodies and investor blogs, so market sizes are soft and often conflict — where two sources disagree we show both rather than reconcile them. Anything labeled <em>our calc</em>, <em>our inference</em> or <em>our reasoning</em> is Bagel Bros arithmetic or judgment, not a published number. Every score in the matrix is a judgment call.</p>
<ol class="industry-bibliography">${industrySources.map(s=>`<li id="ref-${s.id}"><span>${s.id}</span><div><a href="${s.url}" target="_blank" rel="noopener">${s.title} ↗</a><p>${s.publisher} · ${s.date}</p><small>${s.note}</small></div></li>`).join('')}</ol>`)+`</article>`;}
