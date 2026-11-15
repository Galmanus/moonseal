# NASA Space Apps 2026: submission notes

| | |
|---|---|
| Event | NASA Space Apps Challenge 2026, Florianópolis, Brazil (in person, 14-15 November 2026) |
| Challenge | #11, Lunar Landing Site Navigator |
| Project | moonseal: Land on the right day. Keep control of your lander. |
| Code | <https://github.com/Galmanus/moonseal> (MIT) |

## The challenge, as we read it

Build a tool that helps compare lunar south-pole landing sites and dates by illumination and Earth visibility: where and when to land. The official statement is on the Space Apps Challenge site. No cryptography is required by the challenge.

## Summary

moonseal helps a mission to the Moon's south pole twice. Before landing, it shows which days a lander will have sunlight for power and a clear line to Earth for radio. After landing, it makes sure nobody can hijack it.

Why it is needed: at the south pole the Sun barely rises and Earth hides behind the mountains, so light and radio contact come and go. A lander that touches down on the wrong day can run out of power or go silent. Light there is that unforgiving: in March 2025 the lander Athena came down on its side in a cold crater where its solar panels could not catch the low Sun, and its 10-day mission ended in less than 13 hours.

What it does: pick any spot near the pole and how long the mission stays. moonseal checks every hour of 2026 and 2027 against the real terrain, using NASA's JPL Horizons and LRO LOLA data, and marks in green the good days to land. Then it guards the lander's commands: each one is signed with NIST's new signature standard, built to resist even future quantum computers, and checked in public on Solana's test network, so a changed, forged or replayed command is refused.

## How moonseal meets the challenge

| The challenge needs | Where it is in moonseal |
|---|---|
| Compare landing sites | Site panel and comparison view, a ranked list, or any point you tap (the browser ray-casts its skyline) |
| Compare dates | Date chip and timeline over 2026 and 2027; countdowns to the next sunset and Earthset |
| Illumination | Sun above the LOLA skyline per hour, sunlight %, longest night, shadows on the globe |
| Earth visibility | Earth above the skyline per hour, Earth %, longest blackout, Earth drawn in the skyline view |
| Real data | JPL Horizons (DE441), LRO LOLA, LROC WAC color, PGDA 5 m site DEMs ([data-sources.md](data-sources.md)) |
| Something a planner can act on | A verdict for a chosen mission length, the next good time to land, and the south-pole sites ranked on power, water and radio |

Methods and validation are in [planner.md](planner.md).

## What moonseal adds beyond the brief

The planner's green hours are also when the lander can hear Earth directly. moonseal follows that through to the first command:

- **No one else can forge or read it:** each command is signed with ML-DSA-65 and sealed with ML-KEM-768, NIST's standards designed to resist quantum computers ([post-quantum.md](post-quantum.md)).
- **The base decides who may command it, in public:** a program on Solana checks the signature against the base's list of authorized keys and a replay counter ([onchain.md](onchain.md)). It is live on devnet, Solana's test network, with public records of an authorized command and of refused forged and replayed ones.
- **A hybrid seal:** your Solana wallet vouches for the post-quantum key with an ed25519 attestation.

## A five-minute walkthrough

1. Open `web/app.html` (see [quickstart.md](quickstart.md)). The Moon is lit by the real Sun for the current date.
2. Open the site list (☰) and pick **Connecting Ridge**. The panel shows sunlight, Earth visibility, the longest night and a verdict for your mission length.
3. Drag the timeline and watch the shadows move. Press **◐** to see where the Sun and Earth are above the horizon.
4. Press **Stand here** for the skyline, with the Sun and Earth on it.
5. Compare with **Malapert Massif** (Earth in view all year, by a 0.10° margin) and **de Gerlache Rim 2** (a 688 h night).
6. On the opening screen, open **Why the south pole** for the science, with sources.
7. Open **Command**. If Earth is below the skyline, press **Jump to the next contact window**. Press **Sign & send**, then **Check it on Solana**. The chain answers VERIFIED and AUTHORIZED, and the stations relay.
8. Switch the scenario to **Forged by an attacker**, **Replay an old command** or **Changed on the way** and send again. Each is refused at a different check, and the chain's refusals come with Explorer links.

## Use of artificial intelligence

An AI coding assistant (Claude) helped write and verify the code and these documents. All data is real NASA data; no imagery is AI-generated. Every number in the documentation comes from the cited datasets, the tests in this repository, or a recorded run.

## Limits we state up front

Terrain resolution (240 m), line of sight instead of a link budget, results that rest on thin margins, one representative point per candidate region, and an on-chain verifier that is tested but not audited. Details: [README](../README.md#limits) and [security.md](security.md).
