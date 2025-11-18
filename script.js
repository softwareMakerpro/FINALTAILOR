class JamalTailorManager {
    constructor() {
        this.shopConfig = this.loadShopConfig();
        this.currency = 'KWD';
        this.init();
    }

    loadShopConfig() {
        const saved = localStorage.getItem('shopConfig');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            name: "JAMAL AL-SHUWAIKH",
            subtitle: "MEN TAILOR & TEXTILE", 
            arabicName: "جمال الشويخ للرجال وفنستها",
            phone: "97686004",
            address: "Kuwait – Comm. Area No. 9 – Mariam Comp – Basement – Shop No. 8",
            currency: "KWD"
        };
    }

    init() {
        this.applyBranding();
    }

    applyBranding() {
        document.title = `${this.shopConfig.name} - Tailor Management`;
    }

    formatCurrency(amount) {
        return `${this.currency} ${parseFloat(amount).toFixed(3)}`;
    }
}

// Global variables
let currentSection = 'clients';
let currentDataTab = 'clients';
let selectedOrderClientId = null;
let selectedInvoiceClientId = null;
let currentInvoice = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.jamalManager = new JamalTailorManager();
    document.getElementById('orderDate').valueAsDate = new Date();
    document.getElementById('expenseDate').valueAsDate = new Date();
    loadClientsData();
    addInvoiceItem(); // Add first invoice item
});

// Section Navigation
function showSection(section) {
    currentSection = section;
    
    // Hide all form sections
    document.getElementById('clientFormSection').style.display = 'none';
    document.getElementById('orderFormSection').style.display = 'none';
    document.getElementById('invoiceFormSection').style.display = 'none';
    document.getElementById('expenseFormSection').style.display = 'none';
    
    // Show selected form section
    document.getElementById(section + 'FormSection').style.display = 'block';
    
    // Update titles
    const titles = {
        'clients': '👥 Add New Client',
        'orders': '📦 Create New Order', 
        'invoices': '🧾 Create Invoice',
        'expenses': '💸 Add Expense'
    };
    document.getElementById('formsTitle').textContent = titles[section];
    
    // Load relevant data
    showDataTab(section);
    
    // Load dynamic data
    if (section === 'orders' || section === 'invoices') {
        loadClientsForSelect();
    }
}

// Data Tabs
function showDataTab(tab) {
    currentDataTab = tab;
    
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all data sections
    document.getElementById('clientsData').style.display = 'none';
    document.getElementById('ordersData').style.display = 'none';
    document.getElementById('invoicesData').style.display = 'none';
    document.getElementById('expensesData').style.display = 'none';
    
    // Show selected data section
    document.getElementById(tab + 'Data').style.display = 'block';
    
    // Update data title
    const titles = {
        'clients': '👥 Clients List',
        'orders': '📦 Orders List',
        'invoices': '🧾 Invoices List', 
        'expenses': '💸 Expenses List'
    };
    document.getElementById('dataTitle').textContent = titles[tab];
    
    // Load data
    loadData();
}

function loadData() {
    switch(currentDataTab) {
        case 'clients':
            loadClientsData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'invoices':
            loadInvoicesData();
            break;
        case 'expenses':
            loadExpensesData();
            break;
    }
}

// Search Functions
function searchOrderClients() {
    const query = document.getElementById('orderClientSearch').value;
    const results = searchClients(query);
    const container = document.getElementById('orderClientResults');
    showSearchResults(results, container, 'order');
}

function searchInvoiceClients() {
    const query = document.getElementById('invoiceClientSearch').value;
    const results = searchClients(query);
    const container = document.getElementById('invoiceClientResults');
    showSearchResults(results, container, 'invoice');
}

function showSearchResults(results, container, type) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-result-item">No clients found</div>';
        container.style.display = 'block';
        return;
    }

    container.innerHTML = results.slice(0, 5).map(client => `
        <div class="search-result-item">
            <div class="client-search-info">
                <strong>${client.name}</strong>
                <div class="client-search-details">
                    <span>📞 ${client.phone}</span>
                    <span>📖 ${client.bookNo || 'No Book No'}</span>
                </div>
            </div>
            <button class="select-client-btn" onclick="select${type.charAt(0).toUpperCase() + type.slice(1)}Client('${client.id}')">
                Select
            </button>
        </div>
    `).join('');
    
    container.style.display = 'block';
}

function selectOrderClient(clientId) {
    const client = getClientById(clientId);
    if (client) {
        selectedOrderClientId = clientId;
        document.getElementById('selectedOrderClientName').textContent = client.name;
        document.getElementById('selectedOrderClientPhone').textContent = client.phone;
        document.getElementById('selectedOrderClientBookNo').textContent = client.bookNo || 'N/A';
        document.getElementById('selectedOrderClient').style.display = 'block';
        document.getElementById('orderClientResults').style.display = 'none';
        document.getElementById('orderClientSearch').value = client.name;
    }
}

function selectInvoiceClient(clientId) {
    const client = getClientById(clientId);
    if (client) {
        selectedInvoiceClientId = clientId;
        document.getElementById('selectedInvoiceClientName').textContent = client.name;
        document.getElementById('selectedInvoiceClientPhone').textContent = client.phone;
        document.getElementById('selectedInvoiceClientBookNo').textContent = client.bookNo || 'N/A';
        document.getElementById('selectedInvoiceClient').style.display = 'block';
        document.getElementById('invoiceClientResults').style.display = 'none';
        document.getElementById('invoiceClientSearch').value = client.name;
    }
}

// Client Functions
function saveClient() {
    const measurements = {};
    const measurementFields = ['chest', 'waist', 'length', 'sleeve'];
    
    measurementFields.forEach(field => {
        const element = document.getElementById(`measure${field.charAt(0).toUpperCase() + field.slice(1)}`);
        if (element && element.value) {
            measurements[field] = element.value;
        }
    });
    
    const clientData = {
        id: generateId(),
        name: document.getElementById('clientName').value.trim(),
        phone: document.getElementById('clientPhone').value.trim(),
        bookNo: document.getElementById('clientBookNo').value.trim(),
        measurements: measurements,
        orderStatus: 'received',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (!clientData.name || !clientData.phone || !clientData.bookNo) {
        showNotification('Please fill in all required fields (Name, Phone, Book Number)', 'error');
        return;
    }

    const success = saveClientToDB(clientData);
    if (success) {
        document.getElementById('clientForm').reset();
        loadClientsData();
        showNotification('Client saved successfully!');
    } else {
        showNotification('Error saving client. Please try again.', 'error');
    }
}

function updateClientStatus(clientId, status) {
    const client = getClientById(clientId);
    if (client) {
        client.orderStatus = status;
        client.updatedAt = new Date().toISOString();
        saveClientToDB(client);
        loadClientsData();
        showNotification(`Client status updated to: ${status.charAt(0).toUpperCase() + status.slice(1)}`);
    }
}

function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        const success = deleteClientFromDB(clientId);
        if (success) {
            loadClientsData();
            showNotification('Client deleted successfully!');
        } else {
            showNotification('Error deleting client.', 'error');
        }
    }
}

// Order Functions
function saveOrder() {
    if (!selectedOrderClientId) {
        showNotification('Please select a client', 'error');
        return;
    }

    const client = getClientById(selectedOrderClientId);
    const orderData = {
        id: generateId(),
        orderNumber: document.getElementById('orderNumber').value,
        clientId: selectedOrderClientId,
        clientName: client.name,
        clientPhone: client.phone,
        orderDate: document.getElementById('orderDate').value,
        garmentType: document.getElementById('orderGarmentType').value,
        description: document.getElementById('orderDescription').value,
        price: parseFloat(document.getElementById('orderPrice').value),
        status: document.getElementById('orderStatus').value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    if (!orderData.orderNumber || !orderData.garmentType || !orderData.description || !orderData.price) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const success = saveOrderToDB(orderData);
    if (success) {
        document.getElementById('orderForm').reset();
        document.getElementById('selectedOrderClient').style.display = 'none';
        selectedOrderClientId = null;
        document.getElementById('orderNumber').value = `ORD-${Date.now().toString().slice(-6)}`;
        loadOrdersData();
        showNotification('Order saved successfully!');
    } else {
        showNotification('Error saving order. Please try again.', 'error');
    }
}

function updateOrderStatus(orderId, status) {
    const order = getOrderById(orderId);
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        
        if (status === 'completed') {
            order.completedDate = new Date().toISOString();
        }
        
        saveOrderToDB(order);
        loadOrdersData();
        showNotification(`Order status updated to: ${status.charAt(0).toUpperCase() + status.slice(1)}`);
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        const success = deleteOrderFromDB(orderId);
        if (success) {
            loadOrdersData();
            showNotification('Order deleted successfully!');
        } else {
            showNotification('Error deleting order.', 'error');
        }
    }
}

// Invoice Functions
function addInvoiceItem() {
    const container = document.getElementById('invoiceItems');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'form-row';
    itemDiv.style.gridTemplateColumns = '2fr 1fr 1fr auto';
    itemDiv.style.alignItems = 'end';
    itemDiv.style.gap = '10px';
    itemDiv.style.marginBottom = '10px';
    
    itemDiv.innerHTML = `
        <input type="text" placeholder="Item description" class="invoice-item-name" required>
        <input type="number" placeholder="Qty" value="1" class="invoice-item-qty" min="1" required>
        <input type="number" placeholder="Price (KWD)" class="invoice-item-price" step="0.001" min="0" required>
        <button type="button" class="btn-danger" onclick="removeInvoiceItem(this)" style="padding: 8px 12px;">🗑️</button>
    `;
    
    container.appendChild(itemDiv);
}

function removeInvoiceItem(button) {
    if (document.querySelectorAll('#invoiceItems .form-row').length > 1) {
        button.parentElement.remove();
    }
}

function createInvoice() {
    if (!selectedInvoiceClientId) {
        showNotification('Please select a client', 'error');
        return;
    }

    const client = getClientById(selectedInvoiceClientId);
    const items = [];
    let subtotal = 0;

    // Get items
    document.querySelectorAll('#invoiceItems .form-row').forEach(row => {
        const name = row.querySelector('.invoice-item-name').value;
        const qty = parseFloat(row.querySelector('.invoice-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.invoice-item-price').value) || 0;
        
        if (name && qty > 0 && price > 0) {
            const total = qty * price;
            items.push({ name, qty, price, total });
            subtotal += total;
        }
    });

    if (items.length === 0) {
        showNotification('Please add at least one item', 'error');
        return;
    }

    const discount = parseFloat(document.getElementById('invoiceDiscount').value) || 0;
    const tax = parseFloat(document.getElementById('invoiceTax').value) || 0;
    const grandTotal = subtotal - discount + tax;

    const invoice = {
        id: generateId(),
        invoiceNumber: generateInvoiceNumber(),
        clientId: selectedInvoiceClientId,
        clientName: client.name,
        clientPhone: client.phone,
        clientBookNo: client.bookNo,
        items: items,
        subtotal: subtotal,
        discount: discount,
        tax: tax,
        grandTotal: grandTotal,
        invoiceDate: new Date().toISOString(),
        status: 'unpaid'
    };

    saveInvoiceToDB(invoice);
    showInvoicePreview(invoice);
    showNotification('Invoice created successfully!');
}

function showInvoicePreview(invoice) {
    currentInvoice = invoice;
    const container = document.getElementById('invoicePreview');
    
    container.innerHTML = `
        <div class="invoice-header">
            <h2>JAMAL AL-SHUWAIKH</h2>
            <p class="shop-arabic">جمال الشويخ للرجال وفنستها</p>
            <p class="shop-subtitle">MEN TAILOR & TEXTILE</p>
            <div class="invoice-number">Invoice: ${invoice.invoiceNumber}</div>
        </div>

        <div class="invoice-details">
            <div class="invoice-section">
                <h3>Bill To:</h3>
                <p><strong>${invoice.clientName}</strong></p>
                <p>📞 ${invoice.clientPhone}</p>
                <p>📖 Book No: ${invoice.clientBookNo || 'N/A'}</p>
            </div>
            <div class="invoice-section">
                <h3>Invoice Details:</h3>
                <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
            </div>
        </div>

        <div class="invoice-items">
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price (KWD)</th>
                        <th>Total (KWD)</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoice.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.qty}</td>
                            <td>${item.price.toFixed(3)}</td>
                            <td>${item.total.toFixed(3)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="invoice-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>KWD ${invoice.subtotal.toFixed(3)}</span>
            </div>
            <div class="total-row">
                <span>Discount:</span>
                <span>KWD ${invoice.discount.toFixed(3)}</span>
            </div>
            <div class="total-row">
                <span>Tax:</span>
                <span>KWD ${invoice.tax.toFixed(3)}</span>
            </div>
            <div class="total-row">
                <span><strong>Grand Total:</strong></span>
                <span><strong>KWD ${invoice.grandTotal.toFixed(3)}</strong></span>
            </div>
        </div>

        <div class="qr-container" id="qrCodeContainer">
            <h3>QR Code for Payment</h3>
            <div class="qr-code" id="qrCode"></div>
        </div>

        <div class="invoice-actions">
            <button class="action-btn-large btn-whatsapp" onclick="shareInvoiceWhatsApp()">
                📱 Share via WhatsApp
            </button>
            <button class="action-btn-large btn-pdf" onclick="generateInvoicePDF()">
                📄 Download PDF
            </button>
            <button class="action-btn-large btn-print" onclick="printInvoice()">
                🖨️ Print Invoice
            </button>
            <button class="action-btn-large btn-qr" onclick="generateQRCode()">
                🔳 Generate QR Code
            </button>
        </div>
    `;

    container.style.display = 'block';
    generateQRCode();
}

function generateQRCode() {
    if (!currentInvoice) return;
    
    const qrContainer = document.getElementById('qrCode');
    const qrData = `JAMAL AL-SHUWAIKH\nInvoice: ${currentInvoice.invoiceNumber}\nClient: ${currentInvoice.clientName}\nAmount: KWD ${currentInvoice.grandTotal.toFixed(3)}\nDate: ${new Date(currentInvoice.invoiceDate).toLocaleDateString()}\nPhone: 97686004`;
    
    QRCode.toCanvas(qrContainer, qrData, { width: 200 }, function(error) {
        if (error) console.error('QR Code generation error:', error);
    });
}

function generateInvoicePDF() {
    if (!currentInvoice) return;
    
    const element = document.getElementById('invoicePreview');
    const opt = {
        margin: 10,
        filename: `invoice-${currentInvoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner"></span> Generating PDF...';
    button.disabled = true;

    html2pdf().set(opt).from(element).save().then(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        showNotification('PDF downloaded successfully!');
    });
}

function printInvoice() {
    const printContent = document.getElementById('invoicePreview').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    showSection('invoices'); // Return to invoices section
}

function shareInvoiceWhatsApp() {
    if (!currentInvoice) return;
    
    let message = `*JAMAL AL-SHUWAIKH* 👕\n`;
    message += `جمال الشويخ للرجال وفنستها\n\n`;
    message += `*INVOICE* 🧾\n`;
    message += `Invoice No: ${currentInvoice.invoiceNumber}\n`;
    message += `Client: ${currentInvoice.clientName}\n`;
    message += `Phone: ${currentInvoice.clientPhone}\n`;
    message += `Date: ${new Date(currentInvoice.invoiceDate).toLocaleDateString()}\n\n`;
    message += `*ITEMS:*\n`;
    
    currentInvoice.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - ${item.qty} x KWD ${item.price.toFixed(3)} = KWD ${item.total.toFixed(3)}\n`;
    });
    
    message += `\nSubtotal: KWD ${currentInvoice.subtotal.toFixed(3)}\n`;
    message += `Discount: KWD ${currentInvoice.discount.toFixed(3)}\n`;
    message += `Tax: KWD ${currentInvoice.tax.toFixed(3)}\n`;
    message += `*GRAND TOTAL: KWD ${currentInvoice.grandTotal.toFixed(3)}*\n\n`;
    message += `*Thank you for your business!* 🙏\n`;
    message += `📞 97686004\n`;
    message += `📍 Kuwait – Comm. Area No. 9 – Mariam Comp – Basement – Shop No. 8`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${currentInvoice.clientPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Expense Functions
function saveExpense() {
    const expenseData = {
        id: generateId(),
        type: document.getElementById('expenseType').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value,
        createdAt: new Date().toISOString()
    };

    if (!expenseData.type || !expenseData.amount || !expenseData.date) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const success = saveExpenseToDB(expenseData);
    if (success) {
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').valueAsDate = new Date();
        loadExpensesData();
        showNotification('Expense saved successfully!');
    } else {
        showNotification('Error saving expense. Please try again.', 'error');
    }
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        const success = deleteExpenseFromDB(expenseId);
        if (success) {
            loadExpensesData();
            showNotification('Expense deleted successfully!');
        } else {
            showNotification('Error deleting expense.', 'error');
        }
    }
}

// Data Loading Functions
function loadClientsData() {
    const clients = getClientsFromDB();
    const container = document.getElementById('clientsData');
    const searchTerm = document.getElementById('dataSearch').value.toLowerCase();

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        (client.bookNo && client.bookNo.toLowerCase().includes(searchTerm))
    );

    if (filteredClients.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No clients found</h3><p>Add your first client above</p></div>';
        return;
    }

    container.innerHTML = filteredClients.map(client => `
        <div class="client-card">
            <div class="client-header">
                <div class="client-info">
                    <h3>${client.name}</h3>
                    <div class="client-details">
                        <span>📞 ${client.phone}</span>
                        <span>📖 ${client.bookNo || 'No Book No'}</span>
                        <span>📅 ${new Date(client.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="status-buttons">
                        <button class="status-btn ${client.orderStatus === 'received' ? 'status-received' : ''}" 
                                onclick="updateClientStatus('${client.id}', 'received')">📥</button>
                        <button class="status-btn ${client.orderStatus === 'process' ? 'status-process' : ''}" 
                                onclick="updateClientStatus('${client.id}', 'process')">⚙️</button>
                        <button class="status-btn ${client.orderStatus === 'pending' ? 'status-pending' : ''}" 
                                onclick="updateClientStatus('${client.id}', 'pending')">⏳</button>
                        <button class="status-btn ${client.orderStatus === 'completed' ? 'status-completed' : ''}" 
                                onclick="updateClientStatus('${client.id}', 'completed')">✅</button>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn-outline" onclick="createOrderForClient('${client.id}')">📦 Order</button>
                    <button class="btn-outline" onclick="createInvoiceForClient('${client.id}')">🧾 Invoice</button>
                    <button class="btn-danger" onclick="deleteClient('${client.id}')">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadOrdersData() {
    const orders = getOrdersFromDB();
    const container = document.getElementById('ordersData');
    const searchTerm = document.getElementById('dataSearch').value.toLowerCase();

    const filteredOrders = orders.filter(order => 
        order.clientName.toLowerCase().includes(searchTerm) ||
        order.orderNumber.toLowerCase().includes(searchTerm)
    );

    if (filteredOrders.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No orders found</h3><p>Create your first order above</p></div>';
        return;
    }

    container.innerHTML = filteredOrders.map(order => `
        <div class="client-card">
            <div class="client-header">
                <div class="client-info">
                    <h3>${order.orderNumber}</h3>
                    <div class="client-details">
                        <span>👤 ${order.clientName}</span>
                        <span>📅 ${new Date(order.orderDate).toLocaleDateString()}</span>
                        <span>💰 KWD ${order.price.toFixed(3)}</span>
                    </div>
                    <div class="status-buttons">
                        <button class="status-btn ${order.status === 'received' ? 'status-received' : ''}" 
                                onclick="updateOrderStatus('${order.id}', 'received')">📥</button>
                        <button class="status-btn ${order.status === 'process' ? 'status-process' : ''}" 
                                onclick="updateOrderStatus('${order.id}', 'process')">⚙️</button>
                        <button class="status-btn ${order.status === 'pending' ? 'status-pending' : ''}" 
                                onclick="updateOrderStatus('${order.id}', 'pending')">⏳</button>
                        <button class="status-btn ${order.status === 'completed' ? 'status-completed' : ''}" 
                                onclick="updateOrderStatus('${order.id}', 'completed')">✅</button>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn-outline" onclick="createInvoiceForOrder('${order.id}')">🧾 Invoice</button>
                    <button class="btn-danger" onclick="deleteOrder('${order.id}')">🗑️</button>
                </div>
            </div>
            <div style="margin-top: 10px; color: #666; font-size: 0.9rem;">
                ${order.garmentType} - ${order.description}
            </div>
        </div>
    `).join('');
}

function loadInvoicesData() {
    const invoices = getInvoicesFromDB();
    const container = document.getElementById('invoicesData');
    const searchTerm = document.getElementById('dataSearch').value.toLowerCase();

    const filteredInvoices = invoices.filter(invoice => 
        invoice.clientName.toLowerCase().includes(searchTerm) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm)
    );

    if (filteredInvoices.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No invoices found</h3><p>Create your first invoice above</p></div>';
        return;
    }

    container.innerHTML = filteredInvoices.map(invoice => `
        <div class="client-card">
            <div class="client-header">
                <div class="client-info">
                    <h3>${invoice.invoiceNumber}</h3>
                    <div class="client-details">
                        <span>👤 ${invoice.clientName}</span>
                        <span>📅 ${new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                        <span>💰 KWD ${invoice.grandTotal.toFixed(3)}</span>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn-outline" onclick="showInvoicePreview(getInvoiceById('${invoice.id}'))">👁️ View</button>
                    <button class="btn-danger" onclick="deleteInvoice('${invoice.id}')">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadExpensesData() {
    const expenses = getExpensesFromDB();
    const container = document.getElementById('expensesData');
    const searchTerm = document.getElementById('dataSearch').value.toLowerCase();

    const filteredExpenses = expenses.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm) ||
        expense.type.toLowerCase().includes(searchTerm)
    );

    if (filteredExpenses.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No expenses found</h3><p>Add your first expense above</p></div>';
        return;
    }

    container.innerHTML = filteredExpenses.map(expense => `
        <div class="client-card">
            <div class="client-header">
                <div class="client-info">
                    <h3>${expense.type.toUpperCase()}</h3>
                    <div class="client-details">
                        <span>💰 KWD ${expense.amount.toFixed(3)}</span>
                        <span>📅 ${new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn-danger" onclick="deleteExpense('${expense.id}')">🗑️</button>
                </div>
            </div>
            <div style="margin-top: 10px; color: #666; font-size: 0.9rem;">
                ${expense.description || 'No description'}
            </div>
        </div>
    `).join('');
}

// Helper Functions
function loadClientsForSelect() {
    const clients = getClientsFromDB();
    
    if (clients.length === 0) {
        document.getElementById('orderClientSearch').placeholder = 'No clients available. Please add clients first.';
        document.getElementById('invoiceClientSearch').placeholder = 'No clients available. Please add clients first.';
    }
}

function createOrderForClient(clientId) {
    showSection('orders');
    selectOrderClient(clientId);
}

function createInvoiceForClient(clientId) {
    showSection('invoices');
    selectInvoiceClient(clientId);
}

function createInvoiceForOrder(orderId) {
    const order = getOrderById(orderId);
    if (order) {
        showSection('invoices');
        selectInvoiceClient(order.clientId);
        
        setTimeout(() => {
            document.getElementById('invoiceItems').innerHTML = '';
            const itemDiv = document.createElement('div');
            itemDiv.className = 'form-row';
            itemDiv.style.gridTemplateColumns = '2fr 1fr 1fr auto';
            itemDiv.style.alignItems = 'end';
            itemDiv.style.gap = '10px';
            itemDiv.style.marginBottom = '10px';
            
            itemDiv.innerHTML = `
                <input type="text" value="${order.garmentType} - ${order.description}" class="invoice-item-name" required>
                <input type="number" value="1" class="invoice-item-qty" min="1" required>
                <input type="number" value="${order.price}" class="invoice-item-price" step="0.001" min="0" required>
                <button type="button" class="btn-danger" onclick="removeInvoiceItem(this)" style="padding: 8px 12px;">🗑️</button>
            `;
            
            document.getElementById('invoiceItems').appendChild(itemDiv);
        }, 100);
    }
}

function deleteInvoice(invoiceId) {
    if (confirm('Are you sure you want to delete this invoice?')) {
        const invoices = getInvoicesFromDB();
        const filteredInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
        localStorage.setItem('invoices', JSON.stringify(filteredInvoices));
        loadInvoicesData();
        showNotification('Invoice deleted successfully!');
    }
}

function searchData() {
    loadData();
}

function downloadBackup() {
    const backup = {
        clients: getClientsFromDB(),
        orders: getOrdersFromDB(),
        invoices: getInvoicesFromDB(),
        expenses: getExpensesFromDB(),
        settings: getSettings(),
        timestamp: new Date().toISOString()
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `jamal-tailor-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Backup downloaded successfully!');
}

function showNotification(message, type = 'success') {
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: #2c3e50;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#f39c12'};
        max-width: 400px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container')) {
        document.getElementById('orderClientResults').style.display = 'none';
        document.getElementById('invoiceClientResults').style.display = 'none';
    }
});

// Add notification styles
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
