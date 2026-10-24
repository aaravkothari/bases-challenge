import {infraSources} from './infra-sources.js';
// Replace copy here as your research develops. All research is intentionally pending.
export const content = {
  industries: {number:'01', label:'Industries', eyebrow:'ZERO LAUNCH COST / INDUSTRY FEASIBILITY', title:'WHAT OPENS\nWHEN LAUNCH\nIS FREE?', description:'Nineteen industries scored against seven criteria. Six take off, eight get a boost but stay stuck, five never make sense.', image:'assets/starship.jpg', sections:[['premise','The question'],['matrix','The matrix'],['answer','The answer']]},
  medicine: {number:'02', label:'Microgravity & medicine', eyebrow:'MICROGRAVITY / MEDICINE / ECONOMICS', title:'MEDICINE.\nMADE IN ORBIT.', description:'The science of manufacturing medicine in microgravity, and the economics of bringing it home.', image:'assets/crew.jpg', sections:[['brief','Our thesis'],['medicine','Space medicine'],['simulation','Simulation'],['economics','Economics'],['verdict','Our verdict']]},
  'orbital-economy': {number:'03', label:'Orbital economy', eyebrow:'ORBITAL ECONOMY / INFRASTRUCTURE', title:'THE NEXT\nINFRASTRUCTURE.', description:'Computing beyond Earth. Maintaining it in orbit. Exploring the next fifty years.', image:'assets/orbit.webp', sections:[['brief','Thesis'],['demand','Inference'],['parity','Cost'],['reality','Reality check'],['inventory','Q1 · Demand'],['repair','Q2 · Economics'],['robotics','Simulation'],['counterargument','Counterargument'],['timing','Q3 · Timing'],['sources','Sources']]},
  research: {number:'—', label:'Research', eyebrow:'BEHIND THE QUESTIONS', title:'SHOW\nYOUR WORK.', description:'The evidence, the assumptions, and the people behind our investigation.', image:'assets/crew.jpg', sections:[['notebook','Research notebook'],['sources','Sources'],['team','The team'],['credits','Credits']]}
};
// Sources: { id: 'example', title: 'Paper title', url: 'https://…', authors: '…', year: '2026' }
export const sources = infraSources.map(s => ({...s, authors:s.publisher, year:s.date}));
// Team: { name: 'Full name', role: 'Research focus', bio: 'Short biography' }
export const team = [];
export const rawWorkUrl = 'https://docs.google.com/document/d/1m0MRTQmJezOaSiOQbtm9-O7fS10f23QGVEpYDz-jpso/edit?usp=sharing';
// Configure either iframeUrl OR moduleUrl. A module exports mount(container), optionally returning cleanup().
export const simulation = { iframeUrl: 'sim/index.html?embed=1', moduleUrl: '', title: 'ORBITALRx: drug levels in the blood on Earth and in space' };
