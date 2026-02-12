/**
 * Script de seed : remplit la base avec des données de démo pour le dashboard et les approbations.
 * À lancer depuis la racine du backend : node scripts/seed-dashboard.js
 * Nécessite : MONGODB_URI dans .env (ou export) ou défaut mongodb://localhost:27017/sensbridge
 */
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
} catch (_) {}
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sensbridge';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const usersCol = db.collection('users');
  const userProfilesCol = db.collection('userprofiles');
  const alertsCol = db.collection('alerts');
  const eventLogsCol = db.collection('eventlogs');
  const devicesCol = db.collection('devices');

  const hashed = await bcrypt.hash('Password123', 10);
  const now = new Date();

  // ——— 1) Utilisateurs "app mobile" (collection users) — pour Approbations ———
  const appUserIds = [];
  const appUsers = [
    { name: 'Marie Dupont', email: 'marie.app@example.com', phone: '+33612345678', userType: 'NORMAL_PERSON', approvalStatus: 'pending', isActive: true },
    { name: 'Jean Martin', email: 'jean.app@example.com', phone: '+33687654321', userType: 'DEAF_PERSON', approvalStatus: 'approved', isActive: true, approvedAt: now, approvedBy: null },
    { name: 'Asso Entendre', email: 'contact@asso-entendre.example.com', phone: '+33611111111', userType: 'ORGANIZATION', approvalStatus: 'approved', isActive: true, approvedAt: now },
  ];
  for (const u of appUsers) {
    const doc = {
      name: u.name,
      email: u.email,
      password: hashed,
      phone: u.phone,
      userType: u.userType,
      authProvider: 'local',
      approvalStatus: u.approvalStatus,
      isActive: u.isActive,
      approvedAt: u.approvedAt || null,
      approvedBy: u.approvedBy || null,
      createdAt: now,
      updatedAt: now,
    };
    const existing = await usersCol.findOne({ email: u.email });
    if (!existing) {
      const r = await usersCol.insertOne(doc);
      appUserIds.push(r.insertedId);
    } else {
      appUserIds.push(existing._id);
    }
  }
  console.log('Users (app mobile):', appUserIds.length, 'documents');

  // ——— 2) Profils CDC (collection userprofiles) — pour Dashboard "Utilisateurs (profils)" et graphique ———
  const profileTypes = ['NORMAL_PERSON', 'DEAF_PERSON', 'Sourd', 'Parent', 'ORGANIZATION'];
  for (let i = 0; i < 8; i++) {
    const email = `profil-cdc-${i}@example.com`;
    if (await userProfilesCol.findOne({ email })) continue;
    await userProfilesCol.insertOne({
      displayName: `Profil CDC ${i + 1}`,
      email,
      profileType: profileTypes[i % profileTypes.length],
      isActive: true,
      lastConnection: i < 3 ? new Date(Date.now() - 2 * 60 * 60 * 1000) : null,
      createdAt: now,
      updatedAt: now,
    });
  }
  const profileCount = await userProfilesCol.countDocuments();
  console.log('UserProfiles:', profileCount);

  // ——— 3) Alertes (7 derniers jours, types Pleurs / Sirènes / Verre cassé) — pour Alerts Overview et KPIs ———
  const soundTypes = ['Pleurs', 'Sirènes', 'Verre cassé'];
  const priorities = ['P1', 'P2', 'P3'];
  const userIdForAlerts = appUserIds[0] || new mongoose.Types.ObjectId();
  for (let d = 0; d < 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    date.setHours(10 + d, 30, 0, 0);
    for (let s = 0; s < soundTypes.length; s++) {
      const count = 3 + Math.floor(Math.random() * 15) + d * 2;
      for (let c = 0; c < count; c++) {
        const created = new Date(date);
        created.setMinutes(created.getMinutes() + c * 5);
        await alertsCol.insertOne({
          userId: userIdForAlerts.toString(),
          priority: priorities[c % 3],
          message: `Alerte ${soundTypes[s]} - test`,
          soundType: soundTypes[s],
          acknowledged: c % 4 === 0,
          createdAt: created,
          updatedAt: created,
        });
      }
    }
  }
  const alertsCount = await alertsCol.countDocuments();
  console.log('Alerts:', alertsCount);

  // ——— 4) Event logs — pour KPI Event Logs ———
  const eventTypes = ['sound_detected', 'alert_triggered', 'user_action'];
  const soundLabels = ['Pleurs', 'Sirènes', 'Verre cassé', 'Klaxon', 'Porte'];
  for (let i = 0; i < 25; i++) {
    const created = new Date(now);
    created.setHours(created.getHours() - i, created.getMinutes(), 0, 0);
    await eventLogsCol.insertOne({
      userId: (appUserIds[0] || appUserIds[1]).toString(),
      eventType: eventTypes[i % eventTypes.length],
      soundLabel: soundLabels[i % soundLabels.length],
      confidence: 0.7 + Math.random() * 0.3,
      createdAt: created,
      updatedAt: created,
    });
  }
  const eventsCount = await eventLogsCol.countDocuments();
  console.log('EventLogs:', eventsCount);

  // ——— 5) Devices (optionnel) — pour KPI Devices actifs ———
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  for (let i = 0; i < 3; i++) {
    const deviceId = `seed-device-${i}-${Date.now()}`;
    if (await devicesCol.findOne({ deviceId })) continue;
    await devicesCol.insertOne({
      deviceId,
      userId: (appUserIds[i % appUserIds.length] || appUserIds[0]).toString(),
      type: i === 0 ? 'Smartwatch' : 'Smartphone',
      name: `Device ${i + 1}`,
      os: i === 0 ? 'Android' : 'iOS',
      lastSync: i < 2 ? fiveMinAgo : new Date(Date.now() - 60 * 60 * 1000),
      isConnected: i < 2,
      createdAt: now,
      updatedAt: now,
    });
  }
  const devicesCount = await devicesCol.countDocuments();
  console.log('Devices:', devicesCount);

  console.log('\nSeed terminé. Rechargez le dashboard et la page Approbations.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
