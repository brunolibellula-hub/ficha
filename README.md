valores alterados foram o tamanho das cartas, que estão no css em card_slot e card_conter

as seguintes modificações foram aplicadas, mas nada para aumentar o tamanho das fontes:
/* AUMENTAR TAMANHO DO MODAL DE SELEÇÃO DE CARTAS */

.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Aumentado */
    gap: 20px; /* Aumentado */
    padding: 15px; /* Aumentado */
}

.card-item {
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 20px; /* Aumentado */
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: white;
    min-height: 300px; /* Aumentado */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.card-item:hover {
    border-color: #8b4513;
    transform: translateY(-3px); /* Aumentado efeito hover */
    box-shadow: 0 6px 20px rgba(139, 69, 19, 0.3); /* Aumentado */
}

.card-preview-container {
    position: relative;
    width: 100%;
    height: 200px; /* Aumentado */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px; /* Aumentado */
    background: #f8f6f3;
    border-radius: 6px; /* Aumentado */
    overflow: hidden;
}

.card-preview {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain; /* Importante: mantém proporção */
}

.card-placeholder-icon,
.folder-icon {
    font-size: 4em; /* Aumentado */
    margin-bottom: 15px; /* Aumentado */
    color: #8b4513;
}

/* Ajustar modal para caber itens maiores */
.modal-body {
    padding: 25px; /* Aumentado */
    max-height: calc(90vh - 80px);
    overflow-y: auto;
}

/* Aumentar tamanho do breadcrumb */
.breadcrumb {
    margin-bottom: 25px; /* Aumentado */
    padding: 15px; /* Aumentado */
    font-size: 1em; /* Aumentado */
}
