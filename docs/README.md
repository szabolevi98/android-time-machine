# Documentation

[← Back to the project README](../README.md)

## Guides

How the project works today. Code comments point to these.

| File | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | How the code is laid out and where to change an app |
| [sources.md](sources.md) | How the factory images are unpacked and the generated files rebuilt |
| [saved-state.md](saved-state.md) | What each version saves in the browser, and how old saves are upgraded |
| [demo-data.md](demo-data.md) | The shared used-phone content every version starts with |
| [maintenance.md](maintenance.md) | Publishing, cache-busting, social preview images, the sitemap and adding a version |

## Features per version

What each version does, screen by screen.

| Version | Features | Visual audit |
| --- | --- | --- |
| 2.1 Eclair | [features/2.1.md](features/2.1.md) | — |
| 2.3.6 Gingerbread | in its audit | [audits/2.3.6.md](audits/2.3.6.md) |
| 4.0.4 Ice Cream Sandwich | [features/4.0.4.md](features/4.0.4.md) | [audits/4.0.4.md](audits/4.0.4.md) |
| 4.3 Jelly Bean | [features/4.3.md](features/4.3.md) | [audits/4.3.md](audits/4.3.md) |
| 4.4.4 KitKat | [features/4.4.4.md](features/4.4.4.md) | [audits/4.4.4.md](audits/4.4.4.md) |
| 5.1.1 Lollipop | [features/5.1.1.md](features/5.1.1.md) | [audits/5.1.1.md](audits/5.1.1.md) |
| 6.0.1 Marshmallow | [features/6.0.1.md](features/6.0.1.md) | — |
| 7.1.2 Nougat | [features/7.1.2.md](features/7.1.2.md) | — |

The visual audits are the running comparison logs against AOSP, the factory images and period screenshots, with the
differences that remain; their screenshots are in `audits/screenshots/`. 2.1, 6.0.1 and 7.1.2 were built from their
images under the rules of their plans instead; their checks are recorded in those plans (7.1.2's release check also in
[reports/release-7.1.2.md](reports/release-7.1.2.md)).

## Plans

Work plans and checklists, kept as a record; most are finished.

| File | What it is |
| --- | --- |
| [plans/2.1.md](plans/2.1.md) | Nexus One 2.1: build rules and steps (done) |
| [plans/6.0.1.md](plans/6.0.1.md) | Nexus 5X 6.0.1: build rules and steps (done) |
| [plans/7.1.2.md](plans/7.1.2.md) | Nexus 6P 7.1.2: build rules and steps (done) |
| [plans/7.1.2-remaining.md](plans/7.1.2-remaining.md) | 7.1.2's final release checklist (done) |
| [plans/todo-all-versions.md](plans/todo-all-versions.md) | Changes that touch every version |
| [plans/audit-2026-10.md](plans/audit-2026-10.md) | The October 2026 audit work plan (Hungarian; closed) |
| [plans/handoff-limits-2026-10-23.md](plans/handoff-limits-2026-10-23.md) | Handoff note for the simulator-limits work, 2026-10-23 (Hungarian) |

## Folders

| Folder | Contents |
| --- | --- |
| [tools/](tools/) | Scripts that extract, generate and check (factory images, strings, assets, covers, sitemap) |
| [templates/](templates/) | The `*.template.js` / `.css` files the generators fill in |
| [data/](data/) | Fixed inputs of the generators (image strings, asset sources …) |
| [reports/](reports/) | What the checks and generators write (text, asset and font checks, release reports …) |
