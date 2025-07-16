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