import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
const topic = 'sensors/smoke';

client.on('connect', () => {
  console.log('smoke sensor connected');
  setInterval(() => {
    const value = Math.floor(Math.random() * 900 + 50); // ppm
    const msg = { sensorId: 'smoke_001', value, ts: Date.now(), unit: 'ppm' };
    client.publish(topic, JSON.stringify(msg));
  }, 2200);
});
