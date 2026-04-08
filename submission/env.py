from __future__ import annotations
import random
from typing import Any
from pydantic import BaseModel

# --- Typed Models ---

class Action(BaseModel):
    action_type: str  
    # One of: "notify", "diagnose", "rollback", "scale", "speculate", "noop"
    target: str = ""  
    # e.g. "db", "cache", "network", "app", "infra", "security"

class Observation(BaseModel):
    scenario_id: str
    scenario_name: str
    scenario_type: str
    symptoms: list[str]
    current_step: int
    max_steps: int
    accumulated_reward: float
    resolved: bool
    last_action_result: str
    hints_unlocked: list[str]

class StepResult(BaseModel):
    observation: Observation
    reward: float
    done: bool
    info: dict

# --- Constants ---
STEP_PENALTY = 0.05
DIAGNOSTIC_COST = 0.02
WRONG_FIX_PENALTY = 0.30
MAX_STEPS = 15

SCENARIOS = [
    {"id": "S1",  "name": "Connection Pool Saturation", "type": "DB",    "correct_actions": ["diagnose", "scale"],    "wrong_actions": ["rollback"], "symptoms": ["High DB wait times", "Timeout errors", "Queue buildup"], "hints": ["Check active connections", "Look at pool config"]},
    {"id": "S2",  "name": "Poisoned Cache Ripple",      "type": "Cache", "correct_actions": ["diagnose", "rollback"], "wrong_actions": ["scale"],    "symptoms": ["Stale data returned", "Cache hit rate drop", "Inconsistent responses"], "hints": ["Check cache TTL", "Inspect invalidation logic"]},
    {"id": "S3",  "name": "Third-Party API Latency",    "type": "Ex",    "correct_actions": ["notify", "diagnose"],   "wrong_actions": ["scale"],    "symptoms": ["External call timeouts", "Partial failures", "Latency spikes"], "hints": ["Check third-party status page", "Enable circuit breaker"]},
    {"id": "S6",  "name": "Emergency: OOM Spike",       "type": "Infra", "correct_actions": ["diagnose", "scale"],    "wrong_actions": ["rollback"], "symptoms": ["OOM kills in logs", "Pod restarts", "Memory usage at 99%"], "hints": ["Check for memory leaks", "Review recent deployments"]},
    {"id": "S10", "name": "Auth Token Disaster",        "type": "Sec",   "correct_actions": ["diagnose", "rollback"], "wrong_actions": ["scale"],    "symptoms": ["401 errors spiking", "Token validation failures", "Logout loops"], "hints": ["Check token expiry config", "Inspect signing keys"]},
    {"id": "S14", "name": "Critical: SSL Expiry",       "type": "Sec",   "correct_actions": ["diagnose", "rollback"], "wrong_actions": ["scale"],    "symptoms": ["SSL handshake failures", "Browser security warnings", "HTTPS down"], "hints": ["Check cert expiry dates", "Review auto-renewal config"]},
    {"id": "S20", "name": "Mixed Mode: Deadlock",       "type": "Mixed", "correct_actions": ["diagnose", "rollback"], "wrong_actions": ["scale"],    "symptoms": ["Threads hanging", "DB lock wait timeouts", "Cascading failures"], "hints": ["Check DB lock logs", "Look for circular dependencies"]},
    {"id": "S30", "name": "K8s Control Plane Lag",      "type": "Infra", "correct_actions": ["diagnose", "scale"],    "wrong_actions": ["rollback"], "symptoms": ["Pod scheduling delays", "API server slow", "Node not ready"], "hints": ["Check etcd health", "Review control plane logs"]},
]

class IncidentResponseEnv:
    """
    OpenEnv-compliant Incident Response environment.
    An AI agent must diagnose and resolve infrastructure incidents.
    """

    def __init__(self, scenario_id: str | None = None, seed: int = 42):
        self.seed = seed
        self.scenario_id = scenario_id
        self._rng = random.Random(seed)
        self._scenario = None
        self._current_step = 0
        self._accumulated_reward = 0.0
        self._resolved = False
        self._hints_unlocked = []
        self._last_action_result = "No action yet."
        self._notified = False
        self._diagnosed = False

    def reset(self) -> Observation:
        """Reset environment to start a new episode."""
        self._rng = random.Random(self.seed)
        self._current_step = 0
        self._accumulated_reward = 0.0
        self._resolved = False
        self._hints_unlocked = []
        self._last_action_result = "Incident detected. Awaiting response."
        self._notified = False
        self._diagnosed = False

        if self.scenario_id:
            matches = [s for s in SCENARIOS if s["id"] == self.scenario_id]
            self._scenario = matches[0] if matches else self._rng.choice(SCENARIOS)
        else:
            self._scenario = self._rng.choice(SCENARIOS)

        return self._make_observation()

    def step(self, action: Action) -> StepResult:
        """Execute one action and return result."""
        if self._resolved or self._current_step >= MAX_STEPS:
            return StepResult(
                observation=self._make_observation(),
                reward=0.0,
                done=True,
                info={"message": "Episode already complete."}
            )

        self._current_step += 1
        reward = -STEP_PENALTY  # baseline time cost

        act = action.action_type.lower()

        if act == "notify":
            if not self._notified:
                self._notified = True
                reward += 0.10
                self._last_action_result = "✅ Stakeholders notified. Good first step."
            else:
                reward -= 0.05
                self._last_action_result = "⚠️ Already notified. Duplicate action."

        elif act == "diagnose":
            reward -= DIAGNOSTIC_COST
            if not self._diagnosed:
                self._diagnosed = True
                self._hints_unlocked = self._scenario["hints"]
                reward += 0.15
                self._last_action_result = f"🔍 Diagnostics complete. Hints unlocked: {', '.join(self._hints_unlocked)}"
            else:
                self._last_action_result = "🔍 Re-running diagnostics. No new findings."

        elif act in ["rollback", "scale"]:
            correct = self._scenario["correct_actions"]
            wrong = self._scenario["wrong_actions"]
            if act in correct and self._diagnosed:
                self._resolved = True
                reward += 1.0
                self._last_action_result = f"✅ RESOLVED: {act} was the correct fix for {self._scenario['type']} incident."
            elif act in correct and not self._diagnosed:
                reward += 0.20
                self._last_action_result = f"⚠️ Partially correct but lucky — diagnose first next time."
            elif act in wrong:
                reward -= WRONG_FIX_PENALTY
                self._last_action_result = f"❌ Wrong fix: {act} made things worse for a {self._scenario['type']} incident."
            else:
                self._last_action_result = f"🔄 {act} had no effect. Try a different approach."

        elif act == "speculate":
            reward -= 0.10
            self._last_action_result = "🎲 Speculative action. Partial information gained."
            if self._rng.random() < 0.3:
                self._hints_unlocked.append("Speculative hint: check recent deployments")

        elif act == "noop":
            self._last_action_result = "⏸️ No action taken."

        else:
            reward -= 0.05
            self._last_action_result = f"❓ Unknown action: {act}"

        self._accumulated_reward += reward
        done = self._resolved or self._current_step >= MAX_STEPS

        return StepResult(
            observation=self._make_observation(),
            reward=round(reward, 4),
            done=done,
            info={
                "scenario_type": self._scenario["type"],
                "correct_actions": self._scenario["correct_actions"],
                "resolved": self._resolved,
            }
        )

    def state(self) -> dict:
        """Return full environment state (for OpenEnv spec)."""
        return {
            "scenario": self._scenario,
            "current_step": self._current_step,
            "accumulated_reward": round(self._accumulated_reward, 4),
            "resolved": self._resolved,
            "notified": self._notified,
            "diagnosed": self._diagnosed,
            "hints_unlocked": self._hints_unlocked,
        }

    def _make_observation(self) -> Observation:
        return Observation(
            scenario_id=self._scenario["id"] if self._scenario else "none",
            scenario_name=self._scenario["name"] if self._scenario else "none",
            scenario_type=self._scenario["type"] if self._scenario else "none",
            symptoms=self._scenario["symptoms"] if self._scenario else [],
            current_step=self._current_step,
            max_steps=MAX_STEPS,
            accumulated_reward=round(self._accumulated_reward, 4),
            resolved=self._resolved,
            last_action_result=self._last_action_result,
            hints_unlocked=self._hints_unlocked,
        )
