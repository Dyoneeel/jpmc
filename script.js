// Module switching functionality
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function() {
                const module = this.getAttribute('data-module');
                
                // Update active menu item
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Update header title
                const title = this.querySelector('span').textContent;
                document.querySelector('.header-title').textContent = title;
                
                // Update breadcrumb
                document.querySelector('.breadcrumb').innerHTML = `
                    <span>Home</span>
                    <i class="fas fa-chevron-right"></i>
                    <span>${title}</span>
                `;
                
                // Show corresponding module content
                document.querySelectorAll('.module-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(module).classList.add('active');
            });
        });

        // Chart controls functionality
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.parentElement.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Search functionality
        document.querySelector('.search-input').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            // Implement search logic here
            console.log('Searching for:', searchTerm);
        });


        // Initialize charts (placeholder)
        function initializeCharts() {
            // Production chart placeholder
            const productionCtx = document.getElementById('productionChart');
            if (productionCtx) {
                productionCtx.style.background = 'linear-gradient(45deg, #f8fafc, #e2e8f0)';
                productionCtx.style.borderRadius = '8px';
                productionCtx.style.display = 'flex';
                productionCtx.style.alignItems = 'center';
                productionCtx.style.justifyContent = 'center';
                productionCtx.innerHTML = '<div style="color: #64748b; font-size: 1.1rem; font-weight: 500;">Production Trend Chart</div>';
            }

            // Inventory chart placeholder
            const inventoryCtx = document.getElementById('inventoryChart');
            if (inventoryCtx) {
                inventoryCtx.style.background = 'linear-gradient(45deg, #f8fafc, #e2e8f0)';
                inventoryCtx.style.borderRadius = '8px';
                inventoryCtx.style.display = 'flex';
                inventoryCtx.style.alignItems = 'center';
                inventoryCtx.style.justifyContent = 'center';
                inventoryCtx.innerHTML = '<div style="color: #64748b; font-size: 1.1rem; font-weight: 500;">Inventory Levels Chart</div>';
            }
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initializeCharts();

            // Set current date for date inputs
            const today = new Date().toISOString().split('T')[0];
            document.querySelectorAll('input[type="date"]').forEach(input => {
                if (!input.value) {
                    input.value = today;
                }
            });

            // Modal functionality
            const addProductModal = document.getElementById('addProductModal');
            const openAddProductModal = document.getElementById('openAddProductModal');
            const closeAddProductModal = document.getElementById('closeAddProductModal');
            const cancelAddProductModal = document.getElementById('cancelAddProductModal');

            openAddProductModal.addEventListener('click', () => {
                addProductModal.style.display = 'flex';
            });

            closeAddProductModal.addEventListener('click', () => {
                addProductModal.style.display = 'none';
            });

            cancelAddProductModal.addEventListener('click', () => {
                addProductModal.style.display = 'none';
            });

            addProductModal.addEventListener('click', (e) => {
                if (e.target === addProductModal) {
                    addProductModal.style.display = 'none';
                }
            });

            // View Product Modal Functionality
            const viewProductModal = document.getElementById('viewProductModal');
            const closeViewProductModal = document.getElementById('closeViewProductModal');
            const productImageSlider = document.getElementById('productImageSlider');
            const prevImageBtn = document.getElementById('prevImage');
            const nextImageBtn = document.getElementById('nextImage');

            let currentSlide = 0;

            document.querySelectorAll('.view-product-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.getAttribute('data-product-id');
                    // Fetch product details dynamically (updated with images folder)
                    const productDetails = {
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
                            process: 'Injection Molding',
                            images: ['images/fp003_1.jpg', 'images/fp003_2.jpg', 'images/fp003_3.jpg']
                        },
                        'FP-005': {
                            name: 'PLASTIC CORE',
                            code: 'FP-005',
                            category: 'Plastic Components',
                            process: 'Injection Molding',
                            images: ['images/fp003_1.jpg', 'images/fp003_2.jpg', 'images/fp003_3.jpg']
                        }
                    };

                    const product = productDetails[productId];
                    if (product) {
                        document.getElementById('productName').textContent = product.name;
                        document.getElementById('productCode').textContent = product.code;
                        document.getElementById('productCategory').textContent = product.category;
                        document.getElementById('productProcess').textContent = product.process;

                        // Populate slider images
                        productImageSlider.innerHTML = product.images.map(img => `<img src="${img}" alt="${product.name}">`).join('');
                        currentSlide = 0;
                        productImageSlider.style.transform = `translateX(0)`;

                        viewProductModal.style.display = 'flex';
                    }
                });
            });

            closeViewProductModal.addEventListener('click', () => {
                viewProductModal.style.display = 'none';
            });

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

            // Edit Product Modal Functionality
            const editProductModal = document.getElementById('editProductModal');
            const closeEditProductModal = document.getElementById('closeEditProductModal');
            const cancelEditProductModal = document.getElementById('cancelEditProductModal');
            const saveEditProduct = document.getElementById('saveEditProduct');

            const productDetails = {
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
                    const product = productDetails[productId];
                    if (product) {
                        document.getElementById('editProductName').value = product.name;
                        document.getElementById('editProductCode').value = product.code;
                        document.getElementById('editProductCategory').value = product.category;
                        document.getElementById('editProductMaterials').value = product.materials.join(', ');
                        document.getElementById('editProductUnit').value = product.unit;
                        document.getElementById('editProductWeight').value = product.weight;
                        document.getElementById('editProductProcess').value = product.process;

                        editProductModal.style.display = 'flex';
                    }
                });
            });

            closeEditProductModal.addEventListener('click', () => {
                editProductModal.style.display = 'none';
            });

            cancelEditProductModal.addEventListener('click', () => {
                editProductModal.style.display = 'none';
            });

            saveEditProduct.addEventListener('click', () => {
                // Save changes logic here
                console.log('Product details saved!');
                editProductModal.style.display = 'none';
            });

            // Product List Search Functionality
            const productSearchInput = document.getElementById('productSearchInput');
            const productTable = document.getElementById('productTable');
            const productRows = productTable.querySelectorAll('tbody tr');

            productSearchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                productRows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    row.style.display = rowText.includes(searchTerm) ? '' : 'none';
                });
            });
        });
                // Save changes logic here
                console.log('Product details saved!');
                editProductModal.style.display = 'none';
            

            // Product List Search Functionality
            const productSearchInput = document.getElementById('productSearchInput');
            const productTable = document.getElementById('productTable');
            const productRows = productTable.querySelectorAll('tbody tr');

            productSearchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                productRows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    row.style.display = rowText.includes(searchTerm) ? '' : 'none';
                });
            });
       
