import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
const topic = 'sensors/wind';

client.on('connect', () => {
  console.log('wind sensor connected');
  setInterval(() => {
    const value = Number((Math.random() * 30).toFixed(2)); // m/s
    const msg = { sensorId: 'wind_001', value, ts: Date.now(), unit: 'm/s' };
    client.publish(topic, JSON.stringify(msg));
  }, 2800);
});
