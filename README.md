# aj ![ci status](https://github.com/cptrodgers/aj/actions/workflows/test-and-build.yml/badge.svg)

aj is a one-stop solution for your background jobs based on actix.

## Features & Docs

- [x] Jobs.
  - [x] Run: Instant, Schedule At, Cron
  - [x] Update Job
  - [x] Cancel Job
  - [ ] Get job information
- [x] Retry
  - [x] Customizable failed and retry logic.
  - Configurable:
    - [x] Max times
    - [x] Strategy:
      - [x] Interval Strategy
      - [x] Exponential Strategy
- [x] Async (execution).
- [x] Persistent.
- [x] Customize Backend with `Backend` trait.
  - [x] Native Supported: Redis (Production in mind), In-memory (testing purpose).
  - [x] `Backend` trait: you can implement your backend by your demand.
- [x] Custom job handler speed.
  - [x] Queue Scan Speed.
  - [x] Deliverable
- [ ] Admin Dashboard (UI)

[examples](https://github.com/zenclasshq/aj/tree/master/examples)

## Using by:

- [ZenClass](https://zenclass.co): ZenClass is an education platform that help you build your class - especially class assignments. 
    - Reminders
    - Auto Version History.
    - etc.

Please contact me via rodgers@zenclass.co if you want to update the list.

## LICENSE

<sup>
Licensed under either of <a href="LICENSE-APACHE">Apache License, Version
2.0</a> or <a href="LICENSE-MIT">MIT license</a> at your option.
</sup>

<br>

<sub>
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in aj by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
</sub>
