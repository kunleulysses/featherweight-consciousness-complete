#!/usr/bin/env python3

with open('ResearchTab.tsx', 'r') as f:
    content = f.read()

# Fix the wrapping div structure
content = content.replace('          <div className="progress-bar">', '', 1)
content = content.replace('            <div 
              className="progress-fill phi" 
            />', '', 1)
content = content.replace('          </div>', '', 1)

content = content.replace('          <div className="progress-bar">', '', 1)
content = content.replace('            <div 
              className="progress-fill awareness" 
            />', '', 1)

# Remove excess div close at the end
content = content.replace('          </div>
        </div>
      </div>
    </div>', '          </div>
        </div>
      </div>
', 1)

with open('ResearchTab.tsx', 'w') as f:
    f.write(content)

print("Structure fixed")
