import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const ApplicationsSection = styled.section`
  padding: 120px 0 80px;
  background: linear-gradient(135deg, #f5f1eb 0%, #ede6db 50%, #f5f1eb 100%);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 80px 0 60px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(139, 90, 60, 0.08) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(196, 164, 132, 0.06) 0%, transparent 40%);
    pointer-events: none;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #8b5a3c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  position: relative;
  z-index: 2;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    line-height: 1.3;
  }
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 1.3rem;
  color: rgba(26, 26, 26, 0.8);
  margin-bottom: 4rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  letter-spacing: 0.02em;
  position: relative;
  z-index: 2;
  word-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 3rem;
    padding: 0 1.5rem;
    max-width: 90%;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 0 1rem;
    line-height: 1.5;
  }
`;

const ApplicationsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  margin: 5rem 0;
  position: relative;
  z-index: 2;
  
  @media (max-width: 768px) {
    gap: 3rem;
    margin: 3rem 0;
  }
`;

const ApplicationCard = styled.div`
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(139, 90, 60, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  
  @media (max-width: 768px) {
    border-radius: 20px;
    margin: 0 1rem;
  }
  
  @media (max-width: 480px) {
    margin: 0 0.5rem;
    border-radius: 15px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 90, 60, 0.05) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 80px rgba(139, 90, 60, 0.25);
    
    @media (max-width: 768px) {
      transform: translateY(-5px);
    }
    
    &::before {
      opacity: 1;
    }
  }
`;

const ApplicationHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.gradient});
  color: white;
  padding: 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  h3 {
    font-size: 2.4rem;
    margin-bottom: 1rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    position: relative;
    z-index: 1;
    word-wrap: break-word;
    hyphens: auto;
    
    @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 0.8rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
      line-height: 1.3;
    }
  }
  
  .subtitle {
    font-size: 1.3rem;
    opacity: 0.9;
    font-weight: 600;
    margin-bottom: 1rem;
    position: relative;
    z-index: 1;
    word-wrap: break-word;
    hyphens: auto;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
      margin-bottom: 0.8rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
      line-height: 1.4;
    }
  }
  
  .description {
    font-size: 1.1rem;
    opacity: 0.85;
    line-height: 1.6;
    position: relative;
    z-index: 1;
    word-wrap: break-word;
    hyphens: auto;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      line-height: 1.5;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      line-height: 1.4;
    }
  }
`;

const ApplicationContent = styled.div`
  padding: 4rem;
  
  @media (max-width: 768px) {
    padding: 2.5rem 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
  
  .use-cases {
    margin: 3rem 0;
    
    @media (max-width: 768px) {
      margin: 2rem 0;
    }
  }
  
  .use-case-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 2rem;
    text-align: center;
    letter-spacing: 0.02em;
    word-wrap: break-word;
    hyphens: auto;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
      line-height: 1.3;
    }
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    margin: 3rem 0;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 2rem;
      margin: 2rem 0;
    }
    
    @media (max-width: 480px) {
      gap: 1.5rem;
    }
  }
  
  .feature {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    padding: 2.5rem;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    position: relative;
    overflow: hidden;
    
    @media (max-width: 768px) {
      padding: 2rem;
      border-radius: 15px;
    }
    
    @media (max-width: 480px) {
      padding: 1.5rem;
      border-radius: 12px;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(139, 90, 60, 0.1) 0%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(139, 90, 60, 0.15);
      
      @media (max-width: 768px) {
        transform: translateY(-3px);
      }
      
      &::before {
        opacity: 1;
      }
      
      h4 {
        color: #8b5a3c;
      }
    }

    h4 {
      color: #1a1a1a;
      margin-bottom: 1.5rem;
      font-weight: 600;
      font-size: 1.2rem;
      letter-spacing: 0.02em;
      transition: color 0.3s ease;
      position: relative;
      z-index: 1;
      word-wrap: break-word;
      hyphens: auto;
      line-height: 1.4;
      
      @media (max-width: 768px) {
        font-size: 1.1rem;
        margin-bottom: 1.2rem;
      }
      
      @media (max-width: 480px) {
        font-size: 1rem;
        margin-bottom: 1rem;
        line-height: 1.3;
      }
    }

    p {
      color: rgba(26, 26, 26, 0.8);
      font-size: 1rem;
      line-height: 1.7;
      position: relative;
      z-index: 1;
      word-wrap: break-word;
      hyphens: auto;
      text-align: justify;
      
      @media (max-width: 768px) {
        font-size: 0.95rem;
        line-height: 1.6;
        text-align: left;
      }
      
      @media (max-width: 480px) {
        font-size: 0.9rem;
        line-height: 1.5;
      }
    }
  }

  .demo-button {
    text-align: center;
    margin-top: 3rem;
    
    @media (max-width: 768px) {
      margin-top: 2.5rem;
    }
    
    @media (max-width: 480px) {
      margin-top: 2rem;
    }
    
    button {
      background: linear-gradient(135deg, #8b5a3c 0%, #a0785d 50%, #8b5a3c 100%);
      color: white;
      padding: 18px 36px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 1.1rem;
      border: none;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      letter-spacing: 0.02em;
      box-shadow: 0 8px 25px rgba(139, 90, 60, 0.25);
      position: relative;
      overflow: hidden;
      
      @media (max-width: 768px) {
        padding: 15px 30px;
        font-size: 1rem;
      }
      
      @media (max-width: 480px) {
        padding: 12px 24px;
        font-size: 0.9rem;
      }
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #a0785d 0%, #c4a484 50%, #a0785d 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      }
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(139, 90, 60, 0.35);
        
        @media (max-width: 768px) {
          transform: translateY(-2px);
        }
        
        &::before {
          opacity: 1;
        }
      }
      
      &:active {
        transform: translateY(-1px);
        box-shadow: 0 8px 20px rgba(139, 90, 60, 0.3);
      }
    }
  }
`;

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  pointer-events: none;
`;

const AnimatedCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const ApplicationsPage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.body.scrollHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let animationId;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Floating wood grain patterns
      for (let i = 0; i < 15; i++) {
        const x = (time * 0.2 + i * 200) % (canvas.width + 100);
        const y = 100 + Math.sin(time * 0.01 + i) * 50 + i * 80;
        const width = 60 + Math.sin(time * 0.02 + i) * 20;
        const height = 2 + Math.sin(time * 0.03 + i) * 1;
        
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.fillStyle = `rgba(139, 90, 60, ${0.3 + Math.sin(time * 0.02 + i) * 0.1})`;
        ctx.fill();
      }
      
      // Elegant floating particles
      for (let i = 0; i < 25; i++) {
        const x = Math.sin(time * 0.005 + i * 0.2) * 100 + canvas.width / 2 + i * 50 - 600;
        const y = Math.cos(time * 0.008 + i * 0.15) * 150 + canvas.height / 2 + i * 40 - 500;
        const size = 2 + Math.sin(time * 0.01 + i) * 1;
        const opacity = 0.4 + Math.sin(time * 0.01 + i * 0.5) * 0.2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 164, 132, ${opacity})`;
        ctx.fill();
      }
      
      time += 0.3;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const applications = [
    {
      title: "Healthcare & Mental Health",
      subtitle: "Consciousness-Aware Diagnostics",
      description: "Advanced AI systems that diagnose and monitor consciousness levels in neurodivergent patients and brain injury recovery",
      gradient: "#c4a484, #a0785d",
      features: [
        {
          title: "Neurodivergent Consciousness Assessment",
          description: "Sophisticated analysis of consciousness patterns in autism, ADHD, and other neurodivergent conditions. Provides personalized therapeutic insights and support strategies tailored to individual consciousness profiles."
        },
        {
          title: "Brain Injury Recovery Monitoring",
          description: "Real-time consciousness level tracking for patients recovering from traumatic brain injury, stroke, or neurosurgery. Enables precise rehabilitation protocols and recovery timeline predictions."
        },
        {
          title: "Therapeutic Consciousness Enhancement",
          description: "AI-powered personalized therapeutic interventions that adapt to patient consciousness states. Optimizes treatment effectiveness through consciousness-aware emotional intelligence and empathy modeling."
        }
      ]
    },
    {
      title: "Education & Learning",
      subtitle: "Metacognitive Learning Systems",
      description: "Consciousness-based adaptive learning that understands how students think, learn, and develop metacognitive awareness",
      gradient: "#4a90e2, #2c639f",
      features: [
        {
          title: "Consciousness-Driven Learning Analytics",
          description: "Deep analysis of student consciousness patterns to identify optimal learning states, attention cycles, and cognitive load thresholds. Enables personalized educational experiences that maximize comprehension."
        },
        {
          title: "Adaptive Metacognitive Development",
          description: "AI systems that teach students to understand their own thinking processes. Develops self-awareness and metacognitive skills through consciousness-aware feedback loops and guided reflection exercises."
        },
        {
          title: "Dynamic Consciousness-Based Curriculum",
          description: "Real-time content adaptation based on individual consciousness states, learning preferences, and cognitive development stages. Ensures optimal educational outcomes through personalized instruction delivery."
        }
      ]
    },
    {
      title: "Enterprise & Recruitment",
      subtitle: "Consciousness-Aware Workforce Solutions",
      description: "Revolutionary AI recruitment systems that evaluate consciousness levels, team dynamics, and cognitive compatibility for optimal workplace harmony",
      gradient: "#4caf50, #2e7d32",
      features: [
        {
          title: "Consciousness-Based Recruitment AI",
          description: "Advanced recruitment systems that assess candidate consciousness levels, self-awareness capabilities, and cognitive compatibility with existing team dynamics. Ensures optimal hiring decisions through comprehensive evaluation."
        },
        {
          title: "Team Consciousness Optimization",
          description: "AI-driven analysis of collective team consciousness patterns. Identifies optimal collaboration structures, communication styles, and workflow arrangements that maximize productivity through enhanced team dynamics."
        },
        {
          title: "Leadership Consciousness Development",
          description: "Sophisticated consciousness assessment tools for leadership development programs. Provides detailed insights into self-awareness levels, decision-making patterns, and emotional intelligence capabilities."
        }
      ]
    }
  ];

  return (
    <ApplicationsSection id="applications">
      <AnimatedBackground>
        <AnimatedCanvas ref={canvasRef} />
      </AnimatedBackground>
      
      <div className="container">
        <SectionTitle>Applications: Transformative Impact Showcase</SectionTitle>
        
        <SectionSubtitle>
          Discover how our consciousness-aware AI creates revolutionary value across industries, 
          from advanced healthcare diagnostics to intelligent recruitment systems.
        </SectionSubtitle>
        
        <ApplicationsGrid>
          {applications.map((app, index) => (
            <ApplicationCard 
              key={index}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <ApplicationHeader gradient={app.gradient}>
                <h3>{app.title}</h3>
                <div className="subtitle">{app.subtitle}</div>
                <div className="description">{app.description}</div>
              </ApplicationHeader>
              
              <ApplicationContent>
                <div className="use-cases">
                  <div className="use-case-title">Revolutionary Applications</div>
                  
                  <div className="features">
                    {app.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="feature">
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="demo-button">
                  <button onClick={() => window.open('https://demo.featherweight.world', '_blank')}>
                    Explore Live Demo
                  </button>
                </div>
              </ApplicationContent>
            </ApplicationCard>
          ))}
        </ApplicationsGrid>
      </div>
    </ApplicationsSection>
  );
};

export default ApplicationsPage;
