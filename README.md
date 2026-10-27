# USMail.ai

Prepare letters and postcards to print and mail through USPS. The agent uploads a document, sets recipients and print options, and generates a proof. Nothing is printed or charged until you approve the proof and price.

## Install

### Marketplace

After USMail.ai is listed (listing is a separate, human review — this repo does not submit itself):

1. Open **Customize** in the Cursor sidebar.
2. Find **USMail.ai**.
3. Choose **Install**, then a user or project scope.
4. Connect the `usmail` server when Cursor asks. That is OAuth (**Connect / Authorize**). **Added** is not authorization. This plugin does not use an API key.

### Local

Cursor loads a plugin copied into `~/.cursor/plugins/local` ([Test plugins locally](https://cursor.com/docs/plugins)):

1. Copy this repo into `~/.cursor/plugins/local/usmail`. The folder must contain `.cursor-plugin/plugin.json`.
2. Copy the files in. A symlink that points at a checkout outside `~/.cursor/plugins/local` is skipped.
3. Restart Cursor, or run **Developer: Reload Window**.
4. Open **Customize** and confirm **USMail.ai**, the `usmail` MCP server, and the `usmail-mcp` skill.
5. Connect `usmail` with OAuth.

On Enterprise, local plugin imports are off until an admin turns on **Allow Local Plugin Imports** (Dashboard → Settings → Security & Identity → Marketplace and Plugins). If a marketplace plugin named `usmail` is already installed, that install wins over the local copy.

### Team

Teams and Enterprise can import a Git repo as a team marketplace ([Add a team marketplace](https://cursor.com/docs/plugins)):

1. Open **Dashboard → Plugins & MCPs**.
2. Under **Team Marketplaces**, choose **Add Marketplace**.
3. Choose **Import from Repo** and paste `https://github.com/usmail-ai/usmail-cursor-plugin`.
4. Add **USMail.ai** to that marketplace and set who can install it.
5. Each person installs it from **Customize** (unless an admin set it Default On or Required), then connects `usmail` with OAuth.

This repository is one plugin. It does not ship a multi-plugin `marketplace.json`.

## MCP

One production server, `usmail`, at `https://app.usmail.ai/mcp`. Auth is OAuth. No API key is stored in this repo.

The listing logo is `assets/logo.png` (1024×1024), the envelope mark.

## What agents can do

The `usmail-mcp` skill follows [the app skills](https://www.usmail.ai/skills.md):

- Prepare a letter or postcard: upload, recipients, one print option at a time, and a proof.
- Stop at the proof. Generating a proof is not approval.
- Show address-quality results. The person fixes, ignores, or still mails on the app. The agent does not rewrite addresses.
- Hand approval to the person. With no postage grant, they use **Pay & Approve** on the app.
- A postage grant is optional and stays off until the person asks for one, at a cap they choose.

The agent does not approve production mail on its own, run card deposits, or do EDDM.

## Notes

A mailing is a physical good. A human approves and pays for each mailing on the app; a meter balance is optional. Nothing is printed or charged until a person approves the proof and the price.

## Docs

- Product: [https://www.usmail.ai](https://www.usmail.ai)
- Privacy: [https://www.usmail.ai/privacy](https://www.usmail.ai/privacy)
- Terms: [https://www.usmail.ai/terms](https://www.usmail.ai/terms)
- MCP: [https://www.usmail.ai/docs/mcp](https://www.usmail.ai/docs/mcp)
- Live agent instructions: [https://www.usmail.ai/skills.md](https://www.usmail.ai/skills.md)

## License

MIT. See [LICENSE](LICENSE).

Publisher: USMail.ai (info@usmail.ai)
