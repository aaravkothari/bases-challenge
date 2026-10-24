import test from 'node:test';
import assert from 'node:assert/strict';
import {ratioAt,parityYear,workload,repairComparison,provider} from '../dist/infra-models.js';
test('parity uses relative rather than absolute decline and covers edge cases',()=>{
 assert.equal(ratioAt(2026,3,.097,0),3);
 assert.equal(Math.ceil(parityYear(3,.097,0)),2037);
 assert.equal(Math.ceil(parityYear(3,.06,0)),2044);
 assert.equal(parityYear(3,.06,.06),Infinity);
 assert.equal(parityYear(3,.03,.06),Infinity);
 assert.equal(parityYear(1,0,0),2026);
 assert.ok(parityYear(3,.097,.02)>parityYear(3,.097,0));
});
test('annual logistics and initial deployment are not conflated',()=>{
 const w=workload(1000,100);assert.equal(w.launchLow,53);assert.equal(w.launchHigh,90);
 assert.equal(w.deploymentLow/100,500);assert.equal(w.deploymentHigh/100,750);
 assert.equal(workload(10).random,702);
});
test('failed repair falls back to replacement and zero launch does not mean free repair',()=>{
 const base={launch:0,fee:300000,success:1};const success=repairComparison(base);
 assert.equal(success.replacement,2000000);assert.equal(success.repair,425000);
 const failed=repairComparison({...base,success:0});assert.equal(failed.repair,2425000);assert.ok(failed.saving<0);
 const threshold=repairComparison({...base,fee:success.maxFee});assert.equal(threshold.saving,0);
});
test('provider break-even distinguishes reachable share, captured share and external jobs',()=>{
 const p={fixed:10e6,reachable:.5,share:.25,jobs:10,price:100000,variable:50000};
 assert.equal(provider(p).threshold,160);
 assert.equal(provider({...p,reachable:0}).threshold,Infinity);
 assert.equal(provider({...p,variable:100000}).threshold,Infinity);
 assert.equal(provider({...p,variable:200000}).threshold,Infinity);
});
