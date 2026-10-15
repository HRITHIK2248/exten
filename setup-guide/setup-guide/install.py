#!/usr/bin/env python3
"""Register this checkout's APK native host for the current Linux user."""
import argparse
import json
import os
import shlex
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    if not sys.platform.startswith('linux'):
        sys.exit('This installer supports Kali/Linux only. Do not run it on Windows.')
    if sys.version_info < (3, 9):
        sys.exit('Install Python 3.9 or newer.')
    if os.geteuid() == 0:
        sys.exit('Run as your normal Firefox user, without sudo.')
    parser = argparse.ArgumentParser()
    parser.add_argument('--downloads-dir', type=Path)
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    root = folder.parent
    manifest_path = root / 'manifest.json'
    if not manifest_path.is_file():
        sys.exit('Place setup-guide directly inside the extension folder, beside manifest.json.')
    manifest = json.loads(manifest_path.read_text())
    gecko = manifest.get('browser_specific_settings', {}).get('gecko', {}) or manifest.get('applications', {}).get('gecko', {})
    extension_id = gecko.get('id')
    if not extension_id:
        sys.exit('manifest.json must contain a fixed Gecko extension ID.')
    downloads = args.downloads_dir
    if downloads is None and shutil.which('xdg-user-dir'):
        result = subprocess.run(['xdg-user-dir', 'DOWNLOAD'], capture_output=True, text=True)
        if result.returncode == 0 and result.stdout.strip():
            downloads = Path(result.stdout.strip())
    downloads = (downloads or Path.home() / 'Downloads').expanduser().resolve()
    downloads.mkdir(parents=True, exist_ok=True)
    required = ['downloads', 'webRequest', 'nativeMessaging']
    permissions = manifest.setdefault('permissions', [])
    if any(value not in permissions for value in required):
        backup = manifest_path.with_name('manifest.json.before-apk-setup')
        if not backup.exists():
            shutil.copy2(manifest_path, backup)
        permissions.extend(value for value in required if value not in permissions)
        manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
    config = folder / 'config.local.json'
    config.write_text(json.dumps({'downloads_dir': str(downloads)}, indent=2) + '\n')
    config.chmod(0o600)
    helper = folder / 'apk_helper.py'
    if not helper.is_file():
        sys.exit('Missing setup-guide/apk_helper.py')
    compile(helper.read_text(), str(helper), 'exec')
    launcher = folder / 'run-helper.local.sh'
    launcher.write_text('#!/bin/sh\nexec ' + shlex.quote(sys.executable) + ' ' + shlex.quote(str(helper)) + '\n')
    launcher.chmod(0o700)
    hosts = Path.home() / '.mozilla/native-messaging-hosts'
    hosts.mkdir(parents=True, exist_ok=True)
    target = hosts / 'payment_qr_apk_helper.json'
    if target.exists():
        backup = target.with_suffix('.json.before-setup')
        if not backup.exists():
            shutil.copy2(target, backup)
    target.write_text(json.dumps({
        'name': 'payment_qr_apk_helper',
        'description': 'Organize completed APKs and compute SHA-256',
        'path': str(launcher), 'type': 'stdio',
        'allowed_extensions': [extension_id]
    }, indent=2) + '\n')
    print('Helper registered for:', extension_id)
    print('Downloads directory:', downloads)
    print('Run next: python3 setup-guide/verify.py')
    print('Then load or reload manifest.json in Firefox about:debugging.')
    print('Keep this checkout at its current path; rerun setup after moving it.')


if __name__ == '__main__':
    main()
