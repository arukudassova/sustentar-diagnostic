import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";


const LOGO_URL = "/logo.png";

const TEAL = "#2a7a6a";
const TEAL_LIGHT = "#e8f5f2";
const TEAL_MID = "#c2e0da";
const ACCENT = "#4aab93";
const TEXT = "#1a2e28";
const MUTED = "#6b8c84";
const BORDER = "#d4e8e3";
const BG = "#f7faf9";
const WHITE = "#ffffff";

// Scoring follows document: binary No=0/Sí=3, partial No=0/Parcial=2/Sí=3, % No=0/25-50=1/50-75=2/>75=3
const OPT_BINARY = (es, en) => ({
  es: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }],
  en: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }],
});
const OPT_PARTIAL = (esPartial, enPartial) => ({
  es: [{ label: "No", score: 0 }, { label: esPartial, score: 2 }, { label: "Sí", score: 3 }],
  en: [{ label: "No", score: 0 }, { label: enPartial, score: 2 }, { label: "Yes", score: 3 }],
});
const OPT_PCT = {
  es: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "Más del 75%", score: 3 }],
  en: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "More than 75%", score: 3 }],
};

const CITY_GROUPS = [
  { country: "Argentina", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Mar del Plata", "San Miguel de Tucumán", "Salta", "Santa Fe", "San Juan", "Resistencia", "Santiago del Estero", "Corrientes", "Posadas", "Neuquén", "Bahía Blanca", "San Salvador de Jujuy", "Río Cuarto", "Paraná", "Formosa"] },
  { country: "Brasil", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre", "Belém", "Goiânia", "Florianópolis", "Maceió", "Natal"] },
  { country: "Colombia", cities: ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira", "Manizales", "Ibagué", "Santa Marta", "Villavicencio"] },
  { country: "Chile", cities: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Iquique", "Puerto Montt", "Arica"] },
  { country: "Perú", cities: ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Iquitos", "Cusco", "Huancayo", "Tacna"] },
  { country: "Venezuela", cities: ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana", "Maturín"] },
  { country: "Ecuador", cities: ["Guayaquil", "Quito", "Cuenca", "Santo Domingo", "Ambato", "Machala", "Portoviejo"] },
  { country: "Bolivia", cities: ["La Paz", "Santa Cruz de la Sierra", "Cochabamba", "Oruro", "Potosí", "Sucre", "Tarija"] },
  { country: "Paraguay", cities: ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora"] },
  { country: "Uruguay", cities: ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras", "Rivera", "Maldonado"] },
];

const CITIES = {
  es: CITY_GROUPS,
  en: CITY_GROUPS,
};

// ── MEASURES TILES (from Capítulo 3, Guía PMUS Argentina) ─────────────────
const MF = {
  // Helpers for repeated field values
  tipos: {
    infra: { es: "Infraestructura", en: "Infrastructure" },
    legal: { es: "Legales / Regulatorios", en: "Legal / Regulatory" },
    serv:  { es: "Servicios", en: "Services" },
    com:   { es: "Comunicación", en: "Communication" },
  },
  hor: {
    c:  { es: "Corto plazo", en: "Short term" },
    m:  { es: "Mediano plazo", en: "Medium term" },
    l:  { es: "Largo plazo", en: "Long term" },
    cm: { es: "Corto / Mediano plazo", en: "Short / Medium term" },
    ml: { es: "Mediano / Largo plazo", en: "Medium / Long term" },
  },
  costo: {
    b:  { es: "Bajo", en: "Low" },
    m:  { es: "Medio", en: "Medium" },
    a:  { es: "Alto", en: "High" },
    bm: { es: "Bajo / Medio", en: "Low / Medium" },
    ma: { es: "Medio / Alto", en: "Medium / High" },
  },
  ambito: {
    all:   { es: "Todos los ámbitos", en: "All contexts" },
    gci:   { es: "Grandes aglomerados · Ciudades intermedias", en: "Large agglomerations · Mid-size cities" },
    rmba:  { es: "RMBA · Grandes aglomerados", en: "Metro area · Large agglomerations" },
    inter: { es: "Ciudades intermedias · Localidades pequeñas", en: "Mid-size cities · Small towns" },
  },
  ecm: {
    e:  { es: "Evitar viajes motorizados", en: "Avoid motorised trips" },
    c:  { es: "Cambiar a modos sostenibles", en: "Shift to sustainable modes" },
    m:  { es: "Mejorar eficiencia del sistema", en: "Improve system efficiency" },
    ec: { es: "Evitar · Cambiar", en: "Avoid · Shift" },
    cm: { es: "Cambiar · Mejorar", en: "Shift · Improve" },
    ecm:{ es: "Evitar · Cambiar · Mejorar", en: "Avoid · Shift · Improve" },
  },
};

const MEASURE_GROUPS = [
  {
    group: "A", label: { es: "Movilidad de pie", en: "Walking Mobility" },
    color: "#e8a020", bg: "#fef3dc", light: "#fffbf0",
    measures: [
      { code: "A1", name: { es: "Red peatonal y caminabilidad", en: "Pedestrian network & walkability" }, desc: { es: "Red segura y accesible para todos: veredas, conectividad, iluminación, arbolado e información peatonal.", en: "Safe, accessible pedestrian network: sidewalks, connectivity, lighting, trees and wayfinding." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.m, ambito: MF.ambito.all, ecm: MF.ecm.ec, diagCats: ["movilidad_activa"] },
      { code: "A2", name: { es: "Peatonalización y calles compartidas", en: "Pedestrianisation & shared streets" }, desc: { es: "Calles peatonales y de convivencia que priorizan al peatón sobre el vehículo motorizado.", en: "Pedestrian streets and shared spaces that prioritise people over motor vehicles." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.ma, ambito: MF.ambito.gci, ecm: MF.ecm.ec, diagCats: ["movilidad_activa"] },
      { code: "A3", name: { es: "Veredas accesibles", en: "Accessible sidewalks" }, desc: { es: "Veredas adaptadas para personas con movilidad reducida: rampas, pavimento táctil, semáforos sonoros.", en: "Sidewalks adapted for people with reduced mobility: ramps, tactile paving, audible signals." }, tipos: [MF.tipos.infra], horizonte: MF.hor.c, costo: MF.costo.m, ambito: MF.ambito.all, ecm: MF.ecm.c, diagCats: ["movilidad_activa"] },
      { code: "A4", name: { es: "Cruces seguros", en: "Safe crossings" }, desc: { es: "Diseño de intersecciones y pasos peatonales que reduzcan conflictos con el tránsito vehicular.", en: "Intersection and crosswalk design that reduces conflicts with vehicle traffic." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.c, costo: MF.costo.bm, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["seguridad"] },
      { code: "A5", name: { es: "Sistemas de información peatonal", en: "Pedestrian information systems" }, desc: { es: "Cartelería, mapas y apps de orientación para desplazamientos a pie en el área urbana.", en: "Signage, maps and apps for pedestrian navigation in the urban area." }, tipos: [MF.tipos.infra, MF.tipos.serv], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.gci, ecm: MF.ecm.c, diagCats: ["tecnologia"] },
      { code: "A6", name: { es: "Caminos escolares", en: "School routes" }, desc: { es: "Rutas seguras entre los hogares y las escuelas, con infraestructura y señalización específica.", en: "Safe routes between homes and schools with dedicated infrastructure and signage." }, tipos: [MF.tipos.infra, MF.tipos.com], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.ec, diagCats: ["movilidad_activa", "seguridad"] },
    ]
  },
  {
    group: "B", label: { es: "Bicicletas", en: "Cycling" },
    color: "#3a9e6a", bg: "#dcf5e7", light: "#f0fbf5",
    measures: [
      { code: "B1", name: { es: "Red de vías ciclistas", en: "Cycling lane network" }, desc: { es: "Red continua y conectada de carriles, ciclovías y calles de convivencia para la circulación segura en bicicleta.", en: "Continuous, connected network of lanes, cycle paths and shared streets for safe cycling." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.ml, costo: MF.costo.ma, ambito: MF.ambito.gci, ecm: MF.ecm.ec, diagCats: ["movilidad_activa"] },
      { code: "B2", name: { es: "Estacionamientos y guarderías para bicicletas", en: "Bicycle parking & storage" }, desc: { es: "Infraestructura de estacionamiento seguro en espacios públicos, estaciones de transporte y edificios.", en: "Secure parking infrastructure in public spaces, transit hubs and buildings." }, tipos: [MF.tipos.infra], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.c, diagCats: ["movilidad_activa"] },
      { code: "B3", name: { es: "Sistema de bicicletas públicas compartidas", en: "Public bike-share system" }, desc: { es: "Servicio de préstamo de bicicletas con estaciones repartidas en la ciudad para viajes de corta distancia.", en: "Bike lending service with stations distributed across the city for short trips." }, tipos: [MF.tipos.infra, MF.tipos.serv, MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.ma, ambito: MF.ambito.gci, ecm: MF.ecm.c, diagCats: ["movilidad_activa", "normativa"] },
      { code: "B4", name: { es: "Políticas de incentivo al uso de la bicicleta", en: "Cycling incentive policies" }, desc: { es: "Programas de promoción, biciescuelas, beneficios fiscales y campañas para fomentar el ciclismo urbano.", en: "Promotion programmes, cycling schools, tax benefits and campaigns to encourage urban cycling." }, tipos: [MF.tipos.legal, MF.tipos.com], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.c, diagCats: ["planificacion", "movilidad_activa"] },
    ]
  },
  {
    group: "C", label: { es: "Transporte Público", en: "Public Transport" },
    color: "#2a7abf", bg: "#dceefb", light: "#f0f7ff",
    measures: [
      { code: "C1", name: { es: "Creación del servicio de transporte público masivo", en: "New mass transit service" }, desc: { es: "Creación de nuevas líneas de bus, BRT, tren o metro que amplíen la cobertura de la red.", en: "Creation of new bus, BRT, rail or metro lines to expand network coverage." }, tipos: [MF.tipos.infra, MF.tipos.legal, MF.tipos.serv], horizonte: MF.hor.ml, costo: MF.costo.a, ambito: MF.ambito.gci, ecm: MF.ecm.c, diagCats: ["transporte"] },
      { code: "C2", name: { es: "Reorganización y optimización de la red existente", en: "Reorganisation of existing network" }, desc: { es: "Revisión de recorridos, frecuencias y transbordos para mejorar la eficiencia del sistema actual.", en: "Review of routes, frequencies and transfers to improve the efficiency of the current system." }, tipos: [MF.tipos.legal, MF.tipos.serv], horizonte: MF.hor.cm, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["transporte"] },
      { code: "C3", name: { es: "Mejora de la infraestructura de acceso al TP", en: "Improved access infrastructure" }, desc: { es: "Mejora de paradas, accesos, información y condiciones de espera para los usuarios del transporte público.", en: "Improvement of stops, access points, information and waiting conditions for public transport users." }, tipos: [MF.tipos.infra], horizonte: MF.hor.cm, costo: MF.costo.m, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["transporte"] },
      { code: "C4", name: { es: "Reconversión de flota y nuevas tecnologías", en: "Fleet decarbonisation & new tech" }, desc: { es: "Incorporación de vehículos eléctricos, a gas o híbridos para reducir emisiones del transporte público.", en: "Introduction of electric, gas or hybrid vehicles to reduce public transport emissions." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.ml, costo: MF.costo.a, ambito: MF.ambito.gci, ecm: MF.ecm.m, diagCats: ["transporte", "normativa"] },
      { code: "C5", name: { es: "APP y sistemas de información para el viaje", en: "Trip planning apps & info systems" }, desc: { es: "Aplicaciones y pantallas de información en tiempo real sobre horarios, recorridos y alteraciones del servicio.", en: "Real-time apps and displays showing schedules, routes and service disruptions." }, tipos: [MF.tipos.serv, MF.tipos.com], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.gci, ecm: MF.ecm.m, diagCats: ["tecnologia", "transporte"] },
      { code: "C6", name: { es: "Priorización del transporte público masivo", en: "Public transport priority" }, desc: { es: "Carriles exclusivos, semáforos preferenciales y otras medidas que den prioridad al transporte colectivo.", en: "Dedicated lanes, signal priority and other measures giving priority to collective transport." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.m, ambito: MF.ambito.gci, ecm: MF.ecm.ecm, diagCats: ["transporte"] },
    ]
  },
  {
    group: "D", label: { es: "Gestión Vial", en: "Road Management" },
    color: "#c94040", bg: "#fde8e8", light: "#fff5f5",
    measures: [
      { code: "D1", name: { es: "Definición y revisión de la jerarquía vial", en: "Road hierarchy definition" }, desc: { es: "Clasificación de calles según su función para asignar prioridades a distintos modos de transporte.", en: "Classification of streets by function to assign priorities to different transport modes." }, tipos: [MF.tipos.legal], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.ecm, diagCats: ["planificacion"] },
      { code: "D2", name: { es: "Gestión de estacionamiento", en: "Parking management" }, desc: { es: "Políticas de estacionamiento regulado, tarifado o limitado para gestionar la demanda del automóvil.", en: "Regulated, priced or restricted parking policies to manage car demand." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.bm, ambito: MF.ambito.gci, ecm: MF.ecm.e, diagCats: ["planificacion"] },
      { code: "D3", name: { es: "Restricción al transporte motorizado privado", en: "Private motor vehicle restrictions" }, desc: { es: "Restricciones de circulación, zonas de bajas emisiones y otras medidas para reducir el uso del auto.", en: "Circulation restrictions, low-emission zones and other measures to reduce car use." }, tipos: [MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.b, ambito: MF.ambito.gci, ecm: MF.ecm.e, diagCats: ["normativa", "planificacion"] },
      { code: "D4", name: { es: "Gestión de la velocidad", en: "Speed management" }, desc: { es: "Implementación de zonas 30, lomos de burro y otras medidas de moderación de velocidad.", en: "Implementation of 30km/h zones, speed humps and other traffic calming measures." }, tipos: [MF.tipos.infra, MF.tipos.legal], horizonte: MF.hor.c, costo: MF.costo.bm, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["seguridad"] },
      { code: "D5", name: { es: "Diseño vial seguro y tránsito calmado", en: "Safe road design & traffic calming" }, desc: { es: "Rediseño geométrico de intersecciones, cruces y vías para reducir la siniestralidad.", en: "Geometric redesign of intersections, crossings and roads to reduce crash rates." }, tipos: [MF.tipos.infra], horizonte: MF.hor.ml, costo: MF.costo.ma, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["seguridad"] },
      { code: "D6", name: { es: "Visión Cero incidentes viales", en: "Vision Zero road safety" }, desc: { es: "Marco estratégico que fija como meta eliminar las muertes y lesiones graves en el sistema de transporte.", en: "Strategic framework with the goal of eliminating deaths and serious injuries from the transport system." }, tipos: [MF.tipos.legal, MF.tipos.com], horizonte: MF.hor.ml, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["seguridad"] },
      { code: "D7", name: { es: "Planes de Movilidad de grandes generadores", en: "Travel plans for major trip generators" }, desc: { es: "Planes de movilidad para empresas, hospitales, universidades y otros grandes generadores de viajes.", en: "Mobility plans for companies, hospitals, universities and other major trip generators." }, tipos: [MF.tipos.legal, MF.tipos.serv], horizonte: MF.hor.cm, costo: MF.costo.b, ambito: MF.ambito.gci, ecm: MF.ecm.e, diagCats: ["planificacion"] },
    ]
  },
  {
    group: "E", label: { es: "Transporte de Carga", en: "Urban Freight" },
    color: "#7a4abf", bg: "#ede8fb", light: "#f8f5ff",
    measures: [
      { code: "E1", name: { es: "Acceso de vehículos de carga en áreas urbanas", en: "Freight vehicle access in urban areas" }, desc: { es: "Regulación de horarios, zonas y tipos de vehículos permitidos para carga y descarga en el área urbana.", en: "Regulation of times, zones and vehicle types permitted for loading and unloading in the urban area." }, tipos: [MF.tipos.legal], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.gci, ecm: MF.ecm.e, diagCats: ["normativa", "planificacion"] },
      { code: "E2", name: { es: "Redes de distribución de última milla", en: "Last-mile distribution networks" }, desc: { es: "Soluciones logísticas para la entrega de mercancías en los últimos kilómetros usando modos más sostenibles.", en: "Logistics solutions for goods delivery in the final kilometres using more sustainable modes." }, tipos: [MF.tipos.infra, MF.tipos.serv], horizonte: MF.hor.ml, costo: MF.costo.ma, ambito: MF.ambito.gci, ecm: MF.ecm.cm, diagCats: ["planificacion"] },
      { code: "E3", name: { es: "Reconversión de flota de carga", en: "Freight fleet decarbonisation" }, desc: { es: "Incorporación de vehículos de carga eléctricos, a gas o de bajas emisiones para la distribución urbana.", en: "Introduction of electric, gas or low-emission freight vehicles for urban distribution." }, tipos: [MF.tipos.legal, MF.tipos.infra], horizonte: MF.hor.ml, costo: MF.costo.a, ambito: MF.ambito.gci, ecm: MF.ecm.m, diagCats: ["normativa"] },
    ]
  },
  {
    group: "F", label: { es: "Datos y Tecnología", en: "Data & Technology" },
    color: "#0a9ea0", bg: "#d8f5f5", light: "#f0fbfb",
    measures: [
      { code: "F1", name: { es: "Uso de datos para la planificación de movilidad", en: "Data use for mobility planning" }, desc: { es: "Recopilación y análisis de datos de movilidad para fundamentar decisiones de planificación y gestión.", en: "Collection and analysis of mobility data to underpin planning and management decisions." }, tipos: [MF.tipos.serv, MF.tipos.infra], horizonte: MF.hor.c, costo: MF.costo.bm, ambito: MF.ambito.all, ecm: MF.ecm.m, diagCats: ["tecnologia", "planificacion"] },
      { code: "F2", name: { es: "Monitoreo y seguimiento de la movilidad", en: "Mobility monitoring & tracking" }, desc: { es: "Sistemas de monitoreo continuo del tráfico, la calidad del aire y el desempeño del transporte público.", en: "Continuous monitoring systems for traffic, air quality and public transport performance." }, tipos: [MF.tipos.infra, MF.tipos.serv], horizonte: MF.hor.cm, costo: MF.costo.m, ambito: MF.ambito.gci, ecm: MF.ecm.m, diagCats: ["tecnologia"] },
      { code: "F3", name: { es: "Gestión de la demanda", en: "Demand management" }, desc: { es: "Herramientas tecnológicas para gestionar y redistribuir la demanda de movilidad en el tiempo y el espacio.", en: "Technological tools to manage and redistribute mobility demand across time and space." }, tipos: [MF.tipos.serv, MF.tipos.legal], horizonte: MF.hor.cm, costo: MF.costo.m, ambito: MF.ambito.gci, ecm: MF.ecm.e, diagCats: ["tecnologia", "transporte"] },
    ]
  },
  {
    group: "G", label: { es: "Desarrollo Urbano", en: "Urban Development" },
    color: "#6a8a2a", bg: "#eef5dc", light: "#f8fbf0",
    measures: [
      { code: "G1", name: { es: "Desarrollo orientado a la accesibilidad", en: "Accessibility-oriented development" }, desc: { es: "Integración del uso del suelo y la movilidad para reducir la necesidad de desplazamientos motorizados.", en: "Integration of land use and mobility to reduce the need for motorised travel." }, tipos: [MF.tipos.legal], horizonte: MF.hor.ml, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.e, diagCats: ["planificacion"] },
      { code: "G2", name: { es: "Paseos lineales e infraestructura verde", en: "Linear greenways & green infrastructure" }, desc: { es: "Corredores verdes que combinen movilidad activa, biodiversidad y espacio público de calidad.", en: "Green corridors combining active mobility, biodiversity and quality public space." }, tipos: [MF.tipos.infra], horizonte: MF.hor.ml, costo: MF.costo.ma, ambito: MF.ambito.all, ecm: MF.ecm.c, diagCats: ["movilidad_activa"] },
      { code: "G3", name: { es: "Ampliación y recalificación de espacios públicos", en: "Expansion of public spaces" }, desc: { es: "Intervenciones que recuperan el espacio público para peatones, ciclistas y la vida comunitaria.", en: "Interventions that reclaim public space for pedestrians, cyclists and community life." }, tipos: [MF.tipos.infra], horizonte: MF.hor.cm, costo: MF.costo.m, ambito: MF.ambito.all, ecm: MF.ecm.c, diagCats: ["movilidad_activa", "planificacion"] },
      { code: "G4", name: { es: "Intervenciones de urbanismo táctico", en: "Tactical urbanism interventions" }, desc: { es: "Intervenciones temporales de bajo costo para testear cambios en el espacio público antes de hacerlos permanentes.", en: "Low-cost temporary interventions to test public space changes before making them permanent." }, tipos: [MF.tipos.infra, MF.tipos.com], horizonte: MF.hor.c, costo: MF.costo.b, ambito: MF.ambito.all, ecm: MF.ecm.cm, diagCats: ["planificacion", "movilidad_activa"] },
    ]
  },
];

// Map diag category IDs to which measure groups are most relevant
const CAT_TO_MEASURES = {
  normativa:       ["B3","B4","C4","D3","E1","E3"],
  planificacion:   ["B4","D1","D2","D3","D7","E1","E2","F1","G1","G3","G4"],
  movilidad_activa:["A1","A2","A3","A4","A6","B1","B2","B3","G2","G3","G4"],
  transporte:      ["C1","C2","C3","C4","C5","C6","F3"],
  tecnologia:      ["A5","C5","F1","F2","F3"],
  seguridad:       ["A4","A6","D4","D5","D6"],
};

const CATEGORIES = {
  es: [
    {
      id: "normativa",
      label: "Normativa",
      icon: "",
      maxScore: 21,
      questions: [
        { id: "n1", text: "¿Está adherido a la Ley Provincial de Tránsito?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "n2", text: "¿Se cuenta con normativa que regule el transporte público de pasajeros?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "n3", text: "¿Se cuenta con procesos de otorgamiento de licencias para las líneas de buses urbanos?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "n4", text: "¿Cuenta con una regulación específica para taxis/remises?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "n5", text: "¿Se regulan los nuevos vehículos de transporte (monopatín, monopatín eléctrico, etc.)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "n6", text: "¿Se cuenta con normativa que regule el transporte de cargas o logística urbana?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "n7", text: "¿Se cuenta con normativa que regule un sistema de transporte público en bicicletas?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
      ],
    },
    {
      id: "planificacion",
      label: "Planificación",
      icon: "",
      maxScore: 30,
      questions: [
        { id: "p1", text: "¿Existe un plan maestro de movilidad?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p2", text: "¿El código de ordenamiento urbano tiene un apartado específico de movilidad?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p3", text: "¿Existe una jerarquización vial definida?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p4", text: "¿Existe un área específica que se ocupe de la movilidad urbana? (Ej: Dirección de Transporte)", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p5", text: "¿Hay instancias participativas con vecinos respecto de la planificación urbana?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p6", text: "¿Se registra o recolecta información acerca de la movilidad del área urbana o regional?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p7", text: "¿Se han realizado encuestas de movilidad domiciliaria, conteos o caracterización de la movilidad sistematizada?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p8", text: "¿Existe un área que tenga información digitalizada (uso de suelo, ejes viales, recorridos de transporte, etc.)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p9", text: "¿Se planifican o se han planificado Centros de trasbordo o Terminales de ómnibus?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "p10", text: "¿Existe un plan maestro de transporte de cargas con red definida?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
      ],
    },
    {
      id: "movilidad_activa",
      label: "Movilidad Activa",
      icon: "",
      maxScore: 24,
      questions: [
        { id: "ma1", text: "¿Se ejecutan programas o eventos para incentivar desplazamientos a pie, en bicicleta o en transporte público, desalentando el vehículo particular?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "ma2", text: "¿Existen calles de prioridad peatonal?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "ma3", text: "¿Qué porcentaje de veredas y caminos peatonales tiene rampas?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "Más del 75%", score: 3 }] },
        { id: "ma4", text: "¿Se cuenta con equipamiento de mobiliario urbano en la vía pública que fomente la apropiación a escala humana (espacios de estar)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "ma5", text: "¿Se han realizado adaptaciones para la movilidad de personas con movilidad reducida (rampas, semáforos para invidentes, etc.)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "ma6", text: "¿De alguna forma se fomenta la movilidad en bicicleta a través de infraestructura segura (red de vías ciclistas)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "ma7", text: "¿Se cuenta con infraestructura y equipamiento para estacionamiento de bicicletas en lugares públicos?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "ma8", text: "¿Existe un sistema de bicicletas públicas compartidas?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
      ],
    },
    {
      id: "transporte",
      label: "Transporte Público",
      icon: "",
      maxScore: 30,
      questions: [
        { id: "tp1", text: "¿Existe una red de Transporte Público Masivo de Pasajeros?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tp2", text: "Considerando 500 metros a las paradas, ¿qué porcentaje de la población está cubierta por el transporte público?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "Más del 75%", score: 3 }] },
        { id: "tp3", text: "¿Existe un medio de pago único (boleto o tarjeta) que se pueda utilizar en el transporte público?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tp4", text: "¿Qué porcentaje de las paradas de transporte pueden considerarse refugios con asiento y protección de techos?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "Más del 75%", score: 3 }] },
        { id: "tp5", text: "¿Existen carriles exclusivos para transporte público?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tp6", text: "¿Qué porcentaje de la red de infraestructura del transporte público está adaptado a personas con movilidad reducida?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "Más del 75%", score: 3 }] },
        { id: "tp7", text: "¿La extensión de la malla vial es suficiente para el servicio de transporte público del municipio?", options: [{ label: "No", score: 0 }, { label: "Sí, pero insuficiente", score: 2 }, { label: "Sí", score: 3 }] },
        { id: "tp8", text: "¿Los núcleos urbanos próximos están conectados con la ciudad cabecera a través del transporte público?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tp9", text: "¿El municipio cuenta con un plan de descarbonización del transporte?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tp10", text: "¿Hay vehículos de alquiler (taxis, remises, o de aplicaciones como Uber/Didi)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
      ],
    },
    {
      id: "tecnologia",
      label: "Tecnología",
      icon: "",
      maxScore: 15,
      questions: [
        { id: "tec1", text: "¿Existe un centro de monitoreo y control de tránsito y transporte?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tec2", text: "¿Se cuenta con un sistema de monitoreo/georeferenciación en tiempo real de las unidades de transporte público?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tec3", text: "¿Se cuenta con aplicaciones digitales de información sobre el transporte público para uso de la ciudadanía?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tec4", text: "¿Existe información en tiempo real del estado del tránsito/transporte en la vía pública (cartelería)?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "tec5", text: "¿Existe una política de datos abiertos y se publican datos de movilidad?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
      ],
    },
    {
      id: "seguridad",
      label: "Seguridad Vial",
      icon: "",
      maxScore: 36,
      questions: [
        { id: "sv1", text: "¿Se cuenta con un Observatorio/oficina de Seguridad Vial?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv2", text: "¿Se lleva un registro de siniestros viales?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv3", text: "¿El registro de siniestros identifica sectores recurrentes o puntos negros?", options: [{ label: "No", score: 0 }, { label: "Sólo algunos", score: 2 }, { label: "Sí", score: 3 }] },
        { id: "sv4", text: "¿Se lleva un registro de la cantidad de fallecidos en siniestros viales?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv5", text: "¿Se cuenta con protocolo de actuación ante siniestros viales?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv6", text: "¿Se exige aprobación de curso teórico y práctico para el otorgamiento de licencias de conducir de motos?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv7", text: "¿Se exige aprobación de curso teórico y práctico para el otorgamiento de licencias de conducir de autos?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv8", text: "¿Se realizan capacitaciones para choferes de transporte público?", options: [{ label: "No", score: 0 }, { label: "Algunas veces, no regularizado", score: 2 }, { label: "Sí", score: 3 }] },
        { id: "sv9", text: "¿Se realizan controles periódicos de seguros en vigencia de las unidades de transporte público?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
        { id: "sv10", text: "¿Se realiza control de uso de casco?", options: [{ label: "No", score: 0 }, { label: "Sí, pero insuficiente", score: 2 }, { label: "Sí", score: 3 }] },
        { id: "sv11", text: "¿Se realiza control de alcoholemia?", options: [{ label: "No", score: 0 }, { label: "Sí, pero insuficiente", score: 2 }, { label: "Sí", score: 3 }] },
        { id: "sv12", text: "¿Se utilizan elementos de monitoreo, patentes y fiscalizadores de velocidad?", options: [{ label: "No", score: 0 }, { label: "Sí", score: 3 }] },
      ],
    },
  ],
  en: [
    {
      id: "normativa",
      label: "Regulations",
      icon: "",
      maxScore: 21,
      questions: [
        { id: "n1", text: "Is the city compliant with the Provincial Traffic Law?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "n2", text: "Is there a regulation governing public passenger transport?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "n3", text: "Are there licensing processes for urban bus lines?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "n4", text: "Is there a specific regulation for taxis/private hire vehicles?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "n5", text: "Are new transport vehicles regulated (e-scooters, scooters, etc.)?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "n6", text: "Is there a regulation governing urban freight or logistics transport?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "n7", text: "Is there a regulation governing a public bicycle sharing system?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
      ],
    },
    {
      id: "planificacion",
      label: "Planning",
      icon: "",
      maxScore: 30,
      questions: [
        { id: "p1", text: "Is there a mobility master plan?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p2", text: "Does the urban planning code have a specific mobility section?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p3", text: "Is there a defined road hierarchy?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p4", text: "Is there a specific department dedicated to urban mobility? (e.g. Transport Directorate)", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p5", text: "Are there participatory processes with residents regarding urban planning?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p6", text: "Is mobility data being recorded or collected for the urban or regional area?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p7", text: "Have household mobility surveys, traffic counts, or mobility characterizations been conducted and systematized?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p8", text: "Is there a department with digitized information (land use, road axes, transport routes, etc.)?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p9", text: "Have transfer hubs or bus terminals been planned or are being planned?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "p10", text: "Is there a freight transport master plan with a defined network?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
      ],
    },
    {
      id: "movilidad_activa",
      label: "Active Mobility",
      icon: "",
      maxScore: 24,
      questions: [
        { id: "ma1", text: "Are programs or events run to encourage walking, cycling, or public transport use, discouraging private vehicle use?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "ma2", text: "Are there pedestrian priority streets?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "ma3", text: "What percentage of sidewalks and pedestrian paths have ramps?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "More than 75%", score: 3 }] },
        { id: "ma4", text: "Is there urban street furniture that encourages human-scale use of public space (seating areas, etc.)?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "ma5", text: "Have adaptations been made for people with reduced mobility (ramps, audible traffic lights, braille, etc.)?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "ma6", text: "Is cycling promoted through safe dedicated infrastructure (a cycle lane network)?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "ma7", text: "Is there infrastructure and equipment for bicycle parking in public spaces?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "ma8", text: "Is there a public shared bicycle system?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
      ],
    },
    {
      id: "transporte",
      label: "Public Transport",
      icon: "",
      maxScore: 30,
      questions: [
        { id: "tp1", text: "Is there a Mass Public Passenger Transport network?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tp2", text: "Considering 500m from stops, what percentage of the population is covered by public transport?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "More than 75%", score: 3 }] },
        { id: "tp3", text: "Is there a single payment method (ticket or card) that can be used across public transport?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tp4", text: "What percentage of transport stops can be considered shelters with seating and roof/side protection?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "More than 75%", score: 3 }] },
        { id: "tp5", text: "Are there dedicated lanes for public transport?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tp6", text: "What percentage of public transport infrastructure is adapted for people with reduced mobility?", options: [{ label: "0–25%", score: 0 }, { label: "25–50%", score: 1 }, { label: "50–75%", score: 2 }, { label: "More than 75%", score: 3 }] },
        { id: "tp7", text: "Is the road network sufficient for the municipality's public transport service?", options: [{ label: "No", score: 0 }, { label: "Yes, but insufficient", score: 2 }, { label: "Yes", score: 3 }] },
        { id: "tp8", text: "Are nearby urban centers connected to the main city through public transport?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tp9", text: "Does the municipality have a transport decarbonisation plan?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tp10", text: "Are there rental vehicles available (taxis, private hire, or ride-hailing apps like Uber)?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
      ],
    },
    {
      id: "tecnologia",
      label: "Technology",
      icon: "",
      maxScore: 15,
      questions: [
        { id: "tec1", text: "Is there a traffic and transport monitoring and control centre?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tec2", text: "Is there a real-time GPS tracking system for public transport vehicles?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tec3", text: "Are there digital apps providing public transport information for citizens?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tec4", text: "Is there real-time traffic/transport information on public signage?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "tec5", text: "Is there an open data policy and are mobility datasets published publicly?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
      ],
    },
    {
      id: "seguridad",
      label: "Road Safety",
      icon: "",
      maxScore: 36,
      questions: [
        { id: "sv1", text: "Is there a Road Safety Observatory or office?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv2", text: "Is a record of road incidents maintained?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv3", text: "Does the incident registry identify recurring locations or black spots?", options: [{ label: "No", score: 0 }, { label: "Only some", score: 2 }, { label: "Yes", score: 3 }] },
        { id: "sv4", text: "Is a record of road fatalities maintained?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv5", text: "Is there an action protocol for road incidents?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv6", text: "Is theoretical and practical course approval required for motorcycle licences?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv7", text: "Is theoretical and practical course approval required for car driving licences?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv8", text: "Are public transport drivers given regular training?", options: [{ label: "No", score: 0 }, { label: "Sometimes, not regularised", score: 2 }, { label: "Yes", score: 3 }] },
        { id: "sv9", text: "Are periodic checks of insurance validity carried out for public transport vehicles?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
        { id: "sv10", text: "Are helmet use controls enforced?", options: [{ label: "No", score: 0 }, { label: "Yes, but insufficient", score: 2 }, { label: "Yes", score: 3 }] },
        { id: "sv11", text: "Are breathalyser (alcohol) controls enforced?", options: [{ label: "No", score: 0 }, { label: "Yes, but insufficient", score: 2 }, { label: "Yes", score: 3 }] },
        { id: "sv12", text: "Are speed monitoring devices and licence plate readers used?", options: [{ label: "No", score: 0 }, { label: "Yes", score: 3 }] },
      ],
    },
  ],
};

const UI = {
  es: {
    headerSub: "Diagnóstico de Movilidad Urbana",
    banner: "Herramienta de evaluación — Versión prototipo",
    source: "Basado en el Anexo Capítulo 2 — Guía PMUS Argentina (Sustentar / Ministerio de Transporte)",
    introTitle: "Evaluación de Movilidad Sostenible Municipal",
    introDesc: "Esta herramienta permite diagnosticar el estado de la movilidad urbana en ciudades argentinas, generando un puntaje de riesgo por dimensión basado en la metodología de la Guía PMUS.",
    cityLabel: "Ciudad a evaluar",
    cityPlaceholder: "— Seleccionar ciudad —",
    startBtn: "Iniciar diagnóstico →",
    hint: (q, c) => `${q} preguntas · ${c} dimensiones · ~10 min`,
    progressLabel: (a, t) => `${a} / ${t} respondidas`,
    prevBtn: "← Anterior",
    nextBtn: "Siguiente →",
    resultsBtn: "Revisar respuestas →",
    resultsTitle: "Diagnóstico completado",
    resultsSub: "Resultados por dimensión — Guía PMUS Argentina",
    totalLabel: "Puntaje global",
    methodNote: "Metodología basada en el Anexo Capítulo 2 de la Guía para la Planificación de la Movilidad Urbana Sostenible en Argentina (Sustentar / Ministerio de Transporte, 2023). Puntaje: No=0pts · Parcial=2pts · Sí=3pts · Porcentaje: 0–25%=0 · 25–50%=1 · 50–75%=2 · +75%=3",
    recTitle: "Recomendaciones por resultado",
    rec: [
      { range: "0–25%", action: "Se recomienda revisar qué conjunto de medidas de corto plazo pueden mejorar este indicador de manera perentoria o inmediata." },
      { range: "25–50%", action: "Se recomienda implementar un plan de corto plazo con medidas o acciones que mejoren rápidamente este indicador." },
      { range: "50–75%", action: "Desarrollar un plan de corto/mediano plazo con aquellas acciones necesarias para mejorar este indicador." },
      { range: "75–100%", action: "Desarrollar un plan de mediano/largo plazo con acciones que potencien la movilidad sostenible en su conjunto." },
    ],
    editBtn: "← Editar respuestas",
    newBtn: "Nuevo diagnóstico",
    riskLow: "Bajo", riskMod: "Moderado", riskHigh: "Alto", riskCrit: "Crítico",
    riskPrefix: "Riesgo ",
    pts: "pts",
  },
  en: {
    headerSub: "Urban Mobility Diagnostic",
    banner: "Assessment tool — Prototype version",
    source: "Based on Annex Chapter 2 — SUMP Guide Argentina (Sustentar / Ministry of Transport)",
    introTitle: "Municipal Sustainable Mobility Assessment",
    introDesc: "This tool diagnoses the state of urban mobility in Argentine cities, generating a risk score per dimension based on the SUMP Guide methodology.",
    cityLabel: "City to assess",
    cityPlaceholder: "— Select a city —",
    startBtn: "Start diagnostic →",
    hint: (q, c) => `${q} questions · ${c} dimensions · ~10 min`,
    progressLabel: (a, t) => `${a} / ${t} answered`,
    prevBtn: "← Previous",
    nextBtn: "Next →",
    resultsBtn: "Review answers →",
    resultsTitle: "Diagnostic complete",
    resultsSub: "Results by dimension — SUMP Guide Argentina",
    totalLabel: "Overall score",
    methodNote: "Methodology based on Annex Chapter 2 of the Sustainable Urban Mobility Planning Guide for Argentina (Sustentar / Ministry of Transport, 2023). Scoring: No=0pts · Partial=2pts · Yes=3pts · Percentage: 0–25%=0 · 25–50%=1 · 50–75%=2 · >75%=3",
    recTitle: "Recommendations by result",
    rec: [
      { range: "0–25%", action: "Review which short-term measures can urgently improve this indicator." },
      { range: "25–50%", action: "Implement a short-term plan with actions that quickly improve this indicator." },
      { range: "50–75%", action: "Develop a short/medium-term plan with the actions needed to improve this indicator." },
      { range: "75–100%", action: "Develop a medium/long-term plan with actions that enhance sustainable mobility as a whole." },
    ],
    editBtn: "← Edit answers",
    newBtn: "New diagnostic",
    riskLow: "Low", riskMod: "Moderate", riskHigh: "High", riskCrit: "Critical",
    riskPrefix: "Risk: ",
    pts: "pts",
  },
};

function getRiskLevel(pct, lang) {
  const t = UI[lang];
  if (pct >= 75) return { label: t.riskLow, color: "#1a7a4a", bg: "#dcf5e7", dot: "#22c55e" };
  if (pct >= 50) return { label: t.riskMod, color: "#8a6200", bg: "#fef3c7", dot: "#f59e0b" };
  if (pct >= 25) return { label: t.riskHigh, color: "#9a3a00", bg: "#ffedd5", dot: "#f97316" };
  return { label: t.riskCrit, color: "#9a1a1a", bg: "#fee2e2", dot: "#ef4444" };
}

function RadialScore({ pct, color, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={BORDER} strokeWidth="7" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+5} textAnchor="middle" fontSize="13" fontWeight="700" fill={color} fontFamily="sans-serif">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <div style={s.langToggle}>
      <button style={{ ...s.langBtn, ...(lang === "es" ? s.langBtnActive : {}) }} onClick={() => setLang("es")}>ES</button>
      <button style={{ ...s.langBtn, ...(lang === "en" ? s.langBtnActive : {}) }} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}

function Header({ lang, setLang, onHelp }) {
  return (
    <div style={s.header}>
      <img src={LOGO_URL} alt="Sustentar" style={s.logoImg} />
      <div style={s.headerDiv} />
      <span style={s.headerSub}>{UI[lang].headerSub}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {onHelp && (
          <button style={s.helpBtn} onClick={onHelp} title={lang === "es" ? "Cómo usar" : "How to use"}>?</button>
        )}
        <LangToggle lang={lang} setLang={setLang} />
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("es");
  const [step, setStep] = useState("intro");
  const [catIdx, setCatIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [cityName, setCityName] = useState("");
  const [selectedTile, setSelectedTile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [osmLoading, setOsmLoading] = useState(false);
  const [osmResult, setOsmResult] = useState(null);

  // API data state
  const [apiCities, setApiCities] = useState(null);
  const [apiQuestions, setApiQuestions] = useState(null);
  const [apiMeasures, setApiMeasures] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Fetch all data on mount and when lang changes
  useEffect(() => {
    async function fetchAll() {
      setApiLoading(true);
      setApiError(false);
      try {
        const [citiesRes, questionsRes, measuresRes] = await Promise.all([
          fetch(`${API_URL}/api/cities`),
          fetch(`${API_URL}/api/questions?lang=${lang}`),
          fetch(`${API_URL}/api/measures?lang=${lang}`),
        ]);
        const [cities, questions, measures] = await Promise.all([
          citiesRes.json(), questionsRes.json(), measuresRes.json()
        ]);
        setApiCities(cities);
        setApiQuestions(questions);
        setApiMeasures(measures);
      } catch (e) {
        console.warn("API unavailable, falling back to local data");
        setApiError(true);
      }
      setApiLoading(false);
    }
    fetchAll();
  }, [lang]);

  // Use API data if available, otherwise fall back to hardcoded
  const CITIES_DATA = apiCities || CITY_GROUPS;
  const CATEGORIES_DATA = apiQuestions || CATEGORIES[lang];
  const MEASURES_DATA = apiMeasures || MEASURE_GROUPS;

  async function fetchOSMData() {
    if (!cityName) return;
    setOsmLoading(true);
    setOsmResult(null);

    const base = cityName.split(",")[0].trim();

    // Simulate brief loading pause
    await new Promise(r => setTimeout(r, 1200));

    let osmData = null;

    // Try API first
    try {
      const res = await fetch(`${API_URL}/api/osm/${encodeURIComponent(base)}`);
      if (res.ok) {
        const d = await res.json();
        osmData = {
          cycleways: d.cycleways,
          bikeParking: d.bike_parking,
          bikeShare: d.bike_share,
          pedestrian: d.pedestrian,
          busStops: d.bus_stops
        };
      }
    } catch (e) {
      console.warn("API OSM fetch failed, using local demo data");
    }

    // Fallback to hardcoded demo data
    if (!osmData) {
      const DEMO_DATA = {
        "Buenos Aires": { cycleways: 312, bikeParking: 847, bikeShare: 201, pedestrian: 143, busStops: 4821 },
        "Rosario":      { cycleways: 89,  bikeParking: 134, bikeShare: 42,  pedestrian: 38,  busStops: 1203 },
        "Córdoba":      { cycleways: 54,  bikeParking: 98,  bikeShare: 18,  pedestrian: 29,  busStops: 986  },
        "Mendoza":      { cycleways: 31,  bikeParking: 61,  bikeShare: 0,   pedestrian: 17,  busStops: 542  },
        "Bogotá":       { cycleways: 421, bikeParking: 312, bikeShare: 74,  pedestrian: 287, busStops: 6102 },
        "Lima":         { cycleways: 48,  bikeParking: 67,  bikeShare: 8,   pedestrian: 54,  busStops: 3847 },
        "Santiago":     { cycleways: 198, bikeParking: 423, bikeShare: 87,  pedestrian: 96,  busStops: 2934 },
        "Montevideo":   { cycleways: 77,  bikeParking: 189, bikeShare: 31,  pedestrian: 44,  busStops: 1121 },
      };
      osmData = DEMO_DATA[base] || null;
    }

    if (!osmData) {
      // For cities without demo data, show a friendly message
      setOsmResult({ error: true, errorMsg: lang === "es"
        ? `Datos no disponibles para ${base}. En la versión final se conectará con OpenStreetMap en tiempo real.`
        : `Data not available for ${base}. The final version will connect to OpenStreetMap in real time.`
      });
      setOsmLoading(false);
      return;
    }

    const { cycleways, bikeParking, bikeShare, pedestrian, busStops } = osmData;

    const score = (val, thresholds) => {
      for (const [min, pts] of thresholds) { if (val >= min) return pts; }
      return 0;
    };

    const fields = [
      { id: "ma6", label: lang === "es" ? "Red de vías ciclistas"       : "Cycling infrastructure", value: cycleways,   unit: lang === "es" ? "segmentos" : "segments", score: score(cycleways,   [[50,3],[10,2],[1,2],[0,0]]) },
      { id: "ma7", label: lang === "es" ? "Estacionamiento bicicletas"  : "Bicycle parking",         value: bikeParking, unit: lang === "es" ? "puntos"    : "nodes",    score: score(bikeParking, [[20,3],[5,3],[1,2],[0,0]]) },
      { id: "ma8", label: lang === "es" ? "Bicicletas públicas"          : "Bike-share stations",    value: bikeShare,   unit: lang === "es" ? "estaciones" : "stations", score: score(bikeShare,   [[3,3],[1,3],[0,0]]) },
      { id: "ma2", label: lang === "es" ? "Calles peatonales"           : "Pedestrian streets",      value: pedestrian,  unit: lang === "es" ? "tramos"    : "ways",     score: score(pedestrian,  [[20,3],[5,3],[1,2],[0,0]]) },
      { id: "tp1", label: lang === "es" ? "Red de transporte público"   : "Public transport network", value: busStops,    unit: lang === "es" ? "paradas"   : "stops",    score: score(busStops,    [[20,3],[5,3],[1,2],[0,0]]) },
    ];

    const newAnswers = {};
    fields.forEach(f => { newAnswers[f.id] = f.score; });

    // Fill remaining questions with reasonable demo values so results page is complete
    const demoRemainder = {
      n1:3, n2:3, n3:0, n4:3, n5:0, n6:0, n7:0,
      p1:0, p2:0, p3:3, p4:3, p5:0, p6:3, p7:0, p8:0, p9:0, p10:0,
      ma1:0, ma3:1, ma4:3, ma5:0,
      tp2:2, tp3:3, tp4:1, tp5:0, tp6:0, tp7:2, tp8:3, tp9:0, tp10:3,
      tec1:0, tec2:0, tec3:3, tec4:0, tec5:0,
      sv1:0, sv2:3, sv3:2, sv4:3, sv5:0, sv6:3, sv7:3, sv8:2, sv9:0, sv10:2, sv11:2, sv12:0,
    };

    setAnswers({ ...demoRemainder, ...newAnswers });
    setOsmResult({ filledCount: fields.length, fields, city: base, isDemo: true });
    setOsmLoading(false);
    setStep("results");
  }

  const t = UI[lang];
  const cats = CATEGORIES_DATA;
  const totalQ = cats.flatMap((c) => c.questions).length;
  const answered = Object.keys(answers).length;
  const currentCat = cats[catIdx];
  const catDone = currentCat?.questions.every((q) => answers[q.id] !== undefined);

  function answer(qId, score) { setAnswers((p) => ({ ...p, [qId]: score })); }

  function catPct(cat) {
    const raw = cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return Math.round((raw / cat.maxScore) * 100);
  }

  function catRaw(cat) {
    return cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  }

  function totalPct() {
    const totalMax = cats.reduce((sum, c) => sum + c.maxScore, 0);
    const raw = Object.values(answers).reduce((a, b) => a + b, 0);
    return Math.round((raw / totalMax) * 100);
  }

  function reset() { setStep("intro"); setAnswers({}); setCatIdx(0); setCityName(""); setSelectedTile(null); }

  function getSuggestedMeasures() {
    const lowCats = cats.filter((cat) => {
      const raw = cat.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
      return Math.round((raw / cat.maxScore) * 100) < 50;
    }).map(c => c.id);
    const codes = new Set();
    lowCats.forEach(cid => (CAT_TO_MEASURES[cid] || []).forEach(c => codes.add(c)));
    // 2 from first matching group, then 1 each from the rest
    const result = [];
    let isFirst = true;
    for (const grp of MEASURES_DATA) {
      const matches = grp.measures.filter(m => codes.has(m.code));
      if (matches.length === 0) continue;
      result.push(...matches.slice(0, isFirst ? 2 : 1));
      isFirst = false;
      if (result.length >= 6) break;
    }
    return result.slice(0, 6);
  }

  function skipToResults() {
    // Realistic demo: varied scores simulating a mid-size Argentine city
    const presets = {
      n1:3, n2:3, n3:0, n4:3, n5:0, n6:0, n7:0,         // Normativa: partial
      p1:0, p2:0, p3:3, p4:3, p5:0, p6:3, p7:0, p8:0, p9:0, p10:0,  // Planificación: fragmented
      ma1:0, ma2:0, ma3:1, ma4:3, ma5:0, ma6:0, ma7:3, ma8:0,        // Movilidad activa: low
      tp1:3, tp2:2, tp3:3, tp4:1, tp5:0, tp6:0, tp7:2, tp8:3, tp9:0, tp10:3, // Transporte: moderate
      tec1:0, tec2:0, tec3:3, tec4:0, tec5:0,            // Tecnología: low
      sv1:0, sv2:3, sv3:2, sv4:3, sv5:0, sv6:3, sv7:3, sv8:2, sv9:0, sv10:2, sv11:2, sv12:0, // Seg. vial: mixed
    };
    setAnswers(presets);
    setStep("results");
  }

  const ONBOARDING = {
    es: {
      title: "Guía de uso",
      sub: "Esta herramienta digitaliza el autodiagnóstico de la Guía PMUS Argentina. Antes de empezar, aquí te explicamos cómo está estructurada.",
      sections: [
        { label: "Diagnóstico por dimensión", desc: "El cuestionario evalúa 6 dimensiones institucionales de la movilidad: Normativa, Planificación, Movilidad Activa, Transporte Público, Tecnología y Seguridad Vial. Cada respuesta suma puntos según la escala de la Guía." },
        { label: "Sistema de puntaje", desc: "Sí = 3 pts · Parcial = 2 pts · No = 0 pts · Porcentaje: 0–25% = 0, 25–50% = 1, 50–75% = 2, +75% = 3. El puntaje final por dimensión indica el nivel de riesgo: Bajo (≥75%), Moderado (50–75%), Alto (25–50%), Crítico (<25%)." },
        { label: "Catálogo de medidas (A–G)", desc: "El panel derecho muestra las 33 medidas de la Guía PMUS organizadas en 7 grupos temáticos (A: Movilidad de pie, B: Bicicletas, C: Transporte Público, D: Gestión Vial, E: Carga, F: Tecnología, G: Desarrollo Urbano). Haz clic en cualquier código para ver su descripción." },
        { label: "Recomendaciones post-diagnóstico", desc: "Al finalizar el cuestionario, el sistema identificará automáticamente las dimensiones con puntaje inferior al 50% y sugerirá las medidas PMUS más relevantes para mejorar esos indicadores." },
      ],
      cardTitle: "Estructura de cada medida",
      cardItems: [
        { label: "Identificador", desc: "Código único (ej. A1, B3, C2)" },
        { label: "Tipos de intervención", desc: "Infraestructura · Legales y/o Regulatorios · Servicios · Comunicación" },
        { label: "Horizonte de implementación", desc: "Corto / Mediano / Largo plazo" },
        { label: "Costo económico", desc: "Bajo / Medio / Alto" },
        { label: "Ámbito de aplicación", desc: "RMBA · Grandes Aglomerados · Ciudades intermedias · Localidades pequeñas" },
        { label: "Enfoque ECM", desc: "Evitar viajes motorizados · Cambiar a modos sostenibles · Mejorar eficiencia" },
      ],
      btn: "Entendido, comenzar →",
    },
    en: {
      title: "How to use this tool",
      sub: "This tool digitises the self-assessment from the Argentina SUMP Guide. Here is how it is structured before you begin.",
      sections: [
        { label: "Assessment by dimension", desc: "The questionnaire evaluates 6 institutional mobility dimensions: Regulations, Planning, Active Mobility, Public Transport, Technology and Road Safety. Each answer adds points on the Guide's scoring scale." },
        { label: "Scoring system", desc: "Yes = 3 pts · Partial = 2 pts · No = 0 pts · Percentage: 0–25% = 0, 25–50% = 1, 50–75% = 2, >75% = 3. The final score per dimension indicates risk level: Low (≥75%), Moderate (50–75%), High (25–50%), Critical (<25%)." },
        { label: "Measures catalogue (A–G)", desc: "The right panel shows the 33 SUMP Guide measures in 7 thematic groups (A: Walking, B: Cycling, C: Public Transport, D: Road Management, E: Freight, F: Technology, G: Urban Development). Click any code to see its description." },
        { label: "Post-assessment recommendations", desc: "After completing the questionnaire, the system will identify dimensions scoring below 50% and automatically suggest the most relevant SUMP measures to address those gaps." },
      ],
      cardTitle: "Structure of each measure card",
      cardItems: [
        { label: "Identifier", desc: "Unique code (e.g. A1, B3, C2)" },
        { label: "Intervention types", desc: "Infrastructure · Legal / Regulatory · Services · Communication" },
        { label: "Implementation timeline", desc: "Short / Medium / Long term" },
        { label: "Economic cost", desc: "Low / Medium / High" },
        { label: "Area of application", desc: "Metro Area · Large Agglomerations · Mid-size cities · Small towns" },
        { label: "ECM framework", desc: "Avoid motorised trips · Shift to sustainable modes · Improve efficiency" },
      ],
      btn: "Got it, start →",
    },
  };

  if (step === "intro") return (
    <div style={s.page}>
      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <div style={s.onboardOverlay}>
          <div style={s.onboardBox}>
            <div style={s.onboardHeader}>
              <img src={LOGO_URL} alt="Sustentar" style={{ height: 26, objectFit: "contain" }} />
              <div style={s.onboardHeaderDiv} />
              <span style={s.onboardHeaderSub}>{ONBOARDING[lang].title}</span>
              <div style={{ marginLeft: "auto" }}><LangToggle lang={lang} setLang={setLang} /></div>
            </div>
            <p style={s.onboardSub}>{ONBOARDING[lang].sub}</p>

            <div style={s.onboardGrid}>
              {/* LEFT: how it works */}
              <div>
                <div style={s.onboardSectionTitle}>{lang === "es" ? "Cómo funciona" : "How it works"}</div>
                {ONBOARDING[lang].sections.map((sec, i) => (
                  <div key={i} style={s.onboardSection}>
                    <div style={s.onboardNumBadge}>{i + 1}</div>
                    <div>
                      <div style={s.onboardSecLabel}>{sec.label}</div>
                      <div style={s.onboardSecDesc}>{sec.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT: measure card anatomy */}
              <div>
                <div style={s.onboardSectionTitle}>{ONBOARDING[lang].cardTitle}</div>
                <div style={s.onboardCard}>
                  <div style={s.onboardCardCode}>A1</div>
                  <div style={s.onboardCardTitle}>{lang === "es" ? "Red peatonal y caminabilidad" : "Pedestrian network & walkability"}</div>
                  <div style={s.onboardCardDivider} />
                  {ONBOARDING[lang].cardItems.map((item, i) => (
                    <div key={i} style={s.onboardCardRow}>
                      <div style={s.onboardCardRowLabel}>{item.label}</div>
                      <div style={s.onboardCardRowDesc}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button style={s.onboardBtn} onClick={() => setShowOnboarding(false)}>
              {ONBOARDING[lang].btn}
            </button>
          </div>
        </div>
      )}

      <div style={s.introWrap}>
        <div style={s.card}>
          <Header lang={lang} setLang={setLang} onHelp={() => setShowOnboarding(true)} />
          <div style={s.banner}><span style={s.bannerDot} />{t.banner}</div>
          <h1 style={s.h1}>{t.introTitle}</h1>
          <p style={s.desc}>{t.introDesc}</p>
          <div style={{ ...s.sourceNote, marginBottom: 16 }}>{t.source}</div>
          <div style={s.chips}>
            {cats.map((c) => <span key={c.id} style={s.chip}>{c.label}</span>)}
          </div>
          <label style={{ ...s.label, marginTop: 14 }}>{t.cityLabel}</label>
          <select style={s.select} value={cityName} onChange={(e) => setCityName(e.target.value)}>
            <option value="">{t.cityPlaceholder}</option>
            {CITIES_DATA.map(g => (
              <optgroup key={g.country} label={g.country}>
                {g.cities.map(c => <option key={c} value={c}>{c}</option>)}
              </optgroup>
            ))}
          </select>
          <button style={{ ...s.btnPrimary, opacity: cityName.trim() ? 1 : 0.4, cursor: cityName.trim() ? "pointer" : "default" }}
            disabled={!cityName.trim()} onClick={() => setStep("quiz")}>
            {t.startBtn}
          </button>

          {/* OSM AUTO-FILL */}
          {cityName.trim() && (
            <div style={s.osmPanel}>
              <div style={s.osmPanelTop}>
                <div>
                  <div style={s.osmPanelTitle}>{lang === "es" ? "Pre-completar desde OpenStreetMap" : "Pre-fill from OpenStreetMap"}</div>
                  <div style={s.osmPanelSub}>{lang === "es" ? "Datos espaciales reales para 5 preguntas de movilidad activa y transporte" : "Real spatial data for 5 active mobility & transport questions"}</div>
                </div>
                <button
                  style={{ ...s.osmBtn, opacity: osmLoading ? 0.6 : 1, cursor: osmLoading ? "default" : "pointer" }}
                  disabled={osmLoading}
                  onClick={fetchOSMData}
                >
                  {osmLoading ? (lang === "es" ? "Consultando..." : "Querying...") : (lang === "es" ? "Analizar ciudad" : "Analyse city")}
                </button>
              </div>
              {osmResult && !osmResult.error && (
                <div style={s.osmResult}>
                  <div style={s.osmResultTitle}>{lang === "es" ? `${osmResult.filledCount} respuestas completadas automáticamente para ${osmResult.city}` : `${osmResult.filledCount} answers auto-filled for ${osmResult.city}`}</div>
                  <div style={s.osmResultGrid}>
                    {osmResult.fields.map(f => (
                      <div key={f.id} style={s.osmResultRow}>
                        <span style={s.osmResultLabel}>{f.label}</span>
                        <span style={s.osmResultVal}>{f.value} {f.unit}</span>
                        <span style={{ ...s.osmResultScore, background: f.score === 3 ? "#dcf5e7" : f.score === 2 ? "#fef3c7" : "#fee2e2", color: f.score === 3 ? "#1a7a4a" : f.score === 2 ? "#8a6200" : "#9a1a1a" }}>{f.score} pts</span>
                      </div>
                    ))}
                  </div>
                  <div style={s.osmAttrib}>
                    {osmResult.isDemo
                      ? (lang === "es" ? "Datos de demostración basados en OpenStreetMap · overpass-api.de" : "Demo data based on OpenStreetMap · overpass-api.de")
                      : "Fuente: OpenStreetMap contributors · overpass-api.de"
                    }
                  </div>
                </div>
              )}
              {osmResult?.error && (
                <div style={{ ...s.osmAttrib, color: "#c94040", marginTop: 8 }}>{osmResult.errorMsg || (lang === "es" ? "No se pudo obtener datos para esta ciudad. Continúe manualmente." : "Could not fetch data for this city. Continue manually.")}</div>
              )}
            </div>
          )}
          <p style={s.hint}>{t.hint(totalQ, cats.length)}</p>
        </div>

        <div style={s.tilesPanel}>
          <div style={s.tilesPanelTitle}>{lang === "es" ? "Medidas PMUS" : "PMUS Measures"}</div>
          <div style={s.tilesPanelSub}>{lang === "es" ? "Haz clic para más información" : "Click for more information"}</div>
          {MEASURES_DATA.map(g => (
            <div key={g.group} style={s.tileGroup}>
              <div style={{ ...s.tileGroupLabel, color: g.color }}>{g.group} · {g.label[lang]}</div>
              <div style={s.tileRow}>
                {g.measures.map(m => (
                  <button key={m.code}
                    style={{ ...s.tile, background: selectedTile?.code === m.code ? g.color : g.bg, borderColor: g.color + "88", color: selectedTile?.code === m.code ? "#fff" : g.color }}
                    onClick={() => setSelectedTile(selectedTile?.code === m.code ? null : { ...m, groupColor: g.color, groupBg: g.bg, groupLight: g.light })}>
                    {m.code}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {selectedTile && (
          <div style={s.tileModal} onClick={() => setSelectedTile(null)}>
            <div style={{ ...s.tileModalBox, borderTop: `4px solid ${selectedTile.groupColor}`, background: selectedTile.groupLight }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <span style={{ ...s.tileModalCode, color: selectedTile.groupColor }}>{selectedTile.code}</span>
                <button style={s.tileModalClose} onClick={() => setSelectedTile(null)}>✕</button>
              </div>
              <div style={s.tileModalName}>{selectedTile.name[lang]}</div>
              <p style={s.tileModalDesc}>{selectedTile.desc[lang]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (step === "review") {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, maxWidth: 760 }}>
          <Header lang={lang} setLang={setLang} onHelp={() => setShowOnboarding(true)} />
          <h2 style={s.h2}>{lang === "es" ? "Revisar respuestas" : "Review your answers"}</h2>
          <p style={{ ...s.desc2, marginBottom: 24 }}>{lang === "es" ? "Verificá tus respuestas antes de ver los resultados. Podés volver a cualquier sección para corregir." : "Check your answers before viewing results. You can go back to any section to make changes."}</p>

          {cats.map((cat, ci) => (
            <div key={cat.id} style={s.reviewCatBlock}>
              <div style={s.reviewCatHeader}>
                <span style={s.reviewCatLabel}>{cat.label}</span>
                <button style={s.reviewEditBtn} onClick={() => { setCatIdx(ci); setStep("quiz"); }}>
                  {lang === "es" ? "Editar" : "Edit"}
                </button>
              </div>
              {cat.questions.map((q, qi) => {
                const ans = answers[q.id];
                const opt = q.options.find(o => o.score === ans);
                const unanswered = ans === undefined;
                return (
                  <div key={q.id} style={{ ...s.reviewRow, background: unanswered ? "#fff5f5" : "#fafafa", borderColor: unanswered ? "#f5c0c0" : BORDER }}>
                    <span style={s.reviewQNum}>{qi + 1}.</span>
                    <span style={{ ...s.reviewQText, flex: 1 }}>{q.text}</span>
                    <span style={{ ...s.reviewAns, color: unanswered ? "#c94040" : TEAL, background: unanswered ? "#fee2e2" : TEAL_LIGHT }}>
                      {unanswered ? (lang === "es" ? "Sin respuesta" : "Unanswered") : opt?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button style={s.btnOutline} onClick={() => { setCatIdx(0); setStep("quiz"); }}>
              {lang === "es" ? "← Volver al cuestionario" : "← Back to questionnaire"}
            </button>
            <button style={s.btnPrimary} onClick={() => setStep("results")}>
              {lang === "es" ? "Confirmar y ver resultados →" : "Confirm & view results →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "results") {
    const total = totalPct();
    const risk = getRiskLevel(total, lang);
    return (
      <div style={s.page}>
        <div style={{ ...s.card, maxWidth: 900 }}>
          <Header lang={lang} setLang={setLang} onHelp={() => setShowOnboarding(true)} />
          <div style={s.resultsTop}>
            <div>
              <span style={s.cityPill}>{cityName}</span>
              <h2 style={s.h2}>{t.resultsTitle}</h2>
              <p style={s.desc2}>{t.resultsSub}</p>
              {osmResult?.isDemo && (
                <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fbfb", border: "1px solid #b2e4e4", borderRadius: 5, padding: "3px 10px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#0a9ea0", flexShrink: 0, display: "inline-block" }} />
                  <span style={{ color: "#0a6060", fontSize: 11 }}>{lang === "es" ? `${osmResult.filledCount} preguntas pre-completadas desde OpenStreetMap` : `${osmResult.filledCount} questions pre-filled from OpenStreetMap`}</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <RadialScore pct={total} color={risk.dot} size={90} />
              <div style={{ ...s.badge, background: risk.bg, color: risk.color }}>{t.riskPrefix}{risk.label}</div>
              <div style={s.totalLbl}>{t.totalLabel}</div>
            </div>
          </div>

          <div style={s.grid}>
            {cats.map((cat) => {
              const pct = catPct(cat);
              const raw = catRaw(cat);
              const r = getRiskLevel(pct, lang);
              return (
                <div key={cat.id} style={{ ...s.catCard, borderTop: `3px solid ${r.dot}` }}>
                  <div style={s.catHead}>
                    <div>
                      
                      <div style={s.catName}>{cat.label}</div>
                      <div style={s.catScore}>{raw} / {cat.maxScore} {t.pts}</div>
                      <span style={{ ...s.badgeSm, background: r.bg, color: r.color }}>{r.label}</span>
                    </div>
                    <RadialScore pct={pct} color={r.dot} size={68} />
                  </div>
                  <div style={s.sep} />
                  {cat.questions.map((q) => {
                    const a = q.options.find((o) => o.score === answers[q.id]);
                    return (
                      <div key={q.id} style={{ marginBottom: 8 }}>
                        <span style={s.aQ}>{q.text}</span>
                        <span style={s.aA}>{a?.label ?? "—"} <span style={{ color: MUTED, fontWeight: 400 }}>({answers[q.id] ?? 0} {t.pts})</span></span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div style={s.methodNote}><strong>{lang === "es" ? "Metodología:" : "Methodology:"}</strong> {t.methodNote.replace(/^[^:]+: /, "")}</div>

          <div style={{ ...s.methodNote, background: "#f0f9ff", borderColor: "#bae6fd", marginBottom: 20 }}>
            <strong>{t.recTitle}</strong>
            {t.rec.map((r) => (
              <div key={r.range} style={{ marginTop: 6 }}>
                <span style={{ fontWeight: 700, color: TEXT }}>{r.range}:</span> <span>{r.action}</span>
              </div>
            ))}
          </div>

          {/* SUGGESTED MEASURES */}
          {(() => {
            const suggested = getSuggestedMeasures().slice(0, 6);
            if (suggested.length === 0) return null;
            const fieldLabel = {
              tipos:    { es: "Tipo de intervención", en: "Intervention type" },
              horizonte:{ es: "Horizonte", en: "Timeline" },
              costo:    { es: "Costo económico", en: "Economic cost" },
              ambito:   { es: "Ámbito de aplicación", en: "Area of application" },
              ecm:      { es: "Enfoque ECM", en: "ECM framework" },
            };
            return (
              <div style={{ marginBottom: 20 }}>
                <div style={s.suggestTitle}>
                  {lang === "es" ? "Medidas recomendadas" : "Recommended measures"}
                </div>
                <div style={s.suggestSub}>
                  {lang === "es" ? "Dimensiones con puntaje inferior al 50% — Guía PMUS Argentina" : "Dimensions scoring below 50% — Argentina SUMP Guide"}
                </div>
                <div style={s.suggestGrid}>
                  {suggested.map(m => {
                    const grp = MEASURES_DATA.find(g => g.measures.some(x => x.code === m.code));
                    return (
                      <div key={m.code} style={{ ...s.suggestCard, borderTop: `3px solid ${grp.color}`, background: grp.light }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <span style={{ ...s.suggestCardCode, background: grp.color }}>{m.code}</span>
                          <span style={s.suggestCardName}>{m.name[lang]}</span>
                        </div>
                        <p style={s.suggestCardDesc}>{m.desc[lang]}</p>
                        <div style={s.suggestCardDivider} />
                        {[
                          { key: "tipos",    val: m.tipos?.map(t => t[lang]).join(" · ") },
                          { key: "horizonte",val: m.horizonte?.[lang] },
                          { key: "costo",    val: m.costo?.[lang] },
                          { key: "ambito",   val: m.ambito?.[lang] },
                          { key: "ecm",      val: m.ecm?.[lang] },
                        ].map(row => row.val ? (
                          <div key={row.key} style={s.suggestCardRow}>
                            <span style={{ ...s.suggestCardRowLabel, color: grp.color }}>{fieldLabel[row.key][lang]}</span>
                            <span style={s.suggestCardRowVal}>{row.val}</span>
                          </div>
                        ) : null)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 12 }}>
            <button style={s.btnOutline} onClick={() => { setAnswers({}); setCatIdx(0); setStep("quiz"); }}>{t.editBtn}</button>
            <button style={s.btnOutline} onClick={() => alert(lang === "es" ? "La descarga del informe estará disponible en la versión final." : "Report download will be available in the final version.")} >
              {lang === "es" ? "Descargar informe" : "Download report"}
            </button>
            <button style={s.btnPrimary} onClick={reset}>{t.newBtn}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={{ ...s.card, maxWidth: 760 }}>
        <Header lang={lang} setLang={setLang} onHelp={() => setShowOnboarding(true)} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: TEAL, fontSize: 13, fontWeight: 600 }}>{cityName}</span>
          <span style={{ color: MUTED, fontSize: 12 }}>{t.progressLabel(answered, totalQ)}</span>
        </div>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${(answered / totalQ) * 100}%` }} />
        </div>
        <div style={s.tabRow}>
          {cats.map((c, i) => {
            const done = c.questions.every((q) => answers[q.id] !== undefined);
            const active = i === catIdx;
            return (
              <button key={c.id} style={{ ...s.tab, ...(active ? s.tabActive : {}), ...(done && !active ? s.tabDone : {}) }} onClick={() => setCatIdx(i)}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{c.id.slice(0,2).toUpperCase()}</span>
                {done && <span style={s.checkPin}>✓</span>}
              </button>
            );
          })}
          <span style={s.tabLabel}>{currentCat.label}</span>
        </div>

        <div style={{ marginBottom: 24 }}>
          {currentCat.questions.map((q, qi) => {
            const osmFilled = osmResult && !osmResult.error && osmResult.fields.some(f => f.id === q.id);
            return (
            <div key={q.id} style={s.qBlock}>
              <p style={s.qText}>
                <span style={s.qNum}>{qi + 1}.</span> {q.text}
                {osmFilled && <span style={s.osmBadge}>OSM</span>}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt) => {
                  const sel = answers[q.id] === opt.score;
                  return (
                    <button key={opt.score} style={{ ...s.opt, ...(sel ? s.optSel : {}), ...(sel && osmFilled ? { borderColor: "#0a9ea0", background: "#f0fbfb", color: "#0a7a7a" } : {}) }} onClick={() => answer(q.id, opt.score)}>
                      <span style={{ ...s.radio, ...(sel ? s.radioSel : {}), ...(sel && osmFilled ? { background: "#0a9ea0", borderColor: "#0a9ea0" } : {}) }} />
                      <span style={{ flex: 1 }}>{opt.label}</span>
                      <span style={{ fontSize: 11, color: sel ? (osmFilled ? "#0a9ea0" : TEAL) : MUTED, fontWeight: 600 }}>{opt.score} {t.pts}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button style={s.btnRestart} onClick={reset}>
            {lang === "es" ? "← Inicio" : "← Home"}
          </button>
          <button style={{ ...s.btnOutline, opacity: catIdx === 0 ? 0.3 : 1 }} disabled={catIdx === 0} onClick={() => setCatIdx((i) => i - 1)}>{t.prevBtn}</button>
          <button style={{ ...s.btnSkip, marginTop: 0, width: "auto" }} onClick={skipToResults}>{lang === "es" ? "Saltear" : "Skip"}</button>
          {catIdx < cats.length - 1
            ? <button style={{ ...s.btnPrimary, opacity: catDone ? 1 : 0.4, cursor: catDone ? "pointer" : "default" }} disabled={!catDone} onClick={() => setCatIdx((i) => i + 1)}>{t.nextBtn}</button>
            : <button style={{ ...s.btnPrimary, opacity: answered === totalQ ? 1 : 0.4, cursor: answered === totalQ ? "pointer" : "default" }} disabled={answered !== totalQ} onClick={() => setStep("review")}>{t.resultsBtn}</button>
          }
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", width: "100%", background: BG, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 40px 48px", fontFamily: "'Helvetica Neue', Arial, sans-serif", boxSizing: "border-box" },
  card: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 40px", maxWidth: 600, width: "100%", boxShadow: "0 2px 20px rgba(42,122,106,0.08)" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` },
  logoImg: { height: 30, objectFit: "contain" },
  headerDiv: { width: 1, height: 22, background: BORDER },
  headerSub: { color: MUTED, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 },
  langToggle: { display: "flex", border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" },
  langBtn: { background: WHITE, color: MUTED, border: "none", padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em" },
  langBtnActive: { background: TEAL, color: WHITE },
  helpBtn: { width: 26, height: 26, borderRadius: "50%", border: `1px solid ${BORDER}`, background: WHITE, color: MUTED, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", lineHeight: 1 },
  banner: { display: "flex", alignItems: "center", gap: 8, background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 6, padding: "7px 12px", marginBottom: 12, color: TEAL, fontSize: 12, fontWeight: 500 },
  bannerDot: { display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0 },
  sourceNote: { color: MUTED, fontSize: 11, lineHeight: 1.5, fontStyle: "italic" },
  h1: { color: TEXT, fontSize: 21, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.35 },
  h2: { color: TEXT, fontSize: 20, fontWeight: 700, margin: "6px 0 4px" },
  desc: { color: MUTED, fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" },
  desc2: { color: MUTED, fontSize: 13, margin: 0 },
  chips: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  chip: { background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 500 },
  label: { display: "block", color: TEXT, fontSize: 12, fontWeight: 600, marginBottom: 6 },
  input: { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box", background: WHITE, fontFamily: "inherit", marginBottom: 20 },
  select: { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 14px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box", background: WHITE, fontFamily: "inherit", marginBottom: 20, cursor: "pointer", appearance: "auto" },
  btnPrimary: { display: "block", width: "100%", background: TEAL, color: WHITE, border: "none", borderRadius: 7, padding: "12px 24px", fontWeight: 600, fontSize: 14, fontFamily: "inherit", cursor: "pointer" },
  btnOutline: { background: WHITE, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 7, padding: "10px 20px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" },
  btnSkip: { background: "transparent", color: MUTED, border: `1px dashed ${BORDER}`, borderRadius: 7, padding: "8px 14px", fontWeight: 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit", marginTop: 8, width: "100%", textAlign: "center" },
  btnRestart: { background: "transparent", color: MUTED, border: "none", padding: "8px 4px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 2 },
  hint: { textAlign: "center", color: MUTED, fontSize: 12, marginTop: 12 },
  progressBar: { height: 5, background: TEAL_LIGHT, borderRadius: 3, marginBottom: 20 },
  progressFill: { height: "100%", background: TEAL, borderRadius: 3, transition: "width 0.3s" },
  tabRow: { display: "flex", alignItems: "center", gap: 6, marginBottom: 24, flexWrap: "wrap" },
  tab: { background: TEAL_LIGHT, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 8, width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  tabActive: { background: TEAL, border: `1px solid ${TEAL}` },
  tabDone: { border: `1px solid ${TEAL_MID}`, opacity: 0.65 },
  checkPin: { position: "absolute", top: -5, right: -5, fontSize: 8, background: ACCENT, color: WHITE, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  tabLabel: { color: TEXT, fontSize: 14, fontWeight: 600, marginLeft: 6 },
  qBlock: { marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` },
  qText: { color: TEXT, fontSize: 14, lineHeight: 1.6, margin: "0 0 10px", fontWeight: 500 },
  qNum: { color: TEAL, fontWeight: 700, marginRight: 4 },
  opt: { background: WHITE, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "10px 12px", fontSize: 13, cursor: "pointer", textAlign: "left", lineHeight: 1.4, display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" },
  optSel: { background: TEAL_LIGHT, borderColor: TEAL, color: TEAL },
  radio: { width: 13, height: 13, borderRadius: "50%", border: `2px solid ${BORDER}`, flexShrink: 0 },
  radioSel: { background: TEAL, border: `2px solid ${TEAL}` },
  resultsTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "0 0 24px" },
  cityPill: { display: "inline-block", background: TEAL_LIGHT, color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" },
  totalLbl: { color: MUTED, fontSize: 11, marginTop: 4 },
  badge: { display: "inline-block", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, marginTop: 4 },
  badgeSm: { display: "inline-block", borderRadius: 20, padding: "3px 9px", fontSize: 11, fontWeight: 700, marginTop: 4 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 },
  catCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" },
  catHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  catName: { color: TEXT, fontSize: 13, fontWeight: 700, margin: "4px 0 2px" },
  catScore: { color: MUTED, fontSize: 11, marginBottom: 4 },
  sep: { height: 1, background: BORDER, margin: "10px 0" },
  aQ: { display: "block", color: MUTED, fontSize: 11, lineHeight: 1.4 },
  aA: { display: "block", color: TEXT, fontSize: 11, fontWeight: 600, marginTop: 1 },
  methodNote: { background: TEAL_LIGHT, border: `1px solid ${TEAL_MID}`, borderRadius: 7, padding: "12px 16px", color: MUTED, fontSize: 12, lineHeight: 1.6, marginBottom: 16 },

  // INTRO TWO-COLUMN
  introWrap: { display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 1100, width: "100%", position: "relative" },

  // REVIEW SCREEN
  reviewCatBlock: { marginBottom: 20 },
  reviewCatHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${BORDER}` },
  reviewCatLabel: { color: TEXT, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" },
  reviewEditBtn: { background: "transparent", color: TEAL, border: `1px solid ${TEAL_MID}`, borderRadius: 5, padding: "3px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  reviewRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, marginBottom: 5 },
  reviewQNum: { color: MUTED, fontSize: 11, fontWeight: 600, flexShrink: 0, paddingTop: 2 },
  reviewQText: { color: TEXT, fontSize: 12, lineHeight: 1.5 },
  reviewAns: { fontSize: 11, fontWeight: 600, borderRadius: 10, padding: "2px 10px", flexShrink: 0, whiteSpace: "nowrap" },
  osmPanel: { marginTop: 16, background: "#f0fbfb", border: "1px solid #b2e4e4", borderRadius: 8, padding: "14px 16px" },
  osmPanelTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  osmPanelTitle: { color: "#0a6060", fontSize: 12, fontWeight: 700, marginBottom: 2 },
  osmPanelSub: { color: MUTED, fontSize: 11, lineHeight: 1.4 },
  osmBtn: { background: "#0a9ea0", color: WHITE, border: "none", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, fontFamily: "inherit", flexShrink: 0 },
  osmResult: { marginTop: 12, paddingTop: 12, borderTop: "1px solid #b2e4e4" },
  osmResultTitle: { color: "#0a6060", fontSize: 11, fontWeight: 600, marginBottom: 8 },
  osmResultGrid: { display: "flex", flexDirection: "column", gap: 5 },
  osmResultRow: { display: "flex", alignItems: "center", gap: 8 },
  osmResultLabel: { color: TEXT, fontSize: 11, flex: 1 },
  osmResultVal: { color: MUTED, fontSize: 11 },
  osmResultScore: { fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 7px" },
  osmAttrib: { color: MUTED, fontSize: 10, marginTop: 8, fontStyle: "italic" },
  osmBadge: { display: "inline-block", background: "#0a9ea0", color: WHITE, fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "1px 5px", marginLeft: 6, verticalAlign: "middle", letterSpacing: "0.04em" },
  onboardOverlay: { position: "fixed", inset: 0, zIndex: 200, background: "rgba(15,30,25,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" },
  onboardBox: { background: WHITE, borderRadius: 14, padding: "40px 48px", maxWidth: 980, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto" },
  onboardHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${BORDER}` },
  onboardHeaderDiv: { width: 1, height: 22, background: BORDER },
  onboardHeaderSub: { color: MUTED, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 },
  onboardSub: { color: MUTED, fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" },
  onboardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 28 },
  onboardSectionTitle: { color: TEXT, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` },
  onboardSection: { display: "flex", gap: 12, marginBottom: 16 },
  onboardNumBadge: { width: 22, height: 22, borderRadius: "50%", background: TEAL, color: WHITE, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 },
  onboardSecLabel: { color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 3 },
  onboardSecDesc: { color: MUTED, fontSize: 12, lineHeight: 1.6 },
  onboardCard: { background: "#f9fafb", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", borderTop: `3px solid ${TEAL}` },
  onboardCardCode: { display: "inline-block", background: TEAL, color: WHITE, fontSize: 13, fontWeight: 800, borderRadius: 5, padding: "3px 10px", marginBottom: 6, letterSpacing: "0.06em" },
  onboardCardTitle: { color: TEXT, fontSize: 14, fontWeight: 700, marginBottom: 10 },
  onboardCardDivider: { height: 1, background: BORDER, marginBottom: 10 },
  onboardCardRow: { display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" },
  onboardCardRowLabel: { color: TEAL, fontSize: 11, fontWeight: 700, minWidth: 130, flexShrink: 0 },
  onboardCardRowDesc: { color: MUTED, fontSize: 11, lineHeight: 1.4 },
  onboardBtn: { width: "100%", background: TEAL, color: WHITE, border: "none", borderRadius: 8, padding: "13px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.03em" },

  // TILES PANEL
  tilesPanel: { width: 220, flexShrink: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 16px", boxShadow: "0 2px 12px rgba(42,122,106,0.07)" },
  tilesPanelTitle: { color: TEXT, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 },
  tilesPanelSub: { color: MUTED, fontSize: 11, marginBottom: 14 },
  tileGroup: { marginBottom: 12 },
  tileGroupLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 },
  tileRow: { display: "flex", flexWrap: "wrap", gap: 4 },
  tile: { border: "1.5px solid", borderRadius: 5, padding: "3px 6px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s ease" },

  // TILE MODAL (floating popover)
  tileModal: { position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" },
  tileModalBox: { background: WHITE, borderRadius: 10, padding: "20px 24px", maxWidth: 340, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" },
  tileModalCode: { fontSize: 22, fontWeight: 800, letterSpacing: "0.04em" },
  tileModalClose: { background: "transparent", border: "none", color: MUTED, fontSize: 16, cursor: "pointer", padding: 0 },
  tileModalName: { color: TEXT, fontSize: 14, fontWeight: 700, marginBottom: 8 },
  tileModalDesc: { color: MUTED, fontSize: 13, lineHeight: 1.6, margin: 0 },

  // SUGGESTED MEASURES (results page)
  suggestTitle: { color: TEXT, fontSize: 13, fontWeight: 700, marginBottom: 4 },
  suggestSub: { color: MUTED, fontSize: 11, marginBottom: 12 },
  suggestGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  suggestCard: { background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 16px" },
  suggestCardCode: { display: "inline-block", color: WHITE, fontSize: 11, fontWeight: 800, borderRadius: 5, padding: "2px 8px", letterSpacing: "0.06em", flexShrink: 0 },
  suggestCardName: { color: TEXT, fontSize: 12, fontWeight: 700, lineHeight: 1.3 },
  suggestCardDesc: { color: MUTED, fontSize: 11, lineHeight: 1.5, margin: "0 0 10px" },
  suggestCardDivider: { height: 1, background: BORDER, marginBottom: 8 },
  suggestCardRow: { display: "flex", gap: 8, marginBottom: 5, alignItems: "flex-start" },
  suggestCardRowLabel: { fontSize: 10, fontWeight: 700, minWidth: 110, flexShrink: 0, paddingTop: 1 },
  suggestCardRowVal: { color: TEXT, fontSize: 10, lineHeight: 1.4 },
};
