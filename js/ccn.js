(() => {
sessionStorage.setItem('selectedSemester', '2');
const backBtn = document.querySelector('.back-to-hub-btn');
if (backBtn) backBtn.addEventListener('click', () => { window.dispatchEvent(new CustomEvent('navigate-back')); });

// --- CCN SELECTORS ---
    const navButtons = document.querySelectorAll('.nav-button');
    const contentSections = document.querySelectorAll('.content-section');
    const protocolSelectorButtons = document.querySelectorAll('#protocol-selector button');
    const headerDisplay = document.getElementById('header-display');
    const descriptionBoxContainer = document.getElementById('description-box-container');
    const calculateCapacityBtn = document.getElementById('calculate_capacity');
    const calculateCrcBtn = document.getElementById('calculate_crc');
    const calculateVlsmBtn = document.getElementById('calculate_vlsm');
    const processSelectorButtons = document.querySelectorAll('#process-selector button');
    const processDisplay = document.getElementById('process-display');
    const appProcessSelectorButtons = document.querySelectorAll('#app-process-selector button');
    const appProcessDisplay = document.getElementById('app-process-display');
    const simulateLossBtn = document.getElementById('simulate_loss');
    const resetChartBtn = document.getElementById('reset_chart');
    const osiLayers = document.querySelectorAll('.osi-layer');
    const layerDescriptionBox = document.getElementById('layer-description-box');
    const topologyItems = document.querySelectorAll('.topology-item');
    const topologyDescriptionBox = document.getElementById('topology-description-box');
    const encodingChartBtn = document.getElementById('update-encoding-chart');
    const routingSimulateBtn = document.getElementById('routing-simulate-btn');
    let chartInterval;

    // --- DATA & STATE (for CCN Module) ---
    const layerDescriptions = {
        '7': '<strong>Anwendungsschicht (Application Layer):</strong> Stellt die Schnittstelle für Netzwerkapplikationen bereit (z.B. Browser, E-Mail-Client) und definiert Protokolle wie HTTP und DNS.',
        '6': '<strong>Darstellungsschicht (Presentation Layer):</strong> Übersetzt Daten zwischen dem Anwendungsformat und einem gemeinsamen Netzwerkformat. Verantwortlich für Aufgaben wie Datenkompression, Verschlüsselung und die Konvertierung von Zeichensätzen.',
        '5': '<strong>Sitzungsschicht (Session Layer):</strong> Organisiert und synchronisiert den Dialog zwischen den kommunizierenden Systemen und baut logische Sitzungen auf und ab.',
        '4': '<strong>Transportschicht (Transport Layer):</strong> Gewährleistet die Ende-zu-Ende-Kommunikation zwischen Prozessen auf verschiedenen Hosts. Protokolle wie TCP (zuverlässig) und UDP (schnell) arbeiten hier.',
        '3': '<strong>Vermittlungsschicht (Network Layer):</strong> Ist für die globale Adressierung (IP-Adressen) und die Wegfindung (Routing) von Datenpaketen durch das gesamte Netzwerk verantwortlich.',
        '2': '<strong>Sicherungsschicht (Data Link Layer):</strong> Sorgt für eine zuverlässige Übertragung von Daten-Frames innerhalb eines lokalen Netzwerks (z.B. Ethernet) und regelt den Zugriff auf das Medium.',
        '1': '<strong>Bitübertragungsschicht (Physical Layer):</strong> Definiert die physikalischen und elektrischen Eigenschaften des Übertragungsmediums (Kabel, Funk) für die Übertragung roher Bits.'
    };
    const topologyData = {
        'bus': {
            desc: '<strong>Bus-Topologie:</strong> Alle Geräte sind an ein einziges gemeinsames Übertragungsmedium (den Bus) angeschlossen. Nachrichten werden an alle Geräte gesendet. <br><strong>Vorteil:</strong> Einfach und kostengünstig. <br><strong>Nachteil:</strong> Anfällig für Ausfälle (Kabelbruch legt alles lahm), Kollisionen bei hoher Last.',
            img: 'https://upload.wikimedia.org/wikipedia/commons/4/47/BusNetwork.svg'
        },
        'star': {
            desc: '<strong>Stern-Topologie:</strong> Alle Geräte sind mit einem zentralen Knotenpunkt (Hub oder Switch) verbunden. Die gesamte Kommunikation läuft über diesen zentralen Punkt. <br><strong>Vorteil:</strong> Hohe Ausfallsicherheit (Ausfall eines Geräts beeinträchtigt nicht die anderen), leicht erweiterbar. <br><strong>Nachteil:</strong> Der zentrale Knoten ist ein "Single Point of Failure".',
            img: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/StarNetwork.svg'
        },
        'ring': {
            desc: '<strong>Ring-Topologie:</strong> Jedes Gerät ist mit genau zwei Nachbarn verbunden, sodass ein geschlossener Ring entsteht. Daten werden in eine Richtung von Gerät zu Gerät weitergereicht. <br><strong>Vorteil:</strong> Deterministisches Verhalten, keine Kollisionen. <br><strong>Nachteil:</strong> Ausfall eines Geräts oder Kabels unterbricht den gesamten Ring.',
            img: 'https://upload.wikimedia.org/wikipedia/commons/7/75/RingNetwork.svg'
        },
        'mesh': {
            desc: '<strong>Vermaschte Topologie:</strong> Geräte sind untereinander mehrfach verbunden. In einer vollständig vermaschten Topologie ist jedes Gerät mit jedem anderen verbunden. <br><strong>Vorteil:</strong> Extrem hohe Ausfallsicherheit und Robustheit, da es viele alternative Wege gibt. <br><strong>Nachteil:</strong> Sehr hoher Verkabelungsaufwand und Komplexität.',
            img: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Fully_connected_neural_network.svg'
        }
    };
    const protocolData = {
        ethernet: {
            name: 'Ethernet II Frame',
            fields: [
                { name: 'Preamble', size: '7 Bytes', desc: 'Eine 7-Byte-Sequenz von alternierenden 0en und 1en (10101010...), die dem Empfänger zur Synchronisation seines Taktes dient.' },
                { name: 'SFD', size: '1 Byte', desc: 'Der Start Frame Delimiter (10101011) signalisiert das Ende der Präambel und den Beginn der eigentlichen Frame-Daten.' },
                { name: 'Destination MAC', size: '6 Bytes', desc: 'Die 48-Bit-Hardware-Adresse des Zielgeräts. Kann Unicast, Multicast oder Broadcast sein.' },
                { name: 'Source MAC', size: '6 Bytes', desc: 'Die 48-Bit-Hardware-Adresse des sendenden Geräts. Immer eine Unicast-Adresse.' },
                { name: 'EtherType', size: '2 Bytes', desc: 'Gibt das Protokoll der nächsthöheren Schicht an (z.B. 0x0800 für IPv4, 0x86DD für IPv6, 0x0806 für ARP).' },
                { name: 'Payload & Pad', size: '46-1500 B', desc: 'Die Nutzdaten von der Vermittlungsschicht. Falls die Datenmenge unter 46 Bytes liegt, wird mit Füllbytes (Padding) aufgefüllt, um die minimale Frame-Größe von 64 Bytes zu erreichen.' },
                { name: 'FCS', size: '4 Bytes', desc: 'Die Frame Check Sequence enthält eine 32-Bit-CRC-Prüfsumme zur Fehlererkennung bei der Übertragung.' }
            ]
        },
        ipv4: {
            name: 'IPv4 Header (20 Bytes typisch)',
            layout: [
                [{ name: 'Version', size: '4b' }, { name: 'IHL', size: '4b' }, { name: 'DSCP', size: '6b' }, { name: 'ECN', size: '2b' }, { name: 'Total Length', size: '16b' }],
                [{ name: 'Identification', size: '16b' }, { name: 'Flags', size: '3b' }, { name: 'Fragment Offset', size: '13b' }],
                [{ name: 'TTL', size: '8b' }, { name: 'Protocol', size: '8b' }, { name: 'Header Checksum', size: '16b' }],
                [{ name: 'Source Address', size: '32b' }],
                [{ name: 'Destination Address', size: '32b' }]
            ],
            fields: {
                'Version': { desc: 'IP-Version, für IPv4 immer 4.' },
                'IHL': { desc: 'Internet Header Length; Länge des Headers in 32-Bit-Wörtern. Mindestwert ist 5 (20 Bytes).' },
                'DSCP': { desc: 'Differentiated Services Code Point; wird für Quality of Service (QoS) verwendet.' },
                'ECN': { desc: 'Explicit Congestion Notification; zur Signalisierung von Netzwerkstau ohne Paketverlust.' },
                'Total Length': { desc: 'Gesamtlänge des Pakets (Header + Daten) in Bytes. Max. 65.535 Bytes.' },
                'Identification': { desc: 'Eindeutiger Wert, der alle Fragmente eines ursprünglichen Pakets kennzeichnet.' },
                'Flags': { desc: '3 Bits: 1. reserviert, 2. DF (Don\'t Fragment), 3. MF (More Fragments).' },
                'Fragment Offset': { desc: 'Position des Fragments im ursprünglichen Datenpaket, gemessen in 8-Byte-Blöcken.' },
                'TTL': { desc: 'Time to Live; Zähler, der von jedem Router dekrementiert wird. Bei 0 wird das Paket verworfen (verhindert Schleifen).' },
                'Protocol': { desc: 'Gibt das Protokoll der Transportschicht an (z.B. 6 für TCP, 17 für UDP, 1 für ICMP).' },
                'Header Checksum': { desc: 'Prüfsumme, die nur den Header abdeckt. Muss von jedem Router neu berechnet werden, da sich der TTL ändert.' },
                'Source Address': { desc: '32-Bit-IP-Adresse des Senders.' },
                'Destination Address': { desc: '32-Bit-IP-Adresse des Empfängers.' }
            }
        },
        ipv6: {
            name: 'IPv6 Header (40 Bytes fest)',
            layout: [
                [{ name: 'Version', size: '4b' }, { name: 'Traffic Class', size: '8b' }, { name: 'Flow Label', size: '20b' }],
                [{ name: 'Payload Length', size: '16b' }, { name: 'Next Header', size: '8b' }, { name: 'Hop Limit', size: '8b' }],
                [{ name: 'Source Address', size: '128b' }],
                [{ name: 'Destination Address', size: '128b' }]
            ],
            fields: {
                'Version': { desc: 'IP-Version, für IPv6 immer 6.' },
                'Traffic Class': { desc: 'Ähnlich wie DSCP in IPv4, für QoS-Zwecke.' },
                'Flow Label': { desc: 'Kann zur Markierung von Paketen verwendet werden, die zu einem bestimmten Datenstrom gehören und eine spezielle Behandlung erfordern.' },
                'Payload Length': { desc: 'Länge der Nutzdaten (ohne den 40-Byte-Header) in Bytes.' },
                'Next Header': { desc: 'Gibt den Typ des folgenden Headers an (z.B. TCP, UDP oder ein Extension Header).' },
                'Hop Limit': { desc: 'Äquivalent zum TTL in IPv4. Wird von jedem Router dekrementiert.' },
                'Source Address': { desc: '128-Bit-IP-Adresse des Senders.' },
                'Destination Address': { desc: '128-Bit-IP-Adresse des Empfängers.' }
            }
        },
        tcp: {
            name: 'TCP Header (20 Bytes typisch)',
             layout: [
                [{ name: 'Source Port', size: '16b' }, { name: 'Destination Port', size: '16b' }],
                [{ name: 'Sequence Number', size: '32b' }],
                [{ name: 'Acknowledgment Number', size: '32b' }],
                [{ name: 'Data Offset', size: '4b' }, { name: 'Reserved', size: '3b' }, { name: 'Flags', size: '9b' }, { name: 'Window Size', size: '16b' }],
                [{ name: 'Checksum', size: '16b' }, { name: 'Urgent Pointer', size: '16b' }]
            ],
            fields: {
                'Source Port': { desc: 'Portnummer des Senders.' },
                'Destination Port': { desc: 'Portnummer des Empfängers.' },
                'Sequence Number': { desc: 'Die Sequenznummer des ersten Datenbytes in diesem Segment. Bei SYN-Paketen die Initial Sequence Number (ISN).' },
                'Acknowledgment Number': { desc: 'Wenn das ACK-Flag gesetzt ist, enthält dieses Feld die nächste Sequenznummer, die der Sender dieses Segments erwartet.' },
                'Data Offset': { desc: 'Länge des TCP-Headers in 32-Bit-Wörtern. Gibt an, wo die Daten beginnen.' },
                'Reserved': { desc: 'Für zukünftige Verwendung reserviert und sollte Null sein.' },
                'Flags': { desc: '9 Kontrollbits (NS, CWR, ECE, URG, ACK, PSH, RST, SYN, FIN) zur Steuerung der Verbindung.' },
                'Window Size': { desc: 'Die Anzahl der Datenbytes, die der Sender dieses Segments bereit ist zu empfangen (für die Flusskontrolle).' },
                'Checksum': { desc: 'Prüfsumme über Header, Nutzdaten und einen Pseudo-Header (aus IP-Adressen).' },
                'Urgent Pointer': { desc: 'Wenn das URG-Flag gesetzt ist, zeigt dieser Wert auf dringende Daten.' },
            }
        },
        udp: {
            name: 'UDP Header (8 Bytes fest)',
            layout: [
                [{ name: 'Source Port', size: '16b' }, { name: 'Destination Port', size: '16b' }],
                [{ name: 'Length', size: '16b' }, { name: 'Checksum', size: '16b' }]
            ],
            fields: {
                'Source Port': { desc: 'Portnummer des Senders. Optional.' },
                'Destination Port': { desc: 'Portnummer des Empfängers.' },
                'Length': { desc: 'Länge des UDP-Headers plus der Daten in Bytes. Mindestens 8.' },
                'Checksum': { desc: 'Optionale Prüfsumme über Header, Daten und einen Pseudo-Header.' }
            }
        },
        icmp: {
            name: 'ICMPv4 Header',
            layout: [
                [{ name: 'Type', size: '8b' }, { name: 'Code', size: '8b' }, { name: 'Checksum', size: '16b' }],
                [{ name: 'Rest of Header', size: '32b' }]
            ],
            fields: {
                'Type': { desc: 'Gibt den Typ der ICMP-Nachricht an (z.B. 8 für Echo Request, 0 für Echo Reply, 3 für Destination Unreachable).' },
                'Code': { desc: 'Präzisiert den Nachrichtentyp (z.B. bei Typ 3: Code 0 für Network Unreachable, Code 1 für Host Unreachable).' },
                'Checksum': { desc: 'Prüfsumme über die gesamte ICMP-Nachricht.' },
                'Rest of Header': { desc: 'Der Inhalt dieses Feldes hängt vom Typ und Code ab. Bei Echo-Nachrichten enthält es Identifier und Sequenznummer.' }
            }
        }
    };
    const processData = {
        'tcp-handshake': {
            title: 'TCP 3-Wege-Handshake',
            steps: [
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-cyan-400 font-bold text-lg animate-pulse">SYN →</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 1 (SYN):</b> Der Client möchte eine Verbindung aufbauen. Er sendet ein TCP-Segment mit gesetztem SYN-Flag (Synchronize) und einer zufällig gewählten initialen Sequenznummer (z.B. SEQ=x).'
                },
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-gray-500">← SYN/ACK</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 2 (SYN/ACK):</b> Der Server empfängt das SYN-Paket. Wenn er die Verbindung akzeptiert, antwortet er mit einem Segment, bei dem sowohl das SYN- als auch das ACK-Flag (Acknowledgment) gesetzt sind. Er bestätigt die Sequenznummer des Clients (ACK=x+1) und sendet seine eigene initiale Sequenznummer (SEQ=y).'
                },
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-cyan-400 font-bold text-lg animate-pulse">ACK →</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 3 (ACK):</b> Der Client empfängt das SYN/ACK-Paket und bestätigt seinerseits die Sequenznummer des Servers, indem er ein Segment mit gesetztem ACK-Flag (ACK=y+1) sendet. Die Verbindung ist nun auf beiden Seiten im Zustand "ESTABLISHED" und die Datenübertragung kann beginnen.'
                }
            ]
        },
        'tcp-termination': {
            title: 'TCP Verbindungsabbau',
            steps: [
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-red-400 font-bold text-lg animate-pulse">FIN →</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 1 (FIN):</b> Der Client hat keine Daten mehr zu senden und initiiert den Abbau. Er sendet ein TCP-Segment mit gesetztem FIN-Flag (Finish).'
                },
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-gray-500">← ACK</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 2 (ACK):</b> Der Server empfängt das FIN und bestätigt es mit einem ACK. Die Verbindung ist nun "halb-geschlossen". Der Server kann weiterhin Daten an den Client senden, falls nötig.'
                },
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-gray-500">← FIN</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 3 (FIN):</b> Wenn auch der Server keine Daten mehr zu senden hat, schickt er seinerseits ein Segment mit gesetztem FIN-Flag an den Client.'
                },
                {
                    diagram: `<div class="flex justify-between items-center text-center"><div class="w-1/3"><b>Client</b></div><div class="w-1/3 text-red-400 font-bold text-lg animate-pulse">ACK →</div><div class="w-1/3"><b>Server</b></div></div>`,
                    desc: '<b>Schritt 4 (ACK):</b> Der Client bestätigt das FIN des Servers mit einem letzten ACK. Nach einer Wartezeit (TIME_WAIT) wird die Verbindung auf beiden Seiten vollständig geschlossen.'
                }
            ]
        },
        'tcp-sliding-window': {
            title: 'TCP Sliding Window',
            steps: [
                {
                    diagram: `<div class="text-center font-mono"><div>Sender: [ <span class="text-green-400">1 2</span> | <span class="text-yellow-400">3 4 5</span> | 6 7 8 ]</div><div class="mt-2">Empfänger: [ <span class="text-green-400">1 2</span> | _ _ _ | _ _ _ ]</div></div>`,
                    desc: '<b>Start:</b> Das Fenster hat eine Größe von 3. Der Sender darf die Pakete 3, 4 und 5 senden. Pakete 1 und 2 wurden bereits gesendet und bestätigt.'
                },
                {
                    diagram: `<div class="text-center font-mono"><div>Sender: [ <span class="text-green-400">1 2</span> | <span class="text-yellow-400">3 4 5</span> | 6 7 8 ]</div><div class="mt-2 text-cyan-400 animate-pulse">Paket 3 wird gesendet →</div></div>`,
                    desc: '<b>Senden:</b> Der Sender schickt das erste Paket im Fenster (Paket 3) los.'
                },
                {
                    diagram: `<div class="text-center font-mono"><div>Sender: [ <span class="text-green-400">1 2</span> | <span class="text-yellow-400">3 4 5</span> | 6 7 8 ]</div><div class="mt-2 text-gray-500">← ACK für 3</div></div>`,
                    desc: '<b>Empfang & ACK:</b> Der Empfänger erhält Paket 3 und sendet eine Bestätigung (ACK) zurück.'
                },
                {
                    diagram: `<div class="text-center font-mono"><div>Sender: [ 1 2 <span class="text-green-400">3</span> | <span class="text-yellow-400">4 5 6</span> | 7 8 9 ]</div><div class="mt-2">Empfänger: [ <span class="text-green-400">1 2 3</span> | _ _ _ | _ _ _ ]</div></div>`,
                    desc: '<b>Fenster verschieben:</b> Der Sender empfängt das ACK für Paket 3. Das Fenster verschiebt sich um eine Position nach rechts. Der Sender darf nun die Pakete 4, 5 und 6 senden.'
                },
                {
                    diagram: `<div class="text-center font-mono"><div>Sender: [ 1 2 <span class="text-green-400">3</span> | <span class="text-yellow-400">4 5 6</span> | 7 8 9 ]</div><div class="mt-2 text-red-500 animate-pulse">Paket 4 geht verloren X</div></div>`,
                    desc: '<b>Paketverlust:</b> Der Sender schickt Paket 4, aber es geht im Netzwerk verloren.'
                },
                {
                    diagram: `<div class="text-center font-mono"><div>Sender: [ 1 2 <span class="text-green-400">3</span> | <span class="text-yellow-400">4 5 6</span> | 7 8 9 ]</div><div class="mt-2 text-red-500 animate-pulse">Timeout! Paket 4 wird erneut gesendet →</div></div>`,
                    desc: '<b>Retransmission:</b> Der Sender erhält kein ACK für Paket 4. Nach Ablauf eines Timeouts sendet er Paket 4 erneut. Der Prozess wird fortgesetzt.'
                }
            ]
        },
        'arp': {
            title: 'ARP-Prozess (Address Resolution Protocol)',
            steps: [
                {
                    diagram: `<div class="text-center"><b>Host A</b> (kennt IP von B, nicht MAC)</div>`,
                    desc: '<b>Situation:</b> Host A (z.B. 192.168.1.10) möchte ein Paket an Host B (192.168.1.20) im selben lokalen Netz senden. Host A kennt die IP-Adresse von B, aber nicht dessen MAC-Adresse, die für den Ethernet-Frame benötigt wird.'
                },
                {
                    diagram: `<div class="text-center"><b>Host A</b> → 🌐 (Broadcast)</div><p class="text-center mt-2 font-mono text-cyan-300">ARP Request: "Wer hat 192.168.1.20?"</p>`,
                    desc: '<b>Schritt 1 (ARP Request):</b> Host A sendet eine ARP-Anfrage als Layer-2-Broadcast (an die MAC-Adresse FF:FF:FF:FF:FF:FF). Diese Nachricht wird von allen Geräten im lokalen Netzwerk empfangen.'
                },
                {
                    diagram: `<div class="text-center"><b>Host B</b> → <b>Host A</b> (Unicast)</div> <p class="text-center mt-2 font-mono text-cyan-300">ARP Reply: "192.168.1.20 ist bei [MAC von B]"</p>`,
                    desc: '<b>Schritt 2 (ARP Reply):</b> Alle Geräte verarbeiten die Anfrage, aber nur Host B erkennt seine eigene IP-Adresse. Host B antwortet direkt an Host A (Unicast) mit einer ARP-Antwort, die seine MAC-Adresse enthält.'
                },
                {
                    diagram: `<div class="text-center"><b>Host A</b> (speichert "IP von B → MAC von B" im Cache)</div>`,
                    desc: '<b>Schritt 3 (Cache):</b> Host A empfängt die Antwort und speichert die Zuordnung von IP- zu MAC-Adresse in seinem ARP-Cache. Für zukünftige Pakete an Host B kann die MAC-Adresse direkt aus dem Cache entnommen werden, ohne einen neuen ARP-Prozess zu starten.'
                }
            ]
        },
        'dhcp': {
            title: 'DHCP DORA-Prozess',
            steps: [
                {
                    diagram: `<div class="text-center"><b>Client</b> → 🌐 (Broadcast)</div><p class="text-center mt-2 font-bold text-cyan-300">D: Discover</p>`,
                    desc: '<b>Schritt 1 (Discover):</b> Ein Client, der gerade dem Netzwerk beigetreten ist, hat noch keine IP-Adresse. Er sendet eine DHCPDISCOVER-Nachricht als Broadcast, um einen DHCP-Server zu finden.'
                },
                {
                    diagram: `<div class="text-center"><b>DHCP Server</b> → <b>Client</b> (Unicast/Broadcast)</div><p class="text-center mt-2 font-bold text-cyan-300">O: Offer</p>`,
                    desc: '<b>Schritt 2 (Offer):</b> Ein oder mehrere DHCP-Server, die die Discover-Nachricht empfangen, antworten mit einer DHCPOFFER-Nachricht. Diese enthält ein Angebot für eine IP-Adresse sowie weitere Konfigurationsparameter (Subnetzmaske, Gateway, DNS-Server).'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> → 🌐 (Broadcast)</div><p class="text-center mt-2 font-bold text-cyan-300">R: Request</p>`,
                    desc: '<b>Schritt 3 (Request):</b> Der Client wählt eines der Angebote aus (normalerweise das erste, das er empfängt) und sendet eine DHCPREQUEST-Nachricht, wieder als Broadcast. Dies informiert den ausgewählten Server, dass sein Angebot angenommen wird, und die anderen Server, dass ihre Angebote abgelehnt wurden.'
                },
                {
                    diagram: `<div class="text-center"><b>DHCP Server</b> → <b>Client</b> (Unicast)</div><p class="text-center mt-2 font-bold text-cyan-300">A: Acknowledge</p>`,
                    desc: '<b>Schritt 4 (Acknowledge):</b> Der ausgewählte Server bestätigt die Zuweisung endgültig mit einer DHCPACK-Nachricht. Der Client kann die IP-Adresse nun verwenden. Der Prozess ist abgeschlossen.'
                }
            ]
        },
        'ipv6-slaac': {
            title: 'IPv6 SLAAC & Neighbor Discovery',
            steps: [
                {
                    diagram: `<div class="text-center"><b>Host</b> (startet)</div>`,
                    desc: '<b>Schritt 1: Link-Local-Adresse generieren.</b> Der Host erzeugt eine Link-Local-Adresse (LLA) im `fe80::/10`-Bereich, meist aus seiner MAC-Adresse (EUI-64) oder zufällig (Privacy Extensions).'
                },
                {
                    diagram: `<div class="text-center"><b>Host</b> → 🌐 (Multicast)</div><p class="text-center mt-2 font-mono text-cyan-300">Neighbor Solicitation (DAD)</p>`,
                    desc: '<b>Schritt 2: Duplicate Address Detection (DAD).</b> Der Host sendet eine Neighbor Solicitation an die "solicited-node multicast address" seiner gerade erzeugten LLA, um zu prüfen, ob die Adresse bereits verwendet wird. Als Quell-IP wird `::` (unspecified) genutzt.'
                },
                {
                    diagram: `<div class="text-center"><b>Host</b> → 🌐 (Multicast an alle Router)</div><p class="text-center mt-2 font-mono text-cyan-300">Router Solicitation</p>`,
                    desc: '<b>Schritt 3: Router finden.</b> Wenn keine andere Adresse die LLA beansprucht, sendet der Host eine Router Solicitation an die `ff02::2` Multicast-Gruppe, um Informationen über das lokale Netzwerk und Gateways zu erhalten.'
                },
                {
                    diagram: `<div class="text-center"><b>Router</b> → <b>Host</b> (Unicast)</div><p class="text-center mt-2 font-mono text-cyan-300">Router Advertisement</p>`,
                    desc: '<b>Schritt 4: Router Advertisement erhalten.</b> Der Router antwortet mit einem Router Advertisement, das das Netzwerkpräfix (z.B. `2001:db8:1::/64`), die Router-Adresse und andere Flags (z.B. für DHCPv6) enthält.'
                },
                {
                    diagram: `<div class="text-center"><b>Host</b> (kombiniert Präfix + Interface ID)</div>`,
                    desc: '<b>Schritt 5: Globale Adresse konfigurieren.</b> Der Host kombiniert das erhaltene Präfix mit seiner Interface ID, um eine global routbare IPv6-Adresse zu erstellen. Der Prozess ist abgeschlossen.'
                }
            ]
        }
    };
    const appProcessData = {
        'dns': {
            title: 'DNS Namensauflösung (Iterativ)',
            steps: [
                {
                    diagram: `<div class="text-center"><b>Client</b> → <b>Lokaler Resolver</b></div><p class="text-center mt-2 font-mono text-cyan-300">Anfrage: www.beispiel.de?</p>`,
                    desc: '<b>Schritt 1:</b> Der Client fragt seinen konfigurierten DNS-Resolver (oft der Router oder ein ISP-Server) nach der IP-Adresse für "www.beispiel.de".'
                },
                {
                    diagram: `<div class="text-center"><b>Lokaler Resolver</b> → <b>Root Server (.)</b></div><p class="text-center mt-2 font-mono text-cyan-300">Anfrage: www.beispiel.de?</p>`,
                    desc: '<b>Schritt 2:</b> Der Resolver kennt die Adresse nicht und fragt einen der Root-Nameserver.'
                },
                {
                    diagram: `<div class="text-center"><b>Lokaler Resolver</b> ← <b>Root Server (.)</b></div><p class="text-center mt-2 font-mono text-cyan-300">Antwort: "Ich kenne .de, frage dort."</p>`,
                    desc: '<b>Schritt 3:</b> Der Root-Server antwortet, dass er "www.beispiel.de" nicht kennt, aber die Adressen der zuständigen Server für die Top-Level-Domain (TLD) ".de" hat.'
                },
                {
                    diagram: `<div class="text-center"><b>Lokaler Resolver</b> → <b>.de TLD Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">Anfrage: www.beispiel.de?</p>`,
                    desc: '<b>Schritt 4:</b> Der Resolver fragt nun einen der .de-Server.'
                },
                {
                    diagram: `<div class="text-center"><b>Lokaler Resolver</b> ← <b>.de TLD Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">Antwort: "Ich kenne beispiel.de, frage dort."</p>`,
                    desc: '<b>Schritt 5:</b> Der .de-Server antwortet mit den Adressen der autoritativen Nameserver für die Domain "beispiel.de".'
                },
                {
                    diagram: `<div class="text-center"><b>Lokaler Resolver</b> → <b>beispiel.de Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">Anfrage: www.beispiel.de?</p>`,
                    desc: '<b>Schritt 6:</b> Der Resolver fragt den autoritativen Server für "beispiel.de".'
                },
                {
                    diagram: `<div class="text-center"><b>Lokaler Resolver</b> ← <b>beispiel.de Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">Antwort: "www.beispiel.de ist bei 93.184.216.34"</p>`,
                    desc: '<b>Schritt 7:</b> Der autoritative Server liefert die finale Antwort: die IP-Adresse.'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> ← <b>Lokaler Resolver</b></div><p class="text-center mt-2 font-mono text-cyan-300">Antwort: 93.184.216.34</p>`,
                    desc: '<b>Schritt 8:</b> Der Resolver gibt die IP-Adresse an den Client weiter und speichert das Ergebnis für eine bestimmte Zeit (TTL) in seinem Cache.'
                }
            ]
        },
        'http': {
            title: 'HTTP Request/Response',
            steps: [
                {
                    diagram: `<div class="text-center"><b>Client</b> ↔ <b>Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">TCP 3-Wege-Handshake</p>`,
                    desc: '<b>Schritt 1: TCP-Verbindung aufbauen.</b> Bevor HTTP-Nachrichten ausgetauscht werden können, baut der Client eine zuverlässige TCP-Verbindung zum Server auf (typischerweise auf Port 80 oder 443).'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> → <b>Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">GET /seite.html HTTP/1.1<br>Host: www.beispiel.de</p>`,
                    desc: '<b>Schritt 2: HTTP Request senden.</b> Der Client sendet eine Anfrage-Nachricht. Diese enthält eine Methode (z.B. GET), den Pfad zur Ressource und verschiedene Header-Informationen.'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> ← <b>Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">HTTP/1.1 200 OK<br>Content-Type: text/html</p>`,
                    desc: '<b>Schritt 3: HTTP Response empfangen.</b> Der Server verarbeitet die Anfrage und sendet eine Antwort. Diese besteht aus einer Statuszeile (z.B. "200 OK"), Response-Headern und dem eigentlichen Inhalt (Body), z.B. dem HTML-Code der Webseite.'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> ↔ <b>Server</b></div><p class="text-center mt-2 font-mono text-red-400">TCP Verbindungsabbau</p>`,
                    desc: '<b>Schritt 4: Verbindung schließen.</b> Nachdem die Daten übertragen wurden, kann die TCP-Verbindung wieder abgebaut werden. Bei modernen Webseiten wird die Verbindung oft offengehalten (Keep-Alive), um weitere Ressourcen (Bilder, CSS) schnell nachladen zu können.'
                }
            ]
        },
        'tls': {
            title: 'TLS 1.3 Handshake (vereinfacht)',
            steps: [
                {
                    diagram: `<div class="text-center"><b>Client</b> → <b>Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">ClientHello</p>`,
                    desc: '<b>Schritt 1 (ClientHello):</b> Der Client sendet eine Liste der von ihm unterstützten Verschlüsselungsalgorithmen (Cipher Suites) und eine Zufallszahl.'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> ← <b>Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">ServerHello, Certificate, Finished</p>`,
                    desc: '<b>Schritt 2 (ServerHello):</b> Der Server wählt eine Cipher Suite aus der Liste aus, sendet sein öffentliches Zertifikat (zur Authentifizierung) und seine eigene Zufallszahl. Er berechnet bereits den gemeinsamen geheimen Schlüssel und sendet eine "Finished"-Nachricht, die mit diesem Schlüssel verschlüsselt ist.'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> → <b>Server</b></div><p class="text-center mt-2 font-mono text-cyan-300">Finished</p>`,
                    desc: '<b>Schritt 3 (Client Finished):</b> Der Client überprüft das Zertifikat des Servers. Wenn es gültig ist, berechnet er ebenfalls den gemeinsamen geheimen Schlüssel und sendet seine eigene "Finished"-Nachricht. Der Handshake ist abgeschlossen.'
                },
                {
                    diagram: `<div class="text-center"><b>Client</b> ↔ <b>Server</b></div><p class="text-center mt-2 font-mono text-green-400">Verschlüsselte Anwendungsdaten</p>`,
                    desc: '<b>Schritt 4 (Application Data):</b> Beide Seiten können nun Anwendungsdaten (z.B. HTTP-Anfragen) senden, die mit dem ausgehandelten symmetrischen Schlüssel sicher verschlüsselt sind.'
                }
            ]
        }
    };

    function setupCcn() {
        if (!document.getElementById('ccn-app')) return;

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.dataset.target;
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                contentSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) section.classList.add('active');
                });
            });
        });

        osiLayers.forEach(layer => {
            layer.addEventListener('click', () => {
                const layerId = layer.dataset.layer;
                if(layerDescriptionBox) layerDescriptionBox.innerHTML = layerDescriptions[layerId] || '';
                osiLayers.forEach(l => l.classList.remove('selected'));
                layer.classList.add('selected');
            });
        });
        if(osiLayers.length > 0) osiLayers[0].click();

        topologyItems.forEach(item => {
            item.addEventListener('click', () => {
                const topologyId = item.dataset.topology;
                const data = topologyData[topologyId];
                if(topologyDescriptionBox && data) {
                     topologyDescriptionBox.innerHTML = `<div class="flex flex-col md:flex-row gap-4 items-center"><img src="${data.img}" alt="${item.textContent}" class="w-32 h-32 object-contain bg-white p-2 rounded-md"><p>${data.desc}</p></div>`;
                }
                topologyItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
        if(topologyItems.length > 0) topologyItems[0].click();
        
        setupEncodingChart();
        if(encodingChartBtn) encodingChartBtn.addEventListener('click', updateEncodingChart);
        
        setupVlanSwitch();

        setupRoutingTable();
        if(routingSimulateBtn) routingSimulateBtn.addEventListener('click', simulateRouting);

        protocolSelectorButtons.forEach(button => {
            button.addEventListener('click', () => displayHeader(button.dataset.protocol));
        });
        displayHeader('ethernet');

        if(calculateCapacityBtn) calculateCapacityBtn.addEventListener('click', handleCapacityCalculation);
        if(calculateCrcBtn) calculateCrcBtn.addEventListener('click', handleCrcCalculation);
        if(calculateVlsmBtn) calculateVlsmBtn.addEventListener('click', handleVlsmCalculation);
        handleCapacityCalculation();
        handleCrcCalculation();
        handleVlsmCalculation();

        processSelectorButtons.forEach(button => {
            button.addEventListener('click', () => displayProcess(button.dataset.process));
        });
        displayProcess('tcp-handshake');

        appProcessSelectorButtons.forEach(button => {
            button.addEventListener('click', () => displayAppProcess(button.dataset.appProcess));
        });
        displayAppProcess('dns');

        setupCongestionChart();
        if(resetChartBtn) resetChartBtn.addEventListener('click', resetCongestionChart);
        if(simulateLossBtn) simulateLossBtn.addEventListener('click', simulatePacketLoss);
    }

    function displayHeader(protocol) {
        const data = protocolData[protocol];
        if (!data || !headerDisplay) return;
        
        headerDisplay.innerHTML = `<h3 class="text-xl font-semibold mb-4 text-center text-white">${data.name}</h3>`;
        if(descriptionBoxContainer) descriptionBoxContainer.innerHTML = '';
        
        let headerHTML;
        if (data.layout) {
            headerHTML = data.layout.map(row => {
                const rowHTML = row.map(field => `
                    <div class="header-field border p-2 text-center rounded-md flex-grow" data-field-name="${field.name}">
                        <span class="block text-sm font-semibold">${field.name}</span>
                        <span class="block text-xs text-gray-400">${field.size}</span>
                    </div>`).join('');
                return `<div class="flex flex-row gap-1 mb-1">${rowHTML}</div>`;
            }).join('');
        } else {
            headerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-1">` +
                data.fields.map(field => `
                    <div class="header-field border p-2 text-center rounded-md" data-field-name="${field.name}">
                        <span class="block text-sm font-semibold">${field.name}</span>
                        <span class="block text-xs text-gray-400">${field.size}</span>
                    </div>`).join('') + `</div>`;
        }
        headerDisplay.innerHTML += headerHTML;
        
        const allFields = data.layout ? data.layout.flat() : data.fields;
        allFields.forEach(field => {
            const fieldInfo = data.layout ? data.fields[field.name] : field;
            const descBox = document.createElement('div');
            descBox.id = `desc-${field.name.replace(/\s+/g, '-')}`;
            descBox.className = 'description-box p-4 border-l-4 rounded-r-lg';
            descBox.innerHTML = `<h4 class="font-bold text-cyan-400">${field.name}</h4><p class="text-gray-300 mt-1">${fieldInfo.desc}</p>`;
            if(descriptionBoxContainer) descriptionBoxContainer.appendChild(descBox);
        });

        const headerFields = headerDisplay.querySelectorAll('.header-field');
        headerFields.forEach(field => {
            field.addEventListener('click', () => {
                const fieldName = field.dataset.fieldName;
                const descId = `desc-${fieldName.replace(/\s+/g, '-')}`;
                headerFields.forEach(f => f.classList.remove('selected'));
                field.classList.add('selected');
                document.querySelectorAll('.description-box').forEach(box => box.style.display = 'none');
                const targetDesc = document.getElementById(descId);
                if(targetDesc) targetDesc.style.display = 'block';
            });
        });
        if (headerFields.length > 0) headerFields[0].click();
    }

    function handleCapacityCalculation() {
        if(!document.getElementById('bandwidth')) return;
        const B = parseFloat(document.getElementById('bandwidth').value);
        const V = parseFloat(document.getElementById('signal_levels').value);
        const snrRatio = parseFloat(document.getElementById('snr_ratio').value);
        const resultDiv = document.getElementById('capacity_result');
        if (isNaN(B) || isNaN(V) || isNaN(snrRatio)) {
            resultDiv.innerHTML = "Bitte gültige Zahlen eingeben.";
            return;
        }
        const nyquistCapacity = 2 * B * Math.log2(V);
        const shannonCapacity = B * Math.log2(1 + snrRatio);
        const snrDb = 10 * Math.log10(snrRatio);
        resultDiv.innerHTML = `
            <p class="mb-3 text-gray-400">Hier werden die theoretischen Obergrenzen für die Datenübertragungsrate eines Kanals berechnet.</p>
            <div class="space-y-4">
                <div>
                    <strong class="text-cyan-400">Nyquist-Formel (für rauschfreie Kanäle):</strong>
                    <p class="text-sm text-gray-300 mt-1">Diese Formel gibt die maximale Datenrate an, die ohne Inter-Symbol-Interferenz erreicht werden kann. Sie hängt nur von der Bandbreite und der Anzahl der Signalstufen ab.</p>
                    <p class="mt-2 font-mono">C = 2 * ${B} Hz * log₂( ${V} ) = <strong class="text-white text-lg">${nyquistCapacity.toFixed(2)} bit/s</strong></p>
                </div>
                <div>
                    <strong class="text-cyan-400">Shannon-Hartley-Theorem (für verrauschte Kanäle):</strong>
                    <p class="text-sm text-gray-300 mt-1">Diese Formel gibt die maximale fehlerfreie Datenrate an, die in Anwesenheit von Rauschen möglich ist. Sie ist die absolute Obergrenze für den Kanal.</p>
                    <p class="mt-2 font-mono">C = ${B} Hz * log₂(1 + ${snrRatio}) = <strong class="text-white text-lg">${shannonCapacity.toFixed(2)} bit/s</strong></p>
                </div>
            </div>
            <p class="mt-4 text-sm text-gray-400">Das Signal-Rausch-Verhältnis (SNR) von ${snrRatio} entspricht <strong>${snrDb.toFixed(2)} dB</strong>.</p>`;
    }
    
    function handleCrcCalculation() {
        if(!document.getElementById('crc_data')) return;
        let data = document.getElementById('crc_data').value.replace(/[^01]/g, '');
        let poly = document.getElementById('crc_poly').value.replace(/[^01]/g, '');
        const resultDiv = document.getElementById('crc_result');
        if (data.length === 0 || poly.length === 0 || poly[0] !== '1') {
            resultDiv.innerHTML = 'Ungültige Eingabe. Daten und Polynom müssen binär sein, Polynom muss mit 1 beginnen.';
            return;
        }
        let k = poly.length - 1;
        let dividend = data + '0'.repeat(k);
        let divisor = poly;
        let rem = dividend.substr(0, divisor.length);
        for (let i = 0; i < data.length; i++) {
            if (rem[0] === '1') {
                let temp = '';
                for (let j = 0; j < divisor.length; j++) {
                    temp += rem[j] === divisor[j] ? '0' : '1';
                }
                rem = temp.substring(1) + (dividend[divisor.length + i] || '');
            } else {
                rem = rem.substring(1) + (dividend[divisor.length + i] || '');
            }
        }
        let crc = rem.substring(0, k);
        resultDiv.innerHTML = `
            <p class="mb-3 text-gray-400">CRC ist eine Methode zur <strong class="text-white">Fehlererkennung</strong>. Es wird eine Prüfsumme (der CRC-Code) berechnet und an die Daten angehängt, damit der Empfänger die Integrität der Daten überprüfen kann.</p>
            <p>1. Daten mit ${k} Nullen auffüllen: <span class="font-bold text-white">${data + '0'.repeat(k)}</span></p>
            <p class="mt-2">2. Der Rest der Modulo-2-Division ist der CRC-Code: <strong class="text-white">${crc}</strong></p>
            <p class="mt-2">3. Das zu sendende Codewort ist: Daten + CRC = <strong class="text-white">${data + crc}</strong></p>`;
    }
    
    function handleVlsmCalculation() {
        if(!document.getElementById('vlsm_block')) return;
        const block = document.getElementById('vlsm_block').value;
        const hostsReqStr = document.getElementById('vlsm_hosts').value;
        const resultDiv = document.getElementById('vlsm_result');
        try {
            const [baseIp, prefix] = block.split('/');
            if (!baseIp || !prefix || isNaN(parseInt(prefix))) throw new Error("Ungültiger Adressblock.");
            const hostsReq = hostsReqStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            hostsReq.sort((a, b) => b - a);
            let startIp = ipToLong(baseIp);
            const endIp = startIp + (1 << (32 - parseInt(prefix))) -1;
            let resultHTML = `<p class="mb-3 text-gray-400">VLSM ermöglicht die <strong class="text-white">effiziente Nutzung von IP-Adressen</strong>, indem ein großer Adressblock in Subnetze unterschiedlicher Größe unterteilt wird, die genau auf die Anforderungen der einzelnen Netzsegmente zugeschnitten sind.</p>
                              <h4 class="font-semibold mb-2 text-white">Subnetz-Zuweisung für ${block}:</h4>
                              <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                  <thead>
                                    <tr class="text-left">
                                      <th class="p-2 bg-gray-900/50">Anforderung</th>
                                      <th class="p-2 bg-gray-900/50">Subnetz</th>
                                      <th class="p-2 bg-gray-900/50">Bereich</th>
                                      <th class="p-2 bg-gray-900/50">Broadcast</th>
                                    </tr>
                                  </thead>
                                  <tbody>`;
            for (const hosts of hostsReq) {
                if(startIp > endIp) {
                     resultHTML += `<tr><td colspan="4" class="p-2 text-red-500">Nicht genügend Adressen für ${hosts} Hosts verfügbar.</td></tr>`;
                     continue;
                }
                const hostBits = Math.ceil(Math.log2(hosts + 2));
                const subnetPrefix = 32 - hostBits;
                const subnetSize = 1 << hostBits;
                startIp = Math.ceil(startIp / subnetSize) * subnetSize;
                if (startIp + subnetSize - 1 > endIp) {
                    resultHTML += `<tr><td colspan="4" class="p-2 text-red-500">Nicht genügend Adressen für ${hosts} Hosts im Block.</td></tr>`;
                    continue;
                }
                const networkAddr = longToIp(startIp);
                const firstHost = longToIp(startIp + 1);
                const lastHost = longToIp(startIp + subnetSize - 2);
                const broadcastAddr = longToIp(startIp + subnetSize - 1);
                resultHTML += `<tr class="border-t border-gray-700">
                    <td class="p-2">${hosts} Hosts</td>
                    <td class="p-2 font-mono">${networkAddr}/${subnetPrefix}</td>
                    <td class="p-2 font-mono">${firstHost} - ${lastHost}</td>
                    <td class="p-2 font-mono">${broadcastAddr}</td>
                </tr>`;
                startIp += subnetSize;
            }
            resultHTML += '</tbody></table></div>';
            resultDiv.innerHTML = resultHTML;
        } catch (e) {
            resultDiv.innerHTML = `<p class="text-red-500">Fehler: ${e.message}</p>`;
        }
    }

    function ipToLong(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
    }

    function longToIp(long) {
        return [(long >>> 24) & 255, (long >>> 16) & 255, (long >>> 8) & 255, long & 255].join('.');
    }

    function displayProcess(processId) {
        const data = processData[processId];
        if (!data || !processDisplay) return;
        currentProcess = { id: processId, step: 0 };
        let html = `<h3 class="text-xl font-semibold mb-4 text-center text-white">${data.title}</h3>`;
        html += `<div id="process-diagram-container" class="my-6 min-h-[80px]"></div>`;
        html += `<div id="process-desc-container" class="p-4 bg-gray-900/70 rounded-lg min-h-[100px]"></div>`;
        html += `<div class="mt-4 text-center">
                    <button id="process-prev" class="px-5 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-500 transition-all duration-300">‹ Zurück</button>
                    <button id="process-next" class="ml-2 px-5 py-2 bg-cyan-700 text-white rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-300">Nächster Schritt ›</button>
                 </div>`;
        processDisplay.innerHTML = html;
        updateProcessStep();
        document.getElementById('process-next').addEventListener('click', () => {
            if (currentProcess.step < processData[currentProcess.id].steps.length - 1) {
                currentProcess.step++;
                updateProcessStep();
            }
        });
        document.getElementById('process-prev').addEventListener('click', () => {
            if (currentProcess.step > 0) {
                currentProcess.step--;
                updateProcessStep();
            }
        });
    }

    function updateProcessStep() {
        const data = processData[currentProcess.id];
        const stepData = data.steps[currentProcess.step];
        document.getElementById('process-diagram-container').innerHTML = stepData.diagram;
        document.getElementById('process-desc-container').innerHTML = stepData.desc;
        const prevBtn = document.getElementById('process-prev');
        const nextBtn = document.getElementById('process-next');
        if (prevBtn) prevBtn.style.display = (currentProcess.step === 0) ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = (currentProcess.step === data.steps.length - 1) ? 'none' : 'inline-block';
    }

    function displayAppProcess(processId) {
        const data = appProcessData[processId];
        if (!data || !appProcessDisplay) return;
        currentAppProcess = { id: processId, step: 0 };
        let html = `<h3 class="text-xl font-semibold mb-4 text-center text-white">${data.title}</h3>`;
        html += `<div id="app-process-diagram-container" class="my-6 min-h-[80px]"></div>`;
        html += `<div id="app-process-desc-container" class="p-4 bg-gray-900/70 rounded-lg min-h-[100px]"></div>`;
        html += `<div class="mt-4 text-center">
                    <button id="app-process-prev" class="px-5 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-500 transition-all duration-300">‹ Zurück</button>
                    <button id="app-process-next" class="ml-2 px-5 py-2 bg-cyan-700 text-white rounded-lg shadow-lg hover:bg-cyan-600 transition-all duration-300">Nächster Schritt ›</button>
                 </div>`;
        appProcessDisplay.innerHTML = html;
        updateAppProcessStep();
        document.getElementById('app-process-next').addEventListener('click', () => {
            if (currentAppProcess.step < appProcessData[currentAppProcess.id].steps.length - 1) {
                currentAppProcess.step++;
                updateAppProcessStep();
            }
        });
        document.getElementById('app-process-prev').addEventListener('click', () => {
            if (currentAppProcess.step > 0) {
                currentAppProcess.step--;
                updateAppProcessStep();
            }
        });
    }

    function updateAppProcessStep() {
        const data = appProcessData[currentAppProcess.id];
        const stepData = data.steps[currentAppProcess.step];
        document.getElementById('app-process-diagram-container').innerHTML = stepData.diagram;
        document.getElementById('app-process-desc-container').innerHTML = stepData.desc;
        const prevBtn = document.getElementById('app-process-prev');
        const nextBtn = document.getElementById('app-process-next');
        if (prevBtn) prevBtn.style.display = (currentAppProcess.step === 0) ? 'none' : 'inline-block';
        if (nextBtn) nextBtn.style.display = (currentAppProcess.step === data.steps.length - 1) ? 'none' : 'inline-block';
    }

    function setupCongestionChart() {
        if(!document.getElementById('congestionChart')) return;
        const ctx = document.getElementById('congestionChart').getContext('2d');
        const chartData = {
            labels: [],
            datasets: [{
                label: 'TCP Tahoe cwnd',
                data: [],
                borderColor: '#f472b6',
                tension: 0.2,
            }, {
                label: 'TCP Reno cwnd',
                data: [],
                borderColor: '#34d399',
                tension: 0.2,
            }, {
                label: 'ssthresh',
                data: [],
                borderColor: '#fbbf24',
                borderDash: [5, 5],
                fill: false,
            }]
        };
        congestionChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Congestion Window (cwnd)', color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } },
                    x: { title: { display: true, text: 'Übertragungsrunde (RTT)', color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#9ca3af' } }
                },
                plugins: { legend: { labels: { color: '#e5e7eb' } } }
            }
        });
        resetCongestionChart();
    }
    
    function resetCongestionChart() {
        if(!congestionChart) return;
        clearInterval(chartInterval);
        if(simulateLossBtn) simulateLossBtn.disabled = false;
        let tahoe_cwnd = 1, reno_cwnd = 1, ssthresh = 64, round = 0;
        let tahoe_state = 'slow_start', reno_state = 'slow_start';
        congestionChart.data.labels = [];
        congestionChart.data.datasets[0].data = [];
        congestionChart.data.datasets[1].data = [];
        congestionChart.data.datasets[2].data = [];
        function runStep() {
            if(round > 20) { clearInterval(chartInterval); return; }
            congestionChart.data.labels.push(round);
            congestionChart.data.datasets[0].data.push(tahoe_cwnd);
            congestionChart.data.datasets[1].data.push(reno_cwnd);
            congestionChart.data.datasets[2].data.push(ssthresh);
            if (tahoe_state === 'slow_start') { tahoe_cwnd *= 2; if (tahoe_cwnd >= ssthresh) tahoe_state = 'congestion_avoidance'; } else { tahoe_cwnd += 1; }
            if (reno_state === 'slow_start') { reno_cwnd *= 2; if (reno_cwnd >= ssthresh) reno_state = 'congestion_avoidance'; } else { reno_cwnd += 1; }
            congestionChart.update();
            round++;
        }
        chartInterval = setInterval(runStep, 300);
    }
    
    function simulatePacketLoss() {
        if(!congestionChart) return;
        clearInterval(chartInterval);
        let round = congestionChart.data.labels.length;
        let tahoe_cwnd = congestionChart.data.datasets[0].data[round-1];
        let reno_cwnd = congestionChart.data.datasets[1].data[round-1];
        let ssthresh = Math.max(Math.floor(reno_cwnd / 2), 2);
        let tahoe_new_ssthresh = Math.max(Math.floor(tahoe_cwnd / 2), 2);
        tahoe_cwnd = 1;
        reno_cwnd = ssthresh;
        let tahoe_state = 'slow_start';
        function runStep() {
            if(round > 30) { clearInterval(chartInterval); return; }
            congestionChart.data.labels.push(round);
            congestionChart.data.datasets[0].data.push(tahoe_cwnd);
            congestionChart.data.datasets[1].data.push(reno_cwnd);
            congestionChart.data.datasets[2].data.push(ssthresh);
            if (tahoe_state === 'slow_start') { tahoe_cwnd *= 2; if (tahoe_cwnd >= tahoe_new_ssthresh) tahoe_state = 'congestion_avoidance'; } else { tahoe_cwnd += 1; }
            reno_cwnd += 1;
            congestionChart.update();
            round++;
        }
        chartInterval = setInterval(runStep, 300);
        if(simulateLossBtn) simulateLossBtn.disabled = true;
    }

    function setupEncodingChart() {
        if(!document.getElementById('encodingChart')) return;
        const ctx = document.getElementById('encodingChart').getContext('2d');
        encodingChart = new Chart(ctx, {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { min: -1.5, max: 1.5, ticks: { stepSize: 0.5, color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } }
                },
                plugins: { legend: { labels: { color: '#e5e7eb' } } },
                animation: { duration: 0 }
            }
        });
        updateEncodingChart();
    }

    function updateEncodingChart() {
        if(!encodingChart) return;
        const bitString = document.getElementById('encoding-input').value.replace(/[^01]/g, '');
        const bits = bitString.split('').map(Number);
        const labels = [];
        const nrzData = [], manchesterData = [];
        let lastNRZ = 1;
        
        for (let i = 0; i < bits.length; i++) {
            labels.push(`Bit ${i}`);
            // NRZ-I (Invert on 1)
            if (bits[i] === 1) lastNRZ *= -1;
            nrzData.push({x: i, y: lastNRZ}, {x: i + 0.99, y: lastNRZ});
            
            // Manchester
            if (bits[i] === 0) {
                manchesterData.push({x: i, y: 1}, {x: i + 0.5, y: 1}, {x: i + 0.5, y: -1}, {x: i + 0.99, y: -1});
            } else {
                manchesterData.push({x: i, y: -1}, {x: i + 0.5, y: -1}, {x: i + 0.5, y: 1}, {x: i + 0.99, y: 1});
            }
        }
        
        encodingChart.data.labels = labels;
        encodingChart.data.datasets = [
            { label: 'NRZ-I', data: nrzData, borderColor: '#f472b6', fill: false, steppped: true },
            { label: 'Manchester', data: manchesterData, borderColor: '#34d399', fill: false, steppped: true }
        ];
        encodingChart.update();
    }
    
    function setupVlanSwitch() {
        const switchContainer = document.getElementById('vlan-switch');
        if (!switchContainer) return;
        let portsHTML = '';
        for (let i = 1; i <= 8; i++) {
            portsHTML += `<div class="vlan-port p-2 border-2 border-gray-500 rounded-md text-center cursor-pointer transition-all" data-port-id="${i}" data-vlan="1">
                            <span class="font-bold">Port ${i}</span>
                            <span class="block text-xs text-gray-400">VLAN 1</span>
                         </div>`;
        }
        switchContainer.innerHTML = portsHTML;
        
        let selectedVlan = 10;
        const assignBtns = document.querySelectorAll('.vlan-assign-btn');
        assignBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedVlan = parseInt(btn.dataset.vlan);
                assignBtns.forEach(b => b.classList.remove('ring-2', 'ring-white'));
                btn.classList.add('ring-2', 'ring-white');
            });
        });
        
        switchContainer.addEventListener('click', e => {
            const port = e.target.closest('.vlan-port');
            if (port) {
                port.dataset.vlan = selectedVlan;
                port.querySelector('.text-xs').textContent = `VLAN ${selectedVlan}`;
                port.className = `vlan-port p-2 border-2 rounded-md text-center cursor-pointer transition-all bg-${getVlanColor(selectedVlan)}-600 border-${getVlanColor(selectedVlan)}-500`;
            }
        });
    }

    function getVlanColor(vlan) {
        switch(vlan) {
            case 10: return 'red';
            case 20: return 'green';
            case 30: return 'blue';
            default: return 'gray';
        }
    }
    
    function setupRoutingTable() {
        const container = document.getElementById('routing-table-container');
        if (!container) return;
        const routes = [
            { dest: '192.168.1.0', mask: '255.255.255.0', nextHop: 'On-link', iface: 'eth0' },
            { dest: '192.168.0.0', mask: '255.255.0.0', nextHop: '192.168.1.1', iface: 'eth0' },
            { dest: '10.0.0.0', mask: '255.0.0.0', nextHop: '192.168.1.254', iface: 'eth0' },
            { dest: '0.0.0.0', mask: '0.0.0.0', nextHop: '192.168.1.1', iface: 'eth0' }
        ];
        let tableHTML = `<table class="w-full text-left text-sm routing-table">
                            <thead><tr class="text-gray-300">
                                <th class="p-2">Ziel</th><th class="p-2">Maske</th><th class="p-2">Next Hop</th><th class="p-2">Interface</th>
                            </tr></thead><tbody>`;
        routes.forEach(route => {
            tableHTML += `<tr class="border-t border-gray-700">
                            <td class="p-2 font-mono">${route.dest}</td>
                            <td class="p-2 font-mono">${route.mask}</td>
                            <td class="p-2 font-mono">${route.nextHop}</td>
                            <td class="p-2 font-mono">${route.iface}</td>
                         </tr>`;
        });
        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    }

    function simulateRouting() {
        const destIpStr = document.getElementById('routing-dest-ip').value;
        if (!destIpStr) return;
        const destIpLong = ipToLong(destIpStr);
        const table = document.querySelector('.routing-table');
        const rows = table.querySelectorAll('tbody tr');
        
        let bestMatch = null;
        let bestMatchPrefix = -1;

        rows.forEach(row => {
            row.classList.remove('highlight');
            const cells = row.querySelectorAll('td');
            const routeDestLong = ipToLong(cells[0].textContent);
            const routeMaskLong = ipToLong(cells[1].textContent);
            
            const prefix = (routeMaskLong.toString(2).match(/1/g) || []).length;

            if ((destIpLong & routeMaskLong) === (routeDestLong & routeMaskLong)) {
                if (prefix > bestMatchPrefix) {
                    bestMatchPrefix = prefix;
                    bestMatch = row;
                }
            }
        });

    if (bestMatch) {
        bestMatch.classList.add('highlight');
    }
}

setupCcn();
})();


