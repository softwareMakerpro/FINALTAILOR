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
        this.setupKuwaitFeatures();
    }

    applyBranding() {
        document.title = `${this.shopConfig.name} - Tailor Management`;
        this.updateCurrencyDisplays();
    }

    updateCurrencyDisplays() {
        const currencyElements = document.querySelectorAll('[data-currency]');
        currencyElements.forEach(el => {
            el.textContent = this.currency;
        });
    }

    setupKuwaitFeatures() {
        this.measurementTypes = {
            thobe: ['Chest', 'Shoulder', 'Length', 'Sleeve', 'Neck'],
            suit: ['Chest', 'Waist', 'Hips', 'Length', 'Sleeve'],
            shirt: ['Chest', 'Neck', 'Sleeve', 'Length'],
            pants: ['Waist', 'Hips', 'Length', 'Inseam']
        };

        this.garmentTypes = [
            'Dishdasha/Thobe',
            'Suit',
            'Shirt',
            'Pants',
            'Jacket',
            'Traditional Wear',
            'Altering/Repair'
        ];
    }

    formatCurrency(amount) {
        return `${this.currency} ${parseFloat(amount).toFixed(3)}`;
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-KW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

function saveClient() {
    const measurements = {};
    const measurementFields = ['chest', 'waist', 'length', 'sleeve'];
    
    measurementFields.forEach(field => {
        const value = document.getElementById(`measure${field.charAt(0).toUpperCase() + field.slice(1)}`).value;
        if (value) {
            measurements[field] = value;
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
        loadOrdersData();
        showNotification('Order saved successfully!');
    } else {
        showNotification('Error saving order. Please try again.', 'error');
    }
}

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

function loadClientsForSelect() {
    const clients = getClientsFromDB();
    
    if (clients.length === 0) {
        document.getElementById('orderClientSearch').placeholder = 'No clients available. Please add clients first.';
        document.getElementById('invoiceClientSearch').placeholder = 'No clients available. Please add clients first.';
    }
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

document.addEventListener('DOMContentLoaded', () => {
    window.jamalManager = new JamalTailorManager();
});