# Read-only legacy CMS connectivity diagnostic

Run this on your own device if the WordPress connector can list the SAS legacy site but its post API returns 404:

```powershell
node scripts/legacy-origin-probe.mjs
```

The script sends **12 public GET probes**, with a 10-second timeout each, against the naked and `www` legacy domain hosts; no cookies, credentials, article bodies, or database access are used. It prints HTTP status, content type and same-domain redirect path, but does **not** follow redirects or download media. It is a diagnostic, **not** a content exporter. Respect the old host's operational limits; run once, not as an automated polling job.

Use the results to select one of three next steps:
- If `/wp-json/wp/v2/posts` returns JSON 200 from the correct canonical host, test a sanctioned WordPress export or REST pagination.
- If the public `/post/{id}` works but REST does not, verify the actual CMS or proxy architecture, then export from its administration panel.
- If both hosts fail or redirect externally, inspect DNS/hosting configuration with authorized administrators; do not try to bypass access controls.

Do not print environment variables or tokens when sharing results.
