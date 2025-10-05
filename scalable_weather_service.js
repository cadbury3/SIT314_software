const net = require("net");
const EventEmitter = require("events");

// Improved scalable architecture with microservices approach
class ScalableWeatherService extends EventEmitter {
    constructor(port = 6000) {
        super();
        this.port = port;
        this.sensorData = new Map();
        this.clientConnections = new Map();
        this.warningHistory = [];
        this.connectionCount = 0;
        this.maxConnections = 1000; // Increased capacity
        this.dataRetentionLimit = 100; // Increased data retention
        this.warningRetentionLimit = 200; // Increased warning retention
        
        // Performance monitoring
        this.performanceMetrics = {
            requestsPerSecond: 0,
            averageResponseTime: 0,
            memoryUsage: 0,
            activeConnections: 0,
            dataPointsStored: 0
        };
        
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
            this.emit('performanceUpdate', this.performanceMetrics);
        }, 5000);
    }

    updatePerformanceMetrics() {
        this.performanceMetrics.activeConnections = this.clientConnections.size;
        this.performanceMetrics.memoryUsage = process.memoryUsage();
        
        // Calculate data points stored
        let totalDataPoints = 0;
        this.sensorData.forEach(dataArray => {
            totalDataPoints += dataArray.length;
        });
        this.performanceMetrics.dataPointsStored = totalDataPoints;
    }

    parseEnhancedData(strData) {
        try {
            const parts = strData.split(",");
            const command = parts[0];
            const value = parts[1];
            
            let location = "Central";
            let timestamp = new Date().toISOString();
            let additionalData = {};
            
            switch (command) {
                case "temp":
                    if (parts.length >= 4) {
                        location = parts[2];
                        timestamp = parts[3];
                    }
                    break;
                case "rain":
                    if (parts.length >= 4) {
                        location = parts[2];
                        timestamp = parts[3];
                    }
                    break;
                case "wind":
                    if (parts.length >= 5) {
                        additionalData.direction = parts[2];
                        location = parts[3];
                        timestamp = parts[4];
                    }
                    break;
                case "fire":
                    if (parts.length >= 3) {
                        location = parts[2];
                    }
                    break;
            }
            
            return {
                command,
                value: parseFloat(value) || value,
                location,
                timestamp,
                additionalData
            };
        } catch (error) {
            throw new Error(`Data parsing error: ${error.message}`);
        }
    }

    storeSensorData(parsedData) {
        const key = `${parsedData.command}_${parsedData.location}`;
        
        if (!this.sensorData.has(key)) {
            this.sensorData.set(key, []);
        }
        
        const dataEntry = {
            value: parsedData.value,
            timestamp: parsedData.timestamp,
            additionalData: parsedData.additionalData
        };
        
        this.sensorData.get(key).push(dataEntry);
        
        // Implement circular buffer for memory management
        if (this.sensorData.get(key).length > this.dataRetentionLimit) {
            this.sensorData.get(key).shift();
        }
        
        this.emit('dataStored', { key, dataEntry });
    }

    getLatestSensorData(sensorType, location) {
        const key = `${sensorType}_${location}`;
        const data = this.sensorData.get(key);
        return data && data.length > 0 ? data[data.length - 1] : null;
    }

    getAllLocations() {
        const locations = new Set();
        this.sensorData.forEach((data, key) => {
            const location = key.split('_')[1];
            locations.add(location);
        });
        return Array.from(locations);
    }

    calculateFireRisk(location) {
        const tempData = this.getLatestSensorData("temp", location);
        const rainData = this.getLatestSensorData("rain", location);
        const windData = this.getLatestSensorData("wind", location);
        
        if (!tempData || !rainData || !windData) {
            return "NO RATING";
        }
        
        const temp = tempData.value;
        const rain = rainData.value;
        const wind = windData.value;
        
        let riskScore = 0;
        
        // Enhanced risk calculation
        if (temp > 35) riskScore += 3;
        else if (temp > 30) riskScore += 2;
        else if (temp > 25) riskScore += 1;
        
        if (rain < 5) riskScore += 3;
        else if (rain < 15) riskScore += 2;
        else if (rain < 30) riskScore += 1;
        
        if (wind > 40) riskScore += 3;
        else if (wind > 25) riskScore += 2;
        else if (wind > 15) riskScore += 1;
        
        if (riskScore >= 7) return "CATASTROPHIC";
        else if (riskScore >= 5) return "EXTREME";
        else if (riskScore >= 3) return "HIGH";
        else if (riskScore >= 1) return "MODERATE";
        else return "NO RATING";
    }

    generateWeatherWarning(location) {
        const tempData = this.getLatestSensorData("temp", location);
        const rainData = this.getLatestSensorData("rain", location);
        const windData = this.getLatestSensorData("wind", location);
        
        if (!tempData || !rainData || !windData) {
            return `Insufficient data for ${location}`;
        }
        
        const temp = tempData.value;
        const rain = rainData.value;
        const wind = windData.value;
        const fireRisk = this.calculateFireRisk(location);
        
        const warnings = [];
        
        if (temp > 35) warnings.push("EXTREME HEAT WARNING");
        else if (temp > 30) warnings.push("HEAT WARNING");
        
        if (rain > 50) warnings.push("HEAVY RAIN WARNING");
        else if (rain > 25) warnings.push("RAIN WARNING");
        
        if (wind > 50) warnings.push("STRONG WIND WARNING");
        else if (wind > 30) warnings.push("WIND WARNING");
        
        if (fireRisk === "CATASTROPHIC" || fireRisk === "EXTREME") {
            warnings.push("FIRE DANGER WARNING");
        }
        
        const warningText = warnings.length > 0 ? warnings.join(" | ") : "All Clear";
        
        const warning = {
            location,
            warnings,
            timestamp: new Date().toISOString(),
            sensorData: { temp, rain, wind, fireRisk }
        };
        
        this.warningHistory.push(warning);
        
        // Implement circular buffer for warning history
        if (this.warningHistory.length > this.warningRetentionLimit) {
            this.warningHistory.shift();
        }
        
        this.emit('warningGenerated', warning);
        
        return `${warningText} | Fire Risk: ${fireRisk} | Location: ${location} | Temp: ${temp.toFixed(1)}°C | Rain: ${rain.toFixed(1)}mm | Wind: ${wind.toFixed(1)}km/h`;
    }

    getSystemStatus() {
        const locations = this.getAllLocations();
        const recentWarnings = this.warningHistory.filter(w => 
            new Date() - new Date(w.timestamp) < 300000 // Last 5 minutes
        );
        
        return {
            totalSensors: this.sensorData.size,
            activeConnections: this.clientConnections.size,
            locations: locations,
            recentWarnings: recentWarnings.length,
            performanceMetrics: this.performanceMetrics,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
    }

    getLocationSummary(location) {
        const sensors = ['temp', 'rain', 'wind', 'fire'];
        const summary = {};
        
        sensors.forEach(sensor => {
            const data = this.getLatestSensorData(sensor, location);
            if (data) {
                summary[sensor] = {
                    value: data.value,
                    timestamp: data.timestamp,
                    additionalData: data.additionalData
                };
            }
        });
        
        summary.fireRisk = this.calculateFireRisk(location);
        summary.location = location;
        
        return summary;
    }

    getAllLocationsSummary() {
        const locations = this.getAllLocations();
        return locations.map(location => this.getLocationSummary(location));
    }

    startServer() {
        this.server = net.createServer((socket) => {
            if (this.clientConnections.size >= this.maxConnections) {
                socket.write("Server at capacity. Please try again later.");
                socket.end();
                return;
            }
            
            const clientId = ++this.connectionCount;
            const connection = {
                socket,
                connectedAt: new Date(),
                dataReceived: 0,
                lastActivity: new Date()
            };
            
            this.clientConnections.set(clientId, connection);
            
            console.log(`Client ${clientId} connected. Total connections: ${this.clientConnections.size}`);
            this.emit('clientConnected', { clientId, totalConnections: this.clientConnections.size });

            socket.on("data", (data) => {
                const startTime = Date.now();
                const strData = data.toString().trim();
                
                connection.dataReceived++;
                connection.lastActivity = new Date();
                
                console.log(`Client ${clientId} sent: ${strData}`);
                
                try {
                    const parsedData = this.parseEnhancedData(strData);
                    let result;
                    
                    switch (parsedData.command) {
                        case "temp":
                        case "rain":
                        case "wind":
                        case "fire":
                            this.storeSensorData(parsedData);
                            result = "ok";
                            break;
                        case "request":
                            result = this.generateWeatherWarning(parsedData.location || "Central");
                            break;
                        case "status":
                            result = JSON.stringify(this.getSystemStatus());
                            break;
                        case "history":
                            const recentWarnings = this.warningHistory.slice(-10);
                            result = JSON.stringify(recentWarnings);
                            break;
                        case "locations":
                            result = JSON.stringify(this.getAllLocationsSummary());
                            break;
                        case "location":
                            result = JSON.stringify(this.getLocationSummary(parsedData.location || "Central"));
                            break;
                        default:
                            result = "Unknown command";
                    }
                    
                    socket.write(result);
                    
                    const responseTime = Date.now() - startTime;
                    this.emit('requestProcessed', { clientId, responseTime, command: parsedData.command });
                    
                    console.log(`Sent to client ${clientId}: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
                    
                } catch (error) {
                    console.error(`Error processing data from client ${clientId}:`, error.message);
                    socket.write(`Error: ${error.message}`);
                }
            });

            socket.on("end", () => {
                this.clientConnections.delete(clientId);
                console.log(`Client ${clientId} disconnected. Remaining connections: ${this.clientConnections.size}`);
                this.emit('clientDisconnected', { clientId, remainingConnections: this.clientConnections.size });
            });

            socket.on("error", (error) => {
                console.log(`Socket Error (Client ${clientId}): ${error.message}`);
                this.clientConnections.delete(clientId);
                this.emit('clientError', { clientId, error: error.message });
            });
        });

        this.server.on("error", (error) => {
            console.log(`Server Error: ${error.message}`);
            this.emit('serverError', error);
        });

        this.server.listen(this.port, () => {
            console.log(`Scalable Weather Service running on port: ${this.port}`);
            console.log(`Max connections: ${this.maxConnections}`);
            console.log(`Data retention: ${this.dataRetentionLimit} points per sensor`);
            console.log(`Warning retention: ${this.warningRetentionLimit} warnings`);
            this.emit('serverStarted', { port: this.port, maxConnections: this.maxConnections });
        });
    }

    stopServer() {
        if (this.server) {
            this.server.close(() => {
                console.log('Server stopped');
                this.emit('serverStopped');
            });
        }
    }
}

// Create and start the scalable service
const weatherService = new ScalableWeatherService(6000);

// Add event listeners for monitoring
weatherService.on('performanceUpdate', (metrics) => {
    console.log(`Performance: ${metrics.activeConnections} connections, ${metrics.dataPointsStored} data points`);
});

weatherService.on('warningGenerated', (warning) => {
    console.log(`Warning generated for ${warning.location}: ${warning.warnings.join(', ')}`);
});

weatherService.on('clientConnected', (data) => {
    console.log(`Client connected. Total: ${data.totalConnections}`);
});

weatherService.on('clientDisconnected', (data) => {
    console.log(`Client disconnected. Remaining: ${data.remainingConnections}`);
});

// Start the server
weatherService.startServer();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down scalable weather service...');
    weatherService.stopServer();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

module.exports = ScalableWeatherService;
