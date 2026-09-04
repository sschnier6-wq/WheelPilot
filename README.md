# WheelPilot

A GitHub Pages–ready Wheel Strategy companion: scan cash-secured puts and covered calls, walk one contract at a time through the wheel, and log **recommended vs. actual** fills.

This is an original educational tool inspired by the *kind* of workflow income traders use (scanner + journal + metrics). It is **not** affiliated with ThetaScanner or E*TRADE. Options involve risk and are not suitable for everyone.

## Publish on GitHub Pages

1. Create a new GitHub repo.
2. Upload these files to the **root** of the repo (flat — do not nest them in a folder):
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
   - `README.md`
3. Repo → **Settings** → **Pages** → Source: **Deploy from a branch** → `main` / `/ (root)`.
4. Open `https://<you>.github.io/<repo>/`.

All trades, watchlists, filters, and settings save in your browser (`localStorage`). Nothing is uploaded to a server.

## How to use

1. Set buying power on the **Dashboard**.
2. Open **Wheel** and stay on one tab at a time:
   - **1 · Find Put** — filter the demo chain and pick a recommended CSP.
   - **2 · Log Put** — enter the contract you actually sold at E\*TRADE.
   - **3 · Put Live** — expire it, close it, or mark assignment.
   - **4 · Find Call** — get a covered-call suggestion against assigned shares.
   - **5 · Log Call** — enter the call you actually sold.
   - **6 · Call Live** — expire, close, or mark called-away and start the next cycle.
3. Review **Journal** and **Analytics** (assignment rate, call-away rate, avg DTE, premium/day, annualized yield, equity curve).

## Data note

GitHub Pages cannot call paid options APIs from the browser without keys and CORS. WheelPilot ships with a **liquid demo universe** (prices and contracts regenerate consistently from a daily seed so the UI stays usable offline). Treat suggestions as a practice tape, then type your real E\*TRADE fills into the Log tabs.

## License

Use and modify freely for personal trading journals.
