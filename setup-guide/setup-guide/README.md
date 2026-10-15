# APK extension setup — offline instructions for another PC

This folder is intended to be committed inside your existing extension repository. You do not need ChatGPT or a ChatGPT account to follow it. No API key, pip packages, or npm packages are needed for this helper.

## Supported system

These instructions and installer support Kali/Linux with a normal Firefox or Firefox ESR installation and Python 3.9+. They do NOT install on Windows. Native host registration and the launcher differ on Windows. Snap/Flatpak Firefox may require additional native messaging integration; use a normal distribution Firefox package for these instructions.

## Before pushing from your current PC

Place this whole folder directly inside your extension folder:

    exten/
      manifest.json
      background.html
      background.js
      content.js
      libs/
      popup/
        popup.html
        popup.css
        popup.js
      setup-guide/
        README.md
        install.py
        verify.py
        apk_helper.py
        .gitignore

Commit the updated extension code, including the updated background.js, popup.html, popup.js and manifest.json. This setup folder does not replace those files and does not add the popup feature by itself. Keep your existing QR libraries in libs/. The native/ folder used in the earlier manual setup may remain, but this installer registers its own bundled helper instead.

Check that background.js includes `findApkAnalysisContext`, and popup.js includes `refreshApkHashes`. Check that popup.html contains `page-analysis-apk-hashes`. Those are the changes made for domain folders and hashes.

From the extension root, run:

```bash
python3 -m json.tool manifest.json > /dev/null
node --check background.js
node --check popup/popup.js
```

Node is optional for runtime; these two Node commands only check JavaScript syntax. If Node is not installed, skip them.

Use `git status` and review the files before committing. Do not commit downloaded APKs, personal file paths, browser profiles, or console exports. setup-guide/.gitignore excludes the installer-generated personal configuration and launcher.

## 1. Install prerequisites on the other PC

On Kali/Debian/Ubuntu:

```bash
sudo apt update
sudo apt install git python3
python3 --version
```

Use Firefox ESR or Firefox already installed on that PC. On Kali, Firefox ESR can be installed with `sudo apt install firefox-esr` if it is missing.

## 2. Clone your repository

Open your GitHub repository in a browser, click Code, and copy the HTTPS clone address. Use that real address in `git clone`, then enter the cloned folder. For example, replace YOUR_NAME and YOUR_REPOSITORY below:

```bash
git clone https://github.com/YOUR_NAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

If the repository is private, GitHub still requires your GitHub authentication. ChatGPT authentication is not involved.

Confirm that the current directory contains manifest.json and setup-guide/:

```bash
ls manifest.json setup-guide/README.md
```

If they are nested inside another directory in your repository, enter that extension directory first.

## 3. Register the helper — normal user, no sudo

In Firefox Settings > General > Files and Applications, check the folder in “Save files to”. The helper's configured directory MUST match the actual folder where Firefox saves APKs.

Run:

```bash
python3 setup-guide/install.py
```

The installer detects the Linux desktop Downloads folder, falling back to ~/Downloads. It prints the selected path. If Firefox uses a different folder, explicitly pass it, for example:

```bash
python3 setup-guide/install.py --downloads-dir "$HOME/Downloads"
```

Replace that argument with the actual Firefox download directory if different. Choose a real Downloads folder, not your entire home directory.

The installer:

- Registers payment_qr_apk_helper for the extension's Gecko ID.
- Adds downloads, webRequest and nativeMessaging permissions if missing; backs up manifest.json before its first edit.
- Generates a local configuration and executable launcher with absolute paths.
- Preserves an existing host registration in a .before-setup backup on the first replacement.
- Does not need root privileges, download APKs, or execute APKs.

Rerun this command if you move or rename the repository directory. Each computer needs its own registration. Do not copy another computer's generated host JSON or local launcher.

## 4. Test the helper locally

```bash
python3 setup-guide/verify.py
```

Expected output includes PASS for protocol ping, two files with original filenames and correct hashes, and filename conflict handling. This test uses harmless text files with .apk names and removes its own test files afterward. They are not Android applications. A top-level Apk_download folder may remain.

A successful local test checks the helper only. It does not prove that Firefox is connected or that a website's download buttons are detected.

## 5. Load the extension in Firefox

1. Enter `about:debugging#/runtime/this-firefox` in Firefox's address bar.
2. Click “Load Temporary Add-on”.
3. Select manifest.json inside your cloned extension folder.
4. If Payment QR Tool is already loaded from this directory, click Reload instead.
5. Fix any manifest/load errors before continuing.

Temporary add-ons normally need to be loaded again after restarting Firefox. Permanent installation in standard Firefox generally requires a signed add-on package; this guide uses temporary developer loading.

## 6. Verify Firefox-to-Python communication

On about:debugging, click Inspect for Payment QR Tool and select Console. Use this extension console, not a website's console.

Type:

```javascript
browser.runtime.getManifest().permissions
```

Confirm nativeMessaging appears. Then type or paste after reviewing:

```javascript
browser.runtime.sendNativeMessage(
  "payment_qr_apk_helper",
  { action: "ping" }
).then(console.log).catch(console.error);
```

Expected result:

```javascript
{ ok: true, message: "APK helper ready" }
```

A pending Promise followed by the successful object is normal.

## 7. Use the extension

1. Open the website you intend to analyze.
2. Open Payment QR Tool and click Analyze webpage.
3. The existing scanner may open temporary tabs and click the installation controls it recognizes.
4. Let an APK finish downloading into the configured Downloads folder.
5. The background script associates the download with the original analyzed domain.
6. The helper copies it into Apk_download/<domain>/ using its existing filename, verifies the copied bytes, then removes the source file.
7. It calculates SHA-256 for the saved file. The extension retains an apkResults entry for each download.
8. Reopen the popup on the analyzed website. Under Webpage analysis > Web links, expand APK hash.
9. Each successful record should show the filename, SHA-256, path and Copy hash button. Errors should appear as errors, not fake hashes.

Example, assuming the default Downloads directory:

    ~/Downloads/Apk_download/rummy.com/OriginalGame.apk
    ~/Downloads/Apk_download/rummy.com/OriginalLite.apk

Neither Apk_download nor the domain directory needs manual creation. They are created when the helper processes a file, or during the local verification test. Until then, “No such file or directory” can be normal.

The analyzed hostname is used, including a subdomain such as www.rummy.com. Its folder does not switch to the external APK hosting domain.

The move occurs AFTER the browser download completes. Firefox's download history can still refer to the old path, so its “Open containing folder” action may no longer locate the file. Use the saved path shown by the popup.

## 8. Independently verify SHA-256

```bash
find "$HOME/Downloads/Apk_download" -type f -iname '*.apk' -exec sha256sum {} \;
```

Use your actual Downloads path if customized. The 64 hexadecimal characters must match the popup exactly. Copy only commands, not terminal prompt characters or previous output.

## Important filename behavior

The helper retains the filename provided by Firefox. Firefox may already add a number when a download conflicts with another file before processing. If the same filename is already in the destination domain folder, the helper reports an error and leaves the source APK intact; it does not overwrite or invent a new name. Move the conflicting file manually to a separate location, then retry analysis as needed.

## Troubleshooting without ChatGPT

### sendNativeMessage is not a function

Run `browser.runtime.getManifest().permissions` in the extension console. If nativeMessaging is missing, rerun install.py, Reload the extension, close its old inspector and Inspect again. Also verify that the extension's manifest path points to the clone you edited.

### No such native application / native host not found

Rerun install.py as the SAME normal Linux user running Firefox. Check:

```bash
cat "$HOME/.mozilla/native-messaging-hosts/payment_qr_apk_helper.json"
```

Its path must point to this checkout's setup-guide/run-helper.local.sh, and allowed_extensions must match the ID in manifest.json. Restart Firefox if registration is not recognized. Check that Firefox is not a confined Snap/Flatpak build.

### Native application exited or permission denied

Run `python3 setup-guide/verify.py`. Check that the repository is still in its original location. Rerun install.py to regenerate the executable launcher. A filesystem mounted noexec can also prevent launching it; keep the repository on a normal executable home filesystem.

### File is outside the configured downloads directory

The helper rejects files outside its configured folder. Check Firefox's actual download location, then rerun install.py with --downloads-dir pointing to that folder. Existing downloads elsewhere will not be moved automatically.

### Apk_download does not exist

First run verify.py. If that succeeds, inspect Firefox's actual analysis/download flow. No APK downloaded means no result is expected. Folder creation is not proof of automatic website detection.

### No popup hashes / empty storage

In the extension console:

```javascript
browser.storage.local.get(["apkResults", "latestDetectedApk"]).then(console.log);
```

An empty object means no result has been stored in this Firefox profile. During a new analysis, look for `[APK] Processing result:` or `[APK] No analyzed website associated with download:` and red errors.

Check that updated code is loaded:

```javascript
typeof findApkAnalysisContext
```

This must return `"function"` in the background extension console. popup.js must separately contain refreshApkHashes and popup.html must contain the APK hash elements. Reload after editing files.

The popup filters records using the CURRENT active website hostname. Reopen it on the website analyzed, not the external file host. The hashes are local to the Firefox profile and do not sync through git.

### APK downloaded but no analyzed website associated

The current association uses request URLs observed from temporary analysis tabs and their child tabs. It deliberately skips unassociated or ambiguous downloads. Manually downloading an unrelated APK is not enough. Some sites, blob URLs, concurrent scans, redirects and downloads started outside tracked tabs may need further extension changes. Do not assign a domain based only on whichever tab is currently active.

### A download control is missed

The current scanner explicitly recognizes “Quick installation” with div.btn1 and “Complete Installation” with div.btn2 in its rendered scan path. It is not a universal APK downloader. A site's different button markup, authentication, captchas or browser restrictions can prevent detection. The helper installer cannot repair site-specific scanning logic.

### Console paste warning

Review the command and type it manually if Firefox blocks pasting. Use the extension's inspector console. Do not paste unknown commands from websites.

### Multiple PCs / reinstall / updates

Install prerequisites and run install.py on each Linux PC after cloning. After pulling changed extension code, Reload it in Firefox. Rerun install.py if the checkout location, Python path, extension ID or Downloads folder changes. Downloaded APKs and Firefox storage do not transfer through the repository.

## Clean up the earlier popup-only sample (optional)

If you previously inserted the example.com sample with ID popup-test, remove just that record in the extension console:

```javascript
(async () => {
  const { apkResults = [] } = await browser.storage.local.get("apkResults");
  await browser.storage.local.set({
    apkResults: apkResults.filter(item => item.id !== "popup-test")
  });
})();
```

## Status and limits

The previous manual test confirmed local file organization, matching SHA-256 and the popup sample. An automatic download from a real website has not yet been confirmed in that session. Run all tests above on the other computer before relying on its results. These instructions make setup reproducible; they do not guarantee that every website's download mechanism is supported.
