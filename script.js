// Daggerheart Character Sheet JavaScript

// Variável global para dados das cartas
let cardsData = {};

class DaggerheartCharacter {
    constructor() {
        this.data = {
            // Basic Info
            characterName: '',
            pronouns: '',
            heritage: '',
            selectedClass: '',
            classSubclass: '',
            level: 1,
            
            // Stats
            evasion: 10,
            armor: 10,
            armorBoxes: Array(12).fill(false),
            
            // Attributes
            agility: 0,
            strength: 0,
            finesse: 0,
            instinct: 0,
            presence: 0,
            knowledge: 0,
            
            // Damage thresholds
            minorDamage: '',
            majorDamage: '',
            severeDamage: '',
            
            // HP, Stress, Hope tracking
            hp: Array(12).fill(false),
            stress: Array(12).fill(false),
            hope: Array(6).fill(false),
            
            // Experience texts (em vez de bars)
            experience: ['', '', '', '', ''], // Array de strings para textos
            
            // Gold tracking
            goldHandfuls: Array(8).fill(false),
            goldBags: Array(8).fill(false),
            goldChest: Array(1).fill(false),
            
            // Proficiency
            proficiency: Array(5).fill(false),
            
            // Text fields
            hopeFeature: '',
            classFeature: '',
            inventory: '',
            
            // Weapons
            primaryWeapon: {
                name: '',
                trait: '',
                damage: '',
                feature: ''
            },
            secondaryWeapon: {
                name: '',
                trait: '',
                damage: '',
                feature: ''
            },
            
            // Armor
            armor: {
                name: '',
                thresholds: '',
                score: '',
                feature: ''
            },
            
            // Inventory weapons
            inventoryWeapons: [
                {
                    name: '',
                    trait: '',
                    damage: '',
                    feature: '',
                    type: ''
                },
                {
                    name: '',
                    trait: '',
                    damage: '',
                    feature: '',
                    type: ''
                }
            ],
            
            // Cards
            cards: {
                race: null,
                community: null,
                class: [null, null, null],
                domains: [null, null, null, null, null],
                vault: [null, null, null, null, null]
            },
            
            // Tiers data
            tiers: {
                tier2: {
                    checkedBoxes: [],
                    maxChecks: 6
                },
                tier3: {
                    checkedBoxes: [],
                    maxChecks: 6
                },
                tier4: {
                    checkedBoxes: [],
                    maxChecks: 6
                }
            },
            
            // Contadores para cartas de domínio e cofre
            abilityCounters: Array(10).fill(0)
        };

        this.currentModalSlot = null;
        this.currentPath = [];
        this.selectedCards = {
            race: new Set(),
            community: new Set(),
            class: new Set(),
            domains: new Set(),
            vault: new Set()
        };
        
        this.init();
    }
    
    init() {
        this.createInteractiveElements();
        this.bindEvents();
        this.bindCardEvents();
        this.loadCharacter();
        this.bindTierEvents();
        
        // Adicionar um pequeno delay para garantir que o DOM esteja completamente carregado
        setTimeout(() => {
            this.bindTierEvents();
            this.updateTierCounters();
        }, 100);
    }

    bindCardEvents() {
        // Race card
        this.bindCardSlotClick('race', 0);
        
        // Community card
        this.bindCardSlotClick('community', 0);
        
        // Class cards
        for (let i = 0; i < 3; i++) {
            this.bindCardSlotClick('class', i);
        }
        
        // Domain cards
        for (let i = 0; i < 5; i++) {
            this.bindCardSlotClick('domain', i);
        }
        
        // Vault cards
        for (let i = 0; i < 5; i++) {
            this.bindCardSlotClick('vault', i);
        }
        
        // Fechar modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeCardModal();
        });
        
        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('card-modal');
            if (e.target === modal) {
                this.closeCardModal();
            }
        });
    }

    // Novo método para vincular clique nos slots
    bindCardSlotClick(type, index) {
        const slot = document.querySelector(`[data-type="${type}"][data-index="${index}"]`);
        
        if (!slot) return;
        
        slot.addEventListener('click', () => {
            this.openCardSelectionModal(type, index);
        });
        
        // Permitir clicar na imagem para trocar
        slot.addEventListener('click', (e) => {
            if (e.target.classList.contains('card-image') || e.target.classList.contains('card-fallback')) {
                this.openCardSelectionModal(type, index);
            }
        });
    }

    // Método openCardSelectionModal atualizado
    openCardSelectionModal(type, index) {
        this.currentModalSlot = { type, index };
        this.currentPath = [];
        
        const modal = document.getElementById('card-modal');
        const modalTitle = document.getElementById('modal-title');
        
        // Definir título baseado no tipo
        const typeNames = {
            race: 'Raça',
            community: 'Comunidade',
            class: 'Classe',
            domain: 'Domínio',
            vault: 'Cofre'
        };
        
        modalTitle.textContent = `Selecionar Carta de ${typeNames[type]}`;
        
        // Inicializar breadcrumb
        this.updateBreadcrumb();
        
        // Carregar conteúdo inicial
        this.loadModalContent(type);
        
        modal.style.display = 'block';
    }

    // Atualizar breadcrumb
    updateBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.innerHTML = '';
        
        // Item inicial
        const homeItem = document.createElement('span');
        homeItem.className = 'breadcrumb-item';
        homeItem.textContent = 'Início';
        homeItem.addEventListener('click', () => {
            this.currentPath = [];
            this.loadModalContent(this.currentModalSlot.type);
        });
        breadcrumb.appendChild(homeItem);
        
        // Itens do caminho atual
        this.currentPath.forEach((segment, index) => {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = ' › ';
            breadcrumb.appendChild(separator);
            
            const pathItem = document.createElement('span');
            pathItem.className = 'breadcrumb-item';
            pathItem.textContent = segment;
            pathItem.addEventListener('click', () => {
                this.currentPath = this.currentPath.slice(0, index + 1);
                this.loadModalContent(this.currentModalSlot.type);
            });
            breadcrumb.appendChild(pathItem);
        });
    }

    // Método loadModalContent atualizado
    loadModalContent(type) {
        const cardGrid = document.getElementById('card-grid');
        cardGrid.innerHTML = '<div class="card-item">Carregando cartas...</div>';
        
        this.updateBreadcrumb();
        
        // Carregar dados das cartas se ainda não carregados
        if (Object.keys(cardsData).length === 0) {
            this.loadCardsData().then(() => {
                this.displayModalContent(type);
            }).catch(error => {
                console.error('Erro ao carregar dados:', error);
                cardGrid.innerHTML = '<div class="card-item">Erro ao carregar cartas. Verifique o console.</div>';
            });
        } else {
            this.displayModalContent(type);
        }
    }

    // Novo método para carregar dados das cartas
    async loadCardsData() {
        try {
            const response = await fetch('cards-data.json');
            cardsData = await response.json();
        } catch (error) {
            console.error('Erro ao carregar dados das cartas:', error);
            // Fallback para dados estáticos se o arquivo não estiver disponível
            cardsData = {
                "Ancestries": ["Clank.jpg", "Drakona.jpg", "Dwarf.jpg", "Elf.jpg", "Faerie.jpg", "Faun.jpg", "Firbolg.jpg", "Fungril.jpg", "Galapa.jpg", "Giant.jpg", "Goblin.jpg", "Halfling.jpg", "Human.jpg", "Infernis.jpg", "Katari.jpg", "Orc.jpg", "Ribbet.jpg", "Simiah.jpg"],
                "Communities": ["Highborne.jpg", "Loreborne.jpg", "Orderborne.jpg", "Ridgeborne.jpg", "Seaborne.jpg", "Slyborne.jpg", "Underborne.jpg", "Wanderborne.jpg", "Wildborne.jpg"],
                "Classes": {
                    "Bard": {
                        "Troubadour": ["Bard_Troubadour_Foundation.jpg", "Bard_Troubadour_Mastery.jpg", "Bard_Troubadour_Specialisation.jpg"],
                        "Wordsmith": ["Bard_Wordsmith_Foundation.jpg", "Bard_Wordsmith_Mastery.jpg", "Bard_Wordsmith_Specialisation.jpg"]
                    },
                    "Druid": {
                        "WardenOfRenewal": ["Druid_WardenOfRenewal_Foundation.jpg", "Druid_WardenOfRenewal_Mastery.jpg", "Druid_WardenOfRenewal_Specialisation.jpg"],
                        "WardenOfTheElements": ["Druid_WardenOfTheElements_Foundation.jpg", "Druid_WardenOfTheElements_Mastery.jpg", "Druid_WardenOfTheElements_Specialisation.jpg"]
                    },
                    "Guardian": {
                        "Stalwart": ["Guardian_Stalwart_Foundation.jpg", "Guardian_Stalwart_Mastery.jpg", "Guardian_Stalwart_Specialisation.jpg"],
                        "Vengeance": ["Guardian_Vengeance_Foundation.jpg", "Guardian_Vengeance_Mastery.jpg", "Guardian_Vengeance_Specialisation.jpg"]
                    },
                    "Ranger": {
                        "Beastbound": ["Ranger_Beastbound_Foundation.jpg", "Ranger_Beastbound_Mastery.jpg", "Ranger_Beastbound_Specialisation.jpg"],
                        "Wayfinder": ["Ranger_Wayfinder_Foundation.jpg", "Ranger_Wayfinder_Mastery.jpg", "Ranger_Wayfinder_Specialisation.jpg"]
                    },
                    "Rogue": {
                        "Nightwalker": ["Rogue_Nightwalker_Foundation.jpg", "Rogue_Nightwalker_Mastery.jpg", "Rogue_Nightwalker_Specialisation.jpg"],
                        "Syndicate": ["Rogue_Syndicate_Foundation.jpg", "Rogue_Syndicate_Mastery.jpg", "Rogue_Syndicate_Specialisation.jpg"]
                    },
                    "Seraph": {
                        "DivineWielder": ["Seraph_DivineWielder_Foundation.jpg", "Seraph_DivineWielder_Mastery.jpg", "Seraph_DivineWielder_Specialisation.jpg"],
                        "WingedSentinel": ["Seraph_WingedSentinel_Foundation.jpg", "Seraph_WingedSentinel_Mastery.jpg", "Seraph_WingedSentinel_Specialisation.jpg"]
                    },
                    "Sorcerer": {
                        "ElementalOrigin": ["Sorcerer_ElementalOrigin_Foundation.jpg", "Sorcerer_ElementalOrigin_Mastery.jpg", "Sorcerer_ElementalOrigin_Specialisation.jpg"],
                        "PrimalOrigin": ["Sorcerer_PrimalOrigin_Foundation.jpg", "Sorcerer_PrimalOrigin_Mastery.jpg", "Sorcerer_PrimalOrigin_Specialisation.jpg"]
                    },
                    "Warrior": {
                        "CallOfTheBrave": ["Warrior_CallOfTheBrave_Foundation.jpg", "Warrior_CallOfTheBrave_Mastery.jpg", "Warrior_CallOfTheBrave_Specialisation.jpg"],
                        "CallOfTheSlayer": ["Warrior_CallOfTheSlayer_Foundation.jpg", "Warrior_CallOfTheSlayer_Mastery.jpg", "Warrior_CallOfTheSlayer_Specialisation.jpg"]
                    },
                    "Wizard": {
                        "SchoolOfKnowledge": ["Wizard_SchoolOfKnowledge_Foundation.jpg", "Wizard_SchoolOfKnowledge_Mastery.jpg", "Wizard_SchoolOfKnowledge_Specialisation.jpg"],
                        "SchoolOfWar": ["Wizard_SchoolOfWar_Foundation.jpg", "Wizard_SchoolOfWar_Mastery.jpg", "Wizard_SchoolOfWar_Specialisation.jpg"]
                    }
                },
                "Domains": {
                    "ARCANA": ["01 - Rune Ward.jpg", "01 - Unleash Chaos.jpg", "01 - Wall Walk.jpg"],
                    "BLADE": ["01 - Get Back Up.jpg", "01 - Not Good Enough.jpg", "01 - Whirlwind.jpg"],
                    "BONE": ["01 - Deft Maneuvers.jpg", "01 - I See It Coming.jpg", "01 - Untouchable.jpg"],
                    "CODEX": ["01 - Book Of Ava.jpg", "01 - Book Of Illiat.jpg", "01 - Book Of Tyfar.jpg"],
                    "GRACE": ["01 - Deft Deceiver.jpg", "01 - Enrapture.jpg", "01 - Inspirational Words.jpg"],
                    "MIDNIGHT": ["01 - Pick And Pull.jpg", "01 - Rain Of Blades.jpg", "01 - Uncanny Disguise.jpg"],
                    "SAGE": ["01 - Gifted Tracker.jpg", "01 - Nature's Tongue.jpg", "01 - Vicious Entangle.jpg"],
                    "SPLENDOR": ["01 - Bolt Beacon.jpg", "01 - Mending Touch.jpg", "01 - Reassurance.jpg"],
                    "VALOR": ["01 - Bare Bones.jpg", "01 - Forceful Push.jpg", "01 - I Am Your Shield.jpg"]
                }
            };
        }
    }

    // Novo método para exibir conteúdo do modal
    displayModalContent(type) {
        const cardGrid = document.getElementById('card-grid');
        cardGrid.innerHTML = '';
        
        let items = [];
        let basePath = '';
        
        // Determinar base path baseado no tipo
        switch(type) {
            case 'race':
                basePath = 'Ancestries';
                break;
            case 'community':
                basePath = 'Communities';
                break;
            case 'class':
                basePath = 'Classes';
                break;
            case 'domain':
            case 'vault':
                basePath = 'Domains';
                break;
        }
        
        try {
            // Navegar pela estrutura baseado no currentPath
            let currentData = cardsData[basePath];
            
            // Navegar pelos níveis do currentPath
            for (const segment of this.currentPath) {
                if (currentData && currentData[segment]) {
                    currentData = currentData[segment];
                } else {
                    console.error('Caminho inválido:', segment);
                    currentData = null;
                    break;
                }
            }
            
            if (currentData) {
                // Se currentData é um array, são arquivos
                if (Array.isArray(currentData)) {
                    items = currentData.map(fileName => ({
                        type: 'image',
                        name: fileName,
                        path: this.buildCardPath(type, fileName)
                    }));
                } 
                // Se currentData é um objeto, são pastas
                else if (typeof currentData === 'object') {
                    items = Object.keys(currentData).map(key => ({
                        type: 'folder',
                        name: key,
                        path: key
                    }));
                }
            }
            
            if (items.length === 0) {
                cardGrid.innerHTML = '<div class="card-item">Nenhuma carta encontrada neste diretório.</div>';
                return;
            }
            
            this.displayModalItems(items, type);
        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            cardGrid.innerHTML = '<div class="card-item">Erro ao carregar cartas</div>';
        }
    }

    // Exibir itens no modal
    displayModalItems(items, type) {
        const cardGrid = document.getElementById('card-grid');
        cardGrid.innerHTML = '';
        
        items.forEach(item => {
            const cardItem = document.createElement('div');
            cardItem.className = `card-item ${item.type}`;
            
            if (item.type === 'folder') {
                cardItem.innerHTML = `
                    <div class="folder-icon">📁</div>
                    <div class="card-name">${item.name}</div>
                    <div class="current-path">Pasta</div>
                `;
                
                cardItem.addEventListener('click', () => {
                    this.currentPath.push(item.name);
                    this.loadModalContent(type);
                });
            } else {
                // Verificar se a carta já foi selecionada
                const isSelected = this.isCardAlreadySelected(type, item.path);
                
                cardItem.innerHTML = `
                    <div class="card-preview-container">
                        <img src="Cards/${this.getCardImagePath(type, item.name)}" alt="${item.name}" class="card-preview" onerror="this.style.display='none'">
                        <div class="card-placeholder-icon" style="display: none;">🃏</div>
                    </div>
                    <div class="card-name">${item.name.replace('.jpg', '')}</div>
                    ${isSelected ? '<div class="card-selected-indicator">✓ SELECIONADA</div>' : ''}
                `;
                
                if (!isSelected) {
                    cardItem.addEventListener('click', () => {
                        this.selectCard(item.name, item.path);
                    });
                } else {
                    cardItem.classList.add('disabled');
                }
            }
            
            cardGrid.appendChild(cardItem);
        });
    }

    // Construir caminho da carta
    buildCardPath(type, cardName) {
        let path = '';
        
        switch(type) {
            case 'race':
                path = `Ancestries/${cardName}`;
                break;
            case 'community':
                path = `Communities/${cardName}`;
                break;
            case 'class':
                path = `Classes/${this.currentPath.join('/')}/${cardName}`;
                break;
            case 'domain':
            case 'vault':
                path = `Domains/${this.currentPath.join('/')}/${cardName}`;
                break;
        }
        
        return path;
    }

    // Obter caminho da imagem
    getCardImagePath(type, cardName) {
        let basePath = '';
        
        switch(type) {
            case 'race':
                basePath = 'Ancestries';
                break;
            case 'community':
                basePath = 'Communities';
                break;
            case 'class':
                basePath = `Classes/${this.currentPath.join('/')}`;
                break;
            case 'domain':
            case 'vault':
                basePath = `Domains/${this.currentPath.join('/')}`;
                break;
        }
        
        return `${basePath}/${cardName}`;
    }

    // Verificar se a carta já foi selecionada
    isCardAlreadySelected(type, cardPath) {
        const { cards } = this.data;
        
        switch(type) {
            case 'race':
                return cards.race === cardPath;
            case 'community':
                return cards.community === cardPath;
            case 'class':
                return cards.class.includes(cardPath);
            case 'domain':
                return cards.domains.includes(cardPath);
            case 'vault':
                return cards.vault.includes(cardPath);
            default:
                return false;
        }
    }

    // Selecionar uma carta
    selectCard(cardName, cardPath) {
        const { type, index } = this.currentModalSlot;
        
        // Verificar se a carta já foi selecionada em outro slot
        if (this.isCardAlreadySelected(type, cardPath)) {
            this.showNotification('Esta carta já foi selecionada em outro slot!', 'warning');
            return;
        }
        
        // Atualizar o slot com a nova carta
        this.setCardToSlot(type, index, cardPath, cardName);
        
        // Adicionar aos selecionados
        this.selectedCards[type].add(cardPath);
        
        // Fechar modal
        this.closeCardModal();
        
        this.showNotification('Carta selecionada com sucesso!', 'success');
    }

    // Definir carta no slot
    setCardToSlot(type, index, cardPath, cardName) {
        const slot = document.querySelector(`[data-type="${type}"][data-index="${index}"]`);
        const imagePath = `Cards/${cardPath}`;
        
        // Criar elemento de imagem
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'card-image';
        img.alt = cardName;
        img.onerror = function() {
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'card-fallback';
            fallback.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 0.8em; margin-top: 10px;">${cardName.replace('.jpg', '')}</div>
                    <div style="font-size: 0.7em; color: #666; margin-top: 5px;">[Imagem não carregada]</div>
                </div>
            `;
            this.parentNode.appendChild(fallback);
        };
        
        const placeholder = slot.querySelector('.card-placeholder');
        placeholder.style.display = 'none';
        
        // Remover conteúdo existente se houver
        const existingImg = slot.querySelector('.card-image');
        const existingFallback = slot.querySelector('.card-fallback');
        if (existingImg) existingImg.remove();
        if (existingFallback) existingFallback.remove();
        
        slot.appendChild(img);
        slot.classList.add('has-image');
        
        // Salvar dados da carta
        this.saveCardData(type, index, cardPath);
    }

    // Fechar modal
    closeCardModal() {
        const modal = document.getElementById('card-modal');
        modal.style.display = 'none';
        this.currentModalSlot = null;
        this.currentPath = [];
    }

    // Salvar dados da carta
    saveCardData(type, index, cardPath) {
        if (type === 'race' || type === 'community') {
            this.data.cards[type] = cardPath;
        } else if (type === 'class') {
            this.data.cards.class[index] = cardPath;
        } else if (type === 'domain') {
            this.data.cards.domains[index] = cardPath;
        } else if (type === 'vault') {
            this.data.cards.vault[index] = cardPath;
        }
        this.saveCharacter();
    }

    bindTierEvents() {
        const tiers = ['2', '3', '4'];
        
        tiers.forEach(tier => {
            const checkboxes = document.querySelectorAll(`.tier[data-tier="${tier}"] input[type="checkbox"]`);
            
            checkboxes.forEach(checkbox => {
                // Remover event listeners existentes para evitar duplicação
                checkbox.replaceWith(checkbox.cloneNode(true));
            });

            // Re-selecionar os checkboxes após o clone
            const newCheckboxes = document.querySelectorAll(`.tier[data-tier="${tier}"] input[type="checkbox"]`);
            
            newCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    this.handleTierOptionChange(tier, e.target);
                });
            });
        });
    }

    handleTierOptionChange(tier, checkbox) {
        const tierKey = `tier${tier}`;
        const tierData = this.data.tiers[tierKey];
        
        // Obter ID único do checkbox
        const checkboxId = this.getCheckboxId(checkbox);
        
        // Verificar se é uma opção especial que custa 2 pontos
        const isSpecialOption = checkbox.hasAttribute('data-cost');
        const optionCost = isSpecialOption ? parseInt(checkbox.getAttribute('data-cost')) : 1;
        
        if (checkbox.checked) {
            // Calcular pontos atuais gastos
            const currentPoints = this.calculateTierPoints(tierData.checkedBoxes, tier);
            
            // Calcular pontos que seriam gastos com esta opção
            const wouldSpendPoints = currentPoints + optionCost;
            
            // Verificar se excede o limite (6 pontos)
            if (wouldSpendPoints > tierData.maxChecks) {
                checkbox.checked = false;
                this.showNotification(`Esta opção custa ${optionCost} pontos! Você só tem ${tierData.maxChecks - currentPoints} ponto(s) disponível(is) no Tier ${tier}.`, 'warning');
                return;
            }
            
            // Adicionar à lista de checkboxes marcados
            if (!tierData.checkedBoxes.includes(checkboxId)) {
                tierData.checkedBoxes.push(checkboxId);
            }
        } else {
            // Remover da lista de checkboxes marcados
            tierData.checkedBoxes = tierData.checkedBoxes.filter(id => id !== checkboxId);
        }
        
        console.log(`Tier ${tier}: ${this.calculateTierPoints(tierData.checkedBoxes, tier)}/${tierData.maxChecks} pontos gastos`);
        this.saveCharacter();
        this.updateTierCounters();
    }

    // Calcular pontos gastos
    calculateTierPoints(checkedBoxes, tier) {
        let totalPoints = 0;
        
        checkedBoxes.forEach(checkboxId => {
            // Encontrar o checkbox pelo ID
            const checkbox = this.findCheckboxById(checkboxId, tier);
            if (checkbox) {
                const cost = checkbox.hasAttribute('data-cost') ? 
                             parseInt(checkbox.getAttribute('data-cost')) : 1;
                totalPoints += cost;
            }
        });
        
        return totalPoints;
    }

    // Método auxiliar para encontrar checkbox pelo ID
    findCheckboxById(checkboxId, tier) {
        const checkboxes = document.querySelectorAll(`.tier[data-tier="${tier}"] input[type="checkbox"]`);
        
        for (const checkbox of checkboxes) {
            const id = this.getCheckboxId(checkbox);
            if (id === checkboxId) {
                return checkbox;
            }
        }
        
        return null;
    }

    getCheckboxId(checkbox) {
        const tierElement = checkbox.closest('.tier');
        const tier = tierElement.getAttribute('data-tier');
        const index = Array.from(tierElement.querySelectorAll('input[type="checkbox"]')).indexOf(checkbox);
        return `tier${tier}_checkbox${index}`;
    }

    loadTiers() {
        const tiers = ['2', '3', '4'];
        
        tiers.forEach(tier => {
            const tierKey = `tier${tier}`;
            const checkboxes = document.querySelectorAll(`.tier[data-tier="${tier}"] input[type="checkbox"]`);
            
            // Limpar todos os checkboxes primeiro
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Marcar os checkboxes salvos
            this.data.tiers[tierKey].checkedBoxes.forEach(checkboxId => {
                // Encontrar o checkbox pelo ID
                const checkboxes = document.querySelectorAll(`.tier[data-tier="${tier}"] input[type="checkbox"]`);
                const index = parseInt(checkboxId.split('checkbox')[1]);
                
                if (checkboxes[index]) {
                    checkboxes[index].checked = true;
                }
            });
        });
    }

    bindCounterEvents() {
        // Vincular eventos dos botões de contador
        document.querySelectorAll('.counter-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.incrementAbilityCounter(index);
            });
        });

        document.querySelectorAll('.counter-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.decrementAbilityCounter(index);
            });
        });
    }

    incrementAbilityCounter(index) {
        this.data.abilityCounters[index]++;
        this.updateAbilityCounterDisplay(index);
        this.saveCharacter();
    }

    decrementAbilityCounter(index) {
        if (this.data.abilityCounters[index] > 0) {
            this.data.abilityCounters[index]--;
            this.updateAbilityCounterDisplay(index);
            this.saveCharacter();
        }
    }

    updateAbilityCounterDisplay(index) {
        const counters = document.querySelectorAll('.counter-value');
        if (counters[index]) {
            counters[index].textContent = this.data.abilityCounters[index];
        }
    }
    
    createInteractiveElements() {
        // Create HP boxes
        this.createClickableBoxes('hp-boxes', 12, 'hp-box', (index) => {
            this.data.hp[index] = !this.data.hp[index];
            this.saveCharacter();
        });
        
        // Create Stress boxes
        this.createClickableBoxes('stress-boxes', 12, 'stress-box', (index) => {
            this.data.stress[index] = !this.data.stress[index];
            this.saveCharacter();
        });
        
        // Create Hope diamonds
        this.createClickableBoxes('hope-track', 6, 'hope-diamond', (index) => {
            this.data.hope[index] = !this.data.hope[index];
            this.saveCharacter();
        });
        
        // Create Gold circles
        this.createClickableBoxes('gold-handfuls', 8, 'gold-circle', (index) => {
            this.data.goldHandfuls[index] = !this.data.goldHandfuls[index];
            this.saveCharacter();
        });
        
        this.createClickableBoxes('gold-bags', 8, 'gold-circle', (index) => {
            this.data.goldBags[index] = !this.data.goldBags[index];
            this.saveCharacter();
        });
        
        this.createClickableBoxes('gold-chest', 1, 'gold-circle', (index) => {
            this.data.goldChest[index] = !this.data.goldChest[index];
            this.saveCharacter();
        });
        
        // Create Proficiency circles
        this.createClickableBoxes('proficiency-circles', 5, 'proficiency-circle', (index) => {
            this.data.proficiency[index] = !this.data.proficiency[index];
            this.saveCharacter();
        });
        
        // Create Armor boxes
        this.createClickableBoxes('armor-boxes', 12, 'armor-box', (index) => {
            this.data.armorBoxes[index] = !this.data.armorBoxes[index];
            this.saveCharacter();
        });
    }
    
    createClickableBoxes(containerId, count, className, callback) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const box = document.createElement('div');
            box.className = className;
            box.addEventListener('click', () => {
                callback(i);
                box.classList.toggle('filled');
            });
            container.appendChild(box);
        }
    }
    
    bindEvents() {
        // Basic info fields
        const basicFields = [
            'character-name', 'pronouns', 'heritage', 'class-subclass',
            'evasion', 'armor', 'agility', 'strength', 'finesse', 
            'instinct', 'presence', 'knowledge', 'minor-damage', 
            'major-damage', 'severe-damage', 'hope-feature', 
            'class-feature', 'inventory'
        ];
        
        basicFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.updateDataFromField(fieldId, field.value);
                    this.saveCharacter();
                });
            }
        });
        
        // Class selection
        const classSelect = document.getElementById('class-select');
        if (classSelect) {
            classSelect.addEventListener('change', () => {
                this.data.selectedClass = classSelect.value;
                this.updateAvailableDomains();
                this.saveCharacter();
            });
        }
        
        // Weapon fields
        this.bindWeaponFields('primary', 'primaryWeapon');
        this.bindWeaponFields('secondary', 'secondaryWeapon');
        
        // Armor fields
        this.bindArmorFields();
        
        // Inventory weapon fields
        this.bindInventoryWeaponFields();
        
        // Control buttons
        document.getElementById('save-character').addEventListener('click', () => {
            this.saveCharacter();
            this.showNotification('Personagem salvo com sucesso!', 'success');
        });
        
        document.getElementById('load-character').addEventListener('click', () => {
            this.loadCharacter();
            this.showNotification('Personagem carregado com sucesso!', 'success');
        });
        
        document.getElementById('clear-character').addEventListener('click', () => {
            if (confirm('Tem certeza que deseja limpar toda a ficha?')) {
                this.clearCharacter();
                this.showNotification('Ficha limpa com sucesso!', 'info');
            }
        });

        // Tier events
        this.bindTierEvents();
        
        // Card events
        this.bindCardEvents();

        // Vincular eventos dos contadores
        this.bindCounterEvents();
        
        // Drag and drop events
        this.bindDragAndDropEvents();
        
        // Vincular campos de texto de experiência
        this.bindExperienceTexts();
    }
    
    // Novo método para vincular campos de texto de experiência
    bindExperienceTexts() {
        const textAreas = document.querySelectorAll('.experience-textarea');
        textAreas.forEach((textarea, index) => {
            textarea.addEventListener('input', () => {
                this.data.experience[index] = textarea.value;
                this.saveCharacter();
            });
        });
    }
    
    updateAvailableDomains() {
        const domainsDisplay = document.getElementById('available-domains');
        if (!domainsDisplay) return;
        
        const domainsMap = {
            'Bard': 'Codex & Grace',
            'Druid': 'Arcana & Sage',
            'Guardian': 'Blade & Valor',
            'Ranger': 'Bone & Sage',
            'Rogue': 'Grace & Midnight',
            'Seraph': 'Splendor & Valor',
            'Sorcerer': 'Arcana & Midnight',
            'Warrior': 'Blade & Bone',
            'Wizard': 'Codex & Splendor'
        };
        
        if (this.data.selectedClass && domainsMap[this.data.selectedClass]) {
            domainsDisplay.textContent = domainsMap[this.data.selectedClass];
        } else {
            domainsDisplay.textContent = '';
        }
    }
    
    bindWeaponFields(prefix, dataKey) {
        const fields = ['name', 'trait', 'damage', 'feature'];
        fields.forEach(field => {
            const element = document.getElementById(`${prefix}-weapon-${field}`);
            if (element) {
                element.addEventListener('input', () => {
                    this.data[dataKey][field] = element.value;
                    this.saveCharacter();
                });
            }
        });
    }
    
    bindArmorFields() {
        const fields = ['name', 'thresholds', 'score', 'feature'];
        fields.forEach(field => {
            const element = document.getElementById(`armor-${field}`);
            if (element) {
                element.addEventListener('input', () => {
                    this.data.armor[field] = element.value;
                    this.saveCharacter();
                });
            }
        });
    }
    
    bindInventoryWeaponFields() {
        for (let i = 0; i < 2; i++) {
            const fields = ['name', 'trait', 'damage', 'feature'];
            fields.forEach(field => {
                const element = document.getElementById(`inv-weapon-${i + 1}-${field}`);
                if (element) {
                    element.addEventListener('input', () => {
                        this.data.inventoryWeapons[i][field] = element.value;
                        this.saveCharacter();
                    });
                }
            });
            
            // Weapon type radio buttons
            const primaryRadio = document.getElementById(`inv-weapon-${i + 1}-primary`);
            const secondaryRadio = document.getElementById(`inv-weapon-${i + 1}-secondary`);
            
            if (primaryRadio) {
                primaryRadio.addEventListener('change', () => {
                    if (primaryRadio.checked) {
                        this.data.inventoryWeapons[i].type = 'primary';
                        this.saveCharacter();
                    }
                });
            }
            
            if (secondaryRadio) {
                secondaryRadio.addEventListener('change', () => {
                    if (secondaryRadio.checked) {
                        this.data.inventoryWeapons[i].type = 'secondary';
                        this.saveCharacter();
                    }
                });
            }
        }
    }
    
    bindDragAndDropEvents() {
        const containers = document.querySelectorAll('.card-slot-container[draggable="true"]');
        
        containers.forEach(container => {
            container.addEventListener('dragstart', (e) => {
                // Armazenar dados do container de origem
                const domainIndex = container.getAttribute('data-domain-index');
                const vaultIndex = container.getAttribute('data-vault-index');
                
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    domainIndex: domainIndex,
                    vaultIndex: vaultIndex
                }));
                
                container.classList.add('dragging');
            });
            
            container.addEventListener('dragend', (e) => {
                containers.forEach(c => c.classList.remove('dragging', 'drop-zone'));
            });
            
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drop-zone');
            });
            
            container.addEventListener('dragleave', (e) => {
                container.classList.remove('drop-zone');
            });
            
            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drop-zone');
                
                // Obter dados do container de origem
                const sourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
                
                // Obter dados do container de destino
                const targetDomainIndex = container.getAttribute('data-domain-index');
                const targetVaultIndex = container.getAttribute('data-vault-index');
                
                // Verificar se é uma troca válida (entre domínio e cofre)
                if ((sourceData.domainIndex !== null && targetVaultIndex !== null) || 
                    (sourceData.vaultIndex !== null && targetDomainIndex !== null)) {
                    this.swapCards(sourceData, {
                        domainIndex: targetDomainIndex,
                        vaultIndex: targetVaultIndex
                    });
                }
            });
        });
    }
    
    swapCards(source, target) {
        // Determinar tipos e índices
        const sourceType = source.domainIndex !== null ? 'domains' : 'vault';
        const targetType = target.domainIndex !== null ? 'domains' : 'vault';
        
        const sourceIndex = source.domainIndex !== null ? parseInt(source.domainIndex) : parseInt(source.vaultIndex);
        const targetIndex = target.domainIndex !== null ? parseInt(target.domainIndex) : parseInt(target.vaultIndex);
        
        // Trocar as cartas
        const tempCard = this.data.cards[sourceType][sourceIndex];
        this.data.cards[sourceType][sourceIndex] = this.data.cards[targetType][targetIndex];
        this.data.cards[targetType][targetIndex] = tempCard;
        
        // Calcular índices dos contadores
        const sourceCounterIndex = sourceType === 'domains' ? sourceIndex : sourceIndex + 5;
        const targetCounterIndex = targetType === 'domains' ? targetIndex : targetIndex + 5;
        
        // Trocar os contadores
        const tempCounter = this.data.abilityCounters[sourceCounterIndex];
        this.data.abilityCounters[sourceCounterIndex] = this.data.abilityCounters[targetCounterIndex];
        this.data.abilityCounters[targetCounterIndex] = tempCounter;
        
        // Atualizar a exibição
        this.updateCardDisplays();
        this.updateAllCounterDisplays();
        this.saveCharacter();
        
        this.showNotification('Cartas trocadas com sucesso!', 'success');
    }
    
    updateDataFromField(fieldId, value) {
        const fieldMap = {
            'character-name': 'characterName',
            'pronouns': 'pronouns',
            'heritage': 'heritage',
            'class-subclass': 'classSubclass',
            'evasion': 'evasion',
            'armor': 'armor',
            'agility': 'agility',
            'strength': 'strength',
            'finesse': 'finesse',
            'instinct': 'instinct',
            'presence': 'presence',
            'knowledge': 'knowledge',
            'minor-damage': 'minorDamage',
            'major-damage': 'majorDamage',
            'severe-damage': 'severeDamage',
            'hope-feature': 'hopeFeature',
            'class-feature': 'classFeature',
            'inventory': 'inventory'
        };
        
        const dataKey = fieldMap[fieldId];
        if (dataKey) {
            // Convert to number for numeric fields
            if (['evasion', 'armor', 'agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'].includes(dataKey)) {
                this.data[dataKey] = parseInt(value) || 0;
            } else {
                this.data[dataKey] = value;
            }
        }
    }
    
    saveCharacter() {
        try {
            localStorage.setItem('daggerheart-character', JSON.stringify(this.data));
        } catch (error) {
            console.error('Erro ao salvar personagem:', error);
            this.showNotification('Erro ao salvar personagem!', 'error');
        }
    }
    
    loadCharacter() {
        try {
            const saved = localStorage.getItem('daggerheart-character');
            if (saved) {
                this.data = { ...this.data, ...JSON.parse(saved) };
                this.populateFields();
                this.updateInteractiveElements();
                this.loadCards();
                this.loadAbilityCounters();
                this.updateAvailableDomains();
                this.loadTiers();
                this.loadSelectedCards();
            }
        } catch (error) {
            console.error('Erro ao carregar personagem:', error);
            this.showNotification('Erro ao carregar personagem!', 'error');
        }
        this.updateTierCounters();
    }

    loadSelectedCards() {
        // Recarregar o conjunto de cartas selecionadas
        this.selectedCards = {
            race: new Set(),
            community: new Set(),
            class: new Set(),
            domains: new Set(),
            vault: new Set()
        };
        
        // Popular com as cartas já salvas
        if (this.data.cards.race) {
            this.selectedCards.race.add(this.data.cards.race);
        }
        if (this.data.cards.community) {
            this.selectedCards.community.add(this.data.cards.community);
        }
        
        this.data.cards.class.forEach(card => {
            if (card) this.selectedCards.class.add(card);
        });
        
        this.data.cards.domains.forEach(card => {
            if (card) this.selectedCards.domains.add(card);
        });
        
        this.data.cards.vault.forEach(card => {
            if (card) this.selectedCards.vault.add(card);
        });
    }

    loadAbilityCounters() {
        for (let i = 0; i < 10; i++) {
            this.updateAbilityCounterDisplay(i);
        }
    }
    
    populateFields() {
        // Basic fields
        const fieldMap = {
            'character-name': 'characterName',
            'pronouns': 'pronouns',
            'heritage': 'heritage',
            'class-subclass': 'classSubclass',
            'evasion': 'evasion',
            'armor': 'armor',
            'agility': 'agility',
            'strength': 'strength',
            'finesse': 'finesse',
            'instinct': 'instinct',
            'presence': 'presence',
            'knowledge': 'knowledge',
            'minor-damage': 'minorDamage',
            'major-damage': 'majorDamage',
            'severe-damage': 'severeDamage',
            'hope-feature': 'hopeFeature',
            'class-feature': 'classFeature',
            'inventory': 'inventory'
        };
        
        Object.entries(fieldMap).forEach(([fieldId, dataKey]) => {
            const field = document.getElementById(fieldId);
            if (field && this.data[dataKey] !== undefined) {
                field.value = this.data[dataKey];
            }
        });
        
        // Class selection
        const classSelect = document.getElementById('class-select');
        if (classSelect && this.data.selectedClass) {
            classSelect.value = this.data.selectedClass;
        }
        
        // Level display
        const levelDisplay = document.getElementById('level-display');
        if (levelDisplay) {
            levelDisplay.textContent = this.data.level;
        }
        
        // Weapon fields
        this.populateWeaponFields('primary', 'primaryWeapon');
        this.populateWeaponFields('secondary', 'secondaryWeapon');
        
        // Armor fields
        this.populateArmorFields();
        
        // Inventory weapon fields
        this.populateInventoryWeaponFields();
        
        // Experience texts
        const textAreas = document.querySelectorAll('.experience-textarea');
        textAreas.forEach((textarea, index) => {
            if (this.data.experience[index] !== undefined) {
                textarea.value = this.data.experience[index];
            }
        });
    }
    
    populateWeaponFields(prefix, dataKey) {
        const fields = ['name', 'trait', 'damage', 'feature'];
        fields.forEach(field => {
            const element = document.getElementById(`${prefix}-weapon-${field}`);
            if (element && this.data[dataKey] && this.data[dataKey][field] !== undefined) {
                element.value = this.data[dataKey][field];
            }
        });
    }
    
    populateArmorFields() {
        const fields = ['name', 'thresholds', 'score', 'feature'];
        fields.forEach(field => {
            const element = document.getElementById(`armor-${field}`);
            if (element && this.data.armor && this.data.armor[field] !== undefined) {
                element.value = this.data.armor[field];
            }
        });
    }
    
    populateInventoryWeaponFields() {
        for (let i = 0; i < 2; i++) {
            const weapon = this.data.inventoryWeapons[i];
            if (!weapon) continue;
            
            const fields = ['name', 'trait', 'damage', 'feature'];
            fields.forEach(field => {
                const element = document.getElementById(`inv-weapon-${i + 1}-${field}`);
                if (element && weapon[field] !== undefined) {
                    element.value = weapon[field];
                }
            });
            
            // Set weapon type radio
            if (weapon.type) {
                const radio = document.getElementById(`inv-weapon-${i + 1}-${weapon.type}`);
                if (radio) {
                    radio.checked = true;
                }
            }
        }
    }
    
    updateInteractiveElements() {
        // Update HP boxes
        this.updateBoxes('hp-boxes', this.data.hp, 'hp-box');
        
        // Update Stress boxes
        this.updateBoxes('stress-boxes', this.data.stress, 'stress-box');
        
        // Update Hope diamonds
        this.updateBoxes('hope-track', this.data.hope, 'hope-diamond');
        
        // Update Experience texts
        const textAreas = document.querySelectorAll('.experience-textarea');
        textAreas.forEach((textarea, index) => {
            if (this.data.experience[index] !== undefined) {
                textarea.value = this.data.experience[index];
            }
        });
        
        // Update Gold circles
        this.updateBoxes('gold-handfuls', this.data.goldHandfuls, 'gold-circle');
        this.updateBoxes('gold-bags', this.data.goldBags, 'gold-circle');
        this.updateBoxes('gold-chest', this.data.goldChest, 'gold-circle');
        
        // Update Proficiency circles
        this.updateBoxes('proficiency-circles', this.data.proficiency, 'proficiency-circle');
        
        // Update Armor boxes
        this.updateBoxes('armor-boxes', this.data.armorBoxes, 'armor-box');
    }
    
    updateBoxes(containerId, dataArray, className) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const boxes = container.querySelectorAll(`.${className}`);
        boxes.forEach((box, index) => {
            if (dataArray[index]) {
                box.classList.add('filled');
            } else {
                box.classList.remove('filled');
            }
        });
    }
    
    loadCards() {
        // Load race card
        if (this.data.cards.race) {
            const raceSlot = document.querySelector('[data-type="race"][data-index="0"]');
            if (raceSlot) {
                this.setCardImageFromPath(raceSlot, this.data.cards.race, 'race', 0);
            }
        }
        
        // Load community card
        if (this.data.cards.community) {
            const communitySlot = document.querySelector('[data-type="community"][data-index="0"]');
            if (communitySlot) {
                this.setCardImageFromPath(communitySlot, this.data.cards.community, 'community', 0);
            }
        }
        
        // Load class cards
        this.data.cards.class.forEach((cardData, index) => {
            if (cardData) {
                const classSlot = document.querySelector(`[data-type="class"][data-index="${index}"]`);
                if (classSlot) {
                    this.setCardImageFromPath(classSlot, cardData, 'class', index);
                }
            }
        });
        
        // Load domain cards
        this.data.cards.domains.forEach((cardData, index) => {
            if (cardData) {
                const domainSlot = document.querySelector(`[data-type="domain"][data-index="${index}"]`);
                if (domainSlot) {
                    this.setCardImageFromPath(domainSlot, cardData, 'domain', index);
                }
            }
        });
        
        // Load vault cards
        this.data.cards.vault.forEach((cardData, index) => {
            if (cardData) {
                const vaultSlot = document.querySelector(`[data-type="vault"][data-index="${index}"]`);
                if (vaultSlot) {
                    this.setCardImageFromPath(vaultSlot, cardData, 'vault', index);
                }
            }
        });
    }

    setCardImageFromPath(slot, cardPath, type, index) {
        const cardName = cardPath.split('/').pop();
        const imagePath = `Cards/${cardPath}`;
        
        // Criar elemento de imagem
        const img = document.createElement('img');
        img.src = imagePath;
        img.className = 'card-image';
        img.alt = cardName;
        img.onerror = function() {
            this.style.display = 'none';
            const fallback = document.createElement('div');
            fallback.className = 'card-fallback';
            fallback.innerHTML = `
                <div style="text-align: center; padding: 10px;">
                    <div style="font-size: 0.8em; margin-top: 10px;">${cardName.replace('.jpg', '')}</div>
                    <div style="font-size: 0.7em; color: #666; margin-top: 5px;">[Imagem salva]</div>
                </div>
            `;
            this.parentNode.appendChild(fallback);
        };
        
        const placeholder = slot.querySelector('.card-placeholder');
        placeholder.style.display = 'none';
        
        // Remover conteúdo existente se houver
        const existingImg = slot.querySelector('.card-image');
        const existingFallback = slot.querySelector('.card-fallback');
        if (existingImg) existingImg.remove();
        if (existingFallback) existingFallback.remove();
        
        slot.appendChild(img);
        slot.classList.add('has-image');
    }
    
    updateCardDisplays() {
        // Clear all card images first
        document.querySelectorAll('.card-slot').forEach(slot => {
            const img = slot.querySelector('.card-image');
            const fallback = slot.querySelector('.card-fallback');
            const placeholder = slot.querySelector('.card-placeholder');
            
            if (img) {
                img.remove();
            }
            if (fallback) {
                fallback.remove();
            }
            
            slot.classList.remove('has-image');
            if (placeholder) {
                placeholder.style.display = 'flex';
            }
        });
        
        // Then reload all cards
        this.loadCards();
    }
    
    updateAllCounterDisplays() {
        for (let i = 0; i < 10; i++) {
            this.updateAbilityCounterDisplay(i);
        }
    }
    
    clearCharacter() {
        // Reset data to defaults
        this.data = {
            characterName: '',
            pronouns: '',
            heritage: '',
            selectedClass: '',
            classSubclass: '',
            level: 1,
            evasion: 10,
            armor: 10,
            armorBoxes: Array(12).fill(false),
            agility: 0,
            strength: 0,
            finesse: 0,
            instinct: 0,
            presence: 0,
            knowledge: 0,
            minorDamage: '',
            majorDamage: '',
            severeDamage: '',
            hp: Array(12).fill(false),
            stress: Array(12).fill(false),
            hope: Array(6).fill(false),
            experience: ['', '', '', '', ''], // Array de strings vazias
            goldHandfuls: Array(8).fill(false),
            goldBags: Array(8).fill(false),
            goldChest: Array(1).fill(false),
            proficiency: Array(5).fill(false),
            hopeFeature: '',
            classFeature: '',
            inventory: '',
            primaryWeapon: { name: '', trait: '', damage: '', feature: '' },
            secondaryWeapon: { name: '', trait: '', damage: '', feature: '' },
            armor: { name: '', thresholds: '', score: '', feature: '' },
            inventoryWeapons: [
                { name: '', trait: '', damage: '', feature: '', type: '' },
                { name: '', trait: '', damage: '', feature: '', type: '' }
            ],
            cards: {
                race: null,
                community: null,
                class: [null, null, null],
                domains: [null, null, null, null, null],
                vault: [null, null, null, null, null]
            },
            tiers: {
                tier2: {
                    checkedBoxes: [],
                    maxChecks: 6
                },
                tier3: {
                    checkedBoxes: [],
                    maxChecks: 6
                },
                tier4: {
                    checkedBoxes: [],
                    maxChecks: 6
                }
            },
            abilityCounters: Array(10).fill(0)
        };

        // Reset displays
        this.updateAllCounterDisplays();

        // Limpar checkboxes dos tiers
        document.querySelectorAll('.tier input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear all form fields
        document.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.type === 'radio') {
                field.checked = false;
            } else if (field.type === 'select-one') {
                field.selectedIndex = 0;
            } else {
                field.value = '';
            }
        });
        
        // Clear all cards
        this.updateCardDisplays();
        
        // Reset interactive elements
        this.updateInteractiveElements();
        this.updateAvailableDomains();
        this.updateTierCounters();
        
        // Clear localStorage
        localStorage.removeItem('daggerheart-character');
    }

    updateTierCounters() {
        const tiers = ['2', '3', '4'];
        
        tiers.forEach(tier => {
            const tierKey = `tier${tier}`;
            const counterElement = document.querySelector(`.tier[data-tier="${tier}"] .tier-counter .current`);
            
            if (counterElement) {
                // Calcular pontos gastos em vez de apenas contar checkboxes
                const pointsSpent = this.calculateTierPoints(this.data.tiers[tierKey].checkedBoxes, tier);
                counterElement.textContent = pointsSpent;
                
                // Mudar cor se estiver perto do limite
                if (pointsSpent >= this.data.tiers[tierKey].maxChecks) {
                    counterElement.style.color = '#dc3545';
                } else {
                    counterElement.style.color = '#28a745';
                }
            }
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#007bff',
            warning: '#ffc107'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the character sheet when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.character = new DaggerheartCharacter();
    
    // Add smooth scrolling to cards section
    const cardsSection = document.getElementById('cards-section');
    if (cardsSection) {
        // Add a scroll indicator or button if needed
        const scrollToCards = () => {
            cardsSection.scrollIntoView({ behavior: 'smooth' });
        };
        
        // You can add a button or trigger this on scroll
        window.scrollToCards = scrollToCards;
    }
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DaggerheartCharacter;
}

// Funções para forçar imagens grandes no modal
function forceLargeImagesInModal() {
    // Aguarde o modal abrir
    setTimeout(() => {
        const modalImages = document.querySelectorAll('.modal .card-preview');
        
        modalImages.forEach(img => {
            // Forçar atributos de tamanho
            img.style.width = 'auto';
            img.style.height = 'auto';
            img.style.minWidth = '280px';
            img.style.minHeight = '280px';
            img.style.maxWidth = 'none';
            img.style.maxHeight = 'none';
            img.style.objectFit = 'contain';
            img.style.transform = 'scale(1.5)';
            img.style.transformOrigin = 'center';
            
            // Se a imagem já foi carregada, redimensione
            if (img.complete) {
                resizeImage(img);
            } else {
                img.onload = function() {
                    resizeImage(this);
                };
            }
        });
    }, 100); // Pequeno delay para garantir que o modal está aberto
}

function resizeImage(imgElement) {
    // Tente várias abordagens para aumentar a imagem
    const container = imgElement.closest('.card-preview-container');
    if (container) {
        container.style.height = '300px';
        container.style.minHeight = '300px';
    }
    
    // Tente usar o tamanho natural da imagem
    const naturalWidth = imgElement.naturalWidth;
    const naturalHeight = imgElement.naturalHeight;
    
    if (naturalWidth > 0 && naturalHeight > 0) {
        // Aumente baseado no tamanho original
        const scaleFactor = 2.0; // Dobrar o tamanho
        imgElement.style.width = (naturalWidth * scaleFactor) + 'px';
        imgElement.style.height = (naturalHeight * scaleFactor) + 'px';
    }
}

// Execute quando o modal de seleção de cartas for aberto
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('card-modal');
    
    if (modal) {
        // Observar quando o modal é aberto
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style') {
                    const display = modal.style.display;
                    if (display === 'block' || display === '') {
                        forceLargeImagesInModal();
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    }
    
    // Também forçar ao clicar em qualquer coisa que abra o modal
    document.addEventListener('click', function(e) {
        if (e.target.closest('[onclick*="openCardSelection"]') || 
            e.target.closest('[data-action*="card"]')) {
            setTimeout(forceLargeImagesInModal, 300);
        }
    });
});