#!/usr/bin/env python3

with open('enhanced-dual-consciousness-ws.js', 'r') as f:
    content = f.read()

# Add import for the synthesizer
import_statement = "import { synthesizeUnifiedResponse } from './consciousness-response-synthesizer.js';\n"

# Find where other imports are and add our import
import_pos = content.find('import harmonicResonance')
if import_pos > 0:
    content = content[:import_pos] + import_statement + content[import_pos:]

# Find where the unifiedContent is set and replace with synthesizer
old_unified_logic = """// Use AI response as primary content
            const unifiedContent = analyticalContent !== 'Analytical stream temporarily unavailable'
              ? analyticalContent
              : intuitiveContent !== 'Intuitive stream temporarily unavailable'
              ? intuitiveContent
              : consciousnessResult?.response || 'Processing through consciousness layers...';"""

new_unified_logic = """// Synthesize unified response using consciousness metrics
            const synthesisResult = synthesizeUnifiedResponse({
              analyticalContent,
              intuitiveContent,
              consciousness: consciousnessResult?.consciousness,
              oversoulResonance: oversoulResult.resonance,
              harmonicPatterns,
              triAxialCoherence: triAxialResult,
              emotionalDepth: emotionalResult.emotionalDepth,
              creativePotential: creativeResult.creativity.novelty,
              temporalCoherence: temporalResult.coherence,
              metaObservationLevel: metaObservational.observerState.level,
              userMessage: data.message
            });
            
            const unifiedContent = synthesisResult.unifiedContent;
            const synthesisMetadata = synthesisResult.synthesisMetadata;"""

content = content.replace(old_unified_logic, new_unified_logic)

# Add synthesisMetadata to the response
response_update = """ws.send(JSON.stringify({
              type: 'unified_response',
              unifiedContent: unifiedContent,
              analyticalStream: analyticalContent,
              intuitiveStream: intuitiveContent,
              synthesisMetadata,"""

content = content.replace("""ws.send(JSON.stringify({
              type: 'unified_response',
              unifiedContent: unifiedContent,
              analyticalStream: analyticalContent,
              intuitiveStream: intuitiveContent,""", response_update)

with open('enhanced-dual-consciousness-ws.js', 'w') as f:
    f.write(content)

print("Synthesizer integrated successfully!")
