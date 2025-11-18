function getShopConfig() {
    const config = localStorage.getItem('shopConfig');
    if (config) {
        return JSON.parse(config);
    }
    
    const defaultConfig = {
        name: "JAMAL AL-SHUWAIKH",
        subtitle: "MEN TAILOR & TEXTILE",
        arabicName: "جمال الشويخ للرجال وفنستها", 
        phone: "97686004",
        address: "Kuwait – Comm. Area No. 9 – Mariam Comp – Basement – Shop No. 8",
        currency: "KWD",
        taxRate: 0,
        language: "both"
    };
    
    localStorage.setItem('shopConfig', JSON.stringify(defaultConfig));
    return defaultConfig;
}

function getClientsFromDB() {
    try {
        return JSON.parse(localStorage.getItem('clients')) || [];
    } catch (error) {
        console.error('Error reading clients:', error);
        return [];
    }
}

function saveClientToDB(client) {
    try {
        const clients = getClientsFromDB();
        const existingIndex = clients.findIndex(c => c.id === client.id);
        
        if (!client.orderStatus) {
            client.orderStatus = 'received';
        }
        
        if (existingIndex !== -1) {
            clients[existingIndex] = client;
        } else {
            clients.push(client);
        }
        
        localStorage.setItem('clients', JSON.stringify(clients));
        return client.id;
    } catch (error) {
        console.error('Error saving client:', error);
        return null;
    }
}
// Add these functions to your existing db.js file

function getOrdersFromDB() {
    try {
        return JSON.parse(localStorage.getItem('orders')) || [];
    } catch (error) {
        console.error('Error reading orders:', error);
        return [];
    }
}

function saveOrderToDB(order) {
    try {
        const orders = getOrdersFromDB();
        const existingIndex = orders.findIndex(o => o.id === order.id);
        
        if (existingIndex !== -1) {
            orders[existingIndex] = order;
        } else {
            orders.push(order);
        }
        
        localStorage.setItem
function getClientById(clientId) {
    const clients = getClientsFromDB();
    return clients.find(client => client.id === clientId);
}

function deleteClientFromDB(clientId) {
    try {
        const clients = getClientsFromDB();
        const filteredClients = clients.filter(client => client.id !== clientId);
        localStorage.setItem('clients', JSON.stringify(filteredClients));
        return true;
    } catch (error) {
        console.error('Error deleting client:', error);
        return false;
    }
}

function getOrdersFromDB() {
    try {
        return JSON.parse(localStorage.getItem('orders')) || [];
    } catch (error) {
        console.error('Error reading orders:', error);
        return [];
    }
}

function saveOrderToDB(order) {
    try {
        const orders = getOrdersFromDB();
        const existingIndex = orders.findIndex(o => o.id === order.id);
        
        if (existingIndex !== -1) {
            orders[existingIndex] = order;
        } else {
            orders.push(order);
        }
        
        localStorage.setItem('orders', JSON.stringify(orders));
        return order.id;
    } catch (error) {
        console.error('Error saving order:', error);
        return null;
    }
}

function getOrderById(orderId) {
    const orders = getOrdersFromDB();
    return orders.find(order => order.id === orderId);
}

function deleteOrderFromDB(orderId) {
    try {
        const orders = getOrdersFromDB();
        const filteredOrders = orders.filter(order => order.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(filteredOrders));
        return true;
    } catch (error) {
        console.error('Error deleting order:', error);
        return false;
    }
}

function getExpensesFromDB() {
    try {
        return JSON.parse(localStorage.getItem('expenses')) || [];
    } catch (error) {
        console.error('Error reading expenses:', error);
        return [];
    }
}

function saveExpenseToDB(expense) {
    try {
        const expenses = getExpensesFromDB();
        const existingIndex = expenses.findIndex(e => e.id === expense.id);
        
        if (existingIndex !== -1) {
            expenses[existingIndex] = expense;
        } else {
            expenses.push(expense);
        }
        
        localStorage.setItem('expenses', JSON.stringify(expenses));
        return expense.id;
    } catch (error) {
        console.error('Error saving expense:', error);
        return null;
    }
}

function getExpenseById(expenseId) {
    const expenses = getExpensesFromDB();
    return expenses.find(expense => expense.id === expenseId);
}

function deleteExpenseFromDB(expenseId) {
    try {
        const expenses = getExpensesFromDB();
        const filteredExpenses = expenses.filter(expense => expense.id !== expenseId);
        localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
        return true;
    } catch (error) {
        console.error('Error deleting expense:', error);
        return false;
    }
}

function searchClients(query) {
    const clients = getClientsFromDB();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return clients;
    
    return clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        (client.bookNo && client.bookNo.toLowerCase().includes(searchTerm)) ||
        (client.measurements && JSON.stringify(client.measurements).toLowerCase().includes(searchTerm))
    );
}

function searchOrders(query) {
    const orders = getOrdersFromDB();
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) return orders;
    
    return orders.filter(order => 
        order.clientName.toLowerCase().includes(searchTerm) ||
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.description.toLowerCase().includes(searchTerm) ||
        order.garmentType.toLowerCase().includes(searchTerm)
    );
}

function generateInvoiceNumber() {
    const invoices = getInvoicesFromDB();
    const today = new Date();
    const dateStr = today.toISOString().slice(0,10).replace(/-/g, '');
    const count = invoices.filter(inv => inv.invoiceDate.includes(today.toISOString().slice(0,10))).length + 1;
    return `INV-${dateStr}-${count.toString().padStart(3, '0')}`;
}

function saveInvoiceToDB(invoice) {
    try {
        const invoices = getInvoicesFromDB();
        
        if (!invoice.invoiceNumber) {
            invoice.invoiceNumber = generateInvoiceNumber();
        }
        
        invoice.createdAt = invoice.createdAt || new Date().toISOString();
        invoice.updatedAt = new Date().toISOString();
        
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        return invoice;
    } catch (error) {
        console.error('Error saving invoice:', error);
        return null;
    }
}

function getInvoicesFromDB() {
    try {
        return JSON.parse(localStorage.getItem('invoices')) || [];
    } catch (error) {
        console.error('Error reading invoices:', error);
        return [];
    }
}

function getInvoiceById(invoiceId) {
    const invoices = getInvoicesFromDB();
    return invoices.find(invoice => invoice.id === invoiceId);
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getSettings() {
    try {
        return JSON.parse(localStorage.getItem('settings')) || {};
    } catch (error) {
        return {};
    }
}

function initializeDefaultData() {
    const clients = getClientsFromDB();
    const invoices = getInvoicesFromDB();
    const expenses = getExpensesFromDB();
    
    if (clients.length === 0 && invoices.length === 0 && expenses.length === 0) {
        const sampleClient = {
            id: generateId(),
            name: "Sample Client",
            phone: "12345678",
            bookNo: "001",
            measurements: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        saveClientToDB(sampleClient);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeDefaultData();
});
