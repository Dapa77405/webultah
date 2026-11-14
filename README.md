# Miel Malop — A Blue Butterfly Sanctuary

A birthday experience for Miel Malop, celebrating her 16th birthday on November 22, 2026. Made with love by Dapa Caesar.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`, then preview it with `npm run preview`.

## Experience notes

- The opening gesture starts Daniel Caesar's “Japanese Denim” in the Spotify player. Use the dock selector to switch between it, Green Day's “Last Night on Earth,” and Seventeen's “Untuk Mencintaimu.” Spotify playback requires an internet connection and may require a Spotify account.
- The floating dock places the Spotify player beside a round celebration button on the right.
- Birthday wishes are saved in this browser's local storage.
- Shared polaroid photos are stored in `public/uploads` in the GitHub repository and are visible to all visitors. Replacing a card updates the shared photo; previous file versions may remain in Git history.
- Uploads require the admin password; visitors can view photos without it. The Vercel project must be connected to this repository and configured with `GITHUB_TOKEN` (a fine-grained token with Contents read/write permission for this repository) and a strong `UPLOAD_PASSWORD` as environment variables. Never put the GitHub token in frontend code or commit it to the repository.
- Shared uploads support JPG, PNG, WebP, GIF, and AVIF images up to 2 MB. To load and upload photos locally, run the app with Vercel's development server so the `/api/photos` function is available.
- Microphone candle blowing is optional; the on-screen candle button works without microphone access.

## Enable shared photo uploads on Vercel

1. Create a GitHub fine-grained personal access token restricted to `Dapa77405/webultah`, with **Contents: Read and write** permission.
2. In the Vercel project settings, add `GITHUB_TOKEN` with that token and `UPLOAD_PASSWORD` with a long, unique secret. Only share the upload password with the site owner.
3. Redeploy the Vercel project. For local testing, use Vercel's development server (`vercel dev`) so the `/api/photos` function is available.

Never put the GitHub token in frontend code or commit it to the repository. Photos are committed to the public `main` branch; replacing a photo removes its old file, but the prior version can remain visible in Git history.
