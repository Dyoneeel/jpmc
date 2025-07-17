document.addEventListener('DOMContentLoaded', function() {
    
    // --- Module Switching Functionality ---
    const menuItems = document.querySelectorAll('.menu-item');
    const moduleContents = document.querySelectorAll('.module-content');
    const headerTitle = document.querySelector('.header-title');

    menuItems.forEach(item => {
        // Only add module switching to items with a 'data-module' attribute
        if (item.hasAttribute('data-module')) {
            item.addEventListener('click', function() {
                const module = this.getAttribute('data-module');

                // Don't reactivate the active item
                if (this.classList.contains('active')) return;
                
                // Update active menu item
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Update header title
                const title = this.querySelector('span').textContent;
                headerTitle.textContent = title;
                
                // Show corresponding module content
                moduleContents.forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(module).classList.add('active');
            });
        }
    });

    // --- Dropdown Functionality for Inventory ---
    const inventoryDropdown = document.getElementById('inventoryDropdown');
    const inventoryDropdownMenu = document.getElementById('inventoryDropdownMenu');

    if (inventoryDropdown) {
        inventoryDropdown.addEventListener('click', function() {
            inventoryDropdownMenu.classList.toggle('open');
            this.querySelector('.fa-chevron-down').classList.toggle('fa-rotate-180');
        });
    }

    // --- Product List Column Functionality in Inventory Dropdown ---
    const productListDropdownItem = document.getElementById('productListDropdownItem');
    if (productListDropdownItem) {
        productListDropdownItem.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent dropdown from closing immediately if needed

            // Hide all module contents
            document.querySelectorAll('.module-content').forEach(content => {
                content.classList.remove('active');
            });

            // Show the product list module
            const productListModule = document.getElementById('productListModule');
            if (productListModule) {
                productListModule.classList.add('active');
            }

            // Optionally update header title
            const headerTitle = document.querySelector('.header-title');
            if (headerTitle) {
                headerTitle.textContent = 'Product List';
            }

            // Optionally close the dropdown menu
            inventoryDropdownMenu.classList.remove('open');
            inventoryDropdown.querySelector('.fa-chevron-down').classList.remove('fa-rotate-180');

            // Optionally update menu active state
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            // If you want to highlight the dropdown parent as active:
            inventoryDropdown.classList.add('active');
        });
    }

    // --- Chart Controls Functionality ---
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- Modal functionality for Add Raw Material ---
    const addMaterialModal = document.getElementById('addMaterialModal');
    if (addMaterialModal) {
        document.getElementById('openAddMaterialModal').onclick = function() {
            addMaterialModal.style.display = 'flex';
        };
        document.getElementById('closeAddMaterialModal').onclick = function() {
            addMaterialModal.style.display = 'none';
        };
        document.getElementById('cancelAddMaterialModal').onclick = function() {
            addMaterialModal.style.display = 'none';
        };
        addMaterialModal.onclick = function(e) {
            if (e.target === this) this.style.display = 'none';
        };
    }

    // --- Placeholder Chart Initialization ---
    function initializeCharts() {
        const productionCtx = document.getElementById('productionChart');
        if (productionCtx) {
            productionCtx.parentElement.innerHTML = '<div class="chart-placeholder">Production Trend Chart</div>';
        }
        const inventoryCtx = document.getElementById('inventoryChart');
        if (inventoryCtx) {
            inventoryCtx.parentElement.innerHTML = '<div class="chart-placeholder">Inventory Levels Chart</div>';
        }
    }

    // --- App Initialization ---
    initializeCharts();
    const today = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });

    // --- Product List Modal Functionality for Finished Goods ---
    // Add Product Modal
    const addProductModal = document.getElementById('addProductModal');
    const openAddProductModal = document.getElementById('openAddProductModal');
    const closeAddProductModal = document.getElementById('closeAddProductModal');
    const cancelAddProductModal = document.getElementById('cancelAddProductModal');

    if (openAddProductModal && addProductModal) {
        openAddProductModal.addEventListener('click', () => {
            addProductModal.style.display = 'flex';
        });
    }
    if (closeAddProductModal && addProductModal) {
        closeAddProductModal.addEventListener('click', () => {
            addProductModal.style.display = 'none';
        });
    }
    if (cancelAddProductModal && addProductModal) {
        cancelAddProductModal.addEventListener('click', () => {
            addProductModal.style.display = 'none';
        });
    }
    if (addProductModal) {
        addProductModal.addEventListener('click', (e) => {
            if (e.target === addProductModal) {
                addProductModal.style.display = 'none';
            }
        });
    }

    // View Product Modal
    const viewProductModal = document.getElementById('viewProductModal');
    const closeViewProductModal = document.getElementById('closeViewProductModal');
    const productImageSlider = document.getElementById('productImageSlider');
    const prevImageBtn = document.getElementById('prevImage');
    const nextImageBtn = document.getElementById('nextImage');
    let currentSlide = 0;

    // Product details for view modal (with images)
    const productDetailsView = {
        'FP-001': {
            name: '40 SLX Stand cap',
            code: 'FP-001',
            category: 'Plastic Components',
            process: 'Injection Molding',
            images: ['images/SLX1.png', 'images/SLX2.png', 'images/SLX3.png']
        },
        'FP-002': {
            name: 'GAS KNOB',
            code: 'FP-002',
            category: 'Plastic Components',
            process: 'Injection Molding',
            images: ['images/GAS-KNOB1.png', 'images/GAS-KNOB2.png', 'images/GAS-KNOB3.png']
        },
        'FP-003': {
            name: 'SWITCH KNOB',
            code: 'FP-003',
            category: 'Plastic Components',
            process: 'Injection Molding',
            images: ['images/SWITCH-KNOB1.png', 'images/SWITCH-KNOB2.png', 'images/SWITCH-KNOB3.png']
        },
        'FP-004': {
            name: 'PLASTIC YELLOW CORE',
            code: 'FP-004',
            category: 'Plastic Components',
            process: 'Extrusion',
            images: ['images/fp003_1.jpg', 'images/fp003_2.jpg', 'images/fp003_3.jpg']
        },
        'FP-005': {
            name: 'PLASTIC CORE',
            code: 'FP-005',
            category: 'Plastic Components',
            process: 'Extrusion',
            images: ['images/fp003_1.jpg', 'images/fp003_2.jpg', 'images/fp003_3.jpg']
        }
    };

    document.querySelectorAll('.view-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = productDetailsView[productId];
            if (product) {
                document.getElementById('productName').textContent = product.name;
                document.getElementById('productCode').textContent = product.code;
                document.getElementById('productCategory').textContent = product.category;
                document.getElementById('productProcess').textContent = product.process;

                // Populate slider images
                productImageSlider.innerHTML = product.images.map(img => `<img src="${img}" alt="${product.name}" style="width:100%;">`).join('');
                currentSlide = 0;
                productImageSlider.style.transform = `translateX(0)`;

                viewProductModal.style.display = 'flex';
            }
        });
    });

    if (closeViewProductModal && viewProductModal) {
        closeViewProductModal.addEventListener('click', () => {
            viewProductModal.style.display = 'none';
        });
    }

    if (prevImageBtn && nextImageBtn && productImageSlider) {
        prevImageBtn.addEventListener('click', () => {
            const slides = productImageSlider.children.length;
            currentSlide = (currentSlide - 1 + slides) % slides;
            productImageSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
        });
        nextImageBtn.addEventListener('click', () => {
            const slides = productImageSlider.children.length;
            currentSlide = (currentSlide + 1) % slides;
            productImageSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
        });
    }

    // Edit Product Modal
    const editProductModal = document.getElementById('editProductModal');
    const closeEditProductModal = document.getElementById('closeEditProductModal');
    const cancelEditProductModal = document.getElementById('cancelEditProductModal');
    const saveEditProduct = document.getElementById('saveEditProduct');

    // Product details for edit modal
    const productDetailsEdit = {
        'FP-001': {
            name: '40 SLX Stand cap',
            code: 'FP-001',
            category: 'Plastic Components',
            materials: ['PP PROPILINAS'],
            unit: 'Bags',
            weight: 1.5,
            process: 'Injection Molding'
        },
        'FP-002': {
            name: 'GAS KNOB',
            code: 'FP-002',
            category: 'Plastic Components',
            materials: ['NYLON'],
            unit: 'Bags',
            weight: 2.0,
            process: 'Injection Molding'
        },
        'FP-003': {
            name: 'SWITCH KNOB',
            code: 'FP-003',
            category: 'Plastic Components',
            materials: ['ABS'],
            unit: 'Bags',
            weight: 1.2,
            process: 'Injection Molding'
        },
        'FP-004': {
            name: 'PLASTIC YELLOW CORE',
            code: 'FP-004',
            category: 'Plastic Components',
            materials: ['POLYSTYRENE CLEAR'],
            unit: 'Bags',
            weight: 3.0,
            process: 'Extrusion'
        },
        'FP-005': {
            name: 'PLASTIC CORE',
            code: 'FP-005',
            category: 'Plastic Components',
            materials: ['HIPS H-IMPACT'],
            unit: 'Bags',
            weight: 2.5,
            process: 'Extrusion'
        }
    };

    document.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const product = productDetailsEdit[productId];
            if (product) {
                document.getElementById('editProductName').value = product.name;
                document.getElementById('editProductCode').value = product.code;
                document.getElementById('editProductCategory').value = product.category;
                // Set multiple select value for materials
                const materialsSelect = document.getElementById('editProductMaterials');
                Array.from(materialsSelect.options).forEach(opt => {
                    opt.selected = product.materials.includes(opt.value);
                });
                document.getElementById('editProductUnit').value = product.unit;
                document.getElementById('editProductWeight').value = product.weight;
                document.getElementById('editProductProcess').value = product.process;

                editProductModal.style.display = 'flex';
            }
        });
    });

    if (closeEditProductModal && editProductModal) {
        closeEditProductModal.addEventListener('click', () => {
            editProductModal.style.display = 'none';
        });
    }
    if (cancelEditProductModal && editProductModal) {
        cancelEditProductModal.addEventListener('click', () => {
            editProductModal.style.display = 'none';
        });
    }
    if (saveEditProduct && editProductModal) {
        saveEditProduct.addEventListener('click', () => {
            // Save changes logic here
            editProductModal.style.display = 'none';
        });
    }

    // Product List Search Functionality
    const productSearchInput = document.getElementById('productSearchInput');
    const productTable = document.getElementById('productTable');
    if (productSearchInput && productTable) {
        const productRows = productTable.querySelectorAll('tbody tr');
        productSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            productRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    // --- Raw Materials Modal Functionality ---
    // Demo data for raw materials (for view/edit modals)
    const rawMaterialDetails = {
        'RM-001': {
            name: 'PP PROPILINAS',
            code: 'RM-001',
            category: 'Resins',
            stock: '15,500 kg',
            location: 'Plant 1',
            status: 'In Stock',
            images: ['images/pp1.png', 'images/pp2.png', 'images/pp3.png']
        },
        'RM-002': {
            name: 'NYLON',
            code: 'RM-002',
            category: 'Resins',
            stock: '0 kg',
            location: 'Plant 1',
            status: 'Out of Stock',
            images: ['images/nylon1.png', 'images/nylon2.png', 'images/nylon3.png']
        },
        'RM-003': {
            name: 'ABS',
            code: 'RM-003',
            category: 'Resins',
            stock: '2,000 kg',
            location: 'Plant 2',
            status: 'In Stock',
            images: ['images/abs1.png', 'images/abs2.png', 'images/abs3.png']
        },
        'RM-004': {
            name: 'POLYSTYRENE CLEAR',
            code: 'RM-004',
            category: 'Resins',
            stock: '500 kg',
            location: 'Plant 2',
            status: 'In Stock',
            images: ['images/ps1.png', 'images/ps2.png', 'images/ps3.png']
        },
        'RM-005': {
            name: 'HIPS H-IMPACT',
            code: 'RM-005',
            category: 'Resins',
            stock: '0 kg',
            location: 'Plant 1',
            status: 'Out of Stock',
            images: ['images/hips1.png', 'images/hips2.png', 'images/hips3.png']
        }
    };

    // View Raw Material Modal
    const viewRawMaterialModal = document.getElementById('viewRawMaterialModal');
    const closeViewRawMaterialModal = document.getElementById('closeViewRawMaterialModal');
    const rawMaterialImageSlider = document.getElementById('rawMaterialImageSlider');
    const prevRawImageBtn = document.getElementById('prevRawImage');
    const nextRawImageBtn = document.getElementById('nextRawImage');
    let currentRawSlide = 0;

    document.querySelectorAll('.view-raw-btn').forEach(button => {
        button.addEventListener('click', function() {
            const rawId = this.getAttribute('data-raw-id');
            const raw = rawMaterialDetails[rawId];
            if (raw) {
                document.getElementById('rawMaterialName').textContent = raw.name;
                document.getElementById('rawMaterialCode').textContent = raw.code;
                document.getElementById('rawMaterialCategory').textContent = raw.category;
                document.getElementById('rawMaterialStock').textContent = raw.stock;
                document.getElementById('rawMaterialLocation').textContent = raw.location;
                document.getElementById('rawMaterialStatus').textContent = raw.status;
                // Populate slider images
                if (rawMaterialImageSlider) {
                    rawMaterialImageSlider.innerHTML = raw.images.map(img => `<img src=\"${img}\" alt=\"${raw.name}\" style=\"width:100%;\">`).join('');
                    currentRawSlide = 0;
                    rawMaterialImageSlider.style.transform = `translateX(0)`;
                }
                viewRawMaterialModal.style.display = 'flex';
            }
        });
    });
    if (closeViewRawMaterialModal && viewRawMaterialModal) {
        closeViewRawMaterialModal.addEventListener('click', () => {
            viewRawMaterialModal.style.display = 'none';
        });
    }
    if (viewRawMaterialModal) {
        viewRawMaterialModal.addEventListener('click', (e) => {
            if (e.target === viewRawMaterialModal) {
                viewRawMaterialModal.style.display = 'none';
            }
        });
    }
    if (prevRawImageBtn && nextRawImageBtn && rawMaterialImageSlider) {
        prevRawImageBtn.addEventListener('click', () => {
            const slides = rawMaterialImageSlider.children.length;
            currentRawSlide = (currentRawSlide - 1 + slides) % slides;
            rawMaterialImageSlider.style.transform = `translateX(-${currentRawSlide * 100}%)`;
        });
        nextRawImageBtn.addEventListener('click', () => {
            const slides = rawMaterialImageSlider.children.length;
            currentRawSlide = (currentRawSlide + 1) % slides;
            rawMaterialImageSlider.style.transform = `translateX(-${currentRawSlide * 100}%)`;
        });
    }

    // Edit Raw Material Modal
    const editRawMaterialModal = document.getElementById('editRawMaterialModal');
    const closeEditRawMaterialModal = document.getElementById('closeEditRawMaterialModal');
    const cancelEditRawMaterialModal = document.getElementById('cancelEditRawMaterialModal');
    const saveEditRawMaterial = document.getElementById('saveEditRawMaterial');
    document.querySelectorAll('.edit-raw-btn').forEach(button => {
        button.addEventListener('click', function() {
            const rawId = this.getAttribute('data-raw-id');
            const raw = rawMaterialDetails[rawId];
            if (raw) {
                document.getElementById('editRawMaterialName').value = raw.name;
                document.getElementById('editRawMaterialCode').value = raw.code;
                document.getElementById('editRawMaterialCategory').value = raw.category;
                document.getElementById('editRawMaterialStock').value = parseInt(raw.stock.replace(/[^\d]/g, ''));
                document.getElementById('editRawMaterialLocation').value = raw.location;
                document.getElementById('editRawMaterialStatus').value = raw.status;
                editRawMaterialModal.style.display = 'flex';
            }
        });
    });
    if (closeEditRawMaterialModal && editRawMaterialModal) {
        closeEditRawMaterialModal.addEventListener('click', () => {
            editRawMaterialModal.style.display = 'none';
        });
    }
    if (cancelEditRawMaterialModal && editRawMaterialModal) {
        cancelEditRawMaterialModal.addEventListener('click', () => {
            editRawMaterialModal.style.display = 'none';
        });
    }
    if (saveEditRawMaterial && editRawMaterialModal) {
        saveEditRawMaterial.addEventListener('click', () => {
            // Save changes logic here (not implemented)
            editRawMaterialModal.style.display = 'none';
        });
    }
    if (editRawMaterialModal) {
        editRawMaterialModal.addEventListener('click', (e) => {
            if (e.target === editRawMaterialModal) {
                editRawMaterialModal.style.display = 'none';
            }
        });
    }

    // --- Raw Materials Search Functionality ---
    const rawMaterialSearchInput = document.getElementById('rawMaterialSearchInput');
    const rawMaterialTable = document.getElementById('rawMaterialTable');
    if (rawMaterialSearchInput && rawMaterialTable) {
        const rawRows = rawMaterialTable.querySelectorAll('tbody tr');
        rawMaterialSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            rawRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});
