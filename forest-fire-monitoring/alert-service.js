import mqtt from 'mqtt';

const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
const client = mqtt.connect(url);

client.on('connect', () => {
  console.log('alerts connected');
  client.subscribe('alerts/#');
});

client.on('message', (topic, payload) => {
  try {
    const data = JSON.parse(payload.toString());
    console.log(`ALERT ${topic}:`, data);
  } catch (e) {
    console.log(`ALERT ${topic}: ${payload.toString()}`);
  }
});
