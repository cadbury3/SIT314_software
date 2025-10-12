import weather from 'weather-js';

export function getWeatherByQuery(query) {
  return new Promise((resolve, reject) => {
    weather.find({ search: query, degreeType: 'C' }, (err, result) => {
      if (err) return reject(err);
      resolve(result || []);
    });
  });
}


