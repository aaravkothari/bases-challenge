// Transparent scenario models, not forecasts. Currency is constant illustrative USD.
export function ratioAt(year, initial, orbitalDecline, groundDecline) {
  return initial * ((1-orbitalDecline)/(1-groundDecline)) ** (year-2026);
}
export function parityYear(initial, orbitalDecline, groundDecline) {
  if(initial<=1) return 2026;
  const relative=(1-orbitalDecline)/(1-groundDecline);
  return relative>=1 ? Infinity : 2026+Math.log(1/initial)/Math.log(relative);
}
export function workload(mw, payloadTonnes=100) {
  return {random:70.2*mw,plannedLow:323*mw,plannedHigh:349*mw,robotHoursLow:560*mw,robotHoursHigh:700*mw,logisticsLow:5.3*mw,logisticsHigh:9*mw,deploymentLow:50*mw,deploymentHigh:75*mw,launchLow:5.3*mw/payloadTonnes,launchHigh:9*mw/payloadTonnes};
}
export function repairComparison({launch,fee,success,partCost=100000,partMass=25,nodeCost=2000000,nodeMass=5000,downtime=25000}) {
  const replacement=nodeCost+nodeMass*launch;
  const attempt=partCost+partMass*launch+fee+downtime;
  const repair=attempt+(1-success)*replacement;
  return {replacement,repair,saving:replacement-repair,maxFee:success*replacement-partCost-partMass*launch-downtime};
}
export function provider({fixed,reachable,share,jobs,price,variable}) {
  const margin=price-variable;
  const contribution=reachable*share*jobs*margin;
  return {margin,contribution,threshold:contribution>0?fixed/contribution:Infinity};
}
