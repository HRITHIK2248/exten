#!/usr/bin/env python3
"""Firefox native host: organize completed local APK downloads and hash bytes."""
import hashlib
import json
import os
import re
import shutil
import struct
import sys
from pathlib import Path


def read_exact(size):
    data = bytearray()
    while len(data) < size:
        chunk = sys.stdin.buffer.read(size - len(data))
        if not chunk:
            raise EOFError('Incomplete message')
        data.extend(chunk)
    return bytes(data)


def send(message):
    data = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('@I', len(data)) + data)
    sys.stdout.buffer.flush()


def digest(path):
    value = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()


def organize(message):
    config = json.loads(Path(__file__).with_name('config.local.json').read_text())
    downloads = Path(config['downloads_dir']).resolve(strict=True)
    raw = Path(message['filename'])
    if not raw.is_absolute() or raw.is_symlink():
        raise ValueError('Require an absolute path to a regular downloaded APK')
    source = raw.resolve(strict=True)
    if not source.is_relative_to(downloads):
        raise ValueError('File is outside the configured downloads directory: ' + str(downloads))
    if not source.is_file() or source.suffix.lower() != '.apk':
        raise ValueError('Expected a completed .apk file')
    domain = str(message.get('domain', '')).lower()
    if len(domain) > 253 or not re.fullmatch(r'[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?', domain) or '..' in domain:
        raise ValueError('Invalid analyzed domain')
    folder = downloads / 'Apk_download' / domain
    folder.mkdir(parents=True, exist_ok=True)
    if folder.resolve() != folder:
        raise ValueError('Destination must not contain symbolic links')
    destination = folder / source.name
    if source != destination:
        created = False
        try:
            with destination.open('xb') as output:
                created = True
                with source.open('rb') as input_file:
                    shutil.copyfileobj(input_file, output, 1024 * 1024)
                output.flush()
                os.fsync(output.fileno())
            sha256 = digest(destination)
            if sha256 != digest(source):
                raise ValueError('Copied file verification failed')
            source.unlink()
        except Exception:
            if created:
                destination.unlink(missing_ok=True)
            raise
    else:
        sha256 = digest(destination)
    return dict(ok=True, domain=domain, filename=destination.name,
                path=str(destination), sha256=sha256, size=destination.stat().st_size)


def main():
    while True:
        header = sys.stdin.buffer.read(4)
        if not header:
            return
        try:
            if len(header) != 4:
                raise ValueError('Incomplete header')
            size = struct.unpack('@I', header)[0]
            if size > 65536:
                raise ValueError('Message too large')
            message = json.loads(read_exact(size))
        except Exception as error:
            send(dict(ok=False, error=str(error)))
            return
        try:
            if message.get('action') == 'ping':
                response = dict(ok=True, message='APK helper ready')
            elif message.get('action') == 'organize_apk':
                response = organize(message)
            else:
                raise ValueError('Unknown action')
        except Exception as error:
            response = dict(ok=False, error=str(error))
        send(response)


if __name__ == '__main__':
    main()
