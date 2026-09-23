# UIQ Earnings Invest Strategy
## Earnings-Surprise / Earnings-Momentum Investment Strategy

**Version:** 0.1 – Concept developed September 2026  
**Purpose:** Working specification for discussion with Claude and subsequent UIQ implementation  
**Status:** Concept / research specification – not yet empirically validated

---

## 1. Strategic Objective

The `earnings_invest` strategy is designed to identify companies where the **fundamental earnings trajectory and analyst expectations are improving, while the magnitude of the improvement may not yet be fully reflected in the share price**.

The central question is:

> **Where is there a potentially favorable discrepancy between what the market currently expects and what the company may actually deliver at the next earnings event?**

The strategy is **not** intended to predict an earnings beat from a single indicator.

Instead, it combines:

1. Earnings-estimate momentum
2. Fundamental quality
3. Expectation level / expectation gap
4. Market and technical setup
5. Historical earnings behavior
6. External-event and macro dependency

The strategy should favor **company-driven or activity-driven earnings momentum** over situations where the thesis depends primarily on a binary external event, commodity price, or political development.

---

# 2. Core Investment Hypothesis

A potentially attractive earnings setup exists when several conditions occur simultaneously:

```text
Positive estimate revisions
        +
Improving underlying fundamentals
        +
Expectations not excessively elevated
        +
Share price not fully reflecting the improvement
        +
Constructive technical / institutional setup
        +
Low-to-moderate external event dependency
        ↓
Potential Earnings-Surprise Setup
```

The key distinction is between:

### Company-driven earnings momentum

Examples:

- increasing sales
- market-share gains
- operating leverage
- margin expansion
- increasing customer activity
- improving cash generation
- higher management guidance

and:

### Externally driven earnings momentum

Examples:

- oil price spike
- commodity shortage
- interest-rate shock
- regulatory decision
- FDA decision
- clinical trial result
- geopolitical event

The strategy should prefer the first category because its earnings thesis is potentially more persistent and less exposed to abrupt reversal.

---

# 3. Candidate Universe

Initial universe requirements:

- Market capitalization ≥ $20B
- Positive operating cash flow
- Established operating business
- No obvious speculative turnaround dependency
- No mandatory biotech exposure for the core screen
- Sufficient analyst coverage
- Sufficient historical earnings data
- Sufficient price/volume history

The $20B market-cap threshold is an **operational screening parameter**, not an empirically validated optimum.

Likewise, exclusion of speculative turnarounds and biotech is a risk-control choice for the conservative core screen, not a statement that these sectors are intrinsically unattractive.

---

# 4. Six Analytical Layers

## Layer 1 — Earnings Revision Momentum

This is the first and one of the most important layers.

### Required metrics

- EPS Estimate 30d change
- EPS Estimate 60d change
- EPS Estimate 90d change
- Revenue Estimate 30d change
- Revenue Estimate 60d change
- Revenue Estimate 90d change
- Current EPS consensus
- Current Revenue consensus
- Analyst count
- Revision breadth
- Revision magnitude
- Estimate dispersion
- Guidance vs consensus

### Revision Breadth

The strategy should distinguish:

```text
Consensus +8%
```

resulting from:

```text
2 of 20 analysts revising upward
```

from:

```text
16 of 20 analysts revising upward
```

The latter represents broader analyst confirmation.

### Estimate Dispersion

Low dispersion may indicate a relatively homogeneous expectation.

High dispersion may indicate:

- uncertainty
- asymmetric outcomes
- disagreement about the business trajectory

This should initially be treated as contextual information rather than automatically positive or negative.

---

# 5. Layer 2 — Fundamental Quality

The objective is to determine whether rising earnings estimates are supported by the underlying business.

## Growth

- Revenue growth
- EPS growth
- Operating income growth
- FCF growth

## Profitability

- Gross margin
- Operating margin
- EBITDA margin
- Net margin
- ROIC
- ROE

## Margin Momentum

- Gross margin YoY change
- Operating margin YoY change
- EBITDA margin YoY change
- Margin estimate revisions

## Cash Conversion

- Operating cash flow
- Free cash flow
- FCF margin
- CFO / Net income
- FCF / Net income

## Earnings Quality

Potential future metrics:

- Accrual ratio
- Cash earnings vs reported earnings
- Stock-based compensation / revenue
- Working-capital contribution

A strong EPS trajectory supported by cash generation should generally be distinguished from an EPS trajectory driven primarily by accounting effects.

---

# 6. Layer 3 — Expectation Gap

This is a central component of the strategy.

The strategy should not simply search for companies with rising estimates.

It should ask:

> **How much good news is already expected?**

## Expectation inputs

### Official consensus

- EPS consensus
- Revenue consensus
- EBITDA consensus
- Current-quarter estimate
- FY estimate
- Next-FY estimate

### Company guidance

- Current guidance
- Guidance midpoint
- Guidance range
- Guidance vs consensus

### Historical surprise behavior

For the last 4–8 quarters:

- EPS surprise %
- Revenue surprise %
- Beat / miss
- Guidance raised / maintained / lowered
- Post-earnings price reaction

### Optional future input

If reliable data becomes available:

- Whisper EPS
- Whisper revenue
- Whisper vs official consensus

Whisper data should not be used unless provenance and reliability are established.

---

# 7. Expectation Gap and Price

A central relationship is:

```text
Earnings Revision Momentum
            vs.
Share Price / Valuation Response
```

Example:

```text
EPS revisions +20%
Share price +5%
```

may represent a different setup from:

```text
EPS revisions +20%
Share price +30%
```

The first may indicate that earnings expectations are improving faster than the market price has adjusted.

The second may indicate that a substantial part of the improvement is already reflected in the price.

A future UIQ metric can therefore be:

### `revision_price_divergence`

This should be implemented as a standardized relationship rather than a naive percentage division.

---

# 8. Layer 4 — Market / Technical Setup

The strategy should incorporate price and market positioning, but technical factors should not override fundamental evidence.

## Relative Strength

- 1M vs S&P 500
- 3M vs S&P 500
- 6M vs S&P 500
- 1M vs sector
- 3M vs sector

## Price Position

- Distance from 20-day MA
- Distance from 50-day MA
- Distance from 200-day MA
- Distance from 52-week high
- 52-week high/low position
- ATR
- Volatility percentile

## Volume / Institutional Behavior

Potential metrics:

- Volume vs 20-day average
- Up-volume / down-volume
- Accumulation/distribution
- Institutional ownership
- Institutional ownership change
- Fund ownership change, if reliable

The objective is to determine whether the market is already positioning for the expected improvement.

---

# 9. Layer 5 — Historical Earnings Reaction

Historical earnings behavior is an important additional layer.

For the last 4–8 earnings events, collect:

- EPS surprise
- Revenue surprise
- Guidance change
- Next-day return
- 5-day return
- 20-day return
- Earnings gap
- Beat + positive reaction
- Miss + negative reaction

Potential derived metrics:

```text
P(positive reaction | EPS beat)
P(positive reaction | EPS beat + revenue beat)
P(positive reaction | EPS beat + revenue beat + guidance raise)
```

These should initially be **descriptive historical statistics**, not presented as calibrated future probabilities.

---

# 10. Layer 6 — External Event Dependency / Risk Protection

This layer was added explicitly to reduce risk from situations where the earnings thesis is dominated by external events.

## Risk categories

### A. Binary Event Risk

Examples:

- FDA decision
- Phase III trial
- regulatory approval
- major patent litigation
- court decision

### B. Commodity Dependency

Examples:

- Oil
- Gas
- Metals
- Rare earths
- Other politically sensitive commodities

### C. Political / Regulatory Dependency

Examples:

- tariffs
- sanctions
- export controls
- government procurement
- major regulatory changes

### D. Macro Dependency

Examples:

- interest rates
- FX
- credit spreads
- economic cycle

### E. Company-specific Operating Drivers

Examples:

- customer growth
- transaction volume
- market share
- pricing
- productivity
- margin expansion

---

# 11. External Dependency Classification

Each candidate should receive a descriptive classification:

```text
external_dependency:
LOW
MEDIUM
HIGH

binary_event_risk:
LOW
MEDIUM
HIGH
```

Potential driver classification:

```text
STRUCTURAL
OPERATING
ACTIVITY_DRIVEN
CYCLICAL
COMMODITY
RATE_SENSITIVE
POLITICAL
BINARY_EVENT
MIXED
```

These are classifications, not predictions.

---

# 12. Risk-Control Principle

The strategy should **not automatically exclude entire sectors**.

Instead:

```text
Company / sector
      ↓
Identify earnings driver
      ↓
Determine external dependency
      ↓
Determine binary-event risk
      ↓
Apply risk-control treatment
```

For the conservative core screen:

### Preferred

- Company-driven
- Operating-driven
- Activity-driven

### Neutral / context-dependent

- Moderate rate sensitivity
- Moderate macro sensitivity
- Mixed drivers

### Risk penalty / possible exclusion

- High commodity dependency
- High political dependency
- High binary-event dependency

### Very high / binary risk

Exclude from the conservative core pool, but retain in a separate research universe.

This is intended as **risk protection**, not as a sector judgement.

---

# 13. Example: IBKR

Interactive Brokers (IBKR) is a useful conceptual reference case for the strategy.

The important point is not that IBKR is automatically a preferred investment.

Rather, it illustrates the desired **type of earnings driver**.

Potential operational drivers include:

- DARTs
- New accounts
- Total client accounts
- Client equity
- Margin loans
- Net interest income
- Commission revenue
- Trading volume
- Customer cash
- Operating leverage

This creates a multi-dimensional operating model:

```text
Customer growth
       +
Trading activity
       +
Client assets
       +
Margin balances
       +
Interest income
       +
Commission income
       ↓
Revenue / EPS trajectory
```

This differs fundamentally from an earnings setup where the principal driver is:

```text
Oil price
      ↓
Crack spread
      ↓
Refining margin
      ↓
EPS
```

or:

```text
Clinical trial
      ↓
Regulatory outcome
      ↓
Company valuation
```

IBKR therefore serves as an example of a potentially **lower external-event-dependency earnings setup**.

It can still have macro sensitivity, especially through interest rates and market activity, so it should not be treated as completely macro-independent.

---

# 14. Commodity Example: MPC / VLO / PSX

The September 2026 discussion highlighted an important risk.

Marathon Petroleum (MPC), Valero (VLO), and Phillips 66 (PSX) showed strong earnings-revision momentum, but their earnings are strongly influenced by refining economics and therefore by commodity and geopolitical conditions.

The important analytical chain is:

```text
Crude price
     +
Product prices
     +
Crack spreads
     ↓
Refining margins
     ↓
Earnings
```

Therefore:

```text
EPS revisions ↑
```

does not necessarily mean:

```text
Company-specific earnings quality ↑
```

The revision may partly reflect an external commodity regime.

The strategy should therefore distinguish:

### Idiosyncratic earnings momentum

from:

### Commodity / macro-driven earnings momentum

This distinction is one of the central risk-control principles of `earnings_invest`.

---

# 15. Proposed Four Core Scores

The strategy should initially avoid a single opaque composite score.

Instead, calculate four transparent sub-scores.

## 15.1 `earnings_revision_score`

Measures:

- EPS revisions
- Revenue revisions
- Revision breadth
- Revision magnitude
- Analyst participation
- Estimate dispersion

---

## 15.2 `earnings_quality_score`

Measures:

- Revenue growth
- EPS growth
- Margin trend
- ROIC
- FCF
- Operating cash flow
- Cash conversion
- Balance-sheet quality

---

## 15.3 `expectation_gap_score`

Measures:

- Consensus
- Guidance
- Historical surprise pattern
- Valuation
- Revision vs price divergence
- Potentially whisper data later

---

## 15.4 `earnings_setup_score`

Measures:

- Relative strength
- Price positioning
- Volume
- Institutional behavior
- Historical earnings reaction
- Pre-earnings price behavior

---

# 16. Risk Overlay

The four scores should then be combined with a separate risk overlay.

Conceptually:

```text
                     Earnings Setup
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   Revision            Quality         Expectation
   Momentum                               Gap
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    Market / Earnings
                       Setup
                           │
                           ↓
                  External Risk Overlay
                           │
             ┌─────────────┴─────────────┐
             │                           │
       Low dependency              High dependency
             │                           │
       Core candidate              Risk penalty /
                                   separate pool
```

The risk overlay should **not be hidden inside the fundamental scores**.

This preserves interpretability.

---

# 17. Candidate Output

The intended research table should contain:

| Field | Description |
|---|---|
| Company | Company name |
| Ticker | Ticker |
| Sector | Sector |
| Market Cap | Market capitalization |
| Earnings Date | Next earnings date |
| EPS Revision 30/60/90d | Estimate momentum |
| Revenue Revision 30/60/90d | Revenue momentum |
| Revision Breadth | Analyst participation |
| Fundamental Quality | Quality assessment |
| Valuation | Relevant forward valuation |
| Expectation Level | Low / Fair / High |
| Historical Surprise | Recent earnings surprise history |
| Earnings Reaction | Historical market response |
| Relative Strength | Market positioning |
| External Dependency | Low / Medium / High |
| Binary Event Risk | Low / Medium / High |
| Earnings Driver | Structural / Operating / etc. |
| Earnings Revision Score | Sub-score |
| Earnings Quality Score | Sub-score |
| Expectation Gap Score | Sub-score |
| Earnings Setup Score | Sub-score |
| Biggest Risk | Primary disconfirming factor |
| Why Interesting | Concise research explanation |

---

# 18. Important Change from the Initial Concept

An initial approach considered a subjective:

```text
Positive Surprise Probability: 1–10
```

This should **not initially be treated as a genuine probability**.

A 1–10 number without a calibrated historical model creates false precision.

Instead, use:

```text
Earnings Surprise Setup Score
```

or the four transparent sub-scores.

Only after sufficient historical observations should UIQ consider a calibrated probability model.

---

# 19. Future Empirical Validation

Before introducing weights or machine learning, build a historical dataset.

For every historical earnings event:

```text
T-90
T-60
T-30
T-7
T-1
Earnings
T+1
T+5
T+20
```

Store:

- analyst estimates
- estimate revisions
- revenue revisions
- guidance
- valuation
- price
- relative strength
- volume
- fundamentals
- external dependency
- actual EPS
- actual revenue
- surprise
- price reaction

Then investigate:

1. Which factors predict an EPS beat?
2. Which factors predict a revenue beat?
3. Which factors predict a positive post-earnings reaction?
4. Which factors are redundant?
5. Which factors are regime-dependent?
6. Does external dependency materially reduce signal stability?
7. Does revision-price divergence add incremental information?
8. Do company-driven earnings setups outperform commodity-driven setups in signal stability?

Only after this validation should UIQ determine:

- weights
- thresholds
- nonlinear interactions
- Bayesian structure
- ML features

---

# 20. Potential UIQ Architecture

Conceptually:

```text
Market Data
     │
     ├── Price / Volume
     ├── Fundamentals
     ├── Analyst Estimates
     ├── Guidance
     ├── Earnings History
     ├── Sector Data
     └── Macro / Commodity / Event Data
             │
             ↓
     Earnings Data Layer
             │
             ↓
     ┌─────────────────────────────┐
     │ Earnings Feature Engine     │
     ├─────────────────────────────┤
     │ Revision Momentum            │
     │ Fundamental Quality          │
     │ Expectation Gap              │
     │ Market/Earnings Setup        │
     │ External Dependency          │
     └─────────────────────────────┘
             │
             ↓
     Deterministic Eligibility Gate
             │
             ↓
     Earnings Candidate Ranking
             │
             ↓
     Research / AI Explanation Layer
             │
             ↓
     Earnings Invest Output
```

The AI should explain the deterministic data rather than invent or select the candidates.

---

# 21. Deterministic Candidate Selection

The candidate-selection principle already established elsewhere in UIQ should apply here too.

```text
Primary list
     ↓
Deterministic eligibility gate
     ↓
Eligible pool
     ├── Rank 1–3 → Secondary list → AI sees these only
     └── Rank 4–5 → Reserve / audit → AI does not see these
```

The LLM has:

> **No Candidate Selection Authority.**

It may explain the selected candidates but must not:

- replace candidates
- add candidates
- remove candidates
- reorder candidates

unless a deterministic post-processing layer explicitly does so.

---

# 22. Initial Screening Philosophy

The strategy should seek:

> **High-quality earnings momentum with a relatively low degree of binary external dependency and a potentially favorable expectation gap.**

It should therefore prefer combinations such as:

```text
Strong revisions
+
Strong fundamentals
+
Moderate expectations
+
Constructive price action
+
Observable operating drivers
+
Low binary-event risk
```

over:

```text
Strong revisions
+
Commodity spike
+
Geopolitical catalyst
+
Extreme price momentum
+
Very high expectations
```

The latter can still be profitable, but the strategy should treat it as a materially different risk class.

---

# 23. Initial Priority Metrics

If implementation resources are limited, implement in this order.

## Priority 1

1. EPS Revision 30/60/90d
2. Revenue Revision 30/60/90d
3. Revision Breadth
4. Analyst Count
5. Consensus EPS
6. Consensus Revenue
7. Guidance vs Consensus
8. Historical EPS Surprise
9. Historical Revenue Surprise
10. Historical Earnings Reaction

## Priority 2

11. FCF
12. CFO / Net Income
13. Margin Trend
14. Forward P/E
15. FCF Yield
16. Historical valuation range
17. Revision / Price divergence
18. Relative Strength vs S&P 500 / sector

## Priority 3

19. Whisper EPS
20. Expected Move from Options
21. Options skew / positioning
22. Short interest
23. Institutional flow
24. More sophisticated macro/event dependency data

---

# 24. Key Design Principle

The most important conceptual addition is:

> **Do not ask only whether earnings estimates are rising. Ask why they are rising, how much of that improvement is already priced in, and how vulnerable the earnings thesis is to an external event.**

This creates three distinct questions:

### 1. Is the earnings trajectory improving?

`earnings_revision_score`

### 2. Is the improvement economically credible?

`earnings_quality_score`

### 3. Is the improvement potentially underappreciated by the market?

`expectation_gap_score`

And finally:

### 4. How much can an external event invalidate the thesis?

`external_dependency / binary_event_risk`

This fourth dimension is the explicit **risk-protection layer**.

---

# 25. Current Status

This strategy is currently a **research concept**, not a validated predictive model.

No claim should yet be made that:

- a given score predicts an earnings beat
- a given score predicts positive post-earnings returns
- IBKR will outperform
- commodity-sensitive companies will underperform
- external-dependency filters improve returns

Those propositions require historical testing.

The immediate objective should therefore be:

```text
Define → Collect → Backtest → Calibrate → Validate → Deploy
```

rather than:

```text
Define → Weight → Recommend
```

---

## 26. One-Sentence Definition

> **`earnings_invest` identifies high-quality companies with improving earnings expectations and a potentially favorable expectation gap, while explicitly penalizing or separating setups whose earnings thesis depends heavily on binary events, commodities, geopolitics, or other external factors.**
