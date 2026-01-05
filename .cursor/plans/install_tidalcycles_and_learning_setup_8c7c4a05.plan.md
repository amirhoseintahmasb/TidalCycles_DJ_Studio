---
name: Install TidalCycles and Learning Setup
overview: Install TidalCycles on macOS using tidal-bootstrap, configure SuperDirt with exact boot script, set up Pulsar editor, and create structured learning environment with example patterns in Cursor.
todos:
  - id: check-prerequisites
    content: Verify SuperCollider installed, check Xcode command line tools (xcode-select -p), verify Git (git --version)
    status: pending
  - id: install-tidalcycles
    content: Run tidal-bootstrap script to install Haskell, Cabal, TidalCycles library, Pulsar editor, and SuperDirt samples. Restart terminal after completion.
    status: pending
    dependencies:
      - check-prerequisites
  - id: verify-haskell
    content: Verify Haskell tooling after installation (ghc --version, cabal --version)
    status: pending
    dependencies:
      - install-tidalcycles
  - id: install-superdirt-quark
    content: Install SuperDirt Quark in SuperCollider via Quarks.gui, then recompile class library
    status: pending
    dependencies:
      - install-tidalcycles
  - id: create-project-structure
    content: Create ~/tidal-live project directory with folders (scripts/, examples/, learning/) and initial empty files
    status: pending
  - id: create-boot-script
    content: Create scripts/boot-superdirt.scd with exact SuperDirt boot configuration (port 57120, buffer settings, sample loading)
    status: pending
    dependencies:
      - create-project-structure
      - install-superdirt-quark
  - id: create-gitignore
    content: Create .gitignore with standard patterns (.DS_Store, *.swp, node_modules/, etc.)
    status: pending
    dependencies:
      - create-project-structure
  - id: create-readme
    content: Create README.md with quick start guide, first sound example, and folder structure explanation
    status: pending
    dependencies:
      - create-project-structure
  - id: create-learning-basics
    content: Create learning/01-basics.md with the 3 spells (play, stop, fast) and basic concepts
    status: pending
    dependencies:
      - create-project-structure
  - id: create-learning-patterns
    content: Create learning/02-patterns.md with repetition, brackets, and stacking examples
    status: pending
    dependencies:
      - create-project-structure
  - id: create-learning-effects
    content: Create learning/03-effects.md with reverb, filter, and delay examples
    status: pending
    dependencies:
      - create-project-structure
  - id: create-learning-layering
    content: Create learning/04-layering.md explaining Pink Floyd layering technique
    status: pending
    dependencies:
      - create-project-structure
  - id: create-basic-beats-example
    content: Create examples/basic-beats.tidal with basic groove, hats, and variation patterns
    status: pending
    dependencies:
      - create-project-structure
  - id: create-pink-floyd-example
    content: Create examples/pink-floyd-style.tidal with layered patterns (drone, pulse, snare, hats, filter sweeps)
    status: pending
    dependencies:
      - create-project-structure
  - id: setup-pulsar
    content: Install Pulsar editor and TidalCycles package via Pulsar package manager
    status: pending
    dependencies:
      - install-tidalcycles
  - id: verification-supercollider
    content: Test SuperCollider audio with SinOsc test (should hear beep, stop with Cmd+.)
    status: pending
    dependencies:
      - create-boot-script
  - id: verification-superdirt
    content: Test SuperDirt boot script in SuperCollider (should see "SuperDirt is running on port 57120" message)
    status: pending
    dependencies:
      - create-boot-script
  - id: verification-tidal
    content: Test Tidal connection by running 'd1 $ sound "bd sn"' in editor (should hear kick/snare pattern)
    status: pending
    dependencies:
      - setup-pulsar
      - verification-superdirt
---

# TidalCycles Installation and Learning Setup Plan

## Overview

This plan installs TidalCycles on macOS using the tidal-bootstrap script, configures SuperDirt with an exact boot script, sets up Pulsar editor, and creates a structured learning environment in `~/tidal-live` with example patterns. All files will contain the exact content specified for a beginner-safe, step-by-step learning experience.

## Project Location

**Primary project directory:** `~/tidal-live`This will be the main workspace for all TidalCycles learning and experimentation.

## Phase 0: Prerequisites Check

### Commands to run:

```bash
xcode-select -p
git --version
```



### If xcode-select fails:

```bash
xcode-select --install
```

**Expected result:** Both commands return version/path information without errors.

## Phase 1: Install TidalCycles (Automatic - tidal-bootstrap)

### Installation command:

```bash
curl -fsSL https://raw.githubusercontent.com/tidalcycles/tidal-bootstrap/master/tidal-bootstrap.command | sh
```

**What this installs:**

- Haskell (via Ghcup)
- Cabal (Haskell package manager)
- TidalCycles library
- Pulsar editor
- TidalCycles plugin for Pulsar
- SuperDirt and Dirt-Samples in SuperCollider
- sc-3 plugins

**After installation:**

- Restart Terminal (important for PATH changes)
- Verify with:
  ```bash
                  ghc --version
                  cabal --version
  ```




## Phase 2: Configure SuperDirt in SuperCollider

### Step 2.1: Install SuperDirt Quark

1. Open SuperCollider
2. Run: `Quarks.gui;`
3. Find **SuperDirt** → install
4. **Language → Recompile Class Library** (or restart SC)

### Step 2.2: Create Boot Script

**File:** `~/tidal-live/scripts/boot-superdirt.scd`**Exact content:**

```supercollider
(
// boot + start SuperDirt with predictable ports
s.options.numBuffers = 1024 * 256;
s.options.memSize = 8192 * 32;
s.options.maxNodes = 1024 * 32;
s.options.numOutputBusChannels = 2;
s.options.numInputBusChannels = 2;

s.waitForBoot {
    ~dirt = SuperDirt(2, s);

    // Load Dirt samples (installed with SuperDirt or bootstrap)
    ~dirt.loadSoundFiles;

    // Tidal default port
    ~dirt.start(57120, 0 ! 12);

    "SuperDirt is running on port 57120".postln;
};
s.boot;
)
```

**Usage:** Load this file in SuperCollider and run (Shift+Enter). Should see "SuperDirt is running on port 57120".**Emergency stop:** Cmd + .

## Phase 3: Text Editor Setup (Pulsar)

1. Install Pulsar (if not already installed via bootstrap)
2. Open Pulsar
3. **Settings → Packages → search "tidalcycles"** → install
4. This enables sending code blocks to Tidal

## Phase 4: Create Project Structure

### Directory structure:

```javascript
~/tidal-live/
├── .gitignore
├── README.md
├── scripts/
│   └── boot-superdirt.scd
├── examples/
│   ├── basic-beats.tidal
│   └── pink-floyd-style.tidal
└── learning/
    ├── 01-basics.md
    ├── 02-patterns.md
    ├── 03-effects.md
    └── 04-layering.md
```



## Phase 5: File Contents

### `.gitignore`

```javascript
.DS_Store
*.swp
*.swo
*.log
node_modules/
dist/
build/
```



### `README.md`

````markdown
# TidalCycles Setup (macOS)

## Quick Start
1) Start SuperDirt:
- Open SuperCollider
- Load and run `scripts/boot-superdirt.scd`

2) Open Pulsar:
- Use the Tidal package to send code to Tidal

## First Sound
```haskell
d1 $ sound "bd sn bd sn"
```

Stop:

```haskell
hush
```

## Folder Structure

* scripts/ : SuperCollider boot scripts
* learning/: step-by-step notes
* examples/: ready patterns
````



### `learning/01-basics.md`

````markdown
# 01 - Basics (Donkey Mode)

## The 3 spells
Play:
```haskell
d1 $ sound "bd"
```

Stop everything:

```haskell
hush
```

Make it faster:

```haskell
d1 $ fast 2 $ sound "bd sn"
```

## Think like this

* `d1`, `d2`, `d3`... are tracks
* `sound "bd sn"` is a sequence of samples
* functions like `fast`, `slow`, `rev`, `every` reshape time
````



### `learning/02-patterns.md`

````markdown
# 02 - Patterns

## Repetition
```haskell
d1 $ sound "hh*8"
```

## Brackets = choices / grouping

```haskell
d1 $ sound "bd [sn sn] bd"
```

## Stacking layers

```haskell
d1 $ stack [
  sound "bd bd bd bd",
  sound "hh*8"
]
```
````



### `learning/03-effects.md`

````markdown
# 03 - Effects (Make it cinematic)

Reverb-ish space:
```haskell
d1 $ sound "bd sn" # room 0.6 # size 0.8
```

Filter (cutoff):

```haskell
d1 $ sound "bd*4" # cut 1200
```

Delay (if supported by your dirt version):

```haskell
d1 $ sound "arpy" # delay 0.4 # delayfeedback 0.5
```

Tip: Effects are numbers 0..1 or Hz-like ranges. Use small changes.
````



### `learning/04-layering.md`

````markdown
# 04 - Layering (The Pink Floyd trick)

Big sound = multiple slow layers, not one complicated layer.

1) Drums (simple)
2) Bass (slow)
3) Pad/texture (very slow)
4) Lead (rare notes)
5) Reverb + delay + filter sweeps
````



### `examples/basic-beats.tidal`

```haskell
-- basic groove
d1 $ sound "bd bd [sn sn] bd"

-- hats
d2 $ sound "hh*8" # gain 0.7

-- little variation every 4 cycles
d1 $ every 4 (rev) $ sound "bd bd [sn sn] bd"
```



### `examples/pink-floyd-style.tidal`

```haskell
-- DRONE / PAD layer (space)
d4 $ slow 2 $ sound "pad" # room 0.9 # size 0.9 # gain 0.5

-- PULSE (like a heartbeat kick)
d1 $ sound "bd ~ bd ~" # room 0.3 # size 0.6

-- SNARE (sparse)
d2 $ sound "~ sn ~ sn" # room 0.5 # size 0.7 # gain 0.9

-- HATS (motion)
d3 $ sound "hh*8" # gain 0.5 # cut 6000

-- Slowly open the filter on hats every 8 cycles
d3 $ every 8 (# cut 12000) $ sound "hh*8" # gain 0.5 # cut 4000
```



## Phase 6: Verification Checklist

### ✅ A) SuperCollider audio works

Run in SuperCollider:

```supercollider
{ SinOsc.ar(440, 0, 0.1) }.play;
```

Stop with Cmd+.**Expected:** Hear a sine beep.

### ✅ B) SuperDirt runs

Run `scripts/boot-superdirt.scd` in SuperCollider.**Expected:** See "SuperDirt is running on port 57120" message, no red errors.

### ✅ C) Tidal connects

In Pulsar (or editor), run:

```haskell
d1 $ sound "bd sn"
```

**Expected:** Hear kick/snare pattern.

### ✅ D) Stop works

Run:

```haskell
hush
```

**Expected:** All sound stops.

## Implementation Notes

- All file contents are exact as specified - no improvisation
- SuperCollider boot script is authoritative and must not be modified without understanding