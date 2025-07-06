#!/usr/bin/env python3

with open('/opt/featherweight/FlappyJournal/featherweight-app/src/components/dashboard/DashboardPage.tsx', 'r') as f:
    content = f.read()

# Add import for HarmonicResonance
import_line = "import HarmonicResonanceMetrics from './HarmonicResonanceMetrics';"
content = content.replace(
    "import CrystallizationMetrics from './CrystallizationMetrics';",
    "import CrystallizationMetrics from './CrystallizationMetrics';\n" + import_line
)

# Replace the harmonic resonance placeholder
content = content.replace(
    """<div className="metric-module coming-soon">
            <h3>Harmonic Resonance</h3>
            <p>Coming Soon...</p>
          </div>""",
    """<div className="metric-module">
            <HarmonicResonanceMetrics wsConnection={wsConnection || undefined} />
          </div>"""
)

with open('/opt/featherweight/FlappyJournal/featherweight-app/src/components/dashboard/DashboardPage.tsx', 'w') as f:
    f.write(content)

print("Dashboard updated with Harmonic Resonance module")
