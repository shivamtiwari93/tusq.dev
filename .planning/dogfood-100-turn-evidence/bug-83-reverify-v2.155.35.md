# BUG-83 Shipped-Package Reverify — agentxchain@2.155.35

Date: 2026-04-26T10:14:00Z

## Package Quote-Back

Command:

```bash
npx --yes -p agentxchain@2.155.35 -c 'agentxchain --version'
```

Output:

```text
2.155.35
```

## Published Artifact Inspection

Command:

```bash
tmp=$(mktemp -d)
cd "$tmp"
npm pack agentxchain@2.155.35 --silent >/tmp/axc-pack-name.txt
tar -xzf "$(cat /tmp/axc-pack-name.txt)"
node - <<'NODE'
const fs = require('fs');
const text = fs.readFileSync('package/src/lib/governed-state.js','utf8');
console.log(`contains_valid_action=${text.includes("recovery_action: 'agentxchain resume'")}`);
console.log(`contains_invalid_flag=${text.includes('resume --acknowledge-non-progress')}`);
NODE
```

Output:

```text
contains_valid_action=true
contains_invalid_flag=false
```

## Result

BUG-83 is fixed in the published npm artifact. The non-progress recovery action now points to `agentxchain resume` and no longer advertises the nonexistent `resume --acknowledge-non-progress` flag.

This BUG was a recovery-message correctness defect discovered during the tusq.dev DOGFOOD-100 run. The current tusq.dev session is not blocked on `non_progress`, so there was no live same-session non-progress blocker to replay without manufacturing extra product turns. The shipped package artifact itself now contains the corrected recovery string.
