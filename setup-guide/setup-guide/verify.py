#!/usr/bin/env python3
"""Local protocol and file test; no internet or actual APK needed."""
import hashlib
import json
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

folder = Path(__file__).resolve().parent
config = json.loads((folder / 'config.local.json').read_text())
downloads = Path(config['downloads_dir'])
launcher = folder / 'run-helper.local.sh'


def request(message):
    payload = json.dumps(message).encode()
    result = subprocess.run([str(launcher)], input=struct.pack('@I', len(payload)) + payload,
                            capture_output=True, timeout=60)
    if result.returncode or len(result.stdout) < 4:
        raise RuntimeError(result.stderr.decode(errors='replace') or 'No native response')
    size = struct.unpack('@I', result.stdout[:4])[0]
    return json.loads(result.stdout[4:4 + size])


assert request({'action': 'ping'}).get('ok'), 'Ping failed'
print('PASS: helper protocol ping')
# A unique test folder prevents touching real APKs or prior test files.
with tempfile.TemporaryDirectory(prefix='apk-helper-check-', dir=downloads) as temporary:
    test_domain = Path(temporary).name + '.example'
    destination_folder = downloads / 'Apk_download' / test_domain
    try:
        for index in (1, 2):
            source = Path(temporary) / ('test' + str(index) + '.apk')
            data = ('Harmless helper verification ' + str(index)).encode()
            source.write_bytes(data)
            response = request({'action': 'organize_apk', 'filename': str(source), 'domain': test_domain})
            assert response.get('ok'), response
            assert response['sha256'] == hashlib.sha256(data).hexdigest()
            assert Path(response['path']).name == source.name
            assert not source.exists()
        print('PASS: two original filenames, domain folder, exact SHA-256 values')
        conflict = Path(temporary) / 'test1.apk'
        conflict.write_bytes(b'Keep this conflicting file')
        response = request({'action': 'organize_apk', 'filename': str(conflict), 'domain': test_domain})
        assert not response.get('ok') and conflict.exists()
        print('PASS: filename conflict does not overwrite or delete source')
    finally:
        if destination_folder.exists():
            shutil.rmtree(destination_folder)
print('Local helper checks passed. Firefox connection and website downloads still need separate testing.')
