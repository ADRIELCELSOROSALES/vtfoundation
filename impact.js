// Traduce un monto (USD) en algo concreto que tu aporte hace posible
// en los programas de la fundación. Se usa en la página de donación
// (impacto en vivo) y en la de gracias. Ajustá los umbrales a tus costos reales.
function vtImpact(amount){
  const a = Number(amount) || 0;
  if (a <= 0)   return "";
  if (a < 15)   return "una <strong>cartilla de lectura</strong> para quien recién empieza";
  if (a < 30)   return "los <strong>materiales de una persona</strong> durante un mes";
  if (a < 50)   return "un <strong>encuentro de alfabetización</strong> en una comunidad";
  if (a < 100)  return "que un <strong>voluntario</strong> llegue a una zona sin escuela cerca";
  return "un <strong>taller de formación en oficios</strong> para varias personas";
}
