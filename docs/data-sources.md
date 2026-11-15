# Data sources

Every number and every pixel in moonseal comes from a NASA dataset or from a cited publication. This page lists each source, what moonseal uses it for, where it lives in the repository, and how to regenerate the derived files.

## NASA datasets

| Dataset | Used for | In this repository |
|---|---|---|
| **JPL Horizons, DE441** ([API](https://ssd.jpl.nasa.gov/api/horizons.api)) | Sun and Earth positions: a geocentric table of the sub-solar point, sub-Earth point and Earth-Moon range (target Moon `301`, observer `500@399`, frame `MOON_ME`), hourly 2026-2027; and topocentric azimuth and elevation at each curated site (`coord@301`), hourly through 2026 | `data/ephem/`, `data/horizons_year/`, `data/horizons_*.txt` (committed) |
| **LRO LOLA LDEM_75S_240M**, data set `LRO-L-LOLA-4-GDR-V1.0` ([LOLA data node, south pole](https://imbrium.mit.edu/BROWSE/LOLA_GDR/POLAR/SOUTH_POLE)) | Terrain horizons and slopes for every site south of 75° S; the polar cap geometry and its shadows | Download `LDEM_75S_240M.IMG` (about 28 MB) and `.LBL` into `data/lola/` |
| **NASA SVS CGI Moon Kit #4720** ([svs.gsfc.nasa.gov/4720](https://svs.gsfc.nasa.gov/4720)): LROC WAC color mosaic and LOLA `ldem_16` | The globe's color and relief, and the 4096 x 2048 height map used for terminator shadows | Download `lroc_color_poles_8k.tif` and `ldem_16.tif` into `data/moonkit_raw/` |
| **NASA PGDA LOLA 5 m/px south-pole site DEMs** ([product 78](https://pgda.gsfc.nasa.gov/products/78), [data](https://pgda.gsfc.nasa.gov/data/LOLA_5mpp/)), Barker et al. 2021 | Close-up terrain at four regions (tiles `Site01`, `Site23`, `SL2`, `Site07`), rendering only | Download `<tile>_surf.tif` into `data/pgda_raw/` |
| **NASA Blue Marble** (SVS #2915) | Earth's texture in the first-person view | `web/app/tex/earth_bluemarble_2k.jpg` (committed; source image `bluemarble-2048.png`) |

The derived files the site loads are committed: `web/ephem_data.js`, `web/sites_data.js`, `web/site_stats.js` and `web/app/tex/`. You only need the raw downloads to regenerate them.

PGDA notes that most pixels of its 5 m polar DEMs are interpolated. moonseal uses those tiles for rendering, not for any number it reports.

## Regenerating the derived files

Run from the repository root. `-I` runs Python in isolated mode.

```bash
python3 -I core/export_ephem.py                      # data/ephem/ table -> web/ephem_data.js
python3 -I core/export_sites.py                      # LOLA DEM -> web/sites_data.js (sites, horizons, slopes)
python3 -I core/export_stats.py data/horizons_year   # topocentric tables -> web/site_stats.js
python3 -I core/export_app_textures.py pole          # LOLA DEM -> web/app/tex/pole_*.i16
python3 -I core/export_app_textures.py globe         # Moon Kit -> color and normal textures
python3 -I core/export_app_textures.py heights       # ldem_16 -> web/app/tex/moon_height_4k.i16
python3 -I core/export_app_textures.py sitetiles     # PGDA tiles -> web/app/tex/site_*.i16, georeference-checked
```

`core/export_stats.py` also reads the curated sites' terrain horizons from `data/lola/horizons_terrain.json`, which is small and committed. `core/horizons.py` queries the JPL Horizons API and caches raw responses under `data/`, so the demo never depends on a live connection. `core/export_web.py` and `core/export_moon3d.py` build the data files of the first console (`web/windows_data.js`, `web/moon_dem.*`).

## Site coordinates

Each curated site's coordinates were read from the source recorded in `core/export_sites.py` and `web/sites_data.js`.

| Site | Latitude, longitude (E) | Source |
|---|---|---|
| Moon Base Zero (MoonDAO) | -89.4632, 222.5104 | [MoonDAO repository, `southpole.ts`, commit `0a9d527`](https://github.com/Official-MoonDao/MoonDAO/blob/0a9d527/ui/lib/lunar-atlas/southpole.ts) |
| Connecting Ridge | -89.45, 222.69 | The coordinates MoonDAO gives for its base site; the source URL was not recorded |
| Malapert Massif | -85.964, 357.681 | Kring (2025), JGR Planets 2024JE008905, NASA notional site, as recorded in `core/lola_horizon.py`; not re-verified |
| de Gerlache Rim 2 | -88.5157, 298.833 | [arXiv:2406.19863](https://arxiv.org/abs/2406.19863), Table 3, point 726; not re-verified |
| Peak Near Shackleton | -89.0118, 131.279 | [arXiv:2406.19863](https://arxiv.org/abs/2406.19863), Table 3, point 1005; not re-verified |
| IM-1 Odysseus (landed 2024) | -80.13, 1.44 | [NASA, LRO images Odysseus](https://www.nasa.gov/missions/lro/nasas-lro-images-intuitive-machines-odysseus-lander/) |
| IM-2 Athena (intended site, 2025) | -84.78, 29.13 | [LROC image 1401](https://www.lroc.asu.edu/images/1401) |
| Chandrayaan-3 Vikram (landed 2023) | -69.3741, 32.32 | [LROC image 1314](https://www.lroc.asu.edu/images/1314) |
| Apollo 11, 12, 14, 15, 16, 17 | see `web/sites_data.js` | [NSSDC, Apollo landing sites](https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html) |

## Sources cited in the "Why the south pole" explainer

The explainer (`web/app/why-pole.js`) numbers its sources on screen. They are:

1. NASA Science, "Shadows near the Moon's South Pole". <https://science.nasa.gov/resource/shadows-near-the-moons-south-pole/>
2. NASA Science, "Shackleton Crater's Illuminated Rim & Shadowed Interior". <https://science.nasa.gov/resource/shackleton-craters-illuminated-rim-shadowed-interior/>
3. NASA Science, "9 Phenomena NASA Astronauts Will Encounter at Moon's South Pole" (2024). <https://science.nasa.gov/solar-system/moon/phenomena-nasa-astronauts-will-encounter-at-moons-south-pole/>
4. NASA, "The Lunar South Pole Region" (Moon Base). <https://www.nasa.gov/reference/moonbase-environment/>
5. NASA release 09-215, "NASA Lunar Satellite Begins Detailed Mapping of Moon's South Pole" (2009). <https://www3.nasa.gov/home/hqnews/2009/sep/HQ_09-215_LRO_First_Light.html>
6. Colaprete et al., "Detection of water in the LCROSS ejecta plume", Science 330, 463-468 (2010). <https://doi.org/10.1126/science.1186986>
7. Li et al., "Direct evidence of surface exposed water ice in the lunar polar regions", PNAS 115, 8907-8912 (2018). <https://doi.org/10.1073/pnas.1802345115>
8. NASA, "How Will We Extract Water on the Moon?". <https://www.nasa.gov/general/how-will-we-extract-water-on-the-moon-we-asked-a-nasa-technologist-episode-47/>
9. NASA, "NASA Identifies Candidate Regions for Landing Next Americans on Moon" (19 Aug 2022). <https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/>
10. NASA, "NASA Provides Update on Artemis III Moon Landing Regions" (28 Oct 2024). <https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/>
11. NASA, "NASA Outlines Preliminary Artemis III Mission Plans" (13 May 2026). <https://www.nasa.gov/missions/artemis/artemis-3/nasa-outlines-preliminary-artemis-iii-mission-plans/>

## Use and credit

NASA data and imagery are used with credit to NASA and the teams behind them: JPL Horizons; the LRO LOLA and LROC teams; NASA's Scientific Visualization Studio; NASA GSFC's PGDA. moonseal is not endorsed by NASA. MoonDAO's base coordinates are facts taken from its public repository; moonseal is not affiliated with or endorsed by MoonDAO.
