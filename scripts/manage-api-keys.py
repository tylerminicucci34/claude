#!/usr/bin/env python3
"""Manage Anthropic API keys via the Admin API.

Requires an Admin API key (sk-ant-admin...) in the ANTHROPIC_ADMIN_KEY
environment variable. Admin keys are created by org admins in the
Anthropic Console (Settings -> Organization -> Admin keys).

The Admin API never returns full secret keys -- only metadata and a
partial hint. Keys can be listed, renamed, and (de)activated here;
creating a key and viewing its full value happens once, in the Console.

Usage:
  python3 manage-api-keys.py list [--status active|inactive|archived]
  python3 manage-api-keys.py get <api_key_id>
  python3 manage-api-keys.py rename <api_key_id> <new_name>
  python3 manage-api-keys.py deactivate <api_key_id>
  python3 manage-api-keys.py activate <api_key_id>
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

API_BASE = os.environ.get("ANTHROPIC_ADMIN_BASE_URL", "https://api.anthropic.com")


def request(method: str, path: str, body: dict | None = None, params: dict | None = None) -> dict:
    admin_key = os.environ.get("ANTHROPIC_ADMIN_KEY")
    if not admin_key:
        sys.exit(
            "error: ANTHROPIC_ADMIN_KEY is not set.\n"
            "Create an Admin API key in the Anthropic Console (org admins only)\n"
            "and export it: export ANTHROPIC_ADMIN_KEY=sk-ant-admin..."
        )
    url = f"{API_BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode({k: v for k, v in params.items() if v is not None})
    req = urllib.request.Request(
        url,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "x-api-key": admin_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.load(resp)
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        sys.exit(f"error: HTTP {e.code} from {method} {path}\n{detail}")


def print_key(key: dict) -> None:
    print(f"  id:      {key.get('id')}")
    print(f"  name:    {key.get('name')}")
    print(f"  status:  {key.get('status')}")
    print(f"  hint:    {key.get('partial_key_hint')}")
    print(f"  created: {key.get('created_at')}")
    workspace = key.get("workspace_id")
    if workspace:
        print(f"  workspace: {workspace}")
    print()


def cmd_list(args: argparse.Namespace) -> None:
    keys, after_id = [], None
    while True:
        page = request(
            "GET",
            "/v1/organizations/api_keys",
            params={"limit": 100, "status": args.status, "after_id": after_id},
        )
        keys.extend(page.get("data", []))
        if not page.get("has_more"):
            break
        after_id = page.get("last_id")
    if not keys:
        print("No API keys found.")
        return
    print(f"{len(keys)} API key(s):\n")
    for key in keys:
        print_key(key)


def cmd_get(args: argparse.Namespace) -> None:
    print_key(request("GET", f"/v1/organizations/api_keys/{args.api_key_id}"))


def cmd_rename(args: argparse.Namespace) -> None:
    key = request("POST", f"/v1/organizations/api_keys/{args.api_key_id}", body={"name": args.new_name})
    print("Renamed:")
    print_key(key)


def set_status(api_key_id: str, status: str) -> None:
    key = request("POST", f"/v1/organizations/api_keys/{api_key_id}", body={"status": status})
    print(f"Status set to {status}:")
    print_key(key)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    p_list = sub.add_parser("list", help="List all API keys in the organization")
    p_list.add_argument("--status", choices=["active", "inactive", "archived"], default=None)
    p_list.set_defaults(func=cmd_list)

    p_get = sub.add_parser("get", help="Show one API key's metadata")
    p_get.add_argument("api_key_id")
    p_get.set_defaults(func=cmd_get)

    p_rename = sub.add_parser("rename", help="Rename an API key")
    p_rename.add_argument("api_key_id")
    p_rename.add_argument("new_name")
    p_rename.set_defaults(func=cmd_rename)

    p_off = sub.add_parser("deactivate", help="Deactivate an API key (reversible)")
    p_off.add_argument("api_key_id")
    p_off.set_defaults(func=lambda a: set_status(a.api_key_id, "inactive"))

    p_on = sub.add_parser("activate", help="Reactivate an inactive API key")
    p_on.add_argument("api_key_id")
    p_on.set_defaults(func=lambda a: set_status(a.api_key_id, "active"))

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
