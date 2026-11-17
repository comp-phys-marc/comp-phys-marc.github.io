const root = document.getElementById('site'); root.querySelector('#research').after(root.querySelector('#websites'), root.querySelector('#apps')); root.querySelector('#experience').before(root.querySelector('#education'), root.querySelector('#grants-awards')); root.querySelector('#atoms').innerHTML = Array.from({length: 6}, (_, i) => `<div class="atom a${i + 1}"><i class="nucleus"></i><i class="orbit o1"><b class="electron"></b></i><i class="orbit o2"><b class="electron"></b></i><i class="orbit o3"><b class="electron"></b></i></div>`).join('');
        const tetraCanvas = root.querySelector('.tetrahedra-3d');
        const tetraMobileLayout = tetraCanvas.clientWidth < 600;
        if (tetraMobileLayout) {
            tetraCanvas.width = 760;
            tetraCanvas.height = 1500;
        }
        const tetraContext = tetraCanvas.getContext('2d');
        const tetraReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const tetraVertices = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
        const tetraEdges = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
        const tetraInteriorPoint = [-.25, -.25, -.25];
        const tetrahedra = tetraMobileLayout
            ? [
                {centerX: 380, centerY: 550, labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'], interiorLabel: 'ψr', duration: 24000, phase: 0},
                {centerX: 380, centerY: 950, labels: ['i|00⟩', 'i|01⟩', 'i|10⟩', 'i|11⟩'], interiorLabel: 'ψi', duration: 31000, phase: -.32}
            ]
            : [
                {centerX: 400, centerY: 310, labels: ['|00⟩', '|01⟩', '|10⟩', '|11⟩'], interiorLabel: 'ψr', duration: 24000, phase: 0},
                {centerX: 1200, centerY: 310, labels: ['i|00⟩', 'i|01⟩', 'i|10⟩', 'i|11⟩'], interiorLabel: 'ψi', duration: 31000, phase: -.32}
            ];
        const drawTetrahedron = (tetra, time) => {
            const progress = tetraReducedMotion ? 0 : time / tetra.duration * Math.PI * 2;
            const angleX = Math.sin(progress * 1.7 + tetra.phase) * .48 + .2;
            const angleY = progress + tetra.phase;
            const angleZ = Math.sin(progress * .8 + tetra.phase) * .22;
            const cosX = Math.cos(angleX), sinX = Math.sin(angleX);
            const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
            const cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);
            const projectPoint = ([x, y, z]) => {
                const xz = x * cosZ - y * sinZ;
                const yz = x * sinZ + y * cosZ;
                const yx = yz * cosX - z * sinX;
                const zx = yz * sinX + z * cosX;
                const depth = -xz * sinY + zx * cosY;
                const rotatedX = xz * cosY + zx * sinY;
                const scale = 350 / (3.8 - depth * .34);
                return {x: tetra.centerX + rotatedX * scale, y: tetra.centerY + yx * scale, depth};
            };
            const projected = tetraVertices.map(projectPoint);
            tetraEdges
                .map(([a, b]) => ({a: projected[a], b: projected[b], depth: (projected[a].depth + projected[b].depth) / 2}))
                .sort((a, b) => a.depth - b.depth)
                .forEach(({a, b, depth}) => {
                    tetraContext.strokeStyle = '#fff';
                    tetraContext.beginPath();
                    tetraContext.setLineDash(depth < 0 ? [6, 7] : []);
                    tetraContext.globalAlpha = depth < 0 ? .42 : .95;
                    tetraContext.lineWidth = depth < 0 ? 1.8 : 2.4;
                    tetraContext.moveTo(a.x, a.y);
                    tetraContext.lineTo(b.x, b.y);
                    tetraContext.stroke();
                });
            projected.forEach((point, index) => {
                tetraContext.setLineDash([]);
                tetraContext.globalAlpha = 1;
                tetraContext.strokeStyle = '#fff';
                tetraContext.beginPath();
                tetraContext.arc(point.x, point.y, 5, 0, Math.PI * 2);
                tetraContext.fill();
                tetraContext.stroke();
                const centerDx = point.x - tetra.centerX;
                const centerDy = point.y - tetra.centerY;
                const length = Math.hypot(centerDx, centerDy) || 1;
                tetraContext.textAlign = centerDx > 22 ? 'left' : centerDx < -22 ? 'right' : 'center';
                tetraContext.textBaseline = centerDy > 50 ? 'top' : centerDy < -50 ? 'bottom' : 'middle';
                tetraContext.lineWidth = 7;
                tetraContext.lineJoin = 'round';
                tetraContext.strokeStyle = '#000';
                tetraContext.strokeText(tetra.labels[index], point.x + centerDx / length * 24, point.y + centerDy / length * 24);
                tetraContext.fillStyle = '#fff';
                tetraContext.fillText(tetra.labels[index], point.x + centerDx / length * 24, point.y + centerDy / length * 24);
            });
            const interior = projectPoint(tetraInteriorPoint);
            tetraContext.fillStyle = '#fff';
            tetraContext.strokeStyle = '#fff';
            tetraContext.beginPath();
            tetraContext.arc(interior.x, interior.y, 6, 0, Math.PI * 2);
            tetraContext.fill();
            tetraContext.stroke();
            tetraContext.fillStyle = '#fff';
            tetraContext.textAlign = 'right';
            tetraContext.textBaseline = 'middle';
            tetraContext.strokeStyle = '#000';
            tetraContext.strokeText(tetra.interiorLabel, interior.x - 14, interior.y - 23);
            tetraContext.fillText(tetra.interiorLabel, interior.x - 14, interior.y - 23);
        };
        const drawTetrahedra = time => {
            tetraContext.clearRect(0, 0, tetraCanvas.width, tetraCanvas.height);
            tetraContext.strokeStyle = '#fff';
            tetraContext.fillStyle = '#fff';
            const labelScale = tetraCanvas.width / tetraCanvas.clientWidth;
            const labelSize = Math.max(12, Math.min(16, 16 * tetraCanvas.clientWidth / 900));
            tetraContext.font = `${Math.round(labelSize * labelScale)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
            tetrahedra.forEach(tetra => drawTetrahedron(tetra, time));
            const waveformY = tetraMobileLayout ? 1325 : 700;
            const waveformStart = tetraMobileLayout ? 70 : 150;
            const waveformEnd = tetraCanvas.width - waveformStart;
            const waveformAmplitude = tetraMobileLayout ? 48 : 58;
            const phase = tetraReducedMotion ? 0 : time * .002;
            const wavelength = 180;
            tetraContext.save();
            tetraContext.strokeStyle = '#fff';
            tetraContext.globalAlpha = .42;
            tetraContext.lineWidth = 1.5;
            tetraContext.setLineDash([8, 10]);
            tetraContext.beginPath();
            tetraContext.moveTo(waveformStart, waveformY);
            tetraContext.lineTo(waveformEnd, waveformY);
            tetraContext.stroke();
            tetraContext.globalAlpha = .95;
            tetraContext.lineWidth = 3;
            tetraContext.setLineDash([]);
            tetraContext.beginPath();
            for (let x = waveformStart; x <= waveformEnd; x += 2) {
                const wavePhase = (x - waveformStart) * Math.PI * 2 / wavelength - phase;
                const y = waveformY - Math.sin(wavePhase) * waveformAmplitude;
                if (x === waveformStart) tetraContext.moveTo(x, y);
                else tetraContext.lineTo(x, y);
            }
            tetraContext.stroke();
            tetraContext.restore();
        };
        const animateTetrahedra = time => {
            drawTetrahedra(time);
            if (!tetraReducedMotion) requestAnimationFrame(animateTetrahedra);
        };
        animateTetrahedra(0);
        const pongCanvas = root.querySelector('.pong-court');
        const pongContext = pongCanvas.getContext('2d');
        const pongReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const pongCourt = {left: 140, right: 1460, top: 100, bottom: 800};
        const pong = {
            ballX: 800,
            ballY: 450,
            ballVX: 440,
            ballVY: 210,
            leftY: 450,
            rightY: 450,
            leftScore: 0,
            rightScore: 0
        };
        let pongPreviousTime = 0;
        const drawPong = time => {
            const delta = Math.min((time - pongPreviousTime) / 1000, .04);
            pongPreviousTime = time;
            if (!pongReducedMotion && delta > 0) {
                const paddleHeight = 150;
                const trackPaddle = (y, direction) => {
                    if (direction * pong.ballVX <= 0) return y;
                    const difference = pong.ballY - y;
                    return y + Math.sign(difference) * Math.min(Math.abs(difference), 360 * delta);
                };
                pong.leftY = trackPaddle(pong.leftY, -1);
                pong.rightY = trackPaddle(pong.rightY, 1);
                pong.ballX += pong.ballVX * delta;
                pong.ballY += pong.ballVY * delta;
                if (pong.ballY < pongCourt.top + 10 || pong.ballY > pongCourt.bottom - 10) {
                    pong.ballVY *= -1;
                    pong.ballY = Math.max(pongCourt.top + 10, Math.min(pongCourt.bottom - 10, pong.ballY));
                }
                if (pong.ballVX < 0 && pong.ballX - 10 <= 230 && pong.ballX > 210 &&
                    Math.abs(pong.ballY - pong.leftY) < paddleHeight / 2 + 10) {
                    pong.ballVX = Math.abs(pong.ballVX);
                    pong.ballVY += (pong.ballY - pong.leftY) * 1.1;
                } else if (pong.ballVX > 0 && pong.ballX + 10 >= 1370 && pong.ballX < 1390 &&
                    Math.abs(pong.ballY - pong.rightY) < paddleHeight / 2 + 10) {
                    pong.ballVX = -Math.abs(pong.ballVX);
                    pong.ballVY += (pong.ballY - pong.rightY) * 1.1;
                }
                pong.ballVY = Math.max(-560, Math.min(560, pong.ballVY));
                if (pong.ballX < pongCourt.left) {
                    pong.rightScore++;
                    pong.ballX = 800;
                    pong.ballY = 450;
                    pong.ballVX = 440;
                    pong.ballVY = 210;
                } else if (pong.ballX > pongCourt.right) {
                    pong.leftScore++;
                    pong.ballX = 800;
                    pong.ballY = 450;
                    pong.ballVX = -440;
                    pong.ballVY = -210;
                }
            }
            pongContext.clearRect(0, 0, pongCanvas.width, pongCanvas.height);
            pongContext.fillStyle = '#fff';
            pongContext.strokeStyle = 'rgba(255,255,255,.55)';
            pongContext.lineWidth = 2;
            pongContext.setLineDash([12, 18]);
            pongContext.beginPath();
            pongContext.moveTo(800, pongCourt.top);
            pongContext.lineTo(800, pongCourt.bottom);
            pongContext.stroke();
            pongContext.setLineDash([]);
            pongContext.strokeRect(pongCourt.left, pongCourt.top, pongCourt.right - pongCourt.left, pongCourt.bottom - pongCourt.top);
            pongContext.font = '700 84px ui-monospace, SFMono-Regular, Menlo, monospace';
            pongContext.textAlign = 'center';
            pongContext.textBaseline = 'middle';
            pongContext.globalAlpha = .72;
            pongContext.fillText(String(pong.leftScore).padStart(2, '0'), 600, 220);
            pongContext.fillText(String(pong.rightScore).padStart(2, '0'), 1000, 220);
            pongContext.globalAlpha = 1;
            pongContext.fillRect(220, pong.leftY - 75, 16, 150);
            pongContext.fillRect(1364, pong.rightY - 75, 16, 150);
            pongContext.fillRect(pong.ballX - 10, pong.ballY - 10, 20, 20);
            if (!pongReducedMotion) requestAnimationFrame(drawPong);
        };
        drawPong(0);
        root.querySelectorAll('.robot-carousel').forEach(carousel => {
            const slides = [...carousel.querySelectorAll('.robot-slide')];
            const controls = carousel.querySelector('.robot-carousel-controls');
            const dots = carousel.querySelector('.robot-carousel-dots');
            let current = 0;
            slides.forEach((slide, i) => {
                slide.setAttribute('role', 'group');
                slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
            });
            if (slides.length < 2) {
                controls.hidden = true;
            } else {
                dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Show item ${i + 1} of ${slides.length}" aria-current="${i === 0}"></button>`).join('');
            }
            const dotButtons = [...dots.querySelectorAll('button')];
            const showSlide = index => {
                current = (index + slides.length) % slides.length;
                slides.forEach((slide, i) => {
                    slide.hidden = i !== current;
                    if (i !== current) {
                        slide.querySelector('iframe')?.remove();
                        slide.querySelector('.robot-playback-note')?.remove();
                        const play = slide.querySelector('.robot-play');
                        if (play) play.hidden = false;
                    }
                });
                dotButtons.forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
            };
            carousel.querySelector('.robot-prev').addEventListener('click', () => showSlide(current - 1));
            carousel.querySelector('.robot-next').addEventListener('click', () => showSlide(current + 1));
            dotButtons.forEach((button, i) => button.addEventListener('click', () => showSlide(i)));
            carousel.querySelectorAll('.robot-play').forEach(button => button.addEventListener('click', () => {
                const slide = button.closest('.robot-slide');
                if (window.location.protocol === 'file:') {
                    const note = document.createElement('div');
                    const message = document.createElement('p');
                    const link = document.createElement('a');
                    note.className = 'robot-playback-note';
                    note.setAttribute('role', 'status');
                    message.textContent = 'YouTube blocks embedded playback when this page is opened directly as a file. Open the page through a local web server to play videos here.';
                    link.href = `https://www.youtube.com/watch?v=${slide.dataset.video}`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = 'Watch on YouTube';
                    note.append(message, link);
                    slide.append(note);
                    button.hidden = true;
                    return;
                }
                const frame = document.createElement('iframe');
                frame.src = `https://www.youtube.com/embed/${slide.dataset.video}?autoplay=1&rel=0`;
                frame.title = button.getAttribute('aria-label').replace(/^Play video:\s*/, '');
                frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                frame.allowFullscreen = true;
                frame.referrerPolicy = 'strict-origin-when-cross-origin';
                frame.loading = 'eager';
                slide.append(frame);
                button.hidden = true;
            }));
        });
        const P = [
            ['PennyLane / Software', 'OpenQASM 3.0 Interpreter', 'Loads and executes OpenQASM 3.0 programs in PennyLane.'],
            ['Semiconductors / Hardware', 'Spin-Qubit Quantum Processors', 'Design and fabrication of more than twenty quantum-dot devices.'],
            ['TypeScript / Tooling', 'Q# TypeScript', 'An implementation of Q# for TypeScript environments.'],
            ['QHack / Research', 'Efficient Quantum State Tomography', 'First-place implementation combining MPS approximation and tomography.'],
            ['Machine learning / QASM', 'Quantum Circuit Classifier', 'Classifies circuit images and returns their QASM representation.'],
            ['Nanoelectronic hardware / Materials', 'Heterostructure Field Effect Transistor Hallbars', 'Hallbar devices measure material properties used to evaluate substrates for quantum-device fabrication.'],
            ['Open hardware / RF', 'Quantum Device Carrier PCB', 'Four-layer carrier board with 48 DC and eight RF lines.'],
            ['Labber / Experimental physics', 'Labber Experimental Physics Wrapper', 'Open-source Labber utilities and experimental procedures, with each experiment packaged as an importable function.'],
            ['Xanadu / Quantum algorithms', 'Canadian Quantum Cup', 'Solutions to the Xanadu Canadian Quantum Cup challenges that placed in the top three among participating Canadian universities.'],
            ['Simulation / Research', 'Distributed Quantum Emulator', 'A software framework presented with the hybrid methodology for solving quantum problems and used for experimental components of a master’s thesis.'],
            ['Xanadu / Strawberry Fields', 'Continuous-Variable Quantum Circuit Drawer', 'A Strawberry Fields module that converts continuous-variable experiments into representative quantum-circuit diagrams in LaTeX.'],
            ['Open source / NLP', 'Language Processing Tools', 'Utilities for downloading and preprocessing files, managing NLP models, and comparing file contents across a workflow.'],
            ['Rust / Quantum computing', 'Quantum Rust', 'A simple Rust-based simulator of pure-state quantum computation.'],
            ['TypeScript / Continuous variables', 'Blackbird TypeScript', 'A TypeScript implementation of Blackbird, the low-level programming language for continuous-variable quantum computing.'],
            ['TypeScript / OpenQASM', 'OpenQASM TypeScript', 'A TypeScript implementation of QASM, the low-level language for quantum-circuit specification.'],
            ['TypeScript / Quantum annealing', 'QMASM TypeScript', 'A TypeScript implementation of QMASM, the macro assembler for D-Wave’s quantum annealer.']
        ];
        const projectLinks = {
            'OpenQASM 3.0 Interpreter': [{label: 'Code', href: 'https://github.com/PennyLaneAI/pennylane/blob/master/pennylane/io/qasm_interpreter.py'}],
            'Spin-Qubit Quantum Processors': [{label: 'APS presentation', href: 'https://meetings-archive.aps.org/smt/2026/mar-g19/7/'}],
            'Q# TypeScript': [
                {label: 'NPM', href: 'https://www.npmjs.com/package/q-sharp-ts'},
                {label: 'GitHub', href: 'https://github.com/comp-phys-marc/q-sharp-ts'}
            ],
            'Efficient Quantum State Tomography': [{label: 'Code', href: 'https://github.com/comp-phys-marc/QHack2024IRL'}],
            'Quantum Circuit Classifier': [{label: 'Code', href: 'https://github.com/comp-phys-marc/circuit-parsers'}],
            'Heterostructure Field Effect Transistor Hallbars': [{label: 'Microscope images', href: 'https://marcusedwards.me/files/hall1.jpg'}],
            'Quantum Device Carrier PCB': [{label: 'Design files', href: 'https://github.com/Quantum-Science-and-Technology-Lab/carrier_PCB'}],
            'Labber Experimental Physics Wrapper': [{label: 'Code', href: 'https://github.com/Quantum-Science-and-Technology-Lab/labber-wrapper'}],
            'Canadian Quantum Cup': [{label: 'Code', href: 'https://github.com/comp-phys-marc/canadian-quantum-cup'}],
            'Distributed Quantum Emulator': [
                {label: 'Code', href: 'https://github.com/comp-phys-marc/distributed-emulator'},
                {label: 'Poster', href: 'https://www.researchgate.net/publication/355362093_Developing_a_Hybrid_Methodology_for_Solving_Quantum_Problems'}
            ],
            'Continuous-Variable Quantum Circuit Drawer': [
                {label: 'Code', href: 'https://github.com/XanaduAI/strawberryfields/releases/tag/v0.10.0'},
                {label: 'Documentation', href: 'https://strawberryfields.readthedocs.io/en/stable/code/sf_circuitdrawer.html'}
            ],
            'Language Processing Tools': [{label: 'Code', href: 'https://github.com/comp-phys-marc/language-processing-tools'}],
            'Quantum Rust': [{label: 'Code', href: 'https://github.com/comp-phys-marc/quantum-rs'}],
            'Blackbird TypeScript': [
                {label: 'NPM', href: 'https://www.npmjs.com/package/blackbird-ts'},
                {label: 'GitHub', href: 'https://github.com/comp-phys-marc/blackbird-ts'}
            ],
            'OpenQASM TypeScript': [
                {label: 'NPM', href: 'https://www.npmjs.com/package/qasm-ts'},
                {label: 'GitHub', href: 'https://github.com/comp-phys-marc/qasm-ts'}
            ],
            'QMASM TypeScript': [
                {label: 'NPM', href: 'https://www.npmjs.com/package/qmasm-ts'},
                {label: 'GitHub', href: 'https://github.com/comp-phys-marc/qmasm-ts'}
            ]
        };
        const R = [['2026', 'conference', 'APS Global Physics Summit', 'Electronic devices in nuclear-spin-free germanium heterostructures', 'Reports gated Hall-bar magnetotransport, effective masses, scattering times and preliminary quantum-dot characterization in purified germanium.'], ['2026', 'conference', 'Microscopy Society of Canada', 'Three-dimensional imaging of isotopic distribution', 'Uses nanometre-scale isotope mapping to evaluate purified precursors, epitaxial growth and spin-qubit device fabrication.'], ['2026', 'publication', 'Advanced Science', 'Nuclear spin-free germanium quantum-well heterostructures', 'Demonstrates highly purified device-grade heterostructures with strong gate control and high hole mobility.'], ['2025', 'conference', 'IEEE CSYP', 'Optimized quantum compilation and execution pipeline', 'Introduces a web-compatible intermediate representation, TypeScript compiler frontends and a hybrid analog-digital execution architecture.'], ['2025', 'publication', 'Springer Nature', 'An Introduction to Quantum Computing for Computer Engineers', 'Connects foundational quantum concepts with the engineering layers needed to build and operate quantum computers.'], ['2025', 'conference', 'ICSI / ISTDM', 'Isotopically pure germanium heterostructures', 'Presents purified germanium quantum wells on industrial SiGe-buffered wafers for electron and hole quantum devices.'], ['2025', 'publication', 'IEEE QCE', 'Productive Quantum Programming Needs Better Abstract Machines', 'Defines universality, compactness, expressiveness and composability criteria for quantum abstract machines.'], ['2025', 'publication', 'arXiv', 'Compiling a Q# subset to QASM 3.0', 'Implements a TypeScript lexer, parser, intermediate representation and browser-compatible compiler.'], ['2025', 'publication', 'JOSS', 'QASM-TS 2.0', 'Provides a tested OpenQASM 3 parser for compilers, verification and formal reasoning about hybrid programs.'], ['2024', 'academic', 'Term paper', 'Deep-learning methods for Pauli errors', 'Learns Pauli error rates and reconstructs density and process matrices using graph-Laplacian state evolution.'], ['2024', 'conference', 'Spin-Qubit Workshop', 'Multi Quantum Dot Fabrication and Packaging', 'Describes the complete device design, fabrication and packaging workflow for multi-quantum-dot systems.'], ['2024', 'publication', 'IEEE QCE', 'Readout-aware layout synthesis', 'Adds double-dot readout constraints and a readout-depth metric to SMT-based spin-qubit layout synthesis.'], ['2023', 'publication', 'arXiv', 'Three quantum-programming-language parsers', 'Implements TypeScript parsers for QASM, QMASM and Blackbird for browser and mobile environments.'], ['2023', 'article', 'Medium', 'Machine learning, quantum ML and consciousness', 'Examines incomplete information and uncertainty in classical probability, artificial intelligence and quantum information.'], ['2023', 'publication', 'arXiv', 'Hybrid digital/analog quantum-physics emulator', 'Proposes an open-hardware oscillator encoding for superposition and entanglement with practical estimates near 20 qubits.'], ['2023', 'publication', 'arXiv', 'Quantum Honest Byzantine Agreement', 'Interprets agreement as consensus through coincidence and proposes feedback and quantum-neuron mechanisms.'], ['2021', 'patent', 'US Patent', 'AI-based financial recommendation assistant', 'Connects interface and transaction-optimization AI models so both can exchange feedback and update recommendations.'], ['2021', 'article', 'QuBytes Digest', 'Variational Quantum Anomaly Detection review', 'Reviews a variational method for identifying quantum phase diagrams without prior device knowledge.'], ['2021', 'patent', 'US Patent', 'Savings plan for specific purchases', 'Schedules transfers toward a purchase goal and initiates the purchase once sufficient funds accumulate.'], ['2021', 'patent', 'US Patent', 'Increasing security when using smartcards', 'Verifies a stored actuation sequence before authorizing payment and completing a transaction.'], ['2020', 'academic', 'Master’s thesis', 'Towards Practical Hybrid Quantum / Classical Computing', 'Examines hybrid schemes as theoretical quantum protocols move into practical experimental systems.'], ['2020', 'publication', 'Springer QIP', 'Quantum and hybrid blockchain protocols', 'Reviews quantum threats to blockchain and quantum-enabled cryptocurrency, consensus and hybrid mechanisms.'], ['2020', 'article', 'Medium', 'Cloud-microservices execution environment', 'Describes an interoperable microservices environment for comparing quantum-simulation backends.'], ['2019', 'conference', 'University of Waterloo 3MT', 'Practical Quantum Algorithms', 'Presents quantum-physics-inspired problem solving at the intersection of artificial intelligence and quantum computing.'], ['2019', 'conference', 'Cybersecurity Research Lab', 'Quantum annealers as testing backends', 'Maps WebAssembly execution to quantum annealing for edge-case detection and continuous verification.'], ['2019', 'conference', 'V AMMCS', 'Quantum Information special-session chair', 'Chaired the specialist conference session on quantum information and quantum computing.'], ['2019', 'conference', 'V AMMCS', 'N-user quantum secure communication', 'Proposes and experimentally studies controlled dense coding for direct multi-user quantum communication.'], ['2019', 'conference', 'Canadian Association of Physics', 'Hybrid methodology for quantum problems', 'Presents a distributed simulator that compares approaches and recommends methods for particular problems.'], ['2018', 'conference', 'TEDWomen', 'Quantum Coin Toss Game Experiment', 'Uses crowd-sourced data and the IBM Quantum Experience in an interactive public experiment.'], ['2018', 'academic', 'Wilfrid Laurier University', 'Controlled algorithms on the IBMQX4', 'Tests controlled teleportation and dense-coding algorithms on the IBMQX4 processor.'], ['2017', 'conference', 'Ontario Biomechanics Conference', 'Plantar Stimulus and Feedback Response DAQ', 'Redesigns and rebuilds a biomechanical data-acquisition system for plantar-stimulation experiments.']];
        const X = [['Oct 2025 — Present', 'Xanadu Quantum Technologies', 'Quantum Software Developer II', 'Develops widely used quantum software as part of the PennyLane core team.', 'PennyLane,Quantum software,Open source'], ['May — Aug 2025', 'Xanadu Quantum Technologies', 'Summer Resident', 'Contributed to PennyLane’s core quantum-software platform.', 'PennyLane,Quantum computing'], ['2023 — 2024', 'University of British Columbia', 'Teaching Assistant', 'Supported graduate blockchain and distributed-ledger courses.', 'Teaching,Blockchain'], ['Jan — Sep 2022', 'Photonic Inc.', 'Quantum Software Engineer', 'Developed software surrounding silicon colour-centre quantum processors.', 'Quantum software,Silicon colour centres'], ['May — Oct 2021', 'StudyForge', 'QA Strategist and Software Tester', 'Defined testing strategy and implemented unit, integration and end-to-end tests.', 'QA strategy,Testing'], ['2019 — 2021', 'rQadium', 'Consultant', 'Delivered consulting, research and development services to technology companies.', 'Consulting,Research'], ['2018 — 2020', 'University of Waterloo', 'Graduate Teaching Assistant', 'Taught PHYS121, PHYS112 and PHYS115 undergraduate physics courses.', 'Physics,Teaching'], ['Jun — Nov 2019', 'Ryerson Cybersecurity Research Lab', 'Highly Qualified Personnel', 'Conducted research in quantum cryptography.', 'Quantum cryptography,Research'], ['2017 — 2019', 'SIGMA Development', 'Founder, Full Stack Developer', 'Delivered nearly a dozen hardware, software and web products for startups.', 'Founder,Full stack,Hardware'], ['2018 — 2019', 'DelphX Inc.', 'Lead Software Developer', 'Built a blockchain bond-trading platform using Python microservices and cloud infrastructure.', 'Python,Docker,Kubernetes,Azure,RabbitMQ'], ['2016 — 2018', 'Leadme Inc.', 'Co-Founder, Full Stack Developer', 'Built wearable lead capture with Android and web analytics portals.', 'Wearables,Android,Analytics'], ['May — Aug 2017', 'BlackBerry', 'Network Automation Developer', 'Automated network operations with Perl, Python and Ansible.', 'Perl,Python,Ansible'], ['2015 — 2017', 'WLU Neuromechanics Lab', 'Technical Research Assistant', 'Developed force-plate and Optotrak tools and integrated laboratory hardware.', 'DAQ,Optotrak,Hardware'], ['May — Aug 2016', 'Connect Oasis Inc.', 'Jr. Software Developer', 'Developed a cloud retail data-collection platform with Laravel, PHP, jQuery and React.', 'Laravel,PHP,jQuery,React']];
        const T = [
            ["Marcus worked on building an interpreter for executing OpenQASM3.0 circuits in PennyLane. He delivered high-quality, well tested code with amazing throughput. Working with him has been a pleasure.", 'Mudit Pandey', 'Senior Quantum Software Developer · Xanadu'],
            ["Marcus is one of the hardest workers I have ever seen. His knowledge, dedication, and adaptability make him an exceptional colleague. I'm very happy to have worked with him.", 'Pietropaolo Frisoni', 'Quantum Software Developer II · Xanadu'],
            ["Marcus has demonstrated that he is able to work on some of the most ambiguous problems I have ever seen, and provides good insights and new ideas. He also has demonstrated the ability to develop innovative software technologies, and has contributed to the design of many of the components that are part of the software.", 'Nicholas Lee-Hone', 'Quantum Software Engineer · Photonic'],
            ["Marcus is one of the most passionate and reliable people I have had the pleasure of working with. He always meets his deadlines, is a great communicator and is fun to work with. He has excellent technical skills and a proven ability to lead a project from start to finish. He has an incredibly wide skill-set that is always expanding because he is constantly learning new technologies and working on different projects.", 'Tom Robertson', 'Software Developer · Clearpath'],
            ["It was clear from the start that Marcus possessed an impressive breadth of experience and thirst for knowledge directly applicable across the full-stack spectrum of technologies we were already or about to start using. He quickly learned the domain space and related new technologies, and productively participated and collaborated in architectural design discussions of a complex financial trading platform with seasoned developer colleagues; he earned their respect. He actively took the lead and competently coordinated the UI design and development efforts by a third-party team with minimal direction and provided several demonstrable deliverables.", 'Nick Foisy', 'VP Engineering · DelphX'],
            ["Marcus is a strong team player. He contributed greatly to the user interface of our application and showed himself to be very adept with React. He designed a SASS framework that has set us up for easy application styling. During the time he worked with us, he has been an active communicator, which proved to be useful in both ramping him up with the existing Geddy application, as well as help us progress with our UI work.", 'Aaron Liu & James White', 'Geddy Founders'],
            ["Marcus is a highly skilled professional who can easily create user friendly and scalable applications using the latest technologies. His knowledge of all aspects of software development, from business decisions to system architecture to dev ops, is astonishing and is highly valued by myself and all members of our DelphX team. These abilities make Marcus a great team member who is capable of helping in all aspects of the organization. It's a pleasure working with you Marcus!", 'Chad Vance', 'Senior Software Developer · DelphX'],
            ["We put Marcus into an active Laravel project and put demands on him to work with somewhat complicated components in both PHP and Javascript. He was a quick learner and took good advantage of available resources with minimal assistance needed. His technical skills, creativity, and technical agility was well demonstrated during his time here. His performance was impressive and was instrumental in helping us deliver our project in demanding conditions. If you are considering Marcus for a development positon I believe he would be a good fit.", 'Brendan Farr-Gaynor', 'Managing Partner · Olio Digital Labs']
        ];
        const researchLinks = {
            'Electronic devices in nuclear-spin-free germanium heterostructures': [{label: 'Source', href: 'https://meetings-archive.aps.org/smt/2026/mar-g19/7/'}],
            'Three-dimensional imaging of isotopic distribution': [{label: 'Source', href: 'https://event.fourwaves.com/msc2026/abstracts/71a6d0eb-07ee-4024-bcb6-ec1cfcce7713'}],
            'Nuclear spin-free germanium quantum-well heterostructures': [{label: 'Paper', href: 'https://doi.org/10.1002/advs.202523504'}],
            'Optimized quantum compilation and execution pipeline': [{label: 'Poster', href: 'https://www.researchgate.net/publication/395415715_An_Optimized_End-to-End_Quantum_Compilation_and_Execution_Pipeline_for_Simulations'}],
            'An Introduction to Quantum Computing for Computer Engineers': [{label: 'Book', href: 'https://link.springer.com/book/9783032036490'}],
            'Isotopically pure germanium heterostructures': [{label: 'Paper', href: 'https://publications.polymtl.ca/72416'}],
            'Productive Quantum Programming Needs Better Abstract Machines': [{label: 'Paper', href: 'https://www.computer.org/csdl/proceedings-article/qce/2025/573601a816/2c5MXXzQn72'}],
            'Compiling a Q# subset to QASM 3.0': [{label: 'Paper', href: 'https://arxiv.org/abs/2506.23407'}],
            'QASM-TS 2.0': [{label: 'Paper', href: 'https://joss.theoj.org/papers/10.21105/joss.08696'}],
            'Deep-learning methods for Pauli errors': [
                {label: 'Paper', href: 'https://marcusedwards.me/files/eece-571-f-2024.pdf'},
                {label: 'Code', href: 'https://github.com/comp-phys-marc/quantum_channel_characterization'}
            ],
            'Readout-aware layout synthesis': [{label: 'Paper', href: 'https://doi.org/10.1109/QCE60285.2024.10419'}],
            'Three quantum-programming-language parsers': [{label: 'Paper', href: 'https://arxiv.org/abs/2310.10802'}],
            'Machine learning, quantum ML and consciousness': [{label: 'Article', href: 'https://medium.com/@marcusedwards-20301/machine-learning-quantum-machine-learning-and-consciousness-scientifically-3b44a0bb15a2'}],
            'Hybrid digital/analog quantum-physics emulator': [
                {label: 'Paper', href: 'https://arxiv.org/abs/2302.00821'},
                {label: 'Interactive visual', href: 'https://marcusedwards.me/tetrahedral-visualizer-dist/'}
            ],
            'Quantum Honest Byzantine Agreement': [{label: 'Paper', href: 'https://arxiv.org/abs/2301.02944'}],
            'Cloud-microservices execution environment': [{label: 'Article', href: 'https://medium.com/@marcusedwards-20301/building-a-cloud-microservices-based-execution-environment-for-hybrid-quantum-classical-algorithms-ee8b5a18db58'}],
            'AI-based financial recommendation assistant': [{label: 'Patent', href: 'https://patents.google.com/patent/US20210303973A1/en'}],
            'Variational Quantum Anomaly Detection review': [{label: 'Article', href: 'https://qubytes.org/2021/07/08/a-review-and-discussion-of-variational-quantum-anomaly-detection/'}],
            'Savings plan for specific purchases': [{label: 'Patent', href: 'https://patents.google.com/patent/US20210201397A1/en'}],
            'Increasing security when using smartcards': [{label: 'Patent', href: 'https://patents.google.com/patent/US20210133725A1/en'}],
            'Towards Practical Hybrid Quantum / Classical Computing': [
                {label: 'Thesis', href: 'http://hdl.handle.net/10012/16383'},
                {label: 'Defense', href: 'https://marcusedwards.me/files/defense.pdf'}
            ],
            'Quantum and hybrid blockchain protocols': [{label: 'Paper', href: 'https://link.springer.com/article/10.1007/s11128-020-02672-y'}],
            'Quantum annealers as testing backends': [{label: 'Poster', href: 'https://comp-phys-marc.github.io/files/crl_poster.pdf'}],
            'Hybrid methodology for quantum problems': [{label: 'Poster', href: 'https://comp-phys-marc.github.io/files/poster_marcus_edwards_canada.pdf'}],
            'Quantum Coin Toss Game Experiment': [{label: 'Talk', href: 'https://www.ted.com/talks/shohini_ghose_a_beginner_s_guide_to_quantum_computing'}],
            'Controlled algorithms on the IBMQX4': [{label: 'Poster', href: 'https://comp-phys-marc.github.io/files/ControlledAlgorithms.pdf'}],
            'Plantar Stimulus and Feedback Response DAQ': [{label: 'Poster', href: 'https://www.researchgate.net/publication/392905631_Plantar_Stimulus_and_Feedback_Response_DAQ'}]
        };
        const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
        const card = (m, h, p, t = '', links = []) => {
            const title = links.length ? `<a href="${esc(links[0].href)}" target="_blank" rel="noopener noreferrer">${esc(h)}</a>` : esc(h);
            const related = links.length > 1 ? `<div class="resource-links">${links.slice(1).map(link => `<a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>`).join('')}</div>` : '';
            return `<article class="card"><div class="meta">${esc(m)}</div><h3>${title}</h3>${related}<p>${esc(p)}</p>${t ? `<div class="type">${esc(t)}</div>` : ''}</article>`;
        };
        root.querySelector('#projectsGrid').innerHTML = P.map(x => card(...x, '', projectLinks[x[1]] || [])).join('');
        const years = root.querySelector('.years'), filters = [...root.querySelectorAll('.filter')], count = root.querySelector('.count'); function research(f) {const a = R.filter(x => f === 'all' || x[1] === f), ys = [...new Set(a.map(x => x[0]))]; years.innerHTML = ys.map(y => `<div class="year"><div class="year-label">${y}</div><div class="grid">${a.filter(x => x[0] === y).map(x => card(x[2], x[3], x[4], x[1], researchLinks[x[3]] || [])).join('')}</div></div>`).join(''); count.textContent = `${a.length} ITEMS`; filters.forEach(b => b.classList.toggle('active', b.dataset.f === f))} filters.forEach(b => b.addEventListener('click', () => research(b.dataset.f))); research('all');
        root.querySelector('#experience .roles').innerHTML = X.map(x => `<article class="role"><div class="date">${esc(x[0])}</div><div><div class="company">${esc(x[1])}</div><h3>${esc(x[2])}</h3><p>${esc(x[3])}</p><div class="tags">${x[4].split(',').map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div></div></article>`).join('');
        const skills = {
            'Courses': ['Quantum Computing', 'Quantum Mechanics 1', 'Quantum Mechanics 2', 'Directed Research Study in Quantum Computing', 'Introduction to Quantum Information Processing', 'Implementations of Quantum Information Processing', 'Introduction To Quantum Computing', 'Quantum Devices', 'Germanium Quantum Technologies', 'Quantum Circuits And Compiling', 'Advanced Topics In Deep Learning'],
            'Quantum': ['QASM', 'QISKIT', 'IBMQX', 'BLACKBIRD', 'STRAWBERRYFIELDS', 'PENNYLANE', 'DWAVE'],
            'Frontend': ['JAVASCRIPT', 'REACT', 'HTML5', 'CSS', 'SASS', 'ANGULAR', 'TYPESCRIPT', 'ELECTRON'],
            'Backend': ['PYTHON', 'PHP', 'LARAVEL', 'GIT', 'TENSORFLOW', 'RUST', 'C', 'JAVA', 'PERL'],
            'Database': ['MSSQL', 'PSQL', 'NOSQL', 'MYSQL'],
            'Embedded': ['ARDUINO', 'SPICE', 'MIPS', 'PIC', 'M68K', 'PROCESSING', 'ASSEMBLY', 'VHDL', 'MPLAB-X', 'VERILOG'],
            'Mobile': ['REACT-NATIVE', 'CORDOVA', 'IONIC', 'ANDROID', 'XCODE'],
            'Distributed Computing': ['DOCKER', 'RABBITMQ', 'KAFKA', 'KUBERNETES', 'REDIS']
        };
        const cats = Object.keys(skills), tabs = root.querySelector('.tabs'), panel = root.querySelector('.panel'); tabs.innerHTML = cats.map((x, i) => `<button class="tab ${i ? '' : 'active'}" data-s="${x}">${x}</button>`).join(''); function skill(n) {panel.innerHTML = `<h3>${n}</h3><ul class="skill-list">${skills[n].map(x => `<li>${x}</li>`).join('')}</ul>`;[...tabs.children].forEach(b => b.classList.toggle('active', b.dataset.s === n))} [...tabs.children].forEach(b => b.addEventListener('click', () => skill(b.dataset.s))); skill('Courses');
        let ti = 0; const copy = root.querySelector('.copy'), person = root.querySelector('.person strong'), role = root.querySelector('.person span'), tc = root.querySelector('.testcount'), dots = root.querySelector('.dots'); dots.innerHTML = T.map((_, i) => `<button class="dot" aria-label="Show testimonial ${i + 1}"></button>`).join(''); const db = [...dots.children]; function show(i) {ti = (i + T.length) % T.length; copy.textContent = T[ti][0]; person.textContent = T[ti][1]; role.textContent = T[ti][2]; tc.textContent = `${String(ti + 1).padStart(2, '0')} / ${String(T.length).padStart(2, '0')}`; db.forEach((d, n) => d.classList.toggle('active', n === ti))} root.querySelector('.prev').addEventListener('click', () => show(ti - 1)); root.querySelector('.next').addEventListener('click', () => show(ti + 1)); db.forEach((d, i) => d.addEventListener('click', () => show(i))); show(0);
