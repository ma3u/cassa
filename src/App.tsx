import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
  BrainCircuit,
  CheckCircle2,
  TrendingUp,
  Zap,
  Eye,
  Play,
  ArrowDown
} from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import { PoliceKnowledgeGraph3D } from "@/components/PoliceKnowledgeGraph3D"

function App() {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null)
  const [activeScenario, setActiveScenario] = useState<number>(0)
  const [showIntroGuide, setShowIntroGuide] = useState<boolean>(true)
  const [isPlayingNarration, setIsPlayingNarration] = useState(false)
  const architectureRef = useRef<HTMLDivElement>(null)
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // German police officer narration text
  const NARRATION_TEXT = `Meine Damen und Herren, hier spricht Kriminaldirektor Weber vom Bundeskriminalamt.

Ich informiere Sie über die Operation Hydra — die Zerschlagung des weltweit größten Darknet-Marktplatzes.

Hydra Market war seit 2015 aktiv und wurde über das Tor-Netzwerk betrieben. Mit über 17 Millionen Kundenkonten und 19.000 Verkäuferkonten wickelte die Plattform Transaktionen im Wert von über 5,2 Milliarden US-Dollar in Kryptowährungen ab.

Das Angebot umfasste Betäubungsmittel aller Art, gestohlene Finanzdaten, gefälschte Dokumente, Hacking-Dienste sowie einen Bitcoin-Mixer zur Geldwäsche. Die Drogen wurden über ein sogenanntes Klad-System verteilt — tote Briefkästen in öffentlichen Räumen, vergraben, magnetisiert oder versteckt.

Die Ermittlungen begannen im August 2021 in Zusammenarbeit mit der Zentralstelle zur Bekämpfung der Internetkriminalität in Frankfurt. Am 5. April 2022 haben wir die Server in Deutschland beschlagnahmt und 543,3 Bitcoin im Wert von rund 25 Millionen US-Dollar sichergestellt.

Der Hauptbetreiber, Stanislav Moiseyev, wurde vom Moskauer Regionalgericht zu lebenslanger Freiheitsstrafe verurteilt — die erste lebenslängliche Strafe für Drogenhandel in der Geschichte Russlands. 15 Mitverschwörer erhielten Strafen zwischen 8 und 23 Jahren.

Der Server-Administrator Dmitry Pavlov wurde in den Vereinigten Staaten angeklagt. Er betrieb die Firma Promservice Ltd., die seit 2015 die Infrastruktur hostete.

Das OFAC des US-Finanzministeriums verhängte Sanktionen nach Executive Order 13694 und setzte über 100 Kryptowährungsadressen auf die SDN-Liste. Ebenfalls sanktioniert wurden die Kryptobörsen Garantex, SUEX und CHATEX — alle drei operierten aus dem Federation Tower in Moskau.

Ransomware-Gruppen wie Ryuk, REvil und Conti wuschen nachweislich 8 Millionen Dollar über Hydra. Die DarkSide-Gruppe, verantwortlich für den Colonial-Pipeline-Angriff, nutzte Hydra für 4 Prozent ihrer Bitcoin-Gewinne.

Nach der Abschaltung sank der tägliche Umsatz des Darknet-Marktes von 4,2 Millionen auf 447.000 Dollar. Nachfolgemärkte wie OMG, Mega und Blacksprut versuchten das Vakuum zu füllen, erreichten aber nie die Dominanz von Hydra.

Diese Graphendatenbank zeigt Ihnen die gesamte Netzwerkstruktur — Personen, Organisationen, Finanzströme, Sanktionen und ihre Verbindungen. Genau solche Werkzeuge bringen Kriminelle schneller vor Gericht.

Danke für Ihre Aufmerksamkeit.`

  const toggleNarration = useCallback(() => {
    const synth = window.speechSynthesis
    if (isPlayingNarration) {
      synth.cancel()
      setIsPlayingNarration(false)
      return
    }
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(NARRATION_TEXT)
    utterance.lang = 'de-DE'
    utterance.pitch = 0.7  // Deep voice
    utterance.rate = 0.85  // Measured, authoritative pace
    utterance.volume = 1.0

    // Try to find a German male voice
    const voices = synth.getVoices()
    const germanMale = voices.find(v =>
      v.lang.startsWith('de') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('mann') || v.name.includes('Daniel') || v.name.includes('Martin'))
    ) || voices.find(v => v.lang.startsWith('de'))
    if (germanMale) utterance.voice = germanMale

    utterance.onend = () => setIsPlayingNarration(false)
    utterance.onerror = () => setIsPlayingNarration(false)
    speechUtteranceRef.current = utterance
    synth.speak(utterance)
    setIsPlayingNarration(true)
  }, [isPlayingNarration])
  
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.3])

  useEffect(() => {
    const timer = setTimeout(() => setShowIntroGuide(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const challenges = [
    {
      icon: Network,
      title: "Organisierte Kriminalität & Cybercrime",
      stat: "2,7 Mrd. €",
      statLabel: "Schaden 2023",
      description: "Schadensumme durch Organisierte Kriminalität erreichte 2023 einen Höchstwert – mit steigender Tendenz bei Cyberkriminalität.",
      trend: "+120%",
      color: "oklch(0.55 0.22 25)"
    },
    {
      icon: Database,
      title: "Datensilos & föderale Fragmentierung",
      stat: "20",
      statLabel: "Polizeien",
      description: "Heterogene IT-Landschaft erschwert bundesländerübergreifenden Datenaustausch und effiziente Ermittlungsarbeit.",
      trend: "320k",
      color: "oklch(0.45 0.12 240)"
    },
    {
      icon: FileText,
      title: "Rechtliche Rahmenbedingungen",
      stat: "BVerfG",
      statLabel: "Urteil 2023",
      description: "Höhere Hürden für automatisierte Datenanalyse bei gleichzeitigem Beschleunigungsgrundsatz in Strafverfahren.",
      trend: "Neu",
      color: "oklch(0.25 0.05 250)"
    },
    {
      icon: Users,
      title: "Personalmangel & Überlastung",
      stat: "320k",
      statLabel: "Beschäftigte",
      description: "Polizeibeschäftigte bewältigen exponentiell wachsende Datenmengen – KI als Multiplikator menschlicher Expertise.",
      trend: "Kritisch",
      color: "oklch(0.55 0.18 200)"
    }
  ]

  const layers = [
    {
      number: 1,
      title: "Normative Schicht",
      subtitle: "Das strukturelle Skelett",
      description: "Hierarchie der Rechtsquellen vom EU-Recht bis zu Dienstvorschriften. Das System versteht Normenhierarchien und traversiert sie konsistent.",
      icon: Shield,
      color: "oklch(0.25 0.05 250)",
      examples: ["EU-Recht", "Grundgesetz", "StPO", "Landespolizeigesetze"]
    },
    {
      number: 2,
      title: "Zeitliche Dimension",
      subtitle: "Validität & Versionierung",
      description: "Zeitliche Gültigkeit jeder Rechtsgrundlage. Automatische Prüfung welche Gesetzesfassung zum Tatzeitpunkt galt und korrekte Fristberechnung.",
      icon: Clock,
      color: "oklch(0.45 0.12 240)",
      examples: ["Verjährungsfristen", "Gesetzesänderungen", "Haftprüfungen", "TKÜ-Verlängerungen"]
    },
    {
      number: 3,
      title: "Prozedurale Zustandsmaschine",
      subtitle: "Die Prozessdimension",
      description: "Ermittlungsverfahren als formale Prozesse mit definierten Zuständen, Übergängen und Fristen. Proaktive Vorschläge für nächste Schritte.",
      icon: ChartBar,
      color: "oklch(0.55 0.18 200)",
      examples: ["Verfahrenszustände", "Prozessübergänge", "Fristüberwachung", "SOPs"]
    },
    {
      number: 4,
      title: "Fallbezogener Overlay",
      subtitle: "Die Faktendimension",
      description: "Konkrete Fakten eines Ermittlungsvorgangs: Personen, Beweismittel, Zeugenaussagen, Kommunikationsdaten im Kontext der Normenhierarchie.",
      icon: Database,
      color: "oklch(0.55 0.22 25)",
      examples: ["Personen", "Beweismittel", "Kommunikation", "Ortsdaten"]
    }
  ]

  const scenarios = [
    {
      title: "Organisierte Kriminalität",
      description: "Analyse komplexer OK-Strukturen mit Geldwäsche, Drogenhandel und Menschenschmuggel über Ländergrenzen hinweg.",
      benefits: [
        "Automatische Verknüpfung von Personen, Firmen und Konten im Knowledge Graph",
        "Prüfung der Rechtsgrundlagen unter Berücksichtigung aktueller BVerfG-Anforderungen",
        "Proaktive Warnungen vor ablaufenden Fristen",
        "Graph-Algorithmen identifizieren versteckte Netzwerkverbindungen"
      ],
      icon: Network,
      color: "oklch(0.55 0.22 25)",
      impact: "2 Billionen USD weltweit gewaschen jährlich"
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
      icon: Lock,
      color: "oklch(0.45 0.12 240)",
      impact: "178,6 Mrd. € Schaden durch Cyberangriffe in 2024"
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
      icon: Handshake,
      color: "oklch(0.55 0.18 200)",
      impact: "Über 131.000 Cybercrime-Fälle in Deutschland"
    },
    {
      title: "Digital Twin & Standards",
      description: "Digitaler Zwilling eines Ermittlungsfalls: alle Datenquellen – GPS, Mobilfunk, Finanztransaktionen, Social Media, Computer-Forensik – werden in einem einheitlichen, standardbasierten Wissensmodell aggregiert.",
      benefits: [
        "Aggregation aller Quellen (Bank, PayPal, Krypto, OSINT, Mobilfunkdaten, GPS) zu einem ganzheitlichen Fallbild",
        "Interoperabilität durch ISO 23247, STIX 2.1, ISO 27037/27042 und XPolizei-Standards",
        "Lückenlose digitale Beweiskette (Chain of Custody) nach BSI IT-Forensik & NIST SP 800-86",
        "Automatische Erkennung und Korrelation von Transaktionsmustern über Konto-, Krypto- und E-Geld-Netzwerke"
      ],
      icon: BrainCircuit,
      color: "oklch(0.55 0.22 170)",
      impact: "Ganzheitlicher Digital Twin pro Ermittlungsfall"
    }
  ]

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatePresence>
        {showIntroGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Card className="shadow-2xl border-2 border-accent">
              <CardContent className="p-6 flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowDown className="h-6 w-6 text-accent" />
                </motion.div>
                <div>
                  <p className="font-semibold text-foreground">Scrollen Sie, um mehr zu erfahren</p>
                  <p className="text-sm text-muted-foreground">Interaktive Elemente erwarten Sie</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <SopraLogo />
            <Separator orientation="vertical" className="h-8 hidden md:block" />
            <span className="text-sm font-medium text-muted-foreground hidden md:block">CASSA</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection('architecture')}
              className="hidden md:flex"
            >
              Technologie
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection('scenarios')}
              className="hidden md:flex"
            >
              Praxisszenarien
            </Button>
            <Button 
              asChild 
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
        </div>
      </header>

      <motion.section 
        style={{ opacity: heroOpacity }}
        className="hero-pattern py-32 md:py-40 relative overflow-hidden"
      >
        <AnimatedBackground />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-accent text-accent-foreground text-base px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Neuro-Symbolische KI-Architektur
              </Badge>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-foreground leading-tight">
              Digitaler Wissens&shy;assistent für die Polizei
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 leading-relaxed">
              Wie Multi-Layered Ontologien die Defizite von KI-Sprachmodellen überwinden und moderne Ermittlungsarbeit revolutionieren.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 h-14 shadow-lg hover:shadow-xl transition-shadow"
              >
                <a 
                  href="https://www.soprasteria.de/products/cassa" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Play className="mr-2 h-5 w-5" />
                  CASSA entdecken
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-10 h-14 border-2"
                onClick={() => scrollToSection('challenges')}
              >
                Herausforderungen verstehen
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <section id="challenges" className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 text-base px-4 py-2">
              <Eye className="h-4 w-4 mr-2" />
              Schritt 1: Das Problem verstehen
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Die Herausforderungen der modernen Polizeiarbeit
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              320.000 Polizeibeschäftigte in Deutschland stehen vor einem fundamentalen Dilemma: 
              exponentiell wachsende Datenmengen bei fragmentierter IT-Infrastruktur.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {challenges.map((challenge, index) => {
              const Icon = challenge.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-2 hover:border-primary/50">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <motion.div 
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: `${challenge.color}15` }}
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Icon 
                            className="h-8 w-8" 
                            style={{ color: challenge.color }}
                          />
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-3 group-hover:text-primary transition-colors">
                            {challenge.title}
                          </CardTitle>
                          <div className="flex items-center gap-3 mb-3">
                            <div>
                              <div className="text-3xl font-bold" style={{ color: challenge.color }}>
                                {challenge.stat}
                              </div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                                {challenge.statLabel}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-sm font-semibold">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {challenge.trend}
                            </Badge>
                          </div>
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

      <section className="py-24 bg-card relative">
        <div className="absolute inset-0 bg-destructive/5"></div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-destructive/10 text-destructive border-destructive/20 text-base px-4 py-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Schritt 2: Warum reine LLMs nicht genügen
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ChatGPT & Co. für die Polizei ungeeignet
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Large Language Models sind probabilistisch – Polizeiarbeit ist deterministisch. 
              Halluzinationen, temporale Blindheit und fehlende Zustandsverwaltung machen reine LLMs unbrauchbar.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: "Statistische Plausibilität ≠ Logische Validität",
                description: "Ein halluzinierter Paragraf oder falsche Fristberechnung kann fatale Folgen haben – von Verfahrensverzögerung bis zur Unverwertbarkeit von Beweisen.",
                icon: AlertTriangle
              },
              {
                title: "Temporale Blindheit",
                description: "Kein Verständnis für Verjährungsfristen, Gesetzesänderungen oder zeitliche Abhängigkeiten. Kritisch bei Haftprüfungen und TKÜ-Verlängerungen.",
                icon: Clock
              },
              {
                title: "Fehlende Zustandsverwaltung",
                description: "Ermittlungsverfahren sind langfristige State Machines – LLMs haben kein Gedächtnis über Sitzungen hinweg.",
                icon: Database
              }
            ].map((problem, index) => {
              const Icon = problem.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full bg-destructive/5 border-2 border-destructive/20 hover:border-destructive/40 transition-colors">
                    <CardHeader>
                      <div className="mb-4">
                        <Icon className="h-10 w-10 text-destructive" />
                      </div>
                      <CardTitle className="text-xl leading-tight">{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{problem.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="architecture" ref={architectureRef} className="py-32 bg-primary/5 network-pattern relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground text-base px-4 py-2">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Schritt 3: Die CASSA-Lösung
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Multi-Layered Ontologie-Architektur
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Structure-Aware Temporal Graph RAG (SAT-Graph RAG) in Neo4j-Graphdatenbank 
              kombiniert symbolische KI mit LLM-Sprachverarbeitung.
            </p>
            <p className="text-base text-primary font-semibold">
              👆 Klicken Sie auf die Schichten, um mehr zu erfahren
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            <div className="space-y-4">
              {layers.map((layer, index) => {
                const Icon = layer.icon
                const isSelected = selectedLayer === index
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'ring-4 ring-primary shadow-2xl scale-105' 
                          : 'hover:shadow-lg hover:scale-102'
                      }`}
                      onClick={() => setSelectedLayer(isSelected ? null : index)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <motion.div 
                            className="p-4 rounded-xl"
                            style={{ backgroundColor: `${layer.color}15` }}
                            animate={{ 
                              scale: isSelected ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon 
                              className="h-8 w-8" 
                              style={{ color: layer.color }}
                            />
                          </motion.div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge 
                                variant="outline"
                                className="text-sm"
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
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <CardContent className="pt-0">
                              <Separator className="mb-4" />
                              <p className="text-muted-foreground leading-relaxed mb-4">
                                {layer.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {layer.examples.map((example, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="sticky top-24 h-[700px]"
            >
              <div className="absolute top-3 left-3 z-10">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isPlayingNarration ? "default" : "outline"}
                        size="sm"
                        onClick={toggleNarration}
                        className="gap-2 shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
                      >
                        {isPlayingNarration ? (
                          <>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                            </span>
                            Briefing läuft …
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Polizei-Briefing
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="max-w-xs text-sm leading-relaxed"
                    >
                      <p className="font-semibold mb-1">Polizei-Briefing anhören</p>
                      <p>
                        Ein Kriminaldirektor des BKA erklärt den realen Fall &bdquo;Hydra Market&ldquo; – den weltweit größten Darknet-Marktplatz – 
                        und warum eine Graphendatenbank Kriminelle schneller vor Gericht bringt. (Sprachsynthese, ca. 4 Min.)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <PoliceKnowledgeGraph3D />
            </motion.div>
          </div>
        </div>
      </section>

      <section id="scenarios" className="py-32 bg-background">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 text-base px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Schritt 4: Praxis erleben
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Praxisszenarien für die Polizei
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Konkrete Anwendungsfälle zeigen, wie CASSA die tägliche Ermittlungsarbeit unterstützt.
            </p>
          </motion.div>

          <Tabs value={String(activeScenario)} onValueChange={(v) => setActiveScenario(Number(v))} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-2 mb-12 max-w-5xl mx-auto">
              {scenarios.map((scenario, index) => {
                const Icon = scenario.icon
                return (
                  <TabsTrigger 
                    key={index} 
                    value={String(index)}
                    className="flex flex-col items-center gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs md:text-sm font-medium text-center leading-tight">
                      {scenario.title}
                    </span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            {scenarios.map((scenario, index) => {
              const Icon = scenario.icon
              return (
                <TabsContent key={index} value={String(index)}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="border-2 hover:shadow-2xl transition-shadow">
                      <CardHeader className="pb-8">
                        <div className="flex items-start gap-6">
                          <motion.div 
                            className="p-6 rounded-2xl"
                            style={{ backgroundColor: `${scenario.color}15` }}
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          >
                            <Icon 
                              className="h-12 w-12" 
                              style={{ color: scenario.color }}
                            />
                          </motion.div>
                          <div className="flex-1">
                            <CardTitle className="text-3xl mb-4">{scenario.title}</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                              {scenario.description}
                            </CardDescription>
                            <Badge variant="secondary" className="mt-4">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {scenario.impact}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Separator className="mb-6" />
                        <h4 className="font-semibold text-lg mb-4">CASSA-Funktionen für diesen Fall:</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {scenario.benefits.map((benefit, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.4, delay: i * 0.1 }}
                              className="flex gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-foreground leading-relaxed">{benefit}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </section>

      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 network-pattern"></div>
        </div>
        <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
              Bereit für die Zeitenwende in der inneren Sicherheit?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-12 leading-relaxed">
              Erfahren Sie mehr über CASSA und wie neuro-symbolische KI-Architektur 
              Ihre Ermittlungsarbeit unterstützen kann – datenschutzkonform und rechtsstaatlich.
            </p>
            <Button 
              asChild 
              size="lg" 
              variant="secondary"
              className="text-lg px-12 h-16 text-primary font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <a 
                href="https://www.soprasteria.de/products/cassa" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Zur offiziellen CASSA-Website
                <ArrowRight className="ml-3 h-6 w-6" />
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
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-muted-foreground text-center">
                © 2024 Sopra Steria. Alle Rechte vorbehalten.
              </p>
              <a
                href="https://www.soprasteria.de/footer/impressum"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function SopraLogo() {
  return (
    <img 
      src="https://www.soprasteria.de/ResourcePackages/Bootstrap4/assets/dist/logos/logo-soprasteria.svg" 
      alt="Sopra Steria" 
      className="h-8 md:h-10"
    />
  )
}

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/10 rounded-full"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: Math.random() * 100 + '%',
            scale: 0
          }}
          animate={{ 
            y: [null, Math.random() * 100 + '%'],
            scale: [0, 1, 0],
            opacity: [0, 0.5, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  )
}

export default App
