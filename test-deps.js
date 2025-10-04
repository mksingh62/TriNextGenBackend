// Test script to verify all backend dependencies are installed
try {
  require('bcryptjs');
  console.log('✅ bcryptjs: OK');
} catch (err) {
  console.log('❌ bcryptjs: MISSING');
}

try {
  require('jsonwebtoken');
  console.log('✅ jsonwebtoken: OK');
} catch (err) {
  console.log('❌ jsonwebtoken: MISSING');
}

try {
  require('cors');
  console.log('✅ cors: OK');
} catch (err) {
  console.log('❌ cors: MISSING');
}

try {
  require('dotenv');
  console.log('✅ dotenv: OK');
} catch (err) {
  console.log('❌ dotenv: MISSING');
}

try {
  require('express');
  console.log('✅ express: OK');
} catch (err) {
  console.log('❌ express: MISSING');
}

try {
  require('mongoose');
  console.log('✅ mongoose: OK');
} catch (err) {
  console.log('❌ mongoose: MISSING');
}

console.log('Dependency check complete.');