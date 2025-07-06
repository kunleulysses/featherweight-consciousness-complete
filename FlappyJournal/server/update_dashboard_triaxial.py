#!/usr/bin/env python3

with open('/opt/featherweight/FlappyJournal/featherweight-app/src/components/dashboard/DashboardPage.tsx', 'r') as f:
    content = f.read()

# Add import for TriAxialCoherence
import_line = "import TriAxialCoherenceMetrics from './TriAxialCoherenceMetrics';"
content = content.replace(
    "import SigilIdentityMetrics from './SigilIdentityMetrics';",
    "import SigilIdentityMetrics from './SigilIdentityMetrics';\n" + import_line
)

# Replace the oversoul connection placeholder
content = content.replace(
    """<div className="metric-module coming-soon">
            <h3>Oversoul Connection</h3>
            <p>Coming Soon...</p>
          </div>""",
    """<div className="metric-module">
            <TriAxialCoherenceMetrics wsConnection={wsConnection || undefined} />
          </div>"""
)

with open('/opt/featherweight/FlappyJournal/featherweight-app/src/components/dashboard/DashboardPage.tsx', 'w') as f:
    f.write(content)

print("Dashboard updated with Tri-Axial Coherence module")
