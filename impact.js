// Traduce un monto (USD) en algo concreto, según el destino del aporte:
//  - "app"     -> lo que se construye de la app
//  - "general" -> lo que sostiene en los programas de la fundación
// Se usa en la página de donación (impacto en vivo) y en la de gracias.
// Ajustá umbrales y textos a tus costos reales.
function vtImpact(amount, destino){
  const a = Number(amount) || 0;
  if (a <= 0) return "";

  if (destino === "app"){
    if (a < 15)  return "las <strong>primeras pantallas</strong> donde alguien aprende sus primeras letras";
    if (a < 30)  return "una parte del <strong>primer módulo de lectura</strong> de la app";
    if (a < 50)  return "el <strong>módulo de audio</strong> para quien todavía no lee un texto";
    if (a < 100) return "que la app <strong>funcione sin señal</strong> en zonas rurales";
    return "que la app <strong>llegue a una comunidad piloto</strong>";
  }

  // general (fundación)
  if (a < 15)  return "una <strong>cartilla de lectura</strong> para quien recién empieza";
  if (a < 30)  return "los <strong>materiales de una persona</strong> durante un mes";
  if (a < 50)  return "un <strong>encuentro de alfabetización</strong> en una comunidad";
  if (a < 100) return "que un <strong>voluntario</strong> llegue a una zona sin escuela cerca";
  return "un <strong>taller de formación</strong> para varias personas";
}
