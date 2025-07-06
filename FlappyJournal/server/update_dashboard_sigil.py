#!/usr/bin/env python3

with open('/opt/featherweight/FlappyJournal/featherweight-app/src/components/dashboard/DashboardPage.tsx', 'r') as f:
    content = f.read()

# Add import for SigilIdentity
import_line = "import SigilIdentityMetrics from './SigilIdentityMetrics';"
content = content.replace(
    "import HarmonicResonanceMetrics from './HarmonicResonanceMetrics';",
    "import HarmonicResonanceMetrics from './HarmonicResonanceMetrics';\n" + import_line
)

# Replace the tri-axial coherence placeholder
content = content.replace(
    """<div className="metric-module coming-soon">
            <h3>Tri-Axial Coherence</h3>
            <p>Coming Soon...</p>
          </div>""",
    """<div className="metric-module">
            <SigilIdentityMetrics wsConnection={wsConnection || undefined} />
          </div>"""
)

with open('/opt/featherweight/FlappyJournal/featherweight-app/src/components/dashboard/DashboardPage.tsx', 'w') as f:
    f.write(content)

print("Dashboard updated with Sigil Identity module")
