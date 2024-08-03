
>**DISCLAIMER**
>
>This is MOCK customer data that was swapped in for the sake of the demo. No real or sensitive information is used.
>
>
---

## TL;DR

This is a custom data dashboard I built from scratch in React as a Product Manager, using disparate sources of data, to make the right product decisions.

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

Duck-taping all these disparate data sources together through org IDs and _very_ sketchy Python code, I manage to get useful data.

Next came the frontend. The mission was to create the views I needed as a PM to make smart decisions about which features were needed, which could be discarded, and in what order to prioritize each feature.


## Running it

- pull it
- `npm install`
- `npm start`


