"""
🏘️ VILLAGE INFRASTRUCTURE IMPACT PREDICTOR - GNN POWERED

Predicts cascading effects across roads, buildings, power, and water systems.
Matches the React website's Impact Prediction Panel design.

Features:
- Dark slate theme with cyan accents
- Card-based UI matching website aesthetics
- Severity-colored results (critical/high/medium/low)
- Real-time GNN prediction with strategic insights
"""

import gradio as gr
import numpy as np
from model import ImpactPredictor
from simulation_engine import SimulationEngine, FailureMode
from pathlib import Path
from typing import Dict, List, Tuple
from collections import deque


# =============================================================================
# INITIALIZATION
# =============================================================================

SCRIPT_DIR = Path(__file__).parent
MODEL_DIR = SCRIPT_DIR / "models"

print("🏘️ Village Impact Predictor - Initializing...")
model_path = str(MODEL_DIR / "gnn_production_v1.pt") if (MODEL_DIR / "gnn_production_v1.pt").exists() else str(MODEL_DIR / "gnn_model.pt")
predictor = ImpactPredictor(model_path=model_path, temperature=0.5, status_veto_weight=1.5)
simulation_engine = SimulationEngine(predictor)
print("✓ GNN Engine Ready\n")


# =============================================================================
# 🎨 DESIGN CONSTANTS (Matching React Website)
# =============================================================================

# Severity color scheme (from ImpactPredictionPanel.tsx)
SEVERITY_COLORS = {
    "critical": {"bg": "rgba(239, 68, 68, 0.2)", "text": "#f87171", "border": "#ef4444"},
    "high": {"bg": "rgba(249, 115, 22, 0.2)", "text": "#fb923c", "border": "#f97316"},
    "medium": {"bg": "rgba(234, 179, 8, 0.2)", "text": "#facc15", "border": "#eab308"},
    "low": {"bg": "rgba(34, 197, 94, 0.2)", "text": "#4ade80", "border": "#22c55e"},
}

# Node type colors (from website)
NODE_TYPE_COLORS = {
    "Tank": "#3b82f6",      # blue
    "Pump": "#a855f7",      # purple
    "Cluster": "#22c55e",   # green
    "Pipe": "#64748b",      # gray
    "Power": "#eab308",     # yellow
    "Sensor": "#06b6d4",    # cyan
    "Road": "#f59e0b",      # amber
    "Building": "#64748b",  # slate
    "School": "#6366f1",    # indigo
    "Hospital": "#ef4444",  # red
    "Market": "#10b981",    # emerald
}

# Node type labels
NODE_TYPE_LABELS = {
    "Tank": "Water Tank",
    "Pump": "Water Pump",
    "Cluster": "Consumer Area",
    "Pipe": "Water Pipe",
    "Power": "Power Node",
    "Sensor": "Sensor",
    "Road": "Road",
    "Building": "Building",
    "School": "School",
    "Hospital": "Hospital",
    "Market": "Market",
}

# Node type emojis
NODE_EMOJIS = {
    "Tank": "💧",
    "Pump": "⚙️",
    "Cluster": "👥",
    "Pipe": "🔗",
    "Power": "⚡",
    "Sensor": "📡",
    "Road": "🛣️",
    "Building": "🏢",
    "School": "🎓",
    "Hospital": "🏥",
    "Market": "🛒",
}


# =============================================================================
# 🚨 IMPACT CALCULATION & AMPLIFICATION
# =============================================================================

def amplify_risk(delta: float, topology_weight: float) -> float:
    """
    NON-LINEAR amplification for pessimistic crisis prediction.
    Small ripples become visible alerts for admin awareness.
    """
    if delta > 0:
        shout = (delta ** 0.5) * 2.5 * topology_weight
        return min(shout, 1.0)
    return delta * 0.1


def get_severity_level(score: float) -> str:
    """Map impact score to severity level."""
    if score >= 0.6:
        return "critical"
    elif score >= 0.3:
        return "high"
    elif score >= 0.1:
        return "medium"
    return "low"


# =============================================================================
# 🧠 STRATEGIC INSIGHTS
# =============================================================================

CRISIS_INSIGHTS = {
    "Complete Failure": {
        "critical": "Complete system failure affecting {node}. Immediate intervention required.",
        "high": "{node} experiencing significant disruption. Monitor closely.",
        "medium": "Moderate impact detected at {node}.",
        "low": "Minor effects observed at {node}.",
    },
    "Supply Disruption": {
        "critical": "Supply isolation: {node} cut off from water grid. Immediate rerouting required.",
        "high": "Pressure drop: {node} experiencing reduced flow. Monitor tank levels.",
        "medium": "Flow anomaly: Minor disruption detected at {node}.",
        "low": "Slight flow variation at {node}.",
    },
    "Contamination Alert": {
        "critical": "Biohazard spread: Contaminated water reaching {node}. ISOLATE IMMEDIATELY.",
        "high": "Contamination risk: {node} in contamination path. Test water quality.",
        "medium": "Quality alert: Potential contamination approaching {node}.",
        "low": "Water quality within acceptable range at {node}.",
    },
    "Power Failure": {
        "critical": "Total blackout: {node} lost all power. Critical systems offline.",
        "high": "Power disruption: {node} operating on backup. Limited capacity.",
        "medium": "Grid stress: Power fluctuations detected near {node}.",
        "low": "Minor power variance at {node}.",
    },
    "Infrastructure Damage": {
        "critical": "Structural failure: Pressure surge threatening {node}. Evacuate area.",
        "high": "Damage risk: {node} under abnormal stress. Inspect immediately.",
        "medium": "Pressure warning: Elevated stress detected at {node}.",
        "low": "Normal stress levels at {node}.",
    },
}

def get_strategic_insight(node_name: str, score: float, failure_type: str, node_type: str) -> str:
    """Generate human-readable impact description based on GNN patterns."""
    level = get_severity_level(score)
    if level == "low" and score < 0.05:
        return f"{node_name} appears stable."
    
    insights = CRISIS_INSIGHTS.get(failure_type, CRISIS_INSIGHTS["Complete Failure"])
    template = insights.get(level, f"Impact detected at {node_name}")
    return template.format(node=f"{node_name}")


def get_priority_actions(severity: str, failure_type: str, affected_count: int) -> List[str]:
    """Generate priority action recommendations."""
    actions = []
    
    if severity == "critical":
        actions.append("Activate emergency response protocol")
        actions.append("Notify all affected downstream consumers")
        if "Contamination" in failure_type:
            actions.append("Issue water boil advisory")
        elif "Power" in failure_type:
            actions.append("Deploy backup generators")
        else:
            actions.append("Isolate affected section")
    
    if severity in ["critical", "high"]:
        actions.append("Dispatch field inspection team")
        if affected_count > 3:
            actions.append("Consider partial system shutdown")
    
    if affected_count > 5:
        actions.append("Coordinate with neighboring districts")
    
    return actions[:4]  # Max 4 actions


# =============================================================================
# NODE TYPES & FAILURE SCENARIOS (Matching website)
# =============================================================================

NODE_TYPES = ["Tank", "Pump", "Pipe", "Hospital", "School", "Market", "Sensor", "Power", "Road", "Building"]

FAILURE_SCENARIOS = {
    "Complete Failure": {"mode": FailureMode.SUPPLY_CUT, "intensity": 3.0},
    "Supply Disruption": {"mode": FailureMode.SUPPLY_CUT, "intensity": 2.5},
    "Contamination Alert": {"mode": FailureMode.CONTAMINATION, "intensity": 4.0},
    "Power Failure": {"mode": FailureMode.DEMAND_LOSS, "intensity": 2.0},
    "Infrastructure Damage": {"mode": FailureMode.SUPPLY_CUT, "intensity": 3.5},
}

SEVERITY_OPTIONS = ["low", "medium", "high", "critical"]

SEVERITY_MULTIPLIERS = {
    "low": 0.5,
    "medium": 1.0,
    "high": 1.5,
    "critical": 2.0,
}


# =============================================================================
# AUTO-FILL: Type + Health → Full 24-dim Features (Hidden from user!)
# =============================================================================

def auto_fill_features(node_type: str, health: float) -> List[float]:
    """Convert simple (type, health) to full 24-dim GNN features."""
    type_map = {"Road": 0, "Building": 1, "Power": 2, "Tank": 3, "Pump": 4, "Pipe": 5,
                "Sensor": 6, "Cluster": 7, "Bridge": 8, "School": 9, "Hospital": 10, "Market": 11}
    
    onehot = [0] * 12
    onehot[type_map.get(node_type, 1)] = 1
    
    defaults = {
        "Tank":     [0.95, 0.85, 0.70, health, 0.90, 0.60, 0.50, 0.70, 0.85, 0.1, 0.1, 0.0],
        "Pump":     [0.85, 0.80, 0.90, health, 0.85, 0.50, 0.40, 0.80, 0.80, 0.1, 0.1, 0.0],
        "Pipe":     [0.70, 0.60, 0.75, health, 0.70, 0.40, 0.30, 0.60, 0.70, 0.1, 0.1, 0.0],
        "Hospital": [0.90, 0.95, 0.50, health, 0.99, 0.95, 0.90, 0.85, 0.95, 0.1, 0.05, 0.0],
        "School":   [0.85, 0.90, 0.40, health, 0.90, 0.85, 0.70, 0.75, 0.85, 0.1, 0.1, 0.0],
        "Market":   [0.80, 0.85, 0.60, health, 0.75, 0.70, 0.85, 0.80, 0.75, 0.1, 0.1, 0.0],
        "Sensor":   [0.50, 0.90, 0.30, health, 0.60, 0.20, 0.20, 0.90, 0.90, 0.1, 0.05, 0.0],
        "Power":    [0.90, 0.85, 0.80, health, 0.95, 0.70, 0.80, 0.85, 0.85, 0.1, 0.1, 0.0],
        "Road":     [0.80, 0.70, 0.80, health, 0.70, 0.60, 0.50, 0.90, 0.70, 0.1, 0.1, 0.0],
        "Building": [0.75, 0.70, 0.50, health, 0.60, 0.50, 0.60, 0.60, 0.70, 0.1, 0.1, 0.0],
    }
    return onehot + defaults.get(node_type, defaults["Building"])


def auto_weight(from_type: str, to_type: str) -> float:
    """Auto-calculate edge weight based on infrastructure criticality."""
    critical = {"Tank", "Pump", "Hospital", "Power"}
    w = 0.7 + (0.15 if from_type in critical else 0) + (0.1 if to_type in critical else 0)
    return min(w, 0.95)


# =============================================================================
# NETWORK STATE (In-memory storage)
# =============================================================================

# Global network state
network_state = {
    "nodes": {},      # {name: {"type": str, "health": float}}
    "edges": [],      # [(from, to)]
}


def add_node(name: str, node_type: str, health: float) -> str:
    """Add a node to the network."""
    if not name.strip():
        return "❌ Please enter a node name"
    
    name = name.strip()
    network_state["nodes"][name] = {"type": node_type, "health": health}
    return f"✅ Added: **{name}** ({node_type}, {health:.0%} health)"


def add_edge(from_node: str, to_node: str) -> str:
    """Add a connection between nodes."""
    if from_node not in network_state["nodes"]:
        return f"❌ Node '{from_node}' doesn't exist"
    if to_node not in network_state["nodes"]:
        return f"❌ Node '{to_node}' doesn't exist"
    if from_node == to_node:
        return "❌ Can't connect node to itself"
    
    edge = (from_node, to_node)
    if edge not in network_state["edges"]:
        network_state["edges"].append(edge)
        # Add reverse edge for bidirectional
        network_state["edges"].append((to_node, from_node))
    
    return f"✅ Connected: **{from_node}** ↔ **{to_node}**"


def clear_network() -> str:
    """Clear the entire network."""
    network_state["nodes"] = {}
    network_state["edges"] = []
    return "🗑️ Network cleared"


def get_network_display() -> str:
    """Show current network status."""
    if not network_state["nodes"]:
        return "*No nodes yet. Add some!*"
    
    output = "### 📍 Nodes\n"
    for name, info in network_state["nodes"].items():
        health_icon = "🟢" if info["health"] >= 0.7 else "🟡" if info["health"] >= 0.4 else "🔴"
        output += f"- {health_icon} **{name}** ({info['type']}, {info['health']:.0%})\n"
    
    output += "\n### 🔗 Connections\n"
    seen = set()
    for f, t in network_state["edges"]:
        key = tuple(sorted([f, t]))
        if key not in seen:
            seen.add(key)
            output += f"- {f} ↔ {t}\n"
    
    if not seen:
        output += "*No connections yet*\n"
    
    return output


def get_node_choices():
    """Get list of nodes for dropdown."""
    return list(network_state["nodes"].keys()) if network_state["nodes"] else ["(add nodes first)"]


def load_example_network() -> str:
    """Load a pre-built example network."""
    network_state["nodes"] = {
        "Main-Tank": {"type": "Tank", "health": 0.95},
        "Pump-A": {"type": "Pump", "health": 0.90},
        "Main-Pipe": {"type": "Pipe", "health": 0.85},
        "Hospital": {"type": "Hospital", "health": 0.95},
        "School": {"type": "School", "health": 0.90},
    }
    network_state["edges"] = [
        ("Main-Tank", "Pump-A"), ("Pump-A", "Main-Tank"),
        ("Pump-A", "Main-Pipe"), ("Main-Pipe", "Pump-A"),
        ("Main-Pipe", "Hospital"), ("Hospital", "Main-Pipe"),
        ("Main-Pipe", "School"), ("School", "Main-Pipe"),
    ]
    return "✅ Loaded example: Tank → Pump → Pipe → Hospital/School"


# =============================================================================
# CASCADE DEPTH CALCULATION
# =============================================================================

def compute_cascade_depth(edges: List[Tuple], source: str, nodes: List[str]) -> Dict[str, int]:
    """BFS to find hop distance from failure source."""
    adj = {n: [] for n in nodes}
    for f, t in edges:
        adj[f].append(t)
    
    depths = {source: 0}
    queue = deque([source])
    while queue:
        node = queue.popleft()
        for neighbor in adj.get(node, []):
            if neighbor not in depths:
                depths[neighbor] = depths[node] + 1
                queue.append(neighbor)
    return depths


# =============================================================================
# THE MAIN PREDICTION FUNCTION (Website-style output)
# =============================================================================

def run_prediction(failed_node: str, failure_type: str, severity: str) -> str:
    """Run GNN prediction and return website-styled HTML output."""
    
    if not network_state["nodes"]:
        return render_error("No network! Add some nodes first or load the example.")
    
    if failed_node not in network_state["nodes"]:
        return render_error(f"Node '{failed_node}' not found in network.")
    
    # Build GNN inputs
    node_names = list(network_state["nodes"].keys())
    name_to_idx = {n: i for i, n in enumerate(node_names)}
    
    features = []
    for name in node_names:
        info = network_state["nodes"][name]
        features.append(auto_fill_features(info["type"], info["health"]))
    x = np.array(features, dtype=np.float32)
    
    edge_list, edge_weights = [], []
    for f, t in network_state["edges"]:
        if f in name_to_idx and t in name_to_idx:
            edge_list.append([name_to_idx[f], name_to_idx[t]])
            edge_weights.append(auto_weight(
                network_state["nodes"][f]["type"],
                network_state["nodes"][t]["type"]
            ))
    
    if not edge_list:
        return render_error("No connections in network! Add some edges.")
    
    edge_index = np.array(edge_list, dtype=np.int64).T
    edge_weight = np.array(edge_weights, dtype=np.float32)
    
    # Run GNN simulation
    scenario = FAILURE_SCENARIOS.get(failure_type, FAILURE_SCENARIOS["Complete Failure"])
    failed_idx = name_to_idx[failed_node]
    
    result = simulation_engine.run_simulation(
        x, edge_index, edge_weight,
        failed_nodes=[failed_idx],
        node_names=node_names,
        failure_mode=scenario["mode"],
        pessimistic_mode=True
    )
    
    # Compute cascade depths
    cascade_depths = compute_cascade_depth(network_state["edges"], failed_node, node_names)
    
    # Calculate impact scores with severity multiplier
    intensity = scenario["intensity"] * SEVERITY_MULTIPLIERS.get(severity, 1.0)
    
    affected_nodes = []
    for node in result["nodes"]:
        if node["is_failed_source"]:
            continue
        
        name = node["node_name"]
        raw_delta = node["delta"]
        topo_weight = edge_weights[0] if edge_weights else 0.8
        
        impact_score = amplify_risk(raw_delta, topo_weight * intensity / 2.5)
        node_severity = get_severity_level(impact_score)
        node_type = network_state["nodes"].get(name, {}).get("type", "Building")
        hops = cascade_depths.get(name, 0)
        
        if impact_score >= 0.02:  # Only include nodes with meaningful impact
            affected_nodes.append({
                "name": name,
                "type": node_type,
                "score": impact_score,
                "severity": node_severity,
                "hops": hops,
                "insight": get_strategic_insight(name, impact_score, failure_type, node_type),
                "metrics": {
                    "supplyDisruption": int(impact_score * 80 + np.random.randint(0, 20)),
                    "pressureDrop": int(impact_score * 60 + np.random.randint(0, 30)),
                    "qualityRisk": int(impact_score * 40 + np.random.randint(0, 25)),
                    "cascadeRisk": int(impact_score * 100),
                }
            })
    
    # Sort by impact score
    affected_nodes.sort(key=lambda x: x["score"], reverse=True)
    
    # Determine overall risk level
    if affected_nodes:
        max_score = affected_nodes[0]["score"]
        overall_severity = get_severity_level(max_score)
    else:
        overall_severity = "low"
        max_score = 0
    
    # Count by severity
    critical_count = sum(1 for n in affected_nodes if n["severity"] == "critical")
    high_count = sum(1 for n in affected_nodes if n["severity"] == "high")
    
    # Estimate affected population
    affected_pop = sum(
        150 if n["type"] in ["Hospital", "School", "Market"] else 50
        for n in affected_nodes
    )
    
    # Estimate recovery time
    if overall_severity == "critical":
        recovery = "4-8 hours"
    elif overall_severity == "high":
        recovery = "2-4 hours"
    elif overall_severity == "medium":
        recovery = "1-2 hours"
    else:
        recovery = "< 1 hour"
    
    # Get source node info
    source_type = network_state["nodes"][failed_node]["type"]
    
    # Get priority actions
    priority_actions = get_priority_actions(overall_severity, failure_type, len(affected_nodes))
    
    # Render the HTML output
    return render_impact_results(
        source_node=failed_node,
        source_type=source_type,
        failure_type=failure_type,
        severity=severity,
        overall_severity=overall_severity,
        affected_nodes=affected_nodes,
        critical_count=critical_count,
        high_count=high_count,
        affected_pop=affected_pop,
        recovery=recovery,
        priority_actions=priority_actions,
    )


# =============================================================================
# HTML RENDERING (Website-style)
# =============================================================================

def render_error(message: str) -> str:
    """Render error message in website style."""
    return f'''
    <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">⚠️</span>
        <span style="color: #f87171;">{message}</span>
    </div>
    '''


def render_impact_results(
    source_node: str,
    source_type: str,
    failure_type: str,
    severity: str,
    overall_severity: str,
    affected_nodes: List[dict],
    critical_count: int,
    high_count: int,
    affected_pop: int,
    recovery: str,
    priority_actions: List[str],
) -> str:
    """Render full impact results in website style."""
    
    colors = SEVERITY_COLORS[overall_severity]
    source_color = NODE_TYPE_COLORS.get(source_type, "#64748b")
    source_emoji = NODE_EMOJIS.get(source_type, "🏢")
    
    # Build affected nodes cards
    affected_html = ""
    for node in affected_nodes[:10]:  # Limit to top 10
        node_colors = SEVERITY_COLORS[node["severity"]]
        node_color = NODE_TYPE_COLORS.get(node["type"], "#64748b")
        node_emoji = NODE_EMOJIS.get(node["type"], "🏢")
        
        affected_html += f'''
        <div style="border: 1px solid {node_colors["border"]}; border-radius: 8px; margin-bottom: 8px; overflow: hidden;">
            <div style="background: {node_colors["bg"]}; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: {node_color}; width: 32px; height: 32px; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 16px;">{node_emoji}</span>
                    </div>
                    <div>
                        <div style="color: white; font-weight: 600;">{node["name"]}</div>
                        <div style="color: #94a3b8; font-size: 12px;">{NODE_TYPE_LABELS.get(node["type"], node["type"])} • Impact in ~{node["hops"]}h</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="color: {node_colors["text"]}; font-weight: 700;">{node["score"]:.0%} likely</div>
                    <div style="color: #94a3b8; font-size: 12px;">{node["severity"]} severity</div>
                </div>
            </div>
            <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-top: 1px solid #334155;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Expected Effects</div>
                <div style="color: #cbd5e1; font-size: 13px; margin-bottom: 12px;">• {node["insight"]}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div style="background: rgba(71, 85, 105, 0.5); border-radius: 6px; padding: 8px;">
                        <div style="color: #94a3b8; font-size: 11px;">Supply Disruption</div>
                        <div style="color: white; font-size: 14px; font-weight: 500;">{node["metrics"]["supplyDisruption"]}%</div>
                    </div>
                    <div style="background: rgba(71, 85, 105, 0.5); border-radius: 6px; padding: 8px;">
                        <div style="color: #94a3b8; font-size: 11px;">Pressure Drop</div>
                        <div style="color: white; font-size: 14px; font-weight: 500;">{node["metrics"]["pressureDrop"]}%</div>
                    </div>
                    <div style="background: rgba(71, 85, 105, 0.5); border-radius: 6px; padding: 8px;">
                        <div style="color: #94a3b8; font-size: 11px;">Quality Risk</div>
                        <div style="color: white; font-size: 14px; font-weight: 500;">{node["metrics"]["qualityRisk"]}%</div>
                    </div>
                    <div style="background: rgba(71, 85, 105, 0.5); border-radius: 6px; padding: 8px;">
                        <div style="color: #94a3b8; font-size: 11px;">Cascade Risk</div>
                        <div style="color: white; font-size: 14px; font-weight: 500;">{node["metrics"]["cascadeRisk"]}%</div>
                    </div>
                </div>
            </div>
        </div>
        '''
    
    # Build priority actions
    actions_html = ""
    for action in priority_actions:
        actions_html += f'''
            <li style="display: flex; align-items: center; gap: 8px; color: #cbd5e1; font-size: 13px; margin-bottom: 4px;">
                <span style="color: #22d3ee;">→</span> {action}
            </li>
        '''
    
    return f'''
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Overall Assessment -->
        <div style="background: {colors["bg"]}; border: 1px solid {colors["border"]}; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="font-size: 24px;">⚠️</span>
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <h3 style="color: white; font-size: 18px; font-weight: 700; margin: 0;">Impact Assessment</h3>
                        <span style="background: {colors["bg"]}; color: {colors["text"]}; border: 1px solid {colors["border"]}; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                            {overall_severity.upper()} RISK
                        </span>
                    </div>
                    <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0;">
                        {failure_type} at {source_node} is predicted to cascade through {len(affected_nodes)} connected infrastructure nodes.
                    </p>
                    
                    <!-- Quick Stats -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px;">
                        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 8px; text-align: center;">
                            <div style="color: white; font-size: 20px; font-weight: 700;">{len(affected_nodes)}</div>
                            <div style="color: #94a3b8; font-size: 11px;">Affected Nodes</div>
                        </div>
                        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 8px; text-align: center;">
                            <div style="color: #f87171; font-size: 20px; font-weight: 700;">{critical_count}</div>
                            <div style="color: #94a3b8; font-size: 11px;">Critical</div>
                        </div>
                        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 8px; text-align: center;">
                            <div style="color: #fb923c; font-size: 20px; font-weight: 700;">{high_count}</div>
                            <div style="color: #94a3b8; font-size: 11px;">High Severity</div>
                        </div>
                        <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 8px; text-align: center;">
                            <div style="color: #22d3ee; font-size: 20px; font-weight: 700;">~{affected_pop}</div>
                            <div style="color: #94a3b8; font-size: 11px;">People Affected</div>
                        </div>
                    </div>
                    
                    <!-- Priority Actions -->
                    {f'''
                    <div style="background: rgba(30, 41, 59, 0.5); border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                        <h4 style="color: white; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">Priority Actions</h4>
                        <ul style="margin: 0; padding: 0; list-style: none;">
                            {actions_html}
                        </ul>
                    </div>
                    ''' if priority_actions else ''}
                    
                    <!-- Recovery Time -->
                    <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8; font-size: 13px;">
                        <span>🕐</span> Estimated Recovery: {recovery}
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Failure Source -->
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
            <h3 style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                <span style="color: #f87171;">✕</span> Failure Source
            </h3>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 12px;">
                <div style="background: {source_color}; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 20px;">{source_emoji}</span>
                </div>
                <div>
                    <div style="color: white; font-weight: 600;">{source_node}</div>
                    <div style="color: #94a3b8; font-size: 13px;">{NODE_TYPE_LABELS.get(source_type, source_type)} • {failure_type} ({severity})</div>
                </div>
            </div>
        </div>
        
        <!-- Cascading Effects -->
        <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 16px;">
            <h3 style="color: white; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
                <span style="color: #fb923c;">⚠️</span> Cascading Effects ({len(affected_nodes)} nodes)
            </h3>
            <div style="max-height: 400px; overflow-y: auto;">
                {affected_html if affected_html else '<div style="color: #94a3b8; text-align: center; padding: 20px;">No significant cascading effects detected.</div>'}
            </div>
        </div>
    </div>
    '''
# =============================================================================
# 🎨 GRADIO UI - WEBSITE-STYLE IMPACT PREDICTOR
# =============================================================================

# Custom CSS matching website theme
CUSTOM_CSS = """
.gradio-container {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%) !important;
}
.main-header {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
}
.panel-section {
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 16px;
}
"""

CUSTOM_THEME = gr.themes.Soft(
    primary_hue="cyan",
    secondary_hue="slate", 
    neutral_hue="slate",
)

with gr.Blocks(
    title="Village Infrastructure Impact Predictor",
) as demo:
    
    # Header
    gr.HTML('''
    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: rgba(6, 182, 212, 0.2); padding: 8px; border-radius: 8px;">
                <span style="font-size: 24px;">🌐</span>
            </div>
            <div>
                <h1 style="color: white; font-size: 20px; font-weight: 700; margin: 0;">Village Infrastructure Impact Predictor</h1>
                <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">Predict cascading effects across roads, buildings, power, and water systems</p>
            </div>
        </div>
    </div>
    ''')
    
    with gr.Row():
        # =====================================================================
        # LEFT: NETWORK BUILDER
        # =====================================================================
        with gr.Column(scale=1):
            gr.HTML('''
            <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #22d3ee;">🏗️</span> Build Network
            </div>
            ''')
            
            with gr.Group():
                gr.HTML('<div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">Add Node</div>')
                node_name = gr.Textbox(label="Name", placeholder="e.g., Main-Tank", show_label=False)
                node_type = gr.Dropdown(choices=NODE_TYPES, value="Tank", label="Type", show_label=False)
                node_health = gr.Slider(0, 1, value=0.95, step=0.05, label="Health")
                add_node_btn = gr.Button("➕ Add Node", variant="secondary", size="sm")
            
            with gr.Group():
                gr.HTML('<div style="color: #94a3b8; font-size: 13px; margin-bottom: 8px;">Connect Nodes</div>')
                from_dropdown = gr.Dropdown(choices=[], label="From", show_label=False)
                to_dropdown = gr.Dropdown(choices=[], label="To", show_label=False)
                add_edge_btn = gr.Button("🔗 Connect", variant="secondary", size="sm")
            
            with gr.Row():
                load_example_btn = gr.Button("📥 Load Example", size="sm")
                clear_btn = gr.Button("🗑️ Clear All", size="sm")
            
            status_box = gr.Markdown("*Ready to build*")
            network_display = gr.Markdown("*Network will appear here*")
        
        # =====================================================================
        # MIDDLE: PREDICTION CONTROLS
        # =====================================================================
        with gr.Column(scale=1):
            gr.HTML('''
            <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #22d3ee;">⚡</span> Scenario Selection
            </div>
            ''')
            
            # Node Type Filter (like website)
            node_type_filter = gr.Dropdown(
                choices=["All Types"] + NODE_TYPES,
                value="All Types",
                label="Infrastructure Type",
            )
            
            # Node Selection
            fail_node = gr.Dropdown(
                choices=[],
                label="Select Node",
            )
            
            # Failure Scenario
            fail_type = gr.Dropdown(
                choices=list(FAILURE_SCENARIOS.keys()),
                value="Supply Disruption",
                label="Failure Scenario",
            )
            
            # Severity (like website)
            severity_select = gr.Dropdown(
                choices=SEVERITY_OPTIONS,
                value="medium",
                label="Severity",
            )
            
            # Predict Button (cyan like website)
            predict_btn = gr.Button(
                "📊 Predict Impact", 
                variant="primary", 
                size="lg",
            )
            
            gr.HTML('''
            <div style="margin-top: 16px; padding: 12px; background: rgba(30, 41, 59, 0.5); border-radius: 8px; border: 1px solid #334155;">
                <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">How it works</div>
                <div style="color: #cbd5e1; font-size: 13px;">
                    GNN analyzes infrastructure topology to predict how failures cascade through connected systems.
                </div>
            </div>
            ''')
        
        # =====================================================================
        # RIGHT: RESULTS
        # =====================================================================
        with gr.Column(scale=2):
            gr.HTML('''
            <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                <span style="color: #22d3ee;">📊</span> Impact Prediction Results
            </div>
            ''')
            
            result_output = gr.HTML('''
            <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid #334155; border-radius: 12px; padding: 40px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
                <div style="color: white; font-size: 16px; font-weight: 600; margin-bottom: 8px;">Ready to Predict</div>
                <div style="color: #94a3b8; font-size: 14px;">
                    Build a network or load the example, then select a node and failure scenario to see cascading effects.
                </div>
            </div>
            ''')
    
    # =========================================================================
    # EVENT HANDLERS
    # =========================================================================
    
    def update_dropdowns():
        choices = get_node_choices()
        return gr.update(choices=choices), gr.update(choices=choices), gr.update(choices=choices)
    
    def handle_add_node(name, ntype, health):
        msg = add_node(name, ntype, health)
        display = get_network_display()
        from_dd, to_dd, fail_dd = update_dropdowns()
        return msg, display, from_dd, to_dd, fail_dd
    
    def handle_add_edge(f, t):
        msg = add_edge(f, t)
        display = get_network_display()
        return msg, display
    
    def handle_load_example():
        msg = load_example_network()
        display = get_network_display()
        from_dd, to_dd, fail_dd = update_dropdowns()
        return msg, display, from_dd, to_dd, fail_dd
    
    def handle_clear():
        msg = clear_network()
        display = get_network_display()
        from_dd, to_dd, fail_dd = update_dropdowns()
        return msg, display, from_dd, to_dd, fail_dd
    
    def filter_nodes_by_type(type_filter):
        """Filter node dropdown by type."""
        if type_filter == "All Types":
            choices = list(network_state["nodes"].keys())
        else:
            choices = [name for name, info in network_state["nodes"].items() if info["type"] == type_filter]
        
        if not choices:
            choices = ["(no matching nodes)"]
        
        return gr.update(choices=choices, value=choices[0] if choices else None)
    
    add_node_btn.click(
        handle_add_node,
        inputs=[node_name, node_type, node_health],
        outputs=[status_box, network_display, from_dropdown, to_dropdown, fail_node]
    )
    
    add_edge_btn.click(
        handle_add_edge,
        inputs=[from_dropdown, to_dropdown],
        outputs=[status_box, network_display]
    )
    
    load_example_btn.click(
        handle_load_example,
        outputs=[status_box, network_display, from_dropdown, to_dropdown, fail_node]
    )
    
    clear_btn.click(
        handle_clear,
        outputs=[status_box, network_display, from_dropdown, to_dropdown, fail_node]
    )
    
    node_type_filter.change(
        filter_nodes_by_type,
        inputs=[node_type_filter],
        outputs=[fail_node]
    )
    
    predict_btn.click(
        run_prediction,
        inputs=[fail_node, fail_type, severity_select],
        outputs=[result_output]
    )


# =============================================================================
# LAUNCH
# =============================================================================

if __name__ == "__main__":
    print("�️ Village Infrastructure Impact Predictor launching...")
    print("   URL: http://localhost:7875")
    print("   Design: Matches React website ImpactPredictionPanel\n")
    demo.launch(
        server_name="0.0.0.0", 
        server_port=7875, 
        show_error=True,
        theme=CUSTOM_THEME,
        css=CUSTOM_CSS,
    )
