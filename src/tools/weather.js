export const weatherTool = {
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Recupere la meteo actuelle pour une ville donnee. Utiliser quand on parle de meteo, temperature, conditions climatiques.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: "Le nom de la ville, en anglais de preference (ex: 'Paris', 'London', 'Tokyo')"
        }
      },
      required: ['city']
    }
  }
};

export async function get_weather({ city }) {
  const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
  if (!response.ok) {
    return { error: `Impossible de recuperer la meteo pour ${city}` };
  }
  let data;
  try {
    data = await response.json();
  } catch {
    return { error: `Reponse invalide pour ${city} (ville inconnue ?)` };
  }
  if (!data.current_condition?.[0]) {
    return { error: `Donnees meteo introuvables pour ${city}` };
  }
  const current = data.current_condition[0];
  return {
    city,
    temperature_c: current.temp_C,
    feels_like_c: current.FeelsLikeC,
    description: current.weatherDesc[0].value,
    humidity: current.humidity + '%',
    wind_kmph: current.windspeedKmph
  };
}
