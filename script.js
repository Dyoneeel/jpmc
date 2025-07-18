document.addEventListener('DOMContentLoaded', function() {
    // Initialize the entire ERP system
    initERP();
});

/**
 * Main initialization function. Calls all other init functions.
 */
function initERP() {
    initSidebarMenu();
    initDashboard();
    initRawMaterials();
    initFinishedGoods();
    initTransactions();
    initReports();
    initModalsAndForms();
    initDatePickers();
}

// =================================================================================
// SIDEBAR AND NAVIGATION
// =================================================================================

function initSidebarMenu() {
    const menuItems = document.querySelectorAll('.menu-item');
    const moduleContents = document.querySelectorAll('.module-content');
    const headerTitle = document.querySelector('.header-title');

    menuItems.forEach(item => {
        if (item.dataset.module) {
            item.addEventListener('click', function(e) {
                if (this.classList.contains('menu-dropdown')) {
                    e.stopPropagation();
                    toggleDropdown(this);
                    return;
                }
                
                const module = this.dataset.module;
                if (this.classList.contains('active')) return;

                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                headerTitle.textContent = this.querySelector('span').textContent;
                moduleContents.forEach(content => content.classList.remove('active'));
                const targetModule = document.getElementById(module);
                if (targetModule) {
                    targetModule.classList.add('active');
                }
            });
        }
    });

    const inventoryDropdown = document.getElementById('inventoryDropdown');
    if (inventoryDropdown) {
        inventoryDropdown.addEventListener('click', () => toggleDropdown(inventoryDropdown));
    }

    // --- Logout Functionality ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Redirect to login.html
            window.location.href = 'login.html';
        });
    }
}

function toggleDropdown(dropdownElement) {
    const dropdownMenu = dropdownElement.nextElementSibling;
    if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
        dropdownMenu.classList.toggle('open');
        dropdownElement.querySelector('.fa-chevron-down').classList.toggle('fa-rotate-180');
    }
}


// =================================================================================
// DASHBOARD MODULE
// =================================================================================

function initDashboard() {
    if (document.getElementById('inventoryMovementChart') && document.getElementById('stockLevelsChart')) {
        initDashboardCharts();
    }
    
    document.querySelectorAll('#dashboard .chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const chartId = this.closest('.chart-container').querySelector('canvas').id;
            updateDashboardCharts(this.textContent.trim(), chartId);
        });
    });
    
    const viewAllBtn = document.querySelector('#dashboard .table-actions .btn-primary');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function() {
            const transactionMenuItem = document.querySelector('.menu-item[data-module="transactions"]');
            if(transactionMenuItem) transactionMenuItem.click();
        });
    }
}

function initDashboardCharts() {
    const inventoryCtx = document.getElementById('inventoryMovementChart').getContext('2d');
    window.inventoryMovementChart = new Chart(inventoryCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Materials In', data: [120, 190, 170, 210, 220, 180],
                    borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2, tension: 0.3, fill: true
                },
                {
                    label: 'Materials Out', data: [80, 120, 150, 180, 190, 170],
                    borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2, tension: 0.3, fill: true
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Quantity (Bags)' } } } }
    });
    
    const stockCtx = document.getElementById('stockLevelsChart').getContext('2d');
    window.stockLevelsChart = new Chart(stockCtx, {
        type: 'bar',
        data: {
            labels: ['PP Propilinas', 'Nylon', 'ABS', 'Polystyrene', 'HIPS H-Impact'],
            datasets: [{
                label: 'Current Stock', data: [9, 1, 1, 9, 70],
                backgroundColor: ['rgba(59, 130, 246, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.7)', 'rgba(234, 179, 8, 0.7)', 'rgba(16, 185, 129, 0.7)'],
                borderWidth: 1
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.raw} Bags` } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Quantity (Bags)' } } } }
    });
}

function updateDashboardCharts(period, chartId) {
    if (chartId === 'inventoryMovementChart') {
        let newDataIn, newDataOut, newLabels;
        switch(period.toLowerCase()) {
            case 'quarter': newLabels = ['Month 1', 'Month 2', 'Month 3']; newDataIn = [220, 240, 210]; newDataOut = [180, 200, 170]; break;
            case 'year': newLabels = ['Q1', 'Q2', 'Q3', 'Q4']; newDataIn = [650, 700, 680, 720]; newDataOut = [550, 600, 580, 620]; break;
            default: newLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']; newDataIn = [50, 60, 70, 40]; newDataOut = [40, 50, 60, 30];
        }
        window.inventoryMovementChart.data.labels = newLabels;
        window.inventoryMovementChart.data.datasets[0].data = newDataIn;
        window.inventoryMovementChart.data.datasets[1].data = newDataOut;
        window.inventoryMovementChart.update();
    }
    if (chartId === 'stockLevelsChart') {
        if (period.toLowerCase() === 'critical') {
            window.stockLevelsChart.data.labels = ['Nylon', 'ABS'];
            window.stockLevelsChart.data.datasets[0].data = [1, 1];
        } else {
            window.stockLevelsChart.data.labels = ['PP Propilinas', 'Nylon', 'ABS', 'Polystyrene', 'HIPS H-Impact'];
            window.stockLevelsChart.data.datasets[0].data = [9, 1, 1, 9, 70];
        }
        window.stockLevelsChart.update();
    }
}

// =================================================================================
// RAW MATERIALS MODULE
// =================================================================================

function initRawMaterials() {
    const searchInput = document.getElementById('rawMaterialSearchInput');
    const table = document.getElementById('rawMaterialTable');
    if (searchInput && table) {
        const tableRows = table.querySelectorAll('tbody tr');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            tableRows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// =================================================================================
// FINISHED GOODS MODULE
// =================================================================================

function initFinishedGoods() {
    const searchInput = document.getElementById('productSearchInput');
    const table = document.getElementById('productTable');
    if (searchInput && table) {
        const tableRows = table.querySelectorAll('tbody tr');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            tableRows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// =================================================================================
// TRANSACTIONS MODULE
// =================================================================================

function initTransactions() {
    const applyFiltersBtn = document.getElementById('applyTransactionFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterTransactions);
    }
}

function filterTransactions() {
    const transType = document.getElementById('transTypeFilter').value;
    const transMaterial = document.getElementById('transMaterialFilter').value;
    const transDateFrom = document.getElementById('transDateFrom').value;
    const transDateTo = document.getElementById('transDateTo').value;
    
    const rows = document.querySelectorAll('#transactionTable tbody tr');
    
    rows.forEach(row => {
        let showRow = true;
        
        const typeBadge = row.cells[4].querySelector('.badge');
        if (transType !== 'all' && typeBadge) {
            const type = typeBadge.textContent.toLowerCase();
            if ((transType === 'in' && type !== 'in') || (transType === 'out' && type !== 'out')) {
                showRow = false;
            }
        }
        
        const materialCell = row.cells[2].textContent.toLowerCase();
        if (transMaterial !== 'all' && !materialCell.includes(transMaterial)) {
            showRow = false;
        }
        
        const dateStr = row.cells[0].textContent;
        const rowDate = new Date(dateStr);
        if (transDateFrom) {
            const fromDate = new Date(transDateFrom);
            if (rowDate < fromDate) showRow = false;
        }
        if (transDateTo) {
            const toDate = new Date(transDateTo);
            if (rowDate > toDate) showRow = false;
        }
        
        row.style.display = showRow ? '' : 'none';
    });
}


// =================================================================================
// REPORTS MODULE
// =================================================================================

function initReports() {
    const reportPeriod = document.getElementById('reportPeriod');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', function() {
            document.querySelectorAll('.custom-range').forEach(group => {
                group.style.display = this.value === 'custom' ? 'block' : 'none';
            });
        });
    }
    
    const generateReportBtn = document.querySelectorAll('#reports #generateReportBtn');
    generateReportBtn.forEach(btn => {
        btn.addEventListener('click', generateReport);
    });
    
    if (document.getElementById('reportChart')) {
        initReportChart();
    }
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    const reportDateFrom = document.getElementById('reportDateFrom').value;
    const reportDateTo = document.getElementById('reportDateTo').value;
    
    const reportTitle = document.querySelector('.report-results h3');
    const reportSummaryItems = document.querySelectorAll('.summary-item p');
    
    let title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;
    let periodText = ` - ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)}`;
    if (reportPeriod === 'custom') {
        periodText = ` - From ${reportDateFrom} to ${reportDateTo}`;
    }
    reportTitle.textContent = title + periodText;

    // Demo data - in a real app, this would be fetched
    reportSummaryItems[0].textContent = (Math.floor(Math.random() * 200) + 100) + " Bags";
    reportSummaryItems[1].textContent = (Math.floor(Math.random() * 50)) + " Bags";
    reportSummaryItems[2].textContent = (Math.floor(Math.random() * 50)) + " Bags";
    reportSummaryItems[3].textContent = (Math.floor(Math.random() * 10)) + " Items";

    updateReportChart(reportType);
}

function initReportChart() {
    const reportCtx = document.getElementById('reportChart').getContext('2d');
    window.reportChart = new Chart(reportCtx, {
        type: 'bar',
        data: {
            labels: ['PP Propilinas', 'Nylon', 'ABS', 'Polystyrene', 'HIPS H-Impact'],
            datasets: [{
                label: 'Current Stock',
                data: [9, 1, 1, 9, 70],
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function updateReportChart(reportType) {
    const chart = window.reportChart;
    if (!chart) return;

    if (reportType === 'transactions') {
        chart.config.type = 'line';
        chart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        chart.data.datasets = [
            { label: 'In', data: [20, 30, 25, 40], borderColor: 'var(--success)', fill: false },
            { label: 'Out', data: [15, 25, 20, 35], borderColor: 'var(--error)', fill: false }
        ];
    } else {
        chart.config.type = 'bar';
        chart.data.labels = ['PP', 'Nylon', 'ABS', 'PS', 'HIPS'];
        chart.data.datasets = [{
            label: 'Stock Level',
            data: [50, 20, 35, 25, 60],
            backgroundColor: 'rgba(59, 130, 246, 0.7)'
        }];
    }
    chart.update();
}


// =================================================================================
// MODALS AND FORMS
// =================================================================================

// --- Data for Modals ---
const productDetailsView = {
    'FP-001': { name: '40 SLX Stand cap', code: 'FP-001', category: 'Plastic Components', process: 'Injection Molding', images: ['images/SLX1.png', 'images/SLX2.png', 'images/SLX3.png'] },
    'FP-002': { name: 'GAS KNOB', code: 'FP-002', category: 'Plastic Components', process: 'Injection Molding', images: ['images/GAS-KNOB1.png', 'images/GAS-KNOB2.png', 'images/GAS-KNOB3.png'] },
    'FP-003': { name: 'SWITCH KNOB', code: 'FP-003', category: 'Plastic Components', process: 'Injection Molding', images: ['images/SWITCH-KNOB1.png', 'images/SWITCH-KNOB2.png', 'images/SWITCH-KNOB3.png'] },
    'FP-004': { name: 'PLASTIC YELLOW CORE', code: 'FP-004', category: 'Plastic Components', process: 'Extrusion', images: ['images/fp003_1.jpg', 'images/fp003_2.jpg', 'images/fp003_3.jpg'] },
    'FP-005': { name: 'PLASTIC CORE', code: 'FP-005', category: 'Plastic Components', process: 'Extrusion', images: ['images/fp003_1.jpg', 'images/fp003_2.jpg', 'images/fp003_3.jpg'] }
};

const productDetailsEdit = {
    'FP-001': { name: '40 SLX Stand cap', code: 'FP-001', category: 'Plastic Components', materials: ['PP PROPILINAS'], unit: 'Bags', weight: 1.5, process: 'Injection Molding' },
    'FP-002': { name: 'GAS KNOB', code: 'FP-002', category: 'Plastic Components', materials: ['NYLON'], unit: 'Bags', weight: 2.0, process: 'Injection Molding' },
    'FP-003': { name: 'SWITCH KNOB', code: 'FP-003', category: 'Plastic Components', materials: ['ABS'], unit: 'Bags', weight: 1.2, process: 'Injection Molding' },
    'FP-004': { name: 'PLASTIC YELLOW CORE', code: 'FP-004', category: 'Plastic Components', materials: ['POLYSTYRENE CLEAR'], unit: 'Bags', weight: 3.0, process: 'Extrusion' },
    'FP-005': { name: 'PLASTIC CORE', code: 'FP-005', category: 'Plastic Components', materials: ['HIPS H-IMPACT'], unit: 'Bags', weight: 2.5, process: 'Extrusion' }
};

const rawMaterialDetails = {
    'RM-001': { name: 'PP PROPILINAS', code: 'RM-001', category: 'Resins', stock: '15,500 kg', location: 'Plant 1', status: 'In Stock', images: ['images/pp1.png', 'images/pp2.png', 'images/pp3.png'] },
    'RM-002': { name: 'NYLON', code: 'RM-002', category: 'Resins', stock: '0 kg', location: 'Plant 1', status: 'Out of Stock', images: ['images/nylon1.png', 'images/nylon2.png', 'images/nylon3.png'] },
    'RM-003': { name: 'ABS', code: 'RM-003', category: 'Resins', stock: '2,000 kg', location: 'Plant 2', status: 'In Stock', images: ['images/abs1.png', 'images/abs2.png', 'images/abs3.png'] },
    'RM-004': { name: 'POLYSTYRENE CLEAR', code: 'RM-004', category: 'Resins', stock: '500 kg', location: 'Plant 2', status: 'In Stock', images: ['images/ps1.png', 'images/ps2.png', 'images/ps3.png'] },
    'RM-005': { name: 'HIPS H-IMPACT', code: 'RM-005', category: 'Resins', stock: '0 kg', location: 'Plant 1', status: 'Out of Stock', images: ['images/hips1.png', 'images/hips2.png', 'images/hips3.png'] }
};


function initModalsAndForms() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        const closeButton = modal.querySelector('.close-modal');
        if (closeButton) {
            closeButton.onclick = () => modal.style.display = 'none';
        }
        modal.onclick = (e) => {
            if (e.target === modal) modal.style.display = 'none';
        };
    });

    setupModal('addMaterialModal', 'openAddMaterialModal', 'cancelAddMaterialModal');
    setupModal('addProductModal', 'openAddProductModal', 'cancelAddProductModal');
    setupModal('addTransactionModal', 'addTransactionBtn', 'cancelAddTransactionBtn');
    
    initViewProductModal();
    initEditProductModal();
    initViewRawMaterialModal();
    initEditRawMaterialModal();

    const addTransactionForm = document.getElementById('addTransactionForm');
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Transaction recorded successfully!');
            this.reset();
            document.getElementById('addTransactionModal').style.display = 'none';
        });
    }
}

function setupModal(modalId, openBtnId, cancelBtnId) {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const cancelBtn = document.getElementById(cancelBtnId);

    if (!modal) return;
    if (openBtn) openBtn.onclick = () => modal.style.display = 'flex';
    if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';
}

function initViewProductModal() {
    document.querySelectorAll('.view-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const product = productDetailsView[this.dataset.productId];
            if (product) {
                document.getElementById('productName').textContent = product.name;
                document.getElementById('productCode').textContent = product.code;
                document.getElementById('productCategory').textContent = product.category;
                document.getElementById('productProcess').textContent = product.process;
                setupImageSlider('productImageSlider', product.images, 'prevImage', 'nextImage');
                document.getElementById('viewProductModal').style.display = 'flex';
            }
        });
    });
}

function initEditProductModal() {
    document.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const product = productDetailsEdit[this.dataset.productId];
            if (product) {
                document.getElementById('editProductName').value = product.name;
                document.getElementById('editProductCode').value = product.code;
                document.getElementById('editProductCategory').value = product.category;
                document.getElementById('editProductUnit').value = product.unit;
                document.getElementById('editProductWeight').value = product.weight;
                document.getElementById('editProductProcess').value = product.process;
                const materialsSelect = document.getElementById('editProductMaterials');
                Array.from(materialsSelect.options).forEach(opt => {
                    opt.selected = product.materials.includes(opt.value);
                });
                document.getElementById('editProductModal').style.display = 'flex';
            }
        });
    });
}

function initViewRawMaterialModal() {
    document.querySelectorAll('.view-raw-btn').forEach(button => {
        button.addEventListener('click', function() {
            const raw = rawMaterialDetails[this.dataset.rawId];
            if (raw) {
                document.getElementById('rawMaterialName').textContent = raw.name;
                document.getElementById('rawMaterialCode').textContent = raw.code;
                document.getElementById('rawMaterialCategory').textContent = raw.category;
                document.getElementById('rawMaterialStock').textContent = raw.stock;
                document.getElementById('rawMaterialLocation').textContent = raw.location;
                document.getElementById('rawMaterialStatus').textContent = raw.status;
                setupImageSlider('rawMaterialImageSlider', raw.images, 'prevRawImage', 'nextRawImage');
                document.getElementById('viewRawMaterialModal').style.display = 'flex';
            }
        });
    });
}

function initEditRawMaterialModal() {
    document.querySelectorAll('.edit-raw-btn').forEach(button => {
        button.addEventListener('click', function() {
            const raw = rawMaterialDetails[this.dataset.rawId];
            if (raw) {
                document.getElementById('editRawMaterialName').value = raw.name;
                document.getElementById('editRawMaterialCode').value = raw.code;
                document.getElementById('editRawMaterialCategory').value = raw.category;
                document.getElementById('editRawMaterialStock').value = parseInt(raw.stock.replace(/[^\d]/g, '')) || 0;
                document.getElementById('editRawMaterialLocation').value = raw.location;
                document.getElementById('editRawMaterialStatus').value = raw.status;
                document.getElementById('editRawMaterialModal').style.display = 'flex';
            }
        });
    });
}

function setupImageSlider(sliderId, images, prevBtnId, nextBtnId) {
    const slider = document.getElementById(sliderId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);

    if (!slider || !prevBtn || !nextBtn) return;

    slider.innerHTML = images.map(img => `<img src="${img}" alt="Detail Image" style="width:100%;">`).join('');
    let currentSlide = 0;
    const slides = slider.children;
    if (slides.length === 0) return;

    const updateSlider = () => {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    };

    prevBtn.onclick = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider();
    };

    nextBtn.onclick = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider();
    };

    updateSlider();
}

// =================================================================================
// HELPER FUNCTIONS
// =================================================================================

function initDatePickers() {
    if (typeof flatpickr !== 'undefined') {
        document.querySelectorAll('.datepicker').forEach(input => {
            flatpickr(input, { dateFormat: 'Y-m-d', allowInput: true });
        });
    }
}
