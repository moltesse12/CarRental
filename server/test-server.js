// Script de test simple pour vérifier que le serveur fonctionne
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000';

async function testServer() {
  console.log('🧪 Démarrage des tests du serveur...\n');

  // Test 1 : Route de santé
  try {
    console.log('Test 1: Route de santé (GET /)');
    const healthResponse = await fetch(`${BASE_URL}/`);
    const healthText = await healthResponse.text();

    if (healthResponse.ok && healthText.includes('Succeessfully Connected')) {
      console.log('✅ Test 1 réussi: Serveur répond correctement\n');
    } else {
      console.log('❌ Test 1 échoué:', healthText, '\n');
    }
  } catch (error) {
    console.log('❌ Test 1 échoué: Le serveur ne répond pas. Assurez-vous qu\'il est démarré.\n');
    console.log('   Erreur:', error.message, '\n');
    return;
  }

  // Test 2 : Liste des voitures
  try {
    console.log('Test 2: Liste des voitures (GET /api/cars)');
    const carsResponse = await fetch(`${BASE_URL}/api/cars`);
    const carsData = await carsResponse.json();

    if (carsResponse.ok) {
      console.log('✅ Test 2 réussi: Route /api/cars fonctionne');
      console.log(`   Nombre de voitures: ${carsData.cars?.length || 0}\n`);
    } else {
      console.log('❌ Test 2 échoué:', carsData, '\n');
    }
  } catch (error) {
    console.log('❌ Test 2 échoué:', error.message, '\n');
  }

  // Test 3 : Liste des agences
  try {
    console.log('Test 3: Liste des agences (GET /api/agencies)');
    const agenciesResponse = await fetch(`${BASE_URL}/api/agencies`);
    const agenciesData = await agenciesResponse.json();

    if (agenciesResponse.ok) {
      console.log('✅ Test 3 réussi: Route /api/agencies fonctionne');
      console.log(`   Nombre d'agences: ${agenciesData.agencies?.length || 0}\n`);
    } else {
      console.log('❌ Test 3 échoué:', agenciesData, '\n');
    }
  } catch (error) {
    console.log('❌ Test 3 échoué:', error.message, '\n');
  }

  console.log('✨ Tests terminés!');
}

// Exécuter les tests
testServer().catch(console.error);
