import {infraSources} from './infra-sources.js';
// Replace copy here as your research develops. All research is intentionally pending.
export const content = {
  economy: {number:'01', label:'Microgravity economy', eyebrow:'BAGEL BROS / THE CHALLENGE / QUESTION 01', title:'WHAT IF LAUNCH\nCOST NOTHING?', description:'A new starting point for industry. An open question for everything that comes next.', image:'assets/starship.jpg', sections:[['brief','The question'],['industries','Industries'],['medicine','Space medicine'],['simulation','Simulation'],['calculator','Economics'],['verdict','Our verdict']]},
  infrastructure: {number:'02', label:'Orbital infrastructure', eyebrow:'BAGEL BROS / THE CHALLENGE / QUESTION 02', title:'THE NEXT\nINFRASTRUCTURE.', description:'Computing beyond Earth. Maintaining it in orbit. Exploring the next fifty years.', image:'assets/orbit.webp', sections:[['brief','Thesis'],['demand','Inference'],['parity','Cost'],['reality','Reality check'],['inventory','Q1 · Demand'],['repair','Q2 · Economics'],['robotics','Simulation'],['counterargument','Counterargument'],['timing','Q3 · Timing'],['sources','Sources']]},
  research: {number:'03', label:'Research & team', eyebrow:'BEHIND THE QUESTIONS', title:'SHOW\nYOUR WORK.', description:'The evidence, the assumptions, and the people behind our investigation.', image:'assets/crew.jpg', sections:[['notebook','Research notebook'],['sources','Sources'],['team','The team'],['credits','Credits']]}
};
export const industries = ['Stem-cell manufacturing','Pharmaceuticals & protein crystals','Advanced optical fibers','Semiconductors','Bulk manufacturing','Space-based energy'];
// Sources: { id: 'example', title: 'Paper title', url: 'https://…', authors: '…', year: '2026' }
export const sources = infraSources.map(s => ({...s, authors:s.publisher, year:s.date}));
// Team: { name: 'Full name', role: 'Research focus', bio: 'Short biography' }
export const team = [];
export const rawWorkUrl = '';
// Configure either iframeUrl OR moduleUrl. A module exports mount(container), optionally returning cleanup().
export const simulation = { iframeUrl: '', moduleUrl: '', title: 'Space medicine simulation' };
