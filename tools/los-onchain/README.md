# Line of sight on Solana

Is Earth in view from a point on the Moon at a given hour? This program answers inside one transaction, with the same geometry the site uses: `web/app/ephem.js` (`azel`) for Earth's direction and `web/app/model.js` (`hzAt`) for the skyline.

- Earth's direction comes from the sub-Earth point and the Earth-Moon distance (JPL Horizons DE441, Moon-fixed frame), with topocentric parallax from the site's radius (sphere R = 1737.4 km plus the site's elevation).
- The skyline is the point's terrain horizon (LRO LOLA) in equal azimuth bins, nearest-lower bin.
- Earth is in view when its centre clears the skyline. The program logs `IN VIEW` or `HIDDEN` with the elevation, the skyline, the azimuth and the margin, and returns them as return data.

Live on Solana devnet: [`GKs2P6bWKSnyCzrTsc7LcEp7MjUdCE4RaDYnynNiTWB5`](https://explorer.solana.com/address/GKs2P6bWKSnyCzrTsc7LcEp7MjUdCE4RaDYnynNiTWB5?cluster=devnet). Two answers asked from the site:

| Point, hour | Answer | Transaction |
|---|---|---|
| Moon Base Zero, 2 April 2026 19:00 UTC | HIDDEN, margin -4.318° | [`5wUzwwhJ...`](https://explorer.solana.com/tx/5wUzwwhJHEporAqHfxnJJoXFA6ryFuPCqoppzjJbn5ZzSDvFUS2tFYCzwAz3hn2ruUFXfnjmMsdB1wFZ8Rr97JEf?cluster=devnet) |
| Connecting Ridge, 31 January 2026 11:00 UTC | IN VIEW, margin 5.186° | [`aJcU1Qvn...`](https://explorer.solana.com/tx/aJcU1Qvn9nMtb7SsSX4x3hvF6j4FPYDJ9rppqJxFwPUw8ChDFMd1o7MYdjpkxwCcxqBzkojNhDekh4c6TC2yyR6?cluster=devnet) |

## Instruction

One instruction, no accounts. Little-endian, 31 + 2n bytes:

| Bytes | Field |
|---|---|
| 1 | tag = 1 |
| 4 + 4 | point latitude and east longitude, i32 microdegrees |
| 4 | point elevation, i32 metres |
| 4 + 4 | sub-Earth latitude and east longitude, i32 microdegrees |
| 4 | Earth-Moon distance, u32 metres |
| 4 | hour since 2026-01-01T00:00Z, u32 |
| 2 | n, the number of skyline bins (1 to 720) |
| 2n | skyline, i16 millidegrees |

The client is `checkLineOfSight` in `solana/client/moonseal-onchain.mjs`; the site calls it from "Ask Solana" in a site's answer.

## Tests

```bash
node tools/los-onchain/gen-fixtures.mjs        # from the repository root: tests/fixtures.rs from the site's own code
cd tools/los-onchain
cargo test --test los                          # the arithmetic against the site's, 7 sites x 10 hours
cargo build-sbf && cargo test --test svm       # every case through the compiled program in the Solana VM (LiteSVM)
```

Measured: over the 70 cases, the program and the site differ by at most 0.000001° in elevation and 0.000000° in azimuth, and give the same answer. In the Solana VM each check takes at most 151,029 compute units (the default budget is 200,000) and a 921-byte transaction (the limit is 1,232).

## Limits

The inputs travel in the instruction: the program does the geometry, it does not store the ephemeris or the terrain map, which do not fit on chain. A caller could send wrong inputs; anyone can check them against JPL Horizons and LOLA, and the transaction keeps them in public.
