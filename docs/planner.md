# Planner: methods and validation

## Abstract

moonseal estimates, for a site near the lunar south pole and any hour of 2026 or 2027, whether the Sun (power) and Earth (direct-to-Earth radio) are above the local terrain horizon. Sun and Earth directions come from JPL Horizons (DE441). The terrain horizon is ray-cast over the LOLA 240 m south-polar DEM in 360 one-degree azimuth bins, including the Moon's curvature. The in-browser planner reproduces the Python engine exactly for 2026 at five sites, and its ephemeris matches direct Horizons queries to within 0.0007° in elevation. In 2026, Connecting Ridge sees the Sun 91.2% of the time and Earth 50.9%, with a longest night of 101 h. Malapert Massif keeps Earth in view all year, but only by a 0.10° margin.

## 1. Problem

At the lunar poles the Sun stays within about 1.5° of the horizon and circles it once per lunar day [10]. Whether a site is lit, and whether Earth is above its skyline, is therefore decided by terrain kilometers away, not by latitude. A lander at the pole needs both: sunlight for power, and Earth above the skyline to talk to the ground directly. The planner answers, per site and per hour: is the Sun up, is Earth up, and how long are the gaps.

## 2. Data

| Input | What it gives | File |
|---|---|---|
| JPL Horizons, DE441: target Moon (301), observer Earth's centre (500@399), frame `MOON_ME`, east-longitude positive [1] | Sub-solar point, sub-Earth point and Earth-Moon range, hourly from 2026-01-01 to 2028-01-01 | `data/ephem/moon_subpoints_2026-2028_60min.txt` |
| JPL Horizons, DE441: target Sun (10) and Earth (399), observer at each curated site (`coord@301`) [1] | Topocentric azimuth and elevation, hourly through 2026 | `data/horizons_year/` |
| LOLA LDEM_75S_240M (`LRO-L-LOLA-4-GDR-V1.0`) [2] | South-polar DEM, 75° to 90° S, 240 m/px, 3812 x 3812, height = DN x 0.5 m above a 1737.4 km sphere | `data/lola/` (download, see [data-sources.md](data-sources.md)) |
| NASA PGDA LOLA 5 m/px site DEMs [3] | High-resolution terrain around four candidate regions, used for rendering only | `web/app/tex/site_*.i16` |
| NASA SVS CGI Moon Kit #4720 [4] | LROC WAC color mosaic and LOLA `ldem_16`, used for rendering only | `web/app/tex/` |

## 3. Method

### 3.1 Sun and Earth directions

`core/export_ephem.py` packs the geocentric Horizons table into `web/ephem_data.js`. From the sub-solar point, the sub-Earth point and the Earth-Moon range, `web/app/ephem.js` computes the azimuth and elevation of the Sun and Earth for any lunar site and hour, including Earth's topocentric parallax. This is what lets you drop a pin anywhere and pick any date without a server.

The engine (`core/export_stats.py`) uses separate topocentric Horizons tables queried directly at each curated site, so the browser's conversion can be checked against Horizons itself (section 4.1).

### 3.2 Terrain horizon

`core/lola_horizon.py` computes, for a site, `horizon[azimuth]`: the highest elevation angle subtended by terrain in each one-degree azimuth bin, measured east of north, with the Moon's curvature included.

Two properties matter:

- **The horizon can be negative.** A site standing above the reference sphere sees the bare-sphere limb below its local horizontal, by a dip of `arccos(R / (R + h))`. Clamping the horizon at 0° erases that dip and darkens exactly the high ridges chosen for sunlight. An early version clamped; the fix came with a failing test first (`core/tests/test_horizon.py::test_elevated_sites_see_below_zero`).
- **Near terrain must be sampled finely.** A steep wall next to the site can rise above anything far away. The ray-cast takes, per bin, the maximum of a pixel-binned pass and a continuous ray march, so a nearby uphill wall is not undersampled (`test_uphill_wall_is_not_undersampled`).

Where the DEM ends (75° S), the horizon falls back to the sphere's limb (`test_short_coverage_falls_back_to_sphere_limb`).

### 3.3 Visibility rule

A body at azimuth `az` and elevation `el` is visible when `el > horizon[round(az)]`, using the centre of its disk. The Sun's partial disk and Earth's partial disk near the skyline are not modeled.

### 3.4 Metrics

Over a period sampled hourly (`core/export_stats.py`, mirrored in `web/app/model.js`):

| Metric | Definition |
|---|---|
| Sun % / Earth % | Share of hours with the body visible |
| Sun and Earth % | Share of hours with both visible |
| Longest night | Longest continuous run of hours without the Sun |
| Longest blackout | Longest continuous run of hours without Earth |
| Minimum Sun / Earth margin | Lowest value of `el - horizon` over the period (`min_sun_margin_deg`, `min_earth_margin_deg`) |

Runs are truncated at the edges of the period.

### 3.5 Rendering

Rendering does not feed the numbers, but it is built from the same data. The globe uses the LROC WAC color mosaic with relief from LOLA `ldem_16`, including terminator shadows ray-marched over a 4096 x 2048 height map. The polar cap is real LOLA geometry with shadows ray-marched toward the real Sun, with a penumbra the width of the 0.53° solar disk. Site close-ups use the PGDA 5 m DEMs, resampled to 2048 x 2048 tiles of 7.8 to 10.3 m.

## 4. Validation

### 4.1 Ephemeris

The browser's Sun and Earth elevations were compared with direct JPL Horizons topocentric queries at 4 sites, for every hour of 2026. Maximum elevation error: 0.0007°.

### 4.2 Engine parity

The in-browser planner reproduces the Python engine exactly for 2026 at 5 sites, on four quantities: sunlight %, Earth %, longest night and longest blackout.

### 4.3 Terrain horizon in the browser

For a dropped pin, the browser ray-casts the skyline itself. At the curated sites, that skyline is within 0.06° to 0.8° RMS of the engine's.

### 4.4 High-resolution tiles

Each PGDA 5 m tile was georeference-checked against the 240 m DEM before use. The median absolute difference was 9 to 17 m, against 585 to 6,247 m for mirrored alternatives (`core/export_app_textures.py sitetiles`).

### 4.5 An independent model

MoonDAO's open-source Moon Base Zero scene runs the Sun on phases rather than dates. At the base's coordinates, moonseal's peak Sun elevation is 2.05° against their 2.08°. Earth really moves between -7.5° and +6.2°, where their scene fixes it at 8.02°.

### 4.6 Something not reproduced

A NASA LCRNS presentation gives a 17-43% direct-to-Earth availability band. moonseal's line of sight does not reproduce it. With a 5° antenna mask, Malapert comes out at 41.2%, but the source does not state its mask, so the comparison is open.

## 5. Results: 2026

Hourly, 1 January 2026 to 1 January 2027, from `web/site_stats.js`. Sites marked "sphere" lie outside the LOLA 75° S coverage and use the bare-sphere horizon.

| Site | Latitude, longitude (E) | Sun % | Earth % | Both % | Longest night | Longest blackout |
|---|---|---|---|---|---|---|
| Connecting Ridge | -89.45, 222.69 | 91.2 | 50.9 | 49.4 | 101 h | 327 h |
| Malapert Massif | -85.964, 357.681 | 81.0 | 100.0 | 81.0 | 277 h | 0 h |
| de Gerlache Rim 2 | -88.5157, 298.833 | 22.3 | 50.1 | 15.5 | 688 h | 334 h |
| Peak Near Shackleton | -89.0118, 131.279 | 16.9 | 33.6 | 4.8 | 642 h | 442 h |
| IM-1 Odysseus (landed 2024) | -80.13, 1.44 | 41.9 | 100.0 | 41.9 | 446 h | 0 h |
| IM-2 Athena (intended site, 2025) | -84.78, 29.13 | 45.8 | 80.2 | 37.9 | 456 h | 143 h |
| Chandrayaan-3 (sphere) | -69.3741, 32.32 | 50.7 | 100.0 | 50.7 | 369 h | 0 h |
| Apollo 11 (sphere) | 0.67416, 23.47314 | 50.9 | 100.0 | 50.9 | 355 h | 0 h |

Moon Base Zero (MoonDAO), at -89.4632, 222.5104, 402 m from the Connecting Ridge point, computed by the in-browser planner: Sun 85.5%, Earth 50.8%, longest night 116 h.

Reading the table:

- **Small moves matter.** Moon Base Zero gets 85.5% sunlight; the Connecting Ridge point, 402 m away, gets 91.2%.
- **Earth visibility is not latitude.** Malapert, on the Earth-facing side, never loses Earth. Connecting Ridge loses it for up to 327 h at a time.
- **Night length drives the battery.** The longest night ranges from 101 h at Connecting Ridge to 688 h at de Gerlache Rim 2.

## 6. Uncertainty and limitations

- **Resolution.** The horizon comes from a 240 m DEM. Features smaller than that, including boulders and local slopes, are not resolved. The first-person foreground is coarse for the same reason.
- **Disk centre.** Visibility uses the centre of each disk. Near transitions, part of the Sun or of Earth can be above the skyline while the rule says no, or the reverse.
- **Thin margins.** Malapert's year-round Earth view rests on a 0.10° worst-hour margin (`min_earth_margin_deg` in `web/site_stats.js`). A small DEM error could break it.
- **Hourly sampling.** Run lengths are accurate to about one hour.
- **Line of sight only.** "Earth visible" is geometry, not a link budget: no antenna mask, no power, no data rate.
- **Representative points.** NASA's candidate regions are areas [5, 6]. Each is represented by one point from a cited source. Connecting Ridge uses the coordinates MoonDAO gives for its base (the source URL was not recorded). de Gerlache Rim 2 and Peak Near Shackleton come from [7] and Malapert Massif from [8], as recorded in `core/lola_horizon.py`; these points were not re-verified against the papers. Peak Near Shackleton's 16.9% sunlight is low for a candidate region and may say more about the point than about the region.
- **Time span.** The ephemeris table covers 2026 and 2027.
- **High-resolution tiles.** The PGDA 5 m DEMs interpolate most of their pixels [3]. They are used for rendering, not for the numbers above.

## References

1. NASA JPL, Horizons System API. <https://ssd.jpl.nasa.gov/api/horizons.api>
2. LRO LOLA Gridded Data Records, south pole, polar stereographic (LDEM_75S_240M). <https://imbrium.mit.edu/BROWSE/LOLA_GDR/POLAR/SOUTH_POLE>
3. NASA PGDA, High-Resolution LOLA Topography for Lunar South Pole Sites. <https://pgda.gsfc.nasa.gov/products/78>. Barker et al. (2021), Planetary and Space Science 203, doi:10.1016/j.pss.2020.105119.
4. NASA Scientific Visualization Studio, CGI Moon Kit (#4720). <https://svs.gsfc.nasa.gov/4720>
5. NASA, "NASA Identifies Candidate Regions for Landing Next Americans on Moon" (19 Aug 2022). <https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/>
6. NASA, "NASA Provides Update on Artemis III Moon Landing Regions" (28 Oct 2024). <https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/>
7. arXiv:2406.19863, Table 3. <https://arxiv.org/abs/2406.19863>
8. Kring (2025), JGR Planets, 2024JE008905.
9. MoonDAO, `ui/lib/lunar-atlas/southpole.ts`, commit `0a9d527`. <https://github.com/Official-MoonDao/MoonDAO/blob/0a9d527/ui/lib/lunar-atlas/southpole.ts>
10. NASA Science, "Shadows near the Moon's South Pole". <https://science.nasa.gov/resource/shadows-near-the-moons-south-pole/>
