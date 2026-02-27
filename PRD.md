# Planning Guide

A professional interactive website showcasing Sopra Steria's CASSA solution for German police forces, communicating the value of multi-layered ontology-based knowledge management systems for modern law enforcement.

**Experience Qualities**: 
1. **Authoritative** - Conveys institutional credibility and technical sophistication befitting a solution for law enforcement agencies
2. **Informative** - Clearly explains complex technical concepts through visual storytelling and structured information hierarchy
3. **Modern** - Projects cutting-edge innovation through contemporary design while maintaining professional decorum

**Complexity Level**: Light Application (multiple features with basic state) 
This is an interactive educational landing page that guides German police through CASSA technology with stateful interactions, animated visualizations, and a progressive disclosure user journey. Features include clickable layers, tabbed scenarios, scroll-based animations, and guided navigation.

## Essential Features

### Hero Section with Sopra Steria Branding
- **Functionality**: Displays Sopra Steria logo, compelling headline about digital knowledge assistants for police, and primary CTA
- **Purpose**: Establishes brand identity and immediately communicates the solution's value proposition
- **Trigger**: Page load
- **Progression**: Logo animates in → Headline reveals → CTA button appears
- **Success criteria**: User understands this is a Sopra Steria solution for police within 3 seconds

### Key Challenges Section
- **Functionality**: Presents the four main challenges facing German police (organized crime, data silos, legal frameworks, personnel shortage)
- **Purpose**: Establishes relevance by articulating pain points the target audience faces daily
- **Trigger**: User scrolls to section
- **Progression**: Section enters viewport → Challenge cards reveal sequentially → Icons and statistics animate
- **Success criteria**: User recognizes their organization's challenges in the presented content

### Solution Architecture Visualization
- **Functionality**: Interactive visualization of the four-layer ontology architecture (normative, temporal, procedural, factual)
- **Purpose**: Demystifies the technical approach through visual representation
- **Trigger**: User scrolls to section or clicks layer buttons
- **Progression**: Architecture diagram displays → User hovers/clicks layers → Detail panels explain each layer → Connections highlight
- **Success criteria**: User understands the multi-layered approach at a conceptual level

### Practical Scenarios Section
- **Functionality**: Three expandable scenario cards demonstrating real-world applications (organized crime, cybercrime, cross-border investigations)
- **Purpose**: Makes abstract technology concrete through relatable use cases
- **Trigger**: User clicks scenario card
- **Progression**: Card selected → Expands with detailed explanation → Illustrations animate → Related benefits highlight
- **Success criteria**: User can envision CASSA in their daily work

### Call-to-Action Section
- **Functionality**: Prominent link to official Sopra Steria CASSA website with supporting context
- **Purpose**: Convert interest into action by directing to comprehensive information
- **Trigger**: User clicks CTA button
- **Progression**: CTA appears → User clicks → Opens official CASSA page in new tab
- **Success criteria**: Interested users successfully navigate to full product information

## Edge Case Handling

- **No JavaScript**: Progressive enhancement ensures core content remains accessible even without JavaScript
- **Slow connections**: Content loads progressively with skeleton states to maintain engagement
- **Mobile devices**: Responsive design adapts complex visualizations to smaller screens with simplified interactions
- **Older browsers**: Graceful degradation maintains functionality across browser versions
- **Accessibility**: Keyboard navigation and screen reader support for all interactive elements

## Design Direction

The design should project **institutional authority, technical sophistication, and German precision**. It must balance accessibility for non-technical decision-makers with depth for IT professionals. The aesthetic should feel like a high-end consulting presentation—polished, data-driven, and uncompromisingly professional. Visual elements should reference law enforcement (subtle badge/shield motifs, network diagrams) and German design traditions (clarity, functionality, minimal ornamentation).

## Color Selection

A sophisticated palette that balances Sopra Steria's corporate identity with associations of trust, security, and German public service.

- **Primary Color (Deep Navy)**: oklch(0.25 0.05 250) - Conveys authority, security, and institutional trust; Sopra Steria's signature dark blue
- **Secondary Color (Professional Gray)**: oklch(0.45 0.01 240) - Supporting neutral for backgrounds and less prominent elements
- **Accent Color (Signal Red)**: oklch(0.55 0.22 25) - Attention-grabbing for CTAs and critical information, references German federal colors
- **Background (Light Warm Gray)**: oklch(0.97 0.005 60) - Soft, professional background that reduces eye strain
- **Surface (Pure White)**: oklch(1 0 0) - Clean card surfaces and content areas
- **Text Primary (Near Black)**: oklch(0.15 0.01 250) - High-contrast readable text

**Foreground/Background Pairings**:
- Primary (Deep Navy #2B3A67): White text (#FFFFFF) - Ratio 11.2:1 ✓
- Accent (Signal Red #C94A3A): White text (#FFFFFF) - Ratio 4.9:1 ✓
- Background (Light Warm Gray #F7F6F4): Text Primary (#20212E) - Ratio 14.8:1 ✓
- Secondary (Professional Gray #5D6278): White text (#FFFFFF) - Ratio 7.1:1 ✓

## Font Selection

Typography must balance German design sensibilities (clarity, legibility) with contemporary professionalism.

- **Headings**: Space Grotesk - A geometric sans-serif with distinctive character that projects modernity and precision without sacrificing readability
- **Body Text**: Inter - A highly legible interface font optimized for screens, conveying clarity and professionalism

**Typographic Hierarchy**:
- H1 (Hero Title): Space Grotesk Bold/48px/tight leading/-0.02em tracking
- H2 (Section Headers): Space Grotesk SemiBold/36px/tight leading/-0.01em tracking
- H3 (Subsection Headers): Space Grotesk Medium/24px/normal leading
- Body Large (Intro Text): Inter Regular/20px/relaxed leading
- Body (Standard Text): Inter Regular/16px/relaxed leading
- Caption (Metadata): Inter Medium/14px/normal leading/uppercase

## Animations

Animations should feel **precise and purposeful**, reflecting German engineering principles—nothing frivolous, every motion serves a functional purpose. Entry animations use subtle upward motion with slight opacity changes (respecting reduced-motion preferences). Interactive elements respond with micro-interactions that provide immediate feedback. The architecture visualization includes smooth transitions between states. Hover effects are subtle but distinct, confirming interactivity without distraction.

## Component Selection

- **Components**:
  - Card (Shadcn): Challenge cards, scenario cards, architecture layer descriptions with custom styling for depth
  - Button (Shadcn): Primary CTA to CASSA website, styled with accent color and subtle hover elevation
  - Tabs (Shadcn): Optional navigation between different content sections or scenario types
  - Accordion (Shadcn): Expandable scenario details and FAQ sections
  - Badge (Shadcn): Labels for statistics, technology tags, and feature highlights
  - Separator (Shadcn): Visual breaks between major sections

- **Customizations**:
  - Custom SVG illustrations for challenges (data network, cybercrime symbols, organizational charts)
  - Interactive architecture diagram (custom SVG with animated layers and connection lines)
  - Custom hero background with subtle geometric pattern suggesting network graphs
  - Statistics counter components that animate on scroll

- **States**:
  - Buttons: Default with slight shadow, hover with elevation increase, active with subtle scale
  - Cards: Default flat, hover with shadow lift and subtle scale, active/selected with accent border
  - Interactive layers: Default with opacity, hover highlighted with glow, selected with full opacity and detail panel

- **Icon Selection**:
  - Shield for security/authority themes (law enforcement focus)
  - Network/Graph for connected data concepts
  - Clock for temporal dimension
  - Lock for data protection/privacy
  - ArrowRight for CTAs and navigation
  - ChartBar for analytics and statistics
  - Database for data management
  - Handshake for cross-border cooperation

- **Spacing**:
  - Section padding: py-24 (96px vertical) for generous breathing room
  - Container max-width: max-w-7xl (1280px) for readable line lengths
  - Card spacing: gap-8 (32px) between cards in grids
  - Content spacing: space-y-6 (24px) within text blocks
  - Component padding: p-8 (32px) for cards, p-6 (24px) for smaller elements

- **Mobile**:
  - Hero title scales from 48px desktop to 32px mobile
  - Three-column challenge grid becomes single column on mobile
  - Architecture visualization simplifies to vertical stacked layers with tap interaction
  - Generous touch targets (min 44px) for all interactive elements
  - Sticky header collapses to minimal logo + menu on scroll
