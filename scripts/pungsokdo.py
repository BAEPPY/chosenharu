"""Import reviewed originals or verify the committed library (standard library only)."""

import argparse
import hashlib
import json
import shutil
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "art-library" / "pungsokdo"
SELECTION = json.loads((LIBRARY / "selection.json").read_text())


def read_json(path):
    return json.loads(path.read_text())


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


def bucket_for(path):
    """Allow only reviewed poses and shared parts; unknown paths stay excluded."""
    parts = PurePosixPath(path).parts
    if parts[:2] != ("assets", "images") or ".." in parts:
        return None
    if any(alias in path for alias in SELECTION["excludedHair"]):
        return None
    if len(parts) == 6 and parts[2] == "result":
        if parts[3] in SELECTION["includedPoses"] and parts[4] in (
            "clothes", "hairs", "emotions", "skintones"
        ):
            return "result/" + parts[3]
    if len(parts) == 5 and parts[2] == "options":
        if parts[3] in SELECTION["sharedOptions"]:
            return "options/" + parts[3]
        if parts[3] == "poses" and parts[4].split("@")[0] in SELECTION["includedPoses"]:
            return "options/poses"
    if len(parts) == 5 and parts[2:4] == ("poses", "thumbs"):
        alias = parts[4].split("@")[0]
        if alias in SELECTION["includedPoses"] or alias in SELECTION["includedGroupThumbnails"]:
            return "thumbnails"
    return None


def digest(data):
    return hashlib.sha256(data).hexdigest()


def import_images(source):
    if (LIBRARY / "index.json").exists():
        raise ValueError("Library already exists; import into a clean checkout to avoid stale files.")
    records = {}
    seen_thumbnails = set()
    for line in (source / "images.jsonl").read_text().splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        path = urlparse(row["url"]).path.lstrip("/")
        if path.startswith("assets/images/poses/thumbs/"):
            seen_thumbnails.add(PurePosixPath(path).name.split("@")[0])
        bucket = bucket_for(path)
        if bucket is None:
            continue
        filename = row["file"]
        if Path(filename).name != filename:
            raise ValueError("Source file must be a basename: " + filename)
        data = (source / filename).read_bytes()
        if len(data) != row["bytes"]:
            raise ValueError("Size mismatch: " + path)
        record = {"path": path, "source": row["url"], "bytes": len(data), "sha256": digest(data)}
        if path in records and records[path][1] != record:
            raise ValueError("Conflicting source records: " + path)
        records[path] = (bucket, record)

    reviewed = set(SELECTION["includedPoses"]) | set(SELECTION["excludedPoses"])
    reviewed |= set(SELECTION["includedGroupThumbnails"]) | set(SELECTION["excludedGroupThumbnails"])
    if seen_thumbnails != reviewed:
        raise ValueError("Thumbnail review does not match the source: " + str(seen_thumbnails ^ reviewed))

    # No source files are modified. Copy only after all selected inputs are verified.
    source_paths = {}
    for line in (source / "images.jsonl").read_text().splitlines():
        if line.strip():
            row = json.loads(line)
            source_paths[urlparse(row["url"]).path.lstrip("/")] = source / row["file"]
    buckets = {}
    for path, (bucket, record) in sorted(records.items()):
        target = LIBRARY / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source_paths[path], target)
        buckets.setdefault(bucket, []).append(record)

    manifests = []
    for bucket, items in sorted(buckets.items()):
        path = "manifests/" + bucket + ".json"
        write_json(LIBRARY / path, items)
        manifests.append({"path": path, "files": len(items)})
    poses = [
        {"alias": alias, "label": label, "resultFiles": len(buckets.get("result/" + alias, []))}
        for alias, label in SELECTION["includedPoses"].items()
    ]
    write_json(LIBRARY / "index.json", {
        "source": SELECTION["source"],
        "files": len(records),
        "bytes": sum(record["bytes"] for _, record in records.values()),
        "poses": poses,
        "manifests": manifests,
        "note": "resultFiles counts uploaded image layers only. Skin vectors and headgear coordinates are required before enabling a new pose in the app."
    })
    verify()


def verify():
    index = read_json(LIBRARY / "index.json")
    paths = set()
    total = 0
    for manifest in index["manifests"]:
        items = read_json(LIBRARY / manifest["path"])
        if len(items) != manifest["files"]:
            raise ValueError("Manifest count mismatch: " + manifest["path"])
        for item in items:
            path = item["path"]
            bucket = bucket_for(path)
            if bucket is None or manifest["path"] != "manifests/" + bucket + ".json":
                raise ValueError("Unapproved asset: " + path)
            if path in paths:
                raise ValueError("Duplicate path: " + path)
            data = (LIBRARY / path).read_bytes()
            if len(data) != item["bytes"] or digest(data) != item["sha256"]:
                raise ValueError("Content mismatch: " + path)
            paths.add(path)
            total += len(data)
    actual = {p.relative_to(LIBRARY).as_posix() for p in (LIBRARY / "assets").rglob("*") if p.is_file()}
    if actual != paths or len(paths) != index["files"] or total != index["bytes"]:
        raise ValueError("Library inventory mismatch")
    print(f"Verified {len(paths)} original files ({total:,} bytes); no excluded assets.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["import", "verify"])
    parser.add_argument("source", type=Path, nargs="?")
    args = parser.parse_args()
    if args.command == "import":
        if args.source is None:
            parser.error("import requires the directory containing images.jsonl and extracted images")
        import_images(args.source)
    else:
        verify()
