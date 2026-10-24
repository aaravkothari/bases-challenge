# ORBITALRx widget

One embeddable React component, `<OrbitalRxWidget />` (src/Widget.tsx), that shows where an oral
drug dose is in the body and its blood level over 24 h, on Earth and under an adjustable
spaceflight scenario. Exploratory model, not validated against flight data.

```bash
npm install
npm run dev     # demo page at http://localhost:5173
npm test        # 36 tests: closed-form solution, RK4 agreement, mass balance, sensitivities, PRNG
npm run build
```

Model: one-compartment, first-order absorption and elimination (src/model/pk.ts). The spaceflight
scenario multiplies ka, CL, Vd and F by user-set factors; the default factors (0.80, 0.75, 0.85,
1.00) are assumptions about direction, not measured effects. The compound is made up
(100 mg, F 0.85, ka 1.2 /h, CL 7.2 L/h, Vd 40 L). Optional uncertainty band is a seeded
Monte Carlo over the four multipliers (src/model/sensitivity.ts), which also has a one-at-a-time
tornado function that the widget does not currently display.

Physiology references: NASA OCHMO Technical Brief OCHMO-TB-006 Rev A, Pharmaceutical Care (2023);
Dello Russo et al., Br J Pharmacol 2022;179(11):2538–2557; Blue et al., npj Microgravity 2019;5:14.
No numbers on the page come from them.
