# Changelog

All notable changes to this plugin will be documented here.

## 0.3.2

- Listing logo is the envelope only (`assets/logo.png`, 1024×1024): the blue envelope and its speed stripes, redrawn with a thin white outline so the same colors hold on a light or dark tile. No wordmark, .AI badge, or stripe band. The plugin name is already the title next to the logo.

## 0.3.1

- Logo matches www.usmail.ai favicon.

## 0.3.0

- Marketplace description: Prepare letters and postcards to print and mail through USPS.
- Logo is the 2026 full-color USMail.ai wordmark (`assets/logo.png`, 192×192), with a thin white outline so the same colors hold on a dark background.
- Requires Cursor 3.13.0 or newer.
- Author and publisher are USMail.ai. Publisher contact is info@usmail.ai.

## 0.2.1

- A human approves and pays for each mailing on the app; a meter balance is optional.

## 0.2.0

- Added the `usmail` MCP server pointing at the production endpoint only (`https://app.usmail.ai/mcp`).
- Auth uses OAuth. No API key to configure.
- Added the `usmail-mcp` skill. The agent prepares print-to-mail and hands approval to the human.
