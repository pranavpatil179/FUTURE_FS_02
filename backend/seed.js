require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('🌱 Seeding LeadFlow database...');

// Clear existing data
db.prepare('DELETE FROM notes').run();
db.prepare('DELETE FROM leads').run();
db.prepare('DELETE FROM users').run();

// Seed admin user
const hashedPassword = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(
  'Admin User',
  'admin@leadflow.com',
  hashedPassword
);
console.log('✅ Admin user created: admin@leadflow.com / admin123');

// Sample leads — Indian data
const leads = [
  { name: 'Rahul Mehta', email: 'rahul.mehta@infosys.co.in', phone: '+91-98201-11234', company: 'Infosys Ltd.', source: 'website', status: 'new' },
  { name: 'Priya Sharma', email: 'priya.sharma@tataconsultancy.in', phone: '+91-99874-55321', company: 'Tata Consultancy', source: 'referral', status: 'contacted' },
  { name: 'Amit Verma', email: 'amit.verma@wipro.co.in', phone: '+91-91234-67890', company: 'Wipro Technologies', source: 'social', status: 'converted' },
  { name: 'Sneha Iyer', email: 'sneha.iyer@hcltech.in', phone: '+91-88765-43210', company: 'HCL Technologies', source: 'website', status: 'new' },
  { name: 'Vikram Nair', email: 'vikram.nair@zomatobiz.in', phone: '+91-99001-22334', company: 'Zomato Business', source: 'email', status: 'contacted' },
  { name: 'Ananya Gupta', email: 'ananya.gupta@flipkartpartner.in', phone: '+91-87654-32109', company: 'Flipkart Partners', source: 'referral', status: 'converted' },
  { name: 'Arjun Patel', email: 'arjun.patel@reliance.co.in', phone: '+91-98765-00123', company: 'Reliance Digital', source: 'social', status: 'new' },
  { name: 'Kavitha Reddy', email: 'kavitha.reddy@byju.in', phone: '+91-77889-56432', company: "BYJU'S EdTech", source: 'website', status: 'new' },
  { name: 'Rohit Joshi', email: 'rohit.joshi@ola.in', phone: '+91-96321-78540', company: 'Ola Mobility', source: 'referral', status: 'contacted' },
  { name: 'Meera Krishnan', email: 'meera.k@razorpay.in', phone: '+91-80123-45678', company: 'Razorpay Fintech', source: 'website', status: 'converted' },
];

const insertLead = db.prepare(`
  INSERT INTO leads (name, email, phone, company, source, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

leads.forEach((lead, i) => {
  const daysAgo = i * 2 + Math.floor(Math.random() * 3);
  const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const result = insertLead.run(lead.name, lead.email, lead.phone, lead.company, lead.source, lead.status, createdDate, createdDate);

  // Add sample notes for some leads
  if (i % 2 === 0) {
    db.prepare('INSERT INTO notes (lead_id, text) VALUES (?, ?)').run(
      result.lastInsertRowid,
      `Initial contact made. Discussed ${lead.company}'s needs and potential project scope.`
    );
  }
  if (lead.status === 'converted') {
    db.prepare('INSERT INTO notes (lead_id, text) VALUES (?, ?)').run(
      result.lastInsertRowid,
      `🎉 Deal closed! Contract signed. Onboarding scheduled for next week.`
    );
  }
});

console.log(`✅ ${leads.length} sample leads created with notes`);
console.log('\n🎉 Database seeded successfully!');
console.log('📧 Login: admin@leadflow.com');
console.log('🔑 Password: admin123');
process.exit(0);
