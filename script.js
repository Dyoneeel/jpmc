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

        // Notification functionality
        document.querySelector('.notifications').addEventListener('click', function() {
            alert('You have 5 new notifications:\n1. Polypropylene Resin stock critical\n2. PVC Powder reorder needed\n3. Production order PO-001 completed\n4. New supplier application received\n5. Scheduled maintenance for Extruder Line 2');
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
        });

        // Modal functionality for Add Raw Material
    document.getElementById('openAddMaterialModal').onclick = function() {
        document.getElementById('addMaterialModal').style.display = 'flex';
    };
    document.getElementById('closeAddMaterialModal').onclick = function() {
        document.getElementById('addMaterialModal').style.display = 'none';
    };
    document.getElementById('cancelAddMaterialModal').onclick = function() {
        document.getElementById('addMaterialModal').style.display = 'none';
    };
    // Optional: Close modal when clicking outside modal-content
    document.getElementById('addMaterialModal').onclick = function(e) {
        if (e.target === this) this.style.display = 'none';
    };

    // Add Raw Material - Save and update table
    document.getElementById('saveMaterialBtn').onclick = function() {
        // Collect form values
        const name = document.getElementById('materialNameInput').value.trim();
        const code = document.getElementById('materialCodeInput').value.trim();
        const category = document.getElementById('categoryInput').value;
        const unit = document.getElementById('unitInput').value;
        const quantity = document.getElementById('quantityInput').value.trim();
        const minLevel = document.getElementById('minLevelInput').value.trim();
        const reorderQty = document.getElementById('reorderQtyInput').value.trim();
        const unitCost = document.getElementById('unitCostInput').value.trim();
        // const supplier = document.getElementById('supplierInput').value; // Not shown in table
        // const leadTime = document.getElementById('leadTimeInput').value; // Not shown in table
        // const location = document.getElementById('locationInput').value; // Not shown in table

        // Calculate total value
        let totalValue = '';
        if (quantity && unitCost) {
            totalValue = '$' + (parseFloat(quantity) * parseFloat(unitCost)).toLocaleString();
        } else {
            totalValue = '';
        }

        // Determine status
        let status = '';
        if (quantity && minLevel) {
            const qtyNum = parseFloat(quantity);
            const minNum = parseFloat(minLevel);
            if (qtyNum <= 0) {
                status = '<span class="status-badge critical">Out of Stock</span>';
            } else if (qtyNum < minNum) {
                status = '<span class="status-badge low-stock">Low Stock</span>';
            } else {
                status = '<span class="status-badge completed">In Stock</span>';
            }
        }

        // Format quantity, minLevel, reorderQty with unit
        const quantityDisplay = quantity ? `${parseFloat(quantity).toLocaleString()} ${unit}` : '';
        const minLevelDisplay = minLevel ? `${parseFloat(minLevel).toLocaleString()} ${unit}` : '';
        const reorderQtyDisplay = reorderQty ? `${parseFloat(reorderQty).toLocaleString()} ${unit}` : '';
        const unitCostDisplay = unitCost ? `$${parseFloat(unitCost).toFixed(2)}` : '';

        // Create new row HTML
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${code}</td>
            <td>${name}</td>
            <td>${category}</td>
            <td>${quantityDisplay}</td>
            <td>${minLevelDisplay}</td>
            <td>${reorderQtyDisplay}</td>
            <td>${unitCostDisplay}</td>
            <td>${totalValue}</td>
            <td>${status}</td>
            <td>
                <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;">View</button>
                <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;">Update</button>
            </td>
        `;
        document.getElementById('rawMaterialsTableBody').appendChild(newRow);

        // Optionally, reset form fields
        document.getElementById('materialNameInput').value = '';
        document.getElementById('materialCodeInput').value = '';
        document.getElementById('categoryInput').selectedIndex = 0;
        document.getElementById('unitInput').selectedIndex = 0;
        document.getElementById('quantityInput').value = '';
        document.getElementById('minLevelInput').value = '';
        document.getElementById('reorderQtyInput').value = '';
        document.getElementById('unitCostInput').value = '';
        document.getElementById('supplierInput').selectedIndex = 0;
        document.getElementById('leadTimeInput').value = '';
        document.getElementById('locationInput').selectedIndex = 0;

        // Close modal
        document.getElementById('addMaterialModal').style.display = 'none';
    };
