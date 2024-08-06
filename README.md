
>**DISCLAIMER**
>
>This is MOCK customer data that was swapped in for the sake of the demo. No real or sensitive information is used.
>
>
---

## TL;DR

This is a custom data dashboard I built from scratch in React as a Product Manager, using disparate sources of data, to make the right product decisions.

This resulted in migrating customers 2x faster.

[Demo here](https://data-dashboard-omega.vercel.app/)

## The Problem

When I joined Nylas as a Product Manager, I was tasked with re-imagining, and in turn re-engineering, the Nylas Scheduler.

The biggest hurdle? The data pipelines for v2 had been shut off 1 year prior, leaving no relevant data left for me to pull.

This left me blind as a PM, with no insights on feature usage, customer use-cases, or revenue impact.

It's tough to build for the future when you don't know about the present.

## The Solution

I got creative with the data sources I could pull from. This included:

- database dumps (15gb of plaintext)
- excel sheets about customers
- exported Jira and Vitally data

Duck-taping all these disparate data sources together through org IDs and _very_ sketchy Python code, I managed to get useful data.

Next came the frontend. The mission was to create the views I needed as a PM to make smart decisions about which features were needed, which could be discarded, and in what order to prioritize each feature.

## The Outcome

Thanks to the cohort views (and the most-used feature view which unfortunately didn't make the demo ^), I was able to break-up the road to GA into 5 releases.

Each release unblocked a subset of customers, which allowed us to incrementally get users on Beta, while preventing a massive waterfall of features for the GA release.

Customer support teams managed to transition customers from v2 to v3 2x faster than the waterfall appraoch with the cohorts layed out.

## Running it

- pull it
- `npm install`
- `npm start`


