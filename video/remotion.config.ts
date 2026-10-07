import { Config } from '@remotion/cli/config';

// Einstiegspunkt und vorinstalliertes Chromium, damit Remotion keinen Browser herunterladen muss.
Config.setEntryPoint('src/index.ts');
Config.setBrowserExecutable(process.env.REMOTION_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
