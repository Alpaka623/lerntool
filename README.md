# 🎓 Lerntool - Dein interaktiver Lernassistent fürs Studium

Willkommen beim Lerntool! Dies ist eine webbasierte, interaktive Lernplattform, die speziell entwickelt wurde, um Studierende (insbesondere im Bereich Informatik) beim Verstehen komplexer Themen durch Visualisierungen, Simulatoren und interaktive Übungen zu unterstützen.

---

## ✨ Key-Features

Dieses Projekt geht über eine einfache Zusammenfassung von Lerninhalten hinaus und bietet eine Vielzahl von interaktiven Modulen:

### 🧠 Interaktive Visualisierungen & Simulatoren
* **Algorithmen & Datenstrukturen:**
    * Visuelle Darstellung von Sortieralgorithmen (Bubblesort, Insertionsort, Selectionsort, Quicksort).
    * Interaktive Binärsuchbäume (BST) und selbstbalancierende AVL-Bäume.
    * Schritt-für-Schritt-Visualisierung von Graphenalgorithmen wie Dijkstra und Kruskal.
    * Simulation von Stack- (LIFO) und Queue- (FIFO) Datenstrukturen.
* **Computernetzwerke (CCN):**
    * Dynamische Diagramme zum TCP 3-Wege-Handshake, Verbindungsabbau und Sliding Window.
    * Visualisierung von ARP, DHCP und IPv6 SLAAC.
    * Interaktiver Vergleich der TCP-Überlastkontrollmechanismen (Tahoe vs. Reno).
    * Darstellung von Leitungscodierungen (NRZ-I, Manchester).
* **Mathematik für Informatiker (Mafi):**
    * Visualisierung von Taylor- und Bernstein-Approximationen in Echtzeit-Graphen.
    * Interaktive Darstellung der Eulerschen Formel am Einheitskreis.
* **Rechnerstrukturen (RuB):**
    * Simulation eines 4-Bit Carry-Ripple-Addierers.

### 🧮 Rechner & Tools
* **Zahlensystem-Umrechner:** Konvertiere zwischen Dezimal-, Binär- und Hexadezimalsystem.
* **Zweierkomplement-Rechner:** Schritt-für-Schritt-Umwandlung von Dezimalzahlen.
* **Handelskalkulation:** Aufgabengenerator mit Lösungs- und Rechenweganzeige.
* **Netzwerk-Rechner:**
    * Kanalkapazität nach Nyquist & Shannon.
    * CRC-Prüfsummen-Berechnung.
    * VLSM-Subnetz-Kalkulator.
* **Mehrdimensionale Analysis:** Interaktiver Analysator für lokale Extrema mit Gradient, Hesse-Matrix und Eigenwerten.

### 🚀 Benutzerfunktionen
* **Authentifizierung:** Sicheres Anmelde- und Registrierungssystem mit Einladungscodes (via Supabase).
* **Prüfungs-Countdown:** Benutzer können ihre Prüfungstermine für jedes Fach speichern und sehen einen Countdown.
* **KI-Lernassistent:** Ein Chat-Widget, das kontextbezogene Hilfe basierend auf der aktuell angezeigten Seite bietet.

---

## 📚 Abgedeckte Fächer

Das Lerntool ist modular aufgebaut und deckt derzeit Fächer aus den ersten beiden Semestern ab:

* **1. Semester:**
    * Mathematik für Informatiker 1 (Mafi 1)
    * Einführung in die Programmierung (EidP)
    * Rechnerstrukturen und Betriebssysteme (RuB)
    * Betriebswirtschaftslehre (BWL)
* **2. Semester:**
    * Computer & Communication Networks (CCN)
    * Mathematik für Informatiker 2 (Mafi 2)
    * Algorithmen und Datenstrukturen (AuD)
    * Informationssicherheit (Insi)

---

## 🛠️ Technologie-Stack

* **Frontend:** Vanilla JavaScript (ESM), HTML5, TailwindCSS
* **Visualisierungen:** Chart.js, MathJax
* **Backend & Datenbank:** Supabase (Authentifizierung, Datenbank)
* **KI-Chat:** Anbindung an eine externe API über ein Vercel Proxy

---

## 🚀 Getting Started

Da dies ein reines Frontend-Projekt ist (mit Supabase als BaaS), ist die lokale Einrichtung sehr einfach.

1.  **Klone das Repository:**
    ```bash
    git clone [https://github.com/dein-username/lerntool.git](https://github.com/dein-username/lerntool.git)
    ```
2.  **Öffne die `index.html`:**
    Navigiere in das Verzeichnis und öffne die `index.html` direkt in deinem Browser oder starte einen einfachen Live-Server.

---

## ⚠️ Wichtiger Hinweis

Dieses Lerntool ist als **ergänzende Lernhilfe** konzipiert. Die Inhalte sind nicht zwangsläufig vollständig oder immer auf dem neuesten Stand und können die offiziellen Kursmaterialien (Skripte, Vorlesungsunterlagen) **nicht ersetzen**. Nutze für deine Klausurvorbereitung primär die offiziellen Quellen!
