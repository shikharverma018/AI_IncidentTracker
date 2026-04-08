---
title: AI Incident Tracker
emoji: 🚨
colorFrom: blue
colorTo: red
sdk: docker
pinned: false
---

# 🚨 AI Incident Response — OpenEnv Environment

An AI environment where agents learn to diagnose and resolve real-world infrastructure incidents.

## Environment Description
The agent receives an observation of an active incident (symptoms, scenario type, step count) and must choose actions to resolve it efficiently. Partial progress is rewarded. Wrong fixes are penalized.

## Observation Space
| Field | Type | Description |
|---|---|---|
| scenario_id | string | Unique incident ID |
| scenario_name | string | Human-readable name |
| scenario_type | string | DB / Cache / Net / Sec / Infra / Mixed |
| symptoms | list[str] | Observable symptoms |
| current_step | int | Steps taken so far |
| accumulated_reward | float | Total reward this episode |
| resolved | bool | Whether incident is resolved |
| hints_unlocked | list[str] | Diagnostic hints earned |

## Action Space
| action_type | Description |
|---|---|
| notify | Alert stakeholders (+0.10 first time) |
| diagnose | Run diagnostics, unlock hints (-0.02 + 0.15) |
| rollback | Rollback last deployment (+1.0 if correct) |
| scale | Scale resources (+1.0 if correct) |
| speculate | Random probe (-0.10) |
| noop | Do nothing (-0.05) |

## Tasks
| Task | Difficulty | Passing Score |
|---|---|---|
| easy_notify_and_diagnose | Easy | 0.7 |
| medium_security_recovery | Medium | 0.5 |
| hard_mixed_incident | Hard | 0.35 |

## Setup
```bash
pip install openai pydantic fastapi uvicorn
cd submission
python inference.py
```

## API Usage
```python
from submission.env import IncidentResponseEnv, Action

env = IncidentResponseEnv(scenario_id="S1", seed=42)
obs = env.reset()
result = env.step(Action(action_type="notify"))
result = env.step(Action(action_type="diagnose"))
result = env.step(Action(action_type="scale", target="db"))
print(env.state())
```

## Environment Variables (Required for LLM probe)
- `API_BASE_URL` — LiteLLM proxy base URL (injected by OpenEnv)
- `API_KEY` — API key (injected by OpenEnv)
