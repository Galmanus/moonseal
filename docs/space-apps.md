# NASA Space Apps 2026: submission notes

| | |
|---|---|
| Event | NASA Space Apps Challenge 2026, Florianópolis, Brazil (in person, 14-15 November 2026) |
| Challenge | #11, Lunar Landing Site Navigator |
| Project | moonseal: Find the right day to land. Seal it on Solana. |
| Code | <https://github.com/Galmanus/moonseal> (MIT) |

## The challenge, as we read it

Build a tool that helps compare lunar south-pole landing sites and dates by illumination and Earth visibility: where and when to land. The official statement is on the Space Apps Challenge site. No cryptography is required by the challenge.

## Summary

moonseal finds the right day to land at the Moon's south pole, and seals what you find. It shows which days a lander will have sunlight for power and a clear line to Earth for radio; when you find a good one, it signs the finding with a post-quantum signature and records it in public on Solana, as proof of what was found and when.

Why it is needed: at the south pole the Sun barely rises and Earth hides behind the mountains, so light and radio contact come and go. A lander that touches down on the wrong day can run out of power or go silent. Light there is that unforgiving: in March 2025 the lander Athena came down on its side in a cold crater where its solar panels could not catch the low Sun, and its 10-day mission ended in less than 13 hours. A signed, public record lets anyone check, now or decades from now, which site and day a team found and when; a post-quantum signature keeps that proof valid after quantum computers arrive.

What it does: pick any spot near the pole and how long the mission stays. moonseal checks every hour of 2026 and 2027 against the real terrain, using NASA's JPL Horizons and LRO LOLA data, ranks the south-pole sites on power, water and radio, and marks in green the good days to land. Press Seal: the finding (the site, the landing day, the stay, what was measured, the data used) is signed with ML-DSA-65 (NIST FIPS 204) in the browser, and a program on Solana's test network verifies the signature on chain; the finding's bytes stay in the public transactions. Change one letter and the seal no longer matches.

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

A good landing site and day is a finding worth proving. moonseal seals it:

- **Signed post-quantum:** the finding is signed with ML-DSA-65 (NIST FIPS 204) in the browser ([post-quantum.md](post-quantum.md)); change one character and the signature no longer matches.
- **Verified in public on Solana:** the moonseal program checks the signature on chain and the finding's bytes stay in the public transactions ([onchain.md](onchain.md)). Live on devnet, Solana's test network: a sealed finding for Moon Base Zero, https://explorer.solana.com/tx/5UJiJvxASdziQg2SHoQTpEbPpyfZSNgNcXxkxDtDMH8kcN94M8j3gWVHxQH3s8qgQusgkPwJggZxhSZV17Keao2d?cluster=devnet.
- **A hybrid seal:** your Solana wallet vouches for the post-quantum key with an ed25519 attestation.

## A five-minute walkthrough

1. Open `web/app.html` (see [quickstart.md](quickstart.md)). The Moon is lit by the real Sun for the current date.
2. Open the site list (☰) and pick **Connecting Ridge**. The panel shows sunlight, Earth visibility, the longest night and a verdict for your mission length.
3. Drag the timeline and watch the shadows move. Press **◐** to see where the Sun and Earth are above the horizon.
4. Press **Stand here** for the skyline, with the Sun and Earth on it.
5. Compare with **Malapert Massif** (Earth in view all year, by a 0.10° margin) and **de Gerlache Rim 2** (a 688 h night).
6. On the opening screen, open **Why the south pole** for the science, with sources.
7. On a site, press **Seal this site on Solana**. The page signs the finding and shows it; press **Seal it on Solana**: about a dozen transactions on devnet end with SEALED, a seal id that matches the page, and links to the finding and to the VERIFIED transaction.
8. Press **Change one letter and check again**: the same signature no longer matches the edited finding.

## Use of artificial intelligence

An AI coding assistant (Claude) helped write and verify the code and these documents. All data is real NASA data; no imagery is AI-generated. Every number in the documentation comes from the cited datasets, the tests in this repository, or a recorded run.

## Limits we state up front

Terrain resolution (240 m), line of sight instead of a link budget, results that rest on thin margins, one representative point per candidate region, and an on-chain verifier that is tested but not audited. Details: [README](../README.md#limits) and [security.md](security.md).
