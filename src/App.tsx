import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowRight, 
  Shield, 
  Database, 
  Network, 
  Clock, 
  Lock,
  ChartBar,
  Handshake,
  AlertTriangle,
  Users,
  FileText,
  BrainCircuit
} from "lucide-react"
import { useState } from "react"

function App() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null)

  const challenges = [
    {
      icon: Network,
      title: "Organisierte Kriminalität & Cybercrime",
      stat: "2,7 Mrd. €",
      description: "Schadensumme 2023 durch Organisierte Kriminalität – ein neuer Höchstwert mit steigender Tendenz bei Cyberkriminalität."
    },
    {
      icon: Database,
      title: "Datensilos & föderale Fragmentierung",
      stat: "20 Polizeien",
      description: "Heterogene IT-Landschaft erschwert bundesländerübergreifenden Datenaustausch und effiziente Ermittlungsarbeit."
    },
    {
      icon: FileText,
      title: "Rechtliche Rahmenbedingungen",
      stat: "BVerfG 2023",
      description: "Höhere Hürden für automatisierte Datenanalyse bei gleichzeitigem Beschleunigungsgrundsatz in Strafverfahren."
    },
    {
      icon: Users,
      title: "Personalmangel & Überlastung",
      stat: "320.000",
      description: "Beschäftigte bewältigen exponentiell wachsende Datenmengen – KI als Multiplikator menschlicher Expertise."
    }
  ]

  const layers = [
    {
      number: 1,
      title: "Normative Schicht",
      subtitle: "Das Strukturelle Skelett",
      description: "Hierarchie der Rechtsquellen vom EU-Recht bis zu Dienstvorschriften. Das System versteht Normenhierarchien und traversiert sie konsistent.",
      icon: Shield,
      color: "oklch(0.25 0.05 250)"
    },
    {
      number: 2,
      title: "Zeitliche Dimension",
      subtitle: "Validität & Versionierung",
      description: "Zeitliche Gültigkeit jeder Rechtsgrundlage. Automatische Prüfung welche Gesetzesfassung zum Tatzeitpunkt galt und korrekte Fristberechnung.",
      icon: Clock,
      color: "oklch(0.45 0.12 240)"
    },
    {
      number: 3,
      title: "Prozedurale Zustandsmaschine",
      subtitle: "Die Prozessdimension",
      description: "Ermittlungsverfahren als formale Prozesse mit definierten Zuständen, Übergängen und Fristen. Proaktive Vorschläge für nächste Schritte.",
      icon: ChartBar,
      color: "oklch(0.55 0.18 200)"
    },
    {
      number: 4,
      title: "Fallbezogener Overlay",
      subtitle: "Die Faktendimension",
      description: "Konkrete Fakten eines Ermittlungsvorgangs: Personen, Beweismittel, Zeugenaussagen, Kommunikationsdaten im Kontext der Normenhierarchie.",
      icon: Database,
      color: "oklch(0.55 0.22 25)"
    }
  ]

  const scenarios = [
    {
      title: "Ermittlungskomplexe der Organisierten Kriminalität",
      description: "Analyse komplexer OK-Strukturen mit Geldwäsche, Drogenhandel und Menschenschmuggel über Ländergrenzen hinweg.",
      benefits: [
        "Automatische Verknüpfung von Personen, Firmen und Konten im Knowledge Graph",
        "Prüfung der Rechtsgrundlagen unter Berücksichtigung aktueller BVerfG-Anforderungen",
        "Proaktive Warnungen vor ablaufenden Fristen",
        "Graph-Algorithmen identifizieren versteckte Netzwerkverbindungen"
      ],
      icon: Network
    },
    {
      title: "Cybercrime-Ermittlungen",
      description: "Aufklärung von Ransomware-Angriffen mit IT-Forensik, Server-Logs, Blockchain-Analyse und Darknet-Kommunikation.",
      benefits: [
        "Automatische Extraktion von Indikatoren aus Massendaten",
        "Abgleich mit bekannten Modus-Operandi-Mustern",
        "Sprachübergreifende Analyse unter Beibehaltung semantischer Kontexte",
        "Nachvollziehbare Dokumentation für Beweisführung vor Gericht"
      ],
      icon: Lock
    },
    {
      title: "Grenzüberschreitende Fahndung",
      description: "Internationale Zusammenarbeit mit Europol und nationalen Partnerbehörden bei verschlüsselter Kommunikation.",
      benefits: [
        "Fuzzy-Logik erkennt verschiedene Schreibweisen und ordnet eindeutig zu",
        "Zusammenführung von Daten aus unterschiedlichen Systemen und Rechtsräumen",
        "Sicherstellung der Datenverarbeitung nach nationalen und EU-Rechtsgrundlagen",
        "Granulare Zugriffssteuerung und vollständige Auditierbarkeit"
      ],
      icon: Handshake
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <SopraLogo />
          </div>
          <Button 
            asChild 
            variant="outline" 
            className="hidden md:flex"
          >
            <a 
              href="https://www.soprasteria.de/products/cassa" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Mehr erfahren
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      <section className="hero-pattern py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <Badge className="mb-6 bg-accent text-accent-foreground">
              Neuro-Symbolische KI-Architektur
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
              Digitaler Wissensassistent für die Polizei
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Wie Multi-Layered Ontologien die Defizite von KI-Sprachmodellen überwinden und moderne Ermittlungsarbeit revolutionieren.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8"
              >
                <a 
                  href="https://www.soprasteria.de/products/cassa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  CASSA entdecken
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8"
                onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Technologie verstehen
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Die Herausforderungen der modernen Polizeiarbeit
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              320.000 Polizeibeschäftigte in Deutschland stehen vor einem fundamentalen Dilemma: 
              exponentiell wachsende Datenmengen bei fragmentierter IT-Infrastruktur.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {challenges.map((challenge, index) => {
              const Icon = challenge.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                          </div>
                          <Badge variant="secondary" className="font-bold text-lg">
                            {challenge.stat}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {challenge.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-card">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Warum reine LLMs nicht genügen
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ChatGPT & Co. für die Polizei ungeeignet
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Large Language Models sind probabilistisch – Polizeiarbeit ist deterministisch. 
              Halluzinationen, temporale Blindheit und fehlende Zustandsverwaltung machen reine LLMs unbrauchbar.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Statistische Plausibilität ≠ Logische Validität",
                description: "Ein halluzinierter Paragraf oder falsche Fristberechnung kann fatale Folgen haben."
              },
              {
                title: "Temporale Blindheit",
                description: "Kein Verständnis für Verjährungsfristen, Gesetzesänderungen oder zeitliche Abhängigkeiten."
              },
              {
                title: "Fehlende Zustandsverwaltung",
                description: "Ermittlungsverfahren sind langfristige State Machines – LLMs haben kein Gedächtnis."
              }
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full bg-destructive/5 border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-xl">{problem.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="architecture" className="py-24 bg-primary/5 network-pattern">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Die CASSA-Lösung
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Multi-Layered Ontologie-Architektur
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Structure-Aware Temporal Graph RAG (SAT-Graph RAG) in Neo4j-Graphdatenbank 
              kombiniert symbolische KI mit LLM-Sprachverarbeitung.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {layers.map((layer, index) => {
                const Icon = layer.icon
                const isSelected = selectedLayer === index
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        isSelected 
                          ? 'ring-2 ring-primary shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedLayer(isSelected ? null : index)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div 
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${layer.color}15` }}
                          >
                            <Icon 
                              className="h-6 w-6" 
                              style={{ color: layer.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge 
                                variant="outline"
                                style={{ borderColor: layer.color, color: layer.color }}
                              >
                                Schicht {layer.number}
                              </Badge>
                              <CardTitle className="text-xl">{layer.title}</CardTitle>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                              {layer.subtitle}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      {isSelected && (
                        <CardContent>
                          <p className="text-muted-foreground leading-relaxed">
                            {layer.description}
                          </p>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Card className="p-8 bg-card">
                <ArchitectureDiagram selectedLayer={selectedLayer} />
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Praxisszenarien für die Polizei
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Konkrete Anwendungsfälle zeigen, wie CASSA die tägliche Ermittlungsarbeit unterstützt.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {scenarios.map((scenario, index) => {
              const Icon = scenario.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl mb-3">{scenario.title}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {scenario.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <Separator className="mb-4" />
                      <ul className="space-y-2">
                        {scenario.benefits.map((benefit, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <ArrowRight className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Bereit für die Zeitenwende in der inneren Sicherheit?
            </h2>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-10 leading-relaxed">
              Erfahren Sie mehr über CASSA und wie neuro-symbolische KI-Architektur 
              Ihre Ermittlungsarbeit unterstützen kann – datenschutzkonform und rechtsstaatlich.
            </p>
            <Button 
              asChild 
              size="lg" 
              variant="secondary"
              className="text-lg px-8"
            >
              <a 
                href="https://www.soprasteria.de/products/cassa" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Zur offiziellen CASSA-Website
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <SopraLogo />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Sopra Steria. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SopraLogo() {
  return (
    <svg width="180" height="40" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="28" fontFamily="Space Grotesk, sans-serif" fontSize="24" fontWeight="700" fill="oklch(0.25 0.05 250)">
        SOPRA STERIA
      </text>
      <rect x="0" y="32" width="120" height="3" fill="oklch(0.55 0.22 25)" />
    </svg>
  )
}

function ArchitectureDiagram({ selectedLayer }: { selectedLayer: number | null }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Knowledge Graph Architektur</h3>
        <p className="text-sm text-muted-foreground">
          Neo4j-Graphdatenbank mit vier integrierten Schichten
        </p>
      </div>
      
      <svg viewBox="0 0 400 500" className="w-full h-auto">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'oklch(0.25 0.05 250)', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'oklch(0.25 0.05 250)', stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'oklch(0.45 0.12 240)', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'oklch(0.45 0.12 240)', stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'oklch(0.55 0.18 200)', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'oklch(0.55 0.18 200)', stopOpacity: 0.3 }} />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'oklch(0.55 0.22 25)', stopOpacity: 0.8 }} />
            <stop offset="100%" style={{ stopColor: 'oklch(0.55 0.22 25)', stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>

        <motion.rect
          x="50" y="50" width="300" height="80" rx="12"
          fill="url(#grad1)"
          stroke="oklch(0.25 0.05 250)"
          strokeWidth="2"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: selectedLayer === 0 ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
        <text x="200" y="85" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
          Schicht 1: Normativ
        </text>
        <text x="200" y="105" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">
          Rechtshierarchie
        </text>

        <motion.rect
          x="50" y="160" width="300" height="80" rx="12"
          fill="url(#grad2)"
          stroke="oklch(0.45 0.12 240)"
          strokeWidth="2"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: selectedLayer === 1 ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
        <text x="200" y="195" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
          Schicht 2: Temporal
        </text>
        <text x="200" y="215" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">
          Zeit & Fristen
        </text>

        <motion.rect
          x="50" y="270" width="300" height="80" rx="12"
          fill="url(#grad3)"
          stroke="oklch(0.55 0.18 200)"
          strokeWidth="2"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: selectedLayer === 2 ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
        <text x="200" y="305" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
          Schicht 3: Prozedural
        </text>
        <text x="200" y="325" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">
          Verfahrensabläufe
        </text>

        <motion.rect
          x="50" y="380" width="300" height="80" rx="12"
          fill="url(#grad4)"
          stroke="oklch(0.55 0.22 25)"
          strokeWidth="2"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: selectedLayer === 3 ? 1 : 0.3 }}
          transition={{ duration: 0.3 }}
        />
        <text x="200" y="415" textAnchor="middle" fill="white" fontSize="16" fontWeight="600">
          Schicht 4: Faktisch
        </text>
        <text x="200" y="435" textAnchor="middle" fill="white" fontSize="12" opacity="0.9">
          Konkrete Fälle
        </text>

        <path
          d="M 200 130 L 200 160"
          stroke="oklch(0.45 0.01 240)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <path
          d="M 200 240 L 200 270"
          stroke="oklch(0.45 0.01 240)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        <path
          d="M 200 350 L 200 380"
          stroke="oklch(0.45 0.01 240)"
          strokeWidth="2"
          strokeDasharray="4 4"
          opacity="0.5"
        />

        <circle cx="120" cy="90" r="6" fill="white" opacity="0.6" />
        <circle cx="280" cy="90" r="6" fill="white" opacity="0.6" />
        <circle cx="120" cy="200" r="6" fill="white" opacity="0.6" />
        <circle cx="280" cy="200" r="6" fill="white" opacity="0.6" />
        <circle cx="120" cy="310" r="6" fill="white" opacity="0.6" />
        <circle cx="280" cy="310" r="6" fill="white" opacity="0.6" />
        <circle cx="120" cy="420" r="6" fill="white" opacity="0.6" />
        <circle cx="280" cy="420" r="6" fill="white" opacity="0.6" />

        <path d="M 120 96 L 120 194" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <path d="M 280 96 L 280 194" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <path d="M 120 206 L 120 304" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <path d="M 280 206 L 280 304" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <path d="M 120 316 L 120 414" stroke="white" strokeWidth="1.5" opacity="0.3" />
        <path d="M 280 316 L 280 414" stroke="white" strokeWidth="1.5" opacity="0.3" />
      </svg>
    </div>
  )
}

export default App