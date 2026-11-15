# NASA Space Apps 2026: submission notes

| | |
|---|---|
| Event | NASA Space Apps Challenge 2026, Florianópolis, Brazil (in person, 14-15 November 2026) |
| Challenge | #11, Lunar Landing Site Navigator |
| Project | moonseal: land in the light, command with a post-quantum seal |
| Code | <https://github.com/Galmanus/moonseal> (MIT) |

## The challenge, as we read it

Build a tool that helps compare lunar south-pole landing sites and dates by illumination and Earth visibility: where and when to land. The official statement is on the Space Apps Challenge site. No cryptography is required by the challenge.

## Summary

Mission planners choosing a lunar south-pole landing site must know, per site and per date, when the Sun is up (power) and when Earth is above the horizon (direct-to-Earth contact). moonseal answers that in the browser, from real NASA data: a live Moon lit by the real Sun for any date, the south pole's LOLA terrain with ray-marched shadows, a skyline view from any site with the Sun and Earth on it, a two-year availability timeline, time to sunset and Earthset, and a plain-language verdict for a mission of N days. You can pick a curated site (NASA crewed-landing candidate regions, IM-1, IM-2, Chandrayaan-3, Apollo, MoonDAO's Moon Base Zero) or tap anywhere on the Moon.

It then follows the decision through to the first command. A command can only reach the lander inside a window the planner computes. moonseal signs it with ML-DSA-65 and encrypts it with ML-KEM-768, in the browser or natively in an Android app. A Solana program verifies the signature on chain and checks the base's registry before an open network of ground stations may relay it.

## How moonseal meets the challenge

| The challenge needs | Where it is in moonseal |
|---|---|
| Compare landing sites | Site panel and comparison view, a ranked list, or any point you tap (the browser ray-casts its skyline) |
| Compare dates | Date chip and timeline over 2026 and 2027; countdowns to the next sunset and Earthset |
| Illumination | Sun above the LOLA skyline per hour, sunlight %, longest night, shadows on the globe |
| Earth visibility | Earth above the skyline per hour, Earth %, longest blackout, Earth drawn in the skyline view |
| Real data | JPL Horizons (DE441), LRO LOLA, LROC WAC color, PGDA 5 m site DEMs ([data-sources.md](data-sources.md)) |
| Something a planner can act on | A verdict for a chosen mission length and a comparison across sites |

Methods and validation are in [planner.md](planner.md).

## What moonseal adds beyond the brief

The planner's output is a contact window. moonseal uses that window as the gate for the lander's commands, then protects the command itself:

- **Unforgeable and private for the mission's life:** ML-DSA-65 and ML-KEM-768 ([post-quantum.md](post-quantum.md)).
- **A policy no single operator holds:** a Solana program verifies the signature and applies the base's registry of authorized keys and replay counter ([onchain.md](onchain.md)). It is live on devnet, with receipts for an authorized command and for refused forged and replayed ones.
- **A hybrid seal:** your Solana wallet vouches for the post-quantum key with an ed25519 attestation.

## A five-minute walkthrough

1. Open `web/app.html` (see [quickstart.md](quickstart.md)). The Moon is lit by the real Sun for the current date.
2. Open the site list (☰) and pick **Connecting Ridge**. The panel shows sunlight, Earth visibility, the longest night and a verdict for your mission length.
3. Drag the timeline and watch the shadows move. Press **◐** to see where the Sun and Earth are above the horizon.
4. Press **Stand here** for the skyline, with the Sun and Earth on it.
5. Compare with **Malapert Massif** (Earth in view all year, by a 0.10° margin) and **de Gerlache Rim 2** (a 688 h night).
6. On the opening screen, open **Why the south pole** for the science, with sources.
7. Open **Command**. If Earth is below the skyline, press **Jump to the next contact window**. Press **Sign & send**, then **Verify the ticket on Solana**. The chain answers VERIFIED and AUTHORIZED, and the stations relay.
8. Switch the scenario to **Forged**, **Replay an old packet** or **Tampered in transit** and send again. Each fails at a different gate, and the chain's refusals come with Explorer links.

## Use of artificial intelligence

An AI coding assistant (Claude) helped write and verify the code and these documents. All data is real NASA data; no imagery is AI-generated. Every number in the documentation comes from the cited datasets, the tests in this repository, or a recorded run.

## Limits we state up front

Terrain resolution (240 m), line of sight instead of a link budget, results that rest on thin margins, one representative point per candidate region, and an on-chain verifier that is tested but not audited. Details: [README](../README.md#limits) and [security.md](security.md).
