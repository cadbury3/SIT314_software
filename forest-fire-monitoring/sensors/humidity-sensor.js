import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_URL || 'mqtt://localhost:1883');
const topic = 'sensors/humidity';

client.on('connect', () => {
  console.log('humidity sensor connected');
  setInterval(() => {
    const value = Number((Math.random() * 30 + 10).toFixed(2)); // 10-40 %
    const msg = { sensorId: 'humidity_001', value, ts: Date.now(), unit: '%' };
    client.publish(topic, JSON.stringify(msg));
  }, 2500);
});
