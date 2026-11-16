# Replacing the music loop

Replace `night-drive.mp3` with a loop-ready MP3 using the same filename. The app resolves `audio/night-drive.mp3` relative to the Vite deployment base. To use a different browser-decodable format, change `source` in `src/app/music/config.ts` and place that file under `public/audio`. MP3 is the tested distribution format.

Export an uninterrupted loop with clean endpoints and gapless encoder metadata. Keep the master comfortably below clipping, then test its level at the default 20% gain and audition the seam in the browser. Run the normal production build and redeploy. Refresh any cached copy of the old URL if the host serves static assets from a cache.

Update [the active-track attribution](ATTRIBUTION.md) and the `creditUrl` and `creditTitle` in the music config when replacing the track. Preserve any required credit for older tracks in repository history.
