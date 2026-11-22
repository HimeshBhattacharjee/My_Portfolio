# EmailJS setup: contact form → bhattacharjeehimesh@gmail.com

How the portfolio's contact form delivers messages, what the code does, and how the EmailJS
dashboard is configured. The integration is complete and working; the steps below are kept as a
reference for re-creating or auditing it.

```
Visitor → contact form → EmailJS (browser SDK) → connected email service → bhattacharjeehimesh@gmail.com
```

## Status

| Item | Status |
| --- | --- |
| Code implementation | **Done** (`src/components/Contact.jsx`, `@emailjs/browser` 4.4.1) |
| Dashboard configuration | **Done.** Service and template configured by Himesh in the EmailJS dashboard. |
| Email delivery tested | **Yes.** Tested by Himesh through the local portfolio. |
| Email delivery verified | **Yes.** Messages arrive at `bhattacharjeehimesh@gmail.com` (confirmed by Himesh, 21 Nov 2026). |
| Code re-audit (21 Nov 2026, final refinement) | Done, no changes needed. The form sends only `name`, `email`, `subject`, `message`, `time`, `source` (plus legacy copies `from_name`, `from_email`, `reply_to`); no recipient and no private key anywhere in the code or bundle. The three `VITE_EMAILJS_*` variables are set in `.env.local` (values not inspected or printed). |

## Before deploying

- **Netlify:** add the three `VITE_EMAILJS_*` variables (section 4) with the same values as
  `.env.local`, then deploy. Vite embeds them at build time.
- **Allowed origins:** make sure `https://himeshb.netlify.app` is listed (section 3). If
  `http://localhost:5173` was added for local testing, remove it once you no longer need it.
- **Tidy-up (optional):** `.env.local` still contains `VITE_CONTACT_TO_EMAIL`, from an earlier
  version. Nothing reads it; you can delete it, and don't add it in Netlify.

The recipient is fixed in the template's **To Email** field (section 2), never sent from the browser,
so a visitor can't redirect messages.

## 1. Email service

EmailJS dashboard → **Email Services**.

- Check that a service is connected and working. A Gmail service connected to
  `bhattacharjeehimesh@gmail.com` is the simplest option.
- Note its **Service ID**. It goes in `VITE_EMAILJS_SERVICE_ID`.

## 2. Email template

EmailJS dashboard → **Email Templates** → open the template whose ID is in
`VITE_EMAILJS_TEMPLATE_ID`, or create one and use its ID.

**Settings** (right-hand panel):

| Field | Value |
| --- | --- |
| To Email | `bhattacharjeehimesh@gmail.com` (typed literally, **not** a `{{variable}}`) |
| From Name | `{{name}}` |
| From Email | Leave on **Use Default Email Address** (the connected service's own address). Don't use the visitor's address here: providers reject or spam-file mail that claims to come from someone else's domain. |
| Reply To | `{{email}}` (pressing Reply in Gmail then answers the visitor) |
| Cc / Bcc | Empty |

**Subject**

```
Portfolio enquiry — {{subject}}
```

**Content.** Switch the editor to code view and paste:

```html
<div style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 1.55; color: #1f2328; max-width: 600px;">
  <p style="margin: 0 0 16px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">New message from your portfolio</p>
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 0 0 20px;">
    <tr><td style="padding: 6px 12px 6px 0; color: #6b7280; width: 90px; vertical-align: top;">Name</td><td style="padding: 6px 0;">{{name}}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; color: #6b7280; vertical-align: top;">Email</td><td style="padding: 6px 0;">{{email}}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; color: #6b7280; vertical-align: top;">Subject</td><td style="padding: 6px 0;">{{subject}}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; color: #6b7280; vertical-align: top;">Sent</td><td style="padding: 6px 0;">{{time}}</td></tr>
  </table>
  <div style="padding: 16px; border-left: 3px solid #45d9f2; background: #f6f8fa; white-space: pre-wrap;">{{message}}</div>
  <p style="margin: 20px 0 0; font-size: 12px; color: #6b7280;">{{source}} · Reply to this email to answer {{name}} directly.</p>
</div>
```

Use **double** braces everywhere, as above. EmailJS HTML-escapes `{{double}}` variables. Triple
braces `{{{ }}}` insert raw HTML and would let a visitor inject markup into your inbox.

Save the template.

### Variables the form sends

| Variable | Content | Limit |
| --- | --- | --- |
| `name` | Visitor's name | 80 characters |
| `email` | Visitor's email (validated format) | 254 |
| `subject` | Subject line | 120 |
| `message` | Message, line breaks kept | 4,000 (minimum 10) |
| `time` | Submission time, e.g. `21 Nov 2026, 14:05 IST` | — |
| `source` | `Portfolio contact form · https://himeshb.netlify.app/` | — |
| `from_name`, `from_email`, `reply_to` | Copies of `name` and `email`, kept so a template still using the old names keeps working. Can be removed from the code once the template uses the names above. | — |

All values are trimmed, and control characters are stripped (line breaks in the message are kept)
before sending. **No recipient is sent.**

## 3. Security (Account → Security)

- **Allowed origins / domains:** add `https://himeshb.netlify.app`. While testing locally, also add
  `http://localhost:5173`, and remove it again afterwards. Requests from any other site are then
  refused, even though the public key is visible in the bundle.
- **Private key / "Use Private Key":** keep this **off**. This is a browser-only integration, and the
  private key must never be put in the site or in any `VITE_` variable.
- **Rate limiting / quotas:** check your plan's monthly email quota and any rate-limit settings the
  dashboard offers. When the quota runs out, sends fail and visitors see the error message with the
  direct email link.
- **CAPTCHA:** EmailJS can require reCAPTCHA v2 per template. The code **doesn't** implement this, so
  leave it **off**. Turning it on without code changes would make every send fail. It can be added
  later if spam becomes a problem.

## What the code does to limit abuse

- A **honeypot** field, invisible to people. If it's filled in, nothing is sent and the visitor is
  shown the failure message with the direct address, in case browser autofill filled it.
- **Client-side throttle:** one message per minute per browser, enforced in the component and by the
  SDK's `limitRate` option.
- `blockHeadless: true`: the SDK refuses to send from headless (automated) browsers.
- Length limits and email-format validation on every field. Empty fields are blocked.

These measures only stop casual misuse. The real protection is the allowed-origins restriction and
EmailJS's own limits, configured in the dashboard.

## Form behaviour

| State | What the visitor sees |
| --- | --- |
| Idle | The form. |
| Invalid | Field-level messages; focus moves to the first field to fix. Nothing is sent. |
| Sending | The button reads "Sending" with a small progress indicator. Fields and button are disabled, so the form can't be submitted twice. |
| Sent | Shown **only after EmailJS confirms** the request. The form is cleared only now. |
| Failed | A clear error plus a direct `mailto:` link to `bhattacharjeehimesh@gmail.com`. The form keeps what the visitor typed. |

Status messages are in a polite live region, so screen readers announce them.

EmailJS accepting a message doesn't guarantee instant delivery: the connected email provider decides
when the email arrives, and it may land in spam the first time. Mark the first one as "Not spam".

## 4. Netlify environment variables

Netlify → Site configuration → Environment variables. These values are public in the built bundle by
design:

| Name | Value |
| --- | --- |
| `VITE_EMAILJS_SERVICE_ID` | Service ID from step 1 |
| `VITE_EMAILJS_TEMPLATE_ID` | Template ID from step 2 |
| `VITE_EMAILJS_PUBLIC_KEY` | Account → General → Public Key |

Redeploy after changing them: Vite reads them at build time. If any is missing, the form says it
isn't configured and offers the direct email link.

## 5. Testing delivery (already done; repeat after any dashboard change)

1. Finish steps 1 to 3.
2. Run `npm run dev`, with `http://localhost:5173` temporarily in Allowed origins, or test on the
   deployed site.
3. Send one message with your own second address as the visitor email.
4. Check that:
   - it arrives at `bhattacharjeehimesh@gmail.com` (look in spam the first time);
   - the subject reads `Portfolio enquiry — <your subject>`;
   - name, email, subject, time and message are all filled in;
   - pressing **Reply** addresses the visitor's email.
5. Then update the status table at the top of this file.
