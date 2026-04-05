/**
 * LeadFlow Virtual Database (Pure JS)
 * This replaces SQLite for zero-config deployment on Vercel.
 */

const sampleLeads = [
  { id: 1, name: 'Rahul Mehta', email: 'rahul.mehta@infosys.co.in', phone: '+91-98201-11234', company: 'Infosys Ltd.', source: 'website', status: 'new', created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 2, name: 'Priya Sharma', email: 'priya.sharma@tataconsultancy.in', phone: '+91-99874-55321', company: 'Tata Consultancy', source: 'referral', status: 'contacted', created_at: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 3, name: 'Amit Verma', email: 'amit.verma@wipro.co.in', phone: '+91-91234-67890', company: 'Wipro Technologies', source: 'social', status: 'converted', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 4, name: 'Sneha Iyer', email: 'sneha.iyer@hcltech.in', phone: '+91-88765-43210', company: 'HCL Technologies', source: 'website', status: 'new', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 5, name: 'Vikram Nair', email: 'vikram.nair@zomatobiz.in', phone: '+91-99001-22334', company: 'Zomato Business', source: 'email', status: 'contacted', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 6, name: 'Ananya Gupta', email: 'ananya.gupta@flipkartpartner.in', phone: '+91-87654-32109', company: 'Flipkart Partners', source: 'referral', status: 'converted', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 7, name: 'Arjun Patel', email: 'arjun.patel@reliance.co.in', phone: '+91-98765-00123', company: 'Reliance Digital', source: 'social', status: 'new', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 8, name: 'Kavitha Reddy', email: 'kavitha.reddy@byju.in', phone: '+91-77889-56432', company: "BYJU'S EdTech", source: 'website', status: 'new', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 9, name: 'Rohit Joshi', email: 'rohit.joshi@ola.in', phone: '+91-96321-78540', company: 'Ola Mobility', source: 'referral', status: 'contacted', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 10, name: 'Meera Krishnan', email: 'meera.k@razorpay.in', phone: '+91-80123-45678', company: 'Razorpay Fintech', source: 'website', status: 'converted', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const sampleNotes = [
  { id: 1, lead_id: 1, text: 'Initial contact made. Discussed Infosys Ltd.\'s needs and potential project scope.', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 2, lead_id: 3, text: '🎉 Deal closed! Contract signed. Onboarding scheduled for next week.', created_at: new Date(Date.now() - 9 * 86400000).toISOString() },
  { id: 3, lead_id: 6, text: '🎉 Deal closed! Contract signed. Onboarding scheduled for next week.', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
];

const sampleUsers = [
  { id: 1, name: 'Admin User', email: 'admin@leadflow.com', password: '$2a$10$w85Z9mNAnG4O7tYv0X9uCeY3L1QvP9H0p5G1v5U3.Z1Y2X3W4V5U6' } // 'admin123'
];

let leads = [...sampleLeads];
let notes = [...sampleNotes];
let users = [...sampleUsers];

const db = {
  prepare: (sql) => {
    return {
      all: (...args) => {
        if (sql.includes('FROM users')) return users;
        if (sql.includes('FROM leads') && sql.includes('notes_count')) {
          return leads.map(l => ({
            ...l,
            notes_count: notes.filter(n => n.lead_id === l.id).length
          }));
        }
        if (sql.includes('FROM leads') && sql.includes('GROUP BY source')) {
          const counts = {};
          leads.forEach(l => { counts[l.source] = (counts[l.source] || 0) + 1; });
          return Object.entries(counts).map(([source, count]) => ({ source, count }));
        }
        if (sql.includes('DATE(created_at) as date')) {
          const trends = {};
          leads.forEach(l => {
            const d = l.created_at.split('T')[0];
            trends[d] = (trends[d] || 0) + 1;
          });
          return Object.entries(trends).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date));
        }
        if (sql.includes('FROM notes')) {
          const leadId = args[0];
          return notes.filter(n => n.lead_id == leadId).sort((a,b) => b.id - a.id);
        }
        return [];
      },
      get: (...args) => {
        const param = args[0];
        if (sql.includes('FROM users')) return users.find(u => u.email === param || u.id == param);
        if (sql.includes('FROM leads') && sql.includes('COUNT(*)')) {
          if (sql.includes("status='new'")) return { count: leads.filter(l => l.status === 'new').length };
          if (sql.includes("status='contacted'")) return { count: leads.filter(l => l.status === 'contacted').length };
          if (sql.includes("status='converted'")) return { count: leads.filter(l => l.status === 'converted').length };
          return { count: leads.length };
        }
        if (sql.includes('FROM leads')) return leads.find(l => l.id == param);
        if (sql.includes('FROM notes')) return notes.find(n => n.id == param);
        return null;
      },
      run: (...args) => {
        if (sql.includes('INSERT INTO leads')) {
          const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
          const [name, email, phone, company, source, status] = args;
          leads.push({ id: newId, name, email, phone, company, source, status: 'new', created_at: new Date().toISOString() });
          return { lastInsertRowid: newId };
        }
        if (sql.includes('INSERT INTO notes')) {
          const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
          const [lead_id, text] = args;
          notes.push({ id: newId, lead_id, text, created_at: new Date().toISOString() });
          return { lastInsertRowid: newId };
        }
        if (sql.includes('UPDATE leads')) {
          const id = args[args.length - 1];
          const leadIdx = leads.findIndex(l => l.id == id);
          if (leadIdx > -1) {
             const [name, email, phone, company, source, status] = args;
             if (name) leads[leadIdx].name = name;
             if (email) leads[leadIdx].email = email;
             if (status) leads[leadIdx].status = status;
          }
          return { changes: 1 };
        }
        if (sql.includes('DELETE FROM leads')) {
           const id = args[0];
           leads = leads.filter(l => l.id != id);
           return { changes: 1 };
        }
        return { changes: 0 };
      }
    };
  },
  exec: () => {}
};

module.exports = db;
