<?php
// index.php

// Start the session to check for login status.
session_start();

// Check if the user is not logged in. If so, redirect to the login page.
if (!isset($_SESSION['loggedin'])) {
    header('Location: login.php');
    exit;
}

// Include the database connection file.
require_once 'db_connect.php';

// Fetch user details from session for display.
$username = htmlspecialchars($_SESSION['username']);
$role = htmlspecialchars($_SESSION['role']);

// --- DATA FETCHING FOR THE DASHBOARD & MODULES ---

// Fetch data for Stat Cards
$total_inventory_value_query = "SELECT SUM(stock_quantity * unit_cost) as total_value FROM raw_materials";
$total_value_result = $conn->query($total_inventory_value_query);
$total_inventory_value = $total_value_result->fetch_assoc()['total_value'] ?? 0;

$materials_in_query = "SELECT SUM(quantity) as total_in FROM transactions WHERE type = 'IN' AND MONTH(transaction_date) = MONTH(CURRENT_DATE())";
$materials_in_result = $conn->query($materials_in_query);
$materials_in = $materials_in_result->fetch_assoc()['total_in'] ?? 0;

$materials_out_query = "SELECT SUM(quantity) as total_out FROM transactions WHERE type = 'OUT' AND MONTH(transaction_date) = MONTH(CURRENT_DATE())";
$materials_out_result = $conn->query($materials_out_query);
$materials_out = $materials_out_result->fetch_assoc()['total_out'] ?? 0;

$low_stock_query = "SELECT COUNT(*) as low_stock_count FROM raw_materials WHERE status = 'Low Stock' OR status = 'Out of Stock'";
$low_stock_result = $conn->query($low_stock_query);
$low_stock_count = $low_stock_result->fetch_assoc()['low_stock_count'] ?? 0;

// Fetch Recent Transactions for Dashboard
$recent_transactions_sql = "
    SELECT t.transaction_date, t.transaction_id_str, rm.name as material_name, t.type, t.quantity, l.name as location_name, t.balance
    FROM transactions t
    JOIN raw_materials rm ON t.raw_material_id = rm.id
    JOIN locations l ON t.location_id = l.id
    ORDER BY t.transaction_date DESC
    LIMIT 5";
$transactions_result = $conn->query($recent_transactions_sql);

// Fetch All Raw Materials with the new code_color column
$raw_materials_sql = "
    SELECT rm.id, rm.name, rm.code_color, c.name as category, rm.stock_quantity, rm.unit_of_measure, l.name as location, rm.status
    FROM raw_materials rm
    LEFT JOIN categories c ON rm.category_id = c.id
    LEFT JOIN locations l ON rm.location_id = l.id
    ORDER BY rm.id";
$raw_materials_result = $conn->query($raw_materials_sql);

// Fetch All Finished Products (Finished Goods)
$products_sql = "
    SELECT p.id, p.product_code, p.name, c.name as category, p.stock_quantity, p.status, GROUP_CONCAT(rm.name SEPARATOR ', ') as materials
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_materials pm ON p.id = pm.product_id
    LEFT JOIN raw_materials rm ON pm.raw_material_id = rm.id
    GROUP BY p.id
    ORDER BY p.id";
$products_result = $conn->query($products_sql);

// Fetch All Transactions for the Transactions Module
$all_transactions_sql = "
    SELECT t.transaction_date, t.transaction_id_str, rm.name as material_name, p.name as product_name, t.type, t.quantity, l.name as location_name, t.balance
    FROM transactions t
    JOIN raw_materials rm ON t.raw_material_id = rm.id
    LEFT JOIN products p ON t.product_id = p.id
    JOIN locations l ON t.location_id = l.id
    ORDER BY t.transaction_date DESC";
$all_transactions_result = $conn->query($all_transactions_sql);

// --- DATA FETCHING FOR MODALS ---
$locations_for_modals = $conn->query("SELECT id, name FROM locations ORDER BY name");
$raw_material_categories_for_modals = $conn->query("SELECT id, name FROM categories WHERE type = 'raw_material' ORDER BY name");
$product_categories_for_modals = $conn->query("SELECT id, name FROM categories WHERE type = 'product' ORDER BY name");
$raw_materials_for_modals = $conn->query("SELECT id, name, code_color FROM raw_materials ORDER BY name");
$products_for_modals = $conn->query("SELECT id, name FROM products ORDER BY name");

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>James Polymer Manufacturing Corporation - Production & Inventory ERP</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="icon" href="logo.png">
</head>
<body>
    <!-- Sidebar Navigation -->
    <div class="sidebar">
        <div class="sidebar-header">
            <div class="company-logo">
                <img src="logo.png" alt="Company Logo" style="width: 60px; height: 60px; border-radius: 12px; object-fit: contain; display: block;">
            </div>
            <div class="company-name">James Polymer</div>
            <div class="company-subtitle">Manufacturing Corporation</div>
        </div>
        
        <div class="sidebar-menu">
            <div class="menu-section">
                <div class="menu-section-title">Inventory Management</div>
                <div class="menu-item active" data-module="dashboard">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </div>

                <div class="menu-item menu-dropdown" id="inventoryDropdown">
                    <i class="fas fa-boxes"></i>
                    <span>Inventory</span>
                    <i class="fas fa-chevron-down"></i>
                </div>

                <div class="dropdown-menu" id="inventoryDropdownMenu">
                    <div class="menu-item" data-module="raw-materials">
                        <i class="fas fa-cubes"></i>
                        <span>Raw Materials</span>
                    </div>
                    <div class="menu-item" data-module="finished-goods">
                        <i class="fas fa-box"></i>
                        <span>Product List</span>
                    </div>
                    <div class="menu-item" data-module="transactions">
                        <i class="fas fa-exchange-alt"></i>
                        <span>Transactions</span>
                    </div>
                </div>

                <div class="menu-item" data-module="reports">
                    <i class="fas fa-chart-bar"></i>
                    <span>Reports</span>
                </div>
            </div>

            <div class="menu-section">
                <div class="menu-section-title">System</div>
                <a href="logout.php" class="menu-item" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </a>
            </div>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
        <div class="header">
            <div class="header-left">
                <h1 class="header-title">Dashboard</h1>
            </div>
           <div class="header-right">
                <div class="user-profile" style="padding: 8px 12px; border-radius: 12px; display: flex; align-items: center;">
                    <i class="fas fa-user-shield" style="font-size: 1.5rem; color: #2563eb; margin-right: 10px;"></i>
                    <span style="font-weight: 600; color: #475569; font-size: 1rem;"><?php echo ucfirst($role); ?></span>
                </div>
            </div>
        </div>

        <div class="content">
            <!-- Dashboard Module -->
            <div class="module-content active" id="dashboard">
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Total Inventory Value</div>
                                <div class="stat-subtitle">Current stock worth</div>
                            </div>
                            <div class="stat-icon blue">
                                <i class="fas fa-boxes"></i>
                            </div>
                        </div>
                        <div class="stat-value">₱<?php echo number_format($total_inventory_value, 2); ?></div>
                        <div class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>5.2% from last month</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Materials In</div>
                                <div class="stat-subtitle">This month</div>
                            </div>
                            <div class="stat-icon green">
                                <i class="fas fa-arrow-circle-down"></i>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo number_format($materials_in); ?> Bags</div>
                        <div class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            <span>12.7% from last month</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Materials Out</div>
                                <div class="stat-subtitle">This month</div>
                            </div>
                            <div class="stat-icon orange">
                                <i class="fas fa-arrow-circle-up"></i>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo number_format($materials_out); ?> Bags</div>
                        <div class="stat-change negative">
                            <i class="fas fa-arrow-down"></i>
                            <span>3.5% from last month</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-header">
                            <div>
                                <div class="stat-title">Low Stock Items</div>
                                <div class="stat-subtitle">Needs attention</div>
                            </div>
                            <div class="stat-icon red">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                        </div>
                        <div class="stat-value"><?php echo $low_stock_count; ?></div>
                        <div class="stat-change negative">
                            <i class="fas fa-arrow-up"></i>
                            <span>3 new alerts today</span>
                        </div>
                    </div>
                </div>
                
                <div class="charts-section">
                    <div class="chart-container">
                        <div class="chart-header">
                            <div class="chart-title">Inventory Movement</div>
                            <div class="chart-controls">
                                <button class="chart-btn active">Month</button>
                                <button class="chart-btn">Quarter</button>
                                <button class="chart-btn">Year</button>
                            </div>
                        </div>
                        <div class="chart-placeholder">
                            <canvas id="inventoryMovementChart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <div class="chart-header">
                            <div class="chart-title">Material Stock Levels</div>
                            <div class="chart-controls">
                                <button class="chart-btn active">All</button>
                                <button class="chart-btn">Critical</button>
                            </div>
                        </div>
                        <div class="chart-placeholder">
                            <canvas id="stockLevelsChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="table-section">
                    <div class="table-header">
                        <div class="table-title">Recent Transactions</div>
                        <div class="table-actions">
                            <button class="btn btn-outline">Export</button>
                            <button class="btn btn-primary">View All</button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction ID</th>
                                    <th>Material</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Location</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                if ($transactions_result && $transactions_result->num_rows > 0) {
                                    while ($row = $transactions_result->fetch_assoc()) {
                                        echo "<tr>";
                                        echo "<td>" . date('m/d/Y', strtotime($row['transaction_date'])) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['transaction_id_str']) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['material_name']) . "</td>";
                                        $badge_class = strtolower($row['type']) === 'out' ? 'out' : 'in';
                                        echo "<td><span class='badge " . $badge_class . "'>" . htmlspecialchars($row['type']) . "</span></td>";
                                        echo "<td>" . htmlspecialchars(number_format($row['quantity'])) . " Bags</td>";
                                        echo "<td>" . htmlspecialchars($row['location_name']) . "</td>";
                                        echo "<td>" . htmlspecialchars(number_format($row['balance'])) . " Bag</td>";
                                        echo "</tr>";
                                    }
                                } else {
                                    echo "<tr><td colspan='7' style='text-align:center;'>No recent transactions found.</td></tr>";
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Raw Materials Module -->
            <div class="module-content" id="raw-materials">
                <div class="table-section">
                    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="search-container" style="position: relative; display: inline-block;">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" id="rawMaterialSearchInput" class="search-input" placeholder="Search raw materials...">
                        </div>
                        <div class="table-title" style="text-align: center; flex-grow: 1;">Raw Materials Inventory</div>
                        <button class="btn btn-primary" id="openAddMaterialModal">
                            <i class="fas fa-plus"></i> Add Material
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table id="rawMaterialTable">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Material Name</th>
                                    <th>Code/Color</th>
                                    <th>Stock</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                if ($raw_materials_result && $raw_materials_result->num_rows > 0) {
                                    $raw_materials_result->data_seek(0); // Reset pointer
                                    $count = 1;
                                    while ($row = $raw_materials_result->fetch_assoc()) {
                                        $status_class = 'completed'; // Default for In Stock
                                        if ($row['status'] == 'Out of Stock') {
                                            $status_class = 'cancelled';
                                        } elseif ($row['status'] == 'Low Stock') {
                                            $status_class = 'pending';
                                        }
                                        echo "<tr>";
                                        echo "<td>" . $count++ . "</td>";
                                        echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                        // Changed Material Code to Code/Color
                                        echo "<td>" . htmlspecialchars($row['code_color']) . "</td>";
                                        echo "<td>" . htmlspecialchars(number_format($row['stock_quantity'], 2)) . " " . htmlspecialchars($row['unit_of_measure']) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['location']) . "</td>";
                                        echo "<td><span class='status-badge " . $status_class . "'>" . htmlspecialchars($row['status']) . "</span></td>";
                                        echo "<td>
                                                <button class='btn btn-outline view-raw-btn' data-raw-id='" . htmlspecialchars($row['id']) . "'>View</button>
                                                <button class='btn btn-primary edit-raw-btn' data-raw-id='" . htmlspecialchars($row['id']) . "'>Edit</button>
                                              </td>";
                                        echo "</tr>";
                                    }
                                } else {
                                     echo "<tr><td colspan='7' style='text-align:center;'>No raw materials found.</td></tr>";
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Finished Goods Module -->
            <div class="module-content" id="finished-goods">
                <div class="table-section">
                    <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="search-container" style="position: relative; display: inline-block;">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" id="productSearchInput" class="search-input" placeholder="Search products...">
                        </div>
                        <div class="table-title" style="text-align: center; flex-grow: 1;">Finished Products</div>
                        <button class="btn btn-primary" id="openAddProductModal">
                            <i class="fas fa-plus"></i> Add New Product
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table id="productTable">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Raw Materials</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                if ($products_result && $products_result->num_rows > 0) {
                                    $products_result->data_seek(0); // Reset pointer
                                    $count = 1;
                                    while ($row = $products_result->fetch_assoc()) {
                                        $status_class = strtolower($row['status']) === 'active' ? 'completed' : 'cancelled';
                                        echo "<tr>";
                                        echo "<td>" . $count++ . "</td>";
                                        echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['category']) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['materials'] ?? 'N/A') . "</td>";
                                        echo "<td>" . htmlspecialchars(number_format($row['stock_quantity'])) . "</td>";
                                        echo "<td><span class='status-badge " . $status_class . "'>" . htmlspecialchars($row['status']) . "</span></td>";
                                        echo "<td>
                                                <button class='btn btn-outline view-product-btn' data-product-id='" . htmlspecialchars($row['product_code']) . "'>View</button>
                                                <button class='btn btn-primary edit-product-btn' data-product-id='" . htmlspecialchars($row['product_code']) . "'>Edit</button>
                                              </td>";
                                        echo "</tr>";
                                    }
                                } else {
                                     echo "<tr><td colspan='7' style='text-align:center;'>No products found.</td></tr>";
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Transactions Module -->
            <div class="module-content" id="transactions">
                <div class="section-header">
                    <h2>Material Transactions</h2>
                    <div class="actions">
                        <button class="btn btn-primary" id="addTransactionBtn">
                            <i class="fas fa-plus"></i> New Transaction
                        </button>
                        <button class="btn btn-outline">
                            <i class="fas fa-file-export"></i> Export
                        </button>
                    </div>
                </div>

                <div class="transaction-filters">
                    <div class="filter-group">
                        <label for="transTypeFilter">Transaction Type:</label>
                        <select id="transTypeFilter">
                            <option value="all">All</option>
                            <option value="in">Material In</option>
                            <option value="out">Material Out</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="transMaterialFilter">Material:</label>
                        <select id="transMaterialFilter">
                            <option value="all">All Materials</option>
                            <?php
                            if ($raw_materials_for_modals && $raw_materials_for_modals->num_rows > 0) {
                                $raw_materials_for_modals->data_seek(0);
                                while($row = $raw_materials_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                            ?>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="transDateFrom">From:</label>
                        <input type="text" id="transDateFrom" class="datepicker" placeholder="Select date...">
                    </div>
                    <div class="filter-group">
                        <label for="transDateTo">To:</label>
                        <input type="text" id="transDateTo" class="datepicker" placeholder="Select date...">
                    </div>
                    <button class="btn btn-primary" id="applyTransactionFilters">
                        <i class="fas fa-filter"></i> Apply Filters
                    </button>
                </div>

                <div class="transactions-table table-section">
                    <div class="table-responsive">
                        <table id="transactionTable">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Transaction ID</th>
                                    <th>Material</th>
                                    <th>Product Used</th>
                                    <th>Type</th>
                                    <th>Quantity</th>
                                    <th>Location</th>
                                    <th>Balance</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                if ($all_transactions_result && $all_transactions_result->num_rows > 0) {
                                    $all_transactions_result->data_seek(0);
                                    while ($row = $all_transactions_result->fetch_assoc()) {
                                        $badge_class = strtolower($row['type']) === 'out' ? 'out' : 'in';
                                        echo "<tr>";
                                        echo "<td>" . date('m/d/Y', strtotime($row['transaction_date'])) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['transaction_id_str']) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['material_name']) . "</td>";
                                        echo "<td>" . htmlspecialchars($row['product_name'] ?? 'N/A') . "</td>";
                                        echo "<td><span class='badge " . $badge_class . "'>" . htmlspecialchars($row['type']) . "</span></td>";
                                        echo "<td>" . htmlspecialchars(number_format($row['quantity'])) . " Bags</td>";
                                        echo "<td>" . htmlspecialchars($row['location_name']) . "</td>";
                                        echo "<td>" . htmlspecialchars(number_format($row['balance'])) . " Bag</td>";
                                        echo "<td>
                                                <button class='btn-icon' title='View Details'><i class='fas fa-eye'></i></button>
                                                <button class='btn-icon' title='Edit'><i class='fas fa-edit'></i></button>
                                              </td>";
                                        echo "</tr>";
                                    }
                                } else {
                                    echo "<tr><td colspan='9' style='text-align:center;'>No transactions found.</td></tr>";
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="pagination">
                    <button class="btn btn-outline" disabled><i class="fas fa-chevron-left"></i> Previous</button>
                    <span>Page 1 of 3</span>
                    <button class="btn btn-outline">Next <i class="fas fa-chevron-right"></i></button>
                </div>
            </div>

            <!-- Reports Module (Static for now) -->
            <div class="module-content" id="reports">
                 <!-- This section is kept from the original HTML. It can be made dynamic later. -->
                 <div class="section-header">
                    <h2>Inventory Reports</h2>
                    <div class="actions">
                        <button class="btn btn-primary" id="generateReportBtnPDF">
                            <i class="fas fa-file-pdf"></i> Generate PDF
                        </button>
                        <button class="btn btn-outline" id="generateReportBtnExcel">
                            <i class="fas fa-file-excel"></i> Export Excel
                        </button>
                    </div>
                </div>

                <div class="report-filters">
                    <div class="filter-group">
                        <label for="reportType">Report Type:</label>
                        <select id="reportType">
                            <option value="inventory">Inventory Summary</option>
                            <option value="transactions">Transaction Log</option>
                            <option value="monthly">Monthly Summary</option>
                            <option value="lowstock">Low Stock Report</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="reportPeriod">Period:</label>
                        <select id="reportPeriod">
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month" selected>This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>
                    <div class="filter-group custom-range" style="display: none;">
                        <label for="reportDateFrom">From:</label>
                        <input type="date" id="reportDateFrom" class="datepicker">
                    </div>
                    <div class="filter-group custom-range" style="display: none;">
                        <label for="reportDateTo">To:</label>
                        <input type="date" id="reportDateTo" class="datepicker">
                    </div>
                    <button class="btn btn-primary" id="generateReportBtn">
                        <i class="fas fa-filter"></i> Generate Report
                    </button>
                </div>

                <div class="report-results">
                    <h3>Monthly Inventory Report - May 2025</h3>
                    <div class="report-summary">
                        <div class="summary-item">
                            <h4>Total Inventory</h4>
                            <p>217 Bags</p>
                        </div>
                        <div class="summary-item">
                            <h4>Materials In</h4>
                            <p>0 Bags</p>
                        </div>
                        <div class="summary-item">
                            <h4>Materials Out</h4>
                            <p>45 Bags</p>
                        </div>
                        <div class="summary-item">
                            <h4>Low Stock Items</h4>
                            <p>5 Items</p>
                        </div>
                    </div>

                    <div class="report-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>In</th>
                                    <th>Out</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>GAS KNOB (10 Bags)</td>
                                    <td>0</td>
                                    <td>9 Bags</td>
                                    <td>1 Bag</td>
                                </tr>
                                <tr>
                                    <td>PLASTIC CORE (75 Bags)</td>
                                    <td>0</td>
                                    <td>5 Bags</td>
                                    <td>70 Bags</td>
                                </tr>
                                <tr>
                                    <td>SWITCH KNOB (7 Bags)</td>
                                    <td>0</td>
                                    <td>6 Bags</td>
                                    <td>1 Bag</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="report-chart">
                        <canvas id="reportChart"></canvas>
                    </div>
                </div>
            </div>

        </div> <!-- end .content -->
    </div> <!-- end .main-content -->

    <!-- ================================================================================= -->
    <!-- MODALS (INTEGRATED AND DYNAMIC) -->
    <!-- ================================================================================= -->

    <!-- Add Raw Material Modal -->
    <div id="addMaterialModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="closeAddMaterialModal">&times;</span>
            <div class="form-section" style="box-shadow:none; border:none; margin-bottom:0;">
                <div class="form-header"><h2 class="form-title">Add Raw Material</h2></div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Material Name</label>
                        <input type="text" class="form-input" placeholder="Enter material name">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Material Code</label>
                        <input type="text" class="form-input" placeholder="e.g., RM-006">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Initial Quantity</label>
                        <input type="number" class="form-input" placeholder="Enter quantity">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Unit of Measure</label>
                        <select class="form-input">
                            <option>kg</option>
                            <option>Bags</option>
                            <option>Pieces</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Unit Cost</label>
                        <input type="number" step="0.01" class="form-input" placeholder="Enter unit cost">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Storage Location</label>
                        <select class="form-input">
                            <option value="">Select Location</option>
                            <?php
                            if ($locations_for_modals && $locations_for_modals->num_rows > 0) {
                                $locations_for_modals->data_seek(0);
                                while($row = $locations_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                            ?>
                        </select>
                    </div>
                     <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-input">
                            <option value="">Select Category</option>
                            <?php
                            if ($raw_material_categories_for_modals && $raw_material_categories_for_modals->num_rows > 0) {
                                $raw_material_categories_for_modals->data_seek(0);
                                while($row = $raw_material_categories_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                            ?>
                        </select>
                    </div>
                </div>
                <div style="margin-top: 25px;">
                    <button class="btn btn-primary">Save Material</button>
                    <button class="btn btn-outline" type="button" id="cancelAddMaterialModal">Cancel</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- View Raw Material Modal (Content will be populated by JS) -->
    <div id="viewRawMaterialModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="closeViewRawMaterialModal">&times;</span>
            <div class="form-section" style="box-shadow:none; border:none; margin-bottom:0;">
                <div class="form-header"><h2 class="form-title">Raw Material Details</h2></div>
                <div class="slider-container"><div class="slider" id="rawMaterialImageSlider"></div><div class="slider-controls"><button class="slider-btn" id="prevRawImage"><i class="fa-solid fa-chevron-left"></i></button><button class="slider-btn" id="nextRawImage"><i class="fa-solid fa-chevron-right"></i></button></div></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Material Name</label><p id="rawMaterialName" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Material Code</label><p id="rawMaterialCode" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Category</label><p id="rawMaterialCategory" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Stock</label><p id="rawMaterialStock" class="form-input" style="border:none; background:none;"></p></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Location</label><p id="rawMaterialLocation" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Status</label><p id="rawMaterialStatus" class="form-input" style="border:none; background:none;"></p></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Edit Raw Material Modal -->
    <div id="editRawMaterialModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="closeEditRawMaterialModal">&times;</span>
            <div class="form-section" style="box-shadow:none; border:none; margin-bottom:0;">
                <div class="form-header"><h2 class="form-title">Edit Raw Material</h2></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Material Name</label><input type="text" id="editRawMaterialName" class="form-input" placeholder="Enter material name"></div>
                    <div class="form-group"><label class="form-label">Material Code</label><input type="text" id="editRawMaterialCode" class="form-input" placeholder="Enter material code" readonly></div>
                    <div class="form-group"><label class="form-label">Category</label><select id="editRawMaterialCategory" class="form-input">
                        <?php
                            if ($raw_material_categories_for_modals && $raw_material_categories_for_modals->num_rows > 0) {
                                $raw_material_categories_for_modals->data_seek(0);
                                while($row = $raw_material_categories_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                        ?>
                    </select></div>
                    <div class="form-group"><label class="form-label">Stock</label><input type="number" id="editRawMaterialStock" class="form-input" placeholder="Enter stock"></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Location</label><select id="editRawMaterialLocation" class="form-input">
                        <?php
                            if ($locations_for_modals && $locations_for_modals->num_rows > 0) {
                                $locations_for_modals->data_seek(0);
                                while($row = $locations_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                        ?>
                    </select></div>
                    <div class="form-group"><label class="form-label">Status</label><select id="editRawMaterialStatus" class="form-input"><option>In Stock</option><option>Out of Stock</option><option>Low Stock</option></select></div>
                </div>
                <div style="margin-top: 25px;"><button class="btn btn-primary" id="saveEditRawMaterial">Save Changes</button><button class="btn btn-outline" type="button" id="cancelEditRawMaterialModal">Cancel</button></div>
            </div>
        </div>
    </div>
    
    <!-- Add Product Modal -->
    <div id="addProductModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="closeAddProductModal">&times;</span>
            <div class="form-section" style="box-shadow:none; border:none; margin-bottom:0;">
                <div class="form-header"><h2 class="form-title">Add New Product</h2></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Product Name</label><input type="text" class="form-input" placeholder="Enter product name"></div>
                    <div class="form-group"><label class="form-label">Category</label><select class="form-input">
                        <option value="">Select Category</option>
                        <?php
                            if ($product_categories_for_modals && $product_categories_for_modals->num_rows > 0) {
                                $product_categories_for_modals->data_seek(0);
                                while($row = $product_categories_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                        ?>
                    </select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Raw Material Used</label><select class="form-input">
                        <option value="">Select Material</option>
                        <?php
                            if ($raw_materials_for_modals && $raw_materials_for_modals->num_rows > 0) {
                                $raw_materials_for_modals->data_seek(0);
                                while($row = $raw_materials_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                        ?>
                    </select></div>
                    <div class="form-group"><label class="form-label">Initial Stock</label><input type="number" class="form-input" placeholder="Enter number of stock"></div>
                </div>
                <div style="margin-top: 25px;"><button class="btn btn-primary">Save Product</button><button class="btn btn-outline" type="button" id="cancelAddProductModal">Cancel</button></div>
            </div>
        </div>
    </div>
    
    <!-- View Product Modal (Content will be populated by JS) -->
    <div id="viewProductModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="closeViewProductModal">&times;</span>
            <div class="form-section" style="box-shadow:none; border:none; margin-bottom:0;">
                <div class="form-header"><h2 class="form-title">Product Details</h2></div>
                <div class="slider-container"><div class="slider" id="productImageSlider"></div><div class="slider-controls"><button class="slider-btn" id="prevImage"><i class="fa-solid fa-chevron-left"></i></button><button class="slider-btn" id="nextImage"><i class="fa-solid fa-chevron-right"></i></button></div></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Product Name</label><p id="productName" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Product Code</label><p id="productCode" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Category</label><p id="productCategory" class="form-input" style="border:none; background:none;"></p></div>
                    <div class="form-group"><label class="form-label">Production Process</label><p id="productProcess" class="form-input" style="border:none; background:none;"></p></div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Edit Product Modal -->
    <div id="editProductModal" class="modal-overlay" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="closeEditProductModal">&times;</span>
            <div class="form-section" style="box-shadow:none; border:none; margin-bottom:0;">
                <div class="form-header"><h2 class="form-title">Edit Product</h2></div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Product Name</label><input type="text" id="editProductName" class="form-input" placeholder="Enter product name"></div>
                    <div class="form-group"><label class="form-label">Product Code</label><input type="text" id="editProductCode" class="form-input" placeholder="Enter product code" readonly></div>
                    <div class="form-group"><label class="form-label">Category</label><select id="editProductCategory" class="form-input">
                        <?php
                            if ($product_categories_for_modals && $product_categories_for_modals->num_rows > 0) {
                                $product_categories_for_modals->data_seek(0);
                                while($row = $product_categories_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                        ?>
                    </select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Raw Materials Used</label><select id="editProductMaterials" class="form-input" multiple>
                        <?php
                            if ($raw_materials_for_modals && $raw_materials_for_modals->num_rows > 0) {
                                $raw_materials_for_modals->data_seek(0);
                                while($row = $raw_materials_for_modals->fetch_assoc()) {
                                    echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                }
                            }
                        ?>
                    </select></div>
                    <div class="form-group"><label class="form-label">Unit of Measure</label><select id="editProductUnit" class="form-input"><option>kg</option><option>Bags</option><option>Pieces</option></select></div>
                </div>
                <div class="form-row">
                    <div class="form-group"><label class="form-label">Standard Weight</label><input type="number" id="editProductWeight" class="form-input" placeholder="Enter weight per unit"></div>
                    <div class="form-group"><label class="form-label">Production Process</label><select id="editProductProcess" class="form-input"><option>Injection Molding</option><option>Extrusion</option><option>Compression Molding</option></select></div>
                </div>
                <div style="margin-top: 25px;"><button class="btn btn-primary" id="saveEditProduct">Save Changes</button><button class="btn btn-outline" type="button" id="cancelEditProductModal">Cancel</button></div>
            </div>
        </div>
    </div>
    
    <!-- Add Transaction Modal -->
    <div class="modal-overlay" id="addTransactionModal" style="display:none;">
        <div class="modal-content">
            <span class="close-modal" id="cancelAddTransactionModal">&times;</span>
            <div class="form-section">
                <div class="form-header">
                    <h2>New Material Transaction</h2>
                </div>
                <form id="addTransactionForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="transDate">Date</label>
                            <input type="text" id="transDate" class="datepicker" required placeholder="Select date...">
                        </div>
                        <div class="form-group">
                            <label for="transType">Transaction Type</label>
                            <select id="transType" class="form-input" required>
                                <option value="OUT" selected>Material Out</option>
                                <option value="IN">Material In</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="transMaterial">Material</label>
                            <select id="transMaterial" class="form-input" required>
                                <option value="">Select Material</option>
                                <?php
                                if ($raw_materials_for_modals && $raw_materials_for_modals->num_rows > 0) {
                                    $raw_materials_for_modals->data_seek(0);
                                    while($row = $raw_materials_for_modals->fetch_assoc()) {
                                        echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                    }
                                }
                                ?>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="transProduct">Product Used</label>
                            <select id="transProduct" class="form-input">
                                <option value="">Select Product (if applicable)</option>
                                <?php
                                if ($products_for_modals && $products_for_modals->num_rows > 0) {
                                    $products_for_modals->data_seek(0);
                                    while($row = $products_for_modals->fetch_assoc()) {
                                        echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                    }
                                }
                                ?>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="transQuantity">Quantity</label>
                            <input type="number" id="transQuantity" class="form-input" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="transLocation">Location</label>
                            <select id="transLocation" class="form-input" required>
                                <option value="">Select Location</option>
                                <?php
                                if ($locations_for_modals && $locations_for_modals->num_rows > 0) {
                                    $locations_for_modals->data_seek(0);
                                    while($row = $locations_for_modals->fetch_assoc()) {
                                        echo "<option value='" . htmlspecialchars($row['id']) . "'>" . htmlspecialchars($row['name']) . "</option>";
                                    }
                                }
                                ?>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="transNotes">Notes</label>
                            <textarea id="transNotes" class="form-input" rows="3"></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-outline" id="cancelAddTransactionBtn">Cancel</button>
                        <button type="submit" class="btn btn-primary">Record Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="script.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // This ensures the link for logout works correctly without being
            // prevented by the main navigation script.
            const logoutBtn = document.getElementById('logoutBtn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); 
                });
            }
        });
    </script>
</body>
</html>
</body>
</html>
